/**
 * The page an organisation invitation email's "Accept Invite" button lands on.
 *
 * ── What it replaces ────────────────────────────────────────────────────────
 *
 * The button used to point at `/login?invite=<id>`, and nothing anywhere read
 * that parameter — not one line in the frontend. So the recipient signed in,
 * landed on a normal page, and the invitation sat PENDING forever. The only way
 * to actually accept one was to find it in the in-app Notifications list.
 *
 * The id in the link was wrong as well. It was `member._id`, which is the
 * OrgInvitation id only when the invitee has no Tokun account yet — for an
 * existing user it was their USER id, and the accept endpoint takes an
 * invitation id. Half the invitations could not have been accepted by id even
 * if something had been reading it.
 *
 * ── Why it sits behind RequireAuth ──────────────────────────────────────────
 *
 * Accepting is authenticated: the server checks the invitation belongs to the
 * caller. A signed-out visitor is bounced to /login?next=/accept-invite?... and
 * comes back here once verified, which is the chain lib/nextPath.ts exists for.
 * So this component can assume it has a session.
 */

import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/components/ui/use-toast";

const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, "");

export default function AcceptInvite() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { token } = useAuth() as { token?: string | null };

  const invitationId = params.get("invitation") || "";
  const [state, setState] = useState<"working" | "done" | "failed">("working");
  const [detail, setDetail] = useState("");

  /* One attempt per mount. Accepting is not idempotent — the endpoint answers
     400 once the invitation leaves PENDING — so a second call would report a
     failure for something that had just succeeded. */
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    if (!invitationId) {
      setState("failed");
      setDetail("This link is missing its invitation reference.");
      return;
    }

    (async () => {
      try {
        const res = await fetch(
          `${API_BASE}/api/org/members/invitations/${encodeURIComponent(invitationId)}/accept`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            credentials: "include",
          }
        );
        const data = await res.json().catch(() => ({}));

        if (res.ok && data?.success) {
          setState("done");
          toast({ title: "You're in", description: "The organisation has been added to your account." });
          setTimeout(() => navigate("/self-dash", { replace: true }), 1200);
          return;
        }

        setState("failed");
        /* The server's own reason, because each one needs a different move from
           the reader: a revoked invitation needs a new one, an already-accepted
           one means they are in, and "not_your_invitation" usually means they
           signed in with a different address than the one invited. */
        setDetail(
          data?.message ||
            {
              invitation_not_found: "This invitation no longer exists — ask for a new one.",
              not_your_invitation:
                "This invitation was sent to a different email address. Sign in with the address it was sent to.",
            }[data?.error as string] ||
            data?.error ||
            "This invitation could not be accepted."
        );
      } catch {
        setState("failed");
        setDetail("We couldn't reach Tokun. Check your connection and try the link again.");
      }
    })();
  }, [invitationId, token, navigate]);

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {state === "working" && (
          <>
            <h1 className="text-xl font-semibold">Accepting your invitation…</h1>
            <p className="mt-2 text-sm text-white/55">One moment.</p>
          </>
        )}

        {state === "done" && (
          <>
            <h1 className="text-xl font-semibold">You've joined the organisation</h1>
            <p className="mt-2 text-sm text-white/55">Taking you to your dashboard…</p>
          </>
        )}

        {state === "failed" && (
          <>
            <h1 className="text-xl font-semibold">We couldn't accept this invitation</h1>
            <p className="mt-2 text-sm text-white/55">{detail}</p>
            <button
              type="button"
              onClick={() => navigate("/notifications")}
              className="mt-6 h-11 px-5 rounded-xl border border-white/15 bg-white/[0.06] hover:bg-white/[0.1] text-sm"
            >
              Open my notifications
            </button>
          </>
        )}
      </div>
    </div>
  );
}
