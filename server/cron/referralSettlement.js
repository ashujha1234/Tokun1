// Turns settled prompt sales into Refer & Earn rewards.
//
// Nothing about a referral pays out at the moment of sale, because a sale is
// not final at the moment of sale — prompts carry a refund window. Paying
// earlier would mean someone buys their own listing, collects the reward, and
// refunds; the reward would be gone and the money returned.
//
// So this job looks only at purchases that have outlived that window with no
// refund against them, and for each one asks two questions:
//
//   Does this seller hold a rebate credit?      → pay it into their wallet
//   Is this the first sale of someone invited?  → issue both credits + boost
//
// Runs hourly. The window is measured in hours, so there is nothing to gain
// from checking more often, and every tick is a full sweep.

const cron = require("node-cron");
const Purchase = require("../models/Purchase");
const {
  settleReferralsForPurchase,
  expireOldCredits,
  releaseStaleReservations,
} = require("../services/referral.service");

// The same window POST /:purchaseId/refund-request enforces. Read the same way
// so a change to one can't leave the other paying out on refundable sales.
const REFUND_WINDOW_HOURS = Number(process.env.REFUND_WINDOW_HOURS || 24);

async function sweep() {
  const cutoff = new Date(Date.now() - REFUND_WINDOW_HOURS * 60 * 60 * 1000);

  const settled = await Purchase.find({
    paymentStatus: "SUCCESS",
    purchasedAt: { $lte: cutoff },
    /* NONE only. A sale with a refund merely REQUESTED is still undecided, and
       a rewarded-then-refunded sale is the exact hole this job exists to avoid.
       It stays unprocessed and gets picked up on a later tick if the request is
       rejected. */
    refundStatus: "NONE",
    referralProcessedAt: null,
  })
    .select("_id prompt pricePaid purchasedAt")
    .limit(500);

  let processed = 0;
  for (const purchase of settled) {
    try {
      await settleReferralsForPurchase(purchase);
    } catch (err) {
      console.error(`[Referral] Purchase ${purchase._id} failed:`, err.message);
    } finally {
      /* Marked even on failure. A purchase that throws twice will throw a
         third time, and retrying it every hour forever buries the log while
         holding up nothing — the rebate can be issued by hand. */
      await Purchase.updateOne(
        { _id: purchase._id },
        { $set: { referralProcessedAt: new Date() } }
      );
      processed += 1;
    }
  }

  return processed;
}

cron.schedule("15 * * * *", async () => {
  try {
    const processed = await sweep();
    const expired = await expireOldCredits();
    /* Checkouts that were opened and walked away from.

       The backstop, not the main path: closing the payment sheet now releases
       the hold immediately (POST /api/referrals/release-checkout), which is
       what stops a cancelled purchase hiding the buyer's coupon for the rest
       of the hour. This catches the tab that was closed mid-payment instead.

       Still on age alone, and still an hour of it: Razorpay never tells us an
       order was abandoned, and a UPI collect request can sit unanswered for
       minutes. Release a hold on an order that is then paid and the credit
       goes back to ACTIVE having already been spent — spendable twice. */
    const released = await releaseStaleReservations(60);

    if (processed || expired || released) {
      console.log(
        `[Referral] ${processed} settled sale(s) swept, ${expired} expired, ${released} reservation(s) released.`
      );
    }
  } catch (err) {
    console.error("[Referral] Cron job error:", err);
  }
});

module.exports = { sweep, expireOldCredits };
