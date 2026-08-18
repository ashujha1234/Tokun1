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

/* The bank fields had no format checks at all — only "is it blank" and "do the
   two account numbers match". So a transposed IFSC or a phone number with a
   letter in it went through this form, through our own /api/bankaccount/add
   (which checks presence and nothing else), and only failed at Razorpay, whose
   reply comes back as "Your bank account rejected this settlement" — days later,
   on a payout, about a field the seller can no longer see.

   These are shape checks only. Whether the account actually exists is the bank's
   answer to give, and Razorpay's penny-drop asks it. */

// RBI format: 4 bank letters, a literal 0, then a 6-character branch code.
const IFSC_REGEX = /^[A-Z]{4}0[A-Z0-9]{6}$/;

/* Digits only. The upper bound is India's longest account number; the lower is
   deliberately loose rather than the usual 9 — a handful of old accounts are
   shorter, and blocking a real seller is worse than letting the penny-drop
   catch a number that is too short to be real. What this does catch is the
   common damage: letters, dashes and pasted spaces. */
const ACCOUNT_NUMBER_REGEX = /^\d{6,18}$/;

// Indian mobile: 10 digits starting 6-9, after +91/0 and separators are stripped.
const MOBILE_REGEX = /^[6-9]\d{9}$/;

// Indian PIN: 6 digits, never starting with 0. Only applied when country is IN.
const PIN_REGEX = /^[1-9]\d{5}$/;

/* Only the characters people use to group digits — NOT every non-digit.
   Stripping \D would delete letters too, and then "123456abc" reduces to a
   perfectly valid six-digit account number instead of being rejected. Spaces
   and dashes come from pasting; letters are a mistake worth reporting. */
const stripSeparators = (value: string) => value.replace(/[\s\-()]/g, "");

/* Accepts what people actually type — "+91 90000 90000", "091-9000090000" —
   and reduces it to the 10 digits Razorpay wants, without hiding a typo. */
const normalizeMobile = (value: string) => {
  const compact = stripSeparators(value).replace(/^\+/, "");
  if (compact.length === 12 && compact.startsWith("91")) return compact.slice(2);
  if (compact.length === 11 && compact.startsWith("0")) return compact.slice(1);
  return compact;
};

/* A beneficiary name has to match what the bank has on file, so the only thing
   worth rejecting here is input that cannot be a name at all. Digits are left
   alone on purpose: an organization's account is in its registered name, and
   "24x7 Logistics Pvt Ltd" is a real one. */
const looksLikeName = (value: string) =>
  value.trim().length >= 3 && (value.match(/[A-Za-z]/g) || []).length >= 2;

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
  /* Which fields the seller has left, so a "too short" complaint waits until
     they're done with the box rather than arriving on the second keystroke.
     Submit adds every field at once, which is what makes one press surface all
     the remaining problems instead of the first one only. */
  const [touched, setTouched] = useState<Set<string>>(new Set());
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

  const cleanIfsc = ifscCode.trim().toUpperCase();
  const cleanAccountNumber = stripSeparators(accountNumber);

  /* ── One table of what's wrong, used by both the inline notes and submit ──
     The first version of this had the live hints and the submit checks written
     out separately, which is how it ended up warning about the account number
     while an IFSC of "JDHJDHD" and a phone number of "dddhdhdh" sat there
     unremarked. Same rules, two places, and only one of them was thorough.

     Every issue is also tagged with WHEN it may be shown:

       certain — no further typing can make this input valid, so say it now.
                 A letter in a digits-only field. Two account numbers that have
                 already diverged. An IFSC whose 5th character isn't 0.

       shape   — only judgeable once the field is finished, so it waits for
                 blur. "Too short" is the whole category: nagging someone that
                 4 digits isn't a phone number while they type the 5th is how a
                 form becomes something people fight. */
  type Issue = { message: string; certain: boolean } | null;
  const certain = (message: string): Issue => ({ message, certain: true });
  const shape = (message: string): Issue => ({ message, certain: false });

  const hasLetters = (v: string) => /[A-Za-z]/.test(v);
  /* Diverged, not merely shorter — "1234" against "12345" is someone still
     typing, while "1234" against "9876" can never come good. */
  const diverged = (a: string, b: string) =>
    !a.startsWith(b) && !b.startsWith(a);

  const issueFor = (name: string): Issue => {
    switch (name) {
      case "accountHolderName": {
        const v = accountHolderName.trim();
        if (!v) return null;
        if (!hasLetters(v)) return certain("A name needs letters.");
        return looksLikeName(v)
          ? null
          : shape("Enter the account holder's full name, exactly as the bank has it.");
      }
      case "accountNumber": {
        if (!accountNumber.trim()) return null;
        if (hasLetters(accountNumber) || /[^\d\s\-()]/.test(accountNumber))
          return certain("An account number is digits only.");
        return ACCOUNT_NUMBER_REGEX.test(cleanAccountNumber)
          ? null
          : shape("An account number is 6–18 digits.");
      }
      case "confirmAccountNumber": {
        const b = stripSeparators(confirmAccountNumber);
        if (!b || !cleanAccountNumber) return null;
        if (diverged(cleanAccountNumber, b))
          return certain("The two account numbers don't match.");
        return b === cleanAccountNumber
          ? null
          : shape("The two account numbers don't match.");
      }
      case "ifscCode": {
        if (!cleanIfsc) return null;
        const hint = "An IFSC is 4 letters, then 0, then 6 characters — e.g. HDFC0001234.";
        // Judged character by character, so a wrong shape is caught at the 5th
        // keystroke instead of the 11th — which is the whole reason "JDHJDHD"
        // used to pass without a word.
        if (/[^A-Z]/.test(cleanIfsc.slice(0, 4))) return certain(hint);
        if (cleanIfsc.length >= 5 && cleanIfsc[4] !== "0") return certain(hint);
        if (cleanIfsc.length > 11) return certain(hint);
        return IFSC_REGEX.test(cleanIfsc) ? null : shape(hint);
      }
      case "phone": {
        if (!phone.trim()) return null;
        if (hasLetters(phone)) return certain("A phone number is digits only.");
        const mobile = normalizeMobile(phone);
        if (mobile.length > 10) return certain("An Indian mobile number is 10 digits.");
        if (mobile.length === 10 && !MOBILE_REGEX.test(mobile))
          return certain("An Indian mobile number starts with 6, 7, 8 or 9.");
        return MOBILE_REGEX.test(mobile)
          ? null
          : shape("Enter a 10-digit Indian mobile number, e.g. 9000090000.");
      }
      case "postalCode": {
        const v = postalCode.trim();
        // Guarded on country so this stays correct if payouts ever open up
        // outside India — a 6-digit rule is wrong for every other postal system.
        if (!v || country.trim().toUpperCase() !== "IN") return null;
        if (/\D/.test(v)) return certain("A PIN code is digits only.");
        if (v.length > 6) return certain("An Indian PIN code is 6 digits.");
        return PIN_REGEX.test(v) ? null : shape("Enter a 6-digit PIN code, e.g. 560001.");
      }
      case "panNumber": {
        const v = panNumber.trim().toUpperCase();
        if (!v) return null;
        const hint = isOrganization
          ? "Authorised signatory PAN looks invalid — e.g. ABCPE1234F."
          : "PAN looks invalid — e.g. ABCPE1234F.";
        if (v.length >= 10 && !PAN_REGEX.test(v)) return certain(hint);
        return PAN_REGEX.test(v) ? null : shape(hint);
      }
      case "businessPan": {
        const v = businessPan.trim().toUpperCase();
        if (!v || !isOrganization) return null;
        const hint = "Business PAN looks invalid — e.g. AAACA1234A.";
        if (v.length >= 10 && !PAN_REGEX.test(v)) return certain(hint);
        return PAN_REGEX.test(v) ? null : shape(hint);
      }
      case "gstin": {
        const v = gstin.trim().toUpperCase();
        if (!v || !isOrganization) return null;
        const hint = "GSTIN looks invalid — e.g. 27AAACA1234A1Z5.";
        if (v.length >= 15 && !GSTIN_REGEX.test(v)) return certain(hint);
        if (!GSTIN_REGEX.test(v)) return shape(hint);
        /* Characters 3-12 of every GSTIN are the entity's PAN, so a mismatch
           means one of the two fields belongs to a different entity. Only
           comparable when a business PAN was given — a proprietorship may
           legitimately supply a GSTIN without one. */
        if (businessPan.trim() && v.slice(2, 12) !== businessPan.trim().toUpperCase())
          return certain("The PAN inside this GSTIN doesn't match the Business PAN you entered.");
        return null;
      }
      case "percentageOwnership": {
        const v = percentageOwnership.trim();
        if (!v || !isOrganization) return null;
        const n = Number(v);
        return n > 0 && n <= 100
          ? null
          : certain("Ownership % should be a number between 1 and 100.");
      }
      default:
        return null;
    }
  };

  /* The order submit walks, so the seller is sent to the topmost problem rather
     than whichever rule happened to be written first. */
  const VALIDATED_FIELDS = [
    "accountHolderName",
    "accountNumber",
    "confirmAccountNumber",
    "ifscCode",
    "panNumber",
    "phone",
    "postalCode",
    "businessPan",
    "gstin",
    "percentageOwnership",
  ];

  const visibleIssue = (name: string): string | null => {
    const issue = issueFor(name);
    if (!issue) return null;
    return issue.certain || touched.has(name) ? issue.message : null;
  };

  const markTouched = (name: string) =>
    setTouched((prev) => (prev.has(name) ? prev : new Set(prev).add(name)));

  const handleSubmit = async () => {
    /* Marks the whole form touched first, so one press reveals EVERY remaining
       problem inline. The old version returned on the first failing rule, which
       on a form this long meant fix-one, press, fix-one, press. */
    setTouched(new Set(VALIDATED_FIELDS));

    if (requiredMissing) {
      setErrField(null);
      setErrMsg("Please fill all required (*) fields.");
      return;
    }

    /* Walked top-to-bottom, so the banner names the topmost problem — the same
       one the seller's eye lands on first — while the rest are already outlined
       below it. The rules live in issueFor; there is no second copy here. */
    const firstBad = VALIDATED_FIELDS.find((name) => issueFor(name));
    if (firstBad) {
      setErrField(firstBad);
      setErrMsg(issueFor(firstBad)!.message);
      return;
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
          /* Sent as validated, not as typed. A pasted "1234 5678 9012" passed
             the check above on its digits but used to go to Razorpay with the
             spaces still in it, and "+91 90000 90000" went as a 13-character
             contact. Normalising here is what makes the validation mean
             something downstream. */
          accountNumber: cleanAccountNumber,
          confirmAccountNumber: stripSeparators(confirmAccountNumber),
          ifscCode: cleanIfsc,
          bankName: bankName.trim(),
          panNumber: panNumber.trim().toUpperCase(),
          phone: normalizeMobile(phone),
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
  // Red for whichever field the backend named, and now also for any field whose
  // own note is showing — an outline and a message under the same box.
  const fieldClass = (name: string) =>
    errField === name || visibleIssue(name) ? errorInputClass : inputClass;
  const labelClass = "text-xs text-white/60 mb-1 block";

  /* The note under a field, plus the blur that lets "too short" complaints
     appear. Spread onto the input so every validated field gets both without
     each one repeating it. */
  const validated = (name: string) => ({
    className: fieldClass(name),
    onBlur: () => markTouched(name),
  });
  const FieldNote = ({ name }: { name: string }) => {
    const message = visibleIssue(name);
    return message ? <p className="text-[11px] text-amber-300/90 mt-1">{message}</p> : null;
  };

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
                          {...validated("businessPan")}
                          value={businessPan}
                          onChange={(e) => setBusinessPan(e.target.value.toUpperCase())}
                          placeholder="AAACA1234A"
                          maxLength={10}
                        />
                        <FieldNote name="businessPan" />
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
                          {...validated("gstin")}
                          value={gstin}
                          onChange={(e) => setGstin(e.target.value.toUpperCase())}
                          placeholder="27AAACA1234A1Z5"
                          maxLength={15}
                        />
                        <FieldNote name="gstin" />
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
                        {...validated("percentageOwnership")}
                        value={percentageOwnership}
                        onChange={(e) => setPercentageOwnership(e.target.value)}
                        placeholder="e.g. 60"
                        inputMode="numeric"
                      />
                      <FieldNote name="percentageOwnership" />
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="sm:col-span-2">
                    <label className={labelClass}>
                      {isOrganization ? "Bank account holder name *" : "Account holder name *"}
                    </label>
                    <input {...validated("accountHolderName")} value={accountHolderName} onChange={(e) => setAccountHolderName(e.target.value)} />
                    <FieldNote name="accountHolderName" />
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
                    <input
                      {...validated("accountNumber")}
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      inputMode="numeric"
                      autoComplete="off"
                      maxLength={24}
                    />
                    <FieldNote name="accountNumber" />
                  </div>
                  <div>
                    <label className={labelClass}>Confirm account number *</label>
                    <input
                      {...validated("confirmAccountNumber")}
                      value={confirmAccountNumber}
                      onChange={(e) => setConfirmAccountNumber(e.target.value)}
                      inputMode="numeric"
                      autoComplete="off"
                      maxLength={24}
                    />
                    <FieldNote name="confirmAccountNumber" />
                  </div>

                  <div>
                    <label className={labelClass}>IFSC code *</label>
                    <input
                      {...validated("ifscCode")}
                      value={ifscCode}
                      onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                      placeholder="HDFC0001234"
                      autoComplete="off"
                      maxLength={11}
                    />
                    <FieldNote name="ifscCode" />
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
                    <input {...validated("panNumber")} value={panNumber} onChange={(e) => setPanNumber(e.target.value.toUpperCase())} placeholder="ABCPE1234F" maxLength={10} />
                    <FieldNote name="panNumber" />
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
                    <input
                      {...validated("phone")}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="9000090000"
                      inputMode="tel"
                      autoComplete="tel"
                    />
                    <FieldNote name="phone" />
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
                    <input
                      {...validated("postalCode")}
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      placeholder="560001"
                      inputMode="numeric"
                      autoComplete="postal-code"
                      maxLength={10}
                    />
                    <FieldNote name="postalCode" />
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
