// utils/ndaRecord.js
//
// Writes the append-only signature record for an engagement's agreement.
//
// Called from the two upload-nda routes (hire and service) AFTER the order's own
// NDA fields have been saved. That order is deliberate: the order's fields are
// what gate payment, so they are the write that must succeed. This one is the
// archive — see models/NdaRecord.js for why it exists separately — and the
// caller wraps it in a try/catch that logs and continues. A party must never be
// told their signature failed because an audit row didn't write.
//
// Everything here is idempotent-ish by design: signing twice replaces that
// party's entry rather than appending a second one, matching what the order
// itself does when a party re-signs.

const crypto = require("crypto");
const fs = require("fs");
const NdaRecord = require("../models/NdaRecord");

/* A user agent is attacker-controlled and unbounded; an IP list behind a proxy
   can be long. Both are provenance, not identification, so they are capped
   rather than validated. */
const MAX_UA = 400;
const MAX_IP = 60;

/**
 * SHA-256 of a file on disk, hex.
 *
 * Streamed rather than read into a Buffer: the NDA cap is 20 MB and this runs
 * on a small App Service plan where buffering a request body per signature is
 * how the event loop stalls.
 *
 * MUST be called before uploadFileToBlob(), which unlinks the temp copy on
 * success (utils/blobStorage.js, `keepTemp` defaults to false).
 *
 * @returns {Promise<string>} "" if the file can't be read — the signature still
 *   stands, it simply isn't provable against the stored bytes, and an empty
 *   hash says so honestly rather than a wrong one implying it is.
 */
function sha256File(filePath) {
  return new Promise((resolve) => {
    try {
      const hash = crypto.createHash("sha256");
      const stream = fs.createReadStream(filePath);
      stream.on("data", (chunk) => hash.update(chunk));
      stream.on("end", () => resolve(hash.digest("hex")));
      stream.on("error", (err) => {
        console.error("nda hash failed:", err.message);
        resolve("");
      });
    } catch (err) {
      console.error("nda hash failed:", err.message);
      resolve("");
    }
  });
}

/** First entry of an X-Forwarded-For chain, else whatever Express worked out. */
function callerIp(req) {
  const fwd = String(req?.headers?.["x-forwarded-for"] || "").split(",")[0].trim();
  return (fwd || req?.ip || "").slice(0, MAX_IP);
}

/* Per-engagement config. Mirrors the KIND_CONFIG shape used by
   routes/progressReview.js and routes/escrowCancellation.js so the three read
   alike, but this one also maps the two orders' different party vocabularies
   onto the record's normalised client/creator roles. */
const KIND = {
  hire: {
    idField: "hireDealId",
    clientField: "clientId",
    creatorField: "freelancerId",
    titleField: "title",
    // What the order calls each side, for SignatureSchema.orderRole.
    orderRoleFor: { client: "client", creator: "freelancer" },
  },
  service: {
    idField: "serviceOrderId",
    clientField: "buyerId",
    creatorField: "sellerId",
    titleField: "serviceTitle",
    orderRoleFor: { client: "buyer", creator: "seller" },
  },
};

/** ObjectId out of either a populated doc or a bare id. */
function idOf(v) {
  return v && typeof v === "object" && v._id ? v._id : v;
}

/**
 * Record one party's signature on an engagement's agreement.
 *
 * @param {object}  args
 * @param {"hire"|"service"} args.orderKind
 * @param {object}  args.order        the HireDeal / ServiceOrder document. Its
 *                                    party fields may be populated or bare.
 * @param {"client"|"creator"} args.role  which side signed
 * @param {object}  args.signer       { _id, name, email } — the snapshot as
 *                                    signed. Not re-read from the DB later.
 * @param {Date}    args.signedAt
 * @param {string}  args.blobName
 * @param {string}  args.container
 * @param {string}  [args.sha256]
 * @param {number}  [args.byteSize]
 * @param {string}  [args.signatureImage]
 * @param {string}  [args.agreementVersion]
 * @param {object}  [args.req]        for ip / user-agent provenance
 * @returns {Promise<object>} the saved NdaRecord
 */
async function recordNdaSignature({
  orderKind,
  order,
  role,
  signer,
  signedAt,
  blobName,
  container,
  sha256 = "",
  byteSize = 0,
  signatureImage = "",
  agreementVersion = "",
  req,
}) {
  const cfg = KIND[orderKind];
  if (!cfg) throw new Error(`unknown orderKind: ${orderKind}`);
  if (role !== "client" && role !== "creator") throw new Error(`unknown role: ${role}`);

  const filter = { [cfg.idField]: order._id };

  /* Written ONCE, when the record is created by whichever party signs first.
     $setOnInsert and not $set: these are the terms as signed, and the second
     party signing three days later must not quietly re-snapshot them to
     whatever the order says by then. That immutability is the reason the
     collection exists at all. */
  const onInsert = {
    ...filter,
    orderKind,
    clientId: idOf(order[cfg.clientField]),
    creatorId: idOf(order[cfg.creatorField]),
    orderTitle: String(order[cfg.titleField] || "").slice(0, 300),
    amount: Number(order.amount) || 0,
    currency: order.currency || "INR",
    totalPayable: Number(order.totalPayable) || 0,
    // `undefined` would let the schema default win; these are legitimately null
    // (= "no cap agreed", "no deadline"), which is a different fact.
    revisionsAllowed: order.revisionsAllowed === undefined ? null : order.revisionsAllowed,
    deliveryDays: order.deliveryDays === undefined ? null : order.deliveryDays,
    deliveryDueAt: order.deliveryDueAt || null,
    orderStatusAtSigning: order.status || "",
  };

  const signature = {
    role,
    orderRole: cfg.orderRoleFor[role],
    userId: idOf(signer?._id) || onInsert[role === "client" ? "clientId" : "creatorId"],
    name: String(signer?.name || "").slice(0, 200),
    email: String(signer?.email || "").slice(0, 200),
    signedAt: signedAt || new Date(),
    signatureImage,
    blobName,
    container,
    sha256,
    byteSize: Number(byteSize) || 0,
    // "" means the signing client predates version stamping, which only the
    // original NDA text did — hence 1.0 rather than "unknown".
    agreementVersion: String(agreementVersion || "1.0").slice(0, 20),
    ip: callerIp(req),
    userAgent: String(req?.headers?.["user-agent"] || "").slice(0, MAX_UA),
  };

  /* Both parties can sign within the same second, and each signature is a
     read-modify-write of the same array. Two failure modes to survive:
     E11000 from two concurrent upserts racing the unique index, and Mongoose's
     VersionError when both loaded the doc before either saved. Both mean
     "someone else got there first", and both are fixed by re-reading and
     re-applying — which is safe because markSigned() replaces this role's
     entry rather than appending, so a retry can never double-write it. */
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const record = await NdaRecord.findOneAndUpdate(
        filter,
        { $setOnInsert: onInsert },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      record.markSigned(signature);
      await record.save();
      return record;
    } catch (err) {
      const retriable = err?.code === 11000 || err?.name === "VersionError";
      if (!retriable || attempt === 2) throw err;
    }
  }

  // Unreachable: the loop either returns or throws on its last attempt.
  return null;
}

module.exports = { recordNdaSignature, sha256File, callerIp };
