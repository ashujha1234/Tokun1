// routes/razorpayWebhook.js
//
// Server-to-server confirmation for hire-deal payments, independent of the
// client's browser calling /verify-payment. If the customer's browser closes
// or crashes right after Razorpay captures the payment, this webhook still
// lets the deal transition to FUNDED — otherwise the money would be taken
// but our DB would never know.
//
// IMPORTANT: this handler must be mounted with express.raw({type:"application/json"})
// BEFORE the app's global express.json() middleware (see server/index.js) —
// signature verification needs the exact raw request bytes, not parsed JSON.

const crypto = require("crypto");
const HireDeal = require("../models/HireDeal");

function verifySignature(rawBody, signature, secret) {
  if (!signature || !secret) return false;
  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  const expectedBuf = Buffer.from(expected, "utf8");
  const signatureBuf = Buffer.from(String(signature), "utf8");
  if (expectedBuf.length !== signatureBuf.length) return false;
  return crypto.timingSafeEqual(expectedBuf, signatureBuf);
}

async function handleRazorpayWebhook(req, res) {
  try {
    const rawBody = req.body; // Buffer, thanks to express.raw()
    const signature = req.headers["x-razorpay-signature"];
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!verifySignature(rawBody, signature, secret)) {
      return res.status(400).json({ success: false, error: "invalid_signature" });
    }

    const payload = JSON.parse(rawBody.toString("utf8"));

    if (payload.event !== "payment.captured") {
      // Not an event we act on (yet) — acknowledge so Razorpay stops retrying.
      return res.status(200).json({ received: true });
    }

    const paymentEntity = payload?.payload?.payment?.entity;
    const orderId = paymentEntity?.order_id;
    const paymentId = paymentEntity?.id;

    if (!orderId) {
      return res.status(200).json({ received: true });
    }

    // Idempotent: only flips deals that aren't already PAID — safe against
    // Razorpay's webhook retries and against the client's own /verify-payment
    // call having already handled it first.
    const deal = await HireDeal.findOneAndUpdate(
      { razorpayOrderId: orderId, paymentStatus: { $ne: "PAID" } },
      {
        $set: {
          paymentStatus: "PAID",
          fundsStatus: "HELD_BY_TOKUN",
          status: "FUNDED",
          paidAt: new Date(),
          razorpayPaymentId: paymentId || "",
        },
      },
      { new: true }
    );

    if (!deal) {
      // Either not a hire-deal order (e.g. prompt purchase / wallet top-up),
      // or already marked PAID — either way, nothing more to do here.
      return res.status(200).json({ received: true });
    }

    return res.status(200).json({ received: true, dealId: deal._id });
  } catch (err) {
    console.error("Razorpay webhook error:", err);
    // 500 (not 200) so Razorpay retries per its own backoff policy — this is
    // for genuine processing failures (e.g. a transient DB blip), not for
    // "not applicable" cases, which are already acked with 200 above.
    return res.status(500).json({ received: false, error: "internal_error" });
  }
}

module.exports = { handleRazorpayWebhook };
