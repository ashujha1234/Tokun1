// routes/adminDisputes.js
//
// Arbitration queue for cancellations the two parties couldn't settle
// themselves. An admin reads the seller's claim and proof, then names the
// percentage — the same single number the mutual path uses — and the shared
// settlement engine moves the money.
//
// The admin does NOT get a separate "refund X, pay Y" pair of inputs on
// purpose: two free-form amounts can be set to figures that don't add up to
// what the buyer paid, and reconciling that afterwards is not something a
// support agent can do. One percentage cannot be inconsistent.

const express = require("express");
const mongoose = require("mongoose");
const EscrowDispute = require("../models/EscrowDispute");
const ProgressReview = require("../models/ProgressReview");
const Notification = require("../models/Notification");
const Message = require("../models/Message");
const User = require("../models/User");
const { requireAuth } = require("../utils/auth");
const {
  settleEscrow,
  previewSettlement,
  getKind,
  EscrowNotSettleableError,
} = require("../services/escrowSettlement.service");
const { getWorkFileDownloadUrl } = require("../utils/serviceWorkStorage");

const router = express.Router();

function requireAdmin(req, res, next) {
  if (!req.isAdmin) {
    return res.status(403).json({ success: false, error: "forbidden" });
  }
  next();
}

// Every route here moves escrowed money or exposes both parties' details.
router.use(requireAuth, requireAdmin);

function orderIdField(orderKind) {
  return orderKind === "hire" ? "hireDealId" : "serviceOrderId";
}

/* ══════════════════════════════════════════════════════════════════════════
   GET /api/admin/disputes
   The queue. Defaults to what actually needs a decision.
   ══════════════════════════════════════════════════════════════════════════ */
router.get("/", async (req, res) => {
  try {
    const { status = "ADMIN_REVIEW", orderKind, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (status && status !== "ALL") filter.status = status;
    if (orderKind && ["hire", "service"].includes(orderKind)) filter.orderKind = orderKind;

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const perPage = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);

    const [disputes, total] = await Promise.all([
      EscrowDispute.find(filter)
        .populate("buyerId", "name email avatarUrl")
        .populate("sellerId", "name email avatarUrl cancelledAfterPaymentCount sellerStatus")
        // Oldest first: a dispute that has been waiting three days matters more
        // than one raised this morning.
        .sort({ createdAt: 1 })
        .skip((pageNum - 1) * perPage)
        .limit(perPage)
        .lean(),
      EscrowDispute.countDocuments(filter),
    ]);

    // Rupees for each pending claim, so the queue is readable without opening
    // every row and doing the arithmetic by hand.
    const withPreview = disputes.map((d) => {
      if (d.proposedSellerPercent === null || d.proposedSellerPercent === undefined) {
        return { ...d, preview: null };
      }
      const pseudoOrder = {
        totalPayable: d.totalPayable,
        sellerAmount: d.sellerAmount,
        freelancerAmount: d.sellerAmount,
        // Commission = what the buyer paid minus what the seller would have
        // got. Derived rather than re-read off the order so the queue needs one
        // query, and it's exact: those two are the only things the total splits
        // into.
        platformFee: +(d.totalPayable - d.sellerAmount).toFixed(2),
        clientFee: 0,
      };
      return { ...d, preview: previewSettlement(pseudoOrder, d.orderKind, d.proposedSellerPercent) };
    });

    return res.json({
      success: true,
      disputes: withPreview,
      total,
      page: pageNum,
      pages: Math.ceil(total / perPage) || 1,
    });
  } catch (err) {
    console.error("admin disputes list error:", err);
    return res.status(500).json({ success: false, error: "server_error" });
  }
});

/* ══════════════════════════════════════════════════════════════════════════
   GET /api/admin/disputes/:id
   One dispute with the full order behind it, for the decision screen.
   ══════════════════════════════════════════════════════════════════════════ */
router.get("/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, error: "invalid_id" });
    }

    const dispute = await EscrowDispute.findById(req.params.id)
      .populate("buyerId", "name email avatarUrl")
      .populate("sellerId", "name email avatarUrl cancelledAfterPaymentCount sellerStatus");

    if (!dispute) return res.status(404).json({ success: false, error: "dispute_not_found" });

    const kind = getKind(dispute.orderKind);
    const orderId = dispute[orderIdField(dispute.orderKind)];
    const order = await kind.model.findById(orderId).lean();

    /* Two outcomes, because an admin ruling is all-or-nothing: the full amount
       goes to whichever side was in the right. This used to be a ladder of six
       percentages; partial splits belong to the parties negotiating with each
       other, not to arbitration. */
    const previews = order
      ? [0, 100].map((p) => previewSettlement(order, dispute.orderKind, p))
      : [];

    // The evidence that actually settles "how much was done": timestamped
    // progress checkpoints the client asked for and the freelancer answered
    // while the work was underway. Far more adjudicable than the proof files
    // attached to the claim itself, which are produced after the argument
    // started and by only one side of it.
    const progressReviews = await ProgressReview.find({
      [dispute.orderKind === "hire" ? "hireDealId" : "serviceOrderId"]: orderId,
    })
      .sort({ createdAt: 1 })
      .lean();

    /* What was actually delivered, and when things happened.
       Both were already inside `order`, but under different field names per
       model and the admin screen rendered neither — so the one question that
       decides these cases, "was anything handed over?", had no answer on the
       page. Flattened here so the client doesn't have to know that a hire deal
       says `title` where a service booking says `serviceTitle`. */
    const submissions = (order?.submissions || []).map((s) => ({
      version: s.version,
      note: s.note,
      submittedAt: s.submittedAt,
      files: (s.deliverables || []).map((d) => ({
        name: d.name,
        kind: d.kind,
        size: d.size,
        // Links are provider URLs (Drive, Figma…) and safe to hand over as-is.
        // Uploaded files are gated, so only their existence is reported.
        url: d.kind === "link" ? d.url : null,
      })),
    }));

    const timeline = order
      ? [
          { label: "Booked", at: order.createdAt },
          { label: "Paid — held in escrow", at: order.paidAt },
          { label: "Work started", at: order.workStartedAt },
          { label: "Work submitted", at: order.workSubmittedAt },
          ...(order.revisions || []).map((r, i) => ({
            label: `Revision ${i + 1} requested${r.reason ? ` — ${r.reason}` : ""}`,
            at: r.requestedAt,
          })),
          { label: "Cancellation raised", at: dispute.createdAt },
          { label: "Creator stated their claim", at: dispute.proposedAt },
          { label: "Client disagreed", at: dispute.buyerRespondedAt },
        ]
          .filter((e) => e.at)
          .sort((a, b) => new Date(a.at) - new Date(b.at))
      : [];

    return res.json({
      success: true,
      dispute,
      order,
      previews,
      submissions,
      timeline,
      progressReviews: progressReviews.map((r) => ({
        ...r,
        // Blob names stay server-side; an admin opens media through the same
        // gated route the two parties use.
        media: (r.media || []).map((m, index) => ({
          index,
          name: m.name,
          kind: m.kind,
          size: m.size,
          uploadedAt: m.uploadedAt,
        })),
      })),
    });
  } catch (err) {
    console.error("admin dispute detail error:", err);
    return res.status(500).json({ success: false, error: "server_error" });
  }
});

/* ══════════════════════════════════════════════════════════════════════════
   GET /api/admin/disputes/:id/proof/:index/download

   The creator's proof of work, opened by the arbitrator.

   These files had no download route at all — they were uploaded, listed on the
   admin screen by filename, and could not be looked at by the one person whose
   job is to look at them. A ruling made on "3 proof file(s): a.png, b.mp4" is a
   ruling made on nothing.

   Returns a short-lived signed URL rather than the blob, matching every other
   gated file route here.
   ══════════════════════════════════════════════════════════════════════════ */
router.get("/:id/proof/:index/download", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, error: "invalid_id" });
    }

    const dispute = await EscrowDispute.findById(req.params.id)
      .select("proofFiles buyerProofFiles")
      .lean();
    if (!dispute) return res.status(404).json({ success: false, error: "dispute_not_found" });

    // ?side=buyer for the client's evidence; the creator's is the default
    // because theirs is the older field and every existing caller means it.
    const side = String(req.query.side || "seller").toLowerCase();
    const files = side === "buyer" || side === "client" ? dispute.buyerProofFiles : dispute.proofFiles;

    const file = files?.[Number(req.params.index)];
    if (!file) return res.status(404).json({ success: false, error: "proof_not_found" });

    /* Files uploaded before blob storage carry a plain `url` and no blobName.
       Handing that back unchanged is right — it is already a fetchable path and
       there is nothing to sign. */
    if (!file.blobName) {
      if (!file.url) return res.status(404).json({ success: false, error: "file_missing" });
      return res.json({ success: true, name: file.name, url: file.url });
    }

    return res.json({
      success: true,
      name: file.name,
      mimeType: file.mimeType,
      url: getWorkFileDownloadUrl(file.blobName),
    });
  } catch (err) {
    console.error("admin dispute proof download error:", err);
    return res.status(500).json({ success: false, error: "server_error" });
  }
});

/* ══════════════════════════════════════════════════════════════════════════
   POST /api/admin/disputes/:id/resolve
   Final ruling. sellerPercent 0 = full refund, 100 = full release.
   ══════════════════════════════════════════════════════════════════════════ */
router.post("/:id/resolve", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, error: "invalid_id" });
    }

    const dispute = await EscrowDispute.findById(req.params.id)
      .populate("buyerId", "name email")
      .populate("sellerId", "name email");

    if (!dispute) return res.status(404).json({ success: false, error: "dispute_not_found" });
    if (dispute.status === "RESOLVED") {
      return res.status(400).json({
        success: false,
        error: "already_resolved",
        message: "This dispute has already been settled.",
      });
    }
    if (dispute.status === "WITHDRAWN") {
      return res.status(400).json({ success: false, error: "withdrawn" });
    }

    /* All or nothing.
       An admin ruling names a winner and the whole amount goes to them — there
       is no partial split at this stage. The two parties get to negotiate a
       percentage between themselves (that is what the propose/accept flow is
       for); once it reaches arbitration the question has become "who was in the
       right", and answering that with 40% satisfies neither side and leaves
       Tokun defending a number it invented.

       `winner` is the real input. sellerPercent is still accepted so an older
       client can't break, but only at the two ends. */
    const winner = String(req.body?.winner || "").toLowerCase();
    let percent;

    if (winner === "client" || winner === "buyer") {
      percent = 0;
    } else if (winner === "freelancer" || winner === "seller" || winner === "creator") {
      percent = 100;
    } else {
      const raw = Number(req.body?.sellerPercent);
      if (raw !== 0 && raw !== 100) {
        return res.status(400).json({
          success: false,
          error: "winner_required",
          message:
            'Name a winner: send winner "client" or "freelancer". An admin ruling awards the full amount to one side — partial splits are only available when the two parties agree one between themselves.',
        });
      }
      percent = raw;
    }

    const adminNote = String(req.body?.adminNote || "").trim().slice(0, 2000);
    const orderId = dispute[orderIdField(dispute.orderKind)];
    const kind = getKind(dispute.orderKind);

    let result;
    try {
      result = await settleEscrow(dispute.orderKind, orderId, {
        sellerPercent: percent,
        reason:
          adminNote ||
          `Tokun ruled in favour of the ${percent === 0 ? "client" : "creator"} — full amount awarded`,
        actor: "admin",
        // Tokun takes nothing out of a job it had to arbitrate. The whole
        // amount the client paid goes to whichever side the ruling favours.
        waiveCommission: true,
      });
    } catch (err) {
      if (err instanceof EscrowNotSettleableError) {
        return res.status(400).json({ success: false, error: err.code, message: err.message });
      }
      console.error("admin dispute settlement failed:", err);
      // The settlement engine reverts the order to HELD_BY_TOKUN on failure, so
      // this is safe to retry once whatever Razorpay objected to is fixed.
      return res.status(502).json({
        success: false,
        error: "settlement_failed",
        message:
          err?.error?.description ||
          err?.message ||
          "The payment provider rejected this settlement. Nothing was changed — please retry.",
      });
    }

    dispute.status = "RESOLVED";
    dispute.finalSellerPercent = percent;
    dispute.finalSellerPayout = result.sellerPayout;
    dispute.finalRefundAmount = result.refundAmount;
    dispute.resolvedVia = "admin";
    dispute.resolvedAt = new Date();
    dispute.adminId = req.user._id;
    dispute.adminNote = adminNote;
    if (result.refund?.id) dispute.razorpayRefundId = result.refund.id;
    await dispute.save();

    // A ruling at 0% means the seller delivered nothing for work a client had
    // already paid for — the same failure a walkaway is, so it counts the same.
    if (percent === 0) {
      try {
        await User.findByIdAndUpdate(dispute.sellerId._id, {
          $inc: { cancelledAfterPaymentCount: 1 },
        });
      } catch (penaltyErr) {
        console.error("Seller penalty increment failed (admin ruling):", penaltyErr.message);
      }
    }

    await Promise.all([
      Notification.create({
        senderName: "Tokun",
        receiverUserId: dispute.sellerId._id,
        type: "ESCROW_DISPUTE_RESOLVED",
        amount: result.sellerPayout,
        message: `Tokun reviewed "${dispute.title}" and awarded you ${percent}% — ₹${result.sellerPayout}.${adminNote ? ` Note: ${adminNote}` : ""}`,
        meta: { disputeId: String(dispute._id), orderKind: dispute.orderKind },
      }),
      Notification.create({
        senderName: "Tokun",
        receiverUserId: dispute.buyerId._id,
        type: "ESCROW_DISPUTE_RESOLVED",
        amount: result.refundAmount,
        message: `Tokun reviewed "${dispute.title}" and is refunding you ₹${result.refundAmount}. Refunds usually reach the original payment method in 5–7 working days.${adminNote ? ` Note: ${adminNote}` : ""}`,
        meta: { disputeId: String(dispute._id), orderKind: dispute.orderKind },
      }),
    ]);

    const order = await kind.model.findById(orderId).select("chatId");
    if (order?.chatId) {
      try {
        await Message.create({
          conversationId: order.chatId,
          sender: dispute.buyerId._id,
          text: `⚖️ Tokun settled this cancellation at ${percent}%. ₹${result.sellerPayout} to the creator, ₹${result.refundAmount} refunded to the client.${adminNote ? `\n\n${adminNote}` : ""}`,
          readBy: [],
        });
      } catch (msgErr) {
        console.error("Dispute resolution chat message failed:", msgErr.message);
      }
    }

    return res.json({
      success: true,
      message: `Settled at ${percent}% — ₹${result.sellerPayout} to the creator, ₹${result.refundAmount} refunded.`,
      dispute,
      sellerPayout: result.sellerPayout,
      refundAmount: result.refundAmount,
      platformKeeps: result.commissionKept,
    });
  } catch (err) {
    console.error("admin dispute resolve error:", err);
    return res.status(500).json({ success: false, error: "server_error" });
  }
});

module.exports = router;
