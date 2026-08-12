// models/Organization.js
const mongoose = require("mongoose");

const OrganizationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    // Enterprise plan state is owned by the Organization
    // 🔁 CHANGED: allow null by default until purchase
    plan: { type: String, enum: ["enterprise", null], default: null },

    // Billing applies once enterprise is purchased
    billingCycle: { type: String, enum: ["monthly", "yearly", null], default: null },
    currentPeriodEnd: { type: Date, default: null },

    // Org token pool per period (active only if enterprise is active)
    orgPoolCap: { type: Number, default: 0 },               // set to 1,000,000 on purchase
    orgPoolUsed: { type: Number, default: 0 },
    orgExtraTokensRemaining: { type: Number, default: 0 },

    // Sum of members' assigned caps (for budgeting)
    totalAssignedCap: { type: Number, default: 0 },
    teamMembersLimit:{type: Number, default: 0},
    teamMembersLimitRemaining:{type: Number, default: 0},


    members: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        role: { type: String, enum: ["ADMIN", "MEMBER"], default: "MEMBER" },
        assignedCap: { type: Number, default: 0 },       // cap set by owner
        usedThisPeriod: { type: Number, default: 0 },    // reporting
        sectionUsage: { type: Map, of: Number, default: {} },
      },
    ],

    // Invitations sent but not yet answered. A seat and its token allowance are
    // reserved from the moment an invitation goes out — otherwise an owner with
    // three seats could send ten invitations and over-commit both the headcount
    // and the token pool. Decremented on accept (the seat becomes a real
    // member), decline, revoke or expiry.
    pendingInvites: { type: Number, default: 0, min: 0 },

    // Org subscription state (when plan === "enterprise")
subscriptionStatus: { type: String, enum: ["active","past_due","grace","suspended","canceled", null], default: null }, // <- NEW
billingAnchor: { type: Date, default: null },     // first start                   <- NEW
graceDays: { type: Number, default: 7 },          // configurable                  <- NEW
lastInvoiceDueAt: { type: Date, default: null },  // optional reporting             <- NEW

// Manual platform-admin freeze — SEPARATE from billing subscriptionStatus so the
// billing cron never overwrites it. When true, the whole org (owner + members)
// is suspended by an admin; toggled via PATCH /api/admin/orgs/:orgId/suspend.
adminFrozen: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Organization", OrganizationSchema);
