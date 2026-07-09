"use strict";

// âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
// SUBCATEGORIES
// âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
const SUBCATEGORIES = {
  cafe_food_service:       [ { id: "business_planning",    label: "Business Planning" }, { id: "menu_design",          label: "Menu Design" }, { id: "interior_branding",    label: "Interior & Branding" }, { id: "marketing_strategy",   label: "Marketing Strategy" } ],
  startup_fundraising:     [ { id: "pitch_deck",           label: "Pitch Deck" }, { id: "financial_model",      label: "Financial Model" }, { id: "gtm_strategy",         label: "Go-to-Market" }, { id: "investor_outreach",    label: "Investor Outreach" } ],
  marketing_growth:        [ { id: "seo_content",          label: "SEO & Content" }, { id: "paid_ads",             label: "Paid Ads" }, { id: "social_media",         label: "Social Media" }, { id: "email_campaigns",      label: "Email Campaigns" } ],
  competitive_pricing:     [ { id: "competitor_mapping",   label: "Competitor Mapping" }, { id: "pricing_model",        label: "Pricing Model" }, { id: "market_positioning",   label: "Market Positioning" }, { id: "gap_analysis",         label: "Gap Analysis" } ],
  product_development:     [ { id: "product_roadmap",      label: "Product Roadmap" }, { id: "ux_design",            label: "UX Design" }, { id: "technical_arch",       label: "Technical Architecture" }, { id: "launch_strategy",      label: "Launch Strategy" } ],
  edtech_product:          [ { id: "tech_stack",           label: "Tech Stack & Architecture" }, { id: "feature_planning",     label: "Feature Planning" }, { id: "monetization",         label: "Monetization Strategy" }, { id: "launch_growth",        label: "Launch & Growth" } ],
  technical_tutorial:      [ { id: "beginner_guide",       label: "Beginner Guide" }, { id: "project_tutorial",     label: "Project-Based Tutorial" }, { id: "video_script",         label: "Video/Course Script" }, { id: "code_walkthrough",     label: "Code Walkthrough" } ],
  education_learning:      [ { id: "course_creation",      label: "Course Creation" }, { id: "lesson_planning",      label: "Lesson Planning" }, { id: "assessment_design",    label: "Assessment Design" }, { id: "learning_outcomes",    label: "Learning Outcomes" } ],
  finance_investment:      [ { id: "financial_planning",   label: "Financial Planning" }, { id: "investment_thesis",    label: "Investment Thesis" }, { id: "financial_model_sub",  label: "Financial Modelling" }, { id: "tax_compliance",       label: "Tax & Compliance" } ],
  health_wellness:         [ { id: "fitness_plan",         label: "Fitness Plan" }, { id: "nutrition_guide",      label: "Nutrition Guide" }, { id: "mental_wellness",      label: "Mental Wellness" }, { id: "lifestyle_habits",     label: "Lifestyle Habits" } ],
  hr_people:               [ { id: "hiring_process",       label: "Hiring Process" }, { id: "onboarding",           label: "Onboarding" }, { id: "performance_mgmt",     label: "Performance Mgmt" }, { id: "team_culture",         label: "Team Culture" } ],
  legal_compliance:        [ { id: "contracts",            label: "Contracts" }, { id: "privacy_policy",       label: "Privacy & GDPR" }, { id: "ip_protection",        label: "IP Protection" }, { id: "compliance_audit",     label: "Compliance Audit" } ],
  ai_automation:           [ { id: "prompt_engineering",   label: "Prompt Engineering" }, { id: "workflow_automation",  label: "Workflow Automation" }, { id: "chatbot_design",       label: "Chatbot Design" }, { id: "data_pipeline",        label: "Data Pipeline" } ],
  personal_development:    [ { id: "goal_setting",         label: "Goal Setting" }, { id: "productivity",         label: "Productivity System" }, { id: "career_growth",        label: "Career Growth" }, { id: "public_speaking",      label: "Public Speaking" } ],
  real_estate:             [ { id: "property_investment",  label: "Property Investment" }, { id: "rental_strategy",      label: "Rental Strategy" }, { id: "property_listing",     label: "Property Listing" }, { id: "market_analysis",      label: "Market Analysis" } ],
  social_media_branding:   [ { id: "brand_identity",       label: "Brand Identity" }, { id: "content_calendar",     label: "Content Calendar" }, { id: "growth_strategy",      label: "Growth Strategy" }, { id: "monetization_sm",      label: "Monetization" } ],
  data_science_ai:         [ { id: "ml_model",             label: "ML Model Building" }, { id: "data_analysis",        label: "Data Analysis" }, { id: "data_pipeline_ds",     label: "Data Pipeline" }, { id: "nlp_project",          label: "NLP Project" } ],
  resume_career:           [ { id: "resume_writing",       label: "Resume Writing" }, { id: "linkedin_profile",     label: "LinkedIn Profile" }, { id: "interview_prep",       label: "Interview Prep" }, { id: "salary_negotiation",   label: "Salary Negotiation" } ],
  saas_product:            [ { id: "saas_launch",          label: "SaaS Launch" }, { id: "pricing_saas",         label: "SaaS Pricing" }, { id: "growth_saas",          label: "Growth Strategy" }, { id: "churn_retention",      label: "Churn & Retention" } ],
  freelancing_consulting:  [ { id: "client_acquisition",   label: "Client Acquisition" }, { id: "pricing_freelance",    label: "Pricing & Rates" }, { id: "portfolio_building",   label: "Portfolio Building" }, { id: "agency_scaling",       label: "Agency Scaling" } ],
  uiux_design:             [ { id: "user_research",        label: "User Research" }, { id: "wireframing",          label: "Wireframing & Prototyping" }, { id: "design_system",        label: "Design System" }, { id: "usability_testing",    label: "Usability Testing" } ],
  video_creation:          [ { id: "channel_strategy",     label: "Channel Strategy" }, { id: "video_scripting",      label: "Video Scripting" }, { id: "seo_youtube",          label: "YouTube SEO" }, { id: "monetization_yt",      label: "Monetization" } ],
  no_code_tools:           [ { id: "app_building",         label: "No-Code App Building" }, { id: "workflow_nocode",      label: "Workflow Automation" }, { id: "website_nocode",       label: "No-Code Website" }, { id: "database_nocode",      label: "Database & CMS" } ],
  cloud_devops:            [ { id: "cloud_arch",           label: "Cloud Architecture" }, { id: "cicd_pipeline",        label: "CI/CD Pipeline" }, { id: "container_k8s",        label: "Docker & Kubernetes" }, { id: "cloud_security",       label: "Cloud Security" } ],
  mobile_app_development:  [ { id: "app_architecture",     label: "App Architecture" }, { id: "ui_mobile",            label: "Mobile UI/UX" }, { id: "app_launch",           label: "App Store Launch" }, { id: "app_monetization",     label: "App Monetization" } ],
  cybersecurity:           [ { id: "pentest",              label: "Penetration Testing" }, { id: "security_audit",       label: "Security Audit" }, { id: "compliance_sec",       label: "Compliance (SOC2/ISO)" }, { id: "incident_response",    label: "Incident Response" } ],
  blockchain_web3:         [ { id: "smart_contracts",      label: "Smart Contracts" }, { id: "defi_protocol",        label: "DeFi Protocol" }, { id: "nft_project",          label: "NFT Project" }, { id: "tokenomics",           label: "Tokenomics" } ],
  podcast_creator:         [ { id: "podcast_launch",       label: "Podcast Launch" }, { id: "podcast_growth",       label: "Audience Growth" }, { id: "podcast_monetize",     label: "Monetization" }, { id: "podcast_production",   label: "Production Quality" } ],
  fitness_sports:          [ { id: "training_plan",        label: "Training Plan" }, { id: "sports_nutrition",     label: "Sports Nutrition" }, { id: "performance_analysis", label: "Performance Analysis" }, { id: "injury_prevention",    label: "Injury Prevention" } ],
  mental_health:           [ { id: "anxiety_management",   label: "Anxiety Management" }, { id: "burnout_recovery",     label: "Burnout Recovery" }, { id: "resilience_building",  label: "Resilience Building" }, { id: "workplace_wellness",   label: "Workplace Wellness" } ],
  interior_architecture:   [ { id: "space_planning",       label: "Space Planning" }, { id: "material_selection",   label: "Material & Palette" }, { id: "renovation_plan",      label: "Renovation Planning" }, { id: "commercial_design",    label: "Commercial Design" } ],
  ai_image_gen:            [ { id: "prompt_library",       label: "Prompt Library" }, { id: "style_system",         label: "Style System" }, { id: "product_photography",   label: "Product Photography" }, { id: "catalogue_workflow",   label: "Catalogue Workflow" } ],
  travel_planning:         [ { id: "itinerary_design",     label: "Itinerary Design" }, { id: "budget_planning",      label: "Budget Planning" }, { id: "accommodation",        label: "Accommodation" }, { id: "activities_guide",     label: "Activities & Experiences" } ],
  ad_copywriting:          [ { id: "facebook_ads",         label: "Facebook & Instagram Ads" }, { id: "google_ads_copy",      label: "Google Ads Copy" }, { id: "video_ad_script",      label: "Video Ad Script" }, { id: "ad_creative_brief",    label: "Creative Brief" } ],
  handmade_business:       [ { id: "product_pricing",      label: "Product Pricing" }, { id: "online_selling",       label: "Online Selling" }, { id: "brand_building",       label: "Brand Building" }, { id: "scaling_production",   label: "Scaling Production" } ],
  notion_productivity:     [ { id: "personal_os",          label: "Personal OS Setup" }, { id: "second_brain",         label: "Second Brain" }, { id: "student_system",       label: "Student System" }, { id: "team_workspace",       label: "Team Workspace" } ],
  youtube_shorts:          [ { id: "content_strategy",     label: "Content Strategy" }, { id: "script_writing",       label: "Script & Hook Writing" }, { id: "channel_growth",       label: "Channel Growth" }, { id: "monetization_shorts",  label: "Monetization" } ],
  course_curriculum:       [ { id: "curriculum_outline",   label: "Curriculum Outline" }, { id: "module_design",        label: "Module Design" }, { id: "student_outcomes",     label: "Student Outcomes" }, { id: "launch_plan",          label: "Launch Plan" } ],
  linkedin_automation:     [ { id: "content_system",       label: "Content System" }, { id: "post_templates",       label: "Post Templates" }, { id: "lead_gen",             label: "Lead Generation" }, { id: "tool_setup",           label: "Tool Setup & Workflow" } ],
  backend_architecture:    [ { id: "system_design",        label: "System Design" }, { id: "realtime_features",    label: "Real-Time Features" }, { id: "database_design",      label: "Database Design" }, { id: "scaling_strategy",     label: "Scaling Strategy" } ],
  subscription_box:        [ { id: "product_curation",     label: "Product Curation" }, { id: "pricing_strategy",     label: "Pricing & Margins" }, { id: "fulfilment_ops",       label: "Fulfilment & Ops" }, { id: "subscriber_growth",    label: "Subscriber Growth" } ],
  event_planning:          [ { id: "theme_decor",          label: "Theme & Decor" }, { id: "catering_plan",        label: "Catering Plan" }, { id: "entertainment",        label: "Entertainment" }, { id: "budget_breakdown",     label: "Budget Breakdown" } ],
  sales_copywriting:       [ { id: "sales_page",           label: "Sales Page" }, { id: "email_sequence",       label: "Email Sequence" }, { id: "vsl_script",           label: "VSL Script" }, { id: "ad_to_funnel",         label: "Ad to Funnel Copy" } ],
  ai_headshot_business:    [ { id: "service_setup",        label: "Service Setup" }, { id: "client_acquisition_ai", label: "Client Acquisition" }, { id: "workflow_ops",         label: "Workflow & Operations" }, { id: "pricing_packages",     label: "Pricing & Packages" } ],
  general_expert:          [ { id: "strategy_planning",    label: "Strategy & Planning" }, { id: "execution_roadmap",    label: "Execution Roadmap" }, { id: "monetization_gen",     label: "Monetization" }, { id: "growth_marketing_gen", label: "Growth & Marketing" } ],
  ecommerce_store:         [ { id: "product_sourcing",     label: "Product & Sourcing" }, { id: "store_setup",          label: "Store Setup" }, { id: "paid_acquisition",    label: "Paid Acquisition" }, { id: "retention_ops",       label: "Retention & Ops" } ],
  ghostwriting_content:    [ { id: "book_writing",         label: "Book Writing" }, { id: "linkedin_content",     label: "LinkedIn Content" }, { id: "thought_leadership",  label: "Thought Leadership" }, { id: "pricing_packages_gw", label: "Pricing & Packages" } ],
  nutrition_coaching:      [ { id: "programme_design",     label: "Programme Design" }, { id: "client_acquisition_nc",label: "Client Acquisition" }, { id: "niche_specialisation",label: "Niche Specialisation" }, { id: "business_model_nc",   label: "Business Model" } ],
  creator_economy:         [ { id: "audience_building",    label: "Audience Building" }, { id: "monetisation_cr",     label: "Monetisation Strategy" }, { id: "digital_products",    label: "Digital Products" }, { id: "brand_partnerships",  label: "Brand Partnerships" } ],
  immigration_visa:        [ { id: "eligibility_check",    label: "Eligibility Check" }, { id: "document_prep",       label: "Document Preparation" }, { id: "application_process", label: "Application Process" }, { id: "settlement_guide",    label: "Settlement Guide" } ],
  wedding_photography:     [ { id: "portfolio_building_wp",label: "Portfolio Building" }, { id: "pricing_strategy_wp", label: "Pricing Strategy" }, { id: "client_acquisition_wp",label:"Client Acquisition" }, { id: "workflow_editing",    label: "Workflow & Editing" } ],
  pet_care_business:       [ { id: "service_setup_pet",    label: "Service Setup" }, { id: "client_acquisition_pet",label:"Client Acquisition" }, { id: "operations_pet",      label: "Operations & Scheduling" }, { id: "scaling_pet",         label: "Scaling & Staffing" } ],
  supply_chain_logistics:  [ { id: "demand_planning",      label: "Demand Planning" }, { id: "warehouse_ops",        label: "Warehouse Operations" }, { id: "supplier_mgmt",       label: "Supplier Management" }, { id: "tech_integration",    label: "Tech Integration" } ],
};

// âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
// DEEP MODE QUESTIONS
// âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ

// âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
// DEEP MODE QUESTIONS
// âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
const DEEP_QUESTIONS = {
  "cafe_food_service:business_planning": [
    { id: "location",    question: "Where will the cafe be located?", type: "text", placeholder: "e.g. Koregaon Park, Pune" },
    { id: "budget",      question: "What is your startup budget range?", type: "select", options: ["Under Rs 10L", "Rs 10L-Rs 30L", "Rs 30L-Rs 75L", "Rs 75L+"] },
    { id: "audience",    question: "Who is your primary target audience?", type: "select", options: ["Students", "Remote workers", "Young professionals", "Families", "Mixed"] },
    { id: "usp",         question: "What makes this cafe different? (optional)", type: "text", placeholder: "e.g. Single-origin pour-overs, pet-friendly, co-working space" },
  ],
  "technical_tutorial:beginner_guide": [
    { id: "technology",  question: "Which technology/language is the tutorial about?", type: "text", placeholder: "e.g. React, Python, HTML/CSS, SQL, Flutter" },
    { id: "skill_level", question: "Exact skill level of the target reader?", type: "select", options: ["Complete beginner (no coding experience)", "Some basics (HTML/CSS only)", "Junior developer (knows one language)", "Switching from another stack"] },
    { id: "format",      question: "What format do you want the tutorial in?", type: "select", options: ["Written guide with code examples", "Video script", "Interactive project-based", "Cheat sheet + reference"] },
    { id: "scope",       question: "What should readers be able to DO after completing it?", type: "text", placeholder: "e.g. Build and deploy a todo app using React + Supabase" },
  ],
  "edtech_product:tech_stack": [
    { id: "build_type",    question: "Custom code or no-code?", type: "select", options: ["Custom (Next.js/React)", "No-code (Webflow + Kajabi)", "Hybrid", "Not sure yet"] },
    { id: "scale",         question: "Expected student volume at launch?", type: "select", options: ["Under 100", "100-1,000", "1,000-10,000", "10,000+"] },
    { id: "integrations",  question: "Any must-have integrations?", type: "text", placeholder: "e.g. Stripe, Zoom, Discord, Notion" },
  ],
  "saas_product:saas_launch": [
    { id: "target_customer", question: "Who is your ideal customer?", type: "text", placeholder: "e.g. Freelance designers managing 5+ clients" },
    { id: "pricing_model",   question: "What pricing model?", type: "select", options: ["Freemium", "Free trial -> paid", "Paid only", "Usage-based", "Per seat"] },
    { id: "stage",           question: "What stage are you at?", type: "select", options: ["Idea only", "MVP built", "Beta users", "Paying customers", "Scaling"] },
  ],
  "resume_career:resume_writing": [
    { id: "target_role",     question: "What role/level are you targeting?", type: "text", placeholder: "e.g. Senior Product Manager at a FAANG company" },
    { id: "years_exp",       question: "Years of relevant experience?", type: "select", options: ["0-2 years (junior/entry)", "3-5 years (mid-level)", "6-10 years (senior)", "10+ years (principal/director+)"] },
    { id: "biggest_gap",     question: "What's your biggest resume concern?", type: "select", options: ["Too generic / not tailored", "Career gap to explain", "Switching industries", "Too much / too little experience", "ATS optimization"] },
  ],
  "startup_fundraising:pitch_deck": [
    { id: "company",    question: "What is your company/product name?", type: "text", placeholder: "e.g. FlowDesk" },
    { id: "stage",      question: "Fundraising stage?", type: "select", options: ["Pre-seed", "Seed", "Series A", "Series B+"] },
    { id: "problem",    question: "In one sentence, what problem do you solve?", type: "text", placeholder: "e.g. Mid-market teams waste 12hrs/week on manual invoice reconciliation" },
    { id: "market",     question: "Target market / vertical?", type: "text", placeholder: "e.g. B2B SaaS for finance teams" },
  ],
  "marketing_growth:paid_ads": [
    { id: "platform",   question: "Which ad platform?", type: "select", options: ["Google Ads", "Meta (Facebook/Instagram)", "LinkedIn Ads", "TikTok Ads", "All platforms"] },
    { id: "budget",     question: "Monthly ad spend budget?", type: "select", options: ["Under $1K", "$1K-$5K", "$5K-$20K", "$20K+"] },
    { id: "goal",       question: "Campaign objective?", type: "select", options: ["Brand awareness", "Lead generation", "E-commerce sales", "App installs", "Retargeting"] },
  ],
  "ai_image_gen:product_photography": [
    { id: "platform",     question: "Where will these images appear?", type: "select", options: ["Shopify product page", "Instagram feed (1:1)", "TikTok / Instagram Stories (9:16)", "Website hero banner (16:9)", "Multiple platforms"] },
    { id: "experience",   question: "What is your current experience with the tool?", type: "select", options: ["Never used it", "Used it but results are inconsistent", "Comfortable with basic prompts", "Advanced - know parameters like --sref, --style raw"] },
    { id: "problem",      question: "What's the single biggest problem with images you're generating right now?", type: "text", placeholder: "e.g. Looks too artificial / background doesn't isolate / style isn't vintage enough" },
  ],
  "travel_planning:itinerary_design": [
    { id: "destination",  question: "Where are you travelling?", type: "text", placeholder: "e.g. Himachal Pradesh, Manali & Kasol" },
    { id: "duration",     question: "How many days is the trip?", type: "select", options: ["3-4 days", "5-7 days", "8-10 days", "10+ days"] },
    { id: "travellers",   question: "How many people are travelling?", type: "select", options: ["Solo", "Couple (2)", "Small group (3-5)", "Large group (6+)"] },
    { id: "budget",       question: "What is your total budget?", type: "text", placeholder: "e.g. Rs 80,000 total for 4 people" },
  ],
  "event_planning:theme_decor": [
    { id: "event_type",   question: "What type of event is this?", type: "select", options: ["Kids birthday party", "Adult birthday party", "Wedding/anniversary", "Corporate event", "Baby shower / other"] },
    { id: "guest_count",  question: "How many guests?", type: "select", options: ["Under 20", "20-50", "50-100", "100+"] },
    { id: "budget",       question: "What is your total budget?", type: "text", placeholder: "e.g. Rs 25,000" },
    { id: "theme",        question: "Any theme in mind? (optional)", type: "text", placeholder: "e.g. Unicorn, Superheroes, Garden party" },
  ],
  "generic": [
    { id: "context",    question: "Can you describe the specific context or situation?", type: "text", placeholder: "Add any relevant details..." },
    { id: "audience",   question: "Who is the primary audience for this?", type: "text", placeholder: "e.g. Senior decision-makers at mid-market tech companies" },
    { id: "goal",       question: "What does success look like?", type: "text", placeholder: "e.g. A working React app deployed on Vercel" },
  ],
};

// âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
// UNIVERSAL FALLBACK DOMAIN
// âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ

module.exports = {
  SUBCATEGORIES,
  DEEP_QUESTIONS,
};