"use strict";

/**
 * skillEngine/index.js â MAIN EXPORT FILE
 *
 * Split structure:
 *   constants.js      â All static data (DOMAINS, SUBCATEGORIES, DEEP_QUESTIONS, patterns, sets)
 *   detection.js      â Domain & intent detection logic
 *   utils.js          â Helper utilities (extractConstraints, shouldSuggestDeepMode, etc.)
 *   questions.js      â Deep mode question generation (static lookups)
 *   promptBuilder.js  â Builds the final AI prompts (Skill Mode, Deep Mode, Normal Mode)
 *   dynamicDomain.js  â AI-powered domain fallback, caching, LLM question generation
 *   skillEngine.js    â THIS FILE: re-exports everything for backward-compatible imports
 */

// ââ Constants âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
const {
  DOMAINS,
  SUBCATEGORIES,
  DEEP_QUESTIONS,
  DOMAIN_CRITICAL_UNKNOWNS,
  REQUIRED_SECTIONS,
  REQUIRED_SECTIONS_BASE,
  REQUIRED_SECTIONS_DEEP_ONLY,
  // Patterns (exported for testing / custom use)
  WEBSITE_BUILD_PATTERNS,
  TUTORIAL_PATTERNS,
  EVENT_PLANNING_PATTERNS,
  HIGH_INTENT_WORDS,
  STOP_WORDS,
  KNOWN_LOCATIONS,
  AI_CREATIVE_TOOLS,
  UNIVERSAL_FALLBACK_DOMAIN,
} = require("./constants");

// ââ Detection âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
const {
  detectDomain,
  detectNamedTool,
  detectWebsiteBuildIntent,
  detectTutorialIntent,
  detectEventPlanningIntent,
  detectBusinessBuildingIntent,
  detectWellnessCoachingIntent,
  detectLanguageAppIntent,
  detectCookingWorkshopIntent,
  detectZeroWasteIntent,
  detectChildrensContentIntent,
  detectMobileHealthIntent,
  detectVintageRentalIntent,
  detectDevotionalArtIntent,
  detectAIVoiceoverIntent,
  detectSkincareInstagramIntent,
  detectEcommerceIntent,
  detectGhostwritingIntent,
  detectNutritionCoachingIntent,
  detectCreatorEconomyIntent,
  detectImmigrationIntent,
  detectWeddingPhotographyIntent,
  detectPetBusinessIntent,
  detectSupplyChainIntent,
  detectAIPhotographyMonetizationIntent,
  detectRentalPropertyInvestmentIntent,
  getDetectionResult,
} = require("./detection");

// ââ Utils (single source for perf logging too) ââââââââââââââââââââââââââââââââ
const {
  extractConstraints,
  shouldSuggestDeepMode,
  detectLocation,
  detectAudience,
  detectBudget,
  detectTimeline,
  detectTeamSize,
  validatePromptSections,
  estimateTokenCount,
  truncateToTokenLimit,
  titleCase,
  formatConstraintSummary,
  perfStart,
  perfEnd,
} = require("./utils");

// ââ Questions (static) ââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
const {
  getDeepQuestions: getDeepQuestionsStatic,
  getAllDeepQuestionsForDomain,
  renderQuestionsAsText,
  mergeAnswers,
  getUnansweredQuestions,
} = require("./questions");

// ââ Prompt Builder ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
const {
  buildEnrichedSystemPrompt,
  buildDetailedSystemPrompt,
  validateDetailedOutput,
  buildRetryPrompt,
/* Lowercase b, matching the file on disk — skillEngine/promptbuilder.js.
   It read "./promptBuilder" and worked anyway on every machine this was
   developed on, because macOS and Windows resolve requires case-insensitively.
   Linux does not, so the first CI run on ubuntu could not find the module and
   took routes/smartgenDetectRoutes.js down with it. */
} = require("./promptbuilder");

// ââ Dynamic Domain (AI-powered) âââââââââââââââââââââââââââââââââââââââââââââââ
const {
  getDynamicDomain,
  getCachedDomain,
  cacheDomain,
  generateDynamicSubcategories,
  generateDynamicCriticalUnknowns,
  generateQuestionsWithLLM,
  getDeepQuestions,      // async, DB-cached version
  shouldSkipQuestions,
} = require("./dynamicDomain");

// âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
// EXPORTS â backward-compatible with all existing server imports
// âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
module.exports = {
  // ââ Detection
  detectDomain,
  detectNamedTool,
  detectWebsiteBuildIntent,
  detectTutorialIntent,
  detectEventPlanningIntent,
  detectBusinessBuildingIntent,
  detectWellnessCoachingIntent,
  detectLanguageAppIntent,
  detectCookingWorkshopIntent,
  detectZeroWasteIntent,
  detectChildrensContentIntent,
  detectMobileHealthIntent,
  detectVintageRentalIntent,
  detectDevotionalArtIntent,
  detectAIVoiceoverIntent,
  detectSkincareInstagramIntent,
  detectEcommerceIntent,
  detectGhostwritingIntent,
  detectNutritionCoachingIntent,
  detectCreatorEconomyIntent,
  detectImmigrationIntent,
  detectWeddingPhotographyIntent,
  detectPetBusinessIntent,
  detectSupplyChainIntent,
  detectAIPhotographyMonetizationIntent,
  detectRentalPropertyInvestmentIntent,
  getDetectionResult,

  // ââ Utilities
  extractConstraints,
  shouldSuggestDeepMode,
  detectLocation,
  detectAudience,
  detectBudget,
  detectTimeline,
  detectTeamSize,
  validatePromptSections,
  estimateTokenCount,
  truncateToTokenLimit,
  titleCase,
  formatConstraintSummary,

  // ââ Questions
  getDeepQuestions,            // async (DB-cached, LLM-powered) â primary
  getDeepQuestionsStatic,      // sync (static lookup only) â lightweight fallback
  getAllDeepQuestionsForDomain,
  renderQuestionsAsText,
  mergeAnswers,
  getUnansweredQuestions,
  shouldSkipQuestions,

  // ââ Prompt building
  buildEnrichedSystemPrompt,
  buildDetailedSystemPrompt,   // legacy alias
  validateDetailedOutput,
  buildRetryPrompt,

  // ââ Dynamic / AI-powered
  getDynamicDomain,
  getCachedDomain,
  cacheDomain,
  generateDynamicSubcategories,
  generateDynamicCriticalUnknowns,
  generateQuestionsWithLLM,

  // ââ Static data
  DOMAINS,
  SUBCATEGORIES,
  DEEP_QUESTIONS,
  DOMAIN_CRITICAL_UNKNOWNS,
  REQUIRED_SECTIONS,
  REQUIRED_SECTIONS_BASE,
  REQUIRED_SECTIONS_DEEP_ONLY,
  UNIVERSAL_FALLBACK_DOMAIN,
  AI_CREATIVE_TOOLS,

  // ââ Performance utilities
  perfStart,
  perfEnd,
};