// services/escrowRelease.service.js
//
// Single shared implementation of "release hire-deal escrow to the
// freelancer's wallet". Used by all three release paths (client approve-work,
// admin force-release, hourly auto-release cron) so the credit/commission
// logic only ever exists once, and an atomic status claim prevents the same
// deal from ever being credited twice.

const HireDeal = require("../models/HireDeal");
const User = require("../models/User");
const Wallet = require("../models/Wallet");
const PlatformWallet = require("../models/PlatformWallet");

class EscrowAlreadyReleasedError extends Error {
  constructor() {
    super("escrow_already_released_or_not_eligible");
    this.code = "ESCROW_ALREADY_RELEASED_OR_NOT_ELIGIBLE";
  }
}

/**
 * @param {string} dealId
 * @param {"client_approved"|"admin_released"|"auto_released"} releasedBy
 * @returns {Promise<{ deal: object, wallet: object }>}
 */
async function releaseEscrowToFreelancer(dealId, releasedBy) {
  const isAuto = releasedBy === "auto_released";
  const now = new Date();

  // Step 1 — atomic claim. Only the caller whose findOneAndUpdate actually
  // matches a document (fundsStatus still HELD_BY_TOKUN) proceeds to credit
  // the wallet — this is what makes double-crediting impossible even if two
  // release paths race on the same deal.
  const claimUpdate = {
    fundsStatus: isAuto ? "AUTO_RELEASED" : "RELEASED_TO_FREELANCER",
    status: "COMPLETED",
    approvedAt: now,
    releasedAt: now,
  };
  if (isAuto) {
    claimUpdate.autoReleased = true;
    claimUpdate.autoReleasedAt = now;
  }

  const deal = await HireDeal.findOneAndUpdate(
    { _id: dealId, fundsStatus: "HELD_BY_TOKUN" },
    { $set: claimUpdate },
    { new: true }
  );

  if (!deal) {
    throw new EscrowAlreadyReleasedError();
  }

  try {
    const wallet = await Wallet.creditHireEscrow(deal.freelancerId, deal.freelancerAmount, {
      dealId: deal._id,
      dealTitle: deal.title,
    });

    try {
      const totalCommission = Number(deal.platformFee || 0) + Number(deal.clientFee || 0);
      await PlatformWallet.recordCommission(totalCommission, {
        source: "hire_escrow",
        refId: deal._id,
        description: `Commission: "${deal.title}"`,
      });
    } catch (revErr) {
      // Non-fatal — freelancer is already paid; commission bookkeeping
      // failing shouldn't roll that back, just log it loudly.
      console.error("PlatformWallet commission record failed (hire_escrow):", revErr);
    }

    await User.findByIdAndUpdate(deal.freelancerId, {
      $inc: { totalEarnings: deal.freelancerAmount, completedDeals: 1 },
    });

    return { deal, wallet };
  } catch (err) {
    // Wallet credit itself failed after we already claimed the deal —
    // revert the claim so it's retryable instead of leaving the deal stuck
    // "released" with no money ever having moved.
    await HireDeal.findByIdAndUpdate(dealId, {
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

module.exports = { releaseEscrowToFreelancer, EscrowAlreadyReleasedError };
