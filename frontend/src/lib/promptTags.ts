/**
 * The tag vocabulary a seller picks from when listing a prompt.
 *
 * Why a catalog at all: tags are what buyers search and what the marketplace
 * groups by, and a free-text box produced "AI", "ai art", "Ai-Art" as three
 * different tags on three listings. The upload form used to offer five
 * hardcoded suggestions — all of them design words — so anything outside
 * design was typed by hand and never matched anything else.
 *
 * Grouped rather than flat so the picker can say WHERE a suggestion comes from
 * ("Photography", "Marketing") while you type, which is what makes a list this
 * long usable — the same thing the skills picker does on a freelancer profile.
 *
 * Free text is still allowed: the picker keeps an explicit "Add …" row. This
 * list is the well-trodden path, not a fence.
 */

export type TagGroup = {
  group: string;
  tags: string[];
};

/* A "Model" group (ChatGPT, Midjourney, Sora, …) was here and has been removed
   on request: those are third-party product names, they date fast, and a tag
   naming the tool is not what a buyer searches for — they search for what the
   prompt makes. The catalog below describes subject and craft only. Anyone who
   still wants a model name can type it; the picker's "Add …" row takes it. */
export const PROMPT_TAG_GROUPS: TagGroup[] = [
  {
    group: "Image",
    tags: [
      "Photorealistic", "Hyper-realistic", "Cinematic", "Portrait", "Product Shot",
      "Studio Lighting", "Golden Hour", "Macro", "Wide Angle", "Bokeh", "Isometric",
      "Flat Lay", "Minimalist", "Maximalist", "Vector", "Line Art", "Watercolour",
      "Oil Painting", "Pencil Sketch", "Pixel Art", "Low Poly", "3D Render",
      "Claymation", "Papercraft", "Neon", "Cyberpunk", "Vaporwave", "Retro",
      "Vintage", "Noir", "Surreal", "Fantasy", "Sci-Fi", "Anime", "Manga",
      "Cartoon", "Comic", "Caricature", "Sticker", "Emoji", "Wallpaper",
      "Texture", "Pattern", "Seamless Pattern", "Background", "Transparent Background",
    ],
  },
  {
    group: "Video",
    tags: [
      "Text to Video", "Image to Video", "Talking Head", "B-Roll", "Green Screen",
      "Motion Graphics", "Explainer Video", "Product Demo", "Reels", "Shorts",
      "TikTok", "Storyboard", "Camera Movement", "Slow Motion", "Time Lapse",
      "Drone Shot", "Loop", "Transition", "VFX", "Lip Sync",
    ],
  },
  {
    group: "Design",
    tags: [
      "Logo", "Branding", "Brand Identity", "Brand Guidelines", "Typography",
      "Colour Palette", "Icon Set", "Illustration", "Poster", "Flyer", "Brochure",
      "Business Card", "Packaging", "Label Design", "Book Cover", "Album Art",
      "Thumbnail", "Banner", "Infographic", "Presentation", "Pitch Deck",
      "Mockup", "Merchandise", "T-Shirt Design", "Sticker Design", "Signage",
    ],
  },
  {
    group: "UI/UX",
    tags: [
      "UI Design", "UX", "UX Writing", "Wireframe", "Prototype", "Design System",
      "Landing Page", "Dashboard", "Mobile App", "Web App", "Onboarding Flow",
      "User Flow", "Component Library", "Accessibility", "Dark Mode",
      "Responsive Design", "Figma", "Micro-copy",
    ],
  },
  {
    group: "Coding",
    tags: [
      "Code Generation", "Code Review", "Refactoring", "Debugging", "Unit Tests",
      "Documentation", "API", "REST API", "GraphQL", "Database", "SQL", "NoSQL",
      "Regex", "Bash", "DevOps", "CI/CD", "Docker", "Kubernetes", "Cloud",
      "AWS", "Azure", "Security", "Performance", "Algorithms", "Data Structures",
      "React", "Next.js", "Vue", "Angular", "Node.js", "Python", "JavaScript",
      "TypeScript", "Java", "Go", "Rust", "PHP", "Swift", "Kotlin", "Flutter",
      "React Native", "WordPress", "Shopify", "Web Scraping", "Automation Script",
    ],
  },
  {
    group: "Writing",
    tags: [
      "Copywriting", "Blog Post", "Article", "Essay", "Storytelling", "Fiction",
      "Screenplay", "Script", "Poetry", "Song Lyrics", "Ghostwriting", "Editing",
      "Proofreading", "Summarisation", "Paraphrasing", "Translation", "Tone of Voice",
      "Headlines", "Product Description", "Technical Writing", "Whitepaper",
      "Case Study", "Press Release", "Newsletter", "Bio", "Resume", "Cover Letter",
    ],
  },
  {
    group: "Marketing",
    tags: [
      "Ad Copy", "Facebook Ads", "Google Ads", "SEO", "Keyword Research",
      "Meta Description", "Email Marketing", "Cold Email", "Landing Page Copy",
      "Sales Funnel", "Lead Magnet", "Content Calendar", "Campaign Strategy",
      "Brand Strategy", "Market Research", "Competitor Analysis", "Persona",
      "A/B Testing", "Conversion", "Growth Hacking", "Affiliate", "Influencer",
      "Product Launch", "Customer Retention",
    ],
  },
  {
    group: "Social Media",
    tags: [
      "Instagram", "LinkedIn", "X (Twitter)", "YouTube", "Facebook", "Pinterest",
      "Threads", "Reddit", "Captions", "Hashtags", "Carousel", "Community Management",
      "Viral Hooks", "Content Repurposing", "Creator Economy",
    ],
  },
  {
    group: "Business",
    tags: [
      "Business Plan", "Startup", "Investor Pitch", "Financial Model", "Budgeting",
      "Accounting", "Invoicing", "Legal", "Contract", "Terms of Service",
      "Privacy Policy", "SOP", "Project Management", "Meeting Notes", "OKRs",
      "Hiring", "Job Description", "Interview Questions", "Onboarding",
      "Performance Review", "Customer Support", "Sales Script", "Cold Outreach",
      "Negotiation", "E-commerce", "Dropshipping", "Real Estate", "Consulting",
    ],
  },
  {
    group: "Data & AI",
    tags: [
      "Data Analysis", "Data Cleaning", "Data Visualisation", "Excel", "Google Sheets",
      "Power BI", "Tableau", "Machine Learning", "Deep Learning", "NLP",
      "Computer Vision", "Prompt Engineering", "Chain of Thought", "Few-shot",
      "RAG", "Fine-tuning", "AI Agent", "Chatbot", "Workflow Automation",
      "Zapier", "Make.com", "n8n",
    ],
  },
  {
    group: "Education",
    tags: [
      "Lesson Plan", "Study Guide", "Flashcards", "Quiz", "Exam Prep", "Explainer",
      "Tutoring", "Course Outline", "Curriculum", "Homework Help", "Research Paper",
      "Citations", "Literature Review", "Language Learning",
    ],
  },
  {
    group: "Lifestyle",
    tags: [
      "Fitness", "Workout Plan", "Nutrition", "Meal Plan", "Recipe", "Mental Health",
      "Meditation", "Journaling", "Habit Building", "Productivity", "Time Management",
      "Travel", "Itinerary", "Photography", "Music", "Gaming", "Sports", "Fashion",
      "Interior Design", "Gardening", "Parenting", "Astrology", "Devotional",
      "Festival", "Wedding", "Gift Ideas",
    ],
  },
];

/** Flat list, order preserved. Used for the untyped "popular" view. */
export const ALL_PROMPT_TAGS: string[] = PROMPT_TAG_GROUPS.flatMap((g) => g.tags);

const GROUP_BY_TAG = new Map<string, string>(
  PROMPT_TAG_GROUPS.flatMap((g) => g.tags.map((t) => [t.toLowerCase(), g.group] as const))
);

export function tagGroup(tag: string): string | undefined {
  return GROUP_BY_TAG.get(tag.trim().toLowerCase());
}

/** Case- and spacing-insensitive equality, so "ui design" ≡ "UI Design". */
export function sameTag(a: string, b: string): boolean {
  return a.trim().toLowerCase() === b.trim().toLowerCase();
}

/**
 * Suggestions for what has been typed so far.
 *
 * Prefix matches rank above substring ones — typing "log" should lead with
 * "Logo", not "Dialogue" — and anything already picked is dropped rather than
 * shown greyed out, since a disabled row in a list this long is just noise.
 */
export function searchPromptTags(
  query: string,
  chosen: string[] = [],
  limit = 24
): string[] {
  const taken = new Set(chosen.map((t) => t.trim().toLowerCase()));
  const q = query.trim().toLowerCase();

  if (!q) return ALL_PROMPT_TAGS.filter((t) => !taken.has(t.toLowerCase())).slice(0, limit);

  const prefix: string[] = [];
  const contains: string[] = [];

  for (const tag of ALL_PROMPT_TAGS) {
    const lower = tag.toLowerCase();
    if (taken.has(lower)) continue;
    if (lower.startsWith(q)) prefix.push(tag);
    else if (lower.includes(q)) contains.push(tag);
    if (prefix.length >= limit) break;
  }

  return [...prefix, ...contains].slice(0, limit);
}
