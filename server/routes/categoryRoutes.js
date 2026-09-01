// routes/categoryRoutes.js
//
// One collection, two trees — see models/Category.js. `kind` picks the tree:
//   "prompt"  (default) — what a prompt is about. Two levels.
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
const { SERVICE_CATEGORIES } = require("../constants/serviceCategories");
const { requireAuth } = require("../utils/auth");

function requireAdmin(req, res, next) {
  if (!req.isAdmin) {
    return res.status(403).json({ success: false, error: "forbidden" });
  }
  next();
}

/* Gated per route: the two GETs stay open because the marketplace, the prompt
   library and the Sell modal all read them before login (see sellerPrefetch.ts,
   which fetches with no headers at all). The two writes below were open too —
   anyone could add rows to the taxonomy every one of those dropdowns renders,
   and /seed-defaults could re-run the bulk seed against live data. */

/* The prompt tree, now two levels like the service tree.
 *
 * It was a flat list of strings — the model even said so ("Flat: prompts have
 * never used sub-categories") — which meant a marketplace with 23 top-level
 * buckets and no way to narrow "Coding" down to what you actually wanted.
 *
 * Names are matched exactly on upsert, so the lowercase `devotion` and
 * `apparel` below are deliberate: those rows already exist in the database
 * spelled that way, and capitalising them here would create a second, empty
 * copy of each rather than attaching children to the real one. `Anime` is here
 * for the same reason — all three were added directly to the database and were
 * never in this list.
 */
const DEFAULT_CATEGORIES = [
  { name: "Coding", children: ["Web Development", "Mobile Apps", "Debugging & Fixes", "Code Review", "APIs & Backend", "DevOps & Scripts", "Testing & QA", "Refactoring", "Game Development", "Browser Extensions", "Algorithms & Data Structures", "Documentation"] },

  /* Design owns everything about how a thing LOOKS — on a screen, on paper, or
     in a room. "Interior Design" and "Architecture & Exteriors" belong here for
     that reason, and putting them here is also what retires the stray top-level
     `interior` / `Interior` / `Interior Design` rows: seeding alone won't move
     them (see scripts/reparent-stray-categories.js, which does). */
  { name: "Design", children: ["Logo & Branding", "Illustration", "Product Mockups", "Presentations", "Print & Packaging", "Interior Design", "Architecture & Exteriors", "3D & CGI", "Motion Graphics", "Typography", "Icons & Iconography", "Poster & Album Art", "Colour & Palettes", "Moodboards"] },

  { name: "UI/UX", children: ["Wireframes", "Design Systems", "User Flows", "Landing Pages", "Mobile UI", "Dashboards", "Prototyping", "Onboarding Flows", "Accessibility", "Microcopy", "Usability Testing"] },
  { name: "Writing", children: ["Blog Posts", "Copywriting", "Storytelling", "Scripts", "Editing & Proofreading", "Technical Writing", "Resumes & Cover Letters", "Poetry", "Translation", "Summarising", "Ghostwriting", "Speeches"] },
  { name: "Marketing", children: ["Ad Copy", "SEO", "Email Campaigns", "Product Launches", "Brand Strategy", "Landing Page Copy", "Performance Marketing", "Positioning & Messaging", "Case Studies", "Influencer Briefs", "Growth Experiments", "Analytics & Attribution"] },
  { name: "Content", children: ["Video Scripts", "Podcasts", "Newsletters", "Captions", "Content Calendars", "Blog Outlines", "Titles & Thumbnails", "Repurposing", "Webinars", "Interviews"] },
  { name: "Social Media", children: ["Instagram", "LinkedIn", "X (Twitter)", "YouTube", "Reels & Shorts", "TikTok", "Facebook", "Pinterest", "Threads", "Community Management", "Hashtags & Trends"] },
  { name: "Business", children: ["Business Plans", "Pitch Decks", "Market Research", "Operations", "Legal & Contracts", "SOPs", "Investor Updates", "Competitive Analysis", "Pricing Strategy", "Partnerships", "Fundraising"] },
  { name: "Creative", children: ["Art Concepts", "Music & Audio", "Photography", "Character Design", "World Building", "Comics & Storyboards", "Lyrics & Poetry", "Film & Cinematography", "Sound Design", "Game Narrative"] },
  { name: "Education", children: ["Lesson Plans", "Study Guides", "Quizzes & Tests", "Explainers", "Course Outlines", "Flashcards", "Curriculum Design", "Assignment Feedback", "Language Learning", "Exam Prep"] },
  { name: "Finance", children: ["Budgeting", "Investing", "Accounting", "Financial Models", "Taxes", "Personal Finance", "Crypto & Web3", "Insurance", "Payroll", "Invoicing"] },
  { name: "Productivity", children: ["Task Management", "Meeting Notes", "Automation", "Planning", "Summarisation", "Email Drafting", "Note Taking", "Goal Setting", "Decision Making", "Time Blocking"] },
  { name: "Health", children: ["Fitness Plans", "Nutrition", "Mental Wellness", "Medical Explainers", "Habit Building", "Yoga & Mobility", "Sleep", "Meal Prep & Recipes", "Recovery & Injury", "Mindfulness"] },
  { name: "Sales", children: ["Cold Outreach", "Sales Scripts", "Follow-ups", "Proposals", "Negotiation", "Lead Qualification", "Demos & Pitches", "Objection Handling", "Account Plans", "CRM Hygiene"] },
  { name: "HR", children: ["Job Descriptions", "Interview Questions", "Onboarding", "Performance Reviews", "Policies", "Recruiting Outreach", "Culture & Values", "Compensation", "Learning & Development", "Exit Interviews"] },
  { name: "Travel", children: ["Itineraries", "Destination Guides", "Budget Travel", "Packing Lists", "Local Food", "Visa & Documents", "Solo Travel", "Family Trips", "Travel Writing", "Transport & Routes"] },
  { name: "Research", children: ["Literature Review", "Data Analysis", "Surveys", "Citations", "Hypothesis Generation", "Interview Guides", "Competitive Research", "Fact Checking", "Grant Writing", "Systematic Reviews"] },
  { name: "Data", children: ["SQL Queries", "Data Cleaning", "Visualisation", "Reporting", "Machine Learning", "Dashboards & BI", "Spreadsheets & Excel", "Statistics", "ETL Pipelines", "A/B Testing", "Data Modelling"] },
  { name: "Support", children: ["Help Articles", "Chat Replies", "Troubleshooting", "FAQs", "Escalation", "Macros & Templates", "Billing & Refund Replies", "Tone & Empathy", "Knowledge Base", "Post-mortems"] },
  { name: "Enterprise", children: ["Internal Comms", "Compliance", "Training Material", "Process Docs", "Vendor Management", "RFPs & Tenders", "Security Reviews", "Change Management", "Board Reporting", "SLA & Contracts"] },
  { name: "devotion", children: ["Prayers", "Devotional Poetry", "Festival Content", "Scripture Explainers", "Meditation", "Bhajans & Aarti", "Rituals & Puja", "Spiritual Guidance", "Mantras"] },
  { name: "apparel", children: ["Product Descriptions", "Fashion Design", "Size & Fit Guides", "Lookbooks", "Trend Reports", "Streetwear", "Ethnic Wear", "Textile & Print Design", "Catalogue Copy", "Sustainable Fashion"] },
  { name: "Anime", children: ["Character Art", "Manga Panels", "Fan Fiction", "Anime Backgrounds", "Cosplay", "Chibi & Stickers", "Anime Posters", "Studio Styles", "Story Prompts"] },

  /* ── New top-level buckets ───────────────────────────────────────────────
     Added because sellers were filing this work under whichever of the 23
     existing headings was least wrong — a product render under "Design", an
     agent system prompt under "Coding", a listing description under "Writing" —
     which is invisible to a buyer browsing by category. Each of these had
     enough of that misfiled work to be worth its own heading. */
  { name: "AI & Automation", children: ["System Prompts", "Agent Prompts", "Chatbots", "Workflow Automation", "RAG & Knowledge Bases", "Model Evaluation", "Fine-tuning Data", "Prompt Chaining"] },
  { name: "Video & Film", children: ["Video Ads", "Explainer Videos", "Trailers", "Shorts & Reels", "Storyboards", "B-roll & Shot Lists", "Subtitles & Captions", "Colour Grading Briefs"] },
  { name: "3D & AR/VR", children: ["3D Modelling", "Product Renders", "Game Assets", "Character Rigging", "AR Filters", "VR Environments", "Texturing & Materials"] },
  { name: "Photography", children: ["Portraits", "Product Photography", "Editing & Retouching", "Lighting Setups", "Photo Prompts", "Event Photography", "Real Estate Photography"] },
  { name: "Real Estate", children: ["Listing Descriptions", "Virtual Staging", "Property Marketing", "Investment Analysis", "Tenant Communication", "Site & Floor Plans"] },
  { name: "E-commerce", children: ["Product Listings", "Marketplace SEO", "Store Design", "Reviews & UGC", "Abandoned Cart", "Bundling & Upsells", "Returns & Policies"] },
  { name: "Food & Beverage", children: ["Recipes", "Menu Design", "Restaurant Marketing", "Food Photography", "Nutrition Labels", "Beverage & Cocktails", "Cloud Kitchen"] },
  { name: "Events & Weddings", children: ["Invitations", "Event Planning", "Wedding Content", "Speeches & Toasts", "Decor Concepts", "Vendor Briefs", "Run Sheets"] },
  { name: "Legal", children: ["Contracts", "Privacy & Terms", "IP & Trademarks", "Compliance Checklists", "Legal Summaries", "Notices & Letters", "Employment Law"] },
  { name: "Gaming", children: ["Game Design", "Level Design", "Game Lore", "Quest & Dialogue", "Esports Content", "Stream Overlays", "Patch Notes"] },
  { name: "Music & Audio", children: ["Lyrics", "Song Concepts", "Voiceover Scripts", "Podcast Editing", "Sound Effects", "Mixing & Mastering Briefs", "Jingles"] },
  { name: "Sustainability", children: ["ESG Reporting", "Green Marketing", "Carbon Accounting", "Circular Design", "Impact Reports"] },
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
router.post("/", requireAuth, requireAdmin, async (req, res) => {
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

    /* Scoped to (kind, parent) to match the index — a global name check would
       reject "Business" in the service tree because the prompt tree has one.

       Case-INSENSITIVE, which it wasn't: the live prompt tree has both
       "interior" and "Interior" as separate top-level categories, plus an
       "Interior Design" beside them, because each was typed with different
       capitalisation and this check let them all through. Products then split
       across near-identical categories that no filter can reunite. */
    const exists = await Category.findOne({
      kind,
      parent: parent || null,
      name: new RegExp(`^${String(name).trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i"),
    });
    if (exists) {
      return res.status(400).json({
        success: false,
        error: "category_exists",
        message: `"${exists.name}" already exists here.`,
      });
    }

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
 * Idempotent. Seeds both trees, each two levels deep, using upserts only —
 * re-running never duplicates a row, never overwrites a hand-edited name, and
 * (since the stray-child sweep was removed) never deletes anything.
 */
router.post("/seed-defaults", requireAuth, requireAdmin, async (req, res) => {
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

    /* ── prompt tree ──
       Two levels now. Upserts throughout, so re-running this never duplicates a
       row and never overwrites a category someone renamed or edited by hand. */
    let promptSubCount = 0;
    for (const { name, children } of DEFAULT_CATEGORIES) {
      await Category.updateOne(
        { kind: "prompt", parent: null, name },
        { $setOnInsert: { name, kind: "prompt", parent: null } },
        { upsert: true }
      );

      const parentRow = await Category.findOne({ kind: "prompt", parent: null, name }).select("_id");
      if (!parentRow) continue;

      for (const childName of children || []) {
        await Category.updateOne(
          { kind: "prompt", parent: parentRow._id, name: childName },
          { $setOnInsert: { name: childName, kind: "prompt", parent: parentRow._id } },
          { upsert: true }
        );
        promptSubCount += 1;
      }
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

    /* A block here used to DELETE every child under a prompt category.
       It was written when prompts were deliberately flat — an earlier seed had
       put service-shaped children ("Web Development" under Coding) into the
       prompt tree by mistake, and this swept them out on every run.

       Prompts now have their own two-level tree on purpose, so that sweep would
       delete the sub-categories seeded thirty lines above it — the whole feature
       would appear to do nothing, which is exactly why the prompt tree had zero
       children in the database. Removed rather than narrowed: there is no longer
       any such thing as a stray child of a prompt category. */

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
      promptSubCategories: promptSubCount,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "server_error" });
  }
});

module.exports = router;
