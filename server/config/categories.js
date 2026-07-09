"use strict";

const CATEGORIES = [
  {
    id: "business_startup",
    label: "Business & Startup",
    icon: "💼",
    subCategories: [
      { id: "cafe_food_service",    label: "Café Business Builder" },
      { id: "startup_fundraising",  label: "Startup Fundraising" },
      { id: "marketing_growth",     label: "Marketing & Growth" },
      { id: "competitive_pricing",  label: "Competitive Pricing" },
      { id: "saas_product",         label: "SaaS Product" },
      { id: "ecommerce_business",   label: "E-commerce Business" },
      { id: "subscription_box",     label: "Subscription Box" },
      { id: "event_planning",       label: "Event Planning" },
      { id: "handmade_business",    label: "Handmade Business" },
    ],
  },
  {
    id: "content_writing",
    label: "Content Writing",
    icon: "✏️",
    subCategories: [
      { id: "content_writing",    label: "Blog & Article Writing" },
      { id: "ad_copywriting",     label: "Ad Copywriting" },
      { id: "sales_copywriting",  label: "Sales Copywriting" },
    ],
  },
  {
    id: "development_tech",
    label: "Development & Tech",
    icon: "💻",
    subCategories: [
      { id: "product_development",      label: "Product Development" },
      { id: "backend_architecture",     label: "Backend Architecture" },
      { id: "mobile_app_development",   label: "Mobile App Development" },
      { id: "cloud_devops",             label: "Cloud & DevOps" },
      { id: "no_code_tools",            label: "No-Code Tools" },
      { id: "cybersecurity",            label: "Cybersecurity" },
      { id: "blockchain_web3",          label: "Blockchain & Web3" },
    ],
  },
  {
    id: "education_learning",
    label: "Education & Learning",
    icon: "🎓",
    subCategories: [
      { id: "edtech_product",     label: "EdTech Product" },
      { id: "technical_tutorial", label: "Technical Tutorial" },
      { id: "education_learning", label: "General Education" },
      { id: "course_curriculum",  label: "Course Curriculum" },
    ],
  },
  {
    id: "finance_investment",
    label: "Finance & Investment",
    icon: "⚖️",
    subCategories: [
      { id: "finance_investment", label: "Finance & Investment" },
    ],
  },
  {
    id: "health_wellness",
    label: "Health & Wellness",
    icon: "❤️",
    subCategories: [
      { id: "health_wellness",           label: "Health & Wellness" },
      { id: "fitness_sports",            label: "Fitness & Sports" },
      { id: "mental_health",             label: "Mental Health" },
      { id: "postpartum_fitness_coaching", label: "Postpartum Fitness" },
      { id: "gamified_fitness_app",      label: "Fitness App" },
    ],
  },
  {
    id: "hr_people",
    label: "HR & Careers",
    icon: "👥",
    subCategories: [
      { id: "hr_people",      label: "HR & People Ops" },
      { id: "resume_career",  label: "Resume & Career" },
      { id: "linkedin_automation", label: "LinkedIn & Automation" },
    ],
  },
  {
    id: "ai_tech",
    label: "AI & Automation",
    icon: "🤖",
    subCategories: [
      { id: "ai_automation",             label: "AI Automation" },
      { id: "data_science_ai",           label: "Data Science & AI" },
      { id: "ai_image_gen",              label: "AI Image Generation" },
      { id: "ai_headshot_business",      label: "AI Headshot Business" },
      { id: "ai_photography_monetization", label: "AI Photography" },
    ],
  },
  {
    id: "creative_media",
    label: "Creative & Media",
    icon: "🎨",
    subCategories: [
      { id: "video_creation",       label: "Video Creation" },
      { id: "podcast_creator",      label: "Podcast Creator" },
      { id: "youtube_shorts",       label: "YouTube Shorts" },
      { id: "social_media_branding", label: "Social Media Branding" },
      { id: "uiux_design",          label: "UI/UX Design" },
      { id: "interior_architecture", label: "Interior & Architecture" },
    ],
  },
  {
    id: "specialized",
    label: "Specialized",
    icon: "🚀",
    subCategories: [
      { id: "real_estate",           label: "Real Estate" },
      { id: "legal_compliance",      label: "Legal & Compliance" },
      { id: "freelancing_consulting", label: "Freelancing & Consulting" },
      { id: "personal_development",  label: "Personal Development" },
      { id: "travel_planning",       label: "Travel Planning" },
      { id: "notion_productivity",   label: "Notion & Productivity" },
      { id: "childrens_storybook_business", label: "Children's Storybook" },
      { id: "rental_property_pune",  label: "Rental Property" },
    ],
  },
];

const CATEGORY_MAP = Object.fromEntries(CATEGORIES.map((c) => [c.id, c]));
const CATEGORY_IDS = CATEGORIES.map((c) => c.id);
const SUBCATEGORY_IDS = CATEGORIES.flatMap((c) => c.subCategories.map((s) => s.id));

module.exports = { CATEGORIES, CATEGORY_MAP, CATEGORY_IDS, SUBCATEGORY_IDS };
