// services/freelancerCatalog.service.js
//
// Gets the Skill and Specialization catalogs into the database.
//
// Seeded lazily on first use rather than from a migration or an admin-triggered
// endpoint. The autocomplete is the first thing a freelancer touches in the
// wizard, and a skill search that quietly returns nothing on a fresh
// environment looks like a broken feature rather than an un-run setup step.
//
// The work is idempotent (upsert by slug, never delete) and guarded by a
// module-level promise, so concurrent first requests trigger exactly one pass
// and every later request pays nothing.

const Skill = require("../models/Skill");
const Specialization = require("../models/Specialization");
const { SKILLS, SPECIALIZATIONS } = require("../constants/freelancerCatalog");

const slugifySpecialization = (name) =>
  String(name)
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

async function seedSkills() {
  const ops = SKILLS.map((entry) => {
    const aliases = (entry.aliases || []).map((a) => a.toLowerCase());
    const slug = Skill.slugify(entry.name);

    return {
      updateOne: {
        filter: { slug },
        update: {
          // Curated metadata is refreshed on every pass so editing
          // constants/freelancerCatalog.js is enough to fix a typo or add an
          // alias — no migration needed.
          $set: {
            name: entry.name,
            group: entry.group || "Other",
            aliases,
            searchText: Skill.buildSearchText(entry.name, aliases),
            curated: true,
          },
          // usageCount belongs to live data, so it is only initialised, never
          // overwritten — a re-seed must not reset how popular a skill is.
          $setOnInsert: { slug, usageCount: 0 },
        },
        upsert: true,
      },
    };
  });

  if (ops.length) await Skill.bulkWrite(ops, { ordered: false });
}

async function seedSpecializations() {
  const ops = SPECIALIZATIONS.map((entry) => {
    const slug = slugifySpecialization(entry.name);
    return {
      updateOne: {
        filter: { slug },
        update: {
          $set: {
            name: entry.name,
            description: entry.description || "",
            group: entry.group || "Other",
            sortOrder: entry.sortOrder ?? 100,
            active: true,
          },
          $setOnInsert: { slug },
        },
        upsert: true,
      },
    };
  });

  if (ops.length) await Specialization.bulkWrite(ops, { ordered: false });
}

let seedPromise = null;

// Call before reading either catalog. Safe to call on every request.
function ensureCatalogSeeded() {
  if (!seedPromise) {
    seedPromise = (async () => {
      // Cheap check first. Seeding is ~210 upserts across two bulkWrites, and
      // it used to run on the first request after every restart even when the
      // database was already fully populated — so one unlucky user paid for it
      // each deploy. Two countDocuments answer "is there anything to do?" in a
      // single round trip each.
      const [skillCount, specCount] = await Promise.all([
        Skill.estimatedDocumentCount(),
        Specialization.estimatedDocumentCount(),
      ]);

      // Compared against the constants rather than "> 0", so a catalog that was
      // seeded before entries were added still tops itself up.
      if (skillCount >= SKILLS.length && specCount >= SPECIALIZATIONS.length) return;

      await Promise.all([seedSkills(), seedSpecializations()]);
    })().catch((err) => {
      // Cleared so the next request retries. A seeding failure must not
      // permanently poison the catalog for the life of the process — the
      // usual cause is the database not being connected yet.
      seedPromise = null;
      console.error("[freelancerCatalog] seed failed:", err?.message || err);
      throw err;
    });
  }
  return seedPromise;
}

// Express wrapper: seeds, but never fails the request over it. A search that
// runs against a partially-seeded catalog returns fewer rows; a search that
// 500s because seeding hiccuped is strictly worse.
async function withCatalog(req, res, next) {
  try {
    await ensureCatalogSeeded();
  } catch {
    /* handled and logged in ensureCatalogSeeded */
  }
  next();
}

module.exports = { ensureCatalogSeeded, withCatalog, slugifySpecialization };
