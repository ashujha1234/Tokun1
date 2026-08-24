/**
 * The glass surfaces, stated once.
 *
 * Three ingredients make these read as glass rather than as a grey box: a
 * translucent fill (so the ambient glow behind it shows through), a real
 * backdrop blur, and a top-edge highlight — the inset white shadow — which is
 * what suggests a lit edge. Without that last one it just looks foggy.
 *
 * Lifted out of FindCreatorsPage when the creator card moved into its own
 * component: the card and the page it came from have to agree on what a panel
 * looks like, and two copies of a 4-line class string is how they would stop
 * agreeing the first time either was touched.
 */

export const GLASS_CARD =
  "rounded-2xl border border-white/[0.08] bg-white/[0.035] backdrop-blur-xl " +
  "shadow-[0_8px_32px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.06)] " +
  "transition-all duration-300 hover:-translate-y-1 hover:border-white/20 " +
  "hover:bg-white/[0.06] hover:shadow-[0_16px_48px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.10)]";

export const GLASS_PANEL =
  "rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl " +
  "shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]";
