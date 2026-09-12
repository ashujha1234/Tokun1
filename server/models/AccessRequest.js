const mongoose = require("mongoose");

/**
 * The checklist of things a creator needs from a client before they can work.
 *
 * ── Why this is a model and not a chat message ───────────────────────────────
 *
 * Every real engagement starts with the creator asking for the same handful of
 * things: the logo, the brand guidelines, copy, access to a platform, a decision
 * on something. Before this, all of it happened as prose in chat, which fails in
 * four specific ways:
 *
 *   1. Nothing is trackable. "Did they ever send the fonts?" means scrolling a
 *      conversation. A five-item ask becomes five things nobody is counting, and
 *      the two that never arrived surface a week later as a delay.
 *
 *   2. The delay is unattributable. A creator who is late because the client
 *      never sent the source files has no record of having asked, so
 *      `deliveryDueAt` — which the submit guard enforces — treats the waiting
 *      time as theirs. Clause 11 of the agreement extends the deadline for
 *      exactly this, and it needs something to point at.
 *
 *   3. Files sent in chat are not on the order. In a dispute over "this isn't
 *      what I asked for", the material the client actually supplied is evidence,
 *      and it was sitting in a message thread rather than against the booking.
 *
 *   4. Credentials get pasted into chat. This is the serious one. Asked for
 *      "access to your email platform" in free text, a meaningful share of
 *      clients reply with a username and password, in a chat log, in plaintext,
 *      forever. Structuring the ask is the only way to make the safe answer the
 *      obvious one — see ACCESS items and the guard in
 *      routes/accessRequests.js.
 *
 * ── One request per engagement ───────────────────────────────────────────────
 *
 * Not one per ask. A creator who needs three more things next week adds items to
 * the existing checklist rather than starting a second one, so "what is
 * outstanding on this booking" is always a single query with a single answer.
 * Enforced by a unique index below.
 *
 * Items are never deleted. An item the creator no longer needs is marked
 * NOT_APPLICABLE, which keeps the record of having asked — the same reasoning as
 * ProgressReview keeping DECLINED and EXPIRED rows rather than removing them.
 */

/* A file the CLIENT supplied in answer to an item.
   Same shape as ServiceOrder's BriefAttachmentSchema and read through the same
   kind of gated route, because it is the same class of thing: the client's own
   confidential material, held privately by Tokun.

   Note which direction the sensitivity runs here. A deliverable is the
   creator's unpaid work and is watermarked for the buyer while money is held;
   this is the buyer's material going the other way, so there is nothing to
   watermark — only to authorise. */
const AccessAttachmentSchema = new mongoose.Schema(
  {
    url: { type: String, default: "" },
    blobName: { type: String, default: "" },
    name: { type: String, default: "Attachment" },
    size: { type: Number, default: 0 },
    mimeType: { type: String, default: "" },
    uploadedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const AccessItemSchema = new mongoose.Schema(
  {
    /* What is being asked for, in the creator's words. Kept short by the route
       — this is a checklist line, and the explanation goes in `note`. */
    label: { type: String, required: true, trim: true, maxlength: 200 },

    /* What KIND of thing this is, because the answer differs completely:
     *
     *   ASSET    — a file to upload. Logo, brand guide, footage, copy doc.
     *   ACCESS   — permission to work inside one of the client's systems. The
     *              answer is NOT a credential: it is "I invited you", recorded
     *              in `grantedTo`. This distinction is the whole security value
     *              of the feature (see the file header and clause 6).
     *   INFO     — something to be written down. A tone of voice, a target
     *              audience, a domain name, a deadline that matters.
     *   APPROVAL — a decision only the client can make, blocking the work until
     *              it is made. Kept apart from INFO because chasing "we need
     *              you to pick one" reads differently from chasing a fact.
     */
    kind: {
      type: String,
      enum: ["ASSET", "ACCESS", "INFO", "APPROVAL"],
      default: "ASSET",
    },

    /* The creator's instruction — what good looks like, what format, where to
       find it. Optional, and most useful on ACCESS items, where it says which
       account to invite and at what level. */
    note: { type: String, default: "", maxlength: 1000 },

    /* Whether the work is actually blocked without it.
       Only required items decide whether the checklist is fulfilled and whether
       the delivery deadline extends — a creator marking everything required
       would otherwise be able to freeze their own deadline indefinitely by
       asking for a nice-to-have. */
    required: { type: Boolean, default: true },

    /*  PENDING        — asked, not answered
     *  PROVIDED       — the client answered
     *  DECLINED       — the client won't or can't provide it, with a reason.
     *                   A first-class outcome, not a failure: "we don't have
     *                   brand guidelines" is a real and common answer, and the
     *                   creator needs to hear it rather than keep waiting.
     *  NOT_APPLICABLE — the creator withdrew the ask. Kept rather than deleted
     *                   so the record still shows it was raised.
     */
    status: {
      type: String,
      enum: ["PENDING", "PROVIDED", "DECLINED", "NOT_APPLICABLE"],
      default: "PENDING",
    },

    // ── the client's answer ──
    responseNote: { type: String, default: "", maxlength: 2000 },
    attachments: { type: [AccessAttachmentSchema], default: [] },

    /* For ACCESS items only: the account the client says they invited.
       An email or a handle — deliberately NOT a credential field, and there is
       no credential field anywhere in this schema. There is nowhere for a
       password to be stored because a password must never be sent; the route
       additionally refuses a response that looks like one. */
    grantedTo: { type: String, default: "", maxlength: 200 },

    providedAt: { type: Date, default: null },
    declineReason: { type: String, default: "", maxlength: 1000 },

    /* Set when the creator sends an answered item back — the client uploaded
       the wrong file, or granted access at the wrong level. Kept as a count
       rather than a boolean so a checklist item that has been round-tripped
       three times says so. */
    reopenCount: { type: Number, default: 0 },
    reopenNote: { type: String, default: "", maxlength: 1000 },

    requestedAt: { type: Date, default: Date.now },
  }
  // _id kept (the default): every route below addresses a single item by id.
);

const AccessRequestSchema = new mongoose.Schema(
  {
    orderKind: { type: String, enum: ["hire", "service"], required: true, index: true },
    hireDealId: { type: mongoose.Schema.Types.ObjectId, ref: "HireDeal", default: null },
    serviceOrderId: { type: mongoose.Schema.Types.ObjectId, ref: "ServiceOrder", default: null },

    /* Normalised, so a dispute screen or an admin can read a checklist without
       knowing which parent model it hangs off — the same reasoning as
       ProgressReview's buyerId/sellerId. */
    buyerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },

    // Snapshot, for any screen listing checklists across orders.
    orderTitle: { type: String, default: "" },

    items: { type: [AccessItemSchema], default: [] },

    /*  OPEN      — at least one required item is still outstanding
     *  FULFILLED — every required item is answered or withdrawn
     *  CANCELLED — the creator closed the checklist
     *
     * Derived by recomputeStatus() rather than set by callers, so it can never
     * disagree with the items. FULFILLED is not terminal: adding a new required
     * item puts the checklist back to OPEN, which is correct — the work is
     * blocked again.
     */
    status: {
      type: String,
      enum: ["OPEN", "FULFILLED", "CANCELLED"],
      default: "OPEN",
      index: true,
    },

    fulfilledAt: { type: Date, default: null },
    cancelledAt: { type: Date, default: null },

    /* ── Why this field exists: the deadline ────────────────────────────────
       Total time, in whole hours, that this checklist has held the work up —
       accumulated across every period where a required item was outstanding.

       Clause 11 of the agreement says the delivery date extends by the length
       of any delay caused by the client failing to provide something required.
       That is unenforceable without a number, and computing it on the fly from
       item timestamps is not possible once an item has been round-tripped:
       reopen/provide/reopen produces overlapping intervals that the item rows
       alone can't reconstruct.

       So it is accumulated at the moment a blocking period ends. Advisory: it
       is what a creator points at and what an admin weighs in a ruling, and it
       does NOT silently move `deliveryDueAt` — a deadline that shifts on its
       own, without either party agreeing, would be a worse problem than the one
       it solves. */
    blockedHours: { type: Number, default: 0 },
    /* When the current blocking period started, or null if nothing required is
       outstanding. The open end of the interval being accumulated above. */
    blockedSince: { type: Date, default: null },
  },
  { timestamps: true }
);

/* One checklist per engagement — see the file header. `sparse` because exactly
   one id field is populated on any document and a plain unique index would read
   every null as a collision. */
AccessRequestSchema.index({ hireDealId: 1 }, { unique: true, sparse: true });
AccessRequestSchema.index({ serviceOrderId: 1 }, { unique: true, sparse: true });

/** Is this item still blocking the work? */
function isBlocking(item) {
  return item.required && item.status === "PENDING";
}

/**
 * Recompute `status`, `fulfilledAt` and the blocked-time accumulator.
 *
 * Called after every mutation to `items`. Callers must save().
 *
 * The accumulator is the subtle part: it closes the open interval when nothing
 * required is outstanding any more, and opens one when something becomes
 * outstanding again. Doing it here — in one place, on every mutation — is what
 * makes a reopened item count its second blocking period as well as its first.
 */
AccessRequestSchema.methods.recomputeStatus = function recomputeStatus(now = new Date()) {
  if (this.status === "CANCELLED") return this;

  const blocking = this.items.some(isBlocking);

  if (blocking && !this.blockedSince) {
    // A blocking period just started (first ask, or an item reopened).
    this.blockedSince = now;
  } else if (!blocking && this.blockedSince) {
    // It just ended — bank the interval and close it.
    const hours = (now.getTime() - new Date(this.blockedSince).getTime()) / 36e5;
    // Rounded down to whole hours: this number is quoted at people, and
    // "blocked for 0.4 hours" is noise dressed as precision.
    this.blockedHours = Math.max(0, this.blockedHours + Math.floor(hours));
    this.blockedSince = null;
  }

  /* No required items at all counts as fulfilled. That is deliberate: a
     checklist of purely optional asks does not block anything, and calling it
     OPEN forever would keep an "outstanding" badge on an order where nothing is
     actually owed. */
  const fulfilled = !blocking;
  this.status = fulfilled ? "FULFILLED" : "OPEN";
  this.fulfilledAt = fulfilled ? this.fulfilledAt || now : null;

  return this;
};

/** Counts for a badge, without the caller re-deriving them. */
AccessRequestSchema.methods.summary = function summary() {
  const items = this.items || [];
  return {
    total: items.length,
    outstanding: items.filter((i) => i.status === "PENDING").length,
    // The one that matters — what is actually holding the work up.
    outstandingRequired: items.filter(isBlocking).length,
    provided: items.filter((i) => i.status === "PROVIDED").length,
    declined: items.filter((i) => i.status === "DECLINED").length,
  };
};

/**
 * The checklist in the compact form the two DOCUMENTS need.
 *
 * Both the signed agreement (Schedule C) and the welcome doc list what the
 * client has to hand over, and both are generated in the browser from the order
 * response. Rather than have them each make a second round trip, the two order
 * GET routes attach this.
 *
 * Deliberately only the ASK, never the ANSWER: no responseNote, no grantedTo,
 * no attachments. Two reasons. A signed agreement is downloaded and forwarded,
 * and the client's answers have no business travelling in it. And `grantedTo`
 * is the field a determined client will try to put a credential in despite the
 * guard — keeping it out of the document is the cheap second line of defence.
 *
 * @returns {Promise<Array>} [] when no checklist was ever raised, which is the
 *   honest answer and the one that makes both documents omit the section rather
 *   than print an empty one.
 */
AccessRequestSchema.statics.itemsForOrder = async function itemsForOrder(orderKind, orderId) {
  const idField = orderKind === "hire" ? "hireDealId" : "serviceOrderId";
  const doc = await this.findOne({ [idField]: orderId })
    .select("items status")
    .lean();
  if (!doc) return [];

  return (doc.items || []).map((i) => ({
    label: i.label,
    kind: i.kind,
    note: i.note,
    required: i.required,
    status: i.status,
    providedAt: i.providedAt,
  }));
};

module.exports = mongoose.model("AccessRequest", AccessRequestSchema);
module.exports.isBlocking = isBlocking;
