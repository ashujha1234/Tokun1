import { X } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, "");

function loadRazorpayScript() {
  return new Promise<boolean>((resolve) => {
    if ((window as any).Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function HirePaymentPopup({
  open,
  onClose,
  notification,
  token,
  onPaid,
}: {
  open: boolean;
  onClose: () => void;
  notification: any;
  token?: string;
  onPaid?: () => void;
}) {
  if (!open || !notification) return null;

  const dealId =
    typeof notification.hireDealId === "object"
      ? notification.hireDealId?._id
      : notification.hireDealId;

  const amount = Number(notification.amount || notification.meta?.amount || 0);

  const makePayment = async () => {
    try {
      if (!token) {
        toast({
          title: "Login required",
          description: "Please login again.",
          variant: "destructive",
        });
        return;
      }

      if (!dealId) {
        toast({
          title: "Deal not found",
          description: "Could not start payment.",
          variant: "destructive",
        });
        return;
      }

      const scriptLoaded = await loadRazorpayScript();

      if (!scriptLoaded) {
        toast({
          title: "Payment failed",
          description: "Razorpay SDK could not load.",
          variant: "destructive",
        });
        return;
      }

      const res = await fetch(`${API_BASE}/api/hire/${dealId}/create-payment-order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to create payment order");
      }

      const options = {
        key: data.key,
        amount: data.order.amount,
        currency: data.order.currency,
        name: "Tokun",
        description: notification.meta?.title || "Hire Payment",
        order_id: data.order.id,

        handler: async function (response: any) {
          const verifyRes = await fetch(`${API_BASE}/api/hire/${dealId}/verify-payment`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }),
          });

          const verifyData = await verifyRes.json();

          if (!verifyRes.ok || !verifyData.success) {
            throw new Error(verifyData.error || "Payment verification failed");
          }

          toast({
            title: "Payment successful",
            description: "Amount is now safely held by Tokun.",
          });

          onPaid?.();
          onClose();
        },

        modal: {
          ondismiss: function () {
            console.log("Razorpay popup closed");
          },
        },

        theme: {
          color: "#1A73E8",
        },
      };

      const razorpay = new (window as any).Razorpay(options);
      razorpay.open();
    } catch (err: any) {
      toast({
        title: "Payment failed",
        description: err.message || "Something went wrong.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-md"
        onClick={onClose}
      />

      <div className="relative w-full max-w-lg rounded-3xl bg-[#111827] border border-white/10 shadow-2xl p-6 text-white">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20"
        >
          <X size={18} />
        </button>

        <div className="mb-5">
          <div className="text-sm text-white/60">Hire Accepted</div>
          <h2 className="text-2xl font-semibold mt-1">
            {notification.meta?.title || "Hire Payment Required"}
          </h2>
        </div>

        <div className="rounded-2xl bg-white/5 border border-white/10 p-4 space-y-3">
          <div className="flex justify-between gap-4">
            <span className="text-white/60">Freelancer</span>
            <span className="font-medium text-right">
              {notification.meta?.freelancerName ||
                notification.senderName ||
                "Freelancer"}
            </span>
          </div>

          <div className="flex justify-between gap-4">
            <span className="text-white/60">Email</span>
            <span className="font-medium text-right">
              {notification.meta?.freelancerEmail ||
                notification.senderEmail ||
                "-"}
            </span>
          </div>

          <div className="flex justify-between gap-4">
            <span className="text-white/60">Amount</span>
            <span className="font-semibold text-right">
              ₹{amount.toLocaleString("en-IN")}
            </span>
          </div>

          {notification.meta?.deliveryDate && (
            <div className="flex justify-between gap-4">
              <span className="text-white/60">Delivery Date</span>
              <span className="font-medium text-right">
                {new Date(notification.meta.deliveryDate).toLocaleDateString("en-IN")}
              </span>
            </div>
          )}

          <div className="flex justify-between gap-4">
            <span className="text-white/60">Status</span>
            <span className="font-medium text-yellow-300">
              Waiting for payment
            </span>
          </div>
        </div>

        <div className="mt-4 rounded-2xl bg-blue-500/10 border border-blue-400/20 p-4 text-sm text-white/75">
          Payment Tokun ke paas safely hold rahegi. Work complete hone ke baad hi freelancer ko release hogi.
        </div>

        <button
          onClick={makePayment}
          className="mt-6 w-full h-12 rounded-xl font-semibold text-white bg-gradient-to-r from-[#FF14EF] to-[#1A73E8]"
        >
          Make Payment
        </button>
      </div>
    </div>
  );
}