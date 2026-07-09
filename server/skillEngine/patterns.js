"use strict";

// âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
// INTENT DETECTION PATTERNS
// âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
// âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
// INTENT DETECTION PATTERNS
// âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
const WEBSITE_BUILD_PATTERNS = [
  /\b(create|build|make|develop|launch|set\s*up|design|code|start)\s+a?\s*(website|web\s*site|site|platform|portal|app|web\s*app|online\s*course\s*site|e[\-\s]?learning\s*site|lms|marketplace)\b/i,
  /\b(website|platform|web\s*app|portal)\s+(for|to\s+sell|to\s+teach|that\s+sells)\b/i,
  /\b(sell\s+courses?\s+online|monetize\s+(my\s+)?course|course\s+platform|online\s+school)\b/i,
  /\b(next\.?js|react|vue|nuxt|tailwind|supabase|firebase|vercel|netlify|wordpress|webflow|bubble)\b/i,
  /\b(tech\s+stack|full[\-\s]?stack|deploy|hosting)\b/i,
];

const TUTORIAL_PATTERNS = [
  /\b(write|create|make|build|design)\s+a?\s*(technical\s+)?tutorial\b/i,
  /\b(teach|explain|guide)\s+(beginners?|developers?|students?)\b/i,
  /\b(step[\-\s]by[\-\s]step|beginner(?:'s)?\s+guide|how[\-\s]to\s+guide|crash\s+course)\b/i,
  /\b(tutorial\s+for|guide\s+for|course\s+on|lesson\s+on)\b/i,
];

const CURRICULUM_ONLY_PATTERNS = [
  /\b(lesson\s+plan|curriculum|syllabus|course\s+outline|learning\s+objective|assessment\s+design|instructional\s+design|bloom)\b/i,
];

const EVENT_PLANNING_PATTERNS = [
  /\b(wedding|mehendi|haldi|sangeet|baraat|reception|bridal)\b/i,
  /\b(birthday\s+party|bday\s+party|kids?\s+party|birthday\s+celebration)\b/i,
  /\b(anniversary\s+party|anniversary\s+celebration)\b/i,
  /\b(baby\s+shower|bridal\s+shower|engagement\s+party)\b/i,
  /\b(plan\w*|organis\w*|organiz\w*|host\w*)\s+\w*\s*(wedding|party|celebration|ceremony|function|event)\b/i,
  /\b(destination\s+wedding|wedding\s+plann\w*)\b/i,
  /\b(\d+\s*guests?|guests?\s+list)\b/i,
  /\b(proposal\s+setup|surprise\s+proposal|propose\s+to)\b/i,
  /\b(engagement\s+ceremony|fusion\s+ceremony|roka|sagan)\b/i,
  /\b(eco[\-\s]?friendly\s+(holi|celebration|event)|holi\s+(plan|celebrat|organis|organiz))\b/i,
  /\b(corporate\s+(offsite|retreat|team\s+event|team\s+day|off[\-\s]site))\b/i,
];

const BUSINESS_BUILDING_PATTERNS = [
  /\b(start|launch|build|open|set\s+up|create)\s+(a\s+)?(niche\s+)?(travel\s+)?(agency|business|company|startup|brand|service|consultancy)\b/i,
  /\b(travel\s+agency|travel\s+business|tour\s+operator|tour\s+company)\b/i,
  /\b(business\s+(model|plan|registration|setup))\b/i,
];

const WELLNESS_COACHING_PATTERNS = [
  /\b(postpartum|postnatal)\s+(fitness|health|wellness|coaching|program|programme)\b/i,
  // broader: "premium coaching program for new moms focusing on postpartum fitness"
  /\b(coaching\s+(program|programme|course))\s+for\s+(new\s+moms?|mothers?|women)\b/i,
  /\b(new\s+moms?\s+(coaching|fitness|wellness|health|program|programme))\b/i,
  /\b(women'?s?\s+)(healing|coaching|wellness|health)\s+(program|programme|retreat|circle|space)\b/i,
  // broader: "12-week online program for women to heal from people-pleasing"
  /\b(online\s+)?(program|programme|course)\s+for\s+women\s+(to\s+)?(heal|recover|overcome|break|transform)\b/i,
  /\b(heal(ing)?\s+from\s+(people.pleasing|burnout|trauma|toxic|anxiety))\b/i,
  /\b(people.pleasing|burnout\s+recover|somatic\s+(heal|coach))\b/i,
  /\b(pcos|hormonal\s+health|hormonal\s+balance)\s+(fitness|wellness|app|program|coaching)\b/i,
  /\b(detox\s+(and\s+)?mindfulness|mindfulness\s+retreat|wellness\s+retreat)\b/i,
];

const LANGUAGE_APP_PATTERNS = [
  /\b(learn(ing)?\s+)(marathi|hindi|tamil|telugu|kannada|bengali|gujarati|punjabi|malayalam|spoken\s+\w+)\b/i,
  /\b(language\s+(learning\s+)?app|spoken\s+language\s+app)\b/i,
  /\b(regional\s+language\s+(app|platform|course))\b/i,
];

const COOKING_WORKSHOP_PATTERNS = [
  /\b(cooking\s+(workshop|class|course|masterclass|session))\b/i,
  /\b(online\s+(cooking|baking|culinary)\s+(class|workshop|course))\b/i,
  /\b(culinary\s+(business|brand|platform|programme))\b/i,
];

const ZERO_WASTE_PATTERNS = [
  /\b(zero[\-\s]?waste|refill\s+store|sustainable\s+(store|shop|retail|business))\b/i,
  /\b(eco[\-\s]?friendly\s+(store|shop|business|brand|retail))\b/i,
  /\b(plastic[\-\s]?free\s+(store|business|brand))\b/i,
];

const CHILDRENS_CONTENT_PATTERNS = [
  /\b(children'?s?\s+)(storybook|story\s+book|illustrated\s+book|picture\s+book)\s*(business|system|brand)?\b/i,
  /\b(ai[\-\s]?generated\s+)(children'?s?\s+|kids'?\s+)?(storybook|story\s+book|picture\s+book)\b/i,
  /\b(kids'?\s+|children'?s?\s+)content\s+(business|system|brand|creation)\b/i,
  // broader: "generate and sell AI children's storybooks" / "custom AI children's storybooks"
  /\b(generate|create|sell|build)\s+(and\s+sell\s+)?(ai[\-\s]?generated\s+)?(custom\s+)?(children'?s?|kids'?)\s*(storybook|story|book)\b/i,
  /\b(ai\s+storybook|ai\s+children'?s?\s+book|ai\s+kids\s+book)\b/i,
];

const MOBILE_HEALTH_PATTERNS = [
  /\b(mobile\s+iv\s+drip|iv\s+therapy\s+business|iv\s+drip\s+(service|business|model))\b/i,
  /\b(mobile\s+(health|wellness|medical)\s+(service|business|model|startup))\b/i,
  /\b(concierge\s+(health|medical|wellness)\s+(service|business))\b/i,
];

const VINTAGE_RENTAL_PATTERNS = [
  /\b(vintage\s+(camera|equipment|gear)\s+(rental|rent|hire))\b/i,
  /\b(camera\s+rental\s+(business|service|experience))\b/i,
  /\b(photography\s+experience\s+(business|brand|service))\b/i,
];

const DEVOTIONAL_ART_PATTERNS = [
  /\b(devotional\s+(art|content|images?|prints?))\b/i,
  /\b(ai[\-\s]?generated\s+(devotional|spiritual|religious)\s+(art|content|images?))\b/i,
  /\b(spiritual\s+(art|content)\s+(business|brand|system))\b/i,
];

const AI_VOICEOVER_PATTERNS = [
  /\b(ai\s+voiceover|ai[\-\s]?voice\s+(service|business|model))\b/i,
  // broader: "selling AI voiceover services for regional Indian languages"
  /\b(voiceover\s+(service|business|platform|services))\b/i,
  /\b(voiceover\s+(for\s+)?(indian|regional|hindi|marathi|tamil|telugu))\b/i,
  /\b(regional\s+language\s+(voiceover|dubbing|audio|tts))\b/i,
  /\b(text[\-\s]to[\-\s]speech\s+(business|service|platform))\b/i,
  // "make money by selling AI voiceover services"
  /\b(sell(ing)?\s+ai\s+(voiceover|voice)\s+services?)\b/i,
];

const SKINCARE_BRAND_PATTERNS = [
  /\b(organic\s+(skincare|beauty|cosmetics?)\s+(brand|instagram|growth|marketing))\b/i,
  /\b(instagram\s+(growth\s+)?(for|strategy\s+for)\s+(skincare|beauty|wellness|organic))\b/i,
  /\b(natural\s+(skincare|beauty)\s+(brand|instagram|social\s+media))\b/i,
  // broader: "Instagram growth strategy for a new organic skincare brand"
  /\b((skincare|beauty)\s+brand\s+(instagram|growth|strategy|launch|marketing))\b/i,
  /\b(instagram\s+(growth|strategy).{0,30}(skincare|beauty|cosmetic|organic)\s+brand)\b/i,
];

const ECOMMERCE_PATTERNS = [
  /\b(ecommerce|e-commerce|online\s+store|shopify\s+store|woocommerce|dropshipping|print\s+on\s+demand|amazon\s+fba|etsy\s+shop|online\s+shop)\b/i,
  /\b(sell\s+products?\s+online|start\s+(an?\s+)?online\s+store|build\s+(an?\s+)?ecommerce)\b/i,
];

const GHOSTWRITING_PATTERNS = [
  /\b(ghostwrit\w*|write\s+(a\s+)?book\s+for|ghostwriter|book\s+writing\s+service|content\s+writing\s+service)\b/i,
  /\b(thought\s+leadership\s+content|executive\s+(ghostwriting|writing)|linkedin\s+ghostwrit\w*)\b/i,
];

const NUTRITION_COACHING_PATTERNS = [
  /\b(nutrition\s+coach(ing)?|diet\s+coach(ing)?|meal\s+plan(ning)?\s+business|nutritionist\s+business|dietitian\s+service)\b/i,
  /\b(online\s+(nutrition|diet|meal\s+planning)\s+(coach|program|service|business))\b/i,
];

const CREATOR_ECONOMY_PATTERNS = [
  /\b(creator\s+(economy|business|monetiz\w*)|monetize\s+(my\s+)?(content|audience|following|channel|page|instagram|youtube|tiktok|newsletter))\b/i,
  /\b(build\s+a\s+creator\s+business|content\s+creator\s+income|paid\s+community|gated\s+content)\b/i,
  /\b(how\s+(do\s+i|to)\s+monetize\s+(my\s+)?(audience|following|instagram|youtube|tiktok|channel|page))\b/i,
];

const GRANT_WRITING_PATTERNS = [
  /\b(grant\s+(writing|proposal|application|funding)|write\s+(a\s+)?grant|NGO\s+funding|nonprofit\s+grant|CSR\s+grant)\b/i,
];

const IMMIGRATION_PATTERNS = [
  /\b(immigration|visa\s+(application|process|guide)|PR\s+application|permanent\s+residency|citizenship\s+application|work\s+permit|study\s+visa|IELTS|TOEFL\s+prep|student\s+visa)\b/i,
];

const WEDDING_PHOTOGRAPHY_PATTERNS = [
  /\b(wedding\s+photography\s+(business|pricing|packages)|photographer\s+(business|pricing|marketing)|photography\s+(startup|business|brand|portfolio|pricing))\b/i,
];

const PET_BUSINESS_PATTERNS = [
  /\b(pet\s+(business|grooming|boarding|daycare|sitting|training|care\s+service)|dog\s+(grooming|walking|training|daycare)\s+business|animal\s+(care|training)\s+business)\b/i,
];

const SUPPLY_CHAIN_PATTERNS = [
  /\b(supply\s+chain|logistics\s+(strategy|optimization|management)|procurement\s+(strategy|optimization)|inventory\s+management\s+system|warehouse\s+(management|optimization)|last\s+mile\s+delivery)\b/i,
];

// ââ NEW: AI Photography Monetization âââââââââââââââââââââââââââââââââââââââââ
const AI_PHOTOGRAPHY_MONETIZATION_PATTERNS = [
  /\b(photography\s+and\s+ai\s+(to\s+)?(make\s+money|earn|monetize|income|business))\b/i,
  /\b(ai\s+(photography|photo)\s+(monetiz\w*|business|income|earn|sell))\b/i,
  /\b(combine\s+.{0,30}(photography|photo).{0,30}(ai|artificial\s+intelligence).{0,30}(money|earn|income))\b/i,
  /\b(photography\s+(passion|skills?).{0,30}(ai|artificial\s+intelligence).{0,30}(money|earn|income|online))\b/i,
];

// ââ NEW: Rental Property Investment (general + Pune) ââââââââââââââââââââââââââ
const RENTAL_PROPERTY_INVESTMENT_PATTERNS = [
  /\b(invest\s+in\s+rental\s+propert(y|ies))\b/i,
  /\b(rental\s+propert(y|ies).{0,30}(invest|buy|purchase|strategy|portfolio))\b/i,
  /\b(buy(ing)?\s+\d+[\â\-]\d+\s+flat|buying\s+flats?\s+(in|for)\s+(investment|rental))\b/i,
  /\b(propert(y|ies)\s+(investment|portfolio)\s+(strategy|plan|advice))\b/i,
];


// âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
// HIGH INTENT WORDS
// âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
// âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
// HIGH INTENT WORDS
// âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
const HIGH_INTENT_WORDS = new Set([
  "build","create","develop","launch","design","deploy","ship","code","implement",
  "website","platform","app","site","tutorial","course","startup","business",
  "monetize","sell","market","automate","optimize","grow","scale","hire","invest",
]);

// âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
// NAMED TOOL DETECTION MAP
// âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
const AI_CREATIVE_TOOLS = {
  "midjourney":         { id: "ai_image_gen", tool: "Midjourney",         versionFlag: "--v6" },
  "stable diffusion":   { id: "ai_image_gen", tool: "Stable Diffusion",   versionFlag: "XL"   },
  "dall-e":             { id: "ai_image_gen", tool: "DALL-E 3",           versionFlag: ""     },
  "dalle":              { id: "ai_image_gen", tool: "DALL-E 3",           versionFlag: ""     },
  "firefly":            { id: "ai_image_gen", tool: "Adobe Firefly",      versionFlag: ""     },
  "leonardo ai":        { id: "ai_image_gen", tool: "Leonardo AI",        versionFlag: ""     },
  "ideogram":           { id: "ai_image_gen", tool: "Ideogram",           versionFlag: ""     },
  "sora":               { id: "ai_video_gen", tool: "Sora",               versionFlag: ""     },
  "runway":             { id: "ai_video_gen", tool: "Runway ML",          versionFlag: ""     },
  "pika":               { id: "ai_video_gen", tool: "Pika Labs",          versionFlag: ""     },
  "figma":              { id: "design_tool",  tool: "Figma",              versionFlag: ""     },
  "canva":              { id: "design_tool",  tool: "Canva",              versionFlag: ""     },
  "webflow":            { id: "nocode_web",   tool: "Webflow",            versionFlag: ""     },
  "framer":             { id: "nocode_web",   tool: "Framer",             versionFlag: ""     },
};

// âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
// STOP WORDS
// âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
const STOP_WORDS = new Set([
  "a","an","the","i","need","help","me","with","my","for","and","or","but",
  "in","on","at","how","what","can","could","would","should","please","some",
  "any","get","give","write","generate","produce","do","is","are","was","were",
  "be","been","being","have","has","had","will","shall","may","might","must",
  "that","this","these","those","it","its","we","our","you","your","they",
  "their","of","about","just","really","very","quite","also","too","like",
  "good","great","best","new","plan","idea","concept","strategy",
]);

// âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
// KNOWN LOCATIONS
// âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
const KNOWN_LOCATIONS = new Set([
  "pune","mumbai","delhi","bangalore","bengaluru","hyderabad","chennai","kolkata",
  "ahmedabad","surat","jaipur","lucknow","kanpur","nagpur","indore","thane",
  "bhopal","visakhapatnam","pimpri","patna","vadodara","ghaziabad","ludhiana",
  "agra","nashik","faridabad","meerut","rajkot","varanasi","srinagar","aurangabad",
  "dhanbad","amritsar","navi mumbai","allahabad","ranchi","coimbatore","jodhpur",
  "madurai","raipur","kochi","chandigarh","guwahati","bhubaneswar","mysore","dehradun","goa",
  "himachal","manali","shimla","kasol","spiti","dharamsala","mcleod ganj","kasauli",
  "london","new york","paris","dubai","singapore","tokyo","sydney","toronto",
  "berlin","amsterdam","barcelona","los angeles","chicago","san francisco",
  "beijing","shanghai","hong kong","seoul","bangkok","bali","phuket","maldives",
  "udaipur","jodhpur","jaisalmer","ranthambore","pushkar","rishikesh","haridwar",
  "lonavala","mahabaleshwar","ooty","coorg","munnar","kodaikanal",
]);

// âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
// AUDIENCE PATTERNS
// âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
const AUDIENCE_PATTERNS = [
  /\b(complete beginners?|absolute beginners?)\b/i,
  /\b(beginners?|newbies?|novices?)\b/i,
  /\b(intermediate developers?|mid.?level)\b/i,
  /\b(advanced|senior|expert)\b/i,
  /\b(students?|college students?|university students?)\b/i,
  /\b(remote workers?|freelancers?)\b/i,
  /\b(young professionals?|working professionals?)\b/i,
  /\b(families|family|parents|kids)\b/i,
  /\b(tourists?|travelers?)\b/i,
  /\b(entrepreneurs?|founders?|startups?)\b/i,
  /\b(corporates?|enterprise|b2b)\b/i,
  /\b(women|new moms?|postpartum)\b/i,
];

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
// DOMAIN CRITICAL UNKNOWNS
// âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ

module.exports = {
  // Pattern arrays
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
  AUDIENCE_PATTERNS,
  // Sets
  HIGH_INTENT_WORDS,
  STOP_WORDS,
  KNOWN_LOCATIONS,
  // Tool map
  AI_CREATIVE_TOOLS,
};