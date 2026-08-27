/**
 * Buyer / Creator, as a segmented pill.
 *
 * In the header rather than only in the account menu, because the mode changes
 * what the header itself contains — someone who can't see which mode they are
 * in has no way to explain why Upload Product "disappeared". The pill answers
 * that without being opened.
 *
 * The label collapses below `sm`, where the action row has no room for it; the
 * account menu carries a labelled row for that case (see Header.tsx).
 */

import { ShoppingBag, Store } from "lucide-react";
import { useMode } from "@/contexts/ModeContext";
import { type AppMode } from "@/lib/mode";

/* A bag you carry and a shop you keep — the two sides of the same transaction,
   which is exactly what the two modes are.
   Creator was Sparkles, which was wrong twice: sparkles is already the app's
   mark for SmartGen (the nav icon, the Deep toggle, the Optimise button), so
   the same glyph meant "generate with AI" in one place and "you are selling"
   in another; and it says nothing about selling to someone who hasn't been
   told. Swap `Store` for `Rocket`, `PenTool` or `BadgeDollarSign` if you'd
   rather lead on making than on shopkeeping — one word, nothing else moves. */
/* CREATOR FIRST.
 *
 * Buyer led, which read as the primary of the two — and for a signed-out visitor
 * it now isn't: they start on the Creator side (SIGNED_OUT_DEFAULT_MODE), so the
 * highlighted half was the second one and the pill looked like it had been
 * switched away from its default. Selling is also the half nobody discovers on
 * their own, which is the reason the toggle is on the landing bar at all. */
const OPTIONS: { id: AppMode; label: string; Icon: typeof ShoppingBag }[] = [
  { id: "creator", label: "Creator", Icon: Store },
  { id: "buyer", label: "Buyer", Icon: ShoppingBag },
];

export default function ModeToggle({ className = "" }: { className?: string }) {
  /* `needsAccountForCreator` is no longer read here — it used to turn this pill
     into a signup link. The context still exposes it for anything that wants to
     say "you'll need an account to list"; this control just switches a view. */
  const { mode, setMode, canShowToggle } = useMode();

  /* Hidden only for a team member, whose org sells for them — for them Creator
     mode is barred rather than pending, and a toggle with one usable side is a
     button that looks broken.

     A signed-out visitor DOES see it. They are not barred, they just have no
     account yet, and the two halves of the product are worth showing before
     anyone commits to one. */
  if (!canShowToggle) return null;

  /* Just switches. Both halves, session or no session.
   *
   * Pressing Creator while signed out used to navigate straight to /signup. That
   * cannot stand now that a visitor STARTS on the creator side: the first press
   * of Buyer followed by Creator would have thrown them out of the landing page
   * into a signup form they had not asked for.
   *
   * The signup nudge belongs on the creator ACTION, not on the view — and it is
   * already there: Upload Product runs the same four-way gate as everywhere else
   * and sends a session-less visitor to login (see UploadProductButton). Mode
   * stays what lib/mode.ts says it is, a view preference and never a permission.
   *
   * Carrying the choice across signup is handled in ModeContext, which writes
   * PENDING_CREATOR_KEY for as long as a session-less visitor is on this side. */
  const press = (next: AppMode) => setMode(next);

  return (
    <div
      role="group"
      aria-label="Buyer or creator mode"
      className={`inline-flex items-center gap-0.5 rounded-full border border-white/10 bg-white/[0.06] p-0.5 ${className}`}
    >
      {OPTIONS.map(({ id, label, Icon }) => {
        const active = mode === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => press(id)}
            aria-pressed={active}
            /* Same capitalisation as the pill's own labels and as the account
               menu's row — the mode names are proper nouns here, and the tooltip
               on a button reading "Buyer" should not say "buyer".
               No "Sign up to start selling" branch any more: this button switches
               a view now, for everybody, and promising signup from a control that
               does not go there was the confusing half of the old behaviour. */
            title={id === "creator" ? "Switch to Creator mode" : "Switch to Buyer mode"}
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 sm:px-3 h-7 text-xs font-medium whitespace-nowrap transition-colors ${
              active ? "text-white" : "text-white/45 hover:text-white/75"
            }`}
            /* The active half is the only thing carrying the brand gradient, so
               "which mode am I in" is answerable from across the room. */
            style={
              active
                ? { background: "linear-gradient(270deg,#1A73E8 0%,#FF14EF 100%)" }
                : undefined
            }
          >
            <Icon className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden lg:inline">{label}</span>
          </button>
        );
      })}
    </div>
  );
}
