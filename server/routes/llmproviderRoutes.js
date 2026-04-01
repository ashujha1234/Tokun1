const express = require("express");
const router = express.Router();
const LLMProvider = require("../models/LLMProvider");
const { requireAuth } = require("../utils/auth");

// Add one or multiple LLM Providers
// POST /api/llm-provider
router.post("/",async (req, res) => {
  try {
    const { providers } = req.body; // expects array of names: ["OpenAI", "Anthropic"]

    if (!providers || !Array.isArray(providers) || providers.length === 0) {
      return res.status(400).json({ success: false, error: "providers_required_array" });
    }

    const createdProviders = [];
    for (const name of providers) {
      const existing = await LLMProvider.findOne({ name });
      if (!existing) {
        const llm = await LLMProvider.create({ name });
        createdProviders.push(llm);
      }
    }

    res.json({ success: true, createdProviders });
  } catch (err) {
    console.error("Add LLMProvider error:", err);
    res.status(500).json({ success: false, error: "server_error" });
  }
});

// Get all LLM Providers
// GET /api/llm-provider
router.get("/", async (req, res) => {
  try {
    const providers = await LLMProvider.find().sort({ name: 1 });
    res.json({ success: true, providers });
  } catch (err) {
    console.error("Get LLMProviders error:", err);
    res.status(500).json({ success: false, error: "server_error" });
  }
});

// Delete LLM Provider by ID
// DELETE /api/llm-provider/:id
router.delete("/:id",  async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await LLMProvider.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ success: false, error: "provider_not_found" });

    res.json({ success: true, deleted });
  } catch (err) {
    console.error("Delete LLMProvider error:", err);
    res.status(500).json({ success: false, error: "server_error" });
  }
});

module.exports = router;
