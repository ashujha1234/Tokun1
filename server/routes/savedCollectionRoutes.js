const express = require("express");
const mongoose = require("mongoose");
const { requireAuth } = require("../utils/auth");
const SavedCollection = require("../models/SavedCollection");

const router = express.Router();

/**
 * @route POST /api/saved
 * @desc Save an item to direct section OR collection
 * Body: {
 *   section: "smartgen" | "prompt",
 *   refId: "<Smartgen/Prompt ID>",
 *   collectionTitle?: "<optional collection name>",
 *   name?: "<optional label>"
 * }
 */
router.post("/", requireAuth, async (req, res) => {
  try {
    const { section, refId, collectionTitle, name } = req.body;

    // ✅ Validate section
    if (!section || !["smartgen", "prompt", "promptOptimizer"].includes(section)) {
      return res.status(400).json({ success: false, error: "invalid_section" });
    }

    // ✅ Validate ObjectId
    if (!refId || !mongoose.Types.ObjectId.isValid(refId)) {
      return res.status(400).json({ success: false, error: "invalid_refId" });
    }

    // Find or create user's saved collection
    let savedCollection = await SavedCollection.findOne({ userId: req.user._id });
    if (!savedCollection) {
      savedCollection = await SavedCollection.create({ userId: req.user._id });
    }

    // ✅ Set correct "on" field based on section
    let onField;
    if (section === "smartgen") onField = "Smartgen";
    else if (section === "prompt") onField = "Prompt";
    else if (section === "promptOptimizer") onField = "PromptOptimizer";

    const newItem = { ref: refId, on: onField, name };

    if (collectionTitle) {
      // Save inside a collection
      let collection = savedCollection.sections[section].collections.find(c => c.title === collectionTitle);

      if (!collection) {
        // create new collection if not exists
        savedCollection.sections[section].collections.push({
          title: collectionTitle,
          items: [newItem],
        });
      } else {
        // append to existing collection
        collection.items.push(newItem);
      }
    } else {
      // Save directly to section
      savedCollection.sections[section].directItems.push(newItem);
    }

    await savedCollection.save();

    return res.json({ success: true, savedCollection });
  } catch (err) {
    console.error("POST /saved error:", err);
    return res.status(500).json({ success: false, error: "server_error" });
  }
});

/**
 * @route GET /api/saved
 * @desc Get all saved items for current user
 */
router.get("/", requireAuth, async (req, res) => {
  try {
    const savedCollection = await SavedCollection.findOne({ userId: req.user._id })
      // populate smartgen directItems
      .populate({
        path: "sections.smartgen.directItems.ref",
        model: "Smartgen",
      })
      // populate smartgen collections.items
      .populate({
        path: "sections.smartgen.collections.items.ref",
        model: "Smartgen",
      })
      // populate prompt directItems
      .populate({
        path: "sections.prompt.directItems.ref",
        model: "Prompt",
      })
      // populate prompt collections.items
      .populate({
        path: "sections.prompt.collections.items.ref",
        model: "Prompt",
      })
       .populate({
        path: "sections.promptOptimizer.directItems.ref",
        model: "PromptOptimizer",
      })
      // populate prompt collections.items
      .populate({
        path: "sections.promptOptimizer.collections.items.ref",
        model: "PromptOptimizer",
      })
      .lean();

    if (!savedCollection) return res.json({ success: true, sections: {} });

    return res.json({ success: true, sections: savedCollection.sections });
  } catch (err) {
    console.error("GET /saved error:", err);
    return res.status(500).json({ success: false, error: "server_error" });
  }
});


/**
 * @route DELETE /api/saved/:section/:refId
 * @desc Remove a saved item (from directItems OR from any collection)
 */
router.delete("/:section/:refId", requireAuth, async (req, res) => {
  try {
    const { section, refId } = req.params;

    if (!section || !["smartgen", "prompt","promptOptimizer"].includes(section)) {
      return res.status(400).json({ success: false, error: "invalid_section" });
    }

    const savedCollection = await SavedCollection.findOne({ userId: req.user._id });
    if (!savedCollection) return res.status(404).json({ success: false, error: "not_found" });

    // Remove from directItems
    savedCollection.sections[section].directItems = savedCollection.sections[section].directItems.filter(
      item => item.ref.toString() !== refId
    );

    // Remove from collections
    savedCollection.sections[section].collections.forEach(c => {
      c.items = c.items.filter(item => item.ref.toString() !== refId);
    });

    await savedCollection.save();

    return res.json({ success: true, savedCollection });
  } catch (err) {
    console.error("DELETE /saved error:", err);
    return res.status(500).json({ success: false, error: "server_error" });
  }
});




/**
 * @route PUT /api/saved/collection
 * @desc Edit collection title
 * Body: {
 *   section: "smartgen" | "prompt",
 *   oldTitle: "Old Collection Name",
 *   newTitle: "New Collection Name"
 * }
 */
router.put("/collection", requireAuth, async (req, res) => {
  try {
    const { section, oldTitle, newTitle } = req.body;

    if (!section || !["smartgen", "prompt"].includes(section)) {
      return res.status(400).json({ success: false, error: "invalid_section" });
    }
    if (!oldTitle || !newTitle) {
      return res.status(400).json({ success: false, error: "oldTitle_and_newTitle_required" });
    }

    const savedCollection = await SavedCollection.findOne({ userId: req.user._id });
    if (!savedCollection) return res.status(404).json({ success: false, error: "not_found" });

    const collection = savedCollection.sections[section].collections.find(c => c.title === oldTitle);
    if (!collection) return res.status(404).json({ success: false, error: "collection_not_found" });

    // Update title
    collection.title = newTitle;
    await savedCollection.save();

    return res.json({ success: true, savedCollection });
  } catch (err) {
    console.error("PUT /saved/collection error:", err);
    return res.status(500).json({ success: false, error: "server_error" });
  }
});


/**
 * @route DELETE /api/saved/collection
 * @desc Delete a collection/folder
 * Body: {
 *   section: "smartgen" | "prompt",
 *   title: "Collection Name to Delete"
 * }
 */
router.delete("/collection", requireAuth, async (req, res) => {
  try {
    const { section, title } = req.body;

    if (!section || !["smartgen", "prompt","promptOptimizer"].includes(section)) {
      return res.status(400).json({ success: false, error: "invalid_section" });
    }
    if (!title) return res.status(400).json({ success: false, error: "title_required" });

    const savedCollection = await SavedCollection.findOne({ userId: req.user._id });
    if (!savedCollection) return res.status(404).json({ success: false, error: "not_found" });

    const beforeLength = savedCollection.sections[section].collections.length;

    savedCollection.sections[section].collections = savedCollection.sections[section].collections.filter(
      c => c.title !== title
    );

    if (savedCollection.sections[section].collections.length === beforeLength) {
      return res.status(404).json({ success: false, error: "collection_not_found" });
    }

    await savedCollection.save();

    return res.json({ success: true, savedCollection });
  } catch (err) {
    console.error("DELETE /saved/collection error:", err);
    return res.status(500).json({ success: false, error: "server_error" });
  }
});


module.exports = router;
