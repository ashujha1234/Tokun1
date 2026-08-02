import Header from "@/components/Header";
import Footer from "@/components/Footer";

const SECTIONS = [
  {
    title: "1. Information We Collect",
    body: [
      "Account information you provide when signing up — name, email address, and organization details.",
      "Content you create or upload — prompts, optimizations, uploaded files, and marketplace listings.",
      "Payment and billing information processed through our payment partner (Razorpay) — we do not store your full card details on our servers.",
      "Usage data such as token consumption, feature usage, and device/browser information used to operate and improve the service.",
    ],
  },
  {
    title: "2. How We Use Your Information",
    body: [
      "To provide, operate, and maintain the Tokun platform, including Smartgen, Prompt Optimizer, the Prompt Marketplace, and Hire.",
      "To process payments, subscriptions, wallet top-ups, and withdrawals.",
      "To communicate with you about your account, transactions, and service updates.",
      "To detect, prevent, and address fraud, abuse, or security issues.",
    ],
  },
  {
    title: "3. Payments & Wallet",
    body: [
      "All payments are processed via Razorpay. Tokun does not store your card, UPI, or bank credentials directly.",
      "Wallet balances shown in your account represent amounts owed to you and are tracked internally; funds are only transferred to your bank account or UPI ID when you request a withdrawal.",
      "Bank account and UPI details you add for withdrawals are shared with Razorpay to enable payouts.",
    ],
  },
  {
    title: "4. Your Content",
    body: [
      "You retain ownership of prompts and content you create or upload. By listing a prompt on the Marketplace, you grant buyers a license to use that prompt as described at the time of purchase.",
      "You are responsible for ensuring you have the right to upload and sell any content you list.",
    ],
  },
  {
    title: "5. Data Sharing",
    body: [
      "We share data with service providers strictly to operate the platform — for example, Razorpay for payments, and email/communication providers for account notifications.",
      "We do not sell your personal information to third parties.",
    ],
  },
  {
    title: "6. Data Security",
    body: [
      "We use reasonable technical and organizational measures to protect your data, including encrypted transmission and access controls.",
      "No system is 100% secure; you use the platform at your own risk with respect to unforeseen security incidents.",
    ],
  },
  {
    title: "7. Your Rights",
    body: [
      "You may request access to, correction of, or deletion of your personal data by contacting support.",
      "You may close your account at any time; some records (e.g. transaction history) may be retained as required by law.",
    ],
  },
  {
    title: "8. Changes to This Policy",
    body: [
      "We may update this Privacy Policy from time to time. Continued use of Tokun after changes take effect constitutes acceptance of the revised policy.",
    ],
  },
];

export default function PrivacyPolicyPage() {
  return (
    <div className="relative min-h-screen bg-[#030406] text-white overflow-x-hidden">
      <div className="fixed top-0 left-0 right-0 z-[999]">
        <Header />
      </div>

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_40%_at_50%_12%,rgba(255,20,239,0.14),rgba(0,0,0,0))]"
      />

      <main className="relative z-10">
        <section className="container mx-auto px-4 sm:px-6 pt-24 sm:pt-28 pb-10 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold leading-tight">
            Privacy Policy
          </h1>
          <p className="mt-4 text-white/60 text-sm">Last updated: 2026</p>
          <p className="mt-6 text-white/75 max-w-2xl mx-auto leading-relaxed">
            This policy explains what information Tokun collects, how it is used,
            and the choices you have regarding your data.
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
              Questions about this policy? Contact us via the{" "}
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
