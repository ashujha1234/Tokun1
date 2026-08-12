// constants/freelancerCatalog.js
//
// Seed data for the two lists the Become-a-Freelancer wizard picks from.
//
// SKILLS drive the autocomplete: type "c++" and "C++" has to come back as
// something selectable. Each entry may carry aliases, which is what makes the
// search forgiving — "js", "reactjs", "node" and "postgres" are what people
// actually type, and none of them is the canonical name.
//
// Aliases must NOT overlap across entries. "c" aliasing to both C and C# would
// make the top result arbitrary, so near-collisions (c / c++ / c#) are left to
// match on their names alone.
//
// Adding to this file is safe and idempotent: seeding upserts by slug and never
// deletes, so a skill someone has already put on their profile can't vanish.

const SKILLS = [
  // ── Programming languages ────────────────────────────────────────────────
  { name: "JavaScript", group: "Programming languages", aliases: ["js", "ecmascript", "vanilla js"] },
  { name: "TypeScript", group: "Programming languages", aliases: ["ts"] },
  { name: "Python", group: "Programming languages", aliases: ["py", "python3"] },
  { name: "Java", group: "Programming languages", aliases: ["jdk", "jvm"] },
  { name: "C++", group: "Programming languages", aliases: ["cpp", "cplusplus", "c plus plus"] },
  { name: "C#", group: "Programming languages", aliases: ["csharp", "c sharp", "dotnet c#"] },
  { name: "C", group: "Programming languages", aliases: ["ansi c", "c language"] },
  { name: "Go", group: "Programming languages", aliases: ["golang"] },
  { name: "Rust", group: "Programming languages", aliases: ["rustlang"] },
  { name: "PHP", group: "Programming languages", aliases: ["php8", "laravel php"] },
  { name: "Ruby", group: "Programming languages", aliases: ["ruby lang"] },
  { name: "Swift", group: "Programming languages", aliases: ["swiftui lang", "ios swift"] },
  { name: "Kotlin", group: "Programming languages", aliases: ["kt"] },
  { name: "Dart", group: "Programming languages", aliases: [] },
  { name: "Scala", group: "Programming languages", aliases: [] },
  { name: "R", group: "Programming languages", aliases: ["r lang", "rstats"] },
  { name: "MATLAB", group: "Programming languages", aliases: ["matlab scripting"] },
  { name: "Solidity", group: "Programming languages", aliases: ["smart contract solidity"] },
  { name: "Shell scripting", group: "Programming languages", aliases: ["bash", "zsh", "sh scripting"] },
  { name: "SQL", group: "Programming languages", aliases: ["ansi sql", "queries"] },

  // ── Frontend ─────────────────────────────────────────────────────────────
  { name: "React", group: "Frontend", aliases: ["reactjs", "react.js"] },
  { name: "Next.js", group: "Frontend", aliases: ["nextjs", "next js"] },
  { name: "Vue.js", group: "Frontend", aliases: ["vue", "vuejs", "vue3"] },
  { name: "Nuxt", group: "Frontend", aliases: ["nuxtjs", "nuxt.js"] },
  { name: "Angular", group: "Frontend", aliases: ["angularjs", "angular2"] },
  { name: "Svelte", group: "Frontend", aliases: ["sveltekit"] },
  { name: "HTML5", group: "Frontend", aliases: ["html", "markup"] },
  { name: "CSS3", group: "Frontend", aliases: ["css", "stylesheets"] },
  { name: "Sass", group: "Frontend", aliases: ["scss"] },
  { name: "Tailwind CSS", group: "Frontend", aliases: ["tailwind", "tailwindcss"] },
  { name: "Bootstrap", group: "Frontend", aliases: [] },
  { name: "Redux", group: "Frontend", aliases: ["redux toolkit", "rtk"] },
  { name: "Webpack", group: "Frontend", aliases: [] },
  { name: "Vite", group: "Frontend", aliases: ["vitejs"] },
  { name: "Web accessibility", group: "Frontend", aliases: ["a11y", "wcag", "accessibility"] },
  { name: "Responsive web design", group: "Frontend", aliases: ["responsive design", "mobile responsive"] },

  // ── Backend & APIs ───────────────────────────────────────────────────────
  { name: "Node.js", group: "Backend", aliases: ["node", "nodejs"] },
  { name: "Express.js", group: "Backend", aliases: ["express", "expressjs"] },
  { name: "NestJS", group: "Backend", aliases: ["nest js", "nest.js"] },
  { name: "Django", group: "Backend", aliases: ["django rest framework", "drf"] },
  { name: "Flask", group: "Backend", aliases: [] },
  { name: "FastAPI", group: "Backend", aliases: ["fast api"] },
  { name: "Laravel", group: "Backend", aliases: [] },
  { name: "Spring Boot", group: "Backend", aliases: ["spring", "springboot"] },
  { name: "Ruby on Rails", group: "Backend", aliases: ["rails", "ror"] },
  { name: "ASP.NET", group: "Backend", aliases: ["asp net", "dotnet", ".net"] },
  { name: "GraphQL", group: "Backend", aliases: ["apollo graphql"] },
  { name: "REST API design", group: "Backend", aliases: ["rest", "restful api", "api design"] },
  { name: "WebSockets", group: "Backend", aliases: ["socket.io", "socketio", "realtime sockets"] },
  { name: "Microservices", group: "Backend", aliases: ["microservice architecture"] },
  { name: "Authentication & authorization", group: "Backend", aliases: ["oauth", "jwt", "sso", "auth"] },
  { name: "Payment gateway integration", group: "Backend", aliases: ["razorpay", "stripe", "payments integration"] },

  // ── Databases & data ─────────────────────────────────────────────────────
  { name: "MongoDB", group: "Databases", aliases: ["mongo", "mongoose"] },
  { name: "PostgreSQL", group: "Databases", aliases: ["postgres", "psql"] },
  { name: "MySQL", group: "Databases", aliases: ["mariadb"] },
  { name: "Redis", group: "Databases", aliases: ["redis cache"] },
  { name: "SQLite", group: "Databases", aliases: [] },
  { name: "Elasticsearch", group: "Databases", aliases: ["elastic search", "opensearch"] },
  { name: "Firebase", group: "Databases", aliases: ["firestore"] },
  { name: "Supabase", group: "Databases", aliases: [] },
  { name: "Database design", group: "Databases", aliases: ["schema design", "data modelling", "data modeling"] },
  { name: "Data analysis", group: "Data", aliases: ["data analytics", "analysis"] },
  { name: "Data visualization", group: "Data", aliases: ["dataviz", "charts", "data visualisation"] },
  { name: "Pandas", group: "Data", aliases: [] },
  { name: "Apache Spark", group: "Data", aliases: ["spark", "pyspark"] },
  { name: "ETL pipelines", group: "Data", aliases: ["etl", "data pipelines"] },
  { name: "Power BI", group: "Data", aliases: ["powerbi"] },
  { name: "Tableau", group: "Data", aliases: [] },
  { name: "Excel / Google Sheets", group: "Data", aliases: ["excel", "spreadsheets", "google sheets"] },

  // ── AI, ML & prompts ─────────────────────────────────────────────────────
  { name: "Prompt engineering", group: "AI & ML", aliases: ["prompting", "prompt design", "prompt writing"] },
  { name: "LLM application development", group: "AI & ML", aliases: ["llm apps", "llm", "large language models"] },
  { name: "Retrieval-augmented generation", group: "AI & ML", aliases: ["rag", "vector search"] },
  { name: "AI agents", group: "AI & ML", aliases: ["agentic ai", "autonomous agents", "ai agent"] },
  { name: "Fine-tuning", group: "AI & ML", aliases: ["finetuning", "model fine tuning", "lora"] },
  { name: "Machine learning", group: "AI & ML", aliases: ["ml"] },
  { name: "Deep learning", group: "AI & ML", aliases: ["neural networks"] },
  { name: "Computer vision", group: "AI & ML", aliases: ["cv", "image recognition", "opencv"] },
  { name: "Natural language processing", group: "AI & ML", aliases: ["nlp", "text processing"] },
  { name: "TensorFlow", group: "AI & ML", aliases: ["tf", "keras"] },
  { name: "PyTorch", group: "AI & ML", aliases: ["torch"] },
  { name: "LangChain", group: "AI & ML", aliases: ["lang chain"] },
  { name: "Model Context Protocol", group: "AI & ML", aliases: ["mcp", "mcp servers"] },
  { name: "AI automation", group: "AI & ML", aliases: ["ai workflows", "workflow automation ai"] },
  { name: "Stable Diffusion", group: "AI & ML", aliases: ["sd", "ai image generation", "midjourney"] },

  // ── Mobile ───────────────────────────────────────────────────────────────
  { name: "React Native", group: "Mobile", aliases: ["react-native", "rn"] },
  { name: "Flutter", group: "Mobile", aliases: [] },
  { name: "iOS development", group: "Mobile", aliases: ["ios", "swiftui", "iphone app"] },
  { name: "Android development", group: "Mobile", aliases: ["android", "jetpack compose"] },
  { name: "Expo", group: "Mobile", aliases: [] },
  { name: "App Store optimization", group: "Mobile", aliases: ["aso", "app store listing"] },

  // ── DevOps & cloud ───────────────────────────────────────────────────────
  { name: "Docker", group: "DevOps & cloud", aliases: ["containers", "containerization"] },
  { name: "Kubernetes", group: "DevOps & cloud", aliases: ["k8s", "kube"] },
  { name: "AWS", group: "DevOps & cloud", aliases: ["amazon web services", "ec2", "s3", "lambda"] },
  { name: "Microsoft Azure", group: "DevOps & cloud", aliases: ["azure"] },
  { name: "Google Cloud Platform", group: "DevOps & cloud", aliases: ["gcp", "google cloud"] },
  { name: "CI/CD", group: "DevOps & cloud", aliases: ["ci cd", "github actions", "jenkins", "pipelines"] },
  { name: "Terraform", group: "DevOps & cloud", aliases: ["iac", "infrastructure as code"] },
  { name: "Linux administration", group: "DevOps & cloud", aliases: ["linux", "ubuntu", "sysadmin"] },
  { name: "Nginx", group: "DevOps & cloud", aliases: ["reverse proxy"] },
  { name: "Monitoring & observability", group: "DevOps & cloud", aliases: ["grafana", "prometheus", "datadog", "observability"] },
  { name: "Git", group: "DevOps & cloud", aliases: ["github", "gitlab", "version control"] },

  // ── Security & QA ────────────────────────────────────────────────────────
  { name: "Application security", group: "Security & QA", aliases: ["appsec", "secure coding", "owasp"] },
  { name: "Penetration testing", group: "Security & QA", aliases: ["pentesting", "ethical hacking", "vapt"] },
  { name: "Manual testing", group: "Security & QA", aliases: ["qa testing", "quality assurance"] },
  { name: "Test automation", group: "Security & QA", aliases: ["automated testing", "selenium", "playwright", "cypress"] },
  { name: "Unit testing", group: "Security & QA", aliases: ["jest", "vitest", "pytest", "tdd"] },
  { name: "Performance testing", group: "Security & QA", aliases: ["load testing", "k6", "jmeter"] },

  // ── Design ───────────────────────────────────────────────────────────────
  { name: "UI design", group: "Design", aliases: ["user interface design", "ui"] },
  { name: "UX design", group: "Design", aliases: ["user experience design", "ux"] },
  { name: "UX research", group: "Design", aliases: ["user research", "usability testing"] },
  { name: "Figma", group: "Design", aliases: [] },
  { name: "Adobe XD", group: "Design", aliases: ["xd"] },
  { name: "Sketch", group: "Design", aliases: [] },
  { name: "Adobe Photoshop", group: "Design", aliases: ["photoshop", "ps"] },
  { name: "Adobe Illustrator", group: "Design", aliases: ["illustrator", "ai vector"] },
  { name: "Graphic design", group: "Design", aliases: ["graphics"] },
  { name: "Logo design", group: "Design", aliases: ["logo", "brand mark"] },
  { name: "Brand identity", group: "Design", aliases: ["branding", "brand guidelines"] },
  { name: "Design systems", group: "Design", aliases: ["design system", "component library"] },
  { name: "Wireframing", group: "Design", aliases: ["wireframes", "prototyping", "prototype"] },
  { name: "Illustration", group: "Design", aliases: ["digital illustration", "drawing"] },
  { name: "Motion graphics", group: "Design", aliases: ["after effects", "animation"] },
  { name: "3D modelling", group: "Design", aliases: ["3d modeling", "blender", "3d"] },
  { name: "Presentation design", group: "Design", aliases: ["pitch deck", "slides", "powerpoint design"] },
  { name: "Packaging design", group: "Design", aliases: ["packaging"] },
  { name: "Print design", group: "Design", aliases: ["brochure design", "flyer design"] },

  // ── Content & writing ────────────────────────────────────────────────────
  { name: "Copywriting", group: "Content & writing", aliases: ["copy", "sales copy", "ad copy"] },
  { name: "Content writing", group: "Content & writing", aliases: ["article writing", "blog writing"] },
  { name: "Technical writing", group: "Content & writing", aliases: ["documentation", "docs writing", "api docs"] },
  { name: "Editing & proofreading", group: "Content & writing", aliases: ["proofreading", "editing", "copy editing"] },
  { name: "Ghostwriting", group: "Content & writing", aliases: ["ghost writing"] },
  { name: "Scriptwriting", group: "Content & writing", aliases: ["script writing", "video scripts"] },
  { name: "Translation", group: "Content & writing", aliases: ["localization", "localisation", "translating"] },
  { name: "Resume writing", group: "Content & writing", aliases: ["cv writing", "resume"] },
  { name: "UX writing", group: "Content & writing", aliases: ["microcopy", "product copy"] },

  // ── Marketing & growth ───────────────────────────────────────────────────
  { name: "SEO", group: "Marketing", aliases: ["search engine optimization", "search engine optimisation", "on page seo"] },
  { name: "Google Ads", group: "Marketing", aliases: ["adwords", "ppc", "sem"] },
  { name: "Meta Ads", group: "Marketing", aliases: ["facebook ads", "instagram ads"] },
  { name: "Social media marketing", group: "Marketing", aliases: ["smm", "social media"] },
  { name: "Email marketing", group: "Marketing", aliases: ["newsletters", "mailchimp", "klaviyo"] },
  { name: "Content strategy", group: "Marketing", aliases: ["content marketing", "editorial strategy"] },
  { name: "Influencer marketing", group: "Marketing", aliases: ["creator marketing"] },
  { name: "Marketing analytics", group: "Marketing", aliases: ["google analytics", "ga4", "attribution"] },
  { name: "Conversion rate optimization", group: "Marketing", aliases: ["cro", "ab testing", "a/b testing"] },
  { name: "Affiliate marketing", group: "Marketing", aliases: ["affiliates"] },

  // ── Video & audio ────────────────────────────────────────────────────────
  { name: "Video editing", group: "Video & audio", aliases: ["premiere pro", "final cut", "davinci resolve"] },
  { name: "Short-form video editing", group: "Video & audio", aliases: ["reels editing", "shorts editing", "tiktok editing"] },
  { name: "Voice over", group: "Video & audio", aliases: ["voiceover", "narration", "vo"] },
  { name: "Audio editing", group: "Video & audio", aliases: ["podcast editing", "audacity", "mixing"] },
  { name: "Music production", group: "Video & audio", aliases: ["beat making", "composing"] },
  { name: "Explainer videos", group: "Video & audio", aliases: ["whiteboard animation", "explainer"] },

  // ── Business & operations ────────────────────────────────────────────────
  { name: "Project management", group: "Business", aliases: ["pm", "delivery management"] },
  { name: "Agile & Scrum", group: "Business", aliases: ["agile", "scrum", "kanban"] },
  { name: "Product management", group: "Business", aliases: ["product owner", "roadmapping"] },
  { name: "Business analysis", group: "Business", aliases: ["ba", "requirements gathering"] },
  { name: "Financial modelling", group: "Business", aliases: ["financial modeling", "valuation", "forecasting"] },
  { name: "Bookkeeping", group: "Business", aliases: ["accounting", "tally", "quickbooks"] },
  { name: "Virtual assistance", group: "Business", aliases: ["va", "admin support"] },
  { name: "Customer support", group: "Business", aliases: ["helpdesk", "customer service"] },
  { name: "Market research", group: "Business", aliases: ["competitor research", "industry research"] },
  { name: "Legal drafting", group: "Business", aliases: ["contract drafting", "nda drafting"] },

  // ── No-code & platforms ──────────────────────────────────────────────────
  { name: "Shopify", group: "No-code & platforms", aliases: ["shopify development", "shopify store"] },
  { name: "WordPress", group: "No-code & platforms", aliases: ["wp", "woocommerce"] },
  { name: "Webflow", group: "No-code & platforms", aliases: [] },
  { name: "Wix", group: "No-code & platforms", aliases: [] },
  { name: "Framer", group: "No-code & platforms", aliases: [] },
  { name: "Bubble", group: "No-code & platforms", aliases: ["bubble.io"] },
  { name: "Airtable", group: "No-code & platforms", aliases: [] },
  { name: "Zapier", group: "No-code & platforms", aliases: ["make.com", "integromat", "n8n"] },
  { name: "HubSpot", group: "No-code & platforms", aliases: ["hubspot crm"] },
  { name: "Salesforce", group: "No-code & platforms", aliases: ["sfdc", "apex"] },
];

// Ordering inside the picker. `sortOrder` ascends within a group; the groups
// themselves are rendered in the order they first appear here.
const SPECIALIZATIONS = [
  // Development
  { name: "Web Development", group: "Development", sortOrder: 10, description: "Websites and web apps, front to back" },
  { name: "Frontend Development", group: "Development", sortOrder: 20, description: "UI implementation in React, Vue, Angular and friends" },
  { name: "Backend Development", group: "Development", sortOrder: 30, description: "APIs, services, databases and integrations" },
  { name: "Full-stack Development", group: "Development", sortOrder: 40, description: "End-to-end product build-out" },
  { name: "Mobile App Development", group: "Development", sortOrder: 50, description: "iOS, Android and cross-platform apps" },
  { name: "E-commerce Development", group: "Development", sortOrder: 60, description: "Storefronts, checkout and payments" },
  { name: "No-code / Low-code Development", group: "Development", sortOrder: 70, description: "Webflow, Bubble, Shopify, Airtable builds" },
  { name: "Game Development", group: "Development", sortOrder: 80, description: "Unity, Unreal and web games" },
  { name: "Blockchain & Web3", group: "Development", sortOrder: 90, description: "Smart contracts, dApps and audits" },

  // AI
  { name: "Prompt Engineering", group: "AI", sortOrder: 10, description: "Production-grade prompts, evals and prompt systems" },
  { name: "AI Application Development", group: "AI", sortOrder: 20, description: "LLM-powered products, RAG and agents" },
  { name: "AI Automation", group: "AI", sortOrder: 30, description: "Automating workflows with AI and integrations" },
  { name: "Machine Learning & Data Science", group: "AI", sortOrder: 40, description: "Models, training and evaluation" },
  { name: "AI Content Creation", group: "AI", sortOrder: 50, description: "AI-assisted images, video, copy and voice" },

  // Design
  { name: "UI/UX Design", group: "Design", sortOrder: 10, description: "Product interfaces, flows and design systems" },
  { name: "Graphic Design", group: "Design", sortOrder: 20, description: "Visual assets for print and screen" },
  { name: "Brand & Identity Design", group: "Design", sortOrder: 30, description: "Logos, brand systems and guidelines" },
  { name: "Illustration & Art", group: "Design", sortOrder: 40, description: "Custom illustration and concept art" },
  { name: "Motion & 3D Design", group: "Design", sortOrder: 50, description: "Animation, motion graphics and 3D" },
  { name: "Presentation & Pitch Design", group: "Design", sortOrder: 60, description: "Decks that hold up in a room" },

  // Content
  { name: "Copywriting", group: "Content", sortOrder: 10, description: "Sales pages, ads and conversion copy" },
  { name: "Content Writing & Blogging", group: "Content", sortOrder: 20, description: "Articles, blogs and long-form content" },
  { name: "Technical Writing", group: "Content", sortOrder: 30, description: "Docs, API references and developer guides" },
  { name: "Translation & Localization", group: "Content", sortOrder: 40, description: "Multi-language adaptation" },
  { name: "Editing & Proofreading", group: "Content", sortOrder: 50, description: "Line edits, structure and polish" },

  // Marketing
  { name: "SEO", group: "Marketing", sortOrder: 10, description: "Technical, on-page and content SEO" },
  { name: "Paid Advertising", group: "Marketing", sortOrder: 20, description: "Google, Meta and LinkedIn campaigns" },
  { name: "Social Media Management", group: "Marketing", sortOrder: 30, description: "Calendars, content and community" },
  { name: "Email & Lifecycle Marketing", group: "Marketing", sortOrder: 40, description: "Flows, newsletters and retention" },
  { name: "Growth & Analytics", group: "Marketing", sortOrder: 50, description: "Experiments, funnels and measurement" },

  // Video & audio
  { name: "Video Editing", group: "Video & Audio", sortOrder: 10, description: "Long-form and short-form edits" },
  { name: "Voice Over & Narration", group: "Video & Audio", sortOrder: 20, description: "Recorded voice work" },
  { name: "Audio Production", group: "Video & Audio", sortOrder: 30, description: "Podcasts, mixing and mastering" },

  // Engineering ops
  { name: "DevOps & Cloud", group: "Engineering Ops", sortOrder: 10, description: "CI/CD, infrastructure and cost tuning" },
  { name: "QA & Test Automation", group: "Engineering Ops", sortOrder: 20, description: "Test suites and release confidence" },
  { name: "Cybersecurity", group: "Engineering Ops", sortOrder: 30, description: "Audits, hardening and pen testing" },
  { name: "Data Engineering", group: "Engineering Ops", sortOrder: 40, description: "Pipelines, warehouses and reporting" },

  // Business
  { name: "Project & Product Management", group: "Business", sortOrder: 10, description: "Scoping, planning and shipping" },
  { name: "Business & Financial Consulting", group: "Business", sortOrder: 20, description: "Models, strategy and diligence" },
  { name: "Virtual Assistance & Operations", group: "Business", sortOrder: 30, description: "Day-to-day operational support" },
  { name: "Market & Competitor Research", group: "Business", sortOrder: 40, description: "Research memos and landscape maps" },
];

module.exports = { SKILLS, SPECIALIZATIONS };
