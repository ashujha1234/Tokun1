const Razorpay = require("razorpay");

// Credentials come from the environment only — never hardcoded here. This file
// is tracked in git, so a literal key_secret would land in the repo history the
// moment it was committed.
//
// Safe to read at module load: index.js calls require("dotenv").config() as its
// very first statement, before any route (and therefore this file) is required.
//
// The same two variables also back getRazorpayAuthHeader() in
// routes/bankAccounts.js, so every Razorpay call in the app — v1 orders,
// v2 Route accounts, webhooks — now resolves to one account. Previously this
// module carried its own hardcoded copy, which happened to match .env but had
// nothing keeping it that way.
const { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET } = process.env;

if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
  // Fail at boot rather than letting every payment call die later with an
  // opaque 401 from Razorpay.
  throw new Error(
    "RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET missing from the environment — check server/.env"
  );
}

module.exports = new Razorpay({
  key_id: RAZORPAY_KEY_ID,
  key_secret: RAZORPAY_KEY_SECRET,
});
