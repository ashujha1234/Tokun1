// // // import { useState , useRef} from "react";
// // // import { useNavigate } from "react-router-dom";
// // // import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// // // import { Button } from "@/components/ui/button";
// // // import { Input } from "@/components/ui/input";
// // // import { Badge } from "@/components/ui/badge";
// // // import { Switch } from "@/components/ui/switch";
// // // import { Label } from "@/components/ui/label";
// // // import {
// // //   Search, Star, Download, DollarSign, Eye, Play, Pause, Lock, ArrowLeft,
// // //   Image as ImageIcon, Video, Sparkles, ShoppingBag, Expand, History,
// // //   Calculator, TrendingUp, ChevronLeft, ChevronRight,
// // //   GraduationCap, Palette, FileText, BadgeDollarSign, Users,
// // //   Plane, FlaskConical, Code2, BarChart3, LifeBuoy, Rocket, HeartPulse, Briefcase
// // // } from "lucide-react";

// // // import { toast } from "@/components/ui/use-toast";
// // // import Header from "@/components/Header";
// // // import PurchaseDialog from "@/components/PurchaseDialog";
// // // import MediaEnlargeModal from "@/components/MediaEnlargeModal";
// // // import SellPromptModal from "@/components/SellPromptModal";
// // // import PromptHistory from "@/components/PromptHistory";
// // // import AppNavigation from "@/components/AppNavigation";
// // // import TokenUsageSection from "@/components/TokenUsageSection";
// // // import { useUserTokenUsage } from "@/hooks/useUserTokenUsage";
// // // import Footer from "@/components/Footer";
// // // import DetailsPrompt from "@/components/DetailsPrompt";

// // // const PromptMarketplacePage = () => {
// // //   const navigate = useNavigate();
// // //   const [searchQuery, setSearchQuery] = useState("");
// // //   const [selectedCategory, setSelectedCategory] = useState("All");
// // //   const [showImages, setShowImages] = useState(false);
// // //   const [purchaseDialogOpen, setPurchaseDialogOpen] = useState(false);
// // //   const [selectedPrompt, setSelectedPrompt] = useState<any>(null);
// // //   const [purchasedPrompts, setPurchasedPrompts] = useState<number[]>([]);
// // //   const [playingVideo, setPlayingVideo] = useState<number | null>(null);
// // //   const [enlargeModalOpen, setEnlargeModalOpen] = useState(false);
// // //   const [enlargeMedia, setEnlargeMedia] = useState<{ url: string; type: 'image' | 'video'; title: string } | null>(null);
// // //   const [showHistory, setShowHistory] = useState(false);
// // //    const { totalTokensUsed, tokenLimit } = useUserTokenUsage(); 
// // //    const [detailsOpen, setDetailsOpen] = useState(false);
// // // const [detailsPrompt, setDetailsPrompt] = useState<any>(null);


// // //       // ====================== TOP-LEVEL HELPERS (NOT INSIDE A FUNCTION) ======================
// // // const GRADIENT = "linear-gradient(270deg, #1A73E8 0%, #FF14EF 100%)";

// // // const categoriesData = [
// // //   { id: "All", icon: Sparkles },
// // //   { id: "Marketing", icon: TrendingUp },
// // //   { id: "Content", icon: ImageIcon },
// // //   { id: "Social Media", icon: Video },
// // //   { id: "Business", icon: DollarSign },
// // //   { id: "Creative", icon: Sparkles },
// // //   { id: "Education", icon: GraduationCap },
// // //   { id: "Finance", icon: Calculator },
// // //   { id: "Productivity", icon: Rocket },
// // //   { id: "Health", icon: HeartPulse },
// // //   { id: "Design", icon: Palette },
// // //   { id: "Writing", icon: FileText },
// // //   { id: "Sales", icon: BadgeDollarSign },
// // //   { id: "HR", icon: Users },
// // //   { id: "Travel", icon: Plane },
// // //   { id: "Research", icon: FlaskConical },
// // //   { id: "Code", icon: Code2 },
// // //   { id: "Data", icon: BarChart3 },
// // //   { id: "Support", icon: LifeBuoy },
// // //   { id: "Enterprise", icon: Briefcase },
// // // ];

// // // // Arrow-function version (const) at TOP LEVEL
// // // const CategoriesScroller: React.FC<{
// // //   selectedCategory: string;
// // //   setSelectedCategory: (c: string) => void;
// // // }> = ({ selectedCategory, setSelectedCategory }) => {
// // //   const railRef = useRef<HTMLDivElement>(null);

// // //   const slide = (dir: "left" | "right") => {
// // //     const rail = railRef.current;
// // //     if (!rail) return;
// // //     rail.scrollBy({ left: dir === "left" ? -260 : 260, behavior: "smooth" });
// // //   };

  

// // //    return (
// // //     <div className="w-full flex items-center justify-center gap-3">
// // //       {/* Left arrow */}
// // //       <button
// // //         onClick={() => slide("left")}
// // //         className="shrink-0 rounded-full grid place-items-center text-white"
// // //         style={{
// // //           background: GRADIENT,
// // //           width: 50,
// // //           height: 50,
// // //           borderRadius: "200px",
// // //         }}
// // //         aria-label="Scroll categories left"
// // //       >
// // //         <ChevronLeft className="w-5 h-5" />
// // //       </button>

// // //       {/* Scrollable category rail */}
// // //       <div className="relative w-full max-w-[1200px] overflow-hidden">
// // //         <div
// // //           ref={railRef}
// // //           className="flex items-center gap-3 overflow-x-auto scroll-smooth px-1 no-scrollbar"
// // //         >
// // //           {categoriesData.map(({ id, icon: Icon }) => {
// // //   const isAll = id === "All";
// // //   const isActive = selectedCategory === id;
// // //   const pillWidth = isAll ? "109.525px" : "185.628px";

// // //   // Active = gradient; Inactive = #17171A
// // //   const baseStyle: React.CSSProperties = isActive
// // //     ? {
// // //         width: pillWidth,
// // //         background: GRADIENT,
// // //         color: "#FFFFFF",
// // //       }
// // //     : {
// // //         width: pillWidth,
// // //         background: "#17171A",
// // //         color: "rgba(255,255,255,0.85)",
// // //       };

// // //   return (
// // //     <button
// // //       key={id}
// // //       onClick={() => setSelectedCategory(id)}
// // //       aria-pressed={isActive}
// // //       className={[
// // //         "flex items-center justify-center gap-[10px] h-[50px] rounded-[200px]",
// // //         "text-sm font-medium whitespace-nowrap transition-colors",
// // //         isActive ? "ring-1 ring-white/15" : "hover:bg-white/5"
// // //       ].join(" ")}
// // //       style={{ padding: "15px 30px", ...baseStyle }}
// // //     >
// // //       <Icon className="h-4 w-4" />
// // //       <span>{id}</span>
// // //     </button>
// // //   );
// // // })}

// // //         </div>
// // //       </div>

// // //       {/* Right arrow */}
// // //       <button
// // //         onClick={() => slide("right")}
// // //         className="shrink-0 rounded-full grid place-items-center text-white"
// // //         style={{
// // //           background: GRADIENT,
// // //           width: 50,
// // //           height: 50,
// // //           borderRadius: "200px",
// // //         }}
// // //         aria-label="Scroll categories right"
// // //       >
// // //         <ChevronRight className="w-5 h-5" />
// // //       </button>
// // //     </div>
// // //   );
// // // };






























// // //   const marketplacePrompts = [
// // //     {
// // //       id: 1,
// // //       title: "E-commerce Product Description Generator",
// // //       description: "Generate compelling product descriptions that convert visitors into customers",
// // //       price: 4.99,
// // //       rating: 4.8,
// // //       downloads: 1234,
// // //       category: "Marketing",
// // //       videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
// // //       imageUrl: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=400&fit=crop",
// // //       preview: "Create an engaging product description for [product name]...",
// // //       fullPrompt: "Create an engaging product description for [product name] that highlights key features and benefits..."
// // //     },
// // //     {
// // //       id: 2,
// // //       title: "Social Media Content Planner",
// // //       description: "Plan and create engaging social media posts across all platforms",
// // //       price: 7.99,
// // //       rating: 4.9,
// // //       downloads: 856,
// // //       category: "Social Media",
// // //       videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
// // //       imageUrl: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400&h=400&fit=crop",
// // //       preview: "Generate a week's worth of social media posts...",
// // //       fullPrompt: "Generate a week's worth of social media posts for [brand/business]..."
// // //     },
// // //     {
// // //       id: 3,
// // //       title: "Blog Article Outline Creator",
// // //       description: "Create comprehensive blog article outlines with SEO optimization",
// // //       price: 3.99,
// // //       rating: 4.7,
// // //       downloads: 2341,
// // //       category: "Content",
// // //       videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
// // //       imageUrl: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=400&h=400&fit=crop",
// // //       preview: "Create a detailed blog outline for '[topic]'...",
// // //       fullPrompt: "Create a detailed blog outline for '[topic]' targeting '[audience]'..."
// // //     },
// // //     {
// // //       id: 21,
// // //       title: "Investment Portfolio Analyzer",
// // //       description: "Analyze and optimize investment portfolios for maximum returns",
// // //       price: 12.99,
// // //       rating: 4.9,
// // //       downloads: 567,
// // //       category: "Finance",
// // //       videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
// // //       imageUrl: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=400&fit=crop",
// // //       preview: "Analyze my investment portfolio with [holdings]...",
// // //       fullPrompt: "Analyze my investment portfolio with [holdings] and current allocation. Provide detailed risk assessment, diversification recommendations, rebalancing strategies, and projected returns based on historical data and market conditions."
// // //     },
// // //     {
// // //       id: 22,
// // //       title: "Personal Finance Planner",
// // //       description: "Create comprehensive personal financial plans and budgets",
// // //       price: 8.99,
// // //       rating: 4.7,
// // //       downloads: 892,
// // //       category: "Finance",
// // //       videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
// // //       imageUrl: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=400&fit=crop",
// // //       preview: "Create a personal financial plan for [income level]...",
// // //       fullPrompt: "Create a comprehensive personal financial plan for [income level] with goals of [financial goals]. Include budget breakdown, savings strategies, debt management, investment recommendations, and timeline to achieve financial objectives."
// // //     },
// // //     {
// // //       id: 23,
// // //       title: "Tax Optimization Strategies",
// // //       description: "Develop tax-efficient strategies for individuals and businesses",
// // //       price: 15.99,
// // //       rating: 4.8,
// // //       downloads: 423,
// // //       category: "Finance",
// // //       videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
// // //       imageUrl: "https://images.unsplash.com/photo-1554224154-22dec7ec8818?w=400&h=400&fit=crop",
// // //       preview: "Develop tax optimization strategies for [situation type]...",
// // //       fullPrompt: "Develop comprehensive tax optimization strategies for [situation type] considering [income sources] and [deductions available]. Include legal tax minimization techniques, timing strategies, retirement planning impacts, and compliance requirements."
// // //     },
// // //     {
// // //       id: 24,
// // //       title: "Cryptocurrency Trading Guide",
// // //       description: "Expert guidance for cryptocurrency trading and investment",
// // //       price: 18.99,
// // //       rating: 4.6,
// // //       downloads: 678,
// // //       category: "Finance",
// // //       videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
// // //       imageUrl: "https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=400&h=400&fit=crop",
// // //       preview: "Create a cryptocurrency trading strategy for [risk level]...",
// // //       fullPrompt: "Create a comprehensive cryptocurrency trading strategy for [risk level] investor with [capital amount]. Include technical analysis techniques, risk management, portfolio allocation, market timing strategies, and regulatory considerations."
// // //     },
// // //     {
// // //       id: 25,
// // //       title: "Real Estate Investment Analyzer",
// // //       description: "Analyze real estate investment opportunities and returns",
// // //       price: 11.99,
// // //       rating: 4.5,
// // //       downloads: 334,
// // //       category: "Finance",
// // //       videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
// // //       imageUrl: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=400&fit=crop",
// // //       preview: "Analyze this real estate investment opportunity...",
// // //       fullPrompt: "Analyze this real estate investment opportunity with [property details] and [market conditions]. Include cash flow analysis, ROI calculations, market comparisons, risk assessment, and long-term appreciation potential."
// // //     },
// // //     {
// // //       id: 26,
// // //       title: "Retirement Planning Calculator",
// // //       description: "Plan and optimize retirement savings and income strategies",
// // //       price: 9.99,
// // //       rating: 4.8,
// // //       downloads: 756,
// // //       category: "Finance",
// // //       videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
// // //       imageUrl: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=400&h=400&fit=crop",
// // //       preview: "Create a retirement plan for [age] looking to retire at [target age]...",
// // //       fullPrompt: "Create a comprehensive retirement plan for [age] year old looking to retire at [target age]. Include savings targets, investment strategies, Social Security optimization, healthcare costs, and income replacement strategies."
// // //     }
// // //   ];
// // //      const mockImages = ["/icons/pm1.png", "/icons/pm2.png", "/icons/pm3.png", "/icons/pm4.png"];

// // // const promptsWithImages = marketplacePrompts.map((p, i) => ({
// // //   ...p,
// // //   imageUrl: mockImages[i % mockImages.length], // cycle pm1..pm4
// // // }));



// // // const withImages = <T extends { imageUrl?: string }>(arr: T[]) =>
// // //   arr.map((p, i) => ({ ...p, imageUrl: mockImages[i % mockImages.length] }));

// // // const filteredPrompts = marketplacePrompts.filter((prompt) => {
// // //   const matchesSearch =
// // //     prompt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
// // //     prompt.description.toLowerCase().includes(searchQuery.toLowerCase());
// // //   const matchesCategory =
// // //     selectedCategory === "All" || prompt.category === selectedCategory;
// // //   return matchesSearch && matchesCategory;
// // // });

// // // const promptsToRender = withImages(filteredPrompts);

  

  

// // //   const handleVideoPlay = (promptId: number) => {
// // //     setPlayingVideo(playingVideo === promptId ? null : promptId);
// // //   };

// // //   const handleEnlargeMedia = (prompt: any) => {
// // //     setEnlargeMedia({
// // //       url: showImages ? prompt.imageUrl : prompt.videoUrl,
// // //       type: showImages ? 'image' : 'video',
// // //       title: prompt.title
// // //     });
// // //     setEnlargeModalOpen(true);
// // //   };

// // //   const handlePreview = (prompt: any) => {
// // //     if (purchasedPrompts.includes(prompt.id)) {
// // //       toast({
// // //         title: "Full Prompt Access",
// // //         description: `You have full access to "${prompt.title}"`
// // //       });
// // //     } else {
// // //       toast({
// // //         title: "Preview Mode",
// // //         description: `Showing preview for "${prompt.title}". Purchase to see full prompt.`
// // //       });
// // //     }
// // //   };

// // //   const handlePurchase = (prompt: any) => {
// // //     setSelectedPrompt(prompt);
// // //     setPurchaseDialogOpen(true);
// // //   };

// // //   const handlePurchaseComplete = (promptId: number) => {
// // //     setPurchasedPrompts(prev => [...prev, promptId]);
    
// // //     // Add to purchase history
// // //     const purchaseHistory = JSON.parse(localStorage.getItem('purchaseHistory') || '[]');
// // //     const prompt = marketplacePrompts.find(p => p.id === promptId);
// // //     if (prompt) {
// // //       purchaseHistory.push({
// // //         ...prompt,
// // //         purchasedAt: new Date().toISOString()
// // //       });
// // //       localStorage.setItem('purchaseHistory', JSON.stringify(purchaseHistory));
// // //     }
    
// // //     toast({
// // //       title: "Purchase Successful!",
// // //       description: "You now have full access to this prompt."
// // //     });
// // //   };

// // //   const handlePromptSubmitted = () => {
// // //     // Refresh the page or update the prompts list
// // //     window.location.reload();
// // //   };

// // //  if (showHistory) {
// // //   return (
// // //     <div className="min-h-screen bg-[#07080A] text-white">
// // //       <div className="container mx-auto px-6 py-8">
// // //         <Header />

// // //         <div className="flex items-center gap-4 mb-8">
// // //           <Button
// // //             variant="ghost"
// // //             onClick={() => setShowHistory(false)}
// // //             className="flex items-center gap-2 hover:bg-white/10"
// // //           >
// // //             <ArrowLeft className="h-4 w-4" />
// // //             Back to Marketplace
// // //           </Button>
// // //           <div className="h-6 w-px bg-white/10" />
// // //         </div>

// // //         {/* 👇 actually render it */}
// // //         <PromptHistory /* initialTab="purchased"  if your component supports it */ />
// // //       </div>

// // //       <Footer />
// // //     </div>
// // //   );
// // // }


// // //  return (
// // //   <div className="dark min-h-screen bg-background text-foreground">
// // //     {/* Top bar with header + back */}

// // // {/* Header + centered token usage */}
// // // {/* Header + token usage (lowered on desktop, visible on phone) */}

// // // <div className="container mx-auto px-6 pt-6">
// // //   {/* Full-width header on all devices */}
// // //   <Header />

// // //   {/* Desktop/Tablet: token usage centered just under header */}
// // //   <div className="hidden md:flex justify-center mt-3">
// // //     <TokenUsageSection
// // //       totalTokensUsed={totalTokensUsed}
// // //       tokenLimit={tokenLimit}
// // //     />
// // //   </div>

// // //   {/* Mobile: keep header visible; token usage right below it */}
// // //   <div className="flex md:hidden justify-center mt-2">
// // //     <TokenUsageSection
// // //       totalTokensUsed={totalTokensUsed}
// // //       tokenLimit={tokenLimit}
// // //     />
// // //   </div>
// // // </div>










// // //     {/* Main Content */}
// // //     <div className="container mx-auto px-6 pb-16">
// // //       {/* History Button and Upload Button Section */}
// // //       <div className="flex justify-between items-center mb-12">
// // //         <Button
// // //           variant="outline"
// // //           onClick={() => setShowHistory(true)}
// // //           className="flex items-center gap-2 hover:bg-tokun/10 hover:text-tokun hover:border-tokun/30"
// // //         >
// // //           <History className="h-4 w-4" />
// // //           Purchase History
// // //         </Button>
        
// // //         {/* <SellPromptModal onPromptSubmitted={handlePromptSubmitted} /> */}
// // //       </div> 
          


// // // {/* token usage section */}
        
// // // {/* <TokenUsageSection totalTokensUsed={totalTokensUsed} tokenLimit={tokenLimit} /> */}

// // //      {/* text above the appnavigation */}
// // //  <div className="flex flex-col items-center text-center mb-8">
// // //   {/* Heading: Inter, 32px, 400 */}
// // //   <h1
// // //     style={{
// // //       fontFamily: "Inter",
// // //       fontWeight: 400,
// // //       fontStyle: "normal",
// // //       fontSize: "32px",
// // //       lineHeight: "100%",
// // //       letterSpacing: "0%",
// // //       textAlign: "center",
// // //     }}
// // //     className="text-white"
// // //   >
// // //     Prompt Marketplace
// // //   </h1>

// // //   {/* Description: Gilroy, 14px, 500 */}
// // //   <p
// // //     style={{
// // //       fontFamily: "Inter",
// // //       fontWeight: 200,
// // //       fontStyle: "normal",
// // //       fontSize: "14px",
// // //       lineHeight: "100%",
// // //       letterSpacing: "0%",
// // //       textAlign: "center",
// // //     }}
// // //     className="mt-3 text-white/80 max-w-[520px] leading-tight"
// // //   >
// // //     Discover and purchase premium AI prompts created by experts from around the
// // //     world. Transform your ideas into reality with our curated collection.
// // //   </p>
// // // </div>









// // //         <div className="flex flex-col items-center">
// // //       {/* Navigation bar above search bar */}
// // //      <AppNavigation
// // //   activeSection="prompt-marketplace"
// // //   onSectionChange={(section) => console.log("Section changed:", section)}
// // // />


// // //       {/* Search bar */}
   
// // //     </div>









// // //       {/* Search, Categories, and Toggle */}
// // //       <div className="space-y-8 mb-12">

// // //        {/* Search, Categories, and Toggle */}
// // // <div className="space-y-8 mb-12">
// // //   <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
    
// // //     {/* Search input + button in one container */}
// // //     <div
// // //       className="flex items-center w-full sm:w-[700px] h-[50px] rounded-[200px] overflow-hidden"
// // //       style={{ backgroundColor: "#121213", border: "1px solid #282829" }}
// // //     >
// // //       {/* Search icon */}
// // //       <Search className="h-5 w-5 text-white/40 ml-4" />

// // //       {/* Input */}
// // //       <input
// // //         placeholder="Search premium prompts..."
// // //         value={searchQuery}
// // //         onChange={(e) => setSearchQuery(e.target.value)}
// // //         className="ml-3 flex-1 bg-transparent outline-none text-white placeholder:text-white/40 text-sm md:text-base"
// // //       />

// // //       {/* Search button flush right */}
// // //       <button
// // //         onClick={() => {/* trigger search */}}
// // //         className="text-white font-medium"
// // //         style={{
// // //           width: "100px",
// // //           height: "40px",
// // //           borderRadius: "200px",
// // //           background: "linear-gradient(90deg, #FF14EF 0%, #1A73E8 100%)",
// // //           marginRight: "5px", // keeps button visually inside without breaking pill
// // //         }}
// // //       >
// // //         Search
// // //       </button>
// // //     </div>

// // //     {/* Toggle group pill */}
// // //     <div
// // //       className="flex items-center gap-3 h-[50px] rounded-[200px] px-4"
// // //       style={{ backgroundColor: "#121213", border: "1px solid #282829" }}
// // //     >
// // //       <Video className="h-5 w-5 text-white/80" />
// // //       <span className="text-white/80 text-sm">Video</span>

// // //       {/* Always-gradient Switch */}
// // //       <Switch
// // //         id="media-toggle"
// // //         checked={showImages}
// // //         onCheckedChange={setShowImages}
// // //         className={[
// // //           "w-[44px] h-[24px] rounded-full relative",
// // //           "bg-[linear-gradient(270.1deg,#E31FEF_0.08%,#2D6AE8_99.92%)]",
// // //           "border border-[#282829]",
// // //           "[&>span]:h-[18px] [&>span]:w-[18px] [&>span]:rounded-full [&>span]:bg-black/80",
// // //           "[&>span]:translate-x-[4px] data-[state=checked]:[&>span]:translate-x-[22px]",
// // //         ].join(" ")}
// // //       />

// // //       <Label
// // //         htmlFor="media-toggle"
// // //         className="flex items-center gap-2 cursor-pointer text-white/80 text-sm"
// // //       >
// // //         <ImageIcon className="h-5 w-5 text-white/80" />
// // //         Images
// // //       </Label>
// // //     </div>
// // //   </div>
// // // </div>

// // //  <CategoriesScroller
// // //           selectedCategory={selectedCategory}
// // //           setSelectedCategory={setSelectedCategory}


          
// // //         />
      
// // //       </div>

   

// // //       {/* Prompts Grid */}
// // //      {/* Prompts Grid */}
// // //    {/* Prompts Grid */}
// // // {/* Prompts Grid */}
// // // <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
// // //   {promptsToRender.map((prompt) => (
// // //     <Card
// // //       key={prompt.id}
// // //      onClick={() => { setDetailsPrompt(prompt); setDetailsOpen(true); }}
// // //   className="overflow-hidden cursor-pointer hover:scale-[1.01] transition-transform"
// // //       style={{ width: 306, height: 520, background: "#1C1C1C", borderRadius: 30 }}
// // //     >
// // //       <CardContent className="p-4 h-full flex flex-col">
// // //         {/* MEDIA */}
// // //         <div
// // //           className="relative w-full overflow-hidden group"
// // //           style={{ height: 240, borderRadius: 20, backgroundColor: "#0B0B0B" }}
// // //         >
// // //           {showImages ? (
// // //             <img src={prompt.imageUrl} alt={prompt.title} className="w-full h-full object-cover" />
// // //           ) : (
// // //             <>
// // //               <video
// // //                 className="w-full h-full object-cover"
// // //                 src={prompt.videoUrl}
// // //                 loop
// // //                 muted
// // //                 playsInline
// // //                 ref={(el) => {
// // //                   if (!el) return;
// // //                   if (playingVideo === prompt.id) el.play().catch(() => {});
// // //                   else el.pause();
// // //                 }}
// // //               />
// // //               <button
// // //                 type="button"
// // //                 onClick={() => handleVideoPlay(prompt.id)}
// // //                 className="absolute inset-0 flex items-center justify-center"
// // //                 aria-label={playingVideo === prompt.id ? "Pause" : "Play"}
// // //               >
// // //                 <span className="w-12 h-12 rounded-full bg-black/60 hover:bg-black/75 grid place-items-center text-white transition-colors">
// // //                   {playingVideo === prompt.id ? (
// // //                     <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
// // //                       <rect x="6" y="5" width="4" height="14" rx="1" />
// // //                       <rect x="14" y="5" width="4" height="14" rx="1" />
// // //                     </svg>
// // //                   ) : (
// // //                     <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
// // //                       <path d="M8 5v14l11-7-11-7z" />
// // //                     </svg>
// // //                   )}
// // //                 </span>
// // //               </button>
// // //               <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">0:20</div>
// // //             </>
// // //           )}

// // //           {/* Category + purchase pills */}
// // //           <div
// // //             className="absolute top-3 left-3 px-3 py-1 text-[11px] font-semibold text-white rounded-full"
// // //             style={{ background: "linear-gradient(270deg, #1A73E8 0%, #FF14EF 100%)" }}
// // //           >
// // //             {prompt.category.toUpperCase()}
// // //           </div>

// // //           {!purchasedPrompts.includes(prompt.id) && (
// // //             <div
// // //               className="absolute top-11 left-3 mt-2 px-3 py-1 text-[11px] font-semibold text-white rounded-full"
// // //               style={{ background: "linear-gradient(270deg, #1A73E8 0%, #FF14EF 100%)" }}
// // //             >
// // //               PURCHASE TO UNLOCK
// // //             </div>
// // //           )}

// // //           {/* Rating: outlined white star inside bordered pill */}
// // //           <div className="absolute top-3 right-3">
// // //             <div className="flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-medium text-white bg-black/40 border border-white/40 backdrop-blur-sm">
// // //               <Star className="h-3.5 w-3.5 text-white" /> {/* no fill class -> outlined */}
// // //               {prompt.rating}
// // //             </div>
// // //           </div>

// // //           {/* Enlarge */}
        
// // //         </div>

// // //         {/* TEXT CONTENT (exact copy of screenshot text structure) */}
// // //      {/* TEXT CONTENT (dynamic) */}
// // // <div className="mt-4">
// // //   {/* small kicker / preview (optional) */}
// // //   {prompt.preview && (
// // //     <p className="text-[12px] text-white/60 line-clamp-1">{prompt.preview}</p>
// // //   )}

// // //   {/* title */}
// // //   <h3 className="mt-1 text-[18px] leading-snug font-semibold text-white line-clamp-2">
// // //     {prompt.title}
// // //   </h3>

// // //   {/* description */}
// // //   <p className="mt-2 text-[13px] leading-relaxed text-white/70 line-clamp-2">
// // //     {prompt.description}
// // //   </p>
// // // </div>


// // //         {/* Fees + Learn more (like screenshot) */}
// // //         <div className="mt-3 flex items-center justify-between">
          
// // //         </div>

// // //         {/* FOOTER ROW — preview icon, downloads pill, price pill, purchase */}
// // //         <div className="mt-auto pt-4 flex items-center justify-between gap-3">
// // //           {/* Preview (circle, #333335) */}
// // //           <button
// // //             type="button"
// // //             onClick={() => handlePreview(prompt)}
// // //             className="w-10 h-10 rounded-full grid place-items-center"
// // //             style={{ background: "#333335" }}
// // //             aria-label="Preview"
// // //           >
// // //             <Eye className="h-4 w-4 text-white/85" />
// // //           </button>
// // // {/* Downloads pill */}
// // // <div
// // //   className="flex items-center justify-center gap-[5px]"
// // //   style={{
// // //     width: 73,
// // //     height: 40,
// // //     borderRadius: 50,
// // //     padding: "10.5px 10px",
// // //     background: "#333335",
// // //   }}
// // // >
// // //   <Download className="h-4 w-4 text-white/85" />
// // //   <span className="text-[13px] text-white/80">{prompt.downloads}</span>
// // // </div>

// // // {/* Price pill */}
// // // <div
// // //   className="flex items-center justify-center gap-[10px]"
// // //   style={{
// // //     width: 65, // as per your description
// // //     height: 40,
// // //     borderRadius: 50,
// // //     padding: "10.5px 10px",
// // //     background: "#333335",
// // //   }}
// // // >
// // //   <span className="text-[13px] text-white/90">${prompt.price}</span>
// // // </div>


// // //           {/* Purchase / Owned */}
// // //           {!purchasedPrompts.includes(prompt.id) ? (
// // //             <button
// // //               onClick={(e) => { e.stopPropagation(); handlePurchase(prompt); }}
// // //               className="px-5 h-9 rounded-full text-white text-[13px] font-medium"
// // //               style={{ background: "linear-gradient(270deg, #1A73E8 0%, #FF14EF 100%)" }}
// // //             >
// // //               Purchase
// // //             </button>
// // //           ) : (
// // //             <button
// // //               className="px-5 h-9 rounded-full text-white/80 text-[13px] font-medium bg-white/10 border border-white/15"
// // //               disabled
// // //             >
// // //               Owned
// // //             </button>
// // //           )}
// // //         </div>
// // //       </CardContent>
// // //     </Card>
// // //   ))}
// // // </div>




// // //       {filteredPrompts.length === 0 && (
// // //         <div className="text-center py-16">
// // //          <p
// // //     style={{
// // //       fontFamily: "Inter, sans-serif",
// // //       fontWeight: 400,
// // //       fontStyle: "normal",
// // //       fontSize: "24px",
// // //       lineHeight: "100%",
// // //       letterSpacing: "0%",
// // //       textAlign: "center",
// // //     }}
// // //     className="text-white"
// // //   >
// // //     {`Showing 0 premium prompts in ${selectedCategory || "All"}`}
// // //   </p>

// // //   {/* Subtext: Inter, 16px, 400, centered */}
// // //   <p
// // //     style={{
// // //       fontFamily: "Inter, sans-serif",
// // //       fontWeight: 400,
// // //       fontStyle: "normal",
// // //       fontSize: "16px",
// // //       lineHeight: "100%",
// // //       letterSpacing: "0%",
// // //       textAlign: "center",
// // //     }}
// // //     className="mt-3 text-white/80"
// // //   >
// // //     No prompts found matching your criteria.
// // //   </p>

// // //   {/* Clear Filters button: 160x50, radius 10px, 1px solid #fff */}
// // //   <button
// // //     type="button"
// // //     onClick={() => {
// // //       setSearchQuery("");
// // //       setSelectedCategory("All");
// // //     }}
// // //     className="mx-auto mt-6 text-white"
// // //     style={{
// // //       width: "160px",
// // //       height: "50px",
// // //       borderRadius: "10px",
// // //       border: "1px solid #FFFFFF",
// // //       background: "transparent",
// // //     }}
// // //   >
// // //     Clear Filters
// // //   </button>
// // //         </div>
// // //       )}
// // //     </div>



// // //     <div className="mt-20">
// // //   <Footer />
// // // </div>


// // //     <PurchaseDialog
// // //       open={purchaseDialogOpen}
// // //       onOpenChange={setPurchaseDialogOpen}
// // //       prompt={selectedPrompt}
// // //       onPurchaseComplete={handlePurchaseComplete}
// // //     />

// // //     <MediaEnlargeModal
// // //       isOpen={enlargeModalOpen}
// // //       onClose={() => setEnlargeModalOpen(false)}
// // //       mediaUrl={enlargeMedia?.url || ""}
// // //       mediaType={enlargeMedia?.type || "image"}
// // //       title={enlargeMedia?.title || ""}
// // //     />

// // //     <DetailsPrompt
// // //   open={detailsOpen}
// // //   onOpenChange={setDetailsOpen}
// // //   prompt={detailsPrompt}
// // //   owned={detailsPrompt ? purchasedPrompts.includes(detailsPrompt.id) : false}
// // //   onPurchase={(p) => {
// // //     setDetailsOpen(false);
// // //     handlePurchase(p);
// // //   }}
// // //   showImages={showImages}
// // //   onEnlargeMedia={(m) => {
// // //     setEnlargeMedia({ url: m.url, type: m.type, title: m.title });
// // //     setEnlargeModalOpen(true);
// // //   }}
// // // />

// // //   </div>
// // // );

// // // };

// // // export default PromptMarketplacePage;


// // //after integrateion

// // // src/pages/PromptMarketplacePage.tsx
// // import { useEffect, useRef, useState } from "react";
// // import { useNavigate } from "react-router-dom";
// // import { Card, CardContent } from "@/components/ui/card";
// // import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// // import {
// //   Search, Star, Download, Eye, Video, Sparkles, History,
// //   ChevronLeft, ChevronRight, GraduationCap, Palette, FileText,
// //   BadgeDollarSign, Users, Plane, FlaskConical, Code2, BarChart3,
// //   LifeBuoy, Briefcase, Image as ImageIcon, ArrowLeft,
// // } from "lucide-react";

// // import { toast } from "@/components/ui/use-toast";
// // import Header from "@/components/Header";
// // import PurchaseDialog from "@/components/PurchaseDialog";
// // import MediaEnlargeModal from "@/components/MediaEnlargeModal";
// // import PromptHistory from "@/components/PromptHistory";
// // import AppNavigation from "@/components/AppNavigation";
// // import TokenUsageSection from "@/components/TokenUsageSection";
// // import { useUserTokenUsage } from "@/hooks/useUserTokenUsage";
// // import Footer from "@/components/Footer";
// // import DetailsPrompt from "@/components/DetailsPrompt";
// // import { Button } from "@/components/ui/button";
// // import { Switch } from "@/components/ui/switch";
// // import { Label } from "@/components/ui/label";
// // import { useAuth } from "@/contexts/AuthContext";

// // type Prompt = {
// //   id: string;
// //   title: string;
// //   description: string;
// //   category: string;
// //   price?: number;
// //   rating?: number;
// //   downloads?: number;
// //   imageUrl?: string;
// //   videoUrl?: string;
// //   preview?: string;
// //   isFree?: boolean;
// //   createdAt?: string;
// //   fullPrompt?: string; // not owned, so undefined
// // };

// // const GRADIENT = "linear-gradient(270deg, #1A73E8 0%, #FF14EF 100%)";
// // const API_BASE = (import.meta as any).env?.VITE_API_URL || "http://localhost:5000";
// // const PROMPTS_BASE = `${API_BASE}/api/prompt`; // change to /api/prompts if that's your mount

// // /* ---------- Categories rail data (UI only) ---------- */
// // const categoriesData = [
// //   { id: "All", icon: Sparkles },
// //   { id: "Marketing", icon: Sparkles },
// //   { id: "Content", icon: ImageIcon },
// //   { id: "Social Media", icon: Video },
// //   { id: "Business", icon: BadgeDollarSign },
// //   { id: "Creative", icon: Sparkles },
// //   { id: "Education", icon: GraduationCap },
// //   { id: "Finance", icon: BadgeDollarSign },
// //   { id: "Productivity", icon: Sparkles },
// //   { id: "Health", icon: Sparkles },
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

// // /* ---------- Categories scroller ---------- */
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

// //   return (
// //     <div className="w-full flex items-center justify-center gap-3">
// //       <button
// //         onClick={() => slide("left")}
// //         className="shrink-0 rounded-full grid place-items-center text-white"
// //         style={{ background: GRADIENT, width: 50, height: 50, borderRadius: "200px" }}
// //         aria-label="Scroll categories left"
// //       >
// //         <ChevronLeft className="w-5 h-5" />
// //       </button>

// //       <div className="relative w-full max-w-[1200px] overflow-hidden">
// //         <div
// //           ref={railRef}
// //           className="flex items-center gap-3 overflow-x-auto scroll-smooth px-1 no-scrollbar"
// //         >
// //           {categoriesData.map(({ id, icon: Icon }) => {
// //             const isAll = id === "All";
// //             const isActive = selectedCategory === id;
// //             const pillWidth = isAll ? "109.525px" : "185.628px";

// //             const baseStyle: React.CSSProperties = isActive
// //               ? { width: pillWidth, background: GRADIENT, color: "#FFFFFF" }
// //               : { width: pillWidth, background: "#17171A", color: "rgba(255,255,255,0.85)" };

// //             return (
// //               <button
// //                 key={id}
// //                 onClick={() => setSelectedCategory(id)}
// //                 aria-pressed={isActive}
// //                 className={[
// //                   "flex items-center justify-center gap-[10px] h-[50px] rounded-[200px]",
// //                   "text-sm font-medium whitespace-nowrap transition-colors",
// //                   isActive ? "ring-1 ring-white/15" : "hover:bg-white/5",
// //                 ].join(" ")}
// //                 style={{ padding: "15px 30px", ...baseStyle }}
// //               >
// //                 <Icon className="h-4 w-4" />
// //                 <span>{id}</span>
// //               </button>
// //             );
// //           })}
// //         </div>
// //       </div>

// //       <button
// //         onClick={() => slide("right")}
// //         className="shrink-0 rounded-full grid place-items-center text-white"
// //         style={{ background: GRADIENT, width: 50, height: 50, borderRadius: "200px" }}
// //         aria-label="Scroll categories right"
// //       >
// //         <ChevronRight className="w-5 h-5" />
// //       </button>
// //     </div>
// //   );
// // };

// // /* ---------- Page ---------- */
// // const PromptMarketplacePage = () => {
// //   const navigate = useNavigate();
// //   const { totalTokensUsed, tokenLimit } = useUserTokenUsage();
// //   const { token } = useAuth?.() || ({} as any);

// //   const [searchQuery, setSearchQuery] = useState("");
// //   const [selectedCategory, setSelectedCategory] = useState("All");
// //   const [showImages, setShowImages] = useState(false); // false=Video, true=Images (matches your UI)
// //   const [playingVideo, setPlayingVideo] = useState<string | number | null>(null);

// //   const [prompts, setPrompts] = useState<Prompt[]>([]);
// //   const [loading, setLoading] = useState(false);
// //   const [loadError, setLoadError] = useState<string | null>(null);

// //   const [purchaseDialogOpen, setPurchaseDialogOpen] = useState(false);
// //   const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
// //   const [purchasedPrompts, setPurchasedPrompts] = useState<string[]>([]); // store ids
// //   const [enlargeModalOpen, setEnlargeModalOpen] = useState(false);
// //   const [enlargeMedia, setEnlargeMedia] = useState<{ url: string; type: "image" | "video"; title: string } | null>(null);

// //   const [showHistory, setShowHistory] = useState(false);
// //   const [detailsOpen, setDetailsOpen] = useState(false);
// //   const [detailsPrompt, setDetailsPrompt] = useState<any>(null);

// //   /* ---------- Fetch prompts from API when media type or category changes ---------- */
// //   useEffect(() => {
// //     const fetchPrompts = async () => {
// //       try {
// //         setLoading(true);
// //         setLoadError(null);

// //         const params = new URLSearchParams();
// //         params.set("type", showImages ? "image" : "video");
// //         if (selectedCategory && selectedCategory !== "All") {
// //           params.set("category", selectedCategory);
// //         }

// //         const res = await fetch(`${PROMPTS_BASE}/others?${params.toString()}`, {
// //           headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
// //           credentials: "include",
// //         });
// //         const data = await res.json();

// //         if (!res.ok || !data?.success) {
// //           throw new Error(data?.error || "server_error");
// //         }

// //         const mapped: Prompt[] = (data.prompts || []).map((doc: any) => {
// //           const att = doc?.attachment || null;
// //           const mediaPath = att?.path ? `${API_BASE}${att.path}` : undefined;

// //           return {
// //             id: String(doc._id),
// //             title: doc.title || "Untitled",
// //             description: doc.description || "",
// //             category:
// //               (doc.categories?.[0]?.name as string) ||
// //               (Array.isArray(doc.categories) ? doc.categories.join(", ") : "") ||
// //               "General",
// //             price: typeof doc.price === "number" ? doc.price : 0,
// //             rating: typeof doc.averageRating === "number" ? doc.averageRating : undefined,
// //             downloads: doc.downloads || 0,
// //             imageUrl: att?.type === "image" ? mediaPath : undefined,
// //             videoUrl: att?.type === "video" ? mediaPath : undefined,
// //             preview:
// //               (doc.description && String(doc.description).slice(0, 140)) ||
// //               (doc.promptText && String(doc.promptText).slice(0, 140)) ||
// //               "",
// //             isFree: !!doc.free,
// //             createdAt: doc.createdAt,
// //             // fullPrompt undefined for “others”; Details modal will show locked view unless purchased
// //           };
// //         });

// //         setPrompts(mapped);
// //       } catch (err: any) {
// //         setLoadError(err?.message || "Failed to load prompts");
// //         toast({
// //           title: "Couldn’t load prompts",
// //           description: err?.message || "Please try again.",
// //           // //         });
// //       } finally {
// //         setLoading(false);
// //       }
// //     };

// //     fetchPrompts();
// //   }, [showImages, selectedCategory, token]);

// //   /* ---------- Derived: local search filter ---------- */
// //   const filteredPrompts = prompts.filter((p) => {
// //     if (!searchQuery.trim()) return true;
// //     const q = searchQuery.toLowerCase();
// //     return (
// //       p.title.toLowerCase().includes(q) ||
// //       (p.description || "").toLowerCase().includes(q)
// //     );
// //   });

// //   /* ---------- UI handlers ---------- */
// //   const handleVideoPlay = (promptId: string | number) => {
// //     setPlayingVideo((prev) => (prev === promptId ? null : promptId));
// //   };

// //   const handlePreview = (prompt: Prompt) => {
// //     if (purchasedPrompts.includes(prompt.id)) {
// //       toast({ title: "Full Prompt Access", description: `You have full access to "${prompt.title}"` });
// //     } else {
// //       toast({ title: "Preview Mode", description: `Showing preview for "${prompt.title}". Purchase to see full prompt.` });
// //     }
// //   };

// //   const handlePurchase = (prompt: Prompt) => {
// //     setSelectedPrompt(prompt);
// //     setPurchaseDialogOpen(true);
// //   };

// //   const handlePurchaseComplete = (promptId: string) => {
// //     setPurchasedPrompts((prev) => (prev.includes(promptId) ? prev : [...prev, promptId]));

// //     // Persist a record locally if you want
// //     const purchaseHistory = JSON.parse(localStorage.getItem("purchaseHistory") || "[]");
// //     const prompt = prompts.find((p) => p.id === promptId);
// //     if (prompt) {
// //       purchaseHistory.push({ ...prompt, purchasedAt: new Date().toISOString() });
// //       localStorage.setItem("purchaseHistory", JSON.stringify(purchaseHistory));
// //     }

// //     toast({ title: "Purchase Successful!", description: "You now have full access to this prompt." });
// //   };

// //   if (showHistory) {
// //     return (
// //       <div className="min-h-screen bg-[#07080A] text-white">
// //         <div className="container mx-auto px-6 py-8">
// //           <Header />
// //           <div className="flex items-center gap-4 mb-8">
// //             <Button
// //               variant="ghost"
// //               onClick={() => setShowHistory(false)}
// //               className="flex items-center gap-2 hover:bg-white/10"
// //             >
// //               <ArrowLeft className="h-4 w-4" />
// //               Back to Marketplace
// //             </Button>
// //             <div className="h-6 w-px bg-white/10" />
// //           </div>
// //           <PromptHistory />
// //         </div>
// //         <Footer />
// //       </div>
// //     );
// //   }

// //   return (
// //     <div className="dark min-h-screen bg-background text-foreground">
// //       {/* Header + token usage */}
// //       <div className="container mx-auto px-6 pt-6">
// //         <Header />
// //         <div className="hidden md:flex justify-center mt-3">
// //           <TokenUsageSection totalTokensUsed={totalTokensUsed} tokenLimit={tokenLimit} />
// //         </div>
// //         <div className="flex md:hidden justify-center mt-2">
// //           <TokenUsageSection totalTokensUsed={totalTokensUsed} tokenLimit={tokenLimit} />
// //         </div>
// //       </div>

// //       {/* Main Content */}
// //       <div className="container mx-auto px-6 pb-16">
// //         {/* History Button */}
// //         <div className="flex justify-between items-center mb-12">
// //           <Button
// //             variant="outline"
// //             onClick={() => setShowHistory(true)}
// //             className="flex items-center gap-2 hover:bg-tokun/10 hover:text-tokun hover:border-tokun/30"
// //           >
// //             <History className="h-4 w-4" />
// //             Purchase History
// //           </Button>
// //         </div>

// //         {/* Title + blurb */}
// //         <div className="flex flex-col items-center text-center mb-8">
// //           <h1
// //             style={{ fontFamily: "Inter", fontWeight: 400, fontSize: "32px", lineHeight: "100%" }}
// //             className="text-white"
// //           >
// //             Prompt Marketplace
// //           </h1>
// //           <p
// //             style={{ fontFamily: "Inter", fontWeight: 200, fontSize: "14px", lineHeight: "100%" }}
// //             className="mt-3 text-white/80 max-w-[520px] leading-tight"
// //           >
// //             Discover and purchase premium AI prompts created by experts from around the world.
// //           </p>
// //         </div>

// //         {/* Navigation + Search/Filters */}
// //         <div className="flex flex-col items-center">
// //           <AppNavigation
// //             activeSection="prompt-marketplace"
// //             onSectionChange={(section) => console.log("Section changed:", section)}
// //           />
// //         </div>

// //         {/* Search + media toggle */}
// //         <div className="space-y-8 mb-12">
// //           <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
// //             {/* Search pill */}
// //             <div
// //               className="flex items-center w-full sm:w-[700px] h-[50px] rounded-[200px] overflow-hidden"
// //               style={{ backgroundColor: "#121213", border: "1px solid #282829" }}
// //             >
// //               <Search className="h-5 w-5 text-white/40 ml-4" />
// //               <input
// //                 placeholder="Search premium prompts..."
// //                 value={searchQuery}
// //                 onChange={(e) => setSearchQuery(e.target.value)}
// //                 className="ml-3 flex-1 bg-transparent outline-none text-white placeholder:text-white/40 text-sm md:text-base"
// //               />
// //               <button
// //                 onClick={() => {/* client-side filter only */}}
// //                 className="text-white font-medium"
// //                 style={{
// //                   width: "100px",
// //                   height: "40px",
// //                   borderRadius: "200px",
// //                   background: "linear-gradient(90deg, #FF14EF 0%, #1A73E8 100%)",
// //                   marginRight: "5px",
// //                 }}
// //               >
// //                 Search
// //               </button>
// //             </div>

// //             {/* Video <-> Images toggle */}
// //             <div
// //               className="flex items-center gap-3 h-[50px] rounded-[200px] px-4"
// //               style={{ backgroundColor: "#121213", border: "1px solid #282829" }}
// //             >
// //               <Video className="h-5 w-5 text-white/80" />
// //               <span className="text-white/80 text-sm">Video</span>

// //               <Switch
// //                 id="media-toggle"
// //                 checked={showImages}
// //                 onCheckedChange={setShowImages}
// //                 className={[
// //                   "w-[44px] h-[24px] rounded-full relative",
// //                   "bg-[linear-gradient(270.1deg,#E31FEF_0.08%,#2D6AE8_99.92%)]",
// //                   "border border-[#282829]",
// //                   "[&>span]:h-[18px] [&>span]:w-[18px] [&>span]:rounded-full [&>span]:bg-black/80",
// //                   "[&>span]:translate-x-[4px] data-[state=checked]:[&>span]:translate-x-[22px]",
// //                 ].join(" ")}
// //               />

// //               <Label htmlFor="media-toggle" className="flex items-center gap-2 cursor-pointer text-white/80 text-sm">
// //                 <ImageIcon className="h-5 w-5 text-white/80" />
// //                 Images
// //               </Label>
// //             </div>
// //           </div>

// //           <CategoriesScroller selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory} />
// //         </div>

// //         {/* Loading / error states */}
// //         {loading && <p className="text-white/70 text-sm">Loading prompts…</p>}
// //         {!!loadError && !loading && <p className="text-red-400 text-sm">{loadError}</p>}

// //         {/* Prompts Grid */}
// //         {!loading && !loadError && (
// //           <>
// //             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
// //               {filteredPrompts.map((prompt) => (
// //                 <Card
// //                   key={prompt.id}
// //                   onClick={() => {
// //                     setDetailsPrompt(prompt);
// //                     setDetailsOpen(true);
// //                   }}
// //                   className="overflow-hidden cursor-pointer hover:scale-[1.01] transition-transform"
// //                   style={{ width: 306, height: 520, background: "#1C1C1C", borderRadius: 30 }}
// //                 >
// //                   <CardContent className="p-4 h-full flex flex-col">
// //                     {/* MEDIA */}
// //                     <div
// //                       className="relative w-full overflow-hidden group"
// //                       style={{ height: 240, borderRadius: 20, backgroundColor: "#0B0B0B" }}
// //                     >
// //                       {showImages ? (
// //                         <img src={prompt.imageUrl} alt={prompt.title} className="w-full h-full object-cover" />
// //                       ) : (
// //                         <>
// //                           <video
// //                             className="w-full h-full object-cover"
// //                             src={prompt.videoUrl}
// //                             loop
// //                             muted
// //                             playsInline
// //                             ref={(el) => {
// //                               if (!el) return;
// //                               if (playingVideo === prompt.id) el.play().catch(() => {});
// //                               else el.pause();
// //                             }}
// //                           />
// //                           <button
// //                             type="button"
// //                             onClick={(e) => {
// //                               e.stopPropagation();
// //                               handleVideoPlay(prompt.id);
// //                             }}
// //                             className="absolute inset-0 flex items-center justify-center"
// //                             aria-label={playingVideo === prompt.id ? "Pause" : "Play"}
// //                           >
// //                             <span className="w-12 h-12 rounded-full bg-black/60 hover:bg-black/75 grid place-items-center text-white transition-colors">
// //                               {playingVideo === prompt.id ? (
// //                                 <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
// //                                   <rect x="6" y="5" width="4" height="14" rx="1" />
// //                                   <rect x="14" y="5" width="4" height="14" rx="1" />
// //                                 </svg>
// //                               ) : (
// //                                 <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
// //                                   <path d="M8 5v14l11-7-11-7z" />
// //                                 </svg>
// //                               )}
// //                             </span>
// //                           </button>
// //                           <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">0:20</div>
// //                         </>
// //                       )}

// //                       {/* Category pill */}
// //                       <div
// //                         className="absolute top-3 left-3 px-3 py-1 text-[11px] font-semibold text-white rounded-full"
// //                         style={{ background: GRADIENT }}
// //                       >
// //                         {prompt.category?.toUpperCase()}
// //                       </div>

// //                       {/* Purchase to unlock */}
// //                       {!purchasedPrompts.includes(prompt.id) && (
// //                         <div
// //                           className="absolute top-11 left-3 mt-2 px-3 py-1 text-[11px] font-semibold text-white rounded-full"
// //                           style={{ background: GRADIENT }}
// //                         >
// //                           PURCHASE TO UNLOCK
// //                         </div>
// //                       )}

// //                       {/* Rating pill */}
// //                       <div className="absolute top-3 right-3">
// //                         <div className="flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-medium text-white bg-black/40 border border-white/40 backdrop-blur-sm">
// //                           <Star className="h-3.5 w-3.5 text-white" />
// //                           {typeof prompt.rating === "number" ? prompt.rating : "—"}
// //                         </div>
// //                       </div>
// //                     </div>

// //                     {/* TEXT */}
// //                     <div className="mt-4">
// //                       {prompt.preview && (
// //                         <p className="text-[12px] text-white/60 line-clamp-1">{prompt.preview}</p>
// //                       )}
// //                       <h3 className="mt-1 text-[18px] leading-snug font-semibold text-white line-clamp-2">
// //                         {prompt.title}
// //                       </h3>
// //                       <p className="mt-2 text-[13px] leading-relaxed text-white/70 line-clamp-2">
// //                         {prompt.description}
// //                       </p>
// //                     </div>

// //                     {/* FOOTER */}
// //                     <div className="mt-auto pt-4 flex items-center justify-between gap-3">
// //                       {/* Preview */}
// //                       <button
// //                         type="button"
// //                         onClick={(e) => {
// //                           e.stopPropagation();
// //                           handlePreview(prompt);
// //                         }}
// //                         className="w-10 h-10 rounded-full grid place-items-center"
// //                         style={{ background: "#333335" }}
// //                         aria-label="Preview"
// //                       >
// //                         <Eye className="h-4 w-4 text-white/85" />
// //                       </button>

// //                       {/* Downloads */}
// //                       <div
// //                         className="flex items-center justify-center gap-[5px]"
// //                         style={{
// //                           width: 73,
// //                           height: 40,
// //                           borderRadius: 50,
// //                           padding: "10.5px 10px",
// //                           background: "#333335",
// //                         }}
// //                       >
// //                         <Download className="h-4 w-4 text-white/85" />
// //                         <span className="text-[13px] text-white/80">{prompt.downloads ?? 0}</span>
// //                       </div>

// //                       {/* Price */}
// //                       <div
// //                         className="flex items-center justify-center gap-[10px]"
// //                         style={{
// //                           width: 65,
// //                           height: 40,
// //                           borderRadius: 50,
// //                           padding: "10.5px 10px",
// //                           background: "#333335",
// //                         }}
// //                       >
// //                         <span className="text-[13px] text-white/90">
// //                           {prompt.isFree ? "FREE" : `$${(prompt.price ?? 0).toFixed(2)}`}
// //                         </span>
// //                       </div>

// //                       {/* Purchase / Owned */}
// //                       {!purchasedPrompts.includes(prompt.id) ? (
// //                         <button
// //                           onClick={(e) => {
// //                             e.stopPropagation();
// //                             handlePurchase(prompt);
// //                           }}
// //                           className="px-5 h-9 rounded-full text-white text-[13px] font-medium"
// //                           style={{ background: GRADIENT }}
// //                         >
// //                           Purchase
// //                         </button>
// //                       ) : (
// //                         <button
// //                           className="px-5 h-9 rounded-full text-white/80 text-[13px] font-medium bg-white/10 border border-white/15"
// //                           disabled
// //                         >
// //                           Owned
// //                         </button>
// //                       )}
// //                     </div>
// //                   </CardContent>
// //                 </Card>
// //               ))}
// //             </div>

// //             {/* Empty state */}
// //             {filteredPrompts.length === 0 && (
// //               <div className="text-center py-16">
// //                 <p
// //                   style={{ fontFamily: "Inter, sans-serif", fontWeight: 400, fontSize: "24px", lineHeight: "100%" }}
// //                   className="text-white"
// //                 >
// //                   {`Showing 0 premium prompts in ${selectedCategory || "All"}`}
// //                 </p>
// //                 <p
// //                   style={{ fontFamily: "Inter, sans-serif", fontWeight: 400, fontSize: "16px", lineHeight: "100%" }}
// //                   className="mt-3 text-white/80"
// //                 >
// //                   No prompts found matching your criteria.
// //                 </p>
// //                 <button
// //                   type="button"
// //                   onClick={() => {
// //                     setSearchQuery("");
// //                     setSelectedCategory("All");
// //                   }}
// //                   className="mx-auto mt-6 text-white"
// //                   style={{
// //                     width: "160px",
// //                     height: "50px",
// //                     borderRadius: "10px",
// //                     border: "1px solid #FFFFFF",
// //                     background: "transparent",
// //                   }}
// //                 >
// //                   Clear Filters
// //                 </button>
// //               </div>
// //             )}
// //           </>
// //         )}
// //       </div>

// //       <div className="mt-20">
// //         <Footer />
// //       </div>

// //       {/* Dialogs / Modals */}
// //       <PurchaseDialog
// //         open={purchaseDialogOpen}
// //         onOpenChange={setPurchaseDialogOpen}
// //         prompt={selectedPrompt as any}
// //         // Make sure your PurchaseDialog calls onPurchaseComplete with a string id
// //         onPurchaseComplete={(id) => handlePurchaseComplete(String(id))}
// //       />

// //       <MediaEnlargeModal
// //         isOpen={enlargeModalOpen}
// //         onClose={() => setEnlargeModalOpen(false)}
// //         mediaUrl={enlargeMedia?.url || ""}
// //         mediaType={enlargeMedia?.type || "image"}
// //         title={enlargeMedia?.title || ""}
// //       />

// //       <DetailsPrompt
// //         open={detailsOpen}
// //         onOpenChange={setDetailsOpen}
// //         prompt={detailsPrompt}
// //         owned={detailsPrompt ? purchasedPrompts.includes(String(detailsPrompt.id)) : false}
// //         onPurchase={(p) => {
// //           setDetailsOpen(false);
// //           handlePurchase(p);
// //         }}
// //         showImages={showImages}
// //         onEnlargeMedia={(m) => {
// //           setEnlargeMedia({ url: m.url, type: m.type, title: m.title });
// //           setEnlargeModalOpen(true);
// //         }}
// //       />
// //     </div>
// //   );
// // };

// // export default PromptMarketplacePage;


// //0/9/2025



// // // src/pages/PromptMarketplacePage.tsx
// // import { useEffect, useRef, useState } from "react";
// // import { useNavigate } from "react-router-dom";
// // import { Card, CardContent } from "@/components/ui/card";
// // import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// // import {
// //   Search, Star, Eye, Video, Sparkles, History,
// //   ChevronLeft, ChevronRight, GraduationCap, Palette, FileText,
// //   BadgeDollarSign, Users, Plane, FlaskConical, Code2, BarChart3,
// //   LifeBuoy, Briefcase, Image as ImageIcon, ArrowLeft,
// // } from "lucide-react";

// // import { toast } from "@/components/ui/use-toast";
// // import Header from "@/components/Header";
// // import MediaEnlargeModal from "@/components/MediaEnlargeModal";
// // import PromptHistory from "@/components/PromptHistory";
// // import AppNavigation from "@/components/AppNavigation";
// // import TokenUsageSection from "@/components/TokenUsageSection";
// // import { useUserTokenUsage } from "@/hooks/useUserTokenUsage";
// // import Footer from "@/components/Footer";
// // import DetailsPrompt from "@/components/DetailsPrompt";
// // import { Button } from "@/components/ui/button";
// // import { Switch } from "@/components/ui/switch";
// // import { Label } from "@/components/ui/label";
// // import { useAuth } from "@/contexts/AuthContext";
// // import ModalComponent from "@/components/ModalComponent";

// // type Prompt = {
// //   id: string;
// //   title: string;
// //   description: string;
// //   category: string;
// //   price?: number;
// //   rating?: number;
// //   downloads?: number;
// //   imageUrl?: string;
// //   videoUrl?: string;
// //   preview?: string;
// //   isFree?: boolean;
// //   createdAt?: string;
// //   fullPrompt?: string;
// // };

// // const GRADIENT = "linear-gradient(270deg, #1A73E8 0%, #FF14EF 100%)";
// // const API_BASE = (import.meta as any).env?.VITE_API_URL || "http://localhost:5000";
// // const PROMPTS_BASE = `${API_BASE}/api/prompt`;
// // const PURCHASE_BASE = `${API_BASE}/api/purchase`;

// // // ⚠️ Keep your real Razorpay key id in env:
// // const RAZORPAY_KEY_ID = (import.meta as any).env?.VITE_RAZORPAY_KEY_ID || "rzp_test_TLG37MSt5U18rP";

// // /* ---------- Categories rail data (UI only) ---------- */
// // const categoriesData = [
// //   { id: "All", icon: Sparkles },
// //   { id: "Marketing", icon: Sparkles },
// //   { id: "Content", icon: ImageIcon },
// //   { id: "Social Media", icon: Video },
// //   { id: "Business", icon: BadgeDollarSign },
// //   { id: "Creative", icon: Sparkles },
// //   { id: "Education", icon: GraduationCap },
// //   { id: "Finance", icon: BadgeDollarSign },
// //   { id: "Productivity", icon: Sparkles },
// //   { id: "Health", icon: Sparkles },
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

// // /* ---------- Categories scroller ---------- */
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

// //   return (
// //     <div className="w-full flex items-center justify-center gap-3">
// //       <button
// //         onClick={() => slide("left")}
// //         className="shrink-0 rounded-full grid place-items-center text-white"
// //         style={{ background: GRADIENT, width: 50, height: 50, borderRadius: "200px" }}
// //         aria-label="Scroll categories left"
// //       >
// //         <ChevronLeft className="w-5 h-5" />
// //       </button>

// //       <div className="relative w-full max-w-[1200px] overflow-hidden">
// //         <div
// //           ref={railRef}
// //           className="flex items-center gap-3 overflow-x-auto scroll-smooth px-1 no-scrollbar"
// //         >
// //           {categoriesData.map(({ id, icon: Icon }) => {
// //             const isAll = id === "All";
// //             const isActive = selectedCategory === id;
// //             const pillWidth = isAll ? "109.525px" : "185.628px";
// //             const baseStyle: React.CSSProperties = isActive
// //               ? { width: pillWidth, background: GRADIENT, color: "#FFFFFF" }
// //               : { width: pillWidth, background: "#17171A", color: "rgba(255,255,255,0.85)" };

// //             return (
// //               <button
// //                 key={id}
// //                 onClick={() => setSelectedCategory(id)}
// //                 aria-pressed={isActive}
// //                 className={[
// //                   "flex items-center justify-center gap-[10px] h-[50px] rounded-[200px]",
// //                   "text-sm font-medium whitespace-nowrap transition-colors",
// //                   isActive ? "ring-1 ring-white/15" : "hover:bg-white/5",
// //                 ].join(" ")}
// //                 style={{ padding: "15px 30px", ...baseStyle }}
// //               >
// //                 <Icon className="h-4 w-4" />
// //                 <span>{id}</span>
// //               </button>
// //             );
// //           })}
// //         </div>
// //       </div>

// //       <button
// //         onClick={() => slide("right")}
// //         className="shrink-0 rounded-full grid place-items-center text-white"
// //         style={{ background: GRADIENT, width: 50, height: 50, borderRadius: "200px" }}
// //         aria-label="Scroll categories right"
// //       >
// //         <ChevronRight className="w-5 h-5" />
// //       </button>
// //     </div>
// //   );
// // };

// // const PromptMarketplacePage = () => {
// //   const navigate = useNavigate();
// //   const { totalTokensUsed, tokenLimit } = useUserTokenUsage();
// //   const { token } = useAuth?.() || ({} as any);

// //   const [searchQuery, setSearchQuery] = useState("");
// //   const [selectedCategory, setSelectedCategory] = useState("All");
// //   const [showImages, setShowImages] = useState(false);
// //   const [playingVideo, setPlayingVideo] = useState<string | number | null>(null);

// //   const [prompts, setPrompts] = useState<Prompt[]>([]);
// //   const [loading, setLoading] = useState(false);
// //   const [loadError, setLoadError] = useState<string | null>(null);

// //   // IDs of prompts user already owns
// //   const [purchasedPrompts, setPurchasedPrompts] = useState<string[]>([]);

// //   const [enlargeModalOpen, setEnlargeModalOpen] = useState(false);
// //   const [enlargeMedia, setEnlargeMedia] = useState<{ url: string; type: "image" | "video"; title: string } | null>(null);

// //   const [showHistory, setShowHistory] = useState(false);
// //   const [detailsOpen, setDetailsOpen] = useState(false);
// //   const [detailsPrompt, setDetailsPrompt] = useState<any>(null);

// //   // Save modal (anchored to cop.png)
// //   const [saveModalOpen, setSaveModalOpen] = useState(false);
// //   const [saveAnchorEl, setSaveAnchorEl] = useState<HTMLElement | null>(null);

// //   // Razorpay script ready?
// //   const [rzpReady, setRzpReady] = useState(false);

// //   /* ---------- Load Razorpay script once ---------- */
// //   useEffect(() => {
// //     if ((window as any).Razorpay) {
// //       console.log("✅ [RZP] checkout.js already loaded");
// //       setRzpReady(true);
// //       return;
// //     }
// //     console.log("🟣 [RZP] injecting checkout.js …");
// //     const script = document.createElement("script");
// //     script.src = "https://checkout.razorpay.com/v1/checkout.js";
// //     script.async = true;
// //     script.onload = () => {
// //       console.log("🟢 [RZP] checkout.js loaded");
// //       setRzpReady(true);
// //     };
// //     script.onerror = () => {
// //       console.error("❌ [RZP] failed to load checkout.js");
// //       setRzpReady(false);
// //     };
// //     document.body.appendChild(script);
// //   }, []);

// //   /* ---------- [API #3] Load purchase history on mount to mark "Owned" ---------- */
// //   useEffect(() => {
// //     if (!token) return;
// //     (async () => {
// //       try {
// //         console.log("🟣 [API #3] GET /api/purchase/history – mark owned cards");
// //         const res = await fetch(`${PURCHASE_BASE}/history`, {
// //           headers: { Authorization: `Bearer ${token}` },
// //           credentials: "include",
// //         });
// //         const body = await res.json();
// //         console.log("🟢 [API #3] History response", { status: res.status, ok: res.ok, body });

// //         if (!res.ok || !body?.success) return;

// //         const ownedIds = (body.purchases || [])
// //           .map((p: any) => {
// //             // prefer populated prompt._id, else plain id string
// //             if (p?.prompt && typeof p.prompt === "object") return String(p.prompt._id);
// //             if (p?.prompt && typeof p.prompt === "string") return p.prompt;
// //             return null;
// //           })
// //           .filter(Boolean);

// //         setPurchasedPrompts((prev) => Array.from(new Set([...(prev || []), ...ownedIds])));
// //       } catch (e) {
// //         console.error("❌ [API #3] History fetch failed", e);
// //       }
// //     })();
// //   }, [token]);

// //   /* ---------- Fetch prompts ---------- */
// //   useEffect(() => {
// //     const fetchPrompts = async () => {
// //       try {
// //         setLoading(true);
// //         setLoadError(null);

// //         const params = new URLSearchParams();
// //         params.set("type", showImages ? "image" : "video");
// //         if (selectedCategory && selectedCategory !== "All") {
// //           params.set("category", selectedCategory);
// //         }

// //         console.log("🟣 [API] GET /api/prompt/others", { params: params.toString() });

// //         const res = await fetch(`${PROMPTS_BASE}/others?${params.toString()}`, {
// //           headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
// //           credentials: "include",
// //         });
// //         const data = await res.json();

// //         console.log("🟢 [API] Prompts response", { status: res.status, ok: res.ok, body: data });

// //         if (!res.ok || !data?.success) {
// //           throw new Error(data?.error || "server_error");
// //         }

// //         const mapped: Prompt[] = (data.prompts || []).map((doc: any) => {
// //           const att = doc?.attachment || null;
// //           const mediaPath = att?.path ? `${API_BASE}${att.path}` : undefined;

// //           return {
// //             id: String(doc._id),
// //             title: doc.title || "Untitled",
// //             description: doc.description || "",
// //             category:
// //               (doc.categories?.[0]?.name as string) ||
// //               (Array.isArray(doc.categories) ? doc.categories.join(", ") : "") ||
// //               "General",
// //             price: typeof doc.price === "number" ? doc.price : 0,
// //             rating: typeof doc.averageRating === "number" ? doc.averageRating : undefined,
// //             downloads: doc.downloads || 0,
// //             imageUrl: att?.type === "image" ? mediaPath : undefined,
// //             videoUrl: att?.type === "video" ? mediaPath : undefined,
// //             preview:
// //               (doc.description && String(doc.description).slice(0, 140)) ||
// //               (doc.promptText && String(doc.promptText).slice(0, 140)) ||
// //               "",
// //             isFree: !!doc.free,
// //             createdAt: doc.createdAt,
// //           };
// //         });

// //         setPrompts(mapped);
// //       } catch (err: any) {
// //         console.error("❌ [API] Failed to load prompts", err);
// //         setLoadError(err?.message || "Failed to load prompts");
// //         toast({
// //           title: "Couldn’t load prompts",
// //           description: err?.message || "Please try again.",
// //           // //         });
// //       } finally {
// //         setLoading(false);
// //       }
// //     };

// //     fetchPrompts();
// //   }, [showImages, selectedCategory, token]);

// //   /* ---------- Derived: local search filter ---------- */
// //   const filteredPrompts = prompts.filter((p) => {
// //     if (!searchQuery.trim()) return true;
// //     const q = searchQuery.toLowerCase();
// //     return (
// //       p.title.toLowerCase().includes(q) ||
// //       (p.description || "").toLowerCase().includes(q)
// //     );
// //   });

// //   /* ---------- UI handlers ---------- */
// //   const handleVideoPlay = (promptId: string | number) => {
// //     setPlayingVideo((prev) => (prev === promptId ? null : promptId));
// //   };

// //   const handlePreview = (prompt: Prompt) => {
// //     if (purchasedPrompts.includes(prompt.id)) {
// //       toast({ title: "Full Prompt Access", description: `You have full access to "${prompt.title}"` });
// //     } else {
// //       toast({ title: "Preview Mode", description: `Showing preview for "${prompt.title}". Purchase to see full prompt.` });
// //     }
// //   };

// //   /** PURCHASE FLOW — integrates CREATE ORDER (+ verify) with detailed consoles */
// //   const handlePurchase = async (prompt: Prompt) => {
// //     console.log("🟣 [BUY] Purchase clicked", { promptId: prompt.id, title: prompt.title, priceShown: prompt.price });

// //     if (!token) {
// //       console.warn("⚠️ [BUY] Not authenticated");
// //       toast({ title: "Please log in", description: "You must be logged in to purchase." });
// //       return;
// //     }

// //     if (!rzpReady) {
// //       console.warn("⚠️ [RZP] Razorpay script not ready yet");
// //       toast({ title: "Loading payment…", description: "Razorpay is still initializing." });
// //       return;
// //     }

// //     try {
// //       // -----------------------------
// //       // [API #1] CREATE ORDER
// //       // -----------------------------
// //       console.log("🟣 [API #1] POST /api/purchase/create-order/:promptId", { url: `${PURCHASE_BASE}/create-order/${prompt.id}` });
// //       const res = await fetch(`${PURCHASE_BASE}/create-order/${prompt.id}`, {
// //         method: "POST",
// //         headers: {
// //           "Content-Type": "application/json",
// //           Authorization: `Bearer ${token}`,
// //         },
// //         credentials: "include",
// //       });

// //       const data = await res.json();
// //       console.log("🟢 [API #1] Create-order response", { status: res.status, ok: res.ok, body: data });

// //       if (!res.ok || !data?.success || !data?.order) {
// //         const msg = data?.error || "order_create_failed";
// //         throw new Error(msg);
// //       }

// //       const order = data.order;

// //       // -----------------------------
// //       // Razorpay Checkout
// //       // -----------------------------
// //       const options: any = {
// //         key: RAZORPAY_KEY_ID,
// //         amount: Number(order.amount), // paise
// //         currency: order.currency || "INR",
// //         name: "Tokun",
// //         description: `Purchase: ${prompt.title}`,
// //         order_id: order.id,
// //         notes: { promptId: prompt.id },
// //         theme: { color: "#1A73E8" },

// //         handler: async (response: any) => {
// //           console.log("🟢 [RZP] Handler success payload", response);

// //           try {
// //             // -----------------------------
// //             // [API #2] VERIFY PAYMENT
// //             // -----------------------------
// //             console.log("🟣 [API #2] POST /api/purchase/verify/:promptId");
// //             const vr = await fetch(`${PURCHASE_BASE}/verify/${prompt.id}`, {
// //               method: "POST",
// //               headers: {
// //                 "Content-Type": "application/json",
// //                 Authorization: `Bearer ${token}`,
// //               },
// //               credentials: "include",
// //               body: JSON.stringify({
// //                 razorpayPaymentId: response.razorpay_payment_id,
// //                 razorpayOrderId: response.razorpay_order_id,
// //                 razorpaySignature: response.razorpay_signature,
// //                 pricePaid: order.amount / 100, // convert paise -> INR
// //               }),
// //             });

// //             const vb = await vr.json();
// //             console.log("🟢 [API #2] Verify response", { status: vr.status, ok: vr.ok, body: vb });

// //             if (vb?.success) {
// //               const purchasedId = prompt.id;

// //               // Mark as owned (button changes to "Owned")
// //               setPurchasedPrompts((prev) => (prev.includes(purchasedId) ? prev : [...prev, purchasedId]));

// //               // 🔔 Let PromptHistory update live if open
// //               try {
// //                 window.dispatchEvent(new CustomEvent("tokun:purchased", { detail: vb.purchase }));
// //                 console.log("🟢 [EVENT] Dispatched tokun:purchased", vb.purchase);
// //               } catch (e) {
// //                 console.warn("⚠️ [EVENT] tokun:purchased failed to dispatch", e);
// //               }

// //               toast({ title: "Payment Successful", description: "You now own this prompt." });

// //               // (Optional) Navigate to history immediately:
// //               // setShowHistory(true);
// //             } else {
// //               toast({ title: "Verification Failed", description: vb?.error || "Unknown error" });
// //             }
// //           } catch (err) {
// //             console.error("❌ [API #2] Verify exception", err);
// //             toast({ title: "Verification Error", description: "Could not verify payment." });
// //           }
// //         },
// //       };

// //       const rzp = new (window as any).Razorpay(options);

// //       rzp.on("payment.failed", function (resp: any) {
// //         console.error("❌ [RZP] Payment failed", resp);
// //         toast({ title: "Payment Failed", description: "Please try again." });
// //       });

// //       console.log("🟣 [RZP] Opening checkout", { options: { ...options, handler: "[function]" } });
// //       rzp.open();
// //     } catch (err: any) {
// //       console.error("❌ [BUY] Purchase flow error", err);
// //       toast({ title: "Purchase Error", description: err?.message || "Something went wrong." });
// //     }
// //   };

// //   if (showHistory) {
// //     return (
// //       <div className="min-h-screen bg-[#07080A] text-white">
// //         <div className="container mx-auto px-6 py-8">
// //           <Header />
// //           <div className="flex items-center gap-4 mb-8">
// //             <Button
// //               variant="ghost"
// //               onClick={() => setShowHistory(false)}
// //               className="flex items-center gap-2 hover:bg-white/10"
// //             >
// //               <ArrowLeft className="h-4 w-4" />
// //               Back to Marketplace
// //             </Button>
// //             <div className="h-6 w-px bg-white/10" />
// //           </div>

// //           {/* PromptHistory fetches [API #3] internally and also listens to tokun:purchased */}
// //           <PromptHistory />
// //         </div>
// //         <Footer />
// //       </div>
// //     );
// //   }

// //   return (
// //     <div className="dark min-h-screen bg-background text-foreground">
// //       {/* Header + token usage */}
// //       <div className="container mx-auto px-6 pt-6">
// //         <Header />
// //         <div className="hidden md:flex justify-center mt-3">
// //           <TokenUsageSection totalTokensUsed={totalTokensUsed} tokenLimit={tokenLimit} />
// //         </div>
// //         <div className="flex md:hidden justify-center mt-2">
// //           <TokenUsageSection totalTokensUsed={totalTokensUsed} tokenLimit={tokenLimit} />
// //         </div>
// //       </div>

// //       {/* Main Content */}
// //       <div className="container mx-auto px-6 pb-16">
// //         {/* History Button */}
// //         <div className="flex justify-between items-center mb-12">
// //           <Button
// //             variant="outline"
// //             onClick={() => setShowHistory(true)}
// //             className="flex items-center gap-2 hover:bg-tokun/10 hover:text-tokun hover:border-tokun/30"
// //           >
// //             <History className="h-4 w-4" />
// //             Purchase History
// //           </Button>
// //         </div>

// //         {/* Title + blurb */}
// //         <div className="flex flex-col items-center text-center mb-8">
// //           <h1
// //             style={{ fontFamily: "Inter", fontWeight: 400, fontSize: "32px", lineHeight: "100%" }}
// //             className="text-white"
// //           >
// //             Prompt Marketplace
// //           </h1>
// //           <p
// //             style={{ fontFamily: "Inter", fontWeight: 200, fontSize: "14px", lineHeight: "100%" }}
// //             className="mt-3 text-white/80 max-w-[520px] leading-tight"
// //           >
// //             Discover and purchase premium AI prompts created by experts from around the world.
// //           </p>
// //         </div>

// //         {/* Navigation + Search/Filters */}
// //         <div className="flex flex-col items-center">
// //           <AppNavigation
// //             activeSection="prompt-marketplace"
// //             onSectionChange={(section) => console.log("Section changed:", section)}
// //           />
// //         </div>

// //         {/* Search + media toggle */}
// //         <div className="space-y-8 mb-12">
// //           <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
// //             {/* Search pill */}
// //             <div
// //               className="flex items-center w-full sm:w-[700px] h-[50px] rounded-[200px] overflow-hidden"
// //               style={{ backgroundColor: "#121213", border: "1px solid #282829" }}
// //             >
// //               <Search className="h-5 w-5 text-white/40 ml-4" />
// //               <input
// //                 placeholder="Search premium prompts..."
// //                 value={searchQuery}
// //                 onChange={(e) => setSearchQuery(e.target.value)}
// //                 className="ml-3 flex-1 bg-transparent outline-none text-white placeholder:text-white/40 text-sm md:text-base"
// //               />
// //               <button
// //                 onClick={() => {/* client-side filter only */}}
// //                 className="text-white font-medium"
// //                 style={{
// //                   width: "100px",
// //                   height: "40px",
// //                   borderRadius: "200px",
// //                   background: "linear-gradient(90deg, #FF14EF 0%, #1A73E8 100%)",
// //                   marginRight: "5px",
// //                 }}
// //               >
// //                 Search
// //               </button>
// //             </div>

// //             {/* Video <-> Images toggle */}
// //             <div
// //               className="flex items-center gap-3 h-[50px] rounded-[200px] px-4"
// //               style={{ backgroundColor: "#121213", border: "1px solid #282829" }}
// //             >
// //               <Video className="h-5 w-5 text-white/80" />
// //               <span className="text-white/80 text-sm">Video</span>

// //               <Switch
// //                 id="media-toggle"
// //                 checked={showImages}
// //                 onCheckedChange={setShowImages}
// //                 className={[
// //                   "w-[44px] h-[24px] rounded-full relative",
// //                   "bg-[linear-gradient(270.1deg,#E31FEF_0.08%,#2D6AE8_99.92%)]",
// //                   "border border-[#282829]",
// //                   "[&>span]:h-[18px] [&>span]:w-[18px] [&>span]:rounded-full [&>span]:bg-black/80",
// //                   "[&>span]:translate-x-[4px] data-[state=checked]:[&>span]:translate-x-[22px]",
// //                 ].join(" ")}
// //               />

// //               <Label htmlFor="media-toggle" className="flex items-center gap-2 cursor-pointer text-white/80 text-sm">
// //                 <ImageIcon className="h-5 w-5 text-white/80" />
// //                 Images
// //               </Label>
// //             </div>
// //           </div>

// //           <CategoriesScroller selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory} />
// //         </div>

// //         {/* Loading / error states */}
// //         {loading && <p className="text-white/70 text-sm">Loading prompts…</p>}
// //         {!!loadError && !loading && <p className="text-red-400 text-sm">{loadError}</p>}

// //         {/* Prompts Grid */}
// //         {!loading && !loadError && (
// //           <>
// //             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
// //               {filteredPrompts.map((prompt) => (
// //                 <Card
// //                   key={prompt.id}
// //                   onClick={() => {
// //                     setDetailsPrompt(prompt);
// //                     setDetailsOpen(true);
// //                   }}
// //                   className="overflow-hidden cursor-pointer hover:scale-[1.01] transition-transform"
// //                   style={{ width: 306, height: 520, background: "#1C1C1C", borderRadius: 30 }}
// //                 >
// //                   <CardContent className="p-4 h-full flex flex-col">
// //                     {/* MEDIA */}
// //                     <div
// //                       className="relative w-full overflow-hidden group"
// //                       style={{ height: 240, borderRadius: 20, backgroundColor: "#0B0B0B" }}
// //                     >
// //                       {showImages ? (
// //                         <img src={prompt.imageUrl} alt={prompt.title} className="w-full h-full object-cover" />
// //                       ) : (
// //                         <>
// //                           <video
// //                             className="w-full h-full object-cover"
// //                             src={prompt.videoUrl}
// //                             loop
// //                             muted
// //                             playsInline
// //                             ref={(el) => {
// //                               if (!el) return;
// //                               if (playingVideo === prompt.id) el.play().catch(() => {});
// //                               else el.pause();
// //                             }}
// //                           />
// //                           <button
// //                             type="button"
// //                             onClick={(e) => {
// //                               e.stopPropagation();
// //                               handleVideoPlay(prompt.id);
// //                             }}
// //                             className="absolute inset-0 flex items-center justify-center"
// //                             aria-label={playingVideo === prompt.id ? "Pause" : "Play"}
// //                           >
// //                             <span className="w-12 h-12 rounded-full bg-black/60 hover:bg-black/75 grid place-items-center text-white transition-colors">
// //                               {playingVideo === prompt.id ? (
// //                                 <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
// //                                   <rect x="6" y="5" width="4" height="14" rx="1" />
// //                                   <rect x="14" y="5" width="4" height="14" rx="1" />
// //                                 </svg>
// //                               ) : (
// //                                 <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
// //                                   <path d="M8 5v14l11-7-11-7z" />
// //                                 </svg>
// //                               )}
// //                             </span>
// //                           </button>
// //                           <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">0:20</div>
// //                         </>
// //                       )}

// //                       {/* Category pill */}
// //                       <div
// //                         className="absolute top-3 left-3 px-3 py-1 text-[11px] font-semibold text-white rounded-full"
// //                         style={{ background: GRADIENT }}
// //                       >
// //                         {prompt.category?.toUpperCase()}
// //                       </div>

// //                       {/* Purchase to unlock */}
// //                       {!purchasedPrompts.includes(prompt.id) && (
// //                         <div
// //                           className="absolute top-11 left-3 mt-2 px-3 py-1 text-[11px] font-semibold text-white rounded-full"
// //                           style={{ background: GRADIENT }}
// //                         >
// //                           PURCHASE TO UNLOCK
// //                         </div>
// //                       )}

// //                       {/* Rating pill */}
// //                       <div className="absolute top-3 right-3">
// //                         <div className="flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-medium text-white bg-black/40 border border-white/40 backdrop-blur-sm">
// //                           <Star className="h-3.5 w-3.5 text-white" />
// //                           {typeof prompt.rating === "number" ? prompt.rating : "—"}
// //                         </div>
// //                       </div>
// //                     </div>

// //                     {/* TEXT */}
// //                     <div className="mt-4">
// //                       {prompt.preview && (
// //                         <p className="text-[12px] text-white/60 line-clamp-1">{prompt.preview}</p>
// //                       )}
// //                       <h3 className="mt-1 text-[18px] leading-snug font-semibold text-white line-clamp-2">
// //                         {prompt.title}
// //                       </h3>
// //                       <p className="mt-2 text-[13px] leading-relaxed text-white/70 line-clamp-2">
// //                         {prompt.description}
// //                       </p>
// //                     </div>

// //                     {/* FOOTER */}
// //                     <div className="mt-auto pt-4 flex items-center justify-between gap-3">
// //                       {/* Preview */}
// //                       <button
// //                         type="button"
// //                         onClick={(e) => {
// //                           e.stopPropagation();
// //                           handlePreview(prompt);
// //                         }}
// //                         className="w-10 h-10 rounded-full grid place-items-center"
// //                         style={{ background: "#333335" }}
// //                         aria-label="Preview"
// //                       >
// //                         <Eye className="h-4 w-4 text-white/85" />
// //                       </button>

// //                       {/* Save dropdown (cop.png) */}
// //                       <button
// //                         type="button"
// //                         onClick={(e) => {
// //                           e.stopPropagation();
// //                           setSaveAnchorEl(e.currentTarget as HTMLElement);
// //                           setSaveModalOpen(true);
// //                         }}
// //                         className="w-10 h-10 rounded-full grid place-items-center"
// //                         style={{ background: "#333335" }}
// //                         aria-label="Save menu"
// //                       >
// //                         <img src="/icons/cop.png" alt="Save" className="h-4 w-4 opacity-90" />
// //                       </button>

// //                       {/* Price (₹) */}
// //                       <div
// //                         className="flex items-center justify-center gap-[10px]"
// //                         style={{
// //                           width: 65,
// //                           height: 40,
// //                           borderRadius: 50,
// //                           padding: "10.5px 10px",
// //                           background: "#333335",
// //                         }}
// //                       >
// //                         <span className="text-[13px] text-white/90">
// //                           {prompt.isFree ? "FREE" : `₹${(prompt.price ?? 0).toFixed(2)}`}
// //                         </span>
// //                       </div>

// //                       {/* Purchase / Owned */}
// //                       {!purchasedPrompts.includes(prompt.id) ? (
// //                         <button
// //                           onClick={(e) => {
// //                             e.stopPropagation();
// //                             handlePurchase(prompt); // 🔗 calls [API #1] + Razorpay + [API #2]
// //                           }}
// //                           className="px-5 h-9 rounded-full text-white text-[13px] font-medium"
// //                           style={{ background: GRADIENT }}
// //                         >
// //                           Purchase
// //                         </button>
// //                       ) : (
// //                         <button
// //                           className="px-5 h-9 rounded-full text-white/80 text-[13px] font-medium bg-white/10 border border-white/15"
// //                           disabled
// //                         >
// //                           Owned
// //                         </button>
// //                       )}
// //                     </div>
// //                   </CardContent>
// //                 </Card>
// //               ))}
// //             </div>

// //             {/* Empty state */}
// //             {filteredPrompts.length === 0 && (
// //               <div className="text-center py-16">
// //                 <p
// //                   style={{ fontFamily: "Inter, sans-serif", fontWeight: 400, fontSize: "24px", lineHeight: "100%" }}
// //                   className="text-white"
// //                 >
// //                   {`Showing 0 premium prompts in ${selectedCategory || "All"}`}
// //                 </p>
// //                 <p
// //                   style={{ fontFamily: "Inter, sans-serif", fontWeight: 400, fontSize: "16px", lineHeight: "100%" }}
// //                   className="mt-3 text-white/80"
// //                 >
// //                   No prompts found matching your criteria.
// //                 </p>
// //                 <button
// //                   type="button"
// //                   onClick={() => {
// //                     setSearchQuery("");
// //                     setSelectedCategory("All");
// //                   }}
// //                   className="mx-auto mt-6 text-white"
// //                   style={{
// //                     width: "160px",
// //                     height: "50px",
// //                     borderRadius: "10px",
// //                     border: "1px solid #FFFFFF",
// //                     background: "transparent",
// //                   }}
// //                 >
// //                   Clear Filters
// //                 </button>
// //               </div>
// //             )}
// //           </>
// //         )}
// //       </div>

// //       <div className="mt-20">
// //         <Footer />
// //       </div>

// //       {/* Save dropdown modal anchored to cop.png */}
// //       <ModalComponent
// //         isOpen={saveModalOpen}
// //         onClose={() => setSaveModalOpen(false)}
// //         onSave={(payload) => {
// //           console.log("🟢 [SAVE] Modal payload", payload);
// //           toast({
// //             title: payload?.quick ? "Saved to All Saved" : "Collection created",
// //             description: payload?.quick
// //               ? "Prompt saved quickly to All Saved."
// //               : `Created collection: ${payload?.title || ""}`,
// //           });
// //         }}
// //         anchorRef={{ current: saveAnchorEl } as unknown as React.RefObject<HTMLElement>}
// //       />

// //       <MediaEnlargeModal
// //         isOpen={enlargeModalOpen}
// //         onClose={() => setEnlargeModalOpen(false)}
// //         mediaUrl={enlargeMedia?.url || ""}
// //         mediaType={enlargeMedia?.type || "image"}
// //         title={enlargeMedia?.title || ""}
// //       />

// //       <DetailsPrompt
// //         open={detailsOpen}
// //         onOpenChange={setDetailsOpen}
// //         prompt={detailsPrompt}
// //         owned={detailsPrompt ? purchasedPrompts.includes(String(detailsPrompt.id)) : false}
// //         onPurchase={(p) => {
// //           setDetailsOpen(false);
// //           handlePurchase(p);
// //         }}
// //         showImages={showImages}
// //         onEnlargeMedia={(m) => {
// //           setEnlargeMedia({ url: m.url, type: m.type, title: m.title });
// //           setEnlargeModalOpen(true);
// //         }}
// //       />
// //     </div>
// //   );
// // };

// // export default PromptMarketplacePage;




// // // src/pages/PromptMarketplacePage.tsx
// // import { useEffect, useRef, useState } from "react";
// // import { useNavigate } from "react-router-dom";
// // import { Card, CardContent } from "@/components/ui/card";
// // import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// // import {
// //   Search, Star, Eye, Video, Sparkles, History,
// //   ChevronLeft, ChevronRight, GraduationCap, Palette, FileText,
// //   BadgeDollarSign, Users, Plane, FlaskConical, Code2, BarChart3,
// //   LifeBuoy, Briefcase, Image as ImageIcon, ArrowLeft,
// //   SlidersHorizontal, Check, X,
// // } from "lucide-react";
// // import { User } from "lucide-react";

// // import { toast } from "@/components/ui/use-toast";
// // import Header from "@/components/Header";
// // import MediaEnlargeModal from "@/components/MediaEnlargeModal";
// // import PromptHistory from "@/components/PromptHistory";
// // import AppNavigation from "@/components/AppNavigation";
// // import TokenUsageSection from "@/components/TokenUsageSection";
// // import { useUserTokenUsage } from "@/hooks/useUserTokenUsage";
// // import Footer from "@/components/Footer";
// // import DetailsPrompt from "@/components/DetailsPrompt";
// // import { Button } from "@/components/ui/button";
// // import { useAuth } from "@/contexts/AuthContext";
// // import ModalComponent from "@/components/ModalComponent";
// //  import { ShoppingCart } from "lucide-react";
// //  import KycGateModal from "@/components/KycGateModal";
// //    import { useCart } from "@/contexts/CartContext";
// // type Prompt = {
// //   id: string;
// //   title: string;
// //   description: string;
// //   category: string;
// //   price?: number;
// //   rating?: number;
// //   downloads?: number;
// //   imageUrl?: string;
// //   videoUrl?: string;
// //   preview?: string;
// //   isFree?: boolean;
// //   createdAt?: string;
// //   fullPrompt?: string;
// //   exclusive?: boolean;
// //   sold?: boolean;

// //   uploaderName?: string;
// //   uploaderId?: string | null;
// //   uploaderAvatar?: string;
// // };

// // type FileType = "all" | "video" | "image" | "code";
// // type LicenseType = "all" | "free" | "premium" | "one-time";


// // const GRADIENT = "linear-gradient(270deg, #1A73E8 0%, #FF14EF 100%)";

// // const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, "");
// // const PROMPTS_BASE = `${API_BASE}/api/prompt`;
// // const PURCHASE_BASE = `${API_BASE}/api/purchase`;

// // // ⚠️ Keep your real Razorpay key id in env:
// // const RAZORPAY_KEY_ID = (import.meta as any).env?.VITE_RAZORPAY_KEY_ID || "rzp_test_TLG37MSt5U18rP";

// // /* ---------- Categories rail data (UI only) ---------- */

// // /* ---------- Categories scroller ---------- */
// // const CategoriesScroller: React.FC<{
// //   selectedCategory: string;
// //   setSelectedCategory: (c: string) => void;
// //   categoriesData: { id: string; icon: React.ComponentType<any> }[];
// // }> = ({ selectedCategory, setSelectedCategory, categoriesData }) => {


// //   const railRef = useRef<HTMLDivElement>(null);
// //   const slide = (dir: "left" | "right") => {
// //     const rail = railRef.current;
// //     if (!rail) return;
// //     rail.scrollBy({ left: dir === "left" ? -260 : 260, behavior: "smooth" });
// //   };

// //   return (
// //     <div className="w-full flex items-center justify-center gap-3">
// //       <button
// //         onClick={() => slide("left")}
// //         className="shrink-0 rounded-full grid place-items-center text-white"
// //         style={{ background: GRADIENT, width: 50, height: 50, borderRadius: "200px" }}
// //         aria-label="Scroll categories left"
// //       >
// //         <ChevronLeft className="w-5 h-5" />
// //       </button>

// //      <div className="relative w-full max-w-[1200px] overflow-hidden">
// //   <div
// //     ref={railRef}
// //     className="flex items-center gap-3 overflow-x-auto scroll-smooth px-1 no-scrollbar md:justify-center"
// //   >
// //     {categoriesData.map(({ id, icon: Icon }) => {
// //       const isAll = id === "All";
// //       const isActive = selectedCategory === id;
// //       const pillWidth = isAll ? "109.525px" : "185.628px";
// //       const baseStyle: React.CSSProperties = isActive
// //         ? { width: pillWidth, background: GRADIENT, color: "#FFFFFF" }
// //         : { width: pillWidth, background: "#17171A", color: "rgba(255,255,255,0.85)" };

// //       return (
// //         <button
// //           key={id}
// //           onClick={() => setSelectedCategory(id)}
// //           aria-pressed={isActive}
// //           className={[
// //             "flex items-center justify-center gap-[10px] h-[50px] rounded-[200px]",
// //             "text-sm font-medium whitespace-nowrap transition-colors",
// //             isActive ? "ring-1 ring-white/15" : "hover:bg-white/5",
// //           ].join(" ")}
// //           style={{ padding: "15px 30px", ...baseStyle }}
// //         >
// //           <Icon className="h-4 w-4" />
// //           <span>{id}</span>
// //         </button>
// //       );
// //     })}
// //   </div>
// // </div>

// //       <button
// //         onClick={() => slide("right")}
// //         className="shrink-0 rounded-full grid place-items-center text-white"
// //         style={{ background: GRADIENT, width: 50, height: 50, borderRadius: "200px" }}
// //         aria-label="Scroll categories right"
// //       >
// //         <ChevronRight className="w-5 h-5" />
// //       </button>
// //     </div>
// //   );
// // };

// // /* ---------- Small pill dropdown used below the search bar ---------- */
// // const PillDropdown = ({
// //   label,
// //   value,
// //   onChange,
// //   options,
// //   // optional: pass absolute positioning (e.g., { top: 687, left: 805 })
// //   positionStyle,
// // }: {
// //   label: string;
// //   value: string;
// //   onChange: (v: string) => void;
// //   options: { label: string; value: string; icon?: React.ComponentType<any> }[];
// //   positionStyle?: React.CSSProperties;
// // }) => {
// //   const [open, setOpen] = useState(false);

// //   return (
// //     <div className="relative" style={positionStyle}>
// //       <button
// //         type="button"
// //         onClick={() => setOpen((o) => !o)}
// //         aria-haspopup="listbox"
// //         aria-expanded={open}
// //         className="flex items-center justify-between gap-2 px-3"
// //         style={{
// //           width: 150,         // <- width: 150px
// //           height: 50,         // <- height: 50px
// //           borderRadius: 6,    // <- border-radius: 6px
// //           backgroundColor: "#121213",
// //           border: "1px solid #282829",
// //           opacity: 1,         // <- opacity: 1
// //         }}
// //       >
// //         <span className="text-white/80 text-sm truncate">{label}</span>
// //         <svg width="18" height="18" viewBox="0 0 24 24" className="text-white/80 shrink-0">
// //           <path fill="currentColor" d="M7 10l5 5 5-5z" />
// //         </svg>
// //       </button>

// //       {open && (
// //         <div
// //           role="listbox"
// //           className="absolute z-30 mt-2 p-2"
// //           style={{
// //             width: 150,            // match trigger width
// //             borderRadius: 6,       // match 6px radius
// //             backgroundColor: "#17171A",
// //             border: "1px solid #282829",
// //           }}
// //         >
// //           {options.map((opt) => {
// //             const Icon = opt.icon;
// //             const selected = opt.value === value;
// //             return (
// //               <button
// //                 key={opt.value}
// //                 role="option"
// //                 aria-selected={selected}
// //                 onClick={() => {
// //                   onChange(opt.value);
// //                   setOpen(false);
// //                 }}
// //                 className={[
// //                   "w-full flex items-center gap-2 px-2 text-left rounded-[6px]",
// //                   selected ? "bg-white/10 text-white" : "text-white/85 hover:bg-white/5",
// //                 ].join(" ")}
// //                 style={{ height: 40 }}  // tidy row height
// //               >
// //                 {Icon ? <Icon className="h-4 w-4" /> : null}
// //                 <span className="text-sm truncate">{opt.label}</span>
// //               </button>
// //             );
// //           })}
// //         </div>
// //       )}
// //     </div>
// //   );
// // };


// // const PromptMarketplacePage = () => {
// //   const navigate = useNavigate();
// //   const { totalTokensUsed, tokenLimit } = useUserTokenUsage();
// //   const { token , user} = useAuth?.() || ({} as any);
// //   const { addToCart } = useCart();
// //   const currentUserId = user?._id || user?.id || null;
// //   const [searchQuery, setSearchQuery] = useState("");
// //   const [selectedCategory, setSelectedCategory] = useState("All");
// //     const [kycOpen, setKycOpen] = useState(false);
// // const [pendingPurchasePrompt, setPendingPurchasePrompt] = useState<Prompt | null>(null);
// // const [retryPrompt, setRetryPrompt] = useState<Prompt | null>(null);
// //   // NEW: dropdown filters
// //   const [fileType, setFileType] = useState<FileType>("all");
// //   const [licenseType, setLicenseType] = useState<LicenseType>("all");
// // const [apiCategories, setApiCategories] = useState<string[]>([]);
// //   const [playingVideo, setPlayingVideo] = useState<string | number | null>(null);

// //   const [prompts, setPrompts] = useState<Prompt[]>([]);
// //   const [loading, setLoading] = useState(false);
// //   const [loadError, setLoadError] = useState<string | null>(null);

// //   // IDs of prompts user already owns
// //   const [purchasedPrompts, setPurchasedPrompts] = useState<string[]>([]);

// //   const [enlargeModalOpen, setEnlargeModalOpen] = useState(false);
// //   const [enlargeMedia, setEnlargeMedia] = useState<{ url: string; type: "image" | "video"; title: string } | null>(null);

// //   const [showHistory, setShowHistory] = useState(false);
// //   const [detailsOpen, setDetailsOpen] = useState(false);
// //   const [detailsPrompt, setDetailsPrompt] = useState<any>(null);
// //   // top-level state (near other state)
// // const [saveForPromptId, setSaveForPromptId] = useState<string | null>(null);
// // const [saveForPrompt, setSaveForPrompt] = useState<Prompt | null>(null);

// //   // Save modal (anchored to cop.png)
// //   const [saveModalOpen, setSaveModalOpen] = useState(false);
// //   const [saveAnchorEl, setSaveAnchorEl] = useState<HTMLElement | null>(null);
   

// // const [latestPurchase, setLatestPurchase] = useState<any | null>(null);
// // const [categoriesModalOpen, setCategoriesModalOpen] = useState(false);
// // const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
// // const [draftCategories, setDraftCategories] = useState<string[]>([]);




// // const categoriesData = [
// //   { id: "All", icon: Sparkles },
// //   ...apiCategories.map((name) => ({
// //     id: name,
// //     icon: Sparkles,
// //   })),
// // ];
// // const categoryOptions = categoriesData.filter((item) => item.id !== "All");

// // const openCategoriesModal = () => {
// //   setDraftCategories(
// //     selectedCategories.length
// //       ? selectedCategories
// //       : selectedCategory !== "All"
// //       ? [selectedCategory]
// //       : []
// //   );
// //   setCategoriesModalOpen(true);
// // };





// // const toggleDraftCategory = (categoryId: string) => {
// //   setDraftCategories((prev) =>
// //     prev.includes(categoryId)
// //       ? prev.filter((id) => id !== categoryId)
// //       : [...prev, categoryId]
// //   );
// // };

// // const applyCategorySelection = () => {
// //   setSelectedCategories(draftCategories);
// //   if (draftCategories.length) {
// //     setSelectedCategory("All");
// //   }
// //   setCategoriesModalOpen(false);
// // };

// // const clearCategorySelection = () => {
// //   setSelectedCategories([]);
// //   setDraftCategories([]);
// //   setSelectedCategory("All");
// //   setCategoriesModalOpen(false);
// // };

// // const effectiveCategoryFilter =
// //   selectedCategories.length > 0
// //     ? selectedCategories
// //     : selectedCategory !== "All"
// //     ? [selectedCategory]
// //     : [];






// //   // Razorpay script ready?
// //   const [rzpReady, setRzpReady] = useState(false);
// //    const [showSuccessPopup, setShowSuccessPopup] = useState(false);
// // const [buyerName, setBuyerName] = useState<string>(""); 

// //   /* ---------- Load Razorpay script once ---------- */
// //   useEffect(() => {
// //     if ((window as any).Razorpay) {
// //       setRzpReady(true);
// //       return;
// //     }
// //     const script = document.createElement("script");
// //     script.src = "https://checkout.razorpay.com/v1/checkout.js";
// //     script.async = true;
// //     script.onload = () => setRzpReady(true);
// //     script.onerror = () => setRzpReady(false);
// //     document.body.appendChild(script);
// //   }, []);

// //   /* ---------- [API #3] Load purchase history ---------- */
// //   useEffect(() => {
// //     if (!token) return;
// //     (async () => {
// //       try {
// //         const res = await fetch(`${PURCHASE_BASE}/history`, {
// //           headers: { Authorization: `Bearer ${token}` },
// //           credentials: "include",
// //         });
// //         const body = await res.json();
// //         if (!res.ok || !body?.success) return;
// //         const ownedIds = (body.purchases || [])
// //           .map((p: any) => {
// //             if (p?.prompt && typeof p.prompt === "object") return String(p.prompt._id);
// //             if (p?.prompt && typeof p.prompt === "string") return p.prompt;
// //             return null;
// //           })
// //           .filter(Boolean);
// //         setPurchasedPrompts((prev) => Array.from(new Set([...(prev || []), ...ownedIds])));
// //       } catch (e) {
// //         console.error("[History] fetch failed", e);
// //       }
// //     })();
// //   }, [token]);






// //   useEffect(() => {
// //   const loadCategories = async () => {
// //     try {
// //       const res = await fetch(`${API_BASE}/api/category`);
// //       const data = await res.json();

// //       if (res.ok && data?.success) {
// //         setApiCategories(data.categories.map((c: any) => c.name));
// //       }
// //     } catch (err) {
// //       console.error("Failed to load categories", err);
// //     }
// //   };

// //   loadCategories();
// // }, []);





// //   /* ---------- Fetch prompts ---------- */
// //   useEffect(() => {
// //     const fetchPrompts = async () => {
// //       try {
// //         setLoading(true);
// //         setLoadError(null);

// //         const params = new URLSearchParams();
// //         // backend hinting (safe even if server ignores)
// //         params.set("type", fileType); // all | video | image | code
// //         params.set("license", licenseType); // all | free | premium
// //         if (selectedCategory && selectedCategory !== "All") {
// //           params.set("category", selectedCategory);
// //         }

// //         const res = await fetch(`${PROMPTS_BASE}/others?${params.toString()}`, {
// //           headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
// //           credentials: "include",
// //         });
// //         const data = await res.json();

// //         if (!res.ok || !data?.success) {
// //           throw new Error(data?.error || "server_error");
// //         }

// // //     const mapped: Prompt[] = (data.prompts || []).map((doc: any) => {
// // //   const att = doc?.attachment || null;
// // //   const mediaPath = att?.path ? `${API_BASE}${att.path}` : undefined;

// // //   return {
// // //     id: String(doc._id),
// // //     title: doc.title || "Untitled",
// // //     description: doc.description || "",
// // //     category:
// // //       (doc.categories?.[0]?.name as string) ||
// // //       (Array.isArray(doc.categories) ? doc.categories.join(", ") : "") ||
// // //       "General",
// // //     price: typeof doc.price === "number" ? doc.price : 0,
// // //     rating: typeof doc.averageRating === "number" ? doc.averageRating : undefined,
// // //     downloads: doc.downloads || 0,
// // //     imageUrl: att?.type === "image" ? mediaPath : undefined,
// // //     videoUrl: att?.type === "video" ? mediaPath : undefined,
// // //     preview:
// // //       (doc.description && String(doc.description).slice(0, 140)) ||
// // //       (doc.promptText && String(doc.promptText).slice(0, 140)) ||
// // //       "",
// // //     isFree: !!doc.free,
// // //     createdAt: doc.createdAt,
// // //     exclusive: !!doc.exclusive,
// // //     sold: !!doc.sold, // ✅ Add this line (make sure backend sends `sold: true` when sold)

// // // uploaderName: doc?.userId?.name || "Unknown",
// // // uploaderAvatar: "/icons/default-user.png",  // always default (no avatar)



// // //   };
// // // });

// // const mapped: Prompt[] = (data.prompts || []).map((doc: any) => {
// //   const att = doc?.attachment || null;
// //   // const mediaPath = att?.path ? `${API_BASE}${att.path}` : undefined;
// //   const mediaPath = att?.path
// //   ? att.path.startsWith("http")
// //     ? att.path
// //     : `${API_BASE}${att.path}`
// //   : undefined;
// //   return {
// //     id: String(doc._id),
// //     title: doc.title || "Untitled",
// //     description: doc.description || "",
// //     category:
// //       (doc.categories?.[0]?.name as string) ||
// //       (Array.isArray(doc.categories) ? doc.categories.join(", ") : "") ||
// //       "General",

// //     price: typeof doc.price === "number" ? doc.price : 0,
// //     rating: typeof doc.averageRating === "number" ? doc.averageRating : undefined,
// //     imageUrl: att?.type === "image" ? mediaPath : undefined,
// //     videoUrl: att?.type === "video" ? mediaPath : undefined,
// //     preview:
// //       (doc.description && String(doc.description).slice(0, 140)) ||
// //       (doc.promptText && String(doc.promptText).slice(0, 140)) ||
// //       "",

// //     isFree: !!doc.free,
// //     exclusive: !!doc.exclusive,
// //     sold: !!doc.sold,

// //     // ⭐⭐ THIS IS WHAT YOU ASKED FOR
// //     uploaderName: doc?.userId?.name || "Unknown",
// //     uploaderId: doc?.userId?._id || null,

// //     // avatar if needed
// //     uploaderAvatar: "/icons/default-user.png"
// //   };
// // });



// //         setPrompts(mapped);
// //       } catch (err: any) {
// //         console.error("Failed to load prompts", err);
// //         setLoadError(err?.message || "Failed to load prompts");
// //         toast({
// //           title: "Couldn’t load prompts",
// //           description: err?.message || "Please try again.",
// //           // //         });
// //       } finally {
// //         setLoading(false);
// //       }
// //     };

// //     fetchPrompts();
// //   }, [fileType, licenseType, selectedCategory, token]);

// //   /* ---------- Derived: local search + filter ---------- */
// // const filteredPrompts = prompts.filter((p) => {
// //   if (searchQuery.trim()) {
// //     const q = searchQuery.toLowerCase();
// //     if (
// //       !p.title.toLowerCase().includes(q) &&
// //       !(p.description || "").toLowerCase().includes(q)
// //     ) {
// //       return false;
// //     }
// //   }

// //   if (licenseType === "free" && !p.isFree) return false;
// //   if (licenseType === "premium" && !(p.price && p.price > 0)) return false;
// //   if (licenseType === "one-time" && !p.exclusive) return false;

// //   if (fileType === "video" && !p.videoUrl) return false;
// //   if (fileType === "image" && !p.imageUrl) return false;
// //   if (fileType === "code" && p.category.toLowerCase() !== "code") return false;

// //   if (effectiveCategoryFilter.length > 0) {
// //     const promptCategories = String(p.category || "")
// //       .split(",")
// //       .map((item) => item.trim());

// //     const hasCategoryMatch = effectiveCategoryFilter.some((cat) =>
// //       promptCategories.includes(cat)
// //     );

// //     if (!hasCategoryMatch) return false;
// //   }

// //   return true;
// // });

// //   /* ---------- Helpers ---------- */
// //   const decideMediaType = (prompt: Prompt): "video" | "image" => {
// //     if (fileType === "video") return "video";
// //     if (fileType === "image") return "image";
// //     // "all" or "code": prefer video if available, else image
// //     return prompt.videoUrl ? "video" : "image";
// //   };

// //   const handleVideoPlay = (promptId: string | number) => {
// //     setPlayingVideo((prev) => (prev === promptId ? null : promptId));
// //   };

// //   const handlePreview = (prompt: Prompt) => {
// //     if (purchasedPrompts.includes(prompt.id)) {
// //       toast({ title: "Full Prompt Access", description: `You have full access to "${prompt.title}"` });
// //     } else {
// //       toast({ title: "Preview Mode", description: `Showing preview for "${prompt.title}". Purchase to see full prompt.` });
// //     }
// //   };


// //   const isOwnPrompt = (prompt: Prompt) => {
// //   if (!currentUserId || !prompt?.uploaderId) return false;
// //   return String(prompt.uploaderId) === String(currentUserId);
// // };

// //   /** PURCHASE FLOW — integrates CREATE ORDER (+ verify) with detailed consoles */
// //  const handlePurchase = async (prompt: Prompt) => {
// //   if (isOwnPrompt(prompt)) {
// //     toast({
// //       title: "Not allowed",
// //       description: "You cannot buy your own prompt.",
// //       // //     });
// //     return;
// //   }

// //   if (!token) {
// //     toast({
// //       title: "Please log in",
// //       description: "You must be logged in to purchase.",
// //       // //     });
// //     return;
// //   }
    
// //     if (!rzpReady) {
// //       toast({ title: "Loading payment…", description: "Razorpay is still initializing." });
// //       return;
// //     }

// //     try {
// //       // [API #1] CREATE ORDER
// //       const res = await fetch(`${PURCHASE_BASE}/create-order/${prompt.id}`, {
// //         method: "POST",
// //         headers: {
// //           "Content-Type": "application/json",
// //           Authorization: `Bearer ${token}`,
// //         },
// //         credentials: "include",
// //       });
// //       const data = await res.json();
// //       if (res.status === 403 && (data?.error === "KYC_REQUIRED" || data?.code === "KYC_REQUIRED")) {
// //   setPendingPurchasePrompt(prompt);
// //   setKycOpen(true);
// //   return;
// // }

     
// //         if (res.status === 403 && data?.error === "KYC_REQUIRED") {
// //     setRetryPrompt(prompt);
// //     setKycOpen(true);
// //     return;
// //   }


// //       if (!res.ok || !data?.success || !data?.order) {
// //         throw new Error(data?.error || "order_create_failed");
// //       }
 
// //       const order = data.order;

// //       // Razorpay Checkout
// //       const options: any = {
// //         key: RAZORPAY_KEY_ID,
// //         amount: Number(order.amount),
// //         currency: order.currency || "INR",
// //         name: "Tokun",
// //         description: `Purchase: ${prompt.title}`,
// //         order_id: order.id,
// //         notes: { promptId: prompt.id },
// //         theme: { color: "#1A73E8" },
// //         handler: async (response: any) => {
// //           try {
// //             // [API #2] VERIFY PAYMENT
// //             const vr = await fetch(`${PURCHASE_BASE}/verify/${prompt.id}`, {
// //               method: "POST",
// //               headers: {
// //                 "Content-Type": "application/json",
// //                 Authorization: `Bearer ${token}`,
// //               },
// //               credentials: "include",
// //               body: JSON.stringify({
// //                 razorpayPaymentId: response.razorpay_payment_id,
// //                 razorpayOrderId: response.razorpay_order_id,
// //                 razorpaySignature: response.razorpay_signature,
// //                 pricePaid: order.amount / 100,
// //               }),
// //             });

// //             const vb = await vr.json();
// //          if (vb?.success) {
// //   const purchasedId = prompt.id;

// //   setPurchasedPrompts((prev) =>
// //     prev.includes(purchasedId) ? prev : [...prev, purchasedId]
// //   );

// //   setLatestPurchase(vb.purchase || null);

// //   try {
// //     window.dispatchEvent(
// //       new CustomEvent("tokun:purchased", { detail: vb.purchase })
// //     );
// //   } catch {}

// //   setBuyerName(vb?.user?.name || "there");
// //   setShowSuccessPopup(true);

// //   toast({
// //     title: "Payment Successful",
// //     description: "You now own this prompt.",
// //   });
// // } else {
// //               toast({ title: "Verification Failed", description: vb?.error || "Unknown error" });
// //             }
// //           } catch (err) {
// //             console.error("Verify error", err);
// //             toast({ title: "Verification Error", description: "Could not verify payment." });
// //           }
// //         },
// //       };

// //       const rzp = new (window as any).Razorpay(options);
// //       rzp.on("payment.failed", function () {
// //         toast({ title: "Payment Failed", description: "Please try again." });
// //       });
// //       rzp.open();
// //     } catch (err: any) {
// //       console.error("Purchase flow error", err);
// //       toast({ title: "Purchase Error", description: err?.message || "Something went wrong." });
// //     }
// //   };

// //   if (showHistory) {
// //     return (
// //       <div className="min-h-screen bg-[#07080A] text-white">
// //         <div className="container mx-auto px-6 py-8">
// //           <Header />
// //             <Header />
// //           <div className="flex items-center gap-4 mb-8">
// //             <Button
// //               variant="ghost"
// //               onClick={() => setShowHistory(false)}
// //               className="flex items-center gap-2 hover:bg-white/10"
// //             >
// //               <ArrowLeft className="h-4 w-4" />
// //               Back to Marketplace
// //             </Button>
// //             <div className="h-6 w-px bg-white/10" />
// //           </div>

// //           {/* PromptHistory fetches [API #3] internally and also listens to tokun:purchased */}
// //           <PromptHistory />
// //         </div>
// //         <Footer />
// //       </div>
// //     );
// //   }

// // const ensureKycVerified = async (promptToBuy?: Prompt) => {
// //   if (!token) return false;

// //   try {
// //     // const res = await fetch(`${API_BASE}/api/kyc/status`, {
// //       const res = await  fetch(`http://localhost:5000/api/kyc/status` ,{
// //       headers: { Authorization: `Bearer ${token}` },
// //       credentials: "include",
// //     });
// //     const data = await res.json().catch(() => ({}));
// //     const s = data?.kycStatus || data?.status;

// //     if (s === "VERIFIED") return true;

// //     // open KYC UI
// //     if (promptToBuy) setPendingPurchasePrompt(promptToBuy);
// //     setKycOpen(true);
// //     return false;
// //   } catch {
// //     // if status api fails, still open UI (safer)
// //     if (promptToBuy) setPendingPurchasePrompt(promptToBuy);
// //     setKycOpen(true);
// //     return false;
// //   }
// // };



// // const savePromptToCollections = async ({
// //   refId,
// //   collectionTitle, // optional
// //   name,            // optional item label
// // }: {
// //   refId: string;
// //   collectionTitle?: string;
// //   name?: string;
// // }) => {
// //   if (!token) {
// //     toast({
// //       title: "Please log in",
// //       description: "You need to be logged in to save prompts.",
// //       // //     });
// //     return { ok: false };
// //   }

// //   try {
// //     const res = await fetch(`${API_BASE}/api/saved-collections`, {
// //       method: "POST",
// //       headers: {
// //         "Content-Type": "application/json",
// //         Authorization: `Bearer ${token}`,
// //       },
// //       credentials: "include",
// //       body: JSON.stringify({
// //         section: "prompt",      // 👈 you asked for Prompt model
// //         refId,                  // prompt._id
// //         // When collectionTitle is provided, backend saves inside that collection;
// //         // Otherwise it goes to directItems (All Saved).
// //         ...(collectionTitle ? { collectionTitle } : {}),
// //         ...(name ? { name } : {}),
// //       }),
// //     });

// //     const data = await res.json();
// //     if (!res.ok || !data?.success) {
// //       throw new Error(data?.error || "server_error");
// //     }
// //     return { ok: true, data };
// //   } catch (err: any) {
// //     toast({
// //       title: "Save failed",
// //       description: err?.message || "Could not save this prompt.",
// //       // //     });
// //     return { ok: false };
// //   }
// // };



// //   return (
// //  <div className="dark relative min-h-screen bg-[#07080A] text-foreground overflow-x-hidden">
// //   <img
// //     src="/icons/mpbg.png"
// //     alt="background"
// //     className="fixed inset-0 z-0 w-full h-screen object-contain object-top pointer-events-none select-none"
// //   />


// //       {/* Header + token usage */}
// //      {/* 🔹 Full-width compact Header */}
// // <div className="relative z-20 w-full bg-transparent px-4">
// //     <Header />
// //   <Header />
// // </div>



// //       {/* Main Content */}
// //   <div className="relative z-10 container mx-auto px-6 pb-16">
// //         {/* History Button */}
// //         {/* <div className="flex justify-between items-center mb-12">
// //           <Button
// //             variant="outline"
// //             onClick={() => setShowHistory(true)}
// //             className="flex items-center gap-2 hover:bg-tokun/10 hover:text-tokun hover:border-tokun/30"
// //           >
// //             <History className="h-4 w-4" />
// //             Purchase History
// //           </Button>
// //         </div> */}

// //         {/* Title + blurb */}
// //       {/* Section spacing below Header */}
// // {/* <div className="mt-10 flex flex-col items-center text-center mb-12">
  
// //   <h1
// //     style={{
// //       fontFamily: "Inter",
// //       fontWeight: 700,
// //       fontStyle: "normal",
// //       fontSize: "64px",
// //       lineHeight: "74px",
// //       textAlign: "center",
// //       color: "#FFFFFF",
// //       marginBottom: "0px",
// //     }}
// //   >
// //     Prompt
// //   </h1>

  
// //   <h2
// //     style={{
// //       fontFamily: "Inter",
// //       fontWeight: 700,
// //       fontStyle: "normal",
// //       fontSize: "64px",
// //       lineHeight: "74px",
// //       textAlign: "center",
// //       color: "#FFFFFF",
// //       marginTop: "0px",
// //     }}
// //   >
// //     Marketplace
// //   </h2>

 
// //   <p
// //     style={{
// //       fontFamily: "Inter",
// //       fontWeight: 400,
// //       fontStyle: "normal",
// //       fontSize: "16px",
// //       lineHeight: "140%",
// //       textAlign: "center",
// //       color: "rgba(255,255,255,0.8)",
// //       marginTop: "18px",
// //       maxWidth: "680px", // wider for natural 2-line wrap
// //     }}
// //   >
// //     Discover and purchase premium AI prompts created by experts from around the world. 
// //     Transform your ideas into reality with our curated collections.
// //   </p>
// // </div> */}

// //           <div className="mt-20 sm:mt-20 md:mt-28 flex flex-col items-center text-center mb-12 px-4">
// //   {/* Prompt */}
// //   <h1 className="text-white font-bold leading-tight 
// //     text-[36px] sm:text-[48px] md:text-[64px]">
// //     Prompt
// //   </h1>

// //   {/* Marketplace */}
// //   <h2 className="text-white font-bold leading-tight 
// //     text-[36px] sm:text-[48px] md:text-[64px]">
// //     Marketplace
// //   </h2>

// //   {/* Description */}
// //   <p className="text-white/80 mt-4 max-w-[680px] text-sm sm:text-base leading-relaxed">
// //     Discover and purchase premium AI prompts created by experts from around the world.
// //     Transform your ideas into reality with our curated collections.
// //   </p>
// // </div>


// //         {/* Navigation + Search/Filters */}
// //         <div className="mt-4 flex justify-center">
// //   <AppNavigation activeSection="prompt-marketplace" />
// // </div>
// //         <div className="mt-6"></div>


// //         {/* Search + NEW FILTER BAR */}
// //         <div className="space-y-6 mb-12">
// //           <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
// //             {/* Search pill */}
// //             <div
// //               className="flex items-center w-full sm:w-[700px] h-[50px] rounded-[200px] overflow-hidden"
// //               style={{ backgroundColor: "#121213", border: "1px solid #282829" }}
// //             >
// //               <Search className="h-5 w-5 text-white/40 ml-4" />
// //               <input
// //                 placeholder="Search premium prompts..."
// //                 value={searchQuery}
// //                 onChange={(e) => setSearchQuery(e.target.value)}
// //                 className="ml-3 flex-1 bg-transparent outline-none text-white placeholder:text-white/40 text-sm md:text-base"
// //               />
// //               <button
// //                 onClick={() => {/* client-side filter only */}}
// //                 className="text-white font-medium"
// //                 style={{
// //                   width: "100px",
// //                   height: "40px",
// //                   borderRadius: "200px",
// //                   background: "linear-gradient(90deg, #FF14EF 0%, #1A73E8 100%)",
// //                   marginRight: "5px",
// //                 }}
// //               >
// //                 Search
// //               </button>
// //             </div>
// //           </div>

// //           {/* NEW: File type + License type pills (like your screenshots) */}
// //           <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
// //             <PillDropdown
// //               label={
// //                 fileType === "all"
// //                   ? "File type"
// //                   : fileType === "video"
// //                   ? "Video"
// //                   : fileType === "image"
// //                   ? "Image"
// //                   : "Code"
// //               }
// //               value={fileType}
// //               onChange={(v) => setFileType(v as FileType)}
// //               options={[
// //                 { label: "All type", value: "all" },
// //                 { label: "Video", value: "video", icon: Video },
// //                 { label: "Image", value: "image", icon: ImageIcon },
// //                 { label: "Code", value: "code", icon: Code2 },
// //               ]}
// //             />

// //           <PillDropdown
// //   label={
// //     licenseType === "all"
// //       ? "License type"
// //       : licenseType === "free"
// //       ? "Free"
// //       : licenseType === "premium"
// //       ? "Premium"
// //       : "One-time Purchase"
// //   }
// //   value={licenseType}
// //   onChange={(v) => setLicenseType(v as LicenseType)}
// //   options={[
// //     { label: "All type", value: "all" },
// //     { label: "Free", value: "free" },
// //     { label: "Premium", value: "premium" },
// //     { label: "One-time Purchase", value: "one-time" }, // ✅ added
// //   ]}
// // />

// //           </div>

// //           {/* <CategoriesScroller selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory} /> */}



// //           <div className="space-y-4">
// //   <div className="flex flex-wrap items-center justify-center gap-3">
// //     <button
// //       type="button"
// //       onClick={openCategoriesModal}
// //       className="flex items-center gap-2 px-4 h-[46px] rounded-full text-white border border-white/10 bg-[#17171A] hover:bg-white/5 transition-colors"
// //     >
// //       <SlidersHorizontal className="h-4 w-4" />
// //       <span className="text-sm font-medium">
// //         Select Categories
// //         {selectedCategories.length > 0 ? ` (${selectedCategories.length})` : ""}
// //       </span>
// //     </button>

// //     {selectedCategories.length > 0 && (
// //       <button
// //         type="button"
// //         onClick={clearCategorySelection}
// //         className="px-4 h-[46px] rounded-full text-white/80 border border-white/10 bg-[#121213] hover:bg-white/5 transition-colors text-sm"
// //       >
// //         Clear Selection
// //       </button>
// //     )}
// //   </div>

// //   {selectedCategories.length > 0 && (
// //     <div className="flex flex-wrap items-center justify-center gap-2">
// //       {selectedCategories.map((category) => (
// //         <span
// //           key={category}
// //           className="px-3 py-1.5 rounded-full text-xs text-white border border-white/10 bg-white/5"
// //         >
// //           {category}
// //         </span>
// //       ))}
// //     </div>
// //   )}

// //   <CategoriesScroller
// //   categoriesData={categoriesData}
// //   selectedCategory={selectedCategory}
// //   setSelectedCategory={(category) => {
// //     setSelectedCategories([]);
// //     setSelectedCategory(category);
// //   }}
// // />
// // </div>
// //         </div>

// //         {/* Loading / error states */}
// //         {loading && <p className="text-white/70 text-sm">Loading prompts…</p>}
// //         {!!loadError && !loading && <p className="text-red-400 text-sm">{loadError}</p>}

// //         {/* Prompts Grid */}
// //         {!loading && !loadError && (
// //           <>
// //             <div className="
// //   grid 
// //   grid-cols-1 
// //   md:grid-cols-2 
// //   lg:grid-cols-3 
// //   xl:grid-cols-4 
// //   gap-8 
// //   justify-items-center
// // ">
// //               {filteredPrompts.map((prompt) => {
// //                 const mediaKind = decideMediaType(prompt); // "video" | "image"
// //                 const isPurchased = purchasedPrompts.includes(String(prompt.id));
// //                 return (
// //                   <Card
// //                     key={prompt.id}
// //                     onClick={() => {
// //                       setDetailsPrompt(prompt);
// //                       setDetailsOpen(true);
// //                     }}
// //                     className="w-full max-w-[306px] overflow-hidden cursor-pointer hover:scale-[1.01] transition-transform"
// // style={{ height: 520, background: "#1C1C1C", borderRadius: 30 }}
// //                   >
// //                     <CardContent className="p-4 h-full flex flex-col">
// //                       {/* MEDIA */}
// //                       <div
// //                         className="relative w-full overflow-hidden group"
// //                         style={{ height: 240, borderRadius: 20, backgroundColor: "#0B0B0B" }}
// //                       >
// //                         {mediaKind === "image" ? (
// //                           <img src={prompt.imageUrl} alt={prompt.title} className="w-full h-full object-cover" />
// //                         ) : (
// //                           <>
// //                             <video
// //                               className="w-full h-full object-cover"
// //                               src={prompt.videoUrl}
// //                               loop
// //                               muted
// //                               playsInline
// //                               ref={(el) => {
// //                                 if (!el) return;
// //                                 if (playingVideo === prompt.id) el.play().catch(() => {});
// //                                 else el.pause();
// //                               }}
// //                             />
// //                             <button
// //                               type="button"
// //                               onClick={(e) => {
// //                                 e.stopPropagation();
// //                                 handleVideoPlay(prompt.id);
// //                               }}
// //                               className="absolute inset-0 flex items-center justify-center"
// //                               aria-label={playingVideo === prompt.id ? "Pause" : "Play"}
// //                             >
// //                               <span className="w-12 h-12 rounded-full bg-black/60 hover:bg-black/75 grid place-items-center text-white transition-colors">
// //                                 {playingVideo === prompt.id ? (
// //                                   <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
// //                                     <rect x="6" y="5" width="4" height="14" rx="1" />
// //                                     <rect x="14" y="5" width="4" height="14" rx="1" />
// //                                   </svg>
// //                                 ) : (
// //                                   <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
// //                                     <path d="M8 5v14l11-7-11-7z" />
// //                                   </svg>
// //                                 )}
// //                               </span>
// //                             </button>
// //                             <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">0:20</div>
// //                           </>
// //                         )}


                        




// //                         {/* Category pill */}
// //                         <div
// //                           className="absolute top-3 left-3 px-3 py-1 text-[11px] font-semibold text-white rounded-full"
// //                           style={{ background: GRADIENT }}
// //                         >
// //                           {prompt.category?.toUpperCase()}
// //                         </div>

// //                         {/* Purchase to unlock */}
// //                     {!isPurchased ? (
// //   <div
// //     className="absolute top-11 left-3 mt-2 px-3 py-1 text-[11px] font-semibold rounded-full"
// //     style={{
// //       background: prompt.exclusive ? "#2A2A2A" : GRADIENT,
// //       color: prompt.exclusive ? "#4ADE80" : "#FFFFFF",
// //     }}
// //   >
// //     {prompt.exclusive ? "ONE-TIME PURCHASE" : "PURCHASE TO UNLOCK"}
// //   </div>
// // ) : (
// //   <div
// //     className="absolute top-11 left-3 mt-2 px-3 py-1 text-[11px] font-semibold rounded-full"
// //     style={{
// //       background: "#14532D",
// //       color: "#BBF7D0",
// //     }}
// //   >
// //     PURCHASED
// //   </div>
// // )}


// //                         {/* Rating pill */}
// //                       {/* Rating / Premium Icon pill */}
// // <div className="absolute top-3 right-3">
// //   {!prompt.isFree && prompt.price && prompt.price > 0 ? (
// //     <div
// //       className="flex items-center justify-center rounded-full"
// //       style={{
// //         width: 32,
// //         height: 32,
// //         backgroundColor: "black",
// //       }}
// //     >
// //       <img
// //         src="/icons/premium.png"
// //         alt="Premium"
// //         className={`w-5 h-5 object-contain ${
// //           prompt.exclusive ? "filter-green" : ""
// //         }`}
// //       />
// //     </div>
// //   ) : null}
// // </div>

// //      {/* Uploader Row */}




// //                       </div>

       
// //                    <div className="flex items-center gap-2 mt-3">

// //   {/* Default avatar icon */}
// //   <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center">
// //     <User className="w-4 h-4 text-white/70" />
// //   </div>

// //   {/* <span className="text-white/80 text-sm">
// //     {prompt.uploaderName || "Unknown"}
// //   </span> */}

// //   <span
// //   className="text-white/80 text-sm hover:underline cursor-pointer"
// //   onClick={(e) => {
// //     e.stopPropagation();
// //     navigate(`/profile/${prompt.uploaderId}`);
// //   }}
// // >
// //   {prompt.uploaderName || "Unknown"}
// // </span>


// //   <div className="flex items-center ml-auto text-white/80 text-sm gap-1">
// //     <Star className="w-4 h-4 text-yellow-400" />
// //     <span>{prompt.rating?.toFixed(1) || "0.0"}</span>
// //   </div>
// // </div>


                      

// //                       {/* TEXT */}
// //                       <div className="mt-4">
                       
// //                         <h3 className="mt-1 text-[18px] leading-snug font-semibold text-white line-clamp-2">
// //                           {prompt.title}
// //                         </h3>
// //                         <p className="mt-2 text-[13px] leading-relaxed text-white/70 line-clamp-2">
// //                           {prompt.description}
// //                         </p>
// //                       </div>

// //                       {/* FOOTER */}
// //                        {/* FOOTER */}
// // {/* FOOTER */}
// // <div className="mt-auto pt-4 flex items-center gap-[10px]">
// //   {prompt.isFree ? (
// //     // FREE pill
// //     <div
// //       className="flex items-center justify-center text-sm font-medium"
// //       style={{
// //         width: "89.814px",
// //         height: "40px",
// //         borderRadius: "8px",
// //         background: "#333335",
// //         color: "#FFFFFF",
// //       }}
// //     >
// //       FREE
// //     </div>
// //   ) : (
// //     <>
// //       {/* Price pill */}
// //       <div
// //         className="flex items-center justify-center text-sm font-medium text-white/90"
// //         style={{
// //           width: "89.814px",
// //           height: "40px",
// //           borderRadius: "8px",
// //           background: "#333335",
// //         }}
// //       >
// //         ₹{(prompt.price ?? 0).toFixed(2)}
// //       </div>

// //       {/* Cart pill */}
// //     {!isOwnPrompt(prompt) && (
// //   <button
// //     type="button"
// //     onClick={(e) => {
// //       e.stopPropagation();
// //       addToCart(prompt.id);
// //       toast({
// //         title: "Added to Cart",
// //         description: `"${prompt.title}" was added.`,
// //       });
// //     }}
// //     className="flex items-center justify-center gap-2 text-sm font-medium text-white/90"
// //     style={{
// //       width: "89.814px",
// //       height: "40px",
// //       borderRadius: "8px",
// //       background: "#333335",
// //     }}
// //   >
// //     <ShoppingCart className="h-4 w-4" />
// //     Cart
// //   </button>
// // )}

// //       {/* ✅ Buy Now button is hidden if one-time and already sold */}
// //   {!isOwnPrompt(prompt) && !isPurchased && (
// //   isPurchased ? (
// //     <div
// //       className="flex items-center justify-center text-sm font-medium"
// //       style={{
// //         width: "89.814px",
// //         height: "40px",
// //         borderRadius: "8px",
// //         background: "#14532D",
// //         color: "#BBF7D0",
// //       }}
// //     >
// //       Purchased
// //     </div>
// //   ) : !(prompt.exclusive && prompt.sold) ? (
// //     <button
// //       onClick={(e) => {
// //         e.stopPropagation();
// //         handlePurchase(prompt);
// //       }}
// //       className="text-sm font-medium text-white"
// //       style={{
// //         width: "89.814px",
// //         height: "40px",
// //         borderRadius: "8px",
// //         background: "linear-gradient(270deg,#FF14EF 0%, #1A73E8 100%)",
// //       }}
// //     >
// //       Buy Now
// //     </button>
// //   ) : null
// // )}
// //     </>
// //   )}
// // </div>


// //                     </CardContent>
// //                   </Card>
// //                 );
// //               })}
// //             </div>

// //             {/* Empty state */}
// //             {filteredPrompts.length === 0 && (
// //               <div className="text-center py-16">
// //                 <p
// //                   style={{ fontFamily: "Inter, sans-serif", fontWeight: 400, fontSize: "24px", lineHeight: "100%" }}
// //                   className="text-white"
// //                 >
// //                   {`Showing 0 premium prompts in ${selectedCategory || "All"}`}
// //                 </p>
// //                 <p
// //                   style={{ fontFamily: "Inter, sans-serif", fontWeight: 400, fontSize: "16px", lineHeight: "100%" }}
// //                   className="mt-3 text-white/80"
// //                 >
// //                   No prompts found matching your criteria.
// //                 </p>
// //                 <button
// //                   type="button"
// //                   onClick={() => {
// //                     setSearchQuery("");
// //                     setSelectedCategory("All");
// //                     setFileType("all");
// //                     setLicenseType("all");
// //                   }}
// //                   className="mx-auto mt-6 text-white"
// //                   style={{
// //                     width: "160px",
// //                     height: "50px",
// //                     borderRadius: "10px",
// //                     border: "1px solid #FFFFFF",
// //                     background: "transparent",
// //                   }}
// //                 >
// //                   Clear Filters
// //                 </button>
// //               </div>
// //             )}
// //           </>
// //         )}
// //       </div>

// //     <div className="relative z-10 mt-20">
// //   <Footer />
// // </div>

// //       {/* Save dropdown modal anchored to cop.png */}
// //       {/* <ModalComponent
// //         isOpen={saveModalOpen}
// //         onClose={() => setSaveModalOpen(false)}
// //         onSave={(payload) => {
// //           toast({
// //             title: payload?.quick ? "Saved to All Saved" : "Collection created",
// //             description: payload?.quick
// //               ? "Prompt saved quickly to All Saved."
// //               : `Created collection: ${payload?.title || ""}`,
// //           });
// //         }}
// //         anchorRef={{ current: saveAnchorEl } as unknown as React.RefObject<HTMLElement>}
// //       /> */}



// //       <ModalComponent
// //   isOpen={saveModalOpen}
// //   onClose={() => setSaveModalOpen(false)}
// //   onSave={async (payload) => {
// //   if (!saveForPromptId) { /* toast ... */ return; }

// //   if (payload?.quick) {
// //     await savePromptToCollections({ refId: saveForPromptId, name: saveForPrompt?.title });
// //     toast({ title: "Saved", description: "Prompt saved to All Saved." });
// //   } else if (payload?.title) {
// //     await savePromptToCollections({
// //       refId: saveForPromptId,
// //       collectionTitle: payload.title,
// //       name: saveForPrompt?.title, // 👈 label = original title
// //     });
// //     toast({ title: "Collection created", description: `Saved to "${payload.title}".` });
// //   } else {
// //     await savePromptToCollections({ refId: saveForPromptId, name: saveForPrompt?.title });
// //     toast({ title: "Saved", description: "Prompt saved to All Saved." });
// //   }
// //   setSaveForPromptId(null);
// //   setSaveForPrompt(null);
// // }}

// //   anchorRef={{ current: saveAnchorEl } as unknown as React.RefObject<HTMLElement>}
// // />


// //       <MediaEnlargeModal
// //         isOpen={enlargeModalOpen}
// //         onClose={() => setEnlargeModalOpen(false)}
// //         mediaUrl={enlargeMedia?.url || ""}
// //         mediaType={enlargeMedia?.type || "image"}
// //         title={enlargeMedia?.title || ""}
// //       />

// //       <DetailsPrompt
// //         open={detailsOpen}
// //         onOpenChange={setDetailsOpen}
// //         prompt={detailsPrompt}
// //         owned={detailsPrompt ? purchasedPrompts.includes(String(detailsPrompt.id)) : false}
// //         onPurchase={(p) => {
// //           setDetailsOpen(false);
// //           handlePurchase(p);
// //         }}
// //         // showImages removed; DetailsPrompt can infer using prompt.videoUrl / prompt.imageUrl
// //         onEnlargeMedia={(m) => {
// //           setEnlargeMedia({ url: m.url, type: m.type, title: m.title });
// //           setEnlargeModalOpen(true);
// //         }}
// //       />

// //       {/* ✅ Purchase Success Popup */}
// // {/* ✅ Purchase Success Popup */}
// // {showSuccessPopup && (
// //   <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70 backdrop-blur-sm">
// //     <div
// //       className="bg-[#1C1C1C] text-white rounded-2xl shadow-2xl px-8 py-10 w-[420px] text-center animate-fadeIn relative"
// //       style={{ border: "1px solid rgba(255,255,255,0.1)" }}
// //     >
// //       {/* Close button */}
// //       <button
// //         onClick={() => setShowSuccessPopup(false)}
// //         className="absolute top-4 right-4 text-white/60 hover:text-white"
// //         aria-label="Close"
// //       >
// //         ✕
// //       </button>

// //       {/* ✅ Success icon */}
// //       <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-emerald-600 flex items-center justify-center">
// //         <svg
// //           xmlns="http://www.w3.org/2000/svg"
// //           className="h-10 w-10 text-white"
// //           fill="none"
// //           viewBox="0 0 24 24"
// //           stroke="currentColor"
// //           strokeWidth={2}
// //         >
// //           <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
// //         </svg>
// //       </div>

// //       <h2 className="text-xl font-semibold mb-2">🎉 Thank you, {buyerName}!</h2>
// //       <p className="text-white/80 mb-8">
// //         You’ve successfully purchased this prompt!
// //       </p>

// //       <div className="flex items-center justify-center gap-4">
// //         {/* ✅ Go to Purchases */}
// //         <button
// //   onClick={() => {
// //     setShowSuccessPopup(false);

// //     try {
// //       if (latestPurchase) {
// //         window.dispatchEvent(
// //           new CustomEvent("tokun:purchased", { detail: latestPurchase })
// //         );
// //       }
// //     } catch {}

// //     navigate("/purchases?p=purchased", {
// //       state: { refreshPurchases: true },
// //     });
// //   }}
// //   className="w-40 h-11 rounded-lg text-sm font-medium bg-white/10 hover:bg-white/20 transition"
// // >
// //   Go to My Purchases
// // </button>

// //         {/* ✅ Back to Marketplace */}
// //         <button
// //           onClick={() => {
// //             setShowSuccessPopup(false);
// //             navigate("/prompt-marketplace");  // 👈 goes to marketplace
// //           }}
// //           className="w-40 h-11 rounded-lg text-sm font-medium text-white"
// //           style={{
// //             background: "linear-gradient(90deg, #FF14EF 0%, #1A73E8 100%)",
// //           }}
// //         >
// //           Prompt Marketplace
// //         </button>
// //       </div>
// //     </div>
// //   </div>
// // )}


// // {token && (
// //  <KycGateModal
// //   open={kycOpen}
// //   onClose={() => setKycOpen(false)}
// //   token={token}
// //    apiBase={API_BASE}
// //   //  apiBase="http://localhost:5000"
// //   defaultCountry="IN"
// //   requiredForLabel="buying and uploading prompts"
// //   onVerified={() => {
// //     if (pendingPurchasePrompt) {
// //       const p = pendingPurchasePrompt;
// //       setPendingPurchasePrompt(null);
// //       handlePurchase(p);
// //     }
// //   }}
// // />
// // )}


// // {categoriesModalOpen && (
// //   <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
// //     <div
// //       className="w-full max-w-[620px] rounded-[28px] border border-white/10 bg-[#17171A] p-5 sm:p-6 text-white"
// //       onClick={(e) => e.stopPropagation()}
// //     >
// //       <div className="flex items-start justify-between gap-4">
// //         <div>
// //           <h3 className="text-xl font-semibold">Select Categories</h3>
// //           <p className="mt-1 text-sm text-white/60">
// //             Ek hi baar me multiple categories choose kar sakte ho.
// //           </p>
// //         </div>

// //         <button
// //           type="button"
// //           onClick={() => setCategoriesModalOpen(false)}
// //           className="w-10 h-10 rounded-full grid place-items-center bg-white/5 hover:bg-white/10"
// //           aria-label="Close categories modal"
// //         >
// //           <X className="h-5 w-5" />
// //         </button>
// //       </div>

// //       <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[320px] overflow-y-auto pr-1">
// //         {categoryOptions.map(({ id, icon: Icon }) => {
// //           const active = draftCategories.includes(id);

// //           return (
// //             <button
// //               key={id}
// //               type="button"
// //               onClick={() => toggleDraftCategory(id)}
// //               className={`w-full flex items-center justify-between rounded-2xl px-4 py-3 border transition-colors ${
// //                 active
// //                   ? "bg-white/10 border-white/20"
// //                   : "bg-[#121213] border-white/5 hover:bg-white/5"
// //               }`}
// //             >
// //               <div className="flex items-center gap-3">
// //                 <Icon className="h-4 w-4" />
// //                 <span className="text-sm font-medium">{id}</span>
// //               </div>

// //               <span
// //                 className={`w-5 h-5 rounded-full grid place-items-center border ${
// //                   active
// //                     ? "bg-white text-black border-white"
// //                     : "border-white/20 text-transparent"
// //                 }`}
// //               >
// //                 <Check className="h-3.5 w-3.5" />
// //               </span>
// //             </button>
// //           );
// //         })}
// //       </div>

// //       <div className="mt-6 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3">
// //         <button
// //           type="button"
// //           onClick={clearCategorySelection}
// //           className="h-[46px] px-4 rounded-full border border-white/10 bg-[#121213] text-white/80 hover:bg-white/5"
// //         >
// //           Clear All
// //         </button>

// //         <button
// //           type="button"
// //           onClick={() => setCategoriesModalOpen(false)}
// //           className="h-[46px] px-4 rounded-full border border-white/10 bg-[#121213] text-white hover:bg-white/5"
// //         >
// //           Cancel
// //         </button>

// //         <button
// //           type="button"
// //           onClick={applyCategorySelection}
// //           className="h-[46px] px-5 rounded-full text-white font-medium"
// //           style={{ background: "linear-gradient(270deg, #1A73E8 0%, #FF14EF 100%)" }}
// //         >
// //           Apply Categories
// //         </button>
// //       </div>
// //     </div>
// //   </div>
// // )}

// //     </div>
// //   );
// // };

// // export default PromptMarketplacePage;




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
//   SlidersHorizontal, Check, X,
// } from "lucide-react";
// import { User } from "lucide-react";

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
// import { useAuth } from "@/contexts/AuthContext";
// import ModalComponent from "@/components/ModalComponent";
//  import { ShoppingCart } from "lucide-react";
//  import KycGateModal from "@/components/KycGateModal";
//    import { useCart } from "@/contexts/CartContext";
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
//   exclusive?: boolean;
//   sold?: boolean;

//   uploaderName?: string;
//   uploaderId?: string | null;
//   uploaderAvatar?: string;
// };

// type FileType = "all" | "video" | "image" | "code";
// type LicenseType = "all" | "free" | "premium" | "one-time";


// const GRADIENT = "linear-gradient(270deg, #1A73E8 0%, #FF14EF 100%)";

// const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, "");
// const PROMPTS_BASE = `${API_BASE}/api/prompt`;
// const PURCHASE_BASE = `${API_BASE}/api/purchase`;

// // ⚠️ Keep your real Razorpay key id in env:
// const RAZORPAY_KEY_ID = (import.meta as any).env?.VITE_RAZORPAY_KEY_ID || "rzp_test_TLG37MSt5U18rP";

// /* ---------- Categories rail data (UI only) ---------- */

// /* ---------- Categories scroller ---------- */
// const CategoriesScroller: React.FC<{
//   selectedCategory: string;
//   setSelectedCategory: (c: string) => void;
//   categoriesData: { id: string; icon: React.ComponentType<any> }[];
// }> = ({ selectedCategory, setSelectedCategory, categoriesData }) => {


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

//      <div className="relative w-full max-w-[1200px] overflow-hidden">
//   <div
//     ref={railRef}
//     className="flex items-center gap-3 overflow-x-auto scroll-smooth px-1 no-scrollbar md:justify-center"
//   >
//     {categoriesData.map(({ id, icon: Icon }) => {
//       const isAll = id === "All";
//       const isActive = selectedCategory === id;
//       const pillWidth = isAll ? "109.525px" : "185.628px";
//       const baseStyle: React.CSSProperties = isActive
//         ? { width: pillWidth, background: GRADIENT, color: "#FFFFFF" }
//         : { width: pillWidth, background: "#17171A", color: "rgba(255,255,255,0.85)" };

//       return (
//         <button
//           key={id}
//           onClick={() => setSelectedCategory(id)}
//           aria-pressed={isActive}
//           className={[
//             "flex items-center justify-center gap-[10px] h-[50px] rounded-[200px]",
//             "text-sm font-medium whitespace-nowrap transition-colors",
//             isActive ? "ring-1 ring-white/15" : "hover:bg-white/5",
//           ].join(" ")}
//           style={{ padding: "15px 30px", ...baseStyle }}
//         >
//           <Icon className="h-4 w-4" />
//           <span>{id}</span>
//         </button>
//       );
//     })}
//   </div>
// </div>

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

// /* ---------- Small pill dropdown used below the search bar ---------- */
// const PillDropdown = ({
//   label,
//   value,
//   onChange,
//   options,
//   // optional: pass absolute positioning (e.g., { top: 687, left: 805 })
//   positionStyle,
// }: {
//   label: string;
//   value: string;
//   onChange: (v: string) => void;
//   options: { label: string; value: string; icon?: React.ComponentType<any> }[];
//   positionStyle?: React.CSSProperties;
// }) => {
//   const [open, setOpen] = useState(false);

//   return (
//     <div className="relative" style={positionStyle}>
//       <button
//         type="button"
//         onClick={() => setOpen((o) => !o)}
//         aria-haspopup="listbox"
//         aria-expanded={open}
//         className="flex items-center justify-between gap-2 px-3"
//         style={{
//           width: 150,         // <- width: 150px
//           height: 50,         // <- height: 50px
//           borderRadius: 6,    // <- border-radius: 6px
//           backgroundColor: "#121213",
//           border: "1px solid #282829",
//           opacity: 1,         // <- opacity: 1
//         }}
//       >
//         <span className="text-white/80 text-sm truncate">{label}</span>
//         <svg width="18" height="18" viewBox="0 0 24 24" className="text-white/80 shrink-0">
//           <path fill="currentColor" d="M7 10l5 5 5-5z" />
//         </svg>
//       </button>

//       {open && (
//         <div
//           role="listbox"
//           className="absolute z-30 mt-2 p-2"
//           style={{
//             width: 150,            // match trigger width
//             borderRadius: 6,       // match 6px radius
//             backgroundColor: "#17171A",
//             border: "1px solid #282829",
//           }}
//         >
//           {options.map((opt) => {
//             const Icon = opt.icon;
//             const selected = opt.value === value;
//             return (
//               <button
//                 key={opt.value}
//                 role="option"
//                 aria-selected={selected}
//                 onClick={() => {
//                   onChange(opt.value);
//                   setOpen(false);
//                 }}
//                 className={[
//                   "w-full flex items-center gap-2 px-2 text-left rounded-[6px]",
//                   selected ? "bg-white/10 text-white" : "text-white/85 hover:bg-white/5",
//                 ].join(" ")}
//                 style={{ height: 40 }}  // tidy row height
//               >
//                 {Icon ? <Icon className="h-4 w-4" /> : null}
//                 <span className="text-sm truncate">{opt.label}</span>
//               </button>
//             );
//           })}
//         </div>
//       )}
//     </div>
//   );
// };


// const PromptMarketplacePage = () => {
//   const navigate = useNavigate();
//   const { totalTokensUsed, tokenLimit } = useUserTokenUsage();
//   const { token , user} = useAuth?.() || ({} as any);
//   const { addToCart } = useCart();
//   const currentUserId = user?._id || user?.id || null;
//   const [searchQuery, setSearchQuery] = useState("");
//   const [selectedCategory, setSelectedCategory] = useState("All");
//   const [showTopBg, setShowTopBg] = useState(true);
//     const [kycOpen, setKycOpen] = useState(false);
// const [pendingPurchasePrompt, setPendingPurchasePrompt] = useState<Prompt | null>(null);
// const [retryPrompt, setRetryPrompt] = useState<Prompt | null>(null);
//   // NEW: dropdown filters
//   const [fileType, setFileType] = useState<FileType>("all");
//   const [licenseType, setLicenseType] = useState<LicenseType>("all");
// const [apiCategories, setApiCategories] = useState<string[]>([]);
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
//   // top-level state (near other state)
// const [saveForPromptId, setSaveForPromptId] = useState<string | null>(null);
// const [saveForPrompt, setSaveForPrompt] = useState<Prompt | null>(null);

//   // Save modal (anchored to cop.png)
//   const [saveModalOpen, setSaveModalOpen] = useState(false);
//   const [saveAnchorEl, setSaveAnchorEl] = useState<HTMLElement | null>(null);
   

// const [latestPurchase, setLatestPurchase] = useState<any | null>(null);
// const [categoriesModalOpen, setCategoriesModalOpen] = useState(false);
// const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
// const [draftCategories, setDraftCategories] = useState<string[]>([]);




// const categoriesData = [
//   { id: "All", icon: Sparkles },
//   ...apiCategories.map((name) => ({
//     id: name,
//     icon: Sparkles,
//   })),
// ];
// const categoryOptions = categoriesData.filter((item) => item.id !== "All");

// const openCategoriesModal = () => {
//   setDraftCategories(
//     selectedCategories.length
//       ? selectedCategories
//       : selectedCategory !== "All"
//       ? [selectedCategory]
//       : []
//   );
//   setCategoriesModalOpen(true);
// };





// const toggleDraftCategory = (categoryId: string) => {
//   setDraftCategories((prev) =>
//     prev.includes(categoryId)
//       ? prev.filter((id) => id !== categoryId)
//       : [...prev, categoryId]
//   );
// };

// const applyCategorySelection = () => {
//   setSelectedCategories(draftCategories);
//   if (draftCategories.length) {
//     setSelectedCategory("All");
//   }
//   setCategoriesModalOpen(false);
// };

// const clearCategorySelection = () => {
//   setSelectedCategories([]);
//   setDraftCategories([]);
//   setSelectedCategory("All");
//   setCategoriesModalOpen(false);
// };

// const effectiveCategoryFilter =
//   selectedCategories.length > 0
//     ? selectedCategories
//     : selectedCategory !== "All"
//     ? [selectedCategory]
//     : [];






//   // Razorpay script ready?
//   const [rzpReady, setRzpReady] = useState(false);
//    const [showSuccessPopup, setShowSuccessPopup] = useState(false);
// const [buyerName, setBuyerName] = useState<string>(""); 

//   /* ---------- Load Razorpay script once ---------- */
//   useEffect(() => {
//     if ((window as any).Razorpay) {
//       setRzpReady(true);
//       return;
//     }
//     const script = document.createElement("script");
//     script.src = "https://checkout.razorpay.com/v1/checkout.js";
//     script.async = true;
//     script.onload = () => setRzpReady(true);
//     script.onerror = () => setRzpReady(false);
//     document.body.appendChild(script);
//   }, []);

//   /* ---------- [API #3] Load purchase history ---------- */
//   useEffect(() => {
//     if (!token) return;
//     (async () => {
//       try {
//         const res = await fetch(`${PURCHASE_BASE}/history`, {
//           headers: { Authorization: `Bearer ${token}` },
//           credentials: "include",
//         });
//         const body = await res.json();
//         if (!res.ok || !body?.success) return;
//         const ownedIds = (body.purchases || [])
//           .map((p: any) => {
//             if (p?.prompt && typeof p.prompt === "object") return String(p.prompt._id);
//             if (p?.prompt && typeof p.prompt === "string") return p.prompt;
//             return null;
//           })
//           .filter(Boolean);
//         setPurchasedPrompts((prev) => Array.from(new Set([...(prev || []), ...ownedIds])));
//       } catch (e) {
//         console.error("[History] fetch failed", e);
//       }
//     })();
//   }, [token]);






//   useEffect(() => {
//   const loadCategories = async () => {
//     try {
//       const res = await fetch(`${API_BASE}/api/category`);
//       const data = await res.json();

//       if (res.ok && data?.success) {
//         setApiCategories(data.categories.map((c: any) => c.name));
//       }
//     } catch (err) {
//       console.error("Failed to load categories", err);
//     }
//   };

//   loadCategories();
// }, []);

// useEffect(() => {
//   let ticking = false;

//   const updateTopBgVisibility = () => {
//     const bgEnd = document.getElementById("marketplace-bg-end");

//     if (!bgEnd) {
//       setShowTopBg(true);
//       return;
//     }

//     const rect = bgEnd.getBoundingClientRect();

//     // Background static rahega jab tak categories block top area tak visible hai.
//     // Categories ke baad lower content clean dark background par rahega.
//     setShowTopBg(rect.bottom > 96);
//   };

//   const onScrollOrResize = () => {
//     if (ticking) return;

//     ticking = true;
//     window.requestAnimationFrame(() => {
//       updateTopBgVisibility();
//       ticking = false;
//     });
//   };

//   updateTopBgVisibility();
//   window.addEventListener("scroll", onScrollOrResize, { passive: true });
//   window.addEventListener("resize", onScrollOrResize);

//   return () => {
//     window.removeEventListener("scroll", onScrollOrResize);
//     window.removeEventListener("resize", onScrollOrResize);
//   };
// }, []);





//   /* ---------- Fetch prompts ---------- */
//   useEffect(() => {
//     const fetchPrompts = async () => {
//       try {
//         setLoading(true);
//         setLoadError(null);

//         const params = new URLSearchParams();
//         // backend hinting (safe even if server ignores)
//         params.set("type", fileType); // all | video | image | code
//         params.set("license", licenseType); // all | free | premium
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

// //     const mapped: Prompt[] = (data.prompts || []).map((doc: any) => {
// //   const att = doc?.attachment || null;
// //   const mediaPath = att?.path ? `${API_BASE}${att.path}` : undefined;

// //   return {
// //     id: String(doc._id),
// //     title: doc.title || "Untitled",
// //     description: doc.description || "",
// //     category:
// //       (doc.categories?.[0]?.name as string) ||
// //       (Array.isArray(doc.categories) ? doc.categories.join(", ") : "") ||
// //       "General",
// //     price: typeof doc.price === "number" ? doc.price : 0,
// //     rating: typeof doc.averageRating === "number" ? doc.averageRating : undefined,
// //     downloads: doc.downloads || 0,
// //     imageUrl: att?.type === "image" ? mediaPath : undefined,
// //     videoUrl: att?.type === "video" ? mediaPath : undefined,
// //     preview:
// //       (doc.description && String(doc.description).slice(0, 140)) ||
// //       (doc.promptText && String(doc.promptText).slice(0, 140)) ||
// //       "",
// //     isFree: !!doc.free,
// //     createdAt: doc.createdAt,
// //     exclusive: !!doc.exclusive,
// //     sold: !!doc.sold, // ✅ Add this line (make sure backend sends `sold: true` when sold)

// // uploaderName: doc?.userId?.name || "Unknown",
// // uploaderAvatar: "/icons/default-user.png",  // always default (no avatar)



// //   };
// // });

// const mapped: Prompt[] = (data.prompts || []).map((doc: any) => {
//   const att = doc?.attachment || null;
//   // const mediaPath = att?.path ? `${API_BASE}${att.path}` : undefined;
//   const mediaPath = att?.path
//   ? att.path.startsWith("http")
//     ? att.path
//     : `${API_BASE}${att.path}`
//   : undefined;
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
//     imageUrl: att?.type === "image" ? mediaPath : undefined,
//     videoUrl: att?.type === "video" ? mediaPath : undefined,
//     preview:
//       (doc.description && String(doc.description).slice(0, 140)) ||
//       (doc.promptText && String(doc.promptText).slice(0, 140)) ||
//       "",

//     isFree: !!doc.free,
//     exclusive: !!doc.exclusive,
//     sold: !!doc.sold,

//     // ⭐⭐ THIS IS WHAT YOU ASKED FOR
//     uploaderName: doc?.userId?.name || "Unknown",
//     uploaderId: doc?.userId?._id || null,

//     // avatar if needed
//     uploaderAvatar: "/icons/default-user.png"
//   };
// });



//         setPrompts(mapped);
//       } catch (err: any) {
//         console.error("Failed to load prompts", err);
//         setLoadError(err?.message || "Failed to load prompts");
//         toast({
//           title: "Couldn’t load prompts",
//           description: err?.message || "Please try again.",
//           //         });
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchPrompts();
//   }, [fileType, licenseType, selectedCategory, token]);

//   /* ---------- Derived: local search + filter ---------- */
// const filteredPrompts = prompts.filter((p) => {
//   if (searchQuery.trim()) {
//     const q = searchQuery.toLowerCase();
//     if (
//       !p.title.toLowerCase().includes(q) &&
//       !(p.description || "").toLowerCase().includes(q)
//     ) {
//       return false;
//     }
//   }

//   if (licenseType === "free" && !p.isFree) return false;
//   if (licenseType === "premium" && !(p.price && p.price > 0)) return false;
//   if (licenseType === "one-time" && !p.exclusive) return false;

//   if (fileType === "video" && !p.videoUrl) return false;
//   if (fileType === "image" && !p.imageUrl) return false;
//   if (fileType === "code" && p.category.toLowerCase() !== "code") return false;

//   if (effectiveCategoryFilter.length > 0) {
//     const promptCategories = String(p.category || "")
//       .split(",")
//       .map((item) => item.trim());

//     const hasCategoryMatch = effectiveCategoryFilter.some((cat) =>
//       promptCategories.includes(cat)
//     );

//     if (!hasCategoryMatch) return false;
//   }

//   return true;
// });

//   /* ---------- Helpers ---------- */
//   const decideMediaType = (prompt: Prompt): "video" | "image" => {
//     if (fileType === "video") return "video";
//     if (fileType === "image") return "image";
//     // "all" or "code": prefer video if available, else image
//     return prompt.videoUrl ? "video" : "image";
//   };

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


//   const isOwnPrompt = (prompt: Prompt) => {
//   if (!currentUserId || !prompt?.uploaderId) return false;
//   return String(prompt.uploaderId) === String(currentUserId);
// };

//   /** PURCHASE FLOW — integrates CREATE ORDER (+ verify) with detailed consoles */
//  const handlePurchase = async (prompt: Prompt) => {
//   if (isOwnPrompt(prompt)) {
//     toast({
//       title: "Not allowed",
//       description: "You cannot buy your own prompt.",
//       //     });
//     return;
//   }

//   if (!token) {
//     toast({
//       title: "Please log in",
//       description: "You must be logged in to purchase.",
//       //     });
//     return;
//   }
    
//     if (!rzpReady) {
//       toast({ title: "Loading payment…", description: "Razorpay is still initializing." });
//       return;
//     }

//     try {
//       // [API #1] CREATE ORDER
//       const res = await fetch(`${PURCHASE_BASE}/create-order/${prompt.id}`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         credentials: "include",
//       });
//       const data = await res.json();
//       if (res.status === 403 && (data?.error === "KYC_REQUIRED" || data?.code === "KYC_REQUIRED")) {
//   setPendingPurchasePrompt(prompt);
//   setKycOpen(true);
//   return;
// }

     
//         if (res.status === 403 && data?.error === "KYC_REQUIRED") {
//     setRetryPrompt(prompt);
//     setKycOpen(true);
//     return;
//   }


//       if (!res.ok || !data?.success || !data?.order) {
//         throw new Error(data?.error || "order_create_failed");
//       }
 
//       const order = data.order;

//       // Razorpay Checkout
//       const options: any = {
//         key: RAZORPAY_KEY_ID,
//         amount: Number(order.amount),
//         currency: order.currency || "INR",
//         name: "Tokun",
//         description: `Purchase: ${prompt.title}`,
//         order_id: order.id,
//         notes: { promptId: prompt.id },
//         theme: { color: "#1A73E8" },
//         handler: async (response: any) => {
//           try {
//             // [API #2] VERIFY PAYMENT
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
//                 pricePaid: order.amount / 100,
//               }),
//             });

//             const vb = await vr.json();
//          if (vb?.success) {
//   const purchasedId = prompt.id;

//   setPurchasedPrompts((prev) =>
//     prev.includes(purchasedId) ? prev : [...prev, purchasedId]
//   );

//   setLatestPurchase(vb.purchase || null);

//   try {
//     window.dispatchEvent(
//       new CustomEvent("tokun:purchased", { detail: vb.purchase })
//     );
//   } catch {}

//   setBuyerName(vb?.user?.name || "there");
//   setShowSuccessPopup(true);

//   toast({
//     title: "Payment Successful",
//     description: "You now own this prompt.",
//   });
// } else {
//               toast({ title: "Verification Failed", description: vb?.error || "Unknown error" });
//             }
//           } catch (err) {
//             console.error("Verify error", err);
//             toast({ title: "Verification Error", description: "Could not verify payment." });
//           }
//         },
//       };

//       const rzp = new (window as any).Razorpay(options);
//       rzp.on("payment.failed", function () {
//         toast({ title: "Payment Failed", description: "Please try again." });
//       });
//       rzp.open();
//     } catch (err: any) {
//       console.error("Purchase flow error", err);
//       toast({ title: "Purchase Error", description: err?.message || "Something went wrong." });
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

// const ensureKycVerified = async (promptToBuy?: Prompt) => {
//   if (!token) return false;

//   try {
//     // const res = await fetch(`${API_BASE}/api/kyc/status`, {
//       const res = await  fetch(`http://localhost:5000/api/kyc/status` ,{
//       headers: { Authorization: `Bearer ${token}` },
//       credentials: "include",
//     });
//     const data = await res.json().catch(() => ({}));
//     const s = data?.kycStatus || data?.status;

//     if (s === "VERIFIED") return true;

//     // open KYC UI
//     if (promptToBuy) setPendingPurchasePrompt(promptToBuy);
//     setKycOpen(true);
//     return false;
//   } catch {
//     // if status api fails, still open UI (safer)
//     if (promptToBuy) setPendingPurchasePrompt(promptToBuy);
//     setKycOpen(true);
//     return false;
//   }
// };



// const savePromptToCollections = async ({
//   refId,
//   collectionTitle, // optional
//   name,            // optional item label
// }: {
//   refId: string;
//   collectionTitle?: string;
//   name?: string;
// }) => {
//   if (!token) {
//     toast({
//       title: "Please log in",
//       description: "You need to be logged in to save prompts.",
//       //     });
//     return { ok: false };
//   }

//   try {
//     const res = await fetch(`${API_BASE}/api/saved-collections`, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${token}`,
//       },
//       credentials: "include",
//       body: JSON.stringify({
//         section: "prompt",      // 👈 you asked for Prompt model
//         refId,                  // prompt._id
//         // When collectionTitle is provided, backend saves inside that collection;
//         // Otherwise it goes to directItems (All Saved).
//         ...(collectionTitle ? { collectionTitle } : {}),
//         ...(name ? { name } : {}),
//       }),
//     });

//     const data = await res.json();
//     if (!res.ok || !data?.success) {
//       throw new Error(data?.error || "server_error");
//     }
//     return { ok: true, data };
//   } catch (err: any) {
//     toast({
//       title: "Save failed",
//       description: err?.message || "Could not save this prompt.",
//       //     });
//     return { ok: false };
//   }
// };



//   return (
//  <div className="dark relative min-h-screen bg-[#07080A] text-foreground overflow-x-hidden">
//   <div
//     aria-hidden
//     className={`pointer-events-none fixed inset-0 z-0 overflow-hidden transition-opacity duration-300 ${
//       showTopBg ? "opacity-100" : "opacity-0"
//     }`}
//   >
//     <img
//       src="/icons/mpbg.png"
//       alt="background"
//       className="absolute inset-0 w-full h-screen object-contain object-top select-none"
//     />
//   </div>


//       {/* Header + token usage */}
//      {/* 🔹 Full-width compact Header */}
// <div className="fixed top-0 left-0 right-0 z-[999]">
//   <Header />
// </div>

//       {/* Main Content */}
// <div className="relative z-10 container mx-auto px-6 pt-24 md:pt-28 pb-16">

//         {/* History Button */}
//         {/* <div className="flex justify-between items-center mb-12">
//           <Button
//             variant="outline"
//             onClick={() => setShowHistory(true)}
//             className="flex items-center gap-2 hover:bg-tokun/10 hover:text-tokun hover:border-tokun/30"
//           >
//             <History className="h-4 w-4" />
//             Purchase History
//           </Button>
//         </div> */}

//         {/* Title + blurb */}
//       {/* Section spacing below Header */}
// {/* <div className="mt-10 flex flex-col items-center text-center mb-12">
  
//   <h1
//     style={{
//       fontFamily: "Inter",
//       fontWeight: 700,
//       fontStyle: "normal",
//       fontSize: "64px",
//       lineHeight: "74px",
//       textAlign: "center",
//       color: "#FFFFFF",
//       marginBottom: "0px",
//     }}
//   >
//     Prompt
//   </h1>

  
//   <h2
//     style={{
//       fontFamily: "Inter",
//       fontWeight: 700,
//       fontStyle: "normal",
//       fontSize: "64px",
//       lineHeight: "74px",
//       textAlign: "center",
//       color: "#FFFFFF",
//       marginTop: "0px",
//     }}
//   >
//     Marketplace
//   </h2>

 
//   <p
//     style={{
//       fontFamily: "Inter",
//       fontWeight: 400,
//       fontStyle: "normal",
//       fontSize: "16px",
//       lineHeight: "140%",
//       textAlign: "center",
//       color: "rgba(255,255,255,0.8)",
//       marginTop: "18px",
//       maxWidth: "680px", // wider for natural 2-line wrap
//     }}
//   >
//     Discover and purchase premium AI prompts created by experts from around the world. 
//     Transform your ideas into reality with our curated collections.
//   </p>
// </div> */}

//                     <div className="mt-8 sm:mt-10 flex flex-col items-center text-center mb-12 px-4">
//   {/* Prompt */}
//   <h1 className="text-white font-bold leading-tight 
//     text-[36px] sm:text-[48px] md:text-[64px]">
//     Prompt
//   </h1>

//   {/* Marketplace */}
//   <h2 className="text-white font-bold leading-tight 
//     text-[36px] sm:text-[48px] md:text-[64px]">
//     Marketplace
//   </h2>

//   {/* Description */}
//   <p className="text-white/80 mt-4 max-w-[680px] text-sm sm:text-base leading-relaxed">
//     Discover and purchase premium AI prompts created by experts from around the world.
//     Transform your ideas into reality with our curated collections.
//   </p>
// </div>


//         {/* Navigation + Search/Filters */}
//         <div className="mt-4 flex justify-center">
//   <AppNavigation activeSection="prompt-marketplace" />
// </div>
//         <div className="mt-6"></div>


//         {/* Search + NEW FILTER BAR */}
//         <div className="space-y-6 mb-12">
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
//           </div>

//           {/* NEW: File type + License type pills (like your screenshots) */}
//           <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
//             <PillDropdown
//               label={
//                 fileType === "all"
//                   ? "File type"
//                   : fileType === "video"
//                   ? "Video"
//                   : fileType === "image"
//                   ? "Image"
//                   : "Code"
//               }
//               value={fileType}
//               onChange={(v) => setFileType(v as FileType)}
//               options={[
//                 { label: "All type", value: "all" },
//                 { label: "Video", value: "video", icon: Video },
//                 { label: "Image", value: "image", icon: ImageIcon },
//                 { label: "Code", value: "code", icon: Code2 },
//               ]}
//             />

//           <PillDropdown
//   label={
//     licenseType === "all"
//       ? "License type"
//       : licenseType === "free"
//       ? "Free"
//       : licenseType === "premium"
//       ? "Premium"
//       : "One-time Purchase"
//   }
//   value={licenseType}
//   onChange={(v) => setLicenseType(v as LicenseType)}
//   options={[
//     { label: "All type", value: "all" },
//     { label: "Free", value: "free" },
//     { label: "Premium", value: "premium" },
//     { label: "One-time Purchase", value: "one-time" }, // ✅ added
//   ]}
// />

//           </div>

//           {/* <CategoriesScroller selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory} /> */}



//           <div id="marketplace-bg-end" className="space-y-4">
//   <div className="flex flex-wrap items-center justify-center gap-3">
//     <button
//       type="button"
//       onClick={openCategoriesModal}
//       className="flex items-center gap-2 px-4 h-[46px] rounded-full text-white border border-white/10 bg-[#17171A] hover:bg-white/5 transition-colors"
//     >
//       <SlidersHorizontal className="h-4 w-4" />
//       <span className="text-sm font-medium">
//         Select Categories
//         {selectedCategories.length > 0 ? ` (${selectedCategories.length})` : ""}
//       </span>
//     </button>

//     {selectedCategories.length > 0 && (
//       <button
//         type="button"
//         onClick={clearCategorySelection}
//         className="px-4 h-[46px] rounded-full text-white/80 border border-white/10 bg-[#121213] hover:bg-white/5 transition-colors text-sm"
//       >
//         Clear Selection
//       </button>
//     )}
//   </div>

//   {selectedCategories.length > 0 && (
//     <div className="flex flex-wrap items-center justify-center gap-2">
//       {selectedCategories.map((category) => (
//         <span
//           key={category}
//           className="px-3 py-1.5 rounded-full text-xs text-white border border-white/10 bg-white/5"
//         >
//           {category}
//         </span>
//       ))}
//     </div>
//   )}

//   <CategoriesScroller
//   categoriesData={categoriesData}
//   selectedCategory={selectedCategory}
//   setSelectedCategory={(category) => {
//     setSelectedCategories([]);
//     setSelectedCategory(category);
//   }}
// />
// </div>
//         </div>

//         {/* Loading / error states */}
//         {loading && <p className="text-white/70 text-sm">Loading prompts…</p>}
//         {!!loadError && !loading && <p className="text-red-400 text-sm">{loadError}</p>}

//         {/* Prompts Grid */}
//         {!loading && !loadError && (
//           <>
//             <div className="
//   grid 
//   grid-cols-1 
//   md:grid-cols-2 
//   lg:grid-cols-3 
//   xl:grid-cols-4 
//   gap-8 
//   justify-items-center
// ">
//               {filteredPrompts.map((prompt) => {
//                 const mediaKind = decideMediaType(prompt); // "video" | "image"
//                 const isPurchased = purchasedPrompts.includes(String(prompt.id));
//                 return (
//                   <Card
//                     key={prompt.id}
//                     onClick={() => {
//                       setDetailsPrompt(prompt);
//                       setDetailsOpen(true);
//                     }}
//                     className="w-full max-w-[306px] overflow-hidden cursor-pointer hover:scale-[1.01] transition-transform"
// style={{ height: 520, background: "#1C1C1C", borderRadius: 30 }}
//                   >
//                     <CardContent className="p-4 h-full flex flex-col">
//                       {/* MEDIA */}
//                       <div
//                         className="relative w-full overflow-hidden group"
//                         style={{ height: 240, borderRadius: 20, backgroundColor: "#0B0B0B" }}
//                       >
//                         {mediaKind === "image" ? (
//                           <img src={prompt.imageUrl} alt={prompt.title} className="w-full h-full object-cover" />
//                         ) : (
//                           <>
//                             <video
//                               className="w-full h-full object-cover"
//                               src={prompt.videoUrl}
//                               loop
//                               muted
//                               playsInline
//                               ref={(el) => {
//                                 if (!el) return;
//                                 if (playingVideo === prompt.id) el.play().catch(() => {});
//                                 else el.pause();
//                               }}
//                             />
//                             <button
//                               type="button"
//                               onClick={(e) => {
//                                 e.stopPropagation();
//                                 handleVideoPlay(prompt.id);
//                               }}
//                               className="absolute inset-0 flex items-center justify-center"
//                               aria-label={playingVideo === prompt.id ? "Pause" : "Play"}
//                             >
//                               <span className="w-12 h-12 rounded-full bg-black/60 hover:bg-black/75 grid place-items-center text-white transition-colors">
//                                 {playingVideo === prompt.id ? (
//                                   <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
//                                     <rect x="6" y="5" width="4" height="14" rx="1" />
//                                     <rect x="14" y="5" width="4" height="14" rx="1" />
//                                   </svg>
//                                 ) : (
//                                   <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
//                                     <path d="M8 5v14l11-7-11-7z" />
//                                   </svg>
//                                 )}
//                               </span>
//                             </button>
//                             <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">0:20</div>
//                           </>
//                         )}


                        




//                         {/* Category pill */}
//                         <div
//                           className="absolute top-3 left-3 px-3 py-1 text-[11px] font-semibold text-white rounded-full"
//                           style={{ background: GRADIENT }}
//                         >
//                           {prompt.category?.toUpperCase()}
//                         </div>

//                         {/* Purchase to unlock */}
//                     {!isPurchased ? (
//   <div
//     className="absolute top-11 left-3 mt-2 px-3 py-1 text-[11px] font-semibold rounded-full"
//     style={{
//       background: prompt.exclusive ? "#2A2A2A" : GRADIENT,
//       color: prompt.exclusive ? "#4ADE80" : "#FFFFFF",
//     }}
//   >
//     {prompt.exclusive ? "ONE-TIME PURCHASE" : "PURCHASE TO UNLOCK"}
//   </div>
// ) : (
//   <div
//     className="absolute top-11 left-3 mt-2 px-3 py-1 text-[11px] font-semibold rounded-full"
//     style={{
//       background: "#14532D",
//       color: "#BBF7D0",
//     }}
//   >
//     PURCHASED
//   </div>
// )}


//                         {/* Rating pill */}
//                       {/* Rating / Premium Icon pill */}
// <div className="absolute top-3 right-3">
//   {!prompt.isFree && prompt.price && prompt.price > 0 ? (
//     <div
//       className="flex items-center justify-center rounded-full"
//       style={{
//         width: 32,
//         height: 32,
//         backgroundColor: "black",
//       }}
//     >
//       <img
//         src="/icons/premium.png"
//         alt="Premium"
//         className={`w-5 h-5 object-contain ${
//           prompt.exclusive ? "filter-green" : ""
//         }`}
//       />
//     </div>
//   ) : null}
// </div>

//      {/* Uploader Row */}




//                       </div>

       
//                    <div className="flex items-center gap-2 mt-3">

//   {/* Default avatar icon */}
//   <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center">
//     <User className="w-4 h-4 text-white/70" />
//   </div>

//   {/* <span className="text-white/80 text-sm">
//     {prompt.uploaderName || "Unknown"}
//   </span> */}

//   <span
//   className="text-white/80 text-sm hover:underline cursor-pointer"
//   onClick={(e) => {
//     e.stopPropagation();
//     navigate(`/profile/${prompt.uploaderId}`);
//   }}
// >
//   {prompt.uploaderName || "Unknown"}
// </span>


//   <div className="flex items-center ml-auto text-white/80 text-sm gap-1">
//     <Star className="w-4 h-4 text-yellow-400" />
//     <span>{prompt.rating?.toFixed(1) || "0.0"}</span>
//   </div>
// </div>


                      

//                       {/* TEXT */}
//                       <div className="mt-4">
                       
//                         <h3 className="mt-1 text-[18px] leading-snug font-semibold text-white line-clamp-2">
//                           {prompt.title}
//                         </h3>
//                         <p className="mt-2 text-[13px] leading-relaxed text-white/70 line-clamp-2">
//                           {prompt.description}
//                         </p>
//                       </div>

//                       {/* FOOTER */}
//                        {/* FOOTER */}
// {/* FOOTER */}
// <div className="mt-auto pt-4 flex items-center gap-[10px]">
//   {prompt.isFree ? (
//     // FREE pill
//     <div
//       className="flex items-center justify-center text-sm font-medium"
//       style={{
//         width: "89.814px",
//         height: "40px",
//         borderRadius: "8px",
//         background: "#333335",
//         color: "#FFFFFF",
//       }}
//     >
//       FREE
//     </div>
//   ) : (
//     <>
//       {/* Price pill */}
//       <div
//         className="flex items-center justify-center text-sm font-medium text-white/90"
//         style={{
//           width: "89.814px",
//           height: "40px",
//           borderRadius: "8px",
//           background: "#333335",
//         }}
//       >
//         ₹{(prompt.price ?? 0).toFixed(2)}
//       </div>

//       {/* Cart pill */}
//     {!isOwnPrompt(prompt) && (
//   <button
//     type="button"
//     onClick={(e) => {
//       e.stopPropagation();
//       addToCart(prompt.id);
//       toast({
//         title: "Added to Cart",
//         description: `"${prompt.title}" was added.`,
//       });
//     }}
//     className="flex items-center justify-center gap-2 text-sm font-medium text-white/90"
//     style={{
//       width: "89.814px",
//       height: "40px",
//       borderRadius: "8px",
//       background: "#333335",
//     }}
//   >
//     <ShoppingCart className="h-4 w-4" />
//     Cart
//   </button>
// )}

//       {/* ✅ Buy Now button is hidden if one-time and already sold */}
//   {!isOwnPrompt(prompt) && !isPurchased && (
//   isPurchased ? (
//     <div
//       className="flex items-center justify-center text-sm font-medium"
//       style={{
//         width: "89.814px",
//         height: "40px",
//         borderRadius: "8px",
//         background: "#14532D",
//         color: "#BBF7D0",
//       }}
//     >
//       Purchased
//     </div>
//   ) : !(prompt.exclusive && prompt.sold) ? (
//     <button
//       onClick={(e) => {
//         e.stopPropagation();
//         handlePurchase(prompt);
//       }}
//       className="text-sm font-medium text-white"
//       style={{
//         width: "89.814px",
//         height: "40px",
//         borderRadius: "8px",
//         background: "linear-gradient(270deg,#FF14EF 0%, #1A73E8 100%)",
//       }}
//     >
//       Buy Now
//     </button>
//   ) : null
// )}
//     </>
//   )}
// </div>


//                     </CardContent>
//                   </Card>
//                 );
//               })}
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
//                     setFileType("all");
//                     setLicenseType("all");
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

//     <div className="relative z-10 mt-20">
//   <Footer />
// </div>

//       {/* Save dropdown modal anchored to cop.png */}
//       {/* <ModalComponent
//         isOpen={saveModalOpen}
//         onClose={() => setSaveModalOpen(false)}
//         onSave={(payload) => {
//           toast({
//             title: payload?.quick ? "Saved to All Saved" : "Collection created",
//             description: payload?.quick
//               ? "Prompt saved quickly to All Saved."
//               : `Created collection: ${payload?.title || ""}`,
//           });
//         }}
//         anchorRef={{ current: saveAnchorEl } as unknown as React.RefObject<HTMLElement>}
//       /> */}



//       <ModalComponent
//   isOpen={saveModalOpen}
//   onClose={() => setSaveModalOpen(false)}
//   onSave={async (payload) => {
//   if (!saveForPromptId) { /* toast ... */ return; }

//   if (payload?.quick) {
//     await savePromptToCollections({ refId: saveForPromptId, name: saveForPrompt?.title });
//     toast({ title: "Saved", description: "Prompt saved to All Saved." });
//   } else if (payload?.title) {
//     await savePromptToCollections({
//       refId: saveForPromptId,
//       collectionTitle: payload.title,
//       name: saveForPrompt?.title, // 👈 label = original title
//     });
//     toast({ title: "Collection created", description: `Saved to "${payload.title}".` });
//   } else {
//     await savePromptToCollections({ refId: saveForPromptId, name: saveForPrompt?.title });
//     toast({ title: "Saved", description: "Prompt saved to All Saved." });
//   }
//   setSaveForPromptId(null);
//   setSaveForPrompt(null);
// }}

//   anchorRef={{ current: saveAnchorEl } as unknown as React.RefObject<HTMLElement>}
// />


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
//         // showImages removed; DetailsPrompt can infer using prompt.videoUrl / prompt.imageUrl
//         onEnlargeMedia={(m) => {
//           setEnlargeMedia({ url: m.url, type: m.type, title: m.title });
//           setEnlargeModalOpen(true);
//         }}
//       />

//       {/* ✅ Purchase Success Popup */}
// {/* ✅ Purchase Success Popup */}
// {showSuccessPopup && (
//   <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70 backdrop-blur-sm">
//     <div
//       className="bg-[#1C1C1C] text-white rounded-2xl shadow-2xl px-8 py-10 w-[420px] text-center animate-fadeIn relative"
//       style={{ border: "1px solid rgba(255,255,255,0.1)" }}
//     >
//       {/* Close button */}
//       <button
//         onClick={() => setShowSuccessPopup(false)}
//         className="absolute top-4 right-4 text-white/60 hover:text-white"
//         aria-label="Close"
//       >
//         ✕
//       </button>

//       {/* ✅ Success icon */}
//       <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-emerald-600 flex items-center justify-center">
//         <svg
//           xmlns="http://www.w3.org/2000/svg"
//           className="h-10 w-10 text-white"
//           fill="none"
//           viewBox="0 0 24 24"
//           stroke="currentColor"
//           strokeWidth={2}
//         >
//           <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
//         </svg>
//       </div>

//       <h2 className="text-xl font-semibold mb-2">🎉 Thank you, {buyerName}!</h2>
//       <p className="text-white/80 mb-8">
//         You’ve successfully purchased this prompt!
//       </p>

//       <div className="flex items-center justify-center gap-4">
//         {/* ✅ Go to Purchases */}
//         <button
//   onClick={() => {
//     setShowSuccessPopup(false);

//     try {
//       if (latestPurchase) {
//         window.dispatchEvent(
//           new CustomEvent("tokun:purchased", { detail: latestPurchase })
//         );
//       }
//     } catch {}

//     navigate("/purchases?p=purchased", {
//       state: { refreshPurchases: true },
//     });
//   }}
//   className="w-40 h-11 rounded-lg text-sm font-medium bg-white/10 hover:bg-white/20 transition"
// >
//   Go to My Purchases
// </button>

//         {/* ✅ Back to Marketplace */}
//         <button
//           onClick={() => {
//             setShowSuccessPopup(false);
//             navigate("/prompt-marketplace");  // 👈 goes to marketplace
//           }}
//           className="w-40 h-11 rounded-lg text-sm font-medium text-white"
//           style={{
//             background: "linear-gradient(90deg, #FF14EF 0%, #1A73E8 100%)",
//           }}
//         >
//           Prompt Marketplace
//         </button>
//       </div>
//     </div>
//   </div>
// )}


// {token && (
//  <KycGateModal
//   open={kycOpen}
//   onClose={() => setKycOpen(false)}
//   token={token}
//    apiBase={API_BASE}
//   //  apiBase="http://localhost:5000"
//   defaultCountry="IN"
//   requiredForLabel="buying and uploading prompts"
//   onVerified={() => {
//     if (pendingPurchasePrompt) {
//       const p = pendingPurchasePrompt;
//       setPendingPurchasePrompt(null);
//       handlePurchase(p);
//     }
//   }}
// />
// )}


// {categoriesModalOpen && (
//   <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
//     <div
//       className="w-full max-w-[620px] rounded-[28px] border border-white/10 bg-[#17171A] p-5 sm:p-6 text-white"
//       onClick={(e) => e.stopPropagation()}
//     >
//       <div className="flex items-start justify-between gap-4">
//         <div>
//           <h3 className="text-xl font-semibold">Select Categories</h3>
//           <p className="mt-1 text-sm text-white/60">
//             Ek hi baar me multiple categories choose kar sakte ho.
//           </p>
//         </div>

//         <button
//           type="button"
//           onClick={() => setCategoriesModalOpen(false)}
//           className="w-10 h-10 rounded-full grid place-items-center bg-white/5 hover:bg-white/10"
//           aria-label="Close categories modal"
//         >
//           <X className="h-5 w-5" />
//         </button>
//       </div>

//       <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[320px] overflow-y-auto pr-1">
//         {categoryOptions.map(({ id, icon: Icon }) => {
//           const active = draftCategories.includes(id);

//           return (
//             <button
//               key={id}
//               type="button"
//               onClick={() => toggleDraftCategory(id)}
//               className={`w-full flex items-center justify-between rounded-2xl px-4 py-3 border transition-colors ${
//                 active
//                   ? "bg-white/10 border-white/20"
//                   : "bg-[#121213] border-white/5 hover:bg-white/5"
//               }`}
//             >
//               <div className="flex items-center gap-3">
//                 <Icon className="h-4 w-4" />
//                 <span className="text-sm font-medium">{id}</span>
//               </div>

//               <span
//                 className={`w-5 h-5 rounded-full grid place-items-center border ${
//                   active
//                     ? "bg-white text-black border-white"
//                     : "border-white/20 text-transparent"
//                 }`}
//               >
//                 <Check className="h-3.5 w-3.5" />
//               </span>
//             </button>
//           );
//         })}
//       </div>

//       <div className="mt-6 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3">
//         <button
//           type="button"
//           onClick={clearCategorySelection}
//           className="h-[46px] px-4 rounded-full border border-white/10 bg-[#121213] text-white/80 hover:bg-white/5"
//         >
//           Clear All
//         </button>

//         <button
//           type="button"
//           onClick={() => setCategoriesModalOpen(false)}
//           className="h-[46px] px-4 rounded-full border border-white/10 bg-[#121213] text-white hover:bg-white/5"
//         >
//           Cancel
//         </button>

//         <button
//           type="button"
//           onClick={applyCategorySelection}
//           className="h-[46px] px-5 rounded-full text-white font-medium"
//           style={{ background: "linear-gradient(270deg, #1A73E8 0%, #FF14EF 100%)" }}
//         >
//           Apply Categories
//         </button>
//       </div>
//     </div>
//   </div>
// )}

//     </div>
//   );
// };

// export default PromptMarketplacePage;






// src/pages/PromptMarketplacePage.tsx
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate, useLocation } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search, Star, Eye, Video, Sparkles, History,
  ChevronLeft, ChevronRight, ChevronDown, GraduationCap, Palette, FileText,
  BadgeDollarSign, Users, Plane, FlaskConical, Code2, BarChart3,
  LifeBuoy, Briefcase, Image as ImageIcon, ArrowLeft,
  SlidersHorizontal, Check, X,
  Database, Building2, HeartPulse, Zap, Tag, Share2, Layers,
  TrendingUp, ShieldCheck, ArrowRight, ArrowUpRight, Wallet, Rocket, Play,
} from "lucide-react";
import { User } from "lucide-react";

import { toast } from "@/components/ui/use-toast";
import Header from "@/components/Header";
import MediaEnlargeModal from "@/components/MediaEnlargeModal";
import PromptHistory from "@/components/PromptHistory";
import AppNavigation from "@/components/AppNavigation";
import TokenUsageSection from "@/components/TokenUsageSection";
import { useUserTokenUsage } from "@/hooks/useUserTokenUsage";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import Footer from "@/components/Footer";
import DetailsPrompt from "@/components/DetailsPrompt";
import VideoReelCard, { authorInitials, buyerPrice } from "@/components/VideoReelCard";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import ModalComponent from "@/components/ModalComponent";
import { ShoppingCart, Clock, Info, Lock } from "lucide-react";
import KycGateModal from "@/components/KycGateModal";
import { useCart } from "@/contexts/CartContext";
import SellPromptModal from "@/components/SellPromptModal";
import SellerLinkedAccountForm from "@/components/SellerLinkedAccountForm";
import RequestToBuyModal from "@/components/RequestToBuyModel";
import {
  isTeamMember,
  TEAM_MEMBER_PURCHASE_TOAST,
  TEAM_MEMBER_SELL_TOAST,
} from "@/lib/orgRoles";
import "./PromptMarketplace.css";

type Prompt = {
  id: string;
  title: string;
  description: string;
  category: string;
  /** The seller's list price — what they earn from, NOT what the buyer pays. */
  price?: number;
  /**
   * What the buyer is actually charged: list price plus Tokun's platform fee.
   * This is the figure Razorpay is given at create-order, so it's the one that
   * has to be on screen — showing `price` meant the payment sheet asked for
   * more than the card advertised.
   */
  tokunPrice?: number;
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
  /**
   * Seller's payout account is still being verified, so this listing is
   * visible but not buyable — the server rejects a purchase for it with
   * `seller_not_verified`. Rendered as a "Coming soon" state.
   */
  sellerVerificationPending?: boolean;

  uploaderName?: string;
  uploaderId?: string | null;
  uploaderAvatar?: string;
};

type FileType = "all" | "video" | "image" | "code";
type LicenseType = "all" | "free" | "premium" | "one-time";


const GRADIENT = "linear-gradient(270deg, #1A73E8 0%, #FF14EF 100%)";
const GRADIENT_90 = "linear-gradient(90deg, #FF14EF 0%, #1A73E8 100%)";

const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, "");
const PROMPTS_BASE = `${API_BASE}/api/prompt`;
const PURCHASE_BASE = `${API_BASE}/api/purchase`;

// ⚠️ Keep your real Razorpay key id in env:
const RAZORPAY_KEY_ID = (import.meta as any).env?.VITE_RAZORPAY_KEY_ID || "rzp_test_TLG37MSt5U18rP";

// authorInitials, buyerPrice and VideoReelCard now live in
// components/VideoReelCard.tsx — the profile page renders the same video
// cards, and one copy is the only way they stay the same.

/* ---------- Landing-style background (self-contained, no deps) ---------- */
const BG_BITS = [
  { t: "{prompt}", x: "5%", y: "16%" },
  { t: "(AI)", x: "3%", y: "50%" },
  { t: "token", x: "85%", y: "74%" },
  { t: "01", x: "90%", y: "10%" },
  { t: "0", x: "40%", y: "30%" },
  { t: "1", x: "47%", y: "50%" },
  { t: "1", x: "44%", y: "38%" },
  { t: "0", x: "52%", y: "20%" },
  { t: "</>", x: "92%", y: "42%" },
  { t: "}", x: "8%", y: "82%" },
  { t: "01", x: "68%", y: "88%" },
];
const BG_DOTS = [
  { x: "18%", y: "24%" }, { x: "78%", y: "18%" }, { x: "88%", y: "56%" },
  { x: "24%", y: "70%" }, { x: "62%", y: "64%" }, { x: "12%", y: "40%" },
  { x: "70%", y: "30%" }, { x: "36%", y: "84%" },
];

const MarketplaceBackground = () => (
  <div className="marketplace__bg" aria-hidden="true">
    <div className="mp-bg__glow" />
    <div className="mp-bg__grid" />
    {BG_BITS.map((b, i) => (
      <span key={`bit-${i}`} className="mp-bg__bit" style={{ left: b.x, top: b.y }}>
        {b.t}
      </span>
    ))}
    {BG_DOTS.map((d, i) => (
      <span key={`dot-${i}`} className="mp-bg__dot" style={{ left: d.x, top: d.y }} />
    ))}
  </div>
);

/* ---------- Category animated preview themes ---------- */
const CATEGORY_THEMES: Record<string, { bg: string; emoji: string; accent: string }> = {
  "Coding":       { bg: "linear-gradient(135deg,#0f172a,#1e1b4b,#0c1445)", emoji: "💻", accent: "#06b6d4" },
  "Design":       { bg: "linear-gradient(135deg,#2d1b69,#7c3aed,#4c0519)", emoji: "🎨", accent: "#f59e0b" },
  "Writing":      { bg: "linear-gradient(135deg,#064e3b,#065f46,#047857)", emoji: "✍️", accent: "#10b981" },
  "Marketing":    { bg: "linear-gradient(135deg,#7c2d12,#9a3412,#c2410c)", emoji: "📈", accent: "#f97316" },
  "UI/UX":        { bg: "linear-gradient(135deg,#1e1b4b,#3730a3,#4338ca)", emoji: "🖥️", accent: "#818cf8" },
  "Business":     { bg: "linear-gradient(135deg,#052e16,#166534,#15803d)", emoji: "💼", accent: "#4ade80" },
  "Photography":  { bg: "linear-gradient(135deg,#1c1917,#44403c,#292524)", emoji: "📷", accent: "#a78bfa" },
  "Video":        { bg: "linear-gradient(135deg,#450a0a,#7f1d1d,#991b1b)", emoji: "🎬", accent: "#fca5a5" },
  "Music":        { bg: "linear-gradient(135deg,#2e1065,#4c1d95,#5b21b6)", emoji: "🎵", accent: "#c084fc" },
  "Education":    { bg: "linear-gradient(135deg,#0c4a6e,#075985,#0369a1)", emoji: "📚", accent: "#38bdf8" },
  "Social Media": { bg: "linear-gradient(135deg,#831843,#9d174d,#be185d)", emoji: "📱", accent: "#f9a8d4" },
  "Finance":      { bg: "linear-gradient(135deg,#14532d,#166534,#065f46)", emoji: "💰", accent: "#86efac" },
  "AI":           { bg: "linear-gradient(135deg,#1e1b4b,#312e81,#4338ca)", emoji: "🤖", accent: "#a5b4fc" },
  "Productivity": { bg: "linear-gradient(135deg,#1c1917,#292524,#44403c)", emoji: "⚡", accent: "#fbbf24" },
  "E-commerce":   { bg: "linear-gradient(135deg,#0c4a6e,#1e40af,#1d4ed8)", emoji: "🛒", accent: "#60a5fa" },
  "Health":       { bg: "linear-gradient(135deg,#064e3b,#065f46,#0f766e)", emoji: "💚", accent: "#6ee7b7" },
  "Travel":       { bg: "linear-gradient(135deg,#0c4a6e,#0369a1,#0284c7)", emoji: "✈️", accent: "#7dd3fc" },
  "Food":         { bg: "linear-gradient(135deg,#7c2d12,#9a3412,#b45309)", emoji: "🍕", accent: "#fcd34d" },
};
const DEFAULT_THEME = { bg: "linear-gradient(135deg,#1e1b4b,#7c3aed,#1d4ed8)", emoji: "✨", accent: "#a78bfa" };

const CODE_LINES = [
  { text: 'const ai = new Model()', color: '#06b6d4' },
  { text: 'import { GPT } from "ai"', color: '#818cf8' },
  { text: 'function train(data) {', color: '#34d399' },
  { text: '  return fit(data, 100)', color: '#94a3b8' },
  { text: '} // epochs done', color: '#475569' },
  { text: 'await model.predict(x)', color: '#06b6d4' },
  { text: 'const loss = 0.0023', color: '#fbbf24' },
  { text: 'export default model', color: '#818cf8' },
  { text: 'npm run build:prod', color: '#34d399' },
  { text: 'git push origin main', color: '#f97316' },
];

const CategoryPreviewAnim = ({ categoryId }: { categoryId: string }) => {
  const theme = CATEGORY_THEMES[categoryId] || DEFAULT_THEME;

  if (categoryId === "Coding") {
    return (
      <div className="mp-cat__anim mp-cat__anim--code" style={{ background: "#0d1117" }}>
        <div className="mp-cat__code-scroll">
          {CODE_LINES.map((line, i) => (
            <div
              key={i}
              className="mp-cat__code-line"
              style={{ color: line.color, animationDelay: `${i * 0.18}s` } as React.CSSProperties}
            >
              {line.text}
            </div>
          ))}
        </div>
        <div className="mp-cat__code-overlay" />
      </div>
    );
  }

  return (
    <div className="mp-cat__anim" style={{ background: theme.bg }}>
      <div className="mp-cat__anim-glow" style={{ background: `radial-gradient(circle at 50% 40%,${theme.accent}44 0%,transparent 70%)` }} />
      <span className="mp-cat__anim-emoji">{theme.emoji}</span>
      {[0,1,2,3,4,5].map(i => (
        <span
          key={i}
          className="mp-cat__particle"
          style={{ left: `${10 + i * 15}%`, animationDelay: `${i * 0.28}s`, background: theme.accent } as React.CSSProperties}
        />
      ))}
    </div>
  );
};

/* ---------- Segmented tab filter (replaces PillDropdown) ---------- */
const SegmentedTabs = ({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { label: string; value: string; icon?: React.ComponentType<any> }[];
}) => (
  <div className="mp-segtabs">
    <span className="mp-segtabs__label">{label}</span>
    <div className="mp-segtabs__track">
      {options.map((opt) => {
        const Icon = opt.icon;
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`mp-segtabs__tab${active ? " mp-segtabs__tab--on" : ""}`}
          >
            {Icon && <Icon className="h-3.5 w-3.5" />}
            <span>{opt.label}</span>
          </button>
        );
      })}
    </div>
  </div>
);

/* ---------- Categories scroller with hover-video + Select Categories ---------- */
const CategoriesScroller: React.FC<{
  selectedCategory: string;
  setSelectedCategory: (c: string) => void;
  categoriesData: { id: string; icon: React.ComponentType<any>; previewImage?: string; previewVideo?: string }[];
  onOpenModal: () => void;
  selectedCategories: string[];
  onClearCategories: () => void;
  allPrompts: { id: string; category: string; videoUrl?: string; imageUrl?: string }[];
}> = ({ selectedCategory, setSelectedCategory, categoriesData, onOpenModal, selectedCategories, onClearCategories, allPrompts }) => {
  const railRef  = useRef<HTMLDivElement>(null);
  const rowRef   = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [hoveredId,    setHoveredId]    = useState<string | null>(null);
  const [previewLeft,  setPreviewLeft]  = useState(0);
  const [previewMedia, setPreviewMedia] = useState<{ type: "video"|"image"|"animation"; src: string } | null>(null);

  const slide = (dir: "left" | "right") => {
    railRef.current?.scrollBy({ left: dir === "left" ? -260 : 260, behavior: "smooth" });
  };

  const resolveUrl = (src: string) =>
    src.startsWith("http") ? src : `${API_BASE}${src.startsWith("/") ? "" : "/"}${src}`;

  const getPreview = (id: string, catPreviewVideo?: string, catPreviewImage?: string) => {
    if (id === "All") return null;
    if (catPreviewVideo) return { type: "video" as const, src: catPreviewVideo };
    const catLower = id.toLowerCase();
    const match = allPrompts.find(p => p.category?.toLowerCase() === catLower && (p.videoUrl || p.imageUrl));
    if (match?.videoUrl) return { type: "video" as const, src: match.videoUrl };
    if (catPreviewImage) return { type: "image" as const, src: catPreviewImage };
    if (match?.imageUrl) return { type: "image" as const, src: match.imageUrl };
    return { type: "animation" as const, src: "" };
  };

  const handleEnter = (
    id: string,
    media: { type: "video"|"image"|"animation"; src: string },
    e: React.MouseEvent<HTMLDivElement>
  ) => {
    const pillRect = e.currentTarget.getBoundingClientRect();
    const rowRect  = rowRef.current?.getBoundingClientRect();
    setPreviewLeft(rowRect ? pillRect.left - rowRect.left + pillRect.width / 2 : pillRect.width / 2);
    setPreviewMedia(media);
    setHoveredId(id);
    if (media.type === "video") {
      setTimeout(() => {
        if (videoRef.current) { videoRef.current.currentTime = 0; videoRef.current.play().catch(() => {}); }
      }, 20);
    }
  };

  const handleLeave = () => {
    setHoveredId(null);
    if (videoRef.current) { videoRef.current.pause(); videoRef.current.currentTime = 0; }
  };

  return (
    <div ref={rowRef} className="mp-cats-row">

      {/* Preview card — rendered OUTSIDE the overflow:hidden viewport so it's never clipped */}
      {hoveredId && previewMedia && (
        <div className="mp-cat__preview" style={{ left: previewLeft }}>
          {previewMedia.type === "video" ? (
            <video ref={videoRef} src={resolveUrl(previewMedia.src)} muted loop playsInline autoPlay className="mp-cat__preview-video" />
          ) : previewMedia.type === "image" ? (
            <img src={resolveUrl(previewMedia.src)} alt={hoveredId} className="mp-cat__preview-video" />
          ) : (
            <CategoryPreviewAnim categoryId={hoveredId} />
          )}
          <span className="mp-cat__preview-label">{hoveredId}</span>
        </div>
      )}

      {/* Scroller */}
      <div className="mp-cats">
        <button onClick={() => slide("left")} className="mp-cats__arrow" aria-label="Scroll left">
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="mp-cats__viewport">
          <div ref={railRef} className="mp-cats__rail">
            {categoriesData.map(({ id, icon: Icon, previewVideo, previewImage }) => {
              const isActive = selectedCategory === id;
              const preview  = getPreview(id, previewVideo, previewImage);
              return (
                <div
                  key={id}
                  className="mp-cat-wrap"
                  onMouseEnter={preview ? (e) => handleEnter(id, preview, e) : undefined}
                  onMouseLeave={preview ? handleLeave : undefined}
                >
                  <button
                    onClick={() => setSelectedCategory(id)}
                    aria-pressed={isActive}
                    className={`mp-cat${isActive ? " mp-cat--active" : ""}`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{id}</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        <button onClick={() => slide("right")} className="mp-cats__arrow" aria-label="Scroll right">
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Select Categories — pinned right */}
      <div className="mp-cats__actions">
        <button type="button" onClick={onOpenModal} className="mp-catbar__btn">
          <SlidersHorizontal className="h-4 w-4" />
          <span>Select Categories{selectedCategories.length > 0 ? ` (${selectedCategories.length})` : ""}</span>
        </button>
        {selectedCategories.length > 0 && (
          <button type="button" onClick={onClearCategories} className="mp-catbar__clear">
            Clear
          </button>
        )}
      </div>
    </div>
  );
};

/* ========================================================================
   NEW LIBRARY-STYLE DESIGN — ported 1:1 from PromptLibraryPage.tsx per
   explicit request ("prompt marketplace me same esa karo jo library me kiya
   hai"). Wired to THIS page's own real state/handlers below (prompts,
   categoriesData, purchasedPrompts, handlePurchase, detailsOpen/detailsPrompt,
   addToCart) rather than duplicating data-fetching. Old design (title/
   filters/grid) is disabled further down via {false && (...)}, not deleted.
   ======================================================================== */
const LIB_BANNERS = {
  // Kept as the hero video's poster and as the still fallback — see
  // LibHeroBanner. Not rendered on its own any more.
  hero: "/icons/mark1.jpg",
  heroVideo: "/icons/china.mp4",
  crystal: "/icons/banner-crystal-tower.png",
  brandIdentity: "/icons/banner-logo-identity.png",
};

// (libStockImage removed — it built picsum.photos URLs for the two CTA cards,
// which now animate in CSS. Nothing else on the page pulled stock photos.)

const formatCardPrice = (p: Prompt) =>
  p.isFree || !buyerPrice(p) ? "Free" : `₹${buyerPrice(p).toFixed(2)}`;

const LibEyebrow = ({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) => (
  <div className="flex items-center gap-2 text-[12px] font-semibold tracking-wide" style={{ color: "#22D3EE" }}>
    {icon}
    <span>{children}</span>
  </div>
);

const LibArrowNav = ({ onLeft, onRight }: { onLeft: () => void; onRight: () => void }) => (
  <div className="flex items-center gap-2">
    <button
      onClick={onLeft}
      aria-label="Scroll left"
      className="w-9 h-9 rounded-full grid place-items-center text-white/80 hover:text-white transition-colors"
      style={{ background: "#1C1C1C", border: "1px solid rgba(255,255,255,0.12)" }}
    >
      <ChevronLeft className="h-4 w-4" />
    </button>
    <button
      onClick={onRight}
      aria-label="Scroll right"
      className="w-9 h-9 rounded-full grid place-items-center text-white/80 hover:text-white transition-colors"
      style={{ background: "#1C1C1C", border: "1px solid rgba(255,255,255,0.12)" }}
    >
      <ChevronRight className="h-4 w-4" />
    </button>
  </div>
);

const LibPromptMedia = ({
  imageUrl,
  videoUrl,
  className,
  children,
}: {
  imageUrl: string;
  videoUrl?: string;
  className?: string;
  children?: React.ReactNode;
}) => {
  const [hovering, setHovering] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);
  const popupVideoRef = useRef<HTMLVideoElement>(null);
  const showVideo = Boolean(videoUrl) && !videoFailed;

  const handleEnter = () => setHovering(true);
  const handleLeave = () => {
    setHovering(false);
    if (popupVideoRef.current) {
      popupVideoRef.current.pause();
      popupVideoRef.current.currentTime = 0;
    }
  };

  return (
    <div
      className={`relative bg-[#0B0B0B] ${className ?? ""}`}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      <img
        src={imageUrl}
        alt=""
        className="w-full h-full object-cover transition-transform duration-500 ease-out"
        style={{ transform: hovering ? "scale(1.06)" : "scale(1)" }}
      />

      {showVideo && (
        <div
          className="absolute bottom-2 right-2 w-6 h-6 rounded-full grid place-items-center transition-opacity duration-300"
          style={{ background: "rgba(0,0,0,0.55)", opacity: hovering ? 0 : 1 }}
        >
          <Play className="h-3 w-3 text-white" fill="white" />
        </div>
      )}

      {children}

      {hovering &&
        typeof document !== "undefined" &&
        createPortal(
          <div className="fixed inset-0 flex items-center justify-center pointer-events-none px-6" style={{ zIndex: 999 }}>
            <style>{`
              @keyframes libPromptPopupFadeIn { from { opacity: 0; } to { opacity: 1; } }
              @keyframes libPromptPopupZoomIn { from { opacity: 0; transform: scale(0.92); } to { opacity: 1; transform: scale(1); } }
            `}</style>
            <div
              className="absolute inset-0"
              style={{ background: "rgba(6,6,8,0.72)", backdropFilter: "blur(10px)", animation: "libPromptPopupFadeIn 0.2s ease-out" }}
            />
            <div
              className="relative rounded-[24px] overflow-hidden shadow-2xl"
              style={{
                width: showVideo ? "min(680px, 88vw)" : "min(520px, 88vw)",
                aspectRatio: showVideo ? "16 / 9" : "4 / 3",
                border: "1px solid rgba(255,255,255,0.15)",
                background: "#0B0B0B",
                animation: "libPromptPopupZoomIn 0.22s cubic-bezier(0.16, 1, 0.3, 1)",
              }}
            >
              {showVideo ? (
                <video
                  ref={popupVideoRef}
                  src={videoUrl}
                  autoPlay
                  muted
                  loop
                  playsInline
                  onError={() => setVideoFailed(true)}
                  className="w-full h-full object-cover"
                />
              ) : (
                <img src={imageUrl} alt="" className="w-full h-full object-cover" />
              )}
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};

const LibHeroBanner = ({
  searchQuery,
  onSearchChange,
  onBrowse,
}: {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onBrowse: () => void;
}) => {
  const navigate = useNavigate();
  const reduceMotion = usePrefersReducedMotion();

  return (
  <div className="relative w-full overflow-hidden rounded-[28px]" style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
    {/* Video banner, with the old still as its poster.
        The poster matters: this file is several MB, and without one the hero is
        a black rectangle until enough of it has buffered to start.
        Anyone with "reduce motion" on gets the still instead — an autoplaying
        full-bleed video is exactly what that setting exists to stop, and CSS
        can't pause a <video>, so the choice has to happen here. */}
    {reduceMotion ? (
      <img
        src={LIB_BANNERS.hero}
        alt="Prompt Marketplace"
        className="absolute inset-0 w-full h-full object-cover"
      />
    ) : (
      <video
        src={LIB_BANNERS.heroVideo}
        poster={LIB_BANNERS.hero}
        autoPlay
        muted
        loop
        playsInline
        // Decorative: the headline next to it already says what this is, so it
        // stays out of the accessibility tree rather than being announced.
        aria-hidden
        className="absolute inset-0 w-full h-full object-cover"
      />
    )}
    {/* Two scrims instead of one flat sheet.
        The old single overlay ran 55% → 94% black across the whole banner —
        tuned for the near-black nebula art that used to sit here, and it
        swallowed the new image completely. This keeps the picture bright and
        darkens only where it has to: a light wash overall, and a soft pool
        behind the centred copy. */}
    <div
      className="absolute inset-0"
      style={{
        background:
          "linear-gradient(180deg, rgba(6,6,8,0.16) 0%, rgba(6,6,8,0.26) 45%, rgba(6,6,8,0.62) 100%)",
      }}
    />
    <div
      className="absolute inset-0"
      style={{
        background:
          "radial-gradient(58% 64% at 50% 54%, rgba(6,6,8,0.60) 0%, rgba(6,6,8,0.28) 58%, rgba(6,6,8,0) 100%)",
      }}
    />

    <button
      onClick={() => navigate("/self-dash?tab=prompts&p=purchased")}
      className="absolute top-5 right-5 z-20 flex items-center gap-2 text-[12px] font-medium text-white px-4 py-2 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
      style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.25)", backdropFilter: "blur(6px)" }}
    >
      <History className="h-3.5 w-3.5" />
      Purchase History
    </button>

    {/* The "GLOBAL LEADERBOARD" eyebrow and the floating asset card that used
        to sit here are gone. Neither described anything on this page — the card
        showed a hardcoded "Asset ID #9982 · NeonForge · 1.5 ETH", an NFT
        auction that doesn't exist and that Tokun doesn't sell. */}

    <div className="relative z-10 px-6 sm:px-10 py-16 sm:py-24 flex flex-col items-center text-center">
      {/* Now that the image shows through, the copy can't rely on the scrim
          alone — a shadow keeps it legible if it lands on a bright patch. */}
      <h1
        className="mt-4 text-white text-[32px] sm:text-[44px] md:text-[52px] font-semibold leading-[1.05]"
        style={{ fontFamily: "Inter", textShadow: "0 2px 24px rgba(0,0,0,0.55)" }}
      >
        Prompt{" "}
        <span style={{ background: GRADIENT_90, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          Marketplace
        </span>
      </h1>

      <p
        className="mt-4 text-white/85 max-w-[560px] text-[14px] sm:text-[15px] leading-relaxed"
        style={{ textShadow: "0 1px 12px rgba(0,0,0,0.6)" }}
      >
        Access 310k+ high-quality AI prompts for art, logic, architecture, and business optimization.
      </p>

      <form
        className="mt-8 flex items-center w-full max-w-[700px] h-[46px] sm:h-[50px] rounded-[200px] overflow-hidden px-2"
        style={{ background: "rgba(18,18,19,0.85)", border: "1px solid rgba(255,255,255,0.18)", backdropFilter: "blur(8px)" }}
        onSubmit={(e) => {
          e.preventDefault();
          onBrowse();
        }}
      >
        <Search className="h-5 w-5 text-white/40 ml-2" />
        <input
          name="q"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search prompts for 'Hyper-realistic architecture'..."
          className="ml-3 flex-1 bg-transparent outline-none text-white placeholder:text-white/40 text-sm"
        />
        <button
          type="submit"
          className="text-white font-medium text-sm"
          style={{ width: "90px", height: "36px", borderRadius: "200px", background: GRADIENT_90 }}
        >
          Search
        </button>
      </form>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
        <button
          onClick={onBrowse}
          className="flex items-center gap-2 h-11 px-6 rounded-full text-white text-[13px] font-semibold"
          style={{ background: GRADIENT_90 }}
        >
          Browse Collection
          <ArrowRight className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-2">
          <div className="flex -space-x-2">
            {[12, 32, 47].map((imgId) => (
              <img
                key={imgId}
                src={`https://i.pravatar.cc/64?img=${imgId}`}
                alt=""
                className="w-7 h-7 rounded-full border-2 object-cover"
                style={{ borderColor: "#0B0B0B" }}
              />
            ))}
          </div>
          <span
            className="text-[12px] text-white/75"
            style={{ textShadow: "0 1px 10px rgba(0,0,0,0.65)" }}
          >
            Used by 12k+ creators today
          </span>
        </div>
      </div>
    </div>
  </div>
  );
};

const LibCreateAppBanner = () => {
  const navigate = useNavigate();
  return (
    <div
      className="relative overflow-hidden rounded-[24px] px-6 sm:px-8 py-6 sm:py-7 flex flex-col sm:flex-row items-center justify-between gap-5"
      style={{ background: "linear-gradient(120deg, #14141A 0%, #1C1420 60%, #14141A 100%)", border: "1px solid rgba(255,255,255,0.08)" }}
    >
      <div className="flex items-center gap-4 text-center sm:text-left">
        <div className="w-12 h-12 rounded-2xl grid place-items-center shrink-0" style={{ background: GRADIENT }}>
          <Rocket className="h-6 w-6 text-white" />
        </div>
        <div>
          <h4 className="text-white text-[17px] font-semibold">Create an AI app using prompts</h4>
          <p className="text-white/60 text-[13px] mt-1 max-w-[420px]">
            Turn any prompt into a shareable AI app in minutes — no code required.
          </p>
        </div>
      </div>
      <button
        onClick={() => navigate("/smartgen")}
        className="shrink-0 h-11 px-6 rounded-full text-white text-[13px] font-semibold"
        style={{ background: GRADIENT_90 }}
      >
        Get Started
      </button>
    </div>
  );
};

/* Restored old-style card (per explicit request): video prompts reuse the
   existing VideoReelCard (9:16 reel), image prompts reuse the old
   ".mp-card" markup (uploader avatar+name, Cart + Buy Now buttons) — same
   size/content as the pre-redesign marketplace, just placed inside the new
   horizontal-scroll rows via a fixed-width wrapper. */
const LibOldStyleCard = ({
  prompt,
  mediaKind,
  isPurchased,
  isOwn,
  isPlaying,
  hasPayoutSetup,
  onVideoPlay,
  onAddToCart,
  onBuyNow,
  onOpenDetails,
  onNavigateToProfile,
}: {
  prompt: Prompt;
  mediaKind: "video" | "image";
  isPurchased: boolean;
  isOwn: boolean;
  isPlaying: boolean;
  hasPayoutSetup?: boolean;
  onVideoPlay: (id: string | number) => void;
  onAddToCart: (id: string | number) => void;
  onBuyNow: (p: Prompt) => void;
  onOpenDetails: (p: Prompt) => void;
  onNavigateToProfile: (id: string | null | undefined) => void;
}) => {
  // Called before the early return below so the hook order stays fixed.
  const { user: viewer } = useAuth?.() || ({} as any);
  const teamMember = isTeamMember(viewer);

  // Listed but not yet buyable — the seller is still going through Route
  // payout onboarding. `sellerVerificationPending` comes down with the feed;
  // `hasPayoutSetup === false` is the older per-prompt lookup, kept so no
  // listing that was previously blocked quietly becomes purchasable.
  const comingSoon = !!prompt.sellerVerificationPending || hasPayoutSetup === false;

  if (mediaKind === "video") {
    return (
      // Same width as the image card below, and the rail stretches both to the
      // same height — a row of prompts shouldn't change shape by media type.
      <div style={{ width: 300, flexShrink: 0 }}>
        <VideoReelCard
          prompt={prompt}
          isPurchased={isPurchased}
          isOwn={isOwn}
          isPlaying={isPlaying}
          // Was never forwarded, so a video listing from an unverified seller
          // showed a live Buy Now that failed at checkout — the image card next
          // to it disabled the same button.
          hasPayoutSetup={hasPayoutSetup}
          onVideoPlay={onVideoPlay}
          onAddToCart={onAddToCart}
          onBuyNow={(p) => onBuyNow(p as Prompt)}
          onOpenDetails={(p) => onOpenDetails(p as Prompt)}
          onNavigateToProfile={onNavigateToProfile}
        />
      </div>
    );
  }

  return (
    <div
      className="mp-card"
      style={{ width: 300, flexShrink: 0 }}
      onClick={() => onOpenDetails(prompt)}
    >
      {/* MEDIA */}
      <div className="mp-card__media">
        <div className="mp-card__preview group">
          <img src={prompt.imageUrl} alt={prompt.title} className="mp-card__img" />
        </div>

        <div className="mp-card__badges">
          <span className="mp-card__cat">{prompt.category?.toUpperCase()}</span>
          {comingSoon && !isPurchased ? (
            // Takes the unlock badge's place rather than sitting next to it —
            // "PURCHASE TO UNLOCK" next to "COMING SOON" is a contradiction.
            <span
              className="mp-card__unlock"
              style={{ background: "#3A2A08", color: "#FBBF24" }}
            >
              <Clock className="h-3 w-3 inline-block mr-1 -mt-[1px]" />
              COMING SOON
            </span>
          ) : !isPurchased ? (
            <span
              className="mp-card__unlock"
              style={{
                background: prompt.exclusive ? "#2A2A2A" : undefined,
                color: prompt.exclusive ? "#4ADE80" : undefined,
              }}
            >
              {prompt.exclusive ? "ONE-TIME PURCHASE" : "PURCHASE TO UNLOCK"}
            </span>
          ) : (
            <span className="mp-card__unlock" style={{ background: "#14532D", color: "#BBF7D0" }}>
              PURCHASED
            </span>
          )}
        </div>

        {!prompt.isFree && prompt.price && prompt.price > 0 ? (
          <div className="mp-card__crown">
            <img src="/icons/premium.png" alt="Premium" className={prompt.exclusive ? "filter-green" : ""} />
          </div>
        ) : null}
      </div>

      {/* BODY */}
      <div className="mp-card__body">
        <div className="mp-card__meta">
          <span className="mp-card__avatar">{authorInitials(prompt.uploaderName)}</span>
          <span
            className="mp-card__author-name"
            onClick={(e) => { e.stopPropagation(); onNavigateToProfile(prompt.uploaderId); }}
          >
            {prompt.uploaderName || "Unknown"}
          </span>
        </div>

        <h3 className="mp-card__title">{prompt.title}</h3>
        <p className="mp-card__desc">{prompt.description}</p>

        {/* Says WHY it can't be bought and that it will fix itself. Without
            this the locked button reads as a bug. */}
        {comingSoon && !isPurchased && (
          <div
            className="mt-2 flex items-start gap-2 rounded-lg px-2.5 py-2 text-[11px] leading-snug"
            style={{
              background: "rgba(251,191,36,0.08)",
              border: "1px solid rgba(251,191,36,0.25)",
              color: "#FCD34D",
            }}
          >
            <Info className="h-3.5 w-3.5 shrink-0 mt-[1px]" />
            <span>Seller verification pending. Goes on sale automatically once approved.</span>
          </div>
        )}

        <div className="mp-card__footer">
          {prompt.isFree ? (
            <div className="mp-card__pill mp-card__pill--free">FREE</div>
          ) : (
            <>
              <div className="mp-card__pill mp-card__pill--muted">
                ₹{buyerPrice(prompt).toFixed(2)}
              </div>

              {/* No cart for team members — checkout is blocked server-side.
                  Same for a listing awaiting verification: the cart route
                  rejects it, so offering the button would only fail later. */}
              {!isOwn && !teamMember && !comingSoon && (
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onAddToCart(prompt.id); }}
                  className="mp-card__pill mp-card__pill--cart"
                >
                  <ShoppingCart className="h-4 w-4" />
                  Cart
                </button>
              )}

              {!isOwn && !isPurchased && !(prompt.exclusive && prompt.sold) && (
                comingSoon ? (
                  <button
                    type="button"
                    disabled
                    title="This seller's payout account is still being verified."
                    className="mp-card__pill mp-card__pill--buy opacity-50 cursor-not-allowed inline-flex items-center gap-1.5"
                  >
                    <Lock className="h-3.5 w-3.5" />
                    Buy Now
                  </button>
                ) : teamMember ? (
                  // onBuyNow routes team members to the request modal.
                  <button
                    onClick={(e) => { e.stopPropagation(); onBuyNow(prompt); }}
                    className="mp-card__pill mp-card__pill--buy"
                  >
                    Request
                  </button>
                ) : (
                  <button
                    onClick={(e) => { e.stopPropagation(); onBuyNow(prompt); }}
                    className="mp-card__pill mp-card__pill--buy"
                  >
                    Buy Now
                  </button>
                )
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const LibPromptRow = ({
  eyebrowIcon,
  eyebrow,
  title,
  items,
  renderCard,
}: {
  eyebrowIcon: React.ReactNode;
  eyebrow: string;
  title: string;
  items: Prompt[];
  renderCard: (p: Prompt) => React.ReactNode;
}) => {
  const railRef = useRef<HTMLDivElement>(null);
  const scroll = (dir: "left" | "right") =>
    railRef.current?.scrollBy({ left: dir === "left" ? -280 : 280, behavior: "smooth" });

  if (items.length === 0) return null;

  return (
    <section>
      <div className="flex items-end justify-between flex-wrap gap-3 mb-5">
        <div>
          <LibEyebrow icon={eyebrowIcon}>{eyebrow}</LibEyebrow>
          <h3 className="mt-2 text-white text-[22px] sm:text-[26px] font-semibold">{title}</h3>
        </div>
        <LibArrowNav onLeft={() => scroll("left")} onRight={() => scroll("right")} />
      </div>

      <div ref={railRef} className="flex gap-5 overflow-x-auto scroll-smooth pb-2 no-scrollbar">
        {items.map((p) => renderCard(p))}
      </div>
    </section>
  );
};

const LibFeaturedSection = ({
  prompts,
  onOpenDetails,
  onAddToCart,
  onBuyNow,
  onNavigateToProfile,
  isOwn,
  isPurchased,
}: {
  prompts: Prompt[];
  onOpenDetails: (p: Prompt) => void;
  onAddToCart: (id: string | number) => void;
  onBuyNow: (p: Prompt) => void;
  onNavigateToProfile: (id: string | null | undefined) => void;
  isOwn: (p: Prompt) => boolean;
  isPurchased: (p: Prompt) => boolean;
}) => {
  // Called before the early return below so the hook order stays fixed.
  const { user: viewer } = useAuth?.() || ({} as any);
  const teamMember = isTeamMember(viewer);

  if (prompts.length === 0) return null;
  return (
    <section>
      <div className="flex items-center justify-between mb-2">
        <div>
          <LibEyebrow icon={<ShieldCheck className="h-4 w-4" />}>VERIFIED EXCELLENCE</LibEyebrow>
          <h3 className="mt-2 text-white text-[22px] sm:text-[26px] font-semibold">Featured Prompts</h3>
        </div>
      </div>
      <p className="text-white/60 text-[13px] max-w-[520px] mb-6">
        Curated selection of professional-grade prompts hand-picked by our prompt engineering specialists.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {prompts.map((p) => {
          /* "STAFF PICK" was on every non-exclusive prompt in this section, so
             it marked nothing — nobody was picking them. The category is real
             information and it's what a browser is scanning for anyway. */
          const isPremium = !!p.exclusive;
          const badge = isPremium ? "PREMIUM" : p.category || "";
          const own = isOwn(p);
          const purchased = isPurchased(p);
          return (
            <Card
              key={p.id}
              className="overflow-hidden transition-transform duration-300 hover:-translate-y-1 cursor-pointer"
              style={{ borderRadius: 24, background: "#1C1C1C", border: "1px solid rgba(255,255,255,0.1)" }}
              onClick={() => onOpenDetails(p)}
            >
              <CardContent className="p-0">
                <div className="relative w-full h-[220px] bg-[#0B0B0B] overflow-hidden">
                  {p.videoUrl ? (
                    <video
                      src={p.videoUrl}
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <img src={p.imageUrl} alt={p.title} className="w-full h-full object-cover" />
                  )}
                  {badge && (
                    <div
                      className="absolute top-4 right-4 px-3 py-1 rounded-full text-[10px] font-semibold text-white capitalize"
                      style={{
                        background: isPremium ? GRADIENT : "rgba(255,255,255,0.15)",
                        backdropFilter: "blur(4px)",
                      }}
                    >
                      {badge}
                    </div>
                  )}
                </div>

                <div className="p-6">
                  <div className="flex items-center gap-2 text-[11px] text-white/50 mb-2">
                    <span>{p.category}</span>
                    {p.uploaderName && (
                      <>
                        <span>•</span>
                        <span
                          onClick={(e) => { e.stopPropagation(); onNavigateToProfile(p.uploaderId); }}
                        >
                          {p.uploaderName}
                        </span>
                      </>
                    )}
                  </div>

                  <h4 className="text-[18px] font-semibold text-white">{p.title}</h4>
                  <p className="mt-2 text-[13px] leading-relaxed text-white/65 max-w-[420px]">{p.description}</p>

                  <div className="mt-5 flex items-center justify-between flex-wrap gap-2">
                    <span className="text-[18px] font-semibold text-white">{formatCardPrice(p)}</span>

                    {p.isFree ? (
                      <div className="mp-card__pill mp-card__pill--free">FREE</div>
                    ) : (
                      <div className="flex items-center gap-2">
                        {/* No cart for team members — checkout is blocked server-side. */}
                        {!own && !teamMember && (
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); onAddToCart(p.id); }}
                            className="mp-card__pill mp-card__pill--cart"
                          >
                            <ShoppingCart className="h-4 w-4" />
                            Cart
                          </button>
                        )}
                        {!own && !purchased && !(p.exclusive && p.sold) && (
                          <button
                            onClick={(e) => { e.stopPropagation(); onBuyNow(p); }}
                            className="mp-card__pill mp-card__pill--buy"
                          >
                            {/* onBuyNow routes team members to the request modal. */}
                            {teamMember ? "Request" : "Buy Now"}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
};

const LibBrandIdentitySpotlight = ({ onExplore }: { onExplore: () => void }) => {
  const checklist = [
    "Vector-ready minimalist aesthetics",
    "High-contrast tech branding logic",
    "Corporate color palette consistency",
  ];

  return (
    <div
      className="relative overflow-hidden rounded-[28px] p-8 sm:p-10"
      style={{ background: "linear-gradient(135deg, #16161A 0%, #1C1C24 100%)", border: "1px solid rgba(255,255,255,0.08)" }}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
        <div>
          <span
            className="inline-block px-3 py-1 rounded-full text-[11px] font-semibold text-white/85"
            style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)" }}
          >
            SPECIALIZED PROMPTS
          </span>

          <h3 className="mt-4 text-white text-[26px] sm:text-[30px] font-semibold leading-tight">
            Logo &amp; Brand Identity
            <br />
            <span style={{ background: GRADIENT_90, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Engineered for Pro Designers
            </span>
          </h3>

          <p className="mt-4 text-white/65 text-[14px] leading-relaxed max-w-[440px]">
            Elevate your branding workflow with prompts specifically designed for vector-style
            logos, consistent brand assets, and crystalline geometric designs.
          </p>

          <ul className="mt-5 space-y-2.5">
            {checklist.map((item) => (
              <li key={item} className="flex items-center gap-2.5 text-[13px] text-white/80">
                <span
                  className="w-5 h-5 rounded-full grid place-items-center shrink-0"
                  style={{ background: "rgba(26,115,232,0.15)" }}
                >
                  <Check className="h-3 w-3" style={{ color: "#1A73E8" }} />
                </span>
                {item}
              </li>
            ))}
          </ul>

          <button
            onClick={onExplore}
            className="mt-7 h-11 px-6 rounded-full text-white text-[13px] font-semibold"
            style={{ background: GRADIENT }}
          >
            Explore Brand Prompts
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.1)" }}>
            <img src={LIB_BANNERS.brandIdentity} alt="Logo & Brand Identity AI prompts" className="w-full h-[220px] object-cover" />
            <p className="text-center text-[12px] text-white/60 py-2">Crystalline Logic</p>
          </div>
          <div className="rounded-2xl overflow-hidden self-end" style={{ border: "1px solid rgba(255,255,255,0.1)" }}>
            <img src={LIB_BANNERS.crystal} alt="Retro brand kit" className="w-full h-[170px] object-cover" />
            <p className="text-center text-[12px] text-white/60 py-2">Retro Brand Kit</p>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Animated backdrop for the two CTA cards.
 *
 * Replaces the random picsum.photos shot each card used to load: an external
 * request the card sat blank behind, showing a photo unrelated to what the card
 * was offering. Drawn entirely in CSS (see index.css) — three drifting colour
 * clouds, a slow sheen and a panning grid, all on transform/opacity so it stays
 * on the compositor. Colours come from the caller so the two cards read as
 * siblings rather than clones.
 */
const LibAnimatedBackdrop = ({ colors }: { colors: [string, string, string] }) => (
  <div
    className="lib-cta-anim"
    aria-hidden
    style={
      {
        "--lib-cta-c1": colors[0],
        "--lib-cta-c2": colors[1],
        "--lib-cta-c3": colors[2],
      } as React.CSSProperties
    }
  >
    <span className="lib-cta-blob lib-cta-blob--a" />
    <span className="lib-cta-blob lib-cta-blob--b" />
    <span className="lib-cta-blob lib-cta-blob--c" />
    <span className="lib-cta-grid" />
    <span className="lib-cta-sheen" />
  </div>
);

const LibGlassCTACard = ({
  bgGradient,
  animColors,
  title,
  description,
  ctaLabel,
  ctaBg,
  onClick,
}: {
  bgGradient: string;
  animColors: [string, string, string];
  title: string;
  description: string;
  ctaLabel: string;
  ctaBg: string;
  onClick: () => void;
}) => {
  return (
    <div
      className="relative overflow-hidden rounded-[24px]"
      style={{ border: "1px solid rgba(255,255,255,0.08)", background: bgGradient }}
    >
      <LibAnimatedBackdrop colors={animColors} />
      {/* Kept, and lighter than before: the animation is dimmer than the photo
          was, and the copy still has to stay readable over the brightest frame
          of the sheen. */}
      <div
        className="absolute inset-0"
        style={{ background: "linear-gradient(160deg, rgba(10,10,12,0.20) 0%, rgba(8,8,10,0.72) 100%)" }}
      />

      <div
        className="relative m-3 sm:m-4 rounded-[20px] p-6 sm:p-7"
        style={{
          background: "rgba(255,255,255,0.06)",
          border: "1px solid rgba(255,255,255,0.15)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
        }}
      >
        <h4 className="text-white text-[20px] font-semibold">{title}</h4>
        <p className="mt-3 text-white/75 text-[13px] leading-relaxed max-w-[360px]">{description}</p>
        <button
          onClick={onClick}
          className="mt-6 h-10 px-5 rounded-full text-white text-[13px] font-semibold"
          style={{ background: ctaBg }}
        >
          {ctaLabel}
        </button>
      </div>
    </div>
  );
};

const LibSellHireSection = ({ onSell, onHire }: { onSell: () => void; onHire: () => void }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    {/* Each card's animation is tinted to match its own CTA button — magenta
        for selling, blue for hiring — so the two never look interchangeable. */}
    <LibGlassCTACard
      bgGradient="linear-gradient(135deg, #1C1620 0%, #14141A 100%)"
      animColors={["#FF14EF", "#7C3AED", "#1A73E8"]}
      title="Sell your prompts"
      description="Upload your prompts, connect your payout method, and join a global community of creators. Become a seller in just 2 minutes."
      ctaLabel="Start Selling"
      ctaBg={GRADIENT}
      onClick={onSell}
    />

    <LibGlassCTACard
      bgGradient="linear-gradient(135deg, #101A1E 0%, #14141A 100%)"
      animColors={["#1A73E8", "#22D3EE", "#0EA5E9"]}
      title="Hire an AI Expert"
      description="Commission custom prompt solutions and fine-tuned AI workflows from world-class prompt engineers for your specific business needs."
      ctaLabel="Find a Creator"
      ctaBg="#1A73E8"
      onClick={onHire}
    />
  </div>
);

const LibCategoriesRow = ({
  categories,
  selected,
  onSelect,
}: {
  categories: string[];
  selected: string;
  onSelect: (c: string) => void;
}) => {
  const railRef = useRef<HTMLDivElement>(null);
  const scroll = (dir: "left" | "right") =>
    railRef.current?.scrollBy({ left: dir === "left" ? -280 : 280, behavior: "smooth" });

  if (categories.length === 0) return null;
  const pills = ["All", ...categories];

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <LibEyebrow icon={<Sparkles className="h-4 w-4" />}>BROWSE BY CATEGORY</LibEyebrow>
        <LibArrowNav onLeft={() => scroll("left")} onRight={() => scroll("right")} />
      </div>
      <div ref={railRef} className="flex gap-3 overflow-x-auto scroll-smooth pb-2 no-scrollbar">
        {pills.map((c) => {
          const isActive = c === selected;
          return (
            <button
              key={c}
              onClick={() => onSelect(c)}
              className="shrink-0 px-4 py-2 rounded-full text-[13px] font-medium text-white transition-colors"
              style={
                isActive
                  ? { background: GRADIENT }
                  : { background: "#1C1C1C", border: "1px solid rgba(255,255,255,0.12)" }
              }
            >
              {c}
            </button>
          );
        })}
      </div>
    </section>
  );
};

/**
 * One API prompt document → the shape this page renders.
 *
 * Lifted out of the list fetch so a prompt opened from a shared link (fetched
 * one at a time by id) renders identically to one that came from the list.
 */
const mapPromptDoc = (doc: any): Prompt => {
  const att = doc?.attachment || null;
  const mediaPath = att?.path
    ? att.path.startsWith("http")
      ? att.path
      : `${API_BASE}${att.path}`
    : undefined;

  return {
    id: String(doc._id),
    title: doc.title || "Untitled",
    description: doc.description || "",
    category:
      (doc.categories?.[0]?.name as string) ||
      (Array.isArray(doc.categories) ? doc.categories.join(", ") : "") ||
      "General",

    price: typeof doc.price === "number" ? doc.price : 0,
    // Falls back to the list price rather than 0 — a prompt saved before the
    // tokun_price hook existed would otherwise render as free.
    tokunPrice:
      typeof doc.tokun_price === "number" && doc.tokun_price > 0
        ? doc.tokun_price
        : typeof doc.price === "number"
          ? doc.price
          : 0,
    rating: typeof doc.averageRating === "number" ? doc.averageRating : undefined,
    // Only present when the endpoint chose to send it — /public/:id strips it.
    // The details panel shows it to the uploader and uses it for Copy on free
    // prompts, which until now copied an empty string because nothing set it.
    fullPrompt: doc.promptText || undefined,
    imageUrl: att?.type === "image" ? mediaPath : undefined,
    videoUrl: att?.type === "video" ? mediaPath : undefined,
    preview:
      (doc.description && String(doc.description).slice(0, 140)) ||
      (doc.promptText && String(doc.promptText).slice(0, 140)) ||
      "",

    isFree: !!doc.free,
    exclusive: !!doc.exclusive,
    sold: !!doc.sold,
    sellerVerificationPending: !!doc.sellerVerificationPending,

    uploaderName: doc?.userId?.name || "Unknown",
    uploaderId: doc?.userId?._id || null,

    uploaderAvatar: "/icons/default-user.png",
  } as Prompt;
};

const PromptMarketplacePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  // Guards the shared-link effect against reopening the modal every time the
  // prompt list re-renders — including after the user closes it.
  const openedSharedPromptRef = useRef<string | null>(null);
  const { totalTokensUsed, tokenLimit } = useUserTokenUsage();
  const { token , user} = useAuth?.() || ({} as any);
  const { addToCart } = useCart();
  const currentUserId = user?._id || user?.id || null;

  // Team members can't buy — they ask their org owner instead. Every purchase
  // and cart action on this page funnels through the two guards below, so a
  // button that slips past the render-time checks still can't start a payment.
  const teamMember = isTeamMember(user);
  const [requestPrompt, setRequestPrompt] = useState<Prompt | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showTopBg, setShowTopBg] = useState(true);
    const [kycOpen, setKycOpen] = useState(false);
const [pendingPurchasePrompt, setPendingPurchasePrompt] = useState<Prompt | null>(null);
const [retryPrompt, setRetryPrompt] = useState<Prompt | null>(null);
  // NEW: dropdown filters
  const [fileType, setFileType] = useState<FileType>("all");
  const [licenseType, setLicenseType] = useState<LicenseType>("all");
const [apiCategories, setApiCategories] = useState<{ name: string; previewImage?: string; previewVideo?: string }[]>([]);
  const [playingVideo, setPlayingVideo] = useState<string | number | null>(null);

  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // promptId -> does its seller have a Route payout account set up? Missing
  // key = not checked yet (Buy Now stays enabled while the check is in flight).
  const [sellerPayoutMap, setSellerPayoutMap] = useState<Record<string, boolean>>({});

  // IDs of prompts user already owns
  const [purchasedPrompts, setPurchasedPrompts] = useState<string[]>([]);

  const [enlargeModalOpen, setEnlargeModalOpen] = useState(false);
  const [enlargeMedia, setEnlargeMedia] = useState<{ url: string; type: "image" | "video"; title: string } | null>(null);

  const [showHistory, setShowHistory] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsPrompt, setDetailsPrompt] = useState<any>(null);
  const browseRef = useRef<HTMLDivElement>(null);
  const [sellOpen, setSellOpen] = useState(false);
  const [sellerFormOpen, setSellerFormOpen] = useState(false);
  // top-level state (near other state)
const [saveForPromptId, setSaveForPromptId] = useState<string | null>(null);
const [saveForPrompt, setSaveForPrompt] = useState<Prompt | null>(null);

  // Save modal (anchored to cop.png)
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [saveAnchorEl, setSaveAnchorEl] = useState<HTMLElement | null>(null);
   

const [latestPurchase, setLatestPurchase] = useState<any | null>(null);
const [categoriesModalOpen, setCategoriesModalOpen] = useState(false);
const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
const [draftCategories, setDraftCategories] = useState<string[]>([]);




// One distinct icon per category — a name → icon lookup, with a generic
// fallback for anything not in this list (e.g. a custom "Other" category).
const CATEGORY_ICONS: Record<string, React.ComponentType<any>> = {
  Business: Briefcase,
  Coding: Code2,
  Content: ImageIcon,
  Creative: Star,
  Data: Database,
  Design: Palette,
  Education: GraduationCap,
  Enterprise: Building2,
  Finance: BadgeDollarSign,
  HR: Users,
  Health: HeartPulse,
  Marketing: BarChart3,
  Productivity: Zap,
  Research: FlaskConical,
  Sales: Tag,
  "Social Media": Share2,
  Support: LifeBuoy,
  Travel: Plane,
  "UI/UX": SlidersHorizontal,
  Writing: FileText,
};
const DEFAULT_CATEGORY_ICON = Layers;

const categoriesData = [
  { id: "All", icon: Sparkles, previewImage: "", previewVideo: "" },
  ...apiCategories.map((cat) => ({
    id: cat.name,
    icon: CATEGORY_ICONS[cat.name] || DEFAULT_CATEGORY_ICON,
    previewImage: cat.previewImage || "",
    previewVideo: cat.previewVideo || "",
  })),
];
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






  useEffect(() => {
  const loadCategories = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/category`);
      const data = await res.json();

      if (res.ok && data?.success) {
        setApiCategories(data.categories.map((c: any) => ({
          name: c.name,
          previewImage: c.previewImage || "",
          previewVideo: c.previewVideo || "",
        })));
      }
    } catch (err) {
      console.error("Failed to load categories", err);
    }
  };

  loadCategories();
}, []);

// Check which of the currently-listed prompts' sellers have a Route payout
// account set up — drives the Buy Now disable + "Seller setup pending" state.
useEffect(() => {
  const idsToCheck = prompts
    // The feed already answers this for anything flagged
    // `sellerVerificationPending` — one request per prompt, to learn something
    // we were just told, is pure waste on a page showing dozens of cards.
    .filter((p) => !p.sellerVerificationPending)
    .map((p) => p.id)
    .filter((id) => id && !(id in sellerPayoutMap));

  if (idsToCheck.length === 0) return;

  let cancelled = false;

  (async () => {
    const results = await Promise.all(
      idsToCheck.map(async (id) => {
        try {
          const res = await fetch(`${PURCHASE_BASE}/seller-payout-status/${id}`);
          const data = await res.json().catch(() => ({}));
          return [id, Boolean(data?.hasPayoutSetup)] as const;
        } catch {
          // Network/server error — default to enabled rather than
          // incorrectly blocking a purchase over a transient failure.
          return [id, true] as const;
        }
      })
    );

    if (cancelled) return;
    setSellerPayoutMap((prev) => {
      const next = { ...prev };
      for (const [id, hasPayoutSetup] of results) next[id] = hasPayoutSetup;
      return next;
    });
  })();

  return () => {
    cancelled = true;
  };
}, [prompts, sellerPayoutMap]);

useEffect(() => {
  let ticking = false;

  const updateTopBgVisibility = () => {
    const bgEnd = document.getElementById("marketplace-bg-end");

    if (!bgEnd) {
      setShowTopBg(true);
      return;
    }

    const rect = bgEnd.getBoundingClientRect();

    // Background static rahega jab tak categories block top area tak visible hai.
    // Categories ke baad lower content clean dark background par rahega.
    setShowTopBg(rect.bottom > 96);
  };

  const onScrollOrResize = () => {
    if (ticking) return;

    ticking = true;
    window.requestAnimationFrame(() => {
      updateTopBgVisibility();
      ticking = false;
    });
  };

  updateTopBgVisibility();
  window.addEventListener("scroll", onScrollOrResize, { passive: true });
  window.addEventListener("resize", onScrollOrResize);

  return () => {
    window.removeEventListener("scroll", onScrollOrResize);
    window.removeEventListener("resize", onScrollOrResize);
  };
}, []);





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

const mapped: Prompt[] = (data.prompts || []).map((doc: any) => mapPromptDoc(doc));

        setPrompts(mapped);
      } catch (err: any) {
        console.error("Failed to load prompts", err);
        setLoadError(err?.message || "Failed to load prompts");
        toast({
          title: "Couldn’t load prompts",
          description: err?.message || "Please try again.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPrompts();
  }, [fileType, licenseType, selectedCategory, token]);

  /* ---------- Shared link: ?prompt=<id> opens that prompt's details ----------
     The prompt may not be in the list this page happened to load (category
     filter, "others" excludes your own uploads, pagination on the server), so
     the list is only a fast path — anything else is fetched by id. */
  useEffect(() => {
    const wantedId = new URLSearchParams(location.search).get("prompt");
    if (!wantedId || openedSharedPromptRef.current === wantedId) return;

    const fromList = prompts.find((p) => String(p.id) === String(wantedId));
    if (fromList) {
      openedSharedPromptRef.current = wantedId;
      setDetailsPrompt(fromList);
      setDetailsOpen(true);
      return;
    }

    // Still loading the list — give it a chance before hitting the API.
    if (loading) return;

    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/prompt/public/${encodeURIComponent(wantedId)}`);
        const data = await res.json().catch(() => ({}));
        if (cancelled) return;
        if (!res.ok || !data?.success || !data.prompt) {
          toast({
            title: "Prompt unavailable",
            description: "That link points to a prompt that's no longer listed.",
          });
          openedSharedPromptRef.current = wantedId; // don't retry in a loop
          return;
        }
        openedSharedPromptRef.current = wantedId;
        setDetailsPrompt(mapPromptDoc(data.prompt));
        setDetailsOpen(true);
      } catch (err) {
        if (!cancelled) console.error("Failed to open shared prompt", err);
      }
    })();

    return () => { cancelled = true; };
  }, [location.search, prompts, loading]);

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
 // Single gate for every "add to cart" on this page. Cart checkout is blocked
 // server-side for team members, so letting them fill a cart they can never pay
 // for just moves the dead end one screen later. Returns false when it blocked,
 // so callers skip their own "Added to Cart" confirmation.
 const guardedAddToCart = (id: string | number): boolean => {
   if (teamMember) {
     toast(TEAM_MEMBER_PURCHASE_TOAST);
     return false;
   }
   addToCart(String(id));
   return true;
 };

 const handlePurchase = async (prompt: Prompt) => {
  // Team members never pay. Sending them to the request modal here means every
  // Buy Now on the page lands somewhere useful, including any button whose
  // render-time check was missed.
  if (teamMember) {
    setRequestPrompt(prompt);
    return;
  }

  if (isOwnPrompt(prompt)) {
    toast({
      title: "Not allowed",
      description: "You cannot buy your own prompt.",
    });
    return;
  }

  if (!token) {
    toast({
      title: "Please log in",
      description: "You must be logged in to purchase.",
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
        // Prefer the server's written reason — the bare `error` code used to
        // reach the toast, so a blocked team member saw the literal string
        // "team_members_cannot_purchase".
        throw new Error(data?.message || data?.error || "order_create_failed");
      }
 
      const order = data.order;

      // Razorpay Checkout
      const options: any = {
        // The server tells us which key it created this order under. Preferring
        // it over the build-time constant means the two can never disagree —
        // when they did, Razorpay answered checkout with a 401.
        key: data.keyId || RAZORPAY_KEY_ID,
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

  setLatestPurchase(vb.purchase || null);

  try {
    window.dispatchEvent(
      new CustomEvent("tokun:purchased", { detail: vb.purchase })
    );
  } catch {}

  setBuyerName(vb?.user?.name || "there");
  setShowSuccessPopup(true);

  toast({
    title: "Payment Successful",
    description: "You now own this prompt.",
  });
} else {
              toast({ title: "Verification Failed", description: vb?.error || "Unknown error" });
            }
          } catch (err) {
            console.error("Verify error", err);
            toast({ title: "Verification Error", description: "Could not verify payment." });
          }
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on("payment.failed", function () {
        toast({ title: "Payment Failed", description: "Please try again." });
      });
      rzp.open();
    } catch (err: any) {
      console.error("Purchase flow error", err);
      toast({ title: "Purchase Error", description: err?.message || "Something went wrong." });
    }
  };

  if (showHistory) {
    return (
      <div className="min-h-screen bg-[#07080A] text-white">
        <div className="container mx-auto px-6 py-8">
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
      const res = await  fetch(`http://localhost:5002/api/kyc/status` ,{
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
    });
    return { ok: false };
  }
};

//   /* ============================================================
//      NEW LANDING-STYLE DESIGN (v2) — visual redesign only.
//      Old design kept fully commented below for rollback in case
//      this isn't approved. All state/handlers above are unchanged;
//      everything below is purely derived/presentational.
//      ============================================================ */
// 
//   const browseRef = useRef<HTMLDivElement>(null);
//   const [sellOpen, setSellOpen] = useState(false);
// 
//   const scrollToBrowse = () => browseRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
// 
//   // Trending: top-rated prompts overall (independent of active filters)
//   const trendingPrompts = [...prompts]
//     .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
//     .slice(0, 8);
// 
//   // Featured: exclusive/one-time prompts first, then highest rated
//   const featuredPrompts = [...prompts]
//     .sort((a, b) => Number(!!b.exclusive) - Number(!!a.exclusive) || (b.rating ?? 0) - (a.rating ?? 0))
//     .slice(0, 2);
// 
//   const creatorCount = new Set(prompts.map((p) => p.uploaderId || p.uploaderName).filter(Boolean)).size;
//   const topUploaderInitials = Array.from(new Set(prompts.map((p) => p.uploaderName).filter(Boolean)))
//     .slice(0, 4)
//     .map((n) => authorInitials(n as string));
// 
//   // "Specialized" category promo — points at a real category if one matches, else the first available
//   const promoCategoryMatch = categoryOptions.find((c) => /logo|brand|design/i.test(c.id));
//   const promoCategoryName = promoCategoryMatch?.id || categoryOptions[0]?.id || "Design";
//   const goToPromoCategory = () => {
//     if (promoCategoryMatch) {
//       setSelectedCategories([]);
//       setSelectedCategory(promoCategoryMatch.id);
//     }
//     scrollToBrowse();
//   };
//

  const renderOldStyleCard = (p: Prompt) => (
    <LibOldStyleCard
      key={p.id}
      prompt={p}
      mediaKind={decideMediaType(p)}
      isPurchased={purchasedPrompts.includes(String(p.id))}
      isOwn={isOwnPrompt(p)}
      isPlaying={playingVideo === p.id}
      hasPayoutSetup={sellerPayoutMap[p.id]}
      onVideoPlay={handleVideoPlay}
      onAddToCart={(id) => {
        if (!guardedAddToCart(id)) return;
        toast({ title: "Added to Cart", description: `"${p.title}" was added.` });
      }}
      onBuyNow={(prompt) => handlePurchase(prompt)}
      onOpenDetails={(prompt) => { setDetailsPrompt(prompt); setDetailsOpen(true); }}
      onNavigateToProfile={(id) => navigate(`/profile/${id}`)}
    />
  );

  return (
    <div className="marketplace dark text-foreground">
      {/* Background (landing-page style) */}
      <MarketplaceBackground />

      {/* Fixed compact Header (unchanged component) */}
      <div className="marketplace__header-slot">
        <Header />
      </div>

      {/* Main Content */}
      {/* OLD DESIGN — disabled (not deleted) via dead-code guard, per
          explicit request to replace with the Library-style design below */}
      {false && (
      <div className="marketplace__main">
        {/* Title + blurb */}
        <div className="marketplace__head">
          <h1 className="marketplace__title">Prompt Marketplace</h1>
          <p className="marketplace__subtitle">
            Discover, buy, and sell high-quality AI prompts crafted by creators worldwide.<br />
            Save hours of trial and error with prompts that actually work, right out of the box.
          </p>
        </div>

        {/* App navigation */}
        <div className="marketplace__nav">
          <AppNavigation activeSection="prompt-marketplace" />
        </div>

        {/* Search + filters */}
        <div className="marketplace__controls">
          <div className="marketplace__row">
            <div className="marketplace__search">
              <Search className="marketplace__search-icon" size={20} />
              <input
                placeholder="Search premium prompts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="marketplace__search-input"
              />
              <button
                onClick={() => {/* client-side filter only */}}
                className="marketplace__search-btn"
              >
                Search
              </button>
            </div>
          </div>

          {/* Format + License segmented tabs */}
          <div className="marketplace__filters">
            <SegmentedTabs
              label="Format"
              value={fileType}
              onChange={(v) => setFileType(v as FileType)}
              options={[
                { label: "All", value: "all" },
                { label: "Video", value: "video", icon: Video },
                { label: "Image", value: "image", icon: ImageIcon },
                { label: "Code", value: "code", icon: Code2 },
              ]}
            />
            <SegmentedTabs
              label="License"
              value={licenseType}
              onChange={(v) => setLicenseType(v as LicenseType)}
              options={[
                { label: "All", value: "all" },
                { label: "Free", value: "free" },
                { label: "Premium", value: "premium" },
                { label: "One-time", value: "one-time" },
              ]}
            />
          </div>

          {/* Categories scroller + Select Categories (built into component) */}
          <div id="marketplace-bg-end">
            {selectedCategories.length > 0 && (
              <div className="mp-selected-chips" style={{ justifyContent: "center", marginBottom: 10 }}>
                {selectedCategories.map((category) => (
                  <span key={category} className="mp-selected-chip">{category}</span>
                ))}
              </div>
            )}
            <CategoriesScroller
              categoriesData={categoriesData}
              selectedCategory={selectedCategory}
              setSelectedCategory={(category) => {
                setSelectedCategories([]);
                setSelectedCategory(category);
              }}
              onOpenModal={openCategoriesModal}
              selectedCategories={selectedCategories}
              onClearCategories={clearCategorySelection}
              allPrompts={prompts}
            />
          </div>
        </div>

        {/* Loading / error states */}
        {loading && <p className="marketplace__status">Loading prompts…</p>}
        {!!loadError && !loading && <p className="marketplace__status marketplace__status--error">{loadError}</p>}

        {/* Prompts Grid */}
        {!loading && !loadError && (
          <>
            <div className="mp-grid">
              {filteredPrompts.map((prompt) => {
                const mediaKind = decideMediaType(prompt); // "video" | "image"
                const isPurchased = purchasedPrompts.includes(String(prompt.id));

                /* ── Reel card for video prompts ── */
                if (mediaKind === "video") {
                  return (
                    <VideoReelCard
                      key={prompt.id}
                      prompt={prompt}
                      isPurchased={isPurchased}
                      isOwn={isOwnPrompt(prompt)}
                      isPlaying={playingVideo === prompt.id}
                      hasPayoutSetup={sellerPayoutMap[prompt.id]}
                      onVideoPlay={handleVideoPlay}
                      onAddToCart={(id) => {
                        if (!guardedAddToCart(id)) return;
                        toast({ title: "Added to Cart", description: `"${prompt.title}" was added.` });
                      }}
                      onBuyNow={(p) => handlePurchase(p as Prompt)}
                      onOpenDetails={(p) => { setDetailsPrompt(p); setDetailsOpen(true); }}
                      onNavigateToProfile={(id) => navigate(`/profile/${id}`)}
                    />
                  );
                }

                return (
                  <div
                    key={prompt.id}
                    className="mp-card"
                    onClick={() => {
                      setDetailsPrompt(prompt);
                      setDetailsOpen(true);
                    }}
                  >
                    {/* MEDIA */}
                    <div className="mp-card__media">
                      <div className="mp-card__preview group">
                        {mediaKind === "image" ? (
                          <img src={prompt.imageUrl} alt={prompt.title} className="mp-card__img" />
                        ) : (
                          <>
                            <video
                              className="mp-card__video"
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
                              className="mp-card__play"
                              aria-label={playingVideo === prompt.id ? "Pause" : "Play"}
                            >
                              <span className="mp-card__play-circle">
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
                            <div className="mp-card__duration">0:20</div>
                          </>
                        )}
                      </div>

                      {/* Badges (category + unlock/purchased) */}
                      <div className="mp-card__badges">
                        <span className="mp-card__cat">{prompt.category?.toUpperCase()}</span>
                        {!isPurchased ? (
                          <span
                            className="mp-card__unlock"
                            style={{
                              background: prompt.exclusive ? "#2A2A2A" : undefined,
                              color: prompt.exclusive ? "#4ADE80" : undefined,
                            }}
                          >
                            {prompt.exclusive ? "ONE-TIME PURCHASE" : "PURCHASE TO UNLOCK"}
                          </span>
                        ) : (
                          <span className="mp-card__unlock" style={{ background: "#14532D", color: "#BBF7D0" }}>
                            PURCHASED
                          </span>
                        )}
                      </div>

                      {/* Premium icon */}
                      {!prompt.isFree && prompt.price && prompt.price > 0 ? (
                        <div className="mp-card__crown">
                          <img
                            src="/icons/premium.png"
                            alt="Premium"
                            className={prompt.exclusive ? "filter-green" : ""}
                          />
                        </div>
                      ) : null}
                    </div>

                    {/* BODY */}
                    <div className="mp-card__body">
                      {/* Uploader row */}
                      <div className="mp-card__meta">
                        <span className="mp-card__avatar">{authorInitials(prompt.uploaderName)}</span>
                        <span
                          className="mp-card__author-name"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/profile/${prompt.uploaderId}`);
                          }}
                        >
                          {prompt.uploaderName || "Unknown"}
                        </span>
                      </div>

                      {/* TEXT */}
                      <h3 className="mp-card__title">{prompt.title}</h3>
                      <p className="mp-card__desc">{prompt.description}</p>

                      {/* FOOTER */}
                      <div className="mp-card__footer">
                        {prompt.isFree ? (
                          <div className="mp-card__pill mp-card__pill--free">FREE</div>
                        ) : (
                          <>
                            <div className="mp-card__pill mp-card__pill--muted">
                              ₹{buyerPrice(prompt).toFixed(2)}
                            </div>

                            {/* No cart for team members — checkout is blocked server-side. */}
                            {!isOwnPrompt(prompt) && !teamMember && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (!guardedAddToCart(prompt.id)) return;
                                  toast({
                                    title: "Added to Cart",
                                    description: `"${prompt.title}" was added.`,
                                  });
                                }}
                                className="mp-card__pill mp-card__pill--cart"
                              >
                                <ShoppingCart className="h-4 w-4" />
                                Cart
                              </button>
                            )}

                            {/* Buy Now hidden if one-time and already sold */}
                            {!isOwnPrompt(prompt) && !isPurchased && (
                              isPurchased ? (
                                <div className="mp-card__pill mp-card__pill--owned">Purchased</div>
                              ) : !(prompt.exclusive && prompt.sold) ? (
                                teamMember ? (
                                  // handlePurchase routes team members to the
                                  // request modal instead of a payment.
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handlePurchase(prompt);
                                    }}
                                    className="mp-card__pill mp-card__pill--buy"
                                  >
                                    Request
                                  </button>
                                ) : sellerPayoutMap[prompt.id] === false ? (
                                  <button
                                    type="button"
                                    disabled
                                    title="This seller hasn't set up their payout account yet."
                                    className="mp-card__pill mp-card__pill--buy opacity-50 cursor-not-allowed"
                                  >
                                    Seller setup pending
                                  </button>
                                ) : (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handlePurchase(prompt);
                                    }}
                                    className="mp-card__pill mp-card__pill--buy"
                                  >
                                    Buy Now
                                  </button>
                                )
                              ) : null
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Empty state */}
            {filteredPrompts.length === 0 && (
              <div className="marketplace__empty">
                <p className="marketplace__empty-title">
                  {`Showing 0 premium prompts in ${selectedCategory || "All"}`}
                </p>
                <p className="marketplace__empty-sub">No prompts found matching your criteria.</p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("All");
                    setFileType("all");
                    setLicenseType("all");
                  }}
                  className="marketplace__clear-filters"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </>
        )}
      </div>
      )}

      {/* ================= NEW Library-style design (live) ================= */}
      <div className="marketplace__main">
        <LibHeroBanner
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onBrowse={() => browseRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
        />

        <div className="space-y-16 mt-16">
          <div ref={browseRef} className="marketplace__filters" style={{ justifyContent: "center", display: "flex", flexWrap: "wrap", gap: 16 }}>
            <SegmentedTabs
              label="Format"
              value={fileType}
              onChange={(v) => setFileType(v as FileType)}
              options={[
                { label: "All", value: "all" },
                { label: "Video", value: "video", icon: Video },
                { label: "Image", value: "image", icon: ImageIcon },
                { label: "Code", value: "code", icon: Code2 },
              ]}
            />
            <SegmentedTabs
              label="License"
              value={licenseType}
              onChange={(v) => setLicenseType(v as LicenseType)}
              options={[
                { label: "All", value: "all" },
                { label: "Free", value: "free" },
                { label: "Premium", value: "premium" },
                { label: "One-time", value: "one-time" },
              ]}
            />
          </div>

          <LibCategoriesRow
            categories={categoriesData.map((c) => c.id).filter((id) => id !== "All")}
            selected={selectedCategory}
            onSelect={(category) => {
              setSelectedCategories([]);
              setSelectedCategory(category);
            }}
          />

          <LibCreateAppBanner />

          {loading && <p className="text-white/60 text-sm">Loading prompts…</p>}
          {!!loadError && !loading && <p className="text-red-400 text-sm">{loadError}</p>}

          {!loading && !loadError && (
            <>
              <LibPromptRow
                eyebrowIcon={<Sparkles className="h-4 w-4" />}
                eyebrow="JUST ADDED"
                title="Newest Prompts"
                items={filteredPrompts}
                renderCard={renderOldStyleCard}
              />

              <LibPromptRow
                eyebrowIcon={<TrendingUp className="h-4 w-4" />}
                eyebrow="TRENDING THIS MONTH"
                title="Most Popular Prompts This Month"
                items={[...filteredPrompts].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))}
                renderCard={renderOldStyleCard}
              />

              {/* Was "T-Shirt Design Prompts" over the unfiltered list — the
                  row promised apparel prompts and showed whatever the page had
                  loaded. Cheapest-first is a real ordering of the same list, so
                  the heading now describes what's actually under it. */}
              <LibPromptRow
                eyebrowIcon={<Tag className="h-4 w-4" />}
                eyebrow="EASY ON THE WALLET"
                title="Budget-Friendly Prompts"
                items={[...filteredPrompts].sort(
                  (a, b) =>
                    (a.isFree ? 0 : buyerPrice(a)) - (b.isFree ? 0 : buyerPrice(b)),
                )}
                renderCard={renderOldStyleCard}
              />

              <LibFeaturedSection
                prompts={filteredPrompts.slice(0, 4)}
                onOpenDetails={(p) => { setDetailsPrompt(p); setDetailsOpen(true); }}
                onAddToCart={(id) => {
                  if (!guardedAddToCart(id)) return;
                  toast({ title: "Added to Cart", description: "Prompt was added." });
                }}
                onBuyNow={(p) => handlePurchase(p)}
                onNavigateToProfile={(id) => navigate(`/profile/${id}`)}
                isOwn={isOwnPrompt}
                isPurchased={(p) => purchasedPrompts.includes(String(p.id))}
              />
            </>
          )}

          <LibBrandIdentitySpotlight onExplore={() => navigate("/brand-prompts")} />

          <LibSellHireSection
            onSell={() => {
              // Team members sell through their org, so the payout onboarding
              // form is never the right next step for them.
              if (teamMember) {
                toast(TEAM_MEMBER_SELL_TOAST);
                return;
              }
              setSellerFormOpen(true);
            }}
            onHire={() => navigate("/find-creators")}
          />
        </div>
      </div>

      <div className="relative z-10 mt-20">
        <Footer />
      </div>

      {/* ===================================================================
          NEECHE ke saare modals / popups LOGIC — unchanged (jaise the waise)
          =================================================================== */}

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
          handlePurchase({ ...p, id: String(p.id) });
        }}
        // showImages removed; DetailsPrompt can infer using prompt.videoUrl / prompt.imageUrl
        onEnlargeMedia={(m) => {
          setEnlargeMedia({ url: m.url, type: m.type, title: m.title });
          setEnlargeModalOpen(true);
        }}
      />

      {/* Team member asking their org owner to buy this. Opened by every Buy
          Now / Request button on the page via handlePurchase. */}
      {requestPrompt && (
        <RequestToBuyModal
          open={Boolean(requestPrompt)}
          onOpenChange={(open) => { if (!open) setRequestPrompt(null); }}
          promptId={String(requestPrompt.id)}
          promptTitle={requestPrompt.title || ""}
          price={requestPrompt.price || 0}
          thumbnail={requestPrompt.imageUrl || ""}
          userType="TM"
          role="TM"
        />
      )}

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

                  try {
                    if (latestPurchase) {
                      window.dispatchEvent(
                        new CustomEvent("tokun:purchased", { detail: latestPurchase })
                      );
                    }
                  } catch {}

                  navigate("/self-dash?tab=prompts&p=purchased", {
                    state: { refreshPurchases: true },
                  });
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

      <SellPromptModal
        open={sellOpen}
        onOpenChange={setSellOpen}
        onPromptSubmitted={() => {}}
      />

      {token && (
        <SellerLinkedAccountForm
          open={sellerFormOpen}
          onClose={() => setSellerFormOpen(false)}
          token={token}
          apiBase={API_BASE}
          onSubmitted={() => {
            setSellerFormOpen(false);
            setSellOpen(true);
          }}
        />
      )}

    </div>
  );

//   return (
//     <div className="marketplace mp2 dark text-foreground">
//       {/* Background (landing-page style) */}
//       <MarketplaceBackground />
// 
//       {/* Fixed compact Header (unchanged component) */}
//       <div className="marketplace__header-slot">
//         <Header />
//       </div>
// 
//       {/* Main Content */}
//       <div className="marketplace__main">
// 
//         {/* ================= HERO ================= */}
//         <div className="mp2-hero">
//           <h1 className="mp2-hero__title">
//             Prompt <span className="mp2-hero__title-accent">Marketplace</span>
//           </h1>
//           <p className="mp2-hero__subtitle">
//             Access {prompts.length > 0 ? `${prompts.length}+` : ""} high-quality AI prompts for art, logic, architecture, and business optimization.
//           </p>
//           <div className="mp2-hero__search">
//             <Search className="mp2-hero__search-icon" size={18} />
//             <input
//               placeholder="Search prompts for 'Hyper-realistic architecture'..."
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//               className="mp2-hero__search-input"
//             />
//             <button type="button" onClick={scrollToBrowse} className="mp2-hero__search-btn">
//               Search
//             </button>
//           </div>
//         </div>
// 
//         {/* ================= HERO BANNER ================= */}
//         <div className="mp2-banner">
//           <img src="/icons/homeban.png" alt="" aria-hidden="true" className="mp2-banner__glow" />
//           <div className="mp2-banner__content">
//             <span className="mp2-banner__tag">
//               <BarChart3 className="h-3.5 w-3.5" /> GLOBAL LEADERBOARD
//             </span>
//             <h2 className="mp2-banner__title">
//               Most Popular<br />
//               <span className="mp2-banner__title-accent">AI Prompts</span>
//             </h2>
//             <p className="mp2-banner__desc">
//               Discover the prompts defining the creative industry this week. High-conversion, high-fidelity, and battle-tested.
//             </p>
//             <button type="button" className="mp2-banner__cta" onClick={scrollToBrowse}>
//               Browse Collection <ChevronRight className="h-4 w-4" />
//             </button>
//             {creatorCount > 0 && (
//               <div className="mp2-banner__stat">
//                 <div className="mp2-banner__avatars">
//                   {topUploaderInitials.map((n, i) => (
//                     <span key={i} className="mp2-banner__avatar">{n}</span>
//                   ))}
//                 </div>
//                 <span>Used by {creatorCount}+ creators today</span>
//               </div>
//             )}
//           </div>
//         </div>
// 
//         {/* ================= TRENDING PROMPTS ================= */}
//         {trendingPrompts.length > 0 && (
//           <section className="mp2-section">
//             <div className="mp2-section__head">
//               <span className="mp2-section__eyebrow">ON THE RISE</span>
//               <h3 className="mp2-section__title">Trending Prompts</h3>
//             </div>
//             <div className="mp2-trend-row">
//               {trendingPrompts.map((prompt) => (
//                 <div
//                   key={prompt.id}
//                   className="mp2-trend-card"
//                   onClick={() => { setDetailsPrompt(prompt); setDetailsOpen(true); }}
//                 >
//                   <div className="mp2-trend-card__media">
//                     {prompt.imageUrl ? (
//                       <img src={prompt.imageUrl} alt={prompt.title} />
//                     ) : prompt.videoUrl ? (
//                       <video src={prompt.videoUrl} muted loop playsInline />
//                     ) : (
//                       <div className="mp2-trend-card__placeholder" />
//                     )}
//                   </div>
//                   <div className="mp2-trend-card__body">
//                     <p className="mp2-trend-card__title">{prompt.title}</p>
//                     <div className="mp2-trend-card__row">
//                       <span className="mp2-trend-card__price">
//                         {prompt.isFree ? "Free" : `₹${(prompt.price ?? 0).toFixed(2)}`}
//                       </span>
//                       <button
//                         type="button"
//                         className="mp2-trend-card__btn"
//                         onClick={(e) => { e.stopPropagation(); setDetailsPrompt(prompt); setDetailsOpen(true); }}
//                       >
//                         Get Prompt
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </section>
//         )}
// 
//         {/* ================= FEATURED PROMPTS ================= */}
//         {featuredPrompts.length > 0 && (
//           <section className="mp2-section">
//             <div className="mp2-section__head">
//               <span className="mp2-section__eyebrow">VERIFIED EXCELLENCE</span>
//               <h3 className="mp2-section__title">Featured Prompts</h3>
//               <p className="mp2-section__sub">Curated selection of professional-grade prompts hand-picked from top creators.</p>
//             </div>
//             <div className="mp2-feat-grid">
//               {featuredPrompts.map((prompt, i) => (
//                 <div
//                   key={prompt.id}
//                   className="mp2-feat-card"
//                   onClick={() => { setDetailsPrompt(prompt); setDetailsOpen(true); }}
//                 >
//                   <div className="mp2-feat-card__media">
//                     {prompt.imageUrl ? (
//                       <img src={prompt.imageUrl} alt={prompt.title} />
//                     ) : prompt.videoUrl ? (
//                       <video src={prompt.videoUrl} muted loop playsInline />
//                     ) : null}
//                     <span className="mp2-feat-card__badge">{i === 0 ? "STAFF PICK" : "PREMIUM"}</span>
//                   </div>
//                   <div className="mp2-feat-card__body">
//                     <span className="mp2-feat-card__tags">{prompt.category}</span>
//                     <h4 className="mp2-feat-card__title">{prompt.title}</h4>
//                     <p className="mp2-feat-card__desc">{prompt.description}</p>
//                     <div className="mp2-feat-card__row">
//                       <span className="mp2-feat-card__price">
//                         {prompt.isFree ? "Free" : `₹${(prompt.price ?? 0).toFixed(2)}`}
//                       </span>
//                       <button
//                         type="button"
//                         className="mp2-feat-card__btn"
//                         onClick={(e) => { e.stopPropagation(); setDetailsPrompt(prompt); setDetailsOpen(true); }}
//                       >
//                         Quick View
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </section>
//         )}
// 
//         {/* ================= BRAND / CATEGORY PROMO ================= */}
//         <div className="mp2-promo">
//           <div className="mp2-promo__body">
//             <span className="mp2-promo__tag">SPECIALIZED PROMPTS</span>
//             <h3 className="mp2-promo__title">
//               {promoCategoryName} Prompts<br />
//               <span className="mp2-promo__title-accent">Engineered for Pro Creators</span>
//             </h3>
//             <p className="mp2-promo__desc">
//               Elevate your workflow with prompts curated for {promoCategoryName.toLowerCase()} work — consistent quality, tested output, ready to use.
//             </p>
//             <ul className="mp2-promo__list">
//               <li><Check className="h-4 w-4" /> Hand-picked, high-conversion prompts</li>
//               <li><Check className="h-4 w-4" /> Consistent, production-ready output</li>
//               <li><Check className="h-4 w-4" /> Curated by top-rated creators</li>
//             </ul>
//             <button type="button" className="mp2-promo__btn" onClick={goToPromoCategory}>
//               Explore {promoCategoryName} Prompts
//             </button>
//           </div>
//           <div className="mp2-promo__art">
//             <img src="/icons/gem1.png" alt="" className="mp2-promo__tile mp2-promo__tile--logo" />
//             <div className="mp2-promo__tile mp2-promo__tile--retro">
//               <span>Retro Brand Kit</span>
//             </div>
//           </div>
//         </div>
// 
//         {/* ================= SELL / HIRE ================= */}
//         <div className="mp2-cta-row">
//           <div className="mp2-cta-card">
//             <h4>Sell your prompts</h4>
//             <p>Upload your prompts, connect your payout method, and join a global community of creators. Get started in minutes.</p>
//             <button type="button" className="mp2-cta-card__btn mp2-cta-card__btn--purple" onClick={() => setSellOpen(true)}>
//               Start Selling
//             </button>
//           </div>
//           <div className="mp2-cta-card">
//             <h4>Hire an AI Expert</h4>
//             <p>Commission custom prompt solutions and fine-tuned workflows from top-rated creators for your specific needs.</p>
//             <button type="button" className="mp2-cta-card__btn mp2-cta-card__btn--blue" onClick={scrollToBrowse}>
//               Find a Creator
//             </button>
//           </div>
//         </div>
// 
//         {/* ================= BROWSE ALL PROMPTS (existing filters/grid — unchanged logic) ================= */}
//         <div ref={browseRef} className="mp2-browse">
//           <div className="mp2-section__head">
//             <span className="mp2-section__eyebrow">FULL CATALOG</span>
//             <h3 className="mp2-section__title">Browse All Prompts</h3>
//           </div>
// 
//           {/* App navigation */}
//           <div className="marketplace__nav">
//             <AppNavigation activeSection="prompt-marketplace" />
//           </div>
// 
//           <div className="marketplace__controls">
//             {/* Format + License segmented tabs */}
//             <div className="marketplace__filters">
//               <SegmentedTabs
//                 label="Format"
//                 value={fileType}
//                 onChange={(v) => setFileType(v as FileType)}
//                 options={[
//                   { label: "All", value: "all" },
//                   { label: "Video", value: "video", icon: Video },
//                   { label: "Image", value: "image", icon: ImageIcon },
//                   { label: "Code", value: "code", icon: Code2 },
//                 ]}
//               />
//               <SegmentedTabs
//                 label="License"
//                 value={licenseType}
//                 onChange={(v) => setLicenseType(v as LicenseType)}
//                 options={[
//                   { label: "All", value: "all" },
//                   { label: "Free", value: "free" },
//                   { label: "Premium", value: "premium" },
//                   { label: "One-time", value: "one-time" },
//                 ]}
//               />
//             </div>
// 
//             {/* Categories scroller + Select Categories (built into component) */}
//             <div id="marketplace-bg-end">
//               {selectedCategories.length > 0 && (
//                 <div className="mp-selected-chips" style={{ justifyContent: "center", marginBottom: 10 }}>
//                   {selectedCategories.map((category) => (
//                     <span key={category} className="mp-selected-chip">{category}</span>
//                   ))}
//                 </div>
//               )}
//               <CategoriesScroller
//                 categoriesData={categoriesData}
//                 selectedCategory={selectedCategory}
//                 setSelectedCategory={(category) => {
//                   setSelectedCategories([]);
//                   setSelectedCategory(category);
//                 }}
//                 onOpenModal={openCategoriesModal}
//                 selectedCategories={selectedCategories}
//                 onClearCategories={clearCategorySelection}
//                 allPrompts={prompts}
//               />
//             </div>
//           </div>
// 
//           {/* Loading / error states */}
//           {loading && <p className="marketplace__status">Loading prompts…</p>}
//           {!!loadError && !loading && <p className="marketplace__status marketplace__status--error">{loadError}</p>}
// 
//           {/* Prompts Grid */}
//           {!loading && !loadError && (
//             <>
//               <div className="mp-grid">
//                 {filteredPrompts.map((prompt) => {
//                   const mediaKind = decideMediaType(prompt); // "video" | "image"
//                   const isPurchased = purchasedPrompts.includes(String(prompt.id));
// 
//                   /* ── Reel card for video prompts ── */
//                   if (mediaKind === "video") {
//                     return (
//                       <VideoReelCard
//                         key={prompt.id}
//                         prompt={prompt}
//                         isPurchased={isPurchased}
//                         isOwn={isOwnPrompt(prompt)}
//                         isPlaying={playingVideo === prompt.id}
//                         onVideoPlay={handleVideoPlay}
//                         onAddToCart={(id) => {
//                           addToCart(String(id));
//                           toast({ title: "Added to Cart", description: `"${prompt.title}" was added.` });
//                         }}
//                         onBuyNow={(p) => handlePurchase(p as Prompt)}
//                         onOpenDetails={(p) => { setDetailsPrompt(p); setDetailsOpen(true); }}
//                         onNavigateToProfile={(id) => navigate(`/profile/${id}`)}
//                       />
//                     );
//                   }
// 
//                   return (
//                     <div
//                       key={prompt.id}
//                       className="mp-card"
//                       onClick={() => {
//                         setDetailsPrompt(prompt);
//                         setDetailsOpen(true);
//                       }}
//                     >
//                       {/* MEDIA */}
//                       <div className="mp-card__media">
//                         <div className="mp-card__preview group">
//                           {mediaKind === "image" ? (
//                             <img src={prompt.imageUrl} alt={prompt.title} className="mp-card__img" />
//                           ) : (
//                             <>
//                               <video
//                                 className="mp-card__video"
//                                 src={prompt.videoUrl}
//                                 loop
//                                 muted
//                                 playsInline
//                                 ref={(el) => {
//                                   if (!el) return;
//                                   if (playingVideo === prompt.id) el.play().catch(() => {});
//                                   else el.pause();
//                                 }}
//                               />
//                               <button
//                                 type="button"
//                                 onClick={(e) => {
//                                   e.stopPropagation();
//                                   handleVideoPlay(prompt.id);
//                                 }}
//                                 className="mp-card__play"
//                                 aria-label={playingVideo === prompt.id ? "Pause" : "Play"}
//                               >
//                                 <span className="mp-card__play-circle">
//                                   {playingVideo === prompt.id ? (
//                                     <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
//                                       <rect x="6" y="5" width="4" height="14" rx="1" />
//                                       <rect x="14" y="5" width="4" height="14" rx="1" />
//                                     </svg>
//                                   ) : (
//                                     <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
//                                       <path d="M8 5v14l11-7-11-7z" />
//                                     </svg>
//                                   )}
//                                 </span>
//                               </button>
//                               <div className="mp-card__duration">0:20</div>
//                             </>
//                           )}
//                         </div>
// 
//                         {/* Badges (category + unlock/purchased) */}
//                         <div className="mp-card__badges">
//                           <span className="mp-card__cat">{prompt.category?.toUpperCase()}</span>
//                           {!isPurchased ? (
//                             <span
//                               className="mp-card__unlock"
//                               style={{
//                                 background: prompt.exclusive ? "#2A2A2A" : undefined,
//                                 color: prompt.exclusive ? "#4ADE80" : undefined,
//                               }}
//                             >
//                               {prompt.exclusive ? "ONE-TIME PURCHASE" : "PURCHASE TO UNLOCK"}
//                             </span>
//                           ) : (
//                             <span className="mp-card__unlock" style={{ background: "#14532D", color: "#BBF7D0" }}>
//                               PURCHASED
//                             </span>
//                           )}
//                         </div>
// 
//                         {/* Premium icon */}
//                         {!prompt.isFree && prompt.price && prompt.price > 0 ? (
//                           <div className="mp-card__crown">
//                             <img
//                               src="/icons/premium.png"
//                               alt="Premium"
//                               className={prompt.exclusive ? "filter-green" : ""}
//                             />
//                           </div>
//                         ) : null}
//                       </div>
// 
//                       {/* BODY */}
//                       <div className="mp-card__body">
//                         {/* Uploader row */}
//                         <div className="mp-card__meta">
//                           <span className="mp-card__avatar">{authorInitials(prompt.uploaderName)}</span>
//                           <span
//                             className="mp-card__author-name"
//                             onClick={(e) => {
//                               e.stopPropagation();
//                               navigate(`/profile/${prompt.uploaderId}`);
//                             }}
//                           >
//                             {prompt.uploaderName || "Unknown"}
//                           </span>
//                           <div className="mp-card__rating">
//                             <Star className="w-4 h-4 mp-card__star" />
//                             <span>{prompt.rating?.toFixed(1) || "0.0"}</span>
//                           </div>
//                         </div>
// 
//                         {/* TEXT */}
//                         <h3 className="mp-card__title">{prompt.title}</h3>
//                         <p className="mp-card__desc">{prompt.description}</p>
// 
//                         {/* FOOTER */}
//                         <div className="mp-card__footer">
//                           {prompt.isFree ? (
//                             <div className="mp-card__pill mp-card__pill--free">FREE</div>
//                           ) : (
//                             <>
//                               <div className="mp-card__pill mp-card__pill--muted">
//                                 ₹{(prompt.price ?? 0).toFixed(2)}
//                               </div>
// 
//                               {!isOwnPrompt(prompt) && (
//                                 <button
//                                   type="button"
//                                   onClick={(e) => {
//                                     e.stopPropagation();
//                                     addToCart(prompt.id);
//                                     toast({
//                                       title: "Added to Cart",
//                                       description: `"${prompt.title}" was added.`,
//                                     });
//                                   }}
//                                   className="mp-card__pill mp-card__pill--cart"
//                                 >
//                                   <ShoppingCart className="h-4 w-4" />
//                                   Cart
//                                 </button>
//                               )}
// 
//                               {/* Buy Now hidden if one-time and already sold */}
//                               {!isOwnPrompt(prompt) && !isPurchased && (
//                                 isPurchased ? (
//                                   <div className="mp-card__pill mp-card__pill--owned">Purchased</div>
//                                 ) : !(prompt.exclusive && prompt.sold) ? (
//                                   <button
//                                     onClick={(e) => {
//                                       e.stopPropagation();
//                                       handlePurchase(prompt);
//                                     }}
//                                     className="mp-card__pill mp-card__pill--buy"
//                                   >
//                                     Buy Now
//                                   </button>
//                                 ) : null
//                               )}
//                             </>
//                           )}
//                         </div>
//                       </div>
//                     </div>
//                   );
//                 })}
//               </div>
// 
//               {/* Empty state */}
//               {filteredPrompts.length === 0 && (
//                 <div className="marketplace__empty">
//                   <p className="marketplace__empty-title">
//                     {`Showing 0 premium prompts in ${selectedCategory || "All"}`}
//                   </p>
//                   <p className="marketplace__empty-sub">No prompts found matching your criteria.</p>
//                   <button
//                     type="button"
//                     onClick={() => {
//                       setSearchQuery("");
//                       setSelectedCategory("All");
//                       setFileType("all");
//                       setLicenseType("all");
//                     }}
//                     className="marketplace__clear-filters"
//                   >
//                     Clear Filters
//                   </button>
//                 </div>
//               )}
//             </>
//           )}
//         </div>
//       </div>
// 
//       <div className="relative z-10 mt-20">
//         <Footer />
//       </div>
// 
//       {/* ===================================================================
//           NEECHE ke saare modals / popups LOGIC — unchanged (jaise the waise)
//           =================================================================== */}
// 
//       <ModalComponent
//         isOpen={saveModalOpen}
//         onClose={() => setSaveModalOpen(false)}
//         onSave={async (payload) => {
//           if (!saveForPromptId) { /* toast ... */ return; }
// 
//           if (payload?.quick) {
//             await savePromptToCollections({ refId: saveForPromptId, name: saveForPrompt?.title });
//             toast({ title: "Saved", description: "Prompt saved to All Saved." });
//           } else if (payload?.title) {
//             await savePromptToCollections({
//               refId: saveForPromptId,
//               collectionTitle: payload.title,
//               name: saveForPrompt?.title, // 👈 label = original title
//             });
//             toast({ title: "Collection created", description: `Saved to "${payload.title}".` });
//           } else {
//             await savePromptToCollections({ refId: saveForPromptId, name: saveForPrompt?.title });
//             toast({ title: "Saved", description: "Prompt saved to All Saved." });
//           }
//           setSaveForPromptId(null);
//           setSaveForPrompt(null);
//         }}
//         anchorRef={{ current: saveAnchorEl } as unknown as React.RefObject<HTMLElement>}
//       />
// 
//       <MediaEnlargeModal
//         isOpen={enlargeModalOpen}
//         onClose={() => setEnlargeModalOpen(false)}
//         mediaUrl={enlargeMedia?.url || ""}
//         mediaType={enlargeMedia?.type || "image"}
//         title={enlargeMedia?.title || ""}
//       />
// 
//       <DetailsPrompt
//         open={detailsOpen}
//         onOpenChange={setDetailsOpen}
//         prompt={detailsPrompt}
//         owned={detailsPrompt ? purchasedPrompts.includes(String(detailsPrompt.id)) : false}
//         onPurchase={(p) => {
//           setDetailsOpen(false);
//           handlePurchase(p);
//         }}
//         onEnlargeMedia={(m) => {
//           setEnlargeMedia({ url: m.url, type: m.type, title: m.title });
//           setEnlargeModalOpen(true);
//         }}
//       />
// 
//       {/* ✅ Purchase Success Popup */}
//       {showSuccessPopup && (
//         <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70 backdrop-blur-sm">
//           <div
//             className="bg-[#1C1C1C] text-white rounded-2xl shadow-2xl px-8 py-10 w-[420px] text-center animate-fadeIn relative"
//             style={{ border: "1px solid rgba(255,255,255,0.1)" }}
//           >
//             {/* Close button */}
//             <button
//               onClick={() => setShowSuccessPopup(false)}
//               className="absolute top-4 right-4 text-white/60 hover:text-white"
//               aria-label="Close"
//             >
//               ✕
//             </button>
// 
//             {/* ✅ Success icon */}
//             <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-emerald-600 flex items-center justify-center">
//               <svg
//                 xmlns="http://www.w3.org/2000/svg"
//                 className="h-10 w-10 text-white"
//                 fill="none"
//                 viewBox="0 0 24 24"
//                 stroke="currentColor"
//                 strokeWidth={2}
//               >
//                 <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
//               </svg>
//             </div>
// 
//             <h2 className="text-xl font-semibold mb-2">🎉 Thank you, {buyerName}!</h2>
//             <p className="text-white/80 mb-8">
//               You’ve successfully purchased this prompt!
//             </p>
// 
//             <div className="flex items-center justify-center gap-4">
//               {/* ✅ Go to Purchases */}
//               <button
//                 onClick={() => {
//                   setShowSuccessPopup(false);
// 
//                   try {
//                     if (latestPurchase) {
//                       window.dispatchEvent(
//                         new CustomEvent("tokun:purchased", { detail: latestPurchase })
//                       );
//                     }
//                   } catch {}
// 
//                   navigate("/purchases?p=purchased", {
//                     state: { refreshPurchases: true },
//                   });
//                 }}
//                 className="w-40 h-11 rounded-lg text-sm font-medium bg-white/10 hover:bg-white/20 transition"
//               >
//                 Go to My Purchases
//               </button>
// 
//               {/* ✅ Back to Marketplace */}
//               <button
//                 onClick={() => {
//                   setShowSuccessPopup(false);
//                   navigate("/prompt-marketplace");  // 👈 goes to marketplace
//                 }}
//                 className="w-40 h-11 rounded-lg text-sm font-medium text-white"
//                 style={{
//                   background: "linear-gradient(90deg, #FF14EF 0%, #1A73E8 100%)",
//                 }}
//               >
//                 Prompt Marketplace
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
// 
//       {token && (
//         <KycGateModal
//           open={kycOpen}
//           onClose={() => setKycOpen(false)}
//           token={token}
//           apiBase={API_BASE}
//           defaultCountry="IN"
//           requiredForLabel="buying and uploading prompts"
//           onVerified={() => {
//             if (pendingPurchasePrompt) {
//               const p = pendingPurchasePrompt;
//               setPendingPurchasePrompt(null);
//               handlePurchase(p);
//             }
//           }}
//         />
//       )}
// 
//       {categoriesModalOpen && (
//         <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
//           <div
//             className="w-full max-w-[620px] rounded-[28px] border border-white/10 bg-[#17171A] p-5 sm:p-6 text-white"
//             onClick={(e) => e.stopPropagation()}
//           >
//             <div className="flex items-start justify-between gap-4">
//               <div>
//                 <h3 className="text-xl font-semibold">Select Categories</h3>
//                 <p className="mt-1 text-sm text-white/60">
//                   Ek hi baar me multiple categories choose kar sakte ho.
//                 </p>
//               </div>
// 
//               <button
//                 type="button"
//                 onClick={() => setCategoriesModalOpen(false)}
//                 className="w-10 h-10 rounded-full grid place-items-center bg-white/5 hover:bg-white/10"
//                 aria-label="Close categories modal"
//               >
//                 <X className="h-5 w-5" />
//               </button>
//             </div>
// 
//             <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[320px] overflow-y-auto pr-1">
//               {categoryOptions.map(({ id, icon: Icon }) => {
//                 const active = draftCategories.includes(id);
// 
//                 return (
//                   <button
//                     key={id}
//                     type="button"
//                     onClick={() => toggleDraftCategory(id)}
//                     className={`w-full flex items-center justify-between rounded-2xl px-4 py-3 border transition-colors ${
//                       active
//                         ? "bg-white/10 border-white/20"
//                         : "bg-[#121213] border-white/5 hover:bg-white/5"
//                     }`}
//                   >
//                     <div className="flex items-center gap-3">
//                       <Icon className="h-4 w-4" />
//                       <span className="text-sm font-medium">{id}</span>
//                     </div>
// 
//                     <span
//                       className={`w-5 h-5 rounded-full grid place-items-center border ${
//                         active
//                           ? "bg-white text-black border-white"
//                           : "border-white/20 text-transparent"
//                       }`}
//                     >
//                       <Check className="h-3.5 w-3.5" />
//                     </span>
//                   </button>
//                 );
//               })}
//             </div>
// 
//             <div className="mt-6 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3">
//               <button
//                 type="button"
//                 onClick={clearCategorySelection}
//                 className="h-[46px] px-4 rounded-full border border-white/10 bg-[#121213] text-white/80 hover:bg-white/5"
//               >
//                 Clear All
//               </button>
// 
//               <button
//                 type="button"
//                 onClick={() => setCategoriesModalOpen(false)}
//                 className="h-[46px] px-4 rounded-full border border-white/10 bg-[#121213] text-white hover:bg-white/5"
//               >
//                 Cancel
//               </button>
// 
//               <button
//                 type="button"
//                 onClick={applyCategorySelection}
//                 className="h-[46px] px-5 rounded-full text-white font-medium"
//                 style={{ background: "linear-gradient(270deg, #1A73E8 0%, #FF14EF 100%)" }}
//               >
//                 Apply Categories
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
// 
//       <SellPromptModal
//         open={sellOpen}
//         onOpenChange={setSellOpen}
//         onPromptSubmitted={() => {}}
//       />
// 
//     </div>
//   );
};

export default PromptMarketplacePage;