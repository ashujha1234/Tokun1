/**
 * The social row that sits in the footer of the invite and OTP templates.
 *
 * ── Why the icons are attached rather than linked ───────────────────────────
 *
 * They used to be hotlinked from a third-party icon CDN. They rendered in
 * Gmail and not in Zoho, and the reason is not the URL — that CDN answers 200,
 * with the right content type and open CORS, to anything that asks.
 *
 * The difference is the client. Gmail fetches every remote image through its
 * own proxy and shows it without asking. Zoho, Outlook and most others block
 * remote images by default and wait for the reader to click "display images".
 * So the footer was blank for anyone outside Gmail, and no amount of changing
 * the URL fixes that — ANY remote image gets the same treatment.
 *
 * A CID attachment is part of the message rather than something fetched from
 * the network, so it is not "remote content" and renders by default almost
 * everywhere. That is the only approach that actually makes these appear
 * without the reader approving anything.
 *
 * Two things came free with the move: no dependency on a CDN that could change
 * or disappear under us, and no question about the licence on somebody else's
 * icon set. The glyphs in assets/email are rendered from simple-icons paths
 * (CC0) at 2x and displayed at 32px.
 *
 * ── Why an unconfigured network is dropped, not linked to "#" ───────────────
 *
 * Every one of these was `href="#"`. A footer icon that goes nowhere is worse
 * than no icon: it reads as broken, and on some clients "#" scrolls the reader
 * to the top of the mail for no reason. A network with no URL configured is
 * simply not rendered — so the row shrinks rather than filling with dead ends.
 *
 * Set these in the environment to turn each one on:
 *   TOKUN_SOCIAL_FACEBOOK   TOKUN_SOCIAL_X
 *   TOKUN_SOCIAL_INSTAGRAM  TOKUN_SOCIAL_LINKEDIN
 */

const path = require("path");
const fs = require("fs");

const ICON_DIR = path.join(__dirname, "../assets/email");

const NETWORKS = [
  { key: "facebook", label: "Facebook", env: "TOKUN_SOCIAL_FACEBOOK" },
  { key: "x", label: "X", env: "TOKUN_SOCIAL_X" },
  { key: "instagram", label: "Instagram", env: "TOKUN_SOCIAL_INSTAGRAM" },
  { key: "linkedin", label: "LinkedIn", env: "TOKUN_SOCIAL_LINKEDIN" },
];

/** Only the networks that actually have somewhere to point. */
function activeNetworks() {
  return NETWORKS.map((n) => ({ ...n, url: String(process.env[n.env] || "").trim() })).filter(
    (n) => n.url && fs.existsSync(path.join(ICON_DIR, `social-${n.key}.png`))
  );
}

/**
 * The attachments the message has to carry for the row to render.
 * `cid` matches the src in socialRowHtml(); nodemailer wires the two together.
 */
function socialAttachments() {
  return activeNetworks().map((n) => ({
    filename: `social-${n.key}.png`,
    path: path.join(ICON_DIR, `social-${n.key}.png`),
    cid: `social-${n.key}`,
    /* Marks it as part of the body rather than a file the reader is meant to
       save. Without this, four footer glyphs give the mail a paperclip and
       four "attachments" in every client that lists them. */
    contentDisposition: "inline",
  }));
}

/**
 * The `<td>` contents for the social row, or "" when nothing is configured —
 * in which case the surrounding row collapses and the footer just ends.
 */
function socialRowHtml() {
  const active = activeNetworks();
  if (!active.length) return "";

  return active
    .map(
      (n) => `<a href="${n.url}" target="_blank" rel="noopener" style="margin:0 6px;text-decoration:none;display:inline-block">
         <img src="cid:social-${n.key}" width="32" height="32" alt="${n.label}"
              style="display:block;width:32px;height:32px;border:0;outline:none;text-decoration:none" /></a>`
    )
    .join("\n");
}

/** Fills the {{socialRow}} placeholder. Safe to call on a template without one. */
function withSocialRow(html) {
  return String(html).replace(/{{socialRow}}/g, socialRowHtml());
}

/**
 * Fills {{footer}} with the shared footer, and {{socialRow}} for any template
 * still using the older placeholder. Required lazily because emailLayout builds
 * its footer from this module — importing it at the top would be a cycle.
 */
function withFooter(html, opts) {
  const { footerBlock } = require("./emailLayout");
  return withSocialRow(String(html).replace(/{{footer}}/g, footerBlock(opts)));
}

module.exports = { socialAttachments, socialRowHtml, withSocialRow, withFooter, activeNetworks };
