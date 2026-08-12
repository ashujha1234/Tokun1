

const cron = require("node-cron");
const HireDeal = require("../models/HireDeal");       // adjust path
const Notification = require("../models/Notification"); // adjust path
const Message = require("../models/Message");          // adjust path
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
}

// ── Cron: runs every hour ───────────────────────────────────────────────────
cron.schedule("0 * * * *", async () => {
  try {
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
      } catch (dealErr) {
        console.error(
          `[AutoRelease] ✗ Failed for deal ${deal._id}:`,
          dealErr.message
        );
        // Don't throw — continue to next deal
      }
    }
  } catch (err) {
    console.error("[AutoRelease] Cron job error:", err);
  }
});
