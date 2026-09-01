// Mirrors cron/autoReleaseEscrow.js for HireDeal — auto-releases a booked
// service's escrowed payment to the seller if the buyer hasn't approved (or
// requested revision) within AUTO_RELEASE_HOURS of the work being submitted.

const cron = require("node-cron");
const { watchJob } = require("../utils/jobTelemetry");
const telemetry = require("../utils/telemetry");
const ServiceOrder = require("../models/ServiceOrder");
const Notification = require("../models/Notification");
const Message = require("../models/Message");
const { sendEscrowReleasedEmail } = require("../services/creatorEmail.service");
const { sendAutoReleaseApproachingEmail } = require("../services/buyerEmail.service");
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

  // Same reasoning as the hire cron: nobody was present when this happened.
  try {
    await sendEscrowReleasedEmail({
      to: order.sellerId?.email,
      creatorName: order.sellerId?.name,
      title: order.serviceTitle,
      amount: payoutAmount,
      automatic: true,
    });
  } catch (mailErr) {
    console.error("Service auto-release email failed (payout stands):", mailErr.message);
  }
}


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

  const due = await ServiceOrder.find({
    status: "WORK_SUBMITTED",
    fundsStatus: "HELD_BY_TOKUN",
    workSubmittedAt: { $gt: windowStart, $lte: windowEnd },
  })
    .populate("buyerId", "name email")
    .populate("sellerId", "name email")
    .limit(200);

  for (const doc of due) {
    try {
      await sendAutoReleaseApproachingEmail({
        to: doc.buyerId?.email,
        clientName: doc.buyerId?.name,
        creatorName: doc.sellerId?.name,
        title: doc.serviceTitle,
        amount: doc.sellerAmount ?? doc.amount,
        releasesAt: new Date(
          new Date(doc.workSubmittedAt).getTime() + AUTO_RELEASE_HOURS * 60 * 60 * 1000
        ),
        hoursLeft: WARN_BEFORE_HOURS,
        orderPath: `/orders/service/${doc._id}`,
      });
    } catch (mailErr) {
      console.error(`[AutoRelease] Warning email failed for service order ${doc._id}:`, mailErr.message);
    }
  }

  return due.length;
}

cron.schedule("0 * * * *", async () => {
  const job = watchJob("AutoReleaseServiceEscrow");
  let released = 0;
  let failed = 0;
  try {
    await warnBeforeAutoRelease();
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
        released++;
      } catch (orderErr) {
        failed++;
        console.error(
          `[ServiceAutoRelease] ✗ Failed for order ${order._id}:`,
          orderErr.message
        );
        /* Same reasoning as autoReleaseEscrow.js: the loop deliberately
           continues, so this order's funds stay held with nobody told. Reported
           per order so it can be chased individually. */
        telemetry.trackError(orderErr, {
          job: "AutoReleaseServiceEscrow",
          kind: "escrowReleaseFailed",
          orderId: order._id,
          sellerAmount: order.sellerAmount,
        });
      }
    }
    job.ok({ eligible: eligibleOrders.length, released, failed });
  } catch (err) {
    console.error("[ServiceAutoRelease] Cron job error:", err);
    job.failed(err);
  }
});
