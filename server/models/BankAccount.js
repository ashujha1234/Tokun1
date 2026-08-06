// // models/BankAccount.js
// const mongoose = require("mongoose");

// const BankAccountSchema = new mongoose.Schema(
//   {
//     userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
//     accountHolderName: { type: String, required: true, trim: true },
//     accountNumber: { type: String, required: true, trim: true },
//     ifscCode: { type: String, required: true, trim: true },
//     bankName: { type: String, required: true, trim: true },
//     default: { type: Boolean, default: false },
//   },
//   { timestamps: true }
// );

// module.exports = mongoose.model("BankAccount", BankAccountSchema);


// models/BankAccount.js
const mongoose = require("mongoose");

const BankAccountSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    payoutMethod: {
      type: String,
      enum: ["bank", "upi"],
      default: "bank",
    },

    accountHolderName: {
      type: String,
      required: true,
      trim: true,
    },

    accountNumber: {
      type: String,
      required: function () {
        return this.payoutMethod !== "upi";
      },
      trim: true,
    },

    ifscCode: {
      type: String,
      required: function () {
        return this.payoutMethod !== "upi";
      },
      trim: true,
      uppercase: true,
    },

    bankName: {
      type: String,
      required: function () {
        return this.payoutMethod !== "upi";
      },
      trim: true,
    },

    upiId: {
      type: String,
      required: function () {
        return this.payoutMethod === "upi";
      },
      trim: true,
    },

    default: {
      type: Boolean,
      default: false,
      index: true,
    },

    // RazorpayX fields
    razorpayContactId: {
      type: String,
      default: null,
    },

    razorpayFundAccountId: {
      type: String,
      default: null,
      index: true,
    },

    razorpayFundAccountStatus: {
      type: String,
      enum: ["CREATED", "FAILED", null],
      default: null,
    },

    razorpayError: {
      type: String,
      default: null,
    },

    // ── Seller type ──────────────────────────────────────────────────────
    // "individual" is the original flow (Razorpay business_type "individual",
    // which its API stores as "not_yet_registered"). "organization" is a
    // registered entity — it additionally carries a Razorpay business_type,
    // a company PAN and optionally a GSTIN, all of which go into the Route
    // account's `legal_info`, not `profile`.
    sellerType: {
      type: String,
      enum: ["individual", "organization"],
      default: "individual",
      index: true,
    },

    // Razorpay `business_type` — only set for sellerType "organization"
    // (private_limited / llp / partnership / trust / ...). The individual
    // flow hardcodes "individual" and doesn't persist it.
    businessType: {
      type: String,
      default: null,
    },

    // Razorpay `legal_business_name` — for individuals this is the same as
    // accountHolderName, for organizations it's the registered entity name
    // exactly as printed on the COI/GST certificate.
    legalBusinessName: {
      type: String,
      default: null,
    },

    // Razorpay `customer_facing_business_name` — the brand/trade name shown
    // to buyers. Falls back to legalBusinessName when the seller leaves it
    // blank.
    customerFacingBusinessName: {
      type: String,
      default: null,
    },

    // Razorpay `legal_info.pan` — the ENTITY's own PAN (4th letter C/F/T/A
    // depending on business type). Distinct from panNumber below, which is
    // the signatory's personal PAN on the Stakeholder object. For a
    // proprietorship the two are the same value, since a proprietorship has
    // no PAN separate from its proprietor's.
    businessPan: {
      type: String,
      default: null,
    },

    // Razorpay `legal_info.gst` — optional; only sent when the entity is
    // actually GST-registered.
    gstin: {
      type: String,
      default: null,
    },

    // The authorised signatory / director whose details went onto the
    // Stakeholder object. For individuals this equals accountHolderName.
    stakeholderName: {
      type: String,
      default: null,
    },

    // Legacy flag. Route onboarding is live for every seller type, so nothing
    // new is ever written with this set — it only marks records created while
    // the old org dry-run kill switch was on, whose route* ids below are
    // locally-minted placeholders Razorpay never issued. Every live-status
    // fetch skips those records instead of 404-ing against an unknown id, and
    // resubmitting the payout form overwrites them with real ids and clears
    // this flag. Safe to drop once no document has it set to true.
    routeDryRun: {
      type: Boolean,
      default: false,
    },

    // Route (Linked Account) — test fields, wired at the same time as the
    // existing Fund Account so both can be compared while testing.
    // This is the STAKEHOLDER's personal PAN (kyc.pan), not the entity PAN.
    panNumber: {
      type: String,
      default: null,
    },

    // Stored so the "needs clarification" screen can show back exactly what
    // the seller submitted at Route account-creation time.
    phone: {
      type: String,
      default: null,
    },

    // Razorpay `profile.category` / `profile.subcategory` — what this seller
    // sells, picked by them from Razorpay's own enum
    // (server/constants/businessCategories.js). Stored as a pair because a
    // subcategory only means anything inside its own category.
    //
    // No `enum:` constraint here on purpose: the source of truth is Razorpay's
    // list, which is validated at the route boundary against the constants
    // file. Duplicating ~340 strings into the schema would mean two lists to
    // keep in step, and would reject rows written before Razorpay last
    // extended its own enum.
    //
    // Nullable for accounts created before this was collected — those were
    // submitted with a hardcoded "healthcare"/"clinic".
    businessCategory: {
      type: String,
      default: null,
    },

    businessSubcategory: {
      type: String,
      default: null,
    },

    routeLinkedAccountId: {
      type: String,
      default: null,
    },

    routeStakeholderId: {
      type: String,
      default: null,
    },

    routeProductId: {
      type: String,
      default: null,
    },

    routeStatus: {
      type: String,
      enum: ["CREATED", "FAILED", null],
      default: null,
    },

    routeError: {
      type: String,
      default: null,
    },

    // Razorpay's real verification state for this Linked Account — updated
    // by the account.* webhooks. This (not routeStatus, which only reflects
    // whether *creation* succeeded) is what gates prompt-marketplace listing.
    activationStatus: {
      type: String,
      enum: ["CREATED", "UNDER_REVIEW", "NEEDS_CLARIFICATION", "SUSPENDED", "REJECTED", "ACTIVATED", null],
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("BankAccount", BankAccountSchema);