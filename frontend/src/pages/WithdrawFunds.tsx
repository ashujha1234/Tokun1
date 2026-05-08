import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ChevronDown, Info, Landmark, X, Check } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

type WalletAccount = {
  id: string;
  name: string;
  last4: string;
  ifsc?: string;
  isDefault?: boolean;
  iconBg: string;
  iconColor: string;
};

type BankForm = {
  holder: string;
  accNum: string;
  confirmAccNum: string;
  ifsc: string;
  bankName: string;
};

const WithdrawFunds = () => {
  const navigate = useNavigate();
  const { token, user } = useAuth() as any;

  const fontBase = "Inter, system-ui, Arial, sans-serif";

  const API_BASE =
    (import.meta as any).env?.VITE_API_URL?.replace(/\/$/, "") || "";

  const BANK_ADD_URL = API_BASE
    ? `${API_BASE}/api/bankaccount/add`
    : "/api/bankaccount/add";

  const BANK_LIST_URL = API_BASE
    ? `${API_BASE}/api/bankaccount`
    : "/api/bankaccount";

  const userId = user?._id || user?.id || user?.email || "guest";
  const WALLET_ACCOUNTS_KEY = `tokun_wallet_accounts_${userId}`;

  const [accounts, setAccounts] = useState<WalletAccount[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<string>("");
  const [amount, setAmount] = useState("");
  const [addBankOpen, setAddBankOpen] = useState(false);
  const [successPopupOpen, setSuccessPopupOpen] = useState(false);
  const [latestAddedAccount, setLatestAddedAccount] =
    useState<WalletAccount | null>(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const [formError, setFormError] = useState("");

  const [bankForm, setBankForm] = useState<BankForm>({
    holder: "",
    accNum: "",
    confirmAccNum: "",
    ifsc: "",
    bankName: "",
  });

  const availableToWithdraw = 42850;
  const totalEarning = 198200;
  const monthlyEarning = 24650;

  const withdrawAmount = Number(amount || 0);
  const serviceFee = withdrawAmount > 0 ? withdrawAmount * 0.02 : 0;
  const estimatedTotal = withdrawAmount > 0 ? withdrawAmount - serviceFee : 0;

  const confirmButtonTextStyle: CSSProperties = {
    fontFamily: fontBase,
    fontWeight: 700,
    fontStyle: "normal",
    fontSize: 16,
    lineHeight: "100%",
    letterSpacing: "0%",
    textAlign: "center",
  };

  const summaryLabelStyle: CSSProperties = {
    fontFamily: fontBase,
    fontWeight: 400,
    fontStyle: "normal",
    fontSize: 14,
    lineHeight: "100%",
    letterSpacing: 0,
    color: "#71717A",
    whiteSpace: "nowrap",
  };

  const summaryValueStyle: CSSProperties = {
    fontFamily: fontBase,
    fontWeight: 500,
    fontStyle: "normal",
    fontSize: 14,
    lineHeight: "100%",
    letterSpacing: 0,
    color: "#FFFFFF",
    whiteSpace: "nowrap",
  };

  const plusMaskStyle = (size: number, color: string): CSSProperties => ({
    width: size,
    height: size,
    opacity: 1,
    display: "inline-block",
    flexShrink: 0,
    backgroundColor: color,
    WebkitMask: "url('/icons/pluss.svg') center / contain no-repeat",
    mask: "url('/icons/pluss.svg') center / contain no-repeat",
  });

  const getAuthToken = () =>
    token ||
    localStorage.getItem("auth_token") ||
    sessionStorage.getItem("auth_token") ||
    localStorage.getItem("token") ||
    sessionStorage.getItem("token") ||
    "";

  const onlyLetters = (value: string) =>
    value
      .replace(/[^A-Za-z\s]/g, "")
      .replace(/\s{2,}/g, " ")
      .replace(/^\s+/, "");

  const onlyDigits = (value: string) => value.replace(/\D/g, "").slice(0, 18);

  const resetBankForm = () => {
    setBankForm({
      holder: "",
      accNum: "",
      confirmAccNum: "",
      ifsc: "",
      bankName: "",
    });
    setFormError("");
  };

  const mapApiAccount = (ba: any): WalletAccount => ({
    id: String(ba?._id || crypto.randomUUID()),
    name: String(ba?.bankName || "Bank Account"),
    last4: String(ba?.accountNumber || "").slice(-4) || "0000",
    ifsc: String(ba?.ifscCode || "").toUpperCase(),
    isDefault: !!ba?.default,
    iconBg: "bg-[#1A73E8]/25",
    iconColor: "text-[#1A73E8]",
  });

  const fetchBankAccounts = async () => {
    const authToken = getAuthToken();

    try {
      const raw = localStorage.getItem(WALLET_ACCOUNTS_KEY);

      if (raw) {
        const parsed = JSON.parse(raw);

        if (Array.isArray(parsed)) {
          setAccounts(parsed);

          if (parsed.length && !selectedAccountId) {
            setSelectedAccountId(parsed[0].id);
          }
        }
      }
    } catch {}

    if (!authToken) return;

    try {
      const res = await fetch(BANK_LIST_URL, {
        method: "GET",
        headers: { Authorization: `Bearer ${authToken}` },
        credentials: "include",
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !Array.isArray(data?.accounts)) return;

      const mapped = data.accounts.map(mapApiAccount);

      setAccounts(mapped);
      localStorage.setItem(WALLET_ACCOUNTS_KEY, JSON.stringify(mapped));

      if (mapped.length) {
        setSelectedAccountId((prev) => prev || mapped[0].id);
      }
    } catch {}
  };

  useEffect(() => {
    fetchBankAccounts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [WALLET_ACCOUNTS_KEY]);

  useEffect(() => {
    localStorage.setItem(WALLET_ACCOUNTS_KEY, JSON.stringify(accounts));
  }, [WALLET_ACCOUNTS_KEY, accounts]);

  const handleSaveBank = async () => {
    const holder = bankForm.holder.trim();
    const accNum = bankForm.accNum.trim();
    const confirmAccNum = bankForm.confirmAccNum.trim();
    const ifsc = bankForm.ifsc.trim().toUpperCase();
    const bankName = bankForm.bankName.trim();

    setFormError("");

    if (!holder || !accNum || !confirmAccNum || !ifsc || !bankName) {
      setFormError("Please fill out all fields.");
      return;
    }

    if (accNum !== confirmAccNum) {
      setFormError("Account numbers do not match.");
      return;
    }

    setSaveLoading(true);

    const authToken = getAuthToken();

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (authToken) headers.Authorization = `Bearer ${authToken}`;

    const body = {
      accountHolderName: holder,
      accountNumber: accNum,
      confirmAccountNumber: confirmAccNum,
      ifscCode: ifsc,
      bankName,
      default: accounts.length === 0,
    };

    try {
      let newAccount: WalletAccount | null = null;

      try {
        const res = await fetch(BANK_ADD_URL, {
          method: "POST",
          headers,
          body: JSON.stringify(body),
          credentials: "include",
        });

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          const code = data?.error || `http_${res.status}`;

          const message =
            code === "all_fields_required"
              ? "Please fill out all fields."
              : code === "account_numbers_mismatch"
              ? "Account numbers do not match."
              : code === "account_already_exists"
              ? "This bank account is already saved."
              : "Could not add bank account.";

          throw new Error(message);
        }

        newAccount = mapApiAccount(data?.bankAccount);
      } catch (apiErr: any) {
        if (authToken) throw apiErr;

        newAccount = {
          id: crypto.randomUUID(),
          name: bankName,
          last4: accNum.slice(-4),
          ifsc,
          isDefault: accounts.length === 0,
          iconBg: "bg-[#1A73E8]/25",
          iconColor: "text-[#1A73E8]",
        };
      }

      setAccounts((prev) => {
        const withoutDuplicate = prev.filter(
          (acc) =>
            !(acc.name === newAccount!.name && acc.last4 === newAccount!.last4)
        );

        return [...withoutDuplicate, newAccount!];
      });

      setSelectedAccountId(newAccount.id);
      setLatestAddedAccount(newAccount);
      setAddBankOpen(false);
      resetBankForm();
      setSuccessPopupOpen(true);
    } catch (err: any) {
      setFormError(err?.message || "Could not add bank account.");
    } finally {
      setSaveLoading(false);
    }
  };

  const selectedAccount = useMemo(
    () => accounts.find((acc) => acc.id === selectedAccountId),
    [accounts, selectedAccountId]
  );

  return (
    <div className="dark relative min-h-screen bg-[#07080A] text-white overflow-x-hidden">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      >
        <img
          src="/icons/mpbg.png"
          alt="background"
          className="absolute inset-0 w-full h-screen object-contain object-top select-none"
        />
      </div>

      <div className="relative z-20 w-full bg-transparent px-4">
        <Header />
      </div>

      <main className="relative z-10 px-4 pt-[130px] pb-20">
        <section
          className="mx-auto overflow-hidden"
          style={{
            width: "min(1024px, 100%)",
            minHeight: 953,
            borderRadius: 30,
            background: "#21212180",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            fontFamily: fontBase,
          }}
        >
          <div className="p-8 sm:p-[50px]">
            <button
              type="button"
              onClick={() => navigate("/wallet")}
              className="inline-flex items-center gap-2"
              style={{
                fontFamily: fontBase,
                fontWeight: 700,
                fontSize: 13,
                lineHeight: "100%",
                color: "#C084FC",
              }}
            >
              ← Back to Wallet
            </button>

            <div className="mt-4">
              <h1
                style={{
                  fontFamily: fontBase,
                  fontWeight: 700,
                  fontStyle: "normal",
                  fontSize: 36,
                  lineHeight: "100%",
                  letterSpacing: 0,
                  color: "#FFFFFF",
                }}
              >
                Withdraw Funds
              </h1>

              <p
                className="mt-4 max-w-[590px]"
                style={{
                  fontFamily: fontBase,
                  fontWeight: 400,
                  fontStyle: "normal",
                  fontSize: 16,
                  lineHeight: "24px",
                  letterSpacing: 0,
                  color: "#A1A1AA",
                }}
              >
                Securely transfer your earnings to your preferred account.
                <br />
                Withdrawals are typically processed within 24 hours.
              </p>
            </div>

            <div className="mt-7 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_294px] gap-5">
              <div className="space-y-5 min-w-0">
                <div
                  className="relative overflow-hidden border border-white/10"
                  style={{
                    minHeight: 284,
                    borderRadius: 28,
                    background: "rgba(23,23,26,0.56)",
                  }}
                >
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_55%_90%,rgba(255,20,239,0.24),transparent_45%)]" />

                  <div className="relative z-10 p-8">
                    <p
                      style={{
                        fontFamily: fontBase,
                        fontWeight: 600,
                        fontStyle: "normal",
                        fontSize: 12,
                        lineHeight: "12px",
                        letterSpacing: "1.2px",
                        color: "#C084FC",
                        textTransform: "uppercase",
                      }}
                    >
                      Available to Withdraw
                    </p>

                    <h2
                      className="mt-5 text-white"
                      style={{
                        fontFamily: fontBase,
                        fontWeight: 900,
                        fontStyle: "normal",
                        fontSize: 60,
                        lineHeight: "60px",
                        letterSpacing: 0,
                      }}
                    >
                      ₹ 42,850
                    </h2>

                    <div className="mt-12 h-px w-full bg-white/10" />

                    <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-8">
                      <div>
                        <p
                          style={{
                            fontFamily: fontBase,
                            fontWeight: 400,
                            fontStyle: "normal",
                            fontSize: 14,
                            lineHeight: "100%",
                            color: "rgba(255,255,255,0.35)",
                          }}
                        >
                          Total Earning
                        </p>

                        <p
                          className="mt-3"
                          style={{
                            fontFamily: fontBase,
                            fontWeight: 700,
                            fontStyle: "normal",
                            fontSize: 24,
                            lineHeight: "100%",
                            letterSpacing: 0,
                            color: "#FFFFFF",
                          }}
                        >
                          ₹{totalEarning.toLocaleString("en-IN")}
                        </p>
                      </div>

                      <div>
                        <p
                          style={{
                            fontFamily: fontBase,
                            fontWeight: 400,
                            fontStyle: "normal",
                            fontSize: 14,
                            lineHeight: "100%",
                            color: "rgba(255,255,255,0.35)",
                          }}
                        >
                          Monthly Earnings
                        </p>

                        <p
                          className="mt-3"
                          style={{
                            fontFamily: fontBase,
                            fontWeight: 700,
                            fontStyle: "normal",
                            fontSize: 24,
                            lineHeight: "100%",
                            letterSpacing: 0,
                            color: "#ADC6FF",
                          }}
                        >
                          ₹{monthlyEarning.toLocaleString("en-IN")}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  className="relative overflow-hidden border border-white/10"
                  style={{
                    minHeight: 402,
                    borderRadius: 28,
                    background: "rgba(23,23,26,0.56)",
                  }}
                >
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_65%_95%,rgba(255,20,239,0.28),transparent_50%)]" />

                  <div className="relative z-10 p-8">
                    <label
                      style={{
                        fontFamily: fontBase,
                        fontWeight: 700,
                        fontSize: 13,
                        lineHeight: "100%",
                        color: "#A1A1AA",
                      }}
                    >
                      Withdrawal amount
                    </label>

                    <div
                      className="mt-5 flex h-[80px] items-center justify-between rounded-[14px] border border-white/10 px-8"
                      style={{ background: "rgba(3,4,5,0.35)" }}
                    >
                      <div className="flex min-w-0 items-center gap-4">
                        <span
                          style={{
                            fontFamily: fontBase,
                            fontWeight: 900,
                            fontSize: 34,
                            lineHeight: "100%",
                            color: "#C084FC",
                          }}
                        >
                          ₹
                        </span>

                        <input
                          value={amount}
                          onChange={(e) =>
                            setAmount(e.target.value.replace(/[^\d]/g, ""))
                          }
                          placeholder="0.00"
                          inputMode="numeric"
                          className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-white/10"
                          style={{
                            fontFamily: fontBase,
                            fontWeight: 900,
                            fontSize: 34,
                            lineHeight: "100%",
                            color: "#FFFFFF",
                          }}
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => setAmount(String(availableToWithdraw))}
                        style={{
                          fontFamily: fontBase,
                          fontWeight: 700,
                          fontStyle: "normal",
                          fontSize: 14,
                          lineHeight: "100%",
                          letterSpacing: 0,
                          textAlign: "center",
                          textTransform: "uppercase",
                          color: "#C084FC",
                          whiteSpace: "nowrap",
                          flexShrink: 0,
                        }}
                      >
                        WITHDRAW MAX
                      </button>
                    </div>

                    <div className="mt-4 flex items-center gap-2">
                      <Info className="h-4 w-4 text-[#71717A]" />

                      <span
                        style={{
                          fontFamily: fontBase,
                          fontWeight: 400,
                          fontStyle: "normal",
                          fontSize: 12,
                          lineHeight: "100%",
                          letterSpacing: 0,
                          color: "#71717A",
                        }}
                      >
                        Minimum withdrawal: $100.00. Standard transaction fees
                        may apply.
                      </span>
                    </div>

                    <div className="mt-9">
                      <p
                        style={{
                          fontFamily: fontBase,
                          fontWeight: 700,
                          fontSize: 13,
                          lineHeight: "100%",
                          color: "#A1A1AA",
                        }}
                      >
                        Select Payment Method
                      </p>

                      <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-7">
                        {accounts.map((account) => {
                          const active = selectedAccountId === account.id;

                          return (
                            <button
                              key={account.id}
                              type="button"
                              onClick={() => setSelectedAccountId(account.id)}
                              className="flex h-[125px] flex-col items-center justify-center rounded-[10px] border text-center"
                              style={{
                                background: active
                                  ? "rgba(23,23,26,0.72)"
                                  : "rgba(255,255,255,0.06)",
                                borderColor: active
                                  ? "#FF14EF"
                                  : "rgba(255,255,255,0.08)",
                                boxShadow: active
                                  ? "inset -1px 0 0 #1A73E8"
                                  : "none",
                              }}
                            >
                              <div
                                className={`grid h-10 w-10 place-items-center rounded-full ${account.iconBg}`}
                              >
                                <Landmark
                                  className={`h-5 w-5 ${account.iconColor}`}
                                />
                              </div>

                              <p
                                className="mt-5 truncate px-3"
                                style={{
                                  fontFamily: fontBase,
                                  fontWeight: 700,
                                  fontSize: 14,
                                  lineHeight: "100%",
                                  color: "#FFFFFF",
                                  maxWidth: "100%",
                                }}
                              >
                                {account.name}
                              </p>

                              <p
                                className="mt-3"
                                style={{
                                  fontFamily: fontBase,
                                  fontWeight: 400,
                                  fontSize: 10,
                                  lineHeight: "100%",
                                  color: "rgba(255,255,255,0.35)",
                                }}
                              >
                                •••• {account.last4}
                              </p>
                            </button>
                          );
                        })}

                        <button
                          type="button"
                          onClick={() => {
                            resetBankForm();
                            setAddBankOpen(true);
                          }}
                          className="flex h-[125px] flex-col items-center justify-center rounded-[10px] border border-dashed"
                          style={{
                            background: "rgba(255,255,255,0.05)",
                            borderColor: "rgba(255,255,255,0.2)",
                          }}
                        >
                          <div className="grid h-10 w-10 place-items-center rounded-full bg-white/10">
                            <span
                              aria-hidden
                              style={plusMaskStyle(14, "#A1A1AA")}
                            />
                          </div>

                          <p
                            className="mt-5"
                            style={{
                              fontFamily: fontBase,
                              fontWeight: 700,
                              fontSize: 14,
                              lineHeight: "100%",
                              color: "#FFFFFF",
                            }}
                          >
                            Add Card
                          </p>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <aside
                className="relative min-w-0 overflow-hidden border border-white/10"
                style={{
                  minHeight: 471,
                  borderRadius: 28,
                  background: "rgba(23,23,26,0.56)",
                }}
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_90%,rgba(255,20,239,0.17),transparent_55%)]" />

                <div className="relative z-10 p-8">
                  <h3
                    style={{
                      fontFamily: fontBase,
                      fontWeight: 700,
                      fontStyle: "normal",
                      fontSize: 18,
                      lineHeight: "100%",
                      letterSpacing: 0,
                      color: "#FFFFFF",
                    }}
                  >
                    Transaction Summary
                  </h3>

                  <div className="mt-8 space-y-7">
                    <div className="flex items-center justify-between gap-4">
                      <span style={summaryLabelStyle}>Subtotal</span>
                      <span style={summaryValueStyle}>
                        ₹{withdrawAmount.toFixed(2)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-4">
                      <span style={summaryLabelStyle}>Service Fee (2%)</span>
                      <span style={summaryValueStyle}>
                        ₹{serviceFee.toFixed(2)}
                      </span>
                    </div>

                    <div className="h-px w-full bg-white/10" />

                    <div className="flex items-center justify-between gap-3 min-w-0">
                      <span
                        style={{
                          fontFamily: fontBase,
                          fontWeight: 700,
                          fontSize: 20,
                          lineHeight: "100%",
                          color: "#FFFFFF",
                          whiteSpace: "nowrap",
                          flexShrink: 0,
                        }}
                      >
                        Estimated Total
                      </span>

                     <span
  style={{
    fontFamily: fontBase,
    fontWeight: 900,
    fontSize: 16,
    lineHeight: "100%",
    color: "#C084FC",
    whiteSpace: "nowrap",
    flexShrink: 1,
    minWidth: 0,
    maxWidth: 110,
    overflow: "hidden",
    textOverflow: "ellipsis",
    textAlign: "right",
  }}
>
  ₹{Math.max(estimatedTotal, 0).toFixed(2)}
</span>
                    </div>
                  </div>

                  <div
                    className="mt-8 flex gap-3 rounded-[14px] p-4"
                    style={{ background: "rgba(3,4,5,0.35)" }}
                  >
                    <img
                      src="/icons/locky.svg"
                      alt=""
                      className="mt-1 h-5 w-5 shrink-0"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />

                    <p
                      style={{
                        fontFamily: fontBase,
                        fontWeight: 400,
                        fontStyle: "normal",
                        fontSize: 12,
                        lineHeight: "100%",
                        letterSpacing: 0,
                        color: "#71717A",
                      }}
                    >
                      Your withdrawal is secured with end-to-end encryption.
                      Funds are usually available in your account within 1-3
                      business days depending on your bank.
                    </p>
                  </div>

                  <button
                    type="button"
                    disabled={!withdrawAmount || !selectedAccount}
                    className="mt-8 h-[49px] w-full rounded-[8px] text-white disabled:opacity-50"
                    style={{
                      ...confirmButtonTextStyle,
                      background:
                        "linear-gradient(270deg,#1A73E8 0%,#FF14EF 100%)",
                    }}
                  >
                    Confirm Withdrawal
                  </button>
                </div>
              </aside>
            </div>
          </div>
        </section>
      </main>

      {addBankOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[1200] grid place-items-center px-4"
        >
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => {
              setAddBankOpen(false);
              resetBankForm();
            }}
          />

          <div
            className="no-scrollbar relative w-full max-w-[620px] max-h-[90vh] overflow-y-auto rounded-2xl p-6 sm:p-8 text-white shadow-2xl"
            style={{
              background: "#17171A",
              border: "1px solid rgba(255,255,255,0.10)",
              fontFamily: fontBase,
            }}
          >
            <button
              type="button"
              aria-label="Close"
              onClick={() => {
                setAddBankOpen(false);
                resetBankForm();
              }}
              className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-black/60 hover:bg-black/80"
            >
              <X className="h-4 w-4 text-white/90" />
            </button>

            <h3 className="text-[22px] font-semibold leading-[100%] text-white">
              Account Details
            </h3>

            <p className="mt-2 text-sm text-white/55">
              Add your bank account details to receive withdrawals.
            </p>

            {formError && (
              <div
                className="mt-5 rounded-xl border px-4 py-3 text-sm text-white"
                style={{
                  background: "#2A1717",
                  borderColor: "rgba(239,68,68,0.35)",
                }}
              >
                {formError}
              </div>
            )}

            <div className="mt-6 space-y-5">
              <div>
                <label className="mb-2 block text-sm text-white/80">
                  Account holder name
                </label>

                <input
                  value={bankForm.holder}
                  onChange={(e) =>
                    setBankForm((p) => ({
                      ...p,
                      holder: onlyLetters(e.target.value),
                    }))
                  }
                  className="w-full rounded-md border border-white/15 bg-[#17171A] px-4 py-3 text-white placeholder-white/35 outline-none focus:ring-2 focus:ring-white/10"
                  placeholder="Enter account holder name"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-white/80">
                  Account number
                </label>

                <input
                  value={bankForm.accNum}
                  onChange={(e) =>
                    setBankForm((p) => ({
                      ...p,
                      accNum: onlyDigits(e.target.value),
                    }))
                  }
                  inputMode="numeric"
                  pattern="[0-9]*"
                  className="w-full rounded-md border border-white/15 bg-[#17171A] px-4 py-3 text-white placeholder-white/35 outline-none focus:ring-2 focus:ring-white/10"
                  placeholder="Enter account number"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-white/80">
                  Confirm account number
                </label>

                <input
                  value={bankForm.confirmAccNum}
                  onChange={(e) =>
                    setBankForm((p) => ({
                      ...p,
                      confirmAccNum: onlyDigits(e.target.value),
                    }))
                  }
                  inputMode="numeric"
                  pattern="[0-9]*"
                  className="w-full rounded-md border border-white/15 bg-[#17171A] px-4 py-3 text-white placeholder-white/35 outline-none focus:ring-2 focus:ring-white/10"
                  placeholder="Re-enter account number"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-white/80">
                  IFSC Code
                </label>

                <div className="relative">
                  <input
                    value={bankForm.ifsc}
                    onChange={(e) =>
                      setBankForm((p) => ({
                        ...p,
                        ifsc: e.target.value.toUpperCase(),
                      }))
                    }
                    className="w-full rounded-md border border-white/15 bg-[#17171A] px-4 py-3 pr-[112px] text-white placeholder-white/35 outline-none focus:ring-2 focus:ring-white/10"
                    placeholder="IFSC Code"
                  />

                  <button
                    type="button"
                    className="absolute bottom-1 right-1 top-1 rounded-md px-4 text-sm text-white"
                    style={{
                      background:
                        "linear-gradient(270deg,#FF14EF 0%,#1A73E8 100%)",
                    }}
                  >
                    Find IFSC
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm text-white/80">
                  Bank name
                </label>

                <input
                  value={bankForm.bankName}
                  onChange={(e) =>
                    setBankForm((p) => ({
                      ...p,
                      bankName: e.target.value,
                    }))
                  }
                  className="w-full rounded-md border border-white/15 bg-[#17171A] px-4 py-3 text-white placeholder-white/35 outline-none focus:ring-2 focus:ring-white/10"
                  placeholder="Bank name"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setAddBankOpen(false);
                    resetBankForm();
                  }}
                  className="h-[49px] w-[100px] rounded-[6px] border border-white text-white/90"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleSaveBank}
                  disabled={saveLoading}
                  className="h-[49px] w-[162px] rounded-[6px] px-[15px] text-white transition-opacity disabled:opacity-60"
                  style={{
                    background:
                      "linear-gradient(270deg,#FF14EF 0%,#1A73E8 100%)",
                  }}
                >
                  {saveLoading ? "Saving..." : "Save & Continue"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {successPopupOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[1300] grid place-items-center px-4"
        >
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

          <div
            className="relative text-white shadow-2xl"
            style={{
              width: "min(500px, 94vw)",
              minHeight: 300,
              borderRadius: 10,
              background: "#030405",
              fontFamily: fontBase,
              padding: "30px 24px",
            }}
          >
            <button
              type="button"
              aria-label="Close"
              onClick={() => setSuccessPopupOpen(false)}
              className="absolute right-5 top-5 grid place-items-center text-white/50 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="mx-auto grid h-[80px] w-[80px] place-items-center rounded-full bg-[#052A1D]">
              <div className="grid h-[36px] w-[36px] place-items-center rounded-full bg-[#21B37A]">
                <Check className="h-5 w-5 text-black" strokeWidth={3} />
              </div>
            </div>

            <div className="mt-6 text-center">
              <h3
                style={{
                  fontFamily: fontBase,
                  fontWeight: 700,
                  fontSize: 22,
                  lineHeight: "100%",
                  color: "#FFFFFF",
                }}
              >
                Bank account added
              </h3>

              <p
                className="mt-3"
                style={{
                  fontFamily: fontBase,
                  fontWeight: 400,
                  fontSize: 22,
                  lineHeight: "100%",
                  color: "#FFFFFF",
                }}
              >
                {latestAddedAccount?.name || "Bank"} —••
                {latestAddedAccount?.last4 || "0000"} added successfully
              </p>
            </div>

            <div className="mt-8 flex items-center justify-center gap-6">
              <button
                type="button"
                onClick={() => {
                  setSuccessPopupOpen(false);
                  resetBankForm();
                  setAddBankOpen(true);
                }}
                style={{
                  fontFamily: fontBase,
                  fontWeight: 400,
                  fontSize: 16,
                  lineHeight: "24px",
                  color: "#FFFFFF",
                }}
              >
                Add Another
              </button>

              <button
                type="button"
                onClick={() => {
                  setSuccessPopupOpen(false);
                  setAddBankOpen(false);
                }}
                className="h-[50px] rounded-[7px] px-5"
                style={{
                  background: "#333335",
                  fontFamily: fontBase,
                  fontWeight: 400,
                  fontSize: 16,
                  lineHeight: "24px",
                  color: "#FFFFFF",
                }}
              >
                View
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="relative z-10 mt-20">
        <Footer />
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default WithdrawFunds;