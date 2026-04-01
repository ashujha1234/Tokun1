// routes/categoryRoutes.js
const express = require("express");
const router = express.Router();
const Category = require("../models/Category");

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

module.exports = router;
