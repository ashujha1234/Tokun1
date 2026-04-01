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

    // Org subscription state (when plan === "enterprise")
subscriptionStatus: { type: String, enum: ["active","past_due","grace","suspended","canceled", null], default: null }, // <- NEW
billingAnchor: { type: Date, default: null },     // first start                   <- NEW
graceDays: { type: Number, default: 7 },          // configurable                  <- NEW
lastInvoiceDueAt: { type: Date, default: null },  // optional reporting             <- NEW
  },
  { timestamps: true }
);

module.exports = mongoose.model("Organization", OrganizationSchema);
