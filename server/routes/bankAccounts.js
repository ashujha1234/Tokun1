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
    const {
      payoutMethod,
      accountHolderName,
      accountNumber,
      confirmAccountNumber,
      ifscCode,
      bankName,
      upiId,
      default: makeDefault,
    } = req.body;

    const method = payoutMethod === "upi" ? "upi" : "bank";
    const cleanUpiId = String(upiId || "").trim();

    if (method === "upi") {
      if (!accountHolderName || !cleanUpiId || !/^[\w.+-]{2,}@[a-zA-Z]{2,}$/.test(cleanUpiId)) {
        return res.status(400).json({
          success: false,
          error: "valid_upi_id_required",
        });
      }
    } else if (
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

    if (existingAccount) {
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

    let contactId;
    let fundAccount;

    try {
      contactId = await createOrGetRazorpayContact(user);

      fundAccount =
        method === "upi"
          ? await createRazorpayVpaFundAccount({ contactId, upiId: cleanUpiId })
          : await createRazorpayFundAccount({
              contactId,
              accountHolderName: String(accountHolderName).trim(),
              accountNumber: cleanAccountNumber,
              ifscCode: cleanIfscCode,
            });
    } catch (razorpayErr) {
      console.error("Razorpay fund account create error:", razorpayErr);

      return res.status(502).json({
        success: false,
        error: "razorpay_fund_account_failed",
        message:
          razorpayErr?.message ||
          `${method === "upi" ? "UPI ID" : "Bank account"} could not be linked with Razorpay.`,
        details: razorpayErr?.razorpay || null,
      });
    }

    const bankAccount = await BankAccount.create({
      userId: user._id,
      payoutMethod: method,
      accountHolderName: String(accountHolderName).trim(),
      ...(method === "bank"
        ? {
            accountNumber: cleanAccountNumber,
            ifscCode: cleanIfscCode,
            bankName: String(bankName).trim(),
          }
        : { upiId: cleanUpiId }),
      default: isDefault,
      razorpayContactId: contactId,
      razorpayFundAccountId: fundAccount.id,
      razorpayFundAccountStatus: "CREATED",
      razorpayError: null,
    });

    if (isDefault) {
      await User.findByIdAndUpdate(user._id, {
        $set: {
          razorpayContactId: contactId,
          razorpayFundAccountId: fundAccount.id,
        },
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