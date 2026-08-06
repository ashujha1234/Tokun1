import Header from "@/components/Header";
import Footer from "@/components/Footer";

// Mirrors what server/routes/promptreportRoutes.js actually does, so the page
// doesn't promise outcomes the system can't produce:
//
//   POST /api/prompt-reports          prompt + reason + category required,
//                                     up to 5 screenshots, 10MB each
//   status                            Pending → Reviewed | Resolved | Rejected
//   POST /:id/dismiss                 → Rejected, listing untouched
//   POST /:id/flag                    → Reviewed, prompt.flagged = true (hidden)
//   POST /:id/suspend                 → Resolved, prompt soft-deleted; existing
//                                     buyers keep access; seller notified
//   GET  /me                          reporter can see their own reports
const MAX_SCREENSHOTS = 5;
const MAX_SCREENSHOT_MB = 10;

const SECTIONS = [
  {
    title: "1. What you can report",
    body: [
      "Any prompt listed on the Tokun Marketplace or Prompt Library can be reported.",
      "Report a listing if it infringes your copyright or trademark, contains someone else's work passed off as the seller's own, is misleading about what it does, contains illegal or harmful content, is spam or a duplicate of another listing, or was sold to you broken or unusable.",
      "Reporting is for problems with the listing itself. If you simply want your money back, use the refund process instead — the two are separate, and filing a report does not start a refund.",
    ],
  },
  {
    title: "2. Who can report",
    body: [
      "Any signed-in Tokun user can report a prompt. You do not need to have purchased it.",
      "You can report a listing anonymously as far as the seller is concerned — sellers are told a report was made and what action followed, but not who filed it.",
      "Tokun's admin team can see who filed each report.",
    ],
  },
  {
    title: "3. What to include",
    body: [
      "A reason and a category are required. A report without them cannot be submitted.",
      `You can attach up to ${MAX_SCREENSHOTS} screenshots, each up to ${MAX_SCREENSHOT_MB}MB, as evidence.`,
      "Optional fields — a description, steps to reproduce, and a link to the original work — meaningfully improve the chance of action, especially for copyright claims where we need to see the original.",
      "For an intellectual-property claim, tell us what the original work is and where it can be verified. We cannot act on a claim we cannot check.",
    ],
  },
  {
    title: "4. How a report is reviewed",
    body: [
      "Every report is reviewed manually by Tokun's admin team. Nothing is taken down automatically, and no number of reports triggers removal on its own.",
      "Reports are typically reviewed within 2–3 business days. Reports alleging illegal content are prioritised.",
      "A report moves through one of these states: Pending while it waits for review, then Reviewed, Resolved, or Rejected once an admin has acted.",
    ],
  },
  {
    title: "5. Possible outcomes",
    body: [
      "Rejected — the report is not upheld and the listing stays exactly as it is. This happens when the claim isn't substantiated or describes a preference rather than a violation.",
      "Flagged — the listing is hidden from the marketplace while the issue is looked into further. The seller is notified that their prompt was flagged.",
      "Suspended — for serious violations the listing is removed from the marketplace entirely and the seller is notified. Buyers who already purchased that prompt keep their access, because they paid for it.",
      "Separately from any of these, a seller who repeatedly violates the rules may have their whole seller account suspended, which removes all of their listings from the marketplace.",
    ],
  },
  {
    title: "6. What you'll hear back",
    body: [
      "You can see the status of every report you have filed under your own reports list.",
      "We do not send a detailed explanation of the decision on each report, and we don't disclose what action was taken against another user's account.",
      "If you filed a copyright claim and need the outcome in writing for legal purposes, contact Support.",
    ],
  },
  {
    title: "7. If your prompt is reported",
    body: [
      "You are notified in-app if your listing is flagged or suspended, along with any note the reviewing admin left.",
      "You are not notified about reports that are reviewed and rejected — an unsubstantiated report has no effect on you.",
      "If you believe a flag or suspension was wrong, contact Support and ask for a review. Include anything that shows the work is yours.",
      "Sales already completed are not reversed because a listing was later flagged, unless the buyer separately qualifies for a refund.",
    ],
  },
  {
    title: "8. Misuse of reporting",
    body: [
      "Do not file reports to damage a competitor, to pressure a seller, or in volume without grounds.",
      "Knowingly false reports — especially false copyright claims — are a breach of the Terms & Conditions and may result in your account being suspended.",
    ],
  },
  {
    title: "9. Copyright and legal notices",
    body: [
      "Tokun removes listings that infringe intellectual property once the claim is substantiated.",
      "If you are the rights holder, or acting on their behalf, say so in your report and include verifiable details of the original work.",
      "Formal legal notices should be sent through the Support page so they are logged and routed correctly.",
    ],
  },
  {
    title: "10. Changes to this policy",
    body: [
      "We may update this policy. The version published at the time your report is reviewed is the one that applies to it.",
    ],
  },
];

export default function ReportPolicyPage() {
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
            Content Report Policy
          </h1>
          <p className="mt-4 text-white/60 text-sm">Last updated: 2026</p>
          <p className="mt-6 text-white/75 max-w-2xl mx-auto leading-relaxed">
            How to report a prompt on Tokun, how reports are reviewed, and what
            can happen to a listing as a result.
          </p>
        </section>

        {/* The three outcomes, up front — this is what both reporters and
            sellers want to know before reading the full text. */}
        <section className="container mx-auto px-4 sm:px-6 pb-4 max-w-3xl">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: "Rejected", value: "Listing unchanged" },
              { label: "Flagged", value: "Hidden from marketplace" },
              { label: "Suspended", value: "Removed; buyers keep access" },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-center"
              >
                <div className="text-[11px] uppercase tracking-wide text-white/45">
                  {item.label}
                </div>
                <div className="mt-2 text-sm font-semibold text-white">{item.value}</div>
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
              Need to report something urgently, or appeal a decision? Contact us
              via the{" "}
              <a href="/support" className="underline hover:text-white">
                Support
              </a>{" "}
              page. Looking to get your money back instead? See the{" "}
              <a href="/refund-policy" className="underline hover:text-white">
                Refund Policy
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
