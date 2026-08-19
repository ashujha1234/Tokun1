// // src/components/Footer.tsx
// import { useMemo, useState } from "react";
// import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react";
// import { Button } from "@/components/ui/button";

// const ICONS = [
//   { Icon: Facebook, href: "#" },
//   { Icon: Twitter, href: "#" },
//   { Icon: Instagram, href: "#" },
//   { Icon: Linkedin, href: "#" },
// ];

// export default function Footer() {
//   const [active, setActive] = useState(0);

//   const ICON_SIZE = 44;
//   const GAP = 16;
//   const puckX = useMemo(() => active * (ICON_SIZE + GAP), [active]);

//   return (
//     <footer className="relative z-10 bg-black text-white">
//       <div className="container mx-auto px-6 py-16">
//         {/* Top brand row + nav */}
//         <div className="flex flex-col items-center">
//           {/* Brand: iconf + TOKUN.WORLD */}
//           <div className="flex items-center gap-3">
          
//             <span
//               style={{
//                 fontFamily: "Inter, sans-serif",
//                 fontWeight: 700,
//                 fontStyle: "normal",
//                 fontSize: "32px",
//                 lineHeight: "100%",
//                 letterSpacing: "0%",
//                 textTransform: "uppercase",
//                 color: "#FFFFFF",
//               }}
//             >
//               TOKUN.WORLD
//             </span>
//           </div>

//           <nav className="mt-8">
//             <ul className="flex flex-wrap items-center gap-8 text-white/80">
//               {["About us", "Pricing", "Blog", "Careers", "Support"].map((item) => (
//                 <li key={item}>
//                   <a href="#" className="hover:text-white transition-colors">
//                     {item}
//                   </a>
//                 </li>
//               ))}
//             </ul>
//           </nav>

//           {/* Social row with moving gradient puck */}
//           <div
//             className="relative mt-8"
//             style={{
//               width: ICONS.length * ICON_SIZE + (ICONS.length - 1) * GAP,
//               height: ICON_SIZE,
//             }}
//           >
//             <span
//               aria-hidden
//               className="absolute top-0 left-0 rounded-full"
//               style={{
//                 width: ICON_SIZE,
//                 height: ICON_SIZE,
//                 transform: `translateX(${puckX}px)`,
//                 transition: "transform 300ms cubic-bezier(.2,.8,.2,1)",
//                 background: "linear-gradient(270.19deg,#1A73E8 0.16%,#FF14EF 99.84%)",
//                 boxShadow: "0 8px 24px rgba(255,20,239,0.35)",
//               }}
//             />
//             <div className="absolute inset-0 flex items-center gap-4">
//               {ICONS.map(({ Icon, href }, i) => (
//                 <a
//                   key={i}
//                   href={href}
//                   onClick={(e) => {
//                     e.preventDefault();
//                     setActive(i);
//                   }}
//                   className={[
//                     "relative grid place-items-center w-11 h-11 rounded-full",
//                     "bg-white/10 border border-white/15 backdrop-blur",
//                     "hover:bg-white/15 transition-colors",
//                     "focus:outline-none focus:ring-2 focus:ring-white/40",
//                     "z-[1]",
//                   ].join(" ")}
//                   title="Follow us"
//                 >
//                   <Icon className="w-5 h-5" />
//                 </a>
//               ))}
//             </div>
//           </div>

//           {/* Email subscribe */}
//           <div className="mt-8 flex items-center gap-3">
//             <input
//               type="email"
//               placeholder="Enter your email"
//               className="w-72 h-11 px-4 rounded-full bg-transparent border border-white/25 text-white placeholder:text-white/50 outline-none focus:border-white/50"
//             />
//             <Button className="h-11 px-6 rounded-full bg-white text-black hover:bg-white/90">
//               Subscribe
//             </Button>
//           </div>
//         </div>

//         {/* Bottom strip */}
//         <div className="mt-6">
//           <p
//             className="text-center"
//             style={{
//               fontFamily: "Inter, sans-serif",
//               fontWeight: 400,
//               fontStyle: "normal",
//               fontSize: "12px",
//               lineHeight: "100%",
//               letterSpacing: "0%",
//             }}
//           >
//             © 2025 TOKUN. All rights reserved.
//           </p>
//         </div>
//       </div>
//     </footer>
//   );
// }

// // src/components/Footer.tsx
// import { useMemo, useState } from "react";
// import { Facebook, Instagram, Linkedin } from "lucide-react";
// import { FaXTwitter } from "react-icons/fa6";
// import { Button } from "@/components/ui/button";
// import { Link } from "react-router-dom";
// const ICONS = [
//   { Icon: Facebook, href: "#" },
//   { Icon: FaXTwitter, href: "#" },
//   { Icon: Instagram, href: "#" },
//   { Icon: Linkedin, href: "#" },
// ];

// export default function Footer() {
//   const [active, setActive] = useState<number | null>(null);

//   const ICON_SIZE = 44;
//   const GAP = 16;
//   const puckX = useMemo(
//     () => (active !== null ? active * (ICON_SIZE + GAP) : 0),
//     [active]
//   );

//   return (
//     <footer className="relative z-10 bg-black text-white">
//       <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-16">
//         {/* Top Section */}
//         <div className="flex flex-col items-center text-center">
//           {/* Logo */}
//           <div className="flex items-center gap-3">
//             <span
//               style={{
//                 fontFamily: "Inter, sans-serif",
//                 fontWeight: 700,
//                 fontSize: "28px",
//                 lineHeight: "100%",
//                 textTransform: "uppercase",
//                 color: "#FFFFFF",
//               }}
//               className="sm:text-[32px]"
//             >
//               TOKUN.WORLD
//             </span>
//           </div>

//           {/* Navigation */}
//         <nav className="mt-6 sm:mt-8">
//   <ul className="flex flex-wrap justify-center gap-x-6 gap-y-3 text-white/80 text-sm sm:text-base">
//     {[
//       { label: "About us", href: "/about" },
//       { label: "Pricing", href: "/pricing" },
//       { label: "Blog", href: "/blog" },
//       { label: "Careers", href: "/careers" },
//       { label: "Support", href: "/support" },
//     ].map((item) => (
//       <li key={item.label}>
//         <Link to={item.href} className="hover:text-white transition-colors">
//           {item.label}
//         </Link>
//       </li>
//     ))}
//   </ul>
// </nav>

//           {/* Social Icons */}
//           <div
//             className="relative mt-8"
//             style={{
//               width: ICONS.length * ICON_SIZE + (ICONS.length - 1) * GAP,
//               height: ICON_SIZE,
//             }}
//           >
//             {active !== null && (
//               <span
//                 aria-hidden
//                 className="absolute top-0 left-0 rounded-full"
//                 style={{
//                   width: ICON_SIZE,
//                   height: ICON_SIZE,
//                   transform: `translateX(${puckX}px)`,
//                   transition: "transform 300ms cubic-bezier(.2,.8,.2,1)",
//                   background: "linear-gradient(270.19deg,#1A73E8 0.16%,#FF14EF 99.84%)",
//                   boxShadow: "0 8px 24px rgba(255,20,239,0.35)",
//                 }}
//               />
//             )}

//             <div className="absolute inset-0 flex items-center gap-4">
//               {ICONS.map(({ Icon, href }, i) => (
//                 <a
//                   key={i}
//                   href={href}
//                   onClick={(e) => {
//                     e.preventDefault();
//                     setActive(i);
//                   }}
//                   className="relative grid place-items-center w-11 h-11 rounded-full bg-white/10 border border-white/15 backdrop-blur hover:bg-white/15 transition-colors focus:outline-none focus:ring-2 focus:ring-white/40 z-[1]"
//                   title="Follow us"
//                 >
//                   <Icon className="w-5 h-5" />
//                 </a>
//               ))}
//             </div>
//           </div>

//           {/* Subscribe Section */}
//           <div className="mt-8 flex flex-col sm:flex-row items-center gap-3 w-full max-w-md">
//             <input
//               type="email"
//               placeholder="Enter your email"
//               className="w-full sm:flex-1 h-11 px-4 rounded-full bg-transparent border border-white/25 text-white placeholder:text-white/50 outline-none focus:border-white/50"
//             />

//             <Button className="w-full sm:w-auto h-11 px-6 rounded-full bg-white text-black hover:bg-white/90">
//               Subscribe
//             </Button>
//           </div>
//         </div>

//         {/* Bottom */}
//         <div className="mt-8 sm:mt-10">
//           <p
//             className="text-center text-white/70"
//             style={{
//               fontFamily: "Inter, sans-serif",
//               fontWeight: 400,
//               fontSize: "12px",
//               lineHeight: "100%",
//             }}
//           >
//             © 2025 TOKUN. All rights reserved.
//           </p>
//         </div>
//       </div>
//     </footer>
//   );
// }


// src/components/Footer.tsx
//
// The single footer for the whole app. Landing.tsx used to carry its own private
// copy of this markup, which is why links added here never appeared on the
// landing page — it now renders this component instead.
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Facebook, Instagram, Linkedin } from "lucide-react";
import { FaXTwitter } from "react-icons/fa6";
import { Button } from "@/components/ui/button";

const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, "");

// Fill in the real profile URLs and the icons appear. Left empty on purpose:
// these were all `href: "#"`, which renders four buttons that look clickable and
// do nothing (and jump the page to the top). Unset entries are filtered out
// below rather than shipped as dead controls.
const SOCIAL_LINKS: { Icon: any; label: string; href: string }[] = [
  { Icon: Facebook, label: "Tokun on Facebook", href: "" },
  { Icon: FaXTwitter, label: "Tokun on X", href: "" },
  { Icon: Instagram, label: "Tokun on Instagram", href: "" },
  { Icon: Linkedin, label: "Tokun on LinkedIn", href: "" },
];

// Grouped instead of one flat row. With the policy pages added, a single line
// was nine wrapping links with no hierarchy — product, company and legal all
// reading as equally important.
const LINK_GROUPS: { heading: string; links: { label: string; href: string }[] }[] = [
  {
    heading: "Product",
    links: [
      { label: "Product Verse", href: "/prompt-marketplace" },
      // "Product Library" was here and has been removed on request.
      { label: "SmartGen", href: "/smartgen" },
      // "Optimiser", not "Optimizer" — every other place the product is named
      // for a reader spells it with an s (the app nav, History, Saved
      // collections, the landing page's tabs). The footer was the one z.
      { label: "Prompt Optimiser", href: "/prompt-optimization" },
      { label: "Hire Creators", href: "/find-creators" },
      { label: "Pricing", href: "/subscription" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About us", href: "/about" },
      { label: "Blog", href: "/blog" },
      { label: "Careers", href: "/careers" },
      { label: "Support", href: "/support" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { label: "Privacy Policy", href: "/privacy-policy" },
      { label: "Terms & Conditions", href: "/terms" },
      { label: "Refund Policy", href: "/refund-policy" },
      { label: "Report Policy", href: "/report-policy" },
    ],
  },
];

export default function Footer() {
  // Index of the social icon under the cursor — drives the sliding gradient
  // "puck" behind the row. Only the configured links take part.
  const [active, setActive] = useState<number | null>(null);

  const [email, setEmail] = useState("");
  const [subState, setSubState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [subMsg, setSubMsg] = useState("");

  const socials = useMemo(() => SOCIAL_LINKS.filter((s) => s.href.trim().length > 0), []);

  const ICON_SIZE = 44;
  const GAP = 16;
  const puckX = useMemo(
    () => (active !== null ? active * (ICON_SIZE + GAP) : 0),
    [active]
  );

  // Real submit. This was a styled input next to a styled button with no state
  // and no handler at all — the email went nowhere and the user got no feedback
  // either way. A <form> also makes Enter work, which a bare button never did.
  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = email.trim();
    if (!value) return;

    setSubState("sending");
    setSubMsg("");
    try {
      const res = await fetch(`${API_BASE}/api/newsletter/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: value, source: "footer" }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data?.success) {
        setSubState("error");
        setSubMsg(data?.message || "Couldn't subscribe you. Please try again.");
        return;
      }

      setSubState("done");
      setSubMsg(data.message || "You're subscribed.");
      setEmail("");
    } catch {
      setSubState("error");
      setSubMsg("Network error — please try again.");
    }
  };

  const linkClass =
    "group relative inline-block text-sm text-white/65 hover:text-white transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF14EF]/60 rounded";

  return (
    <footer className="relative z-10 bg-black text-white border-t border-white/10">
      {/* Same brand wash the policy pages use, so the footer reads as part of
          the page rather than a black slab bolted on. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_100%_at_50%_0%,rgba(26,115,232,0.10),rgba(0,0,0,0))]"
      />

      <div className="relative container mx-auto px-4 sm:px-6 py-12 sm:py-14">
        {/* Top: brand + newsletter on the left, link columns on the right */}
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1.6fr)] gap-10 lg:gap-16">
          <div className="max-w-sm">
            <Link
              to="/"
              className="inline-block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF14EF]/60 rounded"
            >
              {/* Was the wordmark set in Inter. The real logo carries the mark
                  the header uses, so the two ends of the page match. The alt
                  text keeps the name for anyone not seeing the image. */}
              <img
                src="/icons/Tokun.png"
                alt="Tokun.world"
                className="h-16 sm:h-20 w-auto max-w-none object-contain"
              />
            </Link>

            <p className="mt-4 text-sm leading-relaxed text-white/55">
              Buy, sell and sharpen AI products. Generate with SmartGen, refine with
              the Optimiser, and hire creators when you need a human in the loop.
            </p>

            {/* Newsletter */}
            <form onSubmit={handleSubscribe} className="mt-7" noValidate>
              <label
                htmlFor="footer-newsletter-email"
                className="block text-[11px] uppercase tracking-wide text-white/45 mb-2"
              >
                Get product updates
              </label>
              <div className="flex flex-col sm:flex-row gap-2.5">
                <input
                  id="footer-newsletter-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (subState !== "idle") setSubState("idle");
                  }}
                  placeholder="you@example.com"
                  aria-invalid={subState === "error"}
                  aria-describedby={subMsg ? "footer-newsletter-msg" : undefined}
                  className="w-full sm:flex-1 h-11 px-4 rounded-full bg-white/[0.04] border border-white/15 text-sm text-white placeholder:text-white/35 outline-none transition-colors focus:border-[#FF14EF]/60 focus:bg-white/[0.06]"
                />
                <Button
                  type="submit"
                  disabled={subState === "sending" || !email.trim()}
                  className="w-full sm:w-auto h-11 px-6 rounded-full bg-white text-black font-medium hover:bg-white/90 disabled:opacity-45 disabled:cursor-not-allowed"
                >
                  {subState === "sending" ? "Subscribing…" : "Subscribe"}
                </Button>
              </div>

              {subMsg && (
                <p
                  id="footer-newsletter-msg"
                  role="status"
                  className={`mt-2.5 text-xs ${
                    subState === "error" ? "text-red-400" : "text-emerald-400"
                  }`}
                >
                  {subMsg}
                </p>
              )}
            </form>
          </div>

          {/* Link columns */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 sm:gap-6">
            {LINK_GROUPS.map((group) => (
              <nav key={group.heading} aria-labelledby={`footer-${group.heading}`}>
                <h3
                  id={`footer-${group.heading}`}
                  className="text-[11px] uppercase tracking-wide text-white/45 mb-4"
                >
                  {group.heading}
                </h3>
                <ul className="space-y-3">
                  {group.links.map((item) => (
                    <li key={item.label}>
                      <Link to={item.href} className={linkClass}>
                        {item.label}
                        <span
                          aria-hidden
                          className="absolute left-0 -bottom-0.5 h-[1.5px] w-0 rounded-full transition-all duration-300 group-hover:w-full"
                          style={{
                            background: "linear-gradient(90deg, #FF14EF 0%, #1A73E8 100%)",
                          }}
                        />
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-5">
          <p className="text-xs text-white/45 order-2 sm:order-1">
            © {new Date().getFullYear()} Tokun. All rights reserved.
          </p>

          {/* Rendered only when at least one real URL is configured, so the
              footer never shows a row of buttons that go nowhere. */}
          {socials.length > 0 && (
            <div
              className="relative order-1 sm:order-2"
              style={{
                width: socials.length * ICON_SIZE + (socials.length - 1) * GAP,
                height: ICON_SIZE,
              }}
              onMouseLeave={() => setActive(null)}
            >
              {active !== null && (
                <span
                  aria-hidden
                  className="absolute top-0 left-0 rounded-full"
                  style={{
                    width: ICON_SIZE,
                    height: ICON_SIZE,
                    transform: `translateX(${puckX}px)`,
                    transition: "transform 300ms cubic-bezier(.2,.8,.2,1)",
                    background: "linear-gradient(270.19deg,#1A73E8 0.16%,#FF14EF 99.84%)",
                    boxShadow: "0 8px 24px rgba(255,20,239,0.35)",
                  }}
                />
              )}

              <div className="absolute inset-0 flex items-center gap-4">
                {socials.map(({ Icon, href, label }, i) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    onMouseEnter={() => setActive(i)}
                    onFocus={() => setActive(i)}
                    onBlur={() => setActive(null)}
                    className="group relative grid place-items-center w-11 h-11 rounded-full bg-white/[0.06] border border-white/15 backdrop-blur transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 z-[1] hover:scale-110 hover:border-white/30"
                  >
                    <Icon className="relative z-[1] w-[18px] h-[18px] transition-transform duration-300 group-hover:scale-110" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}

// /* ============================================================
//    NEW FOOTER (v2) — richer multi-column layout.
//    Previous versions kept fully commented above for rollback.
//    ============================================================ */
// import { useMemo, useState } from "react";
// import { Link } from "react-router-dom";
// import { Facebook, Instagram, Linkedin } from "lucide-react";
// import { FaXTwitter } from "react-icons/fa6";
// import { Button } from "@/components/ui/button";
// import "./Footer.css";
// 
// const SOCIAL_ICONS = [
//   { Icon: Facebook, href: "#" },
//   { Icon: FaXTwitter, href: "#" },
//   { Icon: Instagram, href: "#" },
//   { Icon: Linkedin, href: "#" },
// ];
// 
// const FOOTER_COLUMNS = [
//   {
//     title: "Marketplace",
//     links: [
//       { label: "Popular Prompts", href: "/prompt-marketplace" },
//       { label: "Staff Picks", href: "/prompt-marketplace" },
//       { label: "Brand Identity", href: "/prompt-marketplace" },
//       { label: "Prompt Library", href: "/prompt-library" },
//     ],
//   },
//   {
//     title: "Company",
//     links: [
//       { label: "About us", href: "/about" },
//       { label: "Pricing", href: "/subscription" },
//       { label: "Blog", href: "/blog" },
//       { label: "Careers", href: "/careers" },
//       { label: "Support", href: "/support" },
//     ],
//   },
//   {
//     title: "Legal",
//     links: [
//       { label: "Privacy Policy", href: "#" },
//       { label: "Terms of Service", href: "#" },
//       { label: "Legal Notices", href: "#" },
//     ],
//   },
// ];
// 
// function FooterLink({ label, href }: { label: string; href: string }) {
//   const isInternal = href.startsWith("/");
//   const className = "footer2__link";
//   return isInternal ? (
//     <Link to={href} className={className}>{label}</Link>
//   ) : (
//     <a href={href} className={className}>{label}</a>
//   );
// }
// 
// export default function Footer() {
//   const [active, setActive] = useState<number | null>(null);
// 
//   const ICON_SIZE = 40;
//   const GAP = 12;
//   const puckX = useMemo(
//     () => (active !== null ? active * (ICON_SIZE + GAP) : 0),
//     [active]
//   );
// 
//   return (
//     <footer className="footer2 relative z-10 bg-black text-white">
//       <div className="footer2__top">
//         {/* Brand column */}
//         <div className="footer2__brand">
//           <Link to="/" className="footer2__logo">TOKUN<span>.WORLD</span></Link>
//           <p className="footer2__tagline">
//             The premier marketplace for high-performance AI prompts and specialized intelligence tools.
//           </p>
// 
//           <div
//             className="footer2__socials"
//             style={{ width: SOCIAL_ICONS.length * ICON_SIZE + (SOCIAL_ICONS.length - 1) * GAP, height: ICON_SIZE }}
//             onMouseLeave={() => setActive(null)}
//           >
//             {active !== null && (
//               <span
//                 aria-hidden
//                 className="footer2__social-puck"
//                 style={{
//                   width: ICON_SIZE,
//                   height: ICON_SIZE,
//                   transform: `translateX(${puckX}px)`,
//                 }}
//               />
//             )}
//             <div className="footer2__social-row">
//               {SOCIAL_ICONS.map(({ Icon, href }, i) => (
//                 <a
//                   key={i}
//                   href={href}
//                   onMouseEnter={() => setActive(i)}
//                   onFocus={() => setActive(i)}
//                   onBlur={() => setActive(null)}
//                   className="footer2__social-icon"
//                   title="Follow us"
//                   style={{ width: ICON_SIZE, height: ICON_SIZE }}
//                 >
//                   <Icon className="w-4 h-4" />
//                 </a>
//               ))}
//             </div>
//           </div>
//         </div>
// 
//         {/* Link columns */}
//         {FOOTER_COLUMNS.map((col) => (
//           <div key={col.title} className="footer2__col">
//             <h4 className="footer2__col-title">{col.title}</h4>
//             <ul className="footer2__col-list">
//               {col.links.map((link) => (
//                 <li key={link.label}>
//                   <FooterLink label={link.label} href={link.href} />
//                 </li>
//               ))}
//             </ul>
//           </div>
//         ))}
//       </div>
// 
//       {/* Newsletter */}
//       <div className="footer2__newsletter">
//         <span className="footer2__newsletter-label">Get product updates</span>
//         <div className="footer2__newsletter-form">
//           <input
//             type="email"
//             placeholder="Enter your email"
//             className="footer2__newsletter-input"
//           />
//           <Button className="footer2__newsletter-btn h-10 px-6 rounded-full bg-white text-black hover:bg-white/90">
//             Subscribe
//           </Button>
//         </div>
//       </div>
// 
//       {/* Bottom strip */}
//       <div className="footer2__bottom">
//         <p className="footer2__copyright">© 2025 TOKUN. All rights reserved.</p>
//         <p className="footer2__motto">MADE FOR THE FUTURE</p>
//       </div>
//     </footer>
//   );
// }
