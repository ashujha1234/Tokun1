const express = require("express");
const mongoose = require("mongoose");

const router = express.Router();

const HireDeal = require("../models/HireDeal");
const User = require("../models/User");
const Notification = require("../models/Notification");
const { requireAuth } = require("../utils/auth");

function requireAdmin(req, res, next) {
  if (!req.isAdmin) {
    return res.status(403).json({ success: false, error: "forbidden" });
  }
  next();
}

/* Not a blanket router.use: POST / and GET /deal/:dealId are for the two people
   in a deal, the /admin routes are not. Gated per route below. */

const ReportSchema = new mongoose.Schema(
  {
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reportedUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    hireDealId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "HireDeal",
      required: true,
    },
    reason: {
      type: String,
      enum: [
        "SCAM",
        "FAKE_WORK",
        "NO_DELIVERY",
        "INAPPROPRIATE_BEHAVIOR",
        "PAYMENT_FRAUD",
        "OTHER",
      ],
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["PENDING", "UNDER_REVIEW", "RESOLVED", "DISMISSED"],
      default: "PENDING",
    },
    adminNote: {
      type: String,
      default: "",
    },
    resolvedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

ReportSchema.index({ reportedBy: 1, hireDealId: 1 }, { unique: true });

const Report =
  mongoose.models.Report || mongoose.model("Report", ReportSchema);

// ── POST /api/report ─────────────────────────────
router.post("/", requireAuth, async (req, res) => {
  try {
    const { hireDealId, reason, description } = req.body;

    if (!hireDealId || !reason) {
      return res.status(400).json({
        success: false,
        error: "hireDealId and reason are required",
      });
    }

    const deal = await HireDeal.findById(hireDealId)
      .populate("clientId", "name email")
      .populate("freelancerId", "name email");

    if (!deal) {
      return res.status(404).json({ success: false, error: "Deal not found" });
    }

    /* reportedBy comes from the verified token, never from the body.
       It used to read `req.body.reportedBy` and fall back to the deal's client,
       which meant two things on an unauthenticated route: anyone could file a
       report in another user's name, and omitting the field silently attributed
       the report to the client of a deal the caller had nothing to do with.
       An abuse report is evidence in escrow disputes — its author has to be the
       one thing about it that cannot be set by the caller.

       The reporter must also actually be in the deal. Without this an
       authenticated stranger could still report either party of any deal whose
       id they knew, and `reportedUserId` below would resolve them to the client
       via the isClient===false branch. */
    const reporterId = String(req.user._id);
    const isClient = deal.clientId && String(deal.clientId._id) === reporterId;
    const isFreelancer =
      deal.freelancerId && String(deal.freelancerId._id) === reporterId;

    if (!isClient && !isFreelancer) {
      return res.status(403).json({ success: false, error: "not_a_participant" });
    }

    const reportedUserId = isClient ? deal.freelancerId._id : deal.clientId._id;

    let report;
    try {
      report = await Report.create({
        reportedBy: reporterId,
        reportedUser: reportedUserId,
        hireDealId: deal._id,
        reason,
        description: description || "",
      });
    } catch (dupErr) {
      if (dupErr && dupErr.code === 11000) {
        return res.status(400).json({
          success: false,
          error: "You have already reported this deal.",
        });
      }
      throw dupErr;
    }

    return res.json({
      success: true,
      message: "Report submitted. Our team will review it within 24-48 hours.",
      report,
    });
  } catch (err) {
    console.error("report error:", err);
    return res.status(500).json({
      success: false,
      error: err && err.message ? err.message : "Failed to submit report",
    });
  }
});

// ── GET /api/report/deal/:dealId ─────────────────
// Returns the full report row when one exists, so it is not public. No frontend
// caller today; gated at the same level as filing one.
router.get("/deal/:dealId", requireAuth, async (req, res) => {
  try {
    const existing = await Report.findOne({
      hireDealId: req.params.dealId,
    }).lean();

    return res.json({
      success: true,
      reported: !!existing,
      report: existing,
    });
  } catch (err) {
    console.error("check report error:", err);
    return res.status(500).json({ success: false, error: "Failed to check" });
  }
});

/* ── GET /api/report/admin/all ─────────────────────
   Populates name+email of both the reporter and the reported user across every
   report on the platform. This was open. */
router.get("/admin/all", requireAuth, requireAdmin, async (req, res) => {
  try {
    const reports = await Report.find({})
      .populate("reportedBy", "name email")
      .populate("reportedUser", "name email")
      .populate("hireDealId", "title amount status")
      .sort({ createdAt: -1 })
      .lean();

    return res.json({ success: true, reports });
  } catch (err) {
    console.error("admin reports fetch error:", err);
    return res.status(500).json({ success: false, error: "Failed to fetch" });
  }
});

// ── PATCH /api/report/:id/status ─────────────────
// Closing an abuse report is an admin adjudication, not a user action.
router.patch("/:id/status", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { status, adminNote } = req.body;
    const report = await Report.findByIdAndUpdate(
      req.params.id,
      {
        status,
        adminNote: adminNote || "",
        ...(status === "RESOLVED" ? { resolvedAt: new Date() } : {}),
      },
      { new: true }
    );
    if (!report)
      return res.status(404).json({ success: false, error: "Report not found" });
    return res.json({ success: true, report });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;