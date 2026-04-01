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
//     <div className="flex justify-center px-2 sm:px-4 py-4 sm:py-6 bg-black">

//       <nav
//         className="
//         flex items-center
//         w-full
//         max-w-[700px]
//         h-[70px] sm:h-[86px]
//         bg-black
//         rounded-[200px]
//         px-1 sm:px-2
//         gap-1
//       "
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
//               style={{
//                 ...(isActive ? gradientStyle : {}),
//               }}
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

const AppNavigation = ({ activeSection }: AppNavigationProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { id: "smartgen", label: "Smartgen", ext: "svg" },
    { id: "prompt-optimization", label: "Prompt Optimiser", ext: "svg" },
    { id: "prompt-marketplace", label: "Prompt Marketplace", badge: "New", ext: "png" },
    { id: "prompt-library", label: "Prompt Library", ext: "png" },
  ];

  const pathToId = (pathname: string) => {
    if (pathname.startsWith("/prompt-marketplace")) return "prompt-marketplace";
    if (pathname.startsWith("/prompt-library")) return "prompt-library";
    if (pathname.startsWith("/prompt-optimization")) return "prompt-optimization";
    return "smartgen";
  };

  const currentActive = activeSection ?? pathToId(location.pathname);

  const handleSectionClick = (section: any) => {
    if (section.id === "prompt-library") navigate("/prompt-library");
    else if (section.id === "prompt-marketplace") navigate("/prompt-marketplace");
    else if (section.id === "prompt-optimization") navigate("/prompt-optimization");
    else navigate("/smartgen");
  };

  const gradientStyle = {
    background: "linear-gradient(90deg, #FF14EF 0%, #1A73E8 100%)",
    boxShadow: "0px 0px 20px 5px #170F1F",
  };

  return (
    <div className="flex justify-center px-2 sm:px-4">
      <nav
        className="
          flex items-center
          w-full
          max-w-[700px]
          h-[70px] sm:h-[86px]
          bg-black
          rounded-[200px]
          px-1 sm:px-2
          gap-1
        "
        style={{ boxShadow: "0px 0px 20px 5px #170F1F" }}
      >
        {navItems.map((section) => {
          const isActive = currentActive === section.id;
          const isSmartgen = section.id === "smartgen";

          return (
            <button
              key={section.id}
              onClick={() => handleSectionClick(section)}
              className={`
                relative
                flex-1
                flex flex-col items-center justify-center
                text-[10px] sm:text-sm
                font-medium
                transition-all
                py-2
                h-[60px] sm:h-[76px]
                ${
                  isActive
                    ? "text-white"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }
                ${
                  isActive && isSmartgen
                    ? "rounded-tl-[200px] rounded-bl-[200px]"
                    : "rounded-full"
                }
              `}
              style={isActive ? gradientStyle : {}}
            >
              {section.badge && (
                <span
                  className="absolute -top-2 right-2 text-[8px] sm:text-[10px] font-semibold text-white px-1.5 py-0.5"
                  style={{
                    borderRadius: "6px",
                    background:
                      "linear-gradient(270.19deg, #1A73E8 0.16%, #FF14EF 99.84%)",
                    boxShadow: "0px 0px 12px 2px #170F1F",
                  }}
                >
                  {section.badge}
                </span>
              )}

              <img
                src={`/icons/${section.id}.${section.ext}`}
                alt={section.label}
                className="w-4 h-4 sm:w-5 sm:h-5 mb-1"
              />

              <span className="text-center leading-tight">
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