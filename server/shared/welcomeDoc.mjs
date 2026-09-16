/**
 * The welcome doc, as HTML — the one copy of it.
 *
 * ── Why it lives here and not in the component ──────────────────────────────
 *
 * This document is now produced twice: the app renders it in a modal, and the
 * engagement-funded email attaches it as a PDF. The obvious way to do that is
 * to copy the builder into the server, and the obvious way is wrong — this is
 * 300 lines that quote deadlines, revision counts and hold periods at both
 * parties, and two copies would diverge on exactly those numbers. The header of
 * engagementRules.js already argues this case for a handful of constants; it
 * applies far harder to the document that explains them.
 *
 * So there is one builder, and both sides call it.
 *
 * ── Why `server/shared` and not a top-level folder ──────────────────────────
 *
 * The backend deploy packages `server/**` and nothing else (see
 * .github/workflows/main_backendtokun1.yml), so a module outside `server/`
 * would resolve locally and be missing in production — the worst shape of bug,
 * because it passes every test you run before shipping.
 *
 * The frontend reaches it through the `@shared` alias in vite.config.ts.
 *
 * ── Why ESM, and why RULES is a parameter ───────────────────────────────────
 *
 * ESM because the frontend bundle cannot consume CommonJS from source; the
 * server, which is CommonJS, loads it with a dynamic import() instead.
 *
 * RULES is passed in rather than imported because each side has its own copy of
 * it (the two are checked against each other — see server/config/
 * engagementRules.js), and a shared module that reached for one of them would
 * bind this document to whichever side it happened to be built from.
 */

export function esc(s) {
  return String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function escBlock(s) {
  return esc(s).replace(/\r?\n/g, "<br/>");
}

export function formatDate(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
}

export function money(n, currency = "INR") {
  if (n === undefined || n === null) return "";
  const value = Number(n).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return currency === "INR" ? `₹${value}` : `${currency} ${value}`;
}

/** Whole days from now until `when`; negative when it has passed. */
export function daysUntil(when) {
  if (!when) return null;
  const t = new Date(when).getTime();
  if (Number.isNaN(t)) return null;
  return Math.ceil((t - Date.now()) / 86_400_000);
}

/* ── The stages an engagement moves through ────────────────────────────────
   Named for what happens, not for the enum, and each carries the one thing
   the viewer actually needs to know while it is the current stage.
   `key` matches the order's status so the current stage can be marked; DISPUTED
   and the terminal money states are deliberately not stages — they are
   outcomes, and are covered in "If something goes wrong". */
/* A function of RULES rather than a constant: the stage copy quotes the
   auto-release window at the parties, and RULES is passed into this module
   rather than imported (see the header), so there is nothing to close over at
   module level. */
const stagesFor = (RULES) => [
  {
    key: "FUNDED",
    label: "Funded",
    buyer: "Your payment is held by Tokun. The creator can now start.",
    seller: "Tokun is holding the money. You're clear to start — press Start work.",
  },
  {
    key: "IN_PROGRESS",
    label: "In progress",
    buyer: "The work is underway. You can ask to see progress at any point.",
    seller: "You're building. Share a checkpoint if the client asks for one.",
  },
  {
    key: "WORK_SUBMITTED",
    label: "Delivered — your review",
    buyer: `The work is with you. You have ${RULES.autoReleaseHours} hours to approve it or ask for a revision.`,
    seller: `Delivered. If the client says nothing for ${RULES.autoReleaseHours} hours, the payment releases to you automatically.`,
  },
  {
    key: "REVISION_REQUESTED",
    label: "Revision",
    buyer: "You've sent it back with notes. The clock restarts when they resubmit.",
    seller: "A revision is outstanding. Resubmitting restarts the client's review window.",
  },
  {
    key: "COMPLETED",
    label: "Complete",
    buyer: "Approved, released, and the deliverables are yours.",
    seller: "Approved and released. The payout is on your earnings record.",
  },
];

export function buildWelcomeHtml(doc, RULES) {
  const isBuyer = doc.viewerRole === "buyer";
  const currency = doc.currency || "INR";
  const isService = doc.orderKind === "service";

  const other = isBuyer ? doc.creatorName : doc.clientName;
  const otherLabel = isBuyer ? "the creator" : "the client";
  const you = isBuyer ? doc.clientName : doc.creatorName;

  const packageList = (doc.packageItems || []).filter((s) => String(s || "").trim());
  const attachments = (doc.attachments || []).filter((a) => String(a?.name || "").trim());
  const accessItems = (doc.accessItems || []).filter((a) => String(a?.label || "").trim());
  const outstandingAccess = accessItems.filter((a) => (a.status || "PENDING") === "PENDING");

  const STAGES = stagesFor(RULES);
  const currentIndex = STAGES.findIndex((s) => s.key === doc.status);
  const dueIn = daysUntil(doc.deliveryDueAt);

  const revisionTerm = (() => {
    if (typeof doc.revisionsAllowed === "number") {
      const used = Number(doc.revisionsUsed || 0);
      const left = Math.max(0, doc.revisionsAllowed - used);
      return `${doc.revisionsAllowed} included · ${left} left`;
    }
    // null is a term, not a gap: booked under no cap.
    if (doc.revisionsAllowed === null) return "Unlimited — no cap was agreed";
    return "Not specified";
  })();

  const NOT_SET = `<span class="muted">Not set</span>`;
  const or = (v) => (v ? esc(v) : NOT_SET);

  const fact = (k, v, hint) =>
    `<div class="fact"><div class="k">${esc(k)}</div><div class="v">${v}</div>${
      hint ? `<div class="hint">${esc(hint)}</div>` : ""
    }</div>`;

  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"/>
<title>Welcome — ${esc(doc.title || "Your engagement")}</title>
<style>
  @page{size:A4;margin:18mm 16mm}
  *{box-sizing:border-box}
  body{margin:0;font-family:Inter,-apple-system,"Segoe UI",Arial,sans-serif;color:#14121b;background:#f3f2f7;line-height:1.6;font-size:13px}
  .sheet{max-width:820px;margin:24px auto;background:#fff;padding:44px 50px 52px;box-shadow:0 12px 50px rgba(0,0,0,.18)}
  .brand{display:flex;align-items:center;justify-content:space-between;border-bottom:3px solid #7c3aed;padding-bottom:14px;margin-bottom:26px}
  .brand h1{font-size:22px;letter-spacing:4px;margin:0;color:#7c3aed}
  .brand .tag{font-size:10px;letter-spacing:2px;color:#8b8794;text-transform:uppercase}
  h2.doc-title{font-size:24px;margin:0 0 6px;letter-spacing:-.3px;font-family:Georgia,serif}
  .lede{color:#5c5768;font-size:13.5px;margin:0 0 26px;max-width:62ch}
  .sec{font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#7c3aed;margin:30px 0 10px;padding-bottom:5px;border-bottom:1px solid #ece9f3}
  h3{font-size:13.5px;margin:18px 0 5px;color:#2a2536}
  p{margin:0 0 10px}
  .muted{color:#a29daf;font-weight:500}
  .facts{display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin-bottom:6px}
  .fact{background:#faf9fc;border:1px solid #ece9f3;border-radius:10px;padding:12px 14px}
  .fact .k{color:#8b8794;font-size:8.5px;letter-spacing:1.3px;text-transform:uppercase}
  .fact .v{color:#14121b;font-weight:700;margin-top:3px;font-size:14px;word-break:break-word}
  .fact .hint{color:#8b8794;font-size:10px;margin-top:3px;line-height:1.4}
  .steps{list-style:none;padding:0;margin:0}
  .steps li{display:flex;gap:12px;padding:11px 0;border-bottom:1px solid #f2eff8}
  .steps li:last-child{border-bottom:none}
  .dot{width:22px;height:22px;border-radius:50%;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;background:#f0ecf9;color:#a29daf;margin-top:2px}
  .dot.done{background:#dcfce7;color:#16a34a}
  .dot.now{background:#7c3aed;color:#fff}
  .steps .label{font-weight:700;font-size:12.5px;color:#2a2536}
  .steps .label .badge{font-size:8.5px;letter-spacing:1.2px;text-transform:uppercase;color:#7c3aed;background:#f3eeff;border-radius:20px;padding:2px 8px;margin-left:8px;vertical-align:1px}
  .steps .what{color:#5c5768;font-size:12px;margin-top:1px}
  ul.items{margin:0 0 10px;padding-left:18px}
  ul.items li{margin-bottom:5px}
  table.tbl{width:100%;border-collapse:collapse;font-size:12px;margin-bottom:12px}
  table.tbl td{padding:7px 9px;border-bottom:1px solid #f0edf6;vertical-align:top}
  table.tbl td.r{text-align:right;color:#8b8794;white-space:nowrap;width:120px}
  .quote{background:#faf9fc;border-left:3px solid #d9d0f5;border-radius:0 8px 8px 0;padding:12px 14px;margin:0 0 12px;font-size:12.5px}
  .quote .lbl{font-size:8.5px;letter-spacing:1.3px;text-transform:uppercase;color:#8b8794;margin-bottom:5px}
  .callout{border-radius:10px;padding:14px 16px;margin:0 0 14px;font-size:12.5px;line-height:1.6}
  .callout.warn{background:#fffbeb;border:1px solid #fde68a}
  .callout.info{background:#f5f3ff;border:1px solid #ddd6fe}
  .callout .t{font-weight:700;margin-bottom:3px}
  .foot{margin-top:34px;padding-top:14px;border-top:1px dashed #d9d5e2;font-size:10px;color:#8b8794;line-height:1.7}
  .nowrap{white-space:nowrap}
  @media print{body{background:#fff}.sheet{box-shadow:none;margin:0;max-width:none;padding:0}}
</style></head>
<body><div class="sheet">
  <div class="brand"><h1>TOKUN</h1><span class="tag">Payment-Protected Engagement</span></div>

  <h2 class="doc-title">${isBuyer ? "Welcome — here's how this works" : "Your engagement — what happens now"}</h2>
  <p class="lede">${
    isBuyer
      ? `${you ? `${esc(you)}, y` : "Y"}our payment for <b>${esc(doc.title || "this engagement")}</b> is held by Tokun${
          other ? ` and ${esc(other)} has been notified` : ""
        }. This document is the whole process in order: what happens next, what we need from you, where your money sits, and what to do if something isn't right. Nothing in it is a surprise later.`
      : `${you ? `${esc(you)}, t` : "T"}his is the engagement <b>${esc(doc.title || "you've taken on")}</b>${
          other ? ` for ${esc(other)}` : ""
        }. The client's money is already held by Tokun, so the only thing between you and the payout is the work. Here is the sequence, the deadline, and exactly what releases the money.`
  }</p>

  <div class="sec">The engagement at a glance</div>
  <div class="facts">
    ${fact(
      isBuyer ? "You paid" : "You'll receive",
      or(money(isBuyer ? (doc.totalPayable ?? doc.amount) : doc.amount, currency)),
      isBuyer
        ? "Held by Tokun, not paid out yet"
        : "Before Tokun's commission — see your earnings record"
    )}
    ${fact(
      "Delivery due",
      doc.deliveryDueAt
        ? `<span class="nowrap">${esc(formatDate(doc.deliveryDueAt))}</span>`
        : doc.targetDate
          ? `<span class="nowrap">${esc(formatDate(doc.targetDate))}</span>`
          : NOT_SET,
      doc.deliveryDueAt && dueIn !== null
        ? dueIn >= 0
          ? `${dueIn} day${dueIn === 1 ? "" : "s"} from today`
          : `${Math.abs(dueIn)} day${Math.abs(dueIn) === 1 ? "" : "s"} overdue`
        : doc.deliveryDays
          ? `${doc.deliveryDays} days from payment`
          : "No fixed number of days was agreed"
    )}
    ${fact("Revisions", or(revisionTerm), isBuyer ? "Beyond this needs a new booking" : "A cap the client agreed to at booking")}
  </div>

  <div class="sec">What happens next</div>
  <ol class="steps">
    ${STAGES.map((s, i) => {
      const done = currentIndex > -1 && i < currentIndex;
      const now = currentIndex === i;
      return `<li>
        <div class="dot ${done ? "done" : now ? "now" : ""}">${done ? "✓" : i + 1}</div>
        <div>
          <div class="label">${esc(s.label)}${now ? `<span class="badge">You are here</span>` : ""}</div>
          <div class="what">${esc(isBuyer ? s.buyer : s.seller)}</div>
        </div>
      </li>`;
    }).join("")}
  </ol>
  ${
    currentIndex === -1
      ? `<p class="muted" style="font-size:11.5px">This engagement is currently outside the normal sequence${
          doc.status ? ` (${esc(String(doc.status).toLowerCase().replace(/_/g, " "))})` : ""
        } — see "If something isn't right" below.</p>`
      : ""
  }

  <div class="sec">${isBuyer ? "What we need from you" : "What you need from the client"}</div>
  ${
    accessItems.length
      ? `<p>${
          isBuyer
            ? `${other ? esc(other) : "The creator"} has asked for the following. Work can't start properly until the required items are in, and any delay here moves the delivery date out by the same amount.`
            : `You've asked the client for the following. Anything still outstanding extends your delivery deadline by the length of the delay — you are not late for time spent waiting on the client.`
        }</p>
        <table class="tbl">${accessItems
          .map(
            (a) =>
              `<tr><td><b>${esc(a.label)}</b>${
                a.required === false ? ` <span class="muted">(optional)</span>` : ""
              }${a.note ? `<div class="muted" style="font-size:11px;font-weight:400">${escBlock(a.note)}</div>` : ""}</td>
              <td class="r">${esc(
                (a.status || "PENDING") === "PENDING"
                  ? "Outstanding"
                  : a.status === "PROVIDED"
                    ? "✓ Provided"
                    : a.status === "DECLINED"
                      ? "Declined"
                      : "Not applicable"
              )}</td></tr>`
          )
          .join("")}</table>
        ${
          outstandingAccess.length
            ? `<div class="callout warn"><div class="t">${outstandingAccess.length} item${
                outstandingAccess.length === 1 ? "" : "s"
              } still outstanding</div>${
                isBuyer
                  ? `Open the access checklist on your order page to upload files or confirm access. <b>Never type a password, private key or one-time code anywhere on Tokun</b> — grant access by inviting ${
                      other ? esc(other) : "the creator"
                    } to the account instead, and revoke it when the work is done.`
                  : `The client hasn't provided these yet. Nudge them in chat — and never ask for a password: ask to be invited to the account.`
              }</div>`
            : ""
        }`
      : `<p>${
          isBuyer
            ? `Nothing yet. If ${
                other ? esc(other) : "the creator"
              } needs assets, brand files or access to one of your systems, they'll raise a checklist on this order and you'll be notified. When they do: <b>never type a password, private key or one-time code into Tokun.</b> Grant access by inviting them to the account, at the lowest level that lets them work, and revoke it when the engagement ends.`
            : `You haven't raised an access checklist on this engagement. If you need brand files, copy, credentials-level access or approvals to do the work, raise one from the order page — it gives the client a clear list, records what was asked for, and extends your delivery deadline for any delay in providing it. Ask to be invited to systems; never ask for a password.`
        }</p>`
  }

  ${
    doc.brief || packageList.length || attachments.length
      ? `<div class="sec">What was agreed</div>
         ${
           packageList.length
             ? `<h3>What the engagement includes</h3>
                <ul class="items">${packageList.map((i) => `<li>${esc(i)}</li>`).join("")}</ul>`
             : ""
         }
         ${
           doc.brief
             ? `<div class="quote"><div class="lbl">${
                 isService ? "The brief submitted with the booking" : "The project as agreed between you"
               }</div>${escBlock(doc.brief)}</div>`
             : ""
         }
         ${
           attachments.length
             ? `<h3>Reference material attached to the brief</h3>
                <table class="tbl">${attachments
                  .map(
                    (a) =>
                      `<tr><td>${esc(a.name)}</td><td class="r">${
                        a.size ? esc(`${Math.max(1, Math.round(Number(a.size) / 1024))} KB`) : ""
                      }</td></tr>`
                  )
                  .join("")}</table>`
             : ""
         }
         <p class="muted" style="font-size:11.5px">Anything not listed above is out of scope. It isn't covered by the payment held against this engagement, and needs a new booking or a written variation both of you agree to.</p>`
      : ""
  }

  <div class="sec">Where the money is</div>
  <p>${
    isBuyer
      ? `Your payment is held by Tokun. It is <b>not</b> with ${
          other ? esc(other) : "the creator"
        } and won't be until the work is approved. That is what makes paying up front safe.`
      : `The client's payment is already held by Tokun, so the money exists before you start. It isn't yours yet — it becomes yours on approval, or automatically as described below.`
  }</p>
  <table class="tbl">
    <tr><td><b>What releases it</b></td><td>${
      isBuyer
        ? "You approving the delivery — or the automatic release below."
        : "The client approving your delivery — or the automatic release below."
    }</td></tr>
    <tr><td><b>Automatic release</b></td><td>If the delivery is neither approved nor sent back for a revision within <b>${
      RULES.autoReleaseHours
    } hours</b>, it counts as accepted and the payment releases ${
      isBuyer ? "to the creator" : "to you"
    }. ${
      isBuyer
        ? `You're reminded ${RULES.autoReleaseWarningHours} hours before that happens. Silence is acceptance — this is the one deadline worth putting in your calendar.`
        : `The client is reminded ${RULES.autoReleaseWarningHours} hours beforehand.`
    }</td></tr>
    <tr><td><b>What sends it back</b></td><td>${
      isBuyer
        ? "A revision request you're entitled to, a cancellation you both agree on, or a dispute decided in your favour."
        : "A cancellation you both agree on, or a dispute decided for the client. A cancellation after work has started is normally settled as a split."
    }</td></tr>
    <tr><td><b>The outer limit</b></td><td>The payment can't be held past <b>${
      doc.escrowExpiresAt ? esc(formatDate(doc.escrowExpiresAt)) : `${RULES.maxHoldDays} days from payment`
    }</b> — a payment-processor limit neither of you nor Tokun can extend. Everything has to be settled before then, and you're both warned ${
      RULES.escrowWarningDays
    } days ahead.</td></tr>
  </table>

  <div class="sec">Seeing progress</div>
  <p>${
    isBuyer
      ? `You don't have to wait until delivery to see something. Ask for a progress checkpoint from your order page and ${
          other ? esc(other) : "the creator"
        } will share a screenshot or a short recording — or explain why now isn't a good time, which is a fair answer. One request every ${
          RULES.progressRequestCooldownHours
        } hours, so it stays a checkpoint rather than a standing demand. Anything shared this way is watermarked while the money is held, and is kept by Tokun as a dated record of what existed.`
      : `The client can ask to see how the work is going, at most once every ${
          RULES.progressRequestCooldownHours
        } hours. Answer with a screenshot or a short recording — or decline with a reason, which is a first-class answer and not a black mark. It's worth doing: a checkpoint is a dated record held by Tokun of what existed on that day, and it is the strongest evidence you have if the engagement is ever cancelled mid-way.`
  }</p>

  <div class="sec">If something isn't right</div>
  <table class="tbl">
    <tr><td><b>${isBuyer ? "The work isn't what I asked for" : "The client isn't happy"}</b></td><td>${
      isBuyer
        ? `Request a revision instead of approving. That stops the ${RULES.autoReleaseHours}-hour clock, and it restarts in full when they resubmit. Adding something that wasn't in the brief is a change of scope, not a revision — that needs a new booking.`
        : `A revision request pauses the release clock and restarts it when you resubmit. If what they're asking for wasn't in the brief, say so — that's a change of scope and needs a new booking, not a free round.`
    }</td></tr>
    <tr><td><b>${isBuyer ? "Nothing is happening" : "The client has gone quiet"}</b></td><td>${
      isBuyer
        ? `Ask for a progress checkpoint first. If the delivery date passes with nothing delivered, you can allow more time in writing or cancel — and how much was actually done decides how the payment splits.`
        : `An unanswered revision is chased after ${RULES.revisionStallWarnDays} days and can be referred to Tokun after ${RULES.revisionStallEscalateDays}. If you're waiting on the client for something from the access checklist, your deadline extends for that time.`
    }</td></tr>
    <tr><td><b>Cancelling</b></td><td>Before work starts, the payment is refunded. After it starts the money can't just go back: either of you can propose a split, saying what share ${
      isBuyer ? "the creator" : "you"
    } has earned, and if the other accepts, Tokun settles on that basis.</td></tr>
    <tr><td><b>No agreement</b></td><td>Either of you can refer it to Tokun, which decides how the payment is distributed on the record it holds — this document's engagement, the brief, your messages, the checkpoints and the delivery dates. That is why checkpoints and written messages matter more than they look.</td></tr>
  </table>

  <div class="callout info">
    <div class="t">Your signed agreement is the binding version</div>
    This document explains the process in plain language. The engagement agreement and NDA that ${
      isBuyer ? "you and " : ""
    }${other ? esc(other) : "both parties"} signed is what actually binds ${
      isBuyer ? "you" : "you both"
    } — including confidentiality, who owns the deliverables and when, and the ${
      RULES.autoReleaseHours
    }-hour acceptance rule described above. Open it from your order page any time. Where the two differ, the signed agreement governs.
  </div>

  <div class="foot">
    Generated by Tokun for ${isService ? "booking" : "deal"} ${esc(doc.orderId || "—")} on ${esc(
      formatDate(new Date())
    )}, for ${isBuyer ? "the client" : "the creator"}.
    The dates and amounts above are this engagement's record as it stood at that moment — the live record on your order page governs if the two ever differ.
    Questions Tokun can answer, rather than ${esc(otherLabel)}: use Support from your account menu.
  </div>
</div></body></html>`;
}
