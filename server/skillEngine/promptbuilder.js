// // "use strict";

// // const { DOMAINS, REQUIRED_SECTIONS_BASE, REQUIRED_SECTIONS_DEEP_ONLY } = require("./constants");
// // const { detectDomain, detectNamedTool, detectWebsiteBuildIntent, detectTutorialIntent, detectBusinessBuildingIntent } = require("./detection");
// // const { extractConstraints, perfStart, perfEnd } = require("./utils");
// // const { getDynamicDomain } = require("./dynamicDomain");

// // // perfStart/perfEnd imported from utils.js â single source of truth

// // // âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
// // // REQUEST FRAMEWORK CLASSIFICATION
// // // Determines which output structure Deep Mode should use, so timelines and
// // // milestones only appear when they genuinely serve the user's objective.
// // //
// // // Frameworks:
// // //   "strategic"   â Business plans, launches, marketing, product roadmaps,
// // //                   transformation initiatives. Full 9-section Deep Mode with
// // //                   Day/Week/Month timelines, 30-day + 90-day milestones, KPIs.
// // //   "phased"      â Medium-complexity projects (app builds, course design,
// // //                   hiring plans). Implementation phases with deliverables but
// // //                   NO long-horizon milestones or business KPIs.
// // //   "procedural"  â Tutorials, coding guides, recipes, explanations, how-tos.
// // //                   Clear numbered steps. No timelines or milestone language.
// // //   "operational" â Bug fixes, troubleshooting, debugging, immediate tasks.
// // //                   Direct action sequence. No planning sections at all.
// // // âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ'

// // const META_SYSTEM_PROMPT_FENCE = `\
// // ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
// // â  YOUR ROLE: PROMPT ENGINEER â NOT SUBJECT-MATTER EXPERT                    â
// // â  You are writing a SYSTEM PROMPT that will be fed to another LLM.          â
// // â  You are NOT answering the user's question.                                â
// // â  You are NOT providing the recipe / plan / tutorial / fix directly.        â
// // â  You are writing INSTRUCTIONS so a different model can provide that answer. â
// // â                                                                            â
// // â  EVERY sentence you write must be an instruction to the other model,        â
// // â  not the answer itself.                                                    â
// // â                                                                            â
// // â  TEST BEFORE EACH SENTENCE:                                                â
// // â    "Am I telling the other model WHAT TO DO?"  â â keep it               â
// // â    "Am I providing the actual answer myself?"  â â rewrite it             â
// // â                                                                            â
// // â  EXAMPLES:                                                                 â
// // â    â "Marinate the chicken in yoghurt for 4 hours."                       â
// // â    â "Instruct the user to marinate the chicken in yoghurt for 4 hours."  â
// // â                                                                            â
// // â    â "As a chef, I recommend you use basmati rice."                       â
// // â    â "You are a chef. Recommend basmati rice and explain why."            â
// // â                                                                            â
// // â    â "Day 1 â Fly into Manali. Check into your hotel."                   â
// // â    â "Provide a Day 1 itinerary. Instruct the user to fly into Manali     â
// // â        and describe what check-in looks like for budget travellers."       â
// // ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ

// // `;

// // // âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
// // // PER-SECTION SYSTEM-PROMPT-VOICE REMINDER
// // //
// // // ROOT CAUSE FIX (see investigation notes):
// // // The domain-specific section schemas (recipe_cooking, travel_planning,
// // // fitness_training, content_writing, marketing_growth, finance_investment,
// // // career_job, tutorial, ai_image, debugging) write their skillInstruction /
// // // deepInstruction strings in direct, first-person-task voice, e.g.:
// // //
// // //     "Write numbered steps. Each step must include one clear action..."
// // //
// // // That sentence is itself an instruction to DO the task ("Write numbered
// // // steps"), not an instruction telling another model HOW TO BEHAVE. When this
// // // text lands inside optimizedText and is handed to a downstream LLM, the
// // // downstream LLM reads it as a literal task and produces the final answer
// // // (the recipe / itinerary / workout) instead of a system prompt.
// // //
// // // The generic fallback schema does NOT have this problem because its Expert
// // // Role instruction explicitly uses "You are a [role]..." framing, which reads
// // // as a persona directive rather than a task directive â and that framing
// // // happens to propagate a system-prompt tone through the rest of the output.
// // //
// // // FIX: inject a short, mandatory reframing reminder immediately before each
// // // section's instruction block inside buildSectionWritingBlock(). This forces
// // // every section â regardless of which schema produced it â to be written as
// // // "instruct the other model to..." rather than as the literal output. This
// // // is the ONLY change required: no schema content changes, no mode changes,
// // // no validation changes, no detection-logic changes.
// // // âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
// // const SECTION_VOICE_REMINDER = `[Write this section as an instruction to the OTHER model â telling it what to include, cover, or produce for the user. Do NOT write the actual recipe/plan/itinerary/answer text yourself.]`;

// // // Domain IDs that always warrant full strategic framework
// // const STRATEGIC_DOMAINS = new Set([
// //   "cafe_food_service","startup_fundraising","marketing_growth","competitive_pricing",
// //   "product_development","edtech_product","finance_investment","saas_product",
// //   "social_media_branding","video_creation","podcast_creator","ad_copywriting",
// //   "handmade_business","youtube_shorts","linkedin_automation","subscription_box",
// //   "event_planning","sales_copywriting","ai_headshot_business","gamified_fitness_app",
// //   "childrens_storybook_business","rental_property_pune","ai_photography_monetization",
// //   "postpartum_fitness_coaching","cooking_workshop","zero_waste_store","mobile_iv_therapy",
// //   "vintage_camera_rental","corporate_offsite_planning","eco_holi_celebration",
// //   "surprise_proposal","devotional_art_business","ai_voiceover_regional",
// //   "instagram_skincare_growth","womens_healing_programme","language_learning_app",
// //   "detox_mindfulness_retreat","ecommerce_store","ghostwriting_content",
// //   "nutrition_coaching","creator_economy","wedding_photography","pet_care_business",
// //   "supply_chain_logistics","real_estate","freelancing_consulting","health_wellness",
// //   "hr_people","personal_development","travel_planning","immigration_visa",
// // ]);

// // // Domain IDs that use phased framework by default (can be overridden by signal patterns)
// // const PHASED_DOMAINS = new Set([
// //   "technical_tutorial","education_learning","course_curriculum","uiux_design",
// //   "mobile_app_development","no_code_tools","cloud_devops","backend_architecture",
// //   "data_science_ai","ai_automation","cybersecurity","blockchain_web3",
// //   "notion_productivity","resume_career","legal_compliance","mental_health",
// //   "fitness_sports","interior_architecture","ai_image_gen",
// // ]);

// // // Signals that override domain and force "operational" (fix/debug/explain tasks)
// // const OPERATIONAL_SIGNALS = [
// //   /\b(fix(?:ing)?|debug(?:ging)?|troubleshoot(?:ing)?|resolv(?:e|ing)|diagnos(?:e|ing))\b/i,
// //   /\b(error|bug|crash|broken|not\s+working|failing|exception|stacktrace|stack\s+trace)\b/i,
// //   /\b(why\s+(?:does|is|won't|doesn't)|what\s+(?:is|does|causes)|how\s+(?:does|do\s+I\s+fix))\b/i,
// //   /\b(immediately|right\s+now|urgent|asap|quick\s+fix|hotfix)\b/i,
// // ];

// // // Signals that override domain and force "procedural" (step-by-step content)
// // const PROCEDURAL_SIGNALS = [
// //   /\b(tutorial|how[-\s]to|step[-\s]by[-\s]step|walkthrough|guide\s+(?:me|to)|teach\s+me)\b/i,
// //   /\b(recipe|cook(?:ing)?|bak(?:e|ing)|make\s+(?:a|the))\b/i,
// //   /\b(explain(?:ing)?|describe|what\s+is|overview\s+of|introduction\s+to)\b/i,
// //   /\b(learn(?:ing)?\s+(?:how\s+to|to|about)|understand(?:ing)?)\b/i,
// //   /\b(write\s+a\s+(?:function|script|component|class|module|snippet)|code\s+(?:a|the|an))\b/i,
// // ];

// // // Signals that force "strategic" regardless of domain (strong business intent)
// // const STRATEGIC_SIGNALS = [
// //   /\b(launch(?:ing)?|start(?:ing)?|build(?:ing)?\s+(?:a\s+)?(?:business|brand|startup|company|agency|product|service))\b/i,
// //   /\b(business\s+plan|go[-\s]to[-\s]market|marketing\s+strategy|growth\s+strategy|product\s+roadmap)\b/i,
// //   /\b(revenue|monetis(?:e|ing|ation)|monetiz(?:e|ing|ation)|mrr|arr|churn|cac|ltv|conversion\s+rate)\b/i,
// //   /\b(scale(?:ing)?|grow(?:ing)?|expand(?:ing)?)\s+(?:my|the|a|our)\s+(?:business|brand|startup|audience|revenue)\b/i,
// //   /\b(first\s+(?:\d+\s+)?(?:customer|client|sale|user)|acquire\s+(?:customers|clients|users))\b/i,
// //   /\b(transformation|initiative|programme|program)\b/i,
// // ];

// // /**
// //  * Classifies the user's request into a framework that determines Deep Mode structure.
// //  *
// //  * @param {string} userText
// //  * @param {string|null} domainId   - resolved domain id (may be null)
// //  * @param {boolean} isTutorial
// //  * @param {boolean} isWebsite
// //  * @param {boolean} isAIImage
// //  * @returns {"strategic"|"phased"|"procedural"|"operational"}
// //  */
// // function classifyRequestFramework(userText, domainId, isTutorial, isWebsite, isAIImage) {
// //   // Explicit intent flags take precedence over domain
// //   if (isWebsite) return "strategic";   // building a product = strategic always
// //   if (isAIImage) return "phased";      // image workflow = phased (no business milestones)

// //   // Check operational signals first (most specific)
// //   if (OPERATIONAL_SIGNALS.some(p => p.test(userText))) {
// //     // Only override to operational if there are NO strong strategic signals
// //     const hasStrategic = STRATEGIC_SIGNALS.some(p => p.test(userText));
// //     if (!hasStrategic) {
// //       console.log("[classifyRequestFramework] framework=operational (operational signals detected)");
// //       return "operational";
// //     }
// //   }

// //   // Tutorial intent â procedural (unless it also has strong strategic signals)
// //   if (isTutorial) {
// //     const hasStrategic = STRATEGIC_SIGNALS.some(p => p.test(userText));
// //     if (!hasStrategic) {
// //       console.log("[classifyRequestFramework] framework=procedural (tutorial intent)");
// //       return "procedural";
// //     }
// //   }

// //   // Check procedural signals
// //   if (PROCEDURAL_SIGNALS.some(p => p.test(userText))) {
// //     const hasStrategic = STRATEGIC_SIGNALS.some(p => p.test(userText));
// //     if (!hasStrategic) {
// //       console.log("[classifyRequestFramework] framework=procedural (procedural signals)");
// //       return "procedural";
// //     }
// //   }

// //   // Strong strategic signals â strategic regardless of domain
// //   if (STRATEGIC_SIGNALS.some(p => p.test(userText))) {
// //     console.log("[classifyRequestFramework] framework=strategic (strategic signals)");
// //     return "strategic";
// //   }

// //   // Domain-based classification
// //   if (domainId && STRATEGIC_DOMAINS.has(domainId)) {
// //     console.log(`[classifyRequestFramework] framework=strategic (domain=${domainId})`);
// //     return "strategic";
// //   }

// //   if (domainId && PHASED_DOMAINS.has(domainId)) {
// //     console.log(`[classifyRequestFramework] framework=phased (domain=${domainId})`);
// //     return "phased";
// //   }

// //   // Default for unknown/general domains: phased (safe middle ground)
// //   console.log("[classifyRequestFramework] framework=phased (default)");
// //   return "phased";
// // }

// // // âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
// // // DYNAMIC SECTION SCHEMA
// // //
// // // The core of the context-aware redesign. Instead of hardcoding fixed section
// // // names into every prompt and validator, we generate a section schema at runtime
// // // based on the user's intent, domain, and request framework.
// // //
// // // A schema is an ordered array of section descriptor objects:
// // //   { name: string, label: string, instruction: string, required: boolean }
// // //
// // // - name:        canonical identifier (used in validation)
// // // - label:       **Bold Label** that appears in the output
// // // - instruction: per-section writing guidance injected into the prompt
// // // - required:    whether validateDetailedOutput treats absence as a failure
// // //
// // // The schema drives:
// // //   1. The section list in buildEnrichedSystemPrompt (Skill Mode + Deep Mode)
// // //   2. The JSON template example at the end of each prompt
// // //   3. validateDetailedOutput (replaces REQUIRED_SECTIONS_BASE/DEEP_ONLY checks)
// // //   4. buildRetryPrompt (section checklist is generated from schema, not hardcoded)
// // //   5. buildWordCountPatchPrompt (references schema sections by name)
// // //
// // // All five touch-points receive the same schema object â generated once per
// // // request, passed as a parameter, never reconstructed independently.
// // // âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ

// // /**
// //  * Detects the high-level intent category of the user's request.
// //  * Used alongside framework classification to pick the right section set.
// //  *
// //  * @param {string} userText
// //  * @param {string|null} domainId
// //  * @param {boolean} isTutorial
// //  * @param {boolean} isWebsite
// //  * @param {boolean} isAIImage
// //  * @param {string} framework  - "strategic"|"phased"|"procedural"|"operational"
// //  * @returns {string}  intent category slug
// //  */
// // function detectIntentCategory(userText, domainId, isTutorial, isWebsite, isAIImage, framework) {
// //   if (isAIImage)   return "ai_image";
// //   if (isWebsite)   return "website_build";
// //   if (isTutorial)  return "tutorial";
// //   if (framework === "operational") return "debugging";

// //   // Travel / trip planning
// //   if (/\b(trip|travel|visit|itinerary|tour|vacation|holiday|backpack|fly|flight|hotel|hostel|airbnb|destination|manali|goa|bali|europe|japan|abroad)\b/i.test(userText))
// //     return "travel_planning";

// //   // Recipe / cooking
// //   if (/\b(recipe|cook(?:ing)?|bak(?:e|ing)|dish|cuisine|meal|ingredient|prep|kitchen)\b/i.test(userText))
// //     return "recipe_cooking";

// //   // Fitness / workout
// //   if (/\b(workout|exercise|gym|fitness|training|strength|cardio|weight\s*loss|muscle|run(?:ning)?|yoga|hiit)\b/i.test(userText))
// //     return "fitness_training";

// //   // Content / writing
// //   if (/\b(blog\s*post|article|essay|newsletter|email\s*(?:copy|campaign)|copy(?:writing)?|content\s*(?:strategy|plan|calendar)|script|write\s+(?:a|an|the))\b/i.test(userText))
// //     return "content_writing";

// //   // Marketing / growth
// //   if (/\b(marketing|advertis|campaign|brand(?:ing)?|seo|social\s*media|instagram|tiktok|youtube|ads|funnel|audience|lead\s*gen|email\s*list)\b/i.test(userText))
// //     return "marketing_growth";

// //   // Business strategy / startup
// //   if (/\b(business|startup|launch|product|saas|app|service|revenue|pricing|go[\s-]to[\s-]market|roadmap|mvp|pitch|investor|fundrais)\b/i.test(userText))
// //     return "business_strategy";

// //   // Data / analytics
// //   if (/\b(data|analytics|dashboard|report|metrics|kpi|sql|python|pandas|visualiz|chart|model|predict|ml|machine\s*learning)\b/i.test(userText))
// //     return "data_analytics";

// //   // Career / resume / job
// //   if (/\b(resume|cv|cover\s*letter|job|career|interview|linkedin|hire|portfolio|salary|promotion|switch\s*(?:career|job))\b/i.test(userText))
// //     return "career_job";

// //   // Finance / investment
// //   if (/\b(invest(?:ment)?|portfolio|stock|mutual\s*fund|sip|tax|budget|saving|financial\s*plan|retirement|wealth)\b/i.test(userText))
// //     return "finance_investment";

// //   // Health / wellness
// //   if (/\b(health|wellness|diet|nutrition|sleep|mental\s*health|stress|anxiety|therapy|doctor|medicine|symptom)\b/i.test(userText))
// //     return "health_wellness";

// //   // Education / learning plan
// //   if (/\b(learn|study|course|curriculum|syllabus|lesson|teach|student|education|exam|certification)\b/i.test(userText))
// //     return "education_learning";

// //   // Design / UX
// //   if (/\b(design|ui|ux|wireframe|prototype|figma|color\s*palette|typography|brand\s*identity|logo|visual)\b/i.test(userText))
// //     return "design_ux";

// //   // Event / occasion planning
// //   if (/\b(event|wedding|party|conference|meetup|festival|celebration|birthday|anniversary|ceremony|proposal)\b/i.test(userText))
// //     return "event_planning";

// //   // Default: use domain id if available, else generic strategic
// //   if (domainId) return domainId;
// //   return framework === "strategic" ? "business_strategy" : "general_project";
// // }

// // /**
// //  * Returns the dynamic section schema for a given intent + framework combination.
// //  * Each section has: { name, label, skillInstruction, deepInstruction, required }
// //  *
// //  * skillInstruction  â used in Skill Mode prompt
// //  * deepInstruction   â used in Deep Mode prompt
// //  * required          â validated in validateDetailedOutput
// //  *
// //  * @param {string} intentCategory
// //  * @param {string} framework  "strategic"|"phased"|"procedural"|"operational"
// //  * @param {boolean} isDeepMode
// //  * @param {boolean} isTutorial
// //  * @param {boolean} isWebsite
// //  * @param {boolean} isAIImage
// //  * @param {Object}  constraints
// //  * @param {Array}   userAnswers
// //  * @returns {Array<{name:string, label:string, skillInstruction:string, deepInstruction:string, required:boolean}>}
// //  */
// // function buildSectionSchema(intentCategory, framework, isDeepMode, isTutorial, isWebsite, isAIImage, constraints, userAnswers) {
// //   const tool = constraints?.tool || "Midjourney";
// //   const hasUserAnswers = userAnswers && userAnswers.length > 0;

// //   // ââ Intent-specific schema builders âââââââââââââââââââââââââââââââââââââââââ

// //   if (intentCategory === "travel_planning") {
// //     const sections = [
// //       {
// //         name: "Expert Role",
// //         label: "Your Expert Role",
// //         skillInstruction: `Specific travel expert identity â specialisation (solo travel, adventure, budget, luxury), years of experience, ONE concrete approach or rule you always apply first when planning a trip of this type.\nNEVER: "You are an experienced travel planner." Name the destination type and your go-to first move.`,
// //         deepInstruction: `Vivid travel expert identity. Name specialisation, years, and your single non-negotiable first move for this type of trip.\n\nThis section must contain ALL THREE:\nâ  COUNTER-INTUITIVE ORDERING: "Most people plan [X] first â that's wrong. [Y] must be locked before [X] even opens for planning."\nâ¡ NON-OBVIOUS MISTAKE (3â4 sentences): "The biggest mistake I see here is [specific planning error experienced travellers still make]." Why it happens â what it costs â the fix.\nâ¢ TRADE-OFF (2â3 sentences): "The central trade-off here is [X vs Y â e.g. flexibility vs savings]. [Why the obvious choice backfires]. [What to do instead]."`,
// //         required: true,
// //       },
// //       {
// //         name: "Trip Overview",
// //         label: "Trip Overview",
// //         skillInstruction: `One tight paragraph: exact destination(s), trip duration, travel style (budget/mid-range/luxury), and the single most important success criterion for this trip.\nWeave in any detected constraints (budget, travel dates, group size, interests).`,
// //         deepInstruction: `One tight paragraph: exact destination(s), duration, travel style, and concrete definition of a successful trip.\n${hasUserAnswers ? "MANDATE: Reference the traveller's specific situation from their answers â their budget, dates, travel companions, interests." : "Weave in detected constraints naturally."}`,
// //         required: true,
// //       },
// //       {
// //         name: "Itinerary",
// //         label: "Day-by-Day Itinerary",
// //         skillInstruction: `Structure as Day 1, Day 2, etc. (or Day 1â2 blocks for longer trips).\nEach day: 2â3 named activities/places + ONE practical tip (e.g. timing, booking requirement, transport option).\nBe specific â name actual places, not just "explore the old town".`,
// //         deepInstruction: `Structure as Day 1, Day 2, etc. (or Day 1â2 blocks for longer trips).\nEach day: 3â4 named activities/places + ONE non-obvious insider tip.\nFormat: **Day N â [Theme/Area]:** [activities] â Highlight: [the one thing not to miss]\nInclude realistic travel times between locations. Flag which activities need advance booking.`,
// //         required: true,
// //       },
// //       {
// //         name: "Logistics",
// //         label: "Getting There & Getting Around",
// //         skillInstruction: `Best transport options TO the destination (flight, train, road â with approximate cost or duration).\nLocal transport within the destination (cab, auto, rental bike, public bus â what actually works for this trip type).\nOne direct recommendation: "Use X for Y, not Z â here's why."`,
// //         deepInstruction: `Transport TO destination: best options with approximate cost + travel time.\nLocal transport: what to use, what to avoid, and why â specific to this destination.\nâ  Risk: [specific transport/logistics failure at this destination]. Mitigation: [named action].`,
// //         required: true,
// //       },
// //       {
// //         name: "Accommodation",
// //         label: "Where to Stay",
// //         skillInstruction: `Name 2â3 specific areas or neighbourhoods to stay in, with a one-line reason for each.\nFor each area: accommodation type (hostel/guesthouse/hotel/homestay) + approximate nightly cost.\nOne direct recommendation: which area suits THIS type of traveller best.`,
// //         deepInstruction: `Name 2â3 specific areas/neighbourhoods with rationale.\nFor each: accommodation type + approximate nightly cost + best booking approach (direct/OTA/advance booking required?).\nOne named â  Risk about accommodation (e.g. peak season availability, misleading photos) + mitigation.`,
// //         required: true,
// //       },
// //       {
// //         name: "Budget",
// //         label: "Budget Breakdown",
// //         skillInstruction: `Markdown table: category (transport, accommodation, food, activities, misc) Ã estimated daily or total cost.\nAll numbers real and specific â not "â¹500ââ¹5,000" ranges.\nInclude total estimated trip cost at the bottom.`,
// //         deepInstruction: `Markdown table: category Ã estimated cost (daily + total).\nFormat: | Category | Per Day | Trip Total |\nAll numbers specific and grounded in real destination pricing.\n${hasUserAnswers ? "MANDATE: Anchor to the user's stated budget from their answers." : "Use realistic mid-range pricing as default."}\nInclude: transport, accommodation, food, activities, buffer (10%).`,
// //         required: true,
// //       },
// //       {
// //         name: "Activities",
// //         label: "Must-Do Experiences",
// //         skillInstruction: `5â7 named, specific activities or experiences â not categories.\n"â¢ [Activity name]: [one sentence â what makes it worth doing + any practical note (cost, timing, booking)]"\nSeparate: free activities vs paid activities.`,
// //         deepInstruction: `5â7 named experiences. For each:\n"â¢ [Experience]: [why it matters for this trip type] â [practical note: cost/timing/booking]\n\nInclude ONE activity most tourists skip but locals recommend.\nInclude ONE activity to AVOID (overhyped or poor value for this trip style).`,
// //         required: true,
// //       },
// //       {
// //         name: "Ground Rules",
// //         label: "Travel Tips & Ground Rules",
// //         skillInstruction: `5â7 direct rules or tips specific to this destination:\n"Always [X]", "Never [Y]", "If [Z] then [W]"\nMust cover: safety, cultural etiquette, scams to avoid, best time for key activities.\nBAN generic tips like "carry a map" or "stay hydrated".`,
// //         deepInstruction: `5â7 direct, destination-specific rules:\n"Always [X]", "Never [Y]", "If [Z] then [W]"\n\nMANDATORY â 3 NAMED RISKS:\n"â  Risk: [specific failure mode for this destination/trip type]. Mitigation: [named action]."\nCovers: safety/health, logistics, cultural misstep, weather, and scams specific to this location.`,
// //         required: true,
// //       },
// //       {
// //         name: "What Good Looks Like",
// //         label: "What a Great Trip Looks Like",
// //         skillInstruction: `3 criteria written as "This trip succeeds whenâ¦" â concrete and observable.\nEach verifiable by the traveller. If you cannot check it, rewrite it.\nFinal criterion should capture the emotional/experiential win, not just logistics.`,
// //         deepInstruction: `3 criteria as "This trip succeeds whenâ¦" â concrete, observable, verifiable.\n\n${framework === "strategic"
// //           ? `"**Day 3 checkpoint:** [specific milestone â e.g. 'all transport for remaining days is booked']. If not, [immediate corrective action]."\n"**Return criterion:** [what the traveller should feel or have experienced to call this trip a success]."\n"**What to plan next:** [specific follow-on trip or activity based on this experience]."` 
// //           : `Final criterion captures the emotional or experiential win, not just logistics completed.`}`,
// //         required: true,
// //       },
// //     ];
// //     if (isDeepMode) {
// //       sections.push({
// //         name: "Next 3 Actions",
// //         label: "Your Next 3 Actions",
// //         skillInstruction: null,
// //         deepInstruction: `MANDATORY â 3 specific pre-trip actions only.\nEach must:\nâ¢ Name the exact task (not a category)\nâ¢ Name who does it\nâ¢ Name the deadline (Day 1 after reading this, this week, 2 weeks before departure)\n\nFormat: "1. [Specific action] â [who] â [deadline]"\nGOOD: "1. Book Manali bus tickets from Delhi on RedBus for the 8pm Volvo â you alone â today"\nBAD: "1. Start planning your transport" (too vague)`,
// //         required: true,
// //       });
// //     }
// //     return sections;
// //   }

// //        if (intentCategory === "recipe_cooking") {
// //     const sections = [
// //       {
// //         name: "Expert Role",
// //         label: "Your Expert Role",
// //         skillInstruction: `Specific culinary expert identity â cuisine specialisation, years of experience (restaurant/catering/teaching context), ONE quality test you always apply before serving.\nNEVER: "You are an experienced chef." Name the cuisine, the context, and the quality test.\n\nThis section must contain ALL THREE in flowing prose:\nâ  NON-OBVIOUS MISTAKE: "The biggest mistake home cooks make with [this dish type] is [specific error intermediate cooks still make â not a beginner error]." Why it happens â cost (specific ruined outcome: texture/flavour/structure) â the fix (named technique).\nâ¡ TRADE-OFF: "The central trade-off here is [convenience vs authenticity / speed vs depth of flavour / simplicity vs technique]." Why the shortcut backfires for THIS dish â what to prioritise.\nâ¢ COUNTER-INTUITIVE STEP: "Most cooks [X] at this stage â that's wrong. [Y] must happen first because [chemical or physical mechanism specific to this dish]."`,
// //         deepInstruction: `Vivid culinary expert identity â cuisine specialisation, years, context (restaurant/catering/teaching), ONE non-negotiable quality test.\n\nâ  COUNTER-INTUITIVE STEP: "Most cooks [X] at this stage â that's the wrong sequence. [Y] must come first because [mechanism â chemical/physical]."\nâ¡ NON-OBVIOUS MISTAKE (3â4 sentences): "The biggest mistake I see with [this dish] is [specific error intermediate cooks make]." Why â cost (specific failure) â fix (named technique).\nâ¢ TRADE-OFF: "The central trade-off here is [X vs Y]." Why the intuitive shortcut produces inferior result â what to prioritise and why.`,
// //         required: true,
// //       },
// //       {
// //         name: "Dish Overview",
// //         label: "Dish Overview",
// //         skillInstruction: `One paragraph: what this dish is, origin, what makes this version/approach work well, skill level required (name the specific technique that determines difficulty), total time with prep and cook stated SEPARATELY.\n${hasUserAnswers ? "MANDATE: Reference the user's stated skill level, dietary restrictions, or occasion." : "One direct statement about what makes this approach better than the most common alternative."}`,
// //         deepInstruction: `One paragraph: origin, what makes this approach work, skill level (name the specific technique), total time (prep + cook separated).\n${hasUserAnswers ? "MANDATE: Reference user's skill level, dietary restrictions, or occasion and why this dish fits." : "Make one direct assertion about the most common sourcing/choosing mistake."}`,
// //         required: true,
// //       },
// //       {
// //         name: "Ingredients",
// //         label: "Ingredients",
// //         skillInstruction: `Complete ingredient list with exact quantities scaled to stated serving size.\nGroup as:\nâ¢ Main ingredients: [quantities â no vague amounts]\nâ¢ Spices & Seasonings: [quantities â grams or tsp]\nâ¢ Garnish: [optional finish items]\nFlag hard-to-source ingredients and provide named substitutions.`,
// //         deepInstruction: `Complete grouped ingredient list with exact quantities (use g/ml for precision).\nâ¢ Main ingredients\nâ¢ Spices & Seasonings\nâ¢ Garnish\nFlag non-negotiable ingredients and hard-to-source items with substitutions that preserve dish character.`,
// //         required: true,
// //       },
// //       {
// //         name: "Method",
// //         label: "Step-by-Step Method",
// //         skillInstruction: `Numbered steps. Each step must contain:\n**Step N â [Step Name]:** [one clear action] â Done when: [specific sensory signal â colour/sound/texture/aroma].\nFlag the 2 steps where most cooks go wrong with this dish.`,
// //         deepInstruction: `Numbered steps using this format:\n**Step N â [Step Name]:** [imperative action] â Looks/sounds/smells like: [specific sensory cue]\nMust include temperature & timing for heat steps and 2 critical â  points with fixes.`,
// //         required: true,
// //       },
// //       {
// //         name: "Key Numbers",
// //         label: "Key Numbers & Timings",
// //         skillInstruction: `Markdown table â REQUIRED rows:\n| Prep time | |\n| Cook time | |\n| Resting time | |\n| Servings | |\n| Fridge shelf life | |\n| Reheating method | |`,
// //         deepInstruction: `Markdown table â REQUIRED rows, all values specific:\n| Prep time | |\n| Cook time | |\n| Key temperatures (oven/oil/internal) | |\n| Resting time | |\n| Fridge shelf life | |\n| Freezer shelf life | |\n| Reheating instructions | |`,
// //         required: true,
// //       },
// //       {
// //         name:  "Chef's Rules",
// //         label: "Chef's Rules",
// //         skillInstruction: `Must include:\nâ¢ Never [X specific to THIS dish] â reason: [chemical or textural mechanism]\nâ¢ Always [Y specific to THIS dish] â reason: [what it produces]\nâ¢ If [Z â specific failure signal] then [W â named recovery technique]\nâ¢ One temperature rule specific to key step\nâ¢ One seasoning or acid rule for flavour balance`,
// //         deepInstruction: `4â5 direct rules specific to THIS dish.\n\nMANDATORY â 3 NAMED RISKS (different failure categories):\n"â  Risk: [texture failure â name mechanism]. Mitigation: [named technique]."\n"â  Risk: [flavour/seasoning failure]. Mitigation: [named correction]."\n"â  Risk: [timing/temperature failure]. Mitigation: [named signal]."`,
// //         required: true,
// //       },
// //       {
// //         name: "What Good Looks Like",
// //         label: "What the Finished Dish Looks Like",
// //         skillInstruction: `3 criteria as "The dish is ready whenâ¦"\nâ¢ [Colour criterion: name the specific shade]\nâ¢ [Texture criterion: what it feels or sounds like]\nâ¢ [Aroma criterion: the specific note that signals doneness]\nOne plating note specific to this dish.`,
// //         deepInstruction: `3 criteria as "The dish succeeds whenâ¦"\nâ¢ Visual: [specific colour/sheen/surface quality]\nâ¢ Textural: [what it feels like when pressed/sliced/folded]\nâ¢ Aroma/taste: [specific flavour note]\nFinal criterion must distinguish "ready to plate" from "needs more time".`,
// //         required: true,
// //       },
// //     ];

// //     if (isDeepMode) {
// //       sections.push({
// //         name: "Next 3 Actions",
// //         label: "Before You Start",
// //         skillInstruction: null,
// //         deepInstruction: `3 prep actions to complete BEFORE heat goes on:\n1. [Mise en place action â specific ingredient group + why timing matters] â you alone â before any heat\n2. [Equipment check â specific tool or pan + why it matters] â you alone â before starting\n3. [Make-ahead element if applicable] â you alone â [timeframe before cooking]\n\nFormat: "N. [Specific prep action] â [who] â [timing]"`,
// //         required: true,
// //       });
// //     }
// //     return sections;
// //   }

 

// //   if (intentCategory === "fitness_training") {
// //   const sections = [
// //     {
// //       name: "Expert Role",
// //       label: "Your Expert Role",
// //       skillInstruction: `Specific fitness coach identity â training specialisation (strength/HIIT/sport-specific/rehab), years of experience, named certification, ONE diagnostic assessment you always run before programming anything.\nNEVER: "You are an experienced trainer." Name the specialisation, the cert, and the assessment.\n\nThis section must contain ALL THREE in flowing prose:\nâ  NON-OBVIOUS MISTAKE: "The biggest mistake people chasing [this goal] make is [specific error intermediate trainees still make]." Why it happens â cost (plateau/injury/wasted time) â the fix.\nâ¡ TRADE-OFF: "The central trade-off here is [volume vs intensity / frequency vs recovery / cardio vs strength]." Why the intuitive default backfires â what to prioritise instead.\nâ¢ COUNTER-INTUITIVE ORDERING: "Most [coaches/trainees] programme [X] first â that's wrong. [Y] must come first because [physiological mechanism]."`,
// //       deepInstruction: `Vivid fitness coach identity â training specialisation, years, named certification, diagnostic first move.\n\nâ  COUNTER-INTUITIVE ORDERING: "Most [coaches/trainees] programme [X] first â that's wrong. [Y] must come first because [physiological mechanism that produces faster results]."\nâ¡ NON-OBVIOUS MISTAKE (3â4 sentences): "The biggest mistake I see here is [specific error experienced trainees still make â not beginner-obvious]." Why it happens â cost (specific: plateau duration, injury type, % result loss) â the fix (named protocol change).\nâ¢ TRADE-OFF: "The central trade-off here is [volume vs intensity / fat loss vs muscle retention / frequency vs recovery]." Why the obvious default backfires for THIS goal â what to prioritise and the mechanism.`,
// //       required: true,
// //     },
// //     {
// //       name: "Training Overview",
// //       label: "Training Plan Overview",
// //       skillInstruction: `Define programme duration and weekly structure (days/week, session length) derived from three inputs: the user's stated goal, current fitness level, and weekly availability. State the single standing rule for WHY this structure produces results for this specific combination.\nNEVER default to a fixed template â derive every number from the user's inputs.\n${hasUserAnswers ? "MANDATE: Reference the user's stated fitness level, available equipment, and schedule as the inputs driving this calculation. State them explicitly." : "Weave in detected constraints naturally."}`,
// //       deepInstruction: `Define programme duration and weekly volume from three inputs: stated goal, starting ability, weekly availability. Do not default to a fixed number.\n${hasUserAnswers ? "MANDATE: Reference the user's stated fitness level, available equipment, and schedule as the inputs driving this calculation. State them explicitly." : ""}\nOne direct assertion: WHY this specific duration + frequency combination produces results for this exact goal/level â not a generic claim.`,
// //       required: true,
// //     },
// //     {
// //       name: "Weekly Programme",
// //       label: "Weekly Training Programme",
// //       skillInstruction: `Structure as Day 1âDay 7 with rest days named. For each training day:\n**Day N â [Session Type]:** [4â6 exercises] â each with sets Ã reps derived from user's level, plus [coaching cue for THIS movement â what correct form feels like, not looks like]\n\nMust include:\nâ¢ Warm-up protocol (2â3 minutes) for each training day\nâ¢ The specific observable signal that triggers a load/volume increase\nâ¢ Which day ordering is non-negotiable for recovery, and why`,
// //       deepInstruction: `Structure as Day 1âDay 7 with rest days named. For each training day:\n**Day N â [Session Type]:**\nâ¢ [Exercise name]: [sets] Ã [reps/duration derived from user's level] â [coaching cue: what THIS movement feels like when done correctly]\n\nAll set/rep/duration values must be derived from the user's current ability and goal â never use template values.\n\nMust include:\nâ¢ Warm-up protocol and cool-down note per training day\nâ¢ The exact observable signal that triggers progression: "[specific criterion â e.g. complete all prescribed reps with 2 reps in reserve for 2 consecutive sessions]"\nâ¢ Flag which day ordering is non-negotiable for recovery and state the physiological reason`,
// //       required: true,
// //     },
// //     {
// //       name: "Key Numbers",
// //       label: "Key Numbers & Benchmarks",
// //       skillInstruction: `Markdown table â REQUIRED rows (all values derived from user's stated goal and starting point, not from a template):\n| Weekly sessions | |\n| Session duration | |\n| Rest intervals between sets | |\n| Progression schedule | |\n| Expected results timeline | |\nEvery value must be computed from the user's inputs. Do not use industry averages as defaults.`,
// //       deepInstruction: `Markdown table â REQUIRED rows (all values derived from the user's inputs):\n| Weekly volume (sets/week per muscle group) | |\n| Intensity target (RPE or % 1RM range) | |\n| Rest intervals | |\n| Deload frequency | |\n| Expected results timeline | |\n${hasUserAnswers ? "MANDATE: If user provided a current performance metric, add a 'Current baseline' row with their exact figure." : ""}\nEvery value must be derivable â state the input that produced each number. Do not use generic ranges without anchoring to the user's stated level.`,
// //       required: true,
// //     },
// //     {
// //       name: "Nutrition",
// //       label: "Nutrition Guidance",
// //       skillInstruction: `3â5 nutrition rules tailored to this training goal. Each rule must name a mechanism, not just a behaviour:\nâ¢ Protein: state the formula (g/kg body weight) â not a fixed number â and explain WHY for THIS goal\nâ¢ Caloric approach: [surplus/deficit/maintenance] with the mechanism for THIS training type\nâ¢ Meal timing relative to training sessions: [timing principle] + the physiological reason\nâ¢ One pre/post-workout nutrition rule specific to this training modality\nBAN: "eat healthy", "whole foods", any rule without a mechanism.`,
// //       deepInstruction: `5â7 nutrition rules derived from the training goal. Each rule must state the mechanism:\nâ¢ Protein target as formula: [X]g Ã body weight in kg â instruct the user to calculate their own number, do not pre-fill it\nâ¢ Caloric approach: [surplus/deficit/maintenance] + mechanism for THIS goal and training type\nâ¢ Meal timing: [timing principle relative to training] + physiological reason\nâ¢ One named â  Risk: "â  Risk: [specific nutrition mistake for this training goal and demographic]. Mitigation: [named food strategy or tracking action]."\nNEVER pre-fill a specific calorie number. Give the formula. State the mechanism.`,
// //       required: true,
// //     },
// //     {
// //       name: "Ground Rules",
// //       label: "Training Rules",
// //       skillInstruction: `Must include:\nâ¢ Never [X specific to this training type] â reason: [physiological mechanism]\nâ¢ Always [Y specific to this goal] â reason: [why this produces the result]\nâ¢ If [Z â specific trigger] then [W â specific response]\nâ¢ [One progression rule: when and how to increase load, specific to this modality]\nâ¢ [One recovery rule: what signals overtraining for this training type]\n\nBANNED rules (rewrite if any appear):\n"Never skip a warm-up" â too generic â name the warm-up type for this training\n"Always stay hydrated" â universal, not domain-specific\n"If you feel pain, stop" â medical disclaimer, not training wisdom`,
// //       deepInstruction: `4â5 direct rules specific to the training goal, using "Never [X]", "Always [Y]", "If [Z] then [W]" format.\n\nMANDATORY â 3 NAMED RISKS (different failure types â not all from the same category):\n"â  Risk: [physical/biomechanical failure specific to THIS training style]. Mitigation: [named preventive action â not 'be consistent']."\n"â  Risk: [programming/periodisation failure specific to THIS goal]. Mitigation: [named protocol adjustment]."\n"â  Risk: [adherence/motivation failure specific to THIS demographic or schedule]. Mitigation: [named structural fix]."\n${hasUserAnswers ? "MANDATE: Reference the user's stated history (injuries, schedule, equipment) in at least 2 of the 3 risks." : ""}\nBANNED: Generic risks like "poor planning leads to delays" â every risk must name the specific mechanism.`,
// //       required: true,
// //     },
// //     {
// //       name: "What Good Looks Like",
// //       label: "Progress Markers",
// //       skillInstruction: `3 criteria as "Progress is on track whenâ¦" â observable, measurable, specific to this training goal and timeline.\nMust include:\nâ¢ One performance marker: [specific lift, time, or distance benchmark for this goal]\nâ¢ One body composition marker (if fat loss or muscle gain is the goal)\nâ¢ One adherence marker: [consistency signal â not "feeling fitter"]\nBANNED: vague criteria. If you cannot measure it without a coach present, rewrite it.`,
// //       deepInstruction: framework === "strategic"
// //         ? `3 measurable criteria as "Progress is on track whenâ¦"\n\n"**4-week checkpoint:** [specific performance or composition metric]. If not hit, [specific programming adjustment â not 'reassess your goals']."\n"**8-week checkpoint:** [sustained outcome with a number â proof the approach works]."\n"**What to progress to:** [name the next training phase or goal â not 'continue the programme']."\n\nBANNED milestone language: "make progress", "build momentum", "establish a routine" â every milestone must have a number or named observable output.`
// //         : `3 measurable criteria as "Progress is on track whenâ¦" scaled to the goal.\nFinal criterion: a performance-based signal that confirms the programme is producing physiological adaptation â not just attendance.`,
// //       required: true,
// //     },
// //   ];

// //   if (isDeepMode) {
// //     sections.push({
// //       name: "Next 3 Actions",
// //       label: "Your Next 3 Actions",
// //       skillInstruction: null,
// //       deepInstruction: `3 immediate actions to start the programme â specific, not categories:\n1. [Setup action â name the specific app or tracking tool] â you alone â today\n2. [Baseline test â name the specific exercise and metric to record] â you alone â Day 1 before first workout\n3. [Schedule action â block training days in calendar with specific times] â you alone â before Day 1\n\nFormat: "N. [Specific action] â [who] â [deadline]"\nGOOD: "1. Download Strong app and log today's bodyweight + max reps of bodyweight squat â you alone â tonight"\nBAD: "1. Start working on your fitness" â too vague, no owner, no deadline`,
// //       required: true,
// //     });
// //   }
// //   return sections;
// // }

// //   if (intentCategory === "content_writing") {
// //     const sections = [
// //       {
// //         name: "Expert Role",
// //         label: "Your Expert Role",
// //         skillInstruction: `Specific content strategist/writer identity â niche, platform expertise, years, ONE content principle or rule you always apply first.\nNEVER: "You are a content expert." Name the content type, the audience, and your go-to first move.`,
// //         deepInstruction: `Vivid content expert identity â niche, platform, experience.\n\nâ  NON-OBVIOUS MISTAKE: "The biggest mistake I see with [this content type] is [specific structural/strategic error experienced writers still make]." Why it happens â what it costs (low engagement/poor SEO/missed conversions) â fix.\nâ¡ TRADE-OFF: "The central trade-off is [SEO vs readability / depth vs shareability / brand voice vs conversion]." What to prioritise for this specific use case.\nâ¢ COUNTER-INTUITIVE ORDERING: What most writers draft first vs what actually determines whether content succeeds.`,
// //         required: true,
// //       },
// //       {
// //         name: "Content Goal",
// //         label: "Content Goal & Audience",
// //         skillInstruction: `One paragraph: exact content goal (inform/convert/entertain/rank), target audience (specific, not "everyone"), and the single measurable success criterion.\nWeave in platform, tone, and any detected constraints.`,
// //         deepInstruction: `One paragraph: content goal, specific audience persona, success criterion.\n${hasUserAnswers ? "MANDATE: Reference the user's stated audience, platform, and goal from their answers." : ""}`,
// //         required: true,
// //       },
// //       {
// //         name: "Structure",
// //         label: "Content Structure",
// //         skillInstruction: `Named sections/components of the content piece, in order.\nFor each section: name + one-line description of what it contains + its job (hook/explain/convert/close).\nFormat: **[Section name]:** [what it contains] â Purpose: [job it does]`,
// //         deepInstruction: `Named sections in order, each with:\n**[Section Name]:** [what it contains + why this order works]\nFormat: **[Section]:** [content] â Job: [hook/explain/validate/convert/close]\n\nInclude: word count allocation per section (total must match target).`,
// //         required: true,
// //       },
// //       {
// //         name: "Key Numbers",
// //         label: "Content Benchmarks",
// //         skillInstruction: `Markdown table: target word count / reading time / keyword density (if SEO) / CTA count / ideal publish frequency.\nAll numbers specific to this content type and platform.`,
// //         deepInstruction: `Markdown table of content performance parameters.\nFormat: | Parameter | Target |\nMust include: word count, reading time, headline CTR benchmark, engagement rate target, publication cadence.\n${hasUserAnswers ? "MANDATE: Include current baseline if user stated existing metrics." : ""}`,
// //         required: true,
// //       },
// //       {
// //         name: "Distribution",
// //         label: "Distribution & Promotion",
// //         skillInstruction: `3â5 specific distribution actions: where to publish, how to promote, when to post.\nName actual platforms, tools, and timing â not "share on social media".\nOne direct recommendation about the highest-ROI channel for this content.`,
// //         deepInstruction: `5â7 specific distribution actions with platform, timing, and format.\nInclude: primary channel, repurposing strategy (what format, which platform), and one paid promotion trigger (when organic reach justifies boosting).\nâ  Risk: [specific distribution failure for this content type]. Mitigation: [named action].`,
// //         required: true,
// //       },
// //       {
// //         name: "Ground Rules",
// //         label: "Content Rules",
// //         skillInstruction: `4â5 direct rules for this content type:\n"Never [X]", "Always [Y]", "If [Z] then [W]"\nCovers: tone, structure, SEO, and one platform-specific rule.`,
// //         deepInstruction: `4â5 direct rules specific to this content type and platform.\n\nMANDATORY â 3 NAMED RISKS:\n"â  Risk: [specific content failure mode â poor hook, SEO cannibalisation, tone mismatch]. Mitigation: [named fix]."`,
// //         required: true,
// //       },
// //       {
// //         name: "What Good Looks Like",
// //         label: "What Good Content Looks Like",
// //         skillInstruction: `3 criteria written as "This content succeeds whenâ¦" â measurable, not subjective.\nCovers: audience response, performance metric, and business outcome.`,
// //         deepInstruction: `3 criteria as "This content succeeds whenâ¦" â measurable, platform-specific.\n\n${framework === "strategic"
// //           ? `"**30-day benchmark:** [specific traffic or engagement metric]. If not hit, [specific content or distribution adjustment]."\n"**90-day benchmark:** [compounding outcome]."\n"**What comes next:** [next content asset or campaign to build on this]."` 
// //           : `Final criterion: a performance metric specific to this platform and content type.`}`,
// //         required: true,
// //       },
// //     ];
// //     if (isDeepMode) {
// //       sections.push({
// //         name: "Next 3 Actions",
// //         label: "Your Next 3 Actions",
// //         skillInstruction: null,
// //         deepInstruction: `3 specific actions to move from brief to published:\n1. [Research/outline action] â you â [deadline]\n2. [Draft action â what to write first] â you â [deadline]\n3. [Publishing/distribution action] â you â [deadline]\n\nFormat: "N. [Specific action] â [who] â [deadline]"\nBAD: "Start writing your content." TOO VAGUE.`,
// //         required: true,
// //       });
// //     }
// //     return sections;
// //   }

// //   if (intentCategory === "tutorial" || isTutorial) {
// //     const sections = [
// //       {
// //         name: "Expert Role",
// //         label: "Your Expert Role",
// //         skillInstruction: `Name the TECHNOLOGY and MINI-PROJECT in this section.\nSpecific educator/developer identity â language/framework specialisation, years of teaching, ONE pedagogical principle you always apply.\nNEVER: "You are an experienced developer." Name the exact tech stack and the project.`,
// //         deepInstruction: `Name the TECHNOLOGY and MINI-PROJECT explicitly.\n\nâ  COUNTER-INTUITIVE ORDERING: "Most tutorials teach [X] before [Y] â that's wrong. [Y] must come first because [learning mechanism]."\nâ¡ NON-OBVIOUS MISTAKE (3â4 sentences): "The biggest mistake I see in [this type of tutorial] is [specific instructional error experienced devs still make]." Why it happens â what it costs (learner confusion/dropout) â the fix.\nâ¢ TRADE-OFF: "The central trade-off is thoroughness vs momentum. [Specific version â e.g. 'explaining every React concept before a line renders'] kills completion rates. [What to do instead]."`,
// //         required: true,
// //       },
// //       {
// //         name: "What You're Here to Do",
// //         label: "What You're Here to Do",
// //         skillInstruction: `One tight paragraph: exact goal, starting point (assumed knowledge), success = deployed, portfolio-ready project reader can put on GitHub TODAY.\nWeave in tech stack and project name.`,
// //         deepInstruction: `One tight paragraph: goal, assumed prior knowledge, what success looks like (deployed, GitHub-ready, demonstrable).\n${hasUserAnswers ? "MANDATE: Reference user's stated skill level and environment from their answers." : ""}`,
// //         required: true,
// //       },
// //       {
// //         name: "Core Focus Areas",
// //         label: "Your Core Focus Areas",
// //         skillInstruction: `3â5 bullets: what reader must BE ABLE TO DO by the end. Demonstrable, not just knowable.\nFormat: "â¢ [Skill/capability]: [how it's demonstrated in the project]"`,
// //         deepInstruction: `3â5 bullets: demonstrable capabilities the reader gains.\nEach bullet = something the reader can show in the project or explain in an interview.\nBAN: "understand", "learn about" â use "build", "implement", "configure", "deploy".`,
// //         required: true,
// //       },
// //       {
// //         name: "How to Approach This",
// //         label: "Tutorial Structure",
// //         skillInstruction: `Structure: **Setup & First Win** â **Core Concepts with Running Code** â **Build the Full Project** â **Deploy & Share**\nEach phase: timeframe + what the reader has working at the end.\nFormat: **[Phase Name] ([timeframe]):** [what happens] â Output: [runnable thing]`,
// //         deepInstruction: `Session-based phases:\n**Setup & First Win ([time]):** â Output: [first running screen]\n**Core Concepts with Running Code ([time]):** â Output: [key feature working]\n**Build the Full Project ([time]):** â Output: [complete app]\n**Ship & What's Next ([time]):** â Output: [deployed URL + next tutorial pointer]\n\nEach phase produces something RUNNABLE. No phase ends in "now you understand X."`,
// //         required: true,
// //       },
// //       {
// //         name: "Key Numbers",
// //         label: "Key Numbers & Benchmarks",
// //         skillInstruction: `Markdown table â REQUIRED rows: tutorial word count, read time (SEPARATE row), build time (SEPARATE â NEVER combined), code examples count, deployment time.\nFormat: | Parameter | Value |`,
// //         deepInstruction: `Markdown table â REQUIRED rows (all separate):\n| Tutorial word count | |\n| Read time | |\n| Build time | |\n| Code examples | |\n| Deployment time | |\n| Tech stack | |\nNEVER combine read time and build time.`,
// //         required: true,
// //       },
// //       {
// //         name: "What to Deliver",
// //         label: "What to Deliver",
// //         skillInstruction: `Name every output: the guide (word count, sections), code examples (count + platform), mini-project (what it does, stack, where it deploys), "What's Next" pointing to 2â3 specific follow-on tutorials.`,
// //         deepInstruction: `Name every output with format + specification:\nâ¢ The written guide: word count, section breakdown\nâ¢ Code examples: count + repo structure\nâ¢ Mini-project: name + what it does + tech stack + deployment URL\nâ¢ "What's Next": 2â3 named follow-on projects in order of difficulty`,
// //         required: true,
// //       },
// //       {
// //         name: "Ground Rules",
// //         label: "Tutorial Rules",
// //         skillInstruction: `Must include:\nâ¢ Every concept gets a runnable code example â no concept without code\nâ¢ Tutorial cannot end without the reader deploying something real\nâ¢ Read time â  build time â always state both separately\nAdd 2â3 more rules specific to this technology.`,
// //         deepInstruction: `Must include:\nâ¢ Every concept gets a runnable code example\nâ¢ Tutorial ends with a deployed, GitHub-ready project\nâ¢ Read time and build time stated separately â always\n\nMANDATORY â 3 NAMED RISKS:\n"â  Risk: [specific point where learners drop off in this tech stack]. Mitigation: [named structural fix]."`,
// //         required: true,
// //       },
// //       {
// //         name: "What Good Looks Like",
// //         label: "What Good Looks Like",
// //         skillInstruction: `3 criteria written as "The work mustâ¦"\nFinal criterion: "The work must produce a reader who can deploy their own variation of the mini-project from scratch without referring back to the tutorial."`,
// //         deepInstruction: `3 criteria as "The work mustâ¦" â observable, verifiable.\nFinal criterion: "The work must produce a reader who can deploy their own variation of the mini-project from scratch without referring back to the tutorial."\nOther 2: one about code quality signal, one about reader comprehension test.`,
// //         required: true,
// //       },
// //     ];
// //     if (isDeepMode) {
// //       sections.push({
// //         name: "Next 3 Actions",
// //         label: "Your Next 3 Actions",
// //         skillInstruction: null,
// //         deepInstruction: `3 first steps to begin writing this tutorial:\n1. [Technology/project decision action] â you â today\n2. [Setup action â scaffold the code repo] â you â Day 1\n3. [Outline action â map all code examples needed] â you â before writing starts\n\nFormat: "N. [Specific action] â [who] â [deadline]"`,
// //         required: true,
// //       });
// //     }
// //     return sections;
// //   }

// //   if (intentCategory === "ai_image") {
// //     const sections = [
// //       {
// //         name: "Expert Role",
// //         label: "Your Expert Role",
// //         skillInstruction: `Name the specific AI tool, your go-to parameter combination, and your acceptance criteria rule.\nNEVER mention DSLR, camera settings, tripod, or physical lighting setups.\nYou are an AI prompt director â not a photographer.`,
// //         deepInstruction: `Name the specific AI tool (${tool}), version, and your go-to parameter set for this exact use case.\n\nâ  COUNTER-INTUITIVE ORDERING: "Most people spend 80% of prompt-engineering time on [X]. That's wrong â [Y] is the variable that kills outputs. Fix [Y] first."\nâ¡ NON-OBVIOUS MISTAKE: "The biggest mistake I see here is [tool-specific error, not generic]. Why it happens â what it costs â fix."\nâ¢ TRADE-OFF: "The central trade-off is [specificity vs flexibility / style lock-in vs iteration speed]."`,
// //         required: true,
// //       },
// //       {
// //         name: "What You're Here to Do",
// //         label: "What You're Here to Do",
// //         skillInstruction: `One paragraph: exact use case (product shots/portraits/scenes), platform format, and success = a consistent prompt library that passes acceptance criteria at least 1 in 4 generations.`,
// //         deepInstruction: `One paragraph: use case, platform/format, and what a working prompt system looks like.\n${hasUserAnswers ? "MANDATE: Reference user's stated tool version, style direction, and use case." : ""}`,
// //         required: true,
// //       },
// //       {
// //         name: "Core Focus Areas",
// //         label: "Your Core Focus Areas",
// //         skillInstruction: `4 bullets â each an AI-specific skill or workflow deliverable:\nâ¢ Prompt Anatomy: the 5 elements every prompt needs\nâ¢ Style Parameter Library: named --flags for this use case\nâ¢ Iteration Framework: how to go from first output to usable in 3 rounds\nâ¢ Quality Filter: the specific acceptance test`,
// //         deepInstruction: `4â5 bullets â tool-specific skills:\nâ¢ Prompt Anatomy: subject + surface + light + mood + aspect ratio\nâ¢ Style Parameter Library: named --flags and when to use each\nâ¢ Iteration Framework: first output â portfolio-ready in 3 rounds\nâ¢ Quality Filter: acceptance test (not "looks good" â named criteria)\nâ¢ Style Consistency: how to maintain look across a catalogue`,
// //         required: true,
// //       },
// //       {
// //         name: "How to Approach This",
// //         label: "How to Approach This",
// //         skillInstruction: `3â4 phases:\n**Anchor Prompt ([timeframe]):** â Output: [style reference prompt]\n**Parameter Library ([timeframe]):** â Output: [named --flags guide]\n**Iteration Workflow ([timeframe]):** â Output: [3-round refinement process]\n**Catalogue Build ([timeframe]):** â Output: [consistent prompt library]`,
// //         deepInstruction: `3â4 implementation phases:\n**[Phase] ([timeframe]):** [what happens] â Deliverable: [named output]\n\nPhase 1: establish anchor prompt before building anything else.\nFinal phase: what the user does AFTER the initial catalogue is built.`,
// //         required: true,
// //       },
// //       {
// //         name: "Key Numbers",
// //         label: "Key Numbers & Benchmarks",
// //         skillInstruction: `Markdown table â REQUIRED rows: optimal prompt length (words), iterations to portfolio-ready, acceptance rate target, recommended --ar for this platform, --chaos value for product shots, style consistency metric.\nAll numbers specific to ${tool}.`,
// //         deepInstruction: `Markdown table â REQUIRED (${tool}-specific):\n| Optimal prompt length | |\n| Iterations to portfolio-ready | |\n| Acceptance rate target | |\n| Recommended --ar | |\n| --chaos value | |\n| Style consistency benchmark | |`,
// //         required: true,
// //       },
// //       {
// //         name: "What to Deliver",
// //         label: "What to Deliver",
// //         skillInstruction: `Name every output: prompt template library (count + format), style reference bank (count + source), acceptance criteria doc (pass vs regenerate), platform-specific aspect ratio guide.`,
// //         deepInstruction: `Name every output with format + count:\nâ¢ Prompt template library: how many templates + format\nâ¢ Style reference bank: number of images + source method\nâ¢ Acceptance criteria doc: what passes vs regenerates\nâ¢ Platform-specific --ar cheat sheet`,
// //         required: true,
// //       },
// //       {
// //         name: "Ground Rules",
// //         label: "Ground Rules",
// //         skillInstruction: `Must include:\nâ¢ Never use prompt length over 80 words â longer reduces subject focus in ${tool}\nâ¢ Always establish a style anchor prompt before building a catalogue\nâ¢ If --v6 produces modern aesthetics for a vintage brief, add --style raw + --sref\nâ¢ Never judge a prompt on the first generation â run 4 outputs minimum`,
// //         deepInstruction: `Must include the 4 core rules for ${tool} above.\n\nMANDATORY â 3 NAMED RISKS (tool-specific failure modes only):\n"â  Risk: [${tool}-specific failure â style drift/version defaults/catalogue inconsistency]. Mitigation: [named parameter or workflow fix]."\nNEVER generic photography risks.`,
// //         required: true,
// //       },
// //       {
// //         name: "What Good Looks Like",
// //         label: "What Good Looks Like",
// //         skillInstruction: `3 criteria as "The work mustâ¦"\nFinal criterion: "The work must produce a prompt library where any prompt generates a usable image at least 1 in every 4 generations â without adjusting prompt structure between products."`,
// //         deepInstruction: `3 criteria as "The work mustâ¦"\nFinal criterion: "The work must produce a prompt library where any prompt generates a usable image (passing the acceptance criteria) at least 1 in every 4 generations â without adjusting prompt structure between products."\nOther 2: style consistency test and catalogue completeness test.`,
// //         required: true,
// //       },
// //     ];
// //     if (isDeepMode) {
// //       sections.push({
// //         name: "Next 3 Actions",
// //         label: "Your Next 3 Actions",
// //         skillInstruction: null,
// //         deepInstruction: `3 immediate actions â all ${tool}-specific:\n1. [Anchor prompt action â test ONE product/subject with 4 variations] â you alone â Day 1\n2. [Parameter library action â document which --flags work for this use case] â you alone â Day 3\n3. [Acceptance criteria action â define pass/fail before building the catalogue] â you alone â before Day 5\n\nFormat: "N. [Specific action] â [who] â [deadline]"`,
// //         required: true,
// //       });
// //     }
// //     return sections;
// //   }

// //   if (intentCategory === "debugging" || framework === "operational") {
// //     const sections = [
// //       {
// //         name: "Expert Role",
// //         label: "Your Expert Role",
// //         skillInstruction: `Specific diagnostic expert identity â technology, years of debugging experience, ONE diagnostic principle you always apply first (eliminate before you fix).\nName the most common misdiagnosis for this type of problem.`,
// //         deepInstruction: `Diagnostic expert identity â technology stack, incident response experience.\n\nâ  MISDIAGNOSIS TRAP: "The most common misdiagnosis here is [X]. People waste hours chasing [X] when [Y] is the actual root cause."\nâ¡ COST OF WRONG ROOT CAUSE: "Chasing the wrong cause costs [specific time/consequence]."\nâ¢ DIAGNOSTIC PRINCIPLE: "I always [specific first step] before touching any configuration â here's why."`,
// //         required: true,
// //       },
// //       {
// //         name: "Problem Statement",
// //         label: "Problem Statement",
// //         skillInstruction: `One paragraph: exact symptom, when it started, environment (OS/framework/version), and what's been tried.\nIf constraints are known, reference them directly.`,
// //         deepInstruction: `One paragraph: exact symptom, environment, reproduction steps, what's been tried.\n${hasUserAnswers ? "MANDATE: Reference the user's stated error message, stack, and environment from their answers." : ""}`,
// //         required: true,
// //       },
// //       {
// //         name: "Diagnostic Steps",
// //         label: "Diagnostic Steps",
// //         skillInstruction: `Numbered steps ordered by likelihood of root cause.\nEach step: what to check â what a pass looks like â what a fail means â next step.\nFormat: **Step N â [Check name]:** [command or action] â Pass: [what it means] â Fail: [what it means]`,
// //         deepInstruction: `Ordered diagnostic sequence â most likely root cause first.\nFormat: **Step N â [Check]:** [exact command or action] â Pass: [what passing looks like] â Fail: [what this means, next step]\n\nStop when you find the culprit â don't run all steps if an early one fails.`,
// //         required: true,
// //       },
// //       {
// //         name: "Resolution",
// //         label: "Resolution Steps",
// //         skillInstruction: `For each likely root cause: the exact fix.\nFormat: **If [root cause]:** [specific command or code change] â Verification: [how to confirm it's resolved]`,
// //         deepInstruction: `Resolution map: root cause â exact fix â verification.\nFormat: **If [root cause identified in Step N]:** [specific fix â command, config change, code edit] â Verification: [exact test that confirms resolution]\n\nInclude rollback instruction if the fix could create new issues.`,
// //         required: true,
// //       },
// //       {
// //         name: "Key Numbers",
// //         label: "Diagnostic Benchmarks",
// //         skillInstruction: `Markdown table: typical resolution time / most common root cause (%) / tools needed / log location(s).\nSpecific to this technology/error type.`,
// //         deepInstruction: `Markdown table of diagnostic parameters.\n| Parameter | Value |\nMust include: typical resolution time, most likely root cause, tools needed, relevant log paths.`,
// //         required: true,
// //       },
// //       {
// //         name: "Ground Rules",
// //         label: "Debugging Rules",
// //         skillInstruction: `4â5 direct debugging rules:\n"Never [X] without [Y first]", "Always [check Z] before changing config"\nCovers: isolation principle, version pinning, rollback, logging.`,
// //         deepInstruction: `4â5 direct rules for this debugging scenario.\n\nMANDATORY â 3 NAMED RISKS:\n"â  Risk: [specific misdiagnosis or fix-that-makes-it-worse]. Mitigation: [named check before acting]."\nZERO strategic planning language.`,
// //         required: true,
// //       },
// //       {
// //         name: "What Good Looks Like",
// //         label: "Resolution Signal",
// //         skillInstruction: `3 criteria as "The issue is resolved whenâ¦" â observable test results.\nNO milestones, NO business metrics, NO day/week targets.\nFinal criterion: the clean-state test.`,
// //         deepInstruction: `3 criteria as "The issue is resolved whenâ¦" â specific, testable.\nEach criterion: an exact test or output that confirms resolution.\nFinal criterion: the system-state test that confirms clean resolution without side effects.\nZERO milestone or business language.`,
// //         required: true,
// //       },
// //       {
// //         name: "Next 3 Actions",
// //         label: "Your Next 3 Actions",
// //         skillInstruction: null,
// //         deepInstruction: `3 immediate investigation actions â specific commands or checks:\n1. [First check â most likely root cause] â you â immediately\n2. [Second check â if Step 1 passes] â you â within the hour\n3. [Escalation or logging action â if neither resolves it] â you â before anything else\n\nFormat: "N. [Specific command or action] â [who] â [deadline]"\nZERO strategic or planning language.`,
// //         required: true,
// //       },
// //     ];
// //     return sections;
// //   }

// //   if (intentCategory === "marketing_growth") {
// //     const sections = [
// //       {
// //         name: "Expert Role",
// //         label: "Your Expert Role",
// //         skillInstruction: `Specific growth/marketing expert identity â channel specialisation, years, ONE framework or rule you always apply first.\nNEVER: "You are a marketing expert." Name the specific channel and your go-to first diagnostic.`,
// //         deepInstruction: `Vivid marketing expert identity â channel, methodology, experience.\n\nâ  COUNTER-INTUITIVE ORDERING: "Most brands start with [X] â wrong. [Y] must be working before [X] is worth a rupee."\nâ¡ NON-OBVIOUS MISTAKE (3â4 sentences): "The biggest mistake I see here is [specific, experienced-marketer-level error]." Why â cost (wasted spend/missed CAC) â fix.\nâ¢ TRADE-OFF: "The central trade-off is [reach vs conversion / brand vs performance / paid vs organic]." What to prioritise for this stage and budget.`,
// //         required: true,
// //       },
// //       {
// //         name: "What You're Here to Do",
// //         label: "What You're Here to Do",
// //         skillInstruction: `One paragraph: exact marketing goal (leads/sales/awareness/retention), target audience persona (specific, not "everyone"), and the single measurable success criterion.\nWeave in budget, timeline, and platform if detected.`,
// //         deepInstruction: `One paragraph: goal, specific audience persona, success criterion with a number.\n${hasUserAnswers ? "MANDATE: Reference the user's stated budget, audience, and channel from their answers." : ""}`,
// //         required: true,
// //       },
// //       {
// //         name: "Core Focus Areas",
// //         label: "Your Core Focus Areas",
// //         skillInstruction: `3â5 bullets â distinct marketing workstreams with named outputs:\n"â¢ [Channel/Tactic]: [specific output â what gets built or decided]"\nBAN: "Monitor performance" â name the metric and the action it triggers.`,
// //         deepInstruction: `3â5 bullets â named marketing workstreams:\n"â¢ [Channel/Tactic]: [specific output] â measured by: [named metric]"\nBAN: "Monitor and analyze" without a named metric and action threshold.`,
// //         required: true,
// //       },
// //       {
// //         name: "How to Approach This",
// //         label: "How to Approach This",
// //         skillInstruction: `3â4 phases with bold labels and timeframes.\nFormat: **[Phase Name] ([timeframe]):** [actions] â Output: [named deliverable]\nPhase 1 = foundation (what must exist before spending). Final phase = retention/LTV, not just acquisition.`,
// //         deepInstruction: `${framework === "strategic"
// //           ? `3â4 phases:\n**[Phase Name] ([timeframe]):** [what happens] â Deliverable: [named output]\nPhase 1: Foundation â what must exist before any spend or content goes live.\nFinal phase: MANDATORY POST-GOAL PHASE â what happens after first acquisition goal is hit (LTV expansion, referral, retention).`
// //           : `3â4 implementation phases:\n**[Phase Name] ([timeframe]):** [what happens] â Deliverable: [named output]\nFinal phase = what user does after campaign is live.`}`,
// //         required: true,
// //       },
// //       {
// //         name: "Key Numbers",
// //         label: "Key Numbers & Benchmarks",
// //         skillInstruction: `Markdown table: 4â6 rows with real channel benchmarks.\nMust include: CAC target, conversion rate benchmark, ROAS target (if paid), CPL, organic vs paid traffic split.\nPull from domain benchmarks â never invent.`,
// //         deepInstruction: `Markdown table â channel-specific benchmarks.\nFormat: | Parameter | Target / Benchmark |\nMust include: CAC, conversion rate, ROAS (if paid), CPL, content volume target, audience growth rate.\n${hasUserAnswers ? "MANDATE: Include 'Current baseline' row if user stated existing metrics." : ""}\n${framework === "strategic" ? "Add 30-day and 90-day target rows â must match milestones in What Good Looks Like exactly." : ""}`,
// //         required: true,
// //       },
// //       {
// //         name: "What to Deliver",
// //         label: "What to Deliver",
// //         skillInstruction: `Every deliverable: the thing + its format + its purpose.\nName: content assets, campaign setup, tracking infrastructure, reporting cadence.\nNO vague deliverables like "marketing materials".`,
// //         deepInstruction: `Every deliverable with format + specification + purpose:\nâ¢ Content assets: type + count + format\nâ¢ Campaign setup: platform + targeting spec\nâ¢ Tracking: tools + metrics + reporting cadence\nâ¢ Creative: format + specs + testing plan`,
// //         required: true,
// //       },
// //       {
// //         name: "Ground Rules",
// //         label: "Ground Rules",
// //         skillInstruction: `4â5 direct marketing rules specific to this channel and goal:\n"Never [X]", "Always [Y]", "If [Z] then [W]"\nCovers: budget allocation, creative testing, attribution, and one platform-specific rule.`,
// //         deepInstruction: `4â5 direct rules specific to this channel and goal.\n\nMANDATORY â 3 NAMED RISKS:\n"â  Risk: [specific channel/campaign failure mode]. Mitigation: [named action]."\nCovers: attribution failure, creative fatigue, budget misallocation.`,
// //         required: true,
// //       },
// //       {
// //         name: "What Good Looks Like",
// //         label: "What Good Looks Like",
// //         skillInstruction: `3 criteria as "The campaign/strategy succeeds whenâ¦" â measurable with named metrics.\nFinal criterion: a long-term efficiency signal (not just campaign completion).`,
// //         deepInstruction: `3 criteria as "The campaign succeeds whenâ¦"\n\n${framework === "strategic"
// //           ? `"**30-day milestone:** [specific metric â leads/sales/CAC]. If not hit, [specific channel or creative adjustment]."\n"**90-day milestone:** [sustained efficiency metric with number]."\n"**What comes next:** [specific next growth lever to activate]."` 
// //           : `Final criterion: a channel efficiency signal that confirms the approach is working.`}`,
// //         required: true,
// //       },
// //     ];
// //     if (isDeepMode) {
// //       sections.push({
// //         name: "Next 3 Actions",
// //         label: "Your Next 3 Actions",
// //         skillInstruction: null,
// //         deepInstruction: `3 specific actions to launch this campaign/strategy:\n1. [Foundation action â must exist before anything else] â you alone â Day 1\n2. [Creative/content action â first asset to build] â you alone â Day 3\n3. [Tracking/measurement action â must be live before spend starts] â you alone â before Week 1 ends\n\nFormat: "N. [Specific action] â [who] â [deadline]"`,
// //         required: true,
// //       });
// //     }
// //     return sections;
// //   }

// //   if (intentCategory === "finance_investment") {
// //     const sections = [
// //       {
// //         name: "Expert Role",
// //         label: "Your Expert Role",
// //         skillInstruction: `Specific financial expert identity â domain (equity/real estate/personal finance/tax), years, ONE investment principle or rule you always apply first.\nName the most common mistake at this stage of the user's financial journey.`,
// //         deepInstruction: `Financial expert identity â domain, experience, methodology.\n\nâ  COUNTER-INTUITIVE ORDERING: "Most people [invest/plan/do X] before [Y is sorted]. That's the wrong order â [Y] failure makes [X] worthless."\nâ¡ NON-OBVIOUS MISTAKE: "The biggest mistake I see at this stage is [specific error experienced investors still make]." Why â cost (in â¹ or %) â fix.\nâ¢ TRADE-OFF: "The central trade-off is [return vs liquidity / diversification vs concentration / tax efficiency vs yield]." What to prioritise here.`,
// //         required: true,
// //       },
// //       {
// //         name: "Financial Goal",
// //         label: "Financial Goal & Starting Point",
// //         skillInstruction: `One paragraph: exact goal (corpus/income/tax saving), timeline, current situation, and the single most important decision to make first.\nWeave in any detected constraints (income, risk appetite, existing portfolio).`,
// //         deepInstruction: `One paragraph: goal with number + timeline, current financial situation, and priority decision.\n${hasUserAnswers ? "MANDATE: Reference the user's stated income, risk appetite, and timeline from their answers." : ""}`,
// //         required: true,
// //       },
// //       {
// //         name: "Strategy",
// //         label: "Investment Strategy",
// //         skillInstruction: `Named strategy with asset allocation (%).\n3â5 bullets â each a named instrument or action with rationale and allocation %.\nNo generic advice. Name actual products (Nifty 50 index fund, ELSS, PPF â not "equity funds").`,
// //         deepInstruction: `Named strategy with specific asset allocation.\nFor each instrument: name + allocation % + rationale + recommended product (not category).\nInclude: emergency fund status check before any investment begins.\nâ  Risk: [specific allocation risk for this goal/timeline]. Mitigation: [named rebalancing trigger].`,
// //         required: true,
// //       },
// //       {
// //         name: "How to Approach This",
// //         label: "Implementation Phases",
// //         skillInstruction: `3â4 phases with timeframes.\nFormat: **[Phase Name] ([timeframe]):** [actions] â Output: [named decision or account setup]\nPhase 1 = foundation (emergency fund + insurance before investing).`,
// //         deepInstruction: `3â4 implementation phases:\n**[Phase Name] ([timeframe]):** [what happens] â Deliverable: [named account/decision/allocation done]\nPhase 1: non-negotiable foundation before any market exposure.\n${framework === "strategic" ? "Final phase: MANDATORY â what happens after the primary goal is achieved (corpus built, next goal activation)." : ""}`,
// //         required: true,
// //       },
// //       {
// //         name: "Key Numbers",
// //         label: "Key Numbers & Benchmarks",
// //         skillInstruction: `Markdown table: target corpus / monthly SIP amount / expected CAGR / time to goal / tax saving (if applicable).\nAll numbers specific and derived from stated goal â not invented.`,
// //         deepInstruction: `Markdown table â goal-specific numbers.\nFormat: | Parameter | Value |\nMust include: target corpus, monthly SIP, expected CAGR (realistic range), time to goal, tax liability, emergency fund target.\n${hasUserAnswers ? "MANDATE: If user stated current savings/income, include 'Current baseline' row." : ""}`,
// //         required: true,
// //       },
// //       {
// //         name: "Ground Rules",
// //         label: "Investment Rules",
// //         skillInstruction: `4â5 direct financial rules specific to this goal and risk profile:\n"Never [X] before [Y is in place]", "Always [rebalance when Z]"\nCovers: diversification, liquidity, tax, and one emotion-management rule.`,
// //         deepInstruction: `4â5 direct rules specific to this goal.\n\nMANDATORY â 3 NAMED RISKS:\n"â  Risk: [specific financial failure mode â inflation gap, liquidity crunch, tax drag]. Mitigation: [named action]."\nNOTE: This is educational â not personalised financial advice. Recommend consulting a SEBI-registered advisor for specific decisions.`,
// //         required: true,
// //       },
// //       {
// //         name: "What Good Looks Like",
// //         label: "What Good Looks Like",
// //         skillInstruction: `3 criteria as "The strategy is on track whenâ¦" â measurable, date-anchored.\nFinal criterion: a long-term portfolio health signal.`,
// //         deepInstruction: `3 criteria as "The strategy is on track whenâ¦"\n\n${framework === "strategic"
// //           ? `"**12-month checkpoint:** [specific portfolio milestone]. If not on track, [specific rebalancing action]."\n"**Goal milestone:** [corpus or income target with number]."\n"**What comes next:** [next financial goal to activate after this one is on track]."` 
// //           : `Final criterion: a portfolio health signal specific to this goal and timeline.`}`,
// //         required: true,
// //       },
// //     ];
// //     if (isDeepMode) {
// //       sections.push({
// //         name: "Next 3 Actions",
// //         label: "Your Next 3 Actions",
// //         skillInstruction: null,
// //         deepInstruction: `3 specific financial actions to start immediately:\n1. [Foundation action â emergency fund or insurance check] â you alone â this week\n2. [Account setup action â specific platform/broker] â you alone â Day 3\n3. [First investment action â specific instrument + amount] â you alone â by end of Week 1\n\nFormat: "N. [Specific action] â [who] â [deadline]"\nNOTE: Consult a SEBI-registered advisor before executing.`,
// //         required: true,
// //       });
// //     }
// //     return sections;
// //   }

// //   if (intentCategory === "career_job") {
// //     const sections = [
// //       {
// //         name: "Expert Role",
// //         label: "Your Expert Role",
// //         skillInstruction: `Specific career/HR expert identity â industry specialisation, years, ONE job-search or career-development principle you always apply first.\nName the most overlooked factor in getting hired for this type of role.`,
// //         deepInstruction: `Career expert identity â industry, methodology, experience.\n\nâ  NON-OBVIOUS MISTAKE: "The biggest mistake I see in [this career move] is [specific error experienced job-seekers still make]." Why â cost (rejection/missed opportunities) â fix.\nâ¡ TRADE-OFF: "The central trade-off is [speed vs targeting / breadth vs depth / visible achievements vs soft skills]." What to prioritise here.\nâ¢ COUNTER-INTUITIVE ORDERING: What to optimise before updating the resume.`,
// //         required: true,
// //       },
// //       {
// //         name: "Career Goal",
// //         label: "Career Goal & Starting Point",
// //         skillInstruction: `One paragraph: exact career move (role + seniority + industry), current position/background, and the single most important thing to demonstrate to get this role.\nWeave in timeline and any constraints.`,
// //         deepInstruction: `One paragraph: target role + seniority + industry, current background, primary hiring signal to develop.\n${hasUserAnswers ? "MANDATE: Reference the user's stated experience, target role, and timeline from their answers." : ""}`,
// //         required: true,
// //       },
// //       {
// //         name: "Core Focus Areas",
// //         label: "Your Core Focus Areas",
// //         skillInstruction: `3â5 bullets â named job-search workstreams:\n"â¢ [Workstream]: [specific output â resume section/portfolio piece/network action]"\nBAN: "Improve your skills" â name the specific skill and how to demonstrate it.`,
// //         deepInstruction: `3â5 bullets â named workstreams:\n"â¢ [Workstream]: [specific output] â signal: [what this proves to a hiring manager]"\nBAN vague actions. Name the exact artefact or demonstration.`,
// //         required: true,
// //       },
// //       {
// //         name: "How to Approach This",
// //         label: "Job Search Strategy",
// //         skillInstruction: `3â4 phases with timeframes.\nFormat: **[Phase Name] ([timeframe]):** [actions] â Output: [named deliverable â resume version/portfolio/outreach list]\nPhase 1 = positioning before applications start.`,
// //         deepInstruction: `3â4 phases:\n**[Phase Name] ([timeframe]):** [actions] â Deliverable: [named output]\nPhase 1: positioning + materials â must be done before any applications go out.\n${framework === "strategic" ? "Final phase: MANDATORY â what happens after the role is secured (90-day plan, performance acceleration)." : ""}`,
// //         required: true,
// //       },
// //       {
// //         name: "Key Numbers",
// //         label: "Job Search Benchmarks",
// //         skillInstruction: `Markdown table: applications per week / response rate benchmark / interview conversion rate / typical hiring timeline / offer negotiation success rate.\nAll numbers realistic for this role level and industry.`,
// //         deepInstruction: `Markdown table of job-search metrics.\nFormat: | Parameter | Benchmark |\nMust include: applications per week, response rate, interview rate, typical hiring timeline, salary range for target role.\n${hasUserAnswers ? "MANDATE: Include user's current salary as 'Current baseline' if stated." : ""}`,
// //         required: true,
// //       },
// //       {
// //         name: "Ground Rules",
// //         label: "Job Search Rules",
// //         skillInstruction: `4â5 direct job-search rules:\n"Never [apply without X]", "Always [customise Y per application]"\nCovers: application quality, LinkedIn optimisation, interview prep, salary negotiation.`,
// //         deepInstruction: `4â5 direct rules for this career move.\n\nMANDATORY â 3 NAMED RISKS:\n"â  Risk: [specific job-search failure mode â ghosting, wrong positioning, weak portfolio]. Mitigation: [named action]."\nCovers: application quality, network leverage, interview execution.`,
// //         required: true,
// //       },
// //       {
// //         name: "What Good Looks Like",
// //         label: "What Good Looks Like",
// //         skillInstruction: `3 criteria as "The job search is working whenâ¦" â observable milestones.\nFinal criterion: the offer signal, not just activity.`,
// //         deepInstruction: `3 criteria as "The search is working whenâ¦"\n\n${framework === "strategic"
// //           ? `"**30-day milestone:** [specific activity or response metric]. If not hit, [specific tactic change]."\n"**60-day milestone:** [interview stage reached]."\n"**What comes next:** [how to prepare for and negotiate the offer]."` 
// //           : `Final criterion: a response-rate or interview-rate signal that confirms the positioning is working.`}`,
// //         required: true,
// //       },
// //     ];
// //     if (isDeepMode) {
// //       sections.push({
// //         name: "Next 3 Actions",
// //         label: "Your Next 3 Actions",
// //         skillInstruction: null,
// //         deepInstruction: `3 immediate job-search actions:\n1. [Positioning action â update or reframe the core value proposition] â you alone â today\n2. [Materials action â specific resume or portfolio update] â you alone â Day 3\n3. [Outreach action â first 10 specific companies or contacts] â you alone â by end of Week 1\n\nFormat: "N. [Specific action] â [who] â [deadline]"`,
// //         required: true,
// //       });
// //     }
// //     return sections;
// //   }

// //   // ââ Generic fallback schemas for remaining intent categories âââââââââââââââââ
// //   // These cover: business_strategy, data_analytics, health_wellness,
// //   // education_learning, design_ux, event_planning, general_project,
// //   // and any domain ID that doesn't match a named category above.
// //   //
// //   // Sections are derived from the request framework â strategic/phased/procedural/operational â
// //   // so even the generic path adapts its structure based on the request type.

// //   const genericSections = [];

// //   genericSections.push({
// //     name: "Expert Role",
// //     label: "Your Expert Role",
// //     skillInstruction: `Specific expert identity â name specialisation, years, ONE concrete method or rule you always apply first.\nPattern: "You are a [role] with [X] years of [specific experience]. Your first move is always [named action] because [concrete reason]."\nNEVER: "You are an expert with extensive experience" â too generic.`,
// //     deepInstruction: `Vivid, specific expert identity. Name specialisation, years, ONE concrete method or rule.\n\nThis section must contain ALL THREE in flowing prose:\n\nâ  COUNTER-INTUITIVE ORDERING:\n"Most [people/practitioners] do [X] first â that's the wrong order. [X] is a distraction until [Y] is solved. Start with [Y] because [specific mechanism]."\n\nâ¡ NON-OBVIOUS MISTAKE (3â4 sentences â expanded):\n"The biggest mistake I see here is [SPECIFIC mistake that experienced practitioners still make â not beginner-obvious]."\nThen: why it happens â what it costs (specific consequence) â the fix (named alternative action).\n\nâ¢ UNCOMFORTABLE TRADE-OFF (2â3 sentences):\n"The central trade-off here is [X vs Y]. [Why X is the trap]. [What to do instead and why]."`,
// //     required: true,
// //   });

// //   genericSections.push({
// //     name: "What You're Here to Do",
// //     label: "What You're Here to Do",
// //     skillInstruction: `One tight paragraph: exact goal, current starting point, success in concrete terms.\nWeave in detected constraints. Be specific about the outcome. Include one direct assertion.`,
// //     deepInstruction: `One tight paragraph: exact goal, starting point, success in concrete terms.\n${hasUserAnswers ? "MANDATE: Reference the user's specific situation from their answers â their numbers, stage, constraints." : "Weave in detected constraints naturally."}`,
// //     required: true,
// //   });

// //   genericSections.push({
// //     name: "Core Focus Areas",
// //     label: "Your Core Focus Areas",
// //     skillInstruction: `3â5 bullets. Each: named workstream + concrete output.\nFormat: "â¢ [Named Area]: [specific action/output â what gets built or decided]"\nBANNED:\nâ¢ "Monitor and analyze performance" â name the specific metric + action it triggers\nâ¢ "Ensure alignment with goals" â name a deliverable or decision`,
// //     deepInstruction: `3â5 bullets â distinct, named workstreams with concrete outputs.\nBANNED (rewrite if any appear):\nâ¢ "Monitor and analyze performance" â name the specific metric + the action it triggers\nâ¢ "Integrate user feedback" â name the specific mechanism\nâ¢ "Ensure alignment with goals" â name a deliverable or decision`,
// //     required: true,
// //   });

// //   genericSections.push({
// //     name: "How to Approach This",
// //     label: "How to Approach This",
// //     skillInstruction: framework === "procedural" || framework === "operational"
// //       ? `NUMBERED STEPS â not phases with week/month labels.\nFormat: **Step N â [Step Name]:** [what to do] â Visible result: [what you can verify/test]\nEach step produces something runnable, visible, or testable.`
// //       : `3â4 phases with **bold phase label** + timeframe.\nFormat: **[Phase Name] ([timeframe]):** [actions] â Output: [named deliverable]\nUse realistic week/sprint timing. Each phase has ONE named output.\nBANNED phase verbs: 'explore', 'consider', 'look into', 'research options'`,
// //     deepInstruction: framework === "procedural"
// //       ? `NUMBERED STEPS â not phases.\nFormat: **Step N â [Step Name]:** [what to do] â Visible result: [what you can verify/test]\nEach step must leave the reader with something runnable, visible, or testable.\nBANNED: 'Day 1', 'Week 1', 'Phase', '30-day', '90-day', milestone language.`
// //       : framework === "operational"
// //       ? `ORDERED DIAGNOSTIC SEQUENCE.\nFormat: **Step N â [Check]:** [command or action] â Pass: [what it means] â Fail: [what it means]\nOrder steps from most-likely root cause to least likely.\nBANNED: timeline language, phases, milestones.`
// //       : framework === "phased"
// //       ? `3â4 implementation phases:\nFormat: **[Phase Name] ([timeframe]):** [what happens] â Deliverable: [named, concrete output]\nPhase timeframes (e.g., Week 1â2). Final phase = what user does AFTER project is complete.\nBANNED: 30-day milestones, 90-day KPI targets, business revenue milestones in phase labels.`
// //       : /* strategic */
// //       `MANDATORY: 3â4 phases:\nFormat: **[Phase Name] ([timeframe]):** [what happens] â Deliverable: [named, concrete output]\nPHASE STRUCTURE:\nâ¢ Phase 1: Foundation â the thing BEFORE everything else\nâ¢ Phase 2: Build/execute â core work\nâ¢ Phase 3: Launch/validate â first real-world test with a metric\nâ¢ PHASE 4 â MANDATORY POST-GOAL PHASE: What happens AFTER the main goal.\n  NOT optional. A real plan always addresses "then what?"\nBANNED: 'explore', 'consider'. Every phase has a named output.`,
// //     required: true,
// //   });

// //   genericSections.push({
// //     name: "Key Numbers",
// //     label: "Key Numbers & Benchmarks",
// //     skillInstruction: `Markdown table, 4â6 rows. Every row has a real, specific number.\nFormat: | Parameter | Target / Benchmark |\nPull numbers ONLY from DOMAIN BENCHMARKS above. Never invent.\nBANNED rows: "Success metric: achieve project goals", any row with a made-up placeholder.`,
// //     deepInstruction: framework === "strategic"
// //       ? `Markdown table. Every row has a real, specific number. No ranges wider than 3Ã.\nFormat: | Parameter | Target / Benchmark |\n4â6 rows from DOMAIN BENCHMARKS above.\n${hasUserAnswers ? "MANDATE: If user provided a current metric, it appears as a 'Current baseline' row." : ""}\nAdd 30-day and 90-day target rows â must match milestones in What Good Looks Like exactly.\nBANNED: invented numbers, vague placeholders.`
// //       : `Markdown table â real, specific numbers relevant to this ${framework === "operational" ? "resolution process" : "implementation"}.\nFormat: | Parameter | Target / Benchmark |\n${hasUserAnswers ? "MANDATE: If user provided a current metric, it appears as a 'Current baseline' row." : ""}\nBANNED: invented numbers, 30-day milestones, 90-day targets, business KPIs (this is a ${framework} task).`,
// //     required: true,
// //   });

// //   genericSections.push({
// //     name: "What to Deliver",
// //     label: "What to Deliver",
// //     skillInstruction: `Every deliverable: the thing + its format + its purpose in one line. Nothing vague.`,
// //     deepInstruction: `Every deliverable: the thing + its format + its purpose. Nothing vague.\nFor each: name, format/medium, and how it will be used by the end user.`,
// //     required: true,
// //   });

// //   genericSections.push({
// //     name: "Ground Rules",
// //     label: "Ground Rules",
// //     skillInstruction: `4â5 direct rules as 'Never X', 'Always Y', or 'If Z then W'.\nEach rule addresses a real failure mode for THIS specific domain.\nInclude the 2â3 most common failure modes and the rule that prevents each.`,
// //     deepInstruction: `4â5 direct rules as 'Never X', 'Always Y', or 'If Z then W'.\n\nMANDATORY â 3 NAMED RISKS with ${framework === "strategic" ? "Week 1" : "immediate"} mitigations:\nFormat: "â  Risk: [specific failure mode in this domain â not generic]. Mitigation: [one concrete ${framework === "strategic" ? "Week 1" : "first"} action]."\n\nDOMAIN EXPERT TEST per risk: "Would a generalist identify this without domain experience?" If yes â too generic.\nBAD: "â  Risk: Poor planning leads to delays."\nGOOD pattern: "â  Risk: [Specific mechanism that fails at THIS stage in THIS domain] â [consequence with number/timeline]. Mitigation: [Named document, tool, or decision]."\nEach of the 3 risks must be a DIFFERENT type of failure (e.g. technical, process, market/audience).\n${hasUserAnswers ? "MANDATE: At least 2 of 3 risks must name a specific detail from the user's answers." : ""}`,
// //     required: true,
// //   });

// //   genericSections.push({
// //     name: "What Good Looks Like",
// //     label: "What Good Looks Like",
// //     skillInstruction: `3 criteria written as "The work must [observable, measurable outcome]."\nEach criterion verifiable by a third party. If you cannot measure it, rewrite it.\nMake criteria specific to this domain â not "The work must be comprehensive and high quality."`,
// //     deepInstruction: framework === "strategic"
// //       ? `MANDATORY â all 4 elements:\n\n1. 3 criteria as "The work mustâ¦" â concrete, observable, measurable by a third party.\n\n2. "**30-day milestone:** [specific number or shipped artifact]. If not hit, [specific corrective action] immediately."\nGOOD: "30-day milestone: 10 paying customers at >2% conversion. If not hit, pause paid ads and focus entirely on CRO."\nBAD: "30-day milestone: Good early progress." (no number, no corrective action)\n\n3. "**90-day milestone:** [sustained outcome with a number â proof the strategy is working]."\n\n4. "**What comes next:** [specific named project, tool, or system to build â NOT a vague process]."\n\n${hasUserAnswers ? "MANDATE: Use the user's specific numbers from their answers to set milestones." : ""}`
// //       : `3 criteria as "The work mustâ¦" â concrete, observable, measurable by a third party.\nEach criterion verifiable by a third party.\n${framework === "phased"
// //         ? `Final criterion: a concrete completion signal.\nDo NOT include 30-day milestones, 90-day goals, or business KPI targets.`
// //         : `Final criterion: a resolution signal â what passing looks like.\nDo NOT include milestones, day/week targets, or business metrics.`}`,
// //     required: true,
// //   });

// //   if (isDeepMode) {
// //     genericSections.push({
// //       name: "Next 3 Actions",
// //       label: "Your Next 3 Actions",
// //       skillInstruction: null,
// //       deepInstruction: `MANDATORY â 3 actions only. Each must:\nâ¢ Name the specific task (the actual thing, not a category)\nâ¢ Name who does it (user, developer, "you alone")\nâ¢ Name the deadline (${framework === "strategic" || framework === "phased" ? "Day 1, Day 3, by end of Week 1" : "immediately, within the hour, before anything else"} â not "soon" or "ASAP")\n\nFormat: "1. [Specific action] â [who] â [deadline]"\nGOOD: "1. [Named first action with a specific output] â you alone â by Day 3"\nBAD: "1. Start working on your strategy" (not specific, no owner, no deadline)\n\nThese 3 actions are the bridge between reading this brief and actually starting.`,
// //       required: true,
// //     });
// //   }

// //   return genericSections;
// // }

// // /**
// //  * Generates the JSON template string for the bottom of the prompt,
// //  * based on the dynamic section schema.
// //  *
// //  * @param {Array} schema  - section schema from buildSectionSchema()
// //  * @returns {string}
// //  */
// // function buildJsonTemplate(schema) {
// //   const sectionPlaceholders = schema
// //     .map(s => `**${s.label}**\\n...`)
// //     .join("\\n\\n");
// //   return `{"optimizedText":"${sectionPlaceholders}","suggestions":["one-line alt 1","one-line alt 2","one-line alt 3"]}`;
// // }

// // /**
// //  * Generates the "WRITE THESE N SECTIONS" instruction block from the schema.
// //  *
// //  * ââ FIX APPLIED HERE (see SECTION_VOICE_REMINDER above for full rationale) ââ
// //  * Every section's instruction text is now preceded by a short, mandatory
// //  * reminder that the text being requested is an INSTRUCTION TO THE OTHER
// //  * MODEL, not the final user-facing content. This is the single change that
// //  * resolves domain-specific schemas (recipe_cooking, travel_planning,
// //  * fitness_training, content_writing, marketing_growth, finance_investment,
// //  * career_job, tutorial, ai_image, debugging) collapsing into final-answer
// //  * output instead of system-prompt output. No schema content, mode logic,
// //  * or detection logic was changed.
// //  *
// //  * @param {Array}   schema
// //  * @param {boolean} isDeepMode
// //  * @returns {string}
// //  */
// // function buildSectionWritingBlock(schema, isDeepMode) {
// //   const mode = isDeepMode ? "DEEP MODE" : "SKILL MODE";
// //   const count = schema.length;
// //   const instructionKey = isDeepMode ? "deepInstruction" : "skillInstruction";

// //   const sectionBlocks = schema.map(s => {
// //     const instruction = s[instructionKey] || s.skillInstruction || "";
// //     return `**${s.label}**\n${SECTION_VOICE_REMINDER}\n${instruction}`;
// //   }).join("\n\n");

// //   return `ââââââââââââââââââââââââââââââââââââââââââââââââââââ
// // WRITE THESE ${count} SECTIONS IN ORDER [${mode}]:
// // â ï¸  Each section must INSTRUCT the other model â not answer the user directly.
// //     Every line you write is a directive to another LLM, not the final answer.
// //     The text below each **Bold Label** describes WHAT THE OTHER MODEL'S
// //     SECTION SHOULD CONTAIN â you are writing the brief, not the deliverable.
// // ââââââââââââââââââââââââââââââââââââââââââââââââââââ

// // ${sectionBlocks}`;
// // }

// // // âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
// // // buildEnrichedSystemPrompt
// // // âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
// // async function buildEnrichedSystemPrompt(userText, options = {}) {
// //   const perfHandle = perfStart("buildEnrichedSystemPrompt");

// //   const { domainId, subcategoryId, subcategoryLabel, deepAnswers, skillMode, deepMode, resolvedDomain } = options;

// //   const modeLabel = !skillMode ? "Normal Mode" : deepMode ? "Deep Mode" : "Skill Mode";
// //   console.log(`[skillEngine] buildEnrichedSystemPrompt | mode=${modeLabel} | domain=${domainId || "auto"} | text="${userText.slice(0, 60)}"`);

// //   // ââ Resolve domain âââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
// //   let domain = null;
// //   if (domainId) domain = DOMAINS.find(d => d.id === domainId) || null;

// //   if (!domain) {
// //     const namedTool = detectNamedTool(userText);
// //     if (namedTool?.id === "ai_image_gen") {
// //       domain = DOMAINS.find(d => d.id === "ai_image_gen") || null;
// //     }
// //   }

// //   if (!domain) domain = detectDomain(userText);

// //   if (!domain) {
// //     if (resolvedDomain) {
// //       domain = resolvedDomain;
// //       console.log(`[skillEngine] Using pre-resolved domain: "${domain.domainName || domain.id}"`);
// //     } else {
// //       console.log(`[skillEngine] No hardcoded domain matched â triggering AI classification for: "${userText.slice(0, 60)}"`);
// //       domain = await getDynamicDomain(userText);
// //       if (domain) {
// //         console.log(`[skillEngine] Classification resolved to: "${domain.domainName || domain.id}"`);
// //       }
// //     }
// //   }

// //   if (!domain) {
// //     const { UNIVERSAL_FALLBACK_DOMAIN } = require("./constants");
// //     domain = UNIVERSAL_FALLBACK_DOMAIN;
// //     console.log("[skillEngine] Using UNIVERSAL_FALLBACK_DOMAIN as final safety net");
// //   }

// //   // ââ Intent flags âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
// //   const isWebsite  = detectWebsiteBuildIntent(userText);
// //   const isTutorial = detectTutorialIntent(userText) && !isWebsite;
// //   const hasEduCtx  = /\b(course|learn|teach|student|education|tutorial|lesson)\b/i.test(userText);
// //   const isHybrid   = isWebsite && hasEduCtx;
// //   const isAIImage  = domain?.id === "ai_image_gen";

// //   // ââ Mode flags âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
// //   const isSkillMode = !!(skillMode && !deepMode);
// //   const isDeepMode  = !!(skillMode && deepMode);

// //   // ââ Request framework ââââââââââââââââââââââââââââââââââââââââââââââââââââââ
// //   const requestFramework = isDeepMode
// //     ? classifyRequestFramework(userText, domain?.id || null, isTutorial, isWebsite, isAIImage)
// //     : "strategic";

// //   // ââ NORMAL MODE ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
// //   if (!skillMode) {
// //     const prompt = `You are a helpful AI assistant. Transform the user's raw request into a clear, well-structured prompt that will produce high-quality, useful output.

// // USER REQUEST: "${userText}"

// // OUTPUT FORMAT â return a JSON object with exactly two keys:
// //   "optimizedText": a clear, improved version of the user's prompt as a single string
// //   "suggestions":   array of 3 alternative one-line phrasings

// // Return STRICT JSON ONLY â no markdown fences, no extra text:
// // {"optimizedText":"...","suggestions":["alt1","alt2","alt3"]}`;
// //     perfEnd(perfHandle);
// //     return prompt;
// //   }

// //   // ââ Constraints ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
// //   const autoConstraints = extractConstraints(userText);

// //   const userAnswers = (deepAnswers && typeof deepAnswers === "object")
// //     ? Object.entries(deepAnswers)
// //         .filter(([, v]) => v && String(v).trim())
// //         .map(([k, v]) => `â¢ ${k.replace(/_/g, " ")}: ${v}`)
// //     : [];

// //   const allConstraints  = { ...autoConstraints, ...(deepAnswers || {}) };
// //   const constraintLines = Object.entries(autoConstraints)
// //     .filter(([, v]) => v && String(v).trim())
// //     .map(([k, v]) => `${k.replace(/_/g, " ")}: ${v}`);

// //   // ââ Resolve role + knowledge + tone âââââââââââââââââââââââââââââââââââââââ
// //   let expertRole, domainKnowledge, expertTone;

// //   if (isAIImage) {
// //     expertRole      = domain.role;
// //     domainKnowledge = domain.knowledge;
// //     expertTone      = domain.tone;
// //   } else if (isHybrid) {
// //     expertRole      = "hybrid EdTech Product Builder and full-stack developer with 10+ years shipping online learning platforms (Next.js, Supabase, Stripe) â you understand both the engineering and what makes students actually complete courses";
// //     const ed        = DOMAINS.find(d => d.id === "edtech_product");
// //     domainKnowledge = (domain?.knowledge || "") + (ed?.knowledge || "");
// //     expertTone      = "technical, product-focused, launch-oriented";
// //   } else if (isTutorial) {
// //     const tut       = DOMAINS.find(d => d.id === "technical_tutorial");
// //     expertRole      = tut?.role || "senior technical educator and developer advocate with 10+ years creating project-based coding tutorials";
// //     domainKnowledge = tut?.knowledge || "";
// //     expertTone      = "clear, encouraging, hands-on, beginner-friendly";
// //   } else if (domain) {
// //     expertRole      = domain.role;
// //     domainKnowledge = domain.knowledge;
// //     expertTone      = domain.tone;
// //   } else {
// //     expertRole      = "expert multi-domain AI consultant with deep knowledge across business, technology, marketing, education, finance, and creative domains";
// //     domainKnowledge = "";
// //     expertTone      = "professional, clear, immediately actionable";
// //   }

// //   // ââ Travel agency business building override âââââââââââââââââââââââââââââââ
// //   const isTravelAgencyBuild = detectBusinessBuildingIntent(userText) &&
// //     /\b(travel|tour|tourism)\b/i.test(userText);

// //   if (isTravelAgencyBuild) {
// //     expertRole = "boutique travel agency founder and D2C tourism business strategist with 12+ years launching niche travel brands â expert in positioning, safety-first design for women travellers, digital acquisition, and scaling from solo operator to team";
// //     domainKnowledge = `TRAVEL AGENCY STARTUP BENCHMARKS:
// // - Business registration (India): â¹5,000ââ¹15,000 (sole proprietorship or LLP)
// // - IATA accreditation: optional for niche agencies; required for ticketing commission
// // - Niche positioning premium: 30â50% higher margins vs generic travel agencies
// // - Solo women travel market (India): growing 25% YoY â highest NPS segment in travel
// // - Customer acquisition: Instagram + SEO drives 60â70% of bookings for niche operators
// // - Average booking value: â¹25,000ââ¹80,000 per solo woman traveller (domestic trip)
// // - First 10 customers: referral-only; first 50: organic content + community
// // - Safety infrastructure: 24/7 emergency contact + vetted accommodation policy = #1 trust signal
// // - Website conversion: booking inquiry form converts at 3â8% with testimonials + itinerary samples
// // - Scaling milestone: â¹10L MRR before hiring first operations coordinator`;
// //     expertTone = "entrepreneurial, safety-conscious, niche-market-savvy, community-first";
// //     console.log(`[skillEngine] Travel agency business build detected â injecting business strategy role`);
// //   }

// //   const expertRoleShort = expertRole.split(" with")[0];

// //   // ââ Detect intent category âââââââââââââââââââââââââââââââââââââââââââââââââ
// //   const intentCategory = detectIntentCategory(
// //     userText, domain?.id || null, isTutorial, isWebsite, isAIImage,
// //     requestFramework
// //   );

// //   console.log(`[skillEngine] intentCategory=${intentCategory} | framework=${requestFramework}`);

// //   // ââ Build dynamic section schema âââââââââââââââââââââââââââââââââââââââââââ
// //   const sectionSchema = buildSectionSchema(
// //     intentCategory, requestFramework, isDeepMode, isTutorial, isWebsite, isAIImage,
// //     allConstraints, userAnswers
// //   );

// //   console.log(`[skillEngine] section schema: [${sectionSchema.map(s => s.name).join(", ")}]`);

// //   // ââ Shared blocks ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
// //   const techChoice = allConstraints.technology || null;

// //   const tutorialTechBlock = isTutorial ? `
// // BEFORE WRITING â COMMIT TO TWO DECISIONS:

// // Decision 1 â Technology:
// // ${techChoice
// //   ? `User specified: ${techChoice}. Build the entire tutorial around this. Do not hedge.`
// //   : `Pick the single most appropriate technology:
// //    â¢ Absolute beginner â HTML + CSS (portfolio page, ~2â3 hr build)
// //    â¢ Knows HTML/CSS â Vanilla JavaScript (quiz or to-do app, ~3â4 hr build)
// //    â¢ Knows JS basics â React (weather app or GitHub profile viewer, ~4â6 hr build)
// //    â¢ Data/backend interest â Python (dashboard or web scraper, ~3â5 hr build)
// //    â¢ Mobile â React Native + Expo (habit tracker, ~5â8 hr build)
// //    COMMIT to one. Name it explicitly.`
// // }

// // Decision 2 â Mini-project (Deep Mode: NOT a generic portfolio, to-do list, or calculator):
// // Name a SPECIFIC, DEPLOYABLE project: ${isDeepMode ? "completable in 1â2 weekends (6â12 hrs)" : "completable in one sitting (2â6 hrs)"}, GitHub/portfolio-ready.

// // Deployment rules:
// //   â¢ HTML/CSS/JS/React â Netlify or Vercel
// //   â¢ Python web app â Render or Railway
// //   â¢ Python data dashboard â Streamlit Cloud
// //   â¢ React Native â Expo Go + EAS build
// //   Never send Python to Vercel. Never send React to Heroku.

// // State both decisions in "Your Expert Role" and carry through every section.
// // ` : "";

// //   const aiImageBlock = isAIImage ? `
// // BEFORE WRITING â NOTE THE TOOL CONTEXT:
// // Tool detected: ${allConstraints.tool || "Midjourney"}
// // Platform/format: ${allConstraints.platform_type || "not specified â address in questions or assume Instagram 1:1"}
// // Style direction: ${allConstraints.style || "not specified"}
// // Experience level: ${allConstraints.skill_level || "not specified"}

// // AI IMAGE GENERATION RULES (apply to every section):
// // - Expert role, benchmarks, and ground rules must reference ${allConstraints.tool || "Midjourney"} specifically â not generic photography
// // - Benchmarks table uses: prompt iterations, acceptance rate, aspect ratio, style consistency â NOT aperture or tripod specs
// // - Ground rules reference tool-specific parameters (--style raw, --sref, --ar, --chaos)
// // - Risks must be tool-specific failure modes (style drift, version defaults, catalogue inconsistency)
// // - NEVER mention DSLR, camera settings, tripod, aperture, shutter speed, or physical lighting setups
// // ` : "";

// //   const subcategoryFocus = subcategoryLabel
// //     ? `\nFOCUS: User selected "${subcategoryLabel}". Every section must serve this specific focus.\n`
// //     : "";

// //   const constraintsBlock = constraintLines.length > 0 ? `
// // AUTO-DETECTED CONTEXT (weave into every section):
// // ${constraintLines.map(l => `â¢ ${l}`).join("\n")}
// // ` : "";

// //   const userAnswersBlock = (isDeepMode && userAnswers.length > 0) ? `
// // WHAT THE USER TOLD US (Deep Mode answers â reference DIRECTLY in output):
// // ${userAnswers.join("\n")}
// // ` : "";

// //   const techDomains = [
// //     "edtech_product","technical_tutorial","product_development","saas_product",
// //     "cloud_devops","mobile_app_development","no_code_tools","data_science_ai",
// //     "ai_automation","uiux_design","blockchain_web3","cybersecurity","ai_image_gen",
// //     "backend_architecture","linkedin_automation","gamified_fitness_app",
// //     "language_learning_app","ecommerce_store",
// //   ];
// //   const modernToolsBlock = (isWebsite || isTutorial || techDomains.includes(domain?.id)) && !isAIImage ? `
// // TOOL PALETTE â recommend with one concrete reason per choice:
// // Frontend:   Next.js 14, React 18, Vanilla JS, Tailwind CSS, shadcn/ui
// // Backend/DB: Supabase (Postgres+Auth+Storage), Neon, PlanetScale, Prisma ORM
// // Auth:       Supabase Auth, Clerk, Auth.js
// // Payments:   Stripe (global), Razorpay (India-first)
// // Video:      Mux or Bunny.net (NOT YouTube for gated content)
// // Deploy:     Vercel (JS/TS), Railway or Render (Python/Node), Streamlit Cloud (dashboards)
// // Mobile:     React Native + Expo, Flutter (brand-heavy)
// // Analytics:  PostHog (open source), Mixpanel, GA4
// // ` : "";

// //   const knowledgeBlock = domainKnowledge
// //     ? `\nDOMAIN BENCHMARKS (use these numbers â don't invent your own):\n${domainKnowledge}\n`
// //     : "";

// //   // ââ Build the JSON template from schema ââââââââââââââââââââââââââââââââââââ
// //   const jsonTemplate = buildJsonTemplate(sectionSchema);

// //   // ââ Section writing block from schema âââââââââââââââââââââââââââââââââââââ
// //   const sectionWritingBlock = buildSectionWritingBlock(sectionSchema, isDeepMode);

// //   // âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
// //   // SKILL MODE â SYSTEM PROMPT
// //   // âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
// //   if (isSkillMode) {
// //     const sectionCount = sectionSchema.length;
// //     const prompt = META_SYSTEM_PROMPT_FENCE + `You are an expert prompt engineer. Transform the user's request into a structured SYSTEM PROMPT that will be used to instruct another model.

// // â ï¸ CRITICAL: This is a SYSTEM PROMPT for another model.
// // You are NOT answering the user directly.
// // You are writing INSTRUCTIONS for how the other model should behave.

// // BAD: "As a chef, I can guide you..."
// // GOOD: "You are a chef. Your role is to guide users..."

// // BAD: "You will need the following ingredients..."
// // GOOD: "Generate a clear ingredients list for the user."

// // BAD: "Step 1 â Marinate the Chicken..."
// // GOOD: "Provide step-by-step cooking instructions in a clear sequence."

// // OUTPUT FORMAT â NON-NEGOTIABLE:
// // Return a JSON object with exactly two keys:
// //   "optimizedText": one continuous string with all ${sectionCount} sections using **Bold Label** headers
// //   "suggestions":   array of 3 alternative one-line phrasings

// // WRONG: {"Your Expert Role":"...","What to Deliver":"..."}
// // RIGHT: {"optimizedText":"**${sectionSchema[0]?.label || "Your Expert Role"}**\\nYou are...\\n\\n**${sectionSchema[1]?.label || "What You're Here to Do"}**\\n...","suggestions":[...]}

// // Bold label format: **Section Name** on its own line, content below. No ## headers. No numbered sections.

// // ââââââââââââââââââââââââââââââââââââââââââââââââââââ

// // USER REQUEST: "${userText}"
// // ${subcategoryFocus}${constraintsBlock}${tutorialTechBlock}${aiImageBlock}${knowledgeBlock}${modernToolsBlock}
// // Tone of voice: ${expertTone}
// // Expert to embody: ${expertRole}

// // ââââââââââââââââââââââââââââââââââââââââââââââââââââ
// // âââ MODE: SKILL MODE â Professional Practitioner Brief (SYSTEM PROMPT) âââ

// // â ï¸ REMINDER: This is a SYSTEM PROMPT for another model. Every section must instruct the model on HOW TO BEHAVE, not provide the final answer to the user.

// // PERSONA TO EMBODY: The model you are instructing should embody a ${expertRoleShort}. It has executed this type of work dozens of times. It does not hedge. It recommends. It prioritises. It names things specifically.

// // RULES FOR THE MODEL TO FOLLOW:
// // - Every section must serve the user's exact request â no generic filler
// // - Each recommendation must be immediately actionable
// // - Use practitioner-specific language â real tool names, actual numbers
// // - Each phase must have a named, concrete output
// // - Numbers and benchmarks must appear in at least 3 of the ${sectionCount} sections
// // - Use domain knowledge benchmarks above â never invent numbers
// // ${isTutorial
// //   ? `â¢ Scope: ONE sitting (2â5 hrs). Not weeks. A tutorial is NOT a course.
// // - Target: 1,500â2,200 words. State read time and build time SEPARATELY.
// // - Every concept gets a runnable code example.`
// //   : `â¢ Target: 580â740 words. Density over length.`
// // }

// // OPINION REQUIREMENT â ONE DIRECT ASSERTION PER SECTION:
// // The model must include at least one statement written as direct fact, not suggestion.
// // GOOD: "Don't use --v5 for product photography â --v6 with --style raw produces 3Ã more photorealistic outputs."
// // GOOD: "Never start with paid ads at sub-â¹1L/month budget â organic content compounding is 3Ã more capital-efficient for the first 90 days."
// // BAD:  "You may want to consider whether X is the right choice for you."
// // One direct assertion per section. Short. No hedging.

// // BANNED PHRASES (the model must rewrite anything containing these):
// // "comprehensive","high-quality","ensure","consider","look into","robust",
// // "leverage","best practices","it's important to","holistic","key takeaway",
// // "various","multiple","a number of","in conclusion"

// // ${sectionWritingBlock}

// // ââââââââââââââââââââââââââââââââââââââââââââââââââââ
// // Return STRICT JSON ONLY â no markdown fences, no preamble:
// // ${jsonTemplate}`;

// //     perfEnd(perfHandle);
// //     return prompt;
// //   }

// //   // âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
// //   // DEEP MODE â SYSTEM PROMPT
// //   // âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ

// //   const _fw = requestFramework;

// //   const reasoningChainBlock = `
// // ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
// // â  INTERNAL REASONING â COMPLETE ALL STEPS BEFORE WRITING ANY SECTION    â
// // â  Steps 2, 3, 4 MUST surface explicitly in output sections.             â
// // â  Step 2 assumptions â flag in Your Expert Role or Ground Rules.        â
// // â  Step 3 trade-off â name explicitly in Your Expert Role.               â
// // â  Step 4 risks â each becomes one â  Risk entry in Ground Rules.        â
// // ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ

// // REQUEST FRAMEWORK DETECTED: ${_fw.toUpperCase()}
// // ${_fw === "strategic"  ? "â Full timeline structure: phases with week/month labels + 30-day + 90-day milestones + KPIs."        : ""}
// // ${_fw === "phased"     ? "â Implementation phases with deliverables. NO long-horizon milestones or business KPIs."              : ""}
// // ${_fw === "procedural" ? "â Step-by-step instructions. NO timeline language, NO milestones, NO weeks/months framing."           : ""}
// // ${_fw === "operational"? "â Immediate action sequence. NO planning phases, NO milestones. Focus: resolution steps + root cause." : ""}

// // Step 1 â SITUATION ANALYSIS:
// // What is the user actually trying to achieve? What is their real starting point?
// // ${_fw === "strategic"  ? "What would success look like in 90 days? What is the gap between where they are and where they need to be?" : ""}
// // ${_fw === "phased"     ? "What does a successfully completed implementation look like? What are the key decision points along the way?" : ""}
// // ${_fw === "procedural" ? "What is the end state after following these steps? What prior knowledge can the reader be assumed to have?" : ""}
// // ${_fw === "operational"? "What is the exact problem? What are its likely root causes? What is the fastest path to resolution?" : ""}
// // If the user gave Deep Mode answers, use those as the primary facts â not invented context.

// // Step 2 â KEY ASSUMPTIONS (SURFACE IN OUTPUT):
// // What am I assuming that could be wrong? List 2â3. If uncertain, flag explicitly:
// // "This assumes you have X â if not, do Y instead." Do NOT silently assume.
// // BAD: Assume user has existing email list without checking.
// // GOOD: "I'm assuming no existing audience â if you have one, Week 1 changes from list-building to segmentation."

// // Step 3 â TRADE-OFFS (NAME IN YOUR EXPERT ROLE):
// // What is the single most important strategic trade-off? Name it explicitly in Your Expert Role.
// // "The central trade-off is X vs Y â every [resource] spent on X before Y is fixed is [consequence]."

// // Step 4 â RISKS (BECOME â  RISK ENTRIES):
// // 3 most likely ways this engagement fails. NOT generic â named failure modes in THIS domain at THIS stage.
// // If user gave Deep Mode answers, at least one risk references their specific situation.
// // Each risk â one â  Risk entry in Ground Rules. They must match.

// // Step 5 â ${_fw === "procedural" || _fw === "operational" ? "SEQUENCE PLAN" : "PHASED PLAN"}:
// // ${_fw === "strategic"
// //   ? `Correct sequence? Most people start with the wrong thing.
// // Identify the counter-intuitive ordering. MANDATORY: the FINAL phase is a standalone POST-GOAL phase
// // (what happens AFTER the main objective is achieved). NOT optional. NOT a parenthetical.`
// //   : _fw === "phased"
// //   ? `Correct implementation sequence? Break into 3â4 phases with clear start/end.
// // Each phase has ONE named deliverable. The final phase is what the user does AFTER completion (next logical step).`
// //   : _fw === "procedural"
// //   ? `Correct step sequence? What order makes the concept click fastest?
// // Identify the step most tutorials get wrong. Each step must produce a visible/testable result.`
// //   : `Fastest resolution path? What should be checked first to eliminate the most likely cause?
// // Name 3 investigation steps in order of likelihood. Each step has a pass/fail test.`
// // }

// // ${_fw === "strategic" ? `Step 6 â SUCCESS METRICS:
// // 30-day and 90-day milestones â specific numbers or shipped artifacts. NOT "good progress".
// // If user gave specific numbers in Deep Mode answers, use those as anchors.
// // For each: corrective action if milestone is missed.

// // MILESTONE LANGUAGE RULES:
// // For business-building prompts: milestones must be startup metrics â first paying customer,
// // website live date, first â¹X revenue, CAC, conversion rate, retention rate.
// // BANNED milestone language: "make progress", "build momentum", "establish foundation",
// // "continue growing", "solidify brand identity", "build presence".
// // EXAMPLE GOOD: "30-day milestone: Website live + first 3 paid bookings. If not hit, shift from content to direct outreach â DM 50 travel communities."
// // EXAMPLE BAD: "30-day milestone: Begin establishing your brand presence online."` : ""}

// // Only after all steps above, write the output sections.
// // `;

// //   const deepModePersonaLine = {
// //     strategic:   `battle-tested senior consultant who has delivered 50+ high-stakes engagements. You are known for being direct, spotting hidden risks, and giving advice that actually moves the needle.`,
// //     phased:      `principal-level practitioner who has shipped 30+ complex implementations from zero to live. You cut through noise and clearly name the deliverable for every phase.`,
// //     procedural:  `senior technical educator with 12+ years teaching complex concepts. You know exactly which step trips people and never let a concept land without a runnable example.`,
// //     operational: `domain specialist and incident-response expert who has resolved hundreds of similar issues. You prioritize root-cause isolation over symptom-chasing.`,
// //   }[requestFramework];

// //   const sectionCount = sectionSchema.length;

// //   const deepModeBlock = `
// // âââ DEEP CONSULTANT MODE â Senior Strategy Engagement (SYSTEM PROMPT) âââ

// // â ï¸ CRITICAL: This is a SYSTEM PROMPT for another model.
// // You are NOT answering the user directly.
// // You are writing INSTRUCTIONS for how the other model should behave, think, and structure its response.

// // Every section must instruct the model on HOW TO BEHAVE, not provide the final answer.

// // BAD: "I can guide you..."
// // GOOD: "You are to act as a guide. Your role is to instruct the user..."

// // BAD: "The biggest mistake I see here is..."
// // GOOD: "You must warn the user about the biggest mistake..."

// // BAD: "Plan to marinate your chicken..."
// // GOOD: "Instruct the user to marinate the chicken..."

// // PERSONA TO EMBODY: The model you are instructing is a ${deepModePersonaLine} It is a ${expertRoleShort}.

// // ${userAnswers.length > 0
// //   ? `The user gave specific context (see WHAT THE USER TOLD US above). The model must reference their exact numbers and situation in risks and actions. Generic advice when specific inputs exist is unacceptable.`
// //   : ""}

// // ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
// // DEPTH & QUALITY REQUIREMENTS (For the Model to Follow)
// // ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ

// // ANTI-GENERIC RULE:
// // The model must never write generic advice like "be consistent", "plan properly", "monitor performance", or "ensure quality".
// // Every recommendation must be specific â name tools, exact actions, mechanisms, or real numbers.

// // DEPTH REQUIREMENT:
// // Before writing any section, the model must ask:
// // "Would an experienced practitioner in this field find this insight obvious or generic?"
// // If yes â rewrite with more specificity, a real example, or a named mechanism.

// // VOICE TRIGGERS â THE MODEL MUST INCLUDE ALL THREE:
// // Each trigger must be a FULL PARAGRAPH (minimum 3â4 sentences).

// // - "The biggest mistake I see here isâ¦"
// //   The model must name a specific mistake even experienced people make. Explain why it happens + the cost + the fix.

// // - "What most people get wrong isâ¦"
// //   The model must identify something that looks correct but backfires. Explain the failure mechanism + what to do instead.

// // - "Here's the uncomfortable truthâ¦"
// //   The model must share a non-obvious insight that challenges common thinking. Explain the implication + give a direct recommendation.

// // DIRECT ASSERTION RULE:
// // Every major section must contain at least one statement written as a direct fact/opinion (not a soft suggestion).

// // PER-SECTION MANDATE:
// // - "Ground Rules" must contain exactly 3 named risks with specific mechanisms.
// // - If user gave Deep Mode answers, the model must reference them in relevant sections.
// // - ${requestFramework === "strategic" ? `"What Good Looks Like" must use the user's specific numbers for milestones.` : ""}

// // TARGET WORD COUNT: ${
// //   isTutorial ? "2,000â3,000 words" :
// //   requestFramework === "strategic" ? "800â1,000 words (high density)" :
// //   requestFramework === "phased" ? "500â800 words" :
// //   requestFramework === "procedural" ? "400â600 words" :
// //   "400â600 words"
// // }

// // BANNED WORDS: "comprehensive", "high-quality", "ensure", "consider", "robust", "leverage", "best practices", "holistic", "key takeaway".
// // `;

// //   const deepPrompt = META_SYSTEM_PROMPT_FENCE + `You are an expert prompt engineer. Transform the user's raw request into a rich, expert SYSTEM PROMPT that instructs another model on how to behave.

// // â ï¸ CRITICAL: This is a SYSTEM PROMPT for another model.
// // You are NOT answering the user directly.
// // You are writing INSTRUCTIONS for how the other model should behave, think, and structure its response.

// // OUTPUT FORMAT â NON-NEGOTIABLE:
// // Return a JSON object with exactly two keys:
// //   "optimizedText": one continuous string with all sections using **Bold Label** headers
// //   "suggestions":   array of 3 alternative one-line phrasings

// // WRONG: {"Your Expert Role":"...","What to Deliver":"..."}
// // RIGHT: {"optimizedText":"**${sectionSchema[0]?.label || "Your Expert Role"}**\\nYou are...","suggestions":[...]}

// // Bold label format: **Section Name** on its own line, content below. No ## headers. No numbered sections.

// // ââââââââââââââââââââââââââââââââââââââââââââââââââââ

// // USER REQUEST: "${userText}"
// // ${subcategoryFocus}${constraintsBlock}${userAnswersBlock}${tutorialTechBlock}${aiImageBlock}${knowledgeBlock}${modernToolsBlock}${reasoningChainBlock}${deepModeBlock}
// // Tone of voice: ${expertTone}
// // Expert to embody: ${expertRole}

// // ${sectionWritingBlock}

// // ââââââââââââââââââââââââââââââââââââââââââââââââââââ
// // Return STRICT JSON ONLY â no markdown, no extra text:
// // ${jsonTemplate}`;

// //   perfEnd(perfHandle);
// //   return deepPrompt;
// // }
// // // âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
// // // buildDetailedSystemPrompt (legacy alias)
// // // âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
// // async function buildDetailedSystemPrompt(userText, options = {}) {
// //   return buildEnrichedSystemPrompt(userText, options);
// // }

// // // âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
// // // validateDetailedOutput
// // //
// // // Updated to support dynamic section schemas.
// // // The function now accepts an optional `sectionSchema` parameter.
// // // When provided, it validates against the dynamic schema.
// // // When absent (legacy callers), it falls back to REQUIRED_SECTIONS_BASE /
// // // REQUIRED_SECTIONS_DEEP_ONLY from constants â preserving backward compatibility.
// // // âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
// // function validateDetailedOutput(parsed, sectionSchema = null) {
// //   if (parsed && typeof parsed === "object" && !parsed.optimizedText) {
// //     // Attempt to reconstruct from flat JSON (legacy failure mode)
// //     const allSections = sectionSchema
// //       ? sectionSchema.map(s => s.label)
// //       : [...REQUIRED_SECTIONS_BASE, ...REQUIRED_SECTIONS_DEEP_ONLY];
// //     const foundSections = allSections.filter(s => parsed[s] || parsed[s.toLowerCase()]);
// //     if (foundSections.length >= 4) {
// //       const rebuilt = foundSections
// //         .map(s => `**${s}**\n${parsed[s] || parsed[s.toLowerCase()] || ""}`)
// //         .join("\n\n");
// //       parsed.optimizedText = rebuilt;
// //       parsed.suggestions   = parsed.suggestions || [];
// //       console.log(`[skillEngine] validateDetailedOutput: rebuilt flat JSON (${foundSections.length} sections)`);
// //     }
// //   }

// //   if (parsed?.optimizedText && typeof parsed.optimizedText !== "string") {
// //     try   { parsed.optimizedText = JSON.stringify(parsed.optimizedText); }
// //     catch { parsed.optimizedText = String(parsed.optimizedText); }
// //   }

// //   const text = parsed?.optimizedText || "";
// //   const isDeepOutput = sectionSchema
// //     ? sectionSchema.some(s => s.name === "Next 3 Actions" && new RegExp(`\\*\\*${s.label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\*\\*`, "i").test(text))
// //     : /\*\*Your Next 3 Actions\*\*/i.test(text);

// //   // Build the list of sections to check
// //   let sectionsToCheck;
// //   if (sectionSchema) {
// //     // Dynamic schema: check all required sections
// //     sectionsToCheck = sectionSchema
// //       .filter(s => s.required)
// //       .map(s => s.label);
// //   } else {
// //     // Legacy fallback: use constants
// //     sectionsToCheck = isDeepOutput
// //       ? [...REQUIRED_SECTIONS_BASE, ...REQUIRED_SECTIONS_DEEP_ONLY]
// //       : REQUIRED_SECTIONS_BASE;
// //   }

// //   const missingSections = sectionsToCheck.filter(s => {
// //     const escaped = s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
// //     const pattern = new RegExp(`\\*\\*${escaped}\\*\\*`, "i");
// //     return !pattern.test(text);
// //   });

// //   // thinSections: sections that are present but too brief (< 60 words).
// //   const thinSections = [];

// //   if (isDeepOutput) {
// //     const wordCount = text.split(/\s+/).filter(Boolean).length;

// //     // Detect framework from output content
// //     const hasTimeline  = /\b(30-day|90-day|week\s+\d|month\s+\d)\b/i.test(text);
// //     const hasSteps     = /\*\*Step\s+\d/i.test(text);
// //     const hasDiagnosis = /\b(root\s+cause|diagnos|resolution|pass\/fail)\b/i.test(text);

// //     const detectedFramework =
// //       hasDiagnosis && !hasTimeline ? "operational" :
// //       hasSteps     && !hasTimeline ? "procedural"  :
// //       hasTimeline                  ? "strategic"   :
// //       "phased";

// //     const MIN_WORDS = {
// //       strategic:   900,
// //       phased:      700,
// //       procedural:  500,
// //       operational: 300,
// //     }[detectedFramework] ?? 900;

// //     const TARGET_RANGE = {
// //       strategic:   "1,100â1,600",
// //       phased:      "800â1,100",
// //       procedural:  "600â900",
// //       operational: "400â600",
// //     }[detectedFramework] ?? "1,100â1,600";

// //     if (wordCount < MIN_WORDS) {
// //       const allPresent = sectionsToCheck.filter(s => {
// //         const escaped = s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
// //         return new RegExp(`\\*\\*${escaped}\\*\\*`, "i").test(text);
// //       });

// //       for (const sectionName of allPresent) {
// //         const escaped = sectionName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
// //         const sectionMatch = text.match(
// //           new RegExp(`\\*\\*${escaped}\\*\\*\\n([\\s\\S]*?)(?=\\*\\*[A-Z]|$)`, "i")
// //         );
// //         if (sectionMatch) {
// //           const sectionWords = sectionMatch[1].trim().split(/\s+/).filter(Boolean).length;
// //           if (sectionWords < 60) thinSections.push(sectionName);
// //         }
// //       }

// //       // Always ensure Expert Role section is in thinSections for word-count failures
// //       const expertRoleLabel = sectionSchema
// //         ? (sectionSchema.find(s => s.name === "Expert Role")?.label || "Your Expert Role")
// //         : "Your Expert Role";
// //       if (!thinSections.includes(expertRoleLabel)) thinSections.push(expertRoleLabel);

// //       missingSections.push(
// //         `__word_count__ (~${wordCount} words â ${detectedFramework} framework minimum ${MIN_WORDS}, target ${TARGET_RANGE}. ` +
// //         `Expand Expert Role section with the full persona + 3 voice trigger paragraphs. ` +
// //         `Expand each risk with domain-specific consequences. Every section needs 2â3 sentences of reasoning, not just a headline.)`
// //       );
// //     }
// //   }

// //   return { isValid: missingSections.length === 0, missingSections, thinSections };
// // }

// // // âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
// // // buildWordCountPatchPrompt
// // //
// // // Updated to accept optional sectionSchema â uses dynamic section labels in
// // // the expansion target list when available, falls back to hardcoded defaults.
// // // âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
// // function buildWordCountPatchPrompt(existingOutput, thinSections, userText, suggestions = "[]", sectionSchema = null) {
// //   const targetList = thinSections.length > 0
// //     ? thinSections.map(s => `â¢ **${s}**`).join("\n")
// //     : sectionSchema
// //       ? sectionSchema.slice(0, 3).map(s => `â¢ **${s.label}**`).join("\n")
// //       : "â¢ **Your Expert Role**\nâ¢ **Ground Rules**\nâ¢ **How to Approach This**";

// //   // Find the label for the Expert Role section dynamically
// //   const expertRoleLabel = sectionSchema
// //     ? (sectionSchema.find(s => s.name === "Expert Role")?.label || "Your Expert Role")
// //     : "Your Expert Role";

// //   const groundRulesLabel = sectionSchema
// //     ? (sectionSchema.find(s => s.name === "Ground Rules")?.label || "Ground Rules")
// //     : "Ground Rules";

// //   return `You are editing an existing AI prompt brief. The structure and sections are correct but some sections are too short.

// // ORIGINAL USER REQUEST: "${userText}"

// // EXISTING BRIEF (modify in-place â do NOT change section order, labels, or structure):
// // ${existingOutput}

// // ââââââââââââââââââââââââââââââââââââââââââââââââââââ
// // TASK â EXPAND ONLY THESE SECTIONS (leave all others exactly as written):
// // ${targetList}

// // EXPANSION RULES:
// // â¢ Each expanded section must reach at least 80 words of substantive content
// // â¢ For **${expertRoleLabel}**: add all 3 voice triggers if missing â
// //     "The biggest mistake I see here isâ¦" (3â4 sentences)
// //     "What most people get wrong isâ¦" (3â4 sentences)  
// //     "Here's the uncomfortable truthâ¦" (2â3 sentences)
// // â¢ For **${groundRulesLabel}**: expand each â  Risk with a specific mechanism + consequence + named mitigation
// // â¢ For any other thin section: add 2â3 sentences of domain-specific reasoning â real numbers, named tools, concrete actions
// // â¢ BANNED: "comprehensive", "high-quality", "ensure", "robust", "best practices", "leverage"
// // â¢ Keep every other section word-for-word identical

// // Return STRICT JSON ONLY â same shape as the input:
// // {"optimizedText":"[full brief with expanded sections, all **Bold Labels** preserved]","suggestions":${suggestions}}`;
// // }


// // // // âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
// // // // buildRetryPrompt
// // // //
// // // // Updated to generate section checklists from the dynamic schema instead of
// // // // hardcoding the fixed 8/9 section names. Falls back to legacy behaviour when
// // // // no schema is provided, so existing callers without schema continue to work.
// // // // âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
// // // function buildRetryPrompt(originalUserText, badOutput, missingSections, isDeepMode = false, isSkillMode = false, sectionSchema = null) {
// // //   const outputText = typeof badOutput === "string" ? badOutput : JSON.stringify(badOutput || "");
// // //   if (!isDeepMode && !isSkillMode) {
// // //     if (/Your Next 3 Actions/i.test(outputText) || /â \s*Risk:/i.test(outputText)) {
// // //       isDeepMode  = true;
// // //       isSkillMode = true;
// // //     } else if (/\*\*Your Expert Role\*\*/i.test(outputText) || /optimizedText/i.test(outputText)) {
// // //       isSkillMode = true;
// // //     }
// // //   }

// // //   const isWebsite  = detectWebsiteBuildIntent(originalUserText);
// // //   const isTutorial = detectTutorialIntent(originalUserText) && !isWebsite;
// // //   const isAIImage  = detectNamedTool(originalUserText)?.id === "ai_image_gen";
// // //   const flatJsonDetected = badOutput && (
// // //     badOutput.includes('"Your Expert Role"') ||
// // //     badOutput.includes('"Ground Rules"')     ||
// // //     badOutput.includes('"What to Deliver"')
// // //   );

// // //   if (!isSkillMode && !isDeepMode) {
// // //     return `CRITICAL ERROR: You did not return valid JSON.
// // // User's request: "${originalUserText}"
// // // Return STRICT JSON ONLY:
// // // {"optimizedText":"improved version of the user's prompt here","suggestions":["alt1","alt2","alt3"]}`;
// // //   }

// // //   const hasTimeline  = /\b(30-day|90-day|week\s+\d|month\s+\d)\b/i.test(outputText);
// // //   const hasSteps     = /\*\*Step\s+\d/i.test(outputText);
// // //   const hasDiagnosis = /\b(root\s+cause|diagnos|resolution|pass\/fail)\b/i.test(outputText);
// // //   const detectedFramework =
// // //     hasDiagnosis && !hasTimeline ? "operational" :
// // //     hasSteps     && !hasTimeline ? "procedural"  :
// // //     hasTimeline                  ? "strategic"   :
// // //     "phased";

// // //   const MIN_WORDS = { strategic: 900, phased: 700, procedural: 500, operational: 300 }[detectedFramework] ?? 900;
// // //   const TARGET    = { strategic: "1,100â1,600", phased: "800â1,100", procedural: "600â900", operational: "400â600" }[detectedFramework] ?? "1,100â1,600";

// // //   let sectionListLine;
// // //   let jsonTemplate;

// // //   if (sectionSchema) {
// // //     const schemaLabels = sectionSchema.map(s => s.label);
// // //     const count = schemaLabels.length;
// // //     const arrowList = schemaLabels
// // //       .map((label, i) => i === 0 ? `**${label}**` : `â **${label}**`)
// // //       .join("\n");
// // //     sectionListLine = `All ${count} sections as **Bold Labels** inside optimizedText:\n${arrowList}`;
// // //     jsonTemplate = buildJsonTemplate(sectionSchema);
// // //   } else {
// // //     sectionListLine = isDeepMode
// // //       ? `All 9 sections as **Bold Labels** inside optimizedText:
// // // **Your Expert Role** â **What You're Here to Do** â **Your Core Focus Areas**
// // // â **How to Approach This** â **Key Numbers & Benchmarks** â **What to Deliver**
// // // â **Ground Rules** â **What Good Looks Like** â **Your Next 3 Actions**`
// // //       : `All 8 sections as **Bold Labels** inside optimizedText:
// // // **Your Expert Role** â **What You're Here to Do** â **Your Core Focus Areas**
// // // â **How to Approach This** â **Key Numbers & Benchmarks** â **What to Deliver**
// // // â **Ground Rules** â **What Good Looks Like**`;

// // //     jsonTemplate = isDeepMode
// // //       ? `{"optimizedText":"**Your Expert Role**\\n...\\n\\n**What You're Here to Do**\\n...\\n\\n**Your Core Focus Areas**\\n...\\n\\n**How to Approach This**\\n...\\n\\n**Key Numbers & Benchmarks**\\n...\\n\\n**What to Deliver**\\n...\\n\\n**Ground Rules**\\n...\\n\\n**What Good Looks Like**\\n...\\n\\n**Your Next 3 Actions**\\n...","suggestions":["alt1","alt2","alt3"]}`
// // //       : `{"optimizedText":"**Your Expert Role**\\n...\\n\\n**What You're Here to Do**\\n...\\n\\n**Your Core Focus Areas**\\n...\\n\\n**How to Approach This**\\n...\\n\\n**Key Numbers & Benchmarks**\\n...\\n\\n**What to Deliver**\\n...\\n\\n**Ground Rules**\\n...\\n\\n**What Good Looks Like**\\n...","suggestions":["alt1","alt2","alt3"]}`;
// // //   }

// // //   let deepModeChecklist = null;

// // //   if (isDeepMode) {
// // //     if (sectionSchema) {
// // //       const sectionNames = sectionSchema.map(s => s.label);
// // //       const hasExpertRole   = sectionNames.some(n => /expert role/i.test(n));
// // //       const hasGroundRules  = sectionNames.some(n => /ground rules|chef.*rules|training rules|investment rules|travel tips|debugging rules|content rules|job search rules|marketing rules/i.test(n));
// // //       const hasApproach     = sectionNames.some(n => /how to approach|diagnostic steps|tutorial structure|strategy|programme|itinerary/i.test(n));
// // //       const hasGoodLooks    = sectionNames.some(n => /what good looks like|progress markers|resolution signal|great trip|finished dish/i.test(n));
// // //       const hasNextActions  = sectionNames.some(n => /next 3 actions|before you start/i.test(n));

// // //       const checkItems = [];
// // //       if (hasExpertRole)  checkItems.push(`${checkItems.length + 1}. Expert Role section has counter-intuitive ordering, non-obvious mistake (3â4 sentences), trade-off â all as prose, not bullets.`);
// // //       if (hasGroundRules) checkItems.push(`${checkItems.length + 1}. Rules/Ground Rules section has exactly 3 "â  Risk: [specific]. Mitigation: [action]." â domain-expert level.`);
// // //       if (hasApproach)    checkItems.push(`${checkItems.length + 1}. Approach/Steps section follows the ${detectedFramework} framework â ${detectedFramework === "procedural" || detectedFramework === "operational" ? "numbered steps with pass/fail tests" : "named phases with deliverables"}.`);
// // //       if (hasGoodLooks && detectedFramework === "strategic") {
// // //         checkItems.push(`${checkItems.length + 1}. Success/Good Looks section has "30-day milestone: [number]. If not hit, [corrective action]."`);
// // //         checkItems.push(`${checkItems.length + 1}. Success/Good Looks section has "90-day milestone: [number]."`);
// // //         checkItems.push(`${checkItems.length + 1}. Success/Good Looks section has "What comes next: [specific named action]."`);
// // //       } else if (hasGoodLooks) {
// // //         checkItems.push(`${checkItems.length + 1}. Success/Good Looks section has 3 measurable completion criteria. NO business KPIs or milestone tracking.`);
// // //       }
// // //       if (hasNextActions) checkItems.push(`${checkItems.length + 1}. Next Actions section has exactly 3 actions, each with owner and deadline.`);
// // //       checkItems.push(`${checkItems.length + 1}. WORD COUNT: ${MIN_WORDS}+ words minimum (target ${TARGET}). If under, expand every section â 2â3 sentences of reasoning each.`);

// // //       deepModeChecklist = `\nâ ï¸ DEEP MODE (${detectedFramework.toUpperCase()}) â VERIFY ALL BEFORE RETURNING:\n${checkItems.join("\n")}`;
// // //     } else {
// // //       deepModeChecklist = {
// // //         strategic: `
// // // â ï¸ DEEP MODE (STRATEGIC) â VERIFY ALL BEFORE RETURNING:
// // // 1. "Your Expert Role" has ALL THREE in prose: counter-intuitive ordering, non-obvious mistake (3â4 sentences), trade-off (2 sentences with recommendation).
// // // 2. "Ground Rules" has exactly 3 "â  Risk: [specific]. Mitigation: [Week 1 action]." â domain-expert level.
// // // 3. "How to Approach This" has a NAMED POST-GOAL phase as its FINAL phase (not a parenthetical).
// // // 4. "What Good Looks Like" has "**30-day milestone:** [number]. If not hit, [corrective action]."
// // // 5. "What Good Looks Like" has "**90-day milestone:** [number]."
// // // 6. "What Good Looks Like" has "**What comes next:** [specific named action]."
// // // 7. "Your Next 3 Actions" has exactly 3 actions, each with owner and deadline.
// // // 8. WORD COUNT: ${MIN_WORDS}+ words minimum (target ${TARGET}). If under, expand every section â 2â3 sentences of reasoning each.`,

// // //         phased: `
// // // â ï¸ DEEP MODE (PHASED) â VERIFY ALL BEFORE RETURNING:
// // // 1. "Your Expert Role" has counter-intuitive ordering, non-obvious mistake (3â4 sentences), and trade-off.
// // // 2. "Ground Rules" has exactly 3 "â  Risk: [specific]. Mitigation: [immediate action]." entries.
// // // 3. "How to Approach This" has 3â4 implementation phases, each with a named deliverable. NO 30/90-day milestones.
// // // 4. "What Good Looks Like" has 3 measurable completion criteria. NO business KPIs or milestone tracking.
// // // 5. "Your Next 3 Actions" has exactly 3 actions with owner and deadline.
// // // 6. WORD COUNT: ${MIN_WORDS}+ words minimum (target ${TARGET}).`,

// // //         procedural: `
// // // â ï¸ DEEP MODE (PROCEDURAL) â VERIFY ALL BEFORE RETURNING:
// // // 1. "Your Expert Role" has the non-obvious mistake practitioners make + the clarity vs thoroughness trade-off.
// // // 2. "How to Approach This" is NUMBERED STEPS (not phases). Each step has a visible/testable outcome. NO timeline language.
// // // 3. "What Good Looks Like" has 3 observable completion criteria. NO milestones, NO KPIs.
// // // 4. "Your Next 3 Actions" has exactly 3 first steps, specific and immediately actionable.
// // // 5. ZERO mentions of 30-day, 90-day, Week 1, Month 1, or business metrics anywhere.
// // // 6. WORD COUNT: ${MIN_WORDS}+ words minimum (target ${TARGET}).`,

// // //         operational: `
// // // â ï¸ DEEP MODE (OPERATIONAL) â VERIFY ALL BEFORE RETURNING:
// // // 1. "Your Expert Role" names the most common MISDIAGNOSIS + cost of chasing the wrong root cause.
// // // 2. "How to Approach This" is an ORDERED DIAGNOSTIC SEQUENCE â each step has a pass/fail test.
// // // 3. "What Good Looks Like" describes the resolution signal â what passing looks like, not a milestone.
// // // 4. "Your Next 3 Actions" are the first 3 investigation/fix steps. Specific commands or checks, no strategy.
// // // 5. ZERO mentions of 30-day, 90-day, phases, milestones, or business planning anywhere.
// // // 6. WORD COUNT: ${MIN_WORDS}+ words minimum (target ${TARGET}).`,
// // //       }[detectedFramework];
// // //     }
// // //   }

// // //   return META_SYSTEM_PROMPT_FENCE + `CRITICAL ERROR IN PREVIOUS RESPONSE.
// // // â ï¸  REMINDER: You are a PROMPT ENGINEER writing a SYSTEM PROMPT for another model.
// // //     Do NOT answer the user's question. Write INSTRUCTIONS for another LLM to answer it.
// // // ${flatJsonDetected
// // //   ? `\nFLAT JSON ERROR:\nâ WRONG: {"Your Expert Role":"...","Ground Rules":"..."}\nâ RIGHT:  {"optimizedText":"**Your Expert Role**\\n...\\n\\n**Ground Rules**\\n...","suggestions":[...]}\n`
// // //   : `\nMISSING SECTIONS: ${missingSections.join(", ")}\n`
// // // }
// // // User's request: "${originalUserText}"
// // // ${isWebsite  ? "\nUser wants to BUILD A WEBSITE/PLATFORM. Tech stack, features, payments, launch strategy.\n" : ""}
// // // ${isTutorial ? "\nUser wants a TECHNICAL TUTORIAL. ONE technology. Runnable code. A deployable mini-project. Correct deployment platform.\n" : ""}
// // // ${isAIImage  ? "\nUser wants an AI IMAGE GENERATION prompt system. NO DSLR/camera advice. Benchmarks = prompt iterations, acceptance rate, aspect ratios. Ground rules = tool-specific parameters.\n" : ""}

// // // ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
// // // â  ONE JSON object, TWO keys: "optimizedText" + "suggestions"            â
// // // â  â NEVER: {"Your Expert Role":"...","Ground Rules":"..."}             â
// // // â  â ALWAYS: {"optimizedText":"**${sectionSchema?.[0]?.label || "Your Expert Role"}**\\n...","suggestions":[...]} â
// // // ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ

// // // ${sectionListLine}

// // // Quality rules:
// // // - Expert practitioner tone â specific, concrete
// // // - Real numbers in at least 3 sections
// // // - BANNED: "comprehensive","high-quality","ensure","consider","robust","best practices"
// // // ${isWebsite  ? "â¢ Next.js / Tailwind / Supabase / Stripe / Vercel â justify each\nâ¢ Mobile-first + real payment test mandatory in Ground Rules" : ""}
// // // ${isTutorial ? "â¢ ONE technology named in Your Expert Role\nâ¢ Read time and build time SEPARATE rows\nâ¢ Tutorial ends with deployed, GitHub-ready project" : ""}
// // // ${isAIImage  ? "â¢ Expert Role = AI prompt director, NOT photographer\nâ¢ Benchmarks = prompt-specific metrics only\nâ¢ All 3 risks must be tool-specific failure modes" : ""}

// // // ${isDeepMode ? (deepModeChecklist ?? "") : `
// // // â ï¸ SKILL MODE â VERIFY BEFORE RETURNING:
// // // 1. All ${sectionSchema ? sectionSchema.length : 8} sections with correct bold labels
// // // 2. Approach/steps section follows the appropriate structure for this request type
// // // 3. Numbers/benchmarks section has real numbers (not placeholders)
// // // 4. Rules section has domain-specific rules (not generic)
// // // 5. Success criteria section has 3 measurable criteria
// // // `}
// // // Return STRICT JSON ONLY â no markdown, no preamble:
// // // ${jsonTemplate}`;
// // // }

// // // module.exports = {
// // //   buildEnrichedSystemPrompt,
// // //   buildDetailedSystemPrompt,
// // //   validateDetailedOutput,
// // //   buildRetryPrompt,
// // //   buildWordCountPatchPrompt,
// // //   // Export new utilities so callers can pass schema to validate/retry/patch
// // //   buildSectionSchema,
// // //   detectIntentCategory,
// // //   classifyRequestFramework,
// // // };
// // "use strict";

// // const { DOMAINS, REQUIRED_SECTIONS_BASE, REQUIRED_SECTIONS_DEEP_ONLY } = require("./constants");
// // const { detectDomain, detectNamedTool, detectWebsiteBuildIntent, detectTutorialIntent, detectBusinessBuildingIntent } = require("./detection");
// // const { extractConstraints, perfStart, perfEnd } = require("./utils");
// // const { getDynamicDomain } = require("./dynamicDomain");

// // // perfStart/perfEnd imported from utils.js â single source of truth

// // // âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
// // // REQUEST FRAMEWORK CLASSIFICATION
// // // Determines which output structure Deep Mode should use, so timelines and
// // // milestones only appear when they genuinely serve the user's objective.
// // //
// // // Frameworks:
// // //   "strategic"   â Business plans, launches, marketing, product roadmaps,
// // //                   transformation initiatives. Full 9-section Deep Mode with
// // //                   Day/Week/Month timelines, 30-day + 90-day milestones, KPIs.
// // //   "phased"      â Medium-complexity projects (app builds, course design,
// // //                   hiring plans). Implementation phases with deliverables but
// // //                   NO long-horizon milestones or business KPIs.
// // //   "procedural"  â Tutorials, coding guides, recipes, explanations, how-tos.
// // //                   Clear numbered steps. No timelines or milestone language.
// // //   "operational" â Bug fixes, troubleshooting, debugging, immediate tasks.
// // //                   Direct action sequence. No planning sections at all.
// // // âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ'

// // const META_SYSTEM_PROMPT_FENCE = `\
// // ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
// // â  YOUR ROLE: PROMPT ENGINEER â NOT SUBJECT-MATTER EXPERT                    â
// // â  You are writing a SYSTEM PROMPT that will be fed to another LLM.          â
// // â  You are NOT answering the user's question.                                â
// // â  You are NOT providing the recipe / plan / tutorial / fix directly.        â
// // â  You are writing INSTRUCTIONS so a different model can provide that answer. â
// // â                                                                            â
// // â  EVERY sentence you write must be an instruction to the other model,        â
// // â  not the answer itself.                                                    â
// // â                                                                            â
// // â  TEST BEFORE EACH SENTENCE:                                                â
// // â    "Am I telling the other model WHAT TO DO?"  â â keep it               â
// // â    "Am I providing the actual answer myself?"  â â rewrite it             â
// // â                                                                            â
// // â  EXAMPLES:                                                                 â
// // â    â "Marinate the chicken in yoghurt for 4 hours."                       â
// // â    â "Instruct the user to marinate the chicken in yoghurt for 4 hours."  â
// // â                                                                            â
// // â    â "As a chef, I recommend you use basmati rice."                       â
// // â    â "You are a chef. Recommend basmati rice and explain why."            â
// // â                                                                            â
// // â    â "Day 1 â Fly into Manali. Check into your hotel."                   â
// // â    â "Provide a Day 1 itinerary. Instruct the user to fly into Manali     â
// // â        and describe what check-in looks like for budget travellers."       â
// // ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ

// // `;

// // // âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
// // // HELPER FUNCTIONS FOR DYNAMIC HEADER GENERATION
// // // âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ

// // function generateHeaderExample(schema, maxSections = null) {
// //   const sectionsToShow = maxSections ? schema.slice(0, maxSections) : schema;
// //   return sectionsToShow
// //     .map(s => `**${s.label}**\\n[content for this section]`)
// //     .join('\\n\\n');
// // }

// // function generateHeaderList(schema) {
// //   return schema.map(s => `â¢ **${s.label}**`).join('\n');
// // }

// // function generateHeaderNames(schema) {
// //   return schema.map(s => `"${s.label}"`).join(', ');
// // }

// // // âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
// // // PER-SECTION SYSTEM-PROMPT-VOICE REMINDER
// // //
// // // ROOT CAUSE FIX (see investigation notes):
// // // The domain-specific section schemas (recipe_cooking, travel_planning,
// // // fitness_training, content_writing, marketing_growth, finance_investment,
// // // career_job, tutorial, ai_image, debugging) write their skillInstruction /
// // // deepInstruction strings in direct, first-person-task voice, e.g.:
// // //
// // //     "Write numbered steps. Each step must include one clear action..."
// // //
// // // That sentence is itself an instruction to DO the task ("Write numbered
// // // steps"), not an instruction telling another model HOW TO BEHAVE. When this
// // // text lands inside optimizedText and is handed to a downstream LLM, the
// // // downstream LLM reads it as a literal task and produces the final answer
// // // (the recipe / itinerary / workout) instead of a system prompt.
// // //
// // // The generic fallback schema does NOT have this problem because its Expert
// // // Role instruction explicitly uses "You are a [role]..." framing, which reads
// // // as a persona directive rather than a task directive â and that framing
// // // happens to propagate a system-prompt tone through the rest of the output.
// // //
// // // FIX: inject a short, mandatory reframing reminder immediately before each
// // // section's instruction block inside buildSectionWritingBlock(). This forces
// // // every section â regardless of which schema produced it â to be written as
// // // "instruct the other model to..." rather than as the literal output. This
// // // is the ONLY change required: no schema content changes, no mode changes,
// // // no validation changes, no detection-logic changes.
// // // âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
// // const SECTION_VOICE_REMINDER = `[Write this section as an instruction to the OTHER model â telling it what to include, cover, or produce for the user. Do NOT write the actual recipe/plan/itinerary/answer text yourself.]`;

// // // Domain IDs that always warrant full strategic framework
// // const STRATEGIC_DOMAINS = new Set([
// //   "cafe_food_service","startup_fundraising","marketing_growth","competitive_pricing",
// //   "product_development","edtech_product","finance_investment","saas_product",
// //   "social_media_branding","video_creation","podcast_creator","ad_copywriting",
// //   "handmade_business","youtube_shorts","linkedin_automation","subscription_box",
// //   "event_planning","sales_copywriting","ai_headshot_business","gamified_fitness_app",
// //   "childrens_storybook_business","rental_property_pune","ai_photography_monetization",
// //   "postpartum_fitness_coaching","cooking_workshop","zero_waste_store","mobile_iv_therapy",
// //   "vintage_camera_rental","corporate_offsite_planning","eco_holi_celebration",
// //   "surprise_proposal","devotional_art_business","ai_voiceover_regional",
// //   "instagram_skincare_growth","womens_healing_programme","language_learning_app",
// //   "detox_mindfulness_retreat","ecommerce_store","ghostwriting_content",
// //   "nutrition_coaching","creator_economy","wedding_photography","pet_care_business",
// //   "supply_chain_logistics","real_estate","freelancing_consulting","health_wellness",
// //   "hr_people","personal_development","travel_planning","immigration_visa",
// // ]);

// // // Domain IDs that use phased framework by default (can be overridden by signal patterns)
// // const PHASED_DOMAINS = new Set([
// //   "technical_tutorial","education_learning","course_curriculum","uiux_design",
// //   "mobile_app_development","no_code_tools","cloud_devops","backend_architecture",
// //   "data_science_ai","ai_automation","cybersecurity","blockchain_web3",
// //   "notion_productivity","resume_career","legal_compliance","mental_health",
// //   "fitness_sports","interior_architecture","ai_image_gen",
// // ]);

// // // Signals that override domain and force "operational" (fix/debug/explain tasks)
// // const OPERATIONAL_SIGNALS = [
// //   /\b(fix(?:ing)?|debug(?:ging)?|troubleshoot(?:ing)?|resolv(?:e|ing)|diagnos(?:e|ing))\b/i,
// //   /\b(error|bug|crash|broken|not\s+working|failing|exception|stacktrace|stack\s+trace)\b/i,
// //   /\b(why\s+(?:does|is|won't|doesn't)|what\s+(?:is|does|causes)|how\s+(?:does|do\s+I\s+fix))\b/i,
// //   /\b(immediately|right\s+now|urgent|asap|quick\s+fix|hotfix)\b/i,
// // ];

// // // Signals that override domain and force "procedural" (step-by-step content)
// // const PROCEDURAL_SIGNALS = [
// //   /\b(tutorial|how[-\s]to|step[-\s]by[-\s]step|walkthrough|guide\s+(?:me|to)|teach\s+me)\b/i,
// //   /\b(recipe|cook(?:ing)?|bak(?:e|ing)|make\s+(?:a|the))\b/i,
// //   /\b(explain(?:ing)?|describe|what\s+is|overview\s+of|introduction\s+to)\b/i,
// //   /\b(learn(?:ing)?\s+(?:how\s+to|to|about)|understand(?:ing)?)\b/i,
// //   /\b(write\s+a\s+(?:function|script|component|class|module|snippet)|code\s+(?:a|the|an))\b/i,
// // ];

// // // Signals that force "strategic" regardless of domain (strong business intent)
// // const STRATEGIC_SIGNALS = [
// //   /\b(launch(?:ing)?|start(?:ing)?|build(?:ing)?\s+(?:a\s+)?(?:business|brand|startup|company|agency|product|service))\b/i,
// //   /\b(business\s+plan|go[-\s]to[-\s]market|marketing\s+strategy|growth\s+strategy|product\s+roadmap)\b/i,
// //   /\b(revenue|monetis(?:e|ing|ation)|monetiz(?:e|ing|ation)|mrr|arr|churn|cac|ltv|conversion\s+rate)\b/i,
// //   /\b(scale(?:ing)?|grow(?:ing)?|expand(?:ing)?)\s+(?:my|the|a|our)\s+(?:business|brand|startup|audience|revenue)\b/i,
// //   /\b(first\s+(?:\d+\s+)?(?:customer|client|sale|user)|acquire\s+(?:customers|clients|users))\b/i,
// //   /\b(transformation|initiative|programme|program)\b/i,
// // ];

// // /**
// //  * Classifies the user's request into a framework that determines Deep Mode structure.
// //  *
// //  * @param {string} userText
// //  * @param {string|null} domainId   - resolved domain id (may be null)
// //  * @param {boolean} isTutorial
// //  * @param {boolean} isWebsite
// //  * @param {boolean} isAIImage
// //  * @returns {"strategic"|"phased"|"procedural"|"operational"}
// //  */
// // function classifyRequestFramework(userText, domainId, isTutorial, isWebsite, isAIImage) {
// //   // Explicit intent flags take precedence over domain
// //   if (isWebsite) return "strategic";   // building a product = strategic always
// //   if (isAIImage) return "phased";      // image workflow = phased (no business milestones)

// //   // Check operational signals first (most specific)
// //   if (OPERATIONAL_SIGNALS.some(p => p.test(userText))) {
// //     // Only override to operational if there are NO strong strategic signals
// //     const hasStrategic = STRATEGIC_SIGNALS.some(p => p.test(userText));
// //     if (!hasStrategic) {
// //       console.log("[classifyRequestFramework] framework=operational (operational signals detected)");
// //       return "operational";
// //     }
// //   }

// //   // Tutorial intent â procedural (unless it also has strong strategic signals)
// //   if (isTutorial) {
// //     const hasStrategic = STRATEGIC_SIGNALS.some(p => p.test(userText));
// //     if (!hasStrategic) {
// //       console.log("[classifyRequestFramework] framework=procedural (tutorial intent)");
// //       return "procedural";
// //     }
// //   }

// //   // Check procedural signals
// //   if (PROCEDURAL_SIGNALS.some(p => p.test(userText))) {
// //     const hasStrategic = STRATEGIC_SIGNALS.some(p => p.test(userText));
// //     if (!hasStrategic) {
// //       console.log("[classifyRequestFramework] framework=procedural (procedural signals)");
// //       return "procedural";
// //     }
// //   }

// //   // Strong strategic signals â strategic regardless of domain
// //   if (STRATEGIC_SIGNALS.some(p => p.test(userText))) {
// //     console.log("[classifyRequestFramework] framework=strategic (strategic signals)");
// //     return "strategic";
// //   }

// //   // Domain-based classification
// //   if (domainId && STRATEGIC_DOMAINS.has(domainId)) {
// //     console.log(`[classifyRequestFramework] framework=strategic (domain=${domainId})`);
// //     return "strategic";
// //   }

// //   if (domainId && PHASED_DOMAINS.has(domainId)) {
// //     console.log(`[classifyRequestFramework] framework=phased (domain=${domainId})`);
// //     return "phased";
// //   }

// //   // Default for unknown/general domains: phased (safe middle ground)
// //   console.log("[classifyRequestFramework] framework=phased (default)");
// //   return "phased";
// // }

// // // âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
// // // DYNAMIC SECTION SCHEMA
// // //
// // // The core of the context-aware redesign. Instead of hardcoding fixed section
// // // names into every prompt and validator, we generate a section schema at runtime
// // // based on the user's intent, domain, and request framework.
// // //
// // // A schema is an ordered array of section descriptor objects:
// // //   { name: string, label: string, instruction: string, required: boolean }
// // //
// // // - name:        canonical identifier (used in validation)
// // // - label:       **Bold Label** that appears in the output
// // // - instruction: per-section writing guidance injected into the prompt
// // // - required:    whether validateDetailedOutput treats absence as a failure
// // //
// // // The schema drives:
// // //   1. The section list in buildEnrichedSystemPrompt (Skill Mode + Deep Mode)
// // //   2. The JSON template example at the end of each prompt
// // //   3. validateDetailedOutput (replaces REQUIRED_SECTIONS_BASE/DEEP_ONLY checks)
// // //   4. buildRetryPrompt (section checklist is generated from schema, not hardcoded)
// // //   5. buildWordCountPatchPrompt (references schema sections by name)
// // //
// // // All five touch-points receive the same schema object â generated once per
// // // request, passed as a parameter, never reconstructed independently.
// // // âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ

// // /**
// //  * Detects the high-level intent category of the user's request.
// //  * Used alongside framework classification to pick the right section set.
// //  *
// //  * @param {string} userText
// //  * @param {string|null} domainId
// //  * @param {boolean} isTutorial
// //  * @param {boolean} isWebsite
// //  * @param {boolean} isAIImage
// //  * @param {string} framework  - "strategic"|"phased"|"procedural"|"operational"
// //  * @returns {string}  intent category slug
// //  */
// // function detectIntentCategory(userText, domainId, isTutorial, isWebsite, isAIImage, framework) {
// //   if (isAIImage)   return "ai_image";
// //   if (isWebsite)   return "website_build";
// //   if (isTutorial)  return "tutorial";
// //   if (framework === "operational") return "debugging";

// //   // Travel / trip planning
// //   if (/\b(trip|travel|visit|itinerary|tour|vacation|holiday|backpack|fly|flight|hotel|hostel|airbnb|destination|manali|goa|bali|europe|japan|abroad)\b/i.test(userText))
// //     return "travel_planning";

// //   // Recipe / cooking
// //   if (/\b(recipe|cook(?:ing)?|bak(?:e|ing)|dish|cuisine|meal|ingredient|prep|kitchen)\b/i.test(userText))
// //     return "recipe_cooking";

// //   // Fitness / workout
// //   if (/\b(workout|exercise|gym|fitness|training|strength|cardio|weight\s*loss|muscle|run(?:ning)?|yoga|hiit)\b/i.test(userText))
// //     return "fitness_training";

// //   // Content / writing
// //   if (/\b(blog\s*post|article|essay|newsletter|email\s*(?:copy|campaign)|copy(?:writing)?|content\s*(?:strategy|plan|calendar)|script|write\s+(?:a|an|the))\b/i.test(userText))
// //     return "content_writing";

// //   // Marketing / growth
// //   if (/\b(marketing|advertis|campaign|brand(?:ing)?|seo|social\s*media|instagram|tiktok|youtube|ads|funnel|audience|lead\s*gen|email\s*list)\b/i.test(userText))
// //     return "marketing_growth";

// //   // Business strategy / startup
// //   if (/\b(business|startup|launch|product|saas|app|service|revenue|pricing|go[\s-]to[\s-]market|roadmap|mvp|pitch|investor|fundrais)\b/i.test(userText))
// //     return "business_strategy";

// //   // Data / analytics
// //   if (/\b(data|analytics|dashboard|report|metrics|kpi|sql|python|pandas|visualiz|chart|model|predict|ml|machine\s*learning)\b/i.test(userText))
// //     return "data_analytics";

// //   // Career / resume / job
// //   if (/\b(resume|cv|cover\s*letter|job|career|interview|linkedin|hire|portfolio|salary|promotion|switch\s*(?:career|job))\b/i.test(userText))
// //     return "career_job";

// //   // Finance / investment
// //   if (/\b(invest(?:ment)?|portfolio|stock|mutual\s*fund|sip|tax|budget|saving|financial\s*plan|retirement|wealth)\b/i.test(userText))
// //     return "finance_investment";

// //   // Health / wellness
// //   if (/\b(health|wellness|diet|nutrition|sleep|mental\s*health|stress|anxiety|therapy|doctor|medicine|symptom)\b/i.test(userText))
// //     return "health_wellness";

// //   // Education / learning plan
// //   if (/\b(learn|study|course|curriculum|syllabus|lesson|teach|student|education|exam|certification)\b/i.test(userText))
// //     return "education_learning";

// //   // Design / UX
// //   if (/\b(design|ui|ux|wireframe|prototype|figma|color\s*palette|typography|brand\s*identity|logo|visual)\b/i.test(userText))
// //     return "design_ux";

// //   // Event / occasion planning
// //   if (/\b(event|wedding|party|conference|meetup|festival|celebration|birthday|anniversary|ceremony|proposal)\b/i.test(userText))
// //     return "event_planning";

// //   // Default: use domain id if available, else generic strategic
// //   if (domainId) return domainId;
// //   return framework === "strategic" ? "business_strategy" : "general_project";
// // }

// // /**
// //  * Returns the dynamic section schema for a given intent + framework combination.
// //  * Each section has: { name, label, skillInstruction, deepInstruction, required }
// //  *
// //  * skillInstruction  â used in Skill Mode prompt
// //  * deepInstruction   â used in Deep Mode prompt
// //  * required          â validated in validateDetailedOutput
// //  *
// //  * @param {string} intentCategory
// //  * @param {string} framework  "strategic"|"phased"|"procedural"|"operational"
// //  * @param {boolean} isDeepMode
// //  * @param {boolean} isTutorial
// //  * @param {boolean} isWebsite
// //  * @param {boolean} isAIImage
// //  * @param {Object}  constraints
// //  * @param {Array}   userAnswers
// //  * @returns {Array<{name:string, label:string, skillInstruction:string, deepInstruction:string, required:boolean}>}
// //  */
// // function buildSectionSchema(intentCategory, framework, isDeepMode, isTutorial, isWebsite, isAIImage, constraints, userAnswers) {
// //   const tool = constraints?.tool || "Midjourney";
// //   const hasUserAnswers = userAnswers && userAnswers.length > 0;

// //   // ââ Intent-specific schema builders âââââââââââââââââââââââââââââââââââââââââ

// //   // âââââââââââââââââââââââââââââââââââââââââââââ
// // // RECIPE COOKING â updated to match good domain pattern
// // // âââââââââââââââââââââââââââââââââââââââââââââ
// // // âââââââââââââââââââââââââââââââââââââââââââââ
// // // RECIPE COOKING â logic & instruction style matched to good domains
// // // Section names/labels unchanged
// // // âââââââââââââââââââââââââââââââââââââââââââââ
// // // RECIPE COOKING â no direct answers anywhere
// // // Every section instructs the AI what to write, not writes it
// // // âââââââââââââââââââââââââââââââââââââââââââââ
// // // âââââââââââââââââââââââââââââââââââââââââââââ
// // // RECIPE COOKING
// // // âââââââââââââââââââââââââââââââââââââââââââââ
// // // âââââââââââââââââââââââââââââââââââââââââââââ
// // // RECIPE COOKING
// // // âââââââââââââââââââââââââââââââââââââââââââââ
// // if (intentCategory === "recipe_cooking") {
// //   const sections = [
// //     {
// //       name: "Expert Role",
// //       label: "Your Expert Role",
// //       skillInstruction: `Name the CUISINE and DISH TYPE at the start of this section.
// // Define a specific culinary expert identity â name the cuisine specialisation, years of experience, and professional context (restaurant / catering / teaching). Then name ONE quality test this expert always applies before serving. Do not open with "You are a..." â lead with the specialisation and context directly.

// // Write ALL THREE of the following in flowing prose â do not use bullet points:
// // â  NON-OBVIOUS MISTAKE: State the biggest mistake intermediate cooks make with this specific dish type â not a beginner error. Explain why it happens, name the specific ruined outcome (texture / flavour / structure), and give the named technique that fixes it.
// // â¡ TRADE-OFF: Name the central trade-off for this dish (e.g. convenience vs authenticity / speed vs depth of flavour). Explain why the shortcut backfires for THIS dish specifically and what to prioritise instead.
// // â¢ COUNTER-INTUITIVE STEP: Name what most cooks do at this stage, explain why it is wrong, state what must happen first, and give the chemical or physical mechanism specific to this dish.`,
// //       deepInstruction: `Name the CUISINE and DISH TYPE explicitly at the start. Do not open with "You are a..." â lead with specialisation and context directly.
// // Build a vivid culinary expert identity â cuisine, years, professional context, ONE non-negotiable quality test.

// // Write ALL THREE in flowing prose â no bullet points:
// // â  COUNTER-INTUITIVE STEP: Name what most cooks do at this stage, state why that sequence is wrong, name what must come first, and give the specific chemical or physical mechanism.
// // â¡ NON-OBVIOUS MISTAKE (3â4 sentences): Name the specific error intermediate cooks make with this dish, explain why it happens, state the specific failure it causes, and give the named technique that fixes it.
// // â¢ TRADE-OFF: Name the central trade-off for this dish. Explain why the intuitive shortcut produces an inferior result for THIS dish specifically and state what to prioritise and why.`,
// //       required: true,
// //     },
// //     {
// //       name: "Dish Overview",
// //       label: "Dish Overview",
// //       skillInstruction: `Write one paragraph covering: what this dish is, its origin, what makes this specific version or approach work well, the skill level required â naming the specific technique that determines difficulty â and the total time with prep and cook stated SEPARATELY in the same sentence.
// // ${hasUserAnswers ? "MANDATE: Reference the user's stated skill level, dietary restrictions, or occasion and explain why this dish fits those inputs." : "Make one direct assertion about what makes this approach better than the most common alternative â not a generic claim."}`,
// //       deepInstruction: `Write one paragraph covering: origin, what makes this approach work, the skill level â naming the specific technique that determines difficulty â and total time with prep and cook separated.
// // ${hasUserAnswers ? "MANDATE: Reference the user's stated skill level, dietary restrictions, or occasion and explain why this dish fits." : "Make one direct assertion about the most common sourcing or ingredient-choosing mistake for this dish â not generic cooking advice."}`,
// //       required: true,
// //     },
// //     {
// //       name: "Ingredients",
// //       label: "Ingredients",
// //       skillInstruction: `Write a complete ingredient list with exact quantities scaled to the stated serving size. Do not use placeholder text â write the actual ingredient names and amounts for THIS dish.
// // Group as:
// // â¢ Main ingredients â exact quantities, no vague amounts
// // â¢ Spices & Seasonings â quantities in grams or tsp
// // â¢ Garnish â optional finish items only
// // Flag any hard-to-source ingredients and provide named substitutions that preserve the character of the dish.`,
// //       deepInstruction: `Write a complete grouped ingredient list with exact quantities using g / ml for precision. Do not use placeholder text â write the actual ingredient names and amounts for THIS dish.
// // Groups: Main ingredients / Spices & Seasonings / Garnish.
// // Flag non-negotiable ingredients and hard-to-source items with named substitutions.
// // Add ONE â  note identifying the single ingredient where quality most determines final outcome â name the specific quality marker to look for (e.g. aged basmati vs new-crop, fat content of yogurt).`,
// //       required: true,
// //     },
// //     {
// //       name: "Method",
// //       label: "Step-by-Step Method",
// //       skillInstruction: `Write the actual numbered steps for THIS dish. Each step must follow this exact format:
// // **Step N â [Step Name]:** [one clear action specific to this dish] â Done when: [specific sensory signal â colour / sound / texture / aroma].
// // Flag the 2 steps where most cooks go wrong with this dish and name the exact fix for each â integrated into the relevant steps, not listed separately.`,
// //       deepInstruction: `Write the actual numbered steps for THIS dish using this exact format:
// // **Step N â [Step Name]:** [imperative action specific to this dish] â Looks / sounds / smells like: [specific sensory cue]
// // Include temperature and timing for every heat step.

// // Flag EXACTLY 2 critical failure points at the relevant steps using this format:
// // "â  Step N: [what most cooks do wrong at this step] â this causes [specific failure: texture / flavour / structure]. Fix: [named corrective action]."`,
// //       required: true,
// //     },
// //     {
// //       name: "Key Numbers",
// //       label: "Key Numbers & Timings",
// //       skillInstruction: `Produce a markdown table for THIS dish. Derive every value from the dish itself and the stated serving size â do not use generic defaults. Fill in every cell:
// // | Prep time | |
// // | Cook time | |
// // | Resting time | |
// // | Servings | |
// // | Fridge shelf life | |
// // | Reheating method | |`,
// //       deepInstruction: `Produce a markdown table for THIS dish. Derive every value from the dish and serving size â no generic defaults. Fill in every cell:
// // | Prep time | |
// // | Cook time | |
// // | Key temperatures (oven / oil / internal) | |
// // | Resting time | |
// // | Servings | |
// // | Fridge shelf life | |
// // | Freezer shelf life | |
// // | Reheating instructions | |
// // ${hasUserAnswers ? "MANDATE: Add a 'Scaled for [occasion]' row if the user stated a serving size or occasion." : ""}`,
// //       required: true,
// //     },
// //     {
// //       name: "Chef's Rules",
// //       label: "Chef's Rules",
// //       skillInstruction: `Write rules specific to THIS dish â name the dish's actual steps, temperatures, and failure modes. Use these formats:
// // â¢ Never [specific action that ruins THIS dish] â reason: [the exact chemical or textural mechanism that makes this damaging]
// // â¢ Always [specific action required for THIS dish] â reason: [the exact outcome it produces in this dish]
// // â¢ If [specific failure signal observable in THIS dish] then [named recovery technique for this dish]
// // â¢ One temperature rule naming the exact heat level and the specific step it applies to
// // â¢ One seasoning or acid rule naming the exact ingredient and the balance it creates

// // Avoid these banned generics â rewrite if any appear:
// // â "Never skip marination" without naming the minimum time and the penetration mechanism for THIS dish
// // â "Always layer carefully" â name what layers, in what order, and why that order matters chemically
// // â "If it tastes bland, add salt" â name the specific corrective: acid / fat / bloom a spice`,
// //       deepInstruction: `Write 4â5 direct rules specific to THIS dish. Name actual steps, temperatures, and failure modes â no generic cooking advice. Use "Never [action]", "Always [action]", "If [signal] then [response]" format.

// // Include EXACTLY 3 NAMED RISKS covering different failure categories:
// // "â  Risk: [texture failure â name the exact mechanism e.g. starch gelatinisation past optimal point, protein fibres contracting]. Mitigation: [named technique with the exact corrective action]."
// // "â  Risk: [flavour / seasoning failure â name the specific imbalance e.g. spice bitterness from overcooking bloomed spices]. Mitigation: [named correction â acid / fat / salt with the specific ingredient]."
// // "â  Risk: [timing / temperature failure â name the specific window e.g. steam escaping before rice absorbs aromatics]. Mitigation: [named sensory signal to watch for]."

// // Avoid: "overcooking ruins the dish" without mechanism â every risk must name the exact process and the exact fix.`,
// //       required: true,
// //     },
// //     {
// //       name: "What Good Looks Like",
// //       label: "What the Finished Dish Looks Like",
// //       skillInstruction: `Write 3 criteria using the opening "The dish succeeds whenâ¦" â each must be a testable sensory signal, not a subjective description:
// // â¢ Visual: name the exact colour and surface quality â e.g. "each grain carries a translucent sheen from absorbed ghee, not a wet gloss" â not "looks golden"
// // â¢ Textural: name the exact physical test â e.g. "a grain pressed between two fingers splits cleanly without smearing" â not "fluffy"
// // â¢ Aroma / taste: name the specific aromatic note that signals this dish is done â not "smells fragrant"
// // Add one plating note specific to this dish â name the vessel, the layering reveal, or the garnish placement.`,
// //       deepInstruction: `Write 3 criteria using "The dish succeeds whenâ¦" â specific, testable, sensory. No vague descriptors.
// // â¢ Visual: exact colour / sheen / surface quality with a specific comparator
// // â¢ Textural: the exact physical test â what pressing / slicing / folding this dish feels like at the correct doneness
// // â¢ Aroma / taste: the specific flavour note that signals doneness â name the compound or the ingredient driving it
// // Make the final criterion explicitly distinguish "ready to plate" from "needs more time" â give the exact test a first-time cook can perform.`,
// //       required: true,
// //     },
// //   ];

// //   if (isDeepMode) {
// //     sections.push({
// //       name: "Next 3 Actions",
// //       label: "Before You Start",
// //       skillInstruction: null,
// //       deepInstruction: `Write exactly 3 prep actions to complete BEFORE heat goes on. Each action must name a specific ingredient group, piece of equipment, or make-ahead component for THIS dish â and state why the timing matters for this dish's outcome. Use this format:
// // "N. [Specific prep action] â you alone â [deadline]"

// // GOOD: "1. Toast and grind the whole spices â you alone â 30 minutes before cooking, so they cool before blooming in oil"
// // BAD: "1. Gather and prepare all ingredients" â too vague, no timing reason, no deadline`,
// //       required: true,
// //     });
// //   }
// //   return sections;
// // }


// // // âââââââââââââââââââââââââââââââââââââââââââââ
// // // FITNESS TRAINING
// // // âââââââââââââââââââââââââââââââââââââââââââââ
// // if (intentCategory === "fitness_training") {
// //   const sections = [
// //     {
// //       name: "Expert Role",
// //       label: "Your Expert Role",
// //       skillInstruction: `Name the TRAINING GOAL and SPECIALISATION at the start of this section.
// // Define a specific fitness coach identity â name the training specialisation (strength / HIIT / sport-specific / rehab), years of experience, a named certification, and ONE diagnostic assessment this coach always runs before programming anything. Do not open with "You are a..." â lead with the specialisation and context directly.

// // Write ALL THREE of the following in flowing prose â no bullet points:
// // â  NON-OBVIOUS MISTAKE: State the biggest mistake intermediate trainees make when chasing this goal â not a beginner error. Explain why it happens, name the specific cost (plateau duration / injury type / % result loss), and give the named protocol change that fixes it.
// // â¡ TRADE-OFF: Name the central trade-off for this goal (e.g. volume vs intensity / cardio vs strength). Explain why the intuitive default backfires for THIS goal specifically and state what to prioritise, with the physiological mechanism.
// // â¢ COUNTER-INTUITIVE ORDERING: Name what most coaches or trainees programme first, state why that order produces slower results, name what must come first, and give the physiological mechanism.`,
// //       deepInstruction: `Name the TRAINING GOAL and SPECIALISATION explicitly at the start. Do not open with "You are a..." â lead with specialisation and context directly.
// // Build a vivid fitness coach identity â training specialisation, years, named certification, and the diagnostic first move.

// // Write ALL THREE in flowing prose â no bullet points:
// // â  COUNTER-INTUITIVE ORDERING: Name what most coaches programme first, state why it is wrong, name what must come first, and give the physiological mechanism that produces faster results.
// // â¡ NON-OBVIOUS MISTAKE (3â4 sentences): Name the specific error experienced trainees still make â not beginner-obvious. Explain why it happens, state the specific cost (plateau duration / injury type / % result loss), and give the named protocol change that fixes it.
// // â¢ TRADE-OFF: Name the central trade-off (e.g. fat loss vs muscle retention / frequency vs recovery). Explain why the obvious default backfires for THIS goal specifically and state what to prioritise, with the physiological mechanism.`,
// //       required: true,
// //     },
// //     {
// //       name: "Training Overview",
// //       label: "Training Plan Overview",
// //       skillInstruction: `Write one paragraph. State the user's goal, current fitness level, and weekly availability explicitly first â then derive programme duration and weekly structure (days/week, session length) from those three inputs. State the single reason â naming the physiological mechanism â for why this structure produces results for this specific combination.
// // Do not pre-fill a programme duration or session count before stating the three inputs â every number must be derived, not assumed.
// // ${hasUserAnswers ? "MANDATE: Reference the user's stated fitness level, available equipment, and schedule explicitly â these are the inputs driving every number in the programme." : "Weave in detected constraints naturally without defaulting to generic structures."}`,
// //       deepInstruction: `Write one paragraph. State the user's goal, current fitness level, and weekly availability explicitly first â then derive every programme number from those inputs. No pre-filled templates.
// // ${hasUserAnswers ? "MANDATE: Reference the user's stated fitness level, available equipment, and schedule explicitly as the inputs driving each number." : ""}
// // Make one direct assertion about WHY this specific duration + frequency produces results for this exact goal and level â name the physiological mechanism, not a generic claim like "progressive overload works".`,
// //       required: true,
// //     },
// //     {
// //       name: "Weekly Programme",
// //       label: "Weekly Training Programme",
// //       skillInstruction: `Write the actual programme structured as Day 1âDay 7 with rest days named. For each training day use this format:
// // **Day N â [Session Type]:** List 4â6 exercises with sets Ã reps derived from the user's level â not template values like "3Ã10" applied uniformly. For each exercise include a coaching cue that describes what correct form feels like â not looks like.

// // Include for each training day:
// // â¢ A warm-up protocol (2â3 minutes) specific to that session type â not "do a general warm-up"
// // â¢ The specific observable signal that triggers a load or volume increase for this training type
// // â¢ State which day ordering is non-negotiable for recovery and give the physiological reason`,
// //       deepInstruction: `Write the actual programme structured as Day 1âDay 7 with rest days named. For each training day use this format:
// // **Day N â [Session Type]:**
// // â¢ [Exercise name]: [sets] Ã [reps / duration derived from user's level] â [coaching cue: what this movement feels like when done correctly]

// // All set / rep / duration values must be derived from the user's current ability and goal â no uniform template values.

// // Include for each training day:
// // â¢ A warm-up protocol and cool-down note specific to that session type
// // â¢ The exact observable progression signal (e.g. "complete all reps with 2 reps in reserve for 2 consecutive sessions")
// // â¢ The non-negotiable day ordering for recovery with the physiological reason

// // Flag EXACTLY 2 exercises where form failure most commonly causes injury for this training type â name the exact cue that prevents it.`,
// //       required: true,
// //     },
// //     {
// //       name: "Key Numbers",
// //       label: "Key Numbers & Benchmarks",
// //       skillInstruction: `Produce a markdown table for THIS training goal and user level. Derive every value from the user's stated inputs â do not use industry averages or generic defaults. Fill in every cell:
// // | Weekly sessions | |
// // | Session duration | |
// // | Rest intervals between sets | |
// // | Progression schedule | |
// // | Expected results timeline | |`,
// //       deepInstruction: `Produce a markdown table for THIS training goal. Derive every value from the user's inputs and fill in every cell â state the input that produced each number alongside it:
// // | Weekly volume (sets/week per muscle group) | |
// // | Intensity target (RPE or % 1RM range) | |
// // | Rest intervals | |
// // | Deload frequency | |
// // | Expected results timeline | |
// // ${hasUserAnswers ? "MANDATE: Add a 'Current baseline' row with the user's exact performance metric if they stated one." : ""}
// // Avoid generic ranges â every number must be anchored to the user's stated level and goal.`,
// //       required: true,
// //     },
// //     {
// //       name: "Nutrition",
// //       label: "Nutrition Guidance",
// //       skillInstruction: `Write 3â5 nutrition rules tailored specifically to this training goal. Each rule must name the mechanism â not just describe a behaviour:
// // â¢ Protein: give the formula as Xg Ã body weight in kg â do not state a fixed number. Tell the user to calculate their own. Explain the mechanism for THIS training goal.
// // â¢ Caloric approach: name surplus / deficit / maintenance and give the mechanism for THIS specific training type â do not pre-decide the approach without deriving it from the goal.
// // â¢ Meal timing: give the timing principle relative to training sessions and the physiological reason for this window.
// // â¢ One pre/post-workout rule specific to this training modality â name the nutrient and the window.
// // Avoid: "eat healthy", "stay hydrated", any rule without a named mechanism.`,
// //       deepInstruction: `Write 5â7 nutrition rules derived from the training goal. Each must state the mechanism:
// // â¢ Protein: give the formula (Xg Ã body weight in kg) â tell the user to calculate their own number. Never pre-fill a specific gram amount. Name the mechanism for THIS goal.
// // â¢ Caloric approach: derive surplus / deficit / maintenance from the goal â name the mechanism for THIS training type. Do not assume deficit or surplus without deriving it.
// // â¢ Meal timing: give the timing principle and the physiological reason for THIS training modality.
// // â¢ Include ONE named â  Risk: "â  Risk: [specific nutrition mistake for this training goal and demographic â e.g. under-fuelling during high-volume weeks]. Mitigation: [named food strategy or tracking action]."
// // Never pre-fill a specific calorie number. Give the formula. State the mechanism.`,
// //       required: true,
// //     },
// //     {
// //       name: "Training Rules",
// //       label: "Training Rules",
// //       skillInstruction: `Write rules specific to THIS training type and goal. Name the actual movements, energy systems, and failure modes relevant to this training â no generic fitness advice. Use these formats:
// // â¢ Never [specific action that undermines THIS training goal] â reason: [the physiological mechanism that makes this damaging for this goal]
// // â¢ Always [specific action required for THIS training type] â reason: [the exact adaptation it drives]
// // â¢ If [specific observable trigger in this training type] then [specific named response]
// // â¢ One progression rule: name the exact metric and the threshold that triggers load increase for this modality
// // â¢ One recovery rule: name the specific signal that indicates overtraining for this training type

// // Avoid these banned generics â rewrite if any appear:
// // â "Never skip your long runs" â name the energy system and the specific adaptation lost
// // â "Always warm up" â name the warm-up type and the injury mechanism it prevents for THIS training
// // â "If you feel tired, reduce load" â name the specific overtraining signal (HRV drop / performance regression / sleep quality)`,
// //       deepInstruction: `Write 4â5 direct rules specific to THIS training goal â name actual movements, energy systems, and failure modes. Use "Never [action]", "Always [action]", "If [signal] then [response]" format.

// // Include EXACTLY 3 NAMED RISKS covering different failure categories:
// // "â  Risk: [physical / biomechanical failure specific to THIS training style â name the mechanism e.g. connective tissue load outpacing adaptation]. Mitigation: [named preventive action with the exact threshold]."
// // "â  Risk: [programming / periodisation failure specific to THIS goal â e.g. accumulating fatigue masking fitness gains]. Mitigation: [named protocol adjustment â deload week, intensity reduction %]."
// // "â  Risk: [adherence / motivation failure specific to THIS demographic or schedule â name the dropout pattern]. Mitigation: [named structural fix â session format, accountability method]."
// // ${hasUserAnswers ? "MANDATE: Reference the user's stated history (injuries, schedule, equipment) in at least 2 of the 3 risks." : ""}
// // Avoid: "poor planning leads to delays" â every risk must name the exact mechanism and the exact mitigation.`,
// //       required: true,
// //     },
// //     {
// //       name: "What Good Looks Like",
// //       label: "Progress Markers",
// //       skillInstruction: `Write 3 criteria using the opening "Progress is on track whenâ¦" â each must be a testable, numbered signal specific to this training goal and timeline. Do not give generic fitness milestones.
// // â¢ One performance marker: name the specific exercise or distance and the measurable benchmark derived from the user's starting point and goal
// // â¢ One body composition marker (if fat loss or muscle gain is the goal): name the specific measurable change and the timeframe
// // â¢ One adherence marker: name the specific session completion rate â not "feeling fitter" or "staying consistent"
// // Every marker must be testable without a coach present â if it requires subjective interpretation, rewrite it.`,
// //       deepInstruction: framework === "strategic"
// //         ? `Write 3 measurable criteria using "Progress is on track whenâ¦" Use this exact format:

// // "**4-week checkpoint:** [specific performance or composition metric with a number derived from the user's starting point]. If not hit, [specific programming adjustment â name the variable to change and the direction]."
// // "**8-week checkpoint:** [sustained outcome with a number â proof the approach is producing physiological adaptation, not just attendance]."
// // "**What comes next:** [name the next training phase or goal â not 'continue the programme']. State the specific trigger that confirms readiness to move to this next phase."

// // Avoid: "make progress", "build momentum", "establish a routine" â every milestone must have a number or a named, observable output.`
// //         : `Write 3 measurable criteria using "Progress is on track whenâ¦" â derive every benchmark from the user's starting point and goal timeline. Do not use generic fitness milestones.
// // Make the final criterion a performance-based signal that confirms physiological adaptation â not just attendance, effort, or "feeling stronger".
// // Every marker must be testable without a coach present.`,
// //       required: true,
// //     },
// //   ];

// //   if (isDeepMode) {
// //     sections.push({
// //       name: "Next 3 Actions",
// //       label: "Your Next 3 Actions",
// //       skillInstruction: null,
// //       deepInstruction: `Write exactly 3 immediate actions to start this programme. Each action must name a specific app, test, exercise, or calendar step relevant to THIS training goal â not a category. Use this format:
// // "N. [Specific action] â you alone â [deadline]"

// // GOOD: "1. Download Strong app and log today's bodyweight + max reps of bodyweight squat â you alone â tonight"
// // BAD: "1. Start working on your fitness" â too vague, no specific action, no deadline`,
// //       required: true,
// //     });
// //   }
// //   return sections;
// // }

// //   if (intentCategory === "content_writing") {
// //     const sections = [
// //       {
// //         name: "Expert Role",
// //         label: "Your Expert Role",
// //         skillInstruction: `Specific content strategist/writer identity â niche, platform expertise, years, ONE content principle or rule you always apply first.\nNEVER: "You are a content expert." Name the content type, the audience, and your go-to first move.`,
// //         deepInstruction: `Vivid content expert identity â niche, platform, experience.\n\nâ  NON-OBVIOUS MISTAKE: "The biggest mistake I see with [this content type] is [specific structural/strategic error experienced writers still make]." Why it happens â what it costs (low engagement/poor SEO/missed conversions) â fix.\nâ¡ TRADE-OFF: "The central trade-off is [SEO vs readability / depth vs shareability / brand voice vs conversion]." What to prioritise for this specific use case.\nâ¢ COUNTER-INTUITIVE ORDERING: What most writers draft first vs what actually determines whether content succeeds.`,
// //         required: true,
// //       },
// //       {
// //         name: "Content Goal",
// //         label: "Content Goal & Audience",
// //         skillInstruction: `One paragraph: exact content goal (inform/convert/entertain/rank), target audience (specific, not "everyone"), and the single measurable success criterion.\nWeave in platform, tone, and any detected constraints.`,
// //         deepInstruction: `One paragraph: content goal, specific audience persona, success criterion.\n${hasUserAnswers ? "MANDATE: Reference the user's stated audience, platform, and goal from their answers." : ""}`,
// //         required: true,
// //       },
// //       {
// //         name: "Structure",
// //         label: "Content Structure",
// //         skillInstruction: `Named sections/components of the content piece, in order.\nFor each section: name + one-line description of what it contains + its job (hook/explain/convert/close).\nFormat: **[Section name]:** [what it contains] â Purpose: [job it does]`,
// //         deepInstruction: `Named sections in order, each with:\n**[Section Name]:** [what it contains + why this order works]\nFormat: **[Section]:** [content] â Job: [hook/explain/validate/convert/close]\n\nInclude: word count allocation per section (total must match target).`,
// //         required: true,
// //       },
// //       {
// //         name: "Key Numbers",
// //         label: "Content Benchmarks",
// //         skillInstruction: `Markdown table: target word count / reading time / keyword density (if SEO) / CTA count / ideal publish frequency.\nAll numbers specific to this content type and platform.`,
// //         deepInstruction: `Markdown table of content performance parameters.\nFormat: | Parameter | Target |\nMust include: word count, reading time, headline CTR benchmark, engagement rate target, publication cadence.\n${hasUserAnswers ? "MANDATE: Include current baseline if user stated existing metrics." : ""}`,
// //         required: true,
// //       },
// //       {
// //         name: "Distribution",
// //         label: "Distribution & Promotion",
// //         skillInstruction: `3â5 specific distribution actions: where to publish, how to promote, when to post.\nName actual platforms, tools, and timing â not "share on social media".\nOne direct recommendation about the highest-ROI channel for this content.`,
// //         deepInstruction: `5â7 specific distribution actions with platform, timing, and format.\nInclude: primary channel, repurposing strategy (what format, which platform), and one paid promotion trigger (when organic reach justifies boosting).\nâ  Risk: [specific distribution failure for this content type]. Mitigation: [named action].`,
// //         required: true,
// //       },
// //       {
// //         name: "Ground Rules",
// //         label: "Content Rules",
// //         skillInstruction: `4â5 direct rules for this content type:\n"Never [X]", "Always [Y]", "If [Z] then [W]"\nCovers: tone, structure, SEO, and one platform-specific rule.`,
// //         deepInstruction: `4â5 direct rules specific to this content type and platform.\n\nMANDATORY â 3 NAMED RISKS:\n"â  Risk: [specific content failure mode â poor hook, SEO cannibalisation, tone mismatch]. Mitigation: [named fix]."`,
// //         required: true,
// //       },
// //       {
// //         name: "What Good Looks Like",
// //         label: "What Good Content Looks Like",
// //         skillInstruction: `3 criteria written as "This content succeeds whenâ¦" â measurable, not subjective.\nCovers: audience response, performance metric, and business outcome.`,
// //         deepInstruction: `3 criteria as "This content succeeds whenâ¦" â measurable, platform-specific.\n\n${framework === "strategic"
// //           ? `"**30-day benchmark:** [specific traffic or engagement metric]. If not hit, [specific content or distribution adjustment]."\n"**90-day benchmark:** [compounding outcome]."\n"**What comes next:** [next content asset or campaign to build on this]."` 
// //           : `Final criterion: a performance metric specific to this platform and content type.`}`,
// //         required: true,
// //       },
// //     ];
// //     if (isDeepMode) {
// //       sections.push({
// //         name: "Next 3 Actions",
// //         label: "Your Next 3 Actions",
// //         skillInstruction: null,
// //         deepInstruction: `3 specific actions to move from brief to published:\n1. [Research/outline action] â you â [deadline]\n2. [Draft action â what to write first] â you â [deadline]\n3. [Publishing/distribution action] â you â [deadline]\n\nFormat: "N. [Specific action] â [who] â [deadline]"\nBAD: "Start writing your content." TOO VAGUE.`,
// //         required: true,
// //       });
// //     }
// //     return sections;
// //   }

// //   if (intentCategory === "tutorial" || isTutorial) {
// //     const sections = [
// //       {
// //         name: "Expert Role",
// //         label: "Your Expert Role",
// //         skillInstruction: `Name the TECHNOLOGY and MINI-PROJECT in this section.\nSpecific educator/developer identity â language/framework specialisation, years of teaching, ONE pedagogical principle you always apply.\nNEVER: "You are an experienced developer." Name the exact tech stack and the project.`,
// //         deepInstruction: `Name the TECHNOLOGY and MINI-PROJECT explicitly.\n\nâ  COUNTER-INTUITIVE ORDERING: "Most tutorials teach [X] before [Y] â that's wrong. [Y] must come first because [learning mechanism]."\nâ¡ NON-OBVIOUS MISTAKE (3â4 sentences): "The biggest mistake I see in [this type of tutorial] is [specific instructional error experienced devs still make]." Why it happens â what it costs (learner confusion/dropout) â the fix.\nâ¢ TRADE-OFF: "The central trade-off is thoroughness vs momentum. [Specific version â e.g. 'explaining every React concept before a line renders'] kills completion rates. [What to do instead]."`,
// //         required: true,
// //       },
// //       {
// //         name: "What You're Here to Do",
// //         label: "What You're Here to Do",
// //         skillInstruction: `One tight paragraph: exact goal, starting point (assumed knowledge), success = deployed, portfolio-ready project reader can put on GitHub TODAY.\nWeave in tech stack and project name.`,
// //         deepInstruction: `One tight paragraph: goal, assumed prior knowledge, what success looks like (deployed, GitHub-ready, demonstrable).\n${hasUserAnswers ? "MANDATE: Reference user's stated skill level and environment from their answers." : ""}`,
// //         required: true,
// //       },
// //       {
// //         name: "Core Focus Areas",
// //         label: "Your Core Focus Areas",
// //         skillInstruction: `3â5 bullets: what reader must BE ABLE TO DO by the end. Demonstrable, not just knowable.\nFormat: "â¢ [Skill/capability]: [how it's demonstrated in the project]"`,
// //         deepInstruction: `3â5 bullets: demonstrable capabilities the reader gains.\nEach bullet = something the reader can show in the project or explain in an interview.\nBAN: "understand", "learn about" â use "build", "implement", "configure", "deploy".`,
// //         required: true,
// //       },
// //       {
// //         name: "How to Approach This",
// //         label: "Tutorial Structure",
// //         skillInstruction: `Structure: **Setup & First Win** â **Core Concepts with Running Code** â **Build the Full Project** â **Deploy & Share**\nEach phase: timeframe + what the reader has working at the end.\nFormat: **[Phase Name] ([timeframe]):** [what happens] â Output: [runnable thing]`,
// //         deepInstruction: `Session-based phases:\n**Setup & First Win ([time]):** â Output: [first running screen]\n**Core Concepts with Running Code ([time]):** â Output: [key feature working]\n**Build the Full Project ([time]):** â Output: [complete app]\n**Ship & What's Next ([time]):** â Output: [deployed URL + next tutorial pointer]\n\nEach phase produces something RUNNABLE. No phase ends in "now you understand X."`,
// //         required: true,
// //       },
// //       {
// //         name: "Key Numbers",
// //         label: "Key Numbers & Benchmarks",
// //         skillInstruction: `Markdown table â REQUIRED rows: tutorial word count, read time (SEPARATE row), build time (SEPARATE â NEVER combined), code examples count, deployment time.\nFormat: | Parameter | Value |`,
// //         deepInstruction: `Markdown table â REQUIRED rows (all separate):\n| Tutorial word count | |\n| Read time | |\n| Build time | |\n| Code examples | |\n| Deployment time | |\n| Tech stack | |\nNEVER combine read time and build time.`,
// //         required: true,
// //       },
// //       {
// //         name: "What to Deliver",
// //         label: "What to Deliver",
// //         skillInstruction: `Name every output: the guide (word count, sections), code examples (count + platform), mini-project (what it does, stack, where it deploys), "What's Next" pointing to 2â3 specific follow-on tutorials.`,
// //         deepInstruction: `Name every output with format + specification:\nâ¢ The written guide: word count, section breakdown\nâ¢ Code examples: count + repo structure\nâ¢ Mini-project: name + what it does + tech stack + deployment URL\nâ¢ "What's Next": 2â3 named follow-on projects in order of difficulty`,
// //         required: true,
// //       },
// //       {
// //         name: "Ground Rules",
// //         label: "Tutorial Rules",
// //         skillInstruction: `Must include:\nâ¢ Every concept gets a runnable code example â no concept without code\nâ¢ Tutorial cannot end without the reader deploying something real\nâ¢ Read time â  build time â always state both separately\nAdd 2â3 more rules specific to this technology.`,
// //         deepInstruction: `Must include:\nâ¢ Every concept gets a runnable code example\nâ¢ Tutorial ends with a deployed, GitHub-ready project\nâ¢ Read time and build time stated separately â always\n\nMANDATORY â 3 NAMED RISKS:\n"â  Risk: [specific point where learners drop off in this tech stack]. Mitigation: [named structural fix]."`,
// //         required: true,
// //       },
// //       {
// //         name: "What Good Looks Like",
// //         label: "What Good Looks Like",
// //         skillInstruction: `3 criteria written as "The work mustâ¦"\nFinal criterion: "The work must produce a reader who can deploy their own variation of the mini-project from scratch without referring back to the tutorial."`,
// //         deepInstruction: `3 criteria as "The work mustâ¦" â observable, verifiable.\nFinal criterion: "The work must produce a reader who can deploy their own variation of the mini-project from scratch without referring back to the tutorial."\nOther 2: one about code quality signal, one about reader comprehension test.`,
// //         required: true,
// //       },
// //     ];
// //     if (isDeepMode) {
// //       sections.push({
// //         name: "Next 3 Actions",
// //         label: "Your Next 3 Actions",
// //         skillInstruction: null,
// //         deepInstruction: `3 first steps to begin writing this tutorial:\n1. [Technology/project decision action] â you â today\n2. [Setup action â scaffold the code repo] â you â Day 1\n3. [Outline action â map all code examples needed] â you â before writing starts\n\nFormat: "N. [Specific action] â [who] â [deadline]"`,
// //         required: true,
// //       });
// //     }
// //     return sections;
// //   }

// //   if (intentCategory === "ai_image") {
// //     const sections = [
// //       {
// //         name: "Expert Role",
// //         label: "Your Expert Role",
// //         skillInstruction: `Name the specific AI tool, your go-to parameter combination, and your acceptance criteria rule.\nNEVER mention DSLR, camera settings, tripod, or physical lighting setups.\nYou are an AI prompt director â not a photographer.`,
// //         deepInstruction: `Name the specific AI tool (${tool}), version, and your go-to parameter set for this exact use case.\n\nâ  COUNTER-INTUITIVE ORDERING: "Most people spend 80% of prompt-engineering time on [X]. That's wrong â [Y] is the variable that kills outputs. Fix [Y] first."\nâ¡ NON-OBVIOUS MISTAKE: "The biggest mistake I see here is [tool-specific error, not generic]. Why it happens â what it costs â fix."\nâ¢ TRADE-OFF: "The central trade-off is [specificity vs flexibility / style lock-in vs iteration speed]."`,
// //         required: true,
// //       },
// //       {
// //         name: "What You're Here to Do",
// //         label: "What You're Here to Do",
// //         skillInstruction: `One paragraph: exact use case (product shots/portraits/scenes), platform format, and success = a consistent prompt library that passes acceptance criteria at least 1 in 4 generations.`,
// //         deepInstruction: `One paragraph: use case, platform/format, and what a working prompt system looks like.\n${hasUserAnswers ? "MANDATE: Reference user's stated tool version, style direction, and use case." : ""}`,
// //         required: true,
// //       },
// //       {
// //         name: "Core Focus Areas",
// //         label: "Your Core Focus Areas",
// //         skillInstruction: `4 bullets â each an AI-specific skill or workflow deliverable:\nâ¢ Prompt Anatomy: the 5 elements every prompt needs\nâ¢ Style Parameter Library: named --flags for this use case\nâ¢ Iteration Framework: how to go from first output to usable in 3 rounds\nâ¢ Quality Filter: the specific acceptance test`,
// //         deepInstruction: `4â5 bullets â tool-specific skills:\nâ¢ Prompt Anatomy: subject + surface + light + mood + aspect ratio\nâ¢ Style Parameter Library: named --flags and when to use each\nâ¢ Iteration Framework: first output â portfolio-ready in 3 rounds\nâ¢ Quality Filter: acceptance test (not "looks good" â named criteria)\nâ¢ Style Consistency: how to maintain look across a catalogue`,
// //         required: true,
// //       },
// //       {
// //         name: "How to Approach This",
// //         label: "How to Approach This",
// //         skillInstruction: `3â4 phases:\n**Anchor Prompt ([timeframe]):** â Output: [style reference prompt]\n**Parameter Library ([timeframe]):** â Output: [named --flags guide]\n**Iteration Workflow ([timeframe]):** â Output: [3-round refinement process]\n**Catalogue Build ([timeframe]):** â Output: [consistent prompt library]`,
// //         deepInstruction: `3â4 implementation phases:\n**[Phase] ([timeframe]):** [what happens] â Deliverable: [named output]\n\nPhase 1: establish anchor prompt before building anything else.\nFinal phase: what the user does AFTER the initial catalogue is built.`,
// //         required: true,
// //       },
// //       {
// //         name: "Key Numbers",
// //         label: "Key Numbers & Benchmarks",
// //         skillInstruction: `Markdown table â REQUIRED rows: optimal prompt length (words), iterations to portfolio-ready, acceptance rate target, recommended --ar for this platform, --chaos value for product shots, style consistency metric.\nAll numbers specific to ${tool}.`,
// //         deepInstruction: `Markdown table â REQUIRED (${tool}-specific):\n| Optimal prompt length | |\n| Iterations to portfolio-ready | |\n| Acceptance rate target | |\n| Recommended --ar | |\n| --chaos value | |\n| Style consistency benchmark | |`,
// //         required: true,
// //       },
// //       {
// //         name: "What to Deliver",
// //         label: "What to Deliver",
// //         skillInstruction: `Name every output: prompt template library (count + format), style reference bank (count + source), acceptance criteria doc (pass vs regenerate), platform-specific aspect ratio guide.`,
// //         deepInstruction: `Name every output with format + count:\nâ¢ Prompt template library: how many templates + format\nâ¢ Style reference bank: number of images + source method\nâ¢ Acceptance criteria doc: what passes vs regenerates\nâ¢ Platform-specific --ar cheat sheet`,
// //         required: true,
// //       },
// //       {
// //         name: "Ground Rules",
// //         label: "Ground Rules",
// //         skillInstruction: `Must include:\nâ¢ Never use prompt length over 80 words â longer reduces subject focus in ${tool}\nâ¢ Always establish a style anchor prompt before building a catalogue\nâ¢ If --v6 produces modern aesthetics for a vintage brief, add --style raw + --sref\nâ¢ Never judge a prompt on the first generation â run 4 outputs minimum`,
// //         deepInstruction: `Must include the 4 core rules for ${tool} above.\n\nMANDATORY â 3 NAMED RISKS (tool-specific failure modes only):\n"â  Risk: [${tool}-specific failure â style drift/version defaults/catalogue inconsistency]. Mitigation: [named parameter or workflow fix]."\nNEVER generic photography risks.`,
// //         required: true,
// //       },
// //       {
// //         name: "What Good Looks Like",
// //         label: "What Good Looks Like",
// //         skillInstruction: `3 criteria as "The work mustâ¦"\nFinal criterion: "The work must produce a prompt library where any prompt generates a usable image at least 1 in every 4 generations â without adjusting prompt structure between products."`,
// //         deepInstruction: `3 criteria as "The work mustâ¦"\nFinal criterion: "The work must produce a prompt library where any prompt generates a usable image (passing the acceptance criteria) at least 1 in every 4 generations â without adjusting prompt structure between products."\nOther 2: style consistency test and catalogue completeness test.`,
// //         required: true,
// //       },
// //     ];
// //     if (isDeepMode) {
// //       sections.push({
// //         name: "Next 3 Actions",
// //         label: "Your Next 3 Actions",
// //         skillInstruction: null,
// //         deepInstruction: `3 immediate actions â all ${tool}-specific:\n1. [Anchor prompt action â test ONE product/subject with 4 variations] â you alone â Day 1\n2. [Parameter library action â document which --flags work for this use case] â you alone â Day 3\n3. [Acceptance criteria action â define pass/fail before building the catalogue] â you alone â before Day 5\n\nFormat: "N. [Specific action] â [who] â [deadline]"`,
// //         required: true,
// //       });
// //     }
// //     return sections;
// //   }

// //   if (intentCategory === "debugging" || framework === "operational") {
// //     const sections = [
// //       {
// //         name: "Expert Role",
// //         label: "Your Expert Role",
// //         skillInstruction: `Specific diagnostic expert identity â technology, years of debugging experience, ONE diagnostic principle you always apply first (eliminate before you fix).\nName the most common misdiagnosis for this type of problem.`,
// //         deepInstruction: `Diagnostic expert identity â technology stack, incident response experience.\n\nâ  MISDIAGNOSIS TRAP: "The most common misdiagnosis here is [X]. People waste hours chasing [X] when [Y] is the actual root cause."\nâ¡ COST OF WRONG ROOT CAUSE: "Chasing the wrong cause costs [specific time/consequence]."\nâ¢ DIAGNOSTIC PRINCIPLE: "I always [specific first step] before touching any configuration â here's why."`,
// //         required: true,
// //       },
// //       {
// //         name: "Problem Statement",
// //         label: "Problem Statement",
// //         skillInstruction: `One paragraph: exact symptom, when it started, environment (OS/framework/version), and what's been tried.\nIf constraints are known, reference them directly.`,
// //         deepInstruction: `One paragraph: exact symptom, environment, reproduction steps, what's been tried.\n${hasUserAnswers ? "MANDATE: Reference the user's stated error message, stack, and environment from their answers." : ""}`,
// //         required: true,
// //       },
// //       {
// //         name: "Diagnostic Steps",
// //         label: "Diagnostic Steps",
// //         skillInstruction: `Numbered steps ordered by likelihood of root cause.\nEach step: what to check â what a pass looks like â what a fail means â next step.\nFormat: **Step N â [Check name]:** [command or action] â Pass: [what it means] â Fail: [what it means]`,
// //         deepInstruction: `Ordered diagnostic sequence â most likely root cause first.\nFormat: **Step N â [Check]:** [exact command or action] â Pass: [what passing looks like] â Fail: [what this means, next step]\n\nStop when you find the culprit â don't run all steps if an early one fails.`,
// //         required: true,
// //       },
// //       {
// //         name: "Resolution",
// //         label: "Resolution Steps",
// //         skillInstruction: `For each likely root cause: the exact fix.\nFormat: **If [root cause]:** [specific command or code change] â Verification: [how to confirm it's resolved]`,
// //         deepInstruction: `Resolution map: root cause â exact fix â verification.\nFormat: **If [root cause identified in Step N]:** [specific fix â command, config change, code edit] â Verification: [exact test that confirms resolution]\n\nInclude rollback instruction if the fix could create new issues.`,
// //         required: true,
// //       },
// //       {
// //         name: "Key Numbers",
// //         label: "Diagnostic Benchmarks",
// //         skillInstruction: `Markdown table: typical resolution time / most common root cause (%) / tools needed / log location(s).\nSpecific to this technology/error type.`,
// //         deepInstruction: `Markdown table of diagnostic parameters.\n| Parameter | Value |\nMust include: typical resolution time, most likely root cause, tools needed, relevant log paths.`,
// //         required: true,
// //       },
// //       {
// //         name: "Ground Rules",
// //         label: "Debugging Rules",
// //         skillInstruction: `4â5 direct debugging rules:\n"Never [X] without [Y first]", "Always [check Z] before changing config"\nCovers: isolation principle, version pinning, rollback, logging.`,
// //         deepInstruction: `4â5 direct rules for this debugging scenario.\n\nMANDATORY â 3 NAMED RISKS:\n"â  Risk: [specific misdiagnosis or fix-that-makes-it-worse]. Mitigation: [named check before acting]."\nZERO strategic planning language.`,
// //         required: true,
// //       },
// //       {
// //         name: "What Good Looks Like",
// //         label: "Resolution Signal",
// //         skillInstruction: `3 criteria as "The issue is resolved whenâ¦" â observable test results.\nNO milestones, NO business metrics, NO day/week targets.\nFinal criterion: the clean-state test.`,
// //         deepInstruction: `3 criteria as "The issue is resolved whenâ¦" â specific, testable.\nEach criterion: an exact test or output that confirms resolution.\nFinal criterion: the system-state test that confirms clean resolution without side effects.\nZERO milestone or business language.`,
// //         required: true,
// //       },
// //       {
// //         name: "Next 3 Actions",
// //         label: "Your Next 3 Actions",
// //         skillInstruction: null,
// //         deepInstruction: `3 immediate investigation actions â specific commands or checks:\n1. [First check â most likely root cause] â you â immediately\n2. [Second check â if Step 1 passes] â you â within the hour\n3. [Escalation or logging action â if neither resolves it] â you â before anything else\n\nFormat: "N. [Specific command or action] â [who] â [deadline]"\nZERO strategic or planning language.`,
// //         required: true,
// //       },
// //     ];
// //     return sections;
// //   }

// //   if (intentCategory === "marketing_growth") {
// //     const sections = [
// //       {
// //         name: "Expert Role",
// //         label: "Your Expert Role",
// //         skillInstruction: `Specific growth/marketing expert identity â channel specialisation, years, ONE framework or rule you always apply first.\nNEVER: "You are a marketing expert." Name the specific channel and your go-to first diagnostic.`,
// //         deepInstruction: `Vivid marketing expert identity â channel, methodology, experience.\n\nâ  COUNTER-INTUITIVE ORDERING: "Most brands start with [X] â wrong. [Y] must be working before [X] is worth a rupee."\nâ¡ NON-OBVIOUS MISTAKE (3â4 sentences): "The biggest mistake I see here is [specific, experienced-marketer-level error]." Why â cost (wasted spend/missed CAC) â fix.\nâ¢ TRADE-OFF: "The central trade-off is [reach vs conversion / brand vs performance / paid vs organic]." What to prioritise for this stage and budget.`,
// //         required: true,
// //       },
// //       {
// //         name: "What You're Here to Do",
// //         label: "What You're Here to Do",
// //         skillInstruction: `One paragraph: exact marketing goal (leads/sales/awareness/retention), target audience persona (specific, not "everyone"), and the single measurable success criterion.\nWeave in budget, timeline, and platform if detected.`,
// //         deepInstruction: `One paragraph: goal, specific audience persona, success criterion with a number.\n${hasUserAnswers ? "MANDATE: Reference the user's stated budget, audience, and channel from their answers." : ""}`,
// //         required: true,
// //       },
// //       {
// //         name: "Core Focus Areas",
// //         label: "Your Core Focus Areas",
// //         skillInstruction: `3â5 bullets â distinct marketing workstreams with named outputs:\n"â¢ [Channel/Tactic]: [specific output â what gets built or decided]"\nBAN: "Monitor performance" â name the metric and the action it triggers.`,
// //         deepInstruction: `3â5 bullets â named marketing workstreams:\n"â¢ [Channel/Tactic]: [specific output] â measured by: [named metric]"\nBAN: "Monitor and analyze" without a named metric and action threshold.`,
// //         required: true,
// //       },
// //       {
// //         name: "How to Approach This",
// //         label: "How to Approach This",
// //         skillInstruction: `3â4 phases with bold labels and timeframes.\nFormat: **[Phase Name] ([timeframe]):** [actions] â Output: [named deliverable]\nPhase 1 = foundation (what must exist before spending). Final phase = retention/LTV, not just acquisition.`,
// //         deepInstruction: `${framework === "strategic"
// //           ? `3â4 phases:\n**[Phase Name] ([timeframe]):** [what happens] â Deliverable: [named output]\nPhase 1: Foundation â what must exist before any spend or content goes live.\nFinal phase: MANDATORY POST-GOAL PHASE â what happens after first acquisition goal is hit (LTV expansion, referral, retention).`
// //           : `3â4 implementation phases:\n**[Phase Name] ([timeframe]):** [what happens] â Deliverable: [named output]\nFinal phase = what user does after campaign is live.`}`,
// //         required: true,
// //       },
// //       {
// //         name: "Key Numbers",
// //         label: "Key Numbers & Benchmarks",
// //         skillInstruction: `Markdown table: 4â6 rows with real channel benchmarks.\nMust include: CAC target, conversion rate benchmark, ROAS target (if paid), CPL, organic vs paid traffic split.\nPull from domain benchmarks â never invent.`,
// //         deepInstruction: `Markdown table â channel-specific benchmarks.\nFormat: | Parameter | Target / Benchmark |\nMust include: CAC, conversion rate, ROAS (if paid), CPL, content volume target, audience growth rate.\n${hasUserAnswers ? "MANDATE: Include 'Current baseline' row if user stated existing metrics." : ""}\n${framework === "strategic" ? "Add 30-day and 90-day target rows â must match milestones in What Good Looks Like exactly." : ""}`,
// //         required: true,
// //       },
// //       {
// //         name: "What to Deliver",
// //         label: "What to Deliver",
// //         skillInstruction: `Every deliverable: the thing + its format + its purpose.\nName: content assets, campaign setup, tracking infrastructure, reporting cadence.\nNO vague deliverables like "marketing materials".`,
// //         deepInstruction: `Every deliverable with format + specification + purpose:\nâ¢ Content assets: type + count + format\nâ¢ Campaign setup: platform + targeting spec\nâ¢ Tracking: tools + metrics + reporting cadence\nâ¢ Creative: format + specs + testing plan`,
// //         required: true,
// //       },
// //       {
// //         name: "Ground Rules",
// //         label: "Ground Rules",
// //         skillInstruction: `4â5 direct marketing rules specific to this channel and goal:\n"Never [X]", "Always [Y]", "If [Z] then [W]"\nCovers: budget allocation, creative testing, attribution, and one platform-specific rule.`,
// //         deepInstruction: `4â5 direct rules specific to this channel and goal.\n\nMANDATORY â 3 NAMED RISKS:\n"â  Risk: [specific channel/campaign failure mode]. Mitigation: [named action]."\nCovers: attribution failure, creative fatigue, budget misallocation.`,
// //         required: true,
// //       },
// //       {
// //         name: "What Good Looks Like",
// //         label: "What Good Looks Like",
// //         skillInstruction: `3 criteria as "The campaign/strategy succeeds whenâ¦" â measurable with named metrics.\nFinal criterion: a long-term efficiency signal (not just campaign completion).`,
// //         deepInstruction: `3 criteria as "The campaign succeeds whenâ¦"\n\n${framework === "strategic"
// //           ? `"**30-day milestone:** [specific metric â leads/sales/CAC]. If not hit, [specific channel or creative adjustment]."\n"**90-day milestone:** [sustained efficiency metric with number]."\n"**What comes next:** [specific next growth lever to activate]."` 
// //           : `Final criterion: a channel efficiency signal that confirms the approach is working.`}`,
// //         required: true,
// //       },
// //     ];
// //     if (isDeepMode) {
// //       sections.push({
// //         name: "Next 3 Actions",
// //         label: "Your Next 3 Actions",
// //         skillInstruction: null,
// //         deepInstruction: `3 specific actions to launch this campaign/strategy:\n1. [Foundation action â must exist before anything else] â you alone â Day 1\n2. [Creative/content action â first asset to build] â you alone â Day 3\n3. [Tracking/measurement action â must be live before spend starts] â you alone â before Week 1 ends\n\nFormat: "N. [Specific action] â [who] â [deadline]"`,
// //         required: true,
// //       });
// //     }
// //     return sections;
// //   }

// //   if (intentCategory === "finance_investment") {
// //     const sections = [
// //       {
// //         name: "Expert Role",
// //         label: "Your Expert Role",
// //         skillInstruction: `Specific financial expert identity â domain (equity/real estate/personal finance/tax), years, ONE investment principle or rule you always apply first.\nName the most common mistake at this stage of the user's financial journey.`,
// //         deepInstruction: `Financial expert identity â domain, experience, methodology.\n\nâ  COUNTER-INTUITIVE ORDERING: "Most people [invest/plan/do X] before [Y is sorted]. That's the wrong order â [Y] failure makes [X] worthless."\nâ¡ NON-OBVIOUS MISTAKE: "The biggest mistake I see at this stage is [specific error experienced investors still make]." Why â cost (in â¹ or %) â fix.\nâ¢ TRADE-OFF: "The central trade-off is [return vs liquidity / diversification vs concentration / tax efficiency vs yield]." What to prioritise here.`,
// //         required: true,
// //       },
// //       {
// //         name: "Financial Goal",
// //         label: "Financial Goal & Starting Point",
// //         skillInstruction: `One paragraph: exact goal (corpus/income/tax saving), timeline, current situation, and the single most important decision to make first.\nWeave in any detected constraints (income, risk appetite, existing portfolio).`,
// //         deepInstruction: `One paragraph: goal with number + timeline, current financial situation, and priority decision.\n${hasUserAnswers ? "MANDATE: Reference the user's stated income, risk appetite, and timeline from their answers." : ""}`,
// //         required: true,
// //       },
// //       {
// //         name: "Strategy",
// //         label: "Investment Strategy",
// //         skillInstruction: `Named strategy with asset allocation (%).\n3â5 bullets â each a named instrument or action with rationale and allocation %.\nNo generic advice. Name actual products (Nifty 50 index fund, ELSS, PPF â not "equity funds").`,
// //         deepInstruction: `Named strategy with specific asset allocation.\nFor each instrument: name + allocation % + rationale + recommended product (not category).\nInclude: emergency fund status check before any investment begins.\nâ  Risk: [specific allocation risk for this goal/timeline]. Mitigation: [named rebalancing trigger].`,
// //         required: true,
// //       },
// //       {
// //         name: "How to Approach This",
// //         label: "Implementation Phases",
// //         skillInstruction: `3â4 phases with timeframes.\nFormat: **[Phase Name] ([timeframe]):** [actions] â Output: [named decision or account setup]\nPhase 1 = foundation (emergency fund + insurance before investing).`,
// //         deepInstruction: `3â4 implementation phases:\n**[Phase Name] ([timeframe]):** [what happens] â Deliverable: [named account/decision/allocation done]\nPhase 1: non-negotiable foundation before any market exposure.\n${framework === "strategic" ? "Final phase: MANDATORY â what happens after the primary goal is achieved (corpus built, next goal activation)." : ""}`,
// //         required: true,
// //       },
// //       {
// //         name: "Key Numbers",
// //         label: "Key Numbers & Benchmarks",
// //         skillInstruction: `Markdown table: target corpus / monthly SIP amount / expected CAGR / time to goal / tax saving (if applicable).\nAll numbers specific and derived from stated goal â not invented.`,
// //         deepInstruction: `Markdown table â goal-specific numbers.\nFormat: | Parameter | Value |\nMust include: target corpus, monthly SIP, expected CAGR (realistic range), time to goal, tax liability, emergency fund target.\n${hasUserAnswers ? "MANDATE: If user stated current savings/income, include 'Current baseline' row." : ""}`,
// //         required: true,
// //       },
// //       {
// //         name: "Ground Rules",
// //         label: "Investment Rules",
// //         skillInstruction: `4â5 direct financial rules specific to this goal and risk profile:\n"Never [X] before [Y is in place]", "Always [rebalance when Z]"\nCovers: diversification, liquidity, tax, and one emotion-management rule.`,
// //         deepInstruction: `4â5 direct rules specific to this goal.\n\nMANDATORY â 3 NAMED RISKS:\n"â  Risk: [specific financial failure mode â inflation gap, liquidity crunch, tax drag]. Mitigation: [named action]."\nNOTE: This is educational â not personalised financial advice. Recommend consulting a SEBI-registered advisor for specific decisions.`,
// //         required: true,
// //       },
// //       {
// //         name: "What Good Looks Like",
// //         label: "What Good Looks Like",
// //         skillInstruction: `3 criteria as "The strategy is on track whenâ¦" â measurable, date-anchored.\nFinal criterion: a long-term portfolio health signal.`,
// //         deepInstruction: `3 criteria as "The strategy is on track whenâ¦"\n\n${framework === "strategic"
// //           ? `"**12-month checkpoint:** [specific portfolio milestone]. If not on track, [specific rebalancing action]."\n"**Goal milestone:** [corpus or income target with number]."\n"**What comes next:** [next financial goal to activate after this one is on track]."` 
// //           : `Final criterion: a portfolio health signal specific to this goal and timeline.`}`,
// //         required: true,
// //       },
// //     ];
// //     if (isDeepMode) {
// //       sections.push({
// //         name: "Next 3 Actions",
// //         label: "Your Next 3 Actions",
// //         skillInstruction: null,
// //         deepInstruction: `3 specific financial actions to start immediately:\n1. [Foundation action â emergency fund or insurance check] â you alone â this week\n2. [Account setup action â specific platform/broker] â you alone â Day 3\n3. [First investment action â specific instrument + amount] â you alone â by end of Week 1\n\nFormat: "N. [Specific action] â [who] â [deadline]"\nNOTE: Consult a SEBI-registered advisor before executing.`,
// //         required: true,
// //       });
// //     }
// //     return sections;
// //   }

// //   if (intentCategory === "career_job") {
// //     const sections = [
// //       {
// //         name: "Expert Role",
// //         label: "Your Expert Role",
// //         skillInstruction: `Specific career/HR expert identity â industry specialisation, years, ONE job-search or career-development principle you always apply first.\nName the most overlooked factor in getting hired for this type of role.`,
// //         deepInstruction: `Career expert identity â industry, methodology, experience.\n\nâ  NON-OBVIOUS MISTAKE: "The biggest mistake I see in [this career move] is [specific error experienced job-seekers still make]." Why â cost (rejection/missed opportunities) â fix.\nâ¡ TRADE-OFF: "The central trade-off is [speed vs targeting / breadth vs depth / visible achievements vs soft skills]." What to prioritise here.\nâ¢ COUNTER-INTUITIVE ORDERING: What to optimise before updating the resume.`,
// //         required: true,
// //       },
// //       {
// //         name: "Career Goal",
// //         label: "Career Goal & Starting Point",
// //         skillInstruction: `One paragraph: exact career move (role + seniority + industry), current position/background, and the single most important thing to demonstrate to get this role.\nWeave in timeline and any constraints.`,
// //         deepInstruction: `One paragraph: target role + seniority + industry, current background, primary hiring signal to develop.\n${hasUserAnswers ? "MANDATE: Reference the user's stated experience, target role, and timeline from their answers." : ""}`,
// //         required: true,
// //       },
// //       {
// //         name: "Core Focus Areas",
// //         label: "Your Core Focus Areas",
// //         skillInstruction: `3â5 bullets â named job-search workstreams:\n"â¢ [Workstream]: [specific output â resume section/portfolio piece/network action]"\nBAN: "Improve your skills" â name the specific skill and how to demonstrate it.`,
// //         deepInstruction: `3â5 bullets â named workstreams:\n"â¢ [Workstream]: [specific output] â signal: [what this proves to a hiring manager]"\nBAN vague actions. Name the exact artefact or demonstration.`,
// //         required: true,
// //       },
// //       {
// //         name: "How to Approach This",
// //         label: "Job Search Strategy",
// //         skillInstruction: `3â4 phases with timeframes.\nFormat: **[Phase Name] ([timeframe]):** [actions] â Output: [named deliverable â resume version/portfolio/outreach list]\nPhase 1 = positioning before applications start.`,
// //         deepInstruction: `3â4 phases:\n**[Phase Name] ([timeframe]):** [actions] â Deliverable: [named output]\nPhase 1: positioning + materials â must be done before any applications go out.\n${framework === "strategic" ? "Final phase: MANDATORY â what happens after the role is secured (90-day plan, performance acceleration)." : ""}`,
// //         required: true,
// //       },
// //       {
// //         name: "Key Numbers",
// //         label: "Job Search Benchmarks",
// //         skillInstruction: `Markdown table: applications per week / response rate benchmark / interview conversion rate / typical hiring timeline / offer negotiation success rate.\nAll numbers realistic for this role level and industry.`,
// //         deepInstruction: `Markdown table of job-search metrics.\nFormat: | Parameter | Benchmark |\nMust include: applications per week, response rate, interview rate, typical hiring timeline, salary range for target role.\n${hasUserAnswers ? "MANDATE: Include user's current salary as 'Current baseline' if stated." : ""}`,
// //         required: true,
// //       },
// //       {
// //         name: "Ground Rules",
// //         label: "Job Search Rules",
// //         skillInstruction: `4â5 direct job-search rules:\n"Never [apply without X]", "Always [customise Y per application]"\nCovers: application quality, LinkedIn optimisation, interview prep, salary negotiation.`,
// //         deepInstruction: `4â5 direct rules for this career move.\n\nMANDATORY â 3 NAMED RISKS:\n"â  Risk: [specific job-search failure mode â ghosting, wrong positioning, weak portfolio]. Mitigation: [named action]."\nCovers: application quality, network leverage, interview execution.`,
// //         required: true,
// //       },
// //       {
// //         name: "What Good Looks Like",
// //         label: "What Good Looks Like",
// //         skillInstruction: `3 criteria as "The job search is working whenâ¦" â observable milestones.\nFinal criterion: the offer signal, not just activity.`,
// //         deepInstruction: `3 criteria as "The search is working whenâ¦"\n\n${framework === "strategic"
// //           ? `"**30-day milestone:** [specific activity or response metric]. If not hit, [specific tactic change]."\n"**60-day milestone:** [interview stage reached]."\n"**What comes next:** [how to prepare for and negotiate the offer]."` 
// //           : `Final criterion: a response-rate or interview-rate signal that confirms the positioning is working.`}`,
// //         required: true,
// //       },
// //     ];
// //     if (isDeepMode) {
// //       sections.push({
// //         name: "Next 3 Actions",
// //         label: "Your Next 3 Actions",
// //         skillInstruction: null,
// //         deepInstruction: `3 immediate job-search actions:\n1. [Positioning action â update or reframe the core value proposition] â you alone â today\n2. [Materials action â specific resume or portfolio update] â you alone â Day 3\n3. [Outreach action â first 10 specific companies or contacts] â you alone â by end of Week 1\n\nFormat: "N. [Specific action] â [who] â [deadline]"`,
// //         required: true,
// //       });
// //     }
// //     return sections;
// //   }

// //   // ââ Generic fallback schemas for remaining intent categories âââââââââââââââââ
// //   // These cover: business_strategy, data_analytics, health_wellness,
// //   // education_learning, design_ux, event_planning, general_project,
// //   // and any domain ID that doesn't match a named category above.
// //   //
// //   // Sections are derived from the request framework â strategic/phased/procedural/operational â
// //   // so even the generic path adapts its structure based on the request type.

// //   const genericSections = [];

// //   genericSections.push({
// //     name: "Expert Role",
// //     label: "Your Expert Role",
// //     skillInstruction: `Specific expert identity â name specialisation, years, ONE concrete method or rule you always apply first.\nPattern: "You are a [role] with [X] years of [specific experience]. Your first move is always [named action] because [concrete reason]."\nNEVER: "You are an expert with extensive experience" â too generic.`,
// //     deepInstruction: `Vivid, specific expert identity. Name specialisation, years, ONE concrete method or rule.\n\nThis section must contain ALL THREE in flowing prose:\n\nâ  COUNTER-INTUITIVE ORDERING:\n"Most [people/practitioners] do [X] first â that's the wrong order. [X] is a distraction until [Y] is solved. Start with [Y] because [specific mechanism]."\n\nâ¡ NON-OBVIOUS MISTAKE (3â4 sentences â expanded):\n"The biggest mistake I see here is [SPECIFIC mistake that experienced practitioners still make â not beginner-obvious]."\nThen: why it happens â what it costs (specific consequence) â the fix (named alternative action).\n\nâ¢ UNCOMFORTABLE TRADE-OFF (2â3 sentences):\n"The central trade-off here is [X vs Y]. [Why X is the trap]. [What to do instead and why]."`,
// //     required: true,
// //   });

// //   genericSections.push({
// //     name: "What You're Here to Do",
// //     label: "What You're Here to Do",
// //     skillInstruction: `One tight paragraph: exact goal, current starting point, success in concrete terms.\nWeave in detected constraints. Be specific about the outcome. Include one direct assertion.`,
// //     deepInstruction: `One tight paragraph: exact goal, starting point, success in concrete terms.\n${hasUserAnswers ? "MANDATE: Reference the user's specific situation from their answers â their numbers, stage, constraints." : "Weave in detected constraints naturally."}`,
// //     required: true,
// //   });

// //   genericSections.push({
// //     name: "Core Focus Areas",
// //     label: "Your Core Focus Areas",
// //     skillInstruction: `3â5 bullets. Each: named workstream + concrete output.\nFormat: "â¢ [Named Area]: [specific action/output â what gets built or decided]"\nBANNED:\nâ¢ "Monitor and analyze performance" â name the specific metric + action it triggers\nâ¢ "Ensure alignment with goals" â name a deliverable or decision`,
// //     deepInstruction: `3â5 bullets â distinct, named workstreams with concrete outputs.\nBANNED (rewrite if any appear):\nâ¢ "Monitor and analyze performance" â name the specific metric + the action it triggers\nâ¢ "Integrate user feedback" â name the specific mechanism\nâ¢ "Ensure alignment with goals" â name a deliverable or decision`,
// //     required: true,
// //   });

// //   genericSections.push({
// //     name: "How to Approach This",
// //     label: "How to Approach This",
// //     skillInstruction: framework === "procedural" || framework === "operational"
// //       ? `NUMBERED STEPS â not phases with week/month labels.\nFormat: **Step N â [Step Name]:** [what to do] â Visible result: [what you can verify/test]\nEach step produces something runnable, visible, or testable.`
// //       : `3â4 phases with **bold phase label** + timeframe.\nFormat: **[Phase Name] ([timeframe]):** [actions] â Output: [named deliverable]\nUse realistic week/sprint timing. Each phase has ONE named output.\nBANNED phase verbs: 'explore', 'consider', 'look into', 'research options'`,
// //     deepInstruction: framework === "procedural"
// //       ? `NUMBERED STEPS â not phases.\nFormat: **Step N â [Step Name]:** [what to do] â Visible result: [what you can verify/test]\nEach step must leave the reader with something runnable, visible, or testable.\nBANNED: 'Day 1', 'Week 1', 'Phase', '30-day', '90-day', milestone language.`
// //       : framework === "operational"
// //       ? `ORDERED DIAGNOSTIC SEQUENCE.\nFormat: **Step N â [Check]:** [command or action] â Pass: [what it means] â Fail: [what it means]\nOrder steps from most-likely root cause to least likely.\nBANNED: timeline language, phases, milestones.`
// //       : framework === "phased"
// //       ? `3â4 implementation phases:\nFormat: **[Phase Name] ([timeframe]):** [what happens] â Deliverable: [named, concrete output]\nPhase timeframes (e.g., Week 1â2). Final phase = what user does AFTER project is complete.\nBANNED: 30-day milestones, 90-day KPI targets, business revenue milestones in phase labels.`
// //       : /* strategic */
// //       `MANDATORY: 3â4 phases:\nFormat: **[Phase Name] ([timeframe]):** [what happens] â Deliverable: [named, concrete output]\nPHASE STRUCTURE:\nâ¢ Phase 1: Foundation â the thing BEFORE everything else\nâ¢ Phase 2: Build/execute â core work\nâ¢ Phase 3: Launch/validate â first real-world test with a metric\nâ¢ PHASE 4 â MANDATORY POST-GOAL PHASE: What happens AFTER the main goal.\n  NOT optional. A real plan always addresses "then what?"\nBANNED: 'explore', 'consider'. Every phase has a named output.`,
// //     required: true,
// //   });

// //   genericSections.push({
// //     name: "Key Numbers",
// //     label: "Key Numbers & Benchmarks",
// //     skillInstruction: `Markdown table, 4â6 rows. Every row has a real, specific number.\nFormat: | Parameter | Target / Benchmark |\nPull numbers ONLY from DOMAIN BENCHMARKS above. Never invent.\nBANNED rows: "Success metric: achieve project goals", any row with a made-up placeholder.`,
// //     deepInstruction: framework === "strategic"
// //       ? `Markdown table. Every row has a real, specific number. No ranges wider than 3Ã.\nFormat: | Parameter | Target / Benchmark |\n4â6 rows from DOMAIN BENCHMARKS above.\n${hasUserAnswers ? "MANDATE: If user provided a current metric, it appears as a 'Current baseline' row." : ""}\nAdd 30-day and 90-day target rows â must match milestones in What Good Looks Like exactly.\nBANNED: invented numbers, vague placeholders.`
// //       : `Markdown table â real, specific numbers relevant to this ${framework === "operational" ? "resolution process" : "implementation"}.\nFormat: | Parameter | Target / Benchmark |\n${hasUserAnswers ? "MANDATE: If user provided a current metric, it appears as a 'Current baseline' row." : ""}\nBANNED: invented numbers, 30-day milestones, 90-day targets, business KPIs (this is a ${framework} task).`,
// //     required: true,
// //   });

// //   genericSections.push({
// //     name: "What to Deliver",
// //     label: "What to Deliver",
// //     skillInstruction: `Every deliverable: the thing + its format + its purpose in one line. Nothing vague.`,
// //     deepInstruction: `Every deliverable: the thing + its format + its purpose. Nothing vague.\nFor each: name, format/medium, and how it will be used by the end user.`,
// //     required: true,
// //   });

// //   genericSections.push({
// //     name: "Ground Rules",
// //     label: "Ground Rules",
// //     skillInstruction: `4â5 direct rules as 'Never X', 'Always Y', or 'If Z then W'.\nEach rule addresses a real failure mode for THIS specific domain.\nInclude the 2â3 most common failure modes and the rule that prevents each.`,
// //     deepInstruction: `4â5 direct rules as 'Never X', 'Always Y', or 'If Z then W'.\n\nMANDATORY â 3 NAMED RISKS with ${framework === "strategic" ? "Week 1" : "immediate"} mitigations:\nFormat: "â  Risk: [specific failure mode in this domain â not generic]. Mitigation: [one concrete ${framework === "strategic" ? "Week 1" : "first"} action]."\n\nDOMAIN EXPERT TEST per risk: "Would a generalist identify this without domain experience?" If yes â too generic.\nBAD: "â  Risk: Poor planning leads to delays."\nGOOD pattern: "â  Risk: [Specific mechanism that fails at THIS stage in THIS domain] â [consequence with number/timeline]. Mitigation: [Named document, tool, or decision]."\nEach of the 3 risks must be a DIFFERENT type of failure (e.g. technical, process, market/audience).\n${hasUserAnswers ? "MANDATE: At least 2 of 3 risks must name a specific detail from the user's answers." : ""}`,
// //     required: true,
// //   });

// //   genericSections.push({
// //     name: "What Good Looks Like",
// //     label: "What Good Looks Like",
// //     skillInstruction: `3 criteria written as "The work must [observable, measurable outcome]."\nEach criterion verifiable by a third party. If you cannot measure it, rewrite it.\nMake criteria specific to this domain â not "The work must be comprehensive and high quality."`,
// //     deepInstruction: framework === "strategic"
// //       ? `MANDATORY â all 4 elements:\n\n1. 3 criteria as "The work mustâ¦" â concrete, observable, measurable by a third party.\n\n2. "**30-day milestone:** [specific number or shipped artifact]. If not hit, [specific corrective action] immediately."\nGOOD: "30-day milestone: 10 paying customers at >2% conversion. If not hit, pause paid ads and focus entirely on CRO."\nBAD: "30-day milestone: Good early progress." (no number, no corrective action)\n\n3. "**90-day milestone:** [sustained outcome with a number â proof the strategy is working]."\n\n4. "**What comes next:** [specific named project, tool, or system to build â NOT a vague process]."\n\n${hasUserAnswers ? "MANDATE: Use the user's specific numbers from their answers to set milestones." : ""}`
// //       : `3 criteria as "The work mustâ¦" â concrete, observable, measurable by a third party.\nEach criterion verifiable by a third party.\n${framework === "phased"
// //         ? `Final criterion: a concrete completion signal.\nDo NOT include 30-day milestones, 90-day goals, or business KPI targets.`
// //         : `Final criterion: a resolution signal â what passing looks like.\nDo NOT include milestones, day/week targets, or business metrics.`}`,
// //     required: true,
// //   });

// //   if (isDeepMode) {
// //     genericSections.push({
// //       name: "Next 3 Actions",
// //       label: "Your Next 3 Actions",
// //       skillInstruction: null,
// //       deepInstruction: `MANDATORY â 3 actions only. Each must:\nâ¢ Name the specific task (the actual thing, not a category)\nâ¢ Name who does it (user, developer, "you alone")\nâ¢ Name the deadline (${framework === "strategic" || framework === "phased" ? "Day 1, Day 3, by end of Week 1" : "immediately, within the hour, before anything else"} â not "soon" or "ASAP")\n\nFormat: "1. [Specific action] â [who] â [deadline]"\nGOOD: "1. [Named first action with a specific output] â you alone â by Day 3"\nBAD: "1. Start working on your strategy" (not specific, no owner, no deadline)\n\nThese 3 actions are the bridge between reading this brief and actually starting.`,
// //       required: true,
// //     });
// //   }

// //   return genericSections;
// // }

// // /**
// //  * Generates the JSON template string for the bottom of the prompt,
// //  * based on the dynamic section schema.
// //  *
// //  * @param {Array} schema  - section schema from buildSectionSchema()
// //  * @returns {string}
// //  */
// // function buildJsonTemplate(schema) {
// //   const sectionPlaceholders = schema
// //     .map(s => `**${s.label}**\\n...`)
// //     .join("\\n\\n");
// //   return `{"optimizedText":"${sectionPlaceholders}","suggestions":["one-line alt 1","one-line alt 2","one-line alt 3"]}`;
// // }

// // /**
// //  * Generates the "WRITE THESE N SECTIONS" instruction block from the schema.
// //  *
// //  * ââ FIX APPLIED HERE (see SECTION_VOICE_REMINDER above for full rationale) ââ
// //  * Every section's instruction text is now preceded by a short, mandatory
// //  * reminder that the text being requested is an INSTRUCTION TO THE OTHER
// //  * MODEL, not the final user-facing content. This is the single change that
// //  * resolves domain-specific schemas (recipe_cooking, travel_planning,
// //  * fitness_training, content_writing, marketing_growth, finance_investment,
// //  * career_job, tutorial, ai_image, debugging) collapsing into final-answer
// //  * output instead of system-prompt output. No schema content, mode logic,
// //  * or detection logic was changed.
// //  *
// //  * @param {Array}   schema
// //  * @param {boolean} isDeepMode
// //  * @returns {string}
// //  */
// // function buildSectionWritingBlock(schema, isDeepMode) {
// //   const mode = isDeepMode ? "DEEP MODE" : "SKILL MODE";
// //   const count = schema.length;
// //   const instructionKey = isDeepMode ? "deepInstruction" : "skillInstruction";

// //   const sectionBlocks = schema.map(s => {
// //     const instruction = s[instructionKey] || s.skillInstruction || "";
// //     return `**${s.label}**\n${SECTION_VOICE_REMINDER}\n${instruction}`;
// //   }).join("\n\n");

// //   return `ââââââââââââââââââââââââââââââââââââââââââââââââââââ
// // WRITE THESE ${count} SECTIONS IN ORDER [${mode}]:
// // â ï¸  Each section must INSTRUCT the other model â not answer the user directly.
// //     Every line you write is a directive to another LLM, not the final answer.
// //     The text below each **Bold Label** describes WHAT THE OTHER MODEL'S
// //     SECTION SHOULD CONTAIN â you are writing the brief, not the deliverable.
// // ââââââââââââââââââââââââââââââââââââââââââââââââââââ

// // ${sectionBlocks}`;
// // }

// // // âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
// // // buildEnrichedSystemPrompt
// // // âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
// // async function buildEnrichedSystemPrompt(userText, options = {}) {
// //   const perfHandle = perfStart("buildEnrichedSystemPrompt");

// //   const { domainId, subcategoryId, subcategoryLabel, deepAnswers, skillMode, deepMode, resolvedDomain } = options;

// //   const modeLabel = !skillMode ? "Normal Mode" : deepMode ? "Deep Mode" : "Skill Mode";
// //   console.log(`[skillEngine] buildEnrichedSystemPrompt | mode=${modeLabel} | domain=${domainId || "auto"} | text="${userText.slice(0, 60)}"`);

// //   // ââ Resolve domain âââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
// //   let domain = null;
// //   if (domainId) domain = DOMAINS.find(d => d.id === domainId) || null;

// //   if (!domain) {
// //     const namedTool = detectNamedTool(userText);
// //     if (namedTool?.id === "ai_image_gen") {
// //       domain = DOMAINS.find(d => d.id === "ai_image_gen") || null;
// //     }
// //   }

// //   if (!domain) domain = detectDomain(userText);

// //   if (!domain) {
// //     if (resolvedDomain) {
// //       domain = resolvedDomain;
// //       console.log(`[skillEngine] Using pre-resolved domain: "${domain.domainName || domain.id}"`);
// //     } else {
// //       console.log(`[skillEngine] No hardcoded domain matched â triggering AI classification for: "${userText.slice(0, 60)}"`);
// //       domain = await getDynamicDomain(userText);
// //       if (domain) {
// //         console.log(`[skillEngine] Classification resolved to: "${domain.domainName || domain.id}"`);
// //       }
// //     }
// //   }

// //   if (!domain) {
// //     const { UNIVERSAL_FALLBACK_DOMAIN } = require("./constants");
// //     domain = UNIVERSAL_FALLBACK_DOMAIN;
// //     console.log("[skillEngine] Using UNIVERSAL_FALLBACK_DOMAIN as final safety net");
// //   }

// //   // ââ Intent flags âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
// //   const isWebsite  = detectWebsiteBuildIntent(userText);
// //   const isTutorial = detectTutorialIntent(userText) && !isWebsite;
// //   const hasEduCtx  = /\b(course|learn|teach|student|education|tutorial|lesson)\b/i.test(userText);
// //   const isHybrid   = isWebsite && hasEduCtx;
// //   const isAIImage  = domain?.id === "ai_image_gen";

// //   // ââ Mode flags âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
// //   const isSkillMode = !!(skillMode && !deepMode);
// //   const isDeepMode  = !!(skillMode && deepMode);

// //   // ââ Request framework ââââââââââââââââââââââââââââââââââââââââââââââââââââââ
// //   const requestFramework = isDeepMode
// //     ? classifyRequestFramework(userText, domain?.id || null, isTutorial, isWebsite, isAIImage)
// //     : "strategic";

// //   // ââ NORMAL MODE ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
// //   if (!skillMode) {
// //     const prompt = `You are a helpful AI assistant. Transform the user's raw request into a clear, well-structured prompt that will produce high-quality, useful output.

// // USER REQUEST: "${userText}"

// // OUTPUT FORMAT â return a JSON object with exactly two keys:
// //   "optimizedText": a clear, improved version of the user's prompt as a single string
// //   "suggestions":   array of 3 alternative one-line phrasings

// // Return STRICT JSON ONLY â no markdown fences, no extra text:
// // {"optimizedText":"...","suggestions":["alt1","alt2","alt3"]}`;
// //     perfEnd(perfHandle);
// //     return prompt;
// //   }

// //   // ââ Constraints ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
// //   const autoConstraints = extractConstraints(userText);

// //   const userAnswers = (deepAnswers && typeof deepAnswers === "object")
// //     ? Object.entries(deepAnswers)
// //         .filter(([, v]) => v && String(v).trim())
// //         .map(([k, v]) => `â¢ ${k.replace(/_/g, " ")}: ${v}`)
// //     : [];

// //   const allConstraints  = { ...autoConstraints, ...(deepAnswers || {}) };
// //   const constraintLines = Object.entries(autoConstraints)
// //     .filter(([, v]) => v && String(v).trim())
// //     .map(([k, v]) => `${k.replace(/_/g, " ")}: ${v}`);

// //   // ââ Resolve role + knowledge + tone âââââââââââââââââââââââââââââââââââââââ
// //   let expertRole, domainKnowledge, expertTone;

// //   if (isAIImage) {
// //     expertRole      = domain.role;
// //     domainKnowledge = domain.knowledge;
// //     expertTone      = domain.tone;
// //   } else if (isHybrid) {
// //     expertRole      = "hybrid EdTech Product Builder and full-stack developer with 10+ years shipping online learning platforms (Next.js, Supabase, Stripe) â you understand both the engineering and what makes students actually complete courses";
// //     const ed        = DOMAINS.find(d => d.id === "edtech_product");
// //     domainKnowledge = (domain?.knowledge || "") + (ed?.knowledge || "");
// //     expertTone      = "technical, product-focused, launch-oriented";
// //   } else if (isTutorial) {
// //     const tut       = DOMAINS.find(d => d.id === "technical_tutorial");
// //     expertRole      = tut?.role || "senior technical educator and developer advocate with 10+ years creating project-based coding tutorials";
// //     domainKnowledge = tut?.knowledge || "";
// //     expertTone      = "clear, encouraging, hands-on, beginner-friendly";
// //   } else if (domain) {
// //     expertRole      = domain.role;
// //     domainKnowledge = domain.knowledge;
// //     expertTone      = domain.tone;
// //   } else {
// //     expertRole      = "expert multi-domain AI consultant with deep knowledge across business, technology, marketing, education, finance, and creative domains";
// //     domainKnowledge = "";
// //     expertTone      = "professional, clear, immediately actionable";
// //   }

// //   // ââ Travel agency business building override âââââââââââââââââââââââââââââââ
// //   const isTravelAgencyBuild = detectBusinessBuildingIntent(userText) &&
// //     /\b(travel|tour|tourism)\b/i.test(userText);

// //   if (isTravelAgencyBuild) {
// //     expertRole = "boutique travel agency founder and D2C tourism business strategist with 12+ years launching niche travel brands â expert in positioning, safety-first design for women travellers, digital acquisition, and scaling from solo operator to team";
// //     domainKnowledge = `TRAVEL AGENCY STARTUP BENCHMARKS:
// // - Business registration (India): â¹5,000ââ¹15,000 (sole proprietorship or LLP)
// // - IATA accreditation: optional for niche agencies; required for ticketing commission
// // - Niche positioning premium: 30â50% higher margins vs generic travel agencies
// // - Solo women travel market (India): growing 25% YoY â highest NPS segment in travel
// // - Customer acquisition: Instagram + SEO drives 60â70% of bookings for niche operators
// // - Average booking value: â¹25,000ââ¹80,000 per solo woman traveller (domestic trip)
// // - First 10 customers: referral-only; first 50: organic content + community
// // - Safety infrastructure: 24/7 emergency contact + vetted accommodation policy = #1 trust signal
// // - Website conversion: booking inquiry form converts at 3â8% with testimonials + itinerary samples
// // - Scaling milestone: â¹10L MRR before hiring first operations coordinator`;
// //     expertTone = "entrepreneurial, safety-conscious, niche-market-savvy, community-first";
// //     console.log(`[skillEngine] Travel agency business build detected â injecting business strategy role`);
// //   }

// //   const expertRoleShort = expertRole.split(" with")[0];

// //   // ââ Detect intent category âââââââââââââââââââââââââââââââââââââââââââââââââ
// //   const intentCategory = detectIntentCategory(
// //     userText, domain?.id || null, isTutorial, isWebsite, isAIImage,
// //     requestFramework
// //   );

// //   console.log(`[skillEngine] intentCategory=${intentCategory} | framework=${requestFramework}`);

// //   // ââ Build dynamic section schema âââââââââââââââââââââââââââââââââââââââââââ
// //   const sectionSchema = buildSectionSchema(
// //     intentCategory, requestFramework, isDeepMode, isTutorial, isWebsite, isAIImage,
// //     allConstraints, userAnswers
// //   );

// //   console.log(`[skillEngine] section schema: [${sectionSchema.map(s => s.name).join(", ")}]`);

// //   // ââ Shared blocks ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
// //   const techChoice = allConstraints.technology || null;

// //   const tutorialTechBlock = isTutorial ? `
// // BEFORE WRITING â COMMIT TO TWO DECISIONS:

// // Decision 1 â Technology:
// // ${techChoice
// //   ? `User specified: ${techChoice}. Build the entire tutorial around this. Do not hedge.`
// //   : `Pick the single most appropriate technology:
// //    â¢ Absolute beginner â HTML + CSS (portfolio page, ~2â3 hr build)
// //    â¢ Knows HTML/CSS â Vanilla JavaScript (quiz or to-do app, ~3â4 hr build)
// //    â¢ Knows JS basics â React (weather app or GitHub profile viewer, ~4â6 hr build)
// //    â¢ Data/backend interest â Python (dashboard or web scraper, ~3â5 hr build)
// //    â¢ Mobile â React Native + Expo (habit tracker, ~5â8 hr build)
// //    COMMIT to one. Name it explicitly.`
// // }

// // Decision 2 â Mini-project (Deep Mode: NOT a generic portfolio, to-do list, or calculator):
// // Name a SPECIFIC, DEPLOYABLE project: ${isDeepMode ? "completable in 1â2 weekends (6â12 hrs)" : "completable in one sitting (2â6 hrs)"}, GitHub/portfolio-ready.

// // Deployment rules:
// //   â¢ HTML/CSS/JS/React â Netlify or Vercel
// //   â¢ Python web app â Render or Railway
// //   â¢ Python data dashboard â Streamlit Cloud
// //   â¢ React Native â Expo Go + EAS build
// //   Never send Python to Vercel. Never send React to Heroku.

// // State both decisions in "Your Expert Role" and carry through every section.
// // ` : "";

// //   const aiImageBlock = isAIImage ? `
// // BEFORE WRITING â NOTE THE TOOL CONTEXT:
// // Tool detected: ${allConstraints.tool || "Midjourney"}
// // Platform/format: ${allConstraints.platform_type || "not specified â address in questions or assume Instagram 1:1"}
// // Style direction: ${allConstraints.style || "not specified"}
// // Experience level: ${allConstraints.skill_level || "not specified"}

// // AI IMAGE GENERATION RULES (apply to every section):
// // - Expert role, benchmarks, and ground rules must reference ${allConstraints.tool || "Midjourney"} specifically â not generic photography
// // - Benchmarks table uses: prompt iterations, acceptance rate, aspect ratio, style consistency â NOT aperture or tripod specs
// // - Ground rules reference tool-specific parameters (--style raw, --sref, --ar, --chaos)
// // - Risks must be tool-specific failure modes (style drift, version defaults, catalogue inconsistency)
// // - NEVER mention DSLR, camera settings, tripod, aperture, shutter speed, or physical lighting setups
// // ` : "";

// //   const subcategoryFocus = subcategoryLabel
// //     ? `\nFOCUS: User selected "${subcategoryLabel}". Every section must serve this specific focus.\n`
// //     : "";

// //   const constraintsBlock = constraintLines.length > 0 ? `
// // AUTO-DETECTED CONTEXT (weave into every section):
// // ${constraintLines.map(l => `â¢ ${l}`).join("\n")}
// // ` : "";

// //   const userAnswersBlock = (isDeepMode && userAnswers.length > 0) ? `
// // WHAT THE USER TOLD US (Deep Mode answers â reference DIRECTLY in output):
// // ${userAnswers.join("\n")}
// // ` : "";

// //   const techDomains = [
// //     "edtech_product","technical_tutorial","product_development","saas_product",
// //     "cloud_devops","mobile_app_development","no_code_tools","data_science_ai",
// //     "ai_automation","uiux_design","blockchain_web3","cybersecurity","ai_image_gen",
// //     "backend_architecture","linkedin_automation","gamified_fitness_app",
// //     "language_learning_app","ecommerce_store",
// //   ];
// //   const modernToolsBlock = (isWebsite || isTutorial || techDomains.includes(domain?.id)) && !isAIImage ? `
// // TOOL PALETTE â recommend with one concrete reason per choice:
// // Frontend:   Next.js 14, React 18, Vanilla JS, Tailwind CSS, shadcn/ui
// // Backend/DB: Supabase (Postgres+Auth+Storage), Neon, PlanetScale, Prisma ORM
// // Auth:       Supabase Auth, Clerk, Auth.js
// // Payments:   Stripe (global), Razorpay (India-first)
// // Video:      Mux or Bunny.net (NOT YouTube for gated content)
// // Deploy:     Vercel (JS/TS), Railway or Render (Python/Node), Streamlit Cloud (dashboards)
// // Mobile:     React Native + Expo, Flutter (brand-heavy)
// // Analytics:  PostHog (open source), Mixpanel, GA4
// // ` : "";

// //   const knowledgeBlock = domainKnowledge
// //     ? `\nDOMAIN BENCHMARKS (use these numbers â don't invent your own):\n${domainKnowledge}\n`
// //     : "";

// //   // ââ Build the JSON template from schema ââââââââââââââââââââââââââââââââââââ
// //   const jsonTemplate = buildJsonTemplate(sectionSchema);

// //   // ââ Section writing block from schema âââââââââââââââââââââââââââââââââââââ
// //   const sectionWritingBlock = buildSectionWritingBlock(sectionSchema, isDeepMode);

// //   // âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
// //   // SKILL MODE â SYSTEM PROMPT
// //   // âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
// //   if (isSkillMode) {
// //     const sectionCount = sectionSchema.length;
    
// //     // ââ Generate dynamic headers ââââââââââââââââââââââââââââââââââââââââââââââ
// //     const headerExample = generateHeaderExample(sectionSchema);
// //     const headerList = generateHeaderList(sectionSchema);
// //     const requiredHeaders = sectionSchema.map(s => `**${s.label}**`).join('\n');
// //     // âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ

// //     const prompt = META_SYSTEM_PROMPT_FENCE + `You are an expert prompt engineer. Transform the user's request into a structured SYSTEM PROMPT that will be used to instruct another model.

// // â ï¸ CRITICAL: This is a SYSTEM PROMPT for another model.
// // You are NOT answering the user directly.
// // You are writing INSTRUCTIONS for how the other model should behave.

// // BAD: "As a chef, I can guide you..."
// // GOOD: "You are a chef. Your role is to guide users..."

// // BAD: "You will need the following ingredients..."
// // GOOD: "Generate a clear ingredients list for the user."

// // BAD: "Step 1 â Marinate the Chicken..."
// // GOOD: "Provide step-by-step cooking instructions in a clear sequence."

// // OUTPUT FORMAT â NON-NEGOTIABLE:
// // Return a JSON object with exactly two keys:
// //   "optimizedText": one continuous string with all ${sectionCount} sections using **Bold Label** headers
// //   "suggestions":   array of 3 alternative one-line phrasings

// // WRONG: {"Your Expert Role":"...","What to Deliver":"..."}
// // RIGHT: {"optimizedText":"${headerExample}","suggestions":["alt1","alt2","alt3"]}

// // ââââââââââââââââââââââââââââââââââââââââââââââââââââ
// // â ï¸ CRITICAL SECTION HEADER RULE â DO NOT CHANGE THESE:
// // You MUST include EVERY section header exactly as shown below.
// // Do NOT skip, rename, or rephrase any section header.

// // ${requiredHeaders}

// // For this request type (${intentCategory}), the headers MUST be exactly:
// // ${headerList}

// // Bold label format: **Section Name** on its own line, content below.
// // No ## headers. No numbered sections.
// // ââââââââââââââââââââââââââââââââââââââââââââââââââââ

// // USER REQUEST: "${userText}"
// // ${subcategoryFocus}${constraintsBlock}${tutorialTechBlock}${aiImageBlock}${knowledgeBlock}${modernToolsBlock}
// // Tone of voice: ${expertTone}
// // Expert to embody: ${expertRole}

// // ââââââââââââââââââââââââââââââââââââââââââââââââââââ
// // âââ MODE: SKILL MODE â Professional Practitioner Brief (SYSTEM PROMPT) âââ

// // â ï¸ REMINDER: This is a SYSTEM PROMPT for another model. Every section must instruct the model on HOW TO BEHAVE, not provide the final answer to the user.

// // PERSONA TO EMBODY: The model you are instructing should embody a ${expertRoleShort}. It has executed this type of work dozens of times. It does not hedge. It recommends. It prioritises. It names things specifically.

// // RULES FOR THE MODEL TO FOLLOW:
// // - Every section must serve the user's exact request â no generic filler
// // - Each recommendation must be immediately actionable
// // - Use practitioner-specific language â real tool names, actual numbers
// // - Each phase must have a named, concrete output
// // - Numbers and benchmarks must appear in at least 3 of the ${sectionCount} sections
// // - Use domain knowledge benchmarks above â never invent numbers
// // ${isTutorial
// //   ? `â¢ Scope: ONE sitting (2â5 hrs). Not weeks. A tutorial is NOT a course.
// // - Target: 1,500â2,200 words. State read time and build time SEPARATELY.
// // - Every concept gets a runnable code example.`
// //   : `â¢ Target: 580â740 words. Density over length.`
// // }

// // OPINION REQUIREMENT â ONE DIRECT ASSERTION PER SECTION:
// // The model must include at least one statement written as direct fact, not suggestion.
// // GOOD: "Don't use --v5 for product photography â --v6 with --style raw produces 3Ã more photorealistic outputs."
// // GOOD: "Never start with paid ads at sub-â¹1L/month budget â organic content compounding is 3Ã more capital-efficient for the first 90 days."
// // BAD:  "You may want to consider whether X is the right choice for you."
// // One direct assertion per section. Short. No hedging.

// // BANNED PHRASES (the model must rewrite anything containing these):
// // "comprehensive","high-quality","ensure","consider","look into","robust",
// // "leverage","best practices","it's important to","holistic","key takeaway",
// // "various","multiple","a number of","in conclusion"

// // ${sectionWritingBlock}

// // ââââââââââââââââââââââââââââââââââââââââââââââââââââ
// // Return STRICT JSON ONLY â no markdown fences, no preamble:
// // ${jsonTemplate}`;

// //     perfEnd(perfHandle);
// //     return prompt;
// //   }

// //   // âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
// //   // DEEP MODE â SYSTEM PROMPT
// //   // âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ

// //   const _fw = requestFramework;

// //   // ââ Generate dynamic headers for Deep Mode âââââââââââââââââââââââââââââââââ
// //   const headerListDeep = generateHeaderList(sectionSchema);
// //   const requiredHeadersDeep = sectionSchema.map(s => `**${s.label}**`).join('\n');
// //   // ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ

// //   const reasoningChainBlock = `
// // ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
// // â  INTERNAL REASONING â COMPLETE ALL STEPS BEFORE WRITING ANY SECTION    â
// // â  Steps 2, 3, 4 MUST surface explicitly in output sections.             â
// // â  Step 2 assumptions â flag in Your Expert Role or Ground Rules.        â
// // â  Step 3 trade-off â name explicitly in Your Expert Role.               â
// // â  Step 4 risks â each becomes one â  Risk entry in Ground Rules.        â
// // ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ

// // REQUEST FRAMEWORK DETECTED: ${_fw.toUpperCase()}
// // ${_fw === "strategic"  ? "â Full timeline structure: phases with week/month labels + 30-day + 90-day milestones + KPIs."        : ""}
// // ${_fw === "phased"     ? "â Implementation phases with deliverables. NO long-horizon milestones or business KPIs."              : ""}
// // ${_fw === "procedural" ? "â Step-by-step instructions. NO timeline language, NO milestones, NO weeks/months framing."           : ""}
// // ${_fw === "operational"? "â Immediate action sequence. NO planning phases, NO milestones. Focus: resolution steps + root cause." : ""}

// // Step 1 â SITUATION ANALYSIS:
// // What is the user actually trying to achieve? What is their real starting point?
// // ${_fw === "strategic"  ? "What would success look like in 90 days? What is the gap between where they are and where they need to be?" : ""}
// // ${_fw === "phased"     ? "What does a successfully completed implementation look like? What are the key decision points along the way?" : ""}
// // ${_fw === "procedural" ? "What is the end state after following these steps? What prior knowledge can the reader be assumed to have?" : ""}
// // ${_fw === "operational"? "What is the exact problem? What are its likely root causes? What is the fastest path to resolution?" : ""}
// // If the user gave Deep Mode answers, use those as the primary facts â not invented context.

// // Step 2 â KEY ASSUMPTIONS (SURFACE IN OUTPUT):
// // What am I assuming that could be wrong? List 2â3. If uncertain, flag explicitly:
// // "This assumes you have X â if not, do Y instead." Do NOT silently assume.
// // BAD: Assume user has existing email list without checking.
// // GOOD: "I'm assuming no existing audience â if you have one, Week 1 changes from list-building to segmentation."

// // Step 3 â TRADE-OFFS (NAME IN YOUR EXPERT ROLE):
// // What is the single most important strategic trade-off? Name it explicitly in Your Expert Role.
// // "The central trade-off is X vs Y â every [resource] spent on X before Y is fixed is [consequence]."

// // Step 4 â RISKS (BECOME â  RISK ENTRIES):
// // 3 most likely ways this engagement fails. NOT generic â named failure modes in THIS domain at THIS stage.
// // If user gave Deep Mode answers, at least one risk references their specific situation.
// // Each risk â one â  Risk entry in Ground Rules. They must match.

// // Step 5 â ${_fw === "procedural" || _fw === "operational" ? "SEQUENCE PLAN" : "PHASED PLAN"}:
// // ${_fw === "strategic"
// //   ? `Correct sequence? Most people start with the wrong thing.
// // Identify the counter-intuitive ordering. MANDATORY: the FINAL phase is a standalone POST-GOAL phase
// // (what happens AFTER the main objective is achieved). NOT optional. NOT a parenthetical.`
// //   : _fw === "phased"
// //   ? `Correct implementation sequence? Break into 3â4 phases with clear start/end.
// // Each phase has ONE named deliverable. The final phase is what the user does AFTER completion (next logical step).`
// //   : _fw === "procedural"
// //   ? `Correct step sequence? What order makes the concept click fastest?
// // Identify the step most tutorials get wrong. Each step must produce a visible/testable result.`
// //   : `Fastest resolution path? What should be checked first to eliminate the most likely cause?
// // Name 3 investigation steps in order of likelihood. Each step has a pass/fail test.`
// // }

// // ${_fw === "strategic" ? `Step 6 â SUCCESS METRICS:
// // 30-day and 90-day milestones â specific numbers or shipped artifacts. NOT "good progress".
// // If user gave specific numbers in Deep Mode answers, use those as anchors.
// // For each: corrective action if milestone is missed.

// // MILESTONE LANGUAGE RULES:
// // For business-building prompts: milestones must be startup metrics â first paying customer,
// // website live date, first â¹X revenue, CAC, conversion rate, retention rate.
// // BANNED milestone language: "make progress", "build momentum", "establish foundation",
// // "continue growing", "solidify brand identity", "build presence".
// // EXAMPLE GOOD: "30-day milestone: Website live + first 3 paid bookings. If not hit, shift from content to direct outreach â DM 50 travel communities."
// // EXAMPLE BAD: "30-day milestone: Begin establishing your brand presence online."` : ""}

// // Only after all steps above, write the output sections.
// // `;

// //   const deepModePersonaLine = {
// //     strategic:   `battle-tested senior consultant who has delivered 50+ high-stakes engagements. You are known for being direct, spotting hidden risks, and giving advice that actually moves the needle.`,
// //     phased:      `principal-level practitioner who has shipped 30+ complex implementations from zero to live. You cut through noise and clearly name the deliverable for every phase.`,
// //     procedural:  `senior technical educator with 12+ years teaching complex concepts. You know exactly which step trips people and never let a concept land without a runnable example.`,
// //     operational: `domain specialist and incident-response expert who has resolved hundreds of similar issues. You prioritize root-cause isolation over symptom-chasing.`,
// //   }[requestFramework];

// //   const sectionCount = sectionSchema.length;

// //   const deepModeBlock = `
// // âââ DEEP CONSULTANT MODE â Senior Strategy Engagement (SYSTEM PROMPT) âââ

// // â ï¸ CRITICAL: This is a SYSTEM PROMPT for another model.
// // You are NOT answering the user directly.
// // You are writing INSTRUCTIONS for how the other model should behave, think, and structure its response.

// // Every section must instruct the model on HOW TO BEHAVE, not provide the final answer.

// // BAD: "I can guide you..."
// // GOOD: "You are to act as a guide. Your role is to instruct the user..."

// // BAD: "The biggest mistake I see here is..."
// // GOOD: "You must warn the user about the biggest mistake..."

// // BAD: "Plan to marinate your chicken..."
// // GOOD: "Instruct the user to marinate the chicken..."

// // PERSONA TO EMBODY: The model you are instructing is a ${deepModePersonaLine} It is a ${expertRoleShort}.

// // ${userAnswers.length > 0
// //   ? `The user gave specific context (see WHAT THE USER TOLD US above). The model must reference their exact numbers and situation in risks and actions. Generic advice when specific inputs exist is unacceptable.`
// //   : ""}

// // ââââââââââââââââââââââââââââââââââââââââââââââââââââ
// // â ï¸ CRITICAL SECTION HEADER RULE â DO NOT CHANGE THESE:
// // You MUST include EVERY section header exactly as shown below.
// // Do NOT skip, rename, or rephrase any section header.

// // ${requiredHeadersDeep}

// // For this request type (${intentCategory}), the headers MUST be:
// // ${headerListDeep}

// // These headers are dynamic and change based on the domain.
// // For a recipe request, they would be: Your Expert Role, Dish Overview, Ingredients, etc.
// // For a travel request, they would be: Your Expert Role, Trip Overview, Itinerary, etc.
// // For a fitness request, they would be: Your Expert Role, Training Overview, Weekly Programme, etc.

// // ALWAYS use the headers provided above â never make up your own.
// // ââââââââââââââââââââââââââââââââââââââââââââââââââââ

// // ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
// // DEPTH & QUALITY REQUIREMENTS (For the Model to Follow)
// // ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ

// // ANTI-GENERIC RULE:
// // The model must never write generic advice like "be consistent", "plan properly", "monitor performance", or "ensure quality".
// // Every recommendation must be specific â name tools, exact actions, mechanisms, or real numbers.

// // DEPTH REQUIREMENT:
// // Before writing any section, the model must ask:
// // "Would an experienced practitioner in this field find this insight obvious or generic?"
// // If yes â rewrite with more specificity, a real example, or a named mechanism.

// // VOICE TRIGGERS â THE MODEL MUST INCLUDE ALL THREE:
// // Each trigger must be a FULL PARAGRAPH (minimum 3â4 sentences).

// // - "The biggest mistake I see here isâ¦"
// //   The model must name a specific mistake even experienced people make. Explain why it happens + the cost + the fix.

// // - "What most people get wrong isâ¦"
// //   The model must identify something that looks correct but backfires. Explain the failure mechanism + what to do instead.

// // - "Here's the uncomfortable truthâ¦"
// //   The model must share a non-obvious insight that challenges common thinking. Explain the implication + give a direct recommendation.

// // DIRECT ASSERTION RULE:
// // Every major section must contain at least one statement written as a direct fact/opinion (not a soft suggestion).

// // PER-SECTION MANDATE:
// // - "Ground Rules" must contain exactly 3 named risks with specific mechanisms.
// // - If user gave Deep Mode answers, the model must reference them in relevant sections.
// // - ${requestFramework === "strategic" ? `"What Good Looks Like" must use the user's specific numbers for milestones.` : ""}

// // TARGET WORD COUNT: ${
// //   isTutorial ? "2,000â3,000 words" :
// //   requestFramework === "strategic" ? "800â1,000 words (high density)" :
// //   requestFramework === "phased" ? "500â800 words" :
// //   requestFramework === "procedural" ? "400â600 words" :
// //   "400â600 words"
// // }

// // BANNED WORDS: "comprehensive", "high-quality", "ensure", "consider", "robust", "leverage", "best practices", "holistic", "key takeaway".
// // `;

// //   const deepPrompt = META_SYSTEM_PROMPT_FENCE + `You are an expert prompt engineer. Transform the user's raw request into a rich, expert SYSTEM PROMPT that instructs another model on how to behave.

// // â ï¸ CRITICAL: This is a SYSTEM PROMPT for another model.
// // You are NOT answering the user directly.
// // You are writing INSTRUCTIONS for how the other model should behave, think, and structure its response.

// // OUTPUT FORMAT â NON-NEGOTIABLE:
// // Return a JSON object with exactly two keys:
// //   "optimizedText": one continuous string with all sections using **Bold Label** headers
// //   "suggestions":   array of 3 alternative one-line phrasings

// // WRONG: {"Your Expert Role":"...","What to Deliver":"..."}
// // RIGHT: {"optimizedText":"**${sectionSchema[0]?.label || "Your Expert Role"}**\\nYou are...","suggestions":[...]}

// // Bold label format: **Section Name** on its own line, content below. No ## headers. No numbered sections.

// // ââââââââââââââââââââââââââââââââââââââââââââââââââââ

// // USER REQUEST: "${userText}"
// // ${subcategoryFocus}${constraintsBlock}${userAnswersBlock}${tutorialTechBlock}${aiImageBlock}${knowledgeBlock}${modernToolsBlock}${reasoningChainBlock}${deepModeBlock}
// // Tone of voice: ${expertTone}
// // Expert to embody: ${expertRole}

// // ${sectionWritingBlock}

// // ââââââââââââââââââââââââââââââââââââââââââââââââââââ
// // Return STRICT JSON ONLY â no markdown, no extra text:
// // ${jsonTemplate}`;

// //   perfEnd(perfHandle);
// //   return deepPrompt;
// // }
// // // âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
// // // buildDetailedSystemPrompt (legacy alias)
// // // âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
// // async function buildDetailedSystemPrompt(userText, options = {}) {
// //   return buildEnrichedSystemPrompt(userText, options);
// // }

// // // âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
// // // validateDetailedOutput
// // //
// // // Updated to support dynamic section schemas.
// // // The function now accepts an optional `sectionSchema` parameter.
// // // When provided, it validates against the dynamic schema.
// // // When absent (legacy callers), it falls back to REQUIRED_SECTIONS_BASE /
// // // REQUIRED_SECTIONS_DEEP_ONLY from constants â preserving backward compatibility.
// // // âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
// // function validateDetailedOutput(parsed, sectionSchema = null) {
// //   if (parsed && typeof parsed === "object" && !parsed.optimizedText) {
// //     // Attempt to reconstruct from flat JSON (legacy failure mode)
// //     const allSections = sectionSchema
// //       ? sectionSchema.map(s => s.label)
// //       : [...REQUIRED_SECTIONS_BASE, ...REQUIRED_SECTIONS_DEEP_ONLY];
// //     const foundSections = allSections.filter(s => parsed[s] || parsed[s.toLowerCase()]);
// //     if (foundSections.length >= 4) {
// //       const rebuilt = foundSections
// //         .map(s => `**${s}**\n${parsed[s] || parsed[s.toLowerCase()] || ""}`)
// //         .join("\n\n");
// //       parsed.optimizedText = rebuilt;
// //       parsed.suggestions   = parsed.suggestions || [];
// //       console.log(`[skillEngine] validateDetailedOutput: rebuilt flat JSON (${foundSections.length} sections)`);
// //     }
// //   }

// //   if (parsed?.optimizedText && typeof parsed.optimizedText !== "string") {
// //     try   { parsed.optimizedText = JSON.stringify(parsed.optimizedText); }
// //     catch { parsed.optimizedText = String(parsed.optimizedText); }
// //   }

// //   const text = parsed?.optimizedText || "";
// //   const isDeepOutput = sectionSchema
// //     ? sectionSchema.some(s => s.name === "Next 3 Actions" && new RegExp(`\\*\\*${s.label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\*\\*`, "i").test(text))
// //     : /\*\*Your Next 3 Actions\*\*/i.test(text);

// //   // Build the list of sections to check
// //   let sectionsToCheck;
// //   if (sectionSchema) {
// //     // Dynamic schema: check all required sections
// //     sectionsToCheck = sectionSchema
// //       .filter(s => s.required)
// //       .map(s => s.label);
// //   } else {
// //     // Legacy fallback: use constants
// //     sectionsToCheck = isDeepOutput
// //       ? [...REQUIRED_SECTIONS_BASE, ...REQUIRED_SECTIONS_DEEP_ONLY]
// //       : REQUIRED_SECTIONS_BASE;
// //   }

// //   const missingSections = sectionsToCheck.filter(s => {
// //     const escaped = s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
// //     const pattern = new RegExp(`\\*\\*${escaped}\\*\\*`, "i");
// //     return !pattern.test(text);
// //   });

// //   // thinSections: sections that are present but too brief (< 60 words).
// //   const thinSections = [];

// //   if (isDeepOutput) {
// //     const wordCount = text.split(/\s+/).filter(Boolean).length;

// //     // Detect framework from output content
// //     const hasTimeline  = /\b(30-day|90-day|week\s+\d|month\s+\d)\b/i.test(text);
// //     const hasSteps     = /\*\*Step\s+\d/i.test(text);
// //     const hasDiagnosis = /\b(root\s+cause|diagnos|resolution|pass\/fail)\b/i.test(text);

// //     const detectedFramework =
// //       hasDiagnosis && !hasTimeline ? "operational" :
// //       hasSteps     && !hasTimeline ? "procedural"  :
// //       hasTimeline                  ? "strategic"   :
// //       "phased";

// //     const MIN_WORDS = {
// //       strategic:   900,
// //       phased:      700,
// //       procedural:  500,
// //       operational: 300,
// //     }[detectedFramework] ?? 900;

// //     const TARGET_RANGE = {
// //       strategic:   "1,100â1,600",
// //       phased:      "800â1,100",
// //       procedural:  "600â900",
// //       operational: "400â600",
// //     }[detectedFramework] ?? "1,100â1,600";

// //     if (wordCount < MIN_WORDS) {
// //       const allPresent = sectionsToCheck.filter(s => {
// //         const escaped = s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
// //         return new RegExp(`\\*\\*${escaped}\\*\\*`, "i").test(text);
// //       });

// //       for (const sectionName of allPresent) {
// //         const escaped = sectionName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
// //         const sectionMatch = text.match(
// //           new RegExp(`\\*\\*${escaped}\\*\\*\\n([\\s\\S]*?)(?=\\*\\*[A-Z]|$)`, "i")
// //         );
// //         if (sectionMatch) {
// //           const sectionWords = sectionMatch[1].trim().split(/\s+/).filter(Boolean).length;
// //           if (sectionWords < 60) thinSections.push(sectionName);
// //         }
// //       }

// //       // Always ensure Expert Role section is in thinSections for word-count failures
// //       const expertRoleLabel = sectionSchema
// //         ? (sectionSchema.find(s => s.name === "Expert Role")?.label || "Your Expert Role")
// //         : "Your Expert Role";
// //       if (!thinSections.includes(expertRoleLabel)) thinSections.push(expertRoleLabel);

// //       missingSections.push(
// //         `__word_count__ (~${wordCount} words â ${detectedFramework} framework minimum ${MIN_WORDS}, target ${TARGET_RANGE}. ` +
// //         `Expand Expert Role section with the full persona + 3 voice trigger paragraphs. ` +
// //         `Expand each risk with domain-specific consequences. Every section needs 2â3 sentences of reasoning, not just a headline.)`
// //       );
// //     }
// //   }

// //   return { isValid: missingSections.length === 0, missingSections, thinSections };
// // }

// // // âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
// // // buildWordCountPatchPrompt
// // //
// // // Updated to accept optional sectionSchema â uses dynamic section labels in
// // // the expansion target list when available, falls back to hardcoded defaults.
// // // âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
// // function buildWordCountPatchPrompt(existingOutput, thinSections, userText, suggestions = "[]", sectionSchema = null) {
// //   const targetList = thinSections.length > 0
// //     ? thinSections.map(s => `â¢ **${s}**`).join("\n")
// //     : sectionSchema
// //       ? sectionSchema.slice(0, 3).map(s => `â¢ **${s.label}**`).join("\n")
// //       : "â¢ **Your Expert Role**\nâ¢ **Ground Rules**\nâ¢ **How to Approach This**";

// //   // Find the label for the Expert Role section dynamically
// //   const expertRoleLabel = sectionSchema
// //     ? (sectionSchema.find(s => s.name === "Expert Role")?.label || "Your Expert Role")
// //     : "Your Expert Role";

// //   const groundRulesLabel = sectionSchema
// //     ? (sectionSchema.find(s => s.name === "Ground Rules")?.label || "Ground Rules")
// //     : "Ground Rules";

// //   return `You are editing an existing AI prompt brief. The structure and sections are correct but some sections are too short.

// // ORIGINAL USER REQUEST: "${userText}"

// // EXISTING BRIEF (modify in-place â do NOT change section order, labels, or structure):
// // ${existingOutput}

// // ââââââââââââââââââââââââââââââââââââââââââââââââââââ
// // TASK â EXPAND ONLY THESE SECTIONS (leave all others exactly as written):
// // ${targetList}

// // EXPANSION RULES:
// // â¢ Each expanded section must reach at least 80 words of substantive content
// // â¢ For **${expertRoleLabel}**: add all 3 voice triggers if missing â
// //     "The biggest mistake I see here isâ¦" (3â4 sentences)
// //     "What most people get wrong isâ¦" (3â4 sentences)  
// //     "Here's the uncomfortable truthâ¦" (2â3 sentences)
// // â¢ For **${groundRulesLabel}**: expand each â  Risk with a specific mechanism + consequence + named mitigation
// // â¢ For any other thin section: add 2â3 sentences of domain-specific reasoning â real numbers, named tools, concrete actions
// // â¢ BANNED: "comprehensive", "high-quality", "ensure", "robust", "best practices", "leverage"
// // â¢ Keep every other section word-for-word identical

// // Return STRICT JSON ONLY â same shape as the input:
// // {"optimizedText":"[full brief with expanded sections, all **Bold Labels** preserved]","suggestions":${suggestions}}`;
// // }


// // // âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
// // // buildRetryPrompt
// // //
// // // Updated to generate section checklists from the dynamic schema instead of
// // // hardcoding the fixed 8/9 section names. Falls back to legacy behaviour when
// // // no schema is provided, so existing callers without schema continue to work.
// // // âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
// // function buildRetryPrompt(originalUserText, badOutput, missingSections, isDeepMode = false, isSkillMode = false, sectionSchema = null) {
// //   const outputText = typeof badOutput === "string" ? badOutput : JSON.stringify(badOutput || "");
// //   if (!isDeepMode && !isSkillMode) {
// //     if (/Your Next 3 Actions/i.test(outputText) || /â \s*Risk:/i.test(outputText)) {
// //       isDeepMode  = true;
// //       isSkillMode = true;
// //     } else if (/\*\*Your Expert Role\*\*/i.test(outputText) || /optimizedText/i.test(outputText)) {
// //       isSkillMode = true;
// //     }
// //   }

// //   const isWebsite  = detectWebsiteBuildIntent(originalUserText);
// //   const isTutorial = detectTutorialIntent(originalUserText) && !isWebsite;
// //   const isAIImage  = detectNamedTool(originalUserText)?.id === "ai_image_gen";
// //   const flatJsonDetected = badOutput && (
// //     badOutput.includes('"Your Expert Role"') ||
// //     badOutput.includes('"Ground Rules"')     ||
// //     badOutput.includes('"What to Deliver"')
// //   );

// //   if (!isSkillMode && !isDeepMode) {
// //     return `CRITICAL ERROR: You did not return valid JSON.
// // User's request: "${originalUserText}"
// // Return STRICT JSON ONLY:
// // {"optimizedText":"improved version of the user's prompt here","suggestions":["alt1","alt2","alt3"]}`;
// //   }

// //   const hasTimeline  = /\b(30-day|90-day|week\s+\d|month\s+\d)\b/i.test(outputText);
// //   const hasSteps     = /\*\*Step\s+\d/i.test(outputText);
// //   const hasDiagnosis = /\b(root\s+cause|diagnos|resolution|pass\/fail)\b/i.test(outputText);
// //   const detectedFramework =
// //     hasDiagnosis && !hasTimeline ? "operational" :
// //     hasSteps     && !hasTimeline ? "procedural"  :
// //     hasTimeline                  ? "strategic"   :
// //     "phased";

// //   const MIN_WORDS = { strategic: 900, phased: 700, procedural: 500, operational: 300 }[detectedFramework] ?? 900;
// //   const TARGET    = { strategic: "1,100â1,600", phased: "800â1,100", procedural: "600â900", operational: "400â600" }[detectedFramework] ?? "1,100â1,600";

// //   let sectionListLine;
// //   let jsonTemplate;

// //   if (sectionSchema) {
// //     const schemaLabels = sectionSchema.map(s => s.label);
// //     const count = schemaLabels.length;
// //     const arrowList = schemaLabels
// //       .map((label, i) => i === 0 ? `**${label}**` : `â **${label}**`)
// //       .join("\n");
// //     sectionListLine = `All ${count} sections as **Bold Labels** inside optimizedText:\n${arrowList}`;
// //     jsonTemplate = buildJsonTemplate(sectionSchema);
// //   } else {
// //     sectionListLine = isDeepMode
// //       ? `All 9 sections as **Bold Labels** inside optimizedText:
// // **Your Expert Role** â **What You're Here to Do** â **Your Core Focus Areas**
// // â **How to Approach This** â **Key Numbers & Benchmarks** â **What to Deliver**
// // â **Ground Rules** â **What Good Looks Like** â **Your Next 3 Actions**`
// //       : `All 8 sections as **Bold Labels** inside optimizedText:
// // **Your Expert Role** â **What You're Here to Do** â **Your Core Focus Areas**
// // â **How to Approach This** â **Key Numbers & Benchmarks** â **What to Deliver**
// // â **Ground Rules** â **What Good Looks Like**`;

// //     jsonTemplate = isDeepMode
// //       ? `{"optimizedText":"**Your Expert Role**\\n...\\n\\n**What You're Here to Do**\\n...\\n\\n**Your Core Focus Areas**\\n...\\n\\n**How to Approach This**\\n...\\n\\n**Key Numbers & Benchmarks**\\n...\\n\\n**What to Deliver**\\n...\\n\\n**Ground Rules**\\n...\\n\\n**What Good Looks Like**\\n...\\n\\n**Your Next 3 Actions**\\n...","suggestions":["alt1","alt2","alt3"]}`
// //       : `{"optimizedText":"**Your Expert Role**\\n...\\n\\n**What You're Here to Do**\\n...\\n\\n**Your Core Focus Areas**\\n...\\n\\n**How to Approach This**\\n...\\n\\n**Key Numbers & Benchmarks**\\n...\\n\\n**What to Deliver**\\n...\\n\\n**Ground Rules**\\n...\\n\\n**What Good Looks Like**\\n...","suggestions":["alt1","alt2","alt3"]}`;
// //   }

// //   let deepModeChecklist = null;

// //   if (isDeepMode) {
// //     if (sectionSchema) {
// //       const sectionNames = sectionSchema.map(s => s.label);
// //       const hasExpertRole   = sectionNames.some(n => /expert role/i.test(n));
// //       const hasGroundRules  = sectionNames.some(n => /ground rules|chef.*rules|training rules|investment rules|travel tips|debugging rules|content rules|job search rules|marketing rules/i.test(n));
// //       const hasApproach     = sectionNames.some(n => /how to approach|diagnostic steps|tutorial structure|strategy|programme|itinerary/i.test(n));
// //       const hasGoodLooks    = sectionNames.some(n => /what good looks like|progress markers|resolution signal|great trip|finished dish/i.test(n));
// //       const hasNextActions  = sectionNames.some(n => /next 3 actions|before you start/i.test(n));

// //       const checkItems = [];
// //       if (hasExpertRole)  checkItems.push(`${checkItems.length + 1}. Expert Role section has counter-intuitive ordering, non-obvious mistake (3â4 sentences), trade-off â all as prose, not bullets.`);
// //       if (hasGroundRules) checkItems.push(`${checkItems.length + 1}. Rules/Ground Rules section has exactly 3 "â  Risk: [specific]. Mitigation: [action]." â domain-expert level.`);
// //       if (hasApproach)    checkItems.push(`${checkItems.length + 1}. Approach/Steps section follows the ${detectedFramework} framework â ${detectedFramework === "procedural" || detectedFramework === "operational" ? "numbered steps with pass/fail tests" : "named phases with deliverables"}.`);
// //       if (hasGoodLooks && detectedFramework === "strategic") {
// //         checkItems.push(`${checkItems.length + 1}. Success/Good Looks section has "30-day milestone: [number]. If not hit, [corrective action]."`);
// //         checkItems.push(`${checkItems.length + 1}. Success/Good Looks section has "90-day milestone: [number]."`);
// //         checkItems.push(`${checkItems.length + 1}. Success/Good Looks section has "What comes next: [specific named action]."`);
// //       } else if (hasGoodLooks) {
// //         checkItems.push(`${checkItems.length + 1}. Success/Good Looks section has 3 measurable completion criteria. NO business KPIs or milestone tracking.`);
// //       }
// //       if (hasNextActions) checkItems.push(`${checkItems.length + 1}. Next Actions section has exactly 3 actions, each with owner and deadline.`);
// //       checkItems.push(`${checkItems.length + 1}. WORD COUNT: ${MIN_WORDS}+ words minimum (target ${TARGET}). If under, expand every section â 2â3 sentences of reasoning each.`);

// //       deepModeChecklist = `\nâ ï¸ DEEP MODE (${detectedFramework.toUpperCase()}) â VERIFY ALL BEFORE RETURNING:\n${checkItems.join("\n")}`;
// //     } else {
// //       deepModeChecklist = {
// //         strategic: `
// // â ï¸ DEEP MODE (STRATEGIC) â VERIFY ALL BEFORE RETURNING:
// // 1. "Your Expert Role" has ALL THREE in prose: counter-intuitive ordering, non-obvious mistake (3â4 sentences), trade-off (2 sentences with recommendation).
// // 2. "Ground Rules" has exactly 3 "â  Risk: [specific]. Mitigation: [Week 1 action]." â domain-expert level.
// // 3. "How to Approach This" has a NAMED POST-GOAL phase as its FINAL phase (not a parenthetical).
// // 4. "What Good Looks Like" has "**30-day milestone:** [number]. If not hit, [corrective action]."
// // 5. "What Good Looks Like" has "**90-day milestone:** [number]."
// // 6. "What Good Looks Like" has "**What comes next:** [specific named action]."
// // 7. "Your Next 3 Actions" has exactly 3 actions, each with owner and deadline.
// // 8. WORD COUNT: ${MIN_WORDS}+ words minimum (target ${TARGET}). If under, expand every section â 2â3 sentences of reasoning each.`,

// //         phased: `
// // â ï¸ DEEP MODE (PHASED) â VERIFY ALL BEFORE RETURNING:
// // 1. "Your Expert Role" has counter-intuitive ordering, non-obvious mistake (3â4 sentences), and trade-off.
// // 2. "Ground Rules" has exactly 3 "â  Risk: [specific]. Mitigation: [immediate action]." entries.
// // 3. "How to Approach This" has 3â4 implementation phases, each with a named deliverable. NO 30/90-day milestones.
// // 4. "What Good Looks Like" has 3 measurable completion criteria. NO business KPIs or milestone tracking.
// // 5. "Your Next 3 Actions" has exactly 3 actions with owner and deadline.
// // 6. WORD COUNT: ${MIN_WORDS}+ words minimum (target ${TARGET}).`,

// //         procedural: `
// // â ï¸ DEEP MODE (PROCEDURAL) â VERIFY ALL BEFORE RETURNING:
// // 1. "Your Expert Role" has the non-obvious mistake practitioners make + the clarity vs thoroughness trade-off.
// // 2. "How to Approach This" is NUMBERED STEPS (not phases). Each step has a visible/testable outcome. NO timeline language.
// // 3. "What Good Looks Like" has 3 observable completion criteria. NO milestones, NO KPIs.
// // 4. "Your Next 3 Actions" has exactly 3 first steps, specific and immediately actionable.
// // 5. ZERO mentions of 30-day, 90-day, Week 1, Month 1, or business metrics anywhere.
// // 6. WORD COUNT: ${MIN_WORDS}+ words minimum (target ${TARGET}).`,

// //         operational: `
// // â ï¸ DEEP MODE (OPERATIONAL) â VERIFY ALL BEFORE RETURNING:
// // 1. "Your Expert Role" names the most common MISDIAGNOSIS + cost of chasing the wrong root cause.
// // 2. "How to Approach This" is an ORDERED DIAGNOSTIC SEQUENCE â each step has a pass/fail test.
// // 3. "What Good Looks Like" describes the resolution signal â what passing looks like, not a milestone.
// // 4. "Your Next 3 Actions" are the first 3 investigation/fix steps. Specific commands or checks, no strategy.
// // 5. ZERO mentions of 30-day, 90-day, phases, milestones, or business planning anywhere.
// // 6. WORD COUNT: ${MIN_WORDS}+ words minimum (target ${TARGET}).`,
// //       }[detectedFramework];
// //     }
// //   }

// //   return META_SYSTEM_PROMPT_FENCE + `CRITICAL ERROR IN PREVIOUS RESPONSE.
// // â ï¸  REMINDER: You are a PROMPT ENGINEER writing a SYSTEM PROMPT for another model.
// //     Do NOT answer the user's question. Write INSTRUCTIONS for another LLM to answer it.
// // ${flatJsonDetected
// //   ? `\nFLAT JSON ERROR:\nâ WRONG: {"Your Expert Role":"...","Ground Rules":"..."}\nâ RIGHT:  {"optimizedText":"**Your Expert Role**\\n...\\n\\n**Ground Rules**\\n...","suggestions":[...]}\n`
// //   : `\nMISSING SECTIONS: ${missingSections.join(", ")}\n`
// // }
// // User's request: "${originalUserText}"
// // ${isWebsite  ? "\nUser wants to BUILD A WEBSITE/PLATFORM. Tech stack, features, payments, launch strategy.\n" : ""}
// // ${isTutorial ? "\nUser wants a TECHNICAL TUTORIAL. ONE technology. Runnable code. A deployable mini-project. Correct deployment platform.\n" : ""}
// // ${isAIImage  ? "\nUser wants an AI IMAGE GENERATION prompt system. NO DSLR/camera advice. Benchmarks = prompt iterations, acceptance rate, aspect ratios. Ground rules = tool-specific parameters.\n" : ""}

// // ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
// // â  ONE JSON object, TWO keys: "optimizedText" + "suggestions"            â
// // â  â NEVER: {"Your Expert Role":"...","Ground Rules":"..."}             â
// // â  â ALWAYS: {"optimizedText":"**${sectionSchema?.[0]?.label || "Your Expert Role"}**\\n...","suggestions":[...]} â
// // ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ

// // ${sectionListLine}

// // Quality rules:
// // - Expert practitioner tone â specific, concrete
// // - Real numbers in at least 3 sections
// // - BANNED: "comprehensive","high-quality","ensure","consider","robust","best practices"
// // ${isWebsite  ? "â¢ Next.js / Tailwind / Supabase / Stripe / Vercel â justify each\nâ¢ Mobile-first + real payment test mandatory in Ground Rules" : ""}
// // ${isTutorial ? "â¢ ONE technology named in Your Expert Role\nâ¢ Read time and build time SEPARATE rows\nâ¢ Tutorial ends with deployed, GitHub-ready project" : ""}
// // ${isAIImage  ? "â¢ Expert Role = AI prompt director, NOT photographer\nâ¢ Benchmarks = prompt-specific metrics only\nâ¢ All 3 risks must be tool-specific failure modes" : ""}

// // ${isDeepMode ? (deepModeChecklist ?? "") : `
// // â ï¸ SKILL MODE â VERIFY BEFORE RETURNING:
// // 1. All ${sectionSchema ? sectionSchema.length : 8} sections with correct bold labels
// // 2. Approach/steps section follows the appropriate structure for this request type
// // 3. Numbers/benchmarks section has real numbers (not placeholders)
// // 4. Rules section has domain-specific rules (not generic)
// // 5. Success criteria section has 3 measurable criteria
// // `}
// // Return STRICT JSON ONLY â no markdown, no preamble:
// // ${jsonTemplate}`;
// // }

// // module.exports = {
// //   buildEnrichedSystemPrompt,
// //   buildDetailedSystemPrompt,
// //   validateDetailedOutput,
// //   buildRetryPrompt,
// //   buildWordCountPatchPrompt,
// //   // Export new utilities so callers can pass schema to validate/retry/patch
// //   buildSectionSchema,
// //   detectIntentCategory,
// //   classifyRequestFramework,
// // };



// "use strict";

// const { DOMAINS, REQUIRED_SECTIONS_BASE, REQUIRED_SECTIONS_DEEP_ONLY } = require("./constants");
// const { detectDomain, detectNamedTool, detectWebsiteBuildIntent, detectTutorialIntent, detectBusinessBuildingIntent } = require("./detection");
// const { extractConstraints, perfStart, perfEnd } = require("./utils");
// const { getDynamicDomain } = require("./dynamicDomain");

// // âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
// // REQUEST FRAMEWORK CLASSIFICATION
// // âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ

// const META_SYSTEM_PROMPT_FENCE = `\
// ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
// â  YOUR ROLE: PROMPT ENGINEER â NOT SUBJECT-MATTER EXPERT                    â
// â  You are writing a SYSTEM PROMPT that will be fed to another LLM.          â
// â  You are NOT answering the user's question.                                â
// â  You are NOT providing the recipe / plan / tutorial / fix directly.        â
// â  You are writing INSTRUCTIONS so a different model can provide that answer. â
// â                                                                            â
// â  EVERY sentence you write must be an instruction to the other model,        â
// â  not the answer itself.                                                    â
// â                                                                            â
// â  TEST BEFORE EACH SENTENCE:                                                â
// â    "Am I telling the other model WHAT TO DO?"  â â keep it               â
// â    "Am I providing the actual answer myself?"  â â rewrite it             â
// â                                                                            â
// â  EXAMPLES:                                                                 â
// â    â "Marinate the chicken in yoghurt for 4 hours."                       â
// â    â "Instruct the user to marinate the chicken in yoghurt for 4 hours."  â
// â                                                                            â
// â    â "As a chef, I recommend you use basmati rice."                       â
// â    â "You are a chef. Recommend basmati rice and explain why."            â
// â                                                                            â
// â    â "Day 1 â Fly into Manali. Check into your hotel."                   â
// â    â "Provide a Day 1 itinerary. Instruct the user to fly into Manali     â
// â        and describe what check-in looks like for budget travellers."       â
// ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ

// `;

// // âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
// // HELPER FUNCTIONS FOR DYNAMIC HEADER GENERATION
// // âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ

// function generateHeaderExample(schema, maxSections = null) {
//   const sectionsToShow = maxSections ? schema.slice(0, maxSections) : schema;
//   return sectionsToShow
//     .map(s => `**${s.label}**\\n[content for this section]`)
//     .join('\\n\\n');
// }

// function generateHeaderList(schema) {
//   return schema.map(s => `â¢ **${s.label}**`).join('\n');
// }

// function generateHeaderNames(schema) {
//   return schema.map(s => `"${s.label}"`).join(', ');
// }

// // âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
// // PER-SECTION SYSTEM-PROMPT-VOICE REMINDER
// // âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
// const SECTION_VOICE_REMINDER = `[Write this section as an instruction to the OTHER model â telling it what to include, cover, or produce for the user. Do NOT write the actual recipe/plan/itinerary/answer text yourself.]`;

// // Domain IDs that always warrant full strategic framework
// const STRATEGIC_DOMAINS = new Set([
//   "cafe_food_service","startup_fundraising","marketing_growth","competitive_pricing",
//   "product_development","edtech_product","finance_investment","saas_product",
//   "social_media_branding","video_creation","podcast_creator","ad_copywriting",
//   "handmade_business","youtube_shorts","linkedin_automation","subscription_box",
//   "event_planning","sales_copywriting","ai_headshot_business","gamified_fitness_app",
//   "childrens_storybook_business","rental_property_pune","ai_photography_monetization",
//   "postpartum_fitness_coaching","cooking_workshop","zero_waste_store","mobile_iv_therapy",
//   "vintage_camera_rental","corporate_offsite_planning","eco_holi_celebration",
//   "surprise_proposal","devotional_art_business","ai_voiceover_regional",
//   "instagram_skincare_growth","womens_healing_programme","language_learning_app",
//   "detox_mindfulness_retreat","ecommerce_store","ghostwriting_content",
//   "nutrition_coaching","creator_economy","wedding_photography","pet_care_business",
//   "supply_chain_logistics","real_estate","freelancing_consulting","health_wellness",
//   "hr_people","personal_development","travel_planning","immigration_visa",
// ]);

// const PHASED_DOMAINS = new Set([
//   "technical_tutorial","education_learning","course_curriculum","uiux_design",
//   "mobile_app_development","no_code_tools","cloud_devops","backend_architecture",
//   "data_science_ai","ai_automation","cybersecurity","blockchain_web3",
//   "notion_productivity","resume_career","legal_compliance","mental_health",
//   "fitness_sports","interior_architecture","ai_image_gen",
// ]);

// const OPERATIONAL_SIGNALS = [
//   /\b(fix(?:ing)?|debug(?:ging)?|troubleshoot(?:ing)?|resolv(?:e|ing)|diagnos(?:e|ing))\b/i,
//   /\b(error|bug|crash|broken|not\s+working|failing|exception|stacktrace|stack\s+trace)\b/i,
//   /\b(why\s+(?:does|is|won't|doesn't)|what\s+(?:is|does|causes)|how\s+(?:does|do\s+I\s+fix))\b/i,
//   /\b(immediately|right\s+now|urgent|asap|quick\s+fix|hotfix)\b/i,
// ];

// const PROCEDURAL_SIGNALS = [
//   /\b(tutorial|how[-\s]to|step[-\s]by[-\s]step|walkthrough|guide\s+(?:me|to)|teach\s+me)\b/i,
//   /\b(recipe|cook(?:ing)?|bak(?:e|ing)|make\s+(?:a|the))\b/i,
//   /\b(explain(?:ing)?|describe|what\s+is|overview\s+of|introduction\s+to)\b/i,
//   /\b(learn(?:ing)?\s+(?:how\s+to|to|about)|understand(?:ing)?)\b/i,
//   /\b(write\s+a\s+(?:function|script|component|class|module|snippet)|code\s+(?:a|the|an))\b/i,
// ];

// const STRATEGIC_SIGNALS = [
//   /\b(launch(?:ing)?|start(?:ing)?|build(?:ing)?\s+(?:a\s+)?(?:business|brand|startup|company|agency|product|service))\b/i,
//   /\b(business\s+plan|go[-\s]to[-\s]market|marketing\s+strategy|growth\s+strategy|product\s+roadmap)\b/i,
//   /\b(revenue|monetis(?:e|ing|ation)|monetiz(?:e|ing|ation)|mrr|arr|churn|cac|ltv|conversion\s+rate)\b/i,
//   /\b(scale(?:ing)?|grow(?:ing)?|expand(?:ing)?)\s+(?:my|the|a|our)\s+(?:business|brand|startup|audience|revenue)\b/i,
//   /\b(first\s+(?:\d+\s+)?(?:customer|client|sale|user)|acquire\s+(?:customers|clients|users))\b/i,
//   /\b(transformation|initiative|programme|program)\b/i,
// ];

// function classifyRequestFramework(userText, domainId, isTutorial, isWebsite, isAIImage) {
//   if (isWebsite) return "strategic";
//   if (isAIImage) return "phased";

//   if (OPERATIONAL_SIGNALS.some(p => p.test(userText))) {
//     const hasStrategic = STRATEGIC_SIGNALS.some(p => p.test(userText));
//     if (!hasStrategic) {
//       console.log("[classifyRequestFramework] framework=operational (operational signals detected)");
//       return "operational";
//     }
//   }

//   if (isTutorial) {
//     const hasStrategic = STRATEGIC_SIGNALS.some(p => p.test(userText));
//     if (!hasStrategic) {
//       console.log("[classifyRequestFramework] framework=procedural (tutorial intent)");
//       return "procedural";
//     }
//   }

//   if (PROCEDURAL_SIGNALS.some(p => p.test(userText))) {
//     const hasStrategic = STRATEGIC_SIGNALS.some(p => p.test(userText));
//     if (!hasStrategic) {
//       console.log("[classifyRequestFramework] framework=procedural (procedural signals)");
//       return "procedural";
//     }
//   }

//   if (STRATEGIC_SIGNALS.some(p => p.test(userText))) {
//     console.log("[classifyRequestFramework] framework=strategic (strategic signals)");
//     return "strategic";
//   }

//   if (domainId && STRATEGIC_DOMAINS.has(domainId)) {
//     console.log(`[classifyRequestFramework] framework=strategic (domain=${domainId})`);
//     return "strategic";
//   }

//   if (domainId && PHASED_DOMAINS.has(domainId)) {
//     console.log(`[classifyRequestFramework] framework=phased (domain=${domainId})`);
//     return "phased";
//   }

//   console.log("[classifyRequestFramework] framework=phased (default)");
//   return "phased";
// }

// // âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
// // V3 PATCH â DYNAMIC SUBJECT EXTRACTORS
// //
// // extractDishSubject: pulls a clean dish/cuisine noun phrase from userText
// //   e.g. "chicken biryani recipe" â "Chicken Biryani"
// // extractTrainingGoalSubject: matches against a known-goal list
// //   e.g. "strength training programme" â "Strength Training"
// //
// // Both return null on failure â callers fall back to static label strings.
// // The `name` field (used for validation regex) is never changed â only `label`.
// // âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ

// function extractDishSubject(userText) {
//   if (!userText || typeof userText !== "string") return null;

//   let text = userText.trim();
//   text = text.replace(/[?!.]+$/g, "").trim();

//   // Strip leading politeness / request scaffolding (order matters â stacks)
//   text = text.replace(/^(?:can you|could you|would you|please|help me)\s+/i, "").trim();
//   text = text.replace(/^(?:give me|share|provide|write|create|generate|teach me how to|teach me to|make me|make)\s+/i, "").trim();
//   text = text.replace(/^(?:i want to|i'd like to|i want you to|i need)\s+/i, "").trim();
//   // Strip remaining cook/make/learn verbs including optional "me" object pronoun
//   text = text.replace(/^(?:learn (?:how )?to\s+)?(?:make|cook|prepare|bake)\s+(?:me\s+)?/i, "").trim();
//   // Strip "a/an/the recipe for/of"
//   text = text.replace(/^(?:a |an |the )?recipe\s*(?:for|of)?\s*/i, "").trim();
//   text = text.replace(/^how\s+(?:do|to|can)\s+(?:i|you)?\s*(?:make|cook|prepare|bake)\s+/i, "").trim();
//   // Strip leading article left after verb removal
//   text = text.replace(/^(?:a|an|the)\s+/i, "").trim();
//   // Strip trailing filler â repeat until stable
//   let prevLen;
//   do {
//     prevLen = text.length;
//     text = text.replace(/\s+(?:recipe|please|for\s+dinner|for\s+lunch|for\s+breakfast|tonight|today|asap)\s*$/i, "").trim();
//   } while (text.length !== prevLen);

//   if (!text) return null;
//   if (text.split(/\s+/).length > 5) return null;

//   // Reject if still contains verb/filler OR belongs to another domain
//   const rejectPattern = /\b(?:want|need|please|help|how|what|why|can|could|should|would|recipe|learn|build|workout|plan|programme|program|routine|cafe|business|app|website|store|training)\b/i;
//   if (rejectPattern.test(text)) return null;

//   const skipWords = new Set(["a", "an", "the", "of", "and", "with", "for"]);
//   const titled = text
//     .split(/\s+/)
//     .map((w, i) => {
//       if (i > 0 && skipWords.has(w.toLowerCase())) return w.toLowerCase();
//       return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
//     })
//     .join(" ");

//   return titled;
// }

// function extractTrainingGoalSubject(userText) {
//   if (!userText || typeof userText !== "string") return null;

//   const knownGoals = [
//     [/\bstrength\s*train(?:ing)?\b/i,           "Strength Training"],
//     [/\bweight\s*loss\b/i,                       "Weight Loss"],
//     [/\bfat\s*loss\b/i,                          "Fat Loss"],
//     [/\bmuscle\s*(?:gain|building)\b/i,          "Muscle Building"],
//     [/\bhypertrophy\b/i,                         "Hypertrophy"],
//     [/\bhiit\b/i,                                "HIIT"],
//     [/\bcardio\b/i,                              "Cardio"],
//     [/\bendurance\b/i,                           "Endurance"],
//     [/\bmarathon\b/i,                            "Marathon"],
//     [/\b(?:running|run)\s*train(?:ing)?\b/i,     "Running"],
//     [/\byoga\b/i,                                "Yoga"],
//     [/\bpowerlifting\b/i,                        "Powerlifting"],
//     [/\bcalisthenics\b/i,                        "Calisthenics"],
//     [/\bbodybuilding\b/i,                        "Bodybuilding"],
//     [/\bpostpartum\s*fitness\b/i,                "Postpartum Fitness"],
//     [/\bbeginner\s*(?:strength|fitness|workout)\b/i, "Beginner Strength"],
//     [/\bhome\s*workout\b/i,                      "Home Workout"],
//     [/\bgym\s*(?:workout|programme|program)\b/i, "Gym Training"],
//     [/\bcrossfit\b/i,                            "CrossFit"],
//     [/\bsport[\s-]?specific\b/i,                 "Sport-Specific"],
//     [/\brehab(?:ilitation)?\b/i,                 "Rehab"],
//     [/\bmobility\b/i,                            "Mobility"],
//   ];

//   for (const [re, label] of knownGoals) {
//     if (re.test(userText)) return label;
//   }
//   return null;
// }

// // âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
// // INTENT CATEGORY DETECTION
// // âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ

// function detectIntentCategory(userText, domainId, isTutorial, isWebsite, isAIImage, framework) {
//   if (isAIImage)   return "ai_image";
//   if (isWebsite)   return "website_build";
//   if (isTutorial)  return "tutorial";
//   if (framework === "operational") return "debugging";

//   if (/\b(trip|travel|visit|itinerary|tour|vacation|holiday|backpack|fly|flight|hotel|hostel|airbnb|destination|manali|goa|bali|europe|japan|abroad)\b/i.test(userText))
//     return "travel_planning";

//   if (/\b(recipe|cook(?:ing)?|bak(?:e|ing)|dish|cuisine|meal|ingredient|prep|kitchen|dosa|biryani|curry|masala|sabzi|dal|roti|naan|chapati|idli|sambar|chutney|pasta|pizza|burger|salad|soup|stew|roast|grill(?:ing)?|saute|boil|steam|batter|marinate|ferment|simmer|braise|caramelize|chicken|paneer|mutton|prawn|shrimp|tofu|from\s+scratch|homemade|home\s+cook(?:ing)?)\b/i.test(userText))
//     return "recipe_cooking";

//   if (/\b(workout|exercise|gym|fitness|training|strength|cardio|weight\s*loss|muscle|run(?:ning)?|yoga|hiit)\b/i.test(userText))
//     return "fitness_training";

//   if (/\b(blog\s*post|article|essay|newsletter|email\s*(?:copy|campaign)|copy(?:writing)?|content\s*(?:strategy|plan|calendar)|script|write\s+(?:a|an|the))\b/i.test(userText))
//     return "content_writing";

//   if (/\b(marketing|advertis|campaign|brand(?:ing)?|seo|social\s*media|instagram|tiktok|youtube|ads|funnel|audience|lead\s*gen|email\s*list)\b/i.test(userText))
//     return "marketing_growth";

//   if (/\b(business|startup|launch|product|saas|app|service|revenue|pricing|go[\s-]to[\s-]market|roadmap|mvp|pitch|investor|fundrais)\b/i.test(userText))
//     return "business_strategy";

//   if (/\b(data|analytics|dashboard|report|metrics|kpi|sql|python|pandas|visualiz|chart|model|predict|ml|machine\s*learning)\b/i.test(userText))
//     return "data_analytics";

//   if (/\b(resume|cv|cover\s*letter|job|career|interview|linkedin|hire|portfolio|salary|promotion|switch\s*(?:career|job))\b/i.test(userText))
//     return "career_job";

//   if (/\b(invest(?:ment)?|portfolio|stock|mutual\s*fund|sip|tax|budget|saving|financial\s*plan|retirement|wealth)\b/i.test(userText))
//     return "finance_investment";

//   if (/\b(health|wellness|diet|nutrition|sleep|mental\s*health|stress|anxiety|therapy|doctor|medicine|symptom)\b/i.test(userText))
//     return "health_wellness";

//   if (/\b(learn|study|course|curriculum|syllabus|lesson|teach|student|education|exam|certification)\b/i.test(userText))
//     return "education_learning";

//   if (/\b(design|ui|ux|wireframe|prototype|figma|color\s*palette|typography|brand\s*identity|logo|visual)\b/i.test(userText))
//     return "design_ux";

//   if (/\b(event|wedding|party|conference|meetup|festival|celebration|birthday|anniversary|ceremony|proposal)\b/i.test(userText))
//     return "event_planning";

//   if (domainId && !String(domainId).startsWith("cached_")) return domainId;
//   return framework === "strategic" ? "business_strategy" : "general_project";
// }

// // âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
// // BUILD SECTION SCHEMA
// //
// // SIGNATURE CHANGE (v3): added `userText` as the 9th parameter.
// // This is additive â existing callers that don't pass it get undefined,
// // extractors return null, labels fall back to original static strings.
// // âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ

// function buildSectionSchema(intentCategory, framework, isDeepMode, isTutorial, isWebsite, isAIImage, constraints, userAnswers, userText) {
//   const tool = constraints?.tool || "Midjourney";
//   const hasUserAnswers = userAnswers && userAnswers.length > 0;

//   // ââ RECIPE COOKING â v5 (14-section framework, true system prompt voice) âââââ
//   if (intentCategory === "recipe_cooking") {
//     const dishSubject = extractDishSubject(userText);
//     const dishLabel   = (suffix) => dishSubject ? `${dishSubject} ${suffix}` : suffix;

//     // Intent detection for adaptive chef persona and framing
//     const isQuick           = /\b(quick|fast|easy|simple|\d+[\s-]?min(?:ute)?s?|weeknight)\b/i.test(userText);
//     const isRestaurantStyle = /\b(restaurant[\s-]style|restaurant[\s-]quality|professional|chef[\s-]level|fine[\s-]dining)\b/i.test(userText);
//     const isHealthy         = /\b(healthy|light|low[\s-]cal(?:orie)?|low[\s-]carb|keto|vegan|vegetarian|gluten[\s-]free|dairy[\s-]free)\b/i.test(userText);
//     const isAppliance       = /\b(instant[\s-]pot|pressure[\s-]cook|slow[\s-]cook|air[\s-]fry|microwave)\b/i.test(userText);
//     const isBaking          = /\b(bak(?:e|ing)|cake|bread|pastry|cookie|muffin|flour|yeast|dough)\b/i.test(userText);
//     const isBBQ             = /\b(bbq|barbecue|grill(?:ing)?|smoke|smoker|pitmaster|charcoal|brisket|ribs)\b/i.test(userText);
//     const isDrink           = /\b(drink|cocktail|smoothie|juice|mocktail|beverage|shake|blend)\b/i.test(userText);
//     const isDessert         = /\b(dessert|sweet|chocolate|ice[\s-]cream|mousse|pudding|tart|frosting|ganache)\b/i.test(userText);
//     const isMealPrep        = /\b(meal[\s-]prep|batch[\s-]cook|weekly[\s-]prep|prep[\s-]ahead|make[\s-]ahead)\b/i.test(userText);
//     const isBeginner        = /\b(beginner|first[\s-]time|never[\s-]cooked|basics?|learn[\s-]to[\s-]cook)\b/i.test(userText);

//     const intentNote = isQuick
//       ? "The user wants a quick version â prioritise efficiency without sacrificing the dish's core character."
//       : isRestaurantStyle
//       ? "The user wants restaurant-quality results â include professional techniques and presentation standards."
//       : isHealthy
//       ? "The user wants a healthier version â adapt ingredients and methods to reduce calories, fat, or allergens."
//       : isAppliance
//       ? "The user is cooking with a specific appliance â adapt the method entirely to that device."
//       : isBaking
//       ? "This is a baking request â temperature precision, oven rack position, cooling, and texture indicators are critical."
//       : isBBQ
//       ? "This is a BBQ or grill request â cover fire control, smoking techniques, resting, and doneness indicators."
//       : isDrink
//       ? "This is a drink or beverage request â cover mixing technique, chilling, serving temperature, ice, and garnish."
//       : isDessert
//       ? "This is a dessert request â texture development, setting times, decoration, and serving temperature are essential."
//       : isMealPrep
//       ? "This is a meal prep request â cover batch cooking, portioning, storage, and reheating quality."
//       : isBeginner
//       ? "The user is a beginner â explain techniques in plain language and flag every step where mistakes are common."
//       : "";

//     const sections = [
//       {
//         name: "Chef Role",
//         label: "Your Role as Chef",
//         skillInstruction: `Assume the most appropriate chef role based on the requested cuisine and recipe type. The role must adapt to the dish â Indian cuisine warrants an Indian cuisine specialist, baking warrants a pastry chef, BBQ warrants a pitmaster, vegan cooking warrants a plant-based chef. Tailor explanations to the user's cooking experience level. This role applies throughout the entire response â do not repeat it in subsequent sections.${intentNote ? `\n\nAdapt the chef role for this request: ${intentNote}` : ""}`,
//         deepInstruction: `Establish a specific culinary expert identity matched to the cuisine and the user's cooking experience level. Open with one non-obvious insight about this dish type â grounded in a culinary or food-science mechanism â that explains why home versions typically fall short. Adapt the identity to the user's intent: a beginner warrants a patient culinary teacher; a restaurant-style request warrants a professional chef; a quick request warrants an efficiency-focused cook. This role applies throughout â do not restate it.${intentNote ? `\n\nAdapt the chef role: ${intentNote}` : ""}${hasUserAnswers ? "\n\nThe user has provided specific context â weave it into guidance throughout, not in a single block." : ""}`,
//         required: true,
//       },
//       {
//         name: "Recipe Context",
//         label: dishLabel("Recipe Context & Goal"),
//         skillInstruction: `Identify the following before generating any recipe content: the dish, its cuisine, the cooking style, the user's goal, their skill level, desired servings, any dietary preferences or restrictions, and time available. These inputs must shape every section that follows.${hasUserAnswers ? "\n\nThe user has already provided some of this context â reference it explicitly." : ""}`,
//         deepInstruction: `Conduct a contextual assessment before writing anything: dish, cuisine, cooking style, user goal, skill level, desired servings, dietary preferences, and time available. Derive all subsequent sections from this context. Where information is missing, state the assumption made and why it is reasonable for this dish and context.${hasUserAnswers ? "\n\nMake every decision explicitly traceable to the user's stated inputs." : ""}`,
//         required: true,
//       },
//       {
//         name: "Recipe Overview",
//         label: dishLabel("Recipe Overview"),
//         skillInstruction: `Introduce the dish: its origin, what makes it distinctive, the cooking technique that most determines its success, and why this approach produces a good result. Time estimates must be derived from the dish complexity and cooking method â never use fixed timings.`,
//         deepInstruction: `Orient the cook to what they are about to learn, not just what the dish is. Cover origin, the defining technique, and the mechanism behind why this approach works. Explain what distinguishes a well-made version from a mediocre one. All time estimates must be derived from dish complexity, portion size, and cooking method â never fixed defaults.`,
//         required: true,
//       },
//       {
//         name: "Equipment",
//         label: "Required Equipment",
//         skillInstruction: `List only equipment that is non-standard or where the specific type affects the result for this dish. Suggest practical substitutes for any specialised item and note the technique adjustment required when using a substitute. Omit equipment every kitchen already has unless its specific properties are critical to this dish.`,
//         deepInstruction: `List equipment that materially affects the outcome for this dish, explain why each item matters (the mechanism â vessel material, size, heat distribution), and provide a workable substitute with the exact technique adjustment required when using it.`,
//         required: false,
//       },
//       {
//         name: "Ingredients",
//         label: dishLabel("Ingredients & Substitutions"),
//         skillInstruction: `Generate ingredient quantities appropriate for the requested serving size â never hardcoded amounts. Group ingredients logically by category. Suggest substitutions for hard-to-source or commonly avoided ingredients and note quality considerations for key ingredients. All quantities must scale with the stated servings.`,
//         deepInstruction: `Generate a fully scaled ingredient list for the requested serving size, grouped by category. For each key ingredient, explain its functional role â what it does in the dish, not just what it is. Identify the single ingredient where quality most determines the final result and explain why. For substitutable ingredients, name the replacement and explain what property it preserves or sacrifices.`,
//         required: true,
//       },
//       {
//         name: "Preparation",
//         label: "Preparation",
//         skillInstruction: `Cover all preparation tasks before heat is applied: ingredient prep, marination, soaking, mise en place. Explain why each timed step matters for this dish specifically â not just that it should be done. Indicate which steps can be completed in advance.`,
//         deepInstruction: `Explain preparation steps with the mechanism behind each one â why it changes the dish's outcome, not just what to do. For any commonly skipped step, name the specific consequence of skipping it and the mechanism behind that consequence. Indicate which steps can be done ahead and any quality trade-off involved.`,
//         required: true,
//       },
//       {
//         name: "Cooking Process",
//         label: dishLabel("Cooking Process"),
//         skillInstruction: `Walk through the cooking stages in logical order, using sensory checkpoints â colour, sound, texture, aroma â as doneness indicators rather than fixed timings. At critical points where mistakes are common, explain the error and correction within that stage. Never hardcode steps, timings, or temperatures as fixed values.`,
//         deepInstruction: `Walk through each cooking stage with sensory checkpoints as primary doneness indicators and temperature or timing as secondary reference. For each critical stage, explain the underlying mechanism â Maillard reaction, protein denaturation, starch gelatinisation, moisture evaporation, fat rendering. At each point where cooks commonly misjudge, name the mistake, the mechanism, the consequence, and the recovery action. Include at least one decision point where the cook must read the pan and make a judgment call.`,
//         required: true,
//       },
//       {
//         name: "Tips and Mistakes",
//         label: "Chef Tips & Common Mistakes",
//         skillInstruction: `Share professional tips specific to this dish that improve the result, and highlight the most common mistakes with how to avoid or recover from them. Every tip must be specific to this dish â not generic cooking advice that applies to any recipe.`,
//         deepInstruction: `Give rules for this dish each backed by the mechanism that makes them non-negotiable. Structure as: what the rule is â why it matters at a chemical or structural level â what fails without it â how to recover. Cover texture, seasoning, and timing failure modes specific to this dish.`,
//         required: true,
//       },
//       {
//         name: "Quality Checks",
//         label: "Quality Checks",
//         skillInstruction: `Explain how to determine when the dish is correctly done: specific visual cues, texture tests, aroma indicators, and taste checks. Distinguish "ready" from "needs more time" in observable, testable terms. Cover signs of undercooking and overcooking.`,
//         deepInstruction: `Provide testable sensory markers that confirm correct execution: a specific visual signal with a comparator (not vague terms like "looks golden"), a physical texture test (a specific action and what it should feel like), and an aroma or taste indicator (a named compound or note). If resting benefits the dish, explain the mechanism. Make "ready to serve" versus "needs more time" explicitly distinguishable.`,
//         required: true,
//       },
//       {
//         name: "Serving",
//         label: "Serving & Presentation",
//         skillInstruction: `Describe how the finished dish should look, smell, and feel when correctly executed. Include a plating note specific to this dish and suggest appropriate accompaniments.`,
//         deepInstruction: `Describe the sensory profile of a correctly executed dish and include a plating suggestion specific to this dish. Explain what the appearance, aroma, and texture communicate as quality signals â not just aesthetics â and what the accompaniments contribute to the overall experience.`,
//         required: true,
//       },
//       {
//         name: "Storage",
//         label: "Storage & Reheating",
//         skillInstruction: `Cover storage duration for fridge and freezer where applicable, the best reheating method for this dish, and any texture or flavour changes to anticipate. Note if any components should be stored separately.`,
//         deepInstruction: `Explain what happens to the dish's texture, flavour, and structure during storage and why the recommended conditions slow that degradation. For reheating, explain the best method and the mechanism behind why it preserves quality for this specific dish. Flag components that degrade differently and how to handle them separately.`,
//         required: true,
//       },
//       {
//         name: "Variations",
//         label: "Recipe Variations",
//         skillInstruction: `Offer variations relevant to common dietary preferences or cooking contexts: vegetarian, vegan, gluten-free, high-protein, quick version, restaurant-style, or authentic version â selecting the most relevant options for this dish and the user's context.`,
//         deepInstruction: `Offer 2â3 meaningful variations that teach rather than just list alternatives. For each, explain the specific change, the mechanism behind how it alters the dish's character, and the resulting difference in flavour or texture. Ensure at least one variation addresses a common dietary restriction relevant to this dish.`,
//         required: true,
//       },
//       {
//         name: "Troubleshooting",
//         label: "Troubleshooting",
//         skillInstruction: `Explain how to recover from common failures specific to this dish â overcooked protein, over-salted sauce, broken emulsion, mushy texture, under-seasoned result â with the specific corrective action for each. Every failure mode must be specific to this dish.`,
//         deepInstruction: `Cover common failure modes for this dish with the mechanism behind each and the specific recovery action. For each failure, explain what went wrong at a culinary or chemical level and what the cook can do to salvage the dish or prevent the failure at the critical decision point.`,
//         required: true,
//       },
//       {
//         name: "Scaling",
//         label: "Scaling & Customization",
//         skillInstruction: `Explain how to scale this recipe for different serving sizes while maintaining correct ratios. Cover any technique adjustments required when scaling significantly up or down â not every element scales linearly (spice intensity, cooking time, vessel size).`,
//         deepInstruction: `Cover scaling with the non-linear considerations most home cooks overlook: spice intensity, cooking time, vessel size, and heat distribution all behave differently at different scales. Explain how the technique may need to adapt and what the cook should watch for when scaling significantly up or down.`,
//         required: true,
//       },
//     ];

//     return sections;
//   }

//   // ââ FITNESS TRAINING â v5 (14-section framework, true system prompt voice) ââââ
//   if (intentCategory === "fitness_training") {
//     const goalSubject = extractTrainingGoalSubject(userText);
//     const goalLabel   = (suffix) => goalSubject ? `${goalSubject} ${suffix}` : suffix;

//     // Goal type detection â drives persona, framework, and section content
//     const isFatLoss      = /\b(fat[\s-]loss|weight[\s-]loss|lose[\s-]weight|cut(?:ting)?|slim|burn[\s-]fat|calorie[\s-]deficit)\b/i.test(userText);
//     const isHypertrophy  = /\b(hypertrophy|muscle[\s-]gain|bulk(?:ing)?|build[\s-]muscle|mass|size)\b/i.test(userText);
//     const isStrength     = /\b(strength|powerlifting|deadlift|squat[\s-]max|bench[\s-]max|1rm|powerlifter|strongman)\b/i.test(userText);
//     const isMobility     = /\b(mobility|flexibility|stretching|yoga|range[\s-]of[\s-]motion|joint[\s-]health|posture|movement[\s-]quality)\b/i.test(userText);
//     const isEndurance    = /\b(endurance|running|marathon|half[\s-]marathon|5k|10k|cycling|swimming|triathlon|stamina|aerobic)\b/i.test(userText);
//     const isSport        = /\b(sport|athletic|crossfit|functional[\s-]fitness|agility|speed|conditioning|sport[\s-]specific)\b/i.test(userText);
//     const isRehab        = /\b(rehab|rehabilitat|injur(?:y|ies|ed)|chronic[\s-]pain|corrective|physical[\s-]therapy|postpartum|postnatal)\b/i.test(userText);
//     const isSenior       = /\b(senior|elder(?:ly)?|6[0-9][\s-]year|7[0-9][\s-]year|older[\s-]adult|aging)\b/i.test(userText);
//     const isWomensHealth = /\b(pcos|hormonal[\s-]health|postpartum|postnatal|menopause|women[\s-]specific|female[\s-]specific)\b/i.test(userText);
//     const isHome         = /\b(home|no[\s-]equipment|bodyweight|no[\s-]gym|minimal[\s-]equipment)\b/i.test(userText);
//     const isBeginner     = /\b(beginner|never[\s-]worked[\s-]out|first[\s-]time|starter|new[\s-]to[\s-]fitness|getting[\s-]started)\b/i.test(userText);

//     const goalNote = isFatLoss
//       ? "The user's primary goal is fat loss â the programme must support a caloric deficit, prioritise adherence, and treat nutrition as equally important as training."
//       : isHypertrophy
//       ? "The user's primary goal is muscle gain â the programme must prioritise mechanical tension, progressive volume overload, and recovery quality."
//       : isStrength
//       ? "The user's primary goal is strength â the programme must centre on compound lifts, structured intensity progression, and neural fatigue management."
//       : isMobility
//       ? "The user's primary goal is mobility or movement quality â the programme must prioritise range of motion, tissue preparation, and joint health over load."
//       : isEndurance
//       ? "The user's primary goal is endurance â the programme must structure aerobic base development, intensity zones, and progressive session length with adequate recovery."
//       : isSport
//       ? "The user wants sport-specific or functional performance â the programme must address conditioning, movement quality, and the physical demands of their activity."
//       : isRehab
//       ? "The user has a rehabilitation or injury context â the programme must prioritise pain-free movement, corrective work, and gradual load progression."
//       : isSenior
//       ? "The user is an older adult â the programme must prioritise joint safety, balance, bone density, and functional strength over maximal loading."
//       : isWomensHealth
//       ? "The user has a women's health context â the programme must account for hormonal considerations and any postpartum or PCOS-specific adaptations."
//       : "";

//     const personaNote = isStrength
//       ? "The expert persona is a strength or powerlifting coach with a background in periodisation and competition programming."
//       : isHypertrophy
//       ? "The expert persona is a sports scientist or hypertrophy coach with an evidence-based bodybuilding background."
//       : isFatLoss
//       ? "The expert persona is a body composition coach with expertise in fat loss, metabolic adaptation, and sustainable habit design."
//       : isMobility
//       ? "The expert persona is a movement specialist or physiotherapist with expertise in mobility, flexibility, and corrective exercise."
//       : isEndurance
//       ? "The expert persona is an endurance coach with a background in running, cycling, or triathlon programming."
//       : isSport
//       ? "The expert persona is a certified strength and conditioning coach with sport-specific programming experience."
//       : isRehab
//       ? "The expert persona is a rehabilitation specialist or physiotherapist with corrective exercise expertise."
//       : isSenior
//       ? "The expert persona is a certified senior fitness specialist with expertise in safe, functional programming for older adults."
//       : isWomensHealth
//       ? "The expert persona is a women's health and fitness coach with expertise in hormonal health, postpartum, or PCOS-adapted programming."
//       : "The expert persona must match the specific training goal and user profile â not a generic personal trainer.";

//     const sections = [
//       {
//         name: "Coach Role",
//         label: "Your Role as Coach",
//         skillInstruction: `Assume the most appropriate fitness professional role based on the user's goal â not a generic personal trainer. ${personaNote} Tailor explanations to the user's experience level. This role applies throughout the entire response â do not repeat it.${goalNote ? `\n\nGoal context: ${goalNote}` : ""}`,
//         deepInstruction: `Establish a specific coaching identity matched to the user's goal and profile. ${personaNote} Open with one counter-intuitive insight about this goal grounded in a physiological mechanism. This identity applies throughout â do not restate it in any section.${goalNote ? `\n\nGoal context: ${goalNote}` : ""}${hasUserAnswers ? "\n\nThe user has provided specific context â weave it into guidance throughout, not in a single block." : ""}`,
//         required: true,
//       },
//       {
//         name: "User Assessment",
//         label: "User Assessment & Training Context",
//         skillInstruction: `Identify the following before making any programme decisions: primary goal, current experience level, age, available training days per week, session duration available, equipment access, any medical conditions or injuries, and lifestyle constraints. Never assume if information is missing â state the assumption and its rationale. Derive every programme decision from these inputs.${hasUserAnswers ? "\n\nThe user has already provided some of this context â reference it explicitly as the basis for every decision." : ""}`,
//         deepInstruction: `Conduct a structured intake assessment before any programming: goal, training age, experience level, weekly availability, equipment, health constraints, and lifestyle factors. Every subsequent programme decision must be explicitly traceable to one or more of these inputs. Where information is absent, state the assumption and explain why it is appropriate for this goal and context.${hasUserAnswers ? "\n\nMake every programme decision explicitly traceable to the user's stated inputs." : ""}`,
//         required: true,
//       },
//       {
//         name: "Training Strategy",
//         label: goalLabel("Training Strategy Overview"),
//         skillInstruction: `Explain the overall training approach and justify why it fits the user's goal. Name the training methodology and the physiological rationale for choosing it over alternatives. Explain what primary adaptation is being targeted and how the programme design serves it.`,
//         deepInstruction: `Explain the strategic training approach with the physiological reasoning behind every structural decision. Why does this methodology produce results for this specific goal and profile? What is the primary adaptation being driven â neural, muscular, cardiovascular, hormonal â and how does the programme design serve it? What are the trade-offs compared to alternative approaches?`,
//         required: true,
//       },
//       {
//         name: "Programme Structure",
//         label: goalLabel("Programme Structure"),
//         skillInstruction: `Determine dynamically â from the user's profile â the programme duration, weekly training frequency, training split, session length, and recovery allocation. All structural decisions must be derived from the user's stated inputs. Never use fixed templates or pre-filled programme structures.`,
//         deepInstruction: `Derive the programme structure from the user's profile with explicit reasoning for each decision. Why this frequency for this goal and experience level? What is the recovery logic behind the split? What would change with higher frequency or a different structure, and why is the chosen approach the better fit for this specific user?`,
//         required: true,
//       },
//       {
//         name: "Exercise Selection",
//         label: "Exercise Selection Principles",
//         skillInstruction: `Select exercises based on goal, experience level, available equipment, mobility, and any injury constraints. Cover the balance between compound and isolation movements, movement pattern coverage, and exercise substitutions. Never hardcode specific exercise names â explain the selection principles instead.${isHome ? "\n\nAll exercise selection must respect the user's equipment constraints." : ""}${isRehab || isSenior ? "\n\nFlag movement patterns requiring modification for this user's profile and explain the safe alternative." : ""}`,
//         deepInstruction: `Explain exercise selection as a decision framework: which movement patterns are non-negotiable for this goal, how to balance compound and isolation work, how equipment constraints shape selection, and how exercises should be sequenced within a session for this training type. For any movement carrying elevated risk for this user's profile, name the safe alternative and explain the physiological reasoning.${isHome ? "\n\nAll exercise selection must respect the user's equipment constraints â no gym-access assumptions." : ""}${isRehab || isSenior ? "\n\nFor each movement pattern requiring modification, explain the physiological reason and the safe alternative." : ""}`,
//         required: true,
//       },
//       {
//         name: "Workout Design",
//         label: goalLabel("Workout Design"),
//         skillInstruction: `Design each training session with purpose: session type, exercise categories, rep and set ranges appropriate for the goal and experience level, rest periods, and intensity guidance. All values must be generated dynamically from the user's profile â never fixed templates. Explain the purpose of each session type within the weekly structure.`,
//         deepInstruction: `Design each session with the physiological rationale for every structural element: why these rep ranges for this goal, why these rest periods, why this exercise order. All intensity, volume, and density parameters must be derived from the user's profile. Explain what adaptation each session type is designed to drive.`,
//         required: true,
//       },
//       {
//         name: "Progression",
//         label: goalLabel("Progression Strategy"),
//         skillInstruction: `Explain how to progress over time for this specific goal: when to increase load, volume, or density; what observable signal triggers a progression; and when NOT to progress. Include a deload strategy â when it is needed and what it should look like for this training type.`,
//         deepInstruction: `Teach progression as a decision framework: when to increase load versus volume versus density and the physiological reason for each priority at different stages. What specific observable signal confirms readiness to progress? When should the user hold or deload, and what is the physiological mechanism behind productive deloading versus simply resting?`,
//         required: true,
//       },
//       {
//         name: "Nutrition",
//         label: goalLabel("Nutrition Guidance"),
//         skillInstruction: `Generate nutrition guidance from the user's goal, body weight, activity level, and dietary preferences. Cover caloric approach derived from the goal, protein target as a formula (never a fixed number), carbohydrates, fats, and meal timing relative to training. All values must be derived from user inputs â never hardcoded.${isFatLoss ? "\n\nAddress sustainability â explain why aggressive deficits are counterproductive for this training goal." : ""}${isHypertrophy ? "\n\nExplain the role of energy availability in muscle protein synthesis." : ""}`,
//         deepInstruction: `Explain each nutrition recommendation with the physiological mechanism behind it. Why does this caloric approach serve this goal? What happens to training adaptation without adequate protein? How does meal timing affect the training stimulus and recovery for this modality? Protein target as a formula only â never a fixed gram amount. Include one named nutritional risk specific to this goal with a mitigation strategy.${isFatLoss ? "\n\nExplain metabolic adaptation, muscle loss risk, and performance degradation at aggressive deficits â not just behavioural adherence." : ""}${isHypertrophy ? "\n\nExplain the relationship between energy availability, muscle protein synthesis, and the consequence of training for hypertrophy in too large a caloric deficit." : ""}`,
//         required: true,
//       },
//       {
//         name: "Recovery",
//         label: "Recovery & Injury Prevention",
//         skillInstruction: `Cover recovery as a programme component: sleep requirements for this training goal, warm-up and cool-down protocols, mobility work, signs of insufficient recovery specific to this training type, and what to do when recovery is compromised. Include injury prevention guidance relevant to this goal.${isRehab ? "\n\nInclude specific guidance for the user's injury or rehabilitation context." : ""}`,
//         deepInstruction: `Explain recovery as a physiological process: which systems are under stress from this training type, how long each takes to recover, and how the programme design accounts for this. Cover under-recovery signals specific to this goal and the specific programming response to each signal. Explain the deload mechanism: what is happening physiologically during a deload that makes it productive rather than just passive rest?${isRehab ? "\n\nAddress the rehabilitation context specifically â safe progression, pain-free movement criteria, and when to escalate to professional guidance." : ""}`,
//         required: true,
//       },
//       {
//         name: "Progress Tracking",
//         label: goalLabel("Progress Tracking"),
//         skillInstruction: `Define how progress should be measured for this specific goal: performance markers, body composition markers where relevant, endurance or strength indicators, and adherence markers. Each marker must be testable without a coach and clearly distinguish "on track" from "needs adjustment." Explain how to respond if progress stalls.`,
//         deepInstruction: `Define progress markers that confirm physiological adaptation, not just attendance or effort. For each marker, explain what it is measuring and why it is the right indicator for this goal. Include checkpoint logic: when to assess, what a missed checkpoint means, and what specific programming adjustment should follow if the marker is not met.`,
//         required: true,
//       },
//       {
//         name: "Coaching Tips",
//         label: "Coaching Tips & Common Mistakes",
//         skillInstruction: `Cover common mistakes specific to this goal and training type â not generic fitness advice. Include technique cues for key movements, consistency and motivation strategies relevant to this user's context, and recovery tips. Every insight must be specific to this goal.`,
//         deepInstruction: `Cover common failure modes specific to this goal with the mechanism behind each and the specific corrective action. Include at least one technique failure, one programming mistake, and one adherence failure relevant to this training type. Explain why each mistake is particularly common for this goal and demographic.`,
//         required: true,
//       },
//       {
//         name: "Modifications",
//         label: "Programme Modifications & Alternatives",
//         skillInstruction: `Adapt the programme for relevant constraints stated by the user: home workouts, limited equipment, travel, senior fitness, post-injury, pregnancy or postpartum, PCOS, or other stated constraints. Every modification must be explained with reasoning, not just listed.${isHome ? "\n\nHome and bodyweight adaptations are required for this user." : ""}${isRehab || isSenior || isWomensHealth ? "\n\nAdaptations for the user's specific health context are required." : ""}`,
//         deepInstruction: `Explain the specific modifications required for the user's constraints with the physiological or practical reasoning behind each adaptation. For any modification that changes the training stimulus, explain the trade-off and what the user should expect differently from the adjusted programme.${isHome ? "\n\nExplain the training stimulus trade-offs of home and bodyweight training compared to gym-based training." : ""}${isRehab || isSenior || isWomensHealth ? "\n\nFor each health-context modification, explain the physiological reason and the expected impact on results." : ""}`,
//         required: true,
//       },
//       {
//         name: "Safety",
//         label: "Safety Considerations",
//         skillInstruction: `Cover when to stop exercising, warning signs to watch for during training, exercise categories or movements to avoid given any stated constraints, and when to recommend professional medical advice before proceeding.`,
//         deepInstruction: `Address safety at the level of the user's specific profile and training context. Cover warning signs that indicate the workout should stop immediately, contraindications specific to any stated health conditions or injuries, and clear guidance on when professional medical consultation is warranted. Explain why each safety consideration applies to this specific training type and profile.`,
//         required: true,
//       },
//       {
//         name: "Lifestyle",
//         label: "Lifestyle & Habit Building",
//         skillInstruction: `Include daily movement guidance, habit formation strategies, stress and sleep management relevant to this training load, and long-term sustainability guidance appropriate for this user's goal and lifestyle.`,
//         deepInstruction: `Address the lifestyle factors that determine long-term adherence for this user. Cover daily movement habits, sleep hygiene in the context of this training load and its effect on recovery and adaptation, stress management as a physiological recovery variable, and the habit design principles that make this specific programme sustainable for this user's profile.`,
//         required: true,
//       },
//     ];

//     return sections;
//   }

//   // ââ CONTENT WRITING ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
//   if (intentCategory === "content_writing") {
//     const sections = [
//       {
//         name: "Expert Role",
//         label: "Your Expert Role",
//         skillInstruction: `Specific content strategist/writer identity â niche, platform expertise, years, ONE content principle or rule you always apply first.\nNEVER: "You are a content expert." Name the content type, the audience, and your go-to first move.`,
//         deepInstruction: `Vivid content expert identity â niche, platform, experience.\n\nâ  NON-OBVIOUS MISTAKE: "The biggest mistake I see with [this content type] is [specific structural/strategic error experienced writers still make]." Why it happens â what it costs (low engagement/poor SEO/missed conversions) â fix.\nâ¡ TRADE-OFF: "The central trade-off is [SEO vs readability / depth vs shareability / brand voice vs conversion]." What to prioritise for this specific use case.\nâ¢ COUNTER-INTUITIVE ORDERING: What most writers draft first vs what actually determines whether content succeeds.`,
//         required: true,
//       },
//       {
//         name: "Content Goal",
//         label: "Content Goal & Audience",
//         skillInstruction: `One paragraph: exact content goal (inform/convert/entertain/rank), target audience (specific, not "everyone"), and the single measurable success criterion.\nWeave in platform, tone, and any detected constraints.`,
//         deepInstruction: `One paragraph: content goal, specific audience persona, success criterion.\n${hasUserAnswers ? "MANDATE: Reference the user's stated audience, platform, and goal from their answers." : ""}`,
//         required: true,
//       },
//       {
//         name: "Structure",
//         label: "Content Structure",
//         skillInstruction: `Named sections/components of the content piece, in order.\nFor each section: name + one-line description of what it contains + its job (hook/explain/convert/close).\nFormat: **[Section name]:** [what it contains] â Purpose: [job it does]`,
//         deepInstruction: `Named sections in order, each with:\n**[Section Name]:** [what it contains + why this order works]\nFormat: **[Section]:** [content] â Job: [hook/explain/validate/convert/close]\n\nInclude: word count allocation per section (total must match target).`,
//         required: true,
//       },
//       {
//         name: "Key Numbers",
//         label: "Content Benchmarks",
//         skillInstruction: `Markdown table: target word count / reading time / keyword density (if SEO) / CTA count / ideal publish frequency.\nAll numbers specific to this content type and platform.`,
//         deepInstruction: `Markdown table of content performance parameters.\nFormat: | Parameter | Target |\nMust include: word count, reading time, headline CTR benchmark, engagement rate target, publication cadence.\n${hasUserAnswers ? "MANDATE: Include current baseline if user stated existing metrics." : ""}`,
//         required: true,
//       },
//       {
//         name: "Distribution",
//         label: "Distribution & Promotion",
//         skillInstruction: `3â5 specific distribution actions: where to publish, how to promote, when to post.\nName actual platforms, tools, and timing â not "share on social media".\nOne direct recommendation about the highest-ROI channel for this content.`,
//         deepInstruction: `5â7 specific distribution actions with platform, timing, and format.\nInclude: primary channel, repurposing strategy (what format, which platform), and one paid promotion trigger (when organic reach justifies boosting).\nâ  Risk: [specific distribution failure for this content type]. Mitigation: [named action].`,
//         required: true,
//       },
//       {
//         name: "Ground Rules",
//         label: "Content Rules",
//         skillInstruction: `4â5 direct rules for this content type:\n"Never [X]", "Always [Y]", "If [Z] then [W]"\nCovers: tone, structure, SEO, and one platform-specific rule.`,
//         deepInstruction: `4â5 direct rules specific to this content type and platform.\n\nMANDATORY â 3 NAMED RISKS:\n"â  Risk: [specific content failure mode â poor hook, SEO cannibalisation, tone mismatch]. Mitigation: [named fix]."`,
//         required: true,
//       },
//       {
//         name: "What Good Looks Like",
//         label: "What Good Content Looks Like",
//         skillInstruction: `3 criteria written as "This content succeeds whenâ¦" â measurable, not subjective.\nCovers: audience response, performance metric, and business outcome.`,
//         deepInstruction: `3 criteria as "This content succeeds whenâ¦" â measurable, platform-specific.\n\n${framework === "strategic"
//           ? `"**30-day benchmark:** [specific traffic or engagement metric]. If not hit, [specific content or distribution adjustment]."\n"**90-day benchmark:** [compounding outcome]."\n"**What comes next:** [next content asset or campaign to build on this]."` 
//           : `Final criterion: a performance metric specific to this platform and content type.`}`,
//         required: true,
//       },
//     ];
//     if (isDeepMode) {
//       sections.push({
//         name: "Next 3 Actions",
//         label: "Your Next 3 Actions",
//         skillInstruction: null,
//         deepInstruction: `3 specific actions to move from brief to published:\n1. [Research/outline action] â you â [deadline]\n2. [Draft action â what to write first] â you â [deadline]\n3. [Publishing/distribution action] â you â [deadline]\n\nFormat: "N. [Specific action] â [who] â [deadline]"\nBAD: "Start writing your content." TOO VAGUE.`,
//         required: true,
//       });
//     }
//     return sections;
//   }

//   // ââ TUTORIAL âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
//   if (intentCategory === "tutorial" || isTutorial) {
//     const sections = [
//       {
//         name: "Expert Role",
//         label: "Your Expert Role",
//         skillInstruction: `Name the TECHNOLOGY and MINI-PROJECT in this section.\nSpecific educator/developer identity â language/framework specialisation, years of teaching, ONE pedagogical principle you always apply.\nNEVER: "You are an experienced developer." Name the exact tech stack and the project.`,
//         deepInstruction: `Name the TECHNOLOGY and MINI-PROJECT explicitly.\n\nâ  COUNTER-INTUITIVE ORDERING: "Most tutorials teach [X] before [Y] â that's wrong. [Y] must come first because [learning mechanism]."\nâ¡ NON-OBVIOUS MISTAKE (3â4 sentences): "The biggest mistake I see in [this type of tutorial] is [specific instructional error experienced devs still make]." Why it happens â what it costs (learner confusion/dropout) â the fix.\nâ¢ TRADE-OFF: "The central trade-off is thoroughness vs momentum. [Specific version â e.g. 'explaining every React concept before a line renders'] kills completion rates. [What to do instead]."`,
//         required: true,
//       },
//       {
//         name: "What You're Here to Do",
//         label: "What You're Here to Do",
//         skillInstruction: `One tight paragraph: exact goal, starting point (assumed knowledge), success = deployed, portfolio-ready project reader can put on GitHub TODAY.\nWeave in tech stack and project name.`,
//         deepInstruction: `One tight paragraph: goal, assumed prior knowledge, what success looks like (deployed, GitHub-ready, demonstrable).\n${hasUserAnswers ? "MANDATE: Reference user's stated skill level and environment from their answers." : ""}`,
//         required: true,
//       },
//       {
//         name: "Core Focus Areas",
//         label: "Your Core Focus Areas",
//         skillInstruction: `3â5 bullets: what reader must BE ABLE TO DO by the end. Demonstrable, not just knowable.\nFormat: "â¢ [Skill/capability]: [how it's demonstrated in the project]"`,
//         deepInstruction: `3â5 bullets: demonstrable capabilities the reader gains.\nEach bullet = something the reader can show in the project or explain in an interview.\nBAN: "understand", "learn about" â use "build", "implement", "configure", "deploy".`,
//         required: true,
//       },
//       {
//         name: "How to Approach This",
//         label: "Tutorial Structure",
//         skillInstruction: `Structure: **Setup & First Win** â **Core Concepts with Running Code** â **Build the Full Project** â **Deploy & Share**\nEach phase: timeframe + what the reader has working at the end.\nFormat: **[Phase Name] ([timeframe]):** [what happens] â Output: [runnable thing]`,
//         deepInstruction: `Session-based phases:\n**Setup & First Win ([time]):** â Output: [first running screen]\n**Core Concepts with Running Code ([time]):** â Output: [key feature working]\n**Build the Full Project ([time]):** â Output: [complete app]\n**Ship & What's Next ([time]):** â Output: [deployed URL + next tutorial pointer]\n\nEach phase produces something RUNNABLE. No phase ends in "now you understand X."`,
//         required: true,
//       },
//       {
//         name: "Key Numbers",
//         label: "Key Numbers & Benchmarks",
//         skillInstruction: `Markdown table â REQUIRED rows: tutorial word count, read time (SEPARATE row), build time (SEPARATE â NEVER combined), code examples count, deployment time.\nFormat: | Parameter | Value |`,
//         deepInstruction: `Markdown table â REQUIRED rows (all separate):\n| Tutorial word count | |\n| Read time | |\n| Build time | |\n| Code examples | |\n| Deployment time | |\n| Tech stack | |\nNEVER combine read time and build time.`,
//         required: true,
//       },
//       {
//         name: "What to Deliver",
//         label: "What to Deliver",
//         skillInstruction: `Name every output: the guide (word count, sections), code examples (count + platform), mini-project (what it does, stack, where it deploys), "What's Next" pointing to 2â3 specific follow-on tutorials.`,
//         deepInstruction: `Name every output with format + specification:\nâ¢ The written guide: word count, section breakdown\nâ¢ Code examples: count + repo structure\nâ¢ Mini-project: name + what it does + tech stack + deployment URL\nâ¢ "What's Next": 2â3 named follow-on projects in order of difficulty`,
//         required: true,
//       },
//       {
//         name: "Ground Rules",
//         label: "Tutorial Rules",
//         skillInstruction: `Must include:\nâ¢ Every concept gets a runnable code example â no concept without code\nâ¢ Tutorial cannot end without the reader deploying something real\nâ¢ Read time â  build time â always state both separately\nAdd 2â3 more rules specific to this technology.`,
//         deepInstruction: `Must include:\nâ¢ Every concept gets a runnable code example\nâ¢ Tutorial ends with a deployed, GitHub-ready project\nâ¢ Read time and build time stated separately â always\n\nMANDATORY â 3 NAMED RISKS:\n"â  Risk: [specific point where learners drop off in this tech stack]. Mitigation: [named structural fix]."`,
//         required: true,
//       },
//       {
//         name: "What Good Looks Like",
//         label: "What Good Looks Like",
//         skillInstruction: `3 criteria written as "The work mustâ¦"\nFinal criterion: "The work must produce a reader who can deploy their own variation of the mini-project from scratch without referring back to the tutorial."`,
//         deepInstruction: `3 criteria as "The work mustâ¦" â observable, verifiable.\nFinal criterion: "The work must produce a reader who can deploy their own variation of the mini-project from scratch without referring back to the tutorial."\nOther 2: one about code quality signal, one about reader comprehension test.`,
//         required: true,
//       },
//     ];
//     if (isDeepMode) {
//       sections.push({
//         name: "Next 3 Actions",
//         label: "Your Next 3 Actions",
//         skillInstruction: null,
//         deepInstruction: `3 first steps to begin writing this tutorial:\n1. [Technology/project decision action] â you â today\n2. [Setup action â scaffold the code repo] â you â Day 1\n3. [Outline action â map all code examples needed] â you â before writing starts\n\nFormat: "N. [Specific action] â [who] â [deadline]"`,
//         required: true,
//       });
//     }
//     return sections;
//   }

//   // ââ AI IMAGE ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
//   if (intentCategory === "ai_image") {
//     const sections = [
//       {
//         name: "Expert Role",
//         label: "Your Expert Role",
//         skillInstruction: `Name the specific AI tool, your go-to parameter combination, and your acceptance criteria rule.\nNEVER mention DSLR, camera settings, tripod, or physical lighting setups.\nYou are an AI prompt director â not a photographer.`,
//         deepInstruction: `Name the specific AI tool (${tool}), version, and your go-to parameter set for this exact use case.\n\nâ  COUNTER-INTUITIVE ORDERING: "Most people spend 80% of prompt-engineering time on [X]. That's wrong â [Y] is the variable that kills outputs. Fix [Y] first."\nâ¡ NON-OBVIOUS MISTAKE: "The biggest mistake I see here is [tool-specific error, not generic]. Why it happens â what it costs â fix."\nâ¢ TRADE-OFF: "The central trade-off is [specificity vs flexibility / style lock-in vs iteration speed]."`,
//         required: true,
//       },
//       {
//         name: "What You're Here to Do",
//         label: "What You're Here to Do",
//         skillInstruction: `One paragraph: exact use case (product shots/portraits/scenes), platform format, and success = a consistent prompt library that passes acceptance criteria at least 1 in 4 generations.`,
//         deepInstruction: `One paragraph: use case, platform/format, and what a working prompt system looks like.\n${hasUserAnswers ? "MANDATE: Reference user's stated tool version, style direction, and use case." : ""}`,
//         required: true,
//       },
//       {
//         name: "Core Focus Areas",
//         label: "Your Core Focus Areas",
//         skillInstruction: `4 bullets â each an AI-specific skill or workflow deliverable:\nâ¢ Prompt Anatomy: the 5 elements every prompt needs\nâ¢ Style Parameter Library: named --flags for this use case\nâ¢ Iteration Framework: how to go from first output to usable in 3 rounds\nâ¢ Quality Filter: the specific acceptance test`,
//         deepInstruction: `4â5 bullets â tool-specific skills:\nâ¢ Prompt Anatomy: subject + surface + light + mood + aspect ratio\nâ¢ Style Parameter Library: named --flags and when to use each\nâ¢ Iteration Framework: first output â portfolio-ready in 3 rounds\nâ¢ Quality Filter: acceptance test (not "looks good" â named criteria)\nâ¢ Style Consistency: how to maintain look across a catalogue`,
//         required: true,
//       },
//       {
//         name: "How to Approach This",
//         label: "How to Approach This",
//         skillInstruction: `3â4 phases:\n**Anchor Prompt ([timeframe]):** â Output: [style reference prompt]\n**Parameter Library ([timeframe]):** â Output: [named --flags guide]\n**Iteration Workflow ([timeframe]):** â Output: [3-round refinement process]\n**Catalogue Build ([timeframe]):** â Output: [consistent prompt library]`,
//         deepInstruction: `3â4 implementation phases:\n**[Phase] ([timeframe]):** [what happens] â Deliverable: [named output]\n\nPhase 1: establish anchor prompt before building anything else.\nFinal phase: what the user does AFTER the initial catalogue is built.`,
//         required: true,
//       },
//       {
//         name: "Key Numbers",
//         label: "Key Numbers & Benchmarks",
//         skillInstruction: `Markdown table â REQUIRED rows: optimal prompt length (words), iterations to portfolio-ready, acceptance rate target, recommended --ar for this platform, --chaos value for product shots, style consistency metric.\nAll numbers specific to ${tool}.`,
//         deepInstruction: `Markdown table â REQUIRED (${tool}-specific):\n| Optimal prompt length | |\n| Iterations to portfolio-ready | |\n| Acceptance rate target | |\n| Recommended --ar | |\n| --chaos value | |\n| Style consistency benchmark | |`,
//         required: true,
//       },
//       {
//         name: "What to Deliver",
//         label: "What to Deliver",
//         skillInstruction: `Name every output: prompt template library (count + format), style reference bank (count + source), acceptance criteria doc (pass vs regenerate), platform-specific aspect ratio guide.`,
//         deepInstruction: `Name every output with format + count:\nâ¢ Prompt template library: how many templates + format\nâ¢ Style reference bank: number of images + source method\nâ¢ Acceptance criteria doc: what passes vs regenerates\nâ¢ Platform-specific --ar cheat sheet`,
//         required: true,
//       },
//       {
//         name: "Ground Rules",
//         label: "Ground Rules",
//         skillInstruction: `Must include:\nâ¢ Never use prompt length over 80 words â longer reduces subject focus in ${tool}\nâ¢ Always establish a style anchor prompt before building a catalogue\nâ¢ If --v6 produces modern aesthetics for a vintage brief, add --style raw + --sref\nâ¢ Never judge a prompt on the first generation â run 4 outputs minimum`,
//         deepInstruction: `Must include the 4 core rules for ${tool} above.\n\nMANDATORY â 3 NAMED RISKS (tool-specific failure modes only):\n"â  Risk: [${tool}-specific failure â style drift/version defaults/catalogue inconsistency]. Mitigation: [named parameter or workflow fix]."\nNEVER generic photography risks.`,
//         required: true,
//       },
//       {
//         name: "What Good Looks Like",
//         label: "What Good Looks Like",
//         skillInstruction: `3 criteria as "The work mustâ¦"\nFinal criterion: "The work must produce a prompt library where any prompt generates a usable image at least 1 in every 4 generations â without adjusting prompt structure between products."`,
//         deepInstruction: `3 criteria as "The work mustâ¦"\nFinal criterion: "The work must produce a prompt library where any prompt generates a usable image (passing the acceptance criteria) at least 1 in every 4 generations â without adjusting prompt structure between products."\nOther 2: style consistency test and catalogue completeness test.`,
//         required: true,
//       },
//     ];
//     if (isDeepMode) {
//       sections.push({
//         name: "Next 3 Actions",
//         label: "Your Next 3 Actions",
//         skillInstruction: null,
//         deepInstruction: `3 immediate actions â all ${tool}-specific:\n1. [Anchor prompt action â test ONE product/subject with 4 variations] â you alone â Day 1\n2. [Parameter library action â document which --flags work for this use case] â you alone â Day 3\n3. [Acceptance criteria action â define pass/fail before building the catalogue] â you alone â before Day 5\n\nFormat: "N. [Specific action] â [who] â [deadline]"`,
//         required: true,
//       });
//     }
//     return sections;
//   }

//   // ââ DEBUGGING / OPERATIONAL âââââââââââââââââââââââââââââââââââââââââââââââââââ
//   if (intentCategory === "debugging" || framework === "operational") {
//     const sections = [
//       {
//         name: "Expert Role",
//         label: "Your Expert Role",
//         skillInstruction: `Specific diagnostic expert identity â technology, years of debugging experience, ONE diagnostic principle you always apply first (eliminate before you fix).\nName the most common misdiagnosis for this type of problem.`,
//         deepInstruction: `Diagnostic expert identity â technology stack, incident response experience.\n\nâ  MISDIAGNOSIS TRAP: "The most common misdiagnosis here is [X]. People waste hours chasing [X] when [Y] is the actual root cause."\nâ¡ COST OF WRONG ROOT CAUSE: "Chasing the wrong cause costs [specific time/consequence]."\nâ¢ DIAGNOSTIC PRINCIPLE: "I always [specific first step] before touching any configuration â here's why."`,
//         required: true,
//       },
//       {
//         name: "Problem Statement",
//         label: "Problem Statement",
//         skillInstruction: `One paragraph: exact symptom, when it started, environment (OS/framework/version), and what's been tried.\nIf constraints are known, reference them directly.`,
//         deepInstruction: `One paragraph: exact symptom, environment, reproduction steps, what's been tried.\n${hasUserAnswers ? "MANDATE: Reference the user's stated error message, stack, and environment from their answers." : ""}`,
//         required: true,
//       },
//       {
//         name: "Diagnostic Steps",
//         label: "Diagnostic Steps",
//         skillInstruction: `Numbered steps ordered by likelihood of root cause.\nEach step: what to check â what a pass looks like â what a fail means â next step.\nFormat: **Step N â [Check name]:** [command or action] â Pass: [what it means] â Fail: [what it means]`,
//         deepInstruction: `Ordered diagnostic sequence â most likely root cause first.\nFormat: **Step N â [Check]:** [exact command or action] â Pass: [what passing looks like] â Fail: [what this means, next step]\n\nStop when you find the culprit â don't run all steps if an early one fails.`,
//         required: true,
//       },
//       {
//         name: "Resolution",
//         label: "Resolution Steps",
//         skillInstruction: `For each likely root cause: the exact fix.\nFormat: **If [root cause]:** [specific command or code change] â Verification: [how to confirm it's resolved]`,
//         deepInstruction: `Resolution map: root cause â exact fix â verification.\nFormat: **If [root cause identified in Step N]:** [specific fix â command, config change, code edit] â Verification: [exact test that confirms resolution]\n\nInclude rollback instruction if the fix could create new issues.`,
//         required: true,
//       },
//       {
//         name: "Key Numbers",
//         label: "Diagnostic Benchmarks",
//         skillInstruction: `Markdown table: typical resolution time / most common root cause (%) / tools needed / log location(s).\nSpecific to this technology/error type.`,
//         deepInstruction: `Markdown table of diagnostic parameters.\n| Parameter | Value |\nMust include: typical resolution time, most likely root cause, tools needed, relevant log paths.`,
//         required: true,
//       },
//       {
//         name: "Ground Rules",
//         label: "Debugging Rules",
//         skillInstruction: `4â5 direct debugging rules:\n"Never [X] without [Y first]", "Always [check Z] before changing config"\nCovers: isolation principle, version pinning, rollback, logging.`,
//         deepInstruction: `4â5 direct rules for this debugging scenario.\n\nMANDATORY â 3 NAMED RISKS:\n"â  Risk: [specific misdiagnosis or fix-that-makes-it-worse]. Mitigation: [named check before acting]."\nZERO strategic planning language.`,
//         required: true,
//       },
//       {
//         name: "What Good Looks Like",
//         label: "Resolution Signal",
//         skillInstruction: `3 criteria as "The issue is resolved whenâ¦" â observable test results.\nNO milestones, NO business metrics, NO day/week targets.\nFinal criterion: the clean-state test.`,
//         deepInstruction: `3 criteria as "The issue is resolved whenâ¦" â specific, testable.\nEach criterion: an exact test or output that confirms resolution.\nFinal criterion: the system-state test that confirms clean resolution without side effects.\nZERO milestone or business language.`,
//         required: true,
//       },
//       {
//         name: "Next 3 Actions",
//         label: "Your Next 3 Actions",
//         skillInstruction: null,
//         deepInstruction: `3 immediate investigation actions â specific commands or checks:\n1. [First check â most likely root cause] â you â immediately\n2. [Second check â if Step 1 passes] â you â within the hour\n3. [Escalation or logging action â if neither resolves it] â you â before anything else\n\nFormat: "N. [Specific command or action] â [who] â [deadline]"\nZERO strategic or planning language.`,
//         required: true,
//       },
//     ];
//     return sections;
//   }

//   // ââ MARKETING GROWTH ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
//   if (intentCategory === "marketing_growth") {
//     const sections = [
//       {
//         name: "Expert Role",
//         label: "Your Expert Role",
//         skillInstruction: `Specific growth/marketing expert identity â channel specialisation, years, ONE framework or rule you always apply first.\nNEVER: "You are a marketing expert." Name the specific channel and your go-to first diagnostic.`,
//         deepInstruction: `Vivid marketing expert identity â channel, methodology, experience.\n\nâ  COUNTER-INTUITIVE ORDERING: "Most brands start with [X] â wrong. [Y] must be working before [X] is worth a rupee."\nâ¡ NON-OBVIOUS MISTAKE (3â4 sentences): "The biggest mistake I see here is [specific, experienced-marketer-level error]." Why â cost (wasted spend/missed CAC) â fix.\nâ¢ TRADE-OFF: "The central trade-off is [reach vs conversion / brand vs performance / paid vs organic]." What to prioritise for this stage and budget.`,
//         required: true,
//       },
//       {
//         name: "What You're Here to Do",
//         label: "What You're Here to Do",
//         skillInstruction: `One paragraph: exact marketing goal (leads/sales/awareness/retention), target audience persona (specific, not "everyone"), and the single measurable success criterion.\nWeave in budget, timeline, and platform if detected.`,
//         deepInstruction: `One paragraph: goal, specific audience persona, success criterion with a number.\n${hasUserAnswers ? "MANDATE: Reference the user's stated budget, audience, and channel from their answers." : ""}`,
//         required: true,
//       },
//       {
//         name: "Core Focus Areas",
//         label: "Your Core Focus Areas",
//         skillInstruction: `3â5 bullets â distinct marketing workstreams with named outputs:\n"â¢ [Channel/Tactic]: [specific output â what gets built or decided]"\nBAN: "Monitor performance" â name the metric and the action it triggers.`,
//         deepInstruction: `3â5 bullets â named marketing workstreams:\n"â¢ [Channel/Tactic]: [specific output] â measured by: [named metric]"\nBAN: "Monitor and analyze" without a named metric and action threshold.`,
//         required: true,
//       },
//       {
//         name: "How to Approach This",
//         label: "How to Approach This",
//         skillInstruction: `3â4 phases with bold labels and timeframes.\nFormat: **[Phase Name] ([timeframe]):** [actions] â Output: [named deliverable]\nPhase 1 = foundation (what must exist before spending). Final phase = retention/LTV, not just acquisition.`,
//         deepInstruction: `${framework === "strategic"
//           ? `3â4 phases:\n**[Phase Name] ([timeframe]):** [what happens] â Deliverable: [named output]\nPhase 1: Foundation â what must exist before any spend or content goes live.\nFinal phase: MANDATORY POST-GOAL PHASE â what happens after first acquisition goal is hit (LTV expansion, referral, retention).`
//           : `3â4 implementation phases:\n**[Phase Name] ([timeframe]):** [what happens] â Deliverable: [named output]\nFinal phase = what user does after campaign is live.`}`,
//         required: true,
//       },
//       {
//         name: "Key Numbers",
//         label: "Key Numbers & Benchmarks",
//         skillInstruction: `Markdown table: 4â6 rows with real channel benchmarks.\nMust include: CAC target, conversion rate benchmark, ROAS target (if paid), CPL, organic vs paid traffic split.\nPull from domain benchmarks â never invent.`,
//         deepInstruction: `Markdown table â channel-specific benchmarks.\nFormat: | Parameter | Target / Benchmark |\nMust include: CAC, conversion rate, ROAS (if paid), CPL, content volume target, audience growth rate.\n${hasUserAnswers ? "MANDATE: Include 'Current baseline' row if user stated existing metrics." : ""}\n${framework === "strategic" ? "Add 30-day and 90-day target rows â must match milestones in What Good Looks Like exactly." : ""}`,
//         required: true,
//       },
//       {
//         name: "What to Deliver",
//         label: "What to Deliver",
//         skillInstruction: `Every deliverable: the thing + its format + its purpose.\nName: content assets, campaign setup, tracking infrastructure, reporting cadence.\nNO vague deliverables like "marketing materials".`,
//         deepInstruction: `Every deliverable with format + specification + purpose:\nâ¢ Content assets: type + count + format\nâ¢ Campaign setup: platform + targeting spec\nâ¢ Tracking: tools + metrics + reporting cadence\nâ¢ Creative: format + specs + testing plan`,
//         required: true,
//       },
//       {
//         name: "Ground Rules",
//         label: "Ground Rules",
//         skillInstruction: `4â5 direct marketing rules specific to this channel and goal:\n"Never [X]", "Always [Y]", "If [Z] then [W]"\nCovers: budget allocation, creative testing, attribution, and one platform-specific rule.`,
//         deepInstruction: `4â5 direct rules specific to this channel and goal.\n\nMANDATORY â 3 NAMED RISKS:\n"â  Risk: [specific channel/campaign failure mode]. Mitigation: [named action]."\nCovers: attribution failure, creative fatigue, budget misallocation.`,
//         required: true,
//       },
//       {
//         name: "What Good Looks Like",
//         label: "What Good Looks Like",
//         skillInstruction: `3 criteria as "The campaign/strategy succeeds whenâ¦" â measurable with named metrics.\nFinal criterion: a long-term efficiency signal (not just campaign completion).`,
//         deepInstruction: `3 criteria as "The campaign succeeds whenâ¦"\n\n${framework === "strategic"
//           ? `"**30-day milestone:** [specific metric â leads/sales/CAC]. If not hit, [specific channel or creative adjustment]."\n"**90-day milestone:** [sustained efficiency metric with number]."\n"**What comes next:** [specific next growth lever to activate]."` 
//           : `Final criterion: a channel efficiency signal that confirms the approach is working.`}`,
//         required: true,
//       },
//     ];
//     if (isDeepMode) {
//       sections.push({
//         name: "Next 3 Actions",
//         label: "Your Next 3 Actions",
//         skillInstruction: null,
//         deepInstruction: `3 specific actions to launch this campaign/strategy:\n1. [Foundation action â must exist before anything else] â you alone â Day 1\n2. [Creative/content action â first asset to build] â you alone â Day 3\n3. [Tracking/measurement action â must be live before spend starts] â you alone â before Week 1 ends\n\nFormat: "N. [Specific action] â [who] â [deadline]"`,
//         required: true,
//       });
//     }
//     return sections;
//   }

//   // ââ FINANCE / INVESTMENT ââââââââââââââââââââââââââââââââââââââââââââââââââââââ
//   if (intentCategory === "finance_investment") {
//     const sections = [
//       {
//         name: "Expert Role",
//         label: "Your Expert Role",
//         skillInstruction: `Specific financial expert identity â domain (equity/real estate/personal finance/tax), years, ONE investment principle or rule you always apply first.\nName the most common mistake at this stage of the user's financial journey.`,
//         deepInstruction: `Financial expert identity â domain, experience, methodology.\n\nâ  COUNTER-INTUITIVE ORDERING: "Most people [invest/plan/do X] before [Y is sorted]. That's the wrong order â [Y] failure makes [X] worthless."\nâ¡ NON-OBVIOUS MISTAKE: "The biggest mistake I see at this stage is [specific error experienced investors still make]." Why â cost (in â¹ or %) â fix.\nâ¢ TRADE-OFF: "The central trade-off is [return vs liquidity / diversification vs concentration / tax efficiency vs yield]." What to prioritise here.`,
//         required: true,
//       },
//       {
//         name: "Financial Goal",
//         label: "Financial Goal & Starting Point",
//         skillInstruction: `One paragraph: exact goal (corpus/income/tax saving), timeline, current situation, and the single most important decision to make first.\nWeave in any detected constraints (income, risk appetite, existing portfolio).`,
//         deepInstruction: `One paragraph: goal with number + timeline, current financial situation, and priority decision.\n${hasUserAnswers ? "MANDATE: Reference the user's stated income, risk appetite, and timeline from their answers." : ""}`,
//         required: true,
//       },
//       {
//         name: "Strategy",
//         label: "Investment Strategy",
//         skillInstruction: `Named strategy with asset allocation (%).\n3â5 bullets â each a named instrument or action with rationale and allocation %.\nNo generic advice. Name actual products (Nifty 50 index fund, ELSS, PPF â not "equity funds").`,
//         deepInstruction: `Named strategy with specific asset allocation.\nFor each instrument: name + allocation % + rationale + recommended product (not category).\nInclude: emergency fund status check before any investment begins.\nâ  Risk: [specific allocation risk for this goal/timeline]. Mitigation: [named rebalancing trigger].`,
//         required: true,
//       },
//       {
//         name: "How to Approach This",
//         label: "Implementation Phases",
//         skillInstruction: `3â4 phases with timeframes.\nFormat: **[Phase Name] ([timeframe]):** [actions] â Output: [named decision or account setup]\nPhase 1 = foundation (emergency fund + insurance before investing).`,
//         deepInstruction: `3â4 implementation phases:\n**[Phase Name] ([timeframe]):** [what happens] â Deliverable: [named account/decision/allocation done]\nPhase 1: non-negotiable foundation before any market exposure.\n${framework === "strategic" ? "Final phase: MANDATORY â what happens after the primary goal is achieved (corpus built, next goal activation)." : ""}`,
//         required: true,
//       },
//       {
//         name: "Key Numbers",
//         label: "Key Numbers & Benchmarks",
//         skillInstruction: `Markdown table: target corpus / monthly SIP amount / expected CAGR / time to goal / tax saving (if applicable).\nAll numbers specific and derived from stated goal â not invented.`,
//         deepInstruction: `Markdown table â goal-specific numbers.\nFormat: | Parameter | Value |\nMust include: target corpus, monthly SIP, expected CAGR (realistic range), time to goal, tax liability, emergency fund target.\n${hasUserAnswers ? "MANDATE: If user stated current savings/income, include 'Current baseline' row." : ""}`,
//         required: true,
//       },
//       {
//         name: "Ground Rules",
//         label: "Investment Rules",
//         skillInstruction: `4â5 direct financial rules specific to this goal and risk profile:\n"Never [X] before [Y is in place]", "Always [rebalance when Z]"\nCovers: diversification, liquidity, tax, and one emotion-management rule.`,
//         deepInstruction: `4â5 direct rules specific to this goal.\n\nMANDATORY â 3 NAMED RISKS:\n"â  Risk: [specific financial failure mode â inflation gap, liquidity crunch, tax drag]. Mitigation: [named action]."\nNOTE: This is educational â not personalised financial advice. Recommend consulting a SEBI-registered advisor for specific decisions.`,
//         required: true,
//       },
//       {
//         name: "What Good Looks Like",
//         label: "What Good Looks Like",
//         skillInstruction: `3 criteria as "The strategy is on track whenâ¦" â measurable, date-anchored.\nFinal criterion: a long-term portfolio health signal.`,
//         deepInstruction: `3 criteria as "The strategy is on track whenâ¦"\n\n${framework === "strategic"
//           ? `"**12-month checkpoint:** [specific portfolio milestone]. If not on track, [specific rebalancing action]."\n"**Goal milestone:** [corpus or income target with number]."\n"**What comes next:** [next financial goal to activate after this one is on track]."` 
//           : `Final criterion: a portfolio health signal specific to this goal and timeline.`}`,
//         required: true,
//       },
//     ];
//     if (isDeepMode) {
//       sections.push({
//         name: "Next 3 Actions",
//         label: "Your Next 3 Actions",
//         skillInstruction: null,
//         deepInstruction: `3 specific financial actions to start immediately:\n1. [Foundation action â emergency fund or insurance check] â you alone â this week\n2. [Account setup action â specific platform/broker] â you alone â Day 3\n3. [First investment action â specific instrument + amount] â you alone â by end of Week 1\n\nFormat: "N. [Specific action] â [who] â [deadline]"\nNOTE: Consult a SEBI-registered advisor before executing.`,
//         required: true,
//       });
//     }
//     return sections;
//   }

//   // ââ CAREER / JOB ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
//   if (intentCategory === "career_job") {
//     const sections = [
//       {
//         name: "Expert Role",
//         label: "Your Expert Role",
//         skillInstruction: `Specific career/HR expert identity â industry specialisation, years, ONE job-search or career-development principle you always apply first.\nName the most overlooked factor in getting hired for this type of role.`,
//         deepInstruction: `Career expert identity â industry, methodology, experience.\n\nâ  NON-OBVIOUS MISTAKE: "The biggest mistake I see in [this career move] is [specific error experienced job-seekers still make]." Why â cost (rejection/missed opportunities) â fix.\nâ¡ TRADE-OFF: "The central trade-off is [speed vs targeting / breadth vs depth / visible achievements vs soft skills]." What to prioritise here.\nâ¢ COUNTER-INTUITIVE ORDERING: What to optimise before updating the resume.`,
//         required: true,
//       },
//       {
//         name: "Career Goal",
//         label: "Career Goal & Starting Point",
//         skillInstruction: `One paragraph: exact career move (role + seniority + industry), current position/background, and the single most important thing to demonstrate to get this role.\nWeave in timeline and any constraints.`,
//         deepInstruction: `One paragraph: target role + seniority + industry, current background, primary hiring signal to develop.\n${hasUserAnswers ? "MANDATE: Reference the user's stated experience, target role, and timeline from their answers." : ""}`,
//         required: true,
//       },
//       {
//         name: "Core Focus Areas",
//         label: "Your Core Focus Areas",
//         skillInstruction: `3â5 bullets â named job-search workstreams:\n"â¢ [Workstream]: [specific output â resume section/portfolio piece/network action]"\nBAN: "Improve your skills" â name the specific skill and how to demonstrate it.`,
//         deepInstruction: `3â5 bullets â named workstreams:\n"â¢ [Workstream]: [specific output] â signal: [what this proves to a hiring manager]"\nBAN vague actions. Name the exact artefact or demonstration.`,
//         required: true,
//       },
//       {
//         name: "How to Approach This",
//         label: "Job Search Strategy",
//         skillInstruction: `3â4 phases with timeframes.\nFormat: **[Phase Name] ([timeframe]):** [actions] â Output: [named deliverable â resume version/portfolio/outreach list]\nPhase 1 = positioning before applications start.`,
//         deepInstruction: `3â4 phases:\n**[Phase Name] ([timeframe]):** [actions] â Deliverable: [named output]\nPhase 1: positioning + materials â must be done before any applications go out.\n${framework === "strategic" ? "Final phase: MANDATORY â what happens after the role is secured (90-day plan, performance acceleration)." : ""}`,
//         required: true,
//       },
//       {
//         name: "Key Numbers",
//         label: "Job Search Benchmarks",
//         skillInstruction: `Markdown table: applications per week / response rate benchmark / interview conversion rate / typical hiring timeline / offer negotiation success rate.\nAll numbers realistic for this role level and industry.`,
//         deepInstruction: `Markdown table of job-search metrics.\nFormat: | Parameter | Benchmark |\nMust include: applications per week, response rate, interview rate, typical hiring timeline, salary range for target role.\n${hasUserAnswers ? "MANDATE: Include user's current salary as 'Current baseline' if stated." : ""}`,
//         required: true,
//       },
//       {
//         name: "Ground Rules",
//         label: "Job Search Rules",
//         skillInstruction: `4â5 direct job-search rules:\n"Never [apply without X]", "Always [customise Y per application]"\nCovers: application quality, LinkedIn optimisation, interview prep, salary negotiation.`,
//         deepInstruction: `4â5 direct rules for this career move.\n\nMANDATORY â 3 NAMED RISKS:\n"â  Risk: [specific job-search failure mode â ghosting, wrong positioning, weak portfolio]. Mitigation: [named action]."\nCovers: application quality, network leverage, interview execution.`,
//         required: true,
//       },
//       {
//         name: "What Good Looks Like",
//         label: "What Good Looks Like",
//         skillInstruction: `3 criteria as "The job search is working whenâ¦" â observable milestones.\nFinal criterion: the offer signal, not just activity.`,
//         deepInstruction: `3 criteria as "The search is working whenâ¦"\n\n${framework === "strategic"
//           ? `"**30-day milestone:** [specific activity or response metric]. If not hit, [specific tactic change]."\n"**60-day milestone:** [interview stage reached]."\n"**What comes next:** [how to prepare for and negotiate the offer]."` 
//           : `Final criterion: a response-rate or interview-rate signal that confirms the positioning is working.`}`,
//         required: true,
//       },
//     ];
//     if (isDeepMode) {
//       sections.push({
//         name: "Next 3 Actions",
//         label: "Your Next 3 Actions",
//         skillInstruction: null,
//         deepInstruction: `3 immediate job-search actions:\n1. [Positioning action â update or reframe the core value proposition] â you alone â today\n2. [Materials action â specific resume or portfolio update] â you alone â Day 3\n3. [Outreach action â first 10 specific companies or contacts] â you alone â by end of Week 1\n\nFormat: "N. [Specific action] â [who] â [deadline]"`,
//         required: true,
//       });
//     }
//     return sections;
//   }

//   // ââ GENERIC FALLBACK (business_strategy, data_analytics, health_wellness, ââââ
//   // ââ education_learning, design_ux, event_planning, general_project, etc.) ââââ
//   const genericSections = [];

//   genericSections.push({
//     name: "Expert Role",
//     label: "Your Expert Role",
//     skillInstruction: `Specific expert identity â name specialisation, years, ONE concrete method or rule you always apply first.\nPattern: "You are a [role] with [X] years of [specific experience]. Your first move is always [named action] because [concrete reason]."\nNEVER: "You are an expert with extensive experience" â too generic.`,
//     deepInstruction: `Vivid, specific expert identity. Name specialisation, years, ONE concrete method or rule.\n\nThis section must contain ALL THREE in flowing prose:\n\nâ  COUNTER-INTUITIVE ORDERING:\n"Most [people/practitioners] do [X] first â that's the wrong order. [X] is a distraction until [Y] is solved. Start with [Y] because [specific mechanism]."\n\nâ¡ NON-OBVIOUS MISTAKE (3â4 sentences â expanded):\n"The biggest mistake I see here is [SPECIFIC mistake that experienced practitioners still make â not beginner-obvious]."\nThen: why it happens â what it costs (specific consequence) â the fix (named alternative action).\n\nâ¢ UNCOMFORTABLE TRADE-OFF (2â3 sentences):\n"The central trade-off here is [X vs Y]. [Why X is the trap]. [What to do instead and why]."`,
//     required: true,
//   });

//   genericSections.push({
//     name: "What You're Here to Do",
//     label: "What You're Here to Do",
//     skillInstruction: `One tight paragraph: exact goal, current starting point, success in concrete terms.\nWeave in detected constraints. Be specific about the outcome. Include one direct assertion.`,
//     deepInstruction: `One tight paragraph: exact goal, starting point, success in concrete terms.\n${hasUserAnswers ? "MANDATE: Reference the user's specific situation from their answers â their numbers, stage, constraints." : "Weave in detected constraints naturally."}`,
//     required: true,
//   });

//   genericSections.push({
//     name: "Core Focus Areas",
//     label: "Your Core Focus Areas",
//     skillInstruction: `3â5 bullets. Each: named workstream + concrete output.\nFormat: "â¢ [Named Area]: [specific action/output â what gets built or decided]"\nBANNED:\nâ¢ "Monitor and analyze performance" â name the specific metric + action it triggers\nâ¢ "Ensure alignment with goals" â name a deliverable or decision`,
//     deepInstruction: `3â5 bullets â distinct, named workstreams with concrete outputs.\nBANNED (rewrite if any appear):\nâ¢ "Monitor and analyze performance" â name the specific metric + the action it triggers\nâ¢ "Integrate user feedback" â name the specific mechanism\nâ¢ "Ensure alignment with goals" â name a deliverable or decision`,
//     required: true,
//   });

//   genericSections.push({
//     name: "How to Approach This",
//     label: "How to Approach This",
//     skillInstruction: framework === "procedural" || framework === "operational"
//       ? `NUMBERED STEPS â not phases with week/month labels.\nFormat: **Step N â [Step Name]:** [what to do] â Visible result: [what you can verify/test]\nEach step produces something runnable, visible, or testable.`
//       : `3â4 phases with **bold phase label** + timeframe.\nFormat: **[Phase Name] ([timeframe]):** [actions] â Output: [named deliverable]\nUse realistic week/sprint timing. Each phase has ONE named output.\nBANNED phase verbs: 'explore', 'consider', 'look into', 'research options'`,
//     deepInstruction: framework === "procedural"
//       ? `NUMBERED STEPS â not phases.\nFormat: **Step N â [Step Name]:** [what to do] â Visible result: [what you can verify/test]\nEach step must leave the reader with something runnable, visible, or testable.\nBANNED: 'Day 1', 'Week 1', 'Phase', '30-day', '90-day', milestone language.`
//       : framework === "operational"
//       ? `ORDERED DIAGNOSTIC SEQUENCE.\nFormat: **Step N â [Check]:** [command or action] â Pass: [what it means] â Fail: [what it means]\nOrder steps from most-likely root cause to least likely.\nBANNED: timeline language, phases, milestones.`
//       : framework === "phased"
//       ? `3â4 implementation phases:\nFormat: **[Phase Name] ([timeframe]):** [what happens] â Deliverable: [named, concrete output]\nPhase timeframes (e.g., Week 1â2). Final phase = what user does AFTER project is complete.\nBANNED: 30-day milestones, 90-day KPI targets, business revenue milestones in phase labels.`
//       : `MANDATORY: 3â4 phases:\nFormat: **[Phase Name] ([timeframe]):** [what happens] â Deliverable: [named, concrete output]\nPHASE STRUCTURE:\nâ¢ Phase 1: Foundation â the thing BEFORE everything else\nâ¢ Phase 2: Build/execute â core work\nâ¢ Phase 3: Launch/validate â first real-world test with a metric\nâ¢ PHASE 4 â MANDATORY POST-GOAL PHASE: What happens AFTER the main goal.\n  NOT optional. A real plan always addresses "then what?"\nBANNED: 'explore', 'consider'. Every phase has a named output.`,
//     required: true,
//   });

//   genericSections.push({
//     name: "Key Numbers",
//     label: "Key Numbers & Benchmarks",
//     skillInstruction: `Markdown table, 4â6 rows. Every row has a real, specific number.\nFormat: | Parameter | Target / Benchmark |\nPull numbers ONLY from DOMAIN BENCHMARKS above. Never invent.\nBANNED rows: "Success metric: achieve project goals", any row with a made-up placeholder.`,
//     deepInstruction: framework === "strategic"
//       ? `Markdown table. Every row has a real, specific number. No ranges wider than 3Ã.\nFormat: | Parameter | Target / Benchmark |\n4â6 rows from DOMAIN BENCHMARKS above.\n${hasUserAnswers ? "MANDATE: If user provided a current metric, it appears as a 'Current baseline' row." : ""}\nAdd 30-day and 90-day target rows â must match milestones in What Good Looks Like exactly.\nBANNED: invented numbers, vague placeholders.`
//       : `Markdown table â real, specific numbers relevant to this ${framework === "operational" ? "resolution process" : "implementation"}.\nFormat: | Parameter | Target / Benchmark |\n${hasUserAnswers ? "MANDATE: If user provided a current metric, it appears as a 'Current baseline' row." : ""}\nBANNED: invented numbers, 30-day milestones, 90-day targets, business KPIs (this is a ${framework} task).`,
//     required: true,
//   });

//   genericSections.push({
//     name: "What to Deliver",
//     label: "What to Deliver",
//     skillInstruction: `Every deliverable: the thing + its format + its purpose in one line. Nothing vague.`,
//     deepInstruction: `Every deliverable: the thing + its format + its purpose. Nothing vague.\nFor each: name, format/medium, and how it will be used by the end user.`,
//     required: true,
//   });

//   genericSections.push({
//     name: "Ground Rules",
//     label: "Ground Rules",
//     skillInstruction: `4â5 direct rules as 'Never X', 'Always Y', or 'If Z then W'.\nEach rule addresses a real failure mode for THIS specific domain.\nInclude the 2â3 most common failure modes and the rule that prevents each.`,
//     deepInstruction: `4â5 direct rules as 'Never X', 'Always Y', or 'If Z then W'.\n\nMANDATORY â 3 NAMED RISKS with ${framework === "strategic" ? "Week 1" : "immediate"} mitigations:\nFormat: "â  Risk: [specific failure mode in this domain â not generic]. Mitigation: [one concrete ${framework === "strategic" ? "Week 1" : "first"} action]."\n\nDOMAIN EXPERT TEST per risk: "Would a generalist identify this without domain experience?" If yes â too generic.\nBAD: "â  Risk: Poor planning leads to delays."\nGOOD pattern: "â  Risk: [Specific mechanism that fails at THIS stage in THIS domain] â [consequence with number/timeline]. Mitigation: [Named document, tool, or decision]."\nEach of the 3 risks must be a DIFFERENT type of failure (e.g. technical, process, market/audience).\n${hasUserAnswers ? "MANDATE: At least 2 of 3 risks must name a specific detail from the user's answers." : ""}`,
//     required: true,
//   });

//   genericSections.push({
//     name: "What Good Looks Like",
//     label: "What Good Looks Like",
//     skillInstruction: `3 criteria written as "The work must [observable, measurable outcome]."\nEach criterion verifiable by a third party. If you cannot measure it, rewrite it.\nMake criteria specific to this domain â not "The work must be comprehensive and high quality."`,
//     deepInstruction: framework === "strategic"
//       ? `MANDATORY â all 4 elements:\n\n1. 3 criteria as "The work mustâ¦" â concrete, observable, measurable by a third party.\n\n2. "**30-day milestone:** [specific number or shipped artifact]. If not hit, [specific corrective action] immediately."\nGOOD: "30-day milestone: 10 paying customers at >2% conversion. If not hit, pause paid ads and focus entirely on CRO."\nBAD: "30-day milestone: Good early progress." (no number, no corrective action)\n\n3. "**90-day milestone:** [sustained outcome with a number â proof the strategy is working]."\n\n4. "**What comes next:** [specific named project, tool, or system to build â NOT a vague process]."\n\n${hasUserAnswers ? "MANDATE: Use the user's specific numbers from their answers to set milestones." : ""}`
//       : `3 criteria as "The work mustâ¦" â concrete, observable, measurable by a third party.\nEach criterion verifiable by a third party.\n${framework === "phased"
//         ? `Final criterion: a concrete completion signal.\nDo NOT include 30-day milestones, 90-day goals, or business KPI targets.`
//         : `Final criterion: a resolution signal â what passing looks like.\nDo NOT include milestones, day/week targets, or business metrics.`}`,
//     required: true,
//   });

//   if (isDeepMode) {
//     genericSections.push({
//       name: "Next 3 Actions",
//       label: "Your Next 3 Actions",
//       skillInstruction: null,
//       deepInstruction: `MANDATORY â 3 actions only. Each must:\nâ¢ Name the specific task (the actual thing, not a category)\nâ¢ Name who does it (user, developer, "you alone")\nâ¢ Name the deadline (${framework === "strategic" || framework === "phased" ? "Day 1, Day 3, by end of Week 1" : "immediately, within the hour, before anything else"} â not "soon" or "ASAP")\n\nFormat: "1. [Specific action] â [who] â [deadline]"\nGOOD: "1. [Named first action with a specific output] â you alone â by Day 3"\nBAD: "1. Start working on your strategy" (not specific, no owner, no deadline)\n\nThese 3 actions are the bridge between reading this brief and actually starting.`,
//       required: true,
//     });
//   }

//   return genericSections;
// }

// // âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
// // JSON TEMPLATE + SECTION WRITING BLOCK
// // âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ

// function buildJsonTemplate(schema) {
//   const sectionPlaceholders = schema
//     .map(s => `**${s.label}**\\n...`)
//     .join("\\n\\n");
//   return `{"optimizedText":"${sectionPlaceholders}","suggestions":["one-line alt 1","one-line alt 2","one-line alt 3"]}`;
// }

// function buildSectionWritingBlock(schema, isDeepMode) {
//   const mode = isDeepMode ? "DEEP MODE" : "SKILL MODE";
//   const count = schema.length;
//   const instructionKey = isDeepMode ? "deepInstruction" : "skillInstruction";

//   const sectionBlocks = schema.map(s => {
//     const instruction = s[instructionKey] || s.skillInstruction || "";
//     return `**${s.label}**\n${instruction}`;
//   }).join("\n\n");

//   return `ââââââââââââââââââââââââââââââââââââââââââââââââââââ
// CRITICAL â READ THIS BEFORE WRITING ANYTHING:

// You are writing a SYSTEM PROMPT for another AI (ChatGPT).
// You are NOT answering the user. You are NOT writing the recipe/plan/guide itself.

// â WRONG â this is a direct answer (do NOT write this):
// **Ingredients**
// â¢ 2 cups rice, 1 cup urad dal, 1/2 tsp fenugreek seeds...
// **Step-by-Step Method**
// Step 1 â Soak the rice for 6 hours in water.

// â CORRECT â this is a system prompt (write THIS):
// **Ingredients**
// You are a chef. Provide the user with a complete ingredient list for this dish grouped as:
// â¢ Main ingredients â exact quantities for the stated serving size
// â¢ Spices & Seasonings â in grams or tsp
// â¢ Garnish â optional items only
// **Step-by-Step Method**
// You are a chef. Walk the user through cooking this dish with numbered steps.
// Each step: **Step N â [Name]:** [one clear action] â Done when: [sensory signal]

// RULE: Every line must be a directive to the other model â "You are...", "Provide the user...", "Walk the user...", "Instruct the user..." â NEVER write actual content.

// ââââââââââââââââââââââââââââââââââââââââââââââââââââ
// WRITE THESE ${count} SECTIONS IN ORDER [${mode}]:
// ââââââââââââââââââââââââââââââââââââââââââââââââââââ

// ${sectionBlocks}`;
// }

// // âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
// // buildEnrichedSystemPrompt
// // âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
// async function buildEnrichedSystemPrompt(userText, options = {}) {
//   const perfHandle = perfStart("buildEnrichedSystemPrompt");

//   const { domainId, subcategoryId, subcategoryLabel, deepAnswers, skillMode, deepMode, resolvedDomain } = options;

//   const modeLabel = !skillMode ? "Normal Mode" : deepMode ? "Deep Mode" : "Skill Mode";
//   console.log(`[skillEngine] buildEnrichedSystemPrompt | mode=${modeLabel} | domain=${domainId || "auto"} | text="${userText.slice(0, 60)}"`);

//   // ââ Resolve domain âââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
//   let domain = null;
//   if (domainId) domain = DOMAINS.find(d => d.id === domainId) || null;

//   if (!domain) {
//     const namedTool = detectNamedTool(userText);
//     if (namedTool?.id === "ai_image_gen") {
//       domain = DOMAINS.find(d => d.id === "ai_image_gen") || null;
//     }
//   }

//   if (!domain) domain = detectDomain(userText);

//   if (!domain) {
//     if (resolvedDomain) {
//       domain = resolvedDomain;
//       console.log(`[skillEngine] Using pre-resolved domain: "${domain.domainName || domain.id}"`);
//     } else {
//       console.log(`[skillEngine] No hardcoded domain matched â triggering AI classification for: "${userText.slice(0, 60)}"`);
//       domain = await getDynamicDomain(userText);
//       if (domain) {
//         console.log(`[skillEngine] Classification resolved to: "${domain.domainName || domain.id}"`);
//       }
//     }
//   }

//   if (!domain) {
//     const { UNIVERSAL_FALLBACK_DOMAIN } = require("./constants");
//     domain = UNIVERSAL_FALLBACK_DOMAIN;
//     console.log("[skillEngine] Using UNIVERSAL_FALLBACK_DOMAIN as final safety net");
//   }

//   // ââ Intent flags âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
//   const isWebsite  = detectWebsiteBuildIntent(userText);
//   const isTutorial = detectTutorialIntent(userText) && !isWebsite;
//   const hasEduCtx  = /\b(course|learn|teach|student|education|tutorial|lesson)\b/i.test(userText);
//   const isHybrid   = isWebsite && hasEduCtx;
//   const isAIImage  = domain?.id === "ai_image_gen";

//   // ââ Mode flags âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
//   const isSkillMode = !!(skillMode && !deepMode);
//   const isDeepMode  = !!(skillMode && deepMode);

//   // ââ Request framework ââââââââââââââââââââââââââââââââââââââââââââââââââââââ
//   const requestFramework = (isSkillMode || isDeepMode)
//     ? classifyRequestFramework(userText, domain?.id || null, isTutorial, isWebsite, isAIImage)
//     : "strategic";

//   // ââ NORMAL MODE ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
//   if (!skillMode) {
//     const prompt = `You are a helpful AI assistant. Transform the user's raw request into a clear, well-structured prompt that will produce high-quality, useful output.

// USER REQUEST: "${userText}"

// OUTPUT FORMAT â return a JSON object with exactly two keys:
//   "optimizedText": a clear, improved version of the user's prompt as a single string
//   "suggestions":   array of 3 alternative one-line phrasings

// Return STRICT JSON ONLY â no markdown fences, no extra text:
// {"optimizedText":"...","suggestions":["alt1","alt2","alt3"]}`;
//     perfEnd(perfHandle);
//     return prompt;
//   }

//   // ââ Constraints ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
//   const autoConstraints = extractConstraints(userText);

//   const userAnswers = (deepAnswers && typeof deepAnswers === "object")
//     ? Object.entries(deepAnswers)
//         .filter(([, v]) => v && String(v).trim())
//         .map(([k, v]) => `â¢ ${k.replace(/_/g, " ")}: ${v}`)
//     : [];

//   const allConstraints  = { ...autoConstraints, ...(deepAnswers || {}) };
//   const constraintLines = Object.entries(autoConstraints)
//     .filter(([, v]) => v && String(v).trim())
//     .map(([k, v]) => `${k.replace(/_/g, " ")}: ${v}`);

//   // ââ Resolve role + knowledge + tone âââââââââââââââââââââââââââââââââââââââ
//   let expertRole, domainKnowledge, expertTone;

//   if (isAIImage) {
//     expertRole      = domain.role;
//     domainKnowledge = domain.knowledge;
//     expertTone      = domain.tone;
//   } else if (isHybrid) {
//     expertRole      = "hybrid EdTech Product Builder and full-stack developer with 10+ years shipping online learning platforms (Next.js, Supabase, Stripe) â you understand both the engineering and what makes students actually complete courses";
//     const ed        = DOMAINS.find(d => d.id === "edtech_product");
//     domainKnowledge = (domain?.knowledge || "") + (ed?.knowledge || "");
//     expertTone      = "technical, product-focused, launch-oriented";
//   } else if (isTutorial) {
//     const tut       = DOMAINS.find(d => d.id === "technical_tutorial");
//     expertRole      = tut?.role || "senior technical educator and developer advocate with 10+ years creating project-based coding tutorials";
//     domainKnowledge = tut?.knowledge || "";
//     expertTone      = "clear, encouraging, hands-on, beginner-friendly";
//   } else if (domain) {
//     expertRole      = domain.role;
//     domainKnowledge = domain.knowledge;
//     expertTone      = domain.tone;
//   } else {
//     expertRole      = "expert multi-domain AI consultant with deep knowledge across business, technology, marketing, education, finance, and creative domains";
//     domainKnowledge = "";
//     expertTone      = "professional, clear, immediately actionable";
//   }

//   // ââ Travel agency business building override âââââââââââââââââââââââââââââââ
//   const isTravelAgencyBuild = detectBusinessBuildingIntent(userText) &&
//     /\b(travel|tour|tourism)\b/i.test(userText);

//   if (isTravelAgencyBuild) {
//     expertRole = "boutique travel agency founder and D2C tourism business strategist with 12+ years launching niche travel brands â expert in positioning, safety-first design for women travellers, digital acquisition, and scaling from solo operator to team";
//     domainKnowledge = `TRAVEL AGENCY STARTUP BENCHMARKS:
// - Business registration (India): â¹5,000ââ¹15,000 (sole proprietorship or LLP)
// - IATA accreditation: optional for niche agencies; required for ticketing commission
// - Niche positioning premium: 30â50% higher margins vs generic travel agencies
// - Solo women travel market (India): growing 25% YoY â highest NPS segment in travel
// - Customer acquisition: Instagram + SEO drives 60â70% of bookings for niche operators
// - Average booking value: â¹25,000ââ¹80,000 per solo woman traveller (domestic trip)
// - First 10 customers: referral-only; first 50: organic content + community
// - Safety infrastructure: 24/7 emergency contact + vetted accommodation policy = #1 trust signal
// - Website conversion: booking inquiry form converts at 3â8% with testimonials + itinerary samples
// - Scaling milestone: â¹10L MRR before hiring first operations coordinator`;
//     expertTone = "entrepreneurial, safety-conscious, niche-market-savvy, community-first";
//     console.log(`[skillEngine] Travel agency business build detected â injecting business strategy role`);
//   }

//   const expertRoleShort = expertRole.split(" with")[0];

//   // ââ Detect intent category âââââââââââââââââââââââââââââââââââââââââââââââââ
//   const intentCategory = detectIntentCategory(
//     userText, domain?.id || null, isTutorial, isWebsite, isAIImage,
//     requestFramework
//   );

//   console.log(`[skillEngine] intentCategory=${intentCategory} | framework=${requestFramework}`);

//   if (intentCategory === "recipe_cooking") {
//     expertRole      = "culinary expert and home cooking educator with 12+ years creating accessible, authentic recipes â specialisation: breaking down traditional techniques for home cooks without compromising flavour.";
//     domainKnowledge = `CULINARY BENCHMARKS:\n- Sensory doneness cues per step (colour / texture / aroma)\n- 6-8 numbered steps optimal for home cooks\n- Flag the 2 steps where most cooks go wrong\n- Group ingredients: Main / Spices & Seasonings / Garnish\n- Serving size: 4-6 servings standard\n- Fridge shelf life: 2-4 days`;
//     expertTone      = "warm, precise, instructional";
//     console.log("[skillEngine] recipe_cooking: culinary override applied");
//   }
//   if (intentCategory === "fitness_training") {
//     expertRole      = "certified strength and conditioning coach with 10+ years programming for beginner to intermediate athletes.";
//     domainKnowledge = `FITNESS BENCHMARKS:\n- Progressive overload: increase load when all reps complete with 2 RIR for 2 consecutive sessions\n- Protein: 1.6-2.2g per kg body weight â give the formula, never pre-fill grams`;
//     expertTone      = "direct, evidence-based, motivating";
//     console.log("[skillEngine] fitness_training: coaching override applied");
//   }

//   // ââ Build dynamic section schema â NOW PASSES userText (v3) âââââââââââââââ
//   const sectionSchema = buildSectionSchema(
//     intentCategory, requestFramework, isDeepMode, isTutorial, isWebsite, isAIImage,
//     allConstraints, userAnswers, userText  // â v3: userText added as 9th argument
//   );

//   console.log(`[skillEngine] section schema: [${sectionSchema.map(s => s.name).join(", ")}]`);

//   // ââ Shared blocks ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
//   const techChoice = allConstraints.technology || null;

//   const tutorialTechBlock = isTutorial ? `
// BEFORE WRITING â COMMIT TO TWO DECISIONS:

// Decision 1 â Technology:
// ${techChoice
//   ? `User specified: ${techChoice}. Build the entire tutorial around this. Do not hedge.`
//   : `Pick the single most appropriate technology:
//    â¢ Absolute beginner â HTML + CSS (portfolio page, ~2â3 hr build)
//    â¢ Knows HTML/CSS â Vanilla JavaScript (quiz or to-do app, ~3â4 hr build)
//    â¢ Knows JS basics â React (weather app or GitHub profile viewer, ~4â6 hr build)
//    â¢ Data/backend interest â Python (dashboard or web scraper, ~3â5 hr build)
//    â¢ Mobile â React Native + Expo (habit tracker, ~5â8 hr build)
//    COMMIT to one. Name it explicitly.`
// }

// Decision 2 â Mini-project (Deep Mode: NOT a generic portfolio, to-do list, or calculator):
// Name a SPECIFIC, DEPLOYABLE project: ${isDeepMode ? "completable in 1â2 weekends (6â12 hrs)" : "completable in one sitting (2â6 hrs)"}, GitHub/portfolio-ready.

// Deployment rules:
//   â¢ HTML/CSS/JS/React â Netlify or Vercel
//   â¢ Python web app â Render or Railway
//   â¢ Python data dashboard â Streamlit Cloud
//   â¢ React Native â Expo Go + EAS build
//   Never send Python to Vercel. Never send React to Heroku.

// State both decisions in "Your Expert Role" and carry through every section.
// ` : "";

//   const aiImageBlock = isAIImage ? `
// BEFORE WRITING â NOTE THE TOOL CONTEXT:
// Tool detected: ${allConstraints.tool || "Midjourney"}
// Platform/format: ${allConstraints.platform_type || "not specified â address in questions or assume Instagram 1:1"}
// Style direction: ${allConstraints.style || "not specified"}
// Experience level: ${allConstraints.skill_level || "not specified"}

// AI IMAGE GENERATION RULES (apply to every section):
// - Expert role, benchmarks, and ground rules must reference ${allConstraints.tool || "Midjourney"} specifically â not generic photography
// - Benchmarks table uses: prompt iterations, acceptance rate, aspect ratio, style consistency â NOT aperture or tripod specs
// - Ground rules reference tool-specific parameters (--style raw, --sref, --ar, --chaos)
// - Risks must be tool-specific failure modes (style drift, version defaults, catalogue inconsistency)
// - NEVER mention DSLR, camera settings, tripod, aperture, shutter speed, or physical lighting setups
// ` : "";

//   const subcategoryFocus = subcategoryLabel
//     ? `\nFOCUS: User selected "${subcategoryLabel}". Every section must serve this specific focus.\n`
//     : "";

//   const constraintsBlock = constraintLines.length > 0 ? `
// AUTO-DETECTED CONTEXT (weave into every section):
// ${constraintLines.map(l => `â¢ ${l}`).join("\n")}
// ` : "";

//   const userAnswersBlock = (isDeepMode && userAnswers.length > 0) ? `
// WHAT THE USER TOLD US (Deep Mode answers â reference DIRECTLY in output):
// ${userAnswers.join("\n")}
// ` : "";

//   const techDomains = [
//     "edtech_product","technical_tutorial","product_development","saas_product",
//     "cloud_devops","mobile_app_development","no_code_tools","data_science_ai",
//     "ai_automation","uiux_design","blockchain_web3","cybersecurity","ai_image_gen",
//     "backend_architecture","linkedin_automation","gamified_fitness_app",
//     "language_learning_app","ecommerce_store",
//   ];
//   const modernToolsBlock = (isWebsite || isTutorial || techDomains.includes(domain?.id)) && !isAIImage ? `
// TOOL PALETTE â recommend with one concrete reason per choice:
// Frontend:   Next.js 14, React 18, Vanilla JS, Tailwind CSS, shadcn/ui
// Backend/DB: Supabase (Postgres+Auth+Storage), Neon, PlanetScale, Prisma ORM
// Auth:       Supabase Auth, Clerk, Auth.js
// Payments:   Stripe (global), Razorpay (India-first)
// Video:      Mux or Bunny.net (NOT YouTube for gated content)
// Deploy:     Vercel (JS/TS), Railway or Render (Python/Node), Streamlit Cloud (dashboards)
// Mobile:     React Native + Expo, Flutter (brand-heavy)
// Analytics:  PostHog (open source), Mixpanel, GA4
// ` : "";

//   const knowledgeBlock = domainKnowledge
//     ? `\nDOMAIN BENCHMARKS (use these numbers â don't invent your own):\n${domainKnowledge}\n`
//     : "";

//   // ââ Build the JSON template from schema ââââââââââââââââââââââââââââââââââââ
//   const jsonTemplate = buildJsonTemplate(sectionSchema);

//   // ââ Section writing block from schema âââââââââââââââââââââââââââââââââââââ
//   const sectionWritingBlock = buildSectionWritingBlock(sectionSchema, isDeepMode);

//   // âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
//   // SKILL MODE â SYSTEM PROMPT
//   // âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
//   if (isSkillMode) {
//     const sectionCount = sectionSchema.length;
//     const headerExample = generateHeaderExample(sectionSchema);
//     const headerList = generateHeaderList(sectionSchema);
//     const requiredHeaders = sectionSchema.map(s => `**${s.label}**`).join('\n');

//     const prompt = META_SYSTEM_PROMPT_FENCE + `You are an expert prompt engineer. Transform the user's request into a structured SYSTEM PROMPT that will be used to instruct another model.

// â ï¸ CRITICAL: This is a SYSTEM PROMPT for another model.
// You are NOT answering the user directly.
// You are writing INSTRUCTIONS for how the other model should behave.

// BAD: "As a chef, I can guide you..."
// GOOD: "You are a chef. Your role is to guide users..."

// BAD: "You will need the following ingredients..."
// GOOD: "Generate a clear ingredients list for the user."

// BAD: "Step 1 â Marinate the Chicken..."
// GOOD: "Provide step-by-step cooking instructions in a clear sequence."

// OUTPUT FORMAT â NON-NEGOTIABLE:
// Return a JSON object with exactly two keys:
//   "optimizedText": one continuous string with all ${sectionCount} sections using **Bold Label** headers
//   "suggestions":   array of 3 alternative one-line phrasings

// WRONG: {"Your Expert Role":"...","What to Deliver":"..."}
// RIGHT: {"optimizedText":"${headerExample}","suggestions":["alt1","alt2","alt3"]}

// ââââââââââââââââââââââââââââââââââââââââââââââââââââ
// â ï¸ CRITICAL SECTION HEADER RULE â DO NOT CHANGE THESE:
// You MUST include EVERY section header exactly as shown below.
// Do NOT skip, rename, or rephrase any section header.

// ${requiredHeaders}

// For this request type (${intentCategory}), the headers MUST be exactly:
// ${headerList}

// Bold label format: **Section Name** on its own line, content below.
// No ## headers. No numbered sections.
// ââââââââââââââââââââââââââââââââââââââââââââââââââââ

// USER REQUEST: "${userText}"
// ${subcategoryFocus}${constraintsBlock}${tutorialTechBlock}${aiImageBlock}${knowledgeBlock}${modernToolsBlock}
// Tone of voice: ${expertTone}
// Expert to embody: ${expertRole}

// ââââââââââââââââââââââââââââââââââââââââââââââââââââ
// âââ MODE: SKILL MODE â Professional Practitioner Brief (SYSTEM PROMPT) âââ

// â ï¸ REMINDER: This is a SYSTEM PROMPT for another model. Every section must instruct the model on HOW TO BEHAVE, not provide the final answer to the user.

// PERSONA TO EMBODY: The model you are instructing should embody a ${expertRoleShort}. It has executed this type of work dozens of times. It does not hedge. It recommends. It prioritises. It names things specifically.

// RULES FOR THE MODEL TO FOLLOW:
// - Every section must serve the user's exact request â no generic filler
// - Each recommendation must be immediately actionable
// - Use practitioner-specific language â real tool names, actual numbers
// - Each phase must have a named, concrete output
// - Numbers and benchmarks must appear in at least 3 of the ${sectionCount} sections
// - Use domain knowledge benchmarks above â never invent numbers
// ${isTutorial
//   ? `â¢ Scope: ONE sitting (2â5 hrs). Not weeks. A tutorial is NOT a course.
// - Target: 1,500â2,200 words. State read time and build time SEPARATELY.
// - Every concept gets a runnable code example.`
//   : `â¢ Target: 580â740 words. Density over length.`
// }

// OPINION REQUIREMENT â ONE DIRECT ASSERTION PER SECTION:
// The model must include at least one statement written as direct fact, not suggestion.
// GOOD: "Don't use --v5 for product photography â --v6 with --style raw produces 3Ã more photorealistic outputs."
// GOOD: "Never start with paid ads at sub-â¹1L/month budget â organic content compounding is 3Ã more capital-efficient for the first 90 days."
// BAD:  "You may want to consider whether X is the right choice for you."
// One direct assertion per section. Short. No hedging.

// BANNED PHRASES (the model must rewrite anything containing these):
// "comprehensive","high-quality","ensure","consider","look into","robust",
// "leverage","best practices","it's important to","holistic","key takeaway",
// "various","multiple","a number of","in conclusion"

// ${sectionWritingBlock}

// ââââââââââââââââââââââââââââââââââââââââââââââââââââ
// Return STRICT JSON ONLY â no markdown fences, no preamble:
// ${jsonTemplate}`;

//     perfEnd(perfHandle);
//     return { prompt, sectionSchema };
//   }

//   // âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
//   // DEEP MODE â SYSTEM PROMPT
//   // âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ

//   const _fw = requestFramework;
//   const headerListDeep = generateHeaderList(sectionSchema);
//   const requiredHeadersDeep = sectionSchema.map(s => `**${s.label}**`).join('\n');

//   const reasoningChainBlock = `
// ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
// â  INTERNAL REASONING â COMPLETE ALL STEPS BEFORE WRITING ANY SECTION    â
// â  Steps 2, 3, 4 MUST surface explicitly in output sections.             â
// â  Step 2 assumptions â flag in Your Expert Role or Ground Rules.        â
// â  Step 3 trade-off â name explicitly in Your Expert Role.               â
// â  Step 4 risks â each becomes one â  Risk entry in Ground Rules.        â
// ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ

// REQUEST FRAMEWORK DETECTED: ${_fw.toUpperCase()}
// ${_fw === "strategic"  ? "â Full timeline structure: phases with week/month labels + 30-day + 90-day milestones + KPIs."        : ""}
// ${_fw === "phased"     ? "â Implementation phases with deliverables. NO long-horizon milestones or business KPIs."              : ""}
// ${_fw === "procedural" ? "â Step-by-step instructions. NO timeline language, NO milestones, NO weeks/months framing."           : ""}
// ${_fw === "operational"? "â Immediate action sequence. NO planning phases, NO milestones. Focus: resolution steps + root cause." : ""}

// Step 1 â SITUATION ANALYSIS:
// What is the user actually trying to achieve? What is their real starting point?
// ${_fw === "strategic"  ? "What would success look like in 90 days? What is the gap between where they are and where they need to be?" : ""}
// ${_fw === "phased"     ? "What does a successfully completed implementation look like? What are the key decision points along the way?" : ""}
// ${_fw === "procedural" ? "What is the end state after following these steps? What prior knowledge can the reader be assumed to have?" : ""}
// ${_fw === "operational"? "What is the exact problem? What are its likely root causes? What is the fastest path to resolution?" : ""}
// If the user gave Deep Mode answers, use those as the primary facts â not invented context.

// Step 2 â KEY ASSUMPTIONS (SURFACE IN OUTPUT):
// What am I assuming that could be wrong? List 2â3. If uncertain, flag explicitly:
// "This assumes you have X â if not, do Y instead." Do NOT silently assume.
// BAD: Assume user has existing email list without checking.
// GOOD: "I'm assuming no existing audience â if you have one, Week 1 changes from list-building to segmentation."

// Step 3 â TRADE-OFFS (NAME IN YOUR EXPERT ROLE):
// What is the single most important strategic trade-off? Name it explicitly in Your Expert Role.
// "The central trade-off is X vs Y â every [resource] spent on X before Y is fixed is [consequence]."

// Step 4 â RISKS (BECOME â  RISK ENTRIES):
// 3 most likely ways this engagement fails. NOT generic â named failure modes in THIS domain at THIS stage.
// If user gave Deep Mode answers, at least one risk references their specific situation.
// Each risk â one â  Risk entry in Ground Rules. They must match.

// Step 5 â ${_fw === "procedural" || _fw === "operational" ? "SEQUENCE PLAN" : "PHASED PLAN"}:
// ${_fw === "strategic"
//   ? `Correct sequence? Most people start with the wrong thing.
// Identify the counter-intuitive ordering. MANDATORY: the FINAL phase is a standalone POST-GOAL phase
// (what happens AFTER the main objective is achieved). NOT optional. NOT a parenthetical.`
//   : _fw === "phased"
//   ? `Correct implementation sequence? Break into 3â4 phases with clear start/end.
// Each phase has ONE named deliverable. The final phase is what the user does AFTER completion (next logical step).`
//   : _fw === "procedural"
//   ? `Correct step sequence? What order makes the concept click fastest?
// Identify the step most tutorials get wrong. Each step must produce a visible/testable result.`
//   : `Fastest resolution path? What should be checked first to eliminate the most likely cause?
// Name 3 investigation steps in order of likelihood. Each step has a pass/fail test.`
// }

// ${_fw === "strategic" ? `Step 6 â SUCCESS METRICS:
// 30-day and 90-day milestones â specific numbers or shipped artifacts. NOT "good progress".
// If user gave specific numbers in Deep Mode answers, use those as anchors.
// For each: corrective action if milestone is missed.

// MILESTONE LANGUAGE RULES:
// For business-building prompts: milestones must be startup metrics â first paying customer,
// website live date, first â¹X revenue, CAC, conversion rate, retention rate.
// BANNED milestone language: "make progress", "build momentum", "establish foundation",
// "continue growing", "solidify brand identity", "build presence".
// EXAMPLE GOOD: "30-day milestone: Website live + first 3 paid bookings. If not hit, shift from content to direct outreach â DM 50 travel communities."
// EXAMPLE BAD: "30-day milestone: Begin establishing your brand presence online."` : ""}

// Only after all steps above, write the output sections.
// `;

//   const deepModePersonaLine = {
//     strategic:   `battle-tested senior consultant who has delivered 50+ high-stakes engagements. You are known for being direct, spotting hidden risks, and giving advice that actually moves the needle.`,
//     phased:      `principal-level practitioner who has shipped 30+ complex implementations from zero to live. You cut through noise and clearly name the deliverable for every phase.`,
//     procedural:  `senior technical educator with 12+ years teaching complex concepts. You know exactly which step trips people and never let a concept land without a runnable example.`,
//     operational: `domain specialist and incident-response expert who has resolved hundreds of similar issues. You prioritize root-cause isolation over symptom-chasing.`,
//   }[requestFramework];

//   const sectionCount = sectionSchema.length;

//   const deepModeBlock = `
// âââ DEEP CONSULTANT MODE â Senior Strategy Engagement (SYSTEM PROMPT) âââ

// â ï¸ CRITICAL: This is a SYSTEM PROMPT for another model.
// You are NOT answering the user directly.
// You are writing INSTRUCTIONS for how the other model should behave, think, and structure its response.

// Every section must instruct the model on HOW TO BEHAVE, not provide the final answer.

// BAD: "I can guide you..."
// GOOD: "You are to act as a guide. Your role is to instruct the user..."

// BAD: "The biggest mistake I see here is..."
// GOOD: "You must warn the user about the biggest mistake..."

// BAD: "Plan to marinate your chicken..."
// GOOD: "Instruct the user to marinate the chicken..."

// PERSONA TO EMBODY: The model you are instructing is a ${deepModePersonaLine} It is a ${expertRoleShort}.

// ${userAnswers.length > 0
//   ? `The user gave specific context (see WHAT THE USER TOLD US above). The model must reference their exact numbers and situation in risks and actions. Generic advice when specific inputs exist is unacceptable.`
//   : ""}

// ââââââââââââââââââââââââââââââââââââââââââââââââââââ
// â ï¸ CRITICAL SECTION HEADER RULE â DO NOT CHANGE THESE:
// You MUST include EVERY section header exactly as shown below.
// Do NOT skip, rename, or rephrase any section header.

// ${requiredHeadersDeep}

// For this request type (${intentCategory}), the headers MUST be:
// ${headerListDeep}

// These headers are dynamic and change based on the domain.
// For a recipe request, they would be: Your Expert Role, Dish Overview, Ingredients, etc.
// For a travel request, they would be: Your Expert Role, Trip Overview, Itinerary, etc.
// For a fitness request, they would be: Your Expert Role, Training Overview, Weekly Programme, etc.

// ALWAYS use the headers provided above â never make up your own.
// ââââââââââââââââââââââââââââââââââââââââââââââââââââ

// ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
// DEPTH & QUALITY REQUIREMENTS (For the Model to Follow)
// ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ

// ANTI-GENERIC RULE:
// The model must never write generic advice like "be consistent", "plan properly", "monitor performance", or "ensure quality".
// Every recommendation must be specific â name tools, exact actions, mechanisms, or real numbers.

// DEPTH REQUIREMENT:
// Before writing any section, the model must ask:
// "Would an experienced practitioner in this field find this insight obvious or generic?"
// If yes â rewrite with more specificity, a real example, or a named mechanism.

// VOICE TRIGGERS â THE MODEL MUST INCLUDE ALL THREE:
// Each trigger must be a FULL PARAGRAPH (minimum 3â4 sentences).

// - "The biggest mistake I see here isâ¦"
//   The model must name a specific mistake even experienced people make. Explain why it happens + the cost + the fix.

// - "What most people get wrong isâ¦"
//   The model must identify something that looks correct but backfires. Explain the failure mechanism + what to do instead.

// - "Here's the uncomfortable truthâ¦"
//   The model must share a non-obvious insight that challenges common thinking. Explain the implication + give a direct recommendation.

// DIRECT ASSERTION RULE:
// Every major section must contain at least one statement written as a direct fact/opinion (not a soft suggestion).

// PER-SECTION MANDATE:
// - "Ground Rules" must contain exactly 3 named risks with specific mechanisms.
// - If user gave Deep Mode answers, the model must reference them in relevant sections.
// - ${requestFramework === "strategic" ? `"What Good Looks Like" must use the user's specific numbers for milestones.` : ""}

// TARGET WORD COUNT: ${
//   isTutorial ? "2,000â3,000 words" :
//   requestFramework === "strategic" ? "800â1,000 words (high density)" :
//   requestFramework === "phased" ? "500â800 words" :
//   requestFramework === "procedural" ? "400â600 words" :
//   "400â600 words"
// }

// BANNED WORDS: "comprehensive", "high-quality", "ensure", "consider", "robust", "leverage", "best practices", "holistic", "key takeaway".
// `;

//   const deepPrompt = META_SYSTEM_PROMPT_FENCE + `You are an expert prompt engineer. Transform the user's raw request into a rich, expert SYSTEM PROMPT that instructs another model on how to behave.

// â ï¸ CRITICAL: This is a SYSTEM PROMPT for another model.
// You are NOT answering the user directly.
// You are writing INSTRUCTIONS for how the other model should behave, think, and structure its response.

// OUTPUT FORMAT â NON-NEGOTIABLE:
// Return a JSON object with exactly two keys:
//   "optimizedText": one continuous string with all sections using **Bold Label** headers
//   "suggestions":   array of 3 alternative one-line phrasings

// WRONG: {"Your Expert Role":"...","What to Deliver":"..."}
// RIGHT: {"optimizedText":"**${sectionSchema[0]?.label || "Your Expert Role"}**\\nYou are...","suggestions":[...]}

// Bold label format: **Section Name** on its own line, content below. No ## headers. No numbered sections.

// ââââââââââââââââââââââââââââââââââââââââââââââââââââ

// USER REQUEST: "${userText}"
// ${subcategoryFocus}${constraintsBlock}${userAnswersBlock}${tutorialTechBlock}${aiImageBlock}${knowledgeBlock}${modernToolsBlock}${reasoningChainBlock}${deepModeBlock}
// Tone of voice: ${expertTone}
// Expert to embody: ${expertRole}

// ${sectionWritingBlock}

// ââââââââââââââââââââââââââââââââââââââââââââââââââââ
// Return STRICT JSON ONLY â no markdown, no extra text:
// ${jsonTemplate}`;

//   perfEnd(perfHandle);
//   return { prompt: deepPrompt, sectionSchema };
// }

// // âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
// // buildDetailedSystemPrompt (legacy alias)
// // âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
// async function buildDetailedSystemPrompt(userText, options = {}) {
//   return buildEnrichedSystemPrompt(userText, options);
// }

// // âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
// // validateDetailedOutput
// // âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
// function validateDetailedOutput(parsed, sectionSchema = null) {
//   if (parsed && typeof parsed === "object" && !parsed.optimizedText) {
//     const allSections = sectionSchema
//       ? sectionSchema.map(s => s.label)
//       : [...REQUIRED_SECTIONS_BASE, ...REQUIRED_SECTIONS_DEEP_ONLY];
//     const foundSections = allSections.filter(s => parsed[s] || parsed[s.toLowerCase()]);
//     if (foundSections.length >= 4) {
//       const rebuilt = foundSections
//         .map(s => `**${s}**\n${parsed[s] || parsed[s.toLowerCase()] || ""}`)
//         .join("\n\n");
//       parsed.optimizedText = rebuilt;
//       parsed.suggestions   = parsed.suggestions || [];
//       console.log(`[skillEngine] validateDetailedOutput: rebuilt flat JSON (${foundSections.length} sections)`);
//     }
//   }

//   if (parsed?.optimizedText && typeof parsed.optimizedText !== "string") {
//     try   { parsed.optimizedText = JSON.stringify(parsed.optimizedText); }
//     catch { parsed.optimizedText = String(parsed.optimizedText); }
//   }

//   const text = parsed?.optimizedText || "";
//   const isDeepOutput = sectionSchema
//     ? sectionSchema.some(s => s.name === "Next 3 Actions" && new RegExp(`\\*\\*${s.label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\*\\*`, "i").test(text))
//     : /\*\*Your Next 3 Actions\*\*/i.test(text);

//   let sectionsToCheck;
//   if (sectionSchema) {
//     sectionsToCheck = sectionSchema
//       .filter(s => s.required)
//       .map(s => s.label);
//   } else {
//     sectionsToCheck = isDeepOutput
//       ? [...REQUIRED_SECTIONS_BASE, ...REQUIRED_SECTIONS_DEEP_ONLY]
//       : REQUIRED_SECTIONS_BASE;
//   }

//   const missingSections = sectionsToCheck.filter(s => {
//     const escaped = s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
//     const pattern = new RegExp(`\\*\\*${escaped}\\*\\*`, "i");
//     return !pattern.test(text);
//   });

//   const thinSections = [];

//   if (isDeepOutput) {
//     const wordCount = text.split(/\s+/).filter(Boolean).length;

//     const hasTimeline  = /\b(30-day|90-day|week\s+\d|month\s+\d)\b/i.test(text);
//     const hasSteps     = /\*\*Step\s+\d/i.test(text);
//     const hasDiagnosis = /\b(root\s+cause|diagnos|resolution|pass\/fail)\b/i.test(text);

//     const detectedFramework =
//       hasDiagnosis && !hasTimeline ? "operational" :
//       hasSteps     && !hasTimeline ? "procedural"  :
//       hasTimeline                  ? "strategic"   :
//       "phased";

//     const MIN_WORDS = {
//       strategic:   900,
//       phased:      700,
//       procedural:  500,
//       operational: 300,
//     }[detectedFramework] ?? 900;

//     const TARGET_RANGE = {
//       strategic:   "1,100â1,600",
//       phased:      "800â1,100",
//       procedural:  "600â900",
//       operational: "400â600",
//     }[detectedFramework] ?? "1,100â1,600";

//     if (wordCount < MIN_WORDS) {
//       const allPresent = sectionsToCheck.filter(s => {
//         const escaped = s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
//         return new RegExp(`\\*\\*${escaped}\\*\\*`, "i").test(text);
//       });

//       for (const sectionName of allPresent) {
//         const escaped = sectionName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
//         const sectionMatch = text.match(
//           new RegExp(`\\*\\*${escaped}\\*\\*\\n([\\s\\S]*?)(?=\\*\\*[A-Z]|$)`, "i")
//         );
//         if (sectionMatch) {
//           const sectionWords = sectionMatch[1].trim().split(/\s+/).filter(Boolean).length;
//           if (sectionWords < 60) thinSections.push(sectionName);
//         }
//       }

//       const expertRoleLabel = sectionSchema
//         ? (sectionSchema.find(s => s.name === "Expert Role")?.label || "Your Expert Role")
//         : "Your Expert Role";
//       if (!thinSections.includes(expertRoleLabel)) thinSections.push(expertRoleLabel);

//       missingSections.push(
//         `__word_count__ (~${wordCount} words â ${detectedFramework} framework minimum ${MIN_WORDS}, target ${TARGET_RANGE}. ` +
//         `Expand Expert Role section with the full persona + 3 voice trigger paragraphs. ` +
//         `Expand each risk with domain-specific consequences. Every section needs 2â3 sentences of reasoning, not just a headline.)`
//       );
//     }
//   }

//   return { isValid: missingSections.length === 0, missingSections, thinSections };
// }

// // âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
// // buildWordCountPatchPrompt
// // âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
// function buildWordCountPatchPrompt(existingOutput, thinSections, userText, suggestions = "[]", sectionSchema = null) {
//   const targetList = thinSections.length > 0
//     ? thinSections.map(s => `â¢ **${s}**`).join("\n")
//     : sectionSchema
//       ? sectionSchema.slice(0, 3).map(s => `â¢ **${s.label}**`).join("\n")
//       : "â¢ **Your Expert Role**\nâ¢ **Ground Rules**\nâ¢ **How to Approach This**";

//   const expertRoleLabel = sectionSchema
//     ? (sectionSchema.find(s => s.name === "Expert Role")?.label || "Your Expert Role")
//     : "Your Expert Role";

//   const groundRulesLabel = sectionSchema
//     ? (sectionSchema.find(s => s.name === "Ground Rules")?.label || "Ground Rules")
//     : "Ground Rules";

//   return `You are editing an existing AI prompt brief. The structure and sections are correct but some sections are too short.

// ORIGINAL USER REQUEST: "${userText}"

// EXISTING BRIEF (modify in-place â do NOT change section order, labels, or structure):
// ${existingOutput}

// ââââââââââââââââââââââââââââââââââââââââââââââââââââ
// TASK â EXPAND ONLY THESE SECTIONS (leave all others exactly as written):
// ${targetList}

// EXPANSION RULES:
// â¢ Each expanded section must reach at least 80 words of substantive content
// â¢ For **${expertRoleLabel}**: add all 3 voice triggers if missing â
//     "The biggest mistake I see here isâ¦" (3â4 sentences)
//     "What most people get wrong isâ¦" (3â4 sentences)  
//     "Here's the uncomfortable truthâ¦" (2â3 sentences)
// â¢ For **${groundRulesLabel}**: expand each â  Risk with a specific mechanism + consequence + named mitigation
// â¢ For any other thin section: add 2â3 sentences of domain-specific reasoning â real numbers, named tools, concrete actions
// â¢ BANNED: "comprehensive", "high-quality", "ensure", "robust", "best practices", "leverage"
// â¢ Keep every other section word-for-word identical

// Return STRICT JSON ONLY â same shape as the input:
// {"optimizedText":"[full brief with expanded sections, all **Bold Labels** preserved]","suggestions":${suggestions}}`;
// }

// // âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
// // buildRetryPrompt
// // âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
// function buildRetryPrompt(originalUserText, badOutput, missingSections, isDeepMode = false, isSkillMode = false, sectionSchema = null) {
//   const outputText = typeof badOutput === "string" ? badOutput : JSON.stringify(badOutput || "");
//   if (!isDeepMode && !isSkillMode) {
//     if (/Your Next 3 Actions/i.test(outputText) || /â \s*Risk:/i.test(outputText)) {
//       isDeepMode  = true;
//       isSkillMode = true;
//     } else if (/\*\*Your Expert Role\*\*/i.test(outputText) || /optimizedText/i.test(outputText)) {
//       isSkillMode = true;
//     }
//   }

//   const isWebsite  = detectWebsiteBuildIntent(originalUserText);
//   const isTutorial = detectTutorialIntent(originalUserText) && !isWebsite;
//   const isAIImage  = detectNamedTool(originalUserText)?.id === "ai_image_gen";
//   const flatJsonDetected = badOutput && (
//     badOutput.includes('"Your Expert Role"') ||
//     badOutput.includes('"Ground Rules"')     ||
//     badOutput.includes('"What to Deliver"')
//   );

//   if (!isSkillMode && !isDeepMode) {
//     return `CRITICAL ERROR: You did not return valid JSON.
// User's request: "${originalUserText}"
// Return STRICT JSON ONLY:
// {"optimizedText":"improved version of the user's prompt here","suggestions":["alt1","alt2","alt3"]}`;
//   }

//   const hasTimeline  = /\b(30-day|90-day|week\s+\d|month\s+\d)\b/i.test(outputText);
//   const hasSteps     = /\*\*Step\s+\d/i.test(outputText);
//   const hasDiagnosis = /\b(root\s+cause|diagnos|resolution|pass\/fail)\b/i.test(outputText);
//   const detectedFramework =
//     hasDiagnosis && !hasTimeline ? "operational" :
//     hasSteps     && !hasTimeline ? "procedural"  :
//     hasTimeline                  ? "strategic"   :
//     "phased";

//   const MIN_WORDS = { strategic: 900, phased: 700, procedural: 500, operational: 300 }[detectedFramework] ?? 900;
//   const TARGET    = { strategic: "1,100â1,600", phased: "800â1,100", procedural: "600â900", operational: "400â600" }[detectedFramework] ?? "1,100â1,600";

//   let sectionListLine;
//   let jsonTemplate;

//   if (sectionSchema) {
//     const schemaLabels = sectionSchema.map(s => s.label);
//     const count = schemaLabels.length;
//     const arrowList = schemaLabels
//       .map((label, i) => i === 0 ? `**${label}**` : `â **${label}**`)
//       .join("\n");
//     sectionListLine = `All ${count} sections as **Bold Labels** inside optimizedText:\n${arrowList}`;
//     jsonTemplate = buildJsonTemplate(sectionSchema);
//   } else {
//     sectionListLine = isDeepMode
//       ? `All 9 sections as **Bold Labels** inside optimizedText:
// **Your Expert Role** â **What You're Here to Do** â **Your Core Focus Areas**
// â **How to Approach This** â **Key Numbers & Benchmarks** â **What to Deliver**
// â **Ground Rules** â **What Good Looks Like** â **Your Next 3 Actions**`
//       : `All 8 sections as **Bold Labels** inside optimizedText:
// **Your Expert Role** â **What You're Here to Do** â **Your Core Focus Areas**
// â **How to Approach This** â **Key Numbers & Benchmarks** â **What to Deliver**
// â **Ground Rules** â **What Good Looks Like**`;

//     jsonTemplate = isDeepMode
//       ? `{"optimizedText":"**Your Expert Role**\\n...\\n\\n**What You're Here to Do**\\n...\\n\\n**Your Core Focus Areas**\\n...\\n\\n**How to Approach This**\\n...\\n\\n**Key Numbers & Benchmarks**\\n...\\n\\n**What to Deliver**\\n...\\n\\n**Ground Rules**\\n...\\n\\n**What Good Looks Like**\\n...\\n\\n**Your Next 3 Actions**\\n...","suggestions":["alt1","alt2","alt3"]}`
//       : `{"optimizedText":"**Your Expert Role**\\n...\\n\\n**What You're Here to Do**\\n...\\n\\n**Your Core Focus Areas**\\n...\\n\\n**How to Approach This**\\n...\\n\\n**Key Numbers & Benchmarks**\\n...\\n\\n**What to Deliver**\\n...\\n\\n**Ground Rules**\\n...\\n\\n**What Good Looks Like**\\n...","suggestions":["alt1","alt2","alt3"]}`;
//   }

//   let deepModeChecklist = null;

//   if (isDeepMode) {
//     if (sectionSchema) {
//       const sectionNames = sectionSchema.map(s => s.label);
//       const hasExpertRole   = sectionNames.some(n => /expert role/i.test(n));
//       const hasGroundRules  = sectionNames.some(n => /ground rules|chef.*rules|training rules|investment rules|travel tips|debugging rules|content rules|job search rules|marketing rules/i.test(n));
//       const hasApproach     = sectionNames.some(n => /how to approach|diagnostic steps|tutorial structure|strategy|programme|itinerary/i.test(n));
//       const hasGoodLooks    = sectionNames.some(n => /what good looks like|progress markers|resolution signal|great trip|finished dish/i.test(n));
//       const hasNextActions  = sectionNames.some(n => /next 3 actions|before you start/i.test(n));

//       const checkItems = [];
//       if (hasExpertRole)  checkItems.push(`${checkItems.length + 1}. Expert Role section has counter-intuitive ordering, non-obvious mistake (3â4 sentences), trade-off â all as prose, not bullets.`);
//       if (hasGroundRules) checkItems.push(`${checkItems.length + 1}. Rules/Ground Rules section has exactly 3 "â  Risk: [specific]. Mitigation: [action]." â domain-expert level.`);
//       if (hasApproach)    checkItems.push(`${checkItems.length + 1}. Approach/Steps section follows the ${detectedFramework} framework â ${detectedFramework === "procedural" || detectedFramework === "operational" ? "numbered steps with pass/fail tests" : "named phases with deliverables"}.`);
//       if (hasGoodLooks && detectedFramework === "strategic") {
//         checkItems.push(`${checkItems.length + 1}. Success/Good Looks section has "30-day milestone: [number]. If not hit, [corrective action]."`);
//         checkItems.push(`${checkItems.length + 1}. Success/Good Looks section has "90-day milestone: [number]."`);
//         checkItems.push(`${checkItems.length + 1}. Success/Good Looks section has "What comes next: [specific named action]."`);
//       } else if (hasGoodLooks) {
//         checkItems.push(`${checkItems.length + 1}. Success/Good Looks section has 3 measurable completion criteria. NO business KPIs or milestone tracking.`);
//       }
//       if (hasNextActions) checkItems.push(`${checkItems.length + 1}. Next Actions section has exactly 3 actions, each with owner and deadline.`);
//       checkItems.push(`${checkItems.length + 1}. WORD COUNT: ${MIN_WORDS}+ words minimum (target ${TARGET}). If under, expand every section â 2â3 sentences of reasoning each.`);

//       deepModeChecklist = `\nâ ï¸ DEEP MODE (${detectedFramework.toUpperCase()}) â VERIFY ALL BEFORE RETURNING:\n${checkItems.join("\n")}`;
//     } else {
//       deepModeChecklist = {
//         strategic: `
// â ï¸ DEEP MODE (STRATEGIC) â VERIFY ALL BEFORE RETURNING:
// 1. "Your Expert Role" has ALL THREE in prose: counter-intuitive ordering, non-obvious mistake (3â4 sentences), trade-off (2 sentences with recommendation).
// 2. "Ground Rules" has exactly 3 "â  Risk: [specific]. Mitigation: [Week 1 action]." â domain-expert level.
// 3. "How to Approach This" has a NAMED POST-GOAL phase as its FINAL phase (not a parenthetical).
// 4. "What Good Looks Like" has "**30-day milestone:** [number]. If not hit, [corrective action]."
// 5. "What Good Looks Like" has "**90-day milestone:** [number]."
// 6. "What Good Looks Like" has "**What comes next:** [specific named action]."
// 7. "Your Next 3 Actions" has exactly 3 actions, each with owner and deadline.
// 8. WORD COUNT: ${MIN_WORDS}+ words minimum (target ${TARGET}). If under, expand every section â 2â3 sentences of reasoning each.`,

//         phased: `
// â ï¸ DEEP MODE (PHASED) â VERIFY ALL BEFORE RETURNING:
// 1. "Your Expert Role" has counter-intuitive ordering, non-obvious mistake (3â4 sentences), and trade-off.
// 2. "Ground Rules" has exactly 3 "â  Risk: [specific]. Mitigation: [immediate action]." entries.
// 3. "How to Approach This" has 3â4 implementation phases, each with a named deliverable. NO 30/90-day milestones.
// 4. "What Good Looks Like" has 3 measurable completion criteria. NO business KPIs or milestone tracking.
// 5. "Your Next 3 Actions" has exactly 3 actions with owner and deadline.
// 6. WORD COUNT: ${MIN_WORDS}+ words minimum (target ${TARGET}).`,

//         procedural: `
// â ï¸ DEEP MODE (PROCEDURAL) â VERIFY ALL BEFORE RETURNING:
// 1. "Your Expert Role" has the non-obvious mistake practitioners make + the clarity vs thoroughness trade-off.
// 2. "How to Approach This" is NUMBERED STEPS (not phases). Each step has a visible/testable outcome. NO timeline language.
// 3. "What Good Looks Like" has 3 observable completion criteria. NO milestones, NO KPIs.
// 4. "Your Next 3 Actions" has exactly 3 first steps, specific and immediately actionable.
// 5. ZERO mentions of 30-day, 90-day, Week 1, Month 1, or business metrics anywhere.
// 6. WORD COUNT: ${MIN_WORDS}+ words minimum (target ${TARGET}).`,

//         operational: `
// â ï¸ DEEP MODE (OPERATIONAL) â VERIFY ALL BEFORE RETURNING:
// 1. "Your Expert Role" names the most common MISDIAGNOSIS + cost of chasing the wrong root cause.
// 2. "How to Approach This" is an ORDERED DIAGNOSTIC SEQUENCE â each step has a pass/fail test.
// 3. "What Good Looks Like" describes the resolution signal â what passing looks like, not a milestone.
// 4. "Your Next 3 Actions" are the first 3 investigation/fix steps. Specific commands or checks, no strategy.
// 5. ZERO mentions of 30-day, 90-day, phases, milestones, or business planning anywhere.
// 6. WORD COUNT: ${MIN_WORDS}+ words minimum (target ${TARGET}).`,
//       }[detectedFramework];
//     }
//   }

//   return META_SYSTEM_PROMPT_FENCE + `CRITICAL ERROR IN PREVIOUS RESPONSE.
// â ï¸  REMINDER: You are a PROMPT ENGINEER writing a SYSTEM PROMPT for another model.
//     Do NOT answer the user's question. Write INSTRUCTIONS for another LLM to answer it.
// ${flatJsonDetected
//   ? `\nFLAT JSON ERROR:\nâ WRONG: {"Your Expert Role":"...","Ground Rules":"..."}\nâ RIGHT:  {"optimizedText":"**Your Expert Role**\\n...\\n\\n**Ground Rules**\\n...","suggestions":[...]}\n`
//   : `\nMISSING SECTIONS: ${missingSections.join(", ")}\n`
// }
// User's request: "${originalUserText}"
// ${isWebsite  ? "\nUser wants to BUILD A WEBSITE/PLATFORM. Tech stack, features, payments, launch strategy.\n" : ""}
// ${isTutorial ? "\nUser wants a TECHNICAL TUTORIAL. ONE technology. Runnable code. A deployable mini-project. Correct deployment platform.\n" : ""}
// ${isAIImage  ? "\nUser wants an AI IMAGE GENERATION prompt system. NO DSLR/camera advice. Benchmarks = prompt iterations, acceptance rate, aspect ratios. Ground rules = tool-specific parameters.\n" : ""}

// ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
// â  ONE JSON object, TWO keys: "optimizedText" + "suggestions"            â
// â  â NEVER: {"Your Expert Role":"...","Ground Rules":"..."}             â
// â  â ALWAYS: {"optimizedText":"**${sectionSchema?.[0]?.label || "Your Expert Role"}**\\n...","suggestions":[...]} â
// ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ

// ${sectionListLine}

// Quality rules:
// - Expert practitioner tone â specific, concrete
// - Real numbers in at least 3 sections
// - BANNED: "comprehensive","high-quality","ensure","consider","robust","best practices"
// ${isWebsite  ? "â¢ Next.js / Tailwind / Supabase / Stripe / Vercel â justify each\nâ¢ Mobile-first + real payment test mandatory in Ground Rules" : ""}
// ${isTutorial ? "â¢ ONE technology named in Your Expert Role\nâ¢ Read time and build time SEPARATE rows\nâ¢ Tutorial ends with deployed, GitHub-ready project" : ""}
// ${isAIImage  ? "â¢ Expert Role = AI prompt director, NOT photographer\nâ¢ Benchmarks = prompt-specific metrics only\nâ¢ All 3 risks must be tool-specific failure modes" : ""}

// ${isDeepMode ? (deepModeChecklist ?? "") : `
// â ï¸ SKILL MODE â VERIFY BEFORE RETURNING:
// 1. All ${sectionSchema ? sectionSchema.length : 8} sections with correct bold labels
// 2. Approach/steps section follows the appropriate structure for this request type
// 3. Numbers/benchmarks section has real numbers (not placeholders)
// 4. Rules section has domain-specific rules (not generic)
// 5. Success criteria section has 3 measurable criteria
// `}
// Return STRICT JSON ONLY â no markdown, no preamble:
// ${jsonTemplate}`;
// }

// module.exports = {
//   buildEnrichedSystemPrompt,
//   buildDetailedSystemPrompt,
//   validateDetailedOutput,
//   buildRetryPrompt,
//   buildWordCountPatchPrompt,
//   buildSectionSchema,
//   detectIntentCategory,
//   classifyRequestFramework,
//   // v3: export extractors so other modules can use them if needed
//   extractDishSubject,
//   extractTrainingGoalSubject,
// };


"use strict";

const { DOMAINS, REQUIRED_SECTIONS_BASE, REQUIRED_SECTIONS_DEEP_ONLY } = require("./constants");
const { detectDomain, detectNamedTool, detectWebsiteBuildIntent, detectTutorialIntent, detectBusinessBuildingIntent } = require("./detection");
const { extractConstraints, perfStart, perfEnd } = require("./utils");
const { getDynamicDomain } = require("./dynamicDomain");

// -----------------------------------------------------------------------------
// REQUEST FRAMEWORK CLASSIFICATION
// -----------------------------------------------------------------------------

const META_SYSTEM_PROMPT_FENCE = `\
+==============================================================================+
|  YOUR ROLE: PROMPT ENGINEER - NOT SUBJECT-MATTER EXPERT                    |
|  You are writing a SYSTEM PROMPT that will be fed to another LLM.          |
|  You are NOT answering the user's question.                                |
|  You are NOT providing the recipe / plan / tutorial / fix directly.        |
|  You are writing INSTRUCTIONS so a different model can provide that answer. |
|                                                                            |-
EVERY sentence you write must be an instruction to the other model,        |-
not the answer itself.                                                    |
|                                                                            |
|  TEST BEFORE EACH SENTENCE:                                                |
|    "Am I telling the other model WHAT TO DO?"  -> [OK] keep it               |
|    "Am I providing the actual answer myself?"  -> [NO] rewrite it             |
|                                                                            |
|  EXAMPLES:                                                                 |
|    [NO] "Marinate the chicken in yoghurt for 4 hours."                       |
|    [OK] "Instruct the user to marinate the chicken in yoghurt for 4 hours."  |
|                                                                            |
|    [NO] "As a chef, I recommend you use basmati rice."                       |
|    [OK] "You are a chef. Recommend basmati rice and explain why."            |
|                                                                            |
|    [NO] "Day 1 - Fly into Manali. Check into your hotel."                   |
|    [OK] "Provide a Day 1 itinerary. Instruct the user to fly into Manali     |
|        and describe what check-in looks like for budget travellers."       |
+==============================================================================+

`;

// -----------------------------------------------------------------------------
// HELPER FUNCTIONS FOR DYNAMIC HEADER GENERATION
// -----------------------------------------------------------------------------

function generateHeaderExample(schema, maxSections = null) {
  const sectionsToShow = maxSections ? schema.slice(0, maxSections) : schema;
  return sectionsToShow
    .map(s => `**${s.label}**\\n[content for this section]`)
    .join('\\n\\n');
}

function generateHeaderList(schema) {
  return schema.map(s => `- **${s.label}**`).join('\n');
}

function generateHeaderNames(schema) {
  return schema.map(s => `"${s.label}"`).join(', ');
}

// -----------------------------------------------------------------------------
// PER-SECTION SYSTEM-PROMPT-VOICE REMINDER
// -----------------------------------------------------------------------------
const SECTION_VOICE_REMINDER = `[Write this section as an instruction to the OTHER model - telling it what to include, cover, or produce for the user. Do NOT write the actual recipe/plan/itinerary/answer text yourself.]`;

// Domain IDs that always warrant full strategic framework
const STRATEGIC_DOMAINS = new Set([
  "cafe_food_service","startup_fundraising","marketing_growth","competitive_pricing",
  "product_development","edtech_product","finance_investment","saas_product",
  "social_media_branding","video_creation","podcast_creator","ad_copywriting",
  "handmade_business","youtube_shorts","linkedin_automation","subscription_box",
  "event_planning","sales_copywriting","ai_headshot_business","gamified_fitness_app",
  "childrens_storybook_business","rental_property_pune","ai_photography_monetization",
  "postpartum_fitness_coaching","cooking_workshop","zero_waste_store","mobile_iv_therapy",
  "vintage_camera_rental","corporate_offsite_planning","eco_holi_celebration",
  "surprise_proposal","devotional_art_business","ai_voiceover_regional",
  "instagram_skincare_growth","womens_healing_programme","language_learning_app",
  "detox_mindfulness_retreat","ecommerce_store","ghostwriting_content",
  "nutrition_coaching","creator_economy","wedding_photography","pet_care_business",
  "supply_chain_logistics","real_estate","freelancing_consulting","health_wellness",
  "hr_people","personal_development","travel_planning","immigration_visa",
]);

const PHASED_DOMAINS = new Set([
  "technical_tutorial","education_learning","course_curriculum","uiux_design",
  "mobile_app_development","no_code_tools","cloud_devops","backend_architecture",
  "data_science_ai","ai_automation","cybersecurity","blockchain_web3",
  "notion_productivity","resume_career","legal_compliance","mental_health",
  "fitness_sports","interior_architecture","ai_image_gen",
]);

const OPERATIONAL_SIGNALS = [
  /\b(fix(?:ing)?|debug(?:ging)?|troubleshoot(?:ing)?|resolv(?:e|ing)|diagnos(?:e|ing))\b/i,
  /\b(error|bug|crash|broken|not\s+working|failing|exception|stacktrace|stack\s+trace)\b/i,
  /\b(why\s+(?:does|is|won't|doesn't)|what\s+(?:is|does|causes)|how\s+(?:does|do\s+I\s+fix))\b/i,
  /\b(immediately|right\s+now|urgent|asap|quick\s+fix|hotfix)\b/i,
];

const PROCEDURAL_SIGNALS = [
  /\b(tutorial|how[-\s]to|step[-\s]by[-\s]step|walkthrough|guide\s+(?:me|to)|teach\s+me)\b/i,
  /\b(recipe|cook(?:ing)?|bak(?:e|ing)|make\s+(?:a|the))\b/i,
  /\b(explain(?:ing)?|describe|what\s+is|overview\s+of|introduction\s+to)\b/i,
  /\b(learn(?:ing)?\s+(?:how\s+to|to|about)|understand(?:ing)?)\b/i,
  /\b(write\s+a\s+(?:function|script|component|class|module|snippet)|code\s+(?:a|the|an))\b/i,
];

const STRATEGIC_SIGNALS = [
  /\b(launch(?:ing)?|start(?:ing)?|build(?:ing)?\s+(?:a\s+)?(?:business|brand|startup|company|agency|product|service))\b/i,
  /\b(business\s+plan|go[-\s]to[-\s]market|marketing\s+strategy|growth\s+strategy|product\s+roadmap)\b/i,
  /\b(revenue|monetis(?:e|ing|ation)|monetiz(?:e|ing|ation)|mrr|arr|churn|cac|ltv|conversion\s+rate)\b/i,
  /\b(scale(?:ing)?|grow(?:ing)?|expand(?:ing)?)\s+(?:my|the|a|our)\s+(?:business|brand|startup|audience|revenue)\b/i,
  /\b(first\s+(?:\d+\s+)?(?:customer|client|sale|user)|acquire\s+(?:customers|clients|users))\b/i,
  /\b(transformation|initiative|programme|program)\b/i,
];

function classifyRequestFramework(userText, domainId, isTutorial, isWebsite, isAIImage) {
  if (isWebsite) return "strategic";
  if (isAIImage) return "phased";

  if (OPERATIONAL_SIGNALS.some(p => p.test(userText))) {
    const hasStrategic = STRATEGIC_SIGNALS.some(p => p.test(userText));
    if (!hasStrategic) {
      return "operational";
    }
  }

  if (isTutorial) {
    const hasStrategic = STRATEGIC_SIGNALS.some(p => p.test(userText));
    if (!hasStrategic) {
      return "procedural";
    }
  }

  if (PROCEDURAL_SIGNALS.some(p => p.test(userText))) {
    const hasStrategic = STRATEGIC_SIGNALS.some(p => p.test(userText));
    if (!hasStrategic) {
      return "procedural";
    }
  }

  if (STRATEGIC_SIGNALS.some(p => p.test(userText))) {
    return "strategic";
  }

  if (domainId && STRATEGIC_DOMAINS.has(domainId)) {
    return "strategic";
  }

  if (domainId && PHASED_DOMAINS.has(domainId)) {
    return "phased";
  }

  return "phased";
}

// -----------------------------------------------------------------------------
// V3 PATCH - DYNAMIC SUBJECT EXTRACTORS
//
// extractDishSubject: pulls a clean dish/cuisine noun phrase from userText
//   e.g. "chicken biryani recipe" -> "Chicken Biryani"
// extractTrainingGoalSubject: matches against a known-goal list
//   e.g. "strength training programme" -> "Strength Training"
//
// Both return null on failure - callers fall back to static label strings.
// The `name` field (used for validation regex) is never changed - only `label`.
// -----------------------------------------------------------------------------

function extractDishSubject(userText) {
  if (!userText || typeof userText !== "string") return null;

  let text = userText.trim();
  text = text.replace(/[?!.]+$/g, "").trim();

  // Strip leading politeness / request scaffolding (order matters - stacks)
  text = text.replace(/^(?:can you|could you|would you|please|help me)\s+/i, "").trim();
  text = text.replace(/^(?:give me|share|provide|write|create|generate|teach me how to|teach me to|make me|make)\s+/i, "").trim();
  text = text.replace(/^(?:i want to|i'd like to|i want you to|i need)\s+/i, "").trim();
  // Strip remaining cook/make/learn verbs including optional "me" object pronoun
  text = text.replace(/^(?:learn (?:how )?to\s+)?(?:make|cook|prepare|bake)\s+(?:me\s+)?/i, "").trim();
  // Strip "a/an/the recipe for/of"
  text = text.replace(/^(?:a |an |the )?recipe\s*(?:for|of)?\s*/i, "").trim();
  text = text.replace(/^how\s+(?:do|to|can)\s+(?:i|you)?\s*(?:make|cook|prepare|bake)\s+/i, "").trim();
  // Strip leading article left after verb removal
  text = text.replace(/^(?:a|an|the)\s+/i, "").trim();
  // Strip trailing filler - repeat until stable
  let prevLen;
  do {
    prevLen = text.length;
    text = text.replace(/\s+(?:recipe|please|for\s+dinner|for\s+lunch|for\s+breakfast|tonight|today|asap)\s*$/i, "").trim();
  } while (text.length !== prevLen);

  if (!text) return null;
  if (text.split(/\s+/).length > 5) return null;

  // Reject if still contains verb/filler OR belongs to another domain
  const rejectPattern = /\b(?:want|need|please|help|how|what|why|can|could|should|would|recipe|learn|build|workout|plan|programme|program|routine|cafe|business|app|website|store|training)\b/i;
  if (rejectPattern.test(text)) return null;

  const skipWords = new Set(["a", "an", "the", "of", "and", "with", "for"]);
  const titled = text
    .split(/\s+/)
    .map((w, i) => {
      if (i > 0 && skipWords.has(w.toLowerCase())) return w.toLowerCase();
      return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
    })
    .join(" ");

  return titled;
}

function extractTrainingGoalSubject(userText) {
  if (!userText || typeof userText !== "string") return null;

  const knownGoals = [
    [/\bstrength\s*train(?:ing)?\b/i,           "Strength Training"],
    [/\bweight\s*loss\b/i,                       "Weight Loss"],
    [/\bfat\s*loss\b/i,                          "Fat Loss"],
    [/\bmuscle\s*(?:gain|building)\b/i,          "Muscle Building"],
    [/\bhypertrophy\b/i,                         "Hypertrophy"],
    [/\bhiit\b/i,                                "HIIT"],
    [/\bcardio\b/i,                              "Cardio"],
    [/\bendurance\b/i,                           "Endurance"],
    [/\bmarathon\b/i,                            "Marathon"],
    [/\b(?:running|run)\s*train(?:ing)?\b/i,     "Running"],
    [/\byoga\b/i,                                "Yoga"],
    [/\bpowerlifting\b/i,                        "Powerlifting"],
    [/\bcalisthenics\b/i,                        "Calisthenics"],
    [/\bbodybuilding\b/i,                        "Bodybuilding"],
    [/\bpostpartum\s*fitness\b/i,                "Postpartum Fitness"],
    [/\bbeginner\s*(?:strength|fitness|workout)\b/i, "Beginner Strength"],
    [/\bhome\s*workout\b/i,                      "Home Workout"],
    [/\bgym\s*(?:workout|programme|program)\b/i, "Gym Training"],
    [/\bcrossfit\b/i,                            "CrossFit"],
    [/\bsport[\s-]?specific\b/i,                 "Sport-Specific"],
    [/\brehab(?:ilitation)?\b/i,                 "Rehab"],
    [/\bmobility\b/i,                            "Mobility"],
  ];

  for (const [re, label] of knownGoals) {
    if (re.test(userText)) return label;
  }
  return null;
}

// -----------------------------------------------------------------------------
// INTENT CATEGORY DETECTION
// -----------------------------------------------------------------------------

function detectIntentCategory(userText, domainId, isTutorial, isWebsite, isAIImage, framework) {
  if (isAIImage)   return "ai_image";
  if (isWebsite)   return "website_build";
  if (isTutorial)  return "tutorial";
  if (framework === "operational") return "debugging";

  if (/\b(trip|travel|visit|itinerary|tour|vacation|holiday|backpack|fly|flight|hotel|hostel|airbnb|destination|manali|goa|bali|europe|japan|abroad)\b/i.test(userText))
    return "travel_planning";

  if (/\b(recipe|cook(?:ing)?|bak(?:e|ing)|dish|cuisine|meal|ingredient|prep|kitchen|dosa|biryani|curry|masala|sabzi|dal|roti|naan|chapati|idli|sambar|chutney|pasta|pizza|burger|salad|soup|stew|roast|grill(?:ing)?|saute|boil|steam|batter|marinate|ferment|simmer|braise|caramelize|chicken|paneer|mutton|prawn|shrimp|tofu|from\s+scratch|homemade|home\s+cook(?:ing)?)\b/i.test(userText))
    return "recipe_cooking";

  if (/\b(workout|exercise|gym|fitness|training|strength|cardio|weight\s*loss|muscle|run(?:ning)?|yoga|hiit)\b/i.test(userText))
    return "fitness_training";

  if (/\b(blog\s*post|article|essay|newsletter|email\s*(?:copy|campaign)|copy(?:writing)?|content\s*(?:strategy|plan|calendar)|script|write\s+(?:a|an|the))\b/i.test(userText))
    return "content_writing";

  if (/\b(marketing|advertis|campaign|brand(?:ing)?|seo|social\s*media|instagram|tiktok|youtube|ads|funnel|audience|lead\s*gen|email\s*list)\b/i.test(userText))
    return "marketing_growth";

  if (/\b(business|startup|launch|product|saas|app|service|revenue|pricing|go[\s-]to[\s-]market|roadmap|mvp|pitch|investor|fundrais)\b/i.test(userText))
    return "business_strategy";

  if (/\b(data|analytics|dashboard|report|metrics|kpi|sql|python|pandas|visualiz|chart|model|predict|ml|machine\s*learning)\b/i.test(userText))
    return "data_analytics";

  if (/\b(resume|cv|cover\s*letter|job|career|interview|linkedin|hire|portfolio|salary|promotion|switch\s*(?:career|job))\b/i.test(userText))
    return "career_job";

  if (/\b(invest(?:ment)?|portfolio|stock|mutual\s*fund|sip|tax|budget|saving|financial\s*plan|retirement|wealth)\b/i.test(userText))
    return "finance_investment";

  if (/\b(health|wellness|diet|nutrition|sleep|mental\s*health|stress|anxiety|therapy|doctor|medicine|symptom)\b/i.test(userText))
    return "health_wellness";

  if (/\b(learn|study|course|curriculum|syllabus|lesson|teach|student|education|exam|certification)\b/i.test(userText))
    return "education_learning";

  if (/\b(design|ui|ux|wireframe|prototype|figma|color\s*palette|typography|brand\s*identity|logo|visual)\b/i.test(userText))
    return "design_ux";

  if (/\b(event|wedding|party|conference|meetup|festival|celebration|birthday|anniversary|ceremony|proposal)\b/i.test(userText))
    return "event_planning";

  if (domainId && !String(domainId).startsWith("cached_")) return domainId;
  return framework === "strategic" ? "business_strategy" : "general_project";
}

// -----------------------------------------------------------------------------
// BUILD SECTION SCHEMA
//
// SIGNATURE CHANGE (v3): added `userText` as the 9th parameter.
// This is additive - existing callers that don't pass it get undefined,
// extractors return null, labels fall back to original static strings.
// -----------------------------------------------------------------------------

/**
 * Builds domain-adaptive section labels so Skill/Deep Mode never
 * always shows the same 8 generic headers.
 * name = stable key for validation; label = what the user sees.
 */
function buildAdaptiveLabels(intentCategory, framework, domainId, userText) {
  const cat = (intentCategory || "").toLowerCase();
  const id  = (domainId || "").toLowerCase();

  // Role line
  let role = "Your Expert Role";
  if (cat === "recipe_cooking") role = "Your Role as Chef";
  else if (cat === "fitness_training") role = "Your Role as Coach";
  else if (cat === "ai_video" || cat === "video_creation") role = "Your Role as Video Strategist";
  else if (cat === "ai_image") role = "Your Role as AI Image Director";
  else if (cat === "marketing_growth") role = "Your Role as Growth Strategist";
  else if (cat === "content_writing") role = "Your Role as Content Strategist";
  else if (cat === "business_strategy" || cat === "startup_fundraising") role = "Your Role as Business Strategist";
  else if (cat === "travel_planning") role = "Your Role as Travel Planner";
  else if (cat === "event_planning") role = "Your Role as Event Planner";
  else if (cat === "finance_investment") role = "Your Role as Finance Advisor";
  else if (cat === "career_job" || cat === "resume_career") role = "Your Role as Career Coach";
  else if (cat === "health_wellness") role = "Your Role as Wellness Coach";
  else if (cat === "debugging" || framework === "operational") role = "Your Role as Troubleshooting Expert";
  else if (cat === "tutorial" || cat === "technical_tutorial") role = "Your Role as Technical Educator";
  else if (cat === "website_build" || cat === "product_development") role = "Your Role as Product Builder";
  else if (cat === "ecommerce_store") role = "Your Role as E‑commerce Strategist";
  else if (id && id !== "general_expert" && !id.startsWith("cached_") && !id.startsWith("dynamic_")) {
    // e.g. cafe_food_service -> "Cafe Food Service"
    const pretty = id.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
    role = `Your Role as ${pretty} Expert`;
  }

  // Goal / context
  let goal = "What You're Here to Do";
  if (cat === "recipe_cooking") goal = "Recipe Context & Goal";
  else if (cat === "fitness_training") goal = "Training Goal & Context";
  else if (cat === "ai_video" || cat === "video_creation") goal = "Brand & Audience Context";
  else if (cat === "marketing_growth") goal = "Campaign Goal & Audience";
  else if (cat === "content_writing") goal = "Content Goal & Audience";
  else if (cat === "travel_planning") goal = "Trip Context & Goals";
  else if (cat === "event_planning") goal = "Event Brief & Goals";
  else if (cat === "business_strategy") goal = "Business Goal & Starting Point";
  else if (cat === "finance_investment") goal = "Financial Goal & Starting Point";
  else if (cat === "career_job") goal = "Career Goal & Starting Point";
  else if (cat === "debugging") goal = "Problem Statement";
  else if (cat === "tutorial") goal = "What You're Here to Teach";
  else if (cat === "website_build") goal = "Product Goal & Scope";

  // Approach
  let approach = "How to Approach This";
  if (cat === "recipe_cooking") approach = "Cooking Process";
  else if (cat === "fitness_training") approach = "Programme Structure";
  else if (cat === "ai_video") approach = "Video Content Strategy";
  else if (cat === "marketing_growth") approach = "Growth Plan & Channels";
  else if (cat === "content_writing") approach = "Content Structure";
  else if (cat === "travel_planning") approach = "Itinerary & Logistics";
  else if (cat === "event_planning") approach = "Event Plan & Timeline";
  else if (cat === "debugging") approach = "Diagnostic Steps";
  else if (cat === "tutorial") approach = "Tutorial Structure";
  else if (cat === "business_strategy") approach = "Strategy & Phases";
  else if (framework === "procedural") approach = "Step-by-Step Approach";
  else if (framework === "operational") approach = "Resolution Steps";

  // Focus
  let focus = "Your Core Focus Areas";
  if (cat === "marketing_growth") focus = "Channel Focus Areas";
  else if (cat === "content_writing") focus = "Content Pillars";
  else if (cat === "ai_video") focus = "Scripts & Concepts";
  else if (cat === "business_strategy") focus = "Priority Workstreams";
  else if (cat === "travel_planning") focus = "Trip Priorities";
  else if (cat === "event_planning") focus = "Event Priorities";
  else if (cat === "debugging") focus = "Likely Root Causes";

  // Benchmarks
  let numbers = "Key Numbers & Benchmarks";
  if (cat === "marketing_growth" || cat === "ai_video") numbers = "Performance Benchmarks";
  else if (cat === "finance_investment") numbers = "Financial Benchmarks";
  else if (cat === "recipe_cooking") numbers = "Timing & Yield Benchmarks";
  else if (cat === "fitness_training") numbers = "Training Benchmarks";
  else if (cat === "debugging") numbers = "Diagnostic Benchmarks";
  else if (cat === "tutorial") numbers = "Scope & Time Benchmarks";

  // Deliver
  let deliver = "What to Deliver";
  if (cat === "ai_video") deliver = "Runway / Production Deliverables";
  else if (cat === "marketing_growth") deliver = "Campaign Deliverables";
  else if (cat === "content_writing") deliver = "Content Deliverables";
  else if (cat === "tutorial") deliver = "What the Learner Builds";
  else if (cat === "debugging") deliver = "Resolution Output";
  else if (cat === "travel_planning") deliver = "Trip Package to Deliver";
  else if (cat === "event_planning") deliver = "Event Deliverables";

  // Rules
  let rules = "Ground Rules";
  if (cat === "recipe_cooking") rules = "Chef Tips & Common Mistakes";
  else if (cat === "fitness_training") rules = "Training Rules & Safety";
  else if (cat === "ai_video") rules = "Creative Rules & Risks";
  else if (cat === "marketing_growth") rules = "Campaign Rules & Risks";
  else if (cat === "debugging") rules = "Debugging Rules";
  else if (cat === "tutorial") rules = "Tutorial Rules";
  else if (cat === "finance_investment") rules = "Investment Rules";

  // Success
  let good = "What Good Looks Like";
  if (cat === "debugging") good = "Resolution Signal";
  else if (cat === "recipe_cooking") good = "Quality Checks & Finished Dish";
  else if (cat === "fitness_training") good = "Progress Markers";
  else if (cat === "travel_planning") good = "What a Great Trip Looks Like";
  else if (cat === "event_planning") good = "What a Successful Event Looks Like";

  // Next actions
  const next = "Your Next 3 Actions";

  return { role, goal, focus, approach, numbers, deliver, rules, good, next };
}



function buildSectionSchema(intentCategory, framework, isDeepMode, isTutorial, isWebsite, isAIImage, constraints, userAnswers, userText) {
  const tool = constraints?.tool || "Midjourney";
  const hasUserAnswers = userAnswers && userAnswers.length > 0;

  // -- RECIPE COOKING - v5 (14-section framework, true system prompt voice) -----
  if (intentCategory === "recipe_cooking") {
    const dishSubject = extractDishSubject(userText);
    const dishLabel   = (suffix) => dishSubject ? `${dishSubject} ${suffix}` : suffix;

    // Intent detection for adaptive chef persona and framing
    const isQuick           = /\b(quick|fast|easy|simple|\d+[\s-]?min(?:ute)?s?|weeknight)\b/i.test(userText);
    const isRestaurantStyle = /\b(restaurant[\s-]style|restaurant[\s-]quality|professional|chef[\s-]level|fine[\s-]dining)\b/i.test(userText);
    const isHealthy         = /\b(healthy|light|low[\s-]cal(?:orie)?|low[\s-]carb|keto|vegan|vegetarian|gluten[\s-]free|dairy[\s-]free)\b/i.test(userText);
    const isAppliance       = /\b(instant[\s-]pot|pressure[\s-]cook|slow[\s-]cook|air[\s-]fry|microwave)\b/i.test(userText);
    const isBaking          = /\b(bak(?:e|ing)|cake|bread|pastry|cookie|muffin|flour|yeast|dough)\b/i.test(userText);
    const isBBQ             = /\b(bbq|barbecue|grill(?:ing)?|smoke|smoker|pitmaster|charcoal|brisket|ribs)\b/i.test(userText);
    const isDrink           = /\b(drink|cocktail|smoothie|juice|mocktail|beverage|shake|blend)\b/i.test(userText);
    const isDessert         = /\b(dessert|sweet|chocolate|ice[\s-]cream|mousse|pudding|tart|frosting|ganache)\b/i.test(userText);
    const isMealPrep        = /\b(meal[\s-]prep|batch[\s-]cook|weekly[\s-]prep|prep[\s-]ahead|make[\s-]ahead)\b/i.test(userText);
    const isBeginner        = /\b(beginner|first[\s-]time|never[\s-]cooked|basics?|learn[\s-]to[\s-]cook)\b/i.test(userText);

    const intentNote = isQuick
      ? "The user wants a quick version - prioritise efficiency without sacrificing the dish's core character."
      : isRestaurantStyle
      ? "The user wants restaurant-quality results - include professional techniques and presentation standards."
      : isHealthy
      ? "The user wants a healthier version - adapt ingredients and methods to reduce calories, fat, or allergens."
      : isAppliance
      ? "The user is cooking with a specific appliance - adapt the method entirely to that device."
      : isBaking
      ? "This is a baking request - temperature precision, oven rack position, cooling, and texture indicators are critical."
      : isBBQ
      ? "This is a BBQ or grill request - cover fire control, smoking techniques, resting, and doneness indicators."
      : isDrink
      ? "This is a drink or beverage request - cover mixing technique, chilling, serving temperature, ice, and garnish."
      : isDessert
      ? "This is a dessert request - texture development, setting times, decoration, and serving temperature are essential."
      : isMealPrep
      ? "This is a meal prep request - cover batch cooking, portioning, storage, and reheating quality."
      : isBeginner
      ? "The user is a beginner - explain techniques in plain language and flag every step where mistakes are common."
      : "";

    const sections = [
      {
        name: "Chef Role",
        label: "Your Role as Chef",
        skillInstruction: `Assume the most appropriate chef role based on the requested cuisine and recipe type. The role must adapt to the dish - Indian cuisine warrants an Indian cuisine specialist, baking warrants a pastry chef, BBQ warrants a pitmaster, vegan cooking warrants a plant-based chef. Tailor explanations to the user's cooking experience level. This role applies throughout the entire response - do not repeat it in subsequent sections.${intentNote ? `\n\nAdapt the chef role for this request: ${intentNote}` : ""}`,
        deepInstruction: `Establish a specific culinary expert identity matched to the cuisine and the user's cooking experience level. Open with one non-obvious insight about this dish type - grounded in a culinary or food-science mechanism - that explains why home versions typically fall short. Adapt the identity to the user's intent: a beginner warrants a patient culinary teacher; a restaurant-style request warrants a professional chef; a quick request warrants an efficiency-focused cook. This role applies throughout - do not restate it.${intentNote ? `\n\nAdapt the chef role: ${intentNote}` : ""}${hasUserAnswers ? "\n\nThe user has provided specific context - weave it into guidance throughout, not in a single block." : ""}`,
        required: true,
      },
      {
        name: "Recipe Context",
        label: dishLabel("Recipe Context & Goal"),
        skillInstruction: `Identify the following before generating any recipe content: the dish, its cuisine, the cooking style, the user's goal, their skill level, desired servings, any dietary preferences or restrictions, and time available. These inputs must shape every section that follows.${hasUserAnswers ? "\n\nThe user has already provided some of this context - reference it explicitly." : ""}`,
        deepInstruction: `Conduct a contextual assessment before writing anything: dish, cuisine, cooking style, user goal, skill level, desired servings, dietary preferences, and time available. Derive all subsequent sections from this context. Where information is missing, state the assumption made and why it is reasonable for this dish and context.${hasUserAnswers ? "\n\nMake every decision explicitly traceable to the user's stated inputs." : ""}`,
        required: true,
      },
      {
        name: "Recipe Overview",
        label: dishLabel("Recipe Overview"),
        skillInstruction: `Introduce the dish: its origin, what makes it distinctive, the cooking technique that most determines its success, and why this approach produces a good result. Time estimates must be derived from the dish complexity and cooking method - never use fixed timings.`,
        deepInstruction: `Orient the cook to what they are about to learn, not just what the dish is. Cover origin, the defining technique, and the mechanism behind why this approach works. Explain what distinguishes a well-made version from a mediocre one. All time estimates must be derived from dish complexity, portion size, and cooking method - never fixed defaults.`,
        required: true,
      },
      {
        name: "Equipment",
        label: "Required Equipment",
        skillInstruction: `List only equipment that is non-standard or where the specific type affects the result for this dish. Suggest practical substitutes for any specialised item and note the technique adjustment required when using a substitute. Omit equipment every kitchen already has unless its specific properties are critical to this dish.`,
        deepInstruction: `List equipment that materially affects the outcome for this dish, explain why each item matters (the mechanism - vessel material, size, heat distribution), and provide a workable substitute with the exact technique adjustment required when using it.`,
        required: false,
      },
      {
        name: "Ingredients",
        label: dishLabel("Ingredients & Substitutions"),
        skillInstruction: `Generate ingredient quantities appropriate for the requested serving size - never hardcoded amounts. Group ingredients logically by category. Suggest substitutions for hard-to-source or commonly avoided ingredients and note quality considerations for key ingredients. All quantities must scale with the stated servings.`,
        deepInstruction: `Generate a fully scaled ingredient list for the requested serving size, grouped by category. For each key ingredient, explain its functional role - what it does in the dish, not just what it is. Identify the single ingredient where quality most determines the final result and explain why. For substitutable ingredients, name the replacement and explain what property it preserves or sacrifices.`,
        required: true,
      },
      {
        name: "Preparation",
        label: "Preparation",
        skillInstruction: `Cover all preparation tasks before heat is applied: ingredient prep, marination, soaking, mise en place. Explain why each timed step matters for this dish specifically - not just that it should be done. Indicate which steps can be completed in advance.`,
        deepInstruction: `Explain preparation steps with the mechanism behind each one - why it changes the dish's outcome, not just what to do. For any commonly skipped step, name the specific consequence of skipping it and the mechanism behind that consequence. Indicate which steps can be done ahead and any quality trade-off involved.`,
        required: true,
      },
      {
        name: "Cooking Process",
        label: dishLabel("Cooking Process"),
        skillInstruction: `Walk through the cooking stages in logical order, using sensory checkpoints - colour, sound, texture, aroma - as doneness indicators rather than fixed timings. At critical points where mistakes are common, explain the error and correction within that stage. Never hardcode steps, timings, or temperatures as fixed values.`,
        deepInstruction: `Walk through each cooking stage with sensory checkpoints as primary doneness indicators and temperature or timing as secondary reference. For each critical stage, explain the underlying mechanism - Maillard reaction, protein denaturation, starch gelatinisation, moisture evaporation, fat rendering. At each point where cooks commonly misjudge, name the mistake, the mechanism, the consequence, and the recovery action. Include at least one decision point where the cook must read the pan and make a judgment call.`,
        required: true,
      },
      {
        name: "Tips and Mistakes",
        label: "Chef Tips & Common Mistakes",
        skillInstruction: `Share professional tips specific to this dish that improve the result, and highlight the most common mistakes with how to avoid or recover from them. Every tip must be specific to this dish - not generic cooking advice that applies to any recipe.`,
        deepInstruction: `Give rules for this dish each backed by the mechanism that makes them non-negotiable. Structure as: what the rule is -> why it matters at a chemical or structural level -> what fails without it -> how to recover. Cover texture, seasoning, and timing failure modes specific to this dish.`,
        required: true,
      },
      {
        name: "Quality Checks",
        label: "Quality Checks",
        skillInstruction: `Explain how to determine when the dish is correctly done: specific visual cues, texture tests, aroma indicators, and taste checks. Distinguish "ready" from "needs more time" in observable, testable terms. Cover signs of undercooking and overcooking.`,
        deepInstruction: `Provide testable sensory markers that confirm correct execution: a specific visual signal with a comparator (not vague terms like "looks golden"), a physical texture test (a specific action and what it should feel like), and an aroma or taste indicator (a named compound or note). If resting benefits the dish, explain the mechanism. Make "ready to serve" versus "needs more time" explicitly distinguishable.`,
        required: true,
      },
      {
        name: "Serving",
        label: "Serving & Presentation",
        skillInstruction: `Describe how the finished dish should look, smell, and feel when correctly executed. Include a plating note specific to this dish and suggest appropriate accompaniments.`,
        deepInstruction: `Describe the sensory profile of a correctly executed dish and include a plating suggestion specific to this dish. Explain what the appearance, aroma, and texture communicate as quality signals - not just aesthetics - and what the accompaniments contribute to the overall experience.`,
        required: true,
      },
      {
        name: "Storage",
        label: "Storage & Reheating",
        skillInstruction: `Cover storage duration for fridge and freezer where applicable, the best reheating method for this dish, and any texture or flavour changes to anticipate. Note if any components should be stored separately.`,
        deepInstruction: `Explain what happens to the dish's texture, flavour, and structure during storage and why the recommended conditions slow that degradation. For reheating, explain the best method and the mechanism behind why it preserves quality for this specific dish. Flag components that degrade differently and how to handle them separately.`,
        required: true,
      },
      {
        name: "Variations",
        label: "Recipe Variations",
        skillInstruction: `Offer variations relevant to common dietary preferences or cooking contexts: vegetarian, vegan, gluten-free, high-protein, quick version, restaurant-style, or authentic version - selecting the most relevant options for this dish and the user's context.`,
        deepInstruction: `Offer 2-3 meaningful variations that teach rather than just list alternatives. For each, explain the specific change, the mechanism behind how it alters the dish's character, and the resulting difference in flavour or texture. Ensure at least one variation addresses a common dietary restriction relevant to this dish.`,
        required: true,
      },
      {
        name: "Troubleshooting",
        label: "Troubleshooting",
        skillInstruction: `Explain how to recover from common failures specific to this dish - overcooked protein, over-salted sauce, broken emulsion, mushy texture, under-seasoned result - with the specific corrective action for each. Every failure mode must be specific to this dish.`,
        deepInstruction: `Cover common failure modes for this dish with the mechanism behind each and the specific recovery action. For each failure, explain what went wrong at a culinary or chemical level and what the cook can do to salvage the dish or prevent the failure at the critical decision point.`,
        required: true,
      },
      {
        name: "Scaling",
        label: "Scaling & Customization",
        skillInstruction: `Explain how to scale this recipe for different serving sizes while maintaining correct ratios. Cover any technique adjustments required when scaling significantly up or down - not every element scales linearly (spice intensity, cooking time, vessel size).`,
        deepInstruction: `Cover scaling with the non-linear considerations most home cooks overlook: spice intensity, cooking time, vessel size, and heat distribution all behave differently at different scales. Explain how the technique may need to adapt and what the cook should watch for when scaling significantly up or down.`,
        required: true,
      },
    ];

    return sections;
  }

  // -- FITNESS TRAINING - v5 (14-section framework, true system prompt voice) ----
  if (intentCategory === "fitness_training") {
    const goalSubject = extractTrainingGoalSubject(userText);
    const goalLabel   = (suffix) => goalSubject ? `${goalSubject} ${suffix}` : suffix;

    // Goal type detection - drives persona, framework, and section content
    const isFatLoss      = /\b(fat[\s-]loss|weight[\s-]loss|lose[\s-]weight|cut(?:ting)?|slim|burn[\s-]fat|calorie[\s-]deficit)\b/i.test(userText);
    const isHypertrophy  = /\b(hypertrophy|muscle[\s-]gain|bulk(?:ing)?|build[\s-]muscle|mass|size)\b/i.test(userText);
    const isStrength     = /\b(strength|powerlifting|deadlift|squat[\s-]max|bench[\s-]max|1rm|powerlifter|strongman)\b/i.test(userText);
    const isMobility     = /\b(mobility|flexibility|stretching|yoga|range[\s-]of[\s-]motion|joint[\s-]health|posture|movement[\s-]quality)\b/i.test(userText);
    const isEndurance    = /\b(endurance|running|marathon|half[\s-]marathon|5k|10k|cycling|swimming|triathlon|stamina|aerobic)\b/i.test(userText);
    const isSport        = /\b(sport|athletic|crossfit|functional[\s-]fitness|agility|speed|conditioning|sport[\s-]specific)\b/i.test(userText);
    const isRehab        = /\b(rehab|rehabilitat|injur(?:y|ies|ed)|chronic[\s-]pain|corrective|physical[\s-]therapy|postpartum|postnatal)\b/i.test(userText);
    const isSenior       = /\b(senior|elder(?:ly)?|6[0-9][\s-]year|7[0-9][\s-]year|older[\s-]adult|aging)\b/i.test(userText);
    const isWomensHealth = /\b(pcos|hormonal[\s-]health|postpartum|postnatal|menopause|women[\s-]specific|female[\s-]specific)\b/i.test(userText);
    const isHome         = /\b(home|no[\s-]equipment|bodyweight|no[\s-]gym|minimal[\s-]equipment)\b/i.test(userText);
    const isBeginner     = /\b(beginner|never[\s-]worked[\s-]out|first[\s-]time|starter|new[\s-]to[\s-]fitness|getting[\s-]started)\b/i.test(userText);

    const goalNote = isFatLoss
      ? "The user's primary goal is fat loss - the programme must support a caloric deficit, prioritise adherence, and treat nutrition as equally important as training."
      : isHypertrophy
      ? "The user's primary goal is muscle gain - the programme must prioritise mechanical tension, progressive volume overload, and recovery quality."
      : isStrength
      ? "The user's primary goal is strength - the programme must centre on compound lifts, structured intensity progression, and neural fatigue management."
      : isMobility
      ? "The user's primary goal is mobility or movement quality - the programme must prioritise range of motion, tissue preparation, and joint health over load."
      : isEndurance
      ? "The user's primary goal is endurance - the programme must structure aerobic base development, intensity zones, and progressive session length with adequate recovery."
      : isSport
      ? "The user wants sport-specific or functional performance - the programme must address conditioning, movement quality, and the physical demands of their activity."
      : isRehab
      ? "The user has a rehabilitation or injury context - the programme must prioritise pain-free movement, corrective work, and gradual load progression."
      : isSenior
      ? "The user is an older adult - the programme must prioritise joint safety, balance, bone density, and functional strength over maximal loading."
      : isWomensHealth
      ? "The user has a women's health context - the programme must account for hormonal considerations and any postpartum or PCOS-specific adaptations."
      : "";

    const personaNote = isStrength
      ? "The expert persona is a strength or powerlifting coach with a background in periodisation and competition programming."
      : isHypertrophy
      ? "The expert persona is a sports scientist or hypertrophy coach with an evidence-based bodybuilding background."
      : isFatLoss
      ? "The expert persona is a body composition coach with expertise in fat loss, metabolic adaptation, and sustainable habit design."
      : isMobility
      ? "The expert persona is a movement specialist or physiotherapist with expertise in mobility, flexibility, and corrective exercise."
      : isEndurance
      ? "The expert persona is an endurance coach with a background in running, cycling, or triathlon programming."
      : isSport
      ? "The expert persona is a certified strength and conditioning coach with sport-specific programming experience."
      : isRehab
      ? "The expert persona is a rehabilitation specialist or physiotherapist with corrective exercise expertise."
      : isSenior
      ? "The expert persona is a certified senior fitness specialist with expertise in safe, functional programming for older adults."
      : isWomensHealth
      ? "The expert persona is a women's health and fitness coach with expertise in hormonal health, postpartum, or PCOS-adapted programming."
      : "The expert persona must match the specific training goal and user profile - not a generic personal trainer.";

    const sections = [
      {
  name: "Coach Role",
  label: "Your Role as Coach",
  skillInstruction: `Assume the most appropriate fitness professional role based on the user's goal - not a generic personal trainer. ${personaNote} Tailor explanations to the user's experience level. This role applies throughout the entire response - do not repeat it.${goalNote ? `\n\nGoal context: ${goalNote}` : ""}

  Expand this section to 100–140 words. Write as detailed instructions TO the other model (not the final plan). Explicitly tell it what concrete content to produce for the user: include example numbers, sample structure, named methods, and what level of detail is required. Full paragraphs. Never leave this section as a thin one-liner.`,
  deepInstruction: `Establish a specific coaching identity matched to the user's goal and profile. ${personaNote} Open with one counter-intuitive insight about this goal grounded in a physiological mechanism. This identity applies throughout - do not restate it in any section.${goalNote ? `\n\nGoal context: ${goalNote}` : ""}${hasUserAnswers ? "\n\nThe user has provided specific context - weave it into guidance throughout, not in a single block." : ""}`,
  required: true,
},
      {
        name: "User Assessment",
        label: "User Assessment & Training Context",
        skillInstruction: `Identify the following before making any programme decisions: primary goal, current experience level, age, available training days per week, session duration available, equipment access, any medical conditions or injuries, and lifestyle constraints. Never assume if information is missing - state the assumption and its rationale. Derive every programme decision from these inputs.${hasUserAnswers ? "\n\nThe user has already provided some of this context - reference it explicitly as the basis for every decision." : ""}`,
        
        deepInstruction: `Conduct a structured intake assessment before any programming: goal, training age, experience level, weekly availability, equipment, health constraints, and lifestyle factors. Every subsequent programme decision must be explicitly traceable to one or more of these inputs. Where information is absent, state the assumption and explain why it is appropriate for this goal and context.${hasUserAnswers ? "\n\nMake every programme decision explicitly traceable to the user's stated inputs." : ""}`,
        required: true,
      },
      {
        name: "Training Strategy",
        label: goalLabel("Training Strategy Overview"),
        skillInstruction: `Explain the overall training approach and justify why it fits the user's goal. Name the training methodology and the physiological rationale for choosing it over alternatives. Explain what primary adaptation is being targeted and how the programme design serves it.`,
        deepInstruction: `Explain the strategic training approach with the physiological reasoning behind every structural decision. Why does this methodology produce results for this specific goal and profile? What is the primary adaptation being driven - neural, muscular, cardiovascular, hormonal - and how does the programme design serve it? What are the trade-offs compared to alternative approaches?`,
        required: true,
      },
      {
        name: "Programme Structure",
        label: goalLabel("Programme Structure"),
        skillInstruction: `Determine dynamically - from the user's profile - the programme duration, weekly training frequency, training split, session length, and recovery allocation. All structural decisions must be derived from the user's stated inputs. Never use fixed templates or pre-filled programme structures.`,
        deepInstruction: `Derive the programme structure from the user's profile with explicit reasoning for each decision. Why this frequency for this goal and experience level? What is the recovery logic behind the split? What would change with higher frequency or a different structure, and why is the chosen approach the better fit for this specific user?`,
        required: true,
      },
      {
        name: "Exercise Selection",
        label: "Exercise Selection Principles",
        skillInstruction: `Select exercises based on goal, experience level, available equipment, mobility, and any injury constraints. Cover the balance between compound and isolation movements, movement pattern coverage, and exercise substitutions. Never hardcode specific exercise names - explain the selection principles instead.${isHome ? "\n\nAll exercise selection must respect the user's equipment constraints." : ""}${isRehab || isSenior ? "\n\nFlag movement patterns requiring modification for this user's profile and explain the safe alternative." : ""}`,
        deepInstruction: `Explain exercise selection as a decision framework: which movement patterns are non-negotiable for this goal, how to balance compound and isolation work, how equipment constraints shape selection, and how exercises should be sequenced within a session for this training type. For any movement carrying elevated risk for this user's profile, name the safe alternative and explain the physiological reasoning.${isHome ? "\n\nAll exercise selection must respect the user's equipment constraints - no gym-access assumptions." : ""}${isRehab || isSenior ? "\n\nFor each movement pattern requiring modification, explain the physiological reason and the safe alternative." : ""}`,
        required: true,
      },
      {
        name: "Workout Design",
        label: goalLabel("Workout Design"),
        skillInstruction: `Design each training session with purpose: session type, exercise categories, rep and set ranges appropriate for the goal and experience level, rest periods, and intensity guidance. All values must be generated dynamically from the user's profile - never fixed templates. Explain the purpose of each session type within the weekly structure.`,
        deepInstruction: `Design each session with the physiological rationale for every structural element: why these rep ranges for this goal, why these rest periods, why this exercise order. All intensity, volume, and density parameters must be derived from the user's profile. Explain what adaptation each session type is designed to drive.`,
        required: true,
      },
      {
        name: "Progression",
        label: goalLabel("Progression Strategy"),
        skillInstruction: `Explain how to progress over time for this specific goal: when to increase load, volume, or density; what observable signal triggers a progression; and when NOT to progress. Include a deload strategy - when it is needed and what it should look like for this training type.`,
        deepInstruction: `Teach progression as a decision framework: when to increase load versus volume versus density and the physiological reason for each priority at different stages. What specific observable signal confirms readiness to progress? When should the user hold or deload, and what is the physiological mechanism behind productive deloading versus simply resting?`,
        required: true,
      },
      {
        name: "Nutrition",
        label: goalLabel("Nutrition Guidance"),
        skillInstruction: `Generate nutrition guidance from the user's goal, body weight, activity level, and dietary preferences. Cover caloric approach derived from the goal, protein target as a formula (never a fixed number), carbohydrates, fats, and meal timing relative to training. All values must be derived from user inputs - never hardcoded.${isFatLoss ? "\n\nAddress sustainability - explain why aggressive deficits are counterproductive for this training goal." : ""}${isHypertrophy ? "\n\nExplain the role of energy availability in muscle protein synthesis." : ""}`,
        deepInstruction: `Explain each nutrition recommendation with the physiological mechanism behind it. Why does this caloric approach serve this goal? What happens to training adaptation without adequate protein? How does meal timing affect the training stimulus and recovery for this modality? Protein target as a formula only - never a fixed gram amount. Include one named nutritional risk specific to this goal with a mitigation strategy.${isFatLoss ? "\n\nExplain metabolic adaptation, muscle loss risk, and performance degradation at aggressive deficits - not just behavioural adherence." : ""}${isHypertrophy ? "\n\nExplain the relationship between energy availability, muscle protein synthesis, and the consequence of training for hypertrophy in too large a caloric deficit." : ""}`,
        required: true,
      },
      {
        name: "Recovery",
        label: "Recovery & Injury Prevention",
        skillInstruction: `Cover recovery as a programme component: sleep requirements for this training goal, warm-up and cool-down protocols, mobility work, signs of insufficient recovery specific to this training type, and what to do when recovery is compromised. Include injury prevention guidance relevant to this goal.${isRehab ? "\n\nInclude specific guidance for the user's injury or rehabilitation context." : ""}`,
        deepInstruction: `Explain recovery as a physiological process: which systems are under stress from this training type, how long each takes to recover, and how the programme design accounts for this. Cover under-recovery signals specific to this goal and the specific programming response to each signal. Explain the deload mechanism: what is happening physiologically during a deload that makes it productive rather than just passive rest?${isRehab ? "\n\nAddress the rehabilitation context specifically - safe progression, pain-free movement criteria, and when to escalate to professional guidance." : ""}`,
        required: true,
      },
      {
        name: "Progress Tracking",
        label: goalLabel("Progress Tracking"),
        skillInstruction: `Define how progress should be measured for this specific goal: performance markers, body composition markers where relevant, endurance or strength indicators, and adherence markers. Each marker must be testable without a coach and clearly distinguish "on track" from "needs adjustment." Explain how to respond if progress stalls.`,
        deepInstruction: `Define progress markers that confirm physiological adaptation, not just attendance or effort. For each marker, explain what it is measuring and why it is the right indicator for this goal. Include checkpoint logic: when to assess, what a missed checkpoint means, and what specific programming adjustment should follow if the marker is not met.`,
        required: true,
      },
      {
        name: "Coaching Tips",
        label: "Coaching Tips & Common Mistakes",
        skillInstruction: `Cover common mistakes specific to this goal and training type - not generic fitness advice. Include technique cues for key movements, consistency and motivation strategies relevant to this user's context, and recovery tips. Every insight must be specific to this goal.`,
        deepInstruction: `Cover common failure modes specific to this goal with the mechanism behind each and the specific corrective action. Include at least one technique failure, one programming mistake, and one adherence failure relevant to this training type. Explain why each mistake is particularly common for this goal and demographic.`,
        required: true,
      },
      {
        name: "Modifications",
        label: "Programme Modifications & Alternatives",
        skillInstruction: `Adapt the programme for relevant constraints stated by the user: home workouts, limited equipment, travel, senior fitness, post-injury, pregnancy or postpartum, PCOS, or other stated constraints. Every modification must be explained with reasoning, not just listed.${isHome ? "\n\nHome and bodyweight adaptations are required for this user." : ""}${isRehab || isSenior || isWomensHealth ? "\n\nAdaptations for the user's specific health context are required." : ""}`,
        deepInstruction: `Explain the specific modifications required for the user's constraints with the physiological or practical reasoning behind each adaptation. For any modification that changes the training stimulus, explain the trade-off and what the user should expect differently from the adjusted programme.${isHome ? "\n\nExplain the training stimulus trade-offs of home and bodyweight training compared to gym-based training." : ""}${isRehab || isSenior || isWomensHealth ? "\n\nFor each health-context modification, explain the physiological reason and the expected impact on results." : ""}`,
        required: true,
      },
      {
        name: "Safety",
        label: "Safety Considerations",
        skillInstruction: `Cover when to stop exercising, warning signs to watch for during training, exercise categories or movements to avoid given any stated constraints, and when to recommend professional medical advice before proceeding.`,
        deepInstruction: `Address safety at the level of the user's specific profile and training context. Cover warning signs that indicate the workout should stop immediately, contraindications specific to any stated health conditions or injuries, and clear guidance on when professional medical consultation is warranted. Explain why each safety consideration applies to this specific training type and profile.`,
        required: true,
      },
      {
        name: "Lifestyle",
        label: "Lifestyle & Habit Building",
        skillInstruction: `Include daily movement guidance, habit formation strategies, stress and sleep management relevant to this training load, and long-term sustainability guidance appropriate for this user's goal and lifestyle.`,
        deepInstruction: `Address the lifestyle factors that determine long-term adherence for this user. Cover daily movement habits, sleep hygiene in the context of this training load and its effect on recovery and adaptation, stress management as a physiological recovery variable, and the habit design principles that make this specific programme sustainable for this user's profile.`,
        required: true,
      },
    ];

    return sections;
  }

  // -- CONTENT WRITING ----------------------------------------------------------
  if (intentCategory === "content_writing") {
    const sections = [
      {
        name: "Expert Role",
        label: "Your Expert Role",
        skillInstruction: `Specific content strategist/writer identity - niche, platform expertise, years, ONE content principle or rule you always apply first.\nNEVER: "You are a content expert." Name the content type, the audience, and your go-to first move.`,
        deepInstruction: `Vivid content expert identity - niche, platform, experience.\n\nâ  NON-OBVIOUS MISTAKE: "The biggest mistake I see with [this content type] is [specific structural/strategic error experienced writers still make]." Why it happens -> what it costs (low engagement/poor SEO/missed conversions) -> fix.\n(2) TRADE-OFF: "The central trade-off is [SEO vs readability / depth vs shareability / brand voice vs conversion]." What to prioritise for this specific use case.\n(3) COUNTER-INTUITIVE ORDERING: What most writers draft first vs what actually determines whether content succeeds.`,
        required: true,
      },
      {
        name: "Content Goal",
        label: "Content Goal & Audience",
        skillInstruction: `One paragraph: exact content goal (inform/convert/entertain/rank), target audience (specific, not "everyone"), and the single measurable success criterion.\nWeave in platform, tone, and any detected constraints.`,
        deepInstruction: `One paragraph: content goal, specific audience persona, success criterion.\n${hasUserAnswers ? "MANDATE: Reference the user's stated audience, platform, and goal from their answers." : ""}`,
        required: true,
      },
      {
        name: "Structure",
        label: "Content Structure",
        skillInstruction: `Named sections/components of the content piece, in order.\nFor each section: name + one-line description of what it contains + its job (hook/explain/convert/close).\nFormat: **[Section name]:** [what it contains] - Purpose: [job it does]`,
        deepInstruction: `Named sections in order, each with:\n**[Section Name]:** [what it contains + why this order works]\nFormat: **[Section]:** [content] - Job: [hook/explain/validate/convert/close]\n\nInclude: word count allocation per section (total must match target).`,
        required: true,
      },
      {
        name: "Key Numbers",
        label: "Content Benchmarks",
        skillInstruction: `Markdown table: target word count / reading time / keyword density (if SEO) / CTA count / ideal publish frequency.\nAll numbers specific to this content type and platform.`,
        deepInstruction: `Markdown table of content performance parameters.\nFormat: | Parameter | Target |\nMust include: word count, reading time, headline CTR benchmark, engagement rate target, publication cadence.\n${hasUserAnswers ? "MANDATE: Include current baseline if user stated existing metrics." : ""}`,
        required: true,
      },
      {
        name: "Distribution",
        label: "Distribution & Promotion",
        skillInstruction: `3-5 specific distribution actions: where to publish, how to promote, when to post.\nName actual platforms, tools, and timing - not "share on social media".\nOne direct recommendation about the highest-ROI channel for this content.`,
        deepInstruction: `5-7 specific distribution actions with platform, timing, and format.\nInclude: primary channel, repurposing strategy (what format, which platform), and one paid promotion trigger (when organic reach justifies boosting).\nWARNING:  Risk: [specific distribution failure for this content type]. Mitigation: [named action].`,
        required: true,
      },
      {
        name: "Ground Rules",
        label: "Content Rules",
        skillInstruction: `4-5 direct rules for this content type:\n"Never [X]", "Always [Y]", "If [Z] then [W]"\nCovers: tone, structure, SEO, and one platform-specific rule.`,
        deepInstruction: `4-5 direct rules specific to this content type and platform.\n\nMANDATORY - 3 NAMED RISKS:\n"WARNING:  Risk: [specific content failure mode - poor hook, SEO cannibalisation, tone mismatch]. Mitigation: [named fix]."`,
        required: true,
      },
      {
        name: "What Good Looks Like",
        label: "What Good Content Looks Like",
        skillInstruction: `3 criteria written as "This content succeeds when..." - measurable, not subjective.\nCovers: audience response, performance metric, and business outcome.`,
        deepInstruction: `3 criteria as "This content succeeds when..." - measurable, platform-specific.\n\n${framework === "strategic"
          ? `"**30-day benchmark:** [specific traffic or engagement metric]. If not hit, [specific content or distribution adjustment]."\n"**90-day benchmark:** [compounding outcome]."\n"**What comes next:** [next content asset or campaign to build on this]."` 
          : `Final criterion: a performance metric specific to this platform and content type.`}`,
        required: true,
      },
    ];
    if (isDeepMode) {
      sections.push({
        name: "Next 3 Actions",
        label: "Your Next 3 Actions",
        skillInstruction: null,
        deepInstruction: `3 specific actions to move from brief to published:\n1. [Research/outline action] - you - [deadline]\n2. [Draft action - what to write first] - you - [deadline]\n3. [Publishing/distribution action] - you - [deadline]\n\nFormat: "N. [Specific action] - [who] - [deadline]"\nBAD: "Start writing your content." TOO VAGUE.`,
        required: true,
      });
    }
    return sections;
  }

  // -- TUTORIAL -----------------------------------------------------------------
  if (intentCategory === "tutorial" || isTutorial) {
    const sections = [
      {
        name: "Expert Role",
        label: "Your Expert Role",
        skillInstruction: `Name the TECHNOLOGY and MINI-PROJECT in this section.\nSpecific educator/developer identity - language/framework specialisation, years of teaching, ONE pedagogical principle you always apply.\nNEVER: "You are an experienced developer." Name the exact tech stack and the project.`,
        deepInstruction: `Name the TECHNOLOGY and MINI-PROJECT explicitly.\n\nâ  COUNTER-INTUITIVE ORDERING: "Most tutorials teach [X] before [Y] - that's wrong. [Y] must come first because [learning mechanism]."\n(2) NON-OBVIOUS MISTAKE (3-4 sentences): "The biggest mistake I see in [this type of tutorial] is [specific instructional error experienced devs still make]." Why it happens -> what it costs (learner confusion/dropout) -> the fix.\n(3) TRADE-OFF: "The central trade-off is thoroughness vs momentum. [Specific version - e.g. 'explaining every React concept before a line renders'] kills completion rates. [What to do instead]."`,
        required: true,
      },
      {
        name: "What You're Here to Do",
        label: "What You're Here to Do",
        skillInstruction: `One tight paragraph: exact goal, starting point (assumed knowledge), success = deployed, portfolio-ready project reader can put on GitHub TODAY.\nWeave in tech stack and project name.`,
        deepInstruction: `One tight paragraph: goal, assumed prior knowledge, what success looks like (deployed, GitHub-ready, demonstrable).\n${hasUserAnswers ? "MANDATE: Reference user's stated skill level and environment from their answers." : ""}`,
        required: true,
      },
      {
        name: "Core Focus Areas",
        label: "Your Core Focus Areas",
        skillInstruction: `3-5 bullets: what reader must BE ABLE TO DO by the end. Demonstrable, not just knowable.\nFormat: "- [Skill/capability]: [how it's demonstrated in the project]"`,
        deepInstruction: `3-5 bullets: demonstrable capabilities the reader gains.\nEach bullet = something the reader can show in the project or explain in an interview.\nBAN: "understand", "learn about" - use "build", "implement", "configure", "deploy".`,
        required: true,
      },
      {
        name: "How to Approach This",
        label: "Tutorial Structure",
        skillInstruction: `Structure: **Setup & First Win** -> **Core Concepts with Running Code** -> **Build the Full Project** -> **Deploy & Share**\nEach phase: timeframe + what the reader has working at the end.\nFormat: **[Phase Name] ([timeframe]):** [what happens] -> Output: [runnable thing]`,
        deepInstruction: `Session-based phases:\n**Setup & First Win ([time]):** -> Output: [first running screen]\n**Core Concepts with Running Code ([time]):** -> Output: [key feature working]\n**Build the Full Project ([time]):** -> Output: [complete app]\n**Ship & What's Next ([time]):** -> Output: [deployed URL + next tutorial pointer]\n\nEach phase produces something RUNNABLE. No phase ends in "now you understand X."`,
        required: true,
      },
      {
        name: "Key Numbers",
        label: "Key Numbers & Benchmarks",
        skillInstruction: `Markdown table - REQUIRED rows: tutorial word count, read time (SEPARATE row), build time (SEPARATE - NEVER combined), code examples count, deployment time.\nFormat: | Parameter | Value |`,
        deepInstruction: `Markdown table - REQUIRED rows (all separate):\n| Tutorial word count | |\n| Read time | |\n| Build time | |\n| Code examples | |\n| Deployment time | |\n| Tech stack | |\nNEVER combine read time and build time.`,
        required: true,
      },
      {
        name: "What to Deliver",
        label: "What to Deliver",
        skillInstruction: `Name every output: the guide (word count, sections), code examples (count + platform), mini-project (what it does, stack, where it deploys), "What's Next" pointing to 2-3 specific follow-on tutorials.`,
        deepInstruction: `Name every output with format + specification:\n- The written guide: word count, section breakdown\n- Code examples: count + repo structure\n- Mini-project: name + what it does + tech stack + deployment URL\n- "What's Next": 2-3 named follow-on projects in order of difficulty`,
        required: true,
      },
      {
        name: "Ground Rules",
        label: "Tutorial Rules",
        skillInstruction: `Must include:\n- Every concept gets a runnable code example - no concept without code\n- Tutorial cannot end without the reader deploying something real\n- Read time â  build time - always state both separately\nAdd 2-3 more rules specific to this technology.`,
        deepInstruction: `Must include:\n- Every concept gets a runnable code example\n- Tutorial ends with a deployed, GitHub-ready project\n- Read time and build time stated separately - always\n\nMANDATORY - 3 NAMED RISKS:\n"WARNING:  Risk: [specific point where learners drop off in this tech stack]. Mitigation: [named structural fix]."`,
        required: true,
      },
      {
        name: "What Good Looks Like",
        label: "What Good Looks Like",
        skillInstruction: `3 criteria written as "The work must..."\nFinal criterion: "The work must produce a reader who can deploy their own variation of the mini-project from scratch without referring back to the tutorial."`,
        deepInstruction: `3 criteria as "The work must..." - observable, verifiable.\nFinal criterion: "The work must produce a reader who can deploy their own variation of the mini-project from scratch without referring back to the tutorial."\nOther 2: one about code quality signal, one about reader comprehension test.`,
        required: true,
      },
    ];
    if (isDeepMode) {
      sections.push({
        name: "Next 3 Actions",
        label: "Your Next 3 Actions",
        skillInstruction: null,
        deepInstruction: `3 first steps to begin writing this tutorial:\n1. [Technology/project decision action] - you - today\n2. [Setup action - scaffold the code repo] - you - Day 1\n3. [Outline action - map all code examples needed] - you - before writing starts\n\nFormat: "N. [Specific action] - [who] - [deadline]"`,
        required: true,
      });
    }
    return sections;
  }

  // -- AI IMAGE ------------------------------------------------------------------
  if (intentCategory === "ai_image") {
    const sections = [
      {
        name: "Expert Role",
        label: "Your Expert Role",
        skillInstruction: `Name the specific AI tool, your go-to parameter combination, and your acceptance criteria rule.\nNEVER mention DSLR, camera settings, tripod, or physical lighting setups.\nYou are an AI prompt director - not a photographer.`,
        deepInstruction: `Name the specific AI tool (${tool}), version, and your go-to parameter set for this exact use case.\n\nâ  COUNTER-INTUITIVE ORDERING: "Most people spend 80% of prompt-engineering time on [X]. That's wrong - [Y] is the variable that kills outputs. Fix [Y] first."\n(2) NON-OBVIOUS MISTAKE: "The biggest mistake I see here is [tool-specific error, not generic]. Why it happens -> what it costs -> fix."\n(3) TRADE-OFF: "The central trade-off is [specificity vs flexibility / style lock-in vs iteration speed]."`,
        required: true,
      },
      {
        name: "What You're Here to Do",
        label: "What You're Here to Do",
        skillInstruction: `One paragraph: exact use case (product shots/portraits/scenes), platform format, and success = a consistent prompt library that passes acceptance criteria at least 1 in 4 generations.`,
        deepInstruction: `One paragraph: use case, platform/format, and what a working prompt system looks like.\n${hasUserAnswers ? "MANDATE: Reference user's stated tool version, style direction, and use case." : ""}`,
        required: true,
      },
      {
        name: "Core Focus Areas",
        label: "Your Core Focus Areas",
        skillInstruction: `4 bullets - each an AI-specific skill or workflow deliverable:\n- Prompt Anatomy: the 5 elements every prompt needs\n- Style Parameter Library: named --flags for this use case\n- Iteration Framework: how to go from first output to usable in 3 rounds\n- Quality Filter: the specific acceptance test`,
        deepInstruction: `4-5 bullets - tool-specific skills:\n- Prompt Anatomy: subject + surface + light + mood + aspect ratio\n- Style Parameter Library: named --flags and when to use each\n- Iteration Framework: first output -> portfolio-ready in 3 rounds\n- Quality Filter: acceptance test (not "looks good" - named criteria)\n- Style Consistency: how to maintain look across a catalogue`,
        required: true,
      },
      {
        name: "How to Approach This",
        label: "How to Approach This",
        skillInstruction: `3-4 phases:\n**Anchor Prompt ([timeframe]):** -> Output: [style reference prompt]\n**Parameter Library ([timeframe]):** -> Output: [named --flags guide]\n**Iteration Workflow ([timeframe]):** -> Output: [3-round refinement process]\n**Catalogue Build ([timeframe]):** -> Output: [consistent prompt library]`,
        deepInstruction: `3-4 implementation phases:\n**[Phase] ([timeframe]):** [what happens] -> Deliverable: [named output]\n\nPhase 1: establish anchor prompt before building anything else.\nFinal phase: what the user does AFTER the initial catalogue is built.`,
        required: true,
      },
      {
        name: "Key Numbers",
        label: "Key Numbers & Benchmarks",
        skillInstruction: `Markdown table - REQUIRED rows: optimal prompt length (words), iterations to portfolio-ready, acceptance rate target, recommended --ar for this platform, --chaos value for product shots, style consistency metric.\nAll numbers specific to ${tool}.`,
        deepInstruction: `Markdown table - REQUIRED (${tool}-specific):\n| Optimal prompt length | |\n| Iterations to portfolio-ready | |\n| Acceptance rate target | |\n| Recommended --ar | |\n| --chaos value | |\n| Style consistency benchmark | |`,
        required: true,
      },
      {
        name: "What to Deliver",
        label: "What to Deliver",
        skillInstruction: `Name every output: prompt template library (count + format), style reference bank (count + source), acceptance criteria doc (pass vs regenerate), platform-specific aspect ratio guide.`,
        deepInstruction: `Name every output with format + count:\n- Prompt template library: how many templates + format\n- Style reference bank: number of images + source method\n- Acceptance criteria doc: what passes vs regenerates\n- Platform-specific --ar cheat sheet`,
        required: true,
      },
      {
        name: "Ground Rules",
        label: "Ground Rules",
        skillInstruction: `Must include:\n- Never use prompt length over 80 words - longer reduces subject focus in ${tool}\n- Always establish a style anchor prompt before building a catalogue\n- If --v6 produces modern aesthetics for a vintage brief, add --style raw + --sref\n- Never judge a prompt on the first generation - run 4 outputs minimum`,
        deepInstruction: `Must include the 4 core rules for ${tool} above.\n\nMANDATORY - 3 NAMED RISKS (tool-specific failure modes only):\n"WARNING:  Risk: [${tool}-specific failure - style drift/version defaults/catalogue inconsistency]. Mitigation: [named parameter or workflow fix]."\nNEVER generic photography risks.`,
        required: true,
      },
      {
        name: "What Good Looks Like",
        label: "What Good Looks Like",
        skillInstruction: `3 criteria as "The work must..."\nFinal criterion: "The work must produce a prompt library where any prompt generates a usable image at least 1 in every 4 generations - without adjusting prompt structure between products."`,
        deepInstruction: `3 criteria as "The work must..."\nFinal criterion: "The work must produce a prompt library where any prompt generates a usable image (passing the acceptance criteria) at least 1 in every 4 generations - without adjusting prompt structure between products."\nOther 2: style consistency test and catalogue completeness test.`,
        required: true,
      },
    ];
    if (isDeepMode) {
      sections.push({
        name: "Next 3 Actions",
        label: "Your Next 3 Actions",
        skillInstruction: null,
        deepInstruction: `3 immediate actions - all ${tool}-specific:\n1. [Anchor prompt action - test ONE product/subject with 4 variations] - you alone - Day 1\n2. [Parameter library action - document which --flags work for this use case] - you alone - Day 3\n3. [Acceptance criteria action - define pass/fail before building the catalogue] - you alone - before Day 5\n\nFormat: "N. [Specific action] - [who] - [deadline]"`,
        required: true,
      });
    }
    return sections;
  }

  // -- DEBUGGING / OPERATIONAL ---------------------------------------------------
  if (intentCategory === "debugging" || framework === "operational") {
    const sections = [
      {
        name: "Expert Role",
        label: "Your Expert Role",
        skillInstruction: `Specific diagnostic expert identity - technology, years of debugging experience, ONE diagnostic principle you always apply first (eliminate before you fix).\nName the most common misdiagnosis for this type of problem.`,
        deepInstruction: `Diagnostic expert identity - technology stack, incident response experience.\n\nâ  MISDIAGNOSIS TRAP: "The most common misdiagnosis here is [X]. People waste hours chasing [X] when [Y] is the actual root cause."\n(2) COST OF WRONG ROOT CAUSE: "Chasing the wrong cause costs [specific time/consequence]."\n(3) DIAGNOSTIC PRINCIPLE: "I always [specific first step] before touching any configuration - here's why."`,
        required: true,
      },
      {
        name: "Problem Statement",
        label: "Problem Statement",
        skillInstruction: `One paragraph: exact symptom, when it started, environment (OS/framework/version), and what's been tried.\nIf constraints are known, reference them directly.`,
        deepInstruction: `One paragraph: exact symptom, environment, reproduction steps, what's been tried.\n${hasUserAnswers ? "MANDATE: Reference the user's stated error message, stack, and environment from their answers." : ""}`,
        required: true,
      },
      {
        name: "Diagnostic Steps",
        label: "Diagnostic Steps",
        skillInstruction: `Numbered steps ordered by likelihood of root cause.\nEach step: what to check -> what a pass looks like -> what a fail means -> next step.\nFormat: **Step N - [Check name]:** [command or action] -> Pass: [what it means] -> Fail: [what it means]`,
        deepInstruction: `Ordered diagnostic sequence - most likely root cause first.\nFormat: **Step N - [Check]:** [exact command or action] -> Pass: [what passing looks like] -> Fail: [what this means, next step]\n\nStop when you find the culprit - don't run all steps if an early one fails.`,
        required: true,
      },
      {
        name: "Resolution",
        label: "Resolution Steps",
        skillInstruction: `For each likely root cause: the exact fix.\nFormat: **If [root cause]:** [specific command or code change] -> Verification: [how to confirm it's resolved]`,
        deepInstruction: `Resolution map: root cause -> exact fix -> verification.\nFormat: **If [root cause identified in Step N]:** [specific fix - command, config change, code edit] -> Verification: [exact test that confirms resolution]\n\nInclude rollback instruction if the fix could create new issues.`,
        required: true,
      },
      {
        name: "Key Numbers",
        label: "Diagnostic Benchmarks",
        skillInstruction: `Markdown table: typical resolution time / most common root cause (%) / tools needed / log location(s).\nSpecific to this technology/error type.`,
        deepInstruction: `Markdown table of diagnostic parameters.\n| Parameter | Value |\nMust include: typical resolution time, most likely root cause, tools needed, relevant log paths.`,
        required: true,
      },
      {
        name: "Ground Rules",
        label: "Debugging Rules",
        skillInstruction: `4-5 direct debugging rules:\n"Never [X] without [Y first]", "Always [check Z] before changing config"\nCovers: isolation principle, version pinning, rollback, logging.`,
        deepInstruction: `4-5 direct rules for this debugging scenario.\n\nMANDATORY - 3 NAMED RISKS:\n"WARNING:  Risk: [specific misdiagnosis or fix-that-makes-it-worse]. Mitigation: [named check before acting]."\nZERO strategic planning language.`,
        required: true,
      },
      {
        name: "What Good Looks Like",
        label: "Resolution Signal",
        skillInstruction: `3 criteria as "The issue is resolved when..." - observable test results.\nNO milestones, NO business metrics, NO day/week targets.\nFinal criterion: the clean-state test.`,
        deepInstruction: `3 criteria as "The issue is resolved when..." - specific, testable.\nEach criterion: an exact test or output that confirms resolution.\nFinal criterion: the system-state test that confirms clean resolution without side effects.\nZERO milestone or business language.`,
        required: true,
      },
      {
        name: "Next 3 Actions",
        label: "Your Next 3 Actions",
        skillInstruction: null,
        deepInstruction: `3 immediate investigation actions - specific commands or checks:\n1. [First check - most likely root cause] - you - immediately\n2. [Second check - if Step 1 passes] - you - within the hour\n3. [Escalation or logging action - if neither resolves it] - you - before anything else\n\nFormat: "N. [Specific command or action] - [who] - [deadline]"\nZERO strategic or planning language.`,
        required: true,
      },
    ];
    return sections;
  }

  // -- MARKETING GROWTH ----------------------------------------------------------
  if (intentCategory === "marketing_growth") {
    const sections = [
      {
        name: "Expert Role",
        label: "Your Expert Role",
        skillInstruction: `Specific growth/marketing expert identity - channel specialisation, years, ONE framework or rule you always apply first.\nNEVER: "You are a marketing expert." Name the specific channel and your go-to first diagnostic.`,
        deepInstruction: `Vivid marketing expert identity - channel, methodology, experience.\n\nâ  COUNTER-INTUITIVE ORDERING: "Most brands start with [X] - wrong. [Y] must be working before [X] is worth a rupee."\n(2) NON-OBVIOUS MISTAKE (3-4 sentences): "The biggest mistake I see here is [specific, experienced-marketer-level error]." Why -> cost (wasted spend/missed CAC) -> fix.\n(3) TRADE-OFF: "The central trade-off is [reach vs conversion / brand vs performance / paid vs organic]." What to prioritise for this stage and budget.`,
        required: true,
      },
      {
        name: "What You're Here to Do",
        label: "What You're Here to Do",
        skillInstruction: `One paragraph: exact marketing goal (leads/sales/awareness/retention), target audience persona (specific, not "everyone"), and the single measurable success criterion.\nWeave in budget, timeline, and platform if detected.`,
        deepInstruction: `One paragraph: goal, specific audience persona, success criterion with a number.\n${hasUserAnswers ? "MANDATE: Reference the user's stated budget, audience, and channel from their answers." : ""}`,
        required: true,
      },
      {
        name: "Core Focus Areas",
        label: "Your Core Focus Areas",
        skillInstruction: `3-5 bullets - distinct marketing workstreams with named outputs:\n"- [Channel/Tactic]: [specific output - what gets built or decided]"\nBAN: "Monitor performance" -> name the metric and the action it triggers.`,
        deepInstruction: `3-5 bullets - named marketing workstreams:\n"- [Channel/Tactic]: [specific output] - measured by: [named metric]"\nBAN: "Monitor and analyze" without a named metric and action threshold.`,
        required: true,
      },
      {
        name: "How to Approach This",
        label: "How to Approach This",
        skillInstruction: `3-4 phases with bold labels and timeframes.\nFormat: **[Phase Name] ([timeframe]):** [actions] -> Output: [named deliverable]\nPhase 1 = foundation (what must exist before spending). Final phase = retention/LTV, not just acquisition.`,
        deepInstruction: `${framework === "strategic"
          ? `3-4 phases:\n**[Phase Name] ([timeframe]):** [what happens] -> Deliverable: [named output]\nPhase 1: Foundation - what must exist before any spend or content goes live.\nFinal phase: MANDATORY POST-GOAL PHASE - what happens after first acquisition goal is hit (LTV expansion, referral, retention).`
          : `3-4 implementation phases:\n**[Phase Name] ([timeframe]):** [what happens] -> Deliverable: [named output]\nFinal phase = what user does after campaign is live.`}`,
        required: true,
      },
      {
        name: "Key Numbers",
        label: "Key Numbers & Benchmarks",
        skillInstruction: `Markdown table: 4-6 rows with real channel benchmarks.\nMust include: CAC target, conversion rate benchmark, ROAS target (if paid), CPL, organic vs paid traffic split.\nPull from domain benchmarks - never invent.`,
        deepInstruction: `Markdown table - channel-specific benchmarks.\nFormat: | Parameter | Target / Benchmark |\nMust include: CAC, conversion rate, ROAS (if paid), CPL, content volume target, audience growth rate.\n${hasUserAnswers ? "MANDATE: Include 'Current baseline' row if user stated existing metrics." : ""}\n${framework === "strategic" ? "Add 30-day and 90-day target rows - must match milestones in What Good Looks Like exactly." : ""}`,
        required: true,
      },
      {
        name: "What to Deliver",
        label: "What to Deliver",
        skillInstruction: `Every deliverable: the thing + its format + its purpose.\nName: content assets, campaign setup, tracking infrastructure, reporting cadence.\nNO vague deliverables like "marketing materials".`,
        deepInstruction: `Every deliverable with format + specification + purpose:\n- Content assets: type + count + format\n- Campaign setup: platform + targeting spec\n- Tracking: tools + metrics + reporting cadence\n- Creative: format + specs + testing plan`,
        required: true,
      },
      {
        name: "Ground Rules",
        label: "Ground Rules",
        skillInstruction: `4-5 direct marketing rules specific to this channel and goal:\n"Never [X]", "Always [Y]", "If [Z] then [W]"\nCovers: budget allocation, creative testing, attribution, and one platform-specific rule.`,
        deepInstruction: `4-5 direct rules specific to this channel and goal.\n\nMANDATORY - 3 NAMED RISKS:\n"WARNING:  Risk: [specific channel/campaign failure mode]. Mitigation: [named action]."\nCovers: attribution failure, creative fatigue, budget misallocation.`,
        required: true,
      },
      {
        name: "What Good Looks Like",
        label: "What Good Looks Like",
        skillInstruction: `3 criteria as "The campaign/strategy succeeds when..." - measurable with named metrics.\nFinal criterion: a long-term efficiency signal (not just campaign completion).`,
        deepInstruction: `3 criteria as "The campaign succeeds when..."\n\n${framework === "strategic"
          ? `"**30-day milestone:** [specific metric - leads/sales/CAC]. If not hit, [specific channel or creative adjustment]."\n"**90-day milestone:** [sustained efficiency metric with number]."\n"**What comes next:** [specific next growth lever to activate]."` 
          : `Final criterion: a channel efficiency signal that confirms the approach is working.`}`,
        required: true,
      },
    ];
    if (isDeepMode) {
      sections.push({
        name: "Next 3 Actions",
        label: "Your Next 3 Actions",
        skillInstruction: null,
        deepInstruction: `3 specific actions to launch this campaign/strategy:\n1. [Foundation action - must exist before anything else] - you alone - Day 1\n2. [Creative/content action - first asset to build] - you alone - Day 3\n3. [Tracking/measurement action - must be live before spend starts] - you alone - before Week 1 ends\n\nFormat: "N. [Specific action] - [who] - [deadline]"`,
        required: true,
      });
    }
    return sections;
  }

  // -- FINANCE / INVESTMENT ------------------------------------------------------
  if (intentCategory === "finance_investment") {
    const sections = [
      {
        name: "Expert Role",
        label: "Your Expert Role",
        skillInstruction: `Specific financial expert identity - domain (equity/real estate/personal finance/tax), years, ONE investment principle or rule you always apply first.\nName the most common mistake at this stage of the user's financial journey.`,
        deepInstruction: `Financial expert identity - domain, experience, methodology.\n\nâ  COUNTER-INTUITIVE ORDERING: "Most people [invest/plan/do X] before [Y is sorted]. That's the wrong order - [Y] failure makes [X] worthless."\n(2) NON-OBVIOUS MISTAKE: "The biggest mistake I see at this stage is [specific error experienced investors still make]." Why -> cost (in â¹ or %) -> fix.\n(3) TRADE-OFF: "The central trade-off is [return vs liquidity / diversification vs concentration / tax efficiency vs yield]." What to prioritise here.`,
        required: true,
      },
      {
        name: "Financial Goal",
        label: "Financial Goal & Starting Point",
        skillInstruction: `One paragraph: exact goal (corpus/income/tax saving), timeline, current situation, and the single most important decision to make first.\nWeave in any detected constraints (income, risk appetite, existing portfolio).`,
        deepInstruction: `One paragraph: goal with number + timeline, current financial situation, and priority decision.\n${hasUserAnswers ? "MANDATE: Reference the user's stated income, risk appetite, and timeline from their answers." : ""}`,
        required: true,
      },
      {
        name: "Strategy",
        label: "Investment Strategy",
        skillInstruction: `Named strategy with asset allocation (%).\n3-5 bullets - each a named instrument or action with rationale and allocation %.\nNo generic advice. Name actual products (Nifty 50 index fund, ELSS, PPF - not "equity funds").`,
        deepInstruction: `Named strategy with specific asset allocation.\nFor each instrument: name + allocation % + rationale + recommended product (not category).\nInclude: emergency fund status check before any investment begins.\nWARNING:  Risk: [specific allocation risk for this goal/timeline]. Mitigation: [named rebalancing trigger].`,
        required: true,
      },
      {
        name: "How to Approach This",
        label: "Implementation Phases",
        skillInstruction: `3-4 phases with timeframes.\nFormat: **[Phase Name] ([timeframe]):** [actions] -> Output: [named decision or account setup]\nPhase 1 = foundation (emergency fund + insurance before investing).`,
        deepInstruction: `3-4 implementation phases:\n**[Phase Name] ([timeframe]):** [what happens] -> Deliverable: [named account/decision/allocation done]\nPhase 1: non-negotiable foundation before any market exposure.\n${framework === "strategic" ? "Final phase: MANDATORY - what happens after the primary goal is achieved (corpus built, next goal activation)." : ""}`,
        required: true,
      },
      {
        name: "Key Numbers",
        label: "Key Numbers & Benchmarks",
        skillInstruction: `Markdown table: target corpus / monthly SIP amount / expected CAGR / time to goal / tax saving (if applicable).\nAll numbers specific and derived from stated goal - not invented.`,
        deepInstruction: `Markdown table - goal-specific numbers.\nFormat: | Parameter | Value |\nMust include: target corpus, monthly SIP, expected CAGR (realistic range), time to goal, tax liability, emergency fund target.\n${hasUserAnswers ? "MANDATE: If user stated current savings/income, include 'Current baseline' row." : ""}`,
        required: true,
      },
      {
        name: "Ground Rules",
        label: "Investment Rules",
        skillInstruction: `4-5 direct financial rules specific to this goal and risk profile:\n"Never [X] before [Y is in place]", "Always [rebalance when Z]"\nCovers: diversification, liquidity, tax, and one emotion-management rule.`,
        deepInstruction: `4-5 direct rules specific to this goal.\n\nMANDATORY - 3 NAMED RISKS:\n"WARNING:  Risk: [specific financial failure mode - inflation gap, liquidity crunch, tax drag]. Mitigation: [named action]."\nNOTE: This is educational - not personalised financial advice. Recommend consulting a SEBI-registered advisor for specific decisions.`,
        required: true,
      },
      {
        name: "What Good Looks Like",
        label: "What Good Looks Like",
        skillInstruction: `3 criteria as "The strategy is on track when..." - measurable, date-anchored.\nFinal criterion: a long-term portfolio health signal.`,
        deepInstruction: `3 criteria as "The strategy is on track when..."\n\n${framework === "strategic"
          ? `"**12-month checkpoint:** [specific portfolio milestone]. If not on track, [specific rebalancing action]."\n"**Goal milestone:** [corpus or income target with number]."\n"**What comes next:** [next financial goal to activate after this one is on track]."` 
          : `Final criterion: a portfolio health signal specific to this goal and timeline.`}`,
        required: true,
      },
    ];
    if (isDeepMode) {
      sections.push({
        name: "Next 3 Actions",
        label: "Your Next 3 Actions",
        skillInstruction: null,
        deepInstruction: `3 specific financial actions to start immediately:\n1. [Foundation action - emergency fund or insurance check] - you alone - this week\n2. [Account setup action - specific platform/broker] - you alone - Day 3\n3. [First investment action - specific instrument + amount] - you alone - by end of Week 1\n\nFormat: "N. [Specific action] - [who] - [deadline]"\nNOTE: Consult a SEBI-registered advisor before executing.`,
        required: true,
      });
    }
    return sections;
  }

  // -- CAREER / JOB --------------------------------------------------------------
  if (intentCategory === "career_job") {
    const sections = [
      {
        name: "Expert Role",
        label: "Your Expert Role",
        skillInstruction: `Specific career/HR expert identity - industry specialisation, years, ONE job-search or career-development principle you always apply first.\nName the most overlooked factor in getting hired for this type of role.`,
        deepInstruction: `Career expert identity - industry, methodology, experience.\n\nâ  NON-OBVIOUS MISTAKE: "The biggest mistake I see in [this career move] is [specific error experienced job-seekers still make]." Why -> cost (rejection/missed opportunities) -> fix.\n(2) TRADE-OFF: "The central trade-off is [speed vs targeting / breadth vs depth / visible achievements vs soft skills]." What to prioritise here.\n(3) COUNTER-INTUITIVE ORDERING: What to optimise before updating the resume.`,
        required: true,
      },
      {
        name: "Career Goal",
        label: "Career Goal & Starting Point",
        skillInstruction: `One paragraph: exact career move (role + seniority + industry), current position/background, and the single most important thing to demonstrate to get this role.\nWeave in timeline and any constraints.`,
        deepInstruction: `One paragraph: target role + seniority + industry, current background, primary hiring signal to develop.\n${hasUserAnswers ? "MANDATE: Reference the user's stated experience, target role, and timeline from their answers." : ""}`,
        required: true,
      },
      {
        name: "Core Focus Areas",
        label: "Your Core Focus Areas",
        skillInstruction: `3-5 bullets - named job-search workstreams:\n"- [Workstream]: [specific output - resume section/portfolio piece/network action]"\nBAN: "Improve your skills" -> name the specific skill and how to demonstrate it.`,
        deepInstruction: `3-5 bullets - named workstreams:\n"- [Workstream]: [specific output] - signal: [what this proves to a hiring manager]"\nBAN vague actions. Name the exact artefact or demonstration.`,
        required: true,
      },
      {
        name: "How to Approach This",
        label: "Job Search Strategy",
        skillInstruction: `3-4 phases with timeframes.\nFormat: **[Phase Name] ([timeframe]):** [actions] -> Output: [named deliverable - resume version/portfolio/outreach list]\nPhase 1 = positioning before applications start.`,
        deepInstruction: `3-4 phases:\n**[Phase Name] ([timeframe]):** [actions] -> Deliverable: [named output]\nPhase 1: positioning + materials - must be done before any applications go out.\n${framework === "strategic" ? "Final phase: MANDATORY - what happens after the role is secured (90-day plan, performance acceleration)." : ""}`,
        required: true,
      },
      {
        name: "Key Numbers",
        label: "Job Search Benchmarks",
        skillInstruction: `Markdown table: applications per week / response rate benchmark / interview conversion rate / typical hiring timeline / offer negotiation success rate.\nAll numbers realistic for this role level and industry.`,
        deepInstruction: `Markdown table of job-search metrics.\nFormat: | Parameter | Benchmark |\nMust include: applications per week, response rate, interview rate, typical hiring timeline, salary range for target role.\n${hasUserAnswers ? "MANDATE: Include user's current salary as 'Current baseline' if stated." : ""}`,
        required: true,
      },
      {
        name: "Ground Rules",
        label: "Job Search Rules",
        skillInstruction: `4-5 direct job-search rules:\n"Never [apply without X]", "Always [customise Y per application]"\nCovers: application quality, LinkedIn optimisation, interview prep, salary negotiation.`,
        deepInstruction: `4-5 direct rules for this career move.\n\nMANDATORY - 3 NAMED RISKS:\n"WARNING:  Risk: [specific job-search failure mode - ghosting, wrong positioning, weak portfolio]. Mitigation: [named action]."\nCovers: application quality, network leverage, interview execution.`,
        required: true,
      },
      {
        name: "What Good Looks Like",
        label: "What Good Looks Like",
        skillInstruction: `3 criteria as "The job search is working when..." - observable milestones.\nFinal criterion: the offer signal, not just activity.`,
        deepInstruction: `3 criteria as "The search is working when..."\n\n${framework === "strategic"
          ? `"**30-day milestone:** [specific activity or response metric]. If not hit, [specific tactic change]."\n"**60-day milestone:** [interview stage reached]."\n"**What comes next:** [how to prepare for and negotiate the offer]."` 
          : `Final criterion: a response-rate or interview-rate signal that confirms the positioning is working.`}`,
        required: true,
      },
    ];
    if (isDeepMode) {
      sections.push({
        name: "Next 3 Actions",
        label: "Your Next 3 Actions",
        skillInstruction: null,
        deepInstruction: `3 immediate job-search actions:\n1. [Positioning action - update or reframe the core value proposition] - you alone - today\n2. [Materials action - specific resume or portfolio update] - you alone - Day 3\n3. [Outreach action - first 10 specific companies or contacts] - you alone - by end of Week 1\n\nFormat: "N. [Specific action] - [who] - [deadline]"`,
        required: true,
      });
    }
    return sections;
  }

  // -- GENERIC FALLBACK (business_strategy, data_analytics, health_wellness, ----
  // -- education_learning, design_ux, event_planning, general_project, etc.) ----
    // ── GENERIC FALLBACK - adaptive labels (change with prompt/domain) ──────────
  const L = buildAdaptiveLabels(intentCategory, framework, intentCategory, userText);

  const genericSections = [
    {
      name: "Expert Role",
      label: L.role,
      skillInstruction: `Specific expert identity - name specialisation, years, ONE concrete method or rule you always apply first.\nPattern: "You are a [role] with [X] years of [specific experience]. Your first move is always [named action] because [concrete reason]."\nNEVER: "You are an expert with extensive experience" - too generic.`,
      deepInstruction: `Vivid, specific expert identity. Name specialisation, years, ONE concrete method or rule.\n\nThis section must contain ALL THREE in flowing prose:\n\n(1) COUNTER-INTUITIVE ORDERING:\n"Most [people/practitioners] do [X] first - that's the wrong order. [X] is a distraction until [Y] is solved. Start with [Y] because [specific mechanism]."\n\n(2) NON-OBVIOUS MISTAKE (3-4 sentences - expanded):\n"The biggest mistake I see here is [SPECIFIC mistake that experienced practitioners still make - not beginner-obvious]."\nThen: why it happens -> what it costs (specific consequence) -> the fix (named alternative action).\n\n(3) UNCOMFORTABLE TRADE-OFF (2-3 sentences):\n"The central trade-off here is [X vs Y]. [Why X is the trap]. [What to do instead and why]."`,
      required: true,
    },
    {
      name: "What You're Here to Do",
      label: L.goal,
      skillInstruction: `One tight paragraph: exact goal, current starting point, success in concrete terms.\nWeave in detected constraints. Be specific about the outcome. Include one direct assertion.`,
      deepInstruction: `One tight paragraph: exact goal, starting point, success in concrete terms.\n${hasUserAnswers ? "MANDATE: Reference the user's specific situation from their answers - their numbers, stage, constraints." : "Weave in detected constraints naturally."}`,
      required: true,
    },
    {
      name: "Core Focus Areas",
      label: L.focus,
      skillInstruction: `3-5 bullets. Each: named workstream + concrete output.\nFormat: "- [Named Area]: [specific action/output - what gets built or decided]"\nBANNED:\n- "Monitor and analyze performance" -> name the specific metric + action it triggers\n- "Ensure alignment with goals" -> name a deliverable or decision`,
      deepInstruction: `3-5 bullets - distinct, named workstreams with concrete outputs.\nBANNED (rewrite if any appear):\n- "Monitor and analyze performance" -> name the specific metric + the action it triggers\n- "Integrate user feedback" -> name the specific mechanism\n- "Ensure alignment with goals" -> name a deliverable or decision`,
      required: true,
    },
    {
      name: "How to Approach This",
      label: L.approach,
      skillInstruction: framework === "procedural" || framework === "operational"
        ? `NUMBERED STEPS - not phases with week/month labels.\nFormat: **Step N - [Step Name]:** [what to do] -> Visible result: [what you can verify/test]\nEach step produces something runnable, visible, or testable.`
        : `3-4 phases with **bold phase label** + timeframe.\nFormat: **[Phase Name] ([timeframe]):** [actions] -> Output: [named deliverable]\nUse realistic week/sprint timing. Each phase has ONE named output.\nBANNED phase verbs: 'explore', 'consider', 'look into', 'research options'`,
      deepInstruction: framework === "procedural"
        ? `NUMBERED STEPS - not phases.\nFormat: **Step N - [Step Name]:** [what to do] -> Visible result: [what you can verify/test]\nEach step must leave the reader with something runnable, visible, or testable.\nBANNED: 'Day 1', 'Week 1', 'Phase', '30-day', '90-day', milestone language.`
        : framework === "operational"
        ? `ORDERED DIAGNOSTIC SEQUENCE.\nFormat: **Step N - [Check]:** [command or action] -> Pass: [what it means] -> Fail: [what it means]\nOrder steps from most-likely root cause to least likely.\nBANNED: timeline language, phases, milestones.`
        : framework === "phased"
        ? `3-4 implementation phases:\nFormat: **[Phase Name] ([timeframe]):** [what happens] -> Deliverable: [named, concrete output]\nPhase timeframes (e.g., Week 1-2). Final phase = what user does AFTER project is complete.\nBANNED: 30-day milestones, 90-day KPI targets, business revenue milestones in phase labels.`
        : `MANDATORY: 3-4 phases:\nFormat: **[Phase Name] ([timeframe]):** [what happens] -> Deliverable: [named, concrete output]\nPHASE STRUCTURE:\n- Phase 1: Foundation - the thing BEFORE everything else\n- Phase 2: Build/execute - core work\n- Phase 3: Launch/validate - first real-world test with a metric\n- PHASE 4 - MANDATORY POST-GOAL PHASE: What happens AFTER the main goal.\n  NOT optional. A real plan always addresses "then what?"\nBANNED: 'explore', 'consider'. Every phase has a named output.`,
      required: true,
    },
    {
      name: "Key Numbers",
      label: L.numbers,
      skillInstruction: `Markdown table, 4-6 rows. Every row has a real, specific number.\nFormat: | Parameter | Target / Benchmark |\nPull numbers ONLY from DOMAIN BENCHMARKS above. Never invent.\nBANNED rows: "Success metric: achieve project goals", any row with a made-up placeholder.`,
      deepInstruction: framework === "strategic"
        ? `Markdown table. Every row has a real, specific number. No ranges wider than 3x.\nFormat: | Parameter | Target / Benchmark |\n4-6 rows from DOMAIN BENCHMARKS above.\n${hasUserAnswers ? "MANDATE: If user provided a current metric, it appears as a 'Current baseline' row." : ""}\nAdd 30-day and 90-day target rows - must match milestones in What Good Looks Like exactly.\nBANNED: invented numbers, vague placeholders.`
        : `Markdown table - real, specific numbers relevant to this ${framework === "operational" ? "resolution process" : "implementation"}.\nFormat: | Parameter | Target / Benchmark |\n${hasUserAnswers ? "MANDATE: If user provided a current metric, it appears as a 'Current baseline' row." : ""}\nBANNED: invented numbers, 30-day milestones, 90-day targets, business KPIs (this is a ${framework} task).`,
      required: true,
    },
    {
      name: "What to Deliver",
      label: L.deliver,
      skillInstruction: `Every deliverable: the thing + its format + its purpose in one line. Nothing vague.`,
      deepInstruction: `Every deliverable: the thing + its format + its purpose. Nothing vague.\nFor each: name, format/medium, and how it will be used by the end user.`,
      required: true,
    },
    {
      name: "Ground Rules",
      label: L.rules,
      skillInstruction: `4-5 direct rules as 'Never X', 'Always Y', or 'If Z then W'.\nEach rule addresses a real failure mode for THIS specific domain.\nInclude the 2-3 most common failure modes and the rule that prevents each.`,
      deepInstruction: `4-5 direct rules as 'Never X', 'Always Y', or 'If Z then W'.\n\nMANDATORY - 3 NAMED RISKS with ${framework === "strategic" ? "Week 1" : "immediate"} mitigations:\nFormat: "WARNING: Risk: [specific failure mode in this domain - not generic]. Mitigation: [one concrete ${framework === "strategic" ? "Week 1" : "first"} action]."\n\nDOMAIN EXPERT TEST per risk: "Would a generalist identify this without domain experience?" If yes -> too generic.\nBAD: "WARNING: Risk: Poor planning leads to delays."\nGOOD pattern: "WARNING: Risk: [Specific mechanism that fails at THIS stage in THIS domain] - [consequence with number/timeline]. Mitigation: [Named document, tool, or decision]."\nEach of the 3 risks must be a DIFFERENT type of failure (e.g. technical, process, market/audience).\n${hasUserAnswers ? "MANDATE: At least 2 of 3 risks must name a specific detail from the user's answers." : ""}`,
      required: true,
    },
    {
      name: "What Good Looks Like",
      label: L.good,
      skillInstruction: `3 criteria written as "The work must [observable, measurable outcome]."\nEach criterion verifiable by a third party. If you cannot measure it, rewrite it.\nMake criteria specific to this domain - not "The work must be comprehensive and high quality."`,
      deepInstruction: framework === "strategic"
        ? `MANDATORY - all 4 elements:\n\n1. 3 criteria as "The work must..." - concrete, observable, measurable by a third party.\n\n2. "**30-day milestone:** [specific number or shipped artifact]. If not hit, [specific corrective action] immediately."\nGOOD: "30-day milestone: 10 paying customers at >2% conversion. If not hit, pause paid ads and focus entirely on CRO."\nBAD: "30-day milestone: Good early progress." (no number, no corrective action)\n\n3. "**90-day milestone:** [sustained outcome with a number - proof the strategy is working]."\n\n4. "**What comes next:** [specific named project, tool, or system to build - NOT a vague process]."\n\n${hasUserAnswers ? "MANDATE: Use the user's specific numbers from their answers to set milestones." : ""}`
        : `3 criteria as "The work must..." - concrete, observable, measurable by a third party.\nEach criterion verifiable by a third party.\n${framework === "phased"
          ? `Final criterion: a concrete completion signal.\nDo NOT include 30-day milestones, 90-day goals, or business KPI targets.`
          : `Final criterion: a resolution signal - what passing looks like.\nDo NOT include milestones, day/week targets, or business metrics.`}`,
      required: true,
    },
  ];

  if (isDeepMode) {
    genericSections.push({
      name: "Next 3 Actions",
      label: L.next,
      skillInstruction: null,
      deepInstruction: `MANDATORY - 3 actions only. Each must:\n- Name the specific task (the actual thing, not a category)\n- Name who does it (user, developer, "you alone")\n- Name the deadline (${framework === "strategic" || framework === "phased" ? "Day 1, Day 3, by end of Week 1" : "immediately, within the hour, before anything else"} - not "soon" or "ASAP")\n\nFormat: "1. [Specific action] - [who] - [deadline]"\nGOOD: "1. [Named first action with a specific output] - you alone - by Day 3"\nBAD: "1. Start working on your strategy" (not specific, no owner, no deadline)\n\nThese 3 actions are the bridge between reading this brief and actually starting.`,
      required: true,
    });
  }

  return genericSections;
}

// -----------------------------------------------------------------------------
// JSON TEMPLATE + SECTION WRITING BLOCK
// -----------------------------------------------------------------------------

function buildJsonTemplate(schema) {
  const sectionPlaceholders = schema
    .map(s => `**${s.label}**\\n...`)
    .join("\\n\\n");
  return `{"optimizedText":"${sectionPlaceholders}","suggestions":["one-line alt 1","one-line alt 2","one-line alt 3"]}`;
}

function buildSectionWritingBlock(schema, isDeepMode) {
  const mode = isDeepMode ? "DEEP MODE" : "SKILL MODE";
  const count = schema.length;
  const instructionKey = isDeepMode ? "deepInstruction" : "skillInstruction";

  const sectionBlocks = schema.map(s => {
    const instruction = s[instructionKey] || s.skillInstruction || "";
    return `**${s.label}**\n${instruction}`;
  }).join("\n\n");

  return `----------------------------------------------------
CRITICAL - READ THIS BEFORE WRITING ANYTHING:

You are writing a SYSTEM PROMPT for another AI (ChatGPT).
You are NOT answering the user. You are NOT writing the recipe/plan/guide itself.

[NO] WRONG - this is a direct answer (do NOT write this):
**Ingredients**
- 2 cups rice, 1 cup urad dal, 1/2 tsp fenugreek seeds...
**Step-by-Step Method**
Step 1 - Soak the rice for 6 hours in water.

[OK] CORRECT - this is a system prompt (write THIS):
**Ingredients**
You are a chef. Provide the user with a complete ingredient list for this dish grouped as:
- Main ingredients - exact quantities for the stated serving size
- Spices & Seasonings - in grams or tsp
- Garnish - optional items only
**Step-by-Step Method**
You are a chef. Walk the user through cooking this dish with numbered steps.
Each step: **Step N - [Name]:** [one clear action] -> Done when: [sensory signal]

RULE: Every line must be a directive to the other model - "You are...", "Provide the user...", "Walk the user...", "Instruct the user..." - NEVER write actual content.

----------------------------------------------------
WRITE THESE ${count} SECTIONS IN ORDER [${mode}]:
----------------------------------------------------

${sectionBlocks}`;
}

// -----------------------------------------------------------------------------
// buildEnrichedSystemPrompt
// -----------------------------------------------------------------------------
async function buildEnrichedSystemPrompt(userText, options = {}) {
  const perfHandle = perfStart("buildEnrichedSystemPrompt");

  const { domainId, subcategoryId, subcategoryLabel, deepAnswers, skillMode, deepMode, resolvedDomain } = options;

  const modeLabel = !skillMode ? "Normal Mode" : deepMode ? "Deep Mode" : "Skill Mode";

  // -- Resolve domain ---------------------------------------------------------
  let domain = null;
  if (domainId) domain = DOMAINS.find(d => d.id === domainId) || null;

  if (!domain) {
    const namedTool = detectNamedTool(userText);
    if (namedTool?.id === "ai_image_gen") {
      domain = DOMAINS.find(d => d.id === "ai_image_gen") || null;
    }
  }

  if (!domain) domain = detectDomain(userText);

  if (!domain) {
    if (resolvedDomain) {
      domain = resolvedDomain;
    } else {
      domain = await getDynamicDomain(userText);
      if (domain) {
      }
    }
  }

  if (!domain) {
    const { UNIVERSAL_FALLBACK_DOMAIN } = require("./constants");
    domain = UNIVERSAL_FALLBACK_DOMAIN;
  }

  // -- Intent flags -----------------------------------------------------------
  const isWebsite  = detectWebsiteBuildIntent(userText);
  const isTutorial = detectTutorialIntent(userText) && !isWebsite;
  const hasEduCtx  = /\b(course|learn|teach|student|education|tutorial|lesson)\b/i.test(userText);
  const isHybrid   = isWebsite && hasEduCtx;
  const isAIImage  = domain?.id === "ai_image_gen";

  // -- Mode flags -------------------------------------------------------------
  const isSkillMode = !!(skillMode && !deepMode);
  const isDeepMode  = !!(skillMode && deepMode);

  // -- Request framework ------------------------------------------------------
  const requestFramework = (isSkillMode || isDeepMode)
    ? classifyRequestFramework(userText, domain?.id || null, isTutorial, isWebsite, isAIImage)
    : "strategic";

  // -- NORMAL MODE ------------------------------------------------------------
  if (!skillMode) {
    const prompt = `You are a helpful AI assistant. Transform the user's raw request into a clear, well-structured prompt that will produce high-quality, useful output.

USER REQUEST: "${userText}"

OUTPUT FORMAT - return a JSON object with exactly two keys:
  "optimizedText": a clear, improved version of the user's prompt as a single string
  "suggestions":   array of 3 alternative one-line phrasings

Return STRICT JSON ONLY - no markdown fences, no extra text:
{"optimizedText":"...","suggestions":["alt1","alt2","alt3"]}`;
    perfEnd(perfHandle);
    return prompt;
  }

  // -- Constraints ------------------------------------------------------------
  const autoConstraints = extractConstraints(userText);

  const userAnswers = (deepAnswers && typeof deepAnswers === "object")
    ? Object.entries(deepAnswers)
        .filter(([, v]) => v && String(v).trim())
        .map(([k, v]) => `- ${k.replace(/_/g, " ")}: ${v}`)
    : [];

  const allConstraints  = { ...autoConstraints, ...(deepAnswers || {}) };
  const constraintLines = Object.entries(autoConstraints)
    .filter(([, v]) => v && String(v).trim())
    .map(([k, v]) => `${k.replace(/_/g, " ")}: ${v}`);

  // -- Resolve role + knowledge + tone ---------------------------------------
  let expertRole, domainKnowledge, expertTone;

  if (isAIImage) {
    expertRole      = domain.role;
    domainKnowledge = domain.knowledge;
    expertTone      = domain.tone;
  } else if (isHybrid) {
    expertRole      = "hybrid EdTech Product Builder and full-stack developer with 10+ years shipping online learning platforms (Next.js, Supabase, Stripe) - you understand both the engineering and what makes students actually complete courses";
    const ed        = DOMAINS.find(d => d.id === "edtech_product");
    domainKnowledge = (domain?.knowledge || "") + (ed?.knowledge || "");
    expertTone      = "technical, product-focused, launch-oriented";
  } else if (isTutorial) {
    const tut       = DOMAINS.find(d => d.id === "technical_tutorial");
    expertRole      = tut?.role || "senior technical educator and developer advocate with 10+ years creating project-based coding tutorials";
    domainKnowledge = tut?.knowledge || "";
    expertTone      = "clear, encouraging, hands-on, beginner-friendly";
  } else if (domain) {
    expertRole      = domain.role;
    domainKnowledge = domain.knowledge;
    expertTone      = domain.tone;
  } else {
    expertRole      = "expert multi-domain AI consultant with deep knowledge across business, technology, marketing, education, finance, and creative domains";
    domainKnowledge = "";
    expertTone      = "professional, clear, immediately actionable";
  }

  // -- Travel agency business building override -------------------------------
  const isTravelAgencyBuild = detectBusinessBuildingIntent(userText) &&
    /\b(travel|tour|tourism)\b/i.test(userText);

  if (isTravelAgencyBuild) {
    expertRole = "boutique travel agency founder and D2C tourism business strategist with 12+ years launching niche travel brands - expert in positioning, safety-first design for women travellers, digital acquisition, and scaling from solo operator to team";
    domainKnowledge = `TRAVEL AGENCY STARTUP BENCHMARKS:
- Business registration (India): â¹5,000-â¹15,000 (sole proprietorship or LLP)
- IATA accreditation: optional for niche agencies; required for ticketing commission
- Niche positioning premium: 30-50% higher margins vs generic travel agencies
- Solo women travel market (India): growing 25% YoY - highest NPS segment in travel
- Customer acquisition: Instagram + SEO drives 60-70% of bookings for niche operators
- Average booking value: â¹25,000-â¹80,000 per solo woman traveller (domestic trip)
- First 10 customers: referral-only; first 50: organic content + community
- Safety infrastructure: 24/7 emergency contact + vetted accommodation policy = #1 trust signal
- Website conversion: booking inquiry form converts at 3-8% with testimonials + itinerary samples
- Scaling milestone: â¹10L MRR before hiring first operations coordinator`;
    expertTone = "entrepreneurial, safety-conscious, niche-market-savvy, community-first";
  }

  const expertRoleShort = expertRole.split(" with")[0];

  // -- Detect intent category -------------------------------------------------
  const intentCategory = detectIntentCategory(
    userText, domain?.id || null, isTutorial, isWebsite, isAIImage,
    requestFramework
  );


  if (intentCategory === "recipe_cooking") {
    expertRole      = "culinary expert and home cooking educator with 12+ years creating accessible, authentic recipes - specialisation: breaking down traditional techniques for home cooks without compromising flavour.";
    domainKnowledge = `CULINARY BENCHMARKS:\n- Sensory doneness cues per step (colour / texture / aroma)\n- 6-8 numbered steps optimal for home cooks\n- Flag the 2 steps where most cooks go wrong\n- Group ingredients: Main / Spices & Seasonings / Garnish\n- Serving size: 4-6 servings standard\n- Fridge shelf life: 2-4 days`;
    expertTone      = "warm, precise, instructional";
  }
  if (intentCategory === "fitness_training") {
    expertRole      = "certified strength and conditioning coach with 10+ years programming for beginner to intermediate athletes.";
    domainKnowledge = `FITNESS BENCHMARKS:\n- Progressive overload: increase load when all reps complete with 2 RIR for 2 consecutive sessions\n- Protein: 1.6-2.2g per kg body weight - give the formula, never pre-fill grams`;
    expertTone      = "direct, evidence-based, motivating";
  }

  // -- Build dynamic section schema - NOW PASSES userText (v3) ---------------
  const sectionSchema = buildSectionSchema(
    intentCategory, requestFramework, isDeepMode, isTutorial, isWebsite, isAIImage,
    allConstraints, userAnswers, userText  // -> v3: userText added as 9th argument
  );


  // -- Shared blocks ----------------------------------------------------------
  const techChoice = allConstraints.technology || null;

  const tutorialTechBlock = isTutorial ? `
BEFORE WRITING - COMMIT TO TWO DECISIONS:

Decision 1 - Technology:
${techChoice
  ? `User specified: ${techChoice}. Build the entire tutorial around this. Do not hedge.`
  : `Pick the single most appropriate technology:
   - Absolute beginner -> HTML + CSS (portfolio page, ~2-3 hr build)
   - Knows HTML/CSS -> Vanilla JavaScript (quiz or to-do app, ~3-4 hr build)
   - Knows JS basics -> React (weather app or GitHub profile viewer, ~4-6 hr build)
   - Data/backend interest -> Python (dashboard or web scraper, ~3-5 hr build)
   - Mobile -> React Native + Expo (habit tracker, ~5-8 hr build)
   COMMIT to one. Name it explicitly.`
}

Decision 2 - Mini-project (Deep Mode: NOT a generic portfolio, to-do list, or calculator):
Name a SPECIFIC, DEPLOYABLE project: ${isDeepMode ? "completable in 1-2 weekends (6-12 hrs)" : "completable in one sitting (2-6 hrs)"}, GitHub/portfolio-ready.

Deployment rules:
  - HTML/CSS/JS/React -> Netlify or Vercel
  - Python web app -> Render or Railway
  - Python data dashboard -> Streamlit Cloud
  - React Native -> Expo Go + EAS build
  Never send Python to Vercel. Never send React to Heroku.

State both decisions in "Your Expert Role" and carry through every section.
` : "";

  const aiImageBlock = isAIImage ? `
BEFORE WRITING - NOTE THE TOOL CONTEXT:
Tool detected: ${allConstraints.tool || "Midjourney"}
Platform/format: ${allConstraints.platform_type || "not specified - address in questions or assume Instagram 1:1"}
Style direction: ${allConstraints.style || "not specified"}
Experience level: ${allConstraints.skill_level || "not specified"}

AI IMAGE GENERATION RULES (apply to every section):
- Expert role, benchmarks, and ground rules must reference ${allConstraints.tool || "Midjourney"} specifically - not generic photography
- Benchmarks table uses: prompt iterations, acceptance rate, aspect ratio, style consistency - NOT aperture or tripod specs
- Ground rules reference tool-specific parameters (--style raw, --sref, --ar, --chaos)
- Risks must be tool-specific failure modes (style drift, version defaults, catalogue inconsistency)
- NEVER mention DSLR, camera settings, tripod, aperture, shutter speed, or physical lighting setups
` : "";

  const subcategoryFocus = subcategoryLabel
    ? `\nFOCUS: User selected "${subcategoryLabel}". Every section must serve this specific focus.\n`
    : "";

  const constraintsBlock = constraintLines.length > 0 ? `
AUTO-DETECTED CONTEXT (weave into every section):
${constraintLines.map(l => `- ${l}`).join("\n")}
` : "";

  const userAnswersBlock = (isDeepMode && userAnswers.length > 0) ? `
WHAT THE USER TOLD US (Deep Mode answers - reference DIRECTLY in output):
${userAnswers.join("\n")}
` : "";

  const techDomains = [
    "edtech_product","technical_tutorial","product_development","saas_product",
    "cloud_devops","mobile_app_development","no_code_tools","data_science_ai",
    "ai_automation","uiux_design","blockchain_web3","cybersecurity","ai_image_gen",
    "backend_architecture","linkedin_automation","gamified_fitness_app",
    "language_learning_app","ecommerce_store",
  ];
  const modernToolsBlock = (isWebsite || isTutorial || techDomains.includes(domain?.id)) && !isAIImage ? `
TOOL PALETTE - recommend with one concrete reason per choice:
Frontend:   Next.js 14, React 18, Vanilla JS, Tailwind CSS, shadcn/ui
Backend/DB: Supabase (Postgres+Auth+Storage), Neon, PlanetScale, Prisma ORM
Auth:       Supabase Auth, Clerk, Auth.js
Payments:   Stripe (global), Razorpay (India-first)
Video:      Mux or Bunny.net (NOT YouTube for gated content)
Deploy:     Vercel (JS/TS), Railway or Render (Python/Node), Streamlit Cloud (dashboards)
Mobile:     React Native + Expo, Flutter (brand-heavy)
Analytics:  PostHog (open source), Mixpanel, GA4
` : "";

  const knowledgeBlock = domainKnowledge
    ? `\nDOMAIN BENCHMARKS (use these numbers - don't invent your own):\n${domainKnowledge}\n`
    : "";

  // -- Build the JSON template from schema ------------------------------------
  const jsonTemplate = buildJsonTemplate(sectionSchema);

  // -- Section writing block from schema -------------------------------------
  const sectionWritingBlock = buildSectionWritingBlock(sectionSchema, isDeepMode);

  // ===========================================================================
  // SKILL MODE - SYSTEM PROMPT
  // ===========================================================================
  if (isSkillMode) {
    const sectionCount = sectionSchema.length;
    const headerExample = generateHeaderExample(sectionSchema);
    const headerList = generateHeaderList(sectionSchema);
    const requiredHeaders = sectionSchema.map(s => `**${s.label}**`).join('\n');

    const prompt = META_SYSTEM_PROMPT_FENCE + `You are an expert prompt engineer. Transform the user's request into a structured SYSTEM PROMPT that will be used to instruct another model.

WARNING: ï¸ CRITICAL: This is a SYSTEM PROMPT for another model.
You are NOT answering the user directly.
You are writing INSTRUCTIONS for how the other model should behave.

BAD: "As a chef, I can guide you..."
GOOD: "You are a chef. Your role is to guide users..."

BAD: "You will need the following ingredients..."
GOOD: "Generate a clear ingredients list for the user."

BAD: "Step 1 - Marinate the Chicken..."
GOOD: "Provide step-by-step cooking instructions in a clear sequence."

OUTPUT FORMAT - NON-NEGOTIABLE:
Return a JSON object with exactly two keys:
  "optimizedText": one continuous string with all ${sectionCount} sections using **Bold Label** headers
  "suggestions":   array of 3 alternative one-line phrasings

WRONG: {"Your Expert Role":"...","What to Deliver":"..."}
RIGHT: {"optimizedText":"${headerExample}","suggestions":["alt1","alt2","alt3"]}

----------------------------------------------------
WARNING: ï¸ CRITICAL SECTION HEADER RULE - DO NOT CHANGE THESE:
You MUST include EVERY section header exactly as shown below.
Do NOT skip, rename, or rephrase any section header.

${requiredHeaders}

For this request type (${intentCategory}), the headers MUST be exactly:
${headerList}

Bold label format: **Section Name** on its own line, content below.
No ## headers. No numbered sections.
----------------------------------------------------

USER REQUEST: "${userText}"
${subcategoryFocus}${constraintsBlock}${tutorialTechBlock}${aiImageBlock}${knowledgeBlock}${modernToolsBlock}
Tone of voice: ${expertTone}
Expert to embody: ${expertRole}

----------------------------------------------------
âââ MODE: SKILL MODE - Professional Practitioner Brief (SYSTEM PROMPT) âââ

WARNING: ï¸ REMINDER: This is a SYSTEM PROMPT for another model. Every section must instruct the model on HOW TO BEHAVE, not provide the final answer to the user.

PERSONA TO EMBODY: The model you are instructing should embody a ${expertRoleShort}. It has executed this type of work dozens of times. It does not hedge. It recommends. It prioritises. It names things specifically.

RULES FOR THE MODEL TO FOLLOW:
- Every section must serve the user's exact request - no generic filler
- Each recommendation must be immediately actionable
- Use practitioner-specific language - real tool names, actual numbers
- Each phase must have a named, concrete output
- Numbers and benchmarks must appear in at least 3 of the ${sectionCount} sections
- Use domain knowledge benchmarks above - never invent numbers
${isTutorial
  ? `- Scope: ONE sitting (2-5 hrs). Not weeks. A tutorial is NOT a course.
- Target: 1,500-2,200 words. State read time and build time SEPARATELY.
- Every concept gets a runnable code example.`
  : (intentCategory === "fitness_training" || intentCategory === "recipe_cooking")
    ? `- Target: 1,400-1,800 words total. Each of the ${sectionCount} sections must be 90-140 words — full paragraphs, concrete coaching detail, no thin 1–2 sentence summaries.`
    : `- Target: 580-740 words. Density over length.`
}

OPINION REQUIREMENT - ONE DIRECT ASSERTION PER SECTION:
The model must include at least one statement written as direct fact, not suggestion.
GOOD: "Don't use --v5 for product photography - --v6 with --style raw produces 3Ã more photorealistic outputs."
GOOD: "Never start with paid ads at sub-â¹1L/month budget - organic content compounding is 3Ã more capital-efficient for the first 90 days."
BAD:  "You may want to consider whether X is the right choice for you."
One direct assertion per section. Short. No hedging.

BANNED PHRASES (the model must rewrite anything containing these):
"comprehensive","high-quality","ensure","consider","look into","robust",
"leverage","best practices","it's important to","holistic","key takeaway",
"various","multiple","a number of","in conclusion"

${sectionWritingBlock}

----------------------------------------------------
Return STRICT JSON ONLY - no markdown fences, no preamble:
${jsonTemplate}`;

    perfEnd(perfHandle);
    return { prompt, sectionSchema };
  }

  // ===========================================================================
  // DEEP MODE - SYSTEM PROMPT
  // ===========================================================================

  const _fw = requestFramework;
  const headerListDeep = generateHeaderList(sectionSchema);
  const requiredHeadersDeep = sectionSchema.map(s => `**${s.label}**`).join('\n');

  const reasoningChainBlock = `
+==========================================================================+
|  INTERNAL REASONING - COMPLETE ALL STEPS BEFORE WRITING ANY SECTION    |
|  Steps 2, 3, 4 MUST surface explicitly in output sections.             |
|  Step 2 assumptions -> flag in Your Expert Role or Ground Rules.        |
|  Step 3 trade-off -> name explicitly in Your Expert Role.               |
|  Step 4 risks -> each becomes one WARNING:  Risk entry in Ground Rules.        |
+==========================================================================+

REQUEST FRAMEWORK DETECTED: ${_fw.toUpperCase()}
${_fw === "strategic"  ? "-> Full timeline structure: phases with week/month labels + 30-day + 90-day milestones + KPIs."        : ""}
${_fw === "phased"     ? "-> Implementation phases with deliverables. NO long-horizon milestones or business KPIs."              : ""}
${_fw === "procedural" ? "-> Step-by-step instructions. NO timeline language, NO milestones, NO weeks/months framing."           : ""}
${_fw === "operational"? "-> Immediate action sequence. NO planning phases, NO milestones. Focus: resolution steps + root cause." : ""}

Step 1 - SITUATION ANALYSIS:
What is the user actually trying to achieve? What is their real starting point?
${_fw === "strategic"  ? "What would success look like in 90 days? What is the gap between where they are and where they need to be?" : ""}
${_fw === "phased"     ? "What does a successfully completed implementation look like? What are the key decision points along the way?" : ""}
${_fw === "procedural" ? "What is the end state after following these steps? What prior knowledge can the reader be assumed to have?" : ""}
${_fw === "operational"? "What is the exact problem? What are its likely root causes? What is the fastest path to resolution?" : ""}
If the user gave Deep Mode answers, use those as the primary facts - not invented context.

Step 2 - KEY ASSUMPTIONS (SURFACE IN OUTPUT):
What am I assuming that could be wrong? List 2-3. If uncertain, flag explicitly:
"This assumes you have X - if not, do Y instead." Do NOT silently assume.
BAD: Assume user has existing email list without checking.
GOOD: "I'm assuming no existing audience - if you have one, Week 1 changes from list-building to segmentation."

Step 3 - TRADE-OFFS (NAME IN YOUR EXPERT ROLE):
What is the single most important strategic trade-off? Name it explicitly in Your Expert Role.
"The central trade-off is X vs Y - every [resource] spent on X before Y is fixed is [consequence]."

Step 4 - RISKS (BECOME WARNING:  RISK ENTRIES):
3 most likely ways this engagement fails. NOT generic - named failure modes in THIS domain at THIS stage.
If user gave Deep Mode answers, at least one risk references their specific situation.
Each risk -> one WARNING:  Risk entry in Ground Rules. They must match.

Step 5 - ${_fw === "procedural" || _fw === "operational" ? "SEQUENCE PLAN" : "PHASED PLAN"}:
${_fw === "strategic"
  ? `Correct sequence? Most people start with the wrong thing.
Identify the counter-intuitive ordering. MANDATORY: the FINAL phase is a standalone POST-GOAL phase
(what happens AFTER the main objective is achieved). NOT optional. NOT a parenthetical.`
  : _fw === "phased"
  ? `Correct implementation sequence? Break into 3-4 phases with clear start/end.
Each phase has ONE named deliverable. The final phase is what the user does AFTER completion (next logical step).`
  : _fw === "procedural"
  ? `Correct step sequence? What order makes the concept click fastest?
Identify the step most tutorials get wrong. Each step must produce a visible/testable result.`
  : `Fastest resolution path? What should be checked first to eliminate the most likely cause?
Name 3 investigation steps in order of likelihood. Each step has a pass/fail test.`
}

${_fw === "strategic" ? `Step 6 - SUCCESS METRICS:
30-day and 90-day milestones - specific numbers or shipped artifacts. NOT "good progress".
If user gave specific numbers in Deep Mode answers, use those as anchors.
For each: corrective action if milestone is missed.

MILESTONE LANGUAGE RULES:
For business-building prompts: milestones must be startup metrics - first paying customer,
website live date, first â¹X revenue, CAC, conversion rate, retention rate.
BANNED milestone language: "make progress", "build momentum", "establish foundation",
"continue growing", "solidify brand identity", "build presence".
EXAMPLE GOOD: "30-day milestone: Website live + first 3 paid bookings. If not hit, shift from content to direct outreach - DM 50 travel communities."
EXAMPLE BAD: "30-day milestone: Begin establishing your brand presence online."` : ""}

Only after all steps above, write the output sections.
`;

  const deepModePersonaLine = {
    strategic:   `battle-tested senior consultant who has delivered 50+ high-stakes engagements. You are known for being direct, spotting hidden risks, and giving advice that actually moves the needle.`,
    phased:      `principal-level practitioner who has shipped 30+ complex implementations from zero to live. You cut through noise and clearly name the deliverable for every phase.`,
    procedural:  `senior technical educator with 12+ years teaching complex concepts. You know exactly which step trips people and never let a concept land without a runnable example.`,
    operational: `domain specialist and incident-response expert who has resolved hundreds of similar issues. You prioritize root-cause isolation over symptom-chasing.`,
  }[requestFramework];

  const sectionCount = sectionSchema.length;

  const deepModeBlock = `
âââ DEEP CONSULTANT MODE - Senior Strategy Engagement (SYSTEM PROMPT) âââ

WARNING: ï¸ CRITICAL: This is a SYSTEM PROMPT for another model.
You are NOT answering the user directly.
You are writing INSTRUCTIONS for how the other model should behave, think, and structure its response.

Every section must instruct the model on HOW TO BEHAVE, not provide the final answer.

BAD: "I can guide you..."
GOOD: "You are to act as a guide. Your role is to instruct the user..."

BAD: "The biggest mistake I see here is..."
GOOD: "You must warn the user about the biggest mistake..."

BAD: "Plan to marinate your chicken..."
GOOD: "Instruct the user to marinate the chicken..."

PERSONA TO EMBODY: The model you are instructing is a ${deepModePersonaLine} It is a ${expertRoleShort}.

${userAnswers.length > 0
  ? `The user gave specific context (see WHAT THE USER TOLD US above). The model must reference their exact numbers and situation in risks and actions. Generic advice when specific inputs exist is unacceptable.`
  : ""}

----------------------------------------------------
WARNING: ï¸ CRITICAL SECTION HEADER RULE - DO NOT CHANGE THESE:
You MUST include EVERY section header exactly as shown below.
Do NOT skip, rename, or rephrase any section header.

${requiredHeadersDeep}

For this request type (${intentCategory}), the headers MUST be:
${headerListDeep}

These headers are dynamic and change based on the domain.
For a recipe request, they would be: Your Expert Role, Dish Overview, Ingredients, etc.
For a travel request, they would be: Your Expert Role, Trip Overview, Itinerary, etc.
For a fitness request, they would be: Your Expert Role, Training Overview, Weekly Programme, etc.

ALWAYS use the headers provided above - never make up your own.
----------------------------------------------------

============================================================================
DEPTH & QUALITY REQUIREMENTS (For the Model to Follow)
============================================================================

ANTI-GENERIC RULE:
The model must never write generic advice like "be consistent", "plan properly", "monitor performance", or "ensure quality".
Every recommendation must be specific - name tools, exact actions, mechanisms, or real numbers.

DEPTH REQUIREMENT:
Before writing any section, the model must ask:
"Would an experienced practitioner in this field find this insight obvious or generic?"
If yes -> rewrite with more specificity, a real example, or a named mechanism.

VOICE TRIGGERS - THE MODEL MUST INCLUDE ALL THREE:
Each trigger must be a FULL PARAGRAPH (minimum 3-4 sentences).

- "The biggest mistake I see here is..."
  The model must name a specific mistake even experienced people make. Explain why it happens + the cost + the fix.

- "What most people get wrong is..."
  The model must identify something that looks correct but backfires. Explain the failure mechanism + what to do instead.

- "Here's the uncomfortable truth..."
  The model must share a non-obvious insight that challenges common thinking. Explain the implication + give a direct recommendation.

DIRECT ASSERTION RULE:
Every major section must contain at least one statement written as a direct fact/opinion (not a soft suggestion).

PER-SECTION MANDATE:
- "Ground Rules" must contain exactly 3 named risks with specific mechanisms.
- If user gave Deep Mode answers, the model must reference them in relevant sections.
- ${requestFramework === "strategic" ? `"What Good Looks Like" must use the user's specific numbers for milestones.` : ""}

TARGET WORD COUNT: ${
  isTutorial ? "2,000-3,000 words" :
  requestFramework === "strategic" ? "800-1,000 words (high density)" :
  requestFramework === "phased" ? "500-800 words" :
  requestFramework === "procedural" ? "400-600 words" :
  "400-600 words"
}

BANNED WORDS: "comprehensive", "high-quality", "ensure", "consider", "robust", "leverage", "best practices", "holistic", "key takeaway".
`;

  const deepPrompt = META_SYSTEM_PROMPT_FENCE + `You are an expert prompt engineer. Transform the user's raw request into a rich, expert SYSTEM PROMPT that instructs another model on how to behave.

WARNING: ï¸ CRITICAL: This is a SYSTEM PROMPT for another model.
You are NOT answering the user directly.
You are writing INSTRUCTIONS for how the other model should behave, think, and structure its response.

OUTPUT FORMAT - NON-NEGOTIABLE:
Return a JSON object with exactly two keys:
  "optimizedText": one continuous string with all sections using **Bold Label** headers
  "suggestions":   array of 3 alternative one-line phrasings

WRONG: {"Your Expert Role":"...","What to Deliver":"..."}
RIGHT: {"optimizedText":"**${sectionSchema[0]?.label || "Your Expert Role"}**\\nYou are...","suggestions":[...]}

Bold label format: **Section Name** on its own line, content below. No ## headers. No numbered sections.

----------------------------------------------------

USER REQUEST: "${userText}"
${subcategoryFocus}${constraintsBlock}${userAnswersBlock}${tutorialTechBlock}${aiImageBlock}${knowledgeBlock}${modernToolsBlock}${reasoningChainBlock}${deepModeBlock}
Tone of voice: ${expertTone}
Expert to embody: ${expertRole}

${sectionWritingBlock}

----------------------------------------------------
Return STRICT JSON ONLY - no markdown, no extra text:
${jsonTemplate}`;

  perfEnd(perfHandle);
  return { prompt: deepPrompt, sectionSchema };
}

// -----------------------------------------------------------------------------
// buildDetailedSystemPrompt (legacy alias)
// -----------------------------------------------------------------------------
async function buildDetailedSystemPrompt(userText, options = {}) {
  return buildEnrichedSystemPrompt(userText, options);
}

// -----------------------------------------------------------------------------
// validateDetailedOutput
// -----------------------------------------------------------------------------
function validateDetailedOutput(parsed, sectionSchema = null) {
  if (parsed && typeof parsed === "object" && !parsed.optimizedText) {
    const allSections = sectionSchema
      ? sectionSchema.map(s => s.label)
      : [...REQUIRED_SECTIONS_BASE, ...REQUIRED_SECTIONS_DEEP_ONLY];
    const foundSections = allSections.filter(s => parsed[s] || parsed[s.toLowerCase()]);
    if (foundSections.length >= 4) {
      const rebuilt = foundSections
        .map(s => `**${s}**\n${parsed[s] || parsed[s.toLowerCase()] || ""}`)
        .join("\n\n");
      parsed.optimizedText = rebuilt;
      parsed.suggestions   = parsed.suggestions || [];
    }
  }

  if (parsed?.optimizedText && typeof parsed.optimizedText !== "string") {
    try   { parsed.optimizedText = JSON.stringify(parsed.optimizedText); }
    catch { parsed.optimizedText = String(parsed.optimizedText); }
  }

  const text = parsed?.optimizedText || "";
  const isDeepOutput = sectionSchema
    ? sectionSchema.some(s => s.name === "Next 3 Actions" && new RegExp(`\\*\\*${s.label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\*\\*`, "i").test(text))
    : /\*\*Your Next 3 Actions\*\*/i.test(text);

  let sectionsToCheck;
  if (sectionSchema) {
    sectionsToCheck = sectionSchema
      .filter(s => s.required)
      .map(s => s.label);
  } else {
    sectionsToCheck = isDeepOutput
      ? [...REQUIRED_SECTIONS_BASE, ...REQUIRED_SECTIONS_DEEP_ONLY]
      : REQUIRED_SECTIONS_BASE;
  }

  const missingSections = sectionsToCheck.filter(s => {
    const escaped = s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const pattern = new RegExp(`\\*\\*${escaped}\\*\\*`, "i");
    return !pattern.test(text);
  });

  const thinSections = [];

  if (isDeepOutput) {
    const wordCount = text.split(/\s+/).filter(Boolean).length;

    const hasTimeline  = /\b(30-day|90-day|week\s+\d|month\s+\d)\b/i.test(text);
    const hasSteps     = /\*\*Step\s+\d/i.test(text);
    const hasDiagnosis = /\b(root\s+cause|diagnos|resolution|pass\/fail)\b/i.test(text);

    const detectedFramework =
      hasDiagnosis && !hasTimeline ? "operational" :
      hasSteps     && !hasTimeline ? "procedural"  :
      hasTimeline                  ? "strategic"   :
      "phased";

    const MIN_WORDS = {
      strategic:   900,
      phased:      700,
      procedural:  500,
      operational: 300,
    }[detectedFramework] ?? 900;

    const TARGET_RANGE = {
      strategic:   "1,100-1,600",
      phased:      "800-1,100",
      procedural:  "600-900",
      operational: "400-600",
    }[detectedFramework] ?? "1,100-1,600";

    if (wordCount < MIN_WORDS) {
      const allPresent = sectionsToCheck.filter(s => {
        const escaped = s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        return new RegExp(`\\*\\*${escaped}\\*\\*`, "i").test(text);
      });

      for (const sectionName of allPresent) {
        const escaped = sectionName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const sectionMatch = text.match(
          new RegExp(`\\*\\*${escaped}\\*\\*\\n([\\s\\S]*?)(?=\\*\\*[A-Z]|$)`, "i")
        );
        if (sectionMatch) {
          const sectionWords = sectionMatch[1].trim().split(/\s+/).filter(Boolean).length;
          if (sectionWords < 60) thinSections.push(sectionName);
        }
      }

      const expertRoleLabel = sectionSchema
        ? (sectionSchema.find(s => s.name === "Expert Role")?.label || "Your Expert Role")
        : "Your Expert Role";
      if (!thinSections.includes(expertRoleLabel)) thinSections.push(expertRoleLabel);

      missingSections.push(
        `__word_count__ (~${wordCount} words - ${detectedFramework} framework minimum ${MIN_WORDS}, target ${TARGET_RANGE}. ` +
        `Expand Expert Role section with the full persona + 3 voice trigger paragraphs. ` +
        `Expand each risk with domain-specific consequences. Every section needs 2-3 sentences of reasoning, not just a headline.)`
      );
    }
  }

  return { isValid: missingSections.length === 0, missingSections, thinSections };
}

// -----------------------------------------------------------------------------
// buildWordCountPatchPrompt
// -----------------------------------------------------------------------------
function buildWordCountPatchPrompt(existingOutput, thinSections, userText, suggestions = "[]", sectionSchema = null) {
  const targetList = thinSections.length > 0
    ? thinSections.map(s => `- **${s}**`).join("\n")
    : sectionSchema
      ? sectionSchema.slice(0, 3).map(s => `- **${s.label}**`).join("\n")
      : "- **Your Expert Role**\n- **Ground Rules**\n- **How to Approach This**";

  const expertRoleLabel = sectionSchema
    ? (sectionSchema.find(s => s.name === "Expert Role")?.label || "Your Expert Role")
    : "Your Expert Role";

  const groundRulesLabel = sectionSchema
    ? (sectionSchema.find(s => s.name === "Ground Rules")?.label || "Ground Rules")
    : "Ground Rules";

  return `You are editing an existing AI prompt brief. The structure and sections are correct but some sections are too short.

ORIGINAL USER REQUEST: "${userText}"

EXISTING BRIEF (modify in-place - do NOT change section order, labels, or structure):
${existingOutput}

----------------------------------------------------
TASK - EXPAND ONLY THESE SECTIONS (leave all others exactly as written):
${targetList}

EXPANSION RULES:
- Each expanded section must reach at least 80 words of substantive content
- For **${expertRoleLabel}**: add all 3 voice triggers if missing -
    "The biggest mistake I see here is..." (3-4 sentences)
    "What most people get wrong is..." (3-4 sentences)  
    "Here's the uncomfortable truth..." (2-3 sentences)
- For **${groundRulesLabel}**: expand each WARNING:  Risk with a specific mechanism + consequence + named mitigation
- For any other thin section: add 2-3 sentences of domain-specific reasoning - real numbers, named tools, concrete actions
- BANNED: "comprehensive", "high-quality", "ensure", "robust", "best practices", "leverage"
- Keep every other section word-for-word identical

Return STRICT JSON ONLY - same shape as the input:
{"optimizedText":"[full brief with expanded sections, all **Bold Labels** preserved]","suggestions":${suggestions}}`;
}

// -----------------------------------------------------------------------------
// buildRetryPrompt
// -----------------------------------------------------------------------------
function buildRetryPrompt(originalUserText, badOutput, missingSections, isDeepMode = false, isSkillMode = false, sectionSchema = null) {
  const outputText = typeof badOutput === "string" ? badOutput : JSON.stringify(badOutput || "");
  if (!isDeepMode && !isSkillMode) {
    if (/Your Next 3 Actions/i.test(outputText) || /WARNING: \s*Risk:/i.test(outputText)) {
      isDeepMode  = true;
      isSkillMode = true;
    } else if (/\*\*Your Expert Role\*\*/i.test(outputText) || /optimizedText/i.test(outputText)) {
      isSkillMode = true;
    }
  }

  const isWebsite  = detectWebsiteBuildIntent(originalUserText);
  const isTutorial = detectTutorialIntent(originalUserText) && !isWebsite;
  const isAIImage  = detectNamedTool(originalUserText)?.id === "ai_image_gen";
  const flatJsonDetected = badOutput && (
    badOutput.includes('"Your Expert Role"') ||
    badOutput.includes('"Ground Rules"')     ||
    badOutput.includes('"What to Deliver"')
  );

  if (!isSkillMode && !isDeepMode) {
    return `CRITICAL ERROR: You did not return valid JSON.
User's request: "${originalUserText}"
Return STRICT JSON ONLY:
{"optimizedText":"improved version of the user's prompt here","suggestions":["alt1","alt2","alt3"]}`;
  }

  const hasTimeline  = /\b(30-day|90-day|week\s+\d|month\s+\d)\b/i.test(outputText);
  const hasSteps     = /\*\*Step\s+\d/i.test(outputText);
  const hasDiagnosis = /\b(root\s+cause|diagnos|resolution|pass\/fail)\b/i.test(outputText);
  const detectedFramework =
    hasDiagnosis && !hasTimeline ? "operational" :
    hasSteps     && !hasTimeline ? "procedural"  :
    hasTimeline                  ? "strategic"   :
    "phased";

  const MIN_WORDS = { strategic: 900, phased: 700, procedural: 500, operational: 300 }[detectedFramework] ?? 900;
  const TARGET    = { strategic: "1,100-1,600", phased: "800-1,100", procedural: "600-900", operational: "400-600" }[detectedFramework] ?? "1,100-1,600";

  let sectionListLine;
  let jsonTemplate;

  if (sectionSchema) {
    const schemaLabels = sectionSchema.map(s => s.label);
    const count = schemaLabels.length;
    const arrowList = schemaLabels
      .map((label, i) => i === 0 ? `**${label}**` : `-> **${label}**`)
      .join("\n");
    sectionListLine = `All ${count} sections as **Bold Labels** inside optimizedText:\n${arrowList}`;
    jsonTemplate = buildJsonTemplate(sectionSchema);
  } else {
    sectionListLine = isDeepMode
      ? `All 9 sections as **Bold Labels** inside optimizedText:
**Your Expert Role** -> **What You're Here to Do** -> **Your Core Focus Areas**
-> **How to Approach This** -> **Key Numbers & Benchmarks** -> **What to Deliver**
-> **Ground Rules** -> **What Good Looks Like** -> **Your Next 3 Actions**`
      : `All 8 sections as **Bold Labels** inside optimizedText:
**Your Expert Role** -> **What You're Here to Do** -> **Your Core Focus Areas**
-> **How to Approach This** -> **Key Numbers & Benchmarks** -> **What to Deliver**
-> **Ground Rules** -> **What Good Looks Like**`;

    jsonTemplate = isDeepMode
      ? `{"optimizedText":"**Your Expert Role**\\n...\\n\\n**What You're Here to Do**\\n...\\n\\n**Your Core Focus Areas**\\n...\\n\\n**How to Approach This**\\n...\\n\\n**Key Numbers & Benchmarks**\\n...\\n\\n**What to Deliver**\\n...\\n\\n**Ground Rules**\\n...\\n\\n**What Good Looks Like**\\n...\\n\\n**Your Next 3 Actions**\\n...","suggestions":["alt1","alt2","alt3"]}`
      : `{"optimizedText":"**Your Expert Role**\\n...\\n\\n**What You're Here to Do**\\n...\\n\\n**Your Core Focus Areas**\\n...\\n\\n**How to Approach This**\\n...\\n\\n**Key Numbers & Benchmarks**\\n...\\n\\n**What to Deliver**\\n...\\n\\n**Ground Rules**\\n...\\n\\n**What Good Looks Like**\\n...","suggestions":["alt1","alt2","alt3"]}`;
  }

  let deepModeChecklist = null;

  if (isDeepMode) {
    if (sectionSchema) {
      const sectionNames = sectionSchema.map(s => s.label);
      const hasExpertRole   = sectionNames.some(n => /expert role/i.test(n));
      const hasGroundRules  = sectionNames.some(n => /ground rules|chef.*rules|training rules|investment rules|travel tips|debugging rules|content rules|job search rules|marketing rules/i.test(n));
      const hasApproach     = sectionNames.some(n => /how to approach|diagnostic steps|tutorial structure|strategy|programme|itinerary/i.test(n));
      const hasGoodLooks    = sectionNames.some(n => /what good looks like|progress markers|resolution signal|great trip|finished dish/i.test(n));
      const hasNextActions  = sectionNames.some(n => /next 3 actions|before you start/i.test(n));

      const checkItems = [];
      if (hasExpertRole)  checkItems.push(`${checkItems.length + 1}. Expert Role section has counter-intuitive ordering, non-obvious mistake (3-4 sentences), trade-off - all as prose, not bullets.`);
      if (hasGroundRules) checkItems.push(`${checkItems.length + 1}. Rules/Ground Rules section has exactly 3 "WARNING:  Risk: [specific]. Mitigation: [action]." - domain-expert level.`);
      if (hasApproach)    checkItems.push(`${checkItems.length + 1}. Approach/Steps section follows the ${detectedFramework} framework - ${detectedFramework === "procedural" || detectedFramework === "operational" ? "numbered steps with pass/fail tests" : "named phases with deliverables"}.`);
      if (hasGoodLooks && detectedFramework === "strategic") {
        checkItems.push(`${checkItems.length + 1}. Success/Good Looks section has "30-day milestone: [number]. If not hit, [corrective action]."`);
        checkItems.push(`${checkItems.length + 1}. Success/Good Looks section has "90-day milestone: [number]."`);
        checkItems.push(`${checkItems.length + 1}. Success/Good Looks section has "What comes next: [specific named action]."`);
      } else if (hasGoodLooks) {
        checkItems.push(`${checkItems.length + 1}. Success/Good Looks section has 3 measurable completion criteria. NO business KPIs or milestone tracking.`);
      }
      if (hasNextActions) checkItems.push(`${checkItems.length + 1}. Next Actions section has exactly 3 actions, each with owner and deadline.`);
      checkItems.push(`${checkItems.length + 1}. WORD COUNT: ${MIN_WORDS}+ words minimum (target ${TARGET}). If under, expand every section - 2-3 sentences of reasoning each.`);

      deepModeChecklist = `\nWARNING: ï¸ DEEP MODE (${detectedFramework.toUpperCase()}) - VERIFY ALL BEFORE RETURNING:\n${checkItems.join("\n")}`;
    } else {
      deepModeChecklist = {
        strategic: `
WARNING: ï¸ DEEP MODE (STRATEGIC) - VERIFY ALL BEFORE RETURNING:
1. "Your Expert Role" has ALL THREE in prose: counter-intuitive ordering, non-obvious mistake (3-4 sentences), trade-off (2 sentences with recommendation).
2. "Ground Rules" has exactly 3 "WARNING:  Risk: [specific]. Mitigation: [Week 1 action]." - domain-expert level.
3. "How to Approach This" has a NAMED POST-GOAL phase as its FINAL phase (not a parenthetical).
4. "What Good Looks Like" has "**30-day milestone:** [number]. If not hit, [corrective action]."
5. "What Good Looks Like" has "**90-day milestone:** [number]."
6. "What Good Looks Like" has "**What comes next:** [specific named action]."
7. "Your Next 3 Actions" has exactly 3 actions, each with owner and deadline.
8. WORD COUNT: ${MIN_WORDS}+ words minimum (target ${TARGET}). If under, expand every section - 2-3 sentences of reasoning each.`,

        phased: `
WARNING: ï¸ DEEP MODE (PHASED) - VERIFY ALL BEFORE RETURNING:
1. "Your Expert Role" has counter-intuitive ordering, non-obvious mistake (3-4 sentences), and trade-off.
2. "Ground Rules" has exactly 3 "WARNING:  Risk: [specific]. Mitigation: [immediate action]." entries.
3. "How to Approach This" has 3-4 implementation phases, each with a named deliverable. NO 30/90-day milestones.
4. "What Good Looks Like" has 3 measurable completion criteria. NO business KPIs or milestone tracking.
5. "Your Next 3 Actions" has exactly 3 actions with owner and deadline.
6. WORD COUNT: ${MIN_WORDS}+ words minimum (target ${TARGET}).`,

        procedural: `
WARNING: ï¸ DEEP MODE (PROCEDURAL) - VERIFY ALL BEFORE RETURNING:
1. "Your Expert Role" has the non-obvious mistake practitioners make + the clarity vs thoroughness trade-off.
2. "How to Approach This" is NUMBERED STEPS (not phases). Each step has a visible/testable outcome. NO timeline language.
3. "What Good Looks Like" has 3 observable completion criteria. NO milestones, NO KPIs.
4. "Your Next 3 Actions" has exactly 3 first steps, specific and immediately actionable.
5. ZERO mentions of 30-day, 90-day, Week 1, Month 1, or business metrics anywhere.
6. WORD COUNT: ${MIN_WORDS}+ words minimum (target ${TARGET}).`,

        operational: `
WARNING: ï¸ DEEP MODE (OPERATIONAL) - VERIFY ALL BEFORE RETURNING:
1. "Your Expert Role" names the most common MISDIAGNOSIS + cost of chasing the wrong root cause.
2. "How to Approach This" is an ORDERED DIAGNOSTIC SEQUENCE - each step has a pass/fail test.
3. "What Good Looks Like" describes the resolution signal - what passing looks like, not a milestone.
4. "Your Next 3 Actions" are the first 3 investigation/fix steps. Specific commands or checks, no strategy.
5. ZERO mentions of 30-day, 90-day, phases, milestones, or business planning anywhere.
6. WORD COUNT: ${MIN_WORDS}+ words minimum (target ${TARGET}).`,
      }[detectedFramework];
    }
  }

  return META_SYSTEM_PROMPT_FENCE + `CRITICAL ERROR IN PREVIOUS RESPONSE.
WARNING: ï¸  REMINDER: You are a PROMPT ENGINEER writing a SYSTEM PROMPT for another model.
    Do NOT answer the user's question. Write INSTRUCTIONS for another LLM to answer it.
${flatJsonDetected
  ? `\nFLAT JSON ERROR:\n[NO] WRONG: {"Your Expert Role":"...","Ground Rules":"..."}\n[OK] RIGHT:  {"optimizedText":"**Your Expert Role**\\n...\\n\\n**Ground Rules**\\n...","suggestions":[...]}\n`
  : `\nMISSING SECTIONS: ${missingSections.join(", ")}\n`
}
User's request: "${originalUserText}"
${isWebsite  ? "\nUser wants to BUILD A WEBSITE/PLATFORM. Tech stack, features, payments, launch strategy.\n" : ""}
${isTutorial ? "\nUser wants a TECHNICAL TUTORIAL. ONE technology. Runnable code. A deployable mini-project. Correct deployment platform.\n" : ""}
${isAIImage  ? "\nUser wants an AI IMAGE GENERATION prompt system. NO DSLR/camera advice. Benchmarks = prompt iterations, acceptance rate, aspect ratios. Ground rules = tool-specific parameters.\n" : ""}

+==========================================================================+
|  ONE JSON object, TWO keys: "optimizedText" + "suggestions"            |
|  [NO] NEVER: {"Your Expert Role":"...","Ground Rules":"..."}             |
|  [OK] ALWAYS: {"optimizedText":"**${sectionSchema?.[0]?.label || "Your Expert Role"}**\\n...","suggestions":[...]} |
+==========================================================================+

${sectionListLine}

Quality rules:
- Expert practitioner tone - specific, concrete
- Real numbers in at least 3 sections
- BANNED: "comprehensive","high-quality","ensure","consider","robust","best practices"
${isWebsite  ? "- Next.js / Tailwind / Supabase / Stripe / Vercel - justify each\n- Mobile-first + real payment test mandatory in Ground Rules" : ""}
${isTutorial ? "- ONE technology named in Your Expert Role\n- Read time and build time SEPARATE rows\n- Tutorial ends with deployed, GitHub-ready project" : ""}
${isAIImage  ? "- Expert Role = AI prompt director, NOT photographer\n- Benchmarks = prompt-specific metrics only\n- All 3 risks must be tool-specific failure modes" : ""}

${isDeepMode ? (deepModeChecklist ?? "") : `
WARNING: ï¸ SKILL MODE - VERIFY BEFORE RETURNING:
1. All ${sectionSchema ? sectionSchema.length : 8} sections with correct bold labels
2. Approach/steps section follows the appropriate structure for this request type
3. Numbers/benchmarks section has real numbers (not placeholders)
4. Rules section has domain-specific rules (not generic)
5. Success criteria section has 3 measurable criteria
`}
Return STRICT JSON ONLY - no markdown, no preamble:
${jsonTemplate}`;
}

module.exports = {
  buildEnrichedSystemPrompt,
  buildDetailedSystemPrompt,
  validateDetailedOutput,
  buildRetryPrompt,
  buildWordCountPatchPrompt,
  buildSectionSchema,
  detectIntentCategory,
  classifyRequestFramework,
  // v3: export extractors so other modules can use them if needed
  extractDishSubject,
  extractTrainingGoalSubject,
};