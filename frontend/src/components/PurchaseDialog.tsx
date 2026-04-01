// PurchaseDialog.tsx
import { useEffect, useMemo, useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CreditCard, Check, Building2, Wallet2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { Switch } from "@/components/ui/switch";


const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, "");
interface PurchaseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPurchaseComplete?: (promptId: number) => void;
  prompt: { id: number; title: string; description: string; price: number; category: string } | null;
}

type BillingCycle = "yearly" | "monthly";
type CustomerType = "individual" | "business";
type PayMethod = "card" | "bank";
type Plan = "basic" | "pro";

const PLANS = {
  basic: {
    monthly: 9.99,
    yearly: 9.99,
    features: ["10,000 optimizations per month", "Advanced optimization quality", "Priority support", "Custom suggestions"], // example features
  },
  pro: {
    monthly: 19.99,
    yearly: 19.99,
    features: ["10,000 optimizations per month", "Advanced optimization quality", "Priority support", "Custom suggestions"],
  },
};

const GRAD = "linear-gradient(270.19deg, #1A73E8 0.16%, #FF14EF 99.84%)";
const INTER_STACK =
  'Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif';

export default function PurchaseDialog({ open, onOpenChange, prompt, onPurchaseComplete }: PurchaseDialogProps) {
  if (!prompt) return null;

  const [customerType, setCustomerType] = useState<CustomerType>("individual");
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("yearly");
  const [payMethod, setPayMethod] = useState<PayMethod>("card");
  const [selectedPlan, setSelectedPlan] = useState<Plan>("pro");

  const [formData, setFormData] = useState({
    fullName: "", email: "", cardNumber: "", expiryDate: "", cvv: "",
  });
  const handleInputChange = (field: string, value: string) => setFormData((p) => ({ ...p, [field]: value }));
  const finalPrice = useMemo(() => PLANS[selectedPlan][billingCycle].toFixed(2), [selectedPlan, billingCycle]);

  // Desktop scaling; mobile goes fluid with natural page scroll
  const [scale, setScale] = useState(1);
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const recompute = () => {
      const vw = window.innerWidth, vh = window.innerHeight;
      setIsMobile(vw < 768);
      const s = Math.min((vw - 32) / 950, (vh - 32) / 850, 1);
      setScale(Number.isFinite(s) ? Math.max(0.7, s) : 1);
    };
    recompute();
    window.addEventListener("resize", recompute);
    return () => window.removeEventListener("resize", recompute);
  }, []);

  const handlePurchase = async () => {
    if (!formData.fullName || !formData.email || !formData.cardNumber || !formData.expiryDate || !formData.cvv) {
      toast({ title: "Missing Information", description: "Please fill in all required payment details", variant: "destructive" });
      return;
    }
    const user = JSON.parse(localStorage.getItem("tokun_user") || "{}");
    if (!user.id) {
      toast({ title: "User not found", description: "Please login again", variant: "destructive" });
      return;
    }
    toast({ title: "Processing Purchase", description: "Your payment is being processed..." });
    try {
      const res = await fetch(`${API_BASE}/api/prompt/purchase`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    user_id: user.id,
    prompt,
    plan: selectedPlan,
    billingCycle,
    customerType,
    payMethod,
    charge: Number(finalPrice),
  }),
});
      const data = await res.json();
      if (data.success) {
        toast({ title: "Purchase Successful", description: `You now own "${prompt?.title}"` });
        onPurchaseComplete?.(prompt.id);
        onOpenChange(false);
        setFormData({ fullName: "", email: "", cardNumber: "", expiryDate: "", cvv: "" });
      } else {
        toast({ title: "Purchase Failed", description: data.error || "Please try again later.", variant: "destructive" });
      }
    } catch (e) {
      console.error(e);
      toast({ title: "Error", description: "Something went wrong while processing your purchase.", variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="p-0 border-0 bg-transparent sm:max-w-none max-w-none w-auto m-0"
        style={{ overflow: "visible" }}
      >
        {/* Center on desktop; on mobile, start at top and let page scroll */}
        <div className="w-screen min-h-[calc(100vh-32px)] flex md:items-center items-start justify-center px-2 md:py-0 py-6">
          <div
            style={
              isMobile
                ? {
                    width: "100%",
                    maxWidth: 560,
                    borderRadius: 20,
                    background: "#030406",
                    boxShadow: "0 8px 40px rgba(0,0,0,0.6)",
                    fontFamily: INTER_STACK,
                    lineHeight: 1.55,
                  }
                : {
                    width: 950,
                    height: 850,
                    borderRadius: 30,
                    background: "#030406",
                    transform: `scale(${scale})`,
                    transformOrigin: "center",
                    boxShadow: "0 8px 40px rgba(0,0,0,0.6)",
                    fontFamily: INTER_STACK,
                    lineHeight: 1.55,
                  }
            }
            className={isMobile ? "overflow-visible" : "overflow-hidden"}
          >
            {/* Header */}
            <div className="px-8 pt-12 md:pt-14">
              <DialogHeader className="items-start text-left space-y-5">
                <DialogTitle className="text-[#ffffff] text-[22px] leading-tight">
                  Enter payment info to start your subscription
                </DialogTitle>
                <DialogDescription className="text-[#ffffff] text-sm">
                  Personal Information
                </DialogDescription>
              </DialogHeader>
              <div className="h-6" />
            </div>

            {/* Body (fixed height on desktop so bottoms align; auto on mobile) */}
            <div className="px-8 pb-10" style={{ height: isMobile ? "auto" : 650 }}>
              {/* Two equal-height columns */}
              <div className="grid h-full items-stretch grid-cols-1 md:grid-cols-[minmax(0,1fr)_374px] md:gap-12 gap-8 text-white">
                {/* LEFT (top + bottom with justify-between) */}
                <div className="flex flex-col h-full justify-between md:pr-2">
                  {/* Top content */}
                  <div className="space-y-6">
                    <div className="grid gap-5">
                      <div className="max-w-[464px] w-full space-y-2">
                        <Label htmlFor="fullName" className="text-[16px] leading-[1] text-white/70">Billing to</Label>
                        <Input
                          id="fullName"
                          value={formData.fullName}
                          onChange={(e) => handleInputChange("fullName", e.target.value)}
                          className="w-full h-[60px] rounded-[6px] bg-[#0F1520] border border-[#282C42] text-white placeholder:text-white/30"
                          placeholder="Name"
                        />
                      </div>

                      <div className="max-w-[464px] w-full space-y-2">
                        <Label htmlFor="email" className="text-[16px] leading-[1] text-white/70">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange("email", e.target.value)}
                          className="w-full h-[60px] rounded-[6px] bg-[#0F1520] border border-[#282C42] text-white placeholder:text-white/30"
                          placeholder="you@company.com"
                        />
                      </div>

                      {/* Card number with brand icons sized 28.75×20 (no overflow) */}
                      <div className="relative max-w-[464px] w-full space-y-2">
                        <Label htmlFor="cardNumber" className="text-[16px] leading-[1] text-white/70">Card Number *</Label>
                        <Input
                          id="cardNumber"
                          placeholder="1234 5678 9012 3456"
                          value={formData.cardNumber}
                          onChange={(e) => handleInputChange("cardNumber", e.target.value)}
                          className="w-full h-[60px] pr-[168px] rounded-[6px] bg-[#0F1520] border border-[#282C42] text-white placeholder:text-white/30"
                        />
                        <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 w-[160px] overflow-hidden">
                          <div className="flex items-center gap-2 whitespace-nowrap opacity-100">
                            <img src="/icons/Visa.png" alt="Visa" className="w-[28.75px] h-[20px] object-contain shrink-0" />
                            <img src="/icons/Mastercard.png" alt="Mastercard" className="w-[28.75px] h-[20px] object-contain shrink-0" />
                            <img src="/icons/Amex.png" alt="Amex" className="w-[28.75px] h-[20px] object-contain shrink-0" />
                            <img src="/icons/Discover.png" alt="Discover" className="w-[28.75px] h-[20px] object-contain shrink-0" />
                          </div>
                        </div>
                        <div className="text-[11px] text-emerald-400">
                          This is a secure 256-bit SSL encrypted payment.
                        </div>
                      </div>
                    </div>

                    {/* Payment method + fields */}
                    <div className="space-y-6">
                      <div className="flex items-center gap-3 text-[20px] leading-[1] font-medium text-white">
                        <CreditCard className="h-5 w-5 text-white/80" /> <span>Your Payment Details</span>
                      </div>

                      <div
                        className="flex items-center gap-4 h-[50px] rounded-[200px] px-5 w-full max-w-[300px]"
                        style={{ backgroundColor: "#121213", border: "1px solid #282829" }}
                      >
                        <button
                          type="button"
                          onClick={() => setPayMethod("card")}
                          className="flex items-center gap-2 text-white/80 text-sm"
                        >
                          <Wallet2 className="h-5 w-5 text-white/80" />
                          <span className={payMethod === "card" ? "text-white" : "text-white/80"}>Card</span>
                        </button>

                        <Switch
                          id="pay-toggle"
                          checked={payMethod === "bank"}
                          onCheckedChange={(checked) => setPayMethod(checked ? "bank" : "card")}
                          className={[
                            "w-[48px] h-[26px] rounded-full relative",
                            "bg-[linear-gradient(270.19deg,#1A73E8_0.16%,#FF14EF_99.84%)]",
                            "border border-[#282829]",
                            "[&>span]:h-[20px] [&>span]:w-[20px] [&>span]:rounded-full [&>span]:bg-black/80",
                            "[&>span]:translate-x-[4px] data-[state=checked]:[&>span]:translate-x-[24px]",
                          ].join(" ")}
                        />

                        <label
                          htmlFor="pay-toggle"
                          className="flex items-center gap-2 cursor-pointer text-white/80 text-sm"
                        >
                          <Building2 className="h-5 w-5 text-white/80" />
                          <span className={payMethod === "bank" ? "text-white" : "text-white/80"}>Bank</span>
                        </label>
                      </div>

                      <div className="grid md:grid-cols-2 grid-cols-1 gap-4 max-w-[464px] w-full">
                        <div className="w-full space-y-2">
                          <Label htmlFor="expiryDate" className="text-[16px] leading-[1] text-white/70">Valid thru *</Label>
                          <Input
                            id="expiryDate"
                            placeholder="MM / YY"
                            value={formData.expiryDate}
                            onChange={(e) => handleInputChange("expiryDate", e.target.value)}
                            className="w-full md:w-[222px] h-[60px] rounded-[6px] bg-[#0F1520] border border-[#282C42] text-white placeholder:text-white/30"
                          />
                        </div>
                        <div className="w-full space-y-2">
                          <Label htmlFor="cvv" className="text-[16px] leading-[1] text-white/70">CVV *</Label>
                          <Input
                            id="cvv"
                            placeholder="123"
                            value={formData.cvv}
                            onChange={(e) => handleInputChange("cvv", e.target.value)}
                            className="w-full md:w-[222px] h-[60px] rounded-[6px] bg-[#0F1520] border border-[#282C42] text-white placeholder:text-white/30"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bottom actions (anchored) */}
                  <div className="pt-4 max-w-[464px] w-full grid md:grid-cols-2 grid-cols-1 gap-4">
                    <div className="hidden md:block" />
                    <div className="flex items-center justify-end gap-5">
                      <span
                        onClick={() => onOpenChange(false)}
                        className="text-white/80 text-[16px] leading-[1] font-medium hover:text-white cursor-pointer select-none"
                      >
                        Cancel
                      </span>
                      <Button
                        onClick={handlePurchase}
                        className="w-[160px] h-[50px] rounded-[6px] text-white border-0 text-[16px] leading-[1] font-medium"
                        style={{ background: GRAD }}
                      >
                        Purchase ${finalPrice}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* RIGHT (top + bottom with justify-between; ends with left) */}
                <div className="flex flex-col h-full justify-between md:pr-8">
                  {/* Top: pill + pay boxes */}
                  <div className="space-y-6">
                    <div className="w-[230px] h-[40px] rounded-[20px] border border-white/20 bg-white/5 p-1 flex items-center">
                      <button
                        onClick={() => setCustomerType("individual")}
                        className={`h-full flex-1 rounded-full text-xs ${customerType === "individual" ? "text-white" : "text-white/70"}`}
                        style={customerType === "individual" ? { background: GRAD } : undefined}
                      >
                        Individual
                      </button>
                      <button
                        onClick={() => setCustomerType("business")}
                        className={`h-full flex-1 rounded-full text-xs ${customerType === "business" ? "text-white" : "text-white/70"}`}
                        style={customerType === "business" ? { background: GRAD } : undefined}
                      >
                        Business
                      </button>
                      <span
                        className="px-2 text-[11px] font-medium bg-clip-text text-transparent"
                        style={{ backgroundImage: GRAD as any }}
                      >
                        35%
                      </span>
                    </div>

                    <button
                      onClick={() => setBillingCycle("yearly")}
                      className={`w-full md:w-[374px] min-h-[76px] rounded-[10px] p-5 bg-white/[0.03] text-left ${
                        billingCycle === "yearly" ? "border-2 border-white" : "border border-white/10"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`h-4 w-4 rounded-full grid place-items-center ${
                            billingCycle === "yearly" ? "border-2 border-white" : "border border-white/20"
                          }`}
                        >
                          {billingCycle === "yearly" && <div className="h-2 w-2 rounded-full bg-white" />}
                        </div>
                        <div className="text-sm font-medium break-words">Pay Yearly</div>
                        <span className="ml-auto text-[12px] leading-[1] text-emerald-400 break-words">
                          Billed yearly (Save up to 22%)
                        </span>
                      </div>
                      <div className="pl-7 text-[20px] leading-[1] mt-2">$19.99/month</div>
                    </button>

                    <button
                      onClick={() => setBillingCycle("monthly")}
                      className={`w-full md:w-[374px] min-h-[76px] rounded-[10px] p-5 bg-white/[0.03] text-left ${
                        billingCycle === "monthly" ? "border-2 border-white" : "border border-white/10"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`h-4 w-4 rounded-full grid place-items-center ${
                            billingCycle === "monthly" ? "border-2 border-white" : "border border-white/20"
                          }`}
                        >
                          {billingCycle === "monthly" && <div className="h-2 w-2 rounded-full bg-white" />}
                        </div>
                        <div className="text-sm font-medium break-words">Pay Monthly</div>
                      </div>
                      <div className="pl-7 text-[20px] leading-[1] mt-2 text-white/80">$19.99/month</div>
                    </button>
                  </div>

                  {/* Bottom: plan cards */}
                  <div className="space-y-6 mt-6">
                    <button
                      onClick={() => setSelectedPlan("basic")}
                      className={`w-full md:w-[374px] min-h-[176px] rounded-[14px] p-6 bg-white/[0.03] text-left ${
                        selectedPlan === "basic" ? "border-2 border-white" : "border border-white/10"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="text-[20px] font-semibold leading-[1] break-words">Basic</div>
                        <div className="text-right shrink-0 leading-[1]">
                          <span className="text-[24px]">$9.99</span><span className="text-sm text-white/60">/month</span>
                        </div>
                      </div>
                      <div className="mt-4 grid gap-3 text-[12px] leading-[1] font-normal text-white/80">
                        {PLANS.basic.features.map((f) => (
                          <div className="flex items-center gap-2" key={f}>
                            <Check className="h-4 w-4 text-emerald-400" /> <span className="break-words">{f}</span>
                          </div>
                        ))}
                      </div>
                    </button>

                    <button
                      onClick={() => setSelectedPlan("pro")}
                      className={`relative w-full md:w-[374px] min-h-[176px] rounded-[14px] p-6 bg-white/[0.03] text-left ${
                        selectedPlan === "pro" ? "border-2 border-white" : "border border-white/10"
                      }`}
                    >
                      <div className="absolute -top-3 left-4 text-[11px] bg-[#6C3BFF] text-white px-2 py-0.5 rounded-full">
                        Most Popular
                      </div>
                      <div className="flex items-start justify-between gap-3">
                        <div className="text-[20px] font-semibold leading-[1] break-words">Pro</div>
                        <div className="text-right shrink-0 leading-[1]">
                          <span className="text-[24px]">$19.99</span><span className="text-sm text-white/60">/month</span>
                        </div>
                      </div>
                      <div className="mt-4 grid gap-3 text-[12px] leading-[1] font-normal text-white/80">
                        {PLANS.pro.features.map((f) => (
                          <div className="flex items-center gap-2" key={f}>
                            <Check className="h-4 w-4 text-emerald-400" /> <span className="break-words">{f}</span>
                          </div>
                        ))}
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
