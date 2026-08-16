// Subscription lifecycle emails.
//
// A plan on Tokun is bought outright for a period — there is no stored mandate
// and nothing charges the card again by itself (see routes/billingOrders.js and
// the verify path in routes/billingVerify.js, which starts or renews a period
// only when a payment has just been made). So the whole lifecycle a subscriber
// experiences is: it's running, it's about to stop, it stopped.
//
// Only the first of those three was ever communicated — and only as an invoice
// at the moment of paying. A Pro user's tokens dropped back to the free
// allowance on the expiry date with no warning beforehand and no explanation
// afterwards.

const { ACCENT, SITE, escapeHtml, rupees, onDate, sendShellEmail } = require("./emailLayout");

const firstName = (name) => String(name || "there").trim().split(/\s+/)[0];
const planLabel = (plan) =>
  ({ pro: "Pro", enterprise: "Enterprise", free: "Free" }[String(plan || "").toLowerCase()] ||
  String(plan || "your plan"));

/** A few days out — while renewing still avoids any interruption. */
exports.sendPlanExpiringSoonEmail = async ({
  to,
  name,
  plan,
  billingCycle,
  currentPeriodEnd,
  daysLeft,
  price,
  isOrg = false,
}) =>
  sendShellEmail({
    to,
    subject: `Your Tokun ${planLabel(plan)} plan ends in ${daysLeft} day${daysLeft === 1 ? "" : "s"}`,
    heading: `Your ${planLabel(plan)} plan is ending`,
    accent: ACCENT.warn,
    preheader: `Renew before ${onDate(currentPeriodEnd)} to keep your monthly tokens.`,
    introHtml: `Hi ${escapeHtml(firstName(name))}, your Tokun <strong style="color:#fff">${escapeHtml(
      planLabel(plan)
    )}</strong> plan ends on ${escapeHtml(onDate(currentPeriodEnd))}. Renew before then and nothing changes${
      isOrg ? " for you or your team" : ""
    }.`,
    rows: [
      { label: "Plan", value: `${planLabel(plan)}${billingCycle ? ` (${billingCycle})` : ""}` },
      { label: "Ends on", value: onDate(currentPeriodEnd), emphasis: true },
      { label: price ? "Renewal price" : "", value: price ? rupees(price) : "" },
    ],
    cta: { label: "Renew now", href: `${SITE}/self-dash?tab=subscription` },
    footerNote: isOrg
      ? "When an Enterprise plan lapses, the shared token pool stops refilling and team members lose their allowance. Nothing is deleted — renewing restores it."
      : "When the plan lapses your account drops to the Free allowance of 5,000 monthly tokens. Nothing you've made or bought is deleted, and renewing puts the allowance straight back.",
    receivingBecause: "your Tokun.World subscription",
  });

/** It lapsed. Say plainly what changed and what didn't. */
exports.sendPlanExpiredEmail = async ({ to, name, plan, endedOn, isOrg = false }) =>
  sendShellEmail({
    to,
    subject: `Your Tokun ${planLabel(plan)} plan has ended`,
    heading: `Your ${planLabel(plan)} plan has ended`,
    accent: ACCENT.info,
    preheader: isOrg
      ? "The shared token pool has stopped refilling."
      : "You're back on the Free allowance of 5,000 monthly tokens.",
    introHtml: `Hi ${escapeHtml(firstName(name))}, your Tokun <strong style="color:#fff">${escapeHtml(
      planLabel(plan)
    )}</strong> plan ended on ${escapeHtml(onDate(endedOn))}${
      isOrg
        ? ", so your organisation's shared token pool has stopped refilling"
        : ", so your account is back on the Free allowance of 5,000 monthly tokens"
    }.`,
    rows: [
      { label: "Plan", value: planLabel(plan) },
      { label: "Ended on", value: onDate(endedOn) },
      { label: "You're now on", value: isOrg ? "No active plan" : "Free — 5,000 tokens/month" },
    ],
    cta: { label: "Start it again", href: `${SITE}/self-dash?tab=subscription` },
    footerNote:
      "Nothing has been deleted — your prompts, purchases, history and profile are all exactly where you left them. Subscribing again restores the allowance immediately.",
    receivingBecause: "your Tokun.World subscription",
  });
