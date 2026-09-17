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

/**
 * Degrees offered under Education → Degree.
 *
 * Suggestions, not a whitelist — `SearchableSelect` keeps `allowCustom`, so a
 * qualification that isn't here is still typed and saved as given. The list
 * exists for the same reason PROFESSIONAL_TITLES does: an empty box produced
 * "btech", "B-Tech", "Bachelor of Technology" and "B.Tech." on four profiles
 * that all mean one thing, and none of them match each other when a buyer
 * filters.
 *
 * Indian qualifications first and grouped by level, because the picker shows
 * this order before anything is typed — same India-first reasoning as LANGUAGES.
 * Abbreviations are the primary form ("B.Tech", not "Bachelor of Technology")
 * because that is what people type and what fits the field.
 */
export const DEGREES: string[] = [
  // Undergraduate — engineering and computing
  "B.Tech", "B.E.", "B.Sc", "BCA", "B.Sc (Computer Science)", "B.Sc (IT)",

  // Undergraduate — commerce, arts, management
  "B.Com", "B.Com (Hons)", "B.A.", "B.A. (Hons)", "BBA", "BMS", "BBM", "BMM",
  "B.El.Ed", "B.Ed", "B.P.Ed", "B.Voc", "BHM",

  // Undergraduate — design, media, fine arts
  "B.Des", "BFA", "B.Arch", "B.Plan", "BJMC",

  // Undergraduate — law, medicine, allied health
  "LL.B", "B.A. LL.B", "BBA LL.B", "MBBS", "BDS", "BAMS", "BHMS", "BUMS",
  "B.Pharm", "BPT", "B.Sc (Nursing)", "BVSc", "BOT", "B.Sc (Agriculture)",

  // Postgraduate — engineering, computing, science
  "M.Tech", "M.E.", "M.Sc", "MCA", "M.S.", "M.Sc (Computer Science)",

  // Postgraduate — commerce, arts, management
  "MBA", "PGDM", "M.Com", "M.A.", "MMS", "M.Ed", "MSW", "MPA", "M.Voc",

  // Postgraduate — design, media, fine arts
  "M.Des", "MFA", "M.Arch", "M.Plan", "MJMC",

  // Postgraduate — law, medicine, allied health
  "LL.M", "MD", "MS (Surgery)", "MDS", "M.Pharm", "MPT", "MPH", "M.Sc (Nursing)",

  // Doctoral and beyond
  "Ph.D.", "D.Phil", "D.Sc", "D.Litt", "DM", "M.Ch", "Post-Doctoral Fellowship",

  // Integrated and dual programmes — common at the IITs, IISc and the NLUs
  "Integrated M.Tech", "Integrated M.Sc", "Integrated MBA", "Dual Degree (B.Tech + M.Tech)",
  "Integrated B.Tech + MBA", "BS-MS (Dual Degree)",

  // Professional qualifications people list here as their education
  "CA (Chartered Accountant)", "CS (Company Secretary)", "CMA (Cost Accountant)",
  "CFA", "ACCA", "FRM",

  // Shorter programmes and school-level, for profiles that have no degree yet
  "Diploma", "Advanced Diploma", "Post Graduate Diploma", "Certificate Course",
  "Polytechnic Diploma", "ITI", "Associate Degree",
  "Higher Secondary (Class 12)", "Secondary (Class 10)",

  // International equivalents, for anyone who studied outside India
  "BS", "BA", "BEng", "BBA (International)", "MS", "MA", "MEng", "MPhil", "PhD",
  "Bachelor's Degree", "Master's Degree", "Self-taught",
];

/**
 * Institutions offered under Education → Institution.
 *
 * SAME RULE AS ABOVE: suggestions, never a whitelist. No list of colleges can
 * be complete — India alone has tens of thousands — so the field accepts
 * anything typed, and this exists to spell the well-known ones consistently
 * ("IIT Bombay" on every profile rather than "IITB", "iit bombay", "Indian
 * Institute of Technology, Bombay").
 *
 * Deliberately NOT fetched from an API, unlike the city list. A college name is
 * typed once on a profile that is then read for years — it is not worth a
 * network dependency, a CSP entry and a loading state, and the free university
 * APIs have patchy Indian coverage, which is most of this audience.
 *
 * Ordered so the most-searched groups come first: the national institutes, then
 * the large universities, then the well-known colleges by field, then a short
 * international tail. `SearchableSelect` filters prefix-first, so typing "IIT",
 * "NIT" or "Delhi" narrows to the right cluster immediately.
 */
export const INSTITUTIONS: string[] = [
  // ── IITs ──
  "IIT Bombay", "IIT Delhi", "IIT Madras", "IIT Kanpur", "IIT Kharagpur",
  "IIT Roorkee", "IIT Guwahati", "IIT Hyderabad", "IIT (BHU) Varanasi",
  "IIT Indore", "IIT Gandhinagar", "IIT Ropar", "IIT Patna", "IIT Mandi",
  "IIT Jodhpur", "IIT Bhubaneswar", "IIT Tirupati", "IIT Palakkad",
  "IIT Bhilai", "IIT Goa", "IIT Jammu", "IIT Dharwad", "IIT (ISM) Dhanbad",

  // ── IISc, IISERs and the research institutes ──
  "Indian Institute of Science (IISc), Bangalore",
  "IISER Pune", "IISER Kolkata", "IISER Mohali", "IISER Bhopal",
  "IISER Thiruvananthapuram", "IISER Tirupati", "IISER Berhampur",
  "Indian Statistical Institute (ISI)", "Tata Institute of Fundamental Research (TIFR)",
  "Chennai Mathematical Institute (CMI)", "Indian Institute of Space Science and Technology (IIST)",

  // ── NITs ──
  "NIT Tiruchirappalli", "NIT Karnataka, Surathkal", "NIT Warangal",
  "NIT Calicut", "NIT Rourkela", "NIT Kurukshetra", "NIT Durgapur",
  "MNNIT Allahabad", "MANIT Bhopal", "VNIT Nagpur", "MNIT Jaipur",
  "SVNIT Surat", "NIT Jamshedpur", "NIT Silchar", "NIT Hamirpur",
  "NIT Jalandhar", "NIT Srinagar", "NIT Patna", "NIT Raipur", "NIT Agartala",
  "NIT Delhi", "NIT Goa", "NIT Meghalaya", "NIT Manipur", "NIT Mizoram",
  "NIT Nagaland", "NIT Puducherry", "NIT Sikkim", "NIT Uttarakhand",
  "NIT Andhra Pradesh", "NIT Arunachal Pradesh",

  // ── IIITs ──
  "IIIT Hyderabad", "IIIT Bangalore", "IIIT Delhi", "IIIT Allahabad",
  "ABV-IIITM Gwalior", "IIITDM Jabalpur", "IIITDM Kancheepuram", "IIIT Lucknow",
  "IIIT Pune", "IIIT Nagpur", "IIIT Vadodara", "IIIT Kottayam", "IIIT Una",
  "IIIT Sri City", "IIIT Kalyani", "IIIT Bhagalpur", "IIIT Bhopal",
  "IIIT Surat", "IIIT Ranchi", "IIIT Dharwad",

  // ── IIMs ──
  "IIM Ahmedabad", "IIM Bangalore", "IIM Calcutta", "IIM Lucknow",
  "IIM Kozhikode", "IIM Indore", "IIM Shillong", "IIM Rohtak", "IIM Ranchi",
  "IIM Raipur", "IIM Tiruchirappalli", "IIM Udaipur", "IIM Kashipur",
  "IIM Nagpur", "IIM Visakhapatnam", "IIM Bodh Gaya", "IIM Amritsar",
  "IIM Sambalpur", "IIM Sirmaur", "IIM Jammu", "IIM Mumbai",
  "XLRI Jamshedpur", "FMS Delhi", "MDI Gurgaon", "SPJIMR Mumbai",
  "IIFT Delhi", "IMT Ghaziabad", "TAPMI Manipal", "Great Lakes Institute of Management",

  // ── Central and large state universities ──
  "University of Delhi", "Jawaharlal Nehru University (JNU)",
  "Banaras Hindu University (BHU)", "Aligarh Muslim University (AMU)",
  "Jamia Millia Islamia", "University of Hyderabad", "University of Mumbai",
  "University of Calcutta", "University of Madras", "Anna University",
  "Osmania University", "Jadavpur University", "Savitribai Phule Pune University",
  "Panjab University", "University of Allahabad", "University of Lucknow",
  "University of Rajasthan", "Gujarat University", "Bangalore University",
  "University of Mysore", "Mangalore University", "University of Kerala",
  "University of Calicut", "Mahatma Gandhi University, Kottayam",
  "Cochin University of Science and Technology (CUSAT)", "Andhra University",
  "Sri Venkateswara University", "Kakatiya University", "Utkal University",
  "Ravenshaw University", "Sambalpur University", "Gauhati University",
  "Dibrugarh University", "Tezpur University", "North-Eastern Hill University (NEHU)",
  "Assam University", "Tripura University", "Manipur University",
  "Visva-Bharati University", "Shivaji University", "Bharathiar University",
  "Bharathidasan University", "Madurai Kamaraj University", "Annamalai University",
  "Periyar University", "Alagappa University", "Kurukshetra University",
  "Maharshi Dayanand University, Rohtak", "Guru Nanak Dev University",
  "Chaudhary Charan Singh University, Meerut", "Jiwaji University",
  "Devi Ahilya Vishwavidyalaya, Indore", "Barkatullah University",
  "Guru Gobind Singh Indraprastha University (GGSIPU)", "Jamia Hamdard",
  "Dr. B.R. Ambedkar Open University", "IGNOU",

  // ── Technical universities that award most state engineering degrees ──
  "Dr. A.P.J. Abdul Kalam Technical University (AKTU)",
  "Visvesvaraya Technological University (VTU)",
  "Rajiv Gandhi Proudyogiki Vishwavidyalaya (RGPV)",
  "Gujarat Technological University (GTU)", "Rajasthan Technical University (RTU)",
  "Maulana Abul Kalam Azad University of Technology (MAKAUT)",
  "JNTU Hyderabad", "JNTU Kakinada", "JNTU Anantapur",
  "Punjab Technical University (IKGPTU)", "Biju Patnaik University of Technology (BPUT)",
  "Dr. Babasaheb Ambedkar Technological University (DBATU)",
  "APJ Abdul Kalam Technological University (KTU)",

  // ── Well-known private and deemed universities ──
  "BITS Pilani", "BITS Pilani, Goa Campus", "BITS Pilani, Hyderabad Campus",
  "VIT Vellore", "VIT Chennai", "VIT-AP University", "VIT Bhopal",
  "SRM Institute of Science and Technology", "SRM University, AP",
  "Manipal Institute of Technology", "Manipal Academy of Higher Education",
  "Manipal University Jaipur", "Amrita Vishwa Vidyapeetham",
  "Amity University", "Lovely Professional University (LPU)",
  "Thapar Institute of Engineering and Technology", "Shiv Nadar University",
  "Ashoka University", "O.P. Jindal Global University",
  "Symbiosis International University", "Christ University",
  "Kalinga Institute of Industrial Technology (KIIT)",
  "Siksha 'O' Anusandhan University", "Chandigarh University",
  "Chitkara University", "Graphic Era University", "Bennett University",
  "UPES Dehradun", "Jaypee Institute of Information Technology",
  "Nirma University", "Pandit Deendayal Energy University (PDEU)",
  "DA-IICT Gandhinagar", "PES University", "NMIMS Mumbai",
  "Sharda University", "Galgotias University", "Bharati Vidyapeeth University",
  "Mahindra University", "Alliance University", "Jain University",
  "GITAM University", "KL University", "Sastra University",
  "Vignan's University", "Presidency University, Bangalore",
  "Woxsen University", "Plaksha University", "Krea University",
  "Flame University", "Azim Premji University", "TISS Mumbai",

  // ── Engineering colleges people name by the college, not the university ──
  "Delhi Technological University (DTU)",
  "Netaji Subhas University of Technology (NSUT)",
  "Indira Gandhi Delhi Technical University for Women (IGDTUW)",
  "College of Engineering, Pune (COEP)", "VJTI Mumbai",
  "Sardar Patel Institute of Technology, Mumbai",
  "K. J. Somaiya College of Engineering", "D. J. Sanghvi College of Engineering",
  "Thadomal Shahani Engineering College", "MIT World Peace University, Pune",
  "Vishwakarma Institute of Technology, Pune", "Pune Institute of Computer Technology (PICT)",
  "Cummins College of Engineering for Women",
  "College of Engineering, Guindy (CEG)", "Madras Institute of Technology (MIT), Chennai",
  "SSN College of Engineering", "PSG College of Technology",
  "Thiagarajar College of Engineering", "Coimbatore Institute of Technology",
  "Kumaraguru College of Technology", "R.V. College of Engineering",
  "BMS College of Engineering", "M.S. Ramaiah Institute of Technology",
  "Dayananda Sagar College of Engineering",
  "Sir M. Visvesvaraya Institute of Technology",
  "Chaitanya Bharathi Institute of Technology (CBIT)",
  "Vasavi College of Engineering", "VNR Vignana Jyothi Institute of Engineering and Technology",
  "IIEST Shibpur", "Heritage Institute of Technology, Kolkata",
  "Punjab Engineering College (PEC)", "LNM Institute of Information Technology (LNMIIT)",
  "L.D. College of Engineering", "SGSITS Indore",
  "College of Engineering, Trivandrum (CET)", "Model Engineering College, Kochi",
  "TKM College of Engineering", "Rajagiri School of Engineering and Technology",
  "Maharaja Agrasen Institute of Technology", "JECRC University",

  // ── Medicine ──
  "AIIMS New Delhi", "AIIMS Jodhpur", "AIIMS Bhubaneswar", "AIIMS Bhopal",
  "AIIMS Patna", "AIIMS Raipur", "AIIMS Rishikesh", "JIPMER Puducherry",
  "Christian Medical College (CMC), Vellore", "Armed Forces Medical College (AFMC)",
  "King George's Medical University (KGMU)", "Maulana Azad Medical College",
  "Lady Hardinge Medical College", "Vardhman Mahavir Medical College",
  "Grant Medical College, Mumbai", "Seth G.S. Medical College, Mumbai",
  "St. John's Medical College, Bangalore", "Kasturba Medical College, Manipal",
  "Bangalore Medical College and Research Institute", "Madras Medical College",
  "Osmania Medical College", "Gandhi Medical College, Hyderabad",

  // ── Law ──
  "NLSIU Bangalore", "NALSAR Hyderabad", "National Law University, Delhi",
  "WB National University of Juridical Sciences (NUJS)",
  "National Law University, Jodhpur", "Gujarat National Law University (GNLU)",
  "Symbiosis Law School", "ILS Law College, Pune", "Faculty of Law, University of Delhi",
  "Government Law College, Mumbai",

  // ── Design, art and architecture ──
  "National Institute of Design (NID), Ahmedabad", "NID Bengaluru", "NID Gandhinagar",
  "NIFT Delhi", "NIFT Mumbai", "NIFT Bengaluru", "NIFT Chennai", "NIFT Hyderabad",
  "NIFT Kolkata", "IDC School of Design, IIT Bombay",
  "Srishti Manipal Institute of Art, Design and Technology",
  "MIT Institute of Design, Pune", "Pearl Academy",
  "Sir J.J. School of Art", "Symbiosis Institute of Design",
  "Sir J.J. College of Architecture", "School of Planning and Architecture, Delhi",
  "CEPT University", "Academy of Art and Design",

  // ── Film, media and communication ──
  "Film and Television Institute of India (FTII)",
  "Satyajit Ray Film and Television Institute (SRFTI)",
  "Whistling Woods International", "Indian Institute of Mass Communication (IIMC)",
  "Asian College of Journalism", "Xavier Institute of Communications",
  "Symbiosis Institute of Media and Communication",

  // ── The arts, science and commerce colleges named on their own ──
  "Shri Ram College of Commerce (SRCC)", "Lady Shri Ram College for Women (LSR)",
  "Hindu College, Delhi", "St. Stephen's College, Delhi", "Hansraj College",
  "Miranda House", "Kirori Mal College", "Ramjas College", "Gargi College",
  "Sri Venkateswara College", "Jesus and Mary College", "Daulat Ram College",
  "Deshbandhu College", "Dyal Singh College",
  "St. Xavier's College, Mumbai", "St. Xavier's College, Kolkata",
  "St. Xavier's College, Ahmedabad", "Presidency University, Kolkata",
  "Presidency College, Chennai", "Loyola College, Chennai", "Stella Maris College",
  "Madras Christian College", "Fergusson College, Pune",
  "St. Joseph's College, Bangalore", "Mount Carmel College, Bangalore",
  "Narsee Monjee College of Commerce and Economics", "H.R. College of Commerce",
  "Jai Hind College", "K.C. College", "Mithibai College", "Ramnarain Ruia College",
  "St. Thomas College", "Banasthali Vidyapith",

  // ── Professional bodies people list as their education ──
  "Institute of Chartered Accountants of India (ICAI)",
  "Institute of Company Secretaries of India (ICSI)",
  "Institute of Cost Accountants of India (ICMAI)",

  // ── A short international tail ──
  "Massachusetts Institute of Technology (MIT)", "Stanford University",
  "Harvard University", "University of California, Berkeley",
  "California Institute of Technology (Caltech)", "Carnegie Mellon University",
  "Princeton University", "Yale University", "Columbia University",
  "Cornell University", "University of Chicago", "University of Pennsylvania",
  "UCLA", "University of Michigan", "Georgia Institute of Technology",
  "University of Illinois Urbana-Champaign", "University of Texas at Austin",
  "University of Washington", "New York University", "Purdue University",
  "Northeastern University", "Arizona State University",
  "University of Toronto", "University of British Columbia", "McGill University",
  "University of Waterloo", "University of Oxford", "University of Cambridge",
  "Imperial College London", "University College London (UCL)",
  "London School of Economics (LSE)", "University of Edinburgh",
  "University of Manchester", "University of Warwick", "ETH Zurich", "EPFL",
  "Technical University of Munich", "TU Delft", "KU Leuven", "Sorbonne University",
  "HEC Paris", "INSEAD", "National University of Singapore (NUS)",
  "Nanyang Technological University (NTU)", "University of Melbourne",
  "University of Sydney", "UNSW Sydney", "Monash University",
  "Australian National University", "University of Auckland",
  "University of Tokyo", "Kyoto University", "Tsinghua University",
  "Peking University", "KAIST", "Seoul National University",
  "University of Hong Kong", "HKUST", "Technion", "Tel Aviv University",
  "University of Cape Town",
];
