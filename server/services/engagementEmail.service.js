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
const { agreementHtmlToPdf } = require("./agreementPdf.service");

/**
 * The welcome doc, as a PDF, for one side of the engagement.
 *
 * Built from the SAME builder the app's modal uses — server/shared/
 * welcomeDoc.mjs — so the document a party is emailed and the one they see
 * in the app cannot drift apart. That file explains why it lives where it does.
 *
 * Loaded with a dynamic import() because it is ESM and this file is CommonJS.
 * Imported inside the function rather than at module load so that a problem
 * with it surfaces as one missing attachment rather than a server that will not
 * boot.
 *
 * Returns null on any failure: the agreements are the legally load-bearing
 * attachments and must go out regardless of whether this one renders.
 */
async function welcomeDocPdf(order, cfg, viewerRole) {
  try {
    const { buildWelcomeHtml } = await import("../shared/welcomeDoc.mjs");
    const { RULES } = require("../config/engagementRules");

    const html = buildWelcomeHtml(
      {
        orderKind: cfg === KIND_CONFIG.hire ? "hire" : "service",
        orderId: String(order._id),
        title: order[cfg.titleField],
        brief: order[cfg.briefField],
        amount: order.amount,
        totalPayable: order.totalPayable,
        currency: order.currency || "INR",
        deliveryDays: order.deliveryDays,
        deliveryDueAt: order[cfg.dueAtField],
        revisionsAllowed: order.revisionsAllowed,
        revisionsUsed: order.revisionsUsed,
        escrowExpiresAt: order.escrowExpiresAt,
        status: order.status,
        fundsStatus: order.fundsStatus,
        paidAt: order.paidAt,
        clientName: order[cfg.buyerField]?.name,
        creatorName: order[cfg.sellerField]?.name,
        viewerRole,
      },
      RULES
    );

    return await agreementHtmlToPdf(html, {
      title: `Tokun — how this engagement works`,
    });
  } catch (err) {
    console.error(`engagementEmail: welcome doc PDF failed for ${order._id}:`, err.message);
    return null;
  }
}
const {
  ACCENT,
  TEXT,
  SITE,
  escapeHtml,
  rupees,
  onDate,
  orderIdRow,
  sendShellEmail,
} = require("./emailLayout");

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
  ];
}

/* Facts about this particular piece of work. Rows with an empty value are
   dropped by the shell, so an order missing a delivery date simply shows one
   fewer line rather than "Delivery: undefined". */
function projectRows(order, cfg) {
  const dueAt = order[cfg.dueAtField];
  return [
    { label: "Project", value: order[cfg.titleField] || "Untitled", emphasis: true },
    /* This email is the record of the engagement — the one both sides keep and
       quote from — so it carries the id the engagement is addressed by
       everywhere else, including in the URL of the button below. */
    orderIdRow(order._id),
    { label: "Payment held by Tokun", value: rupees(order.amount) },
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
          ? `Your payment for <strong style="color:#ffffff">${title}</strong> is held safely by Tokun. Here's everything about this engagement in one place.`
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
/**
 * A Buffer is a PDF if it says so in its first five bytes. Nothing else can be
 * trusted here: the file was uploaded by a party, and the name it arrived with
 * describes what the browser called it, not what it contains.
 */
const isPdfBytes = (buf) =>
  Buffer.isBuffer(buf) && buf.length >= 5 && buf.subarray(0, 5).toString("latin1") === "%PDF-";

async function ndaAttachments(order, cfg) {
  const wanted = [
    { blob: order[cfg.buyerNdaBlob], who: cfg.buyerLabel },
    { blob: order[cfg.sellerNdaBlob], who: cfg.sellerLabel },
  ].filter((n) => n.blob);

  if (!wanted.length) return [];

  const files = await Promise.all(
    wanted.map(async ({ blob, who }) => {
      const stored = await downloadBlobToBuffer(cfg.ndaContainer, blob);
      if (!stored) return null; // already logged by the helper

      const base = `Tokun-Agreement-${who}-${String(order._id).slice(-6)}`;

      /* Decide the BYTES first, and let the name follow from them.
       *
       * These used to be decided together, once per branch, and one branch got
       * it wrong: the fallback returned the stored content under a ".html"
       * name without re-checking what the stored content was. Once the upload
       * route began converting agreements on the way in, that branch could
       * attach a real PDF called ".html" — which a browser opens as text, so
       * the recipient sees "%PDF-1.7 << /Filter /FlateDecode ...". A file that
       * IS a PDF and is unreadable because of its extension is a worse outcome
       * than the HTML it was meant to be rescuing.
       *
       * Deriving the name from the final bytes at a single point makes that
       * mismatch unrepresentable, whatever the branches above do. */
      let bytes = stored;

      if (!isPdfBytes(stored)) {
        /* The HTML the agreement is generated as. Sending it is what produced a
           screen of `<div class="clause">` in Gmail: mail clients do not render
           HTML attachments, they show the source. */
        try {
          bytes = await agreementHtmlToPdf(stored, {
            title: `Tokun Agreement — ${order[cfg.titleField] || "Engagement"}`,
          });
        } catch (err) {
          /* Falls back to the original file rather than dropping the agreement:
             this email is the only copy some people keep. It goes out under its
             true extension, below. */
          console.error(`engagementEmail: agreement PDF failed for ${order._id}:`, err.message);
          bytes = stored;
        }
      }

      const pdf = isPdfBytes(bytes);
      return {
        filename: `${base}.${pdf ? "pdf" : "html"}`,
        content: bytes,
        contentType: pdf ? "application/pdf" : "text/html",
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

    /* Rendered once per side, before the loop, so a send that retries does not
       re-render the document. Sequential rather than Promise.all: this is off
       the response path already and two pdf-lib renders competing for the event
       loop only slows both. */
    for (const s of sends) {
      if (s.to) s.welcome = await welcomeDocPdf(order, cfg, s.role);
    }

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
            ? "Two things are attached: your signed agreement — keep it, it's the version that was signed and it won't change — and a short guide to how this engagement runs, with the dates and the deadlines in it."
            : "You can see the full brief, timeline and checklist on the engagement page at any time.",
          receivingBecause: "a funded engagement you're part of on Tokun.World",
          /* Per recipient, not shared: the welcome doc is written from one
             side's point of view ("you'll have 72 hours to approve", vs "the
             money is held until you deliver"), so the client's copy and the
             creator's copy are different documents. The agreements are the
             same for both and are reused. */
          attachments: s.welcome
            ? [
                ...attachments,
                {
                  filename: `Tokun-How-this-works-${String(order._id).slice(-6)}.pdf`,
                  content: s.welcome,
                  contentType: "application/pdf",
                },
              ]
            : attachments,
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
