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
import { useNavigate } from "react-router-dom";
import { useMode } from "@/contexts/ModeContext";
import { PENDING_CREATOR_KEY, type AppMode } from "@/lib/mode";

/* A bag you carry and a shop you keep — the two sides of the same transaction,
   which is exactly what the two modes are.
   Creator was Sparkles, which was wrong twice: sparkles is already the app's
   mark for SmartGen (the nav icon, the Deep toggle, the Optimise button), so
   the same glyph meant "generate with AI" in one place and "you are selling"
   in another; and it says nothing about selling to someone who hasn't been
   told. Swap `Store` for `Rocket`, `PenTool` or `BadgeDollarSign` if you'd
   rather lead on making than on shopkeeping — one word, nothing else moves. */
const OPTIONS: { id: AppMode; label: string; Icon: typeof ShoppingBag }[] = [
  { id: "buyer", label: "Buyer", Icon: ShoppingBag },
  { id: "creator", label: "Creator", Icon: Store },
];

export default function ModeToggle({ className = "" }: { className?: string }) {
  const { mode, setMode, canShowToggle, needsAccountForCreator } = useMode();
  const navigate = useNavigate();

  /* Hidden only for a team member, whose org sells for them — for them Creator
     mode is barred rather than pending, and a toggle with one usable side is a
     button that looks broken.

     A signed-out visitor DOES see it. They are not barred, they just have no
     account yet, and the two halves of the product are worth showing before
     anyone commits to one. */
  if (!canShowToggle) return null;

  const press = (next: AppMode) => {
    if (next === "creator" && needsAccountForCreator) {
      /* Remembered across the trip so the press still means something on the
         way back — see PENDING_CREATOR_KEY. Without it they sign up, land as a
         buyer, and the button they pressed to start selling did nothing. */
      try {
        sessionStorage.setItem(PENDING_CREATOR_KEY, "1");
      } catch {
        // They'll just land in Buyer mode and can press it again.
      }
      navigate("/signup");
      return;
    }
    setMode(next);
  };

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
            title={
              id === "creator"
                ? needsAccountForCreator
                  ? "Sign up to start selling"
                  : "Switch to creator mode"
                : "Switch to buyer mode"
            }
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
