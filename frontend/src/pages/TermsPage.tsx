import Header from "@/components/Header";
import Footer from "@/components/Footer";

const SECTIONS = [
  {
    title: "1. Acceptance of Terms",
    body: [
      "By creating an account or using Tokun (Smartgen, Product Optimiser, Productverse, Product Library, Hire, and Wallet), you agree to these Terms & Conditions.",
      "If you are using Tokun on behalf of an organization, you confirm you have the authority to bind that organization to these terms.",
    ],
  },
  {
    title: "2. Accounts",
    body: [
      "You must provide accurate information when creating an account and keep access to your email secure — signing in uses a one-time code sent to it, so whoever controls the inbox controls the account.",
      "You are responsible for all activity that happens under your account.",
      "Tokun is for people aged 18 and over.",
    ],
  },
  {
    title: "3. Creator and Supercreator",
    body: [
      "A Creator sells digital products on Productverse. A Supercreator does that and is also available for hire, appearing to clients browsing for someone to work with.",
      "Becoming a Supercreator requires a completed creator profile and a payout account our payment provider has activated. Until the payout account is active you can be messaged but not hired — because money could not reach you.",
      "An intro video, if you upload one, is reviewed by our team before it appears on your public profile. Videos that do not meet the stated requirements, or that show something other than you introducing your work, are rejected.",
      "Your public rating is calculated from buyer and client reviews. Where a dispute is decided against you, a rating penalty may be applied; this is never automatic and the reason is recorded.",
    ],
  },
  {
    title: "4. Subscriptions & Token Usage",
    body: [
      "Free, Pro, and Enterprise plans include a monthly token allowance used across Smartgen and Product Optimiser.",
      "Unused tokens do not roll over between billing periods unless explicitly stated for your plan.",
      "Subscription fees are billed in advance and are non-refundable except where required by law.",
    ],
  },
  {
    title: "5. Marketplace & Selling Products",
    body: [
      "Creators may list products for sale on the Marketplace and set their own price.",
      "Tokun charges a commission on each sale, deducted from the Creator's payout; the current commission rate is disclosed in your Creator dashboard.",
      "Creators must not upload content that infringes on third-party intellectual property or violates applicable law.",
      "Tokun may remove listings that violate these terms without prior notice.",
    ],
  },
  {
    title: "6. Services & Projects — How payment is handled",
    body: [
      "Two kinds of paid work run through Tokun: Services, which a creator lists at a fixed scope and price, and Projects, where a client writes a brief and proposes a budget. Both are funded and settled the same way.",
      "Payment is collected upfront and held by our payment provider, Razorpay, on a Route transfer. It is not passed to the creator until the client approves the delivered work.",
      "If the client neither approves nor requests a revision within 72 hours of work being submitted, the funds are released to the creator automatically. Silence is treated as acceptance.",
      "Every booking includes a fixed number of revisions, set when it is created and shown before payment. Once used, the work can no longer be sent back; the client may approve it, or cancel and have the split decided.",
      "Funds cannot be held indefinitely. Our payment provider stops holding them 90 days after payment, so every booking must be concluded before then — which is why a delivery date can be at most 60 days from the date of booking.",
      "Tokun charges a commission on both the client and creator side, disclosed before payment. On a cancelled booking Tokun's commission is reduced in proportion to the work completed.",
      "A creator cannot accept paid work until their payout account has been verified by our payment provider. Until then, they can be messaged but not hired.",
    ],
  },
  {
    title: "7. Cancellation & Disputes",
    body: [
      "Before work has started, either side may cancel and the client is refunded in full, automatically.",
      "If the creator abandons work that has already been paid for, the client is refunded in full regardless of work claimed. The cancellation is recorded against the creator's account and repeated occurrences lead to suspension.",
      "If the client cancels after work has started, the payment is split according to how much was completed. The creator states their share with evidence; the client either accepts it, which settles immediately, or rejects it, which refers the matter to Tokun for a decision. Funds remain held until then.",
      "Tokun's decision on a disputed split is final for the purposes of releasing the held funds. Both parties receive the reasoning and the exact amounts by email.",
      "Full details, including how the split is calculated, are in the Refund & Cancellation Policy.",
    ],
  },
  {
    title: "8. Payouts & Withdrawals",
    body: [
      "Earnings from Services and Projects are paid to the creator's verified payout account by our payment provider once the funds are released, on that account's own settlement schedule.",
      "Earnings from product sales are credited to your in-app Wallet. Withdrawals require a linked bank account or UPI ID and are subject to a minimum withdrawal amount and service fee, shown at the time of the request.",
      "Tokun reserves the right to review withdrawal requests for fraud prevention before processing.",
    ],
  },
  {
    title: "9. Prohibited Use",
    body: [
      "You may not use Tokun to generate, sell, or distribute illegal content, malware, or content that violates the rights of others.",
      "You may not attempt to circumvent usage limits, security controls, or payment mechanisms.",
      "You may not redistribute, resell or publish a product you bought. Delivered product text carries a per-buyer watermark, so a leaked copy identifies the account it was sold from.",
      "You may not take a booking off the platform to avoid fees. Doing so removes the protection the held payment provides to both sides, and is grounds for suspension.",
      "You may not create listings for work you cannot deliver, or use another person's identity, portfolio or credentials as your own.",
    ],
  },
  {
    title: "10. Limitation of Liability",
    body: [
      "Tokun is provided on an \"as is\" basis. To the maximum extent permitted by law, Tokun is not liable for indirect, incidental, or consequential damages arising from use of the platform.",
    ],
  },
  {
    title: "11. Termination",
    body: [
      "Tokun may suspend or terminate accounts that violate these terms.",
      "You may close your account at any time; any remaining Wallet balance can be withdrawn before closure, subject to standard withdrawal terms.",
    ],
  },
  {
    title: "12. Changes to These Terms",
    body: [
      "We may update these Terms & Conditions from time to time. Continued use of Tokun after changes take effect constitutes acceptance of the revised terms.",
    ],
  },
];

export default function TermsPage() {
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
            Terms &amp; Conditions
          </h1>
          <p className="mt-4 text-white/60 text-sm">Last updated: 3 September 2026</p>
          <p className="mt-6 text-white/75 max-w-2xl mx-auto leading-relaxed">
            These terms govern your use of Tokun, including Smartgen, Product Optimiser,
            Productverse, Hire, and Wallet.
          </p>
        </section>

        <section className="container mx-auto px-4 sm:px-6 pb-24 max-w-3xl">
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
              Questions about these terms? Contact us via the{" "}
              <a href="/support" className="underline hover:text-white">
                Support
              </a>{" "}
              page.
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
