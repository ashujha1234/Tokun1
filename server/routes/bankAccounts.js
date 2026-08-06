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

async function createRouteLinkedAccount({ email, phone, name, registeredAddress }) {
  // Only the mandatory fields — legal_info.pan/gst are for the account's own
  // COMPANY PAN (hence "company pan field is invalid for business_type:
  // individual" when we sent a personal PAN here). Personal PAN belongs on
  // the Stakeholder (createRouteStakeholder's kyc.pan), not here.
  return razorpayV2Request("POST", "/accounts", {
    email,
    phone,
    type: "route",
    legal_business_name: name,
    business_type: "individual",
    // TODO: "healthcare"/"clinic" is the pair confirmed working in Razorpay's
    // own docs example — used here only to unblock testing since "ecommerce"/
    // "marketplace" was rejected as invalid. Get the correct category for an
    // actual prompt/hire marketplace from Razorpay support before going live.
    profile: {
      category: "healthcare",
      subcategory: "clinic",
      addresses: { registered: registeredAddress },
    },
  });
}

async function createRouteStakeholder({ accountId, name, email, panNumber, phone, residentialAddress }) {
  return razorpayV2Request("POST", `/accounts/${accountId}/stakeholders`, {
    name,
    email,
    percentage_ownership: 100, // solo individual — owns 100% of their own earnings
    phone: { primary: phone, secondary: phone },
    addresses: { residential: residentialAddress },
    kyc: { pan: panNumber },
  });
}

// Step 3 (one call from the outside) — internally this is two Razorpay API
// calls, because Razorpay rejects settlements on the first one ("settlements
// is/are not required and should not be sent") and requires the second
// (PATCH) call against the product_id the first one returns. That's a
// Razorpay-side requirement, not something combinable into a single request.
async function configureRouteProductAndSettlement({ accountId, accountHolderName, accountNumber, ifscCode }) {
  const productConfig = await razorpayV2Request("POST", `/accounts/${accountId}/products`, {
    product_name: "route",
    tnc_accepted: true,
  });

  await razorpayV2Request("PATCH", `/accounts/${accountId}/products/${productConfig.id}`, {
    settlements: {
      account_number: accountNumber,
      ifsc_code: ifscCode,
      beneficiary_name: accountHolderName,
    },
    tnc_accepted: true,
  });

  return productConfig; // caller needs productConfig.id to check activation_status/requirements later
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
  return [
    { key: "accountHolderName", label: "Account holder name", value: account.accountHolderName, fieldReference: "settlements.beneficiary_name" },
    { key: "accountNumber", label: "Bank account number", value: account.accountNumber, fieldReference: "settlements.account_number" },
    { key: "ifscCode", label: "IFSC code", value: account.ifscCode, fieldReference: "settlements.ifsc_code" },
    { key: "bankName", label: "Bank name", value: account.bankName, fieldReference: "bankName" },
    { key: "panNumber", label: "PAN number", value: account.panNumber, fieldReference: "kyc.pan" },
    { key: "phone", label: "Phone number", value: account.phone, fieldReference: "phone" },
  ];
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
    const isResubmission = Boolean(existingAccount) && RESUBMISSION_REQUIRED_STATUSES.includes(existingAccount.activationStatus);

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
    const cleanPan = String(panNumber || "").trim().toUpperCase();
    const cleanPhone = String(phone || "").trim();

    // 4th letter of a PAN encodes holder type — P/C/H/F/A/T/B/J/G/L for
    // individual/company/HUF/firm/AOP/trust/BOI/artificial-judicial-person/
    // govt/local-authority respectively. This is the Stakeholder's own PAN
    // (createRouteStakeholder's kyc.pan below) — not sent at account-creation
    // time anymore. Accepting all holder types (not just "P") so Razorpay's
    // documented dummy test PANs (e.g. AVOJB1111K) pass local validation.
    if (!/^[A-Z]{3}[PCHFATBJGL][A-Z]\d{4}[A-Z]$/.test(cleanPan)) {
      return res.status(400).json({
        success: false,
        error: "invalid_or_missing_pan",
        message: "Invalid PAN format — e.g. ABCPE1234F.",
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

    let routeAccount;
    let routeProductConfig;
    let routeStakeholder;
    const routeEmail = String(testEmail || user.email).trim();

    try {
      routeAccount = await createRouteLinkedAccount({
        email: routeEmail,
        phone: cleanPhone,
        name: String(accountHolderName).trim(),
        registeredAddress: addresses.registered,
      });

      // Stakeholder's residential address uses a single "street" field,
      // unlike the account's registered address which splits street1/street2
      // — reuse the same address the seller gave, mapped to that shape.
      routeStakeholder = await createRouteStakeholder({
        accountId: routeAccount.id,
        name: String(accountHolderName).trim(),
        email: routeEmail,
        panNumber: cleanPan,
        phone: cleanPhone,
        residentialAddress: {
          street: [addresses.registered.street1, addresses.registered.street2].filter(Boolean).join(", "),
          city: addresses.registered.city,
          state: addresses.registered.state,
          postal_code: addresses.registered.postal_code,
          country: addresses.registered.country,
        },
      });

      // Step 3 — product configuration + settlement, one call from here.
      routeProductConfig = await configureRouteProductAndSettlement({
        accountId: routeAccount.id,
        accountHolderName: String(accountHolderName).trim(),
        accountNumber: cleanAccountNumber,
        ifscCode: cleanIfscCode,
      });
    } catch (routeErr) {
      console.error("Route linked-account create failed:", routeErr, routeErr?.razorpay);
      return res.status(502).json({
        success: false,
        error: "route_linked_account_failed",
        message: routeErr?.message || "Could not create Route Linked Account.",
        details: routeErr?.razorpay || null,
      });
    }

    const routeFields = {
      accountHolderName: String(accountHolderName).trim(),
      accountNumber: cleanAccountNumber,
      ifscCode: cleanIfscCode,
      bankName: String(bankName).trim(),
      panNumber: cleanPan,
      phone: cleanPhone,
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
    const account = await BankAccount.findOne({
      userId: req.user._id,
      routeStatus: "CREATED",
      routeLinkedAccountId: { $ne: null },
    }).sort({ default: -1, createdAt: -1 });

    let apiStatus = null; // raw Razorpay string, e.g. "needs_clarification"
    let requirements = [];

    if (account?.routeProductId) {
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
    if (account && !account.phone && account.routeStakeholderId) {
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

    const requiresResubmission = RESUBMISSION_REQUIRED_STATUSES.includes(account?.activationStatus);
    const bankErrorCode = requirements[0]?.reason_code || null;

    return res.json({
      success: true,
      // Suspended/rejected accounts can't be "fixed" via clarification —
      // treat them the same as no-payout-setup so the seller is routed back
      // through the full SellerLinkedAccountForm to resubmit everything.
      hasPayoutSetup: Boolean(account) && !requiresResubmission,
      accountId: account?._id || null,
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
      console.error("Resolve clarification failed:", razorpayErr, razorpayErr?.razorpay);
      return res.status(502).json({
        success: false,
        error: "razorpay_update_failed",
        message: razorpayErr?.message || "Could not update these fields with Razorpay.",
        details: razorpayErr?.razorpay || null,
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