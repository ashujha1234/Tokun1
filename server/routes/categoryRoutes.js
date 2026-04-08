// routes/categoryRoutes.js
const express = require("express");
const router = express.Router();
const Category = require("../models/Category");
const DEFAULT_CATEGORIES = [
  "Coding",
  "Design",
  "UI/UX",
  "Writing",
  "Marketing",
  "Content",
  "Social Media",
  "Business",
  "Creative",
  "Education",
  "Finance",
  "Productivity",
  "Health",
  "Sales",
  "HR",
  "Travel",
  "Research",
  "Data",
  "Support",
  "Enterprise",
];

// GET all categories (no auth)
router.get("/", async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json({ success: true, categories });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "server_error" });
  }
});

// POST add category (auth required)
router.post("/",async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ success: false, error: "name_required" });

    const exists = await Category.findOne({ name });
    if (exists) return res.status(400).json({ success: false, error: "category_exists" });

    const category = await Category.create({ name, description });
    res.json({ success: true, category });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "server_error" });
  }
});



router.post("/seed-defaults", async (req, res) => {
  try {
    for (const name of DEFAULT_CATEGORIES) {
      await Category.updateOne(
        { name },
        { $setOnInsert: { name } },
        { upsert: true }
      );
    }

    const categories = await Category.find().sort({ name: 1 });
    res.json({ success: true, categories });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "server_error" });
  }
});

module.exports = router;
