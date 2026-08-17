// src/components/SmarterPrompt.tsx
import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  History, Zap, Sparkles, Copy, RotateCcw,
  ChevronDown, Bookmark, Pencil, Code2, Video,
  Image, Share2, Loader2, ArrowRight, X, Check, Search,
  AlertTriangle, Paperclip, FileText, Download, FileDown, Wand2,
} from "lucide-react";
import { SiOpenai, SiClaude, SiGooglegemini, SiPerplexity, SiX } from "react-icons/si";
import { llmService } from "@/services/llmService";
import type { DetectionResult, DeepQuestion } from "@/services/llmService";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/components/ui/use-toast";
import { isOutOfTokens, TOKEN_LIMIT_TOAST } from "@/lib/tokenGate";

/* ─── Types ──────────────────────────────────────────────────────────────── */
interface SmarterPromptProps {
  onPromptGenerated?: (prompt: string) => void;
  onUseInOptimizer?: (prompt: string) => void;
  smartgenId?: string;
}
interface SubcategoryChip { id: string; label: string }

/* ─── Constants ───────────────────────────────────────────────────────────── */
const API_BASE   = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, "");
const GRADIENT   = "linear-gradient(270deg, #FF14EF 0%, #1A73E8 100%)";
const PILL_BG    = "linear-gradient(90deg, #ec4899 0%, #8b5cf6 50%, #3b82f6 100%)";
const GEN_BG     = "linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)";

/* ─── Document upload ─────────────────────────────────────────────────────── */
/* Mirrors SUPPORTED_EXTENSIONS in server/services/docToMarkdown.js. The server
   also serves this list from /api/smartgen/supported-formats; this constant is
   the offline default so the picker works before that call lands. */
const DOC_EXTENSIONS = [
  "pdf",
  "doc", "docx", "docm", "odt", "rtf", "epub",
  "ppt", "pptx", "pptm", "pps", "ppsx", "ppsm", "pot", "odp",
  "xls", "xlsx", "xlsm", "xlsb", "ods",
  "csv", "txt", "md", "markdown",
];
const DOC_ACCEPT    = DOC_EXTENSIONS.map(e => `.${e}`).join(",");
const DOC_MAX_BYTES = 20 * 1024 * 1024;

/* What the user chose in the popup after attaching a file. */
type DocMode = "markdown" | "prompt" | "both";

const DOC_ERRORS: Record<string, string> = {
  needs_ocr: "This document has no selectable text — it looks like scanned images. Try a version with real text.",
  could_not_read_document: "This file couldn't be read — it may be corrupted or password-protected.",
  unsupported_format: "That file type isn't supported yet.",
  empty_document: "No readable content was found in this document.",
  file_required: "No file was received — please attach it again.",
  missing_openai_key: "Prompt generation is unavailable right now.",
};

/* ─── Ideas strip data ────────────────────────────────────────────────────── */
const EXAMPLE_IDEAS = [
  { Icon: Video,  title: "AI Video",     text: "Generate AI video content with Runway for my brand..." },
  { Icon: Code2,  title: "Code & Dev",   text: "Build a REST API in Node.js and document every endpoint..." },
  { Icon: Image,  title: "AI Images",    text: "Create a Midjourney product system for product photos.." },
  { Icon: Share2, title: "Social Media", text: "Create a detailed 30-day social media content calendar" },
];

/* ─── Category data ───────────────────────────────────────────────────────── */
const CATEGORY_LABELS: Record<string, string> = {
  cafe_food_service:"🍵 Food & Hospitality",       startup_fundraising:"💼 Startup & Fundraising",
  marketing_growth:"📈 Marketing & Growth",         competitive_pricing:"📊 Strategy & Pricing",
  product_development:"💻 Product & Technology",    content_writing:"✏️ Content & Writing",
  edtech_product:"🖥️ EdTech Product Builder",       technical_tutorial:"📖 Technical Educator",
  education_learning:"🎓 Education & Learning",     finance_investment:"⚖️ Finance & Investment",
  health_wellness:"❤️ Health & Wellness",           hr_people:"👥 HR & People",
  legal_compliance:"📋 Legal & Compliance",         ai_automation:"🤖 AI & Automation",
  personal_development:"🚀 Personal Development",   real_estate:"🏠 Real Estate",
  social_media_branding:"📱 Social Media & Brand", data_science_ai:"📡 Data Science & AI",
  resume_career:"💼 Resume & Career",               saas_product:"🚀 SaaS & Product",
  freelancing_consulting:"🧑‍💻 Freelancing",        uiux_design:"🎨 UI/UX Design",
  video_creation:"🎬 Video & YouTube",              no_code_tools:"🧩 No-Code & Automation",
  cloud_devops:"☁️ Cloud & DevOps",                mobile_app_development:"📲 Mobile App Dev",
  cybersecurity:"🔐 Cybersecurity",                 blockchain_web3:"⛓️ Blockchain & Web3",
  podcast_creator:"🎙️ Podcasting & Creator",       fitness_sports:"🏋️ Fitness & Sports",
  mental_health:"🧠 Mental Health",                 interior_architecture:"🏡 Interior & Arch",
  ai_video_generation:"🎬 AI Video Generation",    ai_image_generation:"🖼️ AI Image Generation",
  ecommerce_business:"🛒 E-Commerce Business",      graphic_design:"🎨 Graphic Design",
  data_annotation:"🏷️ Data Annotation",             general_expert:"💡 General",
};

const SKILL_LABELS: Record<string, string> = {
  cafe_food_service:"Café Business Builder",       startup_fundraising:"Startup Launch Strategist",
  marketing_growth:"Marketing Strategy Builder",   product_development:"Product Development Planner",
  content_writing:"Content Strategy Expert",       education_learning:"Curriculum & Course Designer",
  finance_investment:"Financial Strategy Advisor", health_wellness:"Health & Wellness Coach",
  hr_people:"People & Culture Strategist",         ai_automation:"AI & Automation Architect",
  saas_product:"SaaS Product Advisor",             uiux_design:"UI/UX Design Expert",
  backend_architecture:"Backend Architecture Expert", ai_image_generation:"AI Image Generation Expert",
  ai_video_generation:"AI Video Generation Expert",video_creation:"Video & YouTube Strategist",
  ecommerce_business:"E-Commerce Growth Strategist",general_expert:"Expert Product Engineer",
};

interface CategoryEntry { id: string; label: string; subcategories: SubcategoryChip[] }

const ALL_CATEGORIES: CategoryEntry[] = [
  { id:"cafe_food_service",    label:"🍵 Food & Hospitality",        subcategories:[{id:"business_planning",label:"Business Planning"},{id:"menu_design",label:"Menu Design"},{id:"interior_branding",label:"Interior & Branding"},{id:"marketing_strategy",label:"Marketing Strategy"}]},
  { id:"startup_fundraising",  label:"💼 Business & Startup",        subcategories:[{id:"pitch_deck",label:"Pitch Deck"},{id:"financial_model",label:"Financial Model"},{id:"gtm_strategy",label:"Go-to-Market"},{id:"investor_outreach",label:"Investor Outreach"}]},
  { id:"marketing_growth",     label:"📈 Marketing & Growth",        subcategories:[{id:"seo_content",label:"SEO & Content"},{id:"paid_ads",label:"Paid Ads"},{id:"social_media",label:"Social Media"},{id:"email_campaigns",label:"Email Campaigns"}]},
  { id:"product_development",  label:"💻 Product & Technology",      subcategories:[{id:"product_roadmap",label:"Product Roadmap"},{id:"ux_design",label:"UX Design"},{id:"technical_arch",label:"Technical Architecture"},{id:"launch_strategy",label:"Launch Strategy"}]},
  { id:"content_writing",      label:"✏️ Content & Writing",         subcategories:[{id:"blog_articles",label:"Blog & Articles"},{id:"social_copy",label:"Social Media Copy"},{id:"email_newsletters",label:"Email Newsletters"},{id:"scripts_speeches",label:"Scripts & Speeches"}]},
  { id:"education_learning",   label:"🎓 Education & Learning",      subcategories:[{id:"course_creation",label:"Course Creation"},{id:"lesson_planning",label:"Lesson Planning"},{id:"assessment_design",label:"Assessment Design"},{id:"learning_outcomes",label:"Learning Outcomes"}]},
  { id:"finance_investment",   label:"⚖️ Finance & Investment",      subcategories:[{id:"financial_planning",label:"Financial Planning"},{id:"investment_thesis",label:"Investment Thesis"},{id:"financial_modelling",label:"Financial Modelling"},{id:"tax_compliance",label:"Tax & Compliance"}]},
  { id:"health_wellness",      label:"❤️ Health & Wellness",         subcategories:[{id:"fitness_plan",label:"Fitness Plan"},{id:"nutrition_guide",label:"Nutrition Guide"},{id:"mental_wellness",label:"Mental Wellness"},{id:"lifestyle_habits",label:"Lifestyle Habits"}]},
  { id:"hr_people",            label:"👥 HR & People",               subcategories:[{id:"hiring_process",label:"Hiring Process"},{id:"onboarding",label:"Onboarding"},{id:"performance_mgmt",label:"Performance Mgmt"},{id:"team_culture",label:"Team Culture"}]},
  { id:"ai_automation",        label:"🤖 AI & Automation",           subcategories:[{id:"prompt_engineering",label:"Product Engineering"},{id:"workflow_automation",label:"Workflow Automation"},{id:"chatbot_design",label:"Chatbot Design"},{id:"data_pipeline",label:"Data Pipeline"}]},
  { id:"saas_product",         label:"🚀 SaaS & Product",            subcategories:[{id:"saas_launch",label:"SaaS Launch"},{id:"pricing_saas",label:"SaaS Pricing"},{id:"growth_saas",label:"Growth Strategy"},{id:"churn_retention",label:"Churn & Retention"}]},
  { id:"uiux_design",          label:"🎨 UI/UX Design",              subcategories:[{id:"user_research",label:"User Research"},{id:"wireframing",label:"Wireframing"},{id:"design_system",label:"Design System"},{id:"usability_testing",label:"Usability Testing"}]},
  { id:"video_creation",       label:"🎬 Video & YouTube",           subcategories:[{id:"channel_strategy",label:"Channel Strategy"},{id:"video_scripting",label:"Video Scripting"},{id:"seo_youtube",label:"YouTube SEO"},{id:"monetization_yt",label:"Monetization"}]},
  { id:"cloud_devops",         label:"☁️ Cloud & DevOps",            subcategories:[{id:"cloud_arch",label:"Cloud Architecture"},{id:"cicd_pipeline",label:"CI/CD Pipeline"},{id:"container_k8s",label:"Docker & Kubernetes"},{id:"cloud_security",label:"Cloud Security"}]},
  { id:"mobile_app_development",label:"📲 Mobile App Dev",           subcategories:[{id:"app_architecture",label:"App Architecture"},{id:"ui_mobile",label:"Mobile UI/UX"},{id:"app_launch",label:"App Store Launch"},{id:"app_monetization",label:"App Monetization"}]},
  { id:"cybersecurity",        label:"🔐 Cybersecurity",             subcategories:[{id:"pentest",label:"Penetration Testing"},{id:"security_audit",label:"Security Audit"},{id:"compliance_sec",label:"Compliance"},{id:"incident_response",label:"Incident Response"}]},
  { id:"ai_image_generation",  label:"🖼️ AI Image Generation",       subcategories:[{id:"prompt_engineering_img",label:"Product Engineering"},{id:"stable_diffusion_wf",label:"Stable Diffusion & ComfyUI"},{id:"lora_finetune",label:"LoRA & Fine-Tuning"},{id:"commercial_workflow",label:"Commercial Workflow"}]},
  { id:"ai_video_generation",  label:"🎬 AI Video Generation",       subcategories:[{id:"text_to_video",label:"Text-to-Video"},{id:"ai_avatar_video",label:"AI Avatar & Presenter"},{id:"video_workflow",label:"Production Workflow"},{id:"ai_video_monetize",label:"Monetization"}]},
  { id:"ecommerce_business",   label:"🛒 E-Commerce Business",       subcategories:[{id:"shopify_store",label:"Shopify Store"},{id:"amazon_fba",label:"Amazon FBA"},{id:"conversion_opt",label:"Conversion Optimisation"},{id:"ecommerce_ads",label:"Paid Ads & Retention"}]},
  { id:"data_science_ai",      label:"📡 Data Science & AI",         subcategories:[{id:"ml_model",label:"ML Model Building"},{id:"data_analysis",label:"Data Analysis"},{id:"data_pipeline_ds",label:"Data Pipeline"},{id:"nlp_project",label:"NLP Project"}]},
  { id:"resume_career",        label:"💼 Resume & Career",           subcategories:[{id:"resume_writing",label:"Resume Writing"},{id:"linkedin_profile",label:"LinkedIn Profile"},{id:"interview_prep",label:"Interview Prep"},{id:"salary_negotiation",label:"Salary Negotiation"}]},
  { id:"freelancing_consulting",label:"🧑‍💻 Freelancing & Consulting",subcategories:[{id:"client_acquisition",label:"Client Acquisition"},{id:"pricing_freelance",label:"Pricing & Rates"},{id:"portfolio_building",label:"Portfolio Building"},{id:"agency_scaling",label:"Agency Scaling"}]},
  { id:"blockchain_web3",      label:"⛓️ Blockchain & Web3",         subcategories:[{id:"smart_contracts",label:"Smart Contracts"},{id:"defi_protocol",label:"DeFi Protocol"},{id:"nft_project",label:"NFT Project"},{id:"tokenomics",label:"Tokenomics"}]},
  { id:"podcast_creator",      label:"🎙️ Podcasting & Creator",      subcategories:[{id:"podcast_launch",label:"Podcast Launch"},{id:"podcast_growth",label:"Audience Growth"},{id:"podcast_monetize",label:"Monetization"},{id:"podcast_production",label:"Production Quality"}]},
  { id:"fitness_sports",       label:"🏋️ Fitness & Sports",          subcategories:[{id:"training_plan",label:"Training Plan"},{id:"sports_nutrition",label:"Sports Nutrition"},{id:"performance_analysis",label:"Performance Analysis"},{id:"injury_prevention",label:"Injury Prevention"}]},
  { id:"mental_health",        label:"🧠 Mental Health",             subcategories:[{id:"anxiety_management",label:"Anxiety Management"},{id:"burnout_recovery",label:"Burnout Recovery"},{id:"resilience_building",label:"Resilience Building"},{id:"workplace_wellness",label:"Workplace Wellness"}]},
  { id:"graphic_design",       label:"🎨 Graphic Design",            subcategories:[{id:"brand_identity_gd",label:"Brand Identity"},{id:"print_design",label:"Print & Packaging"},{id:"digital_design",label:"Digital & Social"},{id:"design_system_gd",label:"Design Systems"}]},
  { id:"data_annotation",      label:"🏷️ Data Annotation",           subcategories:[{id:"annotation_pipeline",label:"Pipeline Setup"},{id:"cv_annotation",label:"Computer Vision"},{id:"nlp_annotation",label:"NLP & Text"},{id:"quality_assurance",label:"QA & IAA"}]},
];

/* ─── Client-side detection ───────────────────────────────────────────────── */
const DOMAIN_KEYWORDS: Record<string, string[]> = {
  ai_image_generation:["midjourney","stable diffusion","comfyui","dall-e","dall e","leonardo ai","flux","ideogram","ai image","ai art","text to image","image generation","lora","dreambooth","controlnet","firefly","adobe firefly","ai illustration"],
  ai_video_generation:["runway","pika","sora","kling","luma","heygen","synthesia","ai video","text to video","ai animation","ai avatar","descript","invideo ai","veo","gen 2","gen 3"],
  startup_fundraising:["startup","pitch deck","fundraise","investor","vc","venture capital","seed round","series a","angel investor","term sheet","valuation","cap table","mvp","traction","saas metrics"],
  marketing_growth:["marketing","growth hacking","brand strategy","branding","campaign","seo","paid advertising","google ads","facebook ads","tiktok ads","influencer","email marketing","lead generation","conversion rate","sales funnel","roas"],
  product_development:["product roadmap","feature planning","user story","agile","scrum","sprint","mvp","prototype","ux research","api development","software architecture","microservices","web app","system design"],
  content_writing:["blog post","article writing","copywriting","content strategy","newsletter","email copy","video script","social media copy","whitepaper","case study","press release","landing page copy","seo content"],
  education_learning:["curriculum","lesson plan","course creation","e-learning","lms","assessment","learning objectives","instructional design","bloom","formative assessment","course outline"],
  ai_automation:["ai automation","machine learning","llm","gpt","chatgpt","prompt engineering","workflow automation","ai chatbot","ai agent","rag","vector database","fine tuning","langchain","openai api","n8n","zapier"],
  data_science_ai:["data science","machine learning model","data analysis","pandas","numpy","scikit","tensorflow","pytorch","neural network","nlp","computer vision","jupyter","sql analytics","big data","spark"],
  saas_product:["saas","b2b saas","subscription","arr","mrr","churn","plg","product led growth","saas pricing","saas launch","saas metrics","saas growth"],
  ecommerce_business:["ecommerce","shopify","amazon fba","dropshipping","online store","product listing","conversion optimisation","cart abandonment","woocommerce","print on demand","etsy","d2c"],
  uiux_design:["ui design","ux design","figma","design system","wireframe","prototype","usability testing","user research","interaction design","mobile ui","accessibility"],
  video_creation:["youtube","video content","video production","youtube seo","video editing","video script","youtube growth","shorts","reels","tiktok","vlog","monetization"],
  cloud_devops:["cloud","aws","google cloud","azure","devops","ci cd","docker","kubernetes","terraform","github actions","serverless","lambda","cloud security","site reliability"],
  mobile_app_development:["mobile app","ios app","android app","react native","flutter","swift","kotlin","app store","google play","mobile ux","cross platform","pwa"],
  cybersecurity:["cybersecurity","penetration testing","ethical hacking","vulnerability","soc analyst","security audit","zero trust","ransomware","gdpr security","threat modelling"],
  blockchain_web3:["blockchain","web3","smart contract","solidity","ethereum","defi","nft","dao","cryptocurrency","token","metamask","hardhat","polygon","solana","tokenomics"],
  finance_investment:["financial planning","investment strategy","stock market","crypto investment","personal finance","budgeting","wealth management","tax planning","dcf","portfolio","retirement"],
  health_wellness:["fitness plan","workout","nutrition plan","diet","meal planning","weight loss","muscle building","gym","wellness","mindfulness","sleep","supplement","cardio","strength training"],
  hr_people:["hiring","talent acquisition","recruitment","job interview","onboarding","performance management","okr","kpi","team building","company culture","employee engagement","hr strategy"],
  resume_career:["resume","cv","cover letter","job application","linkedin","job search","interview preparation","salary negotiation","career pivot","career growth"],
  marketing_social:["social media branding","instagram","linkedin personal brand","tiktok strategy","youtube channel","brand identity","content calendar","engagement rate","creator economy"],
  real_estate:["real estate","property investment","rental property","house flipping","commercial real estate","mortgage","property valuation","cap rate","rental yield"],
  podcast_creator:["podcast","podcasting","podcast launch","podcast growth","podcast monetization","spotify podcast","apple podcast","creator economy","substack","patreon"],
  freelancing_consulting:["freelancing","freelance business","consulting business","upwork","fiverr","freelance rates","client acquisition","freelance portfolio","agency","solopreneur"],
  graphic_design:["graphic design","logo design","brand identity","visual identity","typography","adobe illustrator","photoshop","figma graphic","print design","packaging design","motion graphics"],
  cafe_food_service:["cafe","coffee","restaurant","food service","bakery","bistro","menu","barista","espresso","latte","food truck","diner","cloud kitchen","catering"],
  fitness_sports:["fitness coaching","sports training","athletic performance","sports nutrition","powerlifting","crossfit","marathon","cycling","vo2 max","periodisation","injury prevention"],
  mental_health:["mental health","anxiety","stress","depression","therapy","cbt","mindfulness based","meditation","burnout","emotional wellbeing","resilience","trauma"],
  data_annotation:["data annotation","data labeling","annotation pipeline","label studio","roboflow","cvat","bounding box","segmentation","ner annotation","iaa","rlhf","ground truth"],
};

function clientDetectDomain(text: string): DetectionResult | null {
  if (!text || text.trim().length < 5) return null;
  const lower = text.toLowerCase();
  let bestId = "";
  let bestScore = 0;
  for (const [domainId, keywords] of Object.entries(DOMAIN_KEYWORDS)) {
    let score = 0;
    for (const kw of keywords) {
      if (lower.includes(kw)) score += kw.includes(" ") ? 12 : 8;
    }
    if (score > bestScore) { bestScore = score; bestId = domainId; }
  }
  if (!bestId || bestScore < 5) return null;
  const catEntry = ALL_CATEGORIES.find(c => c.id === bestId);
  const confidence = Math.min(99, Math.round(40 + (bestScore / 60) * 59));
  return {
    domainId: bestId,
    categoryLabel: CATEGORY_LABELS[bestId] ?? "💡 General",
    skillLabel: SKILL_LABELS[bestId] ?? "SmartGen Expert",
    confidence,
    subcategories: catEntry?.subcategories ?? [],
    matchedKeywords: [],
  };
}

function stripEmoji(label?: string | null) {
  if (!label) return "";
  return label.replace(/^[\p{Extended_Pictographic}‍️\s]+/gu, "").trim();
}

/* ── The downloaded .md file ────────────────────────────────────────────────
   The converted Markdown used to be written to disk exactly as the model
   returned it: no title, no date, and nothing saying where it came from. That
   file then travels — into a repo, a Notion page, someone's Downloads folder
   six months later — and at that point it is an anonymous block of text.

   So the download gets a header. Everything in it renders as ordinary Markdown
   (no YAML front matter, which most viewers show as raw junk at the top of the
   file) and reads as a document rather than a stamp: what it is, what it was
   made from, when, and by whom.

   The COPY button is deliberately left alone — copying is for pasting straight
   into something the person is already writing, and a banner is the last thing
   they want in the middle of it.
   ─────────────────────────────────────────────────────────────────────────── */
const TOKUN_SITE = "https://www.tokun.world";

/** Trailing spaces, runs of blank lines, and a missing final newline — the
    three things that make a generated file look machine-made. */
function tidyMarkdown(md: string) {
  return md
    .replace(/\r\n?/g, "\n")
    .replace(/[ \t]+$/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** A filename that survives every OS: no slashes, colons or trailing dots. */
function safeFileStem(name: string) {
  const stem = name.replace(/\.[^.]+$/, "").trim();
  const cleaned = stem
    .replace(/[\\/:*?"<>|]+/g, "-")
    .replace(/\s+/g, " ")
    .replace(/^[.\s]+|[.\s]+$/g, "")
    .slice(0, 80);
  return cleaned || "document";
}

function buildMarkdownFile(result: { filename: string; format: string; markdown: string }) {
  const body = tidyMarkdown(result.markdown);
  const stem = safeFileStem(result.filename);

  const when = new Date().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  /* The body often opens with its own H1 — the document's real title, and a
     better one than the filename. Where it has one, that heading is lifted out
     and the attribution goes UNDER it: title, then where it came from, then the
     content. Otherwise the note would sit above the document's own title, and
     the file would read as a Tokun notice that happens to contain a document.

     Lifting it also avoids the alternative, which is adding a second H1 of our
     own and leaving the file with two competing titles. */
  const lines = body.split("\n");
  const hasOwnTitle = /^#\s+\S/.test(lines[0] || "");
  const title = hasOwnTitle ? lines[0] : `# ${stem}`;
  const rest = hasOwnTitle ? lines.slice(1).join("\n").trim() : body;

  const contents =
    `${title}\n\n` +
    `> Converted to Markdown by **[Tokun](${TOKUN_SITE})** — ${TOKUN_SITE}  \n` +
    `> Source: \`${result.filename}\` (${result.format.toUpperCase()}) · ${when}\n\n` +
    `---\n\n` +
    `${rest}\n\n` +
    `---\n\n` +
    `<sub>Made with Tokun · [${TOKUN_SITE.replace(/^https?:\/\//, "")}](${TOKUN_SITE})</sub>\n`;

  return { name: `${stem}.md`, contents };
}

function unwrapJson(raw: string): string {
  const s = raw.replace(/^```json\s*/i,"").replace(/^```\s*/i,"").replace(/```\s*$/i,"").trim();
  if (s.startsWith("{")) { try { const p = JSON.parse(s); if (p.optimizedText) return p.optimizedText; } catch {} }
  return raw;
}

/* ─── PromptRenderer ─────────────────────────────────────────────────────── */
function isSectionHeader(line: string): boolean {
  const t = line.trim();
  if (!t || t.length > 80) return false;
  if (/^\[.{3,60}\]$/.test(t)) return true;
  if (/^\*\*[^*]{3,60}\*\*$/.test(t)) return true;
  if (t.endsWith(":") && t.length < 70 && /^[A-Z]/.test(t) && !t.startsWith("-")) return true;
  return false;
}
function isTableRow(line: string): boolean { return /^\|.+\|/.test(line.trim()); }
function isTableSep(line: string): boolean { return /^\|[\s\-:|]+\|/.test(line.trim()); }
function renderInline(text: string): string {
  return text
    .replace(/`([^`]+)`/g,'<code style="background:rgba(255,255,255,0.08);border-radius:4px;padding:1px 5px;font-family:monospace;font-size:0.88em;color:#a78bfa">$1</code>')
    .replace(/\*\*([^*]+)\*\*/g,'<strong style="color:#fff;font-weight:600">$1</strong>')
    .replace(/\*([^*]+)\*/g,'<em style="color:rgba(255,255,255,0.75)">$1</em>')
    .replace(/→\s*(Output|Result|Deliverable):/gi,'<span style="color:#8b5cf6;font-weight:600;margin:0 4px">→</span><span style="color:#c4b5fd;font-weight:600"> Output:</span>')
    .replace(/→/g,'<span style="color:#8b5cf6;font-weight:500;margin:0 3px">→</span>');
}

type Block = {type:"pill";text:string}|{type:"table";rows:string[][]}|{type:"bullet";text:string}|{type:"numbered";n:string;text:string}|{type:"step";title:string;time:string;content:string}|{type:"para";text:string}|{type:"gap"};

// Detects: "Title (1-2 weeks):" or "**Title (1 week):**" at start of line
const STEP_RE = /^\*{0,2}([^(*\n]{3,60}?)\s+\((\d[\d\-– ]*\s*(?:week|day|month|hour)s?)\)\*{0,2}:?\s*(.*)/i;

function parseBlocks(raw: string): Block[] {
  const lines = raw.split("\n"); const blocks: Block[] = []; let i = 0;
  while (i < lines.length) {
    const line = lines[i]; const t = line.trim();
    if (!t) { blocks.push({type:"gap"}); i++; continue; }
    if (isTableRow(t)) {
      const rows: string[][] = [];
      while (i < lines.length && isTableRow(lines[i].trim())) {
        if (!isTableSep(lines[i].trim())) rows.push(lines[i].trim().replace(/^\||\|$/g,"").split("|").map(c=>c.trim()));
        i++;
      }
      if (rows.length) blocks.push({type:"table",rows}); continue;
    }
    if (isSectionHeader(t)) { blocks.push({type:"pill",text:t.replace(/^\[|\]$/g,"").replace(/^\*\*|\*\*$/g,"").replace(/:$/,"")}); i++; continue; }
    const bm = t.match(/^[-•*]\s+(.*)/); if (bm) { blocks.push({type:"bullet",text:bm[1]}); i++; continue; }
    const nm = t.match(/^(\d+)\.\s+(.*)/); if (nm) { blocks.push({type:"numbered",n:nm[1],text:nm[2]}); i++; continue; }
    const sm = t.match(STEP_RE); if (sm) { blocks.push({type:"step",title:sm[1].trim(),time:sm[2].trim(),content:sm[3].trim()}); i++; continue; }
    blocks.push({type:"para",text:t}); i++;
  }
  return blocks;
}

function PromptRenderer({text}: {text: string}) {
  const blocks = parseBlocks(text);
  return (
    <div style={{fontSize:14,lineHeight:1.65,color:"rgba(255,255,255,0.82)"}}>
      {blocks.map((b,idx) => {
        if (b.type==="gap") return <div key={idx} style={{height:10}}/>;
        if (b.type==="pill") return (
          <div key={idx} style={{marginTop:18,marginBottom:10}}>
            <span style={{display:"inline-block",background:PILL_BG,color:"#fff",fontWeight:700,fontSize:13,padding:"5px 16px",borderRadius:100}}>{b.text}</span>
          </div>
        );
        if (b.type==="table") return (
          <div key={idx} style={{overflowX:"auto",margin:"10px 0"}}>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
              {b.rows.map((row,ri) => (
                <tr key={ri} style={{borderBottom:"1px solid rgba(255,255,255,0.07)"}}>
                  {row.map((cell,ci) => ri===0
                    ? <th key={ci} style={{textAlign:"left",padding:"8px 14px",color:"rgba(255,255,255,0.9)",fontWeight:600,background:"rgba(255,255,255,0.04)"}}>{cell}</th>
                    : <td key={ci} style={{padding:"8px 14px",color:ci===0?"rgba(255,255,255,0.75)":"rgba(139,92,246,0.9)"}}>{cell}</td>
                  )}
                </tr>
              ))}
            </table>
          </div>
        );
        if (b.type==="step") return (
          <div key={idx} style={{display:"flex",gap:12,margin:"8px 0",padding:"10px 14px",borderRadius:12,background:"rgba(139,92,246,0.05)",border:"1px solid rgba(139,92,246,0.12)"}}>
            <div style={{flexShrink:0,marginTop:2}}>
              <span style={{display:"inline-block",background:"rgba(139,92,246,0.18)",color:"#a78bfa",fontSize:11,fontWeight:700,padding:"2px 8px",borderRadius:100,whiteSpace:"nowrap"}}>{b.time}</span>
            </div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontWeight:700,color:"#fff",fontSize:13,marginBottom:b.content?4:0}}>{b.title}</div>
              {b.content && <div style={{fontSize:13,color:"rgba(255,255,255,0.65)",lineHeight:1.5}} dangerouslySetInnerHTML={{__html:renderInline(b.content)}}/>}
            </div>
          </div>
        );
        if (b.type==="bullet") return <div key={idx} style={{display:"flex",gap:10,marginBottom:5}}><span style={{color:"#8b5cf6",marginTop:5,flexShrink:0,fontSize:8}}>●</span><span style={{flex:1}} dangerouslySetInnerHTML={{__html:renderInline(b.text)}}/></div>;
        if (b.type==="numbered") return <div key={idx} style={{display:"flex",gap:10,marginBottom:5}}><span style={{color:"#8b5cf6",fontFamily:"monospace",fontSize:12,marginTop:1,minWidth:18,flexShrink:0}}>{b.n}.</span><span style={{flex:1}} dangerouslySetInnerHTML={{__html:renderInline(b.text)}}/></div>;
        return <p key={idx} style={{margin:"0 0 4px 0"}} dangerouslySetInnerHTML={{__html:renderInline((b as {type:"para";text:string}).text)}}/>;
      })}
    </div>
  );
}

/* ─── Open With Menu ─────────────────────────────────────────────────────── */
// Real brand marks (react-icons/si) — DeepSeek has no icon in this react-icons
// version yet, so it keeps an emoji fallback rather than an inconsistent one-off.
const LLM_TOOLS = [
  {label:"ChatGPT",   Icon:SiOpenai,       emoji:null, color:"#ffffff", buildUrl:(q:string)=>`https://chatgpt.com/?q=${encodeURIComponent(q)}`},
  {label:"Claude",    Icon:SiClaude,       emoji:null, color:"#D97757", buildUrl:(q:string)=>`https://claude.ai/new?q=${encodeURIComponent(q)}`},
  {label:"Gemini",    Icon:SiGooglegemini,emoji:null, color:"#4285F4", buildUrl:(q:string)=>`https://gemini.google.com/app?q=${encodeURIComponent(q)}`},
  {label:"Perplexity",Icon:SiPerplexity,   emoji:null, color:"#1FB8CD", buildUrl:(q:string)=>`https://www.perplexity.ai/?q=${encodeURIComponent(q)}`},
  {label:"Grok",      Icon:SiX,            emoji:null, color:"#ffffff", buildUrl:(q:string)=>`https://x.com/i/grok?text=${encodeURIComponent(q)}`},
  {label:"DeepSeek",  Icon:null,           emoji:"🌊", color:"#4D6BFE", buildUrl:(q:string)=>`https://chat.deepseek.com/?q=${encodeURIComponent(q)}`},
];

function LlmButtons({text, onToast}: {text: string; onToast:(msg:string)=>void}) {
  return (
    <>
      {LLM_TOOLS.map(t => (
        <button key={t.label}
          title={`Open with ${t.label}`}
          onClick={() => {
            navigator.clipboard.writeText(text).catch(()=>{});
            window.open(t.buildUrl(text),"_blank","noopener,noreferrer");
            onToast(`Opening ${t.label} — prompt copied to clipboard`);
          }}
          style={{width:38,height:38,borderRadius:"50%",border:"1px solid rgba(255,255,255,0.12)",background:"#1a1a1b",color:"rgba(255,255,255,0.8)",fontSize:16,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}
          onMouseEnter={e=>(e.currentTarget.style.background="rgba(255,255,255,0.08)")}
          onMouseLeave={e=>(e.currentTarget.style.background="#1a1a1b")}>
          {t.Icon ? <t.Icon size={17} color={t.color}/> : t.emoji}
        </button>
      ))}
    </>
  );
}

/* ─── Deep Mode Modal ────────────────────────────────────────────────────── */
function DeepModal({
  questions, answers, setAnswers, isLoading, domainLabel, subcategoryLabel,
  onClose, onSkip, onGenerate, isGenerating,
}: {
  questions: DeepQuestion[]; answers: Record<string,string>;
  setAnswers: React.Dispatch<React.SetStateAction<Record<string,string>>>;
  isLoading: boolean; domainLabel: string|null; subcategoryLabel: string|null;
  onClose: () => void; onSkip: () => void; onGenerate: () => void; isGenerating: boolean;
}) {
  return (
    <div style={{position:"fixed",inset:0,zIndex:2000,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(0,0,0,0.75)",backdropFilter:"blur(4px)",padding:20}}>
      <div style={{width:"100%",maxWidth:540,borderRadius:20,background:"#0f0f10",border:"1px solid rgba(255,255,255,0.1)",boxShadow:"0 20px 80px rgba(0,0,0,0.7)"}}>
        {/* Header */}
        <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",padding:"24px 24px 8px"}}>
          <div>
            <h2 style={{margin:0,fontSize:18,fontWeight:700,color:"#fff"}}>Deep Mode — A few quick questions</h2>
            <p style={{margin:"4px 0 0",fontSize:12,color:"rgba(255,255,255,0.4)",display:"flex",alignItems:"center",gap:6}}>
              {domainLabel && <><span>{CATEGORY_LABELS[domainLabel]?.match(/\p{Extended_Pictographic}/u)?.[0] ?? "💡"}</span><span>{stripEmoji(CATEGORY_LABELS[domainLabel] ?? domainLabel)}</span></>}
              {subcategoryLabel && <><span>·</span><span>{subcategoryLabel}</span></>}
              <span>· All optional</span>
            </p>
          </div>
          <button onClick={onClose} style={{marginTop:2,width:32,height:32,borderRadius:"50%",border:"1px solid rgba(255,255,255,0.1)",background:"rgba(255,255,255,0.05)",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>
            <X size={15} color="rgba(255,255,255,0.6)"/>
          </button>
        </div>

        {/* Questions */}
        <div style={{padding:"16px 24px",maxHeight:"55vh",overflowY:"auto"}}>
          {isLoading ? (
            <div style={{display:"flex",justifyContent:"center",padding:"32px 0"}}>
              <Loader2 size={24} style={{animation:"spin 1s linear infinite",color:"rgba(255,255,255,0.3)"}}/>
            </div>
          ) : questions.length === 0 ? (
            <p style={{color:"rgba(255,255,255,0.3)",fontSize:13}}>No questions available for this domain.</p>
          ) : (
            <div style={{display:"flex",flexDirection:"column",gap:16}}>
              {questions.map(q => (
                <div key={q.id}>
                  <label style={{fontSize:13,color:"rgba(255,255,255,0.8)",display:"block",marginBottom:6,fontWeight:500}}>{q.question}</label>
                  {q.type==="select" && q.options ? (
                    <div style={{position:"relative"}}>
                      <select value={answers[q.id]||""} onChange={e=>setAnswers(a=>({...a,[q.id]:e.target.value}))}
                        style={{width:"100%",height:44,background:"#1c1c1e",border:"1px solid rgba(255,255,255,0.15)",borderRadius:10,padding:"0 12px",color:"#fff",fontSize:13,outline:"none",appearance:"none",cursor:"pointer",fontFamily:"inherit"}}>
                        <option value="" disabled style={{background:"#1c1c1e",color:"rgba(255,255,255,0.4)"}}>Select…</option>
                        {q.options.map(o=><option key={o} value={o} style={{background:"#1c1c1e",color:"#fff"}}>{o}</option>)}
                      </select>
                      <ChevronDown size={14} style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",color:"rgba(255,255,255,0.4)",pointerEvents:"none"}}/>
                    </div>
                  ) : q.type==="textarea" ? (
                    <textarea value={answers[q.id]||""} onChange={e=>setAnswers(a=>({...a,[q.id]:e.target.value}))}
                      placeholder={q.placeholder||"Your answer…"} rows={3}
                      style={{width:"100%",background:"#1c1c1e",border:"1px solid rgba(255,255,255,0.15)",borderRadius:10,padding:"10px 12px",color:"#fff",fontSize:13,outline:"none",resize:"vertical",fontFamily:"inherit",boxSizing:"border-box"}}/>
                  ) : (
                    <input type="text" value={answers[q.id]||""} onChange={e=>setAnswers(a=>({...a,[q.id]:e.target.value}))}
                      placeholder={q.placeholder||"Your answer…"}
                      style={{width:"100%",height:44,background:"#1c1c1e",border:"1px solid rgba(255,255,255,0.15)",borderRadius:10,padding:"0 12px",color:"#fff",fontSize:13,outline:"none",fontFamily:"inherit",boxSizing:"border-box"}}/>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"16px 24px",borderTop:"1px solid rgba(255,255,255,0.07)"}}>
          <button onClick={onSkip} style={{fontSize:13,color:"rgba(255,255,255,0.5)",background:"none",border:"none",cursor:"pointer",padding:"8px 0"}}
            onMouseEnter={e=>(e.currentTarget.style.color="rgba(255,255,255,0.8)")}
            onMouseLeave={e=>(e.currentTarget.style.color="rgba(255,255,255,0.5)")}>
            Skip &amp; Generate
          </button>
          <button onClick={onGenerate} disabled={isGenerating}
            style={{height:44,padding:"0 28px",borderRadius:10,border:"none",background:GRADIENT,color:"#fff",fontSize:13,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",gap:8,opacity:isGenerating?0.6:1}}>
            {isGenerating ? <><Loader2 size={15} style={{animation:"spin 1s linear infinite"}}/> Generating…</> : "Generate"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Document Mode Modal ────────────────────────────────────────────────────
   Shown the moment a file is attached. The two jobs a user arrives with —
   "give me this as Markdown" and "read this and build me a prompt" — cost very
   different things (the first spends no tokens at all), so we ask instead of
   guessing. */
function DocModeModal({ file, onPick, onClose, isBusy }: {
  file: File;
  onPick: (mode: DocMode) => void;
  onClose: () => void;
  isBusy: boolean;
}) {
  const ext = (file.name.split(".").pop() || "").toUpperCase();
  const sizeKb = file.size / 1024;
  const sizeLabel = sizeKb >= 1024 ? `${(sizeKb / 1024).toFixed(1)} MB` : `${Math.round(sizeKb)} KB`;

  const OPTIONS: Array<{ mode: DocMode; Icon: typeof FileDown; title: string; body: string; badge: string; badgeTone: string }> = [
    {
      mode: "markdown",
      Icon: FileDown,
      title: "Convert to Markdown",
      body: "Turn the file into clean .md — headings, tables and lists preserved. Copy it or download the file.",
      badge: "Free · no tokens",
      badgeTone: "#34d399",
    },
    {
      mode: "prompt",
      Icon: Wand2,
      title: "Parse & build a prompt",
      body: "Read the document and write one ready-to-use AI prompt from its content.",
      badge: "Uses tokens",
      badgeTone: "#c4b5fd",
    },
    {
      mode: "both",
      Icon: Sparkles,
      title: "Do both",
      body: "Get the Markdown file and a prompt built from it, in one pass.",
      badge: "Uses tokens",
      badgeTone: "#fbbf24",
    },
  ];

  return (
    <div style={{position:"fixed",inset:0,zIndex:2000,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(0,0,0,0.75)",backdropFilter:"blur(4px)",padding:20}}>
      <div style={{width:"100%",maxWidth:520,borderRadius:20,background:"#0f0f10",border:"1px solid rgba(255,255,255,0.1)",boxShadow:"0 20px 80px rgba(0,0,0,0.7)"}}>
        {/* Header */}
        <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",padding:"24px 24px 4px"}}>
          <div style={{minWidth:0}}>
            <h2 style={{margin:0,fontSize:18,fontWeight:700,color:"#fff"}}>What should we do with this file?</h2>
            <p style={{margin:"6px 0 0",fontSize:12,color:"rgba(255,255,255,0.45)",display:"flex",alignItems:"center",gap:6}}>
              <FileText size={13}/>
              <span style={{maxWidth:300,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{file.name}</span>
              <span>·</span><span>{ext}</span><span>·</span><span>{sizeLabel}</span>
            </p>
          </div>
          <button onClick={onClose} disabled={isBusy} title="Cancel"
            style={{marginTop:2,width:32,height:32,flexShrink:0,borderRadius:"50%",border:"1px solid rgba(255,255,255,0.1)",background:"rgba(255,255,255,0.05)",cursor:isBusy?"default":"pointer",opacity:isBusy?0.4:1,display:"flex",alignItems:"center",justifyContent:"center"}}>
            <X size={15} color="rgba(255,255,255,0.6)"/>
          </button>
        </div>

        {/* Options */}
        <div style={{display:"flex",flexDirection:"column",gap:10,padding:"16px 24px 24px"}}>
          {OPTIONS.map(({mode,Icon,title,body,badge,badgeTone}) => (
            <button key={mode} onClick={()=>onPick(mode)} disabled={isBusy}
              style={{display:"flex",alignItems:"flex-start",gap:14,padding:"16px 16px",textAlign:"left",borderRadius:14,background:"#1a1a1b",border:"1px solid rgba(255,255,255,0.09)",cursor:isBusy?"default":"pointer",opacity:isBusy?0.5:1,transition:"border-color 0.15s, background 0.15s",fontFamily:"inherit"}}
              onMouseEnter={e=>{if(!isBusy){e.currentTarget.style.borderColor="rgba(139,92,246,0.55)";e.currentTarget.style.background="rgba(139,92,246,0.08)";}}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor="rgba(255,255,255,0.09)";e.currentTarget.style.background="#1a1a1b";}}>
              <div style={{width:36,height:36,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",borderRadius:10,background:"rgba(255,255,255,0.06)"}}>
                <Icon size={17} color="rgba(255,255,255,0.85)"/>
              </div>
              <div style={{minWidth:0,flex:1}}>
                <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap",marginBottom:4}}>
                  <span style={{fontSize:14,fontWeight:600,color:"#fff"}}>{title}</span>
                  <span style={{fontSize:10,fontWeight:600,letterSpacing:"0.02em",padding:"2px 8px",borderRadius:100,color:badgeTone,background:"rgba(255,255,255,0.06)"}}>{badge}</span>
                </div>
                <div style={{fontSize:12,color:"rgba(255,255,255,0.5)",lineHeight:1.45}}>{body}</div>
              </div>
              {isBusy ? null : <ArrowRight size={15} style={{marginTop:9,flexShrink:0}} color="rgba(255,255,255,0.28)"/>}
            </button>
          ))}
          {isBusy && (
            <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8,paddingTop:4,fontSize:13,color:"rgba(255,255,255,0.5)"}}>
              <Loader2 size={15} style={{animation:"spin 1s linear infinite"}}/> Working on it…
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Category Modal with search ─────────────────────────────────────────── */
function CategoryModal({current, onSelect, onClose}: {
  current: string|null;
  onSelect:(id:string,label:string,skillLabel:string)=>void;
  onClose:()=>void;
}) {
  const [search, setSearch] = useState("");
  const filtered = search.trim()
    ? ALL_CATEGORIES.filter(c => c.label.toLowerCase().includes(search.toLowerCase()) || c.subcategories.some(s=>s.label.toLowerCase().includes(search.toLowerCase())))
    : ALL_CATEGORIES;

  return (
    <div style={{position:"fixed",inset:0,zIndex:2000,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(0,0,0,0.75)",backdropFilter:"blur(4px)",padding:20}}>
      <div style={{width:"100%",maxWidth:640,maxHeight:"80vh",borderRadius:20,background:"#0f0f10",border:"1px solid rgba(255,255,255,0.1)",boxShadow:"0 20px 80px rgba(0,0,0,0.7)",display:"flex",flexDirection:"column"}}>
        {/* Header */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"20px 20px 12px",flexShrink:0}}>
          <div>
            <div style={{fontWeight:700,fontSize:17,color:"#fff"}}>Select a Category</div>
            <div style={{fontSize:12,color:"rgba(255,255,255,0.3)",marginTop:2}}>{filtered.length} of {ALL_CATEGORIES.length} domains</div>
          </div>
          <button onClick={onClose} style={{width:32,height:32,borderRadius:"50%",border:"1px solid rgba(255,255,255,0.1)",background:"rgba(255,255,255,0.05)",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>
            <X size={15} color="rgba(255,255,255,0.6)"/>
          </button>
        </div>

        {/* Search */}
        <div style={{padding:"0 20px 12px",flexShrink:0}}>
          <div style={{position:"relative"}}>
            <Search size={14} style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",color:"rgba(255,255,255,0.3)",pointerEvents:"none"}}/>
            <input type="text" placeholder="Search domains and subcategories…" value={search} onChange={e=>setSearch(e.target.value)} autoFocus
              style={{width:"100%",height:38,paddingLeft:36,paddingRight:search?36:12,background:"#1a1a1b",border:"1px solid rgba(255,255,255,0.1)",borderRadius:10,color:"#fff",fontSize:12,outline:"none",fontFamily:"inherit",boxSizing:"border-box"}}/>
            {search && <button onClick={()=>setSearch("")} style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",color:"rgba(255,255,255,0.3)",display:"flex",alignItems:"center"}}><X size={12}/></button>}
          </div>
        </div>

        {/* Grid */}
        <div style={{overflowY:"auto",padding:"0 20px 20px"}}>
          {filtered.length === 0 ? (
            <div style={{textAlign:"center",padding:"32px 0",color:"rgba(255,255,255,0.3)",fontSize:13}}>No domains match "{search}"</div>
          ) : (
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              {filtered.map(cat => {
                const isActive = current === cat.id;
                return (
                  <button key={cat.id}
                    onClick={() => { onSelect(cat.id, cat.label, SKILL_LABELS[cat.id]||cat.label); onClose(); }}
                    style={{textAlign:"left",padding:"14px 16px",borderRadius:14,border:isActive?"1px solid rgba(139,92,246,0.5)":"1px solid rgba(255,255,255,0.07)",background:isActive?"rgba(139,92,246,0.12)":"rgba(255,255,255,0.02)",cursor:"pointer",display:"flex",alignItems:"flex-start",gap:10}}
                    onMouseEnter={e=>{if(!isActive)e.currentTarget.style.background="rgba(255,255,255,0.05)";}}
                    onMouseLeave={e=>{if(!isActive)e.currentTarget.style.background="rgba(255,255,255,0.02)";}}>
                    <span style={{fontSize:18,lineHeight:1,marginTop:1}}>{cat.label.match(/\p{Extended_Pictographic}/u)?.[0]||"💡"}</span>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:13,fontWeight:600,color:isActive?"#c4b5fd":"#fff",marginBottom:3}}>{stripEmoji(cat.label)}</div>
                      <div style={{fontSize:11,color:"rgba(255,255,255,0.35)",lineHeight:1.3,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{cat.subcategories.map(s=>s.label).join(" · ")}</div>
                    </div>
                    {isActive && <Check size={14} color="#8b5cf6" style={{flexShrink:0,marginTop:2}}/>}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Main Component ─────────────────────────────────────────────────────── */
// Keeps the idea + generated output alive across navigation (e.g. switching to
// Prompt Optimiser and back) — only the Clear button should wipe it.
const SMARTGEN_DRAFT_KEY = "smartgen_draft_v1";
function loadSmartgenDraft(): { prompt?: string; generated?: string } | null {
  try {
    const raw = localStorage.getItem(SMARTGEN_DRAFT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export default function SmarterPrompt({onPromptGenerated, onUseInOptimizer}: SmarterPromptProps) {
  const {user} = useAuth();
  const navigate = useNavigate();

  const [prompt,       setPrompt]       = useState(() => loadSmartgenDraft()?.prompt || "");
  const [skillMode,    setSkillMode]    = useState(false);
  const [deepMode,     setDeepMode]     = useState(false);
  const [activeIdea,   setActiveIdea]   = useState<number|null>(null);

  // Detection
  const [detection,       setDetection]       = useState<DetectionResult|null>(null);
  const [isDetecting,     setIsDetecting]     = useState(false);
  const [manualDomainId,  setManualDomainId]  = useState<string|null>(null);
  const [manualLabel,     setManualLabel]     = useState<string|null>(null);
  const [selectedSubcat,  setSelectedSubcat]  = useState<SubcategoryChip|null>(null);
  const [showCatModal,    setShowCatModal]    = useState(false);

  // Deep mode
  const [showDeepModal,   setShowDeepModal]   = useState(false);
  const [deepQuestions,   setDeepQuestions]   = useState<DeepQuestion[]>([]);
  const [deepAnswers,     setDeepAnswers]     = useState<Record<string,string>>({});
  const [loadingQs,       setLoadingQs]       = useState(false);

  // Output
  const [isGenerating,  setIsGenerating]  = useState(false);
  const [generated,     setGenerated]     = useState(() => loadSmartgenDraft()?.generated || "");
  const [streamedText,  setStreamedText]  = useState("");
  const [isEditing,     setIsEditing]     = useState(false);
  const [editable,      setEditable]      = useState("");
  const [isBookmarked,  setIsBookmarked]  = useState(false);
  /* The _id of the Smartgen row this output was written to. Every generation
     already persists one (that's how the quota spend is recorded), so saving to
     a collection is a reference to a document that exists rather than a second
     copy of the text. Null until that write comes back — the bookmark button
     stays disabled while it is. */
  const [smartgenDocId, setSmartgenDocId] = useState<string|null>(null);
  const [savingBookmark, setSavingBookmark] = useState(false);
  const [tokensUsed,    setTokensUsed]    = useState<number|null>(null);

  // Document attachment → Markdown and/or prompt
  const [attachedFile,  setAttachedFile]  = useState<File|null>(null);
  const [showDocModal,  setShowDocModal]  = useState(false);
  const [markdownResult, setMarkdownResult] = useState<{filename:string;format:string;markdown:string}|null>(null);
  const [mdCopied,      setMdCopied]      = useState(false);

  const abortRef    = useRef<AbortController|null>(null);
  const detectTimer = useRef<ReturnType<typeof setTimeout>|null>(null);
  const outputRef   = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Derived
  const effectiveDomainId    = manualDomainId ?? detection?.domainId ?? null;
  const effectiveDomainLabel = manualLabel    ?? detection?.categoryLabel ?? null;
  const effectiveSubcatLabel = selectedSubcat?.label ?? null;
  const chipList: SubcategoryChip[] = manualDomainId
    ? (ALL_CATEGORIES.find(c=>c.id===manualDomainId)?.subcategories ?? [])
    : (detection?.subcategories ?? []);

  const displayText = isEditing ? editable : (generated || streamedText);
  const hasOutput   = !!displayText;

  // Show detection banner: when skillMode OR deepMode is on and detection found something
  const showBanner = (skillMode || deepMode) && !generated && !streamedText && (detection||manualDomainId) && prompt.trim().length >= 8;

  // Hallucination nudge: skill or deep mode, short prompt, low confidence
  const promptWords = prompt.trim().split(/\s+/).filter(Boolean).length;
  const showNudge = (skillMode || deepMode) && !generated && !isGenerating && promptWords > 0 && promptWords < 8 && !manualDomainId && (!detection || (detection.confidence??0) < 50);

  /* ── Detection ── runs when skillMode OR deepMode is active ── */
  useEffect(() => {
    if (!skillMode && !deepMode) { setDetection(null); setSelectedSubcat(null); return; }
    if (detectTimer.current) clearTimeout(detectTimer.current);
    if (prompt.trim().length < 8) { setDetection(null); setSelectedSubcat(null); return; }
    detectTimer.current = setTimeout(() => {
      const local = clientDetectDomain(prompt);
      if (local) {
        setDetection(local);
        if (!selectedSubcat) setSelectedSubcat(local.subcategories[0] ?? null);
      } else {
        setIsDetecting(true);
        llmService.detectDomain(prompt)
          .then(r => { if (r) { setDetection(r); if (!selectedSubcat) setSelectedSubcat(r.subcategories[0]??null); } })
          .catch(()=>{})
          .finally(()=>setIsDetecting(false));
      }
    }, 350);
  }, [prompt, skillMode, deepMode]);

  useEffect(() => {
    if (streamedText && outputRef.current) outputRef.current.scrollTop = outputRef.current.scrollHeight;
  }, [streamedText]);

  // Persist the idea + generated output so navigating away (e.g. to Prompt
  // Optimiser) and back doesn't lose it — only Clear removes it.
  useEffect(() => {
    try {
      if (!prompt && !generated) {
        localStorage.removeItem(SMARTGEN_DRAFT_KEY);
      } else {
        localStorage.setItem(SMARTGEN_DRAFT_KEY, JSON.stringify({ prompt, generated }));
      }
    } catch {}
  }, [prompt, generated]);

  /* ── Open deep modal: loads questions then shows popup ── */
  const openDeepModal = useCallback(async () => {
    const domainId = effectiveDomainId ?? "general_expert";
    setLoadingQs(true);
    setShowDeepModal(true);
    setDeepAnswers({});
    try {
      const qs = await llmService.getDeepQuestions(prompt, domainId, selectedSubcat?.id ?? domainId, effectiveSubcatLabel ?? undefined);
      setDeepQuestions(qs);
    } catch {
      setDeepQuestions([]);
    } finally {
      setLoadingQs(false);
    }
  }, [effectiveDomainId, selectedSubcat, effectiveSubcatLabel, prompt]);

  // The prompt/PDF generation itself already succeeded by the time this runs — this only
  // records token usage against the quota. If it fails, don't block the user from seeing
  // their result, but surface why so a silent quota mismatch doesn't look like a UI bug.
  const quotaSaveErrorMessages: Record<string,string> = {
    token_quota_exceeded: "You've used up your monthly token quota.",
    org_pool_exhausted: "Your organisation's token pool is exhausted.",
    org_subscription_inactive: "Your organisation's subscription isn't active.",
    subscription_inactive: "Your subscription isn't active.",
    member_cap_exceeded: "You've used up your assigned token cap.",
    insufficient_quota: "You've used up your monthly token quota.",
  };
  const warnIfQuotaSaveFailed = (res: {success:boolean; error?: string; message?: string}) => {
    if (res.success) return;
    toast({
      title: "Couldn't record token usage",
      // The server now sends a written reason for every quota/plan failure, so
      // prefer it; the local map stays as a fallback for older responses.
      description:
        res.message
        || quotaSaveErrorMessages[res.error || ""]
        || `This generation won't count toward your usage widget (${res.error}).`,
    });
  };

  /* ── Core generate function ── */
  const doGenerate = useCallback(async (answersOverride?: Record<string,string>) => {
    if (!user) { navigate("/login"); return; }
    if (!prompt.trim()) { toast({title:"Enter a product first"}); return; }
    // Token limit reached → block generation and prompt to subscribe.
    if (isOutOfTokens(user)) { toast(TOKEN_LIMIT_TOAST); return; }
    if (isGenerating) { abortRef.current?.abort(); return; }

    // Server-side gate, asked BEFORE the model runs. isOutOfTokens above only
    // reads the cached user, so it can't see things like an organisation that
    // never bought a plan — that used to surface only when saving, after the
    // generation had already streamed onto the screen.
    const gate = await llmService.checkSmartgenEligibility();
    if (!gate.allowed) {
      toast({ title: "Can't generate", description: gate.message });
      return;
    }

    setShowDeepModal(false);
    setIsGenerating(true); setGenerated(""); setStreamedText(""); setIsEditing(false); setTokensUsed(null);
    const ctrl = new AbortController(); abortRef.current = ctrl;

    const context = skillMode ? {
      domainId:         effectiveDomainId ?? undefined,
      subcategoryId:    selectedSubcat?.id ?? undefined,
      subcategoryLabel: effectiveSubcatLabel ?? undefined,
      deepAnswers:      answersOverride ?? (Object.keys(deepAnswers).length ? deepAnswers : undefined),
    } : {};

    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      const res = await fetch(`${API_BASE}/api/smartgen/stream`, {
        method:"POST",
        headers:{"Content-Type":"application/json",...(token?{Authorization:`Bearer ${token}`}:{})},
        body:JSON.stringify({prompt:prompt.trim(),context,skillMode}),
        signal:ctrl.signal, credentials:"include",
      });

      if (!res.ok || !res.body) throw new Error("stream_unavailable");
      const reader = res.body.getReader(); const decoder = new TextDecoder();
      let buf = ""; let accum = ""; let final = "";
      let finalUsage: {promptTokens?:number; completionTokens?:number; totalTokens?:number}|null = null;

      while (true) {
        const {done,value} = await reader.read(); if (done) break;
        buf += decoder.decode(value,{stream:true});
        const lines = buf.split("\n"); buf = lines.pop()||"";
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const evt = JSON.parse(line.slice(6));
            if (evt.error) throw new Error(evt.message||"stream_error");
            if (evt.delta) { accum += evt.delta; setStreamedText(unwrapJson(accum)); }
            if (evt.done)  { final = evt.optimizedText || unwrapJson(accum); finalUsage = evt.usage ?? null; }
          } catch(pe) { if ((pe as Error).message!=="stream_error") continue; throw pe; }
        }
      }

      const result = final || unwrapJson(accum);
      if (!result) throw new Error("empty_response");
      // Only count the tokens actually generated (the output) — not the tokens spent
      // reading the input — that's what "tokens used" should mean to the user.
      const outputTokens = finalUsage?.completionTokens ?? Math.ceil(result.length/3.5);
      setGenerated(result); setStreamedText("");
      setTokensUsed(outputTokens);
      // Deduct quota BEFORE notifying the parent (which refreshes the quota widget) —
      // otherwise the widget refetches before the spend lands and looks stale.
      const saveRes = await llmService.saveSmartgen({inputPrompt:prompt.trim(),detailedPrompt:result,tokensUsed:outputTokens});
      warnIfQuotaSaveFailed(saveRes);
      setSmartgenDocId(saveRes.id ?? null);
      onPromptGenerated?.(result);

    } catch(err) {
      if ((err as Error).name==="AbortError") { setIsGenerating(false); return; }
      try {
        const r = await llmService.generateDetailedPrompt(prompt.trim());
        const clean = unwrapJson((r as any)?.optimizedText ?? (typeof r==="string"?r:""));
        if (!clean) throw new Error("empty");
        const outputTokens = (r as any)?.tokens ?? Math.ceil(clean.length/3.5);
        setGenerated(clean); setStreamedText("");
        setTokensUsed(outputTokens);
        const saveRes = await llmService.saveSmartgen({inputPrompt:prompt.trim(),detailedPrompt:clean,tokensUsed:outputTokens});
        warnIfQuotaSaveFailed(saveRes);
        setSmartgenDocId(saveRes.id ?? null);
        onPromptGenerated?.(clean);
      } catch(fe) {
        toast({title:"Generation failed",description:(fe as Error).message});
      }
    } finally { setIsGenerating(false); }
  }, [user, prompt, skillMode, effectiveDomainId, selectedSubcat, effectiveSubcatLabel, deepAnswers, navigate, onPromptGenerated, isGenerating]);

  /* ── Convert an attached document → Markdown and/or a ready-to-use prompt ──
     One upload, one server-side conversion; `mode` decides what comes back. */
  const doConvertDoc = useCallback(async (mode: DocMode) => {
    if (!user) { navigate("/login"); return; }
    if (!attachedFile) return;
    if (isGenerating) { abortRef.current?.abort(); return; }

    const wantsPrompt = mode === "prompt" || mode === "both";

    // Only the prompt-producing modes reach an LLM, so only they are quota-gated.
    // Plain Markdown conversion is local CPU on the server and stays free —
    // gating it would be charging for work that costs us nothing.
    if (wantsPrompt) {
      if (isOutOfTokens(user)) { toast(TOKEN_LIMIT_TOAST); return; }
      const gate = await llmService.checkSmartgenEligibility();
      if (!gate.allowed) {
        toast({ title: "Can't generate", description: gate.message });
        return;
      }
    }

    setIsGenerating(true);
    setMarkdownResult(null);
    if (wantsPrompt) { setGenerated(""); setStreamedText(""); setIsEditing(false); setTokensUsed(null); }

    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      const form = new FormData();
      form.append("file", attachedFile);
      form.append("mode", mode);
      if (prompt.trim()) form.append("instructions", prompt.trim());

      const res = await fetch(`${API_BASE}/api/smartgen/doc-to-markdown`, {
        method: "POST",
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: form,
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok || !data?.success) {
        throw new Error(DOC_ERRORS[data?.error] || data?.message || data?.error || "Could not convert this file");
      }

      const sourceName = attachedFile.name;
      setShowDocModal(false);
      setAttachedFile(null);

      if (data.markdown) {
        setMarkdownResult({ filename: sourceName, format: data.format, markdown: data.markdown });
      }

      if (wantsPrompt) {
        if (!data.prompt) throw new Error("The document converted, but no prompt came back.");
        // Only count the tokens actually generated (the prompt output) — not the
        // tokens spent reading the document's text as input.
        const outputTokens = data.usage?.completionTokens ?? Math.ceil(data.prompt.length / 3.5);
        setGenerated(data.prompt);
        setTokensUsed(outputTokens);
        if (data.truncated) {
          toast({ title: "Document was very long", description: "Only the first part of it was used to build the product." });
        }
        // Deduct quota BEFORE notifying the parent (which refreshes the quota widget) —
        // otherwise the widget refetches before the spend lands and looks stale.
        const saveRes = await llmService.saveSmartgen({
          inputPrompt: `Converted from ${String(data.format || "").toUpperCase()}: ${sourceName}`,
          detailedPrompt: data.prompt,
          tokensUsed: outputTokens,
        });
        warnIfQuotaSaveFailed(saveRes);
        setSmartgenDocId(saveRes.id ?? null);
        onPromptGenerated?.(data.prompt);
      } else {
        toast({ title: "Converted to Markdown", description: `${data.charCount?.toLocaleString?.() ?? ""} characters ready.` });
      }
    } catch (err) {
      toast({ title: "Conversion failed", description: (err as Error).message });
    } finally {
      setIsGenerating(false);
    }
  }, [user, attachedFile, prompt, isGenerating, navigate, onPromptGenerated]);

  /* ── Generate button click ──
     If a file is attached → re-open the "what should we do with this?" popup
     If deep mode ON and domain known → show "Next" → open deep modal
     Otherwise → generate directly
  ── */
  const handleGenerateClick = useCallback(async () => {
    if (attachedFile) { setShowDocModal(true); return; }
    if (!prompt.trim()) return;
    if (isGenerating) { abortRef.current?.abort(); return; }
    // Deep mode: always show "Next" → open the questions popup first
    if (deepMode && !showDeepModal) {
      await openDeepModal();
      return;
    }
    doGenerate();
  }, [prompt, isGenerating, deepMode, showDeepModal, openDeepModal, doGenerate, attachedFile]);

  /* ── Save (bookmark) ─────────────────────────────────────────────────────
     Writes a reference into the user's Saved Collections under the "smartgen"
     section, which is what the Saved page (the bookmark icon in the header)
     reads for its Smartgen tab. This button used to be a pure `setIsBookmarked`
     toggle — it filled in purple and saved nothing, so the icon claimed a
     save had happened that no page could ever show.

     Quick save: straight into the section's directItems, no folder. Clicking a
     filled bookmark removes it again via the DELETE route, so the filled state
     always means "this is in your saved list". */
  const toggleBookmark = useCallback(async () => {
    if (savingBookmark) return;

    if (!smartgenDocId) {
      // Only reachable if the generation succeeded but its own save failed —
      // warnIfQuotaSaveFailed has already explained why.
      toast({ title: "Can't save yet", description: "This product wasn't recorded, so it can't be added to your saved list. Try regenerating." });
      return;
    }

    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    const nextSaved = !isBookmarked;
    setSavingBookmark(true);
    // Optimistic, so the icon responds on the tap rather than after a round
    // trip; rolled back below if the request fails.
    setIsBookmarked(nextSaved);

    try {
      const res = nextSaved
        ? await fetch(`${API_BASE}/api/saved-collections`, {
            method: "POST",
            headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
            credentials: "include",
            body: JSON.stringify({ section: "smartgen", refId: smartgenDocId }),
          })
        : await fetch(`${API_BASE}/api/saved-collections/smartgen/${smartgenDocId}`, {
            method: "DELETE",
            headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
            credentials: "include",
          });

      const data = await res.json().catch(() => ({} as any));
      if (!res.ok || data?.success === false) throw new Error(data?.error || `http_${res.status}`);

      toast({ title: nextSaved ? "Saved" : "Removed from saved" });
    } catch (err) {
      setIsBookmarked(!nextSaved);
      toast({
        title: nextSaved ? "Couldn't save" : "Couldn't remove",
        description: (err as Error)?.message || "Please try again.",
      });
    } finally {
      setSavingBookmark(false);
    }
  }, [savingBookmark, smartgenDocId, isBookmarked]);

  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    // Validate on extension, not MIME type — browsers report inconsistent (and
    // often empty) types for Office formats, which is what made the old
    // `file.type !== "application/pdf"` check the tightest thing here.
    const ext = (file.name.split(".").pop() || "").toLowerCase();
    if (!DOC_EXTENSIONS.includes(ext)) {
      toast({
        title: "Unsupported file type",
        description: "Try a PDF, Word, Excel, PowerPoint, OpenDocument, CSV or text file.",
      });
      return;
    }
    if (file.size > DOC_MAX_BYTES) {
      toast({ title: "File too large", description: "Files must be under 20MB." });
      return;
    }
    setAttachedFile(file);
    setShowDocModal(true);
  };

  function handleCopy() {
    navigator.clipboard.writeText(displayText).then(()=>toast({title:"Copied to clipboard"}));
  }

  /* Markdown output actions — deliberately separate from handleCopy, which is
     bound to the generated-prompt card. */
  function handleCopyMarkdown() {
    if (!markdownResult) return;
    navigator.clipboard.writeText(markdownResult.markdown).then(() => {
      setMdCopied(true);
      setTimeout(() => setMdCopied(false), 1800);
    });
  }

  function handleDownloadMarkdown() {
    if (!markdownResult) return;

    const file = buildMarkdownFile(markdownResult);
    const blob = new Blob([file.contents], { type: "text/markdown;charset=utf-8" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  const inputBg    = "#111214";
  const cardBorder = "1px solid #282829";
  const btnDark    = {background:"#1a1a1b",border:"1px solid rgba(255,255,255,0.10)",color:"rgba(255,255,255,0.65)"} as const;

  // Generate button label: "Next" whenever Deep mode is ON
  const isDeepNext = deepMode && !isGenerating;

  return (
    <div style={{width:"100%",maxWidth:1000,margin:"0 auto",fontFamily:"Inter, ui-sans-serif, system-ui"}}>

      {/* ── Ideas Strip ──────────────────────────────────────────────────── */}
      {/* Layout (4 columns on desktop, swipeable rail on a phone) is in
          index.css under .smartgen-ideas — a media query can't be expressed in
          the inline styles the rest of this component uses. */}
      <div className="smartgen-ideas" style={{background:inputBg,borderRadius:20,border:cardBorder,marginBottom:16}}>
        {EXAMPLE_IDEAS.map(({Icon,title,text},idx) => (
          <button key={idx} onClick={()=>{setPrompt(text);setActiveIdea(idx);setDetection(null);setManualDomainId(null);setSelectedSubcat(null);}}
            style={{display:"flex",alignItems:"center",gap:14,padding:"18px 20px",textAlign:"left",background:activeIdea===idx?"rgba(255,255,255,0.04)":"transparent",border:"none",borderLeft:idx>0?"1px solid #282829":"none",cursor:"pointer",transition:"background 0.15s"}}
            onMouseEnter={e=>{if(activeIdea!==idx)e.currentTarget.style.background="rgba(255,255,255,0.02)";}}
            onMouseLeave={e=>{if(activeIdea!==idx)e.currentTarget.style.background="transparent";}}>
            <div style={{width:32,height:32,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(255,255,255,0.06)",borderRadius:8}}>
              <Icon size={16} color="rgba(255,255,255,0.8)"/>
            </div>
            <div>
              <div style={{fontWeight:700,fontSize:14,color:"#fff",marginBottom:4}}>{title}</div>
              <div style={{fontSize:12,color:"rgba(255,255,255,0.5)",lineHeight:1.3}}>{text}</div>
            </div>
          </button>
        ))}
      </div>

      {/* ── Input Card ───────────────────────────────────────────────────── */}
      <div style={{background:inputBg,borderRadius:20,border:cardBorder,overflow:"hidden",marginBottom:hasOutput||isGenerating?24:0}}>

        {/* Textarea */}
        <div style={{padding:"20px 20px 8px"}}>
          <textarea value={prompt} onChange={e=>{setPrompt(e.target.value);setDetection(null);setManualDomainId(null);setSelectedSubcat(null);}}
            placeholder="Describe your goal and SmartGen will craft the perfect expert product…"
            style={{width:"100%",minHeight:130,resize:"none",background:"transparent",border:"none",outline:"none",color:"#fff",fontSize:14,lineHeight:1.6,fontFamily:"inherit",caretColor:"#8b5cf6"}}
            onKeyDown={e=>{if(e.key==="Enter"&&(e.metaKey||e.ctrlKey))handleGenerateClick();}}/>
        </div>

        {/* ── Hallucination nudge ── */}
        {showNudge && (
          <div style={{margin:"0 16px 10px",display:"flex",alignItems:"flex-start",gap:8,padding:"10px 14px",borderRadius:12,background:"rgba(251,191,36,0.06)",border:"1px solid rgba(251,191,36,0.18)"}}>
            <AlertTriangle size={14} style={{color:"rgba(251,191,36,0.7)",marginTop:1,flexShrink:0}}/>
            <p style={{margin:0,fontSize:12,color:"rgba(251,191,36,0.7)",lineHeight:1.4}}>
              <strong style={{color:"rgba(251,191,36,0.9)"}}>Add more detail</strong> — short products produce generic outputs. Try adding your goal, audience, tool or budget.
            </p>
          </div>
        )}

        {/* ── Detection Banner ── */}
        {showBanner && (
          <div style={{margin:"0 16px 10px",padding:"10px 14px",borderRadius:14,background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)"}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:chipList.length?8:0}}>
              <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
                <span style={{fontSize:11,color:"rgba(255,255,255,0.35)",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.04em"}}>Detected</span>
                {isDetecting && <Loader2 size={11} style={{color:"#a78bfa",animation:"spin 1s linear infinite"}}/>}
                <span style={{width:1,height:12,background:"rgba(255,255,255,0.12)"}}/>
                <span style={{fontSize:14}}>{CATEGORY_LABELS[effectiveDomainId ?? ""]?.match(/\p{Extended_Pictographic}/u)?.[0] || "💡"}</span>
                <span style={{fontSize:12,fontWeight:600,color:"#e2e8f0"}}>{stripEmoji(effectiveDomainLabel)}</span>
                {detection?.skillLabel && <><span style={{color:"rgba(255,255,255,0.2)",fontSize:12}}>·</span><span style={{fontSize:12,color:"rgba(255,255,255,0.55)"}}>{detection.skillLabel}</span></>}
                {detection?.confidence && !manualDomainId && <span style={{fontSize:11,color:"rgba(255,255,255,0.3)"}}>{detection.confidence}% match</span>}
              </div>
              <button onClick={()=>setShowCatModal(true)}
                style={{display:"flex",alignItems:"center",gap:5,height:28,padding:"0 12px",borderRadius:100,border:"1px solid rgba(255,255,255,0.12)",background:"rgba(255,255,255,0.04)",color:"rgba(255,255,255,0.6)",fontSize:12,cursor:"pointer",flexShrink:0}}>
                Change <ChevronDown size={11}/>
              </button>
            </div>
            {chipList.length > 0 && (
              <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                {chipList.map(chip => {
                  const active = selectedSubcat?.id===chip.id;
                  return (
                    <button key={chip.id} onClick={()=>setSelectedSubcat(active?null:chip)}
                      style={{display:"inline-flex",alignItems:"center",gap:5,padding:"5px 12px",borderRadius:100,border:"none",cursor:"pointer",fontSize:12,fontWeight:active?600:400,transition:"all 0.15s",background:active?"linear-gradient(90deg,#ec4899,#8b5cf6)":"rgba(255,255,255,0.06)",color:active?"#fff":"rgba(255,255,255,0.6)"}}>
                      {active && <Check size={11}/>}{chip.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── Bottom Button Bar ── */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 16px 14px",borderTop:"1px solid #1e1e1f"}}>
          <div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}>

            {/* History */}
            <button style={{...btnDark,display:"flex",alignItems:"center",gap:6,height:36,padding:"0 14px",borderRadius:100,fontSize:13,cursor:"pointer"}}
              onClick={()=>navigate("/history?tab=smartgen")}>
              <History size={14}/> History
            </button>

            {/* Skill — purple identity always */}
            <button onClick={()=>{setSkillMode(v=>{if(v){setDetection(null);setSelectedSubcat(null);setManualDomainId(null);setManualLabel(null);}return !v;});}}
              style={{display:"flex",alignItems:"center",gap:6,height:36,padding:"0 14px",borderRadius:100,fontSize:13,cursor:"pointer",transition:"all 0.15s",
                background:skillMode?"rgba(124,58,237,0.3)":"rgba(139,92,246,0.07)",
                border:skillMode?"1px solid rgba(139,92,246,0.6)":"1px solid rgba(139,92,246,0.22)",
                color:skillMode?"#c4b5fd":"rgba(139,92,246,0.75)"}}>
              <Zap size={14} fill={skillMode?"#c4b5fd":"none"} color={skillMode?"#c4b5fd":"rgba(139,92,246,0.75)"}/> Skill
            </button>

            {/* Deep — amber identity always, fully independent of Skill */}
            <button onClick={()=>setDeepMode(v=>!v)}
              style={{display:"flex",alignItems:"center",gap:6,height:36,padding:"0 14px",borderRadius:100,fontSize:13,cursor:"pointer",transition:"all 0.15s",
                background:deepMode?"rgba(245,158,11,0.22)":"rgba(245,158,11,0.06)",
                border:deepMode?"1px solid rgba(245,158,11,0.6)":"1px solid rgba(245,158,11,0.22)",
                color:deepMode?"#fbbf24":"rgba(245,158,11,0.65)"}}>
              <Sparkles size={13} color={deepMode?"#fbbf24":"rgba(245,158,11,0.65)"}/> Deep
            </button>

            {/* Clear — wipes idea + generated output + attachment (the only way any of it goes away) */}
            {(prompt || generated || streamedText || attachedFile || markdownResult) && (
              <button onClick={()=>{
                setPrompt("");setActiveIdea(null);setDetection(null);setManualDomainId(null);setSelectedSubcat(null);setDeepAnswers({});
                // smartgenDocId goes with it — leaving the old id behind would
                // point the next Save at the previous generation's row.
                setGenerated("");setStreamedText("");setIsEditing(false);setEditable("");setIsBookmarked(false);setSmartgenDocId(null);
                setAttachedFile(null);setTokensUsed(null);setMarkdownResult(null);setShowDocModal(false);
              }}
                style={{...btnDark,display:"flex",alignItems:"center",gap:6,height:36,padding:"0 14px",borderRadius:100,fontSize:13,cursor:"pointer"}}>
                <X size={13}/> Clear
              </button>
            )}

            {/* Attach a document → convert to Markdown and/or a prompt */}
            <input ref={fileInputRef} type="file" accept={DOC_ACCEPT} onChange={handleFileSelected} style={{display:"none"}}/>
            {attachedFile ? (
              <div style={{display:"flex",alignItems:"center",gap:6,height:36,padding:"0 10px 0 14px",borderRadius:100,fontSize:13,background:"rgba(139,92,246,0.12)",border:"1px solid rgba(139,92,246,0.35)",color:"#c4b5fd"}}>
                <FileText size={14}/>
                <span style={{maxWidth:160,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{attachedFile.name}</span>
                <button type="button" onClick={()=>{setAttachedFile(null);setShowDocModal(false);}} title="Remove attachment"
                  style={{display:"flex",alignItems:"center",justifyContent:"center",width:20,height:20,borderRadius:"50%",border:"none",background:"rgba(255,255,255,0.1)",color:"#c4b5fd",cursor:"pointer"}}>
                  <X size={12}/>
                </button>
              </div>
            ) : (
              <button type="button" onClick={()=>fileInputRef.current?.click()} title="Attach a PDF, Word, Excel, PowerPoint, CSV or text file"
                style={{...btnDark,display:"flex",alignItems:"center",gap:6,height:36,padding:"0 14px",borderRadius:100,fontSize:13,cursor:"pointer"}}>
                <Paperclip size={14}/> Attach File
              </button>
            )}
          </div>

          {/* Generate / Next / Stop */}
          <button onClick={handleGenerateClick} disabled={!prompt.trim()&&!isGenerating&&!attachedFile}
            style={{display:"flex",alignItems:"center",gap:8,height:40,padding:"0 22px",borderRadius:100,border:"none",
              cursor:prompt.trim()||isGenerating||attachedFile?"pointer":"not-allowed",
              background:prompt.trim()||isGenerating||attachedFile?GEN_BG:"rgba(124,58,237,0.3)",
              color:"#fff",fontWeight:600,fontSize:14,transition:"opacity 0.15s",
              opacity:!prompt.trim()&&!isGenerating&&!attachedFile?0.5:1}}>
            {isGenerating
              ? <><Loader2 size={15} style={{animation:"spin 1s linear infinite"}}/> Stop</>
              : attachedFile
              ? <><span>Convert File</span><ArrowRight size={15}/></>
              : isDeepNext
              ? <><span>Next</span><ArrowRight size={15}/></>
              : <><span>Generate</span><ArrowRight size={15}/></>
            }
          </button>
        </div>
      </div>

      {/* ── Markdown Card ────────────────────────────────────────────────────
          Raw .md is shown in a monospace block on purpose: the point of this
          mode is the Markdown source itself, so rendering it would hide the
          very thing the user asked for. */}
      {markdownResult && (
        <div style={{marginBottom:24}}>
          <div style={{textAlign:"center",marginBottom:16}}>
            <h2 style={{margin:0,fontSize:28,fontWeight:700,color:"#fff",letterSpacing:"-0.02em"}}>Markdown</h2>
            <div style={{marginTop:6,display:"flex",alignItems:"center",justifyContent:"center",gap:6,color:"rgba(255,255,255,0.4)",fontSize:13,flexWrap:"wrap"}}>
              <FileText size={13}/>
              <span>{markdownResult.filename}</span>
              <span>·</span><span>{markdownResult.format.toUpperCase()}</span>
              <span>·</span><span>{markdownResult.markdown.length.toLocaleString()} characters</span>
            </div>
          </div>

          <div style={{background:inputBg,borderRadius:20,border:cardBorder,overflow:"hidden"}}>
            <pre style={{margin:0,padding:"24px 28px",maxHeight:480,overflow:"auto",color:"rgba(255,255,255,0.82)",fontSize:13,lineHeight:1.6,whiteSpace:"pre-wrap",wordBreak:"break-word",fontFamily:"ui-monospace, SFMono-Regular, Menlo, monospace"}}>
              {markdownResult.markdown}
            </pre>

            <div style={{display:"flex",alignItems:"center",flexWrap:"wrap",gap:8,padding:"14px 20px",borderTop:"1px solid #1e1e1f"}}>
              <button onClick={handleCopyMarkdown}
                style={{display:"flex",alignItems:"center",gap:7,height:38,padding:"0 18px",borderRadius:100,border:"none",background:"#7c3aed",color:"#fff",fontWeight:600,fontSize:13,cursor:"pointer"}}>
                {mdCopied ? <><Check size={14}/> Copied</> : <><Copy size={14}/> Copy Markdown</>}
              </button>
              <button onClick={handleDownloadMarkdown}
                style={{...btnDark,display:"flex",alignItems:"center",gap:7,height:38,padding:"0 16px",borderRadius:100,fontSize:13,cursor:"pointer"}}>
                <Download size={14}/> Download .md
              </button>
              <button onClick={()=>onUseInOptimizer?.(markdownResult.markdown)}
                style={{...btnDark,display:"flex",alignItems:"center",gap:7,height:38,padding:"0 16px",borderRadius:100,fontSize:13,cursor:"pointer"}}>
                <Sparkles size={14}/> Optimise
              </button>
              <button onClick={()=>setMarkdownResult(null)} title="Dismiss"
                style={{...btnDark,marginLeft:"auto",display:"flex",alignItems:"center",gap:7,height:38,padding:"0 16px",borderRadius:100,fontSize:13,cursor:"pointer"}}>
                <X size={14}/> Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Output Card ──────────────────────────────────────────────────── */}
      {(isGenerating || hasOutput) && (
        <div>
          <div style={{textAlign:"center",marginBottom:16}}>
            <h2 style={{margin:0,fontSize:28,fontWeight:700,color:"#fff",letterSpacing:"-0.02em"}}>Detailed Product</h2>
            <div style={{marginTop:6,display:"flex",alignItems:"center",justifyContent:"center",gap:6,color:"rgba(255,255,255,0.4)",fontSize:13}}>
              <span style={{fontSize:15}}>⊞</span>
              {detection||manualDomainId
                ? <><span>{stripEmoji(effectiveDomainLabel)}</span>{effectiveSubcatLabel&&<><span>·</span><span>{effectiveSubcatLabel}</span></>}</>
                : <span>General · Product Engineering</span>
              }
            </div>
          </div>

          <div style={{background:inputBg,borderRadius:20,border:cardBorder,overflow:"hidden"}}>
            <div ref={outputRef} style={{padding:"24px 28px",maxHeight:560,overflowY:"auto"}}>
              {isEditing ? (
                <textarea value={editable} onChange={e=>setEditable(e.target.value)}
                  style={{width:"100%",minHeight:300,resize:"vertical",background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:12,padding:14,color:"rgba(255,255,255,0.85)",fontSize:14,lineHeight:1.65,fontFamily:"inherit",outline:"none",boxSizing:"border-box"}}/>
              ) : displayText ? (
                <PromptRenderer text={displayText}/>
              ) : (
                <div style={{display:"flex",flexDirection:"column",gap:10}}>
                  {[80,95,65,85,55,90,70].map((w,i)=>(
                    <div key={i} style={{height:12,borderRadius:6,background:"rgba(255,255,255,0.07)",width:`${w}%`,animation:"pulse 1.5s ease-in-out infinite"}}/>
                  ))}
                </div>
              )}
            </div>

            {hasOutput && !isGenerating && (
              <div style={{display:"flex",alignItems:"center",flexWrap:"wrap",gap:8,padding:"14px 20px",borderTop:"1px solid #1e1e1f"}}>
                <button onClick={handleCopy} style={{display:"flex",alignItems:"center",gap:7,height:38,padding:"0 18px",borderRadius:100,border:"none",background:"#7c3aed",color:"#fff",fontWeight:600,fontSize:13,cursor:"pointer"}}>
                  <Copy size={14}/> Copy Product
                </button>
                <button onClick={()=>onUseInOptimizer?.(displayText)} style={{display:"flex",alignItems:"center",gap:7,height:38,padding:"0 18px",borderRadius:100,border:"none",background:PILL_BG,color:"#fff",fontWeight:600,fontSize:13,cursor:"pointer"}}>
                  <Sparkles size={14}/> Optimise
                </button>
                <button onClick={()=>doGenerate()} style={{...btnDark,display:"flex",alignItems:"center",gap:7,height:38,padding:"0 16px",borderRadius:100,fontSize:13,cursor:"pointer"}}>
                  <RotateCcw size={14}/> Regenerate
                </button>
                <button onClick={()=>{if(!isEditing)setEditable(displayText);setIsEditing(v=>!v);}} style={{...btnDark,display:"flex",alignItems:"center",gap:7,height:38,padding:"0 16px",borderRadius:100,fontSize:13,cursor:"pointer"}}>
                  <Pencil size={14}/> {isEditing?"Done":"Edit"}
                </button>
                <LlmButtons text={displayText} onToast={msg=>toast({title:msg})}/>
                <button
                  onClick={toggleBookmark}
                  disabled={savingBookmark}
                  title={isBookmarked ? "Remove from saved" : "Save to your collection"}
                  aria-label={isBookmarked ? "Remove from saved" : "Save to your collection"}
                  aria-pressed={isBookmarked}
                  style={{width:38,height:38,borderRadius:"50%",border:"1px solid rgba(255,255,255,0.12)",background:"#1a1a1b",cursor:savingBookmark?"default":"pointer",opacity:savingBookmark?0.6:1,display:"flex",alignItems:"center",justifyContent:"center"}}
                >
                  {savingBookmark
                    ? <Loader2 size={15} className="animate-spin" color="rgba(255,255,255,0.55)"/>
                    : <Bookmark size={15} fill={isBookmarked?"#8b5cf6":"none"} color={isBookmarked?"#8b5cf6":"rgba(255,255,255,0.55)"}/>}
                </button>
                {tokensUsed != null && (
                  <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:6,height:38,padding:"0 16px",borderRadius:100,background:"rgba(124,58,237,0.12)",border:"1px solid rgba(124,58,237,0.25)",color:"#c4b5fd",fontSize:13,fontWeight:600}}>
                    <Zap size={14}/> {tokensUsed.toLocaleString()} tokens used
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Document Mode Modal ───────────────────────────────────────────── */}
      {showDocModal && attachedFile && (
        <DocModeModal
          file={attachedFile}
          isBusy={isGenerating}
          onPick={doConvertDoc}
          onClose={()=>setShowDocModal(false)}
        />
      )}

      {/* ── Deep Mode Modal ───────────────────────────────────────────────── */}
      {showDeepModal && (
        <DeepModal
          questions={deepQuestions} answers={deepAnswers} setAnswers={setDeepAnswers}
          isLoading={loadingQs}
          domainLabel={effectiveDomainId}
          subcategoryLabel={effectiveSubcatLabel}
          onClose={()=>setShowDeepModal(false)}
          onSkip={()=>doGenerate()}
          onGenerate={()=>doGenerate(deepAnswers)}
          isGenerating={isGenerating}
        />
      )}

      {/* ── Category Modal ────────────────────────────────────────────────── */}
      {showCatModal && (
        <CategoryModal
          current={effectiveDomainId}
          onSelect={(id,label,skillLabel)=>{
            setManualDomainId(id); setManualLabel(label);
            setDetection(prev=>prev?{...prev,domainId:id,categoryLabel:label,skillLabel}:{domainId:id,categoryLabel:label,skillLabel,confidence:100,subcategories:ALL_CATEGORIES.find(c=>c.id===id)?.subcategories??[],matchedKeywords:[]});
            setSelectedSubcat(ALL_CATEGORIES.find(c=>c.id===id)?.subcategories[0]??null);
          }}
          onClose={()=>setShowCatModal(false)}
        />
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100%{opacity:.5} 50%{opacity:1} }
        textarea::placeholder { color: rgba(255,255,255,0.28); }
        input::placeholder { color: rgba(255,255,255,0.28); }
        select option { background: #1c1c1e; color: #fff; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
      `}</style>
    </div>
  );
}
