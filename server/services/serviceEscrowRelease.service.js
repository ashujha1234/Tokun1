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
    const wallet = await Wallet.creditServiceSale(order.sellerId, order.sellerAmount, {
      orderId: order._id,
      serviceTitle: order.serviceTitle,
    });

    try {
      const totalCommission = Number(order.platformFee || 0) + Number(order.clientFee || 0);
      await PlatformWallet.recordCommission(totalCommission, {
        source: "service_purchase",
        refId: order._id,
        description: `Commission: "${order.serviceTitle}"`,
      });
    } catch (revErr) {
      console.error("PlatformWallet commission record failed (service_purchase):", revErr);
    }

    await User.findByIdAndUpdate(order.sellerId, {
      $inc: { totalEarnings: order.sellerAmount, completedDeals: 1 },
    });

    return { order, wallet };
  } catch (err) {
    // Wallet credit itself failed after we already claimed the order — revert
    // the claim so it's retryable instead of leaving it stuck "released" with
    // no money ever having moved.
    await ServiceOrder.findByIdAndUpdate(orderId, {
      $set: {
        fundsStatus: "HELD_BY_TOKUN",
        status: "WORK_SUBMITTED",
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
