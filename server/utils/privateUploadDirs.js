// Where a file lands while it is on its way somewhere else, and which parts of
// /uploads must never be served.
//
// THE PROBLEM THIS CLOSES
//
// `app.use("/uploads", express.static(...))` serves that whole tree with no
// auth. Several routes were writing PRIVATE material into it:
//
//   uploads/service-work   escrow deliverables (and, historically, the only copy)
//   uploads/hire-work      same, for hire deals
//   uploads/nda            signed NDAs
//   uploads/service-nda    signed NDAs
//   uploads/progress-temp  mid-project checkpoint media
//   uploads/brief-temp     the client's brief attachments
//
// The work-file routes do stream their upload on to a PRIVATE Azure container
// and unlink the local copy — but the copy exists on a public path for the
// duration, survives any crash in between, and the pre-Azure deliverables are
// still sitting there permanently. A gated download route was built for exactly
// these files (auth + "are you a party to this order" + watermarking); none of
// that means anything while the same bytes answer to a plain GET.
//
// TWO PARTS, and both are needed:
//
//   1. New temp files go OUTSIDE the served tree (TEMP_UPLOAD_ROOT below), so
//      nothing private is ever written under /uploads again.
//   2. The paths above are refused by the static mount (see PRIVATE_UPLOAD_
//      PREFIXES, applied in index.js), because the legacy files already in
//      them cannot be un-uploaded.
//
// The legacy directories are still READ from disk by the gated download routes
// for pre-Azure records — that is a filesystem read behind an auth check, which
// is fine. Only the HTTP path is closed.

const fs = require("fs");
const os = require("os");
const path = require("path");

/* Outside the app directory entirely, so no static mount can ever reach it by
   accident again. Overridable for hosts with a specific scratch volume. */
const TEMP_UPLOAD_ROOT =
  process.env.TOKUN_TEMP_UPLOAD_DIR || path.join(os.tmpdir(), "tokun-uploads");

/**
 * A private scratch directory, created if needed.
 * @param {string} name  e.g. "service-work" — for readability in logs only.
 */
function tempUploadDir(name) {
  const dir = path.join(TEMP_UPLOAD_ROOT, name);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return dir;
}

/**
 * URL prefixes under /uploads that must never be served.
 *
 * Deliberately a denylist and not a "serve only these" allowlist: /uploads also
 * holds genuinely public things (prompt thumbnails, previews, freelancer intro
 * videos) that the marketplace loads by URL, and turning those off would take
 * the storefront with it. Anything private added later belongs on this list.
 */
const PRIVATE_UPLOAD_PREFIXES = [
  "service-work",
  "hire-work",
  "nda",
  "service-nda",
  "progress-temp",
  "brief-temp",
];

module.exports = { TEMP_UPLOAD_ROOT, tempUploadDir, PRIVATE_UPLOAD_PREFIXES };
