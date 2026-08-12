// services/serviceEscrowRelease.service.js
//
// Mirrors escrowRelease.service.js for HireDeal — single shared implementation
// of "release service-order escrow to the seller's wallet". Used by both the
// buyer's approve-work action and the hourly auto-release cron, so the
// credit/commission logic only ever exists once and an atomic status claim
// prevents the same order from ever being credited twice.

const ServiceOrder = require("../models/ServiceOrder");
const User = require("../models/User");
const Wallet = require("../models/Wallet");
const PlatformWallet = require("../models/PlatformWallet");
const { releaseTransfer } = require("../utils/routeEscrow");
const { reverseTransfer } = require("../utils/routePayouts");

class ServiceEscrowAlreadyReleasedError extends Error {
  constructor() {
    super("service_escrow_already_released_or_not_eligible");
    this.code = "SERVICE_ESCROW_ALREADY_RELEASED_OR_NOT_ELIGIBLE";
  }
}

/**
 * @param {string} orderId
 * @param {"buyer_approved"|"admin_released"|"auto_released"} releasedBy
 * @returns {Promise<{ order: object, wallet: object }>}
 */
async function releaseServiceEscrowToSeller(orderId, releasedBy) {
  const isAuto = releasedBy === "auto_released";
  const now = new Date();

  const claimUpdate = {
    fundsStatus: isAuto ? "AUTO_RELEASED" : "RELEASED_TO_SELLER",
    status: "COMPLETED",
    approvedAt: now,
    releasedAt: now,
  };
  if (isAuto) {
    claimUpdate.autoReleased = true;
    claimUpdate.autoReleasedAt = now;
  }

  const order = await ServiceOrder.findOneAndUpdate(
    { _id: orderId, fundsStatus: "HELD_BY_TOKUN" },
    { $set: claimUpdate },
    { new: true }
  );

  if (!order) {
    throw new ServiceEscrowAlreadyReleasedError();
  }

  try {
    // The money is held by Razorpay as an on_hold transfer, so "release" means
    // telling Razorpay to let it go — it then settles to the seller's linked
    // account on that account's own schedule.
    //
    // Orders funded before Route escrow shipped have no transfer to release;
    // their money genuinely is sitting in the Wallet ledger, so they keep
    // settling the old way. New orders never take this branch.
    let wallet = null;

    if (order.routeTransferId) {
      /* Commission out of the hold first — see the matching note in
         escrowRelease.service.js. The hold carries the whole payment now so
         that a dispute can pay the seller all of it; on a clean completion
         Tokun's cut has to be reversed back out before the rest is released.
         0 on bookings funded before that change, where it was never held. */
      const held = Number(order.routeHeldAmount || 0);
      const commission = Number(order.platformFee || 0) + Number(order.clientFee || 0);
      const toReverse = +Math.min(commission, Math.max(0, held - Number(order.sellerAmount || 0))).toFixed(2);

      if (toReverse > 0) {
        await reverseTransfer(order.routeTransferId, toReverse);
      }

      await releaseTransfer(order.routeTransferId);
      await ServiceOrder.updateOne(
        { _id: order._id },
        { $set: { routeTransferStatus: "released", transferReleasedAt: now, routeTransferError: "" } }
      );
      order.routeTransferStatus = "released";
      order.transferReleasedAt = now;
    } else {
      wallet = await Wallet.creditServiceSale(order.sellerId, order.sellerAmount, {
        orderId: order._id,
        serviceTitle: order.serviceTitle,
      });
    }

    try {
      // Tokun's earnings: seller commission + buyer platform fee, both net of
      // GST. The GST on each is recorded separately below — it's collected for
      // the government, so it must stay out of revenue and out of the balance
      // an admin can withdraw.
      const totalCommission = Number(order.platformFee || 0) + Number(order.clientFee || 0);
      await PlatformWallet.recordCommission(totalCommission, {
        source: "service_purchase",
        refId: order._id,
        description: `Commission: "${order.serviceTitle}"`,
      });

      const totalGst = Number(order.platformFeeGst || 0) + Number(order.clientFeeGst || 0);
      await PlatformWallet.recordGst(totalGst, {
        source: "service_purchase",
        refId: order._id,
        description: `GST on fees: "${order.serviceTitle}"`,
      });
    } catch (revErr) {
      console.error("PlatformWallet commission record failed (service_purchase):", revErr);
    }

    await User.findByIdAndUpdate(order.sellerId, {
      $inc: { totalEarnings: order.sellerAmount, completedDeals: 1 },
    });

    return { order, wallet };
  } catch (err) {
    // The release itself failed after we already claimed the order — revert the
    // claim so it's retryable instead of leaving it stuck "released" with no
    // money ever having moved.
    //
    // This is the safe-failure direction the whole design turns on: the
    // transfer is still on_hold at Razorpay, so nothing has reached the seller,
    // and the hourly auto-release cron will pick this order up again.
    await ServiceOrder.findByIdAndUpdate(orderId, {
      $set: {
        fundsStatus: "HELD_BY_TOKUN",
        status: "WORK_SUBMITTED",
        routeTransferError: String(err?.message || "release_failed").slice(0, 500),
      },
      $unset: {
        approvedAt: "",
        releasedAt: "",
        ...(isAuto ? { autoReleased: "", autoReleasedAt: "" } : {}),
      },
    });
    throw err;
  }
}

module.exports = { releaseServiceEscrowToSeller, ServiceEscrowAlreadyReleasedError };
