// routes/adminOrgs.js
// Platform-admin views of Organizations. All routes are admin-gated:
// requireAuth resolves the admin JWT and sets req.isAdmin; requireAdmin below
// rejects anyone else. Mounted at /api/admin/orgs (see server/index.js).
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Organization = require("../models/organization");
const User = require("../models/User");
const Notification = require("../models/Notification");

const { requireAuth } = require("../utils/auth");

// Local guard, same pattern as sellerRoutes.js / purchaseRoutes.js.
function requireAdmin(req, res, next) {
  if (!req.isAdmin) {
    return res.status(403).json({ success: false, error: "forbidden" });
  }
  next();
}

// Shape one org document into the flat row the admin dashboard expects.
function shapeOrg(org) {
  const owner = org.ownerId && typeof org.ownerId === "object" ? org.ownerId : null;
  return {
    id: String(org._id),
    name: org.name || "Untitled Org",
    ownerName: owner?.name || "—",
    ownerEmail: owner?.email || "—",
    ownerId: owner ? String(owner._id) : String(org.ownerId || ""),
    plan: org.plan || null,
    billingCycle: org.billingCycle || null,
    subscriptionStatus: org.subscriptionStatus || null,
    currentPeriodEnd: org.currentPeriodEnd || null,
    orgPoolCap: Number(org.orgPoolCap || 0),
    orgPoolUsed: Number(org.orgPoolUsed || 0),
    orgExtraTokensRemaining: Number(org.orgExtraTokensRemaining || 0),
    teamMembersLimit: Number(org.teamMembersLimit || 0),
    teamMembersLimitRemaining: Number(org.teamMembersLimitRemaining || 0),
    membersCount: Array.isArray(org.members) ? org.members.length : 0,
    adminFrozen: !!org.adminFrozen,
    createdAt: org.createdAt || null,
  };
}

/**
 * GET /api/admin/orgs?page=1&limit=10&search=
 * Paginated list of all organizations (mirrors userAdminRoutes pagination).
 */
router.get("/", requireAuth, requireAdmin, async (req, res) => {
  try {
    const rawLimit = req.query.limit;
    const page = Math.max(parseInt(req.query.page || "1", 10), 1);
    const search = (req.query.search || "").toString().trim();

    let limit = rawLimit === undefined ? 10 : Math.max(parseInt(rawLimit, 10), 0);
    if (limit > 100) limit = 100;

    // Search matches org name, or owner name/email (owner resolved separately
    // since it lives on the User doc, not the Organization).
    let orgIdsByOwner = null;
    if (search) {
      const owners = await User.find({
        $or: [
          { name: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
        ],
      })
        .select("_id")
        .lean();
      orgIdsByOwner = owners.map((o) => o._id);
    }

    const query = search
      ? {
          $or: [
            { name: { $regex: search, $options: "i" } },
            { ownerId: { $in: orgIdsByOwner || [] } },
          ],
        }
      : {};

    let q = Organization.find(query)
      .populate("ownerId", "name email")
      .sort({ createdAt: -1 })
      .lean();

    if (limit > 0) q = q.skip((page - 1) * limit).limit(limit);

    const [orgs, total] = await Promise.all([q, Organization.countDocuments(query)]);

    return res.json({
      success: true,
      orgs: orgs.map(shapeOrg),
      pagination: {
        total,
        page,
        limit: limit === 0 ? total : limit,
        totalPages: limit === 0 ? 1 : Math.ceil(total / limit),
      },
    });
  } catch (e) {
    console.error("GET /api/admin/orgs error:", e);
    return res.status(500).json({ success: false, error: e?.message || "Server error" });
  }
});

/**
 * GET /api/admin/orgs/summary
 * KPIs + a 6-month "new orgs" trend + subscription-status breakdown, for the
 * charts/stat-cards at the top of the admin Org view.
 */
router.get("/summary", requireAuth, requireAdmin, async (req, res) => {
  try {
    const orgs = await Organization.find({})
      .select(
        "plan subscriptionStatus orgPoolCap orgPoolUsed teamMembersLimit teamMembersLimitRemaining createdAt"
      )
      .lean();

    const kpis = {
      totalOrgs: orgs.length,
      enterpriseActive: 0,
      seatsTotal: 0,
      seatsUsed: 0,
      poolCap: 0,
      poolUsed: 0,
    };

    /* No `grace` bucket. It was charted as a sixth state but nothing in the
       codebase has ever written that value — subscriptionStatusCron only ever
       assigns past_due for the whole pre-suspension window — so the bar sat at
       zero permanently and read as "no org is in grace" rather than the truth,
       "this state is not implemented". past_due IS the grace period. */
    const statusCounts = {
      active: 0,
      past_due: 0,
      suspended: 0,
      canceled: 0,
      none: 0,
    };

    for (const o of orgs) {
      if (o.plan === "enterprise" && o.subscriptionStatus === "active") kpis.enterpriseActive += 1;
      kpis.seatsTotal += Number(o.teamMembersLimit || 0);
      kpis.seatsUsed += Math.max(
        0,
        Number(o.teamMembersLimit || 0) - Number(o.teamMembersLimitRemaining || 0)
      );
      kpis.poolCap += Number(o.orgPoolCap || 0);
      kpis.poolUsed += Number(o.orgPoolUsed || 0);

      const s = o.subscriptionStatus || "none";
      if (statusCounts[s] !== undefined) statusCounts[s] += 1;
      else statusCounts.none += 1;
    }

    // Last 6 months, oldest → newest, counting orgs by createdAt month.
    const now = new Date();
    const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const trends = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      trends.push({
        label: MONTHS[d.getMonth()],
        year: d.getFullYear(),
        month: d.getMonth(),
        newOrgs: 0,
      });
    }
    for (const o of orgs) {
      if (!o.createdAt) continue;
      const d = new Date(o.createdAt);
      const bucket = trends.find((t) => t.year === d.getFullYear() && t.month === d.getMonth());
      if (bucket) bucket.newOrgs += 1;
    }

    const statusBreakdown = [
      { name: "Active", count: statusCounts.active },
      { name: "Past Due", count: statusCounts.past_due },
      { name: "Suspended", count: statusCounts.suspended },
      { name: "Canceled", count: statusCounts.canceled },
      { name: "No Plan", count: statusCounts.none },
    ];

    return res.json({
      success: true,
      kpis,
      trends: trends.map((t) => ({ label: t.label, newOrgs: t.newOrgs })),
      statusBreakdown,
    });
  } catch (e) {
    console.error("GET /api/admin/orgs/summary error:", e);
    return res.status(500).json({ success: false, error: e?.message || "Server error" });
  }
});

/**
 * GET /api/admin/orgs/:orgId
 * Single org full detail + its member list (for the admin org-profile drill-down).
 */
router.get("/:orgId", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { orgId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(orgId)) {
      return res.status(400).json({ success: false, error: "invalid_org_id" });
    }

    const org = await Organization.findById(orgId)
      .populate("ownerId", "name email avatarUrl")
      .populate("members.userId", "name email avatarUrl userType")
      .lean();

    if (!org) return res.status(404).json({ success: false, error: "org_not_found" });

    const members = (org.members || []).map((m) => {
      const u = m.userId && typeof m.userId === "object" ? m.userId : null;
      return {
        userId: u ? String(u._id) : String(m.userId || ""),
        name: u?.name || "—",
        email: u?.email || "—",
        avatar: u?.avatarUrl || null,
        role: m.role || "MEMBER",
        assignedCap: Number(m.assignedCap || 0),
        usedThisPeriod: Number(m.usedThisPeriod || 0),
      };
    });

    return res.json({
      success: true,
      org: {
        ...shapeOrg(org),
        ownerAvatar:
          org.ownerId && typeof org.ownerId === "object" ? org.ownerId.avatarUrl || null : null,
        billingAnchor: org.billingAnchor || null,
        lastInvoiceDueAt: org.lastInvoiceDueAt || null,
        graceDays: Number(org.graceDays || 0),
        totalAssignedCap: Number(org.totalAssignedCap || 0),
        members,
      },
    });
  } catch (e) {
    console.error("GET /api/admin/orgs/:orgId error:", e);
    return res.status(500).json({ success: false, error: e?.message || "Server error" });
  }
});

/**
 * PATCH /api/admin/orgs/:orgId/suspend   body: { action: "suspend" | "reactivate" }
 * Manual whole-org freeze/unfreeze. Sets Organization.adminFrozen (independent of
 * billing subscriptionStatus so the cron won't fight it) AND flips sellerStatus on
 * the owner + every team member so blockIfSuspended stops all of them from
 * buying/selling/withdrawing. Deleted accounts are left untouched.
 */
router.patch("/:orgId/suspend", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { orgId } = req.params;
    const { action } = req.body;

    /* Freezing an org locks out the owner and every member at once, so the
       reason goes into each of their notifications — same contract as the
       single-account suspend in sellerRoutes.js. */
    const reason = String(req.body.reason || "").trim();

    if (!mongoose.Types.ObjectId.isValid(orgId)) {
      return res.status(400).json({ success: false, error: "invalid_org_id" });
    }
    if (!["suspend", "reactivate"].includes(action)) {
      return res.status(400).json({ success: false, error: "action must be 'suspend' or 'reactivate'" });
    }
    if (action === "suspend" && reason.length < 5) {
      return res.status(400).json({
        success: false,
        error: "A reason of at least 5 characters is required to suspend an organization",
      });
    }

    const org = await Organization.findById(orgId).lean();
    if (!org) return res.status(404).json({ success: false, error: "org_not_found" });

    // Owner + all member user ids (deduped).
    const ids = new Set();
    if (org.ownerId) ids.add(String(org.ownerId));
    for (const m of org.members || []) {
      const uid = m.userId ? String(m.userId) : null;
      if (uid) ids.add(uid);
    }
    const userIds = [...ids];

    const freeze = action === "suspend";
    const newStatus = freeze ? "SUSPENDED" : "ACTIVE";

    await Organization.findByIdAndUpdate(orgId, { adminFrozen: freeze });

    if (userIds.length) {
      // Don't resurrect independently-deleted accounts on reactivate.
      await User.updateMany(
        { _id: { $in: userIds }, isDeleted: { $ne: true } },
        { sellerStatus: newStatus }
      );

      const notifs = userIds.map((id) => ({
        receiverUserId: id,
        type: freeze ? "ORG_FROZEN" : "ORG_UNFROZEN",
        // Same contract as the single-account suspend in sellerRoutes.js:
        // nobody is signed out, only transacting stops, and the appeal route
        // is the in-app admin chat.
        message: freeze
          ? `Your organization "${org.name}" has been suspended by an admin. Reason: ${reason} — buying, selling, services, hire deals and withdrawals are paused for the whole team. You are still signed in and can view your account. If you think this is a mistake, message the admin team and ask.`
          : reason
          ? `Your organization "${org.name}" has been reactivated by an admin. Note: ${reason}`
          : `Your organization "${org.name}" has been reactivated by an admin. Full access is restored.`,
        meta: {
          adminAction: action,
          orgId: String(orgId),
          reason,
          ...(freeze
            ? { actionUrl: "/support/admin-chat", actionLabel: "Message the admin team" }
            : {}),
        },
      }));
      try {
        await Notification.insertMany(notifs, { ordered: false });
      } catch (e) {
        /* `ordered: false` so one bad document can't drop the rest — a member
           whose notification fails validation shouldn't silence everyone
           else's. Logged loudly because this used to fail for every doc. */
        console.error("org suspend notify error:", e?.message);
      }
    }

    return res.json({
      success: true,
      orgId: String(orgId),
      adminFrozen: freeze,
      affectedAccounts: userIds.length,
    });
  } catch (e) {
    console.error("PATCH /api/admin/orgs/:orgId/suspend error:", e);
    return res.status(500).json({ success: false, error: e?.message || "Server error" });
  }
});

module.exports = router;
