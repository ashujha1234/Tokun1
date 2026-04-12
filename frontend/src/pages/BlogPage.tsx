import { motion } from "framer-motion";
import { ArrowRight, CalendarDays, Clock3, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";

const featuredPost = {
  title: "How to Write Better AI Prompts for Consistent Results",
  description:
    "Learn the structure, clarity patterns, and optimization methods that help prompts perform better across LLM workflows.",
  category: "Prompt Engineering",
  date: "Jan 12, 2026",
  readTime: "6 min read",
};

const posts = [
  {
    title: "7 Mistakes That Make Your Prompts Weak",
    description:
      "Common prompt writing mistakes that reduce quality, create ambiguity, and waste tokens.",
    category: "Guides",
    date: "Jan 08, 2026",
    readTime: "4 min read",
  },
  {
    title: "How Token Reduction Improves Cost and Speed",
    description:
      "See how prompt optimization can reduce unnecessary tokens without losing meaning or output quality.",
    category: "Optimization",
    date: "Jan 05, 2026",
    readTime: "5 min read",
  },
  {
    title: "Building a Prompt Workflow for Teams",
    description:
      "A practical guide to organizing, testing, and scaling prompt systems inside modern teams.",
    category: "Teams",
    date: "Dec 29, 2025",
    readTime: "7 min read",
  },
  {
    title: "What Makes a Prompt Marketplace Valuable",
    description:
      "From discovery to monetization, here is what creators and buyers need from a strong marketplace experience.",
    category: "Marketplace",
    date: "Dec 22, 2025",
    readTime: "5 min read",
  },
  {
    title: "Prompt Templates vs Custom Prompts",
    description:
      "When should you use templates, and when should you build from scratch for better AI performance?",
    category: "Prompt Strategy",
    date: "Dec 18, 2025",
    readTime: "4 min read",
  },
  {
    title: "Smartgen Workflows That Save Time",
    description:
      "Discover faster ways to move from rough ideas to clean, reusable prompts with AI-assisted generation.",
    category: "Productivity",
    date: "Dec 14, 2025",
    readTime: "6 min read",
  },
];

const categories = [
  "All",
  "Prompt Engineering",
  "Optimization",
  "Marketplace",
  "Teams",
  "Guides",
];

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-[#030406] text-white overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_40%_at_50%_12%,rgba(255,20,239,0.14),rgba(0,0,0,0))]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(35%_25%_at_75%_20%,rgba(26,115,232,0.16),rgba(0,0,0,0))]"
      />

      <Header />

      <main className="relative z-10">
        <section className="container mx-auto px-4 sm:px-6 pt-32 pb-14 text-center">
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
                BLOG
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight">
              Insights, ideas, and updates from
              <span
                className="block bg-clip-text text-transparent"
                style={{
                  backgroundImage: "linear-gradient(90deg, #FF14EF 0%, #1A73E8 100%)",
                }}
              >
                the TOKUN promptverse
              </span>
            </h1>

            <p className="mt-6 text-white/75 text-base sm:text-lg leading-relaxed max-w-3xl mx-auto">
              Explore prompt engineering tips, workflow improvements, product ideas,
              and practical strategies to get better outcomes from AI systems.
            </p>
          </motion.div>
        </section>

        <section className="container mx-auto px-4 sm:px-6 pb-10">
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((item) => (
              <button
                key={item}
                type="button"
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 transition-all duration-300 hover:text-white hover:border-white/20"
              >
                {item}
              </button>
            ))}
          </div>
        </section>

        <section className="container mx-auto px-4 sm:px-6 pb-12">
          <div
            className="rounded-[32px] p-[1px]"
            style={{ background: "linear-gradient(135deg, #FF14EF 0%, #1A73E8 100%)" }}
          >
            <div className="rounded-[31px] bg-[#08090B] p-6 sm:p-8 md:p-10">
              <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-8 items-center">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80 mb-4">
                    <Sparkles className="h-4 w-4" />
                    Featured Post
                  </div>

                  <h2 className="text-3xl sm:text-4xl font-bold leading-tight mb-4">
                    {featuredPost.title}
                  </h2>

                  <p className="text-white/72 leading-relaxed mb-5 max-w-2xl">
                    {featuredPost.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-sm text-white/60 mb-6">
                    <span>{featuredPost.category}</span>
                    <span className="inline-flex items-center gap-2">
                      <CalendarDays className="h-4 w-4" />
                      {featuredPost.date}
                    </span>
                    <span className="inline-flex items-center gap-2">
                      <Clock3 className="h-4 w-4" />
                      {featuredPost.readTime}
                    </span>
                  </div>

                  <Button
                    className="h-11 px-6 rounded-full text-white"
                    style={{
                      background: "linear-gradient(270deg, #1A73E8 0%, #FF14EF 100%)",
                    }}
                  >
                    Read Article
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 rounded-[28px] blur-3xl opacity-40 bg-[radial-gradient(circle_at_center,rgba(255,20,239,0.35),rgba(26,115,232,0.2),transparent)]" />
                  <div className="relative rounded-[28px] border border-white/10 bg-[#0B0D11] p-8 min-h-[260px] flex items-center justify-center">
                    <div className="text-center">
                      <div
                        className="text-5xl sm:text-6xl font-bold bg-clip-text text-transparent"
                        style={{
                          backgroundImage: "linear-gradient(90deg, #FF14EF 0%, #1A73E8 100%)",
                        }}
                      >
                        TOKUN
                      </div>
                      <p className="mt-3 text-white/60 text-sm sm:text-base">
                        Prompt thinking for modern AI workflows
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 sm:px-6 py-10">
          <div className="mb-10">
            <h2 className="text-3xl sm:text-4xl font-bold">Latest posts</h2>
            <p className="mt-3 text-white/70 max-w-2xl">
              Fresh articles designed to help users create stronger prompts and better AI systems.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {posts.map((post) => (
              <motion.div
                key={post.title}
                whileHover={{ y: -6 }}
                className="group rounded-[30px] p-[1px]"
                style={{ background: "linear-gradient(180deg, #333333 0%, #12141A 100%)" }}
              >
                <div className="rounded-[29px] bg-[#08090B] p-6 h-full transition-colors duration-300 group-hover:bg-[#0B0D11]">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/75">
                      {post.category}
                    </span>
                    <span className="text-xs text-white/50">{post.readTime}</span>
                  </div>

                  <h3 className="text-xl font-semibold mb-3 leading-snug">
                    {post.title}
                  </h3>

                  <p className="text-white/72 text-sm leading-relaxed mb-5">
                    {post.description}
                  </p>

                  <div className="mt-auto flex items-center justify-between text-sm text-white/55">
                    <span>{post.date}</span>
                    <Link
                      to="/blog"
                      className="inline-flex items-center gap-2 text-white/80 transition-colors hover:text-white"
                    >
                      Read more
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="container mx-auto px-4 sm:px-6 py-16">
          <div
            className="rounded-[32px] p-[1px]"
            style={{ background: "linear-gradient(135deg, #FF14EF 0%, #1A73E8 100%)" }}
          >
            <div className="rounded-[31px] bg-[#08090B] px-6 py-10 sm:px-10 text-center">
              <h2 className="text-3xl sm:text-4xl font-bold">Stay updated with TOKUN</h2>
              <p className="mt-4 text-white/70 max-w-2xl mx-auto">
                Get product news, workflow tips, and prompt strategy updates delivered to your inbox.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-xl mx-auto">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full sm:flex-1 h-12 px-5 rounded-full bg-transparent border border-white/20 text-white placeholder:text-white/45 outline-none focus:border-white/40"
                />
                <Button
                  className="w-full sm:w-auto h-12 px-6 rounded-full text-white"
                  style={{
                    background: "linear-gradient(270deg, #1A73E8 0%, #FF14EF 100%)",
                  }}
                >
                  Subscribe
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}