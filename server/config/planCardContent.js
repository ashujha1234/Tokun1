// Display-only content for the subscription "plan card" shown on invoice
// PDFs/emails — mirrors the cards on the Subscription page
// (frontend/src/pages/Subscription.tsx) so a customer's invoice reads the
// same numbers they saw when they bought the plan.
const PLAN_CARD_CONTENT = {
  free: {
    title: "Free",
    subtitle: "(Individuals)",
    tokens: "5,000",
    highlight: null,
    extras: [{ label: "Extra Tokens Feature", value: "No" }],
  },
  pro: {
    title: "Pro",
    subtitle: "(Individuals)",
    tokens: "100,000",
    highlight: "Most Popular",
    extras: [
      { label: "Extra Tokens Feature", value: "Yes" },
      { label: "No. of Extra Tokens", value: "50,000" },
      { label: "Extra Token Price", value: "₹200" },
    ],
  },
  enterprise: {
    title: "Enterprise",
    subtitle: "(Organization)",
    tokens: "1,000,000",
    highlight: null,
    extras: [
      { label: "Extra Tokens Feature", value: "Yes" },
      { label: "No. of Extra Tokens", value: "100,000" },
      { label: "Extra Token Price", value: "₹199" },
    ],
  },
};

// Vertical (top → bottom) gradients. Pro matches the site's selected-card
// gradient (pink → blue, see Subscription.tsx's SELECTED_CARD_BG). Enterprise
// gets a distinct gold → bronze premium look.
const PLAN_GRADIENTS = {
  free: { from: "#3F3F46", to: "#18181B" },
  pro: { from: "#FF14EF", to: "#1A73E8" },
  enterprise: { from: "#FCD34D", to: "#78350F" },
};

module.exports = { PLAN_CARD_CONTENT, PLAN_GRADIENTS };
