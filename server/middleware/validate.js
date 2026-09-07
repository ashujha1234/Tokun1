/**
 * Request validation, as middleware.
 *
 * ── Why this exists ─────────────────────────────────────────────────────────
 *
 * 284 route handlers each hand-roll their own input checks. Several do it very
 * well — POST /api/prompt validates nine fields with specific, actionable
 * errors, and the bank-account routes encode Razorpay's whole KYC matrix. The
 * problem is not the good ones; it is that there is no floor. Nothing guarantees
 * a new route checks anything, and the failures that follow are quiet: a missing
 * `Number()` turns a string amount into NaN, an absent presence check turns a
 * missing id into a query for `undefined`, and both reach the database.
 *
 * ── Why not zod ─────────────────────────────────────────────────────────────
 *
 * zod was a declared dependency that no file imported, and it has been removed
 * rather than adopted — the frontend's validation is hand-rolled too, so pulling
 * a schema library in for the server alone would have added a dependency to
 * solve half a problem. This is ~90 lines with no dependencies and covers the
 * shapes these routes actually take: presence, type, range, length, enum, and
 * ObjectId. Anything more expressive belongs in the handler, which is where the
 * genuinely complex rules (GSTIN/PAN cross-checks, category/subcategory pairing)
 * already live and should stay.
 *
 * ── Shape ───────────────────────────────────────────────────────────────────
 *
 *   router.post("/admin/approve-withdrawal",
 *     validate({ body: { withdrawalId: { objectId: true, required: true } } }),
 *     handler
 *   );
 *
 * Field options:
 *   required   true        — must be present and non-empty
 *   type       "string" | "number" | "boolean"
 *   objectId   true        — 24-char hex; implies type "string"
 *   min / max              — numeric bounds, or string length bounds
 *   enum       [...]       — must be one of these
 *   trim       true        — coerce: trim the string in place on req
 *
 * On success the coerced values are written back onto req.body/query/params, so
 * a handler reading `req.body.amount` gets a Number rather than a String.
 *
 * On failure: 400 with `error: "validation_failed"` and a `details` array of
 * { path, message } — every failing field at once, not just the first, because
 * a form that has to be resubmitted five times to learn five problems is worse
 * than one that reports them together.
 */

const OBJECT_ID = /^[a-f0-9]{24}$/i;

function checkField(value, name, rule, errors) {
  const present = value !== undefined && value !== null && value !== "";

  if (!present) {
    if (rule.required) errors.push({ path: name, message: `${name} is required` });
    return value;
  }

  let out = value;

  if (rule.objectId) {
    const s = String(out).trim();
    if (!OBJECT_ID.test(s)) {
      errors.push({ path: name, message: `${name} must be a valid id` });
      return out;
    }
    return s;
  }

  if (rule.type === "number") {
    const n = Number(out);
    if (!Number.isFinite(n)) {
      errors.push({ path: name, message: `${name} must be a number` });
      return out;
    }
    if (rule.min !== undefined && n < rule.min) {
      errors.push({ path: name, message: `${name} must be at least ${rule.min}` });
    }
    if (rule.max !== undefined && n > rule.max) {
      errors.push({ path: name, message: `${name} must be at most ${rule.max}` });
    }
    out = n;
  } else if (rule.type === "boolean") {
    if (typeof out === "boolean") return out;
    const s = String(out).toLowerCase();
    if (s !== "true" && s !== "false") {
      errors.push({ path: name, message: `${name} must be true or false` });
      return out;
    }
    out = s === "true";
  } else {
    // string is the default
    out = String(out);
    if (rule.trim) out = out.trim();
    if (rule.min !== undefined && out.length < rule.min) {
      errors.push({ path: name, message: `${name} must be at least ${rule.min} characters` });
    }
    if (rule.max !== undefined && out.length > rule.max) {
      errors.push({ path: name, message: `${name} must be at most ${rule.max} characters` });
    }
  }

  if (rule.enum && !rule.enum.includes(out)) {
    errors.push({ path: name, message: `${name} must be one of: ${rule.enum.join(", ")}` });
  }

  return out;
}

function validate(spec) {
  return function validateRequest(req, res, next) {
    const errors = [];

    for (const source of ["body", "query", "params"]) {
      const rules = spec[source];
      if (!rules) continue;

      /* req.query is a getter on newer Express and req.params is rebuilt per
         layer, so values are assigned back field by field rather than by
         replacing the container. */
      const container = req[source] || {};
      for (const [name, rule] of Object.entries(rules)) {
        const coerced = checkField(container[name], name, rule, errors);
        if (coerced !== undefined) {
          try {
            container[name] = coerced;
          } catch {
            /* Read-only container (some Express versions) — validation still
               ran, the handler just reads the original value. */
          }
        }
      }
    }

    if (errors.length) {
      return res.status(400).json({
        success: false,
        error: "validation_failed",
        details: errors,
        // The first message, so a client that only surfaces one string still
        // says something useful.
        message: errors[0].message,
      });
    }

    return next();
  };
}

module.exports = { validate };
