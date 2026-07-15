"use strict";

const {
  WEBSITE_BUILD_PATTERNS,
  TUTORIAL_PATTERNS,
  CURRICULUM_ONLY_PATTERNS,
  EVENT_PLANNING_PATTERNS,
  BUSINESS_BUILDING_PATTERNS,
  WELLNESS_COACHING_PATTERNS,
  LANGUAGE_APP_PATTERNS,
  COOKING_WORKSHOP_PATTERNS,
  ZERO_WASTE_PATTERNS,
  CHILDRENS_CONTENT_PATTERNS,
  MOBILE_HEALTH_PATTERNS,
  VINTAGE_RENTAL_PATTERNS,
  DEVOTIONAL_ART_PATTERNS,
  AI_VOICEOVER_PATTERNS,
  SKINCARE_BRAND_PATTERNS,
  ECOMMERCE_PATTERNS,
  GHOSTWRITING_PATTERNS,
  NUTRITION_COACHING_PATTERNS,
  CREATOR_ECONOMY_PATTERNS,
  GRANT_WRITING_PATTERNS,
  IMMIGRATION_PATTERNS,
  WEDDING_PHOTOGRAPHY_PATTERNS,
  PET_BUSINESS_PATTERNS,
  SUPPLY_CHAIN_PATTERNS,
  AI_PHOTOGRAPHY_MONETIZATION_PATTERNS,
  RENTAL_PROPERTY_INVESTMENT_PATTERNS,
  HIGH_INTENT_WORDS,
  STOP_WORDS,
  AI_CREATIVE_TOOLS,
  DOMAINS,
  SUBCATEGORIES,
  DOMAIN_CRITICAL_UNKNOWNS,
  UNIVERSAL_FALLBACK_DOMAIN,
} = require("./constants");

// Import utils directly so getDetectionResult is self-contained â
// callers do NOT need to pass these as callbacks.
const { extractConstraints, shouldSuggestDeepMode } = require("./utils");

// âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
// DOMAIN_MAP â O(1) lookup by domain id, built once at module load.
// Replaces all DOMAINS.find(d => d.id === "...") calls throughout this file.
// âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
const DOMAIN_MAP = new Map(DOMAINS.map(d => [d.id, d]));

// âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
// INTENT DETECTION FUNCTIONS
// âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
function detectEventPlanningIntent(text) {
  return EVENT_PLANNING_PATTERNS.some(p => p.test(text));
}
function detectBusinessBuildingIntent(text) {
  return BUSINESS_BUILDING_PATTERNS.some(p => p.test(text));
}
function detectWellnessCoachingIntent(text) {
  return WELLNESS_COACHING_PATTERNS.some(p => p.test(text));
}
function detectLanguageAppIntent(text) {
  return LANGUAGE_APP_PATTERNS.some(p => p.test(text));
}
function detectCookingWorkshopIntent(text) {
  return COOKING_WORKSHOP_PATTERNS.some(p => p.test(text));
}
function detectZeroWasteIntent(text) {
  return ZERO_WASTE_PATTERNS.some(p => p.test(text));
}
function detectChildrensContentIntent(text) {
  return CHILDRENS_CONTENT_PATTERNS.some(p => p.test(text));
}
function detectMobileHealthIntent(text) {
  return MOBILE_HEALTH_PATTERNS.some(p => p.test(text));
}
function detectVintageRentalIntent(text) {
  return VINTAGE_RENTAL_PATTERNS.some(p => p.test(text));
}
function detectDevotionalArtIntent(text) {
  return DEVOTIONAL_ART_PATTERNS.some(p => p.test(text));
}
function detectAIVoiceoverIntent(text) {
  return AI_VOICEOVER_PATTERNS.some(p => p.test(text));
}
function detectSkincareInstagramIntent(text) {
  return SKINCARE_BRAND_PATTERNS.some(p => p.test(text));
}
function detectEcommerceIntent(text) {
  return ECOMMERCE_PATTERNS.some(p => p.test(text));
}
function detectGhostwritingIntent(text) {
  return GHOSTWRITING_PATTERNS.some(p => p.test(text));
}
function detectNutritionCoachingIntent(text) {
  return NUTRITION_COACHING_PATTERNS.some(p => p.test(text));
}
function detectCreatorEconomyIntent(text) {
  return CREATOR_ECONOMY_PATTERNS.some(p => p.test(text));
}
function detectImmigrationIntent(text) {
  return IMMIGRATION_PATTERNS.some(p => p.test(text));
}
function detectWeddingPhotographyIntent(text) {
  return WEDDING_PHOTOGRAPHY_PATTERNS.some(p => p.test(text));
}
function detectPetBusinessIntent(text) {
  return PET_BUSINESS_PATTERNS.some(p => p.test(text));
}
function detectSupplyChainIntent(text) {
  return SUPPLY_CHAIN_PATTERNS.some(p => p.test(text));
}
function detectAIPhotographyMonetizationIntent(text) {
  return AI_PHOTOGRAPHY_MONETIZATION_PATTERNS.some(p => p.test(text));
}
function detectRentalPropertyInvestmentIntent(text) {
  return RENTAL_PROPERTY_INVESTMENT_PATTERNS.some(p => p.test(text));
}

function detectNamedTool(userText) {
  const lower = userText.toLowerCase();
  for (const [key, meta] of Object.entries(AI_CREATIVE_TOOLS)) {
    if (lower.includes(key)) return meta;
  }
  return null;
}

function detectWebsiteBuildIntent(text) {
  const hasBuild    = WEBSITE_BUILD_PATTERNS.some(p => p.test(text));
  const hasCurrOnly = CURRICULUM_ONLY_PATTERNS.some(p => p.test(text)) && !hasBuild;
  return hasBuild && !hasCurrOnly;
}

function detectTutorialIntent(text) {
  return TUTORIAL_PATTERNS.some(p => p.test(text));
}

// âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
// normalizeText â collapse Unicode quotes/apostrophes to ASCII equivalents
// so all regex patterns work regardless of input encoding (copy-paste, mobile, etc.)
// âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
function normalizeText(text) {
  return text
    .replace(/[\u2018\u2019\u201A\u201B\u02BC\u02BB\uFF07`]/g, "'")  // curly/smart single quotes â '
    .replace(/[\u201C\u201D\u201E\u201F\uFF02]/g, '"');               // curly double quotes â "
}

// âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
// detectDomain â 5-tier scoring with named tool override + expanded intent overrides
// âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
function detectDomain(text) {
  // Normalize Unicode quotes before any pattern matching
  text = normalizeText(text);
  const lower = text.toLowerCase();

  // Tier 0: Named tool detection (highest priority)
  const namedTool = detectNamedTool(text);
  if (namedTool?.id === "ai_image_gen" || namedTool?.id === "ai_video_gen") {
    const toolDomain = DOMAIN_MAP.get(namedTool.id);
    if (toolDomain) {
      return toolDomain;
    }
  }

  // Tier 1: Specific intent overrides (ordered by specificity â most specific first)

  // New specific intent patterns first (more specific than general business/health)
  // Supply chain before ecommerce to avoid false positives
  if (detectSupplyChainIntent(text)) {
    const d = DOMAIN_MAP.get("supply_chain_logistics");
    if (d) {  return d; }
  }

  // AI photography monetization (more specific than general creator economy)
  if (detectAIPhotographyMonetizationIntent(text)) {
    const d = DOMAIN_MAP.get("ai_photography_monetization") || DOMAIN_MAP.get("ai_headshot_business");
    if (d) {  return d; }
  }

  // Rental property investment (more specific than general real estate)
  if (detectRentalPropertyInvestmentIntent(text)) {
    const isPune = /\bpune\b/i.test(text);
    const domainId = isPune ? "rental_property_pune" : "real_estate";
    const d = DOMAIN_MAP.get(domainId) || DOMAIN_MAP.get("real_estate");
    if (d) {  return d; }
  }

  if (detectEcommerceIntent(text)) {
    const d = DOMAIN_MAP.get("ecommerce_store");
    if (d) {  return d; }
  }

  if (detectImmigrationIntent(text)) {
    const d = DOMAIN_MAP.get("immigration_visa");
    if (d) {  return d; }
  }

  if (detectWeddingPhotographyIntent(text)) {
    const d = DOMAIN_MAP.get("wedding_photography");
    if (d) {  return d; }
  }

  if (detectPetBusinessIntent(text)) {
    const d = DOMAIN_MAP.get("pet_care_business");
    if (d) {  return d; }
  }

  if (detectSupplyChainIntent(text)) {
    const d = DOMAIN_MAP.get("supply_chain_logistics");
    if (d) {  return d; }
  }

  if (detectNutritionCoachingIntent(text)) {
    const d = DOMAIN_MAP.get("nutrition_coaching");
    if (d) {  return d; }
  }

  if (detectGhostwritingIntent(text)) {
    const d = DOMAIN_MAP.get("ghostwriting_content");
    if (d) {  return d; }
  }

  if (detectCreatorEconomyIntent(text)) {
    const d = DOMAIN_MAP.get("creator_economy");
    if (d) {  return d; }
  }

  if (detectEventPlanningIntent(text)) {
    const eventDomain = DOMAIN_MAP.get("event_planning");
    if (eventDomain) {
      return eventDomain;
    }
  }

  // Wellness/coaching intents â PCOS/femtech has its own domain, check first
  if (/\b(pcos|hormonal\s+health|femtech|gamif\w+\s+fitness|fitness\s+app\s+for\s+women)\b/i.test(text)) {
    const d = DOMAIN_MAP.get("gamified_fitness_app");
    if (d) {  return d; }
  }

  if (detectWellnessCoachingIntent(text)) {
    // Postpartum maps to its own domain
    if (/\b(postpartum|postnatal)\b/i.test(text)) {
      const d = DOMAIN_MAP.get("postpartum_fitness_coaching");
      if (d) {  return d; }
    }
    const d = DOMAIN_MAP.get("health_wellness");
    if (d) {  return d; }
  }

  if (detectLanguageAppIntent(text)) {
    const d = DOMAIN_MAP.get("language_learning_app");
    if (d) {  return d; }
  }

  if (detectCookingWorkshopIntent(text)) {
    const d = DOMAIN_MAP.get("cooking_workshop") || DOMAIN_MAP.get("cafe_food_service");
    if (d) {  return d; }
  }

  if (detectZeroWasteIntent(text)) {
    const d = DOMAIN_MAP.get("zero_waste_store");
    if (d) {  return d; }
  }

  if (detectChildrensContentIntent(text)) {
    const d = DOMAIN_MAP.get("childrens_storybook_business");
    if (d) {  return d; }
  }

  if (detectMobileHealthIntent(text)) {
    const d = DOMAIN_MAP.get("mobile_iv_therapy") || DOMAIN_MAP.get("health_wellness");
    if (d) {  return d; }
  }

  if (detectVintageRentalIntent(text)) {
    const d = DOMAIN_MAP.get("vintage_camera_rental");
    if (d) {  return d; }
  }

  if (detectDevotionalArtIntent(text)) {
    const d = DOMAIN_MAP.get("devotional_art_business");
    if (d) {  return d; }
  }

  if (detectAIVoiceoverIntent(text)) {
    const d = DOMAIN_MAP.get("ai_voiceover_regional");
    if (d) {  return d; }
  }

  if (detectSkincareInstagramIntent(text)) {
    const d = DOMAIN_MAP.get("instagram_skincare_growth") || DOMAIN_MAP.get("social_media_branding");
    if (d) {  return d; }
  }

  if (detectBusinessBuildingIntent(text)) {
    const isTravelBusiness = /\b(travel|tour|tourism)\b/i.test(text);
    if (isTravelBusiness) {
      const targetDomain = DOMAIN_MAP.get("freelancing_consulting") ||
                           DOMAIN_MAP.get("startup_fundraising");
      if (targetDomain) {
        return targetDomain;
      }
    }
  }

  if (detectWebsiteBuildIntent(text)) {
    const hasEduContext = /\b(course|learn|teach|student|education|lms|tutorial)\b/i.test(text);
    const targetId = hasEduContext ? "edtech_product" : "product_development";
    const overrideDomain = DOMAIN_MAP.get(targetId);
    if (overrideDomain) {
      return overrideDomain;
    }
  }

  if (detectTutorialIntent(text) && !detectWebsiteBuildIntent(text)) {
    const tutDomain = DOMAIN_MAP.get("technical_tutorial");
    if (tutDomain) {
      return tutDomain;
    }
  }

  // Tier 2-4: Keyword scoring with improved phrase bonus
  const words = lower
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(w => w.length > 2 && !STOP_WORDS.has(w));

  const bigrams = [];
  for (let i = 0; i < words.length - 1; i++) {
    bigrams.push(`${words[i]} ${words[i + 1]}`);
  }
  const trigrams = [];
  for (let i = 0; i < words.length - 2; i++) {
    trigrams.push(`${words[i]} ${words[i + 1]} ${words[i + 2]}`);
  }

  let bestDomain = null;
  let bestScore  = 0;

  for (const domain of DOMAINS) {
    let score = 0;
    for (const kw of domain.keywords) {
      const isPhrase = kw.includes(" ");
      if (lower.includes(kw)) {
        score += isPhrase ? 14 : 8;
        if (HIGH_INTENT_WORDS.has(kw)) score += 5;
      } else if (!isPhrase && kw.length > 4) {
        if (words.some(t => t.startsWith(kw.slice(0, 5)))) {
          score += 2;
        }
      }
    }
    if (score > bestScore) { bestScore = score; bestDomain = domain; }
  }

  // Tier 5: Lower threshold for short but confident queries
  const wordCount = words.length;
  const threshold = wordCount <= 4 ? 8 : 5;
  return bestScore >= threshold ? bestDomain : null;
}

// âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
// getDetectionResult
// âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
/**
 * Returns detection metadata for the given text.
 *
 * CRITICAL GUARANTEE: This function NEVER returns null for non-empty input.
 * If hardcoded detection fails, it falls back to UNIVERSAL_FALLBACK_DOMAIN so
 * that Skill Mode and Deep Mode are always available â regardless of whether
 * the prompt matches a known domain.
 *
 * extractConstraintsFn and shouldSuggestDeepModeFn are OPTIONAL â the function
 * uses imported utils by default. Legacy callers that pass them still work.
 */
function getDetectionResult(text, extractConstraintsFn, shouldSuggestDeepModeFn) {
  if (!text || text.trim().length < 5) return null;

  // Normalize Unicode quotes so downstream patterns and keyword matching work cleanly
  text = normalizeText(text);

  // Use passed-in callbacks if provided (backward compat), otherwise use imports
  const _extractConstraints    = typeof extractConstraintsFn    === "function" ? extractConstraintsFn    : extractConstraints;
  const _shouldSuggestDeepMode = typeof shouldSuggestDeepModeFn === "function" ? shouldSuggestDeepModeFn : shouldSuggestDeepMode;

  // ââ Try hardcoded detection first ââââââââââââââââââââââââââââââââââââââââââ
  let domain = detectDomain(text);
  const usedFallback = !domain;

  if (!domain) {
    // Phase 2 fallback: use UNIVERSAL_FALLBACK_DOMAIN so UI can still show
    // Skill Mode and Deep Mode while async getDynamicDomain() runs server-side.
    domain = UNIVERSAL_FALLBACK_DOMAIN;
  }

  const lower = text.toLowerCase();
  const matchedKeywords = (domain.keywords || []).filter(kw => lower.includes(kw));
  const confidence = usedFallback
    ? 40  // low confidence signals to UI that this is an AI-classified domain
    : Math.min(99, Math.round(
        40 + (matchedKeywords.length / Math.max((domain.keywords || []).length, 1)) * 59
      ));

  const subcategories        = SUBCATEGORIES[domain.id] || SUBCATEGORIES["general_expert"] || [];
  const extractedConstraints = _extractConstraints(text);
  // Always suggest Deep Mode for fallback â unclassified prompts benefit most from clarifying questions
  const suggestDeepMode = usedFallback
    ? true
    : _shouldSuggestDeepMode(text, extractedConstraints);

  const categoryLabels = {
    cafe_food_service:           "Food & Hospitality",
    startup_fundraising:         "Startup & Fundraising",
    marketing_growth:            "Marketing & Growth",
    competitive_pricing:         "Strategy & Pricing",
    product_development:         "Product Development",
    edtech_product:              "EdTech Product Builder",
    technical_tutorial:          "Technical Educator",
    education_learning:          "Education & Learning",
    finance_investment:          "Finance & Investment",
    health_wellness:             "Health & Wellness",
    hr_people:                   "HR & People",
    legal_compliance:            "Legal & Compliance",
    ai_automation:               "AI & Automation",
    personal_development:        "Personal Development",
    real_estate:                 "Real Estate",
    social_media_branding:       "Social Media & Branding",
    data_science_ai:             "Data Science & AI",
    resume_career:               "Resume & Career",
    saas_product:                "SaaS & Product",
    freelancing_consulting:      "Freelancing & Consulting",
    uiux_design:                 "UI/UX Design",
    video_creation:              "Video & YouTube",
    no_code_tools:               "No-Code & Automation",
    cloud_devops:                "Cloud & DevOps",
    mobile_app_development:      "Mobile App Dev",
    cybersecurity:               "Cybersecurity",
    blockchain_web3:             "Blockchain & Web3",
    podcast_creator:             "Podcasting & Creator",
    fitness_sports:              "Fitness & Sports",
    mental_health:               "Mental Health",
    interior_architecture:       "Interior & Architecture",
    ai_image_gen:                "AI Image Generation",
    travel_planning:             "Travel Planning",
    ad_copywriting:              "Ad Copywriting",
    handmade_business:           "Handmade Business",
    notion_productivity:         "Notion & Productivity",
    youtube_shorts:              "YouTube Shorts",
    course_curriculum:           "Course Curriculum",
    linkedin_automation:         "LinkedIn & Content",
    backend_architecture:        "Backend Architecture",
    subscription_box:            "Subscription Box",
    event_planning:              "Event Planning",
    sales_copywriting:           "Sales Copywriting",
    ai_headshot_business:        "AI Headshot Business",
    gamified_fitness_app:        "FemTech & Fitness App",
    childrens_storybook_business:"Children's Content",
    rental_property_pune:        "Real Estate Investment",
    ai_photography_monetization: "AI Photography Business",
    postpartum_fitness_coaching: "Postpartum Fitness",
    cooking_workshop:            "Cooking Workshop",
    zero_waste_store:            "Zero-Waste Business",
    mobile_iv_therapy:           "Mobile Health Service",
    vintage_camera_rental:       "Vintage Rental Business",
    corporate_offsite_planning:  "Corporate Events",
    eco_holi_celebration:        "Eco Events",
    surprise_proposal:           "Event Planning",
    devotional_art_business:     "Devotional Art",
    ai_voiceover_regional:       "AI Voiceover",
    instagram_skincare_growth:   "Skincare & Beauty",
    womens_healing_programme:    "Women's Wellness",
    language_learning_app:       "Language Learning App",
    detox_mindfulness_retreat:   "Wellness Retreat",
    ecommerce_store:             "E-Commerce",
    ghostwriting_content:        "Ghostwriting & Content",
    nutrition_coaching:          "Nutrition Coaching",
    creator_economy:             "Creator Economy",
    immigration_visa:            "Immigration & Visas",
    wedding_photography:         "Photography Business",
    pet_care_business:           "Pet Care Business",
    supply_chain_logistics:      "Supply Chain & Logistics",
    general_expert:              "General",
  };

  const skillLabels = {
    cafe_food_service:           "CafÃ© Business Builder",
    startup_fundraising:         "Startup Launch Strategist",
    marketing_growth:            "Marketing Strategy Builder",
    competitive_pricing:         "Competitive Pricing Analyst",
    product_development:         "Product Development Planner",
    edtech_product:              "EdTech Product Builder",
    technical_tutorial:          "Technical Tutorial Creator",
    education_learning:          "Curriculum & Course Designer",
    finance_investment:          "Financial Strategy Advisor",
    health_wellness:             "Health & Wellness Coach",
    hr_people:                   "People & Culture Strategist",
    legal_compliance:            "Legal & Compliance Advisor",
    ai_automation:               "AI & Automation Architect",
    personal_development:        "Personal Growth Coach",
    real_estate:                 "Real Estate Strategist",
    social_media_branding:       "Social Media Brand Builder",
    data_science_ai:             "Data Science & AI Expert",
    resume_career:               "Career Growth Strategist",
    saas_product:                "SaaS Product Advisor",
    freelancing_consulting:      "Freelance Business Coach",
    uiux_design:                 "UI/UX Design Expert",
    video_creation:              "Video & YouTube Strategist",
    no_code_tools:               "No-Code Build Expert",
    cloud_devops:                "Cloud & DevOps Architect",
    mobile_app_development:      "Mobile App Strategist",
    cybersecurity:               "Cybersecurity Advisor",
    blockchain_web3:             "Web3 Product Architect",
    podcast_creator:             "Podcast Growth Strategist",
    fitness_sports:              "Sports Performance Coach",
    mental_health:               "Mental Wellness Coach",
    interior_architecture:       "Interior Design Advisor",
    ai_image_gen:                "AI Image Production Director",
    travel_planning:             "Travel Planning Expert",
    ad_copywriting:              "Ad Copywriting Expert",
    handmade_business:           "Handmade Business Strategist",
    notion_productivity:         "Notion Systems Architect",
    youtube_shorts:              "YouTube Shorts Strategist",
    course_curriculum:           "Course Curriculum Designer",
    linkedin_automation:         "LinkedIn Growth Strategist",
    backend_architecture:        "Backend Architecture Expert",
    subscription_box:            "Subscription Box Strategist",
    event_planning:              "Event Planning Expert",
    sales_copywriting:           "Sales Copywriting Expert",
    ai_headshot_business:        "AI Headshot Business Builder",
    gamified_fitness_app:        "FemTech App Strategist",
    childrens_storybook_business:"Children's Content Creator",
    rental_property_pune:        "Real Estate Investment Advisor",
    ai_photography_monetization: "AI Photography Business Builder",
    postpartum_fitness_coaching: "Postpartum Fitness Coach",
    cooking_workshop:            "Culinary Workshop Designer",
    zero_waste_store:            "Sustainable Business Strategist",
    mobile_iv_therapy:           "Mobile Health Business Builder",
    vintage_camera_rental:       "Vintage Rental Strategist",
    corporate_offsite_planning:  "Corporate Event Planner",
    eco_holi_celebration:        "Eco Event Planner",
    surprise_proposal:           "Proposal & Event Designer",
    devotional_art_business:     "Devotional Art Business Builder",
    ai_voiceover_regional:       "AI Voiceover Business Strategist",
    instagram_skincare_growth:   "Skincare Brand Growth Expert",
    womens_healing_programme:    "Women's Wellness Programme Designer",
    language_learning_app:       "Language App Product Builder",
    detox_mindfulness_retreat:   "Wellness Retreat Designer",
    ecommerce_store:             "E-Commerce Growth Strategist",
    ghostwriting_content:        "Ghostwriting Business Expert",
    nutrition_coaching:          "Nutrition Coach Business Builder",
    creator_economy:             "Creator Monetisation Strategist",
    immigration_visa:            "Immigration Pathway Advisor",
    wedding_photography:         "Photography Business Coach",
    pet_care_business:           "Pet Business Strategist",
    supply_chain_logistics:      "Supply Chain Optimisation Expert",
    general_expert:              "SmartGen Expert",
  };

  return {
    domainId:            domain.id,
    categoryLabel:       categoryLabels[domain.id] || "General",
    skillLabel:          skillLabels[domain.id]    || "SmartGen Expert",
    confidence,
    subcategories,
    matchedKeywords,
    extractedConstraints,
    suggestDeepMode,
  };
}

module.exports = {
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
};