import { useEffect, useState } from "react";
import { X } from "lucide-react";
import {
  peekPayoutStatus,
  getPayoutStatus,
  getBusinessCategories,
  clearPayoutStatus,
} from "@/lib/sellerPrefetch";

interface SellerLinkedAccountFormProps {
  open: boolean;
  onClose: () => void;
  token: string;
  apiBase: string;
  // Called once the seller is clear to proceed to the actual prompt-upload
  // form — either because they already have a payout account set up, or
  // because they just finished submitting this form.
  onSubmitted: () => void;
}

type Phase = "checking" | "form" | "submitting" | "under_review" | "error";

type SellerType = "individual" | "organization";

// Mirrors ORG_BUSINESS_TYPES in server/routes/bankAccounts.js — these strings
// are Razorpay's own `business_type` enum and go through to its API verbatim,
// so the values must stay in sync with the backend's allow-list.
const BUSINESS_TYPES: { value: string; label: string }[] = [
  { value: "proprietorship", label: "Proprietorship" },
  { value: "partnership", label: "Partnership firm" },
  { value: "private_limited", label: "Private Limited" },
  { value: "public_limited", label: "Public Limited" },
  { value: "llp", label: "LLP" },
  { value: "trust", label: "Trust" },
  { value: "society", label: "Society" },
  { value: "ngo", label: "NGO" },
  { value: "educational_institutes", label: "Educational institute" },
  { value: "other", label: "Other" },
];

// The 4th character of a PAN encodes the holder type, so it has to agree with
// the declared business type. Checked here purely so the seller sees the
// problem while typing — the backend enforces the same rule authoritatively.
//
// This governs the BUSINESS PAN, and Razorpay's own regex for legal_info.pan
// accepts only C/H/F/A/T/B/J/G/L — "P" (personal) is never valid in that
// field, for any business type.
const BUSINESS_TYPE_PAN_LETTERS: Record<string, string[] | null> = {
  proprietorship: ["C", "H", "F", "A", "T", "B", "J", "G", "L"],
  partnership: ["F"],
  llp: ["F"],
  private_limited: ["C"],
  public_limited: ["C"],
  trust: ["T"],
  society: ["A", "T", "B"],
  ngo: ["A", "T", "B"],
  educational_institutes: ["A", "T", "C", "J"],
  other: null,
};

const PAN_REGEX = /^[A-Z]{3}[PCHFATBJGL][A-Z]\d{4}[A-Z]$/;
const GSTIN_REGEX = /^\d{2}[A-Z]{5}\d{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;

// Razorpay's business categories are fetched rather than hardcoded like
// BUSINESS_TYPES above — there are ~340 sub-categories and they have to match
// Razorpay's enum exactly, so the backend serves the one copy it also
// validates against.
type BusinessCategories = Record<string, string[]>;

// Razorpay's per-business-type KYC matrix, fetched with the categories. See
// server/constants/kycRequirements.js for what each verdict means; the only
// two the UI acts on are "required" (star the label, block submit) and
// "not_applicable" (don't render the field at all).
type KycVerdict = "required" | "not_required" | "optional" | "conditional" | "not_applicable";
type KycRule = {
  signatoryPan: KycVerdict;
  businessPan: KycVerdict;
  bankAccount: KycVerdict;
  gst: KycVerdict;
};

// Until the matrix arrives every field renders as optional, which is the safe
// direction to fail: the backend validates against the same table regardless,
// so nothing invalid gets through — the seller just isn't warned as early.
const PERMISSIVE_KYC_RULE: KycRule = {
  signatoryPan: "optional",
  businessPan: "optional",
  bankAccount: "required",
  gst: "optional",
};

const req = (verdict: KycVerdict) => verdict === "required";
const shown = (verdict: KycVerdict) => verdict !== "not_applicable";
// Labels carry the requirement so the seller can tell at a glance which
// blanks will actually stop them, instead of discovering it on submit.
const star = (verdict: KycVerdict) => (req(verdict) ? " *" : " (optional)");

// "ecommerce_marketplace" → "Ecommerce marketplace". Razorpay's enum is
// snake_case machine values with no display names of their own, and deriving
// labels keeps the fetched list usable without shipping a parallel dictionary
// that would need updating every time Razorpay adds a value.
const humanizeCategory = (value: string) =>
  value.replace(/_/g, " ").replace(/^./, (c) => c.toUpperCase());

export default function SellerLinkedAccountForm({
  open,
  onClose,
  token,
  apiBase,
  onSubmitted,
}: SellerLinkedAccountFormProps) {
  const normalizedApiBase = apiBase.replace(/\/$/, "");

  // Starts on "form" whenever the prefetched status already says this seller
  // has no payout account — the spinner would only be showing a question we
  // already know the answer to.
  const prefetched = peekPayoutStatus(token);
  const [phase, setPhase] = useState<Phase>(
    prefetched?.ok && prefetched.canSell !== false && !prefetched.hasPayoutSetup
      ? "form"
      : "checking"
  );
  const [errMsg, setErrMsg] = useState<string | null>(null);
  // Set from the backend's `field` when Razorpay pinned the failure to one
  // input. Null for errors that aren't about a specific value.
  const [errField, setErrField] = useState<string | null>(null);

  // Not a choice the seller makes — the backend derives it from their account
  // type (an ORG workspace is a registered entity by definition) and returns it
  // from payout-status. We only use it to decide which fields to render.
  const [sellerType, setSellerType] = useState<SellerType>(
    prefetched?.sellerType === "organization" ? "organization" : "individual"
  );

  // Organization-only.
  const [businessType, setBusinessType] = useState("");
  const [legalBusinessName, setLegalBusinessName] = useState("");
  const [customerFacingBusinessName, setCustomerFacingBusinessName] = useState("");
  const [businessPan, setBusinessPan] = useState("");
  const [gstin, setGstin] = useState("");
  const [stakeholderName, setStakeholderName] = useState("");
  const [percentageOwnership, setPercentageOwnership] = useState("");

  const [accountHolderName, setAccountHolderName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [confirmAccountNumber, setConfirmAccountNumber] = useState("");
  const [ifscCode, setIfscCode] = useState("");
  const [bankName, setBankName] = useState("");
  const [panNumber, setPanNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [street1, setStreet1] = useState("");
  const [street2, setStreet2] = useState(""); // required by Razorpay — see the submit guard
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("IN");

  // Asked of both seller types — every Linked Account carries its own
  // category, describing what that seller sells rather than what Tokun is.
  const [businessCategories, setBusinessCategories] = useState<BusinessCategories>({});
  const [kycMatrix, setKycMatrix] = useState<Record<string, KycRule>>({});
  const [businessCategory, setBusinessCategory] = useState("");
  const [businessSubcategory, setBusinessSubcategory] = useState("");

  // On open, check whether the seller already has a payout account — if so,
  // skip this form entirely and go straight to the prompt-upload form.
  //
  // Both requests are served from the prefetch cache and, crucially, run
  // concurrently. They used to be strictly serial — the category list was only
  // requested after payout-status came back, and the form waited on both — so
  // opening this form cost two full round-trips end to end.
  useEffect(() => {
    if (!open) return;

    let cancelled = false;
    setErrMsg(null);

    // Fired now, not after the status resolves. The dropdown is far down the
    // form; it only has to be ready before the seller scrolls to it.
    getBusinessCategories(normalizedApiBase, token).then((cats) => {
      if (cancelled || !cats) return;
      setBusinessCategories(cats.categories);
      setKycMatrix(cats.kycRequirements);
    });

    (async () => {
      const data = await getPayoutStatus(normalizedApiBase, token);
      if (cancelled) return;

      // The request itself failed — don't block upload over a transient check
      // failure, same as before.
      if (!data.ok) {
        setPhase("form");
        return;
      }

      // Team members can't sell. Checked BEFORE hasPayoutSetup, because the
      // server reports that as true for them (they have nothing to set up) —
      // falling through would call onSubmitted() and open the Sell modal,
      // which is the one thing a team member must not reach.
      if (data.canSell === false) {
        setErrMsg(
          data.message ||
            "Your organization handles selling. Ask your org owner to publish this from the organization account."
        );
        setPhase("error");
        return;
      }

      if (data.success && data.hasPayoutSetup) {
        onSubmitted();
        return;
      }

      if (data.sellerType === "organization") {
        setSellerType("organization");
      }

      setPhase("form");
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open) return null;

  const isOrganization = sellerType === "organization";

  // Which KYC row applies. An organization that hasn't picked a business type
  // yet has no row — the permissive default keeps every field un-starred until
  // the choice that determines them is made, rather than showing requirements
  // that may be wrong a moment later.
  const kycRule: KycRule =
    (isOrganization ? kycMatrix[businessType] : kycMatrix.individual) ?? PERMISSIVE_KYC_RULE;

  const requiredMissing =
    !accountHolderName.trim() ||
    !accountNumber.trim() ||
    !confirmAccountNumber.trim() ||
    !ifscCode.trim() ||
    !bankName.trim() ||
    !phone.trim() ||
    !street1.trim() ||
    /* Razorpay requires street2 on a linked account's registered address, and
       rejects the whole submission with "The street2 field is required." Our
       form called it optional and left it out when blank, so people filled the
       form correctly by our own labelling and were bounced by an error from an
       API they've never heard of. */
    !street2.trim() ||
    !city.trim() ||
    !state.trim() ||
    !postalCode.trim() ||
    !country.trim() ||
    !businessCategory ||
    !businessSubcategory ||
    // PAN fields follow the matrix rather than the seller type: a registered
    // entity doesn't need a signatory PAN at all, while a proprietorship
    // doesn't need a business PAN.
    (req(kycRule.signatoryPan) && !panNumber.trim()) ||
    (isOrganization &&
      (!businessType.trim() ||
        !legalBusinessName.trim() ||
        !stakeholderName.trim() ||
        (req(kycRule.businessPan) && !businessPan.trim()) ||
        (req(kycRule.gst) && !gstin.trim())));

  const categoryNames = Object.keys(businessCategories);
  // Empty until a category is picked, which is what disables the second
  // dropdown — the pair is only valid within one category, so there is
  // nothing meaningful to show before then.
  const subcategoryNames = businessCategories[businessCategory] ?? [];

  // Live hint under the Business PAN field — surfaced as you type rather than
  // waiting for a submit round-trip, since a PAN/business-type mismatch is the
  // single most common reason an org account gets flagged during KYC.
  const allowedPanLetters = BUSINESS_TYPE_PAN_LETTERS[businessType] ?? null;
  const businessPanTypeWarning =
    isOrganization &&
    allowedPanLetters &&
    businessPan.trim().length >= 4 &&
    !allowedPanLetters.includes(businessPan.trim()[3])
      ? `A ${
          BUSINESS_TYPES.find((b) => b.value === businessType)?.label ?? "business"
        } PAN normally has "${allowedPanLetters.join('" or "')}" as its 4th character.`
      : null;

  const handleSubmit = async () => {
    if (requiredMissing) {
      setErrMsg("Please fill all required (*) fields.");
      return;
    }
    if (accountNumber.trim() !== confirmAccountNumber.trim()) {
      setErrMsg("Account number and confirmation don't match.");
      return;
    }
    // Format is checked only on what was actually filled in — requiredMissing
    // above has already caught anything mandatory that's blank, so a PAN that
    // is empty here is one the matrix says may be left empty.
    if (panNumber.trim() && !PAN_REGEX.test(panNumber.trim().toUpperCase())) {
      setErrMsg(
        isOrganization
          ? "Authorised signatory PAN looks invalid — e.g. ABCPE1234F."
          : "PAN looks invalid — e.g. ABCPE1234F."
      );
      return;
    }

    if (isOrganization) {
      if (businessPan.trim() && !PAN_REGEX.test(businessPan.trim().toUpperCase())) {
        setErrMsg("Business PAN looks invalid — e.g. AAACA1234A.");
        return;
      }
      // Whether a GSTIN was required is already settled above; a malformed one
      // is always a typo either way.
      const cleanGstin = gstin.trim().toUpperCase();
      if (cleanGstin && !GSTIN_REGEX.test(cleanGstin)) {
        setErrMsg("GSTIN looks invalid — e.g. 27AAACA1234A1Z5.");
        return;
      }
      // Characters 3-12 of every GSTIN are the entity's PAN, so a mismatch
      // means one of the two fields belongs to a different entity. Only
      // comparable when a business PAN was given — a proprietorship may
      // legitimately supply a GSTIN without one.
      if (cleanGstin && businessPan.trim() && cleanGstin.slice(2, 12) !== businessPan.trim().toUpperCase()) {
        setErrMsg("The PAN inside this GSTIN doesn't match the Business PAN you entered.");
        return;
      }
    }

    setPhase("submitting");
    setErrMsg(null);
    setErrField(null);

    try {
      const res = await fetch(`${normalizedApiBase}/api/bankaccount/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          payoutMethod: "bank",
          // No sellerType is sent — the backend derives it from the seller's
          // own account type and ignores anything the client claims.
          // Organization-only fields, skipped entirely otherwise.
          ...(isOrganization
            ? {
                businessType,
                legalBusinessName: legalBusinessName.trim(),
                customerFacingBusinessName: customerFacingBusinessName.trim(),
                businessPan: businessPan.trim().toUpperCase(),
                gstin: gstin.trim().toUpperCase(),
                stakeholderName: stakeholderName.trim(),
                percentageOwnership: percentageOwnership.trim(),
              }
            : {}),
          businessCategory,
          businessSubcategory,
          accountHolderName: accountHolderName.trim(),
          accountNumber: accountNumber.trim(),
          confirmAccountNumber: confirmAccountNumber.trim(),
          ifscCode: ifscCode.trim(),
          bankName: bankName.trim(),
          panNumber: panNumber.trim(),
          phone: phone.trim(),
          addresses: {
            registered: {
              street1: street1.trim(),
              street2: street2.trim(),
              city: city.trim(),
              state: state.trim(),
              postal_code: postalCode.trim(),
              country: country.trim(),
            },
          },
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data?.success) {
        // The backend names the offending input when Razorpay identified one,
        // so the seller is taken to the box to fix rather than left to work it
        // out from a banner at the top of a long form.
        setErrField(data?.field ?? null);
        throw new Error(data?.message || "Could not set up your payout account.");
      }

      // The cached "no payout account" answer is now wrong — drop it so the
      // next Upload click asks again instead of reopening this form.
      clearPayoutStatus();

      // …and immediately refill it. There is exactly ONE linked account per
      // seller, shared by prompt selling and freelancing, so whoever set it up
      // first must never be asked again by the other flow.
      //
      // Clearing alone already achieved that — the next Upload click re-fetched,
      // saw hasPayoutSetup and skipped straight through — but it did so via a
      // visible "Checking your payout setup…" frame, because Header reads the
      // snapshot synchronously (see peekPayoutStatus) and an empty cache reads
      // the same as "don't know". Re-priming now means the next click has the
      // answer in hand and opens the Sell modal directly.
      void getPayoutStatus(normalizedApiBase, token, { force: true });

      setPhase("under_review");
    } catch (e: any) {
      setErrMsg(e?.message || "Something went wrong. Please try again.");
      setPhase("form");
    }
  };

  const inputClass =
    "w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#1A73E8]";
  // Same box, outlined in red — applied to whichever field the backend named.
  const errorInputClass =
    "w-full rounded-lg bg-white/5 border border-red-500/60 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-red-400";
  const fieldClass = (name: string) => (errField === name ? errorInputClass : inputClass);
  const labelClass = "text-xs text-white/60 mb-1 block";

  return (
    <div className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-sm overflow-hidden">
      <div className="h-full w-full flex items-center justify-center p-2 sm:p-3 md:p-4">
        {/* max-h-full, not `calc(100dvh - 16px)`.

            That calc was the actual reason the close button came out sliced.
            The wrapper above pads by up to 16px on EACH side (md:p-4), leaving
            100dvh − 32px of room, but the card was allowed to grow to
            100dvh − 16px — 16px too tall. Centred in a container that clips,
            the excess split evenly and took 8px off the top of the card, right
            where the button sits. A percentage max-height resolves against the
            wrapper's content box, so it fits exactly at every breakpoint
            instead of guessing at the padding. */}
        <div
          className="relative w-full max-w-[560px] max-h-full rounded-[20px] overflow-hidden border border-white/10 shadow-2xl flex flex-col"
          style={{
            background:
              "radial-gradient(900px circle at 50% 0%, rgba(26,115,232,0.25), transparent 60%), linear-gradient(180deg,#070A12 0%, #07080A 100%)",
          }}
        >
          {/* The close button is a row of its own, not a bare "✕" floated over
              the content on `absolute top-4 right-4`. Positioned that way it sat
              on top of a container with `overflow-hidden` and a 20px corner
              radius, with the form's own scrolling heading passing underneath —
              which is what left it looking sliced. A flex row at the top of the
              card cannot be clipped by the corner and nothing can scroll
              through it. */}
          <div className="flex shrink-0 items-center justify-end px-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="grid h-8 w-8 place-items-center rounded-full border border-white/10 bg-white/5 text-white/70 transition hover:bg-white/10 hover:text-white"
              aria-label="Close"
            >
              <X className="h-4 w-4" strokeWidth={2.25} />
            </button>
          </div>

          <div className="px-6 pb-6 pt-1 overflow-y-auto">
            {phase === "checking" && (
              <p className="text-white/70 text-sm">Checking your payout setup…</p>
            )}

            {/* "error" was in the Phase union but had no branch here, so setting
                it rendered an empty dialog. It's the state a team member lands
                in — they need to be told why, not shown a blank box. */}
            {phase === "error" && (
              <div className="text-center py-8">
                <h3 className="text-white text-lg font-semibold mb-2">
                  Selling is handled by your organization
                </h3>
                <p className="text-white/60 text-sm mb-6">
                  {errMsg || "You can't set up a payout account on this type of account."}
                </p>
                <button
                  onClick={onClose}
                  className="rounded-lg bg-[#1A73E8] px-5 py-2 text-sm font-medium text-white hover:opacity-90"
                >
                  Got it
                </button>
              </div>
            )}

            {phase === "under_review" && (
              <div className="text-center py-8">
                <h3 className="text-white text-lg font-semibold mb-2">Account under review</h3>
                <p className="text-white/60 text-sm mb-6">
                  We've received your payout details. We are verifying them now —{" "}
                  {sellerType === "organization"
                    ? "registered businesses are checked against government records, so this can take a working day or two, and we may ask for your incorporation or GST certificate."
                    : "this usually takes a few minutes."}{" "}
                  Your product will go live on the marketplace as soon as verification completes.
                </p>
                <button
                  onClick={onSubmitted}
                  className="rounded-lg bg-[#1A73E8] px-5 py-2 text-sm font-medium text-white hover:opacity-90"
                >
                  Continue to upload your product
                </button>
              </div>
            )}

            {(phase === "form" || phase === "submitting") && (
              <>
                <h3 className="text-white text-lg font-semibold mb-1">Set up your payout account</h3>
                <p className="text-white/50 text-sm mb-4">
                  Required before you can sell on Tokun — this is how you'll get paid.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5 rounded-xl border border-white/10 bg-white/[0.03] p-4">
                  <p className="sm:col-span-2 text-xs text-white/45 -mt-0.5">
                    {isOrganization
                      ? "Pick what your business actually sells — this is checked against the line of business on your GST/incorporation record, so a mismatch will hold up verification."
                      : "Pick what you sell. This classifies your payout account with Razorpay."}
                  </p>

                  <div>
                    <label className={labelClass}>Business category *</label>
                    <select
                      className={fieldClass("businessCategory")}
                      value={businessCategory}
                      disabled={categoryNames.length === 0}
                      onChange={(e) => {
                        setBusinessCategory(e.target.value);
                        // The old sub-category belongs to the old category and
                        // would be rejected as a cross-category pair.
                        setBusinessSubcategory("");
                      }}
                    >
                      <option value="" className="bg-[#0B0F17]">Select category</option>
                      {categoryNames.map((name) => (
                        <option key={name} value={name} className="bg-[#0B0F17]">
                          {humanizeCategory(name)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className={labelClass}>Sub-category *</label>
                    <select
                      className={fieldClass("businessSubcategory")}
                      value={businessSubcategory}
                      disabled={!businessCategory}
                      onChange={(e) => setBusinessSubcategory(e.target.value)}
                    >
                      <option value="" className="bg-[#0B0F17]">
                        {businessCategory ? "Select sub-category" : "Pick a category first"}
                      </option>
                      {subcategoryNames.map((name) => (
                        <option key={name} value={name} className="bg-[#0B0F17]">
                          {humanizeCategory(name)}
                        </option>
                      ))}
                    </select>
                  </div>

                  {categoryNames.length === 0 && (
                    <p className="sm:col-span-2 text-[11px] text-amber-400/80">
                      Couldn't load the category list. Please close and reopen this form — we
                      can't submit your account without it.
                    </p>
                  )}
                </div>

                {isOrganization && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5 rounded-xl border border-white/10 bg-white/[0.03] p-4">
                    <p className="sm:col-span-2 text-xs text-white/45 -mt-0.5">
                      Enter these exactly as they appear on your incorporation or GST
                      certificate — they're verified against government records.
                    </p>

                    <div className="sm:col-span-2">
                      <label className={labelClass}>Business type *</label>
                      <select
                        className={fieldClass("businessType")}
                        value={businessType}
                        onChange={(e) => setBusinessType(e.target.value)}
                      >
                        <option value="" className="bg-[#0B0F17]">Select business type</option>
                        {BUSINESS_TYPES.map((option) => (
                          <option key={option.value} value={option.value} className="bg-[#0B0F17]">
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label className={labelClass}>Registered business name *</label>
                      <input
                        className={fieldClass("legalBusinessName")}
                        value={legalBusinessName}
                        onChange={(e) => setLegalBusinessName(e.target.value)}
                        placeholder="Acme Healthcare Private Limited"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className={labelClass}>Display name shown to buyers (optional)</label>
                      <input
                        className={fieldClass("customerFacingBusinessName")}
                        value={customerFacingBusinessName}
                        onChange={(e) => setCustomerFacingBusinessName(e.target.value)}
                        placeholder={legalBusinessName || "Acme Clinic"}
                      />
                    </div>

                    {shown(kycRule.businessPan) && (
                      <div>
                        <label className={labelClass}>Business PAN{star(kycRule.businessPan)}</label>
                        <input
                          className={fieldClass("businessPan")}
                          value={businessPan}
                          onChange={(e) => setBusinessPan(e.target.value.toUpperCase())}
                          placeholder="AAACA1234A"
                        />
                        {businessType === "proprietorship" && (
                          <p className="text-[11px] text-white/40 mt-1">
                            A proprietorship has no PAN of its own — leave this blank and enter the
                            proprietor's PAN below instead.
                          </p>
                        )}
                        {businessPanTypeWarning && (
                          <p className="text-[11px] text-amber-400/80 mt-1">{businessPanTypeWarning}</p>
                        )}
                      </div>
                    )}

                    {shown(kycRule.gst) && (
                      <div>
                        <label className={labelClass}>GSTIN{star(kycRule.gst)}</label>
                        <input
                          className={fieldClass("gstin")}
                          value={gstin}
                          onChange={(e) => setGstin(e.target.value.toUpperCase())}
                          placeholder="27AAACA1234A1Z5"
                        />
                        <p className="text-[11px] text-white/40 mt-1">
                          {req(kycRule.gst)
                            ? "Razorpay requires a GSTIN for this business type."
                            : "Leave blank if you're not GST-registered."}
                        </p>
                      </div>
                    )}

                    <div>
                      <label className={labelClass}>Authorised signatory name *</label>
                      <input
                        className={fieldClass("stakeholderName")}
                        value={stakeholderName}
                        onChange={(e) => setStakeholderName(e.target.value)}
                        placeholder="Director / partner name"
                      />
                    </div>

                    <div>
                      <label className={labelClass}>Their ownership % (optional)</label>
                      <input
                        className={fieldClass("percentageOwnership")}
                        value={percentageOwnership}
                        onChange={(e) => setPercentageOwnership(e.target.value)}
                        placeholder="e.g. 60"
                        inputMode="numeric"
                      />
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="sm:col-span-2">
                    <label className={labelClass}>
                      {isOrganization ? "Bank account holder name *" : "Account holder name *"}
                    </label>
                    <input className={fieldClass("accountHolderName")} value={accountHolderName} onChange={(e) => setAccountHolderName(e.target.value)} />
                    {isOrganization && (
                      <p className="text-[11px] text-white/40 mt-1">
                        Use your <span className="text-white/60">current account</span> in the
                        registered business name — a savings account or a personal name here will
                        fail bank verification.
                      </p>
                    )}
                  </div>

                  <div>
                    <label className={labelClass}>Bank account number *</label>
                    <input className={fieldClass("accountNumber")} value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} />
                  </div>
                  <div>
                    <label className={labelClass}>Confirm account number *</label>
                    <input className={fieldClass("confirmAccountNumber")} value={confirmAccountNumber} onChange={(e) => setConfirmAccountNumber(e.target.value)} />
                  </div>

                  <div>
                    <label className={labelClass}>IFSC code *</label>
                    <input className={fieldClass("ifscCode")} value={ifscCode} onChange={(e) => setIfscCode(e.target.value.toUpperCase())} />
                  </div>
                  <div>
                    <label className={labelClass}>Bank name *</label>
                    <input className={fieldClass("bankName")} value={bankName} onChange={(e) => setBankName(e.target.value)} />
                  </div>

                  <div>
                    <label className={labelClass}>
                      {isOrganization ? "Authorised signatory PAN" : "PAN number"}
                      {star(kycRule.signatoryPan)}
                    </label>
                    <input className={fieldClass("panNumber")} value={panNumber} onChange={(e) => setPanNumber(e.target.value.toUpperCase())} placeholder="ABCPE1234F" />
                    {isOrganization && (
                      <p className="text-[11px] text-white/40 mt-1">
                        {businessType === "proprietorship"
                          ? "The proprietor's own PAN — this is the PAN your account is verified against."
                          : "The signatory's personal PAN, not the business PAN above."}
                        {!req(kycRule.signatoryPan) &&
                          " Razorpay verifies the entity for this business type, so this is optional — but it speeds up review."}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className={labelClass}>Phone number *</label>
                    <input className={fieldClass("phone")} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="9000090000" />
                  </div>

                  <div className="sm:col-span-2">
                    <p className={labelClass}>
                      {isOrganization
                        ? "Registered office address — must match your COI/GST certificate"
                        : "Address"}
                    </p>
                  </div>

                  <div className="sm:col-span-2">
                    <label className={labelClass}>Address line 1 *</label>
                    <input className={fieldClass("street1")} value={street1} onChange={(e) => setStreet1(e.target.value)} />
                  </div>
                  <div className="sm:col-span-2">
                    <label className={labelClass}>Address line 2 *</label>
                    <input className={fieldClass("street2")} value={street2} onChange={(e) => setStreet2(e.target.value)} />
                  </div>

                  <div>
                    <label className={labelClass}>City *</label>
                    <input className={fieldClass("city")} value={city} onChange={(e) => setCity(e.target.value)} />
                  </div>
                  <div>
                    <label className={labelClass}>State *</label>
                    <input className={fieldClass("state")} value={state} onChange={(e) => setState(e.target.value)} />
                  </div>

                  <div>
                    <label className={labelClass}>Postal code *</label>
                    <input className={fieldClass("postalCode")} value={postalCode} onChange={(e) => setPostalCode(e.target.value)} />
                  </div>
                  <div>
                    <label className={labelClass}>Country *</label>
                    <input className={fieldClass("country")} value={country} onChange={(e) => setCountry(e.target.value.toUpperCase())} />
                  </div>
                </div>

                {errMsg && (
                  <div className="mt-4 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2.5">
                    <p className="text-red-300 text-sm">{errMsg}</p>
                    {errField && (
                      <p className="text-red-400/70 text-[11px] mt-1">
                        The field to correct is outlined above.
                      </p>
                    )}
                  </div>
                )}

                <button
                  onClick={handleSubmit}
                  disabled={phase === "submitting"}
                  className="mt-5 w-full rounded-lg bg-[#1A73E8] px-5 py-2.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
                >
                  {phase === "submitting" ? "Submitting…" : "Submit for verification"}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
