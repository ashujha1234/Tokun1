/**
 * How an order id is written where a PERSON will read it, and how to read it
 * back.
 *
 * ── Why a prefix ────────────────────────────────────────────────────────────
 *
 * The id is a 24-character hex ObjectId, and on its own that is exactly what it
 * looks like: an opaque string with nothing on it saying what it identifies. An
 * email, an invoice and a support reply each carried a bare one, and the first
 * thing anyone asked on seeing it was which number it was. "OD-" answers that
 * before the question is asked.
 *
 * The hyphen is not decoration. It is what makes the prefix strippable without
 * guessing where it ends, which matters because the number a party quotes back
 * is whatever the email showed them — see parseOrderId, which the admin search
 * runs on every pasted term.
 *
 * ── DISPLAY ONLY ────────────────────────────────────────────────────────────
 *
 * The stored id, every URL and every database lookup stay bare. Prefixing
 * anything that is matched against the database is how a record stops being
 * findable by its own id.
 *
 * ── Why this is not in services/emailLayout.js ──────────────────────────────
 *
 * That was the first home for it, and it dragged the whole email layer — and
 * utils/mailer.js, which opens an SMTP connection when it is imported — into
 * any route that only wanted the two-character prefix. A constant should not
 * cost a transport check.
 */

/** The marker that says "this is an order id". Display form only. */
const ORDER_ID_PREFIX = "OD-";

/**
 * The display form of an order id.
 *
 * Returns "" for a missing one so a renderer can drop the row, rather than
 * printing "OD-undefined". Idempotent: formatting an already-formatted id does
 * not produce "OD-OD-…".
 */
function formatOrderId(orderId) {
  const raw = String(orderId ?? "").trim();
  if (!raw) return "";
  return raw.toUpperCase().startsWith(ORDER_ID_PREFIX) ? raw : `${ORDER_ID_PREFIX}${raw}`;
}

/**
 * The id inside a display form — the inverse of formatOrderId.
 *
 * Case-insensitive, because someone retyping an id from an email types "od-"
 * as often as "OD-", and leaves anything that is not an order id untouched so
 * a search box can pass every term through it.
 */
function parseOrderId(value) {
  return String(value ?? "")
    .trim()
    .replace(new RegExp(`^${ORDER_ID_PREFIX}`, "i"), "")
    .trim();
}

module.exports = { ORDER_ID_PREFIX, formatOrderId, parseOrderId };
