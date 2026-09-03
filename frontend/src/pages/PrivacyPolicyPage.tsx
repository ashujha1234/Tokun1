import Header from "@/components/Header";
import Footer from "@/components/Footer";

/* Written against what the code actually does, not against a template.
 *
 * Every claim below is checkable in this repository: KYC in server/routes/
 * kycRoutes.js and utils/kyc, payments in routes/hire.routes.js and
 * utils/razorpay.js, file storage in utils/blobStorage.js and
 * utils/serviceWorkStorage.js, telemetry in utils/telemetry.js and
 * src/lib/telemetry.ts, sessions in utils/authTokens.js.
 *
 * If a feature changes, this page has to change with it — a privacy policy that
 * describes a version of the product that no longer exists is worse than none,
 * because it is a statement of fact that is now untrue.
 *
 * NOT reviewed by a lawyer. India's DPDP Act 2023, the RBI's rules on holding
 * and settling funds, and the consumer-protection e-commerce rules all bear on
 * this text, and none of them were applied by anyone qualified to do so.
 */
const SECTIONS = [
  {
    title: "1. What this policy covers",
    body: [
      "This policy describes what Tokun collects, why, who can see it, and how long it is kept. It applies to everything on tokun.world — Smartgen, the Product Optimiser, Productverse, the Product Library, Hire, Wallet and the Creator tools.",
      "It is written against how the platform actually works today. Where a section mentions a specific number — a retention period, a session length — that number is the one in effect.",
    ],
  },
  {
    title: "2. Information you give us",
    body: [
      "Account: your name, email address, and — if you sign in with Google — the basic profile Google returns. Tokun does not store a password for normal accounts; signing in uses a one-time code sent to your email.",
      "Profile: anything you choose to add — display name, professional title, About text, country, city, languages, skills, work history, education and certifications. What you put in a public profile is public.",
      "Content: products, prompts and optimisations you create, files you upload, marketplace listings, and the media attached to them.",
      "Organisations: if you belong to an org, the name of that organisation and your role in it.",
      "Communications: messages you exchange with other users and with our support and admin team, including any files attached to them.",
    ],
  },
  {
    title: "3. Identity verification (KYC)",
    body: [
      "Tokun offers identity verification, and some accounts complete it. It is the most sensitive data the platform handles, so it is described separately and in full — whether or not you ever use it.",
      "It is optional today. Nothing on the platform is gated behind it, and you can browse, buy, sell and be hired without submitting anything. If that changes, this section and the Terms will say so before it takes effect.",
      "What is collected: images of the front and back of one government ID — Aadhaar or Passport — that you upload yourself.",
      "What is done with them: the images are read automatically to extract the name printed on the document, and that name is compared with the name on your Tokun account. The extracted name, a similarity score, and the outcome are stored against your account. Extraction runs on our own servers; your ID images are not sent to a third-party verification service.",
      "If automated checking cannot decide, a member of the Tokun admin team reviews the documents manually. If a submission is rejected you are told the reason, and there is a waiting period before you may resubmit.",
      "Who can see the documents: Tokun admin staff reviewing your submission. They are never shown to buyers, sellers, clients or other creators, and are not used for anything other than verifying who you are.",
      "You can decline to verify, and you can ask us to delete a submission you have already made.",
    ],
  },
  {
    title: "4. Information collected automatically",
    body: [
      "Usage: token consumption per feature, which features you use, and your activity history within your account.",
      "Diagnostics: we use Microsoft Azure Application Insights on both the website and the server to record errors and performance. This includes the pages you visit, the requests your browser makes, the browser and device you use, and an approximate location derived from your IP address. When something fails, an error identifier is shown to you and recorded with the technical detail, so that a report can be matched to what actually went wrong.",
      "The diagnostics SDK on the website is configured not to set cookies.",
      "Payment provider: Razorpay collects its own information when you pay, under its own privacy policy.",
    ],
  },
  {
    title: "5. Payments, earnings and bank details",
    body: [
      "All card, UPI and netbanking details are entered on Razorpay's checkout and handled by Razorpay. Tokun never receives or stores them.",
      "For payouts, the bank account or UPI ID you add is passed to Razorpay to create a payout account. Tokun stores the resulting account references and the details needed to show you which account you are paid into.",
      "Money for Services and Projects is held by Razorpay until the work is approved or the booking is settled — Tokun does not hold your funds. Wallet balances shown in your account are a record of what is owed to you.",
      "Transaction records — what was bought or sold, when, for how much, the fees applied and the payment reference — are kept as financial records and are not deleted when an account is closed.",
    ],
  },
  {
    title: "6. How we use your information",
    body: [
      "To run the platform and the features you use.",
      "To process payments, hold and release escrow funds, pay out earnings, and handle refunds and disputes.",
      "To verify identity where selling or paid work requires it.",
      "To email you about your account, your transactions, and things that need your attention — a delivery due, a booking about to lapse, a subscription about to expire.",
      "To review reported content, investigate abuse, prevent fraud, and enforce the Terms.",
      "To find and fix faults, and to understand which parts of the product are used.",
    ],
  },
  {
    title: "7. What other people can see",
    body: [
      "Public: your public profile, your listings, your ratings and reviews, and — once approved by our team — your creator intro video.",
      "The people you deal with: a buyer, seller or client you transact with sees your name, profile, the messages and files you exchange, and the details of that transaction.",
      "Signed agreements: an NDA you sign, including the signature you draw, is stored privately and is readable only by the two parties to that agreement and by Tokun admin staff resolving a dispute about it.",
      "Delivered work: files a creator delivers are stored privately and are opened through links that expire. Before payment is released, a client sees a watermarked preview rather than the original file.",
      "Your organisation: if your account belongs to an organisation, its owner can see your token allowance and how much of it you have used. They cannot read your messages.",
      "Tokun staff: admin staff can access account, transaction, KYC and dispute data where their work requires it.",
    ],
  },
  {
    title: "8. Who we share data with",
    body: [
      "Razorpay — payments, escrow transfers, payouts and refunds.",
      "Microsoft Azure — hosting, file storage and diagnostics.",
      "MongoDB Atlas — the database.",
      "Google — only if you choose to sign in with Google, or use a Google Meet link created through the platform.",
      "Our email provider — to deliver account and transaction email.",
      "Law enforcement or regulators, where we are legally required to.",
      "We do not sell personal information, and we do not share it for advertising.",
    ],
  },
  {
    title: "9. Where your data is stored",
    body: [
      "The platform runs on Microsoft Azure and its database is hosted on MongoDB Atlas. Uploaded files are stored in Azure Blob Storage.",
      "Files that are meant to be public — listing images and previews, approved intro videos — are stored so that anyone holding the link can view them. Files that are not — ID documents, signed NDAs, delivered work, attachments — are stored privately and reached only through short-lived links issued after we check who is asking.",
    ],
  },
  {
    title: "10. How long we keep it",
    body: [
      "Account and profile data: while your account is open.",
      "KYC documents and their results, if you submitted any: while your account is open, and afterwards only as long as we are required to keep proof of verification. Deleted on request.",
      "Transaction and payout records: retained after account closure, because tax and financial law requires it.",
      "Messages and dispute evidence: kept while the related booking can still be disputed, and afterwards where a dispute was raised.",
      "Diagnostics: kept for a limited period for fault-finding and then discarded.",
      "Files you delete are removed from storage; copies another party legitimately downloaded before deletion are outside our control.",
    ],
  },
  {
    title: "11. Your content",
    body: [
      "You keep ownership of what you create and upload. Listing a product grants buyers a licence to use it as described at the time of purchase.",
      "You are responsible for having the right to upload and sell what you list.",
      "Product text delivered to a buyer carries a per-buyer watermark, so a leaked copy can be traced to the account it was sold to.",
    ],
  },
  {
    title: "12. Cookies and browser storage",
    body: [
      "Tokun keeps your session in your browser's local storage rather than in a cookie. Signing in stores two tokens: a short-lived one that authorises each request and expires within an hour, and a longer-lived one used to obtain the next short-lived token. Signing out removes both and revokes the long-lived one on our servers.",
      "We also store small amounts of local data to remember your preferences and recent activity between visits.",
      "Where cookies are used, you are asked to consent on your first visit.",
    ],
  },
  {
    title: "13. Security",
    body: [
      "Traffic is encrypted in transit. Access to admin tools is separated from ordinary accounts and admin sessions are deliberately short.",
      "Private files are never served from a public address; each read is authorised first and the link issued expires.",
      "Sessions can be revoked on our side, so a stolen session can be ended without waiting for it to expire.",
      "No system is completely secure. If a breach affects your personal data, we will tell you and the relevant authority as required by law.",
    ],
  },
  {
    title: "14. Your rights",
    body: [
      "You can ask for a copy of your personal data, ask us to correct it, or ask us to delete it.",
      "You can withdraw consent for identity verification and ask us to delete the documents you submitted.",
      "You can close your account at any time. Records we are required to keep — chiefly transaction and tax records — are retained; the rest is removed.",
      "You can complain to us first, and to the relevant data protection authority if you are not satisfied.",
      "Requests are made through the Support page and we aim to respond within 30 days.",
    ],
  },
  {
    title: "15. Children",
    body: [
      "Tokun is not intended for anyone under 18. If we learn that an account belongs to a child, we close it and delete the data.",
    ],
  },
  {
    title: "16. Changes to this policy",
    body: [
      "We may update this policy as the platform changes. Material changes are notified in-app or by email, and the date at the top of this page always reflects the current version.",
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
          <p className="mt-4 text-white/60 text-sm">Last updated: 3 September 2026</p>
          <p className="mt-6 text-white/75 max-w-2xl mx-auto leading-relaxed">
            What Tokun collects, why, who can see it, how long it is kept, and what
            you can ask us to do with it.
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
