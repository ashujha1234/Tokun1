import { motion } from "framer-motion";
import {
  Mail,
  MessageCircleHeart,
  Clock3,
  ShieldCheck,
  HelpCircle,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Footer from "@/components/Footer";
import Header from "@/components/Header";

const supportCards = [
  {
    icon: MessageCircleHeart,
    title: "Customer Support",
    description:
      "Get help with account access, billing issues, subscriptions, platform guidance, and general product questions.",
  },
  {
    icon: ShieldCheck,
    title: "Account & Security",
    description:
      "Need help protecting your account, resetting access, or reviewing suspicious activity? We are here to help.",
  },
  {
    icon: HelpCircle,
    title: "Product Guidance",
    description:
      "Learn how to use Smartgen, optimization workflows, prompt management, and marketplace tools more effectively.",
  },
];

const faqs = [
  {
    q: "How quickly can I expect a response?",
    a: "Most support requests receive a response within 24 hours. Priority and account issues are reviewed faster when possible.",
  },
  {
    q: "Can I get help with billing and subscriptions?",
    a: "Yes. We can help with plan changes, billing questions, renewals, refunds, and subscription-related issues.",
  },
  {
    q: "Do you support teams and business users?",
    a: "Yes. We support both individual users and teams that need guidance on workflows, onboarding, and platform usage.",
  },
  {
    q: "Where should I report a bug?",
    a: "You can report bugs through the support email or the contact form on this page. Include screenshots and steps to reproduce the issue.",
  },
];

export default function SupportPage() {
  return (
    <div className="relative min-h-screen bg-[#030406] text-white overflow-x-hidden">
      {/* Sticky / fixed header */}
      <div className="fixed top-0 left-0 right-0 z-[999]">
        <Header />
      </div>

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_40%_at_50%_12%,rgba(255,20,239,0.12),rgba(0,0,0,0))]"
      />

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(35%_25%_at_75%_20%,rgba(26,115,232,0.15),rgba(0,0,0,0))]"
      />

      <main className="relative z-10">
        <section className="container mx-auto px-4 sm:px-6 pt-20 sm:pt-24 lg:pt-28 pb-10">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="max-w-4xl mx-auto text-center"
          >
            <div className="relative z-20 inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-2.5 mb-6 overflow-visible leading-none">
              <span
                className="block text-sm font-medium leading-none bg-clip-text text-transparent"
                style={{
                  backgroundImage:
                    "linear-gradient(90deg, #FF14EF 0%, #1A73E8 100%)",
                }}
              >
                SUPPORT
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight">
              We are here to help you
              <span
                className="block bg-clip-text text-transparent"
                style={{
                  backgroundImage:
                    "linear-gradient(90deg, #FF14EF 0%, #1A73E8 100%)",
                }}
              >
                get the best from TOKUN
              </span>
            </h1>

            <p className="mt-6 text-white/75 text-base sm:text-lg leading-relaxed max-w-3xl mx-auto">
              Whether you have a billing issue, a product question, or need help
              getting started, our support team is ready to assist you with
              clear and practical guidance.
            </p>
          </motion.div>
        </section>

        <section className="container mx-auto px-4 sm:px-6 pb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {supportCards.map((item) => {
              const Icon = item.icon;

              return (
                <motion.div
                  key={item.title}
                  whileHover={{ y: -6 }}
                  className="group rounded-[30px] p-[1px]"
                  style={{
                    background:
                      "linear-gradient(180deg, #333333 0%, #12141A 100%)",
                  }}
                >
                  <div className="rounded-[29px] bg-[#08090B] p-6 h-full transition-colors duration-300 group-hover:bg-[#0B0D11]">
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 border border-white/10 mb-4">
                      <Icon className="h-6 w-6" />
                    </div>

                    <h3 className="text-xl font-semibold mb-3">
                      {item.title}
                    </h3>

                    <p className="text-white/72 text-sm leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>

        <section className="container mx-auto px-4 sm:px-6 py-10">
          <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-8">
            <div
              className="rounded-[32px] p-[1px]"
              style={{
                background:
                  "linear-gradient(135deg, #FF14EF 0%, #1A73E8 100%)",
              }}
            >
              <div className="rounded-[31px] bg-[#08090B] p-6 sm:p-8">
                <h2 className="text-2xl sm:text-3xl font-bold mb-6">
                  Contact support
                </h2>

                <div className="space-y-5">
                  <div className="flex items-start gap-4">
                    <div className="mt-1 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/5 border border-white/10">
                      <Mail className="h-5 w-5" />
                    </div>

                    <div>
                      <div className="font-semibold">Email us</div>

                      <div className="text-white/70 text-sm mt-1">
                        support@tokun.world
                      </div>

                      <p className="text-white/65 text-sm mt-2">
                        Best for billing help, platform support, account access
                        issues, and general questions.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="mt-1 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/5 border border-white/10">
                      <Clock3 className="h-5 w-5" />
                    </div>

                    <div>
                      <div className="font-semibold">Response time</div>

                      <p className="text-white/65 text-sm mt-2">
                        We usually respond within 24 hours on business days.
                        Urgent account issues are prioritized.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex flex-wrap gap-3">
                  <Button
                    className="h-11 px-6 rounded-full text-white"
                    style={{
                      background:
                        "linear-gradient(270deg, #1A73E8 0%, #FF14EF 100%)",
                    }}
                    onClick={() => {
                      window.location.href = "mailto:support@tokun.world";
                    }}
                  >
                    Email Support
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div
              className="rounded-[32px] p-[1px]"
              style={{
                background:
                  "linear-gradient(180deg, #333333 0%, #12141A 100%)",
              }}
            >
              <div className="rounded-[31px] bg-[#08090B] p-6 sm:p-8 h-full">
                <h2 className="text-2xl font-bold mb-6">Support hours</h2>

                <div className="space-y-4 text-white/75 text-sm">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <span>Monday - Friday</span>
                    <span>9:00 AM - 6:00 PM</span>
                  </div>

                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <span>Saturday</span>
                    <span>10:00 AM - 2:00 PM</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span>Sunday</span>
                    <span>Closed</span>
                  </div>
                </div>

                <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="font-semibold mb-2">Tip</div>

                  <p className="text-white/65 text-sm leading-relaxed">
                    To help us resolve your issue faster, include screenshots,
                    error messages, and the steps you followed before the issue
                    appeared.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 sm:px-6 py-10">
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-bold">
              Frequently asked questions
            </h2>

            <p className="mt-4 text-white/70 max-w-2xl mx-auto">
              Quick answers to common questions about support, account help, and
              product usage.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {faqs.map((item) => (
              <div
                key={item.q}
                className="rounded-[28px] p-[1px]"
                style={{
                  background:
                    "linear-gradient(180deg, #333333 0%, #12141A 100%)",
                }}
              >
                <div className="rounded-[27px] bg-[#08090B] p-6 h-full">
                  <h3 className="text-lg font-semibold mb-3">{item.q}</h3>

                  <p className="text-white/72 text-sm leading-relaxed">
                    {item.a}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}