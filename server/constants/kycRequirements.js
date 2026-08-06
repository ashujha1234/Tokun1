// Which KYC fields Razorpay actually needs, per business_type — transcribed
// from the KYC Requirements matrix in
// https://razorpay.com/docs/payments/route/integration-guide/#kyc-requirements
//
// Razorpay's table uses five distinct verdicts, kept verbatim here rather than
// collapsed into a boolean, because "No" and "NA" are not the same thing and
// the distinction is what drives whether a field is merely un-starred or
// absent from the form entirely:
//
//   REQUIRED        "Yes"         — Razorpay rejects the account without it
//   NOT_REQUIRED    "No"          — accepted either way; we still collect it
//   OPTIONAL        "Optional"    — same, but Razorpay explicitly invites it
//   CONDITIONAL     "Conditional" — needed in some cases; the table does not
//                                   say which, and there is no footnote. Kept
//                                   in the vocabulary because Razorpay uses it,
//                                   though no row resolves to it today — see
//                                   the proprietorship note below for the one
//                                   place it appeared and why we tightened it.
//   NOT_APPLICABLE  "NA"          — the field has no meaning for this entity
//                                   (an individual has no business PAN), so it
//                                   is not shown at all.
//
// Only NOT_APPLICABLE hides a field and only REQUIRED blocks submission — the
// three in between all mean "ask, but let them through".
const REQUIREMENT = {
  REQUIRED: "required",
  NOT_REQUIRED: "not_required",
  OPTIONAL: "optional",
  CONDITIONAL: "conditional",
  NOT_APPLICABLE: "not_applicable",
};

// Every registered entity in the table shares one row, so it is written once
// and spread below rather than copy-pasted eight times where a single stray
// edit would silently diverge from the docs.
const REGISTERED_ENTITY = {
  // "No" — surprising, but the matrix is explicit: for a registered entity
  // Razorpay verifies the ENTITY, not the individual signing for it.
  signatoryPan: REQUIREMENT.NOT_REQUIRED,
  businessPan: REQUIREMENT.REQUIRED,
  bankAccount: REQUIREMENT.REQUIRED,
  // "Yes" for all eight registered types — NOT optional, which is what this
  // codebase assumed before this table was consulted.
  gst: REQUIREMENT.REQUIRED,
};

const KYC_REQUIREMENTS = {
  // Razorpay stores the "individual" business_type we send as
  // "not_yet_registered" and gives both their own (identical) column. Both
  // spellings are mapped so a value read back from Razorpay resolves too.
  individual: {
    signatoryPan: REQUIREMENT.REQUIRED,
    businessPan: REQUIREMENT.NOT_APPLICABLE,
    bankAccount: REQUIREMENT.REQUIRED,
    gst: REQUIREMENT.NOT_APPLICABLE,
  },
  not_yet_registered: {
    signatoryPan: REQUIREMENT.REQUIRED,
    businessPan: REQUIREMENT.NOT_APPLICABLE,
    bankAccount: REQUIREMENT.REQUIRED,
    gst: REQUIREMENT.NOT_APPLICABLE,
  },

  // The only row that is neither fully individual nor fully entity: a
  // proprietorship has no legal existence apart from its proprietor, so the
  // entity fields are invited but not demanded.
  //
  // DELIBERATE DEVIATION: Razorpay marks signatoryPan "Conditional" here and
  // gives no footnote saying which condition. We demand it, because the rest
  // of the row makes the condition self-evident — businessPan is only
  // "Optional", so honouring both verdicts literally permits a proprietorship
  // to submit with no PAN of any kind, which cannot pass KYC. Requiring the
  // proprietor's own PAN is the reading that leaves the account viable, and it
  // costs a seller who would have supplied it anyway nothing.
  proprietorship: {
    signatoryPan: REQUIREMENT.REQUIRED,
    businessPan: REQUIREMENT.OPTIONAL,
    bankAccount: REQUIREMENT.REQUIRED,
    gst: REQUIREMENT.OPTIONAL,
  },

  public_limited: { ...REGISTERED_ENTITY },
  private_limited: { ...REGISTERED_ENTITY },
  llp: { ...REGISTERED_ENTITY },
  partnership: { ...REGISTERED_ENTITY },
  trust: { ...REGISTERED_ENTITY },
  ngo: { ...REGISTERED_ENTITY },
  society: { ...REGISTERED_ENTITY },
  educational_institutes: { ...REGISTERED_ENTITY },
};

// "other" is offered in Razorpay's business_type enum but has no row in the
// KYC matrix, so its real requirements are unknown. Falling back to the
// registered-entity row would hard-block sellers on a GST rule we cannot
// source; leaving it undefined here makes getKycRequirements() return the
// lenient profile below instead, and keeps the guess out of the doc mirror.
const UNKNOWN_BUSINESS_TYPE = {
  signatoryPan: REQUIREMENT.OPTIONAL,
  businessPan: REQUIREMENT.REQUIRED, // it is still an entity of some kind
  bankAccount: REQUIREMENT.REQUIRED, // "Yes" in every documented row
  gst: REQUIREMENT.OPTIONAL,
};

function getKycRequirements(businessType) {
  return KYC_REQUIREMENTS[String(businessType || "").trim().toLowerCase()] || UNKNOWN_BUSINESS_TYPE;
}

const isRequired = (verdict) => verdict === REQUIREMENT.REQUIRED;
const isApplicable = (verdict) => verdict !== REQUIREMENT.NOT_APPLICABLE;

module.exports = {
  REQUIREMENT,
  KYC_REQUIREMENTS,
  getKycRequirements,
  isRequired,
  isApplicable,
};
