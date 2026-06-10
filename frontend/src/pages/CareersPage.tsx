import { motion } from "framer-motion";
import {
  BriefcaseBusiness,
  Users,
  Rocket,
  HeartHandshake,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Footer from "@/components/Footer";
import Header from "@/components/Header";

const values = [
  {
    icon: Rocket,
    title: "Move with purpose",
    description:
      "We work fast, stay focused, and build with clarity. We value execution, ownership, and thoughtful momentum.",
  },
  {
    icon: Users,
    title: "Build together",
    description:
      "Great products come from strong collaboration. We value respectful teamwork, clear communication, and shared wins.",
  },
  {
    icon: HeartHandshake,
    title: "Care deeply",
    description:
      "We care about the product, the people using it, and the people building it. Quality and trust matter to us.",
  },
];

const jobs = [
  {
    title: "Frontend Developer",
    type: "Full-time",
    location: "Remote",
    description:
      "Build polished, high-performance interfaces for core product experiences across web platforms.",
  },
  {
    title: "Product Designer",
    type: "Full-time",
    location: "Remote",
    description:
      "Design elegant user flows, visual systems, and intuitive experiences for creators and business users.",
  },
  {
    title: "AI Product Specialist",
    type: "Full-time",
    location: "Hybrid",
    description:
      "Work across prompt workflows, user research, and AI product behavior to improve customer outcomes.",
  },
];

export default function CareersPage() {
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
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(35%_25%_at_75%_20%,rgba(26,115,232,0.16),rgba(0,0,0,0))]"
      />

      <main className="relative z-10">
        <section className="container mx-auto px-4 sm:px-6 pt-20 sm:pt-24 lg:pt-28 pb-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="max-w-4xl mx-auto"
          >
            <div className="relative z-20 inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-2.5 mb-6 overflow-visible leading-none">
              <span
                className="block text-sm font-medium leading-none bg-clip-text text-transparent"
                style={{
                  backgroundImage:
                    "linear-gradient(90deg, #FF14EF 0%, #1A73E8 100%)",
                }}
              >
                CAREERS
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight">
              Build the future of
              <span
                className="block bg-clip-text text-transparent"
                style={{
                  backgroundImage:
                    "linear-gradient(90deg, #FF14EF 0%, #1A73E8 100%)",
                }}
              >
                prompt workflows with us
              </span>
            </h1>

            <p className="mt-6 text-white/75 text-base sm:text-lg leading-relaxed max-w-3xl mx-auto">
              We are building a product for the next generation of AI users. If
              you care about product quality, meaningful speed, and creating
              tools people truly love to use, TOKUN could be the place for you.
            </p>

            <div className="mt-8 flex justify-center">
              <Button
                className="h-11 px-6 rounded-full text-white"
                style={{
                  background:
                    "linear-gradient(270deg, #1A73E8 0%, #FF14EF 100%)",
                }}
                onClick={() => {
                  window.location.href =
                    "mailto:careers@tokun.ai?subject=Career%20Application";
                }}
              >
                Apply Now
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        </section>

        <section className="container mx-auto px-4 sm:px-6 py-6">
          <div className="grid md:grid-cols-3 gap-6">
            {values.map((item) => {
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

        <section className="container mx-auto px-4 sm:px-6 py-12">
          <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-8 items-start">
            <div
              className="rounded-[32px] p-[1px]"
              style={{
                background:
                  "linear-gradient(135deg, #FF14EF 0%, #1A73E8 100%)",
              }}
            >
              <div className="rounded-[31px] bg-[#08090B] p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-5">
                  <BriefcaseBusiness className="h-6 w-6" />
                  <h2 className="text-2xl sm:text-3xl font-bold">
                    Why join TOKUN
                  </h2>
                </div>

                <ul className="space-y-4 text-white/78 text-sm leading-relaxed">
                  <li>Work on a focused AI product with real user impact.</li>
                  <li>
                    Collaborate with a small, ambitious, product-first team.
                  </li>
                  <li>
                    Contribute to features that shape prompt creation and
                    monetization.
                  </li>
                  <li>
                    Grow in an environment that values initiative and strong
                    execution.
                  </li>
                  <li>
                    Help define how modern users interact with LLM workflows.
                  </li>
                </ul>
              </div>
            </div>

            <div>
              <div className="mb-8">
                <h2 className="text-3xl sm:text-4xl font-bold">Open roles</h2>

                <p className="mt-3 text-white/70 max-w-2xl">
                  We are looking for thoughtful people who want to build
                  meaningful tools with speed and care.
                </p>
              </div>

              <div className="space-y-5">
                {jobs.map((job) => (
                  <div
                    key={job.title}
                    className="rounded-[28px] p-[1px]"
                    style={{
                      background:
                        "linear-gradient(180deg, #333333 0%, #12141A 100%)",
                    }}
                  >
                    <div className="rounded-[27px] bg-[#08090B] p-6">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                          <h3 className="text-xl font-semibold">
                            {job.title}
                          </h3>

                          <div className="mt-2 flex flex-wrap gap-2 text-xs">
                            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-white/75">
                              {job.type}
                            </span>

                            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-white/75">
                              {job.location}
                            </span>
                          </div>
                        </div>

                        <Button
                          className="h-10 px-5 rounded-full text-white"
                          style={{
                            background:
                              "linear-gradient(270deg, #1A73E8 0%, #FF14EF 100%)",
                          }}
                          onClick={() => {
                            window.location.href = `mailto:careers@tokun.ai?subject=${encodeURIComponent(
                              `Application for ${job.title}`
                            )}`;
                          }}
                        >
                          Apply
                        </Button>
                      </div>

                      <p className="mt-4 text-white/72 text-sm leading-relaxed">
                        {job.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}