import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  RefreshCw,
  FileText,
  ShieldCheck,
  Clock,
  Search,
  Download,
  TriangleAlert,
  X,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

/**
 * Every signed engagement agreement on the platform.
 *
 * Reads models/NdaRecord exclusively — the append-only archive written when a
 * party signs — and never the live order's own NDA fields. The distinction is
 * the whole reason this screen exists: the order tells you what the engagement
 * is NOW (a price that has since been settled at 40%, a delivery date that
 * moved), while the record tells you what was signed. Both are shown on the
 * detail panel, side by side, because the gap between them is usually the thing
 * being argued about.
 *
 * Read-only. There is no edit or delete here, and there is no route behind one
 * either: an audit trail an admin can rewrite is not an audit trail.
 */

const API_BASE = `${(import.meta.env.VITE_API_URL || "http://localhost:5002").replace(
  /\/$/,
  ""
)}/api/admin/nda`;

function getAuthHeaders() {
  const token =
    localStorage.getItem("tokun_admin_token") || localStorage.getItem("adminToken") || "";
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token.replace(/^Bearer\s+/i, "")}` } : {}),
  };
}

/* ---------- types (mirror routes/adminNda.js responses) ---------- */

type Signature = {
  role: "client" | "creator";
  orderRole: string;
  userId?: string;
  name?: string;
  email?: string;
  signedAt: string;
  agreementVersion?: string;
  sha256?: string;
  byteSize?: number;
  ip?: string;
  userAgent?: string;
  hasDocument?: boolean;
  hasSignatureImage?: boolean;
  /** Detail response only — the list omits the PNG. */
  signatureImage?: string;
};

type NdaRow = {
  _id: string;
  orderKind: "hire" | "service";
  orderId?: string;
  orderTitle?: string;
  amount?: number;
  currency?: string;
  totalPayable?: number;
  status: "PARTIAL" | "EXECUTED";
  executedAt?: string | null;
  agreementVersion?: string;
  versionMismatch?: boolean;
  backfilled?: boolean;
  orderStatusAtSigning?: string;
  createdAt: string;
  signatures: Signature[];
  awaiting?: "client" | "creator" | null;
  /* Frozen terms. Present on the detail response, absent from list rows — the
     list has no room to show them and the drift table is the only consumer.
     `null` is meaningful and distinct from absent: it is the term "no cap
     agreed" / "no deadline", not a missing field. */
  revisionsAllowed?: number | null;
  deliveryDays?: number | null;
  deliveryDueAt?: string | null;
};

type LiveOrder = {
  status?: string;
  paymentStatus?: string;
  fundsStatus?: string;
  amount?: number;
  totalPayable?: number;
  revisionsAllowed?: number | null;
  deliveryDueAt?: string | null;
  settlementSellerPercent?: number | null;
  refundAmount?: number;
  cancelledBy?: string;
  cancelReason?: string;
  createdAt?: string;
};

type Drift = {
  amount: boolean;
  totalPayable: boolean;
  revisionsAllowed: boolean;
  deliveryDueAt: boolean;
  status: boolean;
};

type Stats = {
  total: number;
  executed: number;
  partial: number;
  versionMismatch: number;
  last30Days: number;
};

/* ---------- small helpers ---------- */

const money = (n?: number | null, currency = "INR") =>
  n === undefined || n === null
    ? "—"
    : `${currency === "INR" ? "₹" : `${currency} `}${Number(n).toLocaleString("en-IN")}`;

const dateTime = (v?: string | null) =>
  v ? new Date(v).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "—";

const dateOnly = (v?: string | null) =>
  v ? new Date(v).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";

const bytes = (n?: number) => {
  const v = Number(n || 0);
  if (!v) return "";
  return v < 1024 * 1024 ? `${Math.round(v / 1024)} KB` : `${(v / 1024 / 1024).toFixed(1)} MB`;
};

/* null means "unlimited — no cap was agreed at booking", which is a term and
   not a gap; undefined means the field isn't on this response. Kept distinct,
   because "Unlimited" and "—" are very different things to read off a
   contract. */
const revisionText = (n?: number | null) =>
  n === null ? "Unlimited" : n === undefined ? "—" : String(n);

/** Status codes are internal vocabulary; this screen is read by humans. */
const humanise = (code?: string) =>
  String(code || "")
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/^./, (c) => c.toUpperCase()) || "—";

const TABS = [
  { id: "", label: "All" },
  // Named for what it means operationally, not for the enum: one side has
  // signed and the engagement cannot be paid for until the other does.
  { id: "PARTIAL", label: "Awaiting signature" },
  { id: "EXECUTED", label: "Fully executed" },
] as const;

/* A party name linked to their ADMIN profile, not the public one — the same
   reasoning as AdminRefundsPage's PartyLink: judging a record usually means
   knowing who the person is, and the public page is a shopfront. New tab, so an
   admin working the queue doesn't lose their place. */
function PartyLink({ sig, view }: { sig?: Signature; view: "user" | "seller" }) {
  const label = sig?.name || sig?.email || "—";
  if (!sig?.userId) return <span className="text-white/60">{label}</span>;
  return (
    <a
      href={`/admin/dashboard?view=${view}&id=${sig.userId}`}
      target="_blank"
      rel="noreferrer"
      title={sig.email || undefined}
      className="text-white/70 underline underline-offset-2 hover:text-white transition-colors"
    >
      {label}
    </a>
  );
}

function Pill({
  children,
  tone = "neutral",
  title,
}: {
  children: React.ReactNode;
  tone?: "neutral" | "good" | "warn" | "bad" | "info";
  title?: string;
}) {
  const tones: Record<string, string> = {
    neutral: "border-white/12 bg-white/[0.05] text-white/60",
    good: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
    warn: "border-[#FABC4E]/35 bg-[#FABC4E]/10 text-[#FABC4E]",
    bad: "border-red-500/30 bg-red-500/10 text-red-300",
    info: "border-[#C084FC]/35 bg-[#C084FC]/10 text-[#C084FC]",
  };
  return (
    <span
      title={title}
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-semibold uppercase tracking-wider ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

/* ---------- one signature, as evidence ---------- */

function SignatureBlock({
  sig,
  role,
  recordId,
  backfilled,
}: {
  sig?: Signature;
  role: "client" | "creator";
  recordId: string;
  backfilled?: boolean;
}) {
  const [opening, setOpening] = useState(false);
  const roleLabel = role === "client" ? "Client (Disclosing Party)" : "Creator (Receiving Party)";

  /* The document is behind an admin-authenticated endpoint that hands back a
     short-lived SAS URL, so it is fetched and then opened — an <a href> would
     carry no bearer token. Opened in a new tab rather than navigated to,
     because the admin is mid-review. */
  const openDocument = useCallback(async () => {
    setOpening(true);
    try {
      const res = await fetch(`${API_BASE}/${recordId}/document/${role}`, {
        headers: getAuthHeaders(),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data?.url) {
        window.open(data.url, "_blank", "noopener");
      } else {
        toast({
          title: res.status === 410 ? "Document not retrievable" : "Couldn't open the document",
          description:
            data?.message ||
            "The signature is on record but its file could not be fetched.",
          variant: "destructive",
        });
      }
    } catch {
      toast({ title: "Network error", description: "Try again.", variant: "destructive" });
    }
    setOpening(false);
  }, [recordId, role]);

  if (!sig) {
    return (
      <div className="rounded-xl border border-dashed border-white/12 bg-white/[0.02] p-4">
        <p className="text-[10px] uppercase tracking-wider text-white/35">{roleLabel}</p>
        <p className="text-sm text-white/40 mt-2">Not signed</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.035] p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-wider text-white/35">{roleLabel}</p>
          <p className="text-sm font-semibold text-white/90 truncate mt-1">{sig.name || "—"}</p>
          <p className="text-[11px] text-white/45 truncate">{sig.email || "—"}</p>
        </div>
        <Pill tone="good">v{sig.agreementVersion || "1.0"}</Pill>
      </div>

      {/* The drawn signature. Rendered on a white ground because it is a PNG of
          black ink on white and would be invisible on the dark panel. */}
      {sig.signatureImage ? (
        <img
          src={sig.signatureImage}
          alt={`${roleLabel} signature`}
          className="mt-3 h-14 rounded-md bg-white px-2 object-contain"
        />
      ) : (
        <p className="mt-3 text-[11px] text-white/30 italic">
          No drawn signature on record{backfilled ? " (predates signature capture)" : ""}
        </p>
      )}

      <dl className="mt-3 space-y-1 text-[11px]">
        <div className="flex gap-2">
          <dt className="text-white/35 w-20 shrink-0">Signed</dt>
          <dd className="text-white/70">{dateTime(sig.signedAt)}</dd>
        </div>
        {/* Provenance. Not identification — an IP is not a person — but it is
            the difference between "someone signed" and a record that can be
            questioned. Shown only when captured; a blank row would imply the
            field failed rather than that it predates capture. */}
        {!!sig.ip && (
          <div className="flex gap-2">
            <dt className="text-white/35 w-20 shrink-0">From</dt>
            <dd className="text-white/60 font-mono">{sig.ip}</dd>
          </div>
        )}
        {!!sig.userAgent && (
          <div className="flex gap-2">
            <dt className="text-white/35 w-20 shrink-0">Client</dt>
            <dd className="text-white/45 break-all leading-snug">{sig.userAgent}</dd>
          </div>
        )}
        {/* The hash is what makes this provable rather than plausible: the
            stored file can be shown to be the document that was signed, or
            shown not to be. Monospace and full-width — a truncated hash cannot
            be compared against anything. */}
        {sig.sha256 ? (
          <div className="flex gap-2">
            <dt className="text-white/35 w-20 shrink-0">SHA-256</dt>
            <dd className="text-white/50 font-mono break-all leading-snug">
              {sig.sha256}
              {bytes(sig.byteSize) ? <span className="text-white/30"> · {bytes(sig.byteSize)}</span> : null}
            </dd>
          </div>
        ) : (
          <div className="flex gap-2">
            <dt className="text-white/35 w-20 shrink-0">SHA-256</dt>
            <dd className="text-white/35 italic">
              Not hashed — the document is on file but not provable against these bytes
            </dd>
          </div>
        )}
      </dl>

      {sig.hasDocument ? (
        <button
          onClick={openDocument}
          disabled={opening}
          className="mt-3 w-full h-9 rounded-lg border border-white/12 bg-white/[0.05] hover:bg-white/[0.09] text-xs font-medium text-white/80 inline-flex items-center justify-center gap-2 transition disabled:opacity-50"
        >
          <Download size={13} />
          {opening ? "Opening…" : "Open signed copy"}
        </button>
      ) : (
        <p className="mt-3 text-[11px] text-[#FABC4E]/80 leading-snug">
          Signed, but the document is not retrievable — it predates durable storage. The signature
          and its timestamp are unaffected.
        </p>
      )}
    </div>
  );
}

/* ---------- detail panel ---------- */

function DetailPanel({ recordId, onClose }: { recordId: string; onClose: () => void }) {
  const [loading, setLoading] = useState(true);
  const [record, setRecord] = useState<NdaRow | null>(null);
  const [liveOrder, setLiveOrder] = useState<LiveOrder | null>(null);
  const [drift, setDrift] = useState<Drift | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/${recordId}`, { headers: getAuthHeaders() });
        const data = await res.json().catch(() => ({}));
        if (!alive) return;
        if (data?.success) {
          setRecord(data.record);
          setLiveOrder(data.liveOrder || null);
          setDrift(data.drift || null);
        } else {
          toast({ title: "Couldn't load the record", variant: "destructive" });
        }
      } catch {
        if (alive) toast({ title: "Network error", variant: "destructive" });
      }
      if (alive) setLoading(false);
    })();
    return () => {
      alive = false;
    };
  }, [recordId]);

  const client = record?.signatures?.find((s) => s.role === "client");
  const creator = record?.signatures?.find((s) => s.role === "creator");

  /* "As signed" vs "as it stands now", one row per term.
     Only rendered when the snapshot is contemporaneous — for a backfilled
     record the server sends drift: null, because comparing against a snapshot
     taken at backfill time would assert "nothing changed" on no evidence. */
  const driftRows: { label: string; signed: string; now: string; moved: boolean }[] = useMemo(() => {
    if (!record || !liveOrder) return [];
    const d = drift;
    return [
      {
        label: "Price",
        signed: money(record.amount, record.currency),
        now: money(liveOrder.amount, record.currency),
        moved: !!d?.amount,
      },
      {
        label: "Total paid by client",
        signed: money(record.totalPayable, record.currency),
        now: money(liveOrder.totalPayable, record.currency),
        moved: !!d?.totalPayable,
      },
      {
        label: "Revisions",
        // null is the term "unlimited — no cap agreed at booking", which reads
        // very differently from a blank. Both sides go through the same
        // formatter so the two columns can't describe it differently.
        signed: revisionText(record.revisionsAllowed),
        now: revisionText(liveOrder.revisionsAllowed),
        moved: !!d?.revisionsAllowed,
      },
      {
        label: "Delivery due",
        signed: dateOnly(record.deliveryDueAt),
        now: dateOnly(liveOrder.deliveryDueAt),
        moved: !!d?.deliveryDueAt,
      },
      {
        label: "Stage",
        signed: humanise(record.orderStatusAtSigning),
        now: humanise(liveOrder.status),
        moved: !!d?.status,
      },
    ];
  }, [record, liveOrder, drift]);

  return (
    <div
      className="fixed inset-0 z-[2000] flex items-start justify-center overflow-y-auto p-4 md:p-8"
      style={{ background: "rgba(0,0,0,0.72)", backdropFilter: "blur(8px)" }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-3xl rounded-2xl text-white"
        style={{ background: "#0B0D12", border: "1px solid rgba(255,255,255,0.1)" }}
      >
        <div className="flex items-start gap-3 p-5 border-b border-white/8">
          <FileText size={18} className="text-white/50 mt-0.5 shrink-0" />
          <div className="min-w-0 flex-1">
            <h2 className="text-base font-bold truncate">
              {record?.orderTitle || (loading ? "Loading…" : "Agreement")}
            </h2>
            <p className="text-[11px] text-white/40 mt-0.5 font-mono break-all">
              {record?.orderKind === "hire" ? "Hire deal" : "Service booking"} · {record?.orderId || recordId}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-white/70 hover:text-white shrink-0"
            style={{ background: "rgba(255,255,255,0.07)" }}
            aria-label="Close"
          >
            <X size={15} />
          </button>
        </div>

        {loading ? (
          <p className="text-white/50 text-sm py-16 text-center">Loading…</p>
        ) : !record ? (
          <p className="text-white/40 text-sm py-16 text-center">Record not found.</p>
        ) : (
          <div className="p-5 space-y-6">
            <div className="flex flex-wrap items-center gap-2">
              {record.status === "EXECUTED" ? (
                <Pill tone="good">
                  <ShieldCheck size={11} /> Fully executed {dateOnly(record.executedAt)}
                </Pill>
              ) : (
                <Pill tone="warn">
                  <Clock size={11} /> Awaiting {record.awaiting === "client" ? "client" : "creator"}
                </Pill>
              )}
              <Pill tone="info">Terms v{record.agreementVersion || "1.0"}</Pill>
              {record.versionMismatch && (
                <Pill tone="bad" title="The two parties signed against different versions of the terms.">
                  <TriangleAlert size={11} /> Version mismatch
                </Pill>
              )}
              {record.backfilled && (
                <Pill
                  tone="warn"
                  title="Reconstructed from the order after the fact. Its terms snapshot is the order at backfill time, not at signing, and it has no hash or provenance because none were captured."
                >
                  Backfilled — approximate
                </Pill>
              )}
            </div>

            {record.backfilled && (
              <p className="text-[11px] text-[#FABC4E]/85 leading-relaxed rounded-lg border border-[#FABC4E]/20 bg-[#FABC4E]/[0.06] p-3">
                This record was reconstructed from the order after the archive was introduced. Who
                signed, and when, is read straight off the order and is reliable. The terms below
                are the order as it stood at backfill time — <b>not</b> as it stood at signing, which
                was never recorded — and there is no hash, IP or user agent because none were
                captured. Do not treat it as a contemporaneous record.
              </p>
            )}

            <div>
              <h3 className="text-[10px] uppercase tracking-wider text-white/35 mb-3">Signatures</h3>
              <div className="grid gap-3 md:grid-cols-2">
                <SignatureBlock sig={client} role="client" recordId={record._id} backfilled={record.backfilled} />
                <SignatureBlock sig={creator} role="creator" recordId={record._id} backfilled={record.backfilled} />
              </div>
            </div>

            {/* The comparison this screen exists for. */}
            <div>
              <h3 className="text-[10px] uppercase tracking-wider text-white/35 mb-3">
                Terms as signed vs the order now
              </h3>
              {!liveOrder ? (
                <p className="text-xs text-white/40 rounded-lg border border-white/8 bg-white/[0.02] p-3">
                  The order is no longer on file. The record above stands on its own — which is why
                  its terms are frozen.
                </p>
              ) : !drift ? (
                <p className="text-xs text-white/40 rounded-lg border border-white/8 bg-white/[0.02] p-3">
                  Not comparable for a backfilled record: the snapshot was taken at backfill time,
                  so a match here would prove nothing.
                </p>
              ) : (
                <div className="rounded-xl border border-white/10 overflow-hidden">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-white/[0.04] text-white/40">
                        <th className="text-left font-medium px-3 py-2">Term</th>
                        <th className="text-left font-medium px-3 py-2">As signed</th>
                        <th className="text-left font-medium px-3 py-2">Now</th>
                      </tr>
                    </thead>
                    <tbody>
                      {driftRows.map((r) => (
                        <tr key={r.label} className="border-t border-white/6">
                          <td className="px-3 py-2 text-white/50">{r.label}</td>
                          <td className="px-3 py-2 text-white/80">{r.signed}</td>
                          <td
                            className={`px-3 py-2 ${r.moved ? "text-[#FABC4E] font-semibold" : "text-white/50"}`}
                          >
                            {r.now}
                            {r.moved ? " ←" : ""}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* How the money actually ended up, where it has. Not part of the
                agreement, but it is the first thing asked about one. */}
            {!!liveOrder && (
              <div>
                <h3 className="text-[10px] uppercase tracking-wider text-white/35 mb-3">
                  Where the engagement stands
                </h3>
                <div className="grid gap-2 sm:grid-cols-3 text-xs">
                  {[
                    ["Payment", humanise(liveOrder.paymentStatus)],
                    ["Escrow", humanise(liveOrder.fundsStatus)],
                    ["Stage", humanise(liveOrder.status)],
                  ].map(([k, v]) => (
                    <div key={k} className="rounded-lg border border-white/8 bg-white/[0.03] p-3">
                      <p className="text-[10px] uppercase tracking-wider text-white/35">{k}</p>
                      <p className="text-white/80 mt-1 font-medium">{v}</p>
                    </div>
                  ))}
                </div>
                {(liveOrder.settlementSellerPercent !== null &&
                  liveOrder.settlementSellerPercent !== undefined) ||
                !!liveOrder.cancelReason ? (
                  <div className="mt-2 rounded-lg border border-white/8 bg-white/[0.03] p-3 text-xs space-y-1">
                    {liveOrder.settlementSellerPercent !== null &&
                      liveOrder.settlementSellerPercent !== undefined && (
                        <p className="text-white/70">
                          Settled at {liveOrder.settlementSellerPercent}% to the creator
                          {liveOrder.refundAmount
                            ? ` · ${money(liveOrder.refundAmount, record.currency)} refunded`
                            : ""}
                        </p>
                      )}
                    {!!liveOrder.cancelReason && (
                      <p className="text-white/45">
                        Ended by {liveOrder.cancelledBy || "—"}: {liveOrder.cancelReason}
                      </p>
                    )}
                  </div>
                ) : null}
              </div>
            )}

            <p className="text-[10px] text-white/25 leading-relaxed border-t border-white/8 pt-4">
              This archive is append-only and there is no route to edit or delete a signature. The
              full agreement text is generated from the engagement at signing time; the signed copy
              above is the authoritative version of what each party actually saw and signed.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------- page ---------- */

export default function AdminNdaPage() {
  const navigate = useNavigate();

  const [rows, setRows] = useState<NdaRow[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"" | "PARTIAL" | "EXECUTED">("");
  const [kind, setKind] = useState<"" | "hire" | "service">("");
  const [mismatchOnly, setMismatchOnly] = useState(false);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [openId, setOpenId] = useState<string | null>(null);

  const fetchRows = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (tab) params.set("status", tab);
      if (kind) params.set("kind", kind);
      if (mismatchOnly) params.set("mismatch", "1");
      if (query) params.set("q", query);
      params.set("page", String(page));

      const res = await fetch(`${API_BASE}?${params.toString()}`, { headers: getAuthHeaders() });
      const data = await res.json().catch(() => ({}));
      if (data?.success) {
        setRows(data.records || []);
        setPages(data.pages || 1);
        setTotal(data.total || 0);
      } else {
        toast({ title: "Couldn't load agreements", variant: "destructive" });
      }
    } catch {
      toast({ title: "Network error", description: "Try again.", variant: "destructive" });
    }
    setLoading(false);
  }, [tab, kind, mismatchOnly, query, page]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/stats`, { headers: getAuthHeaders() });
      const data = await res.json().catch(() => ({}));
      if (data?.success) setStats(data.stats);
    } catch {
      /* The counters are decoration; a failure here must not blank the list. */
    }
  }, []);

  useEffect(() => {
    fetchRows();
  }, [fetchRows]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Any filter change invalidates the page number — page 4 of a 2-page result
  // renders empty and reads as "nothing found".
  useEffect(() => {
    setPage(1);
  }, [tab, kind, mismatchOnly, query]);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setQuery(search.trim());
  };

  return (
    <div className="min-h-screen text-white" style={{ background: "#07080B" }}>
      <div className="max-w-5xl mx-auto px-4 md:px-6 py-10">
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={() => navigate("/admin/dashboard")}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white/70 hover:text-white transition"
            style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)" }}
            aria-label="Back"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Signed Agreements</h1>
            <p className="text-xs text-white/40 mt-0.5">
              Every engagement agreement &amp; NDA signed on Tokun — append-only, read-only
            </p>
          </div>
          <button
            onClick={() => {
              fetchRows();
              fetchStats();
            }}
            className="ml-auto w-9 h-9 rounded-xl flex items-center justify-center text-white/70 hover:text-white transition"
            style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)" }}
            aria-label="Refresh"
          >
            <RefreshCw size={15} />
          </button>
        </div>

        {/* Counters. `partial` is the only one that is a queue — it means an
            engagement that cannot be paid for until someone signs — so it's the
            one that goes amber, and it's clickable straight into that filter. */}
        {!!stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {[
              { label: "Fully executed", value: stats.executed, tone: "good" as const, filter: "EXECUTED" as const },
              { label: "Awaiting signature", value: stats.partial, tone: "warn" as const, filter: "PARTIAL" as const },
              { label: "Signed, last 30 days", value: stats.last30Days, tone: "neutral" as const, filter: null },
              {
                label: "Version mismatch",
                value: stats.versionMismatch,
                tone: stats.versionMismatch > 0 ? ("bad" as const) : ("neutral" as const),
                filter: "mismatch" as const,
              },
            ].map((c) => (
              <button
                key={c.label}
                onClick={() => {
                  if (c.filter === "mismatch") {
                    setMismatchOnly(true);
                    setTab("");
                  } else if (c.filter) {
                    setTab(c.filter);
                    setMismatchOnly(false);
                  } else {
                    setTab("");
                    setMismatchOnly(false);
                  }
                }}
                className="text-left rounded-xl p-4 transition hover:bg-white/[0.06]"
                style={{ background: "rgba(255,255,255,0.035)", border: "1px solid rgba(255,255,255,0.08)" }}
              >
                <p className="text-[10px] uppercase tracking-wider text-white/35">{c.label}</p>
                <p
                  className={`text-2xl font-bold mt-1 ${
                    c.tone === "good"
                      ? "text-emerald-300"
                      : c.tone === "warn"
                        ? "text-[#FABC4E]"
                        : c.tone === "bad"
                          ? "text-red-300"
                          : "text-white/85"
                  }`}
                >
                  {c.value}
                </p>
              </button>
            ))}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2 mb-4">
          {TABS.map((t) => (
            <button
              key={t.id || "all"}
              onClick={() => setTab(t.id)}
              style={
                tab === t.id
                  ? { background: "linear-gradient(135deg,#FF14EF,#8A4BFF,#1A73E8)", border: "1px solid transparent" }
                  : { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }
              }
              className="px-4 py-2 rounded-full text-sm font-medium text-white transition-all"
            >
              {t.label}
            </button>
          ))}

          <span className="w-px h-6 bg-white/10 mx-1" />

          {[
            { id: "" as const, label: "Both" },
            { id: "hire" as const, label: "Hire" },
            { id: "service" as const, label: "Service" },
          ].map((k) => (
            <button
              key={k.id || "both"}
              onClick={() => setKind(k.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${
                kind === k.id
                  ? "border-white/25 bg-white/[0.12] text-white"
                  : "border-white/10 bg-white/[0.04] text-white/55 hover:text-white/80"
              }`}
            >
              {k.label}
            </button>
          ))}

          {mismatchOnly && (
            <button
              onClick={() => setMismatchOnly(false)}
              className="px-3 py-1.5 rounded-full text-xs font-medium border border-red-500/30 bg-red-500/10 text-red-300 inline-flex items-center gap-1.5"
            >
              Version mismatch only <X size={11} />
            </button>
          )}
        </div>

        {/* An admin arriving from a dispute is holding an order id, so that is
            the case the search is built around; the server matches an ObjectId
            against either id field exactly and falls back to a text search on
            the title and the names AS SIGNED. */}
        <form onSubmit={submitSearch} className="flex gap-2 mb-6">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Order id, party name, email, or title…"
              className="w-full h-10 pl-9 pr-3 rounded-xl text-sm bg-black/30 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-white/25"
            />
          </div>
          <button
            type="submit"
            className="h-10 px-5 rounded-xl text-sm font-medium border border-white/12 bg-white/[0.06] hover:bg-white/[0.1] transition"
          >
            Search
          </button>
          {!!query && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setQuery("");
              }}
              className="h-10 px-4 rounded-xl text-sm text-white/55 hover:text-white border border-white/10 transition"
            >
              Clear
            </button>
          )}
        </form>

        {loading && <p className="text-white/50 text-sm py-10 text-center">Loading…</p>}

        {!loading && !rows.length && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <FileText className="text-white/25" size={28} />
            <p className="text-white/40 text-sm">
              {query || tab || kind || mismatchOnly
                ? "No agreements match those filters."
                : "No agreements on record yet."}
            </p>
            {/* The likeliest reason this is empty on an established platform is
                that the backfill hasn't been run — the archive starts at the
                day it shipped, and agreements signed before that live only as
                fields on their orders. Saying so beats an admin concluding
                nobody has ever signed anything. */}
            {!query && !tab && !kind && !mismatchOnly && (
              <p className="text-[11px] text-white/25 max-w-md text-center leading-relaxed">
                Agreements signed before this archive existed are not here until
                <span className="font-mono text-white/40"> scripts/backfillNdaRecords.js </span>
                has been run.
              </p>
            )}
          </div>
        )}

        {!loading &&
          rows.map((r) => {
            const client = r.signatures?.find((s) => s.role === "client");
            const creator = r.signatures?.find((s) => s.role === "creator");
            return (
              <button
                key={r._id}
                onClick={() => setOpenId(r._id)}
                className="w-full text-left mb-3 p-4 rounded-2xl transition hover:bg-white/[0.06]"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white/90 truncate">
                      {r.orderTitle || "Untitled engagement"}
                    </p>
                    <p className="text-[11px] text-white/40 mt-1">
                      {r.orderKind === "hire" ? "Hire deal" : "Service booking"} ·{" "}
                      <span onClick={(e) => e.stopPropagation()}>
                        <PartyLink sig={client} view="user" /> →{" "}
                        <PartyLink sig={creator} view="seller" />
                      </span>
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-white/90">{money(r.amount, r.currency)}</p>
                    <p className="text-[10px] text-white/35 mt-0.5">
                      {r.status === "EXECUTED" ? dateOnly(r.executedAt) : dateOnly(r.createdAt)}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-1.5 mt-3">
                  {r.status === "EXECUTED" ? (
                    <Pill tone="good">
                      <ShieldCheck size={10} /> Executed
                    </Pill>
                  ) : (
                    <Pill tone="warn">
                      <Clock size={10} /> Awaiting {r.awaiting === "client" ? "client" : "creator"}
                    </Pill>
                  )}
                  <Pill tone="info">v{r.agreementVersion || "1.0"}</Pill>
                  {r.versionMismatch && (
                    <Pill tone="bad">
                      <TriangleAlert size={10} /> Mismatch
                    </Pill>
                  )}
                  {r.backfilled && <Pill tone="warn">Backfilled</Pill>}
                  {/* "Signed, no file" is a real and important state — every
                      NDA from before durable storage is one. Flagged on the row
                      so an admin doesn't open the record expecting a document. */}
                  {r.signatures?.some((s) => !s.hasDocument) && <Pill>Document missing</Pill>}
                </div>
              </button>
            );
          })}

        {!loading && pages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-6">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="h-9 px-4 rounded-lg text-sm border border-white/10 bg-white/[0.04] text-white/70 disabled:opacity-30 transition"
            >
              Previous
            </button>
            <span className="text-xs text-white/40">
              Page {page} of {pages} · {total} total
            </span>
            <button
              disabled={page >= pages}
              onClick={() => setPage((p) => Math.min(pages, p + 1))}
              className="h-9 px-4 rounded-lg text-sm border border-white/10 bg-white/[0.04] text-white/70 disabled:opacity-30 transition"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {!!openId && <DetailPanel recordId={openId} onClose={() => setOpenId(null)} />}
    </div>
  );
}
