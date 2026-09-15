const mongoose = require("mongoose");

/**
 * The signature record for one engagement's agreement.
 *
 * ── Why this exists when the order already holds the NDA fields ─────────────
 *
 * HireDeal and ServiceOrder each carry six NDA fields (a URL, a blob name, a
 * signature PNG and a timestamp, per side). Those are enough to answer "has
 * this side signed?", which is all the UI ever asked. They are not enough to be
 * a record:
 *
 *   • They are on a mutable document. The order's title, price, revision cap
 *     and delivery date all keep changing after signing — a settlement rewrites
 *     four money fields — so reading the order tells you what the engagement is
 *     NOW, not what was signed. A record of a signed agreement whose terms move
 *     afterwards is not evidence of anything.
 *
 *   • They record no version. The agreement text is generated in the browser
 *     (NdaCard.tsx). It changed materially at v2.0 — from an NDA to a full
 *     services contract. Without a version stamp, a 2026 signature and a 2027
 *     signature are indistinguishable, and neither can be shown to be against
 *     any particular text.
 *
 *   • They record no act of signing. Who, from where, on which document. A
 *     party disputing "I never signed that" was met with a boolean.
 *
 *   • There was no way to find them. NDAs existed only as fields inside orders
 *     scattered across two collections, so "show me every agreement signed this
 *     month", "which engagements are half-signed", or "produce the agreement for
 *     deal X" were all full scans of two collections with no index to help.
 *     Admin had no NDA screen at all, which is the gap this closes.
 *
 * So this collection is the record, written once per side at the moment of
 * signing and thereafter APPEND-ONLY. Nothing in here is ever recomputed from
 * the live order: the snapshots are deliberately frozen, and that is the whole
 * point of them. `sha256` is the hash of the exact bytes uploaded, so the stored
 * document can be proved to be the one signed.
 *
 * The order's own NDA fields are still written exactly as before. They stay the
 * hot path for "can this order be paid for yet"; this is the archive. Neither
 * depends on the other, so a failure here never blocks a signature — see the
 * caller in routes/hire.routes.js.
 */

/* One party's act of signing. */
const SignatureSchema = new mongoose.Schema(
  {
    /* Normalised across both engagement kinds: a hire deal calls them
       client/freelancer and a service booking calls them buyer/seller, and
       an admin reading a dispute should not have to care which. */
    role: { type: String, enum: ["client", "creator"], required: true },

    /* The vocabulary the parent order actually uses, kept alongside the
       normalised role so a record can be traced back to the field it was
       written from without knowing the mapping. */
    orderRole: {
      type: String,
      enum: ["client", "freelancer", "buyer", "seller"],
      required: true,
    },

    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    /* Snapshot, not a populate. The name and email a party signed under are
       part of what they signed — clause 21 has both sides warrant that the
       identity recorded against their signature is their own. A rename or an
       email change afterwards must not rewrite the record. */
    name: { type: String, default: "" },
    email: { type: String, default: "" },

    signedAt: { type: Date, required: true },

    /* The drawn signature, as the small PNG data URL the canvas produced.
       Duplicated from the order rather than referenced, for the reason above:
       the order's copy is live and can be overwritten by a re-sign. */
    signatureImage: { type: String, default: "" },

    /* Where the signed document is: the blob in the private `nda` (hire) or
       `service-nda` (service) container. Reads go through the admin download
       route, which mints a short-lived SAS after checking the caller. */
    blobName: { type: String, default: "" },
    container: { type: String, default: "" },

    /* SHA-256 of the uploaded bytes, hex.
       This is what makes the record provable rather than merely plausible: the
       file can be fetched years later and shown to be the same document, or
       shown not to be. Empty only if hashing failed, which is logged and does
       not block the signature. */
    sha256: { type: String, default: "" },
    byteSize: { type: Number, default: 0 },

    /* Which text was signed. Sent by the client that rendered it (the document
       is generated in the browser), so the server cannot infer it — see
       AGREEMENT_VERSION in NdaCard.tsx. "1.0" is the pre-versioning text and is
       what a signature arriving without a version is recorded as, because that
       is the only version that ever shipped without one. */
    agreementVersion: { type: String, default: "1.0" },

    /* Provenance of the act. Not identification — an IP is not a person — but
       it is the difference between "someone signed" and a record that can be
       questioned. Truncated on write; a user agent is not a place for 4 KB of
       attacker-chosen string. */
    ip: { type: String, default: "" },
    userAgent: { type: String, default: "" },
  },
  { _id: false }
);

const NdaRecordSchema = new mongoose.Schema(
  {
    orderKind: { type: String, enum: ["hire", "service"], required: true, index: true },

    /* Exactly one of these is set, matching orderKind. Same shape as
       ProgressReview and Review, so an admin screen joining across all three
       reads them the same way. */
    /* No `default: null` on either. A sparse index skips a document where the
       field is MISSING — not where it is present and null — so defaulting them
       put an explicit null on every record and handed the unique indexes below
       a value to collide on. See the note on orderRef. */
    hireDealId: { type: mongoose.Schema.Types.ObjectId, ref: "HireDeal" },
    serviceOrderId: { type: mongoose.Schema.Types.ObjectId, ref: "ServiceOrder" },

    /* The engagement this record belongs to, as one always-present string:
       "hire:<id>" or "service:<id>".

       This is the real uniqueness key, and it exists because the two nullable
       id fields could not be one. Whatever the id fields do or don't contain,
       this is set on every document and distinct for every engagement, so a
       plain unique index on it means what it says on MongoDB and on Cosmos
       alike — no sparse semantics, no partial filter, nothing to get wrong. */
    orderRef: { type: String, required: true },

    /* Normalised parties, for querying. The names and emails as signed live on
       each signature above; these ids are how "every agreement this user is a
       party to" is answered without a scan. */
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    creatorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },

    /* ── Frozen snapshot of the engagement AS SIGNED ──────────────────────────
       Every field here is copied at first signature and never updated. The
       live order is one populate away if the current state is what's wanted;
       what the live order can never answer is what the terms were on the day
       somebody signed them, which is the only question this record exists to
       answer. */
    orderTitle: { type: String, default: "" },
    amount: { type: Number, default: 0 },
    currency: { type: String, default: "INR" },
    totalPayable: { type: Number, default: 0 },
    /* Terms that are snapshotted on the order too, and still copied here: the
       order's copies are what the *booking* was made under, and a settlement or
       an admin edit can move them. */
    revisionsAllowed: { type: Number, default: null },
    deliveryDays: { type: Number, default: null },
    deliveryDueAt: { type: Date, default: null },
    /* The order's status when the FIRST party signed — i.e. what stage the
       engagement was at when it became a contract. */
    orderStatusAtSigning: { type: String, default: "" },

    signatures: { type: [SignatureSchema], default: [] },

    /* PARTIAL   — one side has signed; the engagement cannot be paid for yet.
       EXECUTED  — both sides have signed. Terminal: an agreement does not
                   become unsigned, and nothing in the codebase clears the
                   order's NDA fields.
       Derived from `signatures` by markSigned() rather than set by callers, so
       the two can't disagree. */
    status: {
      type: String,
      enum: ["PARTIAL", "EXECUTED"],
      default: "PARTIAL",
      index: true,
    },

    /* When it became binding on both — the date that matters for clause 27's
       survival periods, and the one an admin filters by. */
    executedAt: { type: Date, default: null, index: true },

    /* The highest version any party signed under.
       Almost always the same for both. It can differ legitimately: one party
       signs, the terms are updated, the other signs weeks later. That is worth
       being able to SEE rather than smoothing over, which is why it's stored as
       the max and why each signature keeps its own. */
    agreementVersion: { type: String, default: "1.0", index: true },

    /* True when the two signatures are against different versions. Flagged
       explicitly because it is the one state a human should look at: the
       parties are bound, but not demonstrably to the same text. */
    versionMismatch: { type: Boolean, default: false },

    /* Reconstructed after the fact by scripts/backfillNdaRecords.js, from an
       order signed before this collection existed.
       Flagged, and shown on the admin screen, because such a record is an
       approximation and must never be read as a contemporaneous one: its terms
       snapshot is the order as it stood at backfill time (the terms at signing
       were never recorded), and it has no hash, no IP and no user agent because
       none were ever captured. Everything it does assert — who, when, and the
       document where one survived — is read straight off the order. */
    backfilled: { type: Boolean, default: false },
  },
  { timestamps: true }
);

/* ── One record per engagement ───────────────────────────────────────────────
 *
 * Unique rather than merely indexed: the write path is an upsert keyed on the
 * order, and two parties can sign within milliseconds of each other. Without
 * it a race produces two half-signed records for one engagement and neither
 * ever reaches EXECUTED.
 *
 * It used to be two sparse unique indexes, one per id field, and that was
 * broken in a way that only showed up on the SECOND engagement of a kind:
 *
 *   hire record #1  { hireDealId: A, serviceOrderId: null }   indexed
 *   hire record #2  { hireDealId: B, serviceOrderId: null }   ← duplicate key
 *
 * `sparse` skips a document whose field is absent; both of these had the field
 * present and null, because the schema defaulted them. So every hire signing
 * after the first collided on the serviceOrderId index, and every service
 * signing after the first collided on the hireDealId one. The caller wraps this
 * write in a try/catch — the signature is what gates payment and must not fail
 * for an audit row — so it failed silently and the archive has been missing
 * records ever since, with only a console line to show for it.
 *
 * The retry loop in utils/ndaRecord.js could not help: it treats 11000 as
 * "someone else got there first" and re-reads, but this collision is
 * deterministic, so all three attempts hit the same wall.
 *
 * Keyed on orderRef now — one string, always present, distinct per engagement.
 * The id fields keep plain non-unique indexes for lookup. */
NdaRecordSchema.index({ orderRef: 1 }, { unique: true });
NdaRecordSchema.index({ hireDealId: 1 });
NdaRecordSchema.index({ serviceOrderId: 1 });

// The admin queue's default read: newest first, optionally filtered by state.
NdaRecordSchema.index({ status: 1, createdAt: -1 });
// "Every agreement I'm a party to", from either side.
NdaRecordSchema.index({ clientId: 1, createdAt: -1 });
NdaRecordSchema.index({ creatorId: 1, createdAt: -1 });

/* Highest of two dotted version strings ("2.0" > "1.10" is wrong; "1.10" wins).
   Compared numerically per segment for that reason. */
function higherVersion(a, b) {
  const parse = (v) =>
    String(v || "0")
      .split(".")
      .map((n) => Number(n) || 0);
  const [x, y] = [parse(a), parse(b)];
  for (let i = 0; i < Math.max(x.length, y.length); i += 1) {
    const d = (x[i] || 0) - (y[i] || 0);
    if (d) return d > 0 ? a : b;
  }
  return a;
}

/**
 * Record one party's signature, and recompute the derived state.
 *
 * Replaces rather than appends when the same role signs twice: a party can
 * re-sign (the upload route permits it — it overwrites the order's NDA fields),
 * and two signature entries for one role would make `status` meaningless.
 * The newest signature is the operative one, which is the same rule the order
 * itself follows.
 *
 * Callers must save(). Kept synchronous and side-effect-free so the whole write
 * is one save from the route, and so a failure there leaves nothing half-done.
 *
 * @param {object} sig  a SignatureSchema-shaped object
 */
NdaRecordSchema.methods.markSigned = function markSigned(sig) {
  this.signatures = [
    ...this.signatures.filter((s) => s.role !== sig.role),
    sig,
  ];

  const versions = this.signatures.map((s) => s.agreementVersion || "1.0");
  this.agreementVersion = versions.reduce(higherVersion, "0");
  this.versionMismatch = new Set(versions).size > 1;

  const roles = new Set(this.signatures.map((s) => s.role));
  if (roles.has("client") && roles.has("creator")) {
    this.status = "EXECUTED";
    // The moment it became binding on both — the LATEST of the two signatures,
    // not the moment this ran, which would drift on a re-sign.
    this.executedAt = new Date(
      this.signatures
        .map((s) => new Date(s.signedAt).getTime())
        .reduce((max, t) => Math.max(max, t), 0)
    );
  } else {
    this.status = "PARTIAL";
    this.executedAt = null;
  }

  return this;
};

module.exports = mongoose.model("NdaRecord", NdaRecordSchema);
module.exports.higherVersion = higherVersion;
