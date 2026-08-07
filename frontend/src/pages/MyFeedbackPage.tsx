import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/Header";
import { mediaUrl } from "@/lib/mediaUrl";

const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, "");

const stars = (n: number) => "★".repeat(n) + "☆".repeat(5 - n);
const sentColor: Record<string, string> = { positive: "#4ade80", neutral: "#facc15", negative: "#f87171" };
const statusColor: Record<string, string> = { pending: "#facc15", reviewed: "#60a5fa", resolved: "#4ade80" };

export default function MyFeedbackPage() {
  const { user } = useAuth() as any;
  const navigate = useNavigate();
  const [email, setEmail] = useState(user?.email || "");
  const [submitted, setSubmitted] = useState(false);
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchMyFeedback = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!email.trim()) { setError("Enter your email"); return; }
    setError(""); setLoading(true); setSubmitted(false);
    try {
      const res = await fetch(`${API_BASE}/api/feedback/my?email=${encodeURIComponent(email.trim())}`);
      const data = await res.json();
      if (data.success) { setFeedbacks(data.feedbacks); setSubmitted(true); }
      else setError("Could not fetch feedback.");
    } catch { setError("Network error. Try again."); }
    setLoading(false);
  };

  // Auto-fetch if user email is available
  useEffect(() => {
    if (user?.email) { setEmail(user.email); }
  }, [user]);

  return (
    <div style={{ minHeight: "100vh", background: "#07080A", color: "#fff", fontFamily: "Inter, sans-serif" }}>
      <Header />
      <div style={{ maxWidth: 680, margin: "0 auto", padding: "100px 20px 60px" }}>

        {/* Back */}
        <button onClick={() => navigate(-1)} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", fontSize: 13, cursor: "pointer", marginBottom: 24, display: "flex", alignItems: "center", gap: 6 }}>
          ← Back
        </button>

        {/* Title */}
        <h1 style={{ fontSize: 28, fontWeight: 800, margin: "0 0 6px", letterSpacing: "-0.02em" }}>My Feedback</h1>
        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14, margin: "0 0 32px" }}>View all feedback you've submitted to Tokun.</p>

        {/* Email form */}
        <form onSubmit={fetchMyFeedback} style={{ display: "flex", gap: 10, marginBottom: 32 }}>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Enter your email"
            style={{
              flex: 1, padding: "11px 16px", background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12, color: "#fff",
              fontSize: 14, outline: "none", fontFamily: "inherit",
            }}
          />
          <button type="submit" disabled={loading} style={{
            padding: "11px 24px", background: "linear-gradient(135deg,#7c3aed,#2563eb)",
            border: "none", borderRadius: 12, color: "#fff", fontWeight: 700, fontSize: 14,
            cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1, whiteSpace: "nowrap",
          }}>
            {loading ? "Loading…" : "View Feedback"}
          </button>
        </form>

        {error && <p style={{ color: "#f87171", fontSize: 13, marginBottom: 16 }}>⚠ {error}</p>}

        {/* Results */}
        {submitted && (
          feedbacks.length === 0 ? (
            <div style={{ textAlign: "center", padding: "48px 0", color: "rgba(255,255,255,0.3)" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>💬</div>
              <p style={{ margin: 0, fontSize: 15 }}>No feedback found for this email.</p>
            </div>
          ) : (
            <div style={{ display: "grid", gap: 16 }}>
              {feedbacks.map(fb => (
                <div key={fb._id} style={{
                  background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 18, padding: "20px 22px",
                  borderLeft: `3px solid ${sentColor[fb.sentiment] || "#a78bfa"}`,
                }}>
                  {/* Header row */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
                    <span style={{ color: "#facc15", fontSize: 18, letterSpacing: 3 }}>{stars(fb.rating)}</span>
                    <div style={{ display: "flex", gap: 8 }}>
                      <span style={{ fontSize: 11, color: sentColor[fb.sentiment], background: "rgba(255,255,255,0.06)", padding: "2px 10px", borderRadius: 20, fontWeight: 700, textTransform: "capitalize" }}>{fb.sentiment}</span>
                      <span style={{ fontSize: 11, color: statusColor[fb.status || "pending"], background: "rgba(255,255,255,0.06)", padding: "2px 10px", borderRadius: 20, fontWeight: 700, textTransform: "capitalize" }}>{fb.status || "pending"}</span>
                    </div>
                  </div>

                  <p style={{ margin: "0 0 10px", fontSize: 14, color: "rgba(255,255,255,0.8)", lineHeight: 1.65 }}>{fb.experience}</p>

                  {fb.issue && (
                    <p style={{ margin: "0 0 10px", fontSize: 13, color: "#f87171", background: "rgba(239,68,68,0.08)", padding: "6px 12px", borderRadius: 8 }}>
                      ⚠ Issue reported: {fb.issue}
                    </p>
                  )}

                  {fb.screenshots?.length > 0 && (
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
                      {/* mediaUrl(), not the raw path. These are stored as
                          "/uploads/feedback/…", which the browser resolves
                          against this app's own origin — where nothing is
                          served — so every screenshot link 404'd. */}
                      {fb.screenshots.map((s: string, i: number) => (
                        <a
                          key={i}
                          href={mediaUrl(s)}
                          target="_blank"
                          rel="noreferrer"
                          style={{ fontSize: 12, color: "#60a5fa", textDecoration: "underline" }}
                        >
                          Screenshot {i + 1}
                        </a>
                      ))}
                    </div>
                  )}

                  <p style={{ margin: 0, fontSize: 11, color: "rgba(255,255,255,0.25)" }}>
                    Submitted on {new Date(fb.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                  </p>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}
