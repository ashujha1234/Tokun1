// // import { useNavigate, useLocation } from "react-router-dom";

// // interface AppNavigationProps {
// //   onSectionChange?: (section: string) => void;
// //   activeSection?: string;
// // }

// // const AppNavigation = ({ activeSection }: AppNavigationProps) => {
// //   const navigate = useNavigate();
// //   const location = useLocation();

// //   const navItems = [
// //     { id: "smartgen", label: "Smartgen", ext: "svg" },
// //     { id: "prompt-optimization", label: "Prompt Optimiser", ext: "svg" },
// //     { id: "prompt-marketplace", label: "Prompt Marketplace", badge: "New", ext: "png" },
// //     { id: "prompt-library", label: "Prompt Library", ext: "png" },
// //   ];

// //   const pathToId = (pathname: string) => {
// //     if (pathname.startsWith("/prompt-marketplace")) return "prompt-marketplace";
// //     if (pathname.startsWith("/prompt-library")) return "prompt-library";
// //     if (pathname.startsWith("/prompt-optimization")) return "prompt-optimization";
// //     return "smartgen";
// //   };

// //   const currentActive = activeSection ?? pathToId(location.pathname);

// //   const handleSectionClick = (section: any) => {
// //     if (section.id === "prompt-library") navigate("/prompt-library");
// //     else if (section.id === "prompt-marketplace") navigate("/prompt-marketplace");
// //     else if (section.id === "prompt-optimization") navigate("/prompt-optimization");
// //     else navigate("/smartgen");
// //   };

// //   const gradientStyle = {
// //     background: "linear-gradient(90deg, #FF14EF 0%, #1A73E8 100%)",
// //     boxShadow: "0px 0px 20px 5px #170F1F",
// //   };

// //   return (
// //     <div className="flex justify-center px-2 sm:px-4 py-4 sm:py-6 bg-black">

// //       <nav
// //         className="
// //         flex items-center
// //         w-full
// //         max-w-[700px]
// //         h-[70px] sm:h-[86px]
// //         bg-black
// //         rounded-[200px]
// //         px-1 sm:px-2
// //         gap-1
// //       "
// //         style={{ boxShadow: "0px 0px 20px 5px #170F1F" }}
// //       >

// //         {navItems.map((section) => {
// //           const isActive = currentActive === section.id;
// //           const isSmartgen = section.id === "smartgen";

// //           return (
// //             <button
// //               key={section.id}
// //               onClick={() => handleSectionClick(section)}
// //               className={`
// //                 relative
// //                 flex-1
// //                 flex flex-col items-center justify-center
// //                 text-[10px] sm:text-sm
// //                 font-medium
// //                 transition-all
// //                 py-2
// //                 h-[60px] sm:h-[76px]
// //                 ${
// //                   isActive
// //                     ? "text-white"
// //                     : "text-gray-400 hover:text-white hover:bg-white/5"
// //                 }
// //                 ${
// //                   isActive && isSmartgen
// //                     ? "rounded-tl-[200px] rounded-bl-[200px]"
// //                     : "rounded-full"
// //                 }
// //               `}
// //               style={{
// //                 ...(isActive ? gradientStyle : {}),
// //               }}
// //             >

// //               {section.badge && (
// //                 <span
// //                   className="absolute -top-2 right-2 text-[8px] sm:text-[10px] font-semibold text-white px-1.5 py-0.5"
// //                   style={{
// //                     borderRadius: "6px",
// //                     background:
// //                       "linear-gradient(270.19deg, #1A73E8 0.16%, #FF14EF 99.84%)",
// //                     boxShadow: "0px 0px 12px 2px #170F1F",
// //                   }}
// //                 >
// //                   {section.badge}
// //                 </span>
// //               )}

// //               <img
// //                 src={`/icons/${section.id}.${section.ext}`}
// //                 alt={section.label}
// //                 className="w-4 h-4 sm:w-5 sm:h-5 mb-1"
// //               />

// //               <span className="text-center leading-tight">
// //                 {section.label}
// //               </span>

// //             </button>
// //           );
// //         })}
// //       </nav>
// //     </div>
// //   );
// // };

// // export default AppNavigation;




// import { useNavigate, useLocation } from "react-router-dom";

// interface AppNavigationProps {
//   onSectionChange?: (section: string) => void;
//   activeSection?: string;
// }

// const AppNavigation = ({ activeSection }: AppNavigationProps) => {
//   const navigate = useNavigate();
//   const location = useLocation();

//   const navItems = [
//     { id: "smartgen", label: "Smartgen", ext: "svg" },
//     { id: "prompt-optimization", label: "Prompt Optimiser", ext: "svg" },
//     { id: "prompt-marketplace", label: "Prompt Marketplace", badge: "New", ext: "png" },
//     { id: "prompt-library", label: "Prompt Library", ext: "png" },
//   ];

//   const pathToId = (pathname: string) => {
//     if (pathname.startsWith("/prompt-marketplace")) return "prompt-marketplace";
//     if (pathname.startsWith("/prompt-library")) return "prompt-library";
//     if (pathname.startsWith("/prompt-optimization")) return "prompt-optimization";
//     return "smartgen";
//   };

//   const currentActive = activeSection ?? pathToId(location.pathname);

//   const handleSectionClick = (section: any) => {
//     if (section.id === "prompt-library") navigate("/prompt-library");
//     else if (section.id === "prompt-marketplace") navigate("/prompt-marketplace");
//     else if (section.id === "prompt-optimization") navigate("/prompt-optimization");
//     else navigate("/smartgen");
//   };

//   const gradientStyle = {
//     background: "linear-gradient(90deg, #FF14EF 0%, #1A73E8 100%)",
//     boxShadow: "0px 0px 20px 5px #170F1F",
//   };

//   return (
//     <div className="flex justify-center px-2 sm:px-4">
//       <nav
//         className="
//           flex items-center
//           w-full
//           max-w-[700px]
//           h-[70px] sm:h-[86px]
//           bg-black
//           rounded-[200px]
//           px-1 sm:px-2
//           gap-1
//         "
//         style={{ boxShadow: "0px 0px 20px 5px #170F1F" }}
//       >
//         {navItems.map((section) => {
//           const isActive = currentActive === section.id;
//           const isSmartgen = section.id === "smartgen";

//           return (
//             <button
//               key={section.id}
//               onClick={() => handleSectionClick(section)}
//               className={`
//                 relative
//                 flex-1
//                 flex flex-col items-center justify-center
//                 text-[10px] sm:text-sm
//                 font-medium
//                 transition-all
//                 py-2
//                 h-[60px] sm:h-[76px]
//                 ${
//                   isActive
//                     ? "text-white"
//                     : "text-gray-400 hover:text-white hover:bg-white/5"
//                 }
//                 ${
//                   isActive && isSmartgen
//                     ? "rounded-tl-[200px] rounded-bl-[200px]"
//                     : "rounded-full"
//                 }
//               `}
//               style={isActive ? gradientStyle : {}}
//             >
//               {section.badge && (
//                 <span
//                   className="absolute -top-2 right-2 text-[8px] sm:text-[10px] font-semibold text-white px-1.5 py-0.5"
//                   style={{
//                     borderRadius: "6px",
//                     background:
//                       "linear-gradient(270.19deg, #1A73E8 0.16%, #FF14EF 99.84%)",
//                     boxShadow: "0px 0px 12px 2px #170F1F",
//                   }}
//                 >
//                   {section.badge}
//                 </span>
//               )}

//               <img
//                 src={`/icons/${section.id}.${section.ext}`}
//                 alt={section.label}
//                 className="w-4 h-4 sm:w-5 sm:h-5 mb-1"
//               />

//               <span className="text-center leading-tight">
//                 {section.label}
//               </span>
//             </button>
//           );
//         })}
//       </nav>
//     </div>
//   );
// };

// export default AppNavigation;

import { useNavigate, useLocation } from "react-router-dom";

interface AppNavigationProps {
  onSectionChange?: (section: string) => void;
  activeSection?: string;
}

const AppNavigation = ({ activeSection, onSectionChange }: AppNavigationProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { id: "smartgen", label: "Smartgen", ext: "svg" },
    { id: "prompt-optimization", label: "Product Optimiser", ext: "svg" },
    // Label only — the id, route and icon filename stay "prompt-marketplace",
    // because pathToId and the /prompt-marketplace route key off them.
    { id: "prompt-marketplace", label: "Product Verse", badge: "NEW", ext: "png" },
    { id: "find-creators", label: "Find Creators", ext: "svg" },
    // Prompt Library — hidden from nav for now, per explicit request. Not
    // deleted so it can come back easily; routing/pathToId logic below is
    // left untouched.
    // { id: "prompt-library", label: "Prompt Library", ext: "png" },
  ];

  const pathToId = (pathname: string) => {
    if (pathname.startsWith("/prompt-marketplace")) return "prompt-marketplace";
    if (pathname.startsWith("/find-creators")) return "find-creators";
    if (pathname.startsWith("/prompt-library")) return "prompt-library";
    if (pathname.startsWith("/prompt-optimization")) return "prompt-optimization";
    return "smartgen";
  };

  const currentActive = activeSection ?? pathToId(location.pathname);

  const handleSectionClick = (section: any) => {
    onSectionChange?.(section.id);
    if (section.id === "prompt-library") navigate("/prompt-library");
    else if (section.id === "prompt-marketplace") navigate("/prompt-marketplace");
    else if (section.id === "find-creators") navigate("/find-creators");
    else if (section.id === "prompt-optimization") navigate("/prompt-optimization");
    else navigate("/smartgen");
  };

  // active pill gradient (purple -> blue), image jaisa
  const activeGradientStyle = {
    background: "linear-gradient(90deg, #A855F7 0%, #4F7EF5 100%)",
    boxShadow: "0 8px 28px rgba(124, 58, 237, 0.45)",
  };

  return (
    <div className="flex justify-center px-2 sm:px-4">
      <nav
        className="
          flex items-center
          w-full max-w-[760px]
          gap-1 sm:gap-2
          p-2 sm:p-2.5
          rounded-[40px]
          border border-white/10
          bg-[#0c0a14]/70
          backdrop-blur-xl
        "
        style={{ boxShadow: "0 12px 40px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.04)" }}
      >
        {navItems.map((section) => {
          const isActive = currentActive === section.id;

          return (
            <button
              key={section.id}
              onClick={() => handleSectionClick(section)}
              aria-current={isActive ? "page" : undefined}
              className={`
                relative
                flex-1 min-w-0
                flex flex-col items-center justify-center
                gap-1 sm:gap-1.5
                h-[56px] min-[420px]:h-[64px] sm:h-[72px]
                px-1 sm:px-3
                rounded-2xl
                text-[9px] min-[420px]:text-[11px] sm:text-sm font-medium
                transition-all duration-200
                ${
                  isActive
                    ? "text-white"
                    : "text-white/45 hover:text-white/80 hover:bg-white/5"
                }
              `}
              style={isActive ? activeGradientStyle : {}}
            >
              {section.badge && (
                <span
                  className="absolute -top-1.5 right-1.5 sm:right-4 text-[7px] min-[420px]:text-[8px] sm:text-[9px] font-bold tracking-wide text-white px-1.5 sm:px-2 py-0.5 rounded-full"
                  style={{
                    background: "linear-gradient(90deg, #C026D3 0%, #7C3AED 100%)",
                    boxShadow: "0 2px 10px rgba(192, 38, 211, 0.55)",
                  }}
                >
                  {section.badge}
                </span>
              )}

              <img
                src={`/icons/${section.id}.${section.ext}`}
                alt={section.label}
                className="w-3.5 h-3.5 min-[420px]:w-4 min-[420px]:h-4 sm:w-5 sm:h-5 shrink-0"
              />

              <span className="text-center leading-tight w-full min-w-0 px-0.5">
                {section.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default AppNavigation;