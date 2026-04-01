// // import { useState , useRef} from "react";
// // import { useNavigate } from "react-router-dom";
// // import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// // import { Button } from "@/components/ui/button";
// // import { Input } from "@/components/ui/input";
// // import { Badge } from "@/components/ui/badge";
// // import { Switch } from "@/components/ui/switch";
// // import { Label } from "@/components/ui/label";
// // import {
// //   Search, Star, Download, DollarSign, Eye, Play, Pause, Lock, ArrowLeft,
// //   Image as ImageIcon, Video, Sparkles, ShoppingBag, Expand, History,
// //   Calculator, TrendingUp, ChevronLeft, ChevronRight,
// //   GraduationCap, Palette, FileText, BadgeDollarSign, Users,
// //   Plane, FlaskConical, Code2, BarChart3, LifeBuoy, Rocket, HeartPulse, Briefcase
// // } from "lucide-react";

// // import { toast } from "@/components/ui/use-toast";
// // import Header from "@/components/Header";
// // import PurchaseDialog from "@/components/PurchaseDialog";
// // import MediaEnlargeModal from "@/components/MediaEnlargeModal";
// // import SellPromptModal from "@/components/SellPromptModal";
// // import PromptHistory from "@/components/PromptHistory";
// // import AppNavigation from "@/components/AppNavigation";
// // import TokenUsageSection from "@/components/TokenUsageSection";
// // import { useUserTokenUsage } from "@/hooks/useUserTokenUsage";
// // import Footer from "@/components/Footer";
// // import DetailsPrompt from "@/components/DetailsPrompt";

// // const PromptMarketplacePage = () => {
// //   const navigate = useNavigate();
// //   const [searchQuery, setSearchQuery] = useState("");
// //   const [selectedCategory, setSelectedCategory] = useState("All");
// //   const [showImages, setShowImages] = useState(false);
// //   const [purchaseDialogOpen, setPurchaseDialogOpen] = useState(false);
// //   const [selectedPrompt, setSelectedPrompt] = useState<any>(null);
// //   const [purchasedPrompts, setPurchasedPrompts] = useState<number[]>([]);
// //   const [playingVideo, setPlayingVideo] = useState<number | null>(null);
// //   const [enlargeModalOpen, setEnlargeModalOpen] = useState(false);
// //   const [enlargeMedia, setEnlargeMedia] = useState<{ url: string; type: 'image' | 'video'; title: string } | null>(null);
// //   const [showHistory, setShowHistory] = useState(false);
// //    const { totalTokensUsed, tokenLimit } = useUserTokenUsage(); 
// //    const [detailsOpen, setDetailsOpen] = useState(false);
// // const [detailsPrompt, setDetailsPrompt] = useState<any>(null);


// //       // ====================== TOP-LEVEL HELPERS (NOT INSIDE A FUNCTION) ======================
// // const GRADIENT = "linear-gradient(270deg, #1A73E8 0%, #FF14EF 100%)";

// // const categoriesData = [
// //   { id: "All", icon: Sparkles },
// //   { id: "Marketing", icon: TrendingUp },
// //   { id: "Content", icon: ImageIcon },
// //   { id: "Social Media", icon: Video },
// //   { id: "Business", icon: DollarSign },
// //   { id: "Creative", icon: Sparkles },
// //   { id: "Education", icon: GraduationCap },
// //   { id: "Finance", icon: Calculator },
// //   { id: "Productivity", icon: Rocket },
// //   { id: "Health", icon: HeartPulse },
// //   { id: "Design", icon: Palette },
// //   { id: "Writing", icon: FileText },
// //   { id: "Sales", icon: BadgeDollarSign },
// //   { id: "HR", icon: Users },
// //   { id: "Travel", icon: Plane },
// //   { id: "Research", icon: FlaskConical },
// //   { id: "Code", icon: Code2 },
// //   { id: "Data", icon: BarChart3 },
// //   { id: "Support", icon: LifeBuoy },
// //   { id: "Enterprise", icon: Briefcase },
// // ];

// // // Arrow-function version (const) at TOP LEVEL
// // const CategoriesScroller: React.FC<{
// //   selectedCategory: string;
// //   setSelectedCategory: (c: string) => void;
// // }> = ({ selectedCategory, setSelectedCategory }) => {
// //   const railRef = useRef<HTMLDivElement>(null);

// //   const slide = (dir: "left" | "right") => {
// //     const rail = railRef.current;
// //     if (!rail) return;
// //     rail.scrollBy({ left: dir === "left" ? -260 : 260, behavior: "smooth" });
// //   };

  

// //    return (
// //     <div className="w-full flex items-center justify-center gap-3">
// //       {/* Left arrow */}
// //       <button
// //         onClick={() => slide("left")}
// //         className="shrink-0 rounded-full grid place-items-center text-white"
// //         style={{
// //           background: GRADIENT,
// //           width: 50,
// //           height: 50,
// //           borderRadius: "200px",
// //         }}
// //         aria-label="Scroll categories left"
// //       >
// //         <ChevronLeft className="w-5 h-5" />
// //       </button>

// //       {/* Scrollable category rail */}
// //       <div className="relative w-full max-w-[1200px] overflow-hidden">
// //         <div
// //           ref={railRef}
// //           className="flex items-center gap-3 overflow-x-auto scroll-smooth px-1 no-scrollbar"
// //         >
// //           {categoriesData.map(({ id, icon: Icon }) => {
// //   const isAll = id === "All";
// //   const isActive = selectedCategory === id;
// //   const pillWidth = isAll ? "109.525px" : "185.628px";

// //   // Active = gradient; Inactive = #17171A
// //   const baseStyle: React.CSSProperties = isActive
// //     ? {
// //         width: pillWidth,
// //         background: GRADIENT,
// //         color: "#FFFFFF",
// //       }
// //     : {
// //         width: pillWidth,
// //         background: "#17171A",
// //         color: "rgba(255,255,255,0.85)",
// //       };

// //   return (
// //     <button
// //       key={id}
// //       onClick={() => setSelectedCategory(id)}
// //       aria-pressed={isActive}
// //       className={[
// //         "flex items-center justify-center gap-[10px] h-[50px] rounded-[200px]",
// //         "text-sm font-medium whitespace-nowrap transition-colors",
// //         isActive ? "ring-1 ring-white/15" : "hover:bg-white/5"
// //       ].join(" ")}
// //       style={{ padding: "15px 30px", ...baseStyle }}
// //     >
// //       <Icon className="h-4 w-4" />
// //       <span>{id}</span>
// //     </button>
// //   );
// // })}

// //         </div>
// //       </div>

// //       {/* Right arrow */}
// //       <button
// //         onClick={() => slide("right")}
// //         className="shrink-0 rounded-full grid place-items-center text-white"
// //         style={{
// //           background: GRADIENT,
// //           width: 50,
// //           height: 50,
// //           borderRadius: "200px",
// //         }}
// //         aria-label="Scroll categories right"
// //       >
// //         <ChevronRight className="w-5 h-5" />
// //       </button>
// //     </div>
// //   );
// // };






























// //   const marketplacePrompts = [
// //     {
// //       id: 1,
// //       title: "E-commerce Product Description Generator",
// //       description: "Generate compelling product descriptions that convert visitors into customers",
// //       price: 4.99,
// //       rating: 4.8,
// //       downloads: 1234,
// //       category: "Marketing",
// //       videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
// //       imageUrl: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=400&fit=crop",
// //       preview: "Create an engaging product description for [product name]...",
// //       fullPrompt: "Create an engaging product description for [product name] that highlights key features and benefits..."
// //     },
// //     {
// //       id: 2,
// //       title: "Social Media Content Planner",
// //       description: "Plan and create engaging social media posts across all platforms",
// //       price: 7.99,
// //       rating: 4.9,
// //       downloads: 856,
// //       category: "Social Media",
// //       videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
// //       imageUrl: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400&h=400&fit=crop",
// //       preview: "Generate a week's worth of social media posts...",
// //       fullPrompt: "Generate a week's worth of social media posts for [brand/business]..."
// //     },
// //     {
// //       id: 3,
// //       title: "Blog Article Outline Creator",
// //       description: "Create comprehensive blog article outlines with SEO optimization",
// //       price: 3.99,
// //       rating: 4.7,
// //       downloads: 2341,
// //       category: "Content",
// //       videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
// //       imageUrl: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=400&h=400&fit=crop",
// //       preview: "Create a detailed blog outline for '[topic]'...",
// //       fullPrompt: "Create a detailed blog outline for '[topic]' targeting '[audience]'..."
// //     },
// //     {
// //       id: 21,
// //       title: "Investment Portfolio Analyzer",
// //       description: "Analyze and optimize investment portfolios for maximum returns",
// //       price: 12.99,
// //       rating: 4.9,
// //       downloads: 567,
// //       category: "Finance",
// //       videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
// //       imageUrl: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=400&fit=crop",
// //       preview: "Analyze my investment portfolio with [holdings]...",
// //       fullPrompt: "Analyze my investment portfolio with [holdings] and current allocation. Provide detailed risk assessment, diversification recommendations, rebalancing strategies, and projected returns based on historical data and market conditions."
// //     },
// //     {
// //       id: 22,
// //       title: "Personal Finance Planner",
// //       description: "Create comprehensive personal financial plans and budgets",
// //       price: 8.99,
// //       rating: 4.7,
// //       downloads: 892,
// //       category: "Finance",
// //       videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
// //       imageUrl: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=400&fit=crop",
// //       preview: "Create a personal financial plan for [income level]...",
// //       fullPrompt: "Create a comprehensive personal financial plan for [income level] with goals of [financial goals]. Include budget breakdown, savings strategies, debt management, investment recommendations, and timeline to achieve financial objectives."
// //     },
// //     {
// //       id: 23,
// //       title: "Tax Optimization Strategies",
// //       description: "Develop tax-efficient strategies for individuals and businesses",
// //       price: 15.99,
// //       rating: 4.8,
// //       downloads: 423,
// //       category: "Finance",
// //       videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
// //       imageUrl: "https://images.unsplash.com/photo-1554224154-22dec7ec8818?w=400&h=400&fit=crop",
// //       preview: "Develop tax optimization strategies for [situation type]...",
// //       fullPrompt: "Develop comprehensive tax optimization strategies for [situation type] considering [income sources] and [deductions available]. Include legal tax minimization techniques, timing strategies, retirement planning impacts, and compliance requirements."
// //     },
// //     {
// //       id: 24,
// //       title: "Cryptocurrency Trading Guide",
// //       description: "Expert guidance for cryptocurrency trading and investment",
// //       price: 18.99,
// //       rating: 4.6,
// //       downloads: 678,
// //       category: "Finance",
// //       videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
// //       imageUrl: "https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=400&h=400&fit=crop",
// //       preview: "Create a cryptocurrency trading strategy for [risk level]...",
// //       fullPrompt: "Create a comprehensive cryptocurrency trading strategy for [risk level] investor with [capital amount]. Include technical analysis techniques, risk management, portfolio allocation, market timing strategies, and regulatory considerations."
// //     },
// //     {
// //       id: 25,
// //       title: "Real Estate Investment Analyzer",
// //       description: "Analyze real estate investment opportunities and returns",
// //       price: 11.99,
// //       rating: 4.5,
// //       downloads: 334,
// //       category: "Finance",
// //       videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
// //       imageUrl: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=400&fit=crop",
// //       preview: "Analyze this real estate investment opportunity...",
// //       fullPrompt: "Analyze this real estate investment opportunity with [property details] and [market conditions]. Include cash flow analysis, ROI calculations, market comparisons, risk assessment, and long-term appreciation potential."
// //     },
// //     {
// //       id: 26,
// //       title: "Retirement Planning Calculator",
// //       description: "Plan and optimize retirement savings and income strategies",
// //       price: 9.99,
// //       rating: 4.8,
// //       downloads: 756,
// //       category: "Finance",
// //       videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
// //       imageUrl: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=400&h=400&fit=crop",
// //       preview: "Create a retirement plan for [age] looking to retire at [target age]...",
// //       fullPrompt: "Create a comprehensive retirement plan for [age] year old looking to retire at [target age]. Include savings targets, investment strategies, Social Security optimization, healthcare costs, and income replacement strategies."
// //     }
// //   ];
// //      const mockImages = ["/icons/pm1.png", "/icons/pm2.png", "/icons/pm3.png", "/icons/pm4.png"];

// // const promptsWithImages = marketplacePrompts.map((p, i) => ({
// //   ...p,
// //   imageUrl: mockImages[i % mockImages.length], // cycle pm1..pm4
// // }));



// // const withImages = <T extends { imageUrl?: string }>(arr: T[]) =>
// //   arr.map((p, i) => ({ ...p, imageUrl: mockImages[i % mockImages.length] }));

// // const filteredPrompts = marketplacePrompts.filter((prompt) => {
// //   const matchesSearch =
// //     prompt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
// //     prompt.description.toLowerCase().includes(searchQuery.toLowerCase());
// //   const matchesCategory =
// //     selectedCategory === "All" || prompt.category === selectedCategory;
// //   return matchesSearch && matchesCategory;
// // });

// // const promptsToRender = withImages(filteredPrompts);

  

  

// //   const handleVideoPlay = (promptId: number) => {
// //     setPlayingVideo(playingVideo === promptId ? null : promptId);
// //   };

// //   const handleEnlargeMedia = (prompt: any) => {
// //     setEnlargeMedia({
// //       url: showImages ? prompt.imageUrl : prompt.videoUrl,
// //       type: showImages ? 'image' : 'video',
// //       title: prompt.title
// //     });
// //     setEnlargeModalOpen(true);
// //   };

// //   const handlePreview = (prompt: any) => {
// //     if (purchasedPrompts.includes(prompt.id)) {
// //       toast({
// //         title: "Full Prompt Access",
// //         description: `You have full access to "${prompt.title}"`
// //       });
// //     } else {
// //       toast({
// //         title: "Preview Mode",
// //         description: `Showing preview for "${prompt.title}". Purchase to see full prompt.`
// //       });
// //     }
// //   };

// //   const handlePurchase = (prompt: any) => {
// //     setSelectedPrompt(prompt);
// //     setPurchaseDialogOpen(true);
// //   };

// //   const handlePurchaseComplete = (promptId: number) => {
// //     setPurchasedPrompts(prev => [...prev, promptId]);
    
// //     // Add to purchase history
// //     const purchaseHistory = JSON.parse(localStorage.getItem('purchaseHistory') || '[]');
// //     const prompt = marketplacePrompts.find(p => p.id === promptId);
// //     if (prompt) {
// //       purchaseHistory.push({
// //         ...prompt,
// //         purchasedAt: new Date().toISOString()
// //       });
// //       localStorage.setItem('purchaseHistory', JSON.stringify(purchaseHistory));
// //     }
    
// //     toast({
// //       title: "Purchase Successful!",
// //       description: "You now have full access to this prompt."
// //     });
// //   };

// //   const handlePromptSubmitted = () => {
// //     // Refresh the page or update the prompts list
// //     window.location.reload();
// //   };

// //  if (showHistory) {
// //   return (
// //     <div className="min-h-screen bg-[#07080A] text-white">
// //       <div className="container mx-auto px-6 py-8">
// //         <Header />

// //         <div className="flex items-center gap-4 mb-8">
// //           <Button
// //             variant="ghost"
// //             onClick={() => setShowHistory(false)}
// //             className="flex items-center gap-2 hover:bg-white/10"
// //           >
// //             <ArrowLeft className="h-4 w-4" />
// //             Back to Marketplace
// //           </Button>
// //           <div className="h-6 w-px bg-white/10" />
// //         </div>

// //         {/* 👇 actually render it */}
// //         <PromptHistory /* initialTab="purchased"  if your component supports it */ />
// //       </div>

// //       <Footer />
// //     </div>
// //   );
// // }


// //  return (
// //   <div className="dark min-h-screen bg-background text-foreground">
// //     {/* Top bar with header + back */}

// // {/* Header + centered token usage */}
// // {/* Header + token usage (lowered on desktop, visible on phone) */}

// // <div className="container mx-auto px-6 pt-6">
// //   {/* Full-width header on all devices */}
// //   <Header />

// //   {/* Desktop/Tablet: token usage centered just under header */}
// //   <div className="hidden md:flex justify-center mt-3">
// //     <TokenUsageSection
// //       totalTokensUsed={totalTokensUsed}
// //       tokenLimit={tokenLimit}
// //     />
// //   </div>

// //   {/* Mobile: keep header visible; token usage right below it */}
// //   <div className="flex md:hidden justify-center mt-2">
// //     <TokenUsageSection
// //       totalTokensUsed={totalTokensUsed}
// //       tokenLimit={tokenLimit}
// //     />
// //   </div>
// // </div>










// //     {/* Main Content */}
// //     <div className="container mx-auto px-6 pb-16">
// //       {/* History Button and Upload Button Section */}
// //       <div className="flex justify-between items-center mb-12">
// //         <Button
// //           variant="outline"
// //           onClick={() => setShowHistory(true)}
// //           className="flex items-center gap-2 hover:bg-tokun/10 hover:text-tokun hover:border-tokun/30"
// //         >
// //           <History className="h-4 w-4" />
// //           Purchase History
// //         </Button>
        
// //         {/* <SellPromptModal onPromptSubmitted={handlePromptSubmitted} /> */}
// //       </div> 
          


// // {/* token usage section */}
        
// // {/* <TokenUsageSection totalTokensUsed={totalTokensUsed} tokenLimit={tokenLimit} /> */}

// //      {/* text above the appnavigation */}
// //  <div className="flex flex-col items-center text-center mb-8">
// //   {/* Heading: Inter, 32px, 400 */}
// //   <h1
// //     style={{
// //       fontFamily: "Inter",
// //       fontWeight: 400,
// //       fontStyle: "normal",
// //       fontSize: "32px",
// //       lineHeight: "100%",
// //       letterSpacing: "0%",
// //       textAlign: "center",
// //     }}
// //     className="text-white"
// //   >
// //     Prompt Marketplace
// //   </h1>

// //   {/* Description: Gilroy, 14px, 500 */}
// //   <p
// //     style={{
// //       fontFamily: "Inter",
// //       fontWeight: 200,
// //       fontStyle: "normal",
// //       fontSize: "14px",
// //       lineHeight: "100%",
// //       letterSpacing: "0%",
// //       textAlign: "center",
// //     }}
// //     className="mt-3 text-white/80 max-w-[520px] leading-tight"
// //   >
// //     Discover and purchase premium AI prompts created by experts from around the
// //     world. Transform your ideas into reality with our curated collection.
// //   </p>
// // </div>









// //         <div className="flex flex-col items-center">
// //       {/* Navigation bar above search bar */}
// //      <AppNavigation
// //   activeSection="prompt-marketplace"
// //   onSectionChange={(section) => console.log("Section changed:", section)}
// // />


// //       {/* Search bar */}
   
// //     </div>









// //       {/* Search, Categories, and Toggle */}
// //       <div className="space-y-8 mb-12">

// //        {/* Search, Categories, and Toggle */}
// // <div className="space-y-8 mb-12">
// //   <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
    
// //     {/* Search input + button in one container */}
// //     <div
// //       className="flex items-center w-full sm:w-[700px] h-[50px] rounded-[200px] overflow-hidden"
// //       style={{ backgroundColor: "#121213", border: "1px solid #282829" }}
// //     >
// //       {/* Search icon */}
// //       <Search className="h-5 w-5 text-white/40 ml-4" />

// //       {/* Input */}
// //       <input
// //         placeholder="Search premium prompts..."
// //         value={searchQuery}
// //         onChange={(e) => setSearchQuery(e.target.value)}
// //         className="ml-3 flex-1 bg-transparent outline-none text-white placeholder:text-white/40 text-sm md:text-base"
// //       />

// //       {/* Search button flush right */}
// //       <button
// //         onClick={() => {/* trigger search */}}
// //         className="text-white font-medium"
// //         style={{
// //           width: "100px",
// //           height: "40px",
// //           borderRadius: "200px",
// //           background: "linear-gradient(90deg, #FF14EF 0%, #1A73E8 100%)",
// //           marginRight: "5px", // keeps button visually inside without breaking pill
// //         }}
// //       >
// //         Search
// //       </button>
// //     </div>

// //     {/* Toggle group pill */}
// //     <div
// //       className="flex items-center gap-3 h-[50px] rounded-[200px] px-4"
// //       style={{ backgroundColor: "#121213", border: "1px solid #282829" }}
// //     >
// //       <Video className="h-5 w-5 text-white/80" />
// //       <span className="text-white/80 text-sm">Video</span>

// //       {/* Always-gradient Switch */}
// //       <Switch
// //         id="media-toggle"
// //         checked={showImages}
// //         onCheckedChange={setShowImages}
// //         className={[
// //           "w-[44px] h-[24px] rounded-full relative",
// //           "bg-[linear-gradient(270.1deg,#E31FEF_0.08%,#2D6AE8_99.92%)]",
// //           "border border-[#282829]",
// //           "[&>span]:h-[18px] [&>span]:w-[18px] [&>span]:rounded-full [&>span]:bg-black/80",
// //           "[&>span]:translate-x-[4px] data-[state=checked]:[&>span]:translate-x-[22px]",
// //         ].join(" ")}
// //       />

// //       <Label
// //         htmlFor="media-toggle"
// //         className="flex items-center gap-2 cursor-pointer text-white/80 text-sm"
// //       >
// //         <ImageIcon className="h-5 w-5 text-white/80" />
// //         Images
// //       </Label>
// //     </div>
// //   </div>
// // </div>

// //  <CategoriesScroller
// //           selectedCategory={selectedCategory}
// //           setSelectedCategory={setSelectedCategory}


          
// //         />
      
// //       </div>

   

// //       {/* Prompts Grid */}
// //      {/* Prompts Grid */}
// //    {/* Prompts Grid */}
// // {/* Prompts Grid */}
// // <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
// //   {promptsToRender.map((prompt) => (
// //     <Card
// //       key={prompt.id}
// //      onClick={() => { setDetailsPrompt(prompt); setDetailsOpen(true); }}
// //   className="overflow-hidden cursor-pointer hover:scale-[1.01] transition-transform"
// //       style={{ width: 306, height: 520, background: "#1C1C1C", borderRadius: 30 }}
// //     >
// //       <CardContent className="p-4 h-full flex flex-col">
// //         {/* MEDIA */}
// //         <div
// //           className="relative w-full overflow-hidden group"
// //           style={{ height: 240, borderRadius: 20, backgroundColor: "#0B0B0B" }}
// //         >
// //           {showImages ? (
// //             <img src={prompt.imageUrl} alt={prompt.title} className="w-full h-full object-cover" />
// //           ) : (
// //             <>
// //               <video
// //                 className="w-full h-full object-cover"
// //                 src={prompt.videoUrl}
// //                 loop
// //                 muted
// //                 playsInline
// //                 ref={(el) => {
// //                   if (!el) return;
// //                   if (playingVideo === prompt.id) el.play().catch(() => {});
// //                   else el.pause();
// //                 }}
// //               />
// //               <button
// //                 type="button"
// //                 onClick={() => handleVideoPlay(prompt.id)}
// //                 className="absolute inset-0 flex items-center justify-center"
// //                 aria-label={playingVideo === prompt.id ? "Pause" : "Play"}
// //               >
// //                 <span className="w-12 h-12 rounded-full bg-black/60 hover:bg-black/75 grid place-items-center text-white transition-colors">
// //                   {playingVideo === prompt.id ? (
// //                     <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
// //                       <rect x="6" y="5" width="4" height="14" rx="1" />
// //                       <rect x="14" y="5" width="4" height="14" rx="1" />
// //                     </svg>
// //                   ) : (
// //                     <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
// //                       <path d="M8 5v14l11-7-11-7z" />
// //                     </svg>
// //                   )}
// //                 </span>
// //               </button>
// //               <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">0:20</div>
// //             </>
// //           )}

// //           {/* Category + purchase pills */}
// //           <div
// //             className="absolute top-3 left-3 px-3 py-1 text-[11px] font-semibold text-white rounded-full"
// //             style={{ background: "linear-gradient(270deg, #1A73E8 0%, #FF14EF 100%)" }}
// //           >
// //             {prompt.category.toUpperCase()}
// //           </div>

// //           {!purchasedPrompts.includes(prompt.id) && (
// //             <div
// //               className="absolute top-11 left-3 mt-2 px-3 py-1 text-[11px] font-semibold text-white rounded-full"
// //               style={{ background: "linear-gradient(270deg, #1A73E8 0%, #FF14EF 100%)" }}
// //             >
// //               PURCHASE TO UNLOCK
// //             </div>
// //           )}

// //           {/* Rating: outlined white star inside bordered pill */}
// //           <div className="absolute top-3 right-3">
// //             <div className="flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-medium text-white bg-black/40 border border-white/40 backdrop-blur-sm">
// //               <Star className="h-3.5 w-3.5 text-white" /> {/* no fill class -> outlined */}
// //               {prompt.rating}
// //             </div>
// //           </div>

// //           {/* Enlarge */}
        
// //         </div>

// //         {/* TEXT CONTENT (exact copy of screenshot text structure) */}
// //      {/* TEXT CONTENT (dynamic) */}
// // <div className="mt-4">
// //   {/* small kicker / preview (optional) */}
// //   {prompt.preview && (
// //     <p className="text-[12px] text-white/60 line-clamp-1">{prompt.preview}</p>
// //   )}

// //   {/* title */}
// //   <h3 className="mt-1 text-[18px] leading-snug font-semibold text-white line-clamp-2">
// //     {prompt.title}
// //   </h3>

// //   {/* description */}
// //   <p className="mt-2 text-[13px] leading-relaxed text-white/70 line-clamp-2">
// //     {prompt.description}
// //   </p>
// // </div>


// //         {/* Fees + Learn more (like screenshot) */}
// //         <div className="mt-3 flex items-center justify-between">
          
// //         </div>

// //         {/* FOOTER ROW — preview icon, downloads pill, price pill, purchase */}
// //         <div className="mt-auto pt-4 flex items-center justify-between gap-3">
// //           {/* Preview (circle, #333335) */}
// //           <button
// //             type="button"
// //             onClick={() => handlePreview(prompt)}
// //             className="w-10 h-10 rounded-full grid place-items-center"
// //             style={{ background: "#333335" }}
// //             aria-label="Preview"
// //           >
// //             <Eye className="h-4 w-4 text-white/85" />
// //           </button>
// // {/* Downloads pill */}
// // <div
// //   className="flex items-center justify-center gap-[5px]"
// //   style={{
// //     width: 73,
// //     height: 40,
// //     borderRadius: 50,
// //     padding: "10.5px 10px",
// //     background: "#333335",
// //   }}
// // >
// //   <Download className="h-4 w-4 text-white/85" />
// //   <span className="text-[13px] text-white/80">{prompt.downloads}</span>
// // </div>

// // {/* Price pill */}
// // <div
// //   className="flex items-center justify-center gap-[10px]"
// //   style={{
// //     width: 65, // as per your description
// //     height: 40,
// //     borderRadius: 50,
// //     padding: "10.5px 10px",
// //     background: "#333335",
// //   }}
// // >
// //   <span className="text-[13px] text-white/90">${prompt.price}</span>
// // </div>


// //           {/* Purchase / Owned */}
// //           {!purchasedPrompts.includes(prompt.id) ? (
// //             <button
// //               onClick={(e) => { e.stopPropagation(); handlePurchase(prompt); }}
// //               className="px-5 h-9 rounded-full text-white text-[13px] font-medium"
// //               style={{ background: "linear-gradient(270deg, #1A73E8 0%, #FF14EF 100%)" }}
// //             >
// //               Purchase
// //             </button>
// //           ) : (
// //             <button
// //               className="px-5 h-9 rounded-full text-white/80 text-[13px] font-medium bg-white/10 border border-white/15"
// //               disabled
// //             >
// //               Owned
// //             </button>
// //           )}
// //         </div>
// //       </CardContent>
// //     </Card>
// //   ))}
// // </div>




// //       {filteredPrompts.length === 0 && (
// //         <div className="text-center py-16">
// //          <p
// //     style={{
// //       fontFamily: "Inter, sans-serif",
// //       fontWeight: 400,
// //       fontStyle: "normal",
// //       fontSize: "24px",
// //       lineHeight: "100%",
// //       letterSpacing: "0%",
// //       textAlign: "center",
// //     }}
// //     className="text-white"
// //   >
// //     {`Showing 0 premium prompts in ${selectedCategory || "All"}`}
// //   </p>

// //   {/* Subtext: Inter, 16px, 400, centered */}
// //   <p
// //     style={{
// //       fontFamily: "Inter, sans-serif",
// //       fontWeight: 400,
// //       fontStyle: "normal",
// //       fontSize: "16px",
// //       lineHeight: "100%",
// //       letterSpacing: "0%",
// //       textAlign: "center",
// //     }}
// //     className="mt-3 text-white/80"
// //   >
// //     No prompts found matching your criteria.
// //   </p>

// //   {/* Clear Filters button: 160x50, radius 10px, 1px solid #fff */}
// //   <button
// //     type="button"
// //     onClick={() => {
// //       setSearchQuery("");
// //       setSelectedCategory("All");
// //     }}
// //     className="mx-auto mt-6 text-white"
// //     style={{
// //       width: "160px",
// //       height: "50px",
// //       borderRadius: "10px",
// //       border: "1px solid #FFFFFF",
// //       background: "transparent",
// //     }}
// //   >
// //     Clear Filters
// //   </button>
// //         </div>
// //       )}
// //     </div>



// //     <div className="mt-20">
// //   <Footer />
// // </div>


// //     <PurchaseDialog
// //       open={purchaseDialogOpen}
// //       onOpenChange={setPurchaseDialogOpen}
// //       prompt={selectedPrompt}
// //       onPurchaseComplete={handlePurchaseComplete}
// //     />

// //     <MediaEnlargeModal
// //       isOpen={enlargeModalOpen}
// //       onClose={() => setEnlargeModalOpen(false)}
// //       mediaUrl={enlargeMedia?.url || ""}
// //       mediaType={enlargeMedia?.type || "image"}
// //       title={enlargeMedia?.title || ""}
// //     />

// //     <DetailsPrompt
// //   open={detailsOpen}
// //   onOpenChange={setDetailsOpen}
// //   prompt={detailsPrompt}
// //   owned={detailsPrompt ? purchasedPrompts.includes(detailsPrompt.id) : false}
// //   onPurchase={(p) => {
// //     setDetailsOpen(false);
// //     handlePurchase(p);
// //   }}
// //   showImages={showImages}
// //   onEnlargeMedia={(m) => {
// //     setEnlargeMedia({ url: m.url, type: m.type, title: m.title });
// //     setEnlargeModalOpen(true);
// //   }}
// // />

// //   </div>
// // );

// // };

// // export default PromptMarketplacePage;


// //after integrateion

// // src/pages/PromptMarketplacePage.tsx
// import { useEffect, useRef, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { Card, CardContent } from "@/components/ui/card";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import {
//   Search, Star, Download, Eye, Video, Sparkles, History,
//   ChevronLeft, ChevronRight, GraduationCap, Palette, FileText,
//   BadgeDollarSign, Users, Plane, FlaskConical, Code2, BarChart3,
//   LifeBuoy, Briefcase, Image as ImageIcon, ArrowLeft,
// } from "lucide-react";

// import { toast } from "@/components/ui/use-toast";
// import Header from "@/components/Header";
// import PurchaseDialog from "@/components/PurchaseDialog";
// import MediaEnlargeModal from "@/components/MediaEnlargeModal";
// import PromptHistory from "@/components/PromptHistory";
// import AppNavigation from "@/components/AppNavigation";
// import TokenUsageSection from "@/components/TokenUsageSection";
// import { useUserTokenUsage } from "@/hooks/useUserTokenUsage";
// import Footer from "@/components/Footer";
// import DetailsPrompt from "@/components/DetailsPrompt";
// import { Button } from "@/components/ui/button";
// import { Switch } from "@/components/ui/switch";
// import { Label } from "@/components/ui/label";
// import { useAuth } from "@/contexts/AuthContext";

// type Prompt = {
//   id: string;
//   title: string;
//   description: string;
//   category: string;
//   price?: number;
//   rating?: number;
//   downloads?: number;
//   imageUrl?: string;
//   videoUrl?: string;
//   preview?: string;
//   isFree?: boolean;
//   createdAt?: string;
//   fullPrompt?: string; // not owned, so undefined
// };

// const GRADIENT = "linear-gradient(270deg, #1A73E8 0%, #FF14EF 100%)";
// const API_BASE = (import.meta as any).env?.VITE_API_URL || "http://localhost:5000";
// const PROMPTS_BASE = `${API_BASE}/api/prompt`; // change to /api/prompts if that's your mount

// /* ---------- Categories rail data (UI only) ---------- */
// const categoriesData = [
//   { id: "All", icon: Sparkles },
//   { id: "Marketing", icon: Sparkles },
//   { id: "Content", icon: ImageIcon },
//   { id: "Social Media", icon: Video },
//   { id: "Business", icon: BadgeDollarSign },
//   { id: "Creative", icon: Sparkles },
//   { id: "Education", icon: GraduationCap },
//   { id: "Finance", icon: BadgeDollarSign },
//   { id: "Productivity", icon: Sparkles },
//   { id: "Health", icon: Sparkles },
//   { id: "Design", icon: Palette },
//   { id: "Writing", icon: FileText },
//   { id: "Sales", icon: BadgeDollarSign },
//   { id: "HR", icon: Users },
//   { id: "Travel", icon: Plane },
//   { id: "Research", icon: FlaskConical },
//   { id: "Code", icon: Code2 },
//   { id: "Data", icon: BarChart3 },
//   { id: "Support", icon: LifeBuoy },
//   { id: "Enterprise", icon: Briefcase },
// ];

// /* ---------- Categories scroller ---------- */
// const CategoriesScroller: React.FC<{
//   selectedCategory: string;
//   setSelectedCategory: (c: string) => void;
// }> = ({ selectedCategory, setSelectedCategory }) => {
//   const railRef = useRef<HTMLDivElement>(null);

//   const slide = (dir: "left" | "right") => {
//     const rail = railRef.current;
//     if (!rail) return;
//     rail.scrollBy({ left: dir === "left" ? -260 : 260, behavior: "smooth" });
//   };

//   return (
//     <div className="w-full flex items-center justify-center gap-3">
//       <button
//         onClick={() => slide("left")}
//         className="shrink-0 rounded-full grid place-items-center text-white"
//         style={{ background: GRADIENT, width: 50, height: 50, borderRadius: "200px" }}
//         aria-label="Scroll categories left"
//       >
//         <ChevronLeft className="w-5 h-5" />
//       </button>

//       <div className="relative w-full max-w-[1200px] overflow-hidden">
//         <div
//           ref={railRef}
//           className="flex items-center gap-3 overflow-x-auto scroll-smooth px-1 no-scrollbar"
//         >
//           {categoriesData.map(({ id, icon: Icon }) => {
//             const isAll = id === "All";
//             const isActive = selectedCategory === id;
//             const pillWidth = isAll ? "109.525px" : "185.628px";

//             const baseStyle: React.CSSProperties = isActive
//               ? { width: pillWidth, background: GRADIENT, color: "#FFFFFF" }
//               : { width: pillWidth, background: "#17171A", color: "rgba(255,255,255,0.85)" };

//             return (
//               <button
//                 key={id}
//                 onClick={() => setSelectedCategory(id)}
//                 aria-pressed={isActive}
//                 className={[
//                   "flex items-center justify-center gap-[10px] h-[50px] rounded-[200px]",
//                   "text-sm font-medium whitespace-nowrap transition-colors",
//                   isActive ? "ring-1 ring-white/15" : "hover:bg-white/5",
//                 ].join(" ")}
//                 style={{ padding: "15px 30px", ...baseStyle }}
//               >
//                 <Icon className="h-4 w-4" />
//                 <span>{id}</span>
//               </button>
//             );
//           })}
//         </div>
//       </div>

//       <button
//         onClick={() => slide("right")}
//         className="shrink-0 rounded-full grid place-items-center text-white"
//         style={{ background: GRADIENT, width: 50, height: 50, borderRadius: "200px" }}
//         aria-label="Scroll categories right"
//       >
//         <ChevronRight className="w-5 h-5" />
//       </button>
//     </div>
//   );
// };

// /* ---------- Page ---------- */
// const PromptMarketplacePage = () => {
//   const navigate = useNavigate();
//   const { totalTokensUsed, tokenLimit } = useUserTokenUsage();
//   const { token } = useAuth?.() || ({} as any);

//   const [searchQuery, setSearchQuery] = useState("");
//   const [selectedCategory, setSelectedCategory] = useState("All");
//   const [showImages, setShowImages] = useState(false); // false=Video, true=Images (matches your UI)
//   const [playingVideo, setPlayingVideo] = useState<string | number | null>(null);

//   const [prompts, setPrompts] = useState<Prompt[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [loadError, setLoadError] = useState<string | null>(null);

//   const [purchaseDialogOpen, setPurchaseDialogOpen] = useState(false);
//   const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
//   const [purchasedPrompts, setPurchasedPrompts] = useState<string[]>([]); // store ids
//   const [enlargeModalOpen, setEnlargeModalOpen] = useState(false);
//   const [enlargeMedia, setEnlargeMedia] = useState<{ url: string; type: "image" | "video"; title: string } | null>(null);

//   const [showHistory, setShowHistory] = useState(false);
//   const [detailsOpen, setDetailsOpen] = useState(false);
//   const [detailsPrompt, setDetailsPrompt] = useState<any>(null);

//   /* ---------- Fetch prompts from API when media type or category changes ---------- */
//   useEffect(() => {
//     const fetchPrompts = async () => {
//       try {
//         setLoading(true);
//         setLoadError(null);

//         const params = new URLSearchParams();
//         params.set("type", showImages ? "image" : "video");
//         if (selectedCategory && selectedCategory !== "All") {
//           params.set("category", selectedCategory);
//         }

//         const res = await fetch(`${PROMPTS_BASE}/others?${params.toString()}`, {
//           headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
//           credentials: "include",
//         });
//         const data = await res.json();

//         if (!res.ok || !data?.success) {
//           throw new Error(data?.error || "server_error");
//         }

//         const mapped: Prompt[] = (data.prompts || []).map((doc: any) => {
//           const att = doc?.attachment || null;
//           const mediaPath = att?.path ? `${API_BASE}${att.path}` : undefined;

//           return {
//             id: String(doc._id),
//             title: doc.title || "Untitled",
//             description: doc.description || "",
//             category:
//               (doc.categories?.[0]?.name as string) ||
//               (Array.isArray(doc.categories) ? doc.categories.join(", ") : "") ||
//               "General",
//             price: typeof doc.price === "number" ? doc.price : 0,
//             rating: typeof doc.averageRating === "number" ? doc.averageRating : undefined,
//             downloads: doc.downloads || 0,
//             imageUrl: att?.type === "image" ? mediaPath : undefined,
//             videoUrl: att?.type === "video" ? mediaPath : undefined,
//             preview:
//               (doc.description && String(doc.description).slice(0, 140)) ||
//               (doc.promptText && String(doc.promptText).slice(0, 140)) ||
//               "",
//             isFree: !!doc.free,
//             createdAt: doc.createdAt,
//             // fullPrompt undefined for “others”; Details modal will show locked view unless purchased
//           };
//         });

//         setPrompts(mapped);
//       } catch (err: any) {
//         setLoadError(err?.message || "Failed to load prompts");
//         toast({
//           title: "Couldn’t load prompts",
//           description: err?.message || "Please try again.",
//           variant: "destructive",
//         });
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchPrompts();
//   }, [showImages, selectedCategory, token]);

//   /* ---------- Derived: local search filter ---------- */
//   const filteredPrompts = prompts.filter((p) => {
//     if (!searchQuery.trim()) return true;
//     const q = searchQuery.toLowerCase();
//     return (
//       p.title.toLowerCase().includes(q) ||
//       (p.description || "").toLowerCase().includes(q)
//     );
//   });

//   /* ---------- UI handlers ---------- */
//   const handleVideoPlay = (promptId: string | number) => {
//     setPlayingVideo((prev) => (prev === promptId ? null : promptId));
//   };

//   const handlePreview = (prompt: Prompt) => {
//     if (purchasedPrompts.includes(prompt.id)) {
//       toast({ title: "Full Prompt Access", description: `You have full access to "${prompt.title}"` });
//     } else {
//       toast({ title: "Preview Mode", description: `Showing preview for "${prompt.title}". Purchase to see full prompt.` });
//     }
//   };

//   const handlePurchase = (prompt: Prompt) => {
//     setSelectedPrompt(prompt);
//     setPurchaseDialogOpen(true);
//   };

//   const handlePurchaseComplete = (promptId: string) => {
//     setPurchasedPrompts((prev) => (prev.includes(promptId) ? prev : [...prev, promptId]));

//     // Persist a record locally if you want
//     const purchaseHistory = JSON.parse(localStorage.getItem("purchaseHistory") || "[]");
//     const prompt = prompts.find((p) => p.id === promptId);
//     if (prompt) {
//       purchaseHistory.push({ ...prompt, purchasedAt: new Date().toISOString() });
//       localStorage.setItem("purchaseHistory", JSON.stringify(purchaseHistory));
//     }

//     toast({ title: "Purchase Successful!", description: "You now have full access to this prompt." });
//   };

//   if (showHistory) {
//     return (
//       <div className="min-h-screen bg-[#07080A] text-white">
//         <div className="container mx-auto px-6 py-8">
//           <Header />
//           <div className="flex items-center gap-4 mb-8">
//             <Button
//               variant="ghost"
//               onClick={() => setShowHistory(false)}
//               className="flex items-center gap-2 hover:bg-white/10"
//             >
//               <ArrowLeft className="h-4 w-4" />
//               Back to Marketplace
//             </Button>
//             <div className="h-6 w-px bg-white/10" />
//           </div>
//           <PromptHistory />
//         </div>
//         <Footer />
//       </div>
//     );
//   }

//   return (
//     <div className="dark min-h-screen bg-background text-foreground">
//       {/* Header + token usage */}
//       <div className="container mx-auto px-6 pt-6">
//         <Header />
//         <div className="hidden md:flex justify-center mt-3">
//           <TokenUsageSection totalTokensUsed={totalTokensUsed} tokenLimit={tokenLimit} />
//         </div>
//         <div className="flex md:hidden justify-center mt-2">
//           <TokenUsageSection totalTokensUsed={totalTokensUsed} tokenLimit={tokenLimit} />
//         </div>
//       </div>

//       {/* Main Content */}
//       <div className="container mx-auto px-6 pb-16">
//         {/* History Button */}
//         <div className="flex justify-between items-center mb-12">
//           <Button
//             variant="outline"
//             onClick={() => setShowHistory(true)}
//             className="flex items-center gap-2 hover:bg-tokun/10 hover:text-tokun hover:border-tokun/30"
//           >
//             <History className="h-4 w-4" />
//             Purchase History
//           </Button>
//         </div>

//         {/* Title + blurb */}
//         <div className="flex flex-col items-center text-center mb-8">
//           <h1
//             style={{ fontFamily: "Inter", fontWeight: 400, fontSize: "32px", lineHeight: "100%" }}
//             className="text-white"
//           >
//             Prompt Marketplace
//           </h1>
//           <p
//             style={{ fontFamily: "Inter", fontWeight: 200, fontSize: "14px", lineHeight: "100%" }}
//             className="mt-3 text-white/80 max-w-[520px] leading-tight"
//           >
//             Discover and purchase premium AI prompts created by experts from around the world.
//           </p>
//         </div>

//         {/* Navigation + Search/Filters */}
//         <div className="flex flex-col items-center">
//           <AppNavigation
//             activeSection="prompt-marketplace"
//             onSectionChange={(section) => console.log("Section changed:", section)}
//           />
//         </div>

//         {/* Search + media toggle */}
//         <div className="space-y-8 mb-12">
//           <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
//             {/* Search pill */}
//             <div
//               className="flex items-center w-full sm:w-[700px] h-[50px] rounded-[200px] overflow-hidden"
//               style={{ backgroundColor: "#121213", border: "1px solid #282829" }}
//             >
//               <Search className="h-5 w-5 text-white/40 ml-4" />
//               <input
//                 placeholder="Search premium prompts..."
//                 value={searchQuery}
//                 onChange={(e) => setSearchQuery(e.target.value)}
//                 className="ml-3 flex-1 bg-transparent outline-none text-white placeholder:text-white/40 text-sm md:text-base"
//               />
//               <button
//                 onClick={() => {/* client-side filter only */}}
//                 className="text-white font-medium"
//                 style={{
//                   width: "100px",
//                   height: "40px",
//                   borderRadius: "200px",
//                   background: "linear-gradient(90deg, #FF14EF 0%, #1A73E8 100%)",
//                   marginRight: "5px",
//                 }}
//               >
//                 Search
//               </button>
//             </div>

//             {/* Video <-> Images toggle */}
//             <div
//               className="flex items-center gap-3 h-[50px] rounded-[200px] px-4"
//               style={{ backgroundColor: "#121213", border: "1px solid #282829" }}
//             >
//               <Video className="h-5 w-5 text-white/80" />
//               <span className="text-white/80 text-sm">Video</span>

//               <Switch
//                 id="media-toggle"
//                 checked={showImages}
//                 onCheckedChange={setShowImages}
//                 className={[
//                   "w-[44px] h-[24px] rounded-full relative",
//                   "bg-[linear-gradient(270.1deg,#E31FEF_0.08%,#2D6AE8_99.92%)]",
//                   "border border-[#282829]",
//                   "[&>span]:h-[18px] [&>span]:w-[18px] [&>span]:rounded-full [&>span]:bg-black/80",
//                   "[&>span]:translate-x-[4px] data-[state=checked]:[&>span]:translate-x-[22px]",
//                 ].join(" ")}
//               />

//               <Label htmlFor="media-toggle" className="flex items-center gap-2 cursor-pointer text-white/80 text-sm">
//                 <ImageIcon className="h-5 w-5 text-white/80" />
//                 Images
//               </Label>
//             </div>
//           </div>

//           <CategoriesScroller selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory} />
//         </div>

//         {/* Loading / error states */}
//         {loading && <p className="text-white/70 text-sm">Loading prompts…</p>}
//         {!!loadError && !loading && <p className="text-red-400 text-sm">{loadError}</p>}

//         {/* Prompts Grid */}
//         {!loading && !loadError && (
//           <>
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
//               {filteredPrompts.map((prompt) => (
//                 <Card
//                   key={prompt.id}
//                   onClick={() => {
//                     setDetailsPrompt(prompt);
//                     setDetailsOpen(true);
//                   }}
//                   className="overflow-hidden cursor-pointer hover:scale-[1.01] transition-transform"
//                   style={{ width: 306, height: 520, background: "#1C1C1C", borderRadius: 30 }}
//                 >
//                   <CardContent className="p-4 h-full flex flex-col">
//                     {/* MEDIA */}
//                     <div
//                       className="relative w-full overflow-hidden group"
//                       style={{ height: 240, borderRadius: 20, backgroundColor: "#0B0B0B" }}
//                     >
//                       {showImages ? (
//                         <img src={prompt.imageUrl} alt={prompt.title} className="w-full h-full object-cover" />
//                       ) : (
//                         <>
//                           <video
//                             className="w-full h-full object-cover"
//                             src={prompt.videoUrl}
//                             loop
//                             muted
//                             playsInline
//                             ref={(el) => {
//                               if (!el) return;
//                               if (playingVideo === prompt.id) el.play().catch(() => {});
//                               else el.pause();
//                             }}
//                           />
//                           <button
//                             type="button"
//                             onClick={(e) => {
//                               e.stopPropagation();
//                               handleVideoPlay(prompt.id);
//                             }}
//                             className="absolute inset-0 flex items-center justify-center"
//                             aria-label={playingVideo === prompt.id ? "Pause" : "Play"}
//                           >
//                             <span className="w-12 h-12 rounded-full bg-black/60 hover:bg-black/75 grid place-items-center text-white transition-colors">
//                               {playingVideo === prompt.id ? (
//                                 <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
//                                   <rect x="6" y="5" width="4" height="14" rx="1" />
//                                   <rect x="14" y="5" width="4" height="14" rx="1" />
//                                 </svg>
//                               ) : (
//                                 <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
//                                   <path d="M8 5v14l11-7-11-7z" />
//                                 </svg>
//                               )}
//                             </span>
//                           </button>
//                           <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">0:20</div>
//                         </>
//                       )}

//                       {/* Category pill */}
//                       <div
//                         className="absolute top-3 left-3 px-3 py-1 text-[11px] font-semibold text-white rounded-full"
//                         style={{ background: GRADIENT }}
//                       >
//                         {prompt.category?.toUpperCase()}
//                       </div>

//                       {/* Purchase to unlock */}
//                       {!purchasedPrompts.includes(prompt.id) && (
//                         <div
//                           className="absolute top-11 left-3 mt-2 px-3 py-1 text-[11px] font-semibold text-white rounded-full"
//                           style={{ background: GRADIENT }}
//                         >
//                           PURCHASE TO UNLOCK
//                         </div>
//                       )}

//                       {/* Rating pill */}
//                       <div className="absolute top-3 right-3">
//                         <div className="flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-medium text-white bg-black/40 border border-white/40 backdrop-blur-sm">
//                           <Star className="h-3.5 w-3.5 text-white" />
//                           {typeof prompt.rating === "number" ? prompt.rating : "—"}
//                         </div>
//                       </div>
//                     </div>

//                     {/* TEXT */}
//                     <div className="mt-4">
//                       {prompt.preview && (
//                         <p className="text-[12px] text-white/60 line-clamp-1">{prompt.preview}</p>
//                       )}
//                       <h3 className="mt-1 text-[18px] leading-snug font-semibold text-white line-clamp-2">
//                         {prompt.title}
//                       </h3>
//                       <p className="mt-2 text-[13px] leading-relaxed text-white/70 line-clamp-2">
//                         {prompt.description}
//                       </p>
//                     </div>

//                     {/* FOOTER */}
//                     <div className="mt-auto pt-4 flex items-center justify-between gap-3">
//                       {/* Preview */}
//                       <button
//                         type="button"
//                         onClick={(e) => {
//                           e.stopPropagation();
//                           handlePreview(prompt);
//                         }}
//                         className="w-10 h-10 rounded-full grid place-items-center"
//                         style={{ background: "#333335" }}
//                         aria-label="Preview"
//                       >
//                         <Eye className="h-4 w-4 text-white/85" />
//                       </button>

//                       {/* Downloads */}
//                       <div
//                         className="flex items-center justify-center gap-[5px]"
//                         style={{
//                           width: 73,
//                           height: 40,
//                           borderRadius: 50,
//                           padding: "10.5px 10px",
//                           background: "#333335",
//                         }}
//                       >
//                         <Download className="h-4 w-4 text-white/85" />
//                         <span className="text-[13px] text-white/80">{prompt.downloads ?? 0}</span>
//                       </div>

//                       {/* Price */}
//                       <div
//                         className="flex items-center justify-center gap-[10px]"
//                         style={{
//                           width: 65,
//                           height: 40,
//                           borderRadius: 50,
//                           padding: "10.5px 10px",
//                           background: "#333335",
//                         }}
//                       >
//                         <span className="text-[13px] text-white/90">
//                           {prompt.isFree ? "FREE" : `$${(prompt.price ?? 0).toFixed(2)}`}
//                         </span>
//                       </div>

//                       {/* Purchase / Owned */}
//                       {!purchasedPrompts.includes(prompt.id) ? (
//                         <button
//                           onClick={(e) => {
//                             e.stopPropagation();
//                             handlePurchase(prompt);
//                           }}
//                           className="px-5 h-9 rounded-full text-white text-[13px] font-medium"
//                           style={{ background: GRADIENT }}
//                         >
//                           Purchase
//                         </button>
//                       ) : (
//                         <button
//                           className="px-5 h-9 rounded-full text-white/80 text-[13px] font-medium bg-white/10 border border-white/15"
//                           disabled
//                         >
//                           Owned
//                         </button>
//                       )}
//                     </div>
//                   </CardContent>
//                 </Card>
//               ))}
//             </div>

//             {/* Empty state */}
//             {filteredPrompts.length === 0 && (
//               <div className="text-center py-16">
//                 <p
//                   style={{ fontFamily: "Inter, sans-serif", fontWeight: 400, fontSize: "24px", lineHeight: "100%" }}
//                   className="text-white"
//                 >
//                   {`Showing 0 premium prompts in ${selectedCategory || "All"}`}
//                 </p>
//                 <p
//                   style={{ fontFamily: "Inter, sans-serif", fontWeight: 400, fontSize: "16px", lineHeight: "100%" }}
//                   className="mt-3 text-white/80"
//                 >
//                   No prompts found matching your criteria.
//                 </p>
//                 <button
//                   type="button"
//                   onClick={() => {
//                     setSearchQuery("");
//                     setSelectedCategory("All");
//                   }}
//                   className="mx-auto mt-6 text-white"
//                   style={{
//                     width: "160px",
//                     height: "50px",
//                     borderRadius: "10px",
//                     border: "1px solid #FFFFFF",
//                     background: "transparent",
//                   }}
//                 >
//                   Clear Filters
//                 </button>
//               </div>
//             )}
//           </>
//         )}
//       </div>

//       <div className="mt-20">
//         <Footer />
//       </div>

//       {/* Dialogs / Modals */}
//       <PurchaseDialog
//         open={purchaseDialogOpen}
//         onOpenChange={setPurchaseDialogOpen}
//         prompt={selectedPrompt as any}
//         // Make sure your PurchaseDialog calls onPurchaseComplete with a string id
//         onPurchaseComplete={(id) => handlePurchaseComplete(String(id))}
//       />

//       <MediaEnlargeModal
//         isOpen={enlargeModalOpen}
//         onClose={() => setEnlargeModalOpen(false)}
//         mediaUrl={enlargeMedia?.url || ""}
//         mediaType={enlargeMedia?.type || "image"}
//         title={enlargeMedia?.title || ""}
//       />

//       <DetailsPrompt
//         open={detailsOpen}
//         onOpenChange={setDetailsOpen}
//         prompt={detailsPrompt}
//         owned={detailsPrompt ? purchasedPrompts.includes(String(detailsPrompt.id)) : false}
//         onPurchase={(p) => {
//           setDetailsOpen(false);
//           handlePurchase(p);
//         }}
//         showImages={showImages}
//         onEnlargeMedia={(m) => {
//           setEnlargeMedia({ url: m.url, type: m.type, title: m.title });
//           setEnlargeModalOpen(true);
//         }}
//       />
//     </div>
//   );
// };

// export default PromptMarketplacePage;


//0/9/2025



// // src/pages/PromptMarketplacePage.tsx
// import { useEffect, useRef, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { Card, CardContent } from "@/components/ui/card";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import {
//   Search, Star, Eye, Video, Sparkles, History,
//   ChevronLeft, ChevronRight, GraduationCap, Palette, FileText,
//   BadgeDollarSign, Users, Plane, FlaskConical, Code2, BarChart3,
//   LifeBuoy, Briefcase, Image as ImageIcon, ArrowLeft,
// } from "lucide-react";

// import { toast } from "@/components/ui/use-toast";
// import Header from "@/components/Header";
// import MediaEnlargeModal from "@/components/MediaEnlargeModal";
// import PromptHistory from "@/components/PromptHistory";
// import AppNavigation from "@/components/AppNavigation";
// import TokenUsageSection from "@/components/TokenUsageSection";
// import { useUserTokenUsage } from "@/hooks/useUserTokenUsage";
// import Footer from "@/components/Footer";
// import DetailsPrompt from "@/components/DetailsPrompt";
// import { Button } from "@/components/ui/button";
// import { Switch } from "@/components/ui/switch";
// import { Label } from "@/components/ui/label";
// import { useAuth } from "@/contexts/AuthContext";
// import ModalComponent from "@/components/ModalComponent";

// type Prompt = {
//   id: string;
//   title: string;
//   description: string;
//   category: string;
//   price?: number;
//   rating?: number;
//   downloads?: number;
//   imageUrl?: string;
//   videoUrl?: string;
//   preview?: string;
//   isFree?: boolean;
//   createdAt?: string;
//   fullPrompt?: string;
// };

// const GRADIENT = "linear-gradient(270deg, #1A73E8 0%, #FF14EF 100%)";
// const API_BASE = (import.meta as any).env?.VITE_API_URL || "http://localhost:5000";
// const PROMPTS_BASE = `${API_BASE}/api/prompt`;
// const PURCHASE_BASE = `${API_BASE}/api/purchase`;

// // ⚠️ Keep your real Razorpay key id in env:
// const RAZORPAY_KEY_ID = (import.meta as any).env?.VITE_RAZORPAY_KEY_ID || "rzp_test_aNNdd7yTcNuzYQ";

// /* ---------- Categories rail data (UI only) ---------- */
// const categoriesData = [
//   { id: "All", icon: Sparkles },
//   { id: "Marketing", icon: Sparkles },
//   { id: "Content", icon: ImageIcon },
//   { id: "Social Media", icon: Video },
//   { id: "Business", icon: BadgeDollarSign },
//   { id: "Creative", icon: Sparkles },
//   { id: "Education", icon: GraduationCap },
//   { id: "Finance", icon: BadgeDollarSign },
//   { id: "Productivity", icon: Sparkles },
//   { id: "Health", icon: Sparkles },
//   { id: "Design", icon: Palette },
//   { id: "Writing", icon: FileText },
//   { id: "Sales", icon: BadgeDollarSign },
//   { id: "HR", icon: Users },
//   { id: "Travel", icon: Plane },
//   { id: "Research", icon: FlaskConical },
//   { id: "Code", icon: Code2 },
//   { id: "Data", icon: BarChart3 },
//   { id: "Support", icon: LifeBuoy },
//   { id: "Enterprise", icon: Briefcase },
// ];

// /* ---------- Categories scroller ---------- */
// const CategoriesScroller: React.FC<{
//   selectedCategory: string;
//   setSelectedCategory: (c: string) => void;
// }> = ({ selectedCategory, setSelectedCategory }) => {
//   const railRef = useRef<HTMLDivElement>(null);
//   const slide = (dir: "left" | "right") => {
//     const rail = railRef.current;
//     if (!rail) return;
//     rail.scrollBy({ left: dir === "left" ? -260 : 260, behavior: "smooth" });
//   };

//   return (
//     <div className="w-full flex items-center justify-center gap-3">
//       <button
//         onClick={() => slide("left")}
//         className="shrink-0 rounded-full grid place-items-center text-white"
//         style={{ background: GRADIENT, width: 50, height: 50, borderRadius: "200px" }}
//         aria-label="Scroll categories left"
//       >
//         <ChevronLeft className="w-5 h-5" />
//       </button>

//       <div className="relative w-full max-w-[1200px] overflow-hidden">
//         <div
//           ref={railRef}
//           className="flex items-center gap-3 overflow-x-auto scroll-smooth px-1 no-scrollbar"
//         >
//           {categoriesData.map(({ id, icon: Icon }) => {
//             const isAll = id === "All";
//             const isActive = selectedCategory === id;
//             const pillWidth = isAll ? "109.525px" : "185.628px";
//             const baseStyle: React.CSSProperties = isActive
//               ? { width: pillWidth, background: GRADIENT, color: "#FFFFFF" }
//               : { width: pillWidth, background: "#17171A", color: "rgba(255,255,255,0.85)" };

//             return (
//               <button
//                 key={id}
//                 onClick={() => setSelectedCategory(id)}
//                 aria-pressed={isActive}
//                 className={[
//                   "flex items-center justify-center gap-[10px] h-[50px] rounded-[200px]",
//                   "text-sm font-medium whitespace-nowrap transition-colors",
//                   isActive ? "ring-1 ring-white/15" : "hover:bg-white/5",
//                 ].join(" ")}
//                 style={{ padding: "15px 30px", ...baseStyle }}
//               >
//                 <Icon className="h-4 w-4" />
//                 <span>{id}</span>
//               </button>
//             );
//           })}
//         </div>
//       </div>

//       <button
//         onClick={() => slide("right")}
//         className="shrink-0 rounded-full grid place-items-center text-white"
//         style={{ background: GRADIENT, width: 50, height: 50, borderRadius: "200px" }}
//         aria-label="Scroll categories right"
//       >
//         <ChevronRight className="w-5 h-5" />
//       </button>
//     </div>
//   );
// };

// const PromptMarketplacePage = () => {
//   const navigate = useNavigate();
//   const { totalTokensUsed, tokenLimit } = useUserTokenUsage();
//   const { token } = useAuth?.() || ({} as any);

//   const [searchQuery, setSearchQuery] = useState("");
//   const [selectedCategory, setSelectedCategory] = useState("All");
//   const [showImages, setShowImages] = useState(false);
//   const [playingVideo, setPlayingVideo] = useState<string | number | null>(null);

//   const [prompts, setPrompts] = useState<Prompt[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [loadError, setLoadError] = useState<string | null>(null);

//   // IDs of prompts user already owns
//   const [purchasedPrompts, setPurchasedPrompts] = useState<string[]>([]);

//   const [enlargeModalOpen, setEnlargeModalOpen] = useState(false);
//   const [enlargeMedia, setEnlargeMedia] = useState<{ url: string; type: "image" | "video"; title: string } | null>(null);

//   const [showHistory, setShowHistory] = useState(false);
//   const [detailsOpen, setDetailsOpen] = useState(false);
//   const [detailsPrompt, setDetailsPrompt] = useState<any>(null);

//   // Save modal (anchored to cop.png)
//   const [saveModalOpen, setSaveModalOpen] = useState(false);
//   const [saveAnchorEl, setSaveAnchorEl] = useState<HTMLElement | null>(null);

//   // Razorpay script ready?
//   const [rzpReady, setRzpReady] = useState(false);

//   /* ---------- Load Razorpay script once ---------- */
//   useEffect(() => {
//     if ((window as any).Razorpay) {
//       console.log("✅ [RZP] checkout.js already loaded");
//       setRzpReady(true);
//       return;
//     }
//     console.log("🟣 [RZP] injecting checkout.js …");
//     const script = document.createElement("script");
//     script.src = "https://checkout.razorpay.com/v1/checkout.js";
//     script.async = true;
//     script.onload = () => {
//       console.log("🟢 [RZP] checkout.js loaded");
//       setRzpReady(true);
//     };
//     script.onerror = () => {
//       console.error("❌ [RZP] failed to load checkout.js");
//       setRzpReady(false);
//     };
//     document.body.appendChild(script);
//   }, []);

//   /* ---------- [API #3] Load purchase history on mount to mark "Owned" ---------- */
//   useEffect(() => {
//     if (!token) return;
//     (async () => {
//       try {
//         console.log("🟣 [API #3] GET /api/purchase/history – mark owned cards");
//         const res = await fetch(`${PURCHASE_BASE}/history`, {
//           headers: { Authorization: `Bearer ${token}` },
//           credentials: "include",
//         });
//         const body = await res.json();
//         console.log("🟢 [API #3] History response", { status: res.status, ok: res.ok, body });

//         if (!res.ok || !body?.success) return;

//         const ownedIds = (body.purchases || [])
//           .map((p: any) => {
//             // prefer populated prompt._id, else plain id string
//             if (p?.prompt && typeof p.prompt === "object") return String(p.prompt._id);
//             if (p?.prompt && typeof p.prompt === "string") return p.prompt;
//             return null;
//           })
//           .filter(Boolean);

//         setPurchasedPrompts((prev) => Array.from(new Set([...(prev || []), ...ownedIds])));
//       } catch (e) {
//         console.error("❌ [API #3] History fetch failed", e);
//       }
//     })();
//   }, [token]);

//   /* ---------- Fetch prompts ---------- */
//   useEffect(() => {
//     const fetchPrompts = async () => {
//       try {
//         setLoading(true);
//         setLoadError(null);

//         const params = new URLSearchParams();
//         params.set("type", showImages ? "image" : "video");
//         if (selectedCategory && selectedCategory !== "All") {
//           params.set("category", selectedCategory);
//         }

//         console.log("🟣 [API] GET /api/prompt/others", { params: params.toString() });

//         const res = await fetch(`${PROMPTS_BASE}/others?${params.toString()}`, {
//           headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
//           credentials: "include",
//         });
//         const data = await res.json();

//         console.log("🟢 [API] Prompts response", { status: res.status, ok: res.ok, body: data });

//         if (!res.ok || !data?.success) {
//           throw new Error(data?.error || "server_error");
//         }

//         const mapped: Prompt[] = (data.prompts || []).map((doc: any) => {
//           const att = doc?.attachment || null;
//           const mediaPath = att?.path ? `${API_BASE}${att.path}` : undefined;

//           return {
//             id: String(doc._id),
//             title: doc.title || "Untitled",
//             description: doc.description || "",
//             category:
//               (doc.categories?.[0]?.name as string) ||
//               (Array.isArray(doc.categories) ? doc.categories.join(", ") : "") ||
//               "General",
//             price: typeof doc.price === "number" ? doc.price : 0,
//             rating: typeof doc.averageRating === "number" ? doc.averageRating : undefined,
//             downloads: doc.downloads || 0,
//             imageUrl: att?.type === "image" ? mediaPath : undefined,
//             videoUrl: att?.type === "video" ? mediaPath : undefined,
//             preview:
//               (doc.description && String(doc.description).slice(0, 140)) ||
//               (doc.promptText && String(doc.promptText).slice(0, 140)) ||
//               "",
//             isFree: !!doc.free,
//             createdAt: doc.createdAt,
//           };
//         });

//         setPrompts(mapped);
//       } catch (err: any) {
//         console.error("❌ [API] Failed to load prompts", err);
//         setLoadError(err?.message || "Failed to load prompts");
//         toast({
//           title: "Couldn’t load prompts",
//           description: err?.message || "Please try again.",
//           variant: "destructive",
//         });
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchPrompts();
//   }, [showImages, selectedCategory, token]);

//   /* ---------- Derived: local search filter ---------- */
//   const filteredPrompts = prompts.filter((p) => {
//     if (!searchQuery.trim()) return true;
//     const q = searchQuery.toLowerCase();
//     return (
//       p.title.toLowerCase().includes(q) ||
//       (p.description || "").toLowerCase().includes(q)
//     );
//   });

//   /* ---------- UI handlers ---------- */
//   const handleVideoPlay = (promptId: string | number) => {
//     setPlayingVideo((prev) => (prev === promptId ? null : promptId));
//   };

//   const handlePreview = (prompt: Prompt) => {
//     if (purchasedPrompts.includes(prompt.id)) {
//       toast({ title: "Full Prompt Access", description: `You have full access to "${prompt.title}"` });
//     } else {
//       toast({ title: "Preview Mode", description: `Showing preview for "${prompt.title}". Purchase to see full prompt.` });
//     }
//   };

//   /** PURCHASE FLOW — integrates CREATE ORDER (+ verify) with detailed consoles */
//   const handlePurchase = async (prompt: Prompt) => {
//     console.log("🟣 [BUY] Purchase clicked", { promptId: prompt.id, title: prompt.title, priceShown: prompt.price });

//     if (!token) {
//       console.warn("⚠️ [BUY] Not authenticated");
//       toast({ title: "Please log in", description: "You must be logged in to purchase.", variant: "destructive" });
//       return;
//     }

//     if (!rzpReady) {
//       console.warn("⚠️ [RZP] Razorpay script not ready yet");
//       toast({ title: "Loading payment…", description: "Razorpay is still initializing." });
//       return;
//     }

//     try {
//       // -----------------------------
//       // [API #1] CREATE ORDER
//       // -----------------------------
//       console.log("🟣 [API #1] POST /api/purchase/create-order/:promptId", { url: `${PURCHASE_BASE}/create-order/${prompt.id}` });
//       const res = await fetch(`${PURCHASE_BASE}/create-order/${prompt.id}`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         credentials: "include",
//       });

//       const data = await res.json();
//       console.log("🟢 [API #1] Create-order response", { status: res.status, ok: res.ok, body: data });

//       if (!res.ok || !data?.success || !data?.order) {
//         const msg = data?.error || "order_create_failed";
//         throw new Error(msg);
//       }

//       const order = data.order;

//       // -----------------------------
//       // Razorpay Checkout
//       // -----------------------------
//       const options: any = {
//         key: RAZORPAY_KEY_ID,
//         amount: Number(order.amount), // paise
//         currency: order.currency || "INR",
//         name: "Tokun",
//         description: `Purchase: ${prompt.title}`,
//         order_id: order.id,
//         notes: { promptId: prompt.id },
//         theme: { color: "#1A73E8" },

//         handler: async (response: any) => {
//           console.log("🟢 [RZP] Handler success payload", response);

//           try {
//             // -----------------------------
//             // [API #2] VERIFY PAYMENT
//             // -----------------------------
//             console.log("🟣 [API #2] POST /api/purchase/verify/:promptId");
//             const vr = await fetch(`${PURCHASE_BASE}/verify/${prompt.id}`, {
//               method: "POST",
//               headers: {
//                 "Content-Type": "application/json",
//                 Authorization: `Bearer ${token}`,
//               },
//               credentials: "include",
//               body: JSON.stringify({
//                 razorpayPaymentId: response.razorpay_payment_id,
//                 razorpayOrderId: response.razorpay_order_id,
//                 razorpaySignature: response.razorpay_signature,
//                 pricePaid: order.amount / 100, // convert paise -> INR
//               }),
//             });

//             const vb = await vr.json();
//             console.log("🟢 [API #2] Verify response", { status: vr.status, ok: vr.ok, body: vb });

//             if (vb?.success) {
//               const purchasedId = prompt.id;

//               // Mark as owned (button changes to "Owned")
//               setPurchasedPrompts((prev) => (prev.includes(purchasedId) ? prev : [...prev, purchasedId]));

//               // 🔔 Let PromptHistory update live if open
//               try {
//                 window.dispatchEvent(new CustomEvent("tokun:purchased", { detail: vb.purchase }));
//                 console.log("🟢 [EVENT] Dispatched tokun:purchased", vb.purchase);
//               } catch (e) {
//                 console.warn("⚠️ [EVENT] tokun:purchased failed to dispatch", e);
//               }

//               toast({ title: "Payment Successful", description: "You now own this prompt." });

//               // (Optional) Navigate to history immediately:
//               // setShowHistory(true);
//             } else {
//               toast({ title: "Verification Failed", description: vb?.error || "Unknown error", variant: "destructive" });
//             }
//           } catch (err) {
//             console.error("❌ [API #2] Verify exception", err);
//             toast({ title: "Verification Error", description: "Could not verify payment.", variant: "destructive" });
//           }
//         },
//       };

//       const rzp = new (window as any).Razorpay(options);

//       rzp.on("payment.failed", function (resp: any) {
//         console.error("❌ [RZP] Payment failed", resp);
//         toast({ title: "Payment Failed", description: "Please try again.", variant: "destructive" });
//       });

//       console.log("🟣 [RZP] Opening checkout", { options: { ...options, handler: "[function]" } });
//       rzp.open();
//     } catch (err: any) {
//       console.error("❌ [BUY] Purchase flow error", err);
//       toast({ title: "Purchase Error", description: err?.message || "Something went wrong.", variant: "destructive" });
//     }
//   };

//   if (showHistory) {
//     return (
//       <div className="min-h-screen bg-[#07080A] text-white">
//         <div className="container mx-auto px-6 py-8">
//           <Header />
//           <div className="flex items-center gap-4 mb-8">
//             <Button
//               variant="ghost"
//               onClick={() => setShowHistory(false)}
//               className="flex items-center gap-2 hover:bg-white/10"
//             >
//               <ArrowLeft className="h-4 w-4" />
//               Back to Marketplace
//             </Button>
//             <div className="h-6 w-px bg-white/10" />
//           </div>

//           {/* PromptHistory fetches [API #3] internally and also listens to tokun:purchased */}
//           <PromptHistory />
//         </div>
//         <Footer />
//       </div>
//     );
//   }

//   return (
//     <div className="dark min-h-screen bg-background text-foreground">
//       {/* Header + token usage */}
//       <div className="container mx-auto px-6 pt-6">
//         <Header />
//         <div className="hidden md:flex justify-center mt-3">
//           <TokenUsageSection totalTokensUsed={totalTokensUsed} tokenLimit={tokenLimit} />
//         </div>
//         <div className="flex md:hidden justify-center mt-2">
//           <TokenUsageSection totalTokensUsed={totalTokensUsed} tokenLimit={tokenLimit} />
//         </div>
//       </div>

//       {/* Main Content */}
//       <div className="container mx-auto px-6 pb-16">
//         {/* History Button */}
//         <div className="flex justify-between items-center mb-12">
//           <Button
//             variant="outline"
//             onClick={() => setShowHistory(true)}
//             className="flex items-center gap-2 hover:bg-tokun/10 hover:text-tokun hover:border-tokun/30"
//           >
//             <History className="h-4 w-4" />
//             Purchase History
//           </Button>
//         </div>

//         {/* Title + blurb */}
//         <div className="flex flex-col items-center text-center mb-8">
//           <h1
//             style={{ fontFamily: "Inter", fontWeight: 400, fontSize: "32px", lineHeight: "100%" }}
//             className="text-white"
//           >
//             Prompt Marketplace
//           </h1>
//           <p
//             style={{ fontFamily: "Inter", fontWeight: 200, fontSize: "14px", lineHeight: "100%" }}
//             className="mt-3 text-white/80 max-w-[520px] leading-tight"
//           >
//             Discover and purchase premium AI prompts created by experts from around the world.
//           </p>
//         </div>

//         {/* Navigation + Search/Filters */}
//         <div className="flex flex-col items-center">
//           <AppNavigation
//             activeSection="prompt-marketplace"
//             onSectionChange={(section) => console.log("Section changed:", section)}
//           />
//         </div>

//         {/* Search + media toggle */}
//         <div className="space-y-8 mb-12">
//           <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
//             {/* Search pill */}
//             <div
//               className="flex items-center w-full sm:w-[700px] h-[50px] rounded-[200px] overflow-hidden"
//               style={{ backgroundColor: "#121213", border: "1px solid #282829" }}
//             >
//               <Search className="h-5 w-5 text-white/40 ml-4" />
//               <input
//                 placeholder="Search premium prompts..."
//                 value={searchQuery}
//                 onChange={(e) => setSearchQuery(e.target.value)}
//                 className="ml-3 flex-1 bg-transparent outline-none text-white placeholder:text-white/40 text-sm md:text-base"
//               />
//               <button
//                 onClick={() => {/* client-side filter only */}}
//                 className="text-white font-medium"
//                 style={{
//                   width: "100px",
//                   height: "40px",
//                   borderRadius: "200px",
//                   background: "linear-gradient(90deg, #FF14EF 0%, #1A73E8 100%)",
//                   marginRight: "5px",
//                 }}
//               >
//                 Search
//               </button>
//             </div>

//             {/* Video <-> Images toggle */}
//             <div
//               className="flex items-center gap-3 h-[50px] rounded-[200px] px-4"
//               style={{ backgroundColor: "#121213", border: "1px solid #282829" }}
//             >
//               <Video className="h-5 w-5 text-white/80" />
//               <span className="text-white/80 text-sm">Video</span>

//               <Switch
//                 id="media-toggle"
//                 checked={showImages}
//                 onCheckedChange={setShowImages}
//                 className={[
//                   "w-[44px] h-[24px] rounded-full relative",
//                   "bg-[linear-gradient(270.1deg,#E31FEF_0.08%,#2D6AE8_99.92%)]",
//                   "border border-[#282829]",
//                   "[&>span]:h-[18px] [&>span]:w-[18px] [&>span]:rounded-full [&>span]:bg-black/80",
//                   "[&>span]:translate-x-[4px] data-[state=checked]:[&>span]:translate-x-[22px]",
//                 ].join(" ")}
//               />

//               <Label htmlFor="media-toggle" className="flex items-center gap-2 cursor-pointer text-white/80 text-sm">
//                 <ImageIcon className="h-5 w-5 text-white/80" />
//                 Images
//               </Label>
//             </div>
//           </div>

//           <CategoriesScroller selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory} />
//         </div>

//         {/* Loading / error states */}
//         {loading && <p className="text-white/70 text-sm">Loading prompts…</p>}
//         {!!loadError && !loading && <p className="text-red-400 text-sm">{loadError}</p>}

//         {/* Prompts Grid */}
//         {!loading && !loadError && (
//           <>
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
//               {filteredPrompts.map((prompt) => (
//                 <Card
//                   key={prompt.id}
//                   onClick={() => {
//                     setDetailsPrompt(prompt);
//                     setDetailsOpen(true);
//                   }}
//                   className="overflow-hidden cursor-pointer hover:scale-[1.01] transition-transform"
//                   style={{ width: 306, height: 520, background: "#1C1C1C", borderRadius: 30 }}
//                 >
//                   <CardContent className="p-4 h-full flex flex-col">
//                     {/* MEDIA */}
//                     <div
//                       className="relative w-full overflow-hidden group"
//                       style={{ height: 240, borderRadius: 20, backgroundColor: "#0B0B0B" }}
//                     >
//                       {showImages ? (
//                         <img src={prompt.imageUrl} alt={prompt.title} className="w-full h-full object-cover" />
//                       ) : (
//                         <>
//                           <video
//                             className="w-full h-full object-cover"
//                             src={prompt.videoUrl}
//                             loop
//                             muted
//                             playsInline
//                             ref={(el) => {
//                               if (!el) return;
//                               if (playingVideo === prompt.id) el.play().catch(() => {});
//                               else el.pause();
//                             }}
//                           />
//                           <button
//                             type="button"
//                             onClick={(e) => {
//                               e.stopPropagation();
//                               handleVideoPlay(prompt.id);
//                             }}
//                             className="absolute inset-0 flex items-center justify-center"
//                             aria-label={playingVideo === prompt.id ? "Pause" : "Play"}
//                           >
//                             <span className="w-12 h-12 rounded-full bg-black/60 hover:bg-black/75 grid place-items-center text-white transition-colors">
//                               {playingVideo === prompt.id ? (
//                                 <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
//                                   <rect x="6" y="5" width="4" height="14" rx="1" />
//                                   <rect x="14" y="5" width="4" height="14" rx="1" />
//                                 </svg>
//                               ) : (
//                                 <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
//                                   <path d="M8 5v14l11-7-11-7z" />
//                                 </svg>
//                               )}
//                             </span>
//                           </button>
//                           <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">0:20</div>
//                         </>
//                       )}

//                       {/* Category pill */}
//                       <div
//                         className="absolute top-3 left-3 px-3 py-1 text-[11px] font-semibold text-white rounded-full"
//                         style={{ background: GRADIENT }}
//                       >
//                         {prompt.category?.toUpperCase()}
//                       </div>

//                       {/* Purchase to unlock */}
//                       {!purchasedPrompts.includes(prompt.id) && (
//                         <div
//                           className="absolute top-11 left-3 mt-2 px-3 py-1 text-[11px] font-semibold text-white rounded-full"
//                           style={{ background: GRADIENT }}
//                         >
//                           PURCHASE TO UNLOCK
//                         </div>
//                       )}

//                       {/* Rating pill */}
//                       <div className="absolute top-3 right-3">
//                         <div className="flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-medium text-white bg-black/40 border border-white/40 backdrop-blur-sm">
//                           <Star className="h-3.5 w-3.5 text-white" />
//                           {typeof prompt.rating === "number" ? prompt.rating : "—"}
//                         </div>
//                       </div>
//                     </div>

//                     {/* TEXT */}
//                     <div className="mt-4">
//                       {prompt.preview && (
//                         <p className="text-[12px] text-white/60 line-clamp-1">{prompt.preview}</p>
//                       )}
//                       <h3 className="mt-1 text-[18px] leading-snug font-semibold text-white line-clamp-2">
//                         {prompt.title}
//                       </h3>
//                       <p className="mt-2 text-[13px] leading-relaxed text-white/70 line-clamp-2">
//                         {prompt.description}
//                       </p>
//                     </div>

//                     {/* FOOTER */}
//                     <div className="mt-auto pt-4 flex items-center justify-between gap-3">
//                       {/* Preview */}
//                       <button
//                         type="button"
//                         onClick={(e) => {
//                           e.stopPropagation();
//                           handlePreview(prompt);
//                         }}
//                         className="w-10 h-10 rounded-full grid place-items-center"
//                         style={{ background: "#333335" }}
//                         aria-label="Preview"
//                       >
//                         <Eye className="h-4 w-4 text-white/85" />
//                       </button>

//                       {/* Save dropdown (cop.png) */}
//                       <button
//                         type="button"
//                         onClick={(e) => {
//                           e.stopPropagation();
//                           setSaveAnchorEl(e.currentTarget as HTMLElement);
//                           setSaveModalOpen(true);
//                         }}
//                         className="w-10 h-10 rounded-full grid place-items-center"
//                         style={{ background: "#333335" }}
//                         aria-label="Save menu"
//                       >
//                         <img src="/icons/cop.png" alt="Save" className="h-4 w-4 opacity-90" />
//                       </button>

//                       {/* Price (₹) */}
//                       <div
//                         className="flex items-center justify-center gap-[10px]"
//                         style={{
//                           width: 65,
//                           height: 40,
//                           borderRadius: 50,
//                           padding: "10.5px 10px",
//                           background: "#333335",
//                         }}
//                       >
//                         <span className="text-[13px] text-white/90">
//                           {prompt.isFree ? "FREE" : `₹${(prompt.price ?? 0).toFixed(2)}`}
//                         </span>
//                       </div>

//                       {/* Purchase / Owned */}
//                       {!purchasedPrompts.includes(prompt.id) ? (
//                         <button
//                           onClick={(e) => {
//                             e.stopPropagation();
//                             handlePurchase(prompt); // 🔗 calls [API #1] + Razorpay + [API #2]
//                           }}
//                           className="px-5 h-9 rounded-full text-white text-[13px] font-medium"
//                           style={{ background: GRADIENT }}
//                         >
//                           Purchase
//                         </button>
//                       ) : (
//                         <button
//                           className="px-5 h-9 rounded-full text-white/80 text-[13px] font-medium bg-white/10 border border-white/15"
//                           disabled
//                         >
//                           Owned
//                         </button>
//                       )}
//                     </div>
//                   </CardContent>
//                 </Card>
//               ))}
//             </div>

//             {/* Empty state */}
//             {filteredPrompts.length === 0 && (
//               <div className="text-center py-16">
//                 <p
//                   style={{ fontFamily: "Inter, sans-serif", fontWeight: 400, fontSize: "24px", lineHeight: "100%" }}
//                   className="text-white"
//                 >
//                   {`Showing 0 premium prompts in ${selectedCategory || "All"}`}
//                 </p>
//                 <p
//                   style={{ fontFamily: "Inter, sans-serif", fontWeight: 400, fontSize: "16px", lineHeight: "100%" }}
//                   className="mt-3 text-white/80"
//                 >
//                   No prompts found matching your criteria.
//                 </p>
//                 <button
//                   type="button"
//                   onClick={() => {
//                     setSearchQuery("");
//                     setSelectedCategory("All");
//                   }}
//                   className="mx-auto mt-6 text-white"
//                   style={{
//                     width: "160px",
//                     height: "50px",
//                     borderRadius: "10px",
//                     border: "1px solid #FFFFFF",
//                     background: "transparent",
//                   }}
//                 >
//                   Clear Filters
//                 </button>
//               </div>
//             )}
//           </>
//         )}
//       </div>

//       <div className="mt-20">
//         <Footer />
//       </div>

//       {/* Save dropdown modal anchored to cop.png */}
//       <ModalComponent
//         isOpen={saveModalOpen}
//         onClose={() => setSaveModalOpen(false)}
//         onSave={(payload) => {
//           console.log("🟢 [SAVE] Modal payload", payload);
//           toast({
//             title: payload?.quick ? "Saved to All Saved" : "Collection created",
//             description: payload?.quick
//               ? "Prompt saved quickly to All Saved."
//               : `Created collection: ${payload?.title || ""}`,
//           });
//         }}
//         anchorRef={{ current: saveAnchorEl } as unknown as React.RefObject<HTMLElement>}
//       />

//       <MediaEnlargeModal
//         isOpen={enlargeModalOpen}
//         onClose={() => setEnlargeModalOpen(false)}
//         mediaUrl={enlargeMedia?.url || ""}
//         mediaType={enlargeMedia?.type || "image"}
//         title={enlargeMedia?.title || ""}
//       />

//       <DetailsPrompt
//         open={detailsOpen}
//         onOpenChange={setDetailsOpen}
//         prompt={detailsPrompt}
//         owned={detailsPrompt ? purchasedPrompts.includes(String(detailsPrompt.id)) : false}
//         onPurchase={(p) => {
//           setDetailsOpen(false);
//           handlePurchase(p);
//         }}
//         showImages={showImages}
//         onEnlargeMedia={(m) => {
//           setEnlargeMedia({ url: m.url, type: m.type, title: m.title });
//           setEnlargeModalOpen(true);
//         }}
//       />
//     </div>
//   );
// };

// export default PromptMarketplacePage;




// src/pages/PromptMarketplacePage.tsx
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search, Star, Eye, Video, Sparkles, History,
  ChevronLeft, ChevronRight, GraduationCap, Palette, FileText,
  BadgeDollarSign, Users, Plane, FlaskConical, Code2, BarChart3,
  LifeBuoy, Briefcase, Image as ImageIcon, ArrowLeft,
  SlidersHorizontal, Check, X,
} from "lucide-react";
import { User } from "lucide-react";

import { toast } from "@/components/ui/use-toast";
import Header from "@/components/Header";
import MediaEnlargeModal from "@/components/MediaEnlargeModal";
import PromptHistory from "@/components/PromptHistory";
import AppNavigation from "@/components/AppNavigation";
import TokenUsageSection from "@/components/TokenUsageSection";
import { useUserTokenUsage } from "@/hooks/useUserTokenUsage";
import Footer from "@/components/Footer";
import DetailsPrompt from "@/components/DetailsPrompt";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import ModalComponent from "@/components/ModalComponent";
 import { ShoppingCart } from "lucide-react";
 import KycGateModal from "@/components/KycGateModal";
   import { useCart } from "@/contexts/CartContext";
type Prompt = {
  id: string;
  title: string;
  description: string;
  category: string;
  price?: number;
  rating?: number;
  downloads?: number;
  imageUrl?: string;
  videoUrl?: string;
  preview?: string;
  isFree?: boolean;
  createdAt?: string;
  fullPrompt?: string;
  exclusive?: boolean;
  sold?: boolean;

  uploaderName?: string;
  uploaderId?: string | null;
  uploaderAvatar?: string;
};

type FileType = "all" | "video" | "image" | "code";
type LicenseType = "all" | "free" | "premium" | "one-time";


const GRADIENT = "linear-gradient(270deg, #1A73E8 0%, #FF14EF 100%)";

const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, "");
const PROMPTS_BASE = `${API_BASE}/api/prompt`;
const PURCHASE_BASE = `${API_BASE}/api/purchase`;

// ⚠️ Keep your real Razorpay key id in env:
const RAZORPAY_KEY_ID = (import.meta as any).env?.VITE_RAZORPAY_KEY_ID || "rzp_test_aNNdd7yTcNuzYQ";

/* ---------- Categories rail data (UI only) ---------- */
const categoriesData = [
  { id: "All", icon: Sparkles },
  { id: "Marketing", icon: Sparkles },
  { id: "Content", icon: ImageIcon },
  { id: "Social Media", icon: Video },
  { id: "Business", icon: BadgeDollarSign },
  { id: "Creative", icon: Sparkles },
  { id: "Education", icon: GraduationCap },
  { id: "Finance", icon: BadgeDollarSign },
  { id: "Productivity", icon: Sparkles },
  { id: "Health", icon: Sparkles },
  { id: "Design", icon: Palette },
  { id: "Writing", icon: FileText },
  { id: "Sales", icon: BadgeDollarSign },
  { id: "HR", icon: Users },
  { id: "Travel", icon: Plane },
  { id: "Research", icon: FlaskConical },
  { id: "Code", icon: Code2 },
  { id: "Data", icon: BarChart3 },
  { id: "Support", icon: LifeBuoy },
  { id: "Enterprise", icon: Briefcase },
];

/* ---------- Categories scroller ---------- */
const CategoriesScroller: React.FC<{
  selectedCategory: string;
  setSelectedCategory: (c: string) => void;
}> = ({ selectedCategory, setSelectedCategory }) => {
  const railRef = useRef<HTMLDivElement>(null);
  const slide = (dir: "left" | "right") => {
    const rail = railRef.current;
    if (!rail) return;
    rail.scrollBy({ left: dir === "left" ? -260 : 260, behavior: "smooth" });
  };

  return (
    <div className="w-full flex items-center justify-center gap-3">
      <button
        onClick={() => slide("left")}
        className="shrink-0 rounded-full grid place-items-center text-white"
        style={{ background: GRADIENT, width: 50, height: 50, borderRadius: "200px" }}
        aria-label="Scroll categories left"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <div className="relative w-full max-w-[1200px] overflow-hidden">
        <div
          ref={railRef}
          className="flex items-center gap-3 overflow-x-auto scroll-smooth px-1 no-scrollbar"
        >
          {categoriesData.map(({ id, icon: Icon }) => {
            const isAll = id === "All";
            const isActive = selectedCategory === id;
            const pillWidth = isAll ? "109.525px" : "185.628px";
            const baseStyle: React.CSSProperties = isActive
              ? { width: pillWidth, background: GRADIENT, color: "#FFFFFF" }
              : { width: pillWidth, background: "#17171A", color: "rgba(255,255,255,0.85)" };

            return (
              <button
                key={id}
                onClick={() => setSelectedCategory(id)}
                aria-pressed={isActive}
                className={[
                  "flex items-center justify-center gap-[10px] h-[50px] rounded-[200px]",
                  "text-sm font-medium whitespace-nowrap transition-colors",
                  isActive ? "ring-1 ring-white/15" : "hover:bg-white/5",
                ].join(" ")}
                style={{ padding: "15px 30px", ...baseStyle }}
              >
                <Icon className="h-4 w-4" />
                <span>{id}</span>
              </button>
            );
          })}
        </div>
      </div>

      <button
        onClick={() => slide("right")}
        className="shrink-0 rounded-full grid place-items-center text-white"
        style={{ background: GRADIENT, width: 50, height: 50, borderRadius: "200px" }}
        aria-label="Scroll categories right"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
};

/* ---------- Small pill dropdown used below the search bar ---------- */
const PillDropdown = ({
  label,
  value,
  onChange,
  options,
  // optional: pass absolute positioning (e.g., { top: 687, left: 805 })
  positionStyle,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { label: string; value: string; icon?: React.ComponentType<any> }[];
  positionStyle?: React.CSSProperties;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative" style={positionStyle}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex items-center justify-between gap-2 px-3"
        style={{
          width: 150,         // <- width: 150px
          height: 50,         // <- height: 50px
          borderRadius: 6,    // <- border-radius: 6px
          backgroundColor: "#121213",
          border: "1px solid #282829",
          opacity: 1,         // <- opacity: 1
        }}
      >
        <span className="text-white/80 text-sm truncate">{label}</span>
        <svg width="18" height="18" viewBox="0 0 24 24" className="text-white/80 shrink-0">
          <path fill="currentColor" d="M7 10l5 5 5-5z" />
        </svg>
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute z-30 mt-2 p-2"
          style={{
            width: 150,            // match trigger width
            borderRadius: 6,       // match 6px radius
            backgroundColor: "#17171A",
            border: "1px solid #282829",
          }}
        >
          {options.map((opt) => {
            const Icon = opt.icon;
            const selected = opt.value === value;
            return (
              <button
                key={opt.value}
                role="option"
                aria-selected={selected}
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className={[
                  "w-full flex items-center gap-2 px-2 text-left rounded-[6px]",
                  selected ? "bg-white/10 text-white" : "text-white/85 hover:bg-white/5",
                ].join(" ")}
                style={{ height: 40 }}  // tidy row height
              >
                {Icon ? <Icon className="h-4 w-4" /> : null}
                <span className="text-sm truncate">{opt.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};


const PromptMarketplacePage = () => {
  const navigate = useNavigate();
  const { totalTokensUsed, tokenLimit } = useUserTokenUsage();
  const { token , user} = useAuth?.() || ({} as any);
  const { addToCart } = useCart();
  const currentUserId = user?._id || user?.id || null;
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
    const [kycOpen, setKycOpen] = useState(false);
const [pendingPurchasePrompt, setPendingPurchasePrompt] = useState<Prompt | null>(null);
const [retryPrompt, setRetryPrompt] = useState<Prompt | null>(null);
  // NEW: dropdown filters
  const [fileType, setFileType] = useState<FileType>("all");
  const [licenseType, setLicenseType] = useState<LicenseType>("all");

  const [playingVideo, setPlayingVideo] = useState<string | number | null>(null);

  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // IDs of prompts user already owns
  const [purchasedPrompts, setPurchasedPrompts] = useState<string[]>([]);

  const [enlargeModalOpen, setEnlargeModalOpen] = useState(false);
  const [enlargeMedia, setEnlargeMedia] = useState<{ url: string; type: "image" | "video"; title: string } | null>(null);

  const [showHistory, setShowHistory] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsPrompt, setDetailsPrompt] = useState<any>(null);
  // top-level state (near other state)
const [saveForPromptId, setSaveForPromptId] = useState<string | null>(null);
const [saveForPrompt, setSaveForPrompt] = useState<Prompt | null>(null);

  // Save modal (anchored to cop.png)
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [saveAnchorEl, setSaveAnchorEl] = useState<HTMLElement | null>(null);
   


const [categoriesModalOpen, setCategoriesModalOpen] = useState(false);
const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
const [draftCategories, setDraftCategories] = useState<string[]>([]);

const categoryOptions = categoriesData.filter((item) => item.id !== "All");

const openCategoriesModal = () => {
  setDraftCategories(
    selectedCategories.length
      ? selectedCategories
      : selectedCategory !== "All"
      ? [selectedCategory]
      : []
  );
  setCategoriesModalOpen(true);
};

const toggleDraftCategory = (categoryId: string) => {
  setDraftCategories((prev) =>
    prev.includes(categoryId)
      ? prev.filter((id) => id !== categoryId)
      : [...prev, categoryId]
  );
};

const applyCategorySelection = () => {
  setSelectedCategories(draftCategories);
  if (draftCategories.length) {
    setSelectedCategory("All");
  }
  setCategoriesModalOpen(false);
};

const clearCategorySelection = () => {
  setSelectedCategories([]);
  setDraftCategories([]);
  setSelectedCategory("All");
  setCategoriesModalOpen(false);
};

const effectiveCategoryFilter =
  selectedCategories.length > 0
    ? selectedCategories
    : selectedCategory !== "All"
    ? [selectedCategory]
    : [];






  // Razorpay script ready?
  const [rzpReady, setRzpReady] = useState(false);
   const [showSuccessPopup, setShowSuccessPopup] = useState(false);
const [buyerName, setBuyerName] = useState<string>(""); 

  /* ---------- Load Razorpay script once ---------- */
  useEffect(() => {
    if ((window as any).Razorpay) {
      setRzpReady(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => setRzpReady(true);
    script.onerror = () => setRzpReady(false);
    document.body.appendChild(script);
  }, []);

  /* ---------- [API #3] Load purchase history ---------- */
  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        const res = await fetch(`${PURCHASE_BASE}/history`, {
          headers: { Authorization: `Bearer ${token}` },
          credentials: "include",
        });
        const body = await res.json();
        if (!res.ok || !body?.success) return;
        const ownedIds = (body.purchases || [])
          .map((p: any) => {
            if (p?.prompt && typeof p.prompt === "object") return String(p.prompt._id);
            if (p?.prompt && typeof p.prompt === "string") return p.prompt;
            return null;
          })
          .filter(Boolean);
        setPurchasedPrompts((prev) => Array.from(new Set([...(prev || []), ...ownedIds])));
      } catch (e) {
        console.error("[History] fetch failed", e);
      }
    })();
  }, [token]);

  /* ---------- Fetch prompts ---------- */
  useEffect(() => {
    const fetchPrompts = async () => {
      try {
        setLoading(true);
        setLoadError(null);

        const params = new URLSearchParams();
        // backend hinting (safe even if server ignores)
        params.set("type", fileType); // all | video | image | code
        params.set("license", licenseType); // all | free | premium
        if (selectedCategory && selectedCategory !== "All") {
          params.set("category", selectedCategory);
        }

        const res = await fetch(`${PROMPTS_BASE}/others?${params.toString()}`, {
          headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
          credentials: "include",
        });
        const data = await res.json();

        if (!res.ok || !data?.success) {
          throw new Error(data?.error || "server_error");
        }

//     const mapped: Prompt[] = (data.prompts || []).map((doc: any) => {
//   const att = doc?.attachment || null;
//   const mediaPath = att?.path ? `${API_BASE}${att.path}` : undefined;

//   return {
//     id: String(doc._id),
//     title: doc.title || "Untitled",
//     description: doc.description || "",
//     category:
//       (doc.categories?.[0]?.name as string) ||
//       (Array.isArray(doc.categories) ? doc.categories.join(", ") : "") ||
//       "General",
//     price: typeof doc.price === "number" ? doc.price : 0,
//     rating: typeof doc.averageRating === "number" ? doc.averageRating : undefined,
//     downloads: doc.downloads || 0,
//     imageUrl: att?.type === "image" ? mediaPath : undefined,
//     videoUrl: att?.type === "video" ? mediaPath : undefined,
//     preview:
//       (doc.description && String(doc.description).slice(0, 140)) ||
//       (doc.promptText && String(doc.promptText).slice(0, 140)) ||
//       "",
//     isFree: !!doc.free,
//     createdAt: doc.createdAt,
//     exclusive: !!doc.exclusive,
//     sold: !!doc.sold, // ✅ Add this line (make sure backend sends `sold: true` when sold)

// uploaderName: doc?.userId?.name || "Unknown",
// uploaderAvatar: "/icons/default-user.png",  // always default (no avatar)



//   };
// });

const mapped: Prompt[] = (data.prompts || []).map((doc: any) => {
  const att = doc?.attachment || null;
  // const mediaPath = att?.path ? `${API_BASE}${att.path}` : undefined;
    const mediaPath = att?.path || undefined;
  return {
    id: String(doc._id),
    title: doc.title || "Untitled",
    description: doc.description || "",
    category:
      (doc.categories?.[0]?.name as string) ||
      (Array.isArray(doc.categories) ? doc.categories.join(", ") : "") ||
      "General",

    price: typeof doc.price === "number" ? doc.price : 0,
    rating: typeof doc.averageRating === "number" ? doc.averageRating : undefined,
    imageUrl: att?.type === "image" ? mediaPath : undefined,
    videoUrl: att?.type === "video" ? mediaPath : undefined,
    preview:
      (doc.description && String(doc.description).slice(0, 140)) ||
      (doc.promptText && String(doc.promptText).slice(0, 140)) ||
      "",

    isFree: !!doc.free,
    exclusive: !!doc.exclusive,
    sold: !!doc.sold,

    // ⭐⭐ THIS IS WHAT YOU ASKED FOR
    uploaderName: doc?.userId?.name || "Unknown",
    uploaderId: doc?.userId?._id || null,

    // avatar if needed
    uploaderAvatar: "/icons/default-user.png"
  };
});



        setPrompts(mapped);
      } catch (err: any) {
        console.error("Failed to load prompts", err);
        setLoadError(err?.message || "Failed to load prompts");
        toast({
          title: "Couldn’t load prompts",
          description: err?.message || "Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPrompts();
  }, [fileType, licenseType, selectedCategory, token]);

  /* ---------- Derived: local search + filter ---------- */
const filteredPrompts = prompts.filter((p) => {
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    if (
      !p.title.toLowerCase().includes(q) &&
      !(p.description || "").toLowerCase().includes(q)
    ) {
      return false;
    }
  }

  if (licenseType === "free" && !p.isFree) return false;
  if (licenseType === "premium" && !(p.price && p.price > 0)) return false;
  if (licenseType === "one-time" && !p.exclusive) return false;

  if (fileType === "video" && !p.videoUrl) return false;
  if (fileType === "image" && !p.imageUrl) return false;
  if (fileType === "code" && p.category.toLowerCase() !== "code") return false;

  if (effectiveCategoryFilter.length > 0) {
    const promptCategories = String(p.category || "")
      .split(",")
      .map((item) => item.trim());

    const hasCategoryMatch = effectiveCategoryFilter.some((cat) =>
      promptCategories.includes(cat)
    );

    if (!hasCategoryMatch) return false;
  }

  return true;
});

  /* ---------- Helpers ---------- */
  const decideMediaType = (prompt: Prompt): "video" | "image" => {
    if (fileType === "video") return "video";
    if (fileType === "image") return "image";
    // "all" or "code": prefer video if available, else image
    return prompt.videoUrl ? "video" : "image";
  };

  const handleVideoPlay = (promptId: string | number) => {
    setPlayingVideo((prev) => (prev === promptId ? null : promptId));
  };

  const handlePreview = (prompt: Prompt) => {
    if (purchasedPrompts.includes(prompt.id)) {
      toast({ title: "Full Prompt Access", description: `You have full access to "${prompt.title}"` });
    } else {
      toast({ title: "Preview Mode", description: `Showing preview for "${prompt.title}". Purchase to see full prompt.` });
    }
  };


  const isOwnPrompt = (prompt: Prompt) => {
  if (!currentUserId || !prompt?.uploaderId) return false;
  return String(prompt.uploaderId) === String(currentUserId);
};

  /** PURCHASE FLOW — integrates CREATE ORDER (+ verify) with detailed consoles */
 const handlePurchase = async (prompt: Prompt) => {
  if (isOwnPrompt(prompt)) {
    toast({
      title: "Not allowed",
      description: "You cannot buy your own prompt.",
      variant: "destructive",
    });
    return;
  }

  if (!token) {
    toast({
      title: "Please log in",
      description: "You must be logged in to purchase.",
      variant: "destructive",
    });
    return;
  }
    
    if (!rzpReady) {
      toast({ title: "Loading payment…", description: "Razorpay is still initializing." });
      return;
    }

    try {
      // [API #1] CREATE ORDER
      const res = await fetch(`${PURCHASE_BASE}/create-order/${prompt.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      });
      const data = await res.json();
      if (res.status === 403 && (data?.error === "KYC_REQUIRED" || data?.code === "KYC_REQUIRED")) {
  setPendingPurchasePrompt(prompt);
  setKycOpen(true);
  return;
}

     
        if (res.status === 403 && data?.error === "KYC_REQUIRED") {
    setRetryPrompt(prompt);
    setKycOpen(true);
    return;
  }


      if (!res.ok || !data?.success || !data?.order) {
        throw new Error(data?.error || "order_create_failed");
      }
 
      const order = data.order;

      // Razorpay Checkout
      const options: any = {
        key: RAZORPAY_KEY_ID,
        amount: Number(order.amount),
        currency: order.currency || "INR",
        name: "Tokun",
        description: `Purchase: ${prompt.title}`,
        order_id: order.id,
        notes: { promptId: prompt.id },
        theme: { color: "#1A73E8" },
        handler: async (response: any) => {
          try {
            // [API #2] VERIFY PAYMENT
            const vr = await fetch(`${PURCHASE_BASE}/verify/${prompt.id}`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              credentials: "include",
              body: JSON.stringify({
                razorpayPaymentId: response.razorpay_payment_id,
                razorpayOrderId: response.razorpay_order_id,
                razorpaySignature: response.razorpay_signature,
                pricePaid: order.amount / 100,
              }),
            });

            const vb = await vr.json();
          if (vb?.success) {
  const purchasedId = prompt.id;
  setPurchasedPrompts((prev) =>
    prev.includes(purchasedId) ? prev : [...prev, purchasedId]
  );

  try {
    window.dispatchEvent(
      new CustomEvent("tokun:purchased", { detail: vb.purchase })
    );
  } catch {}

  // ✅ Show popup
  setBuyerName(vb?.user?.name || "there");
  setShowSuccessPopup(true);

  toast({
    title: "Payment Successful",
    description: "You now own this prompt.",
  });
} else {
              toast({ title: "Verification Failed", description: vb?.error || "Unknown error", variant: "destructive" });
            }
          } catch (err) {
            console.error("Verify error", err);
            toast({ title: "Verification Error", description: "Could not verify payment.", variant: "destructive" });
          }
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on("payment.failed", function () {
        toast({ title: "Payment Failed", description: "Please try again.", variant: "destructive" });
      });
      rzp.open();
    } catch (err: any) {
      console.error("Purchase flow error", err);
      toast({ title: "Purchase Error", description: err?.message || "Something went wrong.", variant: "destructive" });
    }
  };

  if (showHistory) {
    return (
      <div className="min-h-screen bg-[#07080A] text-white">
        <div className="container mx-auto px-6 py-8">
          <Header />
            <Header />
          <div className="flex items-center gap-4 mb-8">
            <Button
              variant="ghost"
              onClick={() => setShowHistory(false)}
              className="flex items-center gap-2 hover:bg-white/10"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Marketplace
            </Button>
            <div className="h-6 w-px bg-white/10" />
          </div>

          {/* PromptHistory fetches [API #3] internally and also listens to tokun:purchased */}
          <PromptHistory />
        </div>
        <Footer />
      </div>
    );
  }

const ensureKycVerified = async (promptToBuy?: Prompt) => {
  if (!token) return false;

  try {
    // const res = await fetch(`${API_BASE}/api/kyc/status`, {
      const res = await  fetch(`http://localhost:5000/api/kyc/status` ,{
      headers: { Authorization: `Bearer ${token}` },
      credentials: "include",
    });
    const data = await res.json().catch(() => ({}));
    const s = data?.kycStatus || data?.status;

    if (s === "VERIFIED") return true;

    // open KYC UI
    if (promptToBuy) setPendingPurchasePrompt(promptToBuy);
    setKycOpen(true);
    return false;
  } catch {
    // if status api fails, still open UI (safer)
    if (promptToBuy) setPendingPurchasePrompt(promptToBuy);
    setKycOpen(true);
    return false;
  }
};



const savePromptToCollections = async ({
  refId,
  collectionTitle, // optional
  name,            // optional item label
}: {
  refId: string;
  collectionTitle?: string;
  name?: string;
}) => {
  if (!token) {
    toast({
      title: "Please log in",
      description: "You need to be logged in to save prompts.",
      variant: "destructive",
    });
    return { ok: false };
  }

  try {
    const res = await fetch(`${API_BASE}/api/saved-collections`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
      body: JSON.stringify({
        section: "prompt",      // 👈 you asked for Prompt model
        refId,                  // prompt._id
        // When collectionTitle is provided, backend saves inside that collection;
        // Otherwise it goes to directItems (All Saved).
        ...(collectionTitle ? { collectionTitle } : {}),
        ...(name ? { name } : {}),
      }),
    });

    const data = await res.json();
    if (!res.ok || !data?.success) {
      throw new Error(data?.error || "server_error");
    }
    return { ok: true, data };
  } catch (err: any) {
    toast({
      title: "Save failed",
      description: err?.message || "Could not save this prompt.",
      variant: "destructive",
    });
    return { ok: false };
  }
};



  return (
  <div
  className="dark min-h-screen bg-background text-foreground relative overflow-hidden"
  style={{
    backgroundImage: `url('/icons/mpbg.png')`,
    backgroundRepeat: "no-repeat",
    backgroundSize: "1600px auto",      // 👈 slightly contained, not full cover
    backgroundPosition: "center -180px", // 👈 pushes the wave higher (like your image)
    backgroundAttachment: "scroll",      // 👈 prevents it from locking during scroll
  }}
>


      {/* Header + token usage */}
     {/* 🔹 Full-width compact Header */}
<div className="w-full bg-transparent  px-4">
    <Header />
  <Header />
</div>



      {/* Main Content */}
      <div className="container mx-auto px-6 pb-16">
        {/* History Button */}
        {/* <div className="flex justify-between items-center mb-12">
          <Button
            variant="outline"
            onClick={() => setShowHistory(true)}
            className="flex items-center gap-2 hover:bg-tokun/10 hover:text-tokun hover:border-tokun/30"
          >
            <History className="h-4 w-4" />
            Purchase History
          </Button>
        </div> */}

        {/* Title + blurb */}
      {/* Section spacing below Header */}
{/* <div className="mt-10 flex flex-col items-center text-center mb-12">
  
  <h1
    style={{
      fontFamily: "Inter",
      fontWeight: 700,
      fontStyle: "normal",
      fontSize: "64px",
      lineHeight: "74px",
      textAlign: "center",
      color: "#FFFFFF",
      marginBottom: "0px",
    }}
  >
    Prompt
  </h1>

  
  <h2
    style={{
      fontFamily: "Inter",
      fontWeight: 700,
      fontStyle: "normal",
      fontSize: "64px",
      lineHeight: "74px",
      textAlign: "center",
      color: "#FFFFFF",
      marginTop: "0px",
    }}
  >
    Marketplace
  </h2>

 
  <p
    style={{
      fontFamily: "Inter",
      fontWeight: 400,
      fontStyle: "normal",
      fontSize: "16px",
      lineHeight: "140%",
      textAlign: "center",
      color: "rgba(255,255,255,0.8)",
      marginTop: "18px",
      maxWidth: "680px", // wider for natural 2-line wrap
    }}
  >
    Discover and purchase premium AI prompts created by experts from around the world. 
    Transform your ideas into reality with our curated collections.
  </p>
</div> */}

          <div className="mt-20 sm:mt-20 md:mt-28 flex flex-col items-center text-center mb-12 px-4">
  {/* Prompt */}
  <h1 className="text-white font-bold leading-tight 
    text-[36px] sm:text-[48px] md:text-[64px]">
    Prompt
  </h1>

  {/* Marketplace */}
  <h2 className="text-white font-bold leading-tight 
    text-[36px] sm:text-[48px] md:text-[64px]">
    Marketplace
  </h2>

  {/* Description */}
  <p className="text-white/80 mt-4 max-w-[680px] text-sm sm:text-base leading-relaxed">
    Discover and purchase premium AI prompts created by experts from around the world.
    Transform your ideas into reality with our curated collections.
  </p>
</div>


        {/* Navigation + Search/Filters */}
        <div className="mt-4 flex justify-center">
  <AppNavigation activeSection="prompt-marketplace" />
</div>
        <div className="mt-6"></div>


        {/* Search + NEW FILTER BAR */}
        <div className="space-y-6 mb-12">
          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
            {/* Search pill */}
            <div
              className="flex items-center w-full sm:w-[700px] h-[50px] rounded-[200px] overflow-hidden"
              style={{ backgroundColor: "#121213", border: "1px solid #282829" }}
            >
              <Search className="h-5 w-5 text-white/40 ml-4" />
              <input
                placeholder="Search premium prompts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="ml-3 flex-1 bg-transparent outline-none text-white placeholder:text-white/40 text-sm md:text-base"
              />
              <button
                onClick={() => {/* client-side filter only */}}
                className="text-white font-medium"
                style={{
                  width: "100px",
                  height: "40px",
                  borderRadius: "200px",
                  background: "linear-gradient(90deg, #FF14EF 0%, #1A73E8 100%)",
                  marginRight: "5px",
                }}
              >
                Search
              </button>
            </div>
          </div>

          {/* NEW: File type + License type pills (like your screenshots) */}
          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
            <PillDropdown
              label={
                fileType === "all"
                  ? "File type"
                  : fileType === "video"
                  ? "Video"
                  : fileType === "image"
                  ? "Image"
                  : "Code"
              }
              value={fileType}
              onChange={(v) => setFileType(v as FileType)}
              options={[
                { label: "All type", value: "all" },
                { label: "Video", value: "video", icon: Video },
                { label: "Image", value: "image", icon: ImageIcon },
                { label: "Code", value: "code", icon: Code2 },
              ]}
            />

          <PillDropdown
  label={
    licenseType === "all"
      ? "License type"
      : licenseType === "free"
      ? "Free"
      : licenseType === "premium"
      ? "Premium"
      : "One-time Purchase"
  }
  value={licenseType}
  onChange={(v) => setLicenseType(v as LicenseType)}
  options={[
    { label: "All type", value: "all" },
    { label: "Free", value: "free" },
    { label: "Premium", value: "premium" },
    { label: "One-time Purchase", value: "one-time" }, // ✅ added
  ]}
/>

          </div>

          {/* <CategoriesScroller selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory} /> */}



          <div className="space-y-4">
  <div className="flex flex-wrap items-center justify-center gap-3">
    <button
      type="button"
      onClick={openCategoriesModal}
      className="flex items-center gap-2 px-4 h-[46px] rounded-full text-white border border-white/10 bg-[#17171A] hover:bg-white/5 transition-colors"
    >
      <SlidersHorizontal className="h-4 w-4" />
      <span className="text-sm font-medium">
        Select Categories
        {selectedCategories.length > 0 ? ` (${selectedCategories.length})` : ""}
      </span>
    </button>

    {selectedCategories.length > 0 && (
      <button
        type="button"
        onClick={clearCategorySelection}
        className="px-4 h-[46px] rounded-full text-white/80 border border-white/10 bg-[#121213] hover:bg-white/5 transition-colors text-sm"
      >
        Clear Selection
      </button>
    )}
  </div>

  {selectedCategories.length > 0 && (
    <div className="flex flex-wrap items-center justify-center gap-2">
      {selectedCategories.map((category) => (
        <span
          key={category}
          className="px-3 py-1.5 rounded-full text-xs text-white border border-white/10 bg-white/5"
        >
          {category}
        </span>
      ))}
    </div>
  )}

  <CategoriesScroller
    selectedCategory={selectedCategory}
    setSelectedCategory={(category) => {
      setSelectedCategories([]);
      setSelectedCategory(category);
    }}
  />
</div>
        </div>

        {/* Loading / error states */}
        {loading && <p className="text-white/70 text-sm">Loading prompts…</p>}
        {!!loadError && !loading && <p className="text-red-400 text-sm">{loadError}</p>}

        {/* Prompts Grid */}
        {!loading && !loadError && (
          <>
            <div className="
  grid 
  grid-cols-1 
  md:grid-cols-2 
  lg:grid-cols-3 
  xl:grid-cols-4 
  gap-8 
  justify-items-center
">
              {filteredPrompts.map((prompt) => {
                const mediaKind = decideMediaType(prompt); // "video" | "image"
                return (
                  <Card
                    key={prompt.id}
                    onClick={() => {
                      setDetailsPrompt(prompt);
                      setDetailsOpen(true);
                    }}
                    className="w-full max-w-[306px] overflow-hidden cursor-pointer hover:scale-[1.01] transition-transform"
style={{ height: 520, background: "#1C1C1C", borderRadius: 30 }}
                  >
                    <CardContent className="p-4 h-full flex flex-col">
                      {/* MEDIA */}
                      <div
                        className="relative w-full overflow-hidden group"
                        style={{ height: 240, borderRadius: 20, backgroundColor: "#0B0B0B" }}
                      >
                        {mediaKind === "image" ? (
                          <img src={prompt.imageUrl} alt={prompt.title} className="w-full h-full object-cover" />
                        ) : (
                          <>
                            <video
                              className="w-full h-full object-cover"
                              src={prompt.videoUrl}
                              loop
                              muted
                              playsInline
                              ref={(el) => {
                                if (!el) return;
                                if (playingVideo === prompt.id) el.play().catch(() => {});
                                else el.pause();
                              }}
                            />
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleVideoPlay(prompt.id);
                              }}
                              className="absolute inset-0 flex items-center justify-center"
                              aria-label={playingVideo === prompt.id ? "Pause" : "Play"}
                            >
                              <span className="w-12 h-12 rounded-full bg-black/60 hover:bg-black/75 grid place-items-center text-white transition-colors">
                                {playingVideo === prompt.id ? (
                                  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                                    <rect x="6" y="5" width="4" height="14" rx="1" />
                                    <rect x="14" y="5" width="4" height="14" rx="1" />
                                  </svg>
                                ) : (
                                  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M8 5v14l11-7-11-7z" />
                                  </svg>
                                )}
                              </span>
                            </button>
                            <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">0:20</div>
                          </>
                        )}


                        




                        {/* Category pill */}
                        <div
                          className="absolute top-3 left-3 px-3 py-1 text-[11px] font-semibold text-white rounded-full"
                          style={{ background: GRADIENT }}
                        >
                          {prompt.category?.toUpperCase()}
                        </div>

                        {/* Purchase to unlock */}
                      {!purchasedPrompts.includes(prompt.id) && (
  <div
    className="absolute top-11 left-3 mt-2 px-3 py-1 text-[11px] font-semibold rounded-full"
    style={{
      background: prompt.exclusive ? "#2A2A2A" : GRADIENT,
      color: prompt.exclusive ? "#4ADE80" : "#FFFFFF", // green font for one-time sale
    }}
  >
    {prompt.exclusive ? "ONE-TIME PURCHASE" : "PURCHASE TO UNLOCK"}
  </div>
)}


                        {/* Rating pill */}
                      {/* Rating / Premium Icon pill */}
<div className="absolute top-3 right-3">
  {!prompt.isFree && prompt.price && prompt.price > 0 ? (
    <div
      className="flex items-center justify-center rounded-full"
      style={{
        width: 32,
        height: 32,
        backgroundColor: "black",
      }}
    >
      <img
        src="/icons/premium.png"
        alt="Premium"
        className={`w-5 h-5 object-contain ${
          prompt.exclusive ? "filter-green" : ""
        }`}
      />
    </div>
  ) : null}
</div>

     {/* Uploader Row */}




                      </div>

       
                   <div className="flex items-center gap-2 mt-3">

  {/* Default avatar icon */}
  <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center">
    <User className="w-4 h-4 text-white/70" />
  </div>

  {/* <span className="text-white/80 text-sm">
    {prompt.uploaderName || "Unknown"}
  </span> */}

  <span
  className="text-white/80 text-sm hover:underline cursor-pointer"
  onClick={(e) => {
    e.stopPropagation();
    navigate(`/profile/${prompt.uploaderId}`);
  }}
>
  {prompt.uploaderName || "Unknown"}
</span>


  <div className="flex items-center ml-auto text-white/80 text-sm gap-1">
    <Star className="w-4 h-4 text-yellow-400" />
    <span>{prompt.rating?.toFixed(1) || "0.0"}</span>
  </div>
</div>


                      

                      {/* TEXT */}
                      <div className="mt-4">
                       
                        <h3 className="mt-1 text-[18px] leading-snug font-semibold text-white line-clamp-2">
                          {prompt.title}
                        </h3>
                        <p className="mt-2 text-[13px] leading-relaxed text-white/70 line-clamp-2">
                          {prompt.description}
                        </p>
                      </div>

                      {/* FOOTER */}
                       {/* FOOTER */}
{/* FOOTER */}
<div className="mt-auto pt-4 flex items-center gap-[10px]">
  {prompt.isFree ? (
    // FREE pill
    <div
      className="flex items-center justify-center text-sm font-medium"
      style={{
        width: "89.814px",
        height: "40px",
        borderRadius: "8px",
        background: "#333335",
        color: "#FFFFFF",
      }}
    >
      FREE
    </div>
  ) : (
    <>
      {/* Price pill */}
      <div
        className="flex items-center justify-center text-sm font-medium text-white/90"
        style={{
          width: "89.814px",
          height: "40px",
          borderRadius: "8px",
          background: "#333335",
        }}
      >
        ₹{(prompt.price ?? 0).toFixed(2)}
      </div>

      {/* Cart pill */}
    {!isOwnPrompt(prompt) && (
  <button
    type="button"
    onClick={(e) => {
      e.stopPropagation();
      addToCart(prompt.id);
      toast({
        title: "Added to Cart",
        description: `"${prompt.title}" was added.`,
      });
    }}
    className="flex items-center justify-center gap-2 text-sm font-medium text-white/90"
    style={{
      width: "89.814px",
      height: "40px",
      borderRadius: "8px",
      background: "#333335",
    }}
  >
    <ShoppingCart className="h-4 w-4" />
    Cart
  </button>
)}

      {/* ✅ Buy Now button is hidden if one-time and already sold */}
   {!isOwnPrompt(prompt) && !(prompt.exclusive && prompt.sold) && (
  <button
    onClick={(e) => {
      e.stopPropagation();
      handlePurchase(prompt);
    }}
    className="text-sm font-medium text-white"
    style={{
      width: "89.814px",
      height: "40px",
      borderRadius: "8px",
      background: "linear-gradient(270deg,#FF14EF 0%, #1A73E8 100%)",
    }}
  >
    Buy Now
  </button>
)}
    </>
  )}
</div>


                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Empty state */}
            {filteredPrompts.length === 0 && (
              <div className="text-center py-16">
                <p
                  style={{ fontFamily: "Inter, sans-serif", fontWeight: 400, fontSize: "24px", lineHeight: "100%" }}
                  className="text-white"
                >
                  {`Showing 0 premium prompts in ${selectedCategory || "All"}`}
                </p>
                <p
                  style={{ fontFamily: "Inter, sans-serif", fontWeight: 400, fontSize: "16px", lineHeight: "100%" }}
                  className="mt-3 text-white/80"
                >
                  No prompts found matching your criteria.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("All");
                    setFileType("all");
                    setLicenseType("all");
                  }}
                  className="mx-auto mt-6 text-white"
                  style={{
                    width: "160px",
                    height: "50px",
                    borderRadius: "10px",
                    border: "1px solid #FFFFFF",
                    background: "transparent",
                  }}
                >
                  Clear Filters
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <div className="mt-20">
        <Footer />
      </div>

      {/* Save dropdown modal anchored to cop.png */}
      {/* <ModalComponent
        isOpen={saveModalOpen}
        onClose={() => setSaveModalOpen(false)}
        onSave={(payload) => {
          toast({
            title: payload?.quick ? "Saved to All Saved" : "Collection created",
            description: payload?.quick
              ? "Prompt saved quickly to All Saved."
              : `Created collection: ${payload?.title || ""}`,
          });
        }}
        anchorRef={{ current: saveAnchorEl } as unknown as React.RefObject<HTMLElement>}
      /> */}



      <ModalComponent
  isOpen={saveModalOpen}
  onClose={() => setSaveModalOpen(false)}
  onSave={async (payload) => {
  if (!saveForPromptId) { /* toast ... */ return; }

  if (payload?.quick) {
    await savePromptToCollections({ refId: saveForPromptId, name: saveForPrompt?.title });
    toast({ title: "Saved", description: "Prompt saved to All Saved." });
  } else if (payload?.title) {
    await savePromptToCollections({
      refId: saveForPromptId,
      collectionTitle: payload.title,
      name: saveForPrompt?.title, // 👈 label = original title
    });
    toast({ title: "Collection created", description: `Saved to "${payload.title}".` });
  } else {
    await savePromptToCollections({ refId: saveForPromptId, name: saveForPrompt?.title });
    toast({ title: "Saved", description: "Prompt saved to All Saved." });
  }
  setSaveForPromptId(null);
  setSaveForPrompt(null);
}}

  anchorRef={{ current: saveAnchorEl } as unknown as React.RefObject<HTMLElement>}
/>


      <MediaEnlargeModal
        isOpen={enlargeModalOpen}
        onClose={() => setEnlargeModalOpen(false)}
        mediaUrl={enlargeMedia?.url || ""}
        mediaType={enlargeMedia?.type || "image"}
        title={enlargeMedia?.title || ""}
      />

      <DetailsPrompt
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        prompt={detailsPrompt}
        owned={detailsPrompt ? purchasedPrompts.includes(String(detailsPrompt.id)) : false}
        onPurchase={(p) => {
          setDetailsOpen(false);
          handlePurchase(p);
        }}
        // showImages removed; DetailsPrompt can infer using prompt.videoUrl / prompt.imageUrl
        onEnlargeMedia={(m) => {
          setEnlargeMedia({ url: m.url, type: m.type, title: m.title });
          setEnlargeModalOpen(true);
        }}
      />

      {/* ✅ Purchase Success Popup */}
{/* ✅ Purchase Success Popup */}
{showSuccessPopup && (
  <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70 backdrop-blur-sm">
    <div
      className="bg-[#1C1C1C] text-white rounded-2xl shadow-2xl px-8 py-10 w-[420px] text-center animate-fadeIn relative"
      style={{ border: "1px solid rgba(255,255,255,0.1)" }}
    >
      {/* Close button */}
      <button
        onClick={() => setShowSuccessPopup(false)}
        className="absolute top-4 right-4 text-white/60 hover:text-white"
        aria-label="Close"
      >
        ✕
      </button>

      {/* ✅ Success icon */}
      <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-emerald-600 flex items-center justify-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-10 w-10 text-white"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>

      <h2 className="text-xl font-semibold mb-2">🎉 Thank you, {buyerName}!</h2>
      <p className="text-white/80 mb-8">
        You’ve successfully purchased this prompt!
      </p>

      <div className="flex items-center justify-center gap-4">
        {/* ✅ Go to Purchases */}
        <button
          onClick={() => {
            setShowSuccessPopup(false);
            navigate("/purchases");  // 👈 goes to purchased prompts page
          }}
          className="w-40 h-11 rounded-lg text-sm font-medium bg-white/10 hover:bg-white/20 transition"
        >
          Go to My Purchases
        </button>

        {/* ✅ Back to Marketplace */}
        <button
          onClick={() => {
            setShowSuccessPopup(false);
            navigate("/prompt-marketplace");  // 👈 goes to marketplace
          }}
          className="w-40 h-11 rounded-lg text-sm font-medium text-white"
          style={{
            background: "linear-gradient(90deg, #FF14EF 0%, #1A73E8 100%)",
          }}
        >
          Prompt Marketplace
        </button>
      </div>
    </div>
  </div>
)}


{token && (
 <KycGateModal
  open={kycOpen}
  onClose={() => setKycOpen(false)}
  token={token}
   apiBase={API_BASE}
  //  apiBase="http://localhost:5000"
  defaultCountry="IN"
  requiredForLabel="buying and uploading prompts"
  onVerified={() => {
    if (pendingPurchasePrompt) {
      const p = pendingPurchasePrompt;
      setPendingPurchasePrompt(null);
      handlePurchase(p);
    }
  }}
/>
)}


{categoriesModalOpen && (
  <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
    <div
      className="w-full max-w-[620px] rounded-[28px] border border-white/10 bg-[#17171A] p-5 sm:p-6 text-white"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-xl font-semibold">Select Categories</h3>
          <p className="mt-1 text-sm text-white/60">
            Ek hi baar me multiple categories choose kar sakte ho.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setCategoriesModalOpen(false)}
          className="w-10 h-10 rounded-full grid place-items-center bg-white/5 hover:bg-white/10"
          aria-label="Close categories modal"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[320px] overflow-y-auto pr-1">
        {categoryOptions.map(({ id, icon: Icon }) => {
          const active = draftCategories.includes(id);

          return (
            <button
              key={id}
              type="button"
              onClick={() => toggleDraftCategory(id)}
              className={`w-full flex items-center justify-between rounded-2xl px-4 py-3 border transition-colors ${
                active
                  ? "bg-white/10 border-white/20"
                  : "bg-[#121213] border-white/5 hover:bg-white/5"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className="h-4 w-4" />
                <span className="text-sm font-medium">{id}</span>
              </div>

              <span
                className={`w-5 h-5 rounded-full grid place-items-center border ${
                  active
                    ? "bg-white text-black border-white"
                    : "border-white/20 text-transparent"
                }`}
              >
                <Check className="h-3.5 w-3.5" />
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-6 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3">
        <button
          type="button"
          onClick={clearCategorySelection}
          className="h-[46px] px-4 rounded-full border border-white/10 bg-[#121213] text-white/80 hover:bg-white/5"
        >
          Clear All
        </button>

        <button
          type="button"
          onClick={() => setCategoriesModalOpen(false)}
          className="h-[46px] px-4 rounded-full border border-white/10 bg-[#121213] text-white hover:bg-white/5"
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={applyCategorySelection}
          className="h-[46px] px-5 rounded-full text-white font-medium"
          style={{ background: "linear-gradient(270deg, #1A73E8 0%, #FF14EF 100%)" }}
        >
          Apply Categories
        </button>
      </div>
    </div>
  </div>
)}




    </div>
  );
};

export default PromptMarketplacePage;
