// Requests nobody ever answered.
//
// A client sends a hire proposal and the freelancer never opens it. The deal
// sits in PENDING_ACCEPTANCE forever: it shows up in the client's orders as
// live, it can't be cancelled by a timer that doesn't exist, and the client is
// left unsure whether to wait or go elsewhere. Same shape on the service side,
// where a booking request sits in PENDING_PAYMENT unread.
//
// After REQUEST_RESPONSE_DAYS (3 by default) the request is closed and both
// sides are told. No money is involved at any point — every status this cron
// touches is pre-payment, paymentStatus NOT_PAID — so cancelling is safe in a
// way that nothing later in the lifecycle is. That is deliberately the whole
// scope: the moment escrow is funded, a stalled booking goes to the settlement
// and dispute machinery instead, never to a clock.
//
// ── The two sides are not symmetrical ──────────────────────────────────────
//
// Hire deals have a real acceptance step, so PENDING_ACCEPTANCE means the
// FREELANCER hasn't replied. Service bookings have no acceptance step — the
// buyer books and pays — so PENDING_PAYMENT means the CLIENT hasn't paid.
// Both are dead requests worth closing, but they're stale for opposite
// reasons, and the notifications say so rather than blaming the wrong party.

const cron = require("node-cron");
const { watchJob } = require("../utils/jobTelemetry");
const HireDeal = require("../models/HireDeal");
const ServiceOrder = require("../models/ServiceOrder");
// Required for its side effect — the queries below populate buyer/seller and
// mongoose throws MissingSchemaError if nothing registered "User" first.
require("../models/User");
const Notification = require("../models/Notification");
const Message = require("../models/Message");
const {
  sendHireRequestExpiredToClient,
  sendHireRequestExpiredToFreelancer,
  sendServiceRequestExpiredToClient,
  sendServiceRequestExpiredToSeller,
} = require("../services/requestExpiryEmail.service");

/** Days a request may go unanswered before it is closed. */
const RESPONSE_DAYS = Number(process.env.REQUEST_RESPONSE_DAYS || 3);

const KINDS = [
  {
    label: "hire",
    model: HireDeal,
    // The freelancer has not accepted or declined the proposal.
    staleStatus: "PENDING_ACCEPTANCE",
    buyerField: "clientId",
    sellerField: "freelancerId",
    titleField: "title",
    silentParty: "seller",
    // Prefixes the request card is posted under. Removed from the thread when
    // the request expires — see removeCardFromChat.
    cardPrefixes: ["HIRE_CARD::", "__HIRE_PROPOSAL__::", "COUNTER_CARD::"],
    amountField: "amount",
    reason: `The creator didn't respond within ${RESPONSE_DAYS} days.`,
    buyerMessage: (title, sellerName) =>
      `Your request for "${title}" was closed — ${sellerName || "the creator"} didn't respond within ${RESPONSE_DAYS} days. Nothing was charged. You can send it to someone else.`,
    sellerMessage: (title, buyerName) =>
      `The request from ${buyerName || "a client"} for "${title}" expired after ${RESPONSE_DAYS} days without a reply.`,
    chatMessage: (title) =>
      `⌛ The request for "${title}" was closed automatically — it went unanswered for ${RESPONSE_DAYS} days. No payment was taken.`,
    sendEmails: async ({ buyer, seller, title, days, amount }) => {
      await Promise.all([
        sendHireRequestExpiredToClient({
          to: buyer?.email,
          clientName: buyer?.name,
          freelancerName: seller?.name,
          title,
          days,
          amount,
        }),
        sendHireRequestExpiredToFreelancer({
          to: seller?.email,
          freelancerName: seller?.name,
          clientName: buyer?.name,
          title,
          days,
          amount,
        }),
      ]);
    },
  },
  {
    label: "service",
    model: ServiceOrder,
    // Not an acceptance step: the booking is waiting on the BUYER to pay.
    staleStatus: "PENDING_PAYMENT",
    buyerField: "buyerId",
    sellerField: "sellerId",
    titleField: "serviceTitle",
    silentParty: "buyer",
    cardPrefixes: ["SERVICE_CARD::"],
    amountField: "totalPayable",
    reason: `Payment wasn't completed within ${RESPONSE_DAYS} days.`,
    buyerMessage: (title) =>
      `Your booking request for "${title}" was closed — payment wasn't completed within ${RESPONSE_DAYS} days. Nothing was charged. You can book it again any time.`,
    sellerMessage: (title, buyerName) =>
      `The booking request from ${buyerName || "a client"} for "${title}" expired — they didn't complete payment within ${RESPONSE_DAYS} days.`,
    chatMessage: (title) =>
      `⌛ The booking request for "${title}" was closed automatically — payment wasn't completed within ${RESPONSE_DAYS} days.`,
    sendEmails: async ({ buyer, seller, title, days, amount }) => {
      await Promise.all([
        sendServiceRequestExpiredToClient({
          to: buyer?.email,
          clientName: buyer?.name,
          title,
          days,
          amount,
        }),
        sendServiceRequestExpiredToSeller({
          to: seller?.email,
          sellerName: seller?.name,
          clientName: buyer?.name,
          title,
          days,
          amount,
        }),
      ]);
    },
  },
];

/**
 * Takes the request card out of the conversation.
 *
 * The card is an actionable thing — "Accept", "Pay now" — and once the request
 * is closed those buttons lead nowhere. Leaving it in the thread means both
 * sides keep scrolling past a live-looking offer that no longer exists. The
 * plain-text line posted alongside is what stays, so the history still says
 * what happened.
 *
 * Matched by the order id inside the card's JSON payload, so only this
 * request's card goes — a conversation may carry several.
 */
async function removeCardFromChat(order, kind) {
  if (!order.chatId) return 0;
  const id = String(order._id);
  try {
    const res = await Message.deleteMany({
      conversationId: order.chatId,
      $and: [
        { $or: kind.cardPrefixes.map((p) => ({ text: { $regex: `^${p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}` } })) },
        { text: { $regex: id } },
      ],
    });
    return res.deletedCount || 0;
  } catch (err) {
    console.error("[StaleRequest] card removal failed:", err.message);
    return 0;
  }
}

async function postToChat(order, senderId, text) {
  if (!order.chatId || !senderId) return;
  try {
    await Message.create({
      conversationId: order.chatId,
      // Attributed to the buyer only because `sender` is required and has to be
      // a real participant; the wording makes clear this was the system.
      sender: senderId,
      text,
      readBy: [],
    });
  } catch (err) {
    console.error("[StaleRequest] chat message failed:", err.message);
  }
}

async function expireStale(kind, cutoff) {
  const stale = await kind.model
    .find({
      status: kind.staleStatus,
      // Belt and braces. The status alone should imply this, but cancelling
      // something that turned out to be paid would be unrecoverable, so the
      // money state is checked explicitly rather than inferred.
      paymentStatus: "NOT_PAID",
      createdAt: { $lt: cutoff },
    })
    .populate(kind.buyerField, "name email")
    .populate(kind.sellerField, "name email");

  let count = 0;

  for (const order of stale) {
    try {
      const buyer = order[kind.buyerField];
      const seller = order[kind.sellerField];
      const title = order[kind.titleField] || "your request";

      order.status = "CANCELLED";
      order.cancelledAt = new Date();
      order.cancelReason = kind.reason;
      // Which side let it lapse, in the same vocabulary the settlement engine
      // uses ("buyer" | "seller" | "admin").
      order.cancelledBy = kind.silentParty;
      await order.save();

      /* Guarded rather than assumed: some old records point at users that no
         longer exist, and a notification to nobody would throw — after the
         order was already saved as cancelled — taking the chat message and the
         log line down with it. */
      if (buyer?._id) {
        await Notification.create({
          senderId: seller?._id,
          senderName: "Tokun",
          receiverUserId: buyer._id,
          type: "REQUEST_EXPIRED",
          message: kind.buyerMessage(title, seller?.name),
          meta: { orderKind: kind.label, orderId: String(order._id) },
        });
      }

      if (seller?._id) {
        await Notification.create({
          senderId: buyer?._id,
          senderName: "Tokun",
          receiverUserId: seller._id,
          type: "REQUEST_EXPIRED",
          message: kind.sellerMessage(title, buyer?.name),
          meta: { orderKind: kind.label, orderId: String(order._id) },
        });
      }

      /* Order matters: pull the dead card out first, then leave the note that
         explains why it's gone. Doing it the other way round briefly shows a
         thread where the explanation sits above a card that still looks live. */
      const removed = await removeCardFromChat(order, kind);
      await postToChat(order, buyer?._id, kind.chatMessage(title));

      /* Email as well as the notification. Someone who stopped opening the app
         is exactly who this needs to reach, and the notification can't. Sent
         last and swallowed on failure — the cancellation is already committed
         and SMTP being down must not undo it or stop the rest of the run. */
      try {
        await kind.sendEmails({
          buyer,
          seller,
          title,
          days: RESPONSE_DAYS,
          amount: order[kind.amountField],
        });
      } catch (mailErr) {
        console.error(
          `[StaleRequest] expiry email failed for ${kind.label} ${order._id}:`,
          mailErr.message
        );
      }

      if (removed) {
        console.log(`[StaleRequest] removed ${removed} card message(s) from chat ${order.chatId}.`);
      }
      count++;
      console.log(
        `[StaleRequest] Closed ${kind.label} ${order._id} — "${title}" unanswered for ${RESPONSE_DAYS}+ days.`
      );
    } catch (err) {
      console.error(`[StaleRequest] failed to close ${kind.label} ${order._id}:`, err.message);
    }
  }

  return count;
}

async function run() {
  const cutoff = new Date(Date.now() - RESPONSE_DAYS * 86400000);
  let total = 0;
  for (const kind of KINDS) {
    total += await expireStale(kind, cutoff);
  }
  if (total) console.log(`[StaleRequest] closed ${total} stale request(s).`);
  return total;
}

// Daily at 07:30. A deadline measured in days doesn't need to be checked more
// often, and this lands before the working day rather than overnight.
cron.schedule("30 7 * * *", async () => {
  const job = watchJob("StaleRequestWatch");
  try {
    await run();
    job.ok();
  } catch (err) {
    console.error("[StaleRequest] Cron job error:", err);
    job.failed(err);
  }
});

module.exports = { run, expireStale, RESPONSE_DAYS };
