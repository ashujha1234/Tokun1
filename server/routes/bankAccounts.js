// routes/bankAccounts.js
const express = require("express");
const router = express.Router();
const BankAccount = require("../models/BankAccount");
const { requireAuth } = require("../utils/auth"); // your JWT middleware

// -----------------------------
// Add new bank account
// -----------------------------
router.post("/add", requireAuth, async (req, res) => {
  try {
    const { accountHolderName, accountNumber, confirmAccountNumber, ifscCode, bankName, default: makeDefault } = req.body;

    // Validate input
    if (!accountHolderName || !accountNumber || !confirmAccountNumber || !ifscCode || !bankName) {
      return res.status(400).json({ success: false, error: "all_fields_required" });
    }

    if (accountNumber !== confirmAccountNumber) {
      return res.status(400).json({ success: false, error: "account_numbers_mismatch" });
    }

    // Check if account already exists for this user
    const existingAccount = await BankAccount.findOne({ userId: req.user._id, accountNumber });
    if (existingAccount) {
      return res.status(400).json({ success: false, error: "account_already_exists" });
    }

    // Get all accounts of the user
    const existingAccounts = await BankAccount.find({ userId: req.user._id });

    let isDefault = false;

    if (existingAccounts.length === 0) {
      // First account is automatically default
      isDefault = true;
    } else if (makeDefault) {
      // If user wants this account as default, unset previous defaults
      await BankAccount.updateMany({ userId: req.user._id, default: true }, { default: false });
      isDefault = true;
    }

    // Create new bank account
    const bankAccount = await BankAccount.create({
      userId: req.user._id,
      accountHolderName,
      accountNumber,
      ifscCode,
      bankName,
      default: isDefault,
    });

    res.json({ success: true, bankAccount });
  } catch (err) {
    console.error("Add Bank Account:", err);
    res.status(500).json({ success: false, error: "server_error" });
  }
});


// -----------------------------
// Get all bank accounts of user
// -----------------------------
router.get("/", requireAuth, async (req, res) => {
  try {
    const accounts = await BankAccount.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, accounts });
  } catch (err) {
    console.error("Get Bank Accounts:", err);
    res.status(500).json({ success: false, error: "server_error" });
  }
});

// -----------------------------
// Get default account
// -----------------------------
router.get("/default", requireAuth, async (req, res) => {
  try {
    const defaultAccount = await BankAccount.findOne({ userId: req.user._id, default: true });
    res.json({ success: true, defaultAccount });
  } catch (err) {
    console.error("Get Default Account:", err);
    res.status(500).json({ success: false, error: "server_error" });
  }
});

// -----------------------------
// Set a bank account as default
// -----------------------------
router.post("/set-default/:accountId", requireAuth, async (req, res) => {
  try {
    const { accountId } = req.params;

    // Unset previous default
    await BankAccount.updateMany({ userId: req.user._id }, { default: false });

    // Set new default
    const updated = await BankAccount.findOneAndUpdate(
      { _id: accountId, userId: req.user._id },
      { default: true },
      { new: true }
    );

    if (!updated) return res.status(404).json({ success: false, error: "account_not_found" });

    res.json({ success: true, defaultAccount: updated });
  } catch (err) {
    console.error("Set Default Account:", err);
    res.status(500).json({ success: false, error: "server_error" });
  }
});

module.exports = router;
