const express = require("express");
const mongoose = require("mongoose");
const { requireAuth } = require("../utils/auth");

/* What a saved prompt is allowed to carry out of the API.
   promptText is absent on purpose — it is the thing being sold. */
const SAVED_PROMPT_FIELDS =
  "title description price tokun_price free exclusive sold attachment categories subCategories userId salesCount reviewAverage reviewCount averageRating deleted flagged createdAt";

const PROMPT_REF_POPULATE = [
  { path: "categories", select: "name" },
  { path: "subCategories", select: "name" },
  // Name only. The card shows the seller's name and links to their profile;
  // their email is not the page's business.
  { path: "userId", select: "name" },
];
const SavedCollection = require("../models/SavedCollection");

/* The sections that exist, and the model each one's refs point at.

   These were four separate inline arrays before — POST, GET /ids and the two
   DELETEs each carried their own copy, already written with different spacing,
   which is the tell that they were edited one at a time. Adding a section meant
   finding all four, and missing one meant a section you could save into but not
   list, or list but not remove from. */
const SECTION_MODEL = {
  smartgen: "Smartgen",
  prompt: "Prompt",
  promptOptimizer: "PromptOptimizer",
  // A saved creator is a person, so the ref is their User document.
  creator: "User",
};
const SECTIONS = Object.keys(SECTION_MODEL);

/* What a saved creator is allowed to carry out of the API: enough to draw their
   card and link to their profile, and nothing else. A User document holds an
   email, a token balance and an org membership, none of which is the business of
   whoever saved them. */
const SAVED_CREATOR_FIELDS = "name avatarUrl";

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
    if (!section || !SECTIONS.includes(section)) {
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

    // ✅ The refPath value for this section — one table, checked above.
    const newItem = { ref: refId, on: SECTION_MODEL[section], name };

    /* Saving yourself is not a thing. It would put your own card in your own
       list of people to come back to, and the directory doesn't list you to
       begin with. */
    if (section === "creator" && String(refId) === String(req.user._id)) {
      return res.status(400).json({ success: false, error: "cannot_save_self" });
    }

    /* Saving the same thing twice adds nothing and costs a duplicate row.

       Every branch below was a bare `push`, so pressing Save again — or the
       same product being saved from the marketplace card and then from its
       details panel — appended a second identical entry. The saved page then
       listed one product several times, and each copy had its own "remove",
       so clearing them took as many clicks as there were accidents.

       Reported as success rather than as an error: the user asked for this to
       be saved, and it is. `alreadySaved` lets the client say so instead of
       claiming it just did something. */
    const isSameRef = (item) => String(item.ref) === String(refId);

    /* ONE FLAT LIST. `collectionTitle` is ignored.

       Saving used to be able to file the item into a named collection, and the
       Saved page rendered those as folders with their own page, rename and
       move-between-folders. That is gone: saving something should put it where
       you can see it rather than ask you to file it first. Old collections are
       left in the document untouched — the page reads them and shows their
       contents alongside everything else, so nothing anyone saved disappears —
       they simply stop growing.

       The parameter is still accepted rather than rejected so an older client
       (a tab left open across a deploy) still saves successfully instead of
       failing on a field the server suddenly refuses. */
    const alreadyFiled = (savedCollection.sections[section].collections || []).some((c) =>
      (c.items || []).some(isSameRef)
    );

    if (savedCollection.sections[section].directItems.some(isSameRef) || alreadyFiled) {
      return res.json({ success: true, alreadySaved: true, savedCollection });
    }

    savedCollection.sections[section].directItems.push(newItem);

    await savedCollection.save();

    return res.json({ success: true, alreadySaved: false, savedCollection });
  } catch (err) {
    console.error("POST /saved error:", err);
    return res.status(500).json({ success: false, error: "server_error" });
  }
});

/**
 * @route GET /api/saved/ids?section=prompt
 * @desc Just the ids of what this user has saved in a section.
 *
 * For the screens that need to know "have I already saved this?" so they can
 * stop offering to save it again — the marketplace cards, the details panel.
 * They can't use GET / for that: it populates every saved document across three
 * sections, which is a large payload to fetch on a page that only wants a set of
 * ids to compare against.
 *
 * Covers directItems AND everything inside collections, because a product filed
 * in a folder is just as saved as one sitting loose.
 */
router.get("/ids", requireAuth, async (req, res) => {
  try {
    const section = String(req.query.section || "prompt");
    if (!SECTIONS.includes(section)) {
      return res.status(400).json({ success: false, error: "invalid_section" });
    }

    const saved = await SavedCollection.findOne({ userId: req.user._id })
      .select(`sections.${section}`)
      .lean();

    const bucket = saved?.sections?.[section];
    if (!bucket) return res.json({ success: true, ids: [] });

    const ids = new Set();
    for (const item of bucket.directItems || []) {
      if (item?.ref) ids.add(String(item.ref));
    }
    for (const collection of bucket.collections || []) {
      for (const item of collection.items || []) {
        if (item?.ref) ids.add(String(item.ref));
      }
    }

    return res.json({ success: true, ids: [...ids] });
  } catch (err) {
    console.error("GET /saved/ids error:", err);
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
      /* Prompt refs, WITHOUT promptText.

         These two used to populate the whole Prompt document, which meant
         saving a listing was enough to be handed the paid content itself — the
         one field every public prompt endpoint deliberately withholds (see the
         `-promptText` select on GET /api/prompt/public/:id). The Saved page now
         renders these as real marketplace cards with a details panel, so the
         payload has to obey the same rule the marketplace does.

         Everything a card and its details panel need is here; the prompt text
         still comes only from the purchase flow. */
      .populate({
        path: "sections.prompt.directItems.ref",
        model: "Prompt",
        select: SAVED_PROMPT_FIELDS,
        populate: PROMPT_REF_POPULATE,
      })
      .populate({
        path: "sections.prompt.collections.items.ref",
        model: "Prompt",
        select: SAVED_PROMPT_FIELDS,
        populate: PROMPT_REF_POPULATE,
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
      /* Saved creators. Name and photo only — see SAVED_CREATOR_FIELDS. The
         card links to their profile, which is where everything else about them
         already lives and is already access-checked. */
      .populate({
        path: "sections.creator.directItems.ref",
        model: "User",
        select: SAVED_CREATOR_FIELDS,
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

    if (!section || !SECTIONS.includes(section)) {
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

    if (!section || !SECTIONS.includes(section)) {
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
