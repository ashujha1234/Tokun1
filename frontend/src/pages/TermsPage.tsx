import Header from "@/components/Header";
import Footer from "@/components/Footer";

const SECTIONS = [
  {
    title: "1. Acceptance of Terms",
    body: [
      "By creating an account or using Tokun (Smartgen, Prompt Optimizer, Prompt Marketplace, Prompt Library, Hire, and Wallet), you agree to these Terms & Conditions.",
      "If you are using Tokun on behalf of an organization, you confirm you have the authority to bind that organization to these terms.",
    ],
  },
  {
    title: "2. Accounts",
    body: [
      "You must provide accurate information when creating an account and keep your login credentials secure.",
      "You are responsible for all activity that happens under your account.",
    ],
  },
  {
    title: "3. Subscriptions & Token Usage",
    body: [
      "Free, Pro, and Enterprise plans include a monthly token allowance used across Smartgen and Prompt Optimizer.",
      "Unused tokens do not roll over between billing periods unless explicitly stated for your plan.",
      "Subscription fees are billed in advance and are non-refundable except where required by law.",
    ],
  },
  {
    title: "4. Marketplace & Selling Prompts",
    body: [
      "Sellers may list prompts for sale on the Marketplace and set their own price.",
      "Tokun charges a commission on each sale, deducted from the seller's payout; the current commission rate is disclosed in your seller dashboard.",
      "Sellers must not upload content that infringes on third-party intellectual property or violates applicable law.",
      "Tokun may remove listings that violate these terms without prior notice.",
    ],
  },
  {
    title: "5. Hire & Escrow",
    body: [
      "When a client hires a freelancer through Tokun, payment is collected upfront and held until the client approves the delivered work.",
      "If the client does not approve or request revisions within 72 hours of work submission, funds are automatically released to the freelancer.",
      "Tokun charges a commission on both the client and freelancer side of a Hire transaction, as disclosed at the time the proposal is created.",
      "Refunds for funded Hire deals are processed only through Tokun's admin support team.",
    ],
  },
  {
    title: "6. Wallet & Withdrawals",
    body: [
      "Earnings from prompt sales and completed Hire deals are credited to your in-app Wallet.",
      "Withdrawals require a linked bank account or UPI ID and are subject to a minimum withdrawal amount and service fee, shown at the time of the request.",
      "Tokun reserves the right to review withdrawal requests for fraud prevention before processing.",
    ],
  },
  {
    title: "7. Prohibited Use",
    body: [
      "You may not use Tokun to generate, sell, or distribute illegal content, malware, or content that violates the rights of others.",
      "You may not attempt to circumvent usage limits, security controls, or payment mechanisms.",
    ],
  },
  {
    title: "8. Limitation of Liability",
    body: [
      "Tokun is provided on an \"as is\" basis. To the maximum extent permitted by law, Tokun is not liable for indirect, incidental, or consequential damages arising from use of the platform.",
    ],
  },
  {
    title: "9. Termination",
    body: [
      "Tokun may suspend or terminate accounts that violate these terms.",
      "You may close your account at any time; any remaining Wallet balance can be withdrawn before closure, subject to standard withdrawal terms.",
    ],
  },
  {
    title: "10. Changes to These Terms",
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
          <p className="mt-4 text-white/60 text-sm">Last updated: 2026</p>
          <p className="mt-6 text-white/75 max-w-2xl mx-auto leading-relaxed">
            These terms govern your use of Tokun, including Smartgen, Prompt Optimizer,
            the Prompt Marketplace, Hire, and Wallet.
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
