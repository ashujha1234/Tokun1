

const cron = require("node-cron");
const HireDeal = require("../models/HireDeal");       // adjust path
const Wallet = require("../models/Wallet");            // adjust path
const Notification = require("../models/Notification"); // adjust path
const Message = require("../models/Message");          // adjust path
const User = require("../models/User");                // adjust path

const AUTO_RELEASE_HOURS = 72; // change as needed

// ── Wallet helper (same as adminEscrow.js) ──────────────────────────────────
const getOrCreateWallet = async (userId) => {
  let wallet = await Wallet.findOne({ userId });
  if (!wallet) wallet = await Wallet.create({ userId });
  return wallet;
};

// ── Core release logic (mirrors POST /api/admin/escrow/:dealId/release) ──────
async function releaseEscrowToWallet(deal) {
  const payoutAmount = Number(deal.freelancerAmount || 0);

  if (!payoutAmount || payoutAmount <= 0) {
    throw new Error(`Deal ${deal._id}: invalid freelancerAmount`);
  }

  // 1. Credit freelancer wallet
  const wallet = await getOrCreateWallet(deal.freelancerId._id);
  wallet.availableBalance = (wallet.availableBalance || 0) + payoutAmount;
  wallet.totalRevenue = (wallet.totalRevenue || 0) + payoutAmount;

  wallet.transactions.unshift({
    type: "credit",
    status: "Completed",
    amount: payoutAmount,
    description: `Auto-released after 72h: ${deal.title || "Hire Deal"}`,
    createdAt: new Date(),
    meta: {
      source: "auto_escrow_release",
      hireDealId: String(deal._id),
      clientName: deal.clientId?.name || "",
      clientId: deal.clientId?._id || null,
    },
  });

  await wallet.save();

  // 2. Update deal
  deal.status = "COMPLETED";
  deal.fundsStatus = "AUTO_RELEASED";
  deal.approvedAt = new Date();
  deal.autoReleased = true;
  deal.autoReleasedAt = new Date();
  await deal.save();

  // 3. Update freelancer user stats
  await User.findByIdAndUpdate(deal.freelancerId._id, {
    $inc: {
      totalEarnings: payoutAmount,
      completedDeals: 1,
    },
  });

  // 4. Chat message
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

  // 5. Notify freelancer
  await Notification.create({
    senderId: deal.clientId?._id,
    senderName: "Tokun",
    receiverUserId: deal.freelancerId._id,
    type: "HIRE_PAYMENT_RELEASED",
    hireDealId: deal._id,
    amount: payoutAmount,
    message: `Payment of ₹${payoutAmount} was auto-released to your Tokun Wallet after 72 hours. You can withdraw to your bank from the wallet.`,
  });

  // 6. Notify client
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
  console.log("[AutoRelease] Checking for deals eligible for auto-release...");

  try {
    const cutoff = new Date(Date.now() - AUTO_RELEASE_HOURS * 60 * 60 * 1000);

    const eligibleDeals = await HireDeal.find({
      status: "WORK_SUBMITTED",
      fundsStatus: "HELD_BY_TOKUN",
      workSubmittedAt: { $lte: cutoff },
    })
      .populate("freelancerId", "name email")
      .populate("clientId", "name email");

    console.log(`[AutoRelease] Found ${eligibleDeals.length} eligible deal(s)`);

    for (const deal of eligibleDeals) {
      try {
        console.log(
          `[AutoRelease] Auto-releasing deal ${deal._id} — submitted at ${deal.workSubmittedAt}`
        );

        await releaseEscrowToWallet(deal);

        console.log(`[AutoRelease] ✓ Deal ${deal._id} auto-released`);
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

console.log(
  `[AutoRelease] Cron started — auto-releases after ${AUTO_RELEASE_HOURS}h`
);