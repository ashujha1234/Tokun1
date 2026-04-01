const express = require("express");
const router = express.Router();
const AdminActivity = require("../models/AdminActivity"); // ✅ AdminActivity use karo

const { requireAuth } = require("../utils/auth");
// routes/activity.js — temporarily auth hatao test ke liye
router.get("/recent", async (req, res) => {  // requireAuth hatao
  try {
    const count = await AdminActivity.countDocuments();
    console.log("Total activities in DB:", count);

    const limit = Math.min(parseInt(req.query.limit || "10", 10), 50);
    const query = {};

    const items = await AdminActivity.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    console.log("Items found:", items.length);

    res.json({
      success: true,
      items: items.map((a) => ({
        _id: String(a._id),
        type: a.type,
        title: a.title,
        description: a.description,
        actorName: a.actorName,
        targetName: a.targetName,
        createdAt: a.createdAt,
        meta: a.meta,
      })),
    });
  } catch (e) {
    console.error("activity/recent error:", e);
    res.status(500).json({ success: false, message: "Failed to fetch" });
  }
});



// activity.js mein ye test route add karo:
router.get("/test-insert", async (req, res) => {
  try {
    const result = await AdminActivity.create({
      type: "USER_LOGIN",
      title: "Test activity inserted",
      description: "Manual test insert",
      actorName: "Test Admin",
    });
    console.log("Test insert result:", result);
    res.json({ success: true, result });
  } catch (e) {
    console.error("Test insert error:", e);
    res.status(500).json({ success: false, error: e.message });
  }
});

// routes/activity.js mein add karo
router.post("/log", async (req, res) => {
  try {
    const { type, title, description, actorName, meta } = req.body;

    const result = await AdminActivity.create({
      type: type || "OTHER",
      title: title || "Activity",
      description: description || "",
      actorName: actorName || null,
      meta: meta || {},
    });

    res.json({ success: true, id: result._id });
  } catch (e) {
    res.status(500).json({ success: false });
  }
});




module.exports = router;