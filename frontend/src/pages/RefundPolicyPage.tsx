import Header from "@/components/Header";
import Footer from "@/components/Footer";

// Every figure and time limit below is what the backend actually enforces, not
// aspirational text. If any of these change in code, this page has to change
// with it — a published policy that contradicts the implementation is worse than
// no policy at all. The sources are:
//
//   REFUND_WINDOW_HOURS            server/.env (24) — purchaseRoutes.js gates the
//                                  request window AND holds the seller's Route
//                                  transfer for the same duration
//   refundAmount = purchase.pricePaid
//                                  purchaseRoutes.js — full amount, platform fee
//                                  included
//   admin approve/reject only      adminRefunds.js — no partial refunds exist
//   Razorpay payments.refund()     money returns to the original payment method
const REFUND_WINDOW = "24 hours";

const SECTIONS = [
  {
    title: "1. What this policy covers",
    body: [
      "This policy applies to prompts purchased on the Tokun Prompt Marketplace, whether bought individually or through the cart.",
      "Subscription plans (Free, Pro, Enterprise) and token top-ups are billed in advance and are covered by the Terms & Conditions, not this policy.",
      "Funded Hire deals are handled separately under Tokun's escrow process — see the Hire section of the Terms & Conditions.",
    ],
  },
  {
    title: "2. Refund window",
    body: [
      `You can request a refund on a purchased prompt within ${REFUND_WINDOW} of the purchase. After that the purchase is final and the request will be declined automatically.`,
      `The seller's earnings are held for the same ${REFUND_WINDOW}. This is deliberate: while your refund window is open, the money has not yet reached the seller, so an approved refund does not have to be recovered from them.`,
      "Free prompts involve no payment and therefore cannot be refunded.",
    ],
  },
  {
    title: "3. How much you get back",
    body: [
      "Approved refunds are always for the full amount you paid. Nothing is deducted.",
      "That includes Tokun's platform fee. If you paid ₹105 for a prompt listed at ₹100, you receive ₹105 back — Tokun does not keep its fee on a refunded sale.",
      "Partial refunds are not offered. A refund request is either approved in full or declined.",
    ],
  },
  {
    title: "4. How to request a refund",
    body: [
      "Open the purchase in your History and submit a refund request with a reason. A reason is required — requests without one cannot be submitted.",
      "One refund request per purchase. Once a request has been submitted, approved, or declined, the same purchase cannot be re-submitted.",
      "You will be notified in-app when an admin approves or declines your request.",
    ],
  },
  {
    title: "5. Review and decision",
    body: [
      "Every request is reviewed manually by Tokun's admin team. Approval is not automatic.",
      "Requests are typically reviewed within 2–3 business days.",
      "If a request is declined, the admin's note explaining why is shown with your request.",
    ],
  },
  {
    title: "6. Where the money goes",
    body: [
      "Refunds are returned to the original payment method you used — the same card, UPI ID, netbanking account, or wallet. Tokun cannot redirect a refund to a different account, and does not hold your bank details for this purpose.",
      "Once approved, the refund is issued through Razorpay immediately. How long it takes to appear on your statement is set by your bank or payment provider, and is typically 5–7 business days.",
      "Refunds are never issued as Tokun credit or wallet balance unless you specifically ask for that and support agrees.",
    ],
  },
  {
    title: "7. Access after a refund",
    body: [
      "When a refund is approved, your access to the refunded prompt ends. Copies you have already downloaded or saved must be deleted.",
      "Prompt text delivered to a buyer carries a per-buyer watermark. Continuing to use or redistribute a refunded prompt is a breach of the Terms & Conditions and may result in account suspension.",
    ],
  },
  {
    title: "8. Grounds we do and don't refund for",
    body: [
      "We generally approve: the prompt does not match its description or preview, the prompt is unusable or broken, the listing infringes someone else's rights, or you were charged more than once for the same prompt.",
      "We generally decline: you changed your mind after viewing the full prompt, the prompt works but produced output you did not personally like, or the request falls outside the refund window.",
      "Repeated refund requests across many purchases may be reviewed as potential abuse of this policy.",
    ],
  },
  {
    title: "9. Sellers",
    body: [
      "If a purchase of your prompt is refunded, the corresponding earnings are reversed — either by reversing the payout before it settles, or by debiting your Wallet if it has already been credited.",
      "Tokun's commission on that sale is reversed at the same time, so a refunded sale earns Tokun nothing either.",
      "You are notified in-app whenever one of your sales is refunded.",
    ],
  },
  {
    title: "10. Changes to this policy",
    body: [
      "We may update this policy. The version in effect at the time of your purchase is the one that applies to it.",
    ],
  },
];

export default function RefundPolicyPage() {
  return (
    <div className="relative min-h-screen bg-[#030406] text-white overflow-x-hidden">
      <div className="fixed top-0 left-0 right-0 z-[999]">
        <Header />
      </div>

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_40%_at_50%_12%,rgba(26,115,232,0.16),rgba(0,0,0,0))]"
      />

      <main className="relative z-10">
        <section className="container mx-auto px-4 sm:px-6 pt-24 sm:pt-28 pb-10 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold leading-tight">
            Refund &amp; Cancellation Policy
          </h1>
          <p className="mt-4 text-white/60 text-sm">Last updated: 2026</p>
          <p className="mt-6 text-white/75 max-w-2xl mx-auto leading-relaxed">
            How refunds work for prompts bought on the Tokun Marketplace — what
            you can claim, by when, and how the money reaches you.
          </p>
        </section>

        {/* The three things people actually come to this page for, before the
            full text. */}
        <section className="container mx-auto px-4 sm:px-6 pb-4 max-w-3xl">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: "Request within", value: REFUND_WINDOW },
              { label: "You get back", value: "100%" },
              { label: "Returned to", value: "Original payment method" },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-center"
              >
                <div className="text-[11px] uppercase tracking-wide text-white/45">
                  {item.label}
                </div>
                <div className="mt-2 text-lg font-semibold text-white">{item.value}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="container mx-auto px-4 sm:px-6 pt-8 pb-24 max-w-3xl">
          {SECTIONS.map((section) => (
            <div key={section.title} className="mb-10">
              <h2 className="text-xl sm:text-2xl font-semibold mb-4">
                {section.title}
              </h2>
              <ul className="space-y-3">
                {section.body.map((line, i) => (
                  <li key={i} className="text-white/75 leading-relaxed text-sm sm:text-base">
                    {line}
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="mt-12 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <p className="text-white/70 text-sm leading-relaxed">
              Need help with a refund? Contact us via the{" "}
              <a href="/support" className="underline hover:text-white">
                Support
              </a>{" "}
              page, or read the{" "}
              <a href="/terms" className="underline hover:text-white">
                Terms &amp; Conditions
              </a>
              .
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
