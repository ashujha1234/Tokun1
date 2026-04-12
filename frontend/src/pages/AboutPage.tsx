import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Zap, TrendingUp, ShieldCheck, Globe2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Footer from "@/components/Footer";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";

const features = [
  {
    icon: Zap,
    title: "Prompt Optimization",
    description:
      "Reduce token usage while keeping the meaning, clarity, and output quality strong across leading LLM platforms.",
  },
  {
    icon: Sparkles,
    title: "Smartgen Creation",
    description:
      "Turn rough ideas into structured, high-performing prompts in seconds with AI-assisted prompt generation.",
  },
  {
    icon: TrendingUp,
    title: "Marketplace Growth",
    description:
      "Create, publish, and monetize your best prompts through a marketplace designed for creators and teams.",
  },
  {
    icon: ShieldCheck,
    title: "Reliable Workflows",
    description:
      "Build prompt systems that are consistent, reusable, and easier to manage at individual and team scale.",
  },
];

const stats = [
  { value: "50k+", label: "Prompts Optimized" },
  { value: "60%", label: "Average Token Reduction" },
  { value: "4.9/5", label: "User Satisfaction" },
  { value: "24/7", label: "Support" },
];

export default function AboutPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#030406] text-white overflow-hidden">
              <Header />

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_40%_at_50%_12%,rgba(255,20,239,0.14),rgba(0,0,0,0))]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(40%_30%_at_70%_20%,rgba(26,115,232,0.16),rgba(0,0,0,0))]"
      />

      <main className="relative z-10">
        <section className="container mx-auto px-4 sm:px-6 pt-28 pb-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="max-w-4xl mx-auto"
          >
            <div className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-2 mb-6">
              <span
                className="text-sm font-medium bg-clip-text text-transparent"
                style={{
                  backgroundImage: "linear-gradient(90deg, #FF14EF 0%, #1A73E8 100%)",
                }}
              >
                ABOUT TOKUN
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight">
              We help teams create better prompts,
              <span
                className="block bg-clip-text text-transparent"
                style={{
                  backgroundImage: "linear-gradient(90deg, #FF14EF 0%, #1A73E8 100%)",
                }}
              >
                faster and smarter
              </span>
            </h1>

            <p className="mt-6 text-white/75 text-base sm:text-lg leading-relaxed max-w-3xl mx-auto">
              TOKUN is built for creators, teams, and businesses that want better AI outcomes.
              From prompt optimization to generation and marketplace publishing, we bring the
              entire prompt workflow into one focused platform.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                onClick={() => navigate("/app")}
                className="h-11 px-6 rounded-full text-white border border-white/10"
                style={{
                  background: "linear-gradient(270deg, #1A73E8 0%, #FF14EF 100%)",
                }}
              >
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>

              <Button
                variant="outline"
                onClick={() => navigate("/support")}
                className="h-11 px-6 rounded-full bg-transparent text-white border-white/20 hover:bg-white/5"
              >
                Contact Support
              </Button>
            </div>
          </motion.div>
        </section>

        <section className="container mx-auto px-4 sm:px-6 pb-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {stats.map((item) => (
              <div
                key={item.label}
                className="rounded-[28px] p-[1px]"
                style={{ background: "linear-gradient(180deg, #333333 0%, #12141A 100%)" }}
              >
                <div className="rounded-[27px] bg-[#08090B] px-5 py-6 text-center">
                  <div className="text-2xl sm:text-3xl font-bold">{item.value}</div>
                  <div className="mt-2 text-sm text-white/65">{item.label}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="container mx-auto px-4 sm:px-6 py-16">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-5">Why TOKUN exists</h2>
              <p className="text-white/75 leading-relaxed mb-4">
                AI is powerful, but great outputs still depend on great prompts. Most users waste
                time rewriting instructions, testing variants, and fixing poor structure.
              </p>
              <p className="text-white/75 leading-relaxed mb-4">
                TOKUN was created to simplify that process. We help users write cleaner prompts,
                improve consistency, reduce token waste, and unlock better performance from the
                models they already use.
              </p>
              <p className="text-white/75 leading-relaxed">
                Our goal is simple: make prompt workflows easier, more powerful, and more valuable.
              </p>
            </div>

            <div
              className="rounded-[32px] p-[1px]"
              style={{ background: "linear-gradient(135deg, #FF14EF 0%, #1A73E8 100%)" }}
            >
              <div className="rounded-[31px] bg-[#08090B] p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-5">
                  <Globe2 className="h-6 w-6 text-white" />
                  <h3 className="text-2xl font-semibold">Our mission</h3>
                </div>

                <ul className="space-y-4 text-white/80">
                  <li>Build a complete home for prompt creation, optimization, and growth.</li>
                  <li>Help individuals and teams save time while improving AI output quality.</li>
                  <li>Create better economic opportunities for prompt creators worldwide.</li>
                  <li>Make advanced prompt workflows simple, accessible, and scalable.</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 sm:px-6 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold">What makes us different</h2>
            <p className="mt-4 text-white/70 max-w-2xl mx-auto">
              A focused workflow for building better prompts, reducing effort, and creating value.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {features.map((item) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.title}
                  whileHover={{ y: -6 }}
                  className="group rounded-[30px] p-[1px]"
                  style={{
                    background: "linear-gradient(180deg, #333333 0%, #12141A 100%)",
                  }}
                >
                  <div className="rounded-[29px] bg-[#08090B] p-6 h-full transition-colors duration-300 group-hover:bg-[#0B0D11]">
                    <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 border border-white/10">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                    <p className="text-white/72 leading-relaxed text-sm">{item.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}