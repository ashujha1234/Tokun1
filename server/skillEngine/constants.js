"use strict";

// âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
// CONSTANTS â main index
// Re-exports all constants from split files, keeping a single import surface
// for all consumers (detection.js, utils.js, promptbuilder.js, questions.js, etc.)
// âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ

const patterns       = require("./patterns");
const domains        = require("./domains");
const questionsConst = require("./questions.constants");

// âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
// REQUIRED SECTIONS
// âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
const REQUIRED_SECTIONS = [
  "Your Expert Role",
  "What You're Here to Do",
  "Your Core Focus Areas",
  "How to Approach This",
  "Key Numbers & Benchmarks",
  "What to Deliver",
  "Ground Rules",
  "What Good Looks Like",
  "Your Next 3 Actions",
];

const REQUIRED_SECTIONS_BASE = [
  "Your Expert Role",
  "What You're Here to Do",
  "Your Core Focus Areas",
  "How to Approach This",
  "Key Numbers & Benchmarks",
  "What to Deliver",
  "Ground Rules",
  "What Good Looks Like",
];

const REQUIRED_SECTIONS_DEEP_ONLY = [
  "Your Next 3 Actions",
];

// âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
// RE-EXPORT EVERYTHING â single import point for all consumers
// âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
module.exports = {
  // ââ from patterns.js ââââââââââââââââââââââââââââââââââââââââââââââââââââââ
  // Pattern arrays
  WEBSITE_BUILD_PATTERNS:              patterns.WEBSITE_BUILD_PATTERNS,
  TUTORIAL_PATTERNS:                   patterns.TUTORIAL_PATTERNS,
  CURRICULUM_ONLY_PATTERNS:            patterns.CURRICULUM_ONLY_PATTERNS,
  EVENT_PLANNING_PATTERNS:             patterns.EVENT_PLANNING_PATTERNS,
  BUSINESS_BUILDING_PATTERNS:          patterns.BUSINESS_BUILDING_PATTERNS,
  WELLNESS_COACHING_PATTERNS:          patterns.WELLNESS_COACHING_PATTERNS,
  LANGUAGE_APP_PATTERNS:               patterns.LANGUAGE_APP_PATTERNS,
  COOKING_WORKSHOP_PATTERNS:           patterns.COOKING_WORKSHOP_PATTERNS,
  ZERO_WASTE_PATTERNS:                 patterns.ZERO_WASTE_PATTERNS,
  CHILDRENS_CONTENT_PATTERNS:          patterns.CHILDRENS_CONTENT_PATTERNS,
  MOBILE_HEALTH_PATTERNS:              patterns.MOBILE_HEALTH_PATTERNS,
  VINTAGE_RENTAL_PATTERNS:             patterns.VINTAGE_RENTAL_PATTERNS,
  DEVOTIONAL_ART_PATTERNS:             patterns.DEVOTIONAL_ART_PATTERNS,
  AI_VOICEOVER_PATTERNS:               patterns.AI_VOICEOVER_PATTERNS,
  SKINCARE_BRAND_PATTERNS:             patterns.SKINCARE_BRAND_PATTERNS,
  ECOMMERCE_PATTERNS:                  patterns.ECOMMERCE_PATTERNS,
  GHOSTWRITING_PATTERNS:               patterns.GHOSTWRITING_PATTERNS,
  NUTRITION_COACHING_PATTERNS:         patterns.NUTRITION_COACHING_PATTERNS,
  CREATOR_ECONOMY_PATTERNS:            patterns.CREATOR_ECONOMY_PATTERNS,
  GRANT_WRITING_PATTERNS:              patterns.GRANT_WRITING_PATTERNS,
  IMMIGRATION_PATTERNS:                patterns.IMMIGRATION_PATTERNS,
  WEDDING_PHOTOGRAPHY_PATTERNS:        patterns.WEDDING_PHOTOGRAPHY_PATTERNS,
  PET_BUSINESS_PATTERNS:               patterns.PET_BUSINESS_PATTERNS,
  SUPPLY_CHAIN_PATTERNS:               patterns.SUPPLY_CHAIN_PATTERNS,
  AI_PHOTOGRAPHY_MONETIZATION_PATTERNS: patterns.AI_PHOTOGRAPHY_MONETIZATION_PATTERNS,
  RENTAL_PROPERTY_INVESTMENT_PATTERNS: patterns.RENTAL_PROPERTY_INVESTMENT_PATTERNS,
  AUDIENCE_PATTERNS:                   patterns.AUDIENCE_PATTERNS,
  // Sets
  HIGH_INTENT_WORDS:                   patterns.HIGH_INTENT_WORDS,
  STOP_WORDS:                          patterns.STOP_WORDS,
  KNOWN_LOCATIONS:                     patterns.KNOWN_LOCATIONS,
  // Tool map
  AI_CREATIVE_TOOLS:                   patterns.AI_CREATIVE_TOOLS,

  // ââ from domains.js âââââââââââââââââââââââââââââââââââââââââââââââââââââââ
  DOMAIN_CRITICAL_UNKNOWNS:            domains.DOMAIN_CRITICAL_UNKNOWNS,
  DOMAINS:                             domains.DOMAINS,
  UNIVERSAL_FALLBACK_DOMAIN:           domains.UNIVERSAL_FALLBACK_DOMAIN,

  // ââ from questions.constants.js âââââââââââââââââââââââââââââââââââââââââââ
  SUBCATEGORIES:                       questionsConst.SUBCATEGORIES,
  DEEP_QUESTIONS:                      questionsConst.DEEP_QUESTIONS,

  // ââ defined here ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
  REQUIRED_SECTIONS,
  REQUIRED_SECTIONS_BASE,
  REQUIRED_SECTIONS_DEEP_ONLY,
};