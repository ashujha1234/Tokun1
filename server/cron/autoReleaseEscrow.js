

const cron = require("node-cron");
const { watchJob } = require("../utils/jobTelemetry");
const telemetry = require("../utils/telemetry");
const HireDeal = require("../models/HireDeal");       // adjust path
const Notification = require("../models/Notification"); // adjust path
const Message = require("../models/Message");
const { sendEscrowReleasedEmail } = require("../services/creatorEmail.service");
const { sendAutoReleaseApproachingEmail } = require("../services/buyerEmail.service");          // adjust path
const { releaseEscrowToFreelancer, EscrowAlreadyReleasedError } = require("../services/escrowRelease.service");

const AUTO_RELEASE_HOURS = 72; // change as needed

// ── Core release logic — delegates the actual credit/commission/status-claim
// to the shared service (same one used by client approve-work and admin
// force-release) so all three paths can never double-credit the same deal.
async function releaseEscrowToWallet(deal) {
  const payoutAmount = Number(deal.freelancerAmount || 0);

  if (!payoutAmount || payoutAmount <= 0) {
    throw new Error(`Deal ${deal._id}: invalid freelancerAmount`);
  }

  try {
    await releaseEscrowToFreelancer(deal._id, "auto_released");
  } catch (err) {
    if (err instanceof EscrowAlreadyReleasedError) {
      // Client approved or admin released it in the same window — nothing to do.
      return;
    }
    throw err;
  }

  // Chat message
  if (deal.chatId && deal.clientId?._id) {
    await Message.create({
      conversationId: deal.chatId,
      sender: deal.clientId._id,
      text: `ESCROW_RELEASED::${JSON.stringify({
        hireDealId: String(deal._id),
        title: deal.title,
        amount: payoutAmount,
        status: "COMPLETED",
        autoReleased: true,
      })}`,
      readBy: [deal.clientId._id],
    });
  }

  // Notify freelancer
  await Notification.create({
    senderId: deal.clientId?._id,
    senderName: "Tokun",
    receiverUserId: deal.freelancerId._id,
    type: "HIRE_PAYMENT_RELEASED",
    hireDealId: deal._id,
    amount: payoutAmount,
    message: `Payment of ₹${payoutAmount} was auto-released to your Tokun Wallet after 72 hours. You can withdraw to your bank from the wallet.`,
  });

  // Notify client
  await Notification.create({
    senderId: deal.freelancerId?._id,
    senderName: "Tokun",
    receiverUserId: deal.clientId._id,
    type: "HIRE_AUTO_RELEASED",
    hireDealId: deal._id,
    amount: payoutAmount,
    message: `Payment of ₹${payoutAmount} was automatically released to the freelancer after 72 hours (no action taken).`,
  });

  /* Money moved with no human involved on either side, so neither party is
     necessarily looking at the app. The freelancer gets the email; the client
     was already warned by cron/escrowDeadlineWatch.js before this fired. */
  try {
    await sendEscrowReleasedEmail({
      to: deal.freelancerId?.email,
      creatorName: deal.freelancerId?.name,
      title: deal.title,
      amount: payoutAmount,
      automatic: true,
    });
  } catch (mailErr) {
    console.error("Auto-release email failed (payout stands):", mailErr.message);
  }
}

// ── Cron: runs every hour ───────────────────────────────────────────────────

/* ── Last call, 24 hours before the money moves ────────────────────────────
   The release below happens on a timer whether the client looks or not. Until
   now the only warning was the "work submitted" notification 72 hours earlier,
   which is not a warning at all — it's the thing they already missed.

   No "warned already" flag on the model: the window is one hour wide and this
   cron runs hourly, so each order falls in it exactly once. A skipped run costs
   a warning rather than sending duplicates, which is the right way round. */
const WARN_BEFORE_HOURS = 24;

async function warnBeforeAutoRelease() {
  const releaseAge = AUTO_RELEASE_HOURS - WARN_BEFORE_HOURS; // 48h since submission
  const windowEnd = new Date(Date.now() - releaseAge * 60 * 60 * 1000);
  const windowStart = new Date(windowEnd.getTime() - 60 * 60 * 1000);

  const due = await HireDeal.find({
    status: "WORK_SUBMITTED",
    fundsStatus: "HELD_BY_TOKUN",
    workSubmittedAt: { $gt: windowStart, $lte: windowEnd },
  })
    .populate("clientId", "name email")
    .populate("freelancerId", "name email")
    .limit(200);

  for (const doc of due) {
    try {
      await sendAutoReleaseApproachingEmail({
        to: doc.clientId?.email,
        clientName: doc.clientId?.name,
        creatorName: doc.freelancerId?.name,
        title: doc.title,
        amount: doc.freelancerAmount ?? doc.amount,
        releasesAt: new Date(
          new Date(doc.workSubmittedAt).getTime() + AUTO_RELEASE_HOURS * 60 * 60 * 1000
        ),
        hoursLeft: WARN_BEFORE_HOURS,
        orderPath: `/orders/hire/${doc._id}`,
      });
    } catch (mailErr) {
      console.error(`[AutoRelease] Warning email failed for hire deal ${doc._id}:`, mailErr.message);
    }
  }

  return due.length;
}

cron.schedule("0 * * * *", async () => {
  const job = watchJob("AutoReleaseEscrow");
  let released = 0;
  let failed = 0;
  try {
    await warnBeforeAutoRelease();
    const cutoff = new Date(Date.now() - AUTO_RELEASE_HOURS * 60 * 60 * 1000);

    // `status: "WORK_SUBMITTED"` is doing the load-bearing work here: a
    // cancellation moves the deal to DISPUTED or CANCELLED, which takes it out
    // of this query entirely. Without that, a dispute raised on day 2 would be
    // decided by the clock on day 3 and the money would go to the freelancer
    // while the two were still arguing about it.
    //
    // fundsStatus is checked as well so a deal mid-settlement (temporarily
    // DISPUTED while Razorpay is being called) can't be picked up by a cron
    // tick that lands in the same second.
    const eligibleDeals = await HireDeal.find({
      status: "WORK_SUBMITTED",
      fundsStatus: "HELD_BY_TOKUN",
      workSubmittedAt: { $lte: cutoff },
    })
      .populate("freelancerId", "name email")
      .populate("clientId", "name email");

    for (const deal of eligibleDeals) {
      try {
        await releaseEscrowToWallet(deal);
        released++;
      } catch (dealErr) {
        failed++;
        console.error(
          `[AutoRelease] ✗ Failed for deal ${deal._id}:`,
          dealErr.message
        );
        /* The most expensive silent failure in the codebase, and the reason this
           reports per deal rather than only per run. Continuing to the next deal
           is right — one bad deal must not block the other releases — but it
           also means this deal's money stays held indefinitely with nobody
           informed. Both parties are waiting on a payout that will never happen
           unless someone reads a log line that is not retained.

           Reported with the deal id so it is actionable on its own, and the
           run's `failed` count below makes a run that failed on everything
           distinguishable from a run that failed on one. */
        telemetry.trackError(dealErr, {
          job: "AutoReleaseEscrow",
          kind: "escrowReleaseFailed",
          dealId: deal._id,
          freelancerAmount: deal.freelancerAmount,
        });
        // Don't throw — continue to next deal
      }
    }
    job.ok({ eligible: eligibleDeals.length, released, failed });
  } catch (err) {
    console.error("[AutoRelease] Cron job error:", err);
    job.failed(err);
  }
});
