// constants/serviceCategories.js
//
// The taxonomy for SERVICES — what a freelancer sells, as a buyer would look for
// it. Two levels: a broad heading someone scans, and the specific thing they
// actually want.
//
// Kept apart from the prompt categories (Coding, Content, Creative, HR, Travel…)
// because those describe what a PROMPT is about. Filing "I will build your
// e-commerce site" under "Coding" and "I will edit your reel" under "Content" is
// prompt vocabulary stretched over work it was never written for.
//
// Names are the buyer's words, not ours: "Mobile Apps (Android/iOS)" rather than
// "Mobile Development", because that is what someone types when they have an app
// in mind and no idea what the platform is called.
//
// Duplicates across parents are fine — the unique index is per (kind, parent,
// name), so "Web Design" under Design & Creative doesn't clash with "Web
// Development" under Programming & Tech, and a repeat of the same name under a
// different heading is allowed where it genuinely belongs to both.

const SERVICE_CATEGORIES = [
  {
    name: "Programming & Tech",
    children: [
      "Web Development",
      "Mobile Apps (Android/iOS)",
      "Frontend Development",
      "Backend Development",
      "Full-Stack Development",
      "E-commerce Development",
      "WordPress",
      "Shopify",
      "No-code Development",
      "API & Integrations",
      "Database Design",
      "Cloud & DevOps",
      "Cybersecurity",
      "QA & Testing",
      "Game Development",
      "Blockchain & Web3",
      "Desktop Software",
      "Scripting & Automation",
      "Bug Fixing & Support",
    ],
  },
  {
    name: "AI Services",
    children: [
      "Prompt Engineering",
      "AI Application Development",
      "AI Agents",
      "LLM Integration",
      "RAG & Vector Search",
      "Model Fine-tuning",
      "AI Chatbots",
      "AI Content Creation",
      "Machine Learning Models",
      "Computer Vision",
      "AI Consulting",
    ],
  },
  {
    name: "Design & Creative",
    children: [
      "UI/UX Design",
      "Web Design",
      "Mobile App Design",
      "Logo Design",
      "Brand Identity",
      "Graphic Design",
      "Illustration",
      "3D Design & Modelling",
      "Motion Graphics",
      "Presentation Design",
      "Packaging Design",
      "Print Design",
      "Design Systems",
      "Social Media Graphics",
    ],
  },
  {
    name: "Digital Marketing",
    children: [
      "SEO",
      "Social Media Marketing",
      "Paid Advertising",
      "Email Marketing",
      "Content Marketing",
      "Influencer Marketing",
      "Marketing Strategy",
      "Analytics & Tracking",
      "Conversion Optimization",
      "E-commerce Marketing",
    ],
  },
  {
    name: "Writing & Translation",
    children: [
      "Copywriting",
      "Blog & Article Writing",
      "Technical Writing",
      "Website Copy",
      "Product Descriptions",
      "Editing & Proofreading",
      "Translation & Localization",
      "Resume & Cover Letters",
      "Scriptwriting",
      "Ghostwriting",
    ],
  },
  {
    name: "Video & Animation",
    children: [
      "Video Editing",
      "Short-form Video",
      "Explainer Videos",
      "2D Animation",
      "3D Animation",
      "Video Ads",
      "Subtitles & Captions",
      "Product Videos",
    ],
  },
  {
    name: "Music & Audio",
    children: [
      "Voice Over",
      "Audio Editing",
      "Podcast Production",
      "Music Production",
      "Sound Design",
      "Mixing & Mastering",
    ],
  },
  {
    name: "Data",
    children: [
      "Data Analysis",
      "Data Visualization",
      "Dashboards & BI",
      "Data Engineering",
      "Web Scraping",
      "Data Entry & Cleaning",
    ],
  },
  {
    name: "Business",
    children: [
      "Business Plans",
      "Market Research",
      "Financial Modelling",
      "Project Management",
      "Virtual Assistance",
      "HR & Recruitment",
      "Legal Consulting",
      "Customer Support",
    ],
  },
];

module.exports = { SERVICE_CATEGORIES };
