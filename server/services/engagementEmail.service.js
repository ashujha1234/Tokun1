/**
 * The email both sides get when an engagement is funded.
 *
 * ── What this is ────────────────────────────────────────────────────────────
 *
 * Funding is the moment the engagement becomes real: money is held, a clock
 * starts, and a set of rules begins to apply that neither side agreed to
 * in this much detail. Until now that moment produced a notification —
 * in-app, easy to miss, and gone once it scrolls.
 *
 * This sends each party a record they keep: what the project is, what was paid,
 * what is due and when, what happens if nobody acts, and their signed agreement
 * attached as a file they hold rather than a link they have to be logged in to
 * follow.
 *
 * ── Why the numbers come from config/engagementRules.js ─────────────────────
 *
 * An email is evidence. Someone can produce it months later and say "you told
 * me 72 hours". Before this feature the figure 72 was written out as a literal
 * in five separate files, so there was a real path to an email promising a
 * window the cron would not keep. Everything here reads the shared constant;
 * see that file for the rest of the reasoning.
 *
 * ── Why it never throws ─────────────────────────────────────────────────────
 *
 * Called from the funding path, after the money has moved. A failed email must
 * not turn a successful payment into a failed request — the caller already
 * committed, and there is nothing useful to roll back to. Everything here is
 * wrapped and logged.
 */

const HireDeal = require("../models/HireDeal");
const ServiceOrder = require("../models/ServiceOrder");
const AccessRequest = require("../models/AccessRequest");
const { RULES } = require("../config/engagementRules");
const { downloadBlobToBuffer } = require("../utils/blobStorage");
const { ACCENT, TEXT, SITE, escapeHtml, rupees, onDate, sendShellEmail } = require("./emailLayout");

/* The two order shapes differ only in field names. Same approach as
   routes/accessRequests.js, for the same reason: one code path, one place to
   fix, rather than a hire copy and a service copy that drift. */
const KIND_CONFIG = {
  hire: {
    model: HireDeal,
    idField: "hireDealId",
    buyerField: "clientId",
    sellerField: "freelancerId",
    titleField: "title",
    briefField: "description",
    ndaContainer: "nda",
    buyerNdaBlob: "ndaClientBlob",
    sellerNdaBlob: "ndaFreelancerBlob",
    buyerLabel: "client",
    sellerLabel: "freelancer",
    dueAtField: "deliveryDate",
  },
  service: {
    model: ServiceOrder,
    idField: "serviceOrderId",
    buyerField: "buyerId",
    sellerField: "sellerId",
    titleField: "serviceTitle",
    briefField: "note",
    ndaContainer: "service-nda",
    buyerNdaBlob: "ndaBuyerBlob",
    sellerNdaBlob: "ndaSellerBlob",
    buyerLabel: "buyer",
    sellerLabel: "seller",
    dueAtField: "deliveryDueAt",
  },
};

/** Plain-text list of what the creator is still waiting on, or null. */
function outstandingSummary(request) {
  if (!request || !Array.isArray(request.items)) return null;
  const pending = request.items.filter(
    (i) => String(i?.label || "").trim() && (i.status || "PENDING") === "PENDING"
  );
  if (!pending.length) return null;
  return pending.map((i) => i.label).join(", ");
}

/* The rules both sides are now bound by, written once and shown to both. These
   are the ones with a clock or a cost attached; the rest live in the agreement
   and do not belong in an email nobody will finish reading. */
function ruleRows(order) {
  return [
    {
      label: "Automatic release",
      value: `${RULES.autoReleaseHours} hours after delivery`,
      emphasis: true,
    },
    {
      label: "Revisions included",
      value: Number.isFinite(order.revisionsAllowed) ? String(order.revisionsAllowed) : "As agreed",
    },
    {
      label: "Escrow held until",
      value: order.escrowExpiresAt ? onDate(order.escrowExpiresAt) : `Up to ${RULES.maxHoldDays} days`,
    },
    {
      label: "Confidentiality",
      value: `${RULES.confidentialityYears} years after the engagement ends`,
    },
  ];
}

/* Facts about this particular piece of work. Rows with an empty value are
   dropped by the shell, so an order missing a delivery date simply shows one
   fewer line rather than "Delivery: undefined". */
function projectRows(order, cfg) {
  const dueAt = order[cfg.dueAtField];
  return [
    { label: "Project", value: order[cfg.titleField] || "Untitled", emphasis: true },
    { label: "Amount held in escrow", value: rupees(order.amount) },
    { label: "Total paid", value: order.totalPayable ? rupees(order.totalPayable) : "" },
    { label: "Paid on", value: order.paidAt ? onDate(order.paidAt) : "" },
    { label: "Delivery due", value: dueAt ? onDate(dueAt) : "" },
    {
      label: "Delivery window",
      value: Number.isFinite(order.deliveryDays) ? `${order.deliveryDays} days` : "",
    },
  ];
}

/* Both parties get the same facts. What differs is the sentence telling them
   what is theirs to do next — which is the only part either of them acts on. */
function introFor({ role, order, cfg, counterpartName, outstanding }) {
  const title = escapeHtml(order[cfg.titleField] || "your project");
  const brief = String(order[cfg.briefField] || "").trim();
  const briefHtml = brief
    ? `<p style="margin:16px 0 0;font-size:14px;line-height:1.65;color:${TEXT.body}">
         <strong style="color:${TEXT.strong}">The brief:</strong><br/>${escapeHtml(
           brief.slice(0, 1200)
         )}${brief.length > 1200 ? "…" : ""}
       </p>`
    : "";

  const nextStep =
    role === "buyer"
      ? outstanding
        ? `<strong style="color:${ACCENT.warn}">${escapeHtml(
            counterpartName
          )} needs a few things from you before work can properly start:</strong> ${escapeHtml(
            outstanding
          )}. The delivery date moves out for any delay here.`
        : `${escapeHtml(
            counterpartName
          )} can begin now. You'll be told when the work is delivered, and you'll have ${
            RULES.autoReleaseHours
          } hours to approve it or ask for a revision.`
      : outstanding
        ? `You've asked the ${cfg.buyerLabel} for: ${escapeHtml(
            outstanding
          )}. Your delivery deadline extends by however long that takes.`
        : `The money is held by Tokun — it is not yours yet, and it is not going anywhere. Deliver the work and it releases to you, automatically after ${RULES.autoReleaseHours} hours if the ${cfg.buyerLabel} doesn't respond.`;

  return `
    <p style="margin:0;font-size:15px;line-height:1.65;color:${TEXT.body}">
      ${
        role === "buyer"
          ? `Your payment for <strong style="color:#ffffff">${title}</strong> is held safely in escrow. Here's everything about this engagement in one place.`
          : `<strong style="color:#ffffff">${escapeHtml(
              counterpartName
            )}</strong> has funded <strong style="color:#ffffff">${title}</strong>. Here's everything about this engagement in one place.`
      }
    </p>
    <p style="margin:16px 0 0;font-size:14px;line-height:1.65;color:${TEXT.body}">
      ${nextStep}
    </p>
    ${briefHtml}`;
}

/**
 * Fetches each party's signed agreement so it can travel with the email.
 *
 * Returns [] when nothing is signed yet — funding does not require a signature,
 * so an engagement can legitimately start without one, and the email is still
 * worth sending.
 */
async function ndaAttachments(order, cfg) {
  const wanted = [
    { blob: order[cfg.buyerNdaBlob], who: cfg.buyerLabel },
    { blob: order[cfg.sellerNdaBlob], who: cfg.sellerLabel },
  ].filter((n) => n.blob);

  if (!wanted.length) return [];

  const files = await Promise.all(
    wanted.map(async ({ blob, who }) => {
      const content = await downloadBlobToBuffer(cfg.ndaContainer, blob);
      if (!content) return null; // already logged by the helper
      return {
        filename: `Tokun-Agreement-${who}-${String(order._id).slice(-6)}.html`,
        content,
      };
    })
  );

  return files.filter(Boolean);
}

/**
 * Sends the funded-engagement email to both parties.
 *
 * @param {"hire"|"service"} orderKind
 * @param {string|object} orderId
 */
async function sendEngagementStartedEmails(orderKind, orderId) {
  try {
    const cfg = KIND_CONFIG[orderKind];
    if (!cfg) {
      console.error(`engagementEmail: unknown orderKind "${orderKind}"`);
      return;
    }

    const order = await cfg.model
      .findById(orderId)
      .populate(cfg.buyerField, "name email")
      .populate(cfg.sellerField, "name email");

    if (!order) {
      console.error(`engagementEmail: ${orderKind} ${orderId} not found`);
      return;
    }

    const buyer = order[cfg.buyerField];
    const seller = order[cfg.sellerField];

    // The checklist is optional — most engagements start without one.
    const request = await AccessRequest.findOne({ [cfg.idField]: order._id }).lean();
    const outstanding = outstandingSummary(request);

    const attachments = await ndaAttachments(order, cfg);
    const rows = [...projectRows(order, cfg), ...ruleRows(order)];
    const orderUrl = `${SITE}/orders/${orderKind}/${order._id}`;
    const subject = `Work has started — ${order[cfg.titleField] || "your engagement"}`;

    /* Sent one at a time rather than as a single two-address mail: the body
       differs per side, and putting both addresses on one message would show
       each party the other's email. */
    const sends = [
      {
        to: buyer?.email,
        role: "buyer",
        counterpartName: seller?.name || "The creator",
      },
      {
        to: seller?.email,
        role: "seller",
        counterpartName: buyer?.name || "The client",
      },
    ];

    for (const s of sends) {
      if (!s.to) continue;
      try {
        await sendShellEmail({
          to: s.to,
          subject,
          heading: "The engagement is funded",
          accent: outstanding && s.role === "buyer" ? ACCENT.warn : ACCENT.info,
          preheader: `${order[cfg.titleField] || "Your project"} — everything you need in one place.`,
          introHtml: introFor({
            role: s.role,
            order,
            cfg,
            counterpartName: s.counterpartName,
            outstanding,
          }),
          rows,
          cta: { label: "Open the engagement", href: orderUrl },
          footerNote: attachments.length
            ? "Your signed agreement is attached. Keep it — it's the version that was signed, and it won't change."
            : "You can see the full brief, timeline and checklist on the engagement page at any time.",
          receivingBecause: "a funded engagement you're part of on Tokun.World",
          attachments,
        });
      } catch (err) {
        // One address failing must not stop the other from being told.
        console.error(`engagementEmail: send to ${s.role} failed:`, err.message);
      }
    }
  } catch (err) {
    console.error("engagementEmail: failed:", err.message);
  }
}

/**
 * The version every caller should use: sends at most once per engagement.
 *
 * A deal reaches FUNDED by one of two routes — the client's verify call after
 * Razorpay's checkout closes, and Razorpay's own webhook — and which one wins
 * is a race. The webhook claims its transition atomically; the verify route
 * loads the document, sets fields and saves. So both can run, and without a
 * flag of their own both would send this email, to both parties, with the
 * signed agreement attached twice.
 *
 * The claim is the same shape escrowRelease.service.js uses on the money path:
 * findOneAndUpdate matching on the field still being null. Only the caller whose
 * update matches a document goes on to send.
 *
 * Claimed BEFORE sending, not after. The failure modes are not symmetrical — a
 * missed email is a support question, a duplicate one carrying a legal agreement
 * is a different kind of problem — so this errs toward sending once or not at
 * all. sendEngagementStartedEmails swallows and logs its own failures, so a
 * bounce does not leave the flag lying about what happened.
 *
 * Never throws: the caller is mid-payment-confirmation and has nothing to roll
 * back to.
 *
 * @param {"hire"|"service"} orderKind
 * @param {string|object} orderId
 */
async function sendEngagementStartedOnce(orderKind, orderId) {
  try {
    const cfg = KIND_CONFIG[orderKind];
    if (!cfg || !orderId) return;

    const claimed = await cfg.model.findOneAndUpdate(
      { _id: orderId, welcomeEmailSentAt: null },
      { $set: { welcomeEmailSentAt: new Date() } },
      { new: false }
    );
    if (!claimed) return; // the other funding path got there first

    await sendEngagementStartedEmails(orderKind, orderId);
  } catch (err) {
    console.error(`engagementEmail: claim failed for ${orderKind} ${orderId}:`, err.message);
  }
}

module.exports = { sendEngagementStartedEmails, sendEngagementStartedOnce };
