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
//           {/* Brand: iconf + TOKUN.AI */}
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
//               TOKUN.AI
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




// src/components/Footer.tsx
import { useMemo, useState } from "react";
import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react";
import { Button } from "@/components/ui/button";

const ICONS = [
  { Icon: Facebook, href: "#" },
  { Icon: Twitter, href: "#" },
  { Icon: Instagram, href: "#" },
  { Icon: Linkedin, href: "#" },
];

export default function Footer() {
  const [active, setActive] = useState(0);

  const ICON_SIZE = 44;
  const GAP = 16;
  const puckX = useMemo(() => active * (ICON_SIZE + GAP), [active]);

  return (
    <footer className="relative z-10 bg-black text-white">
      <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-16">
        
        {/* Top Section */}
        <div className="flex flex-col items-center text-center">

          {/* Logo */}
          <div className="flex items-center gap-3">
            <span
              style={{
                fontFamily: "Inter, sans-serif",
                fontWeight: 700,
                fontSize: "28px",
                lineHeight: "100%",
                textTransform: "uppercase",
                color: "#FFFFFF",
              }}
              className="sm:text-[32px]"
            >
              TOKUN.AI
            </span>
          </div>

          {/* Navigation */}
          <nav className="mt-6 sm:mt-8">
            <ul className="flex flex-wrap justify-center gap-x-6 gap-y-3 text-white/80 text-sm sm:text-base">
              {["About us", "Pricing", "Blog", "Careers", "Support"].map((item) => (
                <li key={item}>
                  <a href="#" className="hover:text-white transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Social Icons */}
          <div
            className="relative mt-8"
            style={{
              width: ICONS.length * ICON_SIZE + (ICONS.length - 1) * GAP,
              height: ICON_SIZE,
            }}
          >
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

            <div className="absolute inset-0 flex items-center gap-4">
              {ICONS.map(({ Icon, href }, i) => (
                <a
                  key={i}
                  href={href}
                  onClick={(e) => {
                    e.preventDefault();
                    setActive(i);
                  }}
                  className="relative grid place-items-center w-11 h-11 rounded-full bg-white/10 border border-white/15 backdrop-blur hover:bg-white/15 transition-colors focus:outline-none focus:ring-2 focus:ring-white/40 z-[1]"
                  title="Follow us"
                >
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Subscribe Section */}
          <div className="mt-8 flex flex-col sm:flex-row items-center gap-3 w-full max-w-md">
            <input
              type="email"
              placeholder="Enter your email"
              className="w-full sm:flex-1 h-11 px-4 rounded-full bg-transparent border border-white/25 text-white placeholder:text-white/50 outline-none focus:border-white/50"
            />

            <Button className="w-full sm:w-auto h-11 px-6 rounded-full bg-white text-black hover:bg-white/90">
              Subscribe
            </Button>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-8 sm:mt-10">
          <p
            className="text-center text-white/70"
            style={{
              fontFamily: "Inter, sans-serif",
              fontWeight: 400,
              fontSize: "12px",
              lineHeight: "100%",
            }}
          >
            © 2025 TOKUN. All rights reserved.
          </p>
        </div>

      </div>
    </footer>
  );
}