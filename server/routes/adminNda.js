// routes/adminNda.js
//
// The admin's view of every agreement signed on the platform.
//
// There was no such view. An NDA existed only as six fields inside a HireDeal or
// a ServiceOrder, in two different collections under two different names, and
// the only way to read one was to already know the order id and then hit that
// order's own party-gated download route. So "produce the signed agreement for
// this dispute", "which engagements are stuck half-signed", and "how many
// agreements were signed this month" were all unanswerable from the admin side.
//
// Everything here reads models/NdaRecord — the append-only archive written at
// signing time — and never recomputes terms from the live order. That is the
// point: the order says what the engagement is now, the record says what was
// signed. The detail route returns BOTH, side by side, because the gap between
// them is often the thing being argued about.
//
// Read-only by design. An admin can list, inspect and download; there is no
// route here that edits or deletes a signature, because an audit trail an admin
// can rewrite is not an audit trail.

const express = require("express");
const mongoose = require("mongoose");

const NdaRecord = require("../models/NdaRecord");
const HireDeal = require("../models/HireDeal");
const ServiceOrder = require("../models/ServiceOrder");
const { requireAuth } = require("../utils/auth");
const { requireAdmin } = require("../middleware/requireAdmin");
const { getBlobSasUrl } = require("../utils/blobStorage");
const { parseOrderId } = require("../utils/orderId");

const router = express.Router();
router.use(requireAuth, requireAdmin);

const MAX_LIMIT = 100;
const DEFAULT_LIMIT = 25;

/* A search box takes whatever the admin types, and Mongo regex treats a stray
   "(" as syntax. Escaped rather than rejected — an admin searching for a title
   containing a bracket should get that title, not an error. */
function escapeRegex(s) {
  return String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/* The order behind a record, for the "as signed vs as it stands now" comparison.
   Selected rather than whole: an order carries the brief, the deliverables and
   both signature PNGs, none of which belong in this response — the signatures
   are already on the record, and the deliverables have their own gated route. */
const ORDER_FIELDS =
  "status paymentStatus fundsStatus amount currency totalPayable revisionsAllowed " +
  "deliveryDays deliveryDueAt paidAt approvedAt releasedAt cancelledAt cancelledBy " +
  "cancelReason settlementSellerPercent refundAmount escrowExpiresAt createdAt";

function orderModelFor(kind) {
  return kind === "hire" ? HireDeal : ServiceOrder;
}

/* Signature entries, minus the two fields that have no business in a list or a
   JSON body: the PNG (kilobytes each, and only useful when actually rendering
   the document) and the blob name (an internal storage path — the download
   route takes a role, not a path, so nothing needs it client-side).

   `hasDocument` and `hasSignatureImage` replace them, because "is there a file
   to open?" is the question the screen actually asks. */
function publicSignature(sig, { includeImage = false } = {}) {
  return {
    role: sig.role,
    orderRole: sig.orderRole,
    userId: sig.userId,
    name: sig.name,
    email: sig.email,
    signedAt: sig.signedAt,
    agreementVersion: sig.agreementVersion,
    sha256: sig.sha256,
    byteSize: sig.byteSize,
    ip: sig.ip,
    userAgent: sig.userAgent,
    hasDocument: !!sig.blobName,
    hasSignatureImage: !!sig.signatureImage,
    ...(includeImage ? { signatureImage: sig.signatureImage } : {}),
  };
}

/* ══════════════════════════════════════════════════════════════════════════
   GET /api/admin/nda/stats
   Counts for the dashboard pill. Kept above the /:recordId route so "stats"
   is never read as an id.
   ══════════════════════════════════════════════════════════════════════════ */
router.get("/stats", async (_req, res) => {
  try {
    const [byStatus, mismatches, last30] = await Promise.all([
      NdaRecord.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
      NdaRecord.countDocuments({ versionMismatch: true }),
      NdaRecord.countDocuments({
        createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      }),
    ]);

    const counts = byStatus.reduce((acc, row) => ({ ...acc, [row._id]: row.count }), {});

    return res.json({
      success: true,
      stats: {
        total: (counts.PARTIAL || 0) + (counts.EXECUTED || 0),
        executed: counts.EXECUTED || 0,
        // The queue an admin actually wants flagged: one side signed and the
        // engagement cannot be paid for until the other does.
        partial: counts.PARTIAL || 0,
        versionMismatch: mismatches,
        last30Days: last30,
      },
    });
  } catch (err) {
    console.error("admin nda stats error:", err);
    return res.status(500).json({ success: false, error: "server_error" });
  }
});

/* ══════════════════════════════════════════════════════════════════════════
   GET /api/admin/nda
   ?status=PARTIAL|EXECUTED  &kind=hire|service  &q=<name|email|title|order id>
   &mismatch=1  &page=1  &limit=25
   ══════════════════════════════════════════════════════════════════════════ */
router.get("/", async (req, res) => {
  try {
    const { status, kind, q, mismatch } = req.query;

    const filter = {};
    if (status === "PARTIAL" || status === "EXECUTED") filter.status = status;
    if (kind === "hire" || kind === "service") filter.orderKind = kind;
    if (mismatch === "1" || mismatch === "true") filter.versionMismatch = true;

    const raw = String(q || "").trim();
    /* Emails, invoices and support replies write an order id as "OD-<id>" (see
       utils/orderId.js), and what an admin pastes here is whatever the party
       quoted at them. The prefix comes off before the id is tested, so the
       number that was sent out is the number that finds the record. Anything
       that is not an order id passes through untouched. */
    const term = parseOrderId(raw);
    if (term) {
      /* An order id pasted into the search box is the single most likely thing
         an admin does here — they arrive from a dispute holding one. Matched
         exactly against either id field, and NOT combined with the text search:
         a valid ObjectId is never also a useful name fragment. */
      if (mongoose.Types.ObjectId.isValid(term)) {
        filter.$or = [
          { _id: term },
          { hireDealId: term },
          { serviceOrderId: term },
          { clientId: term },
          { creatorId: term },
        ];
      } else {
        const rx = new RegExp(escapeRegex(term), "i");
        filter.$or = [
          { orderTitle: rx },
          // The names and emails AS SIGNED, which is what an admin is reading
          // off a document — not whatever the user has since renamed to.
          { "signatures.name": rx },
          { "signatures.email": rx },
        ];
      }
    }

    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(MAX_LIMIT, Math.max(1, Number(req.query.limit) || DEFAULT_LIMIT));

    const [records, total] = await Promise.all([
      NdaRecord.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      NdaRecord.countDocuments(filter),
    ]);

    return res.json({
      success: true,
      page,
      limit,
      total,
      pages: Math.ceil(total / limit) || 1,
      records: records.map((r) => ({
        _id: r._id,
        orderKind: r.orderKind,
        orderId: r.hireDealId || r.serviceOrderId,
        orderTitle: r.orderTitle,
        amount: r.amount,
        currency: r.currency,
        totalPayable: r.totalPayable,
        status: r.status,
        executedAt: r.executedAt,
        agreementVersion: r.agreementVersion,
        versionMismatch: r.versionMismatch,
        // Surfaced so the screen can mark it: a backfilled row is an
        // approximation, not a contemporaneous record. See the model.
        backfilled: !!r.backfilled,
        orderStatusAtSigning: r.orderStatusAtSigning,
        createdAt: r.createdAt,
        signatures: (r.signatures || []).map((s) => publicSignature(s)),
        /* Which side is still outstanding, computed here rather than left to
           the client: it's the column the PARTIAL queue is triaged on. */
        awaiting:
          r.status === "EXECUTED"
            ? null
            : (r.signatures || []).some((s) => s.role === "client")
              ? "creator"
              : "client",
      })),
    });
  } catch (err) {
    console.error("admin nda list error:", err);
    return res.status(500).json({ success: false, error: "server_error" });
  }
});

/* ══════════════════════════════════════════════════════════════════════════
   GET /api/admin/nda/:recordId
   The record as signed, plus the order as it stands now.
   ══════════════════════════════════════════════════════════════════════════ */
router.get("/:recordId", async (req, res) => {
  try {
    const { recordId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(recordId)) {
      return res.status(400).json({ success: false, error: "invalid_id" });
    }

    const record = await NdaRecord.findById(recordId)
      .populate("clientId", "name email profileImage image")
      .populate("creatorId", "name email profileImage image")
      .lean();
    if (!record) return res.status(404).json({ success: false, error: "record_not_found" });

    const orderId = record.hireDealId || record.serviceOrderId;
    /* null when the order has since been deleted. Not an error: the record is
       the point, and the whole reason its terms are frozen is that the order
       may not survive it. The screen says "order no longer on file" rather
       than failing. */
    const order = orderId
      ? await orderModelFor(record.orderKind).findById(orderId).select(ORDER_FIELDS).lean()
      : null;

    return res.json({
      success: true,
      record: {
        ...record,
        orderId,
        // The images ARE wanted here — this is the screen that renders the
        // signed document.
        signatures: (record.signatures || []).map((s) =>
          publicSignature(s, { includeImage: true })
        ),
      },
      /* The live order, labelled as such. The two are shown together because
         the interesting cases are exactly where they differ: a price that has
         since been settled at 40%, a delivery date that moved, a revision cap
         that was null at signing. */
      liveOrder: order,
      /* null for a backfilled record, deliberately.
         Drift means "the terms moved after signing", and that comparison only
         means something when the snapshot was taken AT signing. A backfilled
         snapshot was taken at backfill time, so a zero drift there would assert
         "nothing changed" on no evidence at all. */
      drift: order && !record.backfilled
        ? {
            amount: Number(order.amount) !== Number(record.amount),
            totalPayable: Number(order.totalPayable) !== Number(record.totalPayable),
            revisionsAllowed:
              (order.revisionsAllowed ?? null) !== (record.revisionsAllowed ?? null),
            deliveryDueAt:
              String(order.deliveryDueAt || "") !== String(record.deliveryDueAt || ""),
            status: String(order.status || "") !== String(record.orderStatusAtSigning || ""),
          }
        : null,
    });
  } catch (err) {
    console.error("admin nda detail error:", err);
    return res.status(500).json({ success: false, error: "server_error" });
  }
});

/* ══════════════════════════════════════════════════════════════════════════
   GET /api/admin/nda/:recordId/document/:role  ->  { url } (short-lived SAS)
   role: "client" | "creator"

   Authorise before minting, always. A SAS is a bearer credential — whoever
   holds the URL can read the blob for its lifetime and it carries no notion of
   who asked — so `requireAdmin` at the top of this router is the whole
   authorisation, and it is enough: an agreement is evidence in precisely the
   disputes admins are asked to decide. The URL is deliberately short-lived.

   Returns JSON rather than a 302, unlike the two party-facing NDA routes. Those
   are opened directly by a browser; this one is called by fetch() carrying an
   admin bearer token, and a cross-origin redirect to Azure with an Authorization
   header on it is a footgun that depends on the browser stripping the header.
   Handing back the URL and letting the caller open it has no such dependency —
   the same shape routes/progressReview.js uses for media.
   ══════════════════════════════════════════════════════════════════════════ */
router.get("/:recordId/document/:role", async (req, res) => {
  try {
    const { recordId, role } = req.params;
    if (!mongoose.Types.ObjectId.isValid(recordId)) {
      return res.status(400).json({ success: false, error: "invalid_id" });
    }
    if (role !== "client" && role !== "creator") {
      return res.status(400).json({ success: false, error: "invalid_role" });
    }

    const record = await NdaRecord.findById(recordId).select("signatures").lean();
    if (!record) return res.status(404).json({ success: false, error: "record_not_found" });

    const sig = (record.signatures || []).find((s) => s.role === role);
    if (!sig) {
      return res.status(404).json({
        success: false,
        error: "not_signed",
        message: "This side has not signed.",
      });
    }
    if (!sig.blobName || !sig.container) {
      /* 410, not 404. A signature recorded without a retrievable document is a
         real historical state — every NDA signed before durable storage is one,
         and the backfill script records them honestly rather than inventing a
         blob name. "It existed and is gone" is a different fact from "it never
         existed", and the admin deserves the true one. */
      return res.status(410).json({
        success: false,
        error: "document_unavailable",
        message:
          "This signature is on record but its document is not retrievable — it was signed before agreements were stored durably. The signature and its timestamp are unaffected.",
      });
    }

    return res.json({
      success: true,
      url: getBlobSasUrl(sig.container, sig.blobName, 15),
      // So the screen can say "the signed copy, 84 KB, sha 3f9c…" rather than
      // just offering a link with nothing verifiable attached to it.
      sha256: sig.sha256 || "",
      byteSize: sig.byteSize || 0,
      signedAt: sig.signedAt,
    });
  } catch (err) {
    console.error("admin nda document error:", err);
    return res.status(500).json({ success: false, error: "server_error" });
  }
});

module.exports = router;
