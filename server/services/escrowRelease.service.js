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
const { releaseTransfer } = require("../utils/routeEscrow");
const { reverseTransfer } = require("../utils/routePayouts");
const { logActivity, SYSTEM_ACTOR } = require("../utils/activityLogger");

class EscrowAlreadyReleasedError extends Error {
  constructor() {
    super("escrow_already_released_or_not_eligible");
    this.code = "ESCROW_ALREADY_RELEASED_OR_NOT_ELIGIBLE";
  }
}

/**
 * @param {string} dealId
 * @param {"client_approved"|"admin_released"|"auto_released"} releasedBy
 * @param {object} [actor]  { id, name, type: "AdminUser"|"User"|"system" } — who
 *   triggered this. `releasedBy` already says which PATH was taken; this says
 *   which PERSON took it, which is the part a dispute needs and the part that
 *   was missing. Optional so the three existing call sites keep working while
 *   they are updated; defaults to the cron/system actor because an unattributed
 *   release is far more likely to be the timer than a person.
 * @returns {Promise<{ deal: object, wallet: object }>}
 */
async function releaseEscrowToFreelancer(dealId, releasedBy, actor = null) {
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
    // The money is held by Razorpay as an on_hold transfer, so "release" means
    // telling Razorpay to let it go — it then settles to the freelancer's
    // linked account on that account's own schedule.
    //
    // Deals funded before Route escrow shipped have no transfer to release;
    // their money genuinely is sitting in the Wallet ledger, so they keep
    // settling the old way. New deals never take this branch.
    let wallet = null;

    if (deal.routeTransferId) {
      /* Take Tokun's commission out of the hold before letting the rest go.

         The hold now carries the FULL amount the client paid, not the
         freelancer's post-commission share — that's what makes a dispute
         decided in the freelancer's favour payable. The trade is that on a
         normal, undisputed completion the commission has to be reversed back
         to our balance here, because it's sitting inside the freelancer's
         transfer.

         Deals funded before that change hold freelancerAmount already, so
         routeHeldAmount is 0 on them and nothing is reversed — their
         commission never entered the transfer in the first place. */
      const held = Number(deal.routeHeldAmount || 0);
      const commission = Number(deal.platformFee || 0) + Number(deal.clientFee || 0);
      const toReverse = +Math.min(commission, Math.max(0, held - Number(deal.freelancerAmount || 0))).toFixed(2);

      if (toReverse > 0) {
        await reverseTransfer(deal.routeTransferId, toReverse);
      }

      await releaseTransfer(deal.routeTransferId);
      await HireDeal.updateOne(
        { _id: deal._id },
        { $set: { routeTransferStatus: "released", transferReleasedAt: now, routeTransferError: "" } }
      );
      deal.routeTransferStatus = "released";
      deal.transferReleasedAt = now;
    } else {
      wallet = await Wallet.creditHireEscrow(deal.freelancerId, deal.freelancerAmount, {
        dealId: deal._id,
        dealTitle: deal.title,
      });
    }

    try {
      // Earnings only — both fees net of GST. The tax on them is recorded
      // separately so it never lands in the withdrawable balance.
      const totalCommission = Number(deal.platformFee || 0) + Number(deal.clientFee || 0);
      await PlatformWallet.recordCommission(totalCommission, {
        source: "hire_escrow",
        refId: deal._id,
        description: `Commission: "${deal.title}"`,
      });

      const totalGst = Number(deal.platformFeeGst || 0) + Number(deal.clientFeeGst || 0);
      await PlatformWallet.recordGst(totalGst, {
        source: "hire_escrow",
        refId: deal._id,
        description: `GST on fees: "${deal.title}"`,
      });
    } catch (revErr) {
      // Non-fatal — freelancer is already paid; commission bookkeeping
      // failing shouldn't roll that back, just log it loudly.
      console.error("PlatformWallet commission record failed (hire_escrow):", revErr);
    }

    await User.findByIdAndUpdate(deal.freelancerId, {
      $inc: { totalEarnings: deal.freelancerAmount, completedDeals: 1 },
    });

    /* Audit row, written here rather than at the three call sites.
       All of client approve-work, admin force-release and the hourly cron come
       through this function, so a trail written here cannot be bypassed — and a
       fourth path added later is covered without anyone remembering to. That is
       the same reason the credit logic itself lives here.

       After the money has moved, deliberately: a row saying "released" for a
       release that then failed and got reverted below would be worse than no
       row. Best-effort, so it can never undo a payout that already happened. */
    await logActivity({
      type: "ESCROW_RELEASED",
      title: `Escrow released to freelancer — ₹${Number(deal.freelancerAmount || 0)}`,
      description: `"${deal.title}" · path: ${releasedBy}`,
      actor: actor || SYSTEM_ACTOR,
      target: { id: deal._id, type: "HireDeal", name: deal.title },
      amount: Number(deal.freelancerAmount || 0),
      before: { fundsStatus: "HELD_BY_TOKUN", status: "WORK_SUBMITTED" },
      after: { fundsStatus: deal.fundsStatus, status: deal.status },
      meta: {
        releasedBy,
        freelancerId: String(deal.freelancerId),
        clientId: String(deal.clientId),
        /* The commission taken out of the hold. A seller querying their payout
           asks why it is less than the deal value, and this is the answer. */
        platformFee: Number(deal.platformFee || 0),
        clientFee: Number(deal.clientFee || 0),
        routeTransferId: deal.routeTransferId || null,
        settledVia: deal.routeTransferId ? "razorpay_route" : "wallet_ledger",
      },
    });

    return { deal, wallet };
  } catch (err) {
    // The release itself failed after we already claimed the deal — revert the
    // claim so it's retryable instead of leaving the deal stuck "released" with
    // no money ever having moved.
    //
    // This is the safe-failure direction the whole design turns on: the
    // transfer is still on_hold at Razorpay, so nothing has reached the
    // freelancer, and the hourly auto-release cron will pick this deal up again.
    await HireDeal.findByIdAndUpdate(dealId, {
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

module.exports = { releaseEscrowToFreelancer, EscrowAlreadyReleasedError };
