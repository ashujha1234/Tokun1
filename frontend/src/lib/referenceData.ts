/**
 * Country and language lists for the freelancer profile pickers.
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
