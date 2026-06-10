const express = require("express");
const mongoose = require("mongoose");

const router = express.Router();

const HireDeal = require("../models/HireDeal");
const User = require("../models/User");
const Notification = require("../models/Notification");

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
router.post("/", async (req, res) => {
  try {
    const { hireDealId, reason, description, reportedBy: reportedByParam } = req.body;

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

    const reporterId = String(reportedByParam || deal.clientId?._id);
    const isClient = deal.clientId && String(deal.clientId._id) === reporterId;
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
router.get("/deal/:dealId", async (req, res) => {
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

// ── GET /api/report/admin/all ─────────────────────
router.get("/admin/all", async (req, res) => {
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
router.patch("/:id/status", async (req, res) => {
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