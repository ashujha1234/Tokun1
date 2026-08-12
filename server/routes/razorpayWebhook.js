// routes/razorpayWebhook.js
//
// Server-to-server confirmation for hire-deal payments, independent of the
// client's browser calling /verify-payment. If the customer's browser closes
// or crashes right after Razorpay captures the payment, this webhook still
// lets the deal transition to FUNDED — otherwise the money would be taken
// but our DB would never know.
//
// IMPORTANT: this handler must be mounted with express.raw({type:"application/json"})
// BEFORE the app's global express.json() middleware (see server/index.js) —
// signature verification needs the exact raw request bytes, not parsed JSON.

const crypto = require("crypto");
const HireDeal = require("../models/HireDeal");
const ServiceOrder = require("../models/ServiceOrder");
const BankAccount = require("../models/BankAccount");
const WebhookEvent = require("../models/WebhookEvent");
const ledger = require("../utils/ledger");

function verifySignature(rawBody, signature, secret) {
  if (!signature || !secret) return false;
  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  const expectedBuf = Buffer.from(expected, "utf8");
  const signatureBuf = Buffer.from(String(signature), "utf8");
  if (expectedBuf.length !== signatureBuf.length) return false;
  return crypto.timingSafeEqual(expectedBuf, signatureBuf);
}

const ACCOUNT_EVENT_TO_STATUS = {
  "account.created": "CREATED",
  "account.activated": "ACTIVATED",
  "account.under_review": "UNDER_REVIEW",
  "account.needs_clarification": "NEEDS_CLARIFICATION",
  "account.suspended": "SUSPENDED",
  "account.rejected": "REJECTED",
};

// Seller's Route Linked Account moved to a new verification state — this is
// what actually gates prompt-marketplace listing (see Prompt.requiresSellerVerification).
async function handleAccountStatusEvent(payload) {
  const mappedStatus = ACCOUNT_EVENT_TO_STATUS[payload.event];
  const accountId = payload?.payload?.account?.entity?.id;

  if (!mappedStatus || !accountId) return;

  await BankAccount.updateMany(
    { routeLinkedAccountId: accountId },
    { $set: { activationStatus: mappedStatus } }
  );
}

/* ── Route transfer events ────────────────────────────────────────────────
   Freelance escrow is a Razorpay transfer held with on_hold: 1, so once it's
   released the money moves and settles OUTSIDE this app. Without these events
   our DB would never learn whether it actually reached the freelancer — which
   is the one thing the internal wallet used to tell us for free.

   Matched on the transfer id first, falling back to the payment id: the id is
   normally stored at verify-payment, but that lookup is best-effort, so this
   also backfills it when it missed. */
async function handleTransferEvent(payload) {
  const transfer = payload?.payload?.transfer?.entity;
  const transferId = transfer?.id;
  if (!transferId) return;

  // Razorpay's own vocabulary ("processed", "pending", "failed", "reversed"),
  // stored verbatim rather than remapped — same reasoning as
  // BankAccount.activationStatus.
  const status = transfer.status || "";
  const paymentId = transfer.source || "";

  const update = { routeTransferStatus: status };
  if (status === "failed") {
    update.routeTransferError = transfer.error?.description || "transfer_failed";
  }

  for (const Model of [HireDeal, ServiceOrder]) {
    // Backfill the id when verify-payment's lookup missed it, so a later
    // release has something to act on.
    const matched = await Model.findOneAndUpdate(
      { routeTransferId: transferId },
      { $set: update },
      { new: true }
    );
    if (matched) return;

    if (paymentId) {
      const byPayment = await Model.findOneAndUpdate(
        { razorpayPaymentId: paymentId, routeTransferId: "" },
        { $set: { ...update, routeTransferId: transferId } },
        { new: true }
      );
      if (byPayment) return;
    }
  }
}

/* Marks a paid service booking FUNDED from the server side, mirroring what the
   hire-deal branch below has always done. Same reason: if the buyer's browser
   dies between capture and /verify-payment, the money is taken but our DB
   would never know. */
async function handleServiceOrderPaid(orderId, paymentId) {
  return ServiceOrder.findOneAndUpdate(
    { razorpayOrderId: orderId, paymentStatus: { $ne: "PAID" } },
    {
      $set: {
        paymentStatus: "PAID",
        fundsStatus: "HELD_BY_TOKUN",
        status: "FUNDED",
        paidAt: new Date(),
        razorpayPaymentId: paymentId || "",
      },
    },
    { new: true }
  );
}

/* ===============================================================
   Recording. Everything below is ADDITIVE — none of it changes what
   the handlers above do, and every part of it is non-fatal. A webhook
   must never fail because we couldn't write our own bookkeeping.
   =============================================================== */

/**
 * Store the raw event and decide whether we've already handled it.
 *
 * Returns { id, alreadyHandled }. `alreadyHandled` is true ONLY when a
 * previous delivery of this exact event reached a settled state — a row left
 * at "received" or "failed" means the last attempt died midway, so we let it
 * run again rather than silently dropping it.
 */
async function recordWebhookEvent(payload, headers = {}) {
  try {
    const eventId = headers["x-razorpay-event-id"] || null;
    const p = payload?.payload || {};
    const entity =
      p.payment?.entity || p.refund?.entity || p.transfer?.entity || p.settlement?.entity || {};

    if (eventId) {
      const existing = await WebhookEvent.findOne({ eventId }).select("status").lean();
      if (existing && ["processed", "ignored"].includes(existing.status)) {
        return { id: existing._id, alreadyHandled: true };
      }
      if (existing) return { id: existing._id, alreadyHandled: false };
    }

    const doc = await WebhookEvent.create({
      eventId,
      event: payload?.event || "unknown",
      occurredAt: payload?.created_at ? new Date(payload.created_at * 1000) : null,
      paymentId: p.payment?.entity?.id || entity.payment_id || "",
      orderId: p.payment?.entity?.order_id || "",
      refundId: p.refund?.entity?.id || "",
      transferId: p.transfer?.entity?.id || "",
      payload,
    });
    return { id: doc._id, alreadyHandled: false };
  } catch (err) {
    // A duplicate here means a concurrent delivery won the race; treat it as
    // not-yet-handled and let the (idempotent) handlers below run.
    if (err?.code !== 11000) {
      console.error("recordWebhookEvent failed:", err?.message);
    }
    return { id: null, alreadyHandled: false };
  }
}

/**
 * How long an ignored event is kept. Only applies to events we took no action
 * on — anything processed or failed is kept indefinitely. See
 * WebhookEvent.expiresAt.
 */
const IGNORED_EVENT_RETENTION_DAYS =
  Number(process.env.WEBHOOK_IGNORED_RETENTION_DAYS) || 90;

async function markWebhookEvent(id, status, error = "", { keep = false } = {}) {
  if (!id) return;
  try {
    const update = { status, error };

    if (status === "ignored" && !keep) {
      update.expiresAt = new Date(
        Date.now() + IGNORED_EVENT_RETENTION_DAYS * 86400 * 1000
      );
    } else {
      // An event that later turns out to matter (a retry that succeeds, or one
      // that fails and needs investigating) must lose any expiry it was given
      // on an earlier pass.
      update.expiresAt = null;
    }

    await WebhookEvent.updateOne({ _id: id }, { $set: update });
  } catch (err) {
    console.error("markWebhookEvent failed:", err?.message);
  }
}

/**
 * Write the money facts this event carries into the ledger.
 *
 * Deliberately WRITE-ONLY with respect to business state: nothing here touches
 * a Purchase, HireDeal or ServiceOrder. The events newly covered below
 * (refunds, failures, disputes, settlements) were previously discarded with a
 * bare 200, so recording them can't regress anything — but letting them mutate
 * orders could, which is why they don't.
 */
/**
 * Returns true if this event carried money we care about — whether or not a
 * row was actually inserted (a duplicate still means the event was
 * financially meaningful). The caller uses it to decide retention: an event
 * that touched money keeps its raw payload for good.
 */
async function recordLedgerFor(payload) {
  const event = String(payload?.event || "");
  const p = payload?.payload || {};

  try {
    if (event === "payment.captured") {
      await ledger.recordPayment(p.payment?.entity, { source: "webhook" });
      return true;
    }

    if (event === "payment.failed") {
      // No money moved, so no ledger row — but a failed attempt is exactly
      // what you need when a customer says "I paid and nothing happened", so
      // the raw event is worth keeping.
      return true;
    }

    if (event.startsWith("refund.")) {
      const refund = p.refund?.entity;
      // Only once the money has actually left. `refund.created` is an
      // instruction; `refund.processed` is the fact.
      if (refund && (refund.status === "processed" || event === "refund.processed")) {
        await ledger.recordRefund(refund, {
          source: "webhook",
          // We can't tell from the payload alone whether this came from our
          // admin queue or straight from the Razorpay dashboard. The reconcile
          // step is what resolves it; recording "unknown" is honest.
          initiatedBy: "unknown",
        });
      }
      return true;
    }

    if (event.startsWith("transfer.")) {
      await ledger.recordTransfer(p.transfer?.entity, { source: "webhook" });
      return true;
    }

    if (event.startsWith("settlement.")) {
      await ledger.recordSettlement(p.settlement?.entity, { source: "webhook" });
      return true;
    }

    // A chargeback is the single most important thing to still have the raw
    // payload for, years later. No ledger row — no money has moved yet — but
    // never expire it.
    if (event.startsWith("payment.dispute.")) {
      return true;
    }
  } catch (err) {
    console.error("recordLedgerFor failed:", event, err?.message);
    // Treat as significant: an event we failed to record is the last one you'd
    // want quietly deleted 90 days later.
    return true;
  }

  return false;
}

async function handleRazorpayWebhook(req, res) {
  let eventRecordId = null;
  try {
    const rawBody = req.body; // Buffer, thanks to express.raw()
    const signature = req.headers["x-razorpay-signature"];
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!verifySignature(rawBody, signature, secret)) {
      return res.status(400).json({ success: false, error: "invalid_signature" });
    }

    const payload = JSON.parse(rawBody.toString("utf8"));

    // Log first, act second — so an event is on record even if handling it
    // throws. Signature has already been verified, so nothing unauthenticated
    // reaches storage.
    const recorded = await recordWebhookEvent(payload, req.headers);
    eventRecordId = recorded.id;
    if (recorded.alreadyHandled) {
      return res.status(200).json({ received: true, duplicate: true });
    }

    // True when the event touched money — a refund, a dispute, a failed
    // payment. Several of those are "ignored" by the dispatch below (they
    // change no order state) but must never be expired, so retention keys off
    // this rather than off the dispatch outcome.
    const financiallySignificant = await recordLedgerFor(payload);

    // Settled here rather than on each return below, so not one of the
    // existing exit paths had to be touched. "ignored" is a real outcome — most
    // events are ones we deliberately don't act on. The catch at the bottom
    // overwrites this with "failed" if the handlers throw.
    const actedOn =
      payload.event in ACCOUNT_EVENT_TO_STATUS ||
      String(payload.event || "").startsWith("transfer.") ||
      payload.event === "payment.captured";
    await markWebhookEvent(eventRecordId, actedOn ? "processed" : "ignored", "", {
      keep: financiallySignificant,
    });

    if (payload.event in ACCOUNT_EVENT_TO_STATUS) {
      await handleAccountStatusEvent(payload);
      return res.status(200).json({ received: true });
    }

    // Matched by prefix rather than an explicit list — Razorpay has added
    // transfer events over time, and the entity's own `status` is what we
    // actually store, so a new one we haven't heard of still works.
    if (String(payload.event || "").startsWith("transfer.")) {
      await handleTransferEvent(payload);
      return res.status(200).json({ received: true });
    }

    if (payload.event !== "payment.captured") {
      // Not an event we act on (yet) — acknowledge so Razorpay stops retrying.
      return res.status(200).json({ received: true });
    }

    const paymentEntity = payload?.payload?.payment?.entity;
    const orderId = paymentEntity?.order_id;
    const paymentId = paymentEntity?.id;

    if (!orderId) {
      return res.status(200).json({ received: true });
    }

    // Idempotent: only flips deals that aren't already PAID — safe against
    // Razorpay's webhook retries and against the client's own /verify-payment
    // call having already handled it first.
    const deal = await HireDeal.findOneAndUpdate(
      { razorpayOrderId: orderId, paymentStatus: { $ne: "PAID" } },
      {
        $set: {
          paymentStatus: "PAID",
          fundsStatus: "HELD_BY_TOKUN",
          status: "FUNDED",
          paidAt: new Date(),
          razorpayPaymentId: paymentId || "",
        },
      },
      { new: true }
    );

    if (deal) {
      return res.status(200).json({ received: true, dealId: deal._id });
    }

    // Not a hire deal — service bookings are funded the same way and need the
    // same server-side safety net.
    const serviceOrder = await handleServiceOrderPaid(orderId, paymentId);
    if (serviceOrder) {
      return res.status(200).json({ received: true, serviceOrderId: serviceOrder._id });
    }

    // Neither, or already marked PAID (e.g. prompt purchase, wallet top-up, or
    // /verify-payment got there first) — nothing more to do.
    return res.status(200).json({ received: true });
  } catch (err) {
    console.error("Razorpay webhook error:", err);
    // Flip the optimistic "processed" back, so the retry that follows isn't
    // mistaken for a duplicate and skipped.
    await markWebhookEvent(eventRecordId, "failed", String(err?.message || err));
    // 500 (not 200) so Razorpay retries per its own backoff policy — this is
    // for genuine processing failures (e.g. a transient DB blip), not for
    // "not applicable" cases, which are already acked with 200 above.
    return res.status(500).json({ received: false, error: "internal_error" });
  }
}

module.exports = { handleRazorpayWebhook };
