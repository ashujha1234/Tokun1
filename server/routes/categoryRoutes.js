// routes/categoryRoutes.js
//
// One collection, two trees — see models/Category.js. `kind` picks the tree:
//   "prompt"  (default) — what a prompt is about. Flat.
//   "service"           — what a freelancer sells. Two levels.
//
// GET / RETURNS ONE KIND, TOP LEVEL ONLY, AND DEFAULTS TO "prompt". Prompt
// selling, the marketplace, the prompt library and the admin dashboard all read
// it with no query string and expect the flat prompt list they have always had.
// Changing that default would quietly reshape every one of those dropdowns.

const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const Category = require("../models/Category");
const Service = require("../models/Service");
const { SERVICE_CATEGORIES } = require("../constants/serviceCategories");

// Prompt categories. Flat by design: nothing in the prompt flow asks for a
// sub-category, and adding one would put a field on the prompt upload form that
// nothing reads.
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

/**
 * GET /api/category?kind=prompt|service
 * Top-level rows of one tree. See the note at the top of this file.
 *
 * `?includeSub=1` returns that tree flat, for admin screens.
 */
router.get("/", async (req, res) => {
  try {
    const kind = req.query.kind === "service" ? "service" : "prompt";
    const filter = { kind };
    if (req.query.includeSub !== "1") filter.parent = null;

    const categories = await Category.find(filter).sort({ name: 1 });
    res.json({ success: true, categories, kind });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "server_error" });
  }
});

/**
 * GET /api/category/:id/subcategories
 * The children of one category, whichever tree it is in.
 */
router.get("/:id/subcategories", async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, error: "invalid_category_id" });
    }

    const subCategories = await Category.find({ parent: id }).sort({ name: 1 });
    // 200 with an empty array rather than 404: "this one has no children" is a
    // normal answer the form should render, not an error.
    res.json({ success: true, subCategories, categories: subCategories });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "server_error" });
  }
});

// POST add a category, optionally under a parent and in a chosen tree.
router.post("/", async (req, res) => {
  try {
    const { name, description, parent } = req.body;
    const kind = req.body.kind === "service" ? "service" : "prompt";

    if (!name) return res.status(400).json({ success: false, error: "name_required" });

    let parentRow = null;
    if (parent) {
      if (!mongoose.Types.ObjectId.isValid(parent)) {
        return res.status(400).json({ success: false, error: "invalid_parent" });
      }
      parentRow = await Category.findById(parent).select("_id parent kind");
      if (!parentRow) {
        return res.status(400).json({ success: false, error: "parent_not_found" });
      }
      // Two levels is the whole design; a third would give the service form a
      // depth its UI has no way to represent.
      if (parentRow.parent) {
        return res.status(400).json({ success: false, error: "max_depth_is_two" });
      }
      // A child in a different tree from its parent would appear under a
      // heading it has nothing to do with.
      if (parentRow.kind !== kind) {
        return res.status(400).json({ success: false, error: "kind_mismatch" });
      }
    }

    // Scoped to (kind, parent) to match the index — a global name check would
    // reject "Business" in the service tree because the prompt tree has one.
    const exists = await Category.findOne({ kind, parent: parent || null, name });
    if (exists) return res.status(400).json({ success: false, error: "category_exists" });

    const category = await Category.create({ name, description, kind, parent: parent || null });
    res.json({ success: true, category });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "server_error" });
  }
});

/**
 * Drops the legacy global unique index on `name`.
 *
 * Category used to be one flat list with `name: { unique: true }`. Two trees
 * make that impossible — "Business" and "Data" are real names in both — and
 * Mongoose only ever creates indexes, so the old one survives every deploy until
 * something removes it explicitly.
 *
 * Safe to run repeatedly: a missing index is the expected state after the first
 * time, and both "no such index" codes are treated as success.
 */
async function dropLegacyNameIndex() {
  try {
    await Category.collection.dropIndex("name_1");
    console.log("[categories] dropped legacy name_1 index");
  } catch (err) {
    // 27 = IndexNotFound, 26 = NamespaceNotFound (collection not created yet).
    if (err?.code === 27 || err?.code === 26) return;
    console.error("[categories] could not drop name_1:", err?.message || err);
  }
}

/**
 * POST /api/category/seed-defaults
 *
 * Idempotent. Seeds the prompt tree (flat) and the service tree (two levels),
 * and never deletes anything a Service actually references.
 */
router.post("/seed-defaults", async (req, res) => {
  try {
    await dropLegacyNameIndex();

    /* ── backfill `kind` on rows that predate the field ──
       Mongoose defaults apply to NEW documents only, so every category created
       before `kind` existed has no such field — and a filter of {kind:"prompt"}
       matches none of them. Without this step the prompt dropdowns (upload,
       marketplace, library, admin) all come back empty the moment the API
       starts filtering by kind. Every pre-existing row is a prompt category. */
    const backfill = await Category.updateMany(
      { kind: { $exists: false } },
      { $set: { kind: "prompt" } }
    );

    /* ── prompt tree ── */
    for (const name of DEFAULT_CATEGORIES) {
      await Category.updateOne(
        { kind: "prompt", parent: null, name },
        { $setOnInsert: { name, kind: "prompt", parent: null } },
        { upsert: true }
      );
    }

    /* ── service tree ── */
    let serviceSubCount = 0;
    for (const { name, children } of SERVICE_CATEGORIES) {
      await Category.updateOne(
        { kind: "service", parent: null, name },
        { $setOnInsert: { name, kind: "service", parent: null } },
        { upsert: true }
      );

      const parentRow = await Category.findOne({ kind: "service", parent: null, name }).select("_id");
      if (!parentRow) continue;

      for (const childName of children) {
        await Category.updateOne(
          { kind: "service", parent: parentRow._id, name: childName },
          { $setOnInsert: { name: childName, kind: "service", parent: parentRow._id } },
          { upsert: true }
        );
        serviceSubCount += 1;
      }
    }

    /* ── clean up the short-lived service-ish children seeded under PROMPT
          categories (Coding → "Web Development", Content → "Video Editing", …).
          They were the wrong shape: prompts have no sub-categories, and services
          now have their own tree. Only rows nothing references are removed — a
          service created while they existed keeps working. ── */
    const promptParents = await Category.find({ kind: "prompt", parent: null }).select("_id").lean();
    const strayChildren = await Category.find({
      kind: "prompt",
      parent: { $in: promptParents.map((p) => p._id) },
    })
      .select("_id")
      .lean();

    let removedStrays = 0;
    if (strayChildren.length) {
      const strayIds = strayChildren.map((c) => c._id);
      const referenced = await Service.find({ subCategory: { $in: strayIds } })
        .select("subCategory")
        .lean();
      const inUse = new Set(referenced.map((s) => String(s.subCategory)));

      const deletable = strayIds.filter((id) => !inUse.has(String(id)));
      if (deletable.length) {
        const result = await Category.deleteMany({ _id: { $in: deletable } });
        removedStrays = result.deletedCount || 0;
      }
    }

    const [promptCategories, serviceCategories] = await Promise.all([
      Category.find({ kind: "prompt", parent: null }).sort({ name: 1 }),
      Category.find({ kind: "service", parent: null }).sort({ name: 1 }),
    ]);

    res.json({
      success: true,
      // `categories` keeps its old meaning (the prompt list) so anything that
      // called this endpoint before still reads the same field.
      categories: promptCategories,
      backfilledKind: backfill.modifiedCount || 0,
      promptCategories: promptCategories.length,
      serviceCategories: serviceCategories.length,
      serviceSubCategories: serviceSubCount,
      removedStrayPromptSubCategories: removedStrays,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "server_error" });
  }
});

module.exports = router;
