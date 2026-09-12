// constants/accessRequestTemplates.js
//
// Starter checklists a creator can drop onto an engagement instead of typing the
// same five asks by hand for the hundredth time.
//
// These are TEMPLATES, not rules. The route copies them into an AccessRequest's
// items as ordinary editable rows — nothing downstream knows or cares that an
// item came from here. That matters: the moment a template is treated as a
// schema, a creator whose engagement needs a sixth thing can't ask for it.
//
// ── The one thing these encode that is not convenience ───────────────────────
//
// Every ACCESS item is worded to ask for an INVITATION, never a credential.
// "Invite us to your Google Analytics property" instead of "send GA login". This
// is the whole reason the defaults are curated rather than left to each creator:
// asked in free text, a meaningful share of clients answer an access request
// with a username and password in plaintext, in a chat log, forever. The safe
// phrasing has to be the default phrasing, because it is the one most people
// will use unchanged.
//
// Kinds map to models/AccessRequest.js:
//   ASSET    — a file to upload
//   ACCESS   — permission inside the client's system, granted by invitation
//   INFO     — something to write down
//   APPROVAL — a decision that blocks the work until it is made

const TEMPLATES = [
  {
    id: "brand",
    label: "Brand & design assets",
    description: "Logos, fonts, colours and anything the work has to match.",
    items: [
      {
        label: "Logo files",
        kind: "ASSET",
        required: true,
        note: "Vector if you have it (SVG, AI or EPS). A PNG on a transparent background works too.",
      },
      {
        label: "Brand guidelines",
        kind: "ASSET",
        required: false,
        note: "Colours, fonts and usage rules. If you don't have a document, tell us the hex codes and font names in a note.",
      },
      {
        label: "Fonts (or their names)",
        kind: "ASSET",
        required: false,
        note: "Send the files only if your licence allows it — otherwise just the names and we'll license our own copy.",
      },
      {
        label: "Examples of work you like",
        kind: "INFO",
        required: false,
        note: "Two or three links or screenshots. Saying what you don't like is just as useful.",
      },
    ],
  },
  {
    id: "content",
    label: "Content & copy",
    description: "The words, images and product information the work is built around.",
    items: [
      { label: "Final copy / text", kind: "ASSET", required: true, note: "A doc is fine. If you'd like us to write it, say so instead." },
      { label: "Images or product photos", kind: "ASSET", required: false, note: "Highest resolution you have." },
      {
        label: "Tone of voice",
        kind: "INFO",
        required: false,
        note: "A sentence is enough — formal, playful, technical, plain.",
      },
      { label: "Who this is for", kind: "INFO", required: true, note: "The audience. This changes almost every decision in the work." },
    ],
  },
  {
    id: "website",
    label: "Website & hosting",
    description: "For work that touches a live site.",
    items: [
      {
        label: "Invite us to your site's admin",
        kind: "ACCESS",
        required: true,
        // The security phrasing, spelled out. This is the item most likely to
        // get a password pasted into it if left vague.
        note: "Add our account as a user with the lowest role that lets us work — Editor or Developer, not Owner. Do NOT send a password; the route will refuse it. Reply with the email you invited.",
      },
      {
        label: "Invite us to your DNS or domain registrar",
        kind: "ACCESS",
        required: false,
        note: "Only if the work needs a domain or DNS change. Delegated or read-only access is usually enough.",
      },
      { label: "Hosting details", kind: "INFO", required: false, note: "Who hosts it and on what plan. No logins — just the provider name." },
      { label: "Sitemap or page list", kind: "ASSET", required: false, note: "Which pages exist and which ones are in scope." },
    ],
  },
  {
    id: "marketing",
    label: "Marketing platform access",
    description: "For campaign, email and analytics work.",
    items: [
      {
        label: "Invite us to your email platform",
        kind: "ACCESS",
        required: true,
        note: "Mailchimp, Klaviyo, Brevo — add our email as a team member. If you don't have one yet, say so and we'll set one up in your name. Never send a password.",
      },
      {
        label: "Invite us to your analytics",
        kind: "ACCESS",
        required: false,
        note: "Google Analytics or similar — add our email with Viewer or Analyst access.",
      },
      {
        label: "Invite us to your ad accounts",
        kind: "ACCESS",
        required: false,
        note: "Through Business Manager or the platform's own team settings, at the lowest useful role.",
      },
      { label: "Existing list size & segments", kind: "INFO", required: false, note: "Roughly how many contacts, and how they're grouped." },
      { label: "Past campaigns that did well", kind: "ASSET", required: false, note: "Or badly — both are useful." },
      {
        label: "Key dates",
        kind: "INFO",
        required: false,
        note: "Launches, sales, events or anything the schedule has to work around.",
      },
    ],
  },
  {
    id: "code",
    label: "Code & repository",
    description: "For development work on an existing codebase.",
    items: [
      {
        label: "Invite us to the repository",
        kind: "ACCESS",
        required: true,
        note: "GitHub, GitLab or Bitbucket — add our account as a collaborator. Reply with the username you invited.",
      },
      {
        label: "Environment variables / config",
        kind: "INFO",
        required: true,
        // Explicitly steers a genuinely dangerous ask somewhere safe.
        note: "Tell us WHICH variables exist and what they're for — not their values. Share the values through your own secret manager, never through Tokun.",
      },
      { label: "Setup or run instructions", kind: "ASSET", required: false, note: "A README, or a few lines on how to get it running locally." },
      { label: "Staging environment", kind: "ACCESS", required: false, note: "A URL and an invitation, if there's somewhere safe to test." },
      {
        label: "Who reviews and approves changes",
        kind: "APPROVAL",
        required: false,
        note: "One name. Work that needs three people to agree takes three times as long.",
      },
    ],
  },
  {
    id: "video",
    label: "Video & audio",
    description: "For edit, motion and post-production work.",
    items: [
      { label: "Raw footage", kind: "ASSET", required: true, note: "A link to a Drive or WeTransfer folder is best — raw video is bigger than any upload limit worth having." },
      { label: "Music or voiceover", kind: "ASSET", required: false, note: "Include the licence if it isn't yours." },
      { label: "Script or shot list", kind: "ASSET", required: false, note: "" },
      { label: "Final duration & aspect ratio", kind: "INFO", required: true, note: "Where it will be published decides both." },
    ],
  },
  {
    id: "minimal",
    label: "Just the essentials",
    description: "Three questions that unblock almost any engagement.",
    items: [
      { label: "Anything the work has to match", kind: "ASSET", required: false, note: "Brand files, an existing design, a previous version." },
      { label: "Who this is for", kind: "INFO", required: true, note: "The audience or the end user." },
      { label: "Anything that must NOT change", kind: "INFO", required: false, note: "Constraints are as useful as instructions." },
    ],
  },
];

/** @returns {object|null} the template, or null for an unknown id */
function getTemplate(id) {
  return TEMPLATES.find((t) => t.id === String(id)) || null;
}

/** The list without the items, for a picker. */
function templateIndex() {
  return TEMPLATES.map(({ id, label, description, items }) => ({
    id,
    label,
    description,
    itemCount: items.length,
  }));
}

module.exports = { TEMPLATES, getTemplate, templateIndex };
