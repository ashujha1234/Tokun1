import { useEffect, useState } from "react";

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

export default function SellerLinkedAccountForm({
  open,
  onClose,
  token,
  apiBase,
  onSubmitted,
}: SellerLinkedAccountFormProps) {
  const normalizedApiBase = apiBase.replace(/\/$/, "");

  const [phase, setPhase] = useState<Phase>("checking");
  const [errMsg, setErrMsg] = useState<string | null>(null);

  const [accountHolderName, setAccountHolderName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [confirmAccountNumber, setConfirmAccountNumber] = useState("");
  const [ifscCode, setIfscCode] = useState("");
  const [bankName, setBankName] = useState("");
  const [panNumber, setPanNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [street1, setStreet1] = useState("");
  const [street2, setStreet2] = useState(""); // only optional field
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("IN");

  // On open, check whether the seller already has a payout account — if so,
  // skip this form entirely and go straight to the prompt-upload form.
  useEffect(() => {
    if (!open) return;

    let cancelled = false;
    setPhase("checking");
    setErrMsg(null);

    (async () => {
      try {
        const res = await fetch(`${normalizedApiBase}/api/bankaccount/payout-status`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json().catch(() => ({}));
        if (cancelled) return;

        if (res.ok && data?.success && data.hasPayoutSetup) {
          onSubmitted();
          return;
        }
        setPhase("form");
      } catch {
        if (!cancelled) setPhase("form"); // don't block upload over a transient check failure
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open) return null;

  const requiredMissing =
    !accountHolderName.trim() ||
    !accountNumber.trim() ||
    !confirmAccountNumber.trim() ||
    !ifscCode.trim() ||
    !bankName.trim() ||
    !panNumber.trim() ||
    !phone.trim() ||
    !street1.trim() ||
    !city.trim() ||
    !state.trim() ||
    !postalCode.trim() ||
    !country.trim();

  const handleSubmit = async () => {
    if (requiredMissing) {
      setErrMsg("Please fill all required (*) fields.");
      return;
    }
    if (accountNumber.trim() !== confirmAccountNumber.trim()) {
      setErrMsg("Account number and confirmation don't match.");
      return;
    }

    setPhase("submitting");
    setErrMsg(null);

    try {
      const res = await fetch(`${normalizedApiBase}/api/bankaccount/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          payoutMethod: "bank",
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
              ...(street2.trim() ? { street2: street2.trim() } : {}),
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
        throw new Error(data?.message || data?.error || "Could not set up your payout account.");
      }

      setPhase("under_review");
    } catch (e: any) {
      setErrMsg(e?.message || "Something went wrong. Please try again.");
      setPhase("form");
    }
  };

  const inputClass =
    "w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#1A73E8]";
  const labelClass = "text-xs text-white/60 mb-1 block";

  return (
    <div className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-sm overflow-hidden">
      <div className="h-full w-full flex items-center justify-center p-2 sm:p-3 md:p-4">
        <div
          className="relative w-full max-w-[560px] rounded-[20px] overflow-hidden border border-white/10 shadow-2xl flex flex-col"
          style={{
            background:
              "radial-gradient(900px circle at 50% 0%, rgba(26,115,232,0.25), transparent 60%), linear-gradient(180deg,#070A12 0%, #07080A 100%)",
            maxHeight: "calc(100dvh - 16px)",
          }}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/60 hover:text-white z-10"
            aria-label="Close"
          >
            ✕
          </button>

          <div className="p-6 overflow-y-auto">
            {phase === "checking" && (
              <p className="text-white/70 text-sm">Checking your payout setup…</p>
            )}

            {phase === "under_review" && (
              <div className="text-center py-8">
                <h3 className="text-white text-lg font-semibold mb-2">Account under review</h3>
                <p className="text-white/60 text-sm mb-6">
                  We've received your payout details. We are verifying them now — this
                  usually takes a few minutes. Your prompt will go live on the marketplace as
                  soon as verification completes.
                </p>
                <button
                  onClick={onSubmitted}
                  className="rounded-lg bg-[#1A73E8] px-5 py-2 text-sm font-medium text-white hover:opacity-90"
                >
                  Continue to upload your prompt
                </button>
              </div>
            )}

            {(phase === "form" || phase === "submitting") && (
              <>
                <h3 className="text-white text-lg font-semibold mb-1">Set up your payout account</h3>
                <p className="text-white/50 text-sm mb-5">
                  Required before you can sell on Tokun — this is how you'll get paid.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="sm:col-span-2">
                    <label className={labelClass}>Account holder name *</label>
                    <input className={inputClass} value={accountHolderName} onChange={(e) => setAccountHolderName(e.target.value)} />
                  </div>

                  <div>
                    <label className={labelClass}>Bank account number *</label>
                    <input className={inputClass} value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} />
                  </div>
                  <div>
                    <label className={labelClass}>Confirm account number *</label>
                    <input className={inputClass} value={confirmAccountNumber} onChange={(e) => setConfirmAccountNumber(e.target.value)} />
                  </div>

                  <div>
                    <label className={labelClass}>IFSC code *</label>
                    <input className={inputClass} value={ifscCode} onChange={(e) => setIfscCode(e.target.value.toUpperCase())} />
                  </div>
                  <div>
                    <label className={labelClass}>Bank name *</label>
                    <input className={inputClass} value={bankName} onChange={(e) => setBankName(e.target.value)} />
                  </div>

                  <div>
                    <label className={labelClass}>PAN number *</label>
                    <input className={inputClass} value={panNumber} onChange={(e) => setPanNumber(e.target.value.toUpperCase())} placeholder="ABCPE1234F" />
                  </div>
                  <div>
                    <label className={labelClass}>Phone number *</label>
                    <input className={inputClass} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="9000090000" />
                  </div>

                  <div className="sm:col-span-2">
                    <label className={labelClass}>Address line 1 *</label>
                    <input className={inputClass} value={street1} onChange={(e) => setStreet1(e.target.value)} />
                  </div>
                  <div className="sm:col-span-2">
                    <label className={labelClass}>Address line 2 (optional)</label>
                    <input className={inputClass} value={street2} onChange={(e) => setStreet2(e.target.value)} />
                  </div>

                  <div>
                    <label className={labelClass}>City *</label>
                    <input className={inputClass} value={city} onChange={(e) => setCity(e.target.value)} />
                  </div>
                  <div>
                    <label className={labelClass}>State *</label>
                    <input className={inputClass} value={state} onChange={(e) => setState(e.target.value)} />
                  </div>

                  <div>
                    <label className={labelClass}>Postal code *</label>
                    <input className={inputClass} value={postalCode} onChange={(e) => setPostalCode(e.target.value)} />
                  </div>
                  <div>
                    <label className={labelClass}>Country *</label>
                    <input className={inputClass} value={country} onChange={(e) => setCountry(e.target.value.toUpperCase())} />
                  </div>
                </div>

                {errMsg && <p className="text-red-400 text-sm mt-4">{errMsg}</p>}

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
