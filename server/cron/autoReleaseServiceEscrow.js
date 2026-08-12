// Mirrors cron/autoReleaseEscrow.js for HireDeal — auto-releases a booked
// service's escrowed payment to the seller if the buyer hasn't approved (or
// requested revision) within AUTO_RELEASE_HOURS of the work being submitted.

const cron = require("node-cron");
const ServiceOrder = require("../models/ServiceOrder");
const Notification = require("../models/Notification");
const Message = require("../models/Message");
const {
  releaseServiceEscrowToSeller,
  ServiceEscrowAlreadyReleasedError,
} = require("../services/serviceEscrowRelease.service");

const AUTO_RELEASE_HOURS = 72;

async function releaseOrderEscrowToWallet(order) {
  const payoutAmount = Number(order.sellerAmount || 0);

  if (!payoutAmount || payoutAmount <= 0) {
    throw new Error(`ServiceOrder ${order._id}: invalid sellerAmount`);
  }

  try {
    await releaseServiceEscrowToSeller(order._id, "auto_released");
  } catch (err) {
    if (err instanceof ServiceEscrowAlreadyReleasedError) {
      return;
    }
    throw err;
  }

  if (order.chatId && order.buyerId?._id) {
    await Message.create({
      conversationId: order.chatId,
      sender: order.buyerId._id,
      text: `ESCROW_RELEASED::${JSON.stringify({
        serviceOrderId: String(order._id),
        title: order.serviceTitle,
        amount: payoutAmount,
        status: "COMPLETED",
        autoReleased: true,
      })}`,
      readBy: [order.buyerId._id],
    });
  }

  await Notification.create({
    senderId: order.buyerId?._id,
    senderName: "Tokun",
    receiverUserId: order.sellerId._id,
    type: "SERVICE_PAYMENT_RELEASED",
    amount: payoutAmount,
    message: `Payment of ₹${payoutAmount} was auto-released to your Tokun Wallet after 72 hours. You can withdraw to your bank from the wallet.`,
  });

  await Notification.create({
    senderId: order.sellerId?._id,
    senderName: "Tokun",
    receiverUserId: order.buyerId._id,
    type: "SERVICE_PAYMENT_RELEASED",
    amount: payoutAmount,
    message: `Payment of ₹${payoutAmount} was automatically released to the creator after 72 hours (no action taken).`,
  });
}

cron.schedule("0 * * * *", async () => {
  try {
    const cutoff = new Date(Date.now() - AUTO_RELEASE_HOURS * 60 * 60 * 1000);

    // `status: "WORK_SUBMITTED"` is doing the load-bearing work here: a
    // cancellation moves the order to DISPUTED or CANCELLED, which takes it out
    // of this query entirely. Without that, a dispute raised on day 2 would be
    // decided by the clock on day 3 and the money would go to the seller while
    // the two were still arguing about it.
    //
    // fundsStatus is checked as well so an order mid-settlement (temporarily
    // DISPUTED while Razorpay is being called) can't be picked up by a cron
    // tick that lands in the same second.
    const eligibleOrders = await ServiceOrder.find({
      status: "WORK_SUBMITTED",
      fundsStatus: "HELD_BY_TOKUN",
      workSubmittedAt: { $lte: cutoff },
    })
      .populate("sellerId", "name email")
      .populate("buyerId", "name email");

    for (const order of eligibleOrders) {
      try {
        await releaseOrderEscrowToWallet(order);
      } catch (orderErr) {
        console.error(
          `[ServiceAutoRelease] ✗ Failed for order ${order._id}:`,
          orderErr.message
        );
      }
    }
  } catch (err) {
    console.error("[ServiceAutoRelease] Cron job error:", err);
  }
});
