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
//
// The escrow figures below come from:
//   AUTO_RELEASE_HOURS (72)        cron/autoReleaseEscrow.js and
//                                  cron/autoReleaseServiceEscrow.js
//   RAZORPAY_MAX_HOLD_DAYS (90)    utils/escrowWindow.js — a hard limit set by
//   MAX_DELIVERY_DAYS (60)         the payment provider, not by Tokun
//   sellerPercent split maths      services/escrowSettlement.service.js
//   revisionsAllowed               utils/revisionPolicy.js
const REFUND_WINDOW = "24 hours";
const AUTO_RELEASE = "72 hours";

const SECTIONS = [
  {
    title: "1. What this policy covers",
    body: [
      "Tokun handles three kinds of paid transaction, and they are refunded differently because they work differently.",
      "Products (Sections 2–9) are digital files delivered the moment you pay. Nothing is held back, so refunds are a short, fixed window.",
      "Services and Projects (Sections 10–14) are work someone does for you after you pay. Your money is held by our payment provider and is not passed to the creator until the work is approved — so cancelling is possible, but what you get back depends on how much work has already been done.",
      "Subscription plans (Free, Pro, Enterprise) and token top-ups are billed in advance and are covered by the Terms & Conditions, not this policy.",
    ],
  },
  {
    title: "2. Refund window",
    body: [
      `You can request a refund on a purchased prompt within ${REFUND_WINDOW} of the purchase. After that the purchase is final and the request will be declined automatically.`,
      `The seller's earnings are held for the same ${REFUND_WINDOW}. This is deliberate: while your refund window is open, the money has not yet reached the seller, so an approved refund does not have to be recovered from them.`,
      "Free products involve no payment and therefore cannot be refunded.",
    ],
  },
  {
    title: "3. How much you get back",
    body: [
      "Approved refunds return the full listed price of the item. The Creator's price comes back to you in full.",
      "Tokun's platform fee is not refunded. It pays for processing the transaction — the payment rails, the holding of funds and the support behind it — and that work is done whether or not you keep the purchase. On a ₹100 product you pay ₹103.54 and an approved refund returns ₹100.",
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
      "When a refund is approved, your access to the refunded product ends. Copies you have already downloaded or saved must be deleted.",
      "Product text delivered to a buyer carries a per-buyer watermark. Continuing to use or redistribute a refunded product is a breach of the Terms & Conditions and may result in account suspension.",
    ],
  },
  {
    title: "8. Grounds we do and don't refund for",
    body: [
      "We generally approve: the product does not match its description or preview, the product is unusable or broken, the listing infringes someone else's rights, or you were charged more than once for the same product.",
      "We generally decline: you changed your mind after viewing the full product, the product works but produced output you did not personally like, or the request falls outside the refund window.",
      "Repeated refund requests across many purchases may be reviewed as potential abuse of this policy.",
    ],
  },
  {
    title: "9. Creators",
    body: [
      "If a purchase of your product is refunded, the corresponding earnings are reversed — either by reversing the payout before it settles, or by debiting your Wallet if it has already been credited.",
      "Tokun's commission on that sale is reversed at the same time, so a refunded sale earns Tokun nothing either.",
      "You are notified in-app whenever one of your sales is refunded.",
    ],
  },
  {
    title: "10. Services and Projects — how payment is held",
    body: [
      "When you book a service or fund a project, your payment is collected immediately but is NOT given to the creator. It is held by our payment provider, Razorpay, on a Route transfer until the work is done and you approve it.",
      `Once the creator submits the work you have ${AUTO_RELEASE} to approve it or ask for a revision. If you do neither, the payment is released to them automatically — silence is treated as acceptance, so that a creator who has delivered isn't left unpaid indefinitely.`,
      "Because the money is held rather than spent, a cancellation before delivery does not need a conventional refund — the funds simply have not left, and are returned or split as set out below.",
      "Funds cannot be held forever. Our payment provider releases them after 90 days, so every booking must reach a conclusion before then. That is also why a delivery date can be at most 60 days out, leaving room for review, revisions and any dispute.",
    ],
  },
  {
    title: "11. Cancelling before work has started",
    body: [
      "If the creator has not started work, either side can cancel and the full booking price comes back to you automatically. No admin review, no haggling — nothing has been invested yet.",
      "Tokun's platform fee is the one exception, and it is not refunded on any cancellation. It covers processing the booking, which happened regardless. On a ₹10,000 booking you pay ₹10,354 and a cancellation returns ₹10,000. Tokun earns no commission on a cancelled booking — only that fee.",
    ],
  },
  {
    title: "12. If the creator cancels",
    body: [
      "If a creator abandons work you have already paid for, you receive 100% of what you paid back, immediately — regardless of how much work they claim to have done. The cost of walking away is theirs, not yours.",
      "The cancellation is recorded against the creator's account. Repeated cancellations lead to suspension.",
    ],
  },
  {
    title: "13. If you cancel after work has started",
    body: [
      "This is the one case where a full refund is not automatic. The creator has spent real time on your job, so the payment is split rather than simply returned.",
      "The work pauses immediately and the creator states what share they completed, with evidence. You then either accept their figure — which settles it straight away — or reject it, which sends it to Tokun's team to decide.",
      "The split is driven by a single percentage. If the creator is assessed at 40% complete on a ₹1,000 booking, they are paid 40% of their payout, you are refunded 60% of what you paid, and Tokun keeps only 40% of its fee. At 0% you receive everything back; at 100% nothing is refunded. The three parts always add up to exactly what you paid.",
      "Nothing moves while this is being decided. Your money stays held until the split is agreed or ruled on.",
      "You can withdraw a cancellation at any point before it is settled, and the work continues as normal.",
    ],
  },
  {
    title: "14. Revisions, disputes and evidence",
    body: [
      "Every booking includes a set number of revisions, fixed at the time you book and shown before you pay. Once those are used you can no longer send the work back — at that point your options are to approve it, or to cancel and have the split decided. This exists so a delivery cannot be rejected indefinitely to avoid paying for it.",
      "While work is in progress you can ask the creator for a progress update, and they can reply with a screenshot or recording. Those updates are timestamped and kept by Tokun. If a cancellation is later disputed, they are the strongest evidence of what actually existed and when — far more so than either side's account after the fact.",
      "Where Tokun's team decides a split, both parties receive the reasoning by email along with the exact amounts.",
    ],
  },
  {
    title: "15. Changes to this policy",
    body: [
      "We may update this policy. The version in effect at the time of your purchase or booking is the one that applies to it.",
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
            How refunds work for products bought on the Tokun Marketplace — what
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
