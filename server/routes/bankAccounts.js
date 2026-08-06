// // routes/bankAccounts.js
// const express = require("express");
// const router = express.Router();
// const BankAccount = require("../models/BankAccount");
// const { requireAuth } = require("../utils/auth"); // your JWT middleware

// // -----------------------------
// // Add new bank account
// // -----------------------------
// router.post("/add", requireAuth, async (req, res) => {
//   try {
//     const { accountHolderName, accountNumber, confirmAccountNumber, ifscCode, bankName, default: makeDefault } = req.body;

//     // Validate input
//     if (!accountHolderName || !accountNumber || !confirmAccountNumber || !ifscCode || !bankName) {
//       return res.status(400).json({ success: false, error: "all_fields_required" });
//     }

//     if (accountNumber !== confirmAccountNumber) {
//       return res.status(400).json({ success: false, error: "account_numbers_mismatch" });
//     }

//     // Check if account already exists for this user
//     const existingAccount = await BankAccount.findOne({ userId: req.user._id, accountNumber });
//     if (existingAccount) {
//       return res.status(400).json({ success: false, error: "account_already_exists" });
//     }

//     // Get all accounts of the user
//     const existingAccounts = await BankAccount.find({ userId: req.user._id });

//     let isDefault = false;

//     if (existingAccounts.length === 0) {
//       // First account is automatically default
//       isDefault = true;
//     } else if (makeDefault) {
//       // If user wants this account as default, unset previous defaults
//       await BankAccount.updateMany({ userId: req.user._id, default: true }, { default: false });
//       isDefault = true;
//     }

//     // Create new bank account
//     const bankAccount = await BankAccount.create({
//       userId: req.user._id,
//       accountHolderName,
//       accountNumber,
//       ifscCode,
//       bankName,
//       default: isDefault,
//     });

//     res.json({ success: true, bankAccount });
//   } catch (err) {
//     console.error("Add Bank Account:", err);
//     res.status(500).json({ success: false, error: "server_error" });
//   }
// });


// // -----------------------------
// // Get all bank accounts of user
// // -----------------------------
// router.get("/", requireAuth, async (req, res) => {
//   try {
//     const accounts = await BankAccount.find({ userId: req.user._id }).sort({ createdAt: -1 });
//     res.json({ success: true, accounts });
//   } catch (err) {
//     console.error("Get Bank Accounts:", err);
//     res.status(500).json({ success: false, error: "server_error" });
//   }
// });

// // -----------------------------
// // Get default account
// // -----------------------------
// router.get("/default", requireAuth, async (req, res) => {
//   try {
//     const defaultAccount = await BankAccount.findOne({ userId: req.user._id, default: true });
//     res.json({ success: true, defaultAccount });
//   } catch (err) {
//     console.error("Get Default Account:", err);
//     res.status(500).json({ success: false, error: "server_error" });
//   }
// });

// // -----------------------------
// // Set a bank account as default
// // -----------------------------
// router.post("/set-default/:accountId", requireAuth, async (req, res) => {
//   try {
//     const { accountId } = req.params;

//     // Unset previous default
//     await BankAccount.updateMany({ userId: req.user._id }, { default: false });

//     // Set new default
//     const updated = await BankAccount.findOneAndUpdate(
//       { _id: accountId, userId: req.user._id },
//       { default: true },
//       { new: true }
//     );

//     if (!updated) return res.status(404).json({ success: false, error: "account_not_found" });

//     res.json({ success: true, defaultAccount: updated });
//   } catch (err) {
//     console.error("Set Default Account:", err);
//     res.status(500).json({ success: false, error: "server_error" });
//   }
// });


// // -----------------------------
// // Delete bank account
// // -----------------------------
// router.delete("/:accountId", requireAuth, async (req, res) => {
//   try {
//     const { accountId } = req.params;

//     const deleted = await BankAccount.findOneAndDelete({
//       _id: accountId,
//       userId: req.user._id,
//     });

//     if (!deleted) {
//       return res.status(404).json({
//         success: false,
//         error: "account_not_found",
//       });
//     }

//     let newDefaultAccount = null;

//     if (deleted.default) {
//       newDefaultAccount = await BankAccount.findOne({
//         userId: req.user._id,
//       }).sort({ createdAt: -1 });

//       if (newDefaultAccount) {
//         newDefaultAccount.default = true;
//         await newDefaultAccount.save();
//       }
//     }

//     res.json({
//       success: true,
//       deletedAccountId: deleted._id,
//       newDefaultAccount,
//     });
//   } catch (err) {
//     console.error("Delete Bank Account:", err);
//     res.status(500).json({
//       success: false,
//       error: "server_error",
//     });
//   }
// });



// module.exports = router;


// routes/bankAccounts.js
const express = require("express");
const router = express.Router();

const BankAccount = require("../models/BankAccount");
const User = require("../models/User");
const { requireAuth } = require("../utils/auth");
const {
  BUSINESS_CATEGORIES,
  isValidCategoryPair,
} = require("../constants/businessCategories");
const {
  KYC_REQUIREMENTS,
  getKycRequirements,
  isRequired,
} = require("../constants/kycRequirements");
const { translateRazorpayError } = require("../constants/razorpayErrors");

const RAZORPAY_BASE_URL = "https://api.razorpay.com/v1";

const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

function getRazorpayAuthHeader() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new Error("RAZORPAY_KEYS_MISSING");
  }

  return `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`;
}

async function razorpayRequest(path, body) {
  const res = await fetch(`${RAZORPAY_BASE_URL}${path}`, {
    method: "POST",
    headers: {
      Authorization: getRazorpayAuthHeader(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const message =
      data?.error?.description ||
      data?.error?.reason ||
      data?.message ||
      `Razorpay request failed: ${res.status}`;

    const err = new Error(message);
    err.razorpay = data;
    throw err;
  }

  return data;
}

// ── Route (Linked Account) — v2 base, separate from the v1 Fund Account calls above ──
const RAZORPAY_V2_BASE_URL = "https://api.razorpay.com/v2";

async function razorpayV2Request(method, path, body) {
  const res = await fetch(`${RAZORPAY_V2_BASE_URL}${path}`, {
    method,
    headers: {
      Authorization: getRazorpayAuthHeader(),
      "Content-Type": "application/json",
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const message =
      data?.error?.description ||
      data?.error?.reason ||
      data?.message ||
      `Razorpay Route request failed: ${res.status}`;

    const err = new Error(message);
    err.razorpay = data;
    throw err;
  }

  return data;
}

// Razorpay's accepted `business_type` values for registered entities. Note
// this is NOT just the four "company" types — trusts, societies, NGOs and
// educational institutes onboard through the same Route flow.
const ORG_BUSINESS_TYPES = [
  "proprietorship",
  "partnership",
  "private_limited",
  "public_limited",
  "llp",
  "trust",
  "society",
  "ngo",
  "educational_institutes",
  "other",
];

// The 4th character of an Indian PAN encodes the holder type, so the entity
// PAN has to agree with the declared business_type or Razorpay's KYC rejects
// it downstream. Catching it here turns a days-later "needs_clarification"
// into an instant, specific form error.
//   P individual · C company · F firm/LLP · T trust · A association of persons
//   B body of individuals · H HUF · J artificial juridical person · G govt · L local authority
//
// These constrain legal_info.pan, whose own regex in Razorpay's docs accepts
// only C/H/F/A/T/B/J/G/L as the 4th character — "P" is excluded, so a personal
// PAN is never valid in this field for ANY business type.
const ORG_BUSINESS_TYPE_PAN_LETTERS = {
  // Was ["P"], which could never have been accepted: a proprietorship has no
  // entity PAN, and the proprietor's own P-PAN belongs on the stakeholder as
  // kyc.pan, not here. Business PAN is optional for a proprietorship anyway —
  // this list now only governs the case where one is supplied regardless.
  proprietorship: ["C", "H", "F", "A", "T", "B", "J", "G", "L"],
  partnership: ["F"],
  llp: ["F"],
  private_limited: ["C"],
  public_limited: ["C"],
  trust: ["T"],
  society: ["A", "T", "B"],
  ngo: ["A", "T", "B"],
  educational_institutes: ["A", "T", "C", "J"],
  other: null,                     // null = accept any holder type
};

const ORG_BUSINESS_TYPE_LABELS = {
  proprietorship: "Proprietorship",
  partnership: "Partnership firm",
  private_limited: "Private Limited",
  public_limited: "Public Limited",
  llp: "LLP",
  trust: "Trust",
  society: "Society",
  ngo: "NGO",
  educational_institutes: "Educational institute",
  other: "Other",
};

const PAN_REGEX = /^[A-Z]{3}[PCHFATBJGL][A-Z]\d{4}[A-Z]$/;
// 2-digit state code + the entity's 10-char PAN + entity code + "Z" + checksum.
const GSTIN_REGEX = /^\d{2}[A-Z]{5}\d{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;

// Builds the POST /v2/accounts body. Individual and organization differ only
// in business_type and the presence of legal_info — the profile/address shape
// is identical, which is why one builder covers both.
function buildRouteAccountPayload({
  sellerType,
  email,
  phone,
  legalBusinessName,
  customerFacingBusinessName,
  businessType,
  businessPan,
  gstin,
  registeredAddress,
  businessCategory,
  businessSubcategory,
}) {
  const payload = {
    email,
    phone,
    type: "route",
    legal_business_name: legalBusinessName,
    // Individuals: Razorpay stores the "individual" business_type we send as
    // "not_yet_registered" on read-back — that's its own normalisation, not a
    // mismatch on our side.
    business_type: sellerType === "organization" ? businessType : "individual",
    // Chosen by the seller from Razorpay's own enum (see
    // constants/businessCategories.js), not fixed by us: it describes the
    // LINKED ACCOUNT's business, and each seller's differs. This used to be a
    // hardcoded "healthcare"/"clinic" — a placeholder that survived because
    // an earlier "ecommerce"/"marketplace" attempt was rejected. The category
    // was never the problem there; `marketplace` simply isn't a subcategory of
    // anything (ecommerce spells it `ecommerce_marketplace`).
    //
    // Getting this right matters most for organizations: Razorpay checks the
    // category against the entity's actual GST/COI line of business during
    // KYC, so a mismatch is flagged there rather than rejected here.
    profile: {
      category: businessCategory,
      subcategory: businessSubcategory,
      addresses: { registered: registeredAddress },
    },
  };

  if (customerFacingBusinessName) {
    payload.customer_facing_business_name = customerFacingBusinessName;
  }

  // legal_info carries the ENTITY's PAN/GST. Sending it for an individual is
  // what produced "company pan field is invalid for business_type: individual"
  // — an individual's personal PAN belongs on the Stakeholder's kyc.pan only.
  //
  // Both halves are conditional now rather than pan-always/gst-sometimes: a
  // proprietorship is allowed to send neither (Razorpay's KYC matrix marks
  // both "Optional" for it), and legal_info itself is only attached when
  // there is something to put in it — an empty object is not a valid value.
  if (sellerType === "organization") {
    const legalInfo = {};
    if (businessPan) legalInfo.pan = businessPan;
    if (gstin) legalInfo.gst = gstin;
    if (Object.keys(legalInfo).length) payload.legal_info = legalInfo;
  }

  return payload;
}

// Builds the POST /v2/accounts/:id/stakeholders body. For an organization the
// stakeholder is the authorised signatory / director — a different person from
// the entity, with their OWN personal PAN and their own ownership percentage.
function buildRouteStakeholderPayload({
  name,
  email,
  panNumber,
  phone,
  residentialAddress,
  sellerType,
  percentageOwnership,
}) {
  const payload = {
    name,
    email,
    phone: { primary: phone, secondary: phone },
    addresses: { residential: residentialAddress },
  };

  // Omitted entirely when there's no PAN rather than sent as { pan: "" }.
  // Razorpay's KYC matrix marks the signatory PAN "No" for every registered
  // entity, so an organization can legitimately reach here without one.
  if (panNumber) {
    payload.kyc = { pan: panNumber };
  }

  if (sellerType === "organization") {
    payload.relationship = { director: true, executive: true };
    // Only sent when the seller actually told us — guessing 100% for a
    // multi-director company would contradict the MCA filing Razorpay checks
    // it against.
    if (Number.isFinite(percentageOwnership)) {
      payload.percentage_ownership = percentageOwnership;
    }
  } else {
    payload.percentage_ownership = 100; // solo individual — owns 100% of their own earnings
  }

  return payload;
}

// Runs the full 4-call Route onboarding sequence for one seller. Both seller
// types go through here — the only difference is the payloads built above.
async function runRouteOnboarding({ accountPayload, stakeholderPayload, settlements }) {
  const account = await razorpayV2Request("POST", "/accounts", accountPayload);

  const stakeholder = await razorpayV2Request(
    "POST",
    `/accounts/${account.id}/stakeholders`,
    stakeholderPayload
  );

  // Product configuration is two calls, not one: Razorpay rejects settlements
  // on the POST ("settlements is/are not required and should not be sent") and
  // requires a follow-up PATCH against the product_id the POST returns. That's
  // a Razorpay-side requirement, not something combinable into one request.
  const productConfig = await razorpayV2Request("POST", `/accounts/${account.id}/products`, {
    product_name: "route",
    tnc_accepted: true,
  });

  await razorpayV2Request("PATCH", `/accounts/${account.id}/products/${productConfig.id}`, {
    settlements,
    tnc_accepted: true,
  });

  return { account, stakeholder, productConfig };
}

async function fetchRouteProductConfiguration({ accountId, productId }) {
  return razorpayV2Request("GET", `/accounts/${accountId}/products/${productId}`);
}

async function fetchRouteLinkedAccount(accountId) {
  return razorpayV2Request("GET", `/accounts/${accountId}`);
}

async function fetchRouteStakeholder(accountId, stakeholderId) {
  return razorpayV2Request("GET", `/accounts/${accountId}/stakeholders/${stakeholderId}`);
}

// Applies `value` at a dotted path (e.g. "profile.addresses.registered.city")
// onto a plain object clone, creating intermediate objects as needed. Used to
// patch one flagged field into an otherwise-unchanged object fetched live
// from Razorpay, since Route's PATCH endpoints require the full object
// (legal_business_name/phone/profile etc.), not just the corrected field.
function setDeep(target, dottedPath, value) {
  const keys = dottedPath.split(".");
  let cursor = target;
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (typeof cursor[key] !== "object" || cursor[key] === null) {
      cursor[key] = {};
    }
    cursor = cursor[key];
  }
  cursor[keys[keys.length - 1]] = value;
  return target;
}

// Resolves a single Razorpay `requirements[].field_reference` by re-PATCHing
// the right Route object with everything unchanged except this one field.
// The scope (first segment of field_reference, e.g. "settlements"/"kyc") is
// what Razorpay's own requirements array reports — see the live example
// captured while building this: { field_reference: "settlements.ifsc_code",
// resolution_url: "/accounts/.../products/...", reason_code: "needs_clarification" }.
// Batches multiple flagged fields into ONE Razorpay call per scope, instead
// of one call per field — Razorpay's settlements/stakeholder/account PATCH
// endpoints each take the FULL object regardless of how many of their fields
// changed, so fixing 3 settlement fields one-at-a-time would mean 3 PATCH
// calls each resending the same object. Grouping by scope means 3 flagged
// settlement fields (the real case seen on a live test account: field_reference
// values "settlements.ifsc_code" / "settlements.beneficiary_name" /
// "settlements.account_number", all sharing one resolution_url) become one call.
async function resolveClarificationFields({ account, updates }) {
  const groups = { settlements: [], kyc: [], account: [], local: [] };

  for (const update of updates) {
    // bankName is never sent to Razorpay (it's not part of any Route
    // object) — it's purely our own label for the account, so it's just a
    // local field update, no API call.
    if (update.fieldReference === "bankName") {
      groups.local.push(update);
      continue;
    }

    const [scope] = String(update.fieldReference).split(".");
    if (scope === "settlements") groups.settlements.push(update);
    else if (scope === "kyc") groups.kyc.push(update);
    else groups.account.push(update);
  }

  for (const { value } of groups.local) {
    account.bankName = String(value).trim();
  }

  if (groups.settlements.length) {
    const settlements = {
      account_number: account.accountNumber,
      ifsc_code: account.ifscCode,
      beneficiary_name: account.accountHolderName,
    };

    for (const { fieldReference, value } of groups.settlements) {
      const key = fieldReference.slice("settlements.".length);
      settlements[key] = value;
      if (key === "ifsc_code") account.ifscCode = normalizeIfsc(value);
      if (key === "account_number") account.accountNumber = normalizeAccountNumber(value);
      if (key === "beneficiary_name") account.accountHolderName = String(value).trim();
    }

    await razorpayV2Request(
      "PATCH",
      `/accounts/${account.routeLinkedAccountId}/products/${account.routeProductId}`,
      { settlements, tnc_accepted: true }
    );
  }

  if (groups.kyc.length) {
    const stakeholder = await fetchRouteStakeholder(account.routeLinkedAccountId, account.routeStakeholderId);
    const kyc = { ...stakeholder.kyc };

    for (const { fieldReference, value } of groups.kyc) {
      const key = fieldReference.slice("kyc.".length);
      kyc[key] = value;
      if (key === "pan") account.panNumber = String(value).trim().toUpperCase();
    }

    await razorpayV2Request(
      "PATCH",
      `/accounts/${account.routeLinkedAccountId}/stakeholders/${account.routeStakeholderId}`,
      { name: stakeholder.name, email: stakeholder.email, kyc }
    );
  }

  if (groups.account.length) {
    // Anything outside "settlements"/"kyc" is an account-level field
    // (legal_business_name, phone, profile.addresses.registered.*, legal_info.pan/gst, ...).
    const currentAccount = await fetchRouteLinkedAccount(account.routeLinkedAccountId);
    const patchBody = {
      phone: currentAccount.phone,
      legal_business_name: currentAccount.legal_business_name,
      profile: currentAccount.profile,
      ...(currentAccount.legal_info ? { legal_info: currentAccount.legal_info } : {}),
    };

    for (const { fieldReference, value } of groups.account) {
      setDeep(patchBody, fieldReference, value);

      // Mirror onto our own doc so the "here's what you submitted" screen and
      // buildSubmittedDetails stay truthful after a fix, instead of still
      // showing the value Razorpay already rejected.
      if (fieldReference === "legal_business_name") account.legalBusinessName = String(value).trim();
      if (fieldReference === "customer_facing_business_name") account.customerFacingBusinessName = String(value).trim();
      if (fieldReference === "legal_info.pan") account.businessPan = String(value).trim().toUpperCase();
      if (fieldReference === "legal_info.gst") account.gstin = String(value).trim().toUpperCase();
      if (fieldReference === "phone") account.phone = String(value).trim();
    }

    await razorpayV2Request("PATCH", `/accounts/${account.routeLinkedAccountId}`, patchBody);
  }
}

// Mirrors the seller-facing copy the product asked us to standardize on.
// bankErrorCode is an optional bank-side reason code (e.g. "KC27" for a
// rejected settlement) that takes priority over the generic apiStatus
// message when present.
function getAccountErrorMessage(apiStatus, bankErrorCode = null) {
  if (bankErrorCode === "KC27") {
    return "Your bank account rejected this settlement. Please verify your IFSC/Account Number or contact your branch.";
  }

  switch (apiStatus) {
    case "created":
      return "Setup incomplete. Please finish submitting your banking profile.";
    case "under_review":
      return "Verification in progress. Settlements will resume once approved.";
    case "needs_clarification":
      return "Action required: Some documents were rejected. Please update your profile.";
    case "suspended":
      return "This account has been disabled. Please contact support.";
    case "rejected":
      return "Verification failed permanently. Please link a different business account.";
    case "activated":
      return "Account is healthy.";
    default:
      return "Something went wrong with your linked account setup. Please try again.";
  }
}

// Shows the seller back exactly what they submitted for their linked
// account, tagged with the requirement field_reference it corresponds to
// so the frontend can offer an edit box for each one. bankName's
// "fieldReference" ("bankName") never comes from Razorpay's own requirements
// array — it's a local-only sentinel resolveClarificationFields() special-cases
// to update just our DB, since Razorpay has no concept of it at all.
function buildSubmittedDetails(account) {
  const isOrganization = account.sellerType === "organization";

  const details = [
    { key: "accountHolderName", label: "Account holder name", value: account.accountHolderName, fieldReference: "settlements.beneficiary_name" },
    { key: "accountNumber", label: "Bank account number", value: account.accountNumber, fieldReference: "settlements.account_number" },
    { key: "ifscCode", label: "IFSC code", value: account.ifscCode, fieldReference: "settlements.ifsc_code" },
    { key: "bankName", label: "Bank name", value: account.bankName, fieldReference: "bankName" },
    {
      key: "panNumber",
      label: isOrganization ? "Authorised signatory PAN" : "PAN number",
      value: account.panNumber,
      fieldReference: "kyc.pan",
    },
    { key: "phone", label: "Phone number", value: account.phone, fieldReference: "phone" },
    // Both halves are listed separately because Razorpay flags them
    // separately — its requirements array names "profile.category" or
    // "profile.subcategory", never the pair. resolveClarificationFields
    // already routes dotted paths under "profile." into the account-level
    // PATCH via setDeep, so no special-casing is needed for them here.
    { key: "businessCategory", label: "Business category", value: account.businessCategory, fieldReference: "profile.category" },
    { key: "businessSubcategory", label: "Business sub-category", value: account.businessSubcategory, fieldReference: "profile.subcategory" },
  ];

  // Organization-only rows. The field_reference values here are the same ones
  // Razorpay reports back in its own `requirements` array, so
  // resolveClarificationFields routes them to the account-level PATCH without
  // needing any special-casing.
  if (isOrganization) {
    details.push(
      { key: "legalBusinessName", label: "Registered business name", value: account.legalBusinessName, fieldReference: "legal_business_name" },
      { key: "customerFacingBusinessName", label: "Business display name", value: account.customerFacingBusinessName, fieldReference: "customer_facing_business_name" },
      { key: "businessPan", label: "Business PAN", value: account.businessPan, fieldReference: "legal_info.pan" },
      { key: "gstin", label: "GSTIN", value: account.gstin, fieldReference: "legal_info.gst" }
    );
  }

  return details;
}

function maskAccountNumber(accountNumber = "") {
  const raw = String(accountNumber);
  if (raw.length <= 4) return raw;
  return `XXXX${raw.slice(-4)}`;
}

function maskUpiId(upiId = "") {
  const raw = String(upiId);
  const atIndex = raw.indexOf("@");
  if (atIndex <= 1) return raw;
  const handle = raw.slice(0, atIndex);
  const domain = raw.slice(atIndex);
  const visible = handle.slice(0, 2);
  return `${visible}${"*".repeat(Math.max(handle.length - 2, 1))}${domain}`;
}

function toSafeAccount(account) {
  const obj = account.toObject ? account.toObject() : account;
  return {
    ...obj,
    maskedAccountNumber: obj.payoutMethod === "upi" ? null : maskAccountNumber(obj.accountNumber),
    maskedUpiId: obj.payoutMethod === "upi" ? maskUpiId(obj.upiId) : null,
  };
}

function normalizeIfsc(ifsc = "") {
  return String(ifsc).trim().toUpperCase();
}

function normalizeAccountNumber(accountNumber = "") {
  return String(accountNumber).trim();
}

async function createOrGetRazorpayContact(user) {
  if (user.razorpayContactId) {
    return user.razorpayContactId;
  }

  const contact = await razorpayRequest("/contacts", {
    name: user.name || user.email || "Tokun User",
    email: user.email,
    type: "vendor",
    reference_id: `tokun_user_${user._id}`,
    notes: {
      userId: String(user._id),
      source: "tokun_wallet_bank_account",
    },
  });

  user.razorpayContactId = contact.id;
  await user.save();

  return contact.id;
}

async function createRazorpayFundAccount({ contactId, accountHolderName, accountNumber, ifscCode }) {
  const fundAccount = await razorpayRequest("/fund_accounts", {
    contact_id: contactId,
    account_type: "bank_account",
    bank_account: {
      name: accountHolderName,
      ifsc: ifscCode,
      account_number: accountNumber,
    },
  });

  return fundAccount;
}

async function createRazorpayVpaFundAccount({ contactId, upiId }) {
  const fundAccount = await razorpayRequest("/fund_accounts", {
    contact_id: contactId,
    account_type: "vpa",
    vpa: {
      address: upiId,
    },
  });

  return fundAccount;
}

async function syncUserDefaultFundAccount(userId) {
  const defaultAccount = await BankAccount.findOne({
    userId,
    default: true,
    razorpayFundAccountId: { $ne: null },
  }).sort({ createdAt: -1 });

  if (defaultAccount) {
    await User.findByIdAndUpdate(userId, {
      $set: {
        razorpayContactId: defaultAccount.razorpayContactId,
        razorpayFundAccountId: defaultAccount.razorpayFundAccountId,
      },
    });

    return defaultAccount;
  }

  await User.findByIdAndUpdate(userId, {
    $set: {
      razorpayFundAccountId: null,
    },
  });

  return null;
}

// -----------------------------
// Add new bank account
// POST /api/bankaccount/add
// -----------------------------
router.post("/add", requireAuth, async (req, res) => {
  try {
    console.log("Add Bank Account — request body:", JSON.stringify(req.body, null, 2));

    const {
      payoutMethod,
      accountHolderName,
      accountNumber,
      confirmAccountNumber,
      ifscCode,
      bankName,
      upiId,
      panNumber,
      phone,
      addresses,

      // What this seller sells, in Razorpay's own vocabulary. Asked of both
      // seller types — every Linked Account carries its own category, and it
      // is the seller's business being described, not ours.
      businessCategory,
      businessSubcategory,

      // ── Organization-only fields ──────────────────────────────────────
      // Only read when the LOGGED-IN USER is an ORG account. There is
      // deliberately no sellerType field in the body: the seller's own
      // User.userType decides which KYC track they go down, so a client
      // can't put an individual through organization onboarding (or the
      // reverse) by sending a different value.
      businessType, // Razorpay business_type, e.g. "private_limited"
      legalBusinessName, // exact registered name on the COI/GST certificate
      customerFacingBusinessName, // brand name shown to buyers (optional)
      businessPan, // the ENTITY's PAN → legal_info.pan
      gstin, // optional → legal_info.gst
      stakeholderName, // authorised signatory / director (the person, not the entity)
      percentageOwnership, // that signatory's shareholding, optional

      testEmail, // optional — Razorpay requires a unique email per Linked Account, so
      // re-testing under the same logged-in user needs a fresh one each time.
      // Defaults to the user's real email if not passed.
      default: makeDefault,
    } = req.body;

    const method = payoutMethod === "upi" ? "upi" : "bank";
    const cleanUpiId = String(upiId || "").trim();

    if (method === "upi") {
      // Route Linked Account settlement isn't supported for UPI-only
      // accounts (Razorpay Route settles to a bank account) — and Fund
      // Account, which used to handle UPI, has been removed from this route.
      return res.status(400).json({
        success: false,
        error: "upi_not_supported",
        message: "UPI payout isn't supported here yet — use a bank account.",
      });
    }

    if (
      !accountHolderName ||
      !accountNumber ||
      !confirmAccountNumber ||
      !ifscCode ||
      !bankName
    ) {
      return res.status(400).json({
        success: false,
        error: "all_fields_required",
      });
    }

    const cleanAccountNumber = method === "bank" ? normalizeAccountNumber(accountNumber) : undefined;
    const cleanConfirmAccountNumber = method === "bank" ? normalizeAccountNumber(confirmAccountNumber) : undefined;
    const cleanIfscCode = method === "bank" ? normalizeIfsc(ifscCode) : undefined;

    if (method === "bank" && cleanAccountNumber !== cleanConfirmAccountNumber) {
      return res.status(400).json({
        success: false,
        error: "account_numbers_mismatch",
      });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(401).json({
        success: false,
        error: "user_not_found",
      });
    }

    const existingAccount = await BankAccount.findOne(
      method === "upi"
        ? { userId: user._id, payoutMethod: "upi", upiId: cleanUpiId }
        : { userId: user._id, payoutMethod: { $ne: "upi" }, accountNumber: cleanAccountNumber }
    );

    // Suspended/rejected accounts can't be fixed via clarification — Razorpay
    // requires a fresh Route linked account. Let this resubmit in place
    // (same BankAccount doc, brand-new Route account/stakeholder/product)
    // instead of blocking as a duplicate.
    // Legacy dry-run records count as resubmittable for the same reason
    // payout-status treats them as unset: they hold ids Razorpay never issued,
    // so blocking a real submission as a "duplicate" of one would strand the
    // seller against an account that does not exist anywhere but our own
    // database. The resubmission path overwrites this doc in place with real ids.
    const isResubmission =
      Boolean(existingAccount) &&
      (existingAccount.routeDryRun ||
        RESUBMISSION_REQUIRED_STATUSES.includes(existingAccount.activationStatus));

    if (existingAccount && !isResubmission) {
      return res.status(400).json({
        success: false,
        error: "account_already_exists",
      });
    }

    const existingAccountsCount = await BankAccount.countDocuments({
      userId: user._id,
    });

    let isDefault = false;

    if (existingAccountsCount === 0) {
      isDefault = true;
    } else if (makeDefault) {
      await BankAccount.updateMany(
        { userId: user._id },
        { $set: { default: false } }
      );
      isDefault = true;
    }

    // ── Route (Linked Account) — the only payout mechanism on this route now. ──
    // Which Razorpay KYC track this seller goes down. Derived from the
    // account they're already logged in as — an ORG workspace is a registered
    // entity by definition — not from anything the form sends, so the two can
    // never disagree. "TM" (team member) accounts sit under an org but sell as
    // themselves, so they stay on the individual track.
    const isOrganization = user.userType === "ORG";
    const cleanPan = String(panNumber || "").trim().toUpperCase();
    const cleanPhone = String(phone || "").trim();

    // The business_type is what selects the KYC row, so it has to be resolved
    // before any of the PAN/GST checks below rather than inside the
    // organization-only block further down. Individuals never send one —
    // buildRouteAccountPayload hardcodes "individual" for them — so their row
    // is looked up under that same name.
    const cleanBusinessType = String(businessType || "").trim().toLowerCase();

    if (isOrganization && !ORG_BUSINESS_TYPES.includes(cleanBusinessType)) {
      return res.status(400).json({
        success: false,
        error: "invalid_or_missing_business_type",
        message: `Select a business type — one of: ${ORG_BUSINESS_TYPES.join(", ")}.`,
      });
    }

    // Razorpay's own per-business-type KYC matrix. Everything below asks this
    // rather than branching on isOrganization, because the requirements do not
    // split cleanly along that line: a proprietorship is an "organization"
    // here but Razorpay treats most of its entity fields as optional.
    const kycRules = getKycRequirements(isOrganization ? cleanBusinessType : "individual");

    // 4th letter of a PAN encodes holder type — P/C/H/F/A/T/B/J/G/L for
    // individual/company/HUF/firm/AOP/trust/BOI/artificial-judicial-person/
    // govt/local-authority respectively. This is the Stakeholder's own PAN
    // (createRouteStakeholder's kyc.pan below) — not sent at account-creation
    // time anymore. Accepting all holder types (not just "P") so Razorpay's
    // documented dummy test PANs (e.g. AVOJB1111K) pass local validation.
    //
    // Only demanded where the matrix says "Yes" — for a registered entity it
    // says "No", since Razorpay verifies the entity rather than the person
    // signing for it. A malformed PAN is still rejected whenever one is
    // supplied: optional means "may be omitted", not "may be wrong".
    if (isRequired(kycRules.signatoryPan) && !cleanPan) {
      return res.status(400).json({
        success: false,
        error: "invalid_or_missing_pan",
        message: "PAN is required — e.g. ABCPE1234F.",
      });
    }

    if (cleanPan && !PAN_REGEX.test(cleanPan)) {
      return res.status(400).json({
        success: false,
        error: "invalid_or_missing_pan",
        message: isOrganization
          ? "Invalid signatory PAN format — e.g. ABCPE1234F."
          : "Invalid PAN format — e.g. ABCPE1234F.",
      });
    }

    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      return res.status(400).json({
        success: false,
        error: "invalid_or_missing_phone",
        message: "10-digit phone number required (Route needs this — User model has no phone field yet).",
      });
    }

    // street2 is the only optional address field — everything else here is
    // mandatory for Route (street1, city, state, postal_code, country).
    // Razorpay hard-requires this — confirmed by testing account creation
    // without it ("The addresses field is required"). It also needs to
    // actually match the seller's real bank's state/region, or Razorpay's
    // KYC flags a mismatch (e.g. sending a fixed Bengaluru address for a
    // Bihar bank account got rejected as "signatory details incorrect") —
    // hence collecting it from the seller again instead of a fixed default.
    const registeredAddr = addresses?.registered;
    if (
      !registeredAddr?.street1 ||
      !registeredAddr?.city ||
      !registeredAddr?.state ||
      !registeredAddr?.postal_code ||
      !registeredAddr?.country
    ) {
      return res.status(400).json({
        success: false,
        error: "invalid_or_missing_address",
        message: "street1, city, state, postal_code, and country are required (street2 is optional).",
      });
    }

    // Validated as a pair, since a subcategory is only valid inside its own
    // category — checking them separately would let "ecommerce"/"saas" through
    // for Razorpay to reject days later. The client renders the same enum as a
    // pair of dependent dropdowns, so a bad pair arriving here means a stale
    // page or a hand-rolled request; either way it stops at this boundary.
    const cleanBusinessCategory = String(businessCategory || "").trim().toLowerCase();
    const cleanBusinessSubcategory = String(businessSubcategory || "").trim().toLowerCase();

    if (!isValidCategoryPair(cleanBusinessCategory, cleanBusinessSubcategory)) {
      return res.status(400).json({
        success: false,
        error: "invalid_or_missing_business_category",
        message: BUSINESS_CATEGORIES[cleanBusinessCategory]
          ? `"${cleanBusinessSubcategory}" isn't a sub-category of "${cleanBusinessCategory}". Pick one from that category's list.`
          : "Select the business category and sub-category that describe what you sell.",
      });
    }

    // ── Organization-only validation ──────────────────────────────────────
    // Everything above this point applies to both seller types. Below is only
    // reachable when the seller picked "Registered organization" on the form.
    const cleanLegalBusinessName = String(
      isOrganization ? legalBusinessName || "" : accountHolderName
    ).trim();
    const cleanCustomerFacingName =
      String(customerFacingBusinessName || "").trim() || cleanLegalBusinessName;
    const cleanBusinessPan = String(businessPan || "").trim().toUpperCase();
    const cleanGstin = String(gstin || "").trim().toUpperCase();
    const cleanStakeholderName = String(
      isOrganization ? stakeholderName || "" : accountHolderName
    ).trim();
    const parsedOwnership =
      percentageOwnership === "" || percentageOwnership == null
        ? null
        : Number(percentageOwnership);

    if (isOrganization) {
      // business_type itself was validated earlier — kycRules depends on it.

      if (!cleanLegalBusinessName) {
        return res.status(400).json({
          success: false,
          error: "missing_legal_business_name",
          message:
            "Registered business name is required — it must match your incorporation/GST certificate exactly.",
        });
      }

      if (!cleanStakeholderName) {
        return res.status(400).json({
          success: false,
          error: "missing_stakeholder_name",
          message: "Authorised signatory name is required.",
        });
      }

      // Demanded only where the matrix says "Yes". For a proprietorship it
      // says "Optional" — Razorpay accepts the account without one, since a
      // proprietorship has no PAN of its own apart from the proprietor's.
      if (isRequired(kycRules.businessPan) && !cleanBusinessPan) {
        return res.status(400).json({
          success: false,
          error: "invalid_or_missing_business_pan",
          message: `Business PAN is required for a ${ORG_BUSINESS_TYPE_LABELS[cleanBusinessType] || "registered entity"} — e.g. AAACA1234A.`,
        });
      }

      if (cleanBusinessPan && !PAN_REGEX.test(cleanBusinessPan)) {
        return res.status(400).json({
          success: false,
          error: "invalid_or_missing_business_pan",
          message: "Invalid business PAN format — e.g. AAACA1234A.",
        });
      }

      // A PAN whose holder-type letter contradicts the declared business type
      // is guaranteed to fail Razorpay's KYC — reject it now with a message
      // that says which one to fix, instead of days later as a vague
      // "needs_clarification".
      const allowedLetters = ORG_BUSINESS_TYPE_PAN_LETTERS[cleanBusinessType];
      if (cleanBusinessPan && allowedLetters && !allowedLetters.includes(cleanBusinessPan[3])) {
        return res.status(400).json({
          success: false,
          error: "business_pan_type_mismatch",
          message: `This PAN doesn't look like a ${ORG_BUSINESS_TYPE_LABELS[cleanBusinessType]} PAN — its 4th character should be ${allowedLetters.join(
            " or "
          )}, but it is "${cleanBusinessPan[3]}". Check the business type or the PAN.`,
        });
      }

      // The matrix marks GST "Yes" for all eight registered entity types —
      // mandatory, not the nicety this route previously treated it as. Only a
      // proprietorship gets "Optional". Enforcing it here turns what would be
      // a days-later needs_clarification into an immediate, specific error.
      if (isRequired(kycRules.gst) && !cleanGstin) {
        return res.status(400).json({
          success: false,
          error: "missing_gstin",
          message: `GSTIN is required for a ${ORG_BUSINESS_TYPE_LABELS[cleanBusinessType] || "registered entity"} — e.g. 27AAACA1234A1Z5.`,
        });
      }

      // When given it must be well-formed AND embed the same PAN — characters
      // 3-12 of every GSTIN are literally the entity's PAN, so a mismatch
      // means one of the two fields is wrong.
      if (cleanGstin) {
        if (!GSTIN_REGEX.test(cleanGstin)) {
          return res.status(400).json({
            success: false,
            error: "invalid_gstin",
            message: "Invalid GSTIN format — e.g. 27AAACA1234A1Z5.",
          });
        }

        // Only comparable when a business PAN was actually supplied — a
        // proprietorship may legitimately send a GSTIN and no PAN, and
        // comparing against "" would reject every such account.
        if (cleanBusinessPan && cleanGstin.slice(2, 12) !== cleanBusinessPan) {
          return res.status(400).json({
            success: false,
            error: "gstin_pan_mismatch",
            message:
              "The PAN embedded in this GSTIN doesn't match the business PAN you entered. Both must belong to the same entity.",
          });
        }
      }

      if (parsedOwnership !== null && (!Number.isFinite(parsedOwnership) || parsedOwnership <= 0 || parsedOwnership > 100)) {
        return res.status(400).json({
          success: false,
          error: "invalid_percentage_ownership",
          message: "Ownership percentage must be between 1 and 100.",
        });
      }

      // Not a hard block: Razorpay verifies the settlement account by penny
      // testing against the beneficiary name, and for a registered entity that
      // name has to be the entity's — but "M/s <name>" and proprietorship
      // accounts in the proprietor's name are legitimate variations we can't
      // adjudicate here. Log it so a later settlement failure is traceable.
      const normalize = (s) => String(s).toLowerCase().replace(/[^a-z0-9]/g, "");
      if (normalize(accountHolderName) !== normalize(cleanLegalBusinessName)) {
        console.warn(
          `[ORG ROUTE] Beneficiary name "${String(accountHolderName).trim()}" differs from legal business name "${cleanLegalBusinessName}" — Razorpay penny-testing may flag this settlement account.`
        );
      }
    }

    let routeAccount;
    let routeProductConfig;
    let routeStakeholder;
    const routeEmail = String(testEmail || user.email).trim();

    const accountPayload = buildRouteAccountPayload({
      sellerType: isOrganization ? "organization" : "individual",
      email: routeEmail,
      phone: cleanPhone,
      legalBusinessName: cleanLegalBusinessName,
      customerFacingBusinessName: isOrganization ? cleanCustomerFacingName : null,
      businessType: cleanBusinessType,
      businessPan: cleanBusinessPan,
      gstin: cleanGstin,
      registeredAddress: addresses.registered,
      businessCategory: cleanBusinessCategory,
      businessSubcategory: cleanBusinessSubcategory,
    });

    // Stakeholder's residential address uses a single "street" field,
    // unlike the account's registered address which splits street1/street2
    // — reuse the same address the seller gave, mapped to that shape.
    const stakeholderPayload = buildRouteStakeholderPayload({
      sellerType: isOrganization ? "organization" : "individual",
      name: cleanStakeholderName,
      email: routeEmail,
      panNumber: cleanPan,
      phone: cleanPhone,
      percentageOwnership: parsedOwnership ?? undefined,
      residentialAddress: {
        street: [addresses.registered.street1, addresses.registered.street2].filter(Boolean).join(", "),
        city: addresses.registered.city,
        state: addresses.registered.state,
        postal_code: addresses.registered.postal_code,
        country: addresses.registered.country,
      },
    });

    const settlementsPayload = {
      account_number: cleanAccountNumber,
      ifsc_code: cleanIfscCode,
      beneficiary_name: String(accountHolderName).trim(),
    };

    try {
      if (isOrganization) {
        console.log(
          `[ORG ROUTE] Organization payout form submitted — user=${user._id} entity="${cleanLegalBusinessName}" business_type=${cleanBusinessType} gst=${cleanGstin || "none"}`
        );
      }

      // Both seller types run the same four-call sequence — the only
      // difference is the payloads built above.
      const result = await runRouteOnboarding({
        accountPayload,
        stakeholderPayload,
        settlements: settlementsPayload,
      });

      routeAccount = result.account;
      routeStakeholder = result.stakeholder;
      routeProductConfig = result.productConfig;
    } catch (routeErr) {
      // Razorpay's raw payload is logged, never returned: it carries its own
      // step/source/metadata describing OUR integration, which is noise to the
      // seller at best. What goes back is the rewritten sentence plus the name
      // of the form field to point at.
      console.error(
        "Route linked-account create failed:",
        routeErr?.message,
        JSON.stringify(routeErr?.razorpay || null)
      );

      const translated = translateRazorpayError(routeErr?.razorpay);

      return res.status(translated.sellerFacing ? 400 : 502).json({
        success: false,
        error: "route_linked_account_failed",
        message: translated.message,
        // Names an input on the seller's own form when Razorpay identified
        // one, so the client can highlight it instead of showing a banner the
        // seller has to map back to a field themselves.
        field: translated.field,
      });
    }

    const routeFields = {
      accountHolderName: String(accountHolderName).trim(),
      accountNumber: cleanAccountNumber,
      ifscCode: cleanIfscCode,
      bankName: String(bankName).trim(),
      // Blank-to-null for the fields the KYC matrix now lets through empty, so
      // "not supplied" reads the same here as it does for a seller type that
      // was never asked — buildSubmittedDetails and the clarification screen
      // both treat null as "nothing to show" and "" as an empty answer.
      panNumber: cleanPan || null,
      phone: cleanPhone,
      sellerType: isOrganization ? "organization" : "individual",
      businessType: isOrganization ? cleanBusinessType : null,
      legalBusinessName: cleanLegalBusinessName,
      customerFacingBusinessName: isOrganization ? cleanCustomerFacingName : null,
      businessPan: isOrganization && cleanBusinessPan ? cleanBusinessPan : null,
      gstin: isOrganization && cleanGstin ? cleanGstin : null,
      stakeholderName: cleanStakeholderName,
      businessCategory: cleanBusinessCategory,
      businessSubcategory: cleanBusinessSubcategory,
      // Always false now that onboarding is live. Written explicitly rather
      // than left to the schema default because a resubmission overwrites an
      // existing doc in place — this is what clears the flag on the records
      // left behind by the old dry-run switch.
      routeDryRun: false,
      routeLinkedAccountId: routeAccount.id,
      routeStakeholderId: routeStakeholder.id,
      routeProductId: routeProductConfig.id,
      routeStatus: "CREATED",
      routeError: null,
      activationStatus: "UNDER_REVIEW",
    };

    let bankAccount;

    if (isResubmission) {
      Object.assign(existingAccount, routeFields);
      bankAccount = await existingAccount.save();
    } else {
      bankAccount = await BankAccount.create({
        userId: user._id,
        payoutMethod: method,
        default: isDefault,
        ...routeFields,
      });
    }

    return res.json({
      success: true,
      bankAccount: toSafeAccount(bankAccount),
    });
  } catch (err) {
    console.error("Add Bank Account:", err);

    return res.status(500).json({
      success: false,
      error: "server_error",
      message: err?.message || "Failed to add bank account",
    });
  }
});

// -----------------------------
// Razorpay's category enum, served rather than duplicated in the client: it is
// ~340 strings that have to match Razorpay exactly, and a frontend copy left
// to drift would build pairs that only fail once they reach Razorpay. Static
// data — the same response for every seller.
// GET /api/bankaccount/business-categories
// -----------------------------
// The KYC matrix rides along on the same request: the form needs both before
// it can render a single field correctly, and they change on the same
// cadence — whenever Razorpay's integration guide does.
router.get("/business-categories", requireAuth, (_req, res) => {
  return res.json({
    success: true,
    categories: BUSINESS_CATEGORIES,
    kycRequirements: KYC_REQUIREMENTS,
  });
});

// -----------------------------
// Get all bank accounts of user
// GET /api/bankaccount
// -----------------------------
router.get("/", requireAuth, async (req, res) => {
  try {
    const accounts = await BankAccount.find({ userId: req.user._id }).sort({
      default: -1,
      createdAt: -1,
    });

    const safeAccounts = accounts.map(toSafeAccount);

    return res.json({
      success: true,
      accounts: safeAccounts,
    });
  } catch (err) {
    console.error("Get Bank Accounts:", err);

    return res.status(500).json({
      success: false,
      error: "server_error",
    });
  }
});

// -----------------------------
// Get default account
// GET /api/bankaccount/default
// -----------------------------
router.get("/default", requireAuth, async (req, res) => {
  try {
    const defaultAccount = await BankAccount.findOne({
      userId: req.user._id,
      default: true,
    });

    return res.json({
      success: true,
      defaultAccount: defaultAccount ? toSafeAccount(defaultAccount) : null,
    });
  } catch (err) {
    console.error("Get Default Account:", err);

    return res.status(500).json({
      success: false,
      error: "server_error",
    });
  }
});

// Razorpay's product-configuration activation_status string → our enum.
// Mirrors ACCOUNT_EVENT_TO_STATUS in razorpayWebhook.js — kept here too since
// webhooks aren't reachable in local/test setups, so this is the fallback
// path that keeps activationStatus in sync when the seller checks their
// dashboard instead of waiting on a webhook that may never arrive.
const PRODUCT_ACTIVATION_STATUS_MAP = {
  created: "CREATED",
  under_review: "UNDER_REVIEW",
  needs_clarification: "NEEDS_CLARIFICATION",
  suspended: "SUSPENDED",
  rejected: "REJECTED",
  activated: "ACTIVATED",
};

// Statuses where Razorpay won't accept a clarification fix on the existing
// linked account — the seller has to resubmit the whole form (POST /add runs
// a fresh Route creation flow against the same BankAccount doc; see below).
const RESUBMISSION_REQUIRED_STATUSES = ["SUSPENDED", "REJECTED"];

// -----------------------------
// Seller-facing payout setup check — drives the "please set up your payout
// account" banner on the seller's own dashboard.
// GET /api/bankaccount/payout-status
// -----------------------------
router.get("/payout-status", requireAuth, async (req, res) => {
  try {
    // A Team Member is neither a buyer nor a seller: their org purchases on
    // their behalf and lists on its own account. Answering here — rather than
    // letting each screen decide — means every caller agrees, and a TM is never
    // shown the "set up your payout account" banner or the onboarding form for
    // an account they can't use. hasPayoutSetup is reported true so nothing
    // downstream treats them as a seller with setup pending.
    if (req.user.userType === "TM") {
      return res.json({
        success: true,
        canSell: false,
        sellerType: "team_member",
        hasPayoutSetup: true,
        reason: "team_member",
        message:
          "Your organization handles selling and payouts. Team members don't need a payout account.",
        activationStatus: null,
        requirements: [],
        requiresResubmission: false,
        submittedDetails: [],
      });
    }

    const account = await BankAccount.findOne({
      userId: req.user._id,
      routeStatus: "CREATED",
      routeLinkedAccountId: { $ne: null },
    }).sort({ default: -1, createdAt: -1 });

    let apiStatus = null; // raw Razorpay string, e.g. "needs_clarification"
    let requirements = [];

    // Dry-run records hold placeholder ids Razorpay has never seen — fetching
    // them would just 404 on every dashboard load. Skip straight to the cached
    // status so the seller-facing flow still behaves normally while the org
    // path is switched off.
    if (account?.routeProductId && !account.routeDryRun) {
      try {
        const productConfiguration = await fetchRouteProductConfiguration({
          accountId: account.routeLinkedAccountId,
          productId: account.routeProductId,
        });

        apiStatus = productConfiguration?.activation_status || null;
        requirements = productConfiguration?.requirements || [];

        const mappedStatus = PRODUCT_ACTIVATION_STATUS_MAP[apiStatus];

        if (mappedStatus && mappedStatus !== account.activationStatus) {
          account.activationStatus = mappedStatus;
          await account.save();
        }
      } catch (razorpayErr) {
        // Non-fatal — fall back to whatever's cached on the account already.
        console.error("Live activation status sync failed:", razorpayErr?.message);
      }
    }

    // Backfill for accounts created before `phone` was persisted locally —
    // it was always sent to Razorpay at creation time, just never saved on
    // our own doc. Pull it once from the live stakeholder and cache it.
    if (account && !account.phone && account.routeStakeholderId && !account.routeDryRun) {
      try {
        const stakeholder = await fetchRouteStakeholder(account.routeLinkedAccountId, account.routeStakeholderId);
        const livePhone = stakeholder?.phone?.primary;
        if (livePhone) {
          account.phone = String(livePhone);
          await account.save();
        }
      } catch (razorpayErr) {
        console.error("Phone backfill failed:", razorpayErr?.message);
      }
    }

    // Legacy dry-run records are local placeholders — Razorpay has never seen
    // them, so their "UNDER_REVIEW" is a fiction and nothing will ever move it
    // forward. Grouped with suspended/rejected because the remedy is the same
    // one: send the seller back through the full form. Without this they'd be
    // told payout is already set up and could never reach the form again.
    const requiresResubmission =
      Boolean(account?.routeDryRun) ||
      RESUBMISSION_REQUIRED_STATUSES.includes(account?.activationStatus);
    const bankErrorCode = requirements[0]?.reason_code || null;

    return res.json({
      success: true,
      // Every non-TM account type can sell; the TM branch returned above is the
      // only case that can't. Sent on both branches so callers can read one
      // field instead of re-deriving the rule from userType.
      canSell: true,
      // Suspended/rejected accounts can't be "fixed" via clarification —
      // treat them the same as no-payout-setup so the seller is routed back
      // through the full SellerLinkedAccountForm to resubmit everything.
      hasPayoutSetup: Boolean(account) && !requiresResubmission,
      accountId: account?._id || null,
      // What this seller WILL be onboarded as, derived from their account
      // type — the form uses it to decide whether to render the business
      // fields at all. Deliberately not a choice the seller makes.
      sellerType: req.user.userType === "ORG" ? "organization" : "individual",
      // What an already-submitted account WAS onboarded as. Differs from the
      // above only for accounts created before the seller's userType changed.
      submittedSellerType: account?.sellerType || null,
      dryRun: Boolean(account?.routeDryRun), // true = never sent to Razorpay
      activationStatus: account?.activationStatus || null, // CREATED | UNDER_REVIEW | NEEDS_CLARIFICATION | SUSPENDED | REJECTED | ACTIVATED | null
      message: account ? getAccountErrorMessage(apiStatus, bankErrorCode) : null,
      requirements, // only meaningful when activationStatus === "NEEDS_CLARIFICATION"
      requiresResubmission,
      submittedDetails: account ? buildSubmittedDetails(account) : [],
    });
  } catch (err) {
    console.error("Get payout status:", err);
    return res.status(500).json({ success: false, error: "server_error" });
  }
});

// -----------------------------
// Resolve flagged KYC/settlement fields from the `requirements` array
// Razorpay returns when activationStatus is NEEDS_CLARIFICATION. Accepts
// multiple fields at once — they're grouped by scope internally so e.g. 3
// flagged settlement fields go out as 1 Razorpay call, not 3.
// POST /api/bankaccount/:accountId/resolve-clarification
// Body: { updates: [{ fieldReference: "settlements.ifsc_code", value: "..." }, ...] }
// -----------------------------
router.post("/:accountId/resolve-clarification", requireAuth, async (req, res) => {
  try {
    const { accountId } = req.params;
    const { updates } = req.body;

    const cleanUpdates = Array.isArray(updates)
      ? updates
          .map((u) => ({ fieldReference: u?.fieldReference, value: String(u?.value ?? "").trim() }))
          .filter((u) => u.fieldReference && u.value)
      : [];

    if (!cleanUpdates.length) {
      return res.status(400).json({ success: false, error: "updates_required" });
    }

    const account = await BankAccount.findOne({ _id: accountId, userId: req.user._id });

    if (!account) {
      return res.status(404).json({ success: false, error: "account_not_found" });
    }

    if (!account.routeLinkedAccountId || !account.routeProductId) {
      return res.status(400).json({ success: false, error: "no_linked_account" });
    }

    // Legacy: onboarding is live for every seller type now, so nothing new can
    // be written with this flag set. What remains are records created while the
    // old org dry-run switch was on — their route* ids are locally-minted
    // placeholders Razorpay never issued, so there is nothing to PATCH. The
    // seller resubmits the form and the record is overwritten with real ids.
    if (account.routeDryRun) {
      return res.status(409).json({
        success: false,
        error: "dry_run_account",
        message:
          "This organization account was submitted before Route onboarding went live, so Razorpay has no record of it. Please resubmit the payout form before resolving clarifications.",
      });
    }

    // Razorpay rejects the ENTIRE PATCH with "Merchant details cannot be
    // updated" (input_validation_failed) if it includes even one field that
    // isn't currently in the account's own `requirements` array — you can
    // only resend what it actually asked for. bankName is the one exception
    // (it's local-only, never sent to Razorpay at all). So re-check against
    // a live requirements fetch (not whatever the client had cached) before
    // sending anything.
    let liveRequirements = [];
    try {
      const liveProductConfiguration = await fetchRouteProductConfiguration({
        accountId: account.routeLinkedAccountId,
        productId: account.routeProductId,
      });
      liveRequirements = liveProductConfiguration?.requirements || [];
    } catch (razorpayErr) {
      console.error("Pre-submit requirements fetch failed:", razorpayErr?.message);
    }

    const allowedRefs = new Set(["bankName", ...liveRequirements.map((r) => r.field_reference)]);
    const allowedUpdates = cleanUpdates.filter((u) => allowedRefs.has(u.fieldReference));
    const skippedFields = cleanUpdates.filter((u) => !allowedRefs.has(u.fieldReference)).map((u) => u.fieldReference);

    if (!allowedUpdates.length) {
      return res.status(400).json({
        success: false,
        error: "no_flagged_fields",
        message: "None of these fields are currently flagged by Razorpay for clarification — only fields it actually lists as needing a fix can be resubmitted.",
        skippedFields,
      });
    }

    try {
      await resolveClarificationFields({ account, updates: allowedUpdates });
    } catch (razorpayErr) {
      console.error(
        "Resolve clarification failed:",
        razorpayErr?.message,
        JSON.stringify(razorpayErr?.razorpay || null)
      );

      // Same treatment as account creation — this is the second place a raw
      // Razorpay sentence used to reach the seller, and here it is worse: they
      // are already on a "fix these fields" screen, so an unactionable message
      // leaves them re-editing the same box with nothing to change.
      const translated = translateRazorpayError(razorpayErr?.razorpay);

      return res.status(translated.sellerFacing ? 400 : 502).json({
        success: false,
        error: "razorpay_update_failed",
        message: translated.message,
        field: translated.field,
      });
    }

    let apiStatus = null;
    let requirements = [];

    try {
      const productConfiguration = await fetchRouteProductConfiguration({
        accountId: account.routeLinkedAccountId,
        productId: account.routeProductId,
      });
      apiStatus = productConfiguration?.activation_status || null;
      requirements = productConfiguration?.requirements || [];

      const mappedStatus = PRODUCT_ACTIVATION_STATUS_MAP[apiStatus];
      if (mappedStatus) account.activationStatus = mappedStatus;
    } catch (razorpayErr) {
      console.error("Refresh after clarification failed:", razorpayErr?.message);
    }

    await account.save();

    return res.json({
      success: true,
      activationStatus: account.activationStatus,
      message: getAccountErrorMessage(apiStatus, requirements[0]?.reason_code || null),
      requirements,
      submittedDetails: buildSubmittedDetails(account),
      // Fields the seller edited but weren't actually flagged by Razorpay —
      // held back rather than sent, since including them would have gotten
      // the whole request rejected.
      skippedFields,
    });
  } catch (err) {
    console.error("Resolve clarification error:", err);
    return res.status(500).json({ success: false, error: "server_error" });
  }
});

// -----------------------------
// Get Route Linked Account status (test) — fetches live status from Razorpay,
// not just what's cached on the BankAccount doc.
// GET /api/bankaccount/:accountId/route-status
// -----------------------------
router.get("/:accountId/route-status", requireAuth, async (req, res) => {
  try {
    const { accountId } = req.params;

    const account = await BankAccount.findOne({
      _id: accountId,
      userId: req.user._id,
    });

    if (!account) {
      return res.status(404).json({
        success: false,
        error: "account_not_found",
      });
    }

    if (!account.routeLinkedAccountId) {
      return res.status(400).json({
        success: false,
        error: "no_linked_account",
        message: "This bank account has no Route Linked Account yet.",
        routeStatus: account.routeStatus,
        routeError: account.routeError,
      });
    }

    // Legacy: nothing to fetch — the ids on this record were minted locally
    // before Route onboarding went live. Report that plainly rather than
    // surfacing a Razorpay 404 as if the account had gone missing.
    if (account.routeDryRun) {
      return res.json({
        success: true,
        dryRun: true,
        message:
          "This record predates the live Route integration, so no Razorpay Linked Account exists for it. Resubmit the payout form to create one.",
        linkedAccount: null,
        productConfiguration: null,
        productFetchError: null,
      });
    }

    let linkedAccount;
    try {
      linkedAccount = await fetchRouteLinkedAccount(account.routeLinkedAccountId);
    } catch (razorpayErr) {
      console.error("Fetch Route linked account failed:", razorpayErr, razorpayErr?.razorpay);
      return res.status(502).json({
        success: false,
        error: "razorpay_fetch_failed",
        message: razorpayErr?.message || "Could not fetch Linked Account from Razorpay.",
        details: razorpayErr?.razorpay || null,
      });
    }

    // The account's own `status` (created/activated) stays generic — the
    // Product Configuration's `activation_status` + `requirements` array is
    // what actually says what's blocking Route from activating.
    let productConfiguration = null;
    let productFetchError = null;
    if (account.routeProductId) {
      try {
        productConfiguration = await fetchRouteProductConfiguration({
          accountId: account.routeLinkedAccountId,
          productId: account.routeProductId,
        });
      } catch (razorpayErr) {
        console.error("Fetch Route product configuration failed:", razorpayErr, razorpayErr?.razorpay);
        productFetchError = razorpayErr?.message || "Could not fetch product configuration.";
      }
    }

    return res.json({
      success: true,
      linkedAccount,
      productConfiguration,
      productFetchError,
    });
  } catch (err) {
    console.error("Get Route linked account status:", err);

    return res.status(500).json({
      success: false,
      error: "server_error",
    });
  }
});

// -----------------------------
// Repair default bank account
// Use this for old bank accounts that were saved before Razorpay fund account logic.
// POST /api/bankaccount/repair-default
// -----------------------------
router.post("/repair-default", requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(401).json({
        success: false,
        error: "user_not_found",
      });
    }

    const defaultAccount = await BankAccount.findOne({
      userId: user._id,
      default: true,
    });

    if (!defaultAccount) {
      return res.status(404).json({
        success: false,
        error: "default_account_not_found",
      });
    }

    if (defaultAccount.razorpayFundAccountId) {
      await syncUserDefaultFundAccount(user._id);

      return res.json({
        success: true,
        message: "Default bank account already linked",
        defaultAccount: toSafeAccount(defaultAccount),
      });
    }

    let contactId;
    let fundAccount;

    try {
      contactId = await createOrGetRazorpayContact(user);

      fundAccount =
        defaultAccount.payoutMethod === "upi"
          ? await createRazorpayVpaFundAccount({ contactId, upiId: defaultAccount.upiId })
          : await createRazorpayFundAccount({
              contactId,
              accountHolderName: defaultAccount.accountHolderName,
              accountNumber: defaultAccount.accountNumber,
              ifscCode: defaultAccount.ifscCode,
            });
    } catch (razorpayErr) {
      console.error("Repair fund account error:", razorpayErr);

      defaultAccount.razorpayFundAccountStatus = "FAILED";
      defaultAccount.razorpayError = razorpayErr?.message || "Razorpay failed";
      await defaultAccount.save();

      return res.status(502).json({
        success: false,
        error: "razorpay_fund_account_failed",
        message: razorpayErr?.message || "Unable to create Razorpay fund account",
        details: razorpayErr?.razorpay || null,
      });
    }

    defaultAccount.razorpayContactId = contactId;
    defaultAccount.razorpayFundAccountId = fundAccount.id;
    defaultAccount.razorpayFundAccountStatus = "CREATED";
    defaultAccount.razorpayError = null;
    await defaultAccount.save();

    await User.findByIdAndUpdate(user._id, {
      $set: {
        razorpayContactId: contactId,
        razorpayFundAccountId: fundAccount.id,
      },
    });

    return res.json({
      success: true,
      message: "Default bank account repaired and linked with Razorpay",
      defaultAccount: toSafeAccount(defaultAccount),
    });
  } catch (err) {
    console.error("Repair Default Account:", err);

    return res.status(500).json({
      success: false,
      error: "server_error",
      message: err?.message || "Failed to repair default bank account",
    });
  }
});

// -----------------------------
// Set a bank account as default
// POST /api/bankaccount/set-default/:accountId
// -----------------------------
router.post("/set-default/:accountId", requireAuth, async (req, res) => {
  try {
    const { accountId } = req.params;

    const account = await BankAccount.findOne({
      _id: accountId,
      userId: req.user._id,
    });

    if (!account) {
      return res.status(404).json({
        success: false,
        error: "account_not_found",
      });
    }

    if (!account.razorpayFundAccountId) {
      return res.status(400).json({
        success: false,
        error: "razorpay_fund_account_missing",
        message:
          "This bank account is saved but not linked with Razorpay. Please use repair-default or add bank again.",
      });
    }

    await BankAccount.updateMany(
      { userId: req.user._id },
      { $set: { default: false } }
    );

    account.default = true;
    await account.save();

    await User.findByIdAndUpdate(req.user._id, {
      $set: {
        razorpayContactId: account.razorpayContactId,
        razorpayFundAccountId: account.razorpayFundAccountId,
      },
    });

    return res.json({
      success: true,
      defaultAccount: toSafeAccount(account),
    });
  } catch (err) {
    console.error("Set Default Account:", err);

    return res.status(500).json({
      success: false,
      error: "server_error",
    });
  }
});

// -----------------------------
// Delete bank account
// DELETE /api/bankaccount/:accountId
// -----------------------------
router.delete("/:accountId", requireAuth, async (req, res) => {
  try {
    const { accountId } = req.params;

    const deleted = await BankAccount.findOneAndDelete({
      _id: accountId,
      userId: req.user._id,
    });

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: "account_not_found",
      });
    }

    let newDefaultAccount = null;

    if (deleted.default) {
      newDefaultAccount = await BankAccount.findOne({
        userId: req.user._id,
      }).sort({ createdAt: -1 });

      if (newDefaultAccount) {
        newDefaultAccount.default = true;
        await newDefaultAccount.save();

        await User.findByIdAndUpdate(req.user._id, {
          $set: {
            razorpayContactId: newDefaultAccount.razorpayContactId,
            razorpayFundAccountId: newDefaultAccount.razorpayFundAccountId,
          },
        });
      } else {
        await User.findByIdAndUpdate(req.user._id, {
          $set: {
            razorpayFundAccountId: null,
          },
        });
      }
    }

    return res.json({
      success: true,
      deletedAccountId: deleted._id,
      newDefaultAccount: newDefaultAccount ? toSafeAccount(newDefaultAccount) : null,
    });
  } catch (err) {
    console.error("Delete Bank Account:", err);

    return res.status(500).json({
      success: false,
      error: "server_error",
    });
  }
});

module.exports = router;