// Turns a Razorpay Route API error into something a seller can act on.
//
// Razorpay's failure shape (documented at
// https://razorpay.com/docs/api/payments/route/create-linked-account/) is:
//
//   { "error": { "code": "BAD_REQUEST_ERROR",
//                "description": "Invalid business type: xyz",
//                "source": "business", "step": "payment_initiation",
//                "reason": "input_validation_failed",
//                "metadata": {}, "field": "business_type" } }
//
// `description` is written for whoever is integrating, not for the person
// filling in the form — "company pan field is invalid for business_type:
// individual" tells a seller nothing they can do something about. `field`, on
// the other hand, names the exact input Razorpay rejected, which is enough to
// both rewrite the sentence and point the form at the box to fix.
//
// So the mapping below is keyed on `field`, and every entry answers two
// questions: which input on OUR form does this correspond to, and what should
// the seller change. Anything unmapped falls back to the description, because
// a developer-facing sentence still beats "something went wrong".

// Maps Razorpay's field path to the form field name the client knows, plus the
// seller-facing sentence. `form` values match the input names in
// SellerLinkedAccountForm so it can highlight the right box.
const FIELD_ERRORS = {
  email: {
    form: "email",
    message:
      "This email is already linked to another payout account on Razorpay, or isn't a valid address. Each seller needs their own.",
  },
  phone: {
    form: "phone",
    message: "Enter a valid 10-digit mobile number.",
  },
  legal_business_name: {
    form: "legalBusinessName",
    message:
      "This business name wasn't accepted. Enter it exactly as it appears on your incorporation or GST certificate (4 characters minimum).",
  },
  customer_facing_business_name: {
    form: "customerFacingBusinessName",
    message: "This display name wasn't accepted — keep it under 255 characters.",
  },
  business_type: {
    form: "businessType",
    message: "Razorpay didn't accept this business type. Pick the one that matches your registration.",
  },
  "profile.category": {
    form: "businessCategory",
    message: "Razorpay didn't accept this business category. Pick a different one.",
  },
  "profile.subcategory": {
    form: "businessSubcategory",
    message:
      "This sub-category isn't valid for the category you picked. Choose one from the list again.",
  },
  "profile.business_model": {
    form: "businessCategory",
    message: "The business description wasn't accepted — keep it under 255 characters.",
  },

  // Razorpay reports the whole address object when a piece of it is missing,
  // so this points at the first line rather than a field we can't identify.
  "profile.addresses": {
    form: "street1",
    message: "Your registered address was incomplete. Check every line, including PIN code and state.",
  },
  "profile.addresses.registered": {
    form: "street1",
    message: "Your registered address was incomplete. Check every line, including PIN code and state.",
  },
  "profile.addresses.registered.street1": {
    form: "street1",
    message: "Address line 1 wasn't accepted — keep it under 100 characters.",
  },
  "profile.addresses.registered.street2": {
    form: "street2",
    message: "Address line 2 wasn't accepted — keep it under 100 characters.",
  },
  "profile.addresses.registered.city": {
    form: "city",
    message: "This city wasn't accepted — keep it under 100 characters.",
  },
  "profile.addresses.registered.state": {
    form: "state",
    message:
      "Razorpay didn't recognise this state. Enter the full state name as spelled officially, e.g. KARNATAKA.",
  },
  "profile.addresses.registered.postal_code": {
    form: "postalCode",
    message: "PIN code must be exactly 6 digits.",
  },
  "profile.addresses.registered.country": {
    form: "country",
    message: "Country must be IN.",
  },

  // legal_info holds the ENTITY's identifiers. Razorpay's own regex for
  // legal_info.pan allows C/H/F/A/T/B/J/G/L as the 4th character and excludes
  // P — a personal PAN is never valid here, which is the single most common
  // way a proprietorship's submission fails.
  "legal_info.pan": {
    form: "businessPan",
    message:
      "This isn't a valid business PAN. A personal PAN (4th letter P) can't be used here — leave this blank and enter it as your own PAN instead.",
  },
  "legal_info.gst": {
    form: "gstin",
    message:
      "This GSTIN wasn't accepted. It's 15 characters and must contain the same PAN as the business PAN above.",
  },

  // Stakeholder-side fields — a separate API call, but the failure surfaces
  // through the same onboarding sequence and the same form.
  "kyc.pan": {
    form: "panNumber",
    message: "This PAN wasn't accepted. Check it against the card — e.g. ABCPE1234F.",
  },
  name: {
    form: "stakeholderName",
    message: "This name wasn't accepted. Enter it as it appears on the PAN card.",
  },
  percentage_ownership: {
    form: "percentageOwnership",
    message: "Ownership percentage must be between 1 and 100.",
  },

  // Settlement / product-configuration fields.
  "settlements.account_number": {
    form: "accountNumber",
    message: "Razorpay didn't accept this account number. Check it against your passbook or cheque.",
  },
  "settlements.ifsc_code": {
    form: "ifscCode",
    message: "This IFSC code wasn't recognised. It's 11 characters, e.g. HDFC0001234.",
  },
  "settlements.beneficiary_name": {
    form: "accountHolderName",
    message:
      "The account holder name wasn't accepted. It must match the name on the bank account exactly.",
  },
};

// Matched against `description` only when `field` is missing or unmapped.
// Ordered — the first hit wins — so narrower patterns must come first.
const DESCRIPTION_PATTERNS = [
  {
    test: /already exist|already registered|duplicate/i,
    form: "email",
    message:
      "A payout account already exists for these details on Razorpay. If you're retrying, use a different email address.",
  },
  {
    test: /addresses field is required|addresses.*required/i,
    form: "street1",
    message: "Your registered address is required — fill in every line, including PIN code and state.",
  },
  {
    test: /company pan|pan field is invalid/i,
    form: "businessPan",
    message:
      "The PAN you entered doesn't match the business type you selected. Check both — a personal PAN can't be used as a business PAN.",
  },
  {
    test: /invalid business type/i,
    form: "businessType",
    message: "Razorpay didn't accept this business type. Pick the one that matches your registration.",
  },
  {
    test: /gst/i,
    form: "gstin",
    message: "This GSTIN wasn't accepted. Check it against your GST certificate.",
  },
];

// Razorpay's own sentences are safe to show only when they read like input
// feedback. Anything about authentication, permissions or internal state is
// about OUR integration, not the seller's data, and saying so to a seller is
// both confusing and a small information leak.
const INTERNAL_ERROR_MESSAGE =
  "We couldn't set up your payout account right now. This is on our side — please try again shortly, and contact support if it keeps happening.";

function isSellerFacingReason(error) {
  if (!error) return false;
  // Only validation failures describe something the seller typed. Auth,
  // rate-limit and server errors do not.
  if (error.reason && error.reason !== "input_validation_failed") return false;
  return error.code === "BAD_REQUEST_ERROR";
}

/**
 * @param {object|null} razorpayPayload the parsed { error: {...} } body
 * @returns {{ message: string, field: string|null, sellerFacing: boolean }}
 */
function translateRazorpayError(razorpayPayload) {
  const error = razorpayPayload?.error;

  // No structured error means the request never got a Razorpay verdict at all
  // — a timeout, a DNS failure, a 502 from something in between. The thrown
  // Error's own message ("fetch failed") describes our plumbing, so it stays
  // in the log and the seller gets told it isn't their data.
  if (!error) {
    return { message: INTERNAL_ERROR_MESSAGE, field: null, sellerFacing: false };
  }

  // The documented `field` is the most precise signal available, so it is
  // tried before anything is inferred from prose.
  if (error.field && FIELD_ERRORS[error.field]) {
    const mapped = FIELD_ERRORS[error.field];
    return { message: mapped.message, field: mapped.form, sellerFacing: true };
  }

  const description = String(error.description || "");
  const matched = DESCRIPTION_PATTERNS.find((p) => p.test.test(description));
  if (matched) {
    return { message: matched.message, field: matched.form, sellerFacing: true };
  }

  // Unmapped but still a validation error: Razorpay's own wording is rough,
  // but it names something real about what was submitted, so it beats a
  // generic apology. Anything else is ours to own.
  if (isSellerFacingReason(error) && description) {
    return { message: description, field: null, sellerFacing: true };
  }

  return { message: INTERNAL_ERROR_MESSAGE, field: null, sellerFacing: false };
}

module.exports = {
  FIELD_ERRORS,
  INTERNAL_ERROR_MESSAGE,
  translateRazorpayError,
};
