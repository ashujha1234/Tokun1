// // models/User.js
// const mongoose = require("mongoose");

// const userSchema = new mongoose.Schema(
//   {
//     // Identity
//     name: { type: String, trim: true },
//     email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
//       avatarUrl: { type: String, default: null },
//     isVerified: { type: Boolean, default: false },
//      isDeletedFromOrg: { type: Boolean, default: false }, // ✅ soft delete flag for org context
//   deletedAt: { type: Date, default: null }, // ✅ when they were removed (optional)
//     // OTP / Security
//     otpHash: { type: String, default: null },
//     otpExpiresAt: { type: Date, default: null },
//     otpAttempts: { type: Number, default: 0 },
//     lockedUntil: { type: Date, default: null },
//     lastOtpSentAt: { type: Date, default: null },
//     lastLoginAt: { type: Date, default: null },
//    googleRefreshToken: {
//   type: String,
// },

//     // Access / Org linkage
//     // ⬇️ Standardize roles used in code paths:
//     //    - "Owner" (org owner), "Admin", "Member" (org member)
//     //    - null for IND users (instead of "Self")
//     // 🔁 CHANGED: removed "Team Member" and "Self" to avoid confusion
//     role: { type: String, enum: ["Owner", "Admin", "Member", null], default: null },

//     // ⬇️ User type:
//     //    - "IND" (individual)
//     //    - "ORG" (org owner/admin account)
//     //    - "TM"  (team member account)
//     userType: { type: String, enum: ["IND", "ORG", "TM"], default: "IND" },

//     orgId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", default: null },

//     // IND plans live on the user (free/pro). ORG users get plan=null.
//     // 🔁 CHANGED: removed "enterprise" from user-level plan enum
//     //             (enterprise is only at Organization level)
//     plan: { type: String, enum: ["free", "pro", null], default: null },

//     // Billing state for IND only
//     billingCycle: { type: String, enum: ["monthly", "yearly", null], default: null },
//     currentPeriodEnd: { type: Date, default: null },

//     // IND usage (free/pro)
//     // 🔁 CHANGED: initialize to 0; set real values when applying a plan
//     monthlyTokensCap: { type: Number, default: 0 },
//     monthlyTokensUsed: { type: Number, default: 0 },
//     extraTokensRemaining: { type: Number, default: 0 },
//     sectionUsage: { type: Map, of: Number, default: {} },
//     historyEntriesThisPeriod: { type: Number, default: 0 },

//     // 🔁 REMOVED legacy/monthly counters you don’t use in new logic:
//     // monthlyTokensRemaining: { type: Number, default: 0 },
//     // tokensLastResetMonth: { type: String, default: null },
//     // registrationDay: { type: Number, required: true },
//     // Reason: new logic uses (cap/used/extra) + currentPeriodEnd and cron resets.

//     // TM (team member) assignment (from org)
//     orgAssignedCap: { type: Number, default: 0 },     // assigned monthly cap by org
//     orgTokensRemaining: { type: Number, default: 0 }, // remaining for TM in this period
//     tokensLastResetDateIST: { type: String, default: null }, // "YYYY-MM-DD"

//     // Purchases (unrelated to plans)
//     purchasedPrompts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Purchase" }],

// // IND subscription state (used only when userType === "IND" and plan !== null)
// subscriptionStatus: { type: String, enum: ["active","past_due","grace","suspended","canceled", null], default: null }, // <- NEW
// billingAnchor: { type: Date, default: null },     // first start (for alignment)  <- NEW
// graceDays: { type: Number, default: 7 },          // configurable                 <- NEW
// lastInvoiceDueAt: { type: Date, default: null },  // optional reporting     


//   },
//   { timestamps: true }
// );

// module.exports = mongoose.model("User", userSchema);



// models/User.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    // Identity
    name: { type: String, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
      avatarUrl: { type: String, default: null },
    isVerified: { type: Boolean, default: false },
     isDeletedFromOrg: { type: Boolean, default: false }, // ✅ soft delete flag for org context
  deletedAt: { type: Date, default: null }, // ✅ when they were removed (optional)
    // OTP / Security
    otpHash: { type: String, default: null },
    otpExpiresAt: { type: Date, default: null },
    otpAttempts: { type: Number, default: 0 },
    lockedUntil: { type: Date, default: null },
    lastOtpSentAt: { type: Date, default: null },
    lastLoginAt: { type: Date, default: null },
   googleRefreshToken: {
  type: String,
},

    // Access / Org linkage
    // ⬇️ Standardize roles used in code paths:
    //    - "Owner" (org owner), "Admin", "Member" (org member)
    //    - null for IND users (instead of "Self")
    // 🔁 CHANGED: removed "Team Member" and "Self" to avoid confusion
    role: { type: String, enum: ["Owner", "Admin", "Member", null], default: null },

    // ⬇️ User type:
    //    - "IND" (individual)
    //    - "ORG" (org owner/admin account)
    //    - "TM"  (team member account)
    userType: { type: String, enum: ["IND", "ORG", "TM"], default: "IND" },

    orgId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", default: null },

    // IND plans live on the user (free/pro). ORG users get plan=null.
    // 🔁 CHANGED: removed "enterprise" from user-level plan enum
    //             (enterprise is only at Organization level)
    plan: { type: String, enum: ["free", "pro", null], default: null },

    // Billing state for IND only
    billingCycle: { type: String, enum: ["monthly", "yearly", null], default: null },
    currentPeriodEnd: { type: Date, default: null },

    // IND usage (free/pro)
    // 🔁 CHANGED: initialize to 0; set real values when applying a plan
    monthlyTokensCap: { type: Number, default: 0 },
    monthlyTokensUsed: { type: Number, default: 0 },
    extraTokensRemaining: { type: Number, default: 0 },
    sectionUsage: { type: Map, of: Number, default: {} },
    historyEntriesThisPeriod: { type: Number, default: 0 },

    // 🔁 REMOVED legacy/monthly counters you don’t use in new logic:
    // monthlyTokensRemaining: { type: Number, default: 0 },
    // tokensLastResetMonth: { type: String, default: null },
    // registrationDay: { type: Number, required: true },
    // Reason: new logic uses (cap/used/extra) + currentPeriodEnd and cron resets.
      


    // KYC
kycStatus: {
  type: String,
  enum: ["NOT_SUBMITTED", "PENDING", "VERIFIED", "REJECTED", "FLAGGED"],
  default: "NOT_SUBMITTED",
},
kycStage: {
  type: String,
  enum: ["DOCUMENTS_RECEIVED", "OCR_EXTRACTION", "NAME_MATCHING", "MANUAL_REVIEW", null],
  default: null,
},
kycReasonCode: { type: String, default: null },  // e.g. NAME_MISMATCH
kycReasonText: { type: String, default: null },  // readable reason
kycExtractedName: { type: String, default: null },
kycMatchScore: { type: Number, default: null },
kycLastSubmittedAt: { type: Date, default: null },
kycCooldownUntil: { type: Date, default: null }, // resubmit after cooldown
kycVerifiedAt: { type: Date, default: null },
kycDocType: { type: String, enum: ["AADHAAR", "PASSPORT"], default: null },
kycLastSubmissionId: { type: mongoose.Schema.Types.ObjectId, ref: "KycSubmission", default: null },
kycVerifiedAt: { type: Date, default: null },
    // TM (team member) assignment (from org)
    orgAssignedCap: { type: Number, default: 0 },     // assigned monthly cap by org
    orgTokensRemaining: { type: Number, default: 0 }, // remaining for TM in this period
    tokensLastResetDateIST: { type: String, default: null }, // "YYYY-MM-DD"

    // Purchases (unrelated to plans)
    purchasedPrompts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Purchase" }],

// IND subscription state (used only when userType === "IND" and plan !== null)
// No "grace": past_due covers the entire graceDays window below, and nothing
// ever assigned a separate grace value. Dropped from the enum so it can't be
// reintroduced as a state the cron and the admin charts don't understand.
subscriptionStatus: { type: String, enum: ["active","past_due","suspended","canceled", null], default: null }, // <- NEW
billingAnchor: { type: Date, default: null },     // first start (for alignment)  <- NEW
graceDays: { type: Number, default: 7 },          // configurable                 <- NEW
lastInvoiceDueAt: { type: Date, default: null },  // optional reporting     


sellerStatus: { type: String, enum: ["ACTIVE", "SUSPENDED"], default: "ACTIVE" },
location: { type: String, default: null },

// Mirror of FreelancerProfile.status, written whenever that document's status
// changes. The full profile lives in its own collection; this copy exists so
// listing screens (Find Creators, the admin seller table) can badge and filter
// freelancers without joining every row against it.
//   NONE   — never started the Become-a-Freelancer flow
//   DRAFT  — onboarding started but not finished
//   ACTIVE — profile is live; no admin approval is involved
freelancerStatus: {
  type: String,
  enum: ["NONE", "DRAFT", "ACTIVE"],
  default: "NONE",
  index: true,
},

/* ── Refer & Earn ────────────────────────────────────────────────────────
   referralCode is this user's own code, minted lazily the first time they
   open the Refer & Earn page — most accounts never will, and generating one
   for every signup fills the collection with codes nobody shares.
   referredBy is set once at signup and never again: letting it change means
   whoever asks last gets the credit. */
/* NO `default: null` here, and that is the whole point.

   The index is `unique + sparse`, and sparse skips documents where the field is
   ABSENT — not documents where it is explicitly null. A default of null means
   every new account is written with a real null value, so it lands IN the unique
   index. The first signup after this field shipped took the null slot; every
   signup after that collided with it and POST /signup/initiate answered 500 on
   the upsert, before it reached anything else. Nobody could register.

   Left undefined, the field simply isn't on the document until
   getOrCreateReferralCode mints one — which is what the note above already
   describes, and what the sparse index was chosen for. */
referralCode: { type: String, unique: true, sparse: true, uppercase: true, trim: true },
referredBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null, index: true },
referredAt: { type: Date, default: null },
/* Set when a referral qualifies: this creator's listings sort to the top of
   the marketplace until then. Costs nothing and aims at the only thing a new
   creator actually lacks — visibility, since they have no reviews yet. */
marketplaceBoostUntil: { type: Date, default: null },

sellerRating: { type: Number, default: 0 },
/* Stars currently deducted by admin rating penalties (models/RatingPenalty.js).
   sellerRating above is already NET of this — the field is stored separately so
   a profile or a support query can say why the number is what it is, instead of
   the drop looking like a bug. Maintained by utils/sellerRating.js. */
sellerRatingPenalty: { type: Number, default: 0 },
sellerReviewsCount: { type: Number, default: 0 },
sellerRefundRate: { type: Number, default: 0 },
sellerRefundThreshold: { type: Number, default: 5 },

// How many times this seller has walked away from work a client had already
// paid for. Abandoning a funded booking costs the client nothing in money —
// they get a full refund — but it costs them time, so it can't be free for the
// seller either. Incremented on every seller-initiated cancellation after work
// had started; the admin queue surfaces repeat offenders for suspension.
cancelledAfterPaymentCount: { type: Number, default: 0 },


// RazorpayX payout setup
razorpayContactId: { type: String, default: null },
razorpayFundAccountId: { type: String, default: null },

// Escrow / seller earnings stats
totalEarnings: { type: Number, default: 0 },
completedDeals: { type: Number, default: 0 },
// models/seller
isDeleted: { type: Boolean, default: false },
deletedAt: { type: Date, default: null },

/* ── Session revocation ──────────────────────────────────────────────────
   Bumped to invalidate every token this account has ever been issued.

   A JWT is self-contained: the server does not remember issuing it, so it
   cannot un-issue it. Until this field existed there was NO way to end a
   session early — a stolen token stayed valid for its full lifetime, a
   password change left the old token working, and "log out from all
   devices" could not be built at all.

   The token carries `tv` and requireAuth compares it against this number.
   Increment it and every token minted before that moment stops verifying on
   its next request; tokens minted after carry the new value and keep working.
   That is the whole mechanism — one number, no session table, no store to
   keep in sync.

   Bump it on: password change, "log out everywhere", account suspension, and
   any suspicion a token has leaked.

   Starts at 0, and tokens issued before this shipped have no `tv` claim at
   all. requireAuth reads a missing claim as 0, which matches this default —
   so deploying it does not sign out everybody who is currently logged in. */
tokenVersion: { type: Number, default: 0 },
  },
  { timestamps: true }
);

/* ── Cache invalidation ──────────────────────────────────────────────────────
 *
 * requireAuth caches the account behind a Bearer token (utils/cache.js), which
 * takes a Mongo round trip off every authenticated request. That cache is only
 * safe if a write to a User can never leave a stale copy behind it — so
 * invalidation lives HERE, on the model, rather than at the call sites.
 *
 * The reason is coverage. This account is written from dozens of places: admin
 * suspension, KYC decisions, plan changes, token accounting, referral
 * settlement, seller rating updates. Invalidating at each of those means every
 * future write is a chance to forget one, and forgetting one does not fail
 * loudly — it serves a suspended seller as active until the TTL runs out. A
 * model hook cannot be forgotten, because it is not the caller's job to
 * remember.
 *
 * What this specifically preserves is the property documented in utils/auth.js:
 * blockIfSuspended checks freshly on every request so that suspending an
 * account kills in-flight actions immediately. An admin's write fires the hook,
 * the entry is dropped, and the suspended user's next request re-reads from
 * Mongo. "Immediately" stays true.
 *
 * Note these are POST hooks, deliberately. Invalidating before the write means
 * a concurrent read can repopulate the cache from the pre-write state and the
 * stale value survives the write that was supposed to clear it.
 */
const { users: userCache } = require("../utils/cache");

userSchema.post("save", function (doc) {
  if (doc?._id) userCache.del(String(doc._id));
});

/* Query middleware. `this` is the Query, so the document is not in hand — the
   filter is what identifies the target.
 *
 * A filter of `{_id: x}` names exactly one entry and only that one is dropped.
 * Anything else — a bulk update by orgId, by plan, by subscription status —
 * could match any number of accounts, and the ids are not knowable without
 * running a second query. Clearing the whole user cache is the correct answer
 * there: it costs a re-read per active user once, which is measured in
 * milliseconds, and it cannot be wrong. Serving stale account state can be. */
function invalidateFromQuery() {
  /* `this` is usually the Query — but Mongoose registers deleteOne and
     updateOne as DOCUMENT middleware in some versions and as QUERY middleware
     in others, and the two give completely different `this`. Rather than pin
     the behaviour to one Mongoose version, both shapes are handled: a document
     knows its own _id, a query has to be asked for its filter. */
  if (typeof this.getFilter !== "function") {
    if (this?._id) userCache.del(String(this._id));
    else userCache.clear();
    return;
  }

  const id = this.getFilter()?._id;

  if (id && (typeof id === "string" || id instanceof mongoose.Types.ObjectId)) {
    userCache.del(String(id));
    return;
  }

  userCache.clear();
}

for (const op of [
  "findOneAndUpdate",
  "findOneAndDelete",
  "findOneAndReplace",
  "updateOne",
  "updateMany",
  "deleteOne",
  "deleteMany",
]) {
  userSchema.post(op, invalidateFromQuery);
}

module.exports = mongoose.model("User", userSchema);
