import { useRef, useState } from "react";
import { ShieldCheck } from "lucide-react";

const GRAD = "linear-gradient(270.19deg, #1A73E8 0.16%, #FF14EF 99.84%)";
const API_BASE = (import.meta as any).env?.VITE_API_URL?.replace(/\/$/, "") || "http://localhost:5000";

interface Props {
  open: boolean;
  onGranted: () => void;
  onSkip: () => void;
  onUploadDone?: () => void;
  userId?: string;
  userName?: string;
  userEmail?: string;
  promptTitle?: string;
  token?: string;
}

function getSupportedMimeType() {
  const types = ["video/webm;codecs=vp9", "video/webm;codecs=vp8", "video/webm"];
  return types.find((t) => MediaRecorder.isTypeSupported(t)) || "";
}

export default function ScreenRecordPermissionModal({
  open, onGranted, onSkip, onUploadDone,
  userId, userName, userEmail, promptTitle, token
}: Props) {

  const [phase, setPhase] = useState<"idle"|"loading"|"recording"|"uploading"|"done"|"error">("idle");
  const [seconds, setSeconds] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");

  const streamRef   = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef   = useRef<BlobPart[]>([]);
  const timerRef    = useRef<number | null>(null);
  const mimeRef     = useRef("");

  function startTimer() {
    setSeconds(0);
    timerRef.current = window.setInterval(() => setSeconds(s => s + 1), 1000);
  }
  function stopTimer() {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  }
  function fmt(s: number) {
    return `${String(Math.floor(s / 60)).padStart(2,"0")}:${String(s % 60).padStart(2,"0")}`;
  }

  async function doUpload(blob: Blob) {
    setPhase("uploading");
    try {
      const fd = new FormData();
      fd.append("video", blob, `screen-${Date.now()}.webm`);
      if (userId)      fd.append("userId",      userId);
      if (userName)    fd.append("userName",    userName);
      if (userEmail)   fd.append("userEmail",   userEmail);
      if (promptTitle) fd.append("promptTitle", promptTitle);

      const res = await fetch(`${API_BASE}/api/screen-recording/upload`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: fd,
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.success) throw new Error(data?.error || "Upload failed");
      setPhase("done");
      onUploadDone?.();
    } catch (e: any) {
      console.error("Upload failed:", e?.message);
      setPhase("done");
      onUploadDone?.();
    }
  }

  function stopRecording() {
    if (recorderRef.current && recorderRef.current.state !== "inactive") {
      recorderRef.current.stop();
    }
  }

  async function handleStart() {
    setPhase("loading");
    setErrorMsg("");
    chunksRef.current = [];

    try {
      if (!navigator.mediaDevices?.getDisplayMedia)
        throw new Error("display_media_not_supported");

      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
      streamRef.current = stream;

      const mimeType = getSupportedMimeType();
      mimeRef.current = mimeType;

      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      recorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data?.size > 0) chunksRef.current.push(e.data);
      };

   recorder.onstart = () => {
  setPhase("recording");
  startTimer();
  

  setTimeout(() => {
    onGranted();
  }, 150);
};

      recorder.onstop = async () => {
        stopTimer();
        streamRef.current?.getTracks().forEach(t => t.stop());
        streamRef.current = null;
        recorderRef.current = null;

        const blob = new Blob(chunksRef.current, { type: mimeRef.current || "video/webm" });
        chunksRef.current = [];
        console.log(`[Recording] Blob size: ${blob.size} bytes`);

        if (blob.size > 1000) {
          await doUpload(blob);
        } else {
          setPhase("done");
          onUploadDone?.();
        }
      };

      recorder.onerror = () => {
        stopTimer();
        setPhase("error");
        setErrorMsg("Recording failed. Please try again.");
      };

      stream.getVideoTracks()[0].onended = () => {
        if (recorderRef.current?.state !== "inactive") recorderRef.current?.stop();
      };

      recorder.start(1000);

    } catch (err: any) {
      setPhase("error");
      if (err?.name === "NotAllowedError")
        setErrorMsg("Permission denied. Please allow screen recording and try again.");
      else if (err?.name === "NotFoundError")
        setErrorMsg("No screen source selected. Please try again.");
      else if (err?.message === "display_media_not_supported")
        setErrorMsg("Your browser does not support screen recording.");
      else
        setErrorMsg("Could not start. Try again.");
    }
  }

  // ✅ KEY LOGIC:
  // - open=true  + phase=idle/loading/error  → permission modal dikhao
  // - phase=recording                        → HIDE (background mein record karo, SellModal dikhega)
  // - phase=uploading/done                   → uploading toast dikhao (small overlay)
  
  // Permission modal: sirf tab dikhao jab recording nahi chal rahi
  const showPermissionModal = open && (phase === "idle" || phase === "loading" || phase === "error");
  
  // Upload toast: recording ke baad upload/done phase mein
  const showUploadToast = phase === "uploading" || phase === "done";

  if (!showPermissionModal && !showUploadToast) return null;

  // ── Small upload toast (bottom right, SellModal ke upar) ──
  if (showUploadToast) {
    return (
      <div style={{
        position: "fixed", bottom: 24, right: 24, zIndex: 999999,
        borderRadius: 14, padding: "14px 20px",
        background: phase === "done" ? "rgba(25,230,108,0.15)" : "rgba(26,115,232,0.15)",
        border: `1px solid ${phase === "done" ? "rgba(25,230,108,0.35)" : "rgba(26,115,232,0.35)"}`,
        color: phase === "done" ? "#19E66C" : "#60A5FA",
        fontSize: 13, fontWeight: 600,
        fontFamily: "Inter, sans-serif",
        boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
        display: "flex", alignItems: "center", gap: 10,
        minWidth: 220,
      }}>
        {phase === "uploading" ? (
          <>
            <span style={{ display: "inline-block", width: 10, height: 10, borderRadius: "50%", background: "#60A5FA", animation: "recPulse 1.2s infinite" }}/>
            Uploading recording...
          </>
        ) : (
          <>✓ Recording saved</>
        )}
        <style>{`@keyframes recPulse { 0%,100%{opacity:1} 50%{opacity:0.3} }`}</style>
      </div>
    );
  }

  // ── Full permission modal ──────────────────────────────────
  return (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.72)", backdropFilter: "blur(6px)" }}
    >
      <div style={{
        width: "min(92vw, 420px)", borderRadius: 20, background: "#17171A",
        padding: "36px 28px 28px", display: "flex", flexDirection: "column",
        alignItems: "center", fontFamily: "Inter, system-ui, sans-serif",
        boxShadow: "0 32px 80px rgba(0,0,0,0.65)",
        border: "1px solid rgba(255,255,255,0.07)"
      }}>

        <div style={{ width: 72, height: 72, borderRadius: "50%", background: "#2C2C2E", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 22 }}>
          <svg width="30" height="24" viewBox="0 0 30 24" fill="none">
            <defs>
              <linearGradient id="sig" x1="0" y1="12" x2="30" y2="12" gradientUnits="userSpaceOnUse">
                <stop stopColor="#FF14EF"/><stop offset="1" stopColor="#1A73E8"/>
              </linearGradient>
            </defs>
            <path d="M3 24C2.175 24 1.46875 23.7062 0.88125 23.1187C0.29375 22.5312 0 21.825 0 21V3C0 2.175 0.29375 1.46875 0.88125 0.88125C1.46875 0.29375 2.175 0 3 0H21C21.825 0 22.5312 0.29375 23.1187 0.88125C23.7062 1.46875 24 2.175 24 3V9.75L30 3.75V20.25L24 14.25V21C24 21.825 23.7062 22.5312 23.1187 23.1187C22.5312 23.7062 21.825 24 21 24H3Z" fill="url(#sig)"/>
          </svg>
        </div>

        <h2 style={{ margin: "0 0 14px", fontSize: 20, fontWeight: 700, color: "#FFF", textAlign: "center" }}>
          Screen Recording Permission
        </h2>

        <p style={{ margin: "0 0 20px", fontSize: 14, color: "rgba(255,255,255,0.62)", textAlign: "center", lineHeight: "22px" }}>
          To maintain the integrity of our terminal environment, we require screen recording access. This helps verify your{" "}
          <span style={{ fontWeight: 600, background: GRAD, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            prompt generation
          </span>{" "}
          logic and ensures optimal performance for your digital assets.
        </p>

        <div style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "#080808", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 999, padding: "7px 16px", marginBottom: 22 }}>
          <ShieldCheck style={{ width: 13, height: 13, color: "rgba(255,255,255,0.55)" }}/>
          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "1.8px", color: "rgba(255,255,255,0.55)", textTransform: "uppercase" }}>
            Encrypted Verification Layer
          </span>
        </div>

        {phase === "error" && (
          <p style={{ margin: "0 0 14px", fontSize: 12, color: "#FF6B6B", textAlign: "center" }}>{errorMsg}</p>
        )}

        <div style={{ display: "flex", gap: 12, width: "100%" }}>
          <button
            type="button"
            onClick={handleStart}
            disabled={phase === "loading"}
            style={{
              flex: 1, height: 48, borderRadius: 10, border: "none",
              background: phase === "loading" ? "rgba(255,20,239,0.5)" : GRAD,
              color: "#FFF", fontSize: 15, fontWeight: 600,
              cursor: phase === "loading" ? "not-allowed" : "pointer"
            }}>
            {phase === "loading" ? "Starting..." : "Start Recording"}
          </button>

          <button
            type="button"
            onClick={onSkip}
            disabled={phase === "loading"}
            style={{
              flex: 1, height: 48, borderRadius: 10,
              border: "1px solid rgba(255,255,255,0.15)",
              background: "#2C2C2E", color: "rgba(255,255,255,0.80)",
              fontSize: 15, fontWeight: 500,
              cursor: phase === "loading" ? "not-allowed" : "pointer",
              opacity: phase === "loading" ? 0.5 : 1,
            }}>
            Maybe Later
          </button>
        </div>

        <p style={{ margin: "16px 0 0", color: "rgba(255,255,255,0.42)", fontSize: 11, textAlign: "center" }}>
          Requires HTTPS or localhost. macOS: allow screen recording in System Settings → Privacy.
        </p>
      </div>
    </div>
  );
}