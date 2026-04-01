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
subscriptionStatus: { type: String, enum: ["active","past_due","grace","suspended","canceled", null], default: null }, // <- NEW
billingAnchor: { type: Date, default: null },     // first start (for alignment)  <- NEW
graceDays: { type: Number, default: 7 },          // configurable                 <- NEW
lastInvoiceDueAt: { type: Date, default: null },  // optional reporting     


sellerStatus: { type: String, enum: ["ACTIVE", "SUSPENDED"], default: "ACTIVE" },
location: { type: String, default: null },

sellerRating: { type: Number, default: 0 },
sellerReviewsCount: { type: Number, default: 0 },
sellerRefundRate: { type: Number, default: 0 },
sellerRefundThreshold: { type: Number, default: 5 },
// models/seller
sellerStatus: { type: String, default: "ACTIVE" },
isDeleted: { type: Boolean, default: false },
deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
