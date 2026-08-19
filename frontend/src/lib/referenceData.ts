/**
 * Country, language and professional-title lists for the freelancer profile
 * pickers.
 *
 * These live here rather than inside a component because three places need them
 * (the onboarding wizard, the profile section editor, and anything added later),
 * and a second copy is a second thing to forget to update.
 *
 * The country list is complete rather than a "common countries" shortlist. That
 * was only ever a workaround for the old `<datalist>`, which dumped every option
 * into one unfilterable native popup — with SearchableSelect the length costs
 * nothing, and a shortlist silently excludes real users.
 *
 * Neither list is a whitelist: SearchableSelect accepts a typed value that isn't
 * present, and the server stores free text.
 */

export const COUNTRIES: string[] = [
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda",
  "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan",
  "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize",
  "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil",
  "Brunei", "Bulgaria", "Burkina Faso", "Burundi",
  "Cabo Verde", "Cambodia", "Cameroon", "Canada", "Central African Republic",
  "Chad", "Chile", "China", "Colombia", "Comoros", "Congo (Brazzaville)",
  "Congo (Kinshasa)", "Costa Rica", "Côte d'Ivoire", "Croatia", "Cuba", "Cyprus",
  "Czechia",
  "Denmark", "Djibouti", "Dominica", "Dominican Republic",
  "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia",
  "Eswatini", "Ethiopia",
  "Fiji", "Finland", "France",
  "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada",
  "Guatemala", "Guinea", "Guinea-Bissau", "Guyana",
  "Haiti", "Honduras", "Hong Kong", "Hungary",
  "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy",
  "Jamaica", "Japan", "Jordan",
  "Kazakhstan", "Kenya", "Kiribati", "Kosovo", "Kuwait", "Kyrgyzstan",
  "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein",
  "Lithuania", "Luxembourg",
  "Macau", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta",
  "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia",
  "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique",
  "Myanmar",
  "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua",
  "Niger", "Nigeria", "North Korea", "North Macedonia", "Norway",
  "Oman",
  "Pakistan", "Palau", "Palestine", "Panama", "Papua New Guinea", "Paraguay",
  "Peru", "Philippines", "Poland", "Portugal",
  "Qatar",
  "Romania", "Russia", "Rwanda",
  "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines",
  "Samoa", "San Marino", "São Tomé and Príncipe", "Saudi Arabia", "Senegal",
  "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia",
  "Solomon Islands", "Somalia", "South Africa", "South Korea", "South Sudan",
  "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria",
  "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga",
  "Trinidad and Tobago", "Tunisia", "Türkiye", "Turkmenistan", "Tuvalu",
  "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom",
  "United States", "Uruguay", "Uzbekistan",
  "Vanuatu", "Vatican City", "Venezuela", "Vietnam",
  "Yemen",
  "Zambia", "Zimbabwe",
];

/**
 * Indian languages are listed first, then the rest alphabetically. The audience
 * is India-first (payouts run through Razorpay), and SearchableSelect shows this
 * order before anything is typed — so the languages most users want are the ones
 * they see without searching.
 */
export const LANGUAGES: string[] = [
  "English", "Hindi", "Bengali", "Marathi", "Telugu", "Tamil", "Gujarati",
  "Urdu", "Kannada", "Odia", "Malayalam", "Punjabi", "Assamese", "Maithili",
  "Sanskrit", "Konkani", "Nepali", "Sindhi", "Kashmiri", "Bhojpuri",
  "Arabic", "Cantonese", "Czech", "Danish", "Dutch", "Filipino", "Finnish",
  "French", "German", "Greek", "Hebrew", "Hungarian", "Indonesian", "Italian",
  "Japanese", "Javanese", "Khmer", "Korean", "Malay", "Mandarin", "Norwegian",
  "Persian", "Polish", "Portuguese", "Romanian", "Russian", "Serbian",
  "Sinhala", "Slovak", "Spanish", "Swahili", "Swedish", "Thai", "Turkish",
  "Ukrainian", "Vietnamese", "Zulu",
];

/**
 * Professional titles offered under the "Professional title" field.
 *
 * Suggestions, not a whitelist — the field stays a plain text input and stores
 * whatever is typed. The list exists because an empty box with a placeholder
 * made everyone invent their own wording ("dev", "Developer (full stack)",
 * "FULLSTACK DEV"), which reads as noise on a profile card and matches nothing
 * when buyers search.
 *
 * Ordered by what this marketplace actually sells — AI, design, content, video
 * — before the general software and business roles, because the picker shows
 * this order before anything is typed.
 */
export const PROFESSIONAL_TITLES: string[] = [
  // AI / prompt work
  "Prompt Engineer", "AI Engineer", "AI Consultant", "AI Automation Specialist",
  "Machine Learning Engineer", "Deep Learning Engineer", "NLP Engineer",
  "Computer Vision Engineer", "MLOps Engineer", "AI Product Manager",
  "AI Researcher", "Generative AI Specialist", "LLM Application Developer",
  "Chatbot Developer", "AI Art Director", "AI Video Creator",

  // Design
  "Graphic Designer", "Logo Designer", "Brand Identity Designer",
  "Visual Designer", "UI Designer", "UX Designer", "UI/UX Designer",
  "Product Designer", "Web Designer", "Illustrator", "3D Artist",
  "3D Modeler", "Motion Designer", "Packaging Designer", "Print Designer",
  "Presentation Designer", "Interior Designer", "Fashion Designer",
  "Apparel & T-Shirt Designer", "Character Designer", "Concept Artist",
  "Game Artist", "NFT Artist", "Digital Artist", "Design Lead",

  // Content, writing, marketing
  "Content Writer", "Copywriter", "Technical Writer", "SEO Specialist",
  "SEO Content Strategist", "Blog Writer", "Ghostwriter", "Scriptwriter",
  "Editor", "Proofreader", "Translator", "Transcriptionist",
  "Social Media Manager", "Content Creator", "Digital Marketer",
  "Performance Marketer", "Email Marketing Specialist", "Growth Marketer",
  "Brand Strategist", "Marketing Consultant", "PR Specialist",
  "Community Manager", "Influencer Marketing Manager",

  // Video / audio / photo
  "Video Editor", "Videographer", "Motion Graphics Artist",
  "Animator", "2D Animator", "3D Animator", "VFX Artist", "Colorist",
  "Photographer", "Photo Retoucher", "Sound Designer", "Audio Engineer",
  "Music Producer", "Voice-over Artist", "Podcast Producer",

  // Engineering
  "Software Engineer", "Full-stack Developer", "Frontend Developer",
  "Backend Developer", "Web Developer", "Mobile App Developer",
  "iOS Developer", "Android Developer", "React Developer",
  "React Native Developer", "Node.js Developer", "Python Developer",
  "Java Developer", "PHP Developer", "WordPress Developer",
  "Shopify Developer", "Webflow Developer", "No-code Developer",
  "Game Developer", "Unity Developer", "Blockchain Developer",
  "Smart Contract Developer", "DevOps Engineer", "Cloud Architect",
  "Site Reliability Engineer", "Database Administrator",
  "Software Architect", "Embedded Systems Engineer", "QA Engineer",
  "Automation Test Engineer", "Security Engineer",
  "Cybersecurity Consultant", "Systems Administrator", "IT Support Specialist",
  "Technical Lead", "Engineering Manager", "CTO",

  // Data
  "Data Analyst", "Data Scientist", "Data Engineer",
  "Business Intelligence Analyst", "Analytics Consultant",
  "Research Analyst", "Statistician",

  // Product, business, operations
  "Product Manager", "Project Manager", "Program Manager", "Scrum Master",
  "Business Analyst", "Management Consultant", "Startup Advisor",
  "Operations Manager", "Virtual Assistant", "Executive Assistant",
  "Customer Support Specialist", "Sales Specialist",
  "Business Development Manager", "Recruiter", "HR Consultant",
  "Accountant", "Bookkeeper", "Financial Analyst", "Tax Consultant",
  "Legal Consultant", "Contract Specialist",

  // Teaching and other
  "Educator", "Online Tutor", "Instructional Designer",
  "Course Creator", "Career Coach", "Business Coach",
  "Architect", "Civil Engineer", "Mechanical Engineer",
  "Electrical Engineer", "CAD Designer", "Healthcare Consultant",
  "Nutritionist", "Fitness Coach", "Travel Consultant",
  "Event Planner", "Real Estate Consultant", "Freelancer",
];
