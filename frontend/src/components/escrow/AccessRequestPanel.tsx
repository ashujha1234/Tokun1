/**
 * The access checklist — "here's what I need from you before I can start."
 *
 * The creator raises items, the client answers them, and both sides can see at
 * a glance what is still outstanding. Before this, all of it was prose in chat:
 * nothing was countable, a creator waiting on the client had no record of having
 * asked, and the files the client did supply lived in a message thread rather
 * than against the order.
 *
 * ── The one thing this screen is really for ──────────────────────────────────
 *
 * Making the safe answer to "I need access to your email platform" the obvious
 * one. Asked in free text, a meaningful share of clients reply with a username
 * and a password. So ACCESS items don't have a field for one: they ask who was
 * invited, the warning is in front of the input rather than buried in help text,
 * and the server refuses a response that looks like a secret and says what to do
 * instead. That refusal arriving as a clear sentence — not a red "400" — is why
 * every error here surfaces the server's own message verbatim.
 *
 * The panel reflects what the server says rather than deciding for itself:
 * `canRaise`, the item statuses and the outstanding counts all come back from
 * the API, so the two can't disagree about whether the work is blocked.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "@/components/ui/use-toast";
import {
  fetchAccessRequest,
  fetchAccessTemplates,
  fetchAccessTemplate,
  addAccessItems,
  respondToAccessItem,
  reopenAccessItem,
  withdrawAccessItem,
  openAccessAttachment,
  uploadAccessAsset,
  formatDateTime,
  type AccessItem,
  type AccessItemKind,
  type AccessRequest,
  type AccessTemplateSummary,
  type BriefAttachment,
  type OrderKind,
} from "@/lib/escrowApi";

const GRAD = "linear-gradient(270deg, #1A73E8 0%, #FF14EF 100%)";

/* What each kind actually asks of the client. The label is what appears on the
   chip; `answer` is what the response form asks for, and differs enough between
   kinds that a single generic "your answer" box would be worse than useless on
   an ACCESS item. */
const KIND_META: Record<AccessItemKind, { icon: string; label: string; answer: string }> = {
  ASSET: { icon: "📎", label: "File", answer: "Attach the file, or paste a link to it" },
  ACCESS: { icon: "🔑", label: "Access", answer: "Which account did you invite?" },
  INFO: { icon: "✍️", label: "Info", answer: "Write your answer" },
  APPROVAL: { icon: "✅", label: "Decision", answer: "Your decision" },
};

const STATUS_TONE: Record<AccessItem["status"], { color: string; bg: string; label: string }> = {
  PENDING: { color: "#FABC4E", bg: "rgba(250,188,78,0.10)", label: "OUTSTANDING" },
  PROVIDED: { color: "#19E66C", bg: "rgba(25,230,108,0.10)", label: "PROVIDED" },
  DECLINED: { color: "#FF8F8F", bg: "rgba(255,107,107,0.10)", label: "DECLINED" },
  NOT_APPLICABLE: { color: "#8F8996", bg: "rgba(255,255,255,0.05)", label: "WITHDRAWN" },
};

/* Shown above every free-text field the client can type into, and in the
   creator's own composer. Deliberately not collapsible: the whole point is that
   it is read before the first credential is typed, not after. */
function CredentialWarning({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className="rounded-lg px-3 py-2.5 text-[11px] leading-relaxed"
      style={{ background: "rgba(255,107,107,0.07)", border: "1px solid rgba(255,107,107,0.20)" }}
    >
      <span className="font-bold text-[#FF8F8F]">Never send passwords through Tokun.</span>{" "}
      <span className="text-white/55">
        {compact
          ? "Invite the creator's account instead, then reply with the email you invited."
          : "Not here, not in chat, not in an attachment — a password sent through Tokun would sit in plaintext on an account nobody remembers to change. Instead, invite the creator's own account to the system at the lowest level that lets them work, reply with the email or username you invited, and revoke it when the engagement ends. Anything that looks like a credential will be refused."}
      </span>
    </div>
  );
}

/* ── the client's answer form ──────────────────────────────────────────────── */

function RespondForm({
  item,
  kind,
  orderId,
  token,
  onDone,
}: {
  item: AccessItem;
  kind: OrderKind;
  orderId: string;
  token?: string;
  onDone: (request: AccessRequest) => void;
}) {
  const meta = KIND_META[item.kind];
  const [mode, setMode] = useState<"provide" | "decline">("provide");
  const [note, setNote] = useState("");
  const [grantedTo, setGrantedTo] = useState("");
  const [reason, setReason] = useState("");
  const [files, setFiles] = useState<BriefAttachment[]>([]);
  const [uploading, setUploading] = useState(false);
  const [busy, setBusy] = useState(false);

  const pickFiles = useCallback(
    async (list: FileList | null) => {
      if (!list?.length) return;
      setUploading(true);
      try {
        // Sequential, not parallel: these are brand kits and archives on a
        // small plan, and eight concurrent 150 MB uploads is how a phone
        // connection drops all of them instead of finishing one.
        for (const file of Array.from(list).slice(0, 8)) {
          const descriptor = await uploadAccessAsset(file, token);
          setFiles((prev) => [...prev, descriptor]);
        }
      } catch (err: any) {
        toast({ title: "Upload failed", description: err?.message || "Try again." });
      }
      setUploading(false);
    },
    [token]
  );

  const submit = useCallback(async () => {
    setBusy(true);
    try {
      const { request } = await respondToAccessItem(
        kind,
        orderId,
        item._id,
        mode === "decline"
          ? { action: "decline", reason, note }
          : { action: "provide", note, grantedTo, attachments: files },
        token
      );
      onDone(request);
      toast({
        title: mode === "decline" ? "Marked as unavailable" : "Sent to the creator",
      });
    } catch (err: any) {
      /* The credential refusal lands here, and its message is a paragraph of
         instruction rather than an error string. Shown in full and left on
         screen — a truncated version of it would defeat the purpose. */
      toast({
        title: err?.code === "looks_like_credential" ? "Don't send that here" : "Couldn't send",
        description: err?.message || "Try again.",
        duration: err?.code === "looks_like_credential" ? 15_000 : undefined,
      });
    }
    setBusy(false);
  }, [kind, orderId, item._id, mode, note, grantedTo, reason, files, token, onDone]);

  return (
    <div className="mt-3 pt-3 border-t border-white/[0.07] space-y-3">
      <div className="flex gap-1.5">
        {(["provide", "decline"] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className="px-3 py-1.5 rounded-full text-[11px] font-semibold transition"
            style={
              mode === m
                ? { background: "rgba(255,255,255,0.12)", color: "#fff" }
                : { background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.45)" }
            }
          >
            {m === "provide" ? "I have this" : "I can't provide this"}
          </button>
        ))}
      </div>

      {mode === "provide" ? (
        <>
          {item.kind === "ACCESS" && (
            <>
              <CredentialWarning />
              <div>
                <label className="text-[11px] text-white/45 block mb-1.5">{meta.answer}</label>
                <input
                  value={grantedTo}
                  onChange={(e) => setGrantedTo(e.target.value)}
                  placeholder="e.g. creator@example.com — the account you added"
                  className="w-full h-10 px-3 rounded-lg text-sm bg-black/30 border border-white/10 text-white placeholder:text-white/25 focus:outline-none focus:border-white/25"
                />
              </div>
            </>
          )}

          {item.kind === "ASSET" && (
            <div>
              <label className="text-[11px] text-white/45 block mb-1.5">{meta.answer}</label>
              <input
                type="file"
                multiple
                onChange={(e) => pickFiles(e.target.files)}
                disabled={uploading}
                className="w-full text-xs text-white/60 file:mr-3 file:px-3 file:py-1.5 file:rounded-lg file:border-0 file:bg-white/[0.08] file:text-white/80 file:text-xs"
              />
              {uploading && <p className="text-[11px] text-white/40 mt-1.5">Uploading…</p>}
              {files.length > 0 && (
                <div className="mt-2 space-y-1">
                  {files.map((f, i) => (
                    <div
                      key={`${f.blobName}-${i}`}
                      className="flex items-center justify-between gap-2 text-[11px] text-white/60 bg-black/20 rounded-md px-2.5 py-1.5"
                    >
                      <span className="truncate">📎 {f.name}</span>
                      <button
                        onClick={() => setFiles((prev) => prev.filter((_, idx) => idx !== i))}
                        className="text-white/35 hover:text-white/70 shrink-0"
                        aria-label={`Remove ${f.name}`}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {/* Named, because the templates for footage and archives tell the
                  client to do exactly this and the field has to exist. */}
              <p className="text-[10px] text-white/30 mt-1.5">
                Too big to upload? Paste a Drive or WeTransfer link in the note below instead.
              </p>
            </div>
          )}

          <div>
            <label className="text-[11px] text-white/45 block mb-1.5">
              {item.kind === "ASSET" || item.kind === "ACCESS" ? "Anything else (optional)" : meta.answer}
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              placeholder={
                item.kind === "INFO" || item.kind === "APPROVAL"
                  ? "Your answer…"
                  : "A link, a caveat, or where to find the rest…"
              }
              className="w-full rounded-lg text-sm p-2.5 bg-black/30 border border-white/10 text-white placeholder:text-white/25 focus:outline-none focus:border-white/25"
            />
          </div>
        </>
      ) : (
        <div>
          <label className="text-[11px] text-white/45 block mb-1.5">
            Why? "We don't have brand guidelines" is a perfectly good answer
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={2}
            placeholder="The creator needs to hear this rather than keep waiting…"
            className="w-full rounded-lg text-sm p-2.5 bg-black/30 border border-white/10 text-white placeholder:text-white/25 focus:outline-none focus:border-white/25"
          />
        </div>
      )}

      <button
        onClick={submit}
        disabled={busy || uploading || (mode === "decline" && !reason.trim())}
        className="h-10 px-5 rounded-lg text-sm font-semibold text-white disabled:opacity-40 transition"
        style={{ background: mode === "decline" ? "rgba(255,255,255,0.10)" : GRAD }}
      >
        {busy ? "Sending…" : mode === "decline" ? "Mark unavailable" : "Send to creator"}
      </button>
    </div>
  );
}

/* ── one checklist row ─────────────────────────────────────────────────────── */

function ItemRow({
  item,
  request,
  kind,
  orderId,
  viewerRole,
  token,
  onChanged,
}: {
  item: AccessItem;
  request: AccessRequest;
  kind: OrderKind;
  orderId: string;
  viewerRole: "buyer" | "seller";
  token?: string;
  onChanged: (request: AccessRequest) => void;
}) {
  const [open, setOpen] = useState(false);
  const [reopening, setReopening] = useState(false);
  const [reopenNote, setReopenNote] = useState("");
  const [busy, setBusy] = useState(false);

  const meta = KIND_META[item.kind];
  const tone = STATUS_TONE[item.status];
  const isBuyer = viewerRole === "buyer";
  const canAnswer = isBuyer && item.status === "PENDING";

  const doReopen = useCallback(async () => {
    setBusy(true);
    try {
      const { request: next } = await reopenAccessItem(kind, orderId, item._id, reopenNote, token);
      onChanged(next);
      setReopening(false);
      setReopenNote("");
    } catch (err: any) {
      toast({ title: "Couldn't send it back", description: err?.message || "Try again." });
    }
    setBusy(false);
  }, [kind, orderId, item._id, reopenNote, token, onChanged]);

  const doWithdraw = useCallback(async () => {
    setBusy(true);
    try {
      const { request: next } = await withdrawAccessItem(kind, orderId, item._id, token);
      onChanged(next);
    } catch (err: any) {
      toast({ title: "Couldn't withdraw", description: err?.message || "Try again." });
    }
    setBusy(false);
  }, [kind, orderId, item._id, token, onChanged]);

  return (
    <div
      className="rounded-xl p-3.5"
      style={{
        background: item.status === "PENDING" ? "rgba(250,188,78,0.04)" : "rgba(0,0,0,0.25)",
        border: `1px solid ${item.status === "PENDING" ? "rgba(250,188,78,0.18)" : "rgba(255,255,255,0.07)"}`,
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-white/90 flex items-center gap-2 flex-wrap">
            <span>{meta.icon}</span>
            <span className="truncate">{item.label}</span>
            {!item.required && (
              <span className="text-[10px] text-white/35 font-normal">optional</span>
            )}
          </p>
          {!!item.note && (
            <p className="text-[12px] text-white/50 mt-1 leading-relaxed whitespace-pre-line">
              {item.note}
            </p>
          )}
        </div>
        <span
          className="shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full"
          style={{ color: tone.color, background: tone.bg }}
        >
          {tone.label}
        </span>
      </div>

      {/* Why it came back, if it did. Shown above the answer because it is what
          the client has to read before answering again — a checklist item that
          round-trips silently gets the same wrong file sent twice. */}
      {item.status === "PENDING" && (item.reopenCount || 0) > 0 && !!item.reopenNote && (
        <p className="mt-2.5 text-[12px] leading-relaxed rounded-lg px-3 py-2 text-white/70"
           style={{ background: "rgba(250,188,78,0.08)" }}>
          <span className="text-[#FABC4E] font-semibold">Sent back:</span> {item.reopenNote}
        </p>
      )}

      {/* The answer. */}
      {(item.status === "PROVIDED" || item.status === "DECLINED") && (
        <div className="mt-2.5 space-y-2">
          {!!item.grantedTo && (
            <p className="text-[12px] text-white/70">
              <span className="text-white/40">Invited:</span>{" "}
              <span className="font-mono">{item.grantedTo}</span>
            </p>
          )}
          {!!item.declineReason && (
            <p className="text-[12px] text-white/70">
              <span className="text-white/40">Can't provide:</span> {item.declineReason}
            </p>
          )}
          {!!item.responseNote && (
            <p className="text-[12px] text-white/75 whitespace-pre-line leading-relaxed">
              {item.responseNote}
            </p>
          )}
          {item.attachments.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {item.attachments.map((a) => (
                <button
                  key={a.index}
                  onClick={() =>
                    openAccessAttachment(request._id, item._id, a.index, token).catch((err: any) =>
                      toast({ title: "Couldn't open", description: err?.message || "Try again." })
                    )
                  }
                  className="text-[11px] text-white/70 bg-black/30 border border-white/[0.09] rounded-md px-2.5 py-1.5 hover:border-white/30 transition max-w-full"
                >
                  <span className="truncate inline-block max-w-[220px] align-bottom">📎 {a.name}</span>
                </button>
              ))}
            </div>
          )}
          {!!item.providedAt && (
            <p className="text-[10px] text-white/30">{formatDateTime(item.providedAt)}</p>
          )}
        </div>
      )}

      {/* Client's actions. */}
      {canAnswer && !open && (
        <button
          onClick={() => setOpen(true)}
          className="mt-3 h-9 px-4 rounded-lg text-xs font-semibold text-white transition"
          style={{ background: GRAD }}
        >
          Provide this
        </button>
      )}
      {canAnswer && open && (
        <RespondForm
          item={item}
          kind={kind}
          orderId={orderId}
          token={token}
          onDone={(next) => {
            setOpen(false);
            onChanged(next);
          }}
        />
      )}

      {/* Creator's actions. Reopen needs a reason — sending something back with
          no explanation is how a checklist becomes a loop. */}
      {!isBuyer && (item.status === "PROVIDED" || item.status === "DECLINED") && !reopening && (
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            onClick={() => setReopening(true)}
            className="h-8 px-3 rounded-lg text-[11px] font-medium text-white/70 border border-white/12 bg-white/[0.04] hover:bg-white/[0.08] transition"
          >
            Not right — send back
          </button>
          <button
            onClick={doWithdraw}
            disabled={busy}
            className="h-8 px-3 rounded-lg text-[11px] font-medium text-white/45 hover:text-white/70 transition disabled:opacity-40"
          >
            No longer needed
          </button>
        </div>
      )}
      {!isBuyer && reopening && (
        <div className="mt-3 pt-3 border-t border-white/[0.07] space-y-2">
          <textarea
            value={reopenNote}
            onChange={(e) => setReopenNote(e.target.value)}
            rows={2}
            placeholder="What's wrong with what they sent? Without this they'll send the same thing again."
            className="w-full rounded-lg text-sm p-2.5 bg-black/30 border border-white/10 text-white placeholder:text-white/25 focus:outline-none focus:border-white/25"
          />
          <div className="flex gap-2">
            <button
              onClick={doReopen}
              disabled={busy || !reopenNote.trim()}
              className="h-9 px-4 rounded-lg text-xs font-semibold text-white disabled:opacity-40 transition"
              style={{ background: GRAD }}
            >
              {busy ? "Sending…" : "Send back"}
            </button>
            <button
              onClick={() => setReopening(false)}
              className="h-9 px-3 rounded-lg text-xs text-white/50 hover:text-white/80 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {!isBuyer && item.status === "PENDING" && (
        <button
          onClick={doWithdraw}
          disabled={busy}
          className="mt-3 text-[11px] text-white/35 hover:text-white/65 transition disabled:opacity-40"
        >
          No longer needed
        </button>
      )}
    </div>
  );
}

/* ── the creator's composer ────────────────────────────────────────────────── */

type Draft = { label: string; kind: AccessItemKind; required: boolean; note: string };

const BLANK_DRAFT: Draft = { label: "", kind: "ASSET", required: true, note: "" };

function Composer({
  kind,
  orderId,
  token,
  hasExisting,
  onAdded,
  onClose,
}: {
  kind: OrderKind;
  orderId: string;
  token?: string;
  hasExisting: boolean;
  onAdded: (request: AccessRequest) => void;
  onClose: () => void;
}) {
  const [templates, setTemplates] = useState<AccessTemplateSummary[]>([]);
  const [drafts, setDrafts] = useState<Draft[]>([{ ...BLANK_DRAFT }]);
  const [loadingTemplate, setLoadingTemplate] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let alive = true;
    fetchAccessTemplates(token)
      .then((d) => alive && setTemplates(d.templates || []))
      // A missing template list costs nothing — the custom rows below still
      // work, so this failure stays silent rather than throwing a toast at
      // someone who was about to type their own list anyway.
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [token]);

  /* A template is loaded into the drafts rather than posted directly, so the
     creator edits it before it reaches the client. The wording of the ACCESS
     items is the part worth keeping — see the constants file. */
  const loadTemplate = useCallback(
    async (id: string) => {
      setLoadingTemplate(id);
      try {
        const { template } = await fetchAccessTemplate(id, token);
        setDrafts((prev) => {
          const typed = prev.filter((d) => d.label.trim());
          const seen = new Set(typed.map((d) => d.label.trim().toLowerCase()));
          const incoming = template.items
            .filter((i) => !seen.has(i.label.trim().toLowerCase()))
            .map((i) => ({
              label: i.label,
              kind: i.kind,
              required: i.required,
              note: i.note || "",
            }));
          return [...typed, ...incoming, { ...BLANK_DRAFT }];
        });
      } catch (err: any) {
        toast({ title: "Couldn't load that checklist", description: err?.message });
      }
      setLoadingTemplate(null);
    },
    [token]
  );

  const filled = useMemo(() => drafts.filter((d) => d.label.trim()), [drafts]);

  const submit = useCallback(async () => {
    if (!filled.length) return;
    setBusy(true);
    try {
      const { request, added } = await addAccessItems(kind, orderId, { items: filled }, token);
      onAdded(request);
      toast({
        title: `${added} item${added === 1 ? "" : "s"} sent to the client`,
        description: "They've been notified and it's on their order page.",
      });
      onClose();
    } catch (err: any) {
      toast({ title: "Couldn't send the checklist", description: err?.message || "Try again." });
    }
    setBusy(false);
  }, [filled, kind, orderId, token, onAdded, onClose]);

  const update = (i: number, patch: Partial<Draft>) =>
    setDrafts((prev) => prev.map((d, idx) => (idx === i ? { ...d, ...patch } : d)));

  return (
    <div className="mt-4 rounded-xl border border-white/10 bg-black/20 p-4 space-y-4">
      <div>
        <p className="text-[11px] uppercase tracking-wider text-white/40 mb-2">
          Start from a checklist
        </p>
        <div className="flex flex-wrap gap-2">
          {templates.map((t) => (
            <button
              key={t.id}
              onClick={() => loadTemplate(t.id)}
              disabled={!!loadingTemplate}
              title={t.description}
              className="px-3 py-1.5 rounded-full text-[11px] font-medium text-white/70 border border-white/12 bg-white/[0.04] hover:bg-white/[0.09] transition disabled:opacity-40"
            >
              {loadingTemplate === t.id ? "Loading…" : `${t.label} · ${t.itemCount}`}
            </button>
          ))}
        </div>
        <p className="text-[10px] text-white/30 mt-2">
          Loaded as editable rows — change the wording, drop what you don't need.
        </p>
      </div>

      <CredentialWarning compact />

      <div className="space-y-3">
        {drafts.map((d, i) => (
          <div key={i} className="rounded-lg border border-white/[0.08] bg-black/20 p-3 space-y-2">
            <div className="flex gap-2">
              <input
                value={d.label}
                onChange={(e) => update(i, { label: e.target.value })}
                placeholder="What do you need? e.g. Logo files"
                className="flex-1 h-9 px-3 rounded-lg text-sm bg-black/35 border border-white/10 text-white placeholder:text-white/25 focus:outline-none focus:border-white/25"
              />
              <select
                value={d.kind}
                onChange={(e) => update(i, { kind: e.target.value as AccessItemKind })}
                className="h-9 px-2 rounded-lg text-xs bg-black/35 border border-white/10 text-white/80 focus:outline-none"
              >
                {(Object.keys(KIND_META) as AccessItemKind[]).map((k) => (
                  <option key={k} value={k}>
                    {KIND_META[k].label}
                  </option>
                ))}
              </select>
              {drafts.length > 1 && (
                <button
                  onClick={() => setDrafts((prev) => prev.filter((_, idx) => idx !== i))}
                  className="w-9 h-9 rounded-lg text-white/35 hover:text-white/70 border border-white/10 transition shrink-0"
                  aria-label="Remove row"
                >
                  ✕
                </button>
              )}
            </div>
            <input
              value={d.note}
              onChange={(e) => update(i, { note: e.target.value })}
              placeholder={
                d.kind === "ACCESS"
                  ? "Which account to invite, and at what level. Say not to send a password."
                  : "What good looks like — format, where to find it (optional)"
              }
              className="w-full h-9 px-3 rounded-lg text-xs bg-black/35 border border-white/[0.08] text-white/80 placeholder:text-white/25 focus:outline-none focus:border-white/20"
            />
            <label className="flex items-center gap-2 text-[11px] text-white/50 cursor-pointer">
              <input
                type="checkbox"
                checked={d.required}
                onChange={(e) => update(i, { required: e.target.checked })}
                className="accent-[#FF14EF]"
              />
              {/* Says what ticking it actually does. "Required" on its own gets
                  ticked on everything, and a creator who marks a nice-to-have
                  as blocking has quietly frozen their own deadline. */}
              Work is blocked without this — it counts towards the outstanding
              list and extends your delivery deadline while it's missing
            </label>
          </div>
        ))}

        <button
          onClick={() => setDrafts((prev) => [...prev, { ...BLANK_DRAFT }])}
          className="text-[11px] text-white/45 hover:text-white/75 transition"
        >
          + Add another
        </button>
      </div>

      <div className="flex gap-2 pt-1">
        <button
          onClick={submit}
          disabled={busy || !filled.length}
          className="h-10 px-5 rounded-lg text-sm font-semibold text-white disabled:opacity-40 transition"
          style={{ background: GRAD }}
        >
          {busy
            ? "Sending…"
            : hasExisting
              ? `Add ${filled.length} item${filled.length === 1 ? "" : "s"}`
              : `Send ${filled.length} item${filled.length === 1 ? "" : "s"} to the client`}
        </button>
        <button
          onClick={onClose}
          className="h-10 px-4 rounded-lg text-sm text-white/50 hover:text-white/80 transition"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

/* ── the panel ─────────────────────────────────────────────────────────────── */

export default function AccessRequestPanel({
  orderKind,
  orderId,
  token,
  /** Notified when the checklist changes, so the page can refresh the welcome
      doc and the agreement's Schedule C — both read the order response. */
  onChanged,
}: {
  orderKind: OrderKind;
  orderId: string;
  token?: string;
  onChanged?: () => void;
}) {
  const [request, setRequest] = useState<AccessRequest | null>(null);
  const [viewerRole, setViewerRole] = useState<"buyer" | "seller">("buyer");
  const [canRaise, setCanRaise] = useState(false);
  const [loading, setLoading] = useState(true);
  const [composing, setComposing] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await fetchAccessRequest(orderKind, orderId, token);
      setRequest(data.request);
      setViewerRole(data.viewerRole);
      setCanRaise(data.canRaise);
    } catch {
      /* A checklist that can't load must not blank the order page. The panel
         simply doesn't render, which is the same as the (common) case of no
         checklist having been raised. */
    }
    setLoading(false);
  }, [orderKind, orderId, token]);

  useEffect(() => {
    load();
  }, [load]);

  const apply = useCallback(
    (next: AccessRequest) => {
      setRequest(next);
      onChanged?.();
    },
    [onChanged]
  );

  if (loading) return null;

  const isBuyer = viewerRole === "buyer";
  const items = request?.items || [];
  const visible = items.filter((i) => i.status !== "NOT_APPLICABLE");
  const outstanding = request?.summary.outstandingRequired ?? 0;

  /* Nothing raised and nothing the viewer can do about it — render nothing
     rather than an empty section. A client sees this panel only once the
     creator has actually asked for something. */
  if (!request && !canRaise) return null;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0">
          <p className="text-[10px] font-bold tracking-[1.4px] text-white/40 uppercase">
            {isBuyer ? "What the creator needs from you" : "What you've asked the client for"}
          </p>
          {!!request && (
            <p className="text-[11px] text-white/40 mt-1">
              {outstanding > 0 ? (
                <span className="text-[#FABC4E] font-semibold">
                  {outstanding} required item{outstanding === 1 ? "" : "s"} outstanding
                </span>
              ) : request.status === "CANCELLED" ? (
                "Checklist closed"
              ) : (
                <span className="text-[#19E66C] font-semibold">Everything's in</span>
              )}
              {visible.length > 0 && (
                <span className="text-white/30">
                  {" "}
                  · {request.summary.provided} of {visible.length} provided
                </span>
              )}
            </p>
          )}
        </div>

        {canRaise && !composing && (
          <button
            onClick={() => setComposing(true)}
            className="shrink-0 h-9 px-4 rounded-lg text-xs font-semibold text-white transition"
            style={{ background: request ? "rgba(255,255,255,0.10)" : GRAD }}
          >
            {request ? "+ Add items" : "Ask for what you need"}
          </button>
        )}
      </div>

      {/* The creator's own case for a late delivery, stated as a number rather
          than an argument. Advisory — it does not move deliveryDueAt on its
          own, because a deadline that shifts without either party agreeing
          would be a worse problem than the one it solves. */}
      {!isBuyer && !!request && (request.blockedHours > 0 || !!request.blockedSince) && (
        <p className="text-[11px] leading-relaxed rounded-lg px-3 py-2 mb-3 text-white/60"
           style={{ background: "rgba(26,115,232,0.07)", border: "1px solid rgba(26,115,232,0.16)" }}>
          This checklist has held the work up for roughly{" "}
          <span className="text-white/85 font-semibold">
            {request.blockedHours} hour{request.blockedHours === 1 ? "" : "s"}
          </span>
          {request.blockedSince ? " and counting" : ""}. Under clause 11 of your agreement your
          delivery deadline extends by that time — it isn't applied automatically, so raise it with
          the client, or with Tokun if it's ever disputed.
        </p>
      )}

      {!request && canRaise && !composing && (
        <p className="text-sm text-white/50 leading-relaxed">
          Brand files, copy, access to a platform, a decision only they can make — ask for it as a
          checklist instead of in chat. The client gets a clear list they can tick off, the files
          land on this order rather than in a message thread, and any delay in providing something
          required extends your delivery deadline.
        </p>
      )}

      {composing && (
        <Composer
          kind={orderKind}
          orderId={orderId}
          token={token}
          hasExisting={!!request}
          onAdded={apply}
          onClose={() => setComposing(false)}
        />
      )}

      {visible.length > 0 && (
        <div className="space-y-2.5 mt-1">
          {/* Outstanding first — this is a to-do list, and the answered rows
              are history. Within each group the original order is kept, which
              is the order the creator asked in. */}
          {[...visible]
            .sort((a, b) => (a.status === "PENDING" ? 0 : 1) - (b.status === "PENDING" ? 0 : 1))
            .map((item) => (
              <ItemRow
                key={item._id}
                item={item}
                request={request!}
                kind={orderKind}
                orderId={orderId}
                viewerRole={viewerRole}
                token={token}
                onChanged={apply}
              />
            ))}
        </div>
      )}

      {isBuyer && outstanding > 0 && (
        <p className="text-[11px] text-white/35 mt-3 leading-relaxed">
          The creator can't finish without these, and the delivery date moves out for as long as
          they're missing.
        </p>
      )}
    </div>
  );
}
