// // // // // // // // // // server/index.js
// // // // // // // // // require("dotenv").config();
// // // // // // // // // const express = require("express");
// // // // // // // // // const cors = require("cors");
// // // // // // // // // const mongoose = require("mongoose");
// // // // // // // // // const path = require("path");
// // // // // // // // // const cron = require("node-cron");
// // // // // // // // // const { resetDuePeriods } = require("./utils/jobs/resetPeriods");
// // // // // // // // // const { updateSubscriptionStatuses } = require("./utils/jobs/subscriptionStatusCron");


// // // // // // // // // const authRoutes = require("./routes/authRoutes");
// // // // // // // // // const quotaRoutes = require("./routes/quotaRoute");
// // // // // // // // // const smartgenRoutes = require("./routes/smartgenRoutes");
// // // // // // // // // const savedCollectionRoutes=require("./routes/savedCollectionRoutes");
// // // // // // // // // const categoryRoutes=require("./routes/categoryRoutes");
// // // // // // // // // const promptRoutes= require("./routes/promptRoutes");
// // // // // // // // // const orgMembers= require("./routes/orgMembers");

// // // // // // // // // const purchaseRoutes= require("./routes/purchaseRoutes");
// // // // // // // // // const llmProviderRoutes = require("./routes/llmproviderRoutes");
// // // // // // // // // const promptoptimizerRoutes=require("./routes/promptoptimizerRoutes");
// // // // // // // // // const promptreportRoutes=require("./routes/promptreportRoutes");
// // // // // // // // // const bankAccountRoutes=require("./routes/bankAccounts");

// // // // // // // // // //plan purchase
// // // // // // // // // const billingOrders=require("./routes/billingOrders");
// // // // // // // // // const billingVerify=require("./routes/billingVerify");

// // // // // // // // // const billingHistory=require("./routes/billingHistory");
// // // // // // // // // const feedbackRoutes = require("./routes/feedback");

// // // // // // // // // const cartRoute=require("./routes/cartRoute");
// // // // // // // // // const promptCollab=require("./routes/promptCollab");


// // // // // // // // // const pricingRoutes=require("./routes/pricing");
 




// // // // // // // // // const app = express();
// // // // // // // // // app.use(cors({
// // // // // // // // //   origin: "http://localhost:5173", // ✅ not "*"
// // // // // // // // //   credentials: true,               // ✅ allow cookies/headers
// // // // // // // // // }));
// // // // // // // // // app.use(express.json());
// // // // // // // // // app.use(express.urlencoded({ extended: true }));        // for application/x-www-form-urlencoded

// // // // // // // // // // Health
// // // // // // // // // app.get("/health", (_req, res) => res.json({ ok: true }));
// // // // // // // // // app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// // // // // // // // // // Routes
// // // // // // // // // app.use("/api/auth", authRoutes);
// // // // // // // // // app.use("/api/org/members",orgMembers);
// // // // // // // // // app.use("/api/quota",quotaRoutes);
// // // // // // // // // app.use("/api/smartgen",smartgenRoutes);
// // // // // // // // // app.use("/uploads", express.static(path.join(__dirname, "uploads")));
// // // // // // // // // app.use("/api/saved-collections", savedCollectionRoutes);
// // // // // // // // // app.use("/api/category",categoryRoutes);
// // // // // // // // // app.use("/api/prompt",promptRoutes);
// // // // // // // // // app.use("/api/purchase",purchaseRoutes);
// // // // // // // // // app.use("/api/llm-provider", llmProviderRoutes);
// // // // // // // // // app.use("/api/promptoptimizer", promptoptimizerRoutes);
// // // // // // // // // app.use("/api/promptreport", promptreportRoutes);
// // // // // // // // // app.use("/api/bankaccount", bankAccountRoutes);


// // // // // // // // // app.use("/api/routes/pricing", pricingRoutes);
// // // // // // // // // //app.use(require("./routes/orgMembers"));
// // // // // // // // // //app.use(require("./routes/orgMembersReassign"));
// // // // // // // // // //app.use(require("./routes/orgMembersRevoke"));
// // // // // // // // // //app.use(require("./routes/orgExtraTokens"));


// // // // // // // // // app.use("/api/plans/subscribe/order",billingOrders);

// // // // // // // // // app.use("/api/plans/subscribe/verify",billingVerify)

// // // // // // // // // app.use("/api/plans/subscribe/history",billingHistory);

// // // // // // // // // app.use("/api/feedback", feedbackRoutes);

// // // // // // // // // app.use("/api/cart",cartRoute);

// // // // // // // // // app.use("/api/prompt-collab/",promptCollab);




// // // // // // // // // app.get("/", (req, res) => {
// // // // // // // // //   res.sendFile(path.join(__dirname, "sample.html"));
// // // // // // // // // });



// // // // // // // // // // ✅ Schedule the cron after everything is initialized
// // // // // // // // // cron.schedule("5 * * * *", async () => {
// // // // // // // // //   try {
// // // // // // // // //     await resetDuePeriods();
// // // // // // // // //   } catch (e) {
// // // // // // // // //     console.error("resetDuePeriods failed", e);
// // // // // // // // //   }
// // // // // // // // // });

// // // // // // // // // // run every minute (for testing); in prod, hourly is fine
// // // // // // // // // cron.schedule("* * * * *", async () => {
// // // // // // // // //   try { await updateSubscriptionStatuses(); } catch (e) { console.error("status cron failed", e); }
// // // // // // // // // });

// // // // // // // // // const PORT = process.env.PORT || 5000; 
// // // // // // // // // const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;

// // // // // // // // // if (!MONGO_URI) {
// // // // // // // // //   console.error("❌ Missing MONGO_URI / MONGODB_URI in .env");
// // // // // // // // //   process.exit(1);
// // // // // // // // // }

// // // // // // // // // mongoose
// // // // // // // // //   .connect(MONGO_URI, {
// // // // // // // // //     useNewUrlParser: true,
// // // // // // // // //     useUnifiedTopology: true,
// // // // // // // // //     ssl:true,
// // // // // // // // //   })
// // // // // // // // //   .then(() => {
// // // // // // // // //     console.log("✅ MongoDB connected");
// // // // // // // // //     app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
// // // // // // // // //   })
// // // // // // // // //   .catch((err) => {
// // // // // // // // //     console.error("❌ MongoDB connection failed:", err);
// // // // // // // // //     process.exit(1);
// // // // // // // // //   });
// // // // // // // // // // After successful mongoose.connect(...)
// // // // // // // // // console.log("daily quota reset");




// // // // // // // // // server/index.js
// // // // // // // // require("dotenv").config();
// // // // // // // // const express = require("express");
// // // // // // // // const cors = require("cors");
// // // // // // // // const mongoose = require("mongoose");
// // // // // // // // const path = require("path");
// // // // // // // // const cron = require("node-cron");
// // // // // // // // const fetch = (...args) => import("node-fetch").then(({ default: fetch }) => fetch(...args));


// // // // // // // // // Jobs
// // // // // // // // const { resetDuePeriods } = require("./utils/jobs/resetPeriods");
// // // // // // // // const { updateSubscriptionStatuses } = require("./utils/jobs/subscriptionStatusCron");

// // // // // // // // // Routes
// // // // // // // // const authRoutes = require("./routes/authRoutes");
// // // // // // // // const quotaRoutes = require("./routes/quotaRoute");
// // // // // // // // const smartgenRoutes = require("./routes/smartgenRoutes");
// // // // // // // // const savedCollectionRoutes = require("./routes/savedCollectionRoutes");
// // // // // // // // const categoryRoutes = require("./routes/categoryRoutes");
// // // // // // // // const promptRoutes = require("./routes/promptRoutes");
// // // // // // // // const orgMembers = require("./routes/orgMembers");
// // // // // // // // const purchaseRoutes = require("./routes/purchaseRoutes");
// // // // // // // // const llmProviderRoutes = require("./routes/llmproviderRoutes");
// // // // // // // // const promptoptimizerRoutes = require("./routes/promptoptimizerRoutes");
// // // // // // // // const promptreportRoutes = require("./routes/promptreportRoutes");
// // // // // // // // const bankAccountRoutes = require("./routes/bankAccounts");
// // // // // // // // const billingOrders = require("./routes/billingOrders");
// // // // // // // // const billingVerify = require("./routes/billingVerify");
// // // // // // // // const billingHistory = require("./routes/billingHistory");
// // // // // // // // const feedbackRoutes = require("./routes/feedback");
// // // // // // // // const cartRoute = require("./routes/cartRoute");
// // // // // // // // const promptCollab = require("./routes/promptCollab");
// // // // // // // // const pricingRoutes = require("./routes/pricing");

// // // // // // // // const app = express();
// // // // // // // // app.use(cors({
// // // // // // // //   origin: "http://localhost:5173",
// // // // // // // //   credentials: true,
// // // // // // // // }));
// // // // // // // // app.use(express.json());
// // // // // // // // app.use(express.urlencoded({ extended: true }));

// // // // // // // // // ✅ Proxy route for LLM optimization
// // // // // // // // // ✅ Proxy route for LLM optimization — Final Version
// // // // // // // // app.post("/api/optimize", async (req, res) => {
// // // // // // // //   const { text, model = "gpt-4o-mini", temperature = 0.2, mode = "optimize" } = req.body;

// // // // // // // //   if (!text || text.trim() === "") {
// // // // // // // //     return res.status(400).json({ error: "Missing 'text' field" });
// // // // // // // //   }
// // // // // // // //   if (!process.env.OPENAI_API_KEY) {
// // // // // // // //     return res.status(500).json({ error: "Server misconfigured: missing OPENAI_API_KEY" });
// // // // // // // //   }

// // // // // // // //   console.log(`📩 Optimize request (${mode}) for:`, text.slice(0, 60));

// // // // // // // //   let systemPrompt = "";
// // // // // // // //   if (mode === "detailed") {
// // // // // // // //     systemPrompt = `
// // // // // // // //       You are an expert prompt engineer.
// // // // // // // //       Write a DETAILED, well-structured, professional prompt based on the user's topic.
// // // // // // // //       Return STRICT JSON ONLY:
// // // // // // // //       {"optimizedText": "detailed optimized prompt","suggestions":["alt1","alt2","alt3","alt4"]}

// // // // // // // //       - 'optimizedText' should be a full, detailed prompt (150–300 words) with context, style, and structure.
// // // // // // // //       - 'suggestions' should contain 4 strong alternative prompt phrasings.
// // // // // // // //       - Do NOT include markdown code fences or explanations.
// // // // // // // //     `;
// // // // // // // //   } else {
// // // // // // // //     systemPrompt = `
// // // // // // // //       You are an expert prompt optimizer.
// // // // // // // //       Return STRICT JSON ONLY:
// // // // // // // //       {"optimizedText": "optimized short version","suggestions":["alt1","alt2","alt3","alt4"]}

// // // // // // // //       - optimizedText: improved, shorter version of the user's prompt
// // // // // // // //       - suggestions: 4 alternative versions with different styles
// // // // // // // //       - NO markdown, code fences, or explanations
// // // // // // // //     `;
// // // // // // // //   }

// // // // // // // //   try {
// // // // // // // //     const response = await fetch("https://api.openai.com/v1/chat/completions", {
// // // // // // // //       method: "POST",
// // // // // // // //       headers: {
// // // // // // // //         "Content-Type": "application/json",
// // // // // // // //         Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
// // // // // // // //       },
// // // // // // // //       body: JSON.stringify({
// // // // // // // //         model,
// // // // // // // //         temperature,
// // // // // // // //         max_tokens: 800,
// // // // // // // //         messages: [
// // // // // // // //           { role: "system", content: systemPrompt },
// // // // // // // //           { role: "user", content: text },
// // // // // // // //         ],
// // // // // // // //         response_format: { type: "json_object" },
// // // // // // // //       }),
// // // // // // // //     });

// // // // // // // //     const data = await response.json();

// // // // // // // //     if (!response.ok) {
// // // // // // // //       console.error("❌ OpenAI API Error:", data);
// // // // // // // //       return res.status(response.status).json({ error: data?.error?.message || "OpenAI error" });
// // // // // // // //     }

// // // // // // // //     const content = data?.choices?.[0]?.message?.content;
// // // // // // // //     if (!content || !content.trim()) {
// // // // // // // //       return res.status(502).json({ error: "Model returned empty content" });
// // // // // // // //     }

// // // // // // // //     return res.json(data);
// // // // // // // //   } catch (err) {
// // // // // // // //     console.error("🔥 Optimize route failed:", err);
// // // // // // // //     return res.status(500).json({ error: "Failed to contact OpenAI" });
// // // // // // // //   }
// // // // // // // // });



// // // // // // // // // Health check
// // // // // // // // app.get("/health", (_req, res) => res.json({ ok: true }));
// // // // // // // // app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// // // // // // // // // API routes
// // // // // // // // app.use("/api/auth", authRoutes);
// // // // // // // // app.use("/api/org/members", orgMembers);
// // // // // // // // app.use("/api/quota", quotaRoutes);
// // // // // // // // app.use("/api/smartgen", smartgenRoutes);
// // // // // // // // app.use("/api/saved-collections", savedCollectionRoutes);
// // // // // // // // app.use("/api/category", categoryRoutes);
// // // // // // // // app.use("/api/prompt", promptRoutes);
// // // // // // // // app.use("/api/purchase", purchaseRoutes);
// // // // // // // // app.use("/api/llm-provider", llmProviderRoutes);
// // // // // // // // app.use("/api/promptoptimizer", promptoptimizerRoutes);
// // // // // // // // app.use("/api/promptreport", promptreportRoutes);
// // // // // // // // app.use("/api/bankaccount", bankAccountRoutes);
// // // // // // // // app.use("/api/routes/pricing", pricingRoutes);
// // // // // // // // app.use("/api/plans/subscribe/order", billingOrders);
// // // // // // // // app.use("/api/plans/subscribe/verify", billingVerify);
// // // // // // // // app.use("/api/plans/subscribe/history", billingHistory);
// // // // // // // // app.use("/api/feedback", feedbackRoutes);
// // // // // // // // app.use("/api/cart", cartRoute);
// // // // // // // // app.use("/api/prompt-collab", promptCollab);

// // // // // // // // app.get("/", (req, res) => {
// // // // // // // //   res.sendFile(path.join(__dirname, "sample.html"));
// // // // // // // // });

// // // // // // // // // ✅ Crons
// // // // // // // // cron.schedule("5 * * * *", async () => {
// // // // // // // //   try {
// // // // // // // //     await resetDuePeriods();
// // // // // // // //   } catch (e) {
// // // // // // // //     console.error("resetDuePeriods failed", e);
// // // // // // // //   }
// // // // // // // // });

// // // // // // // // cron.schedule("* * * * *", async () => {
// // // // // // // //   try {
// // // // // // // //     await updateSubscriptionStatuses();
// // // // // // // //   } catch (e) {
// // // // // // // //     console.error("status cron failed", e);
// // // // // // // //   }
// // // // // // // // });

// // // // // // // // // ✅ DB + server
// // // // // // // // const PORT = process.env.PORT || 5000;
// // // // // // // // const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;

// // // // // // // // if (!MONGO_URI) {
// // // // // // // //   console.error("❌ Missing MONGO_URI / MONGODB_URI in .env");
// // // // // // // //   process.exit(1);
// // // // // // // // }

// // // // // // // // mongoose
// // // // // // // //   .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true, ssl: true })
// // // // // // // //   .then(() => {
// // // // // // // //     console.log("✅ MongoDB connected");
// // // // // // // //     app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
// // // // // // // //   })
// // // // // // // //   .catch((err) => {
// // // // // // // //     console.error("❌ MongoDB connection failed:", err);
// // // // // // // //     process.exit(1);
// // // // // // // //   });

// // // // // // // // console.log("daily quota reset");


// // // // // // // // server/index.js
// // // // // // // require("dotenv").config();
// // // // // // // const express = require("express");
// // // // // // // const cors = require("cors");
// // // // // // // const mongoose = require("mongoose");
// // // // // // // const path = require("path");
// // // // // // // const cron = require("node-cron");
// // // // // // // const fetch = (...args) => import("node-fetch").then(({ default: fetch }) => fetch(...args));

// // // // // // // // Jobs
// // // // // // // const { resetDuePeriods } = require("./utils/jobs/resetPeriods");
// // // // // // // const { updateSubscriptionStatuses } = require("./utils/jobs/subscriptionStatusCron");

// // // // // // // // Routes
// // // // // // // const authRoutes = require("./routes/authRoutes");
// // // // // // // const quotaRoutes = require("./routes/quotaRoute");
// // // // // // // const smartgenRoutes = require("./routes/smartgenRoutes");
// // // // // // // const savedCollectionRoutes = require("./routes/savedCollectionRoutes");
// // // // // // // const categoryRoutes = require("./routes/categoryRoutes");
// // // // // // // const promptRoutes = require("./routes/promptRoutes");
// // // // // // // const orgMembers = require("./routes/orgMembers");
// // // // // // // const purchaseRoutes = require("./routes/purchaseRoutes");
// // // // // // // const llmProviderRoutes = require("./routes/llmproviderRoutes");
// // // // // // // const promptoptimizerRoutes = require("./routes/promptoptimizerRoutes");
// // // // // // // const promptreportRoutes = require("./routes/promptreportRoutes");
// // // // // // // const bankAccountRoutes = require("./routes/bankAccounts");
// // // // // // // const billingOrders = require("./routes/billingOrders");
// // // // // // // const billingVerify = require("./routes/billingVerify");
// // // // // // // const billingHistory = require("./routes/billingHistory");
// // // // // // // const feedbackRoutes = require("./routes/feedback");
// // // // // // // const cartRoute = require("./routes/cartRoute");
// // // // // // // const promptCollab = require("./routes/promptCollab");
// // // // // // // const pricingRoutes = require("./routes/pricing");

// // // // // // // const app = express();
// // // // // // // app.use(cors({
// // // // // // //   origin: "http://localhost:5173",
// // // // // // //   credentials: true,
// // // // // // // }));
// // // // // // // app.use(express.json());
// // // // // // // app.use(express.urlencoded({ extended: true }));

// // // // // // // // ✅ SmartGen LLM Optimization Route (with Self-Correction)
// // // // // // // // ✅ SmartGen LLM Optimization Route (Final Stable)

// // // // // // // // ✅ SmartGen Prompt Optimizer Route (Improved, Balanced & Meaning-Intact)

// // // // // // // // ✅ Ultra-smart Prompt Optimizer Route (short prompts stay short; long prompts refined)
// // // // // // // // ✅ Ultra-Smart Prompt Optimizer Route (Adaptive Short + Long Behavior with Trimmed AI Suggestions)
// // // // // // // app.post("/api/optimize", async (req, res) => {
// // // // // // //   const { text, model = "gpt-4o-mini", temperature = 0.2, mode = "optimize" } = req.body;

// // // // // // //   if (!text || !text.trim()) {
// // // // // // //     return res.status(400).json({ error: "Missing 'text' field" });
// // // // // // //   }
// // // // // // //   if (!process.env.OPENAI_API_KEY) {
// // // // // // //     return res.status(500).json({ error: "Server misconfigured: missing OPENAI_API_KEY" });
// // // // // // //   }

// // // // // // //   console.log(`📩 Optimize request (${mode}) for:`, text.slice(0, 60));

// // // // // // //   const wordCount = text.trim().split(/\s+/).length;

// // // // // // //   const systemPrompt =
// // // // // // //     mode === "detailed"
// // // // // // //       ? `
// // // // // // // You are SmartGen — an expert multi-domain prompt engineer.
// // // // // // // Your job is to reframe the user's request into a professional **AI instruction prompt**, not execute it.

// // // // // // // 🎯 GOAL:
// // // // // // // - Begin with a role statement like "You are..." or "Act as..."
// // // // // // // - Describe context, tone, and output format.
// // // // // // // - Produce 300–500 words total.
// // // // // // // - NEVER output the final answer.

// // // // // // // Return STRICT JSON ONLY:
// // // // // // // {
// // // // // // //   "optimizedText": "the AI prompt (300–500 words)",
// // // // // // //   "suggestions": ["alt1","alt2","alt3","alt4"]
// // // // // // // }`
// // // // // // //       : wordCount < 20
// // // // // // //       ? `
// // // // // // // You are an advanced AI prompt optimizer that specializes in **short commands or questions** (under 20 words).

// // // // // // // Your job is to make the short input sound **sharp, minimal, and AI-ready** — just like a perfect query or instruction.

// // // // // // // 🎯 RULES:
// // // // // // // - Keep it **under 10 words** whenever possible.
// // // // // // // - Do **NOT** use words like "give", "tell", "please", "like", "can you", "could you".
// // // // // // // - Keep the same meaning.
// // // // // // // - Prefer **question** or **command** phrasing.
// // // // // // // - Ensure correct grammar and capitalization.
// // // // // // // - Avoid extra politeness or redundant words.
// // // // // // // - Do NOT expand it; make it **concise and natural**.
// // // // // // // - Keep tone neutral and professional.

// // // // // // // Return STRICT JSON ONLY:
// // // // // // // {
// // // // // // //   "optimizedText": "Short, polished version (≤10 words, no give/tell/please/like)",
// // // // // // //   "suggestions": [
// // // // // // //     "Alternate short version 1 (≤10 words, crisp and natural)",
// // // // // // //     "Alternate short version 2 (≤10 words, human and direct)",
// // // // // // //     "Alternate short version 3 (≤10 words, AI-friendly phrasing)"
// // // // // // //   ]
// // // // // // // }`// ✅ Long Prompt Optimization (distinct, polished suggestions)
// // // // // // // : `
// // // // // // // You are an advanced AI prompt optimizer.

// // // // // // // Your task is to rewrite long text prompts to make them **clearer, smoother, and more professional**, while preserving **all facts and meaning**.

// // // // // // // 🎯 RULES:
// // // // // // // - Preserve every important detail, fact, and name.
// // // // // // // - Enhance flow, clarity, and sentence rhythm.
// // // // // // // - Keep the rewritten version **around 70–80%** of the original token length.
// // // // // // // - Maintain a natural, elegant, and professional tone.
// // // // // // // - Avoid repetitive structures or excessive elaboration.
// // // // // // // - Suggestions must be **3 unique, polished rewrites** — not identical rephrasings.
// // // // // // // - Each suggestion should have a **distinct writing tone**:
// // // // // // //   1. Historical & balanced  
// // // // // // //   2. Elegant & expressive  
// // // // // // //   3. Concise & commanding
// // // // // // // - All suggestions must be **approximately equal in length** to the optimized text (±10%).

// // // // // // // Return STRICT JSON ONLY:
// // // // // // // {
// // // // // // //   "optimizedText": "The refined, improved version (~70–80% of original length, all meaning intact)",
// // // // // // //   "suggestions": [
// // // // // // //     "Full alternate rewrite 1 (historical & balanced)",
// // // // // // //     "Full alternate rewrite 2 (elegant & expressive)",
// // // // // // //     "Full alternate rewrite 3 (concise & commanding)"
// // // // // // //   ]
// // // // // // // }`

// // // // // // //  ;

// // // // // // //   try {
// // // // // // //     const response = await fetch("https://api.openai.com/v1/chat/completions", {
// // // // // // //       method: "POST",
// // // // // // //       headers: {
// // // // // // //         "Content-Type": "application/json",
// // // // // // //         Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
// // // // // // //       },
// // // // // // //       body: JSON.stringify({
// // // // // // //         model,
// // // // // // //         temperature,
// // // // // // //         max_tokens: 1500,
// // // // // // //         messages: [
// // // // // // //           { role: "system", content: systemPrompt },
// // // // // // //           { role: "user", content: text },
// // // // // // //         ],
// // // // // // //         response_format: { type: "json_object" },
// // // // // // //       }),
// // // // // // //     });

// // // // // // //     const data = await response.json();
// // // // // // //     if (!response.ok) {
// // // // // // //       console.error("❌ OpenAI API Error:", data);
// // // // // // //       return res.status(response.status).json({ error: data?.error?.message || "OpenAI error" });
// // // // // // //     }

// // // // // // //     const content = data?.choices?.[0]?.message?.content?.trim?.() || "";
// // // // // // //     if (!content) {
// // // // // // //       console.error("⚠️ Empty response from model:", data);
// // // // // // //       return res.status(502).json({
// // // // // // //         error: "Empty content from model",
// // // // // // //         fallback: { optimizedText: text, suggestions: [] },
// // // // // // //       });
// // // // // // //     }

// // // // // // //     let parsed;
// // // // // // //     try {
// // // // // // //       parsed = JSON.parse(content);
// // // // // // //     } catch {
// // // // // // //       console.warn("⚠️ Invalid JSON returned. Wrapping raw content.");
// // // // // // //       parsed = { optimizedText: content, suggestions: [] };
// // // // // // //     }

// // // // // // //     const looksLikeExecution =
// // // // // // //       /(?:^|\b)(develop|create|design|write|generate|explain|plan|summarize|conduct)\b/i.test(
// // // // // // //         parsed?.optimizedText || ""
// // // // // // //       ) &&
// // // // // // //       !parsed?.optimizedText?.toLowerCase().includes("you are") &&
// // // // // // //       !parsed?.optimizedText?.toLowerCase().includes("act as");

// // // // // // //     if (looksLikeExecution) {
// // // // // // //       console.log("🔁 Model produced an answer instead of a prompt → retrying...");
// // // // // // //       const retryPrompt = `
// // // // // // // You mistakenly wrote a final answer instead of an optimized prompt.
// // // // // // // Rewrite it as a professional prompt instruction.
// // // // // // // Keep same length and tone.
// // // // // // // Return JSON ONLY:
// // // // // // // {"optimizedText":"rewritten prompt","suggestions":["alt1","alt2","alt3","alt4"]}
// // // // // // // `;

// // // // // // //       const retryResponse = await fetch("https://api.openai.com/v1/chat/completions", {
// // // // // // //         method: "POST",
// // // // // // //         headers: {
// // // // // // //           "Content-Type": "application/json",
// // // // // // //           Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
// // // // // // //         },
// // // // // // //         body: JSON.stringify({
// // // // // // //           model,
// // // // // // //           temperature: 0.2,
// // // // // // //           max_tokens: 600,
// // // // // // //           messages: [
// // // // // // //             { role: "system", content: retryPrompt },
// // // // // // //             { role: "user", content: parsed?.optimizedText || content },
// // // // // // //           ],
// // // // // // //           response_format: { type: "json_object" },
// // // // // // //         }),
// // // // // // //       });

// // // // // // //       const retryData = await retryResponse.json();
// // // // // // //       const retryContent = retryData?.choices?.[0]?.message?.content?.trim?.() || "";

// // // // // // //       if (!retryContent) {
// // // // // // //         console.error("⚠️ Retry also returned empty content");
// // // // // // //         return res.status(502).json({
// // // // // // //           error: "Model retry failed",
// // // // // // //           fallback: parsed,
// // // // // // //         });
// // // // // // //       }

// // // // // // //       let retryParsed;
// // // // // // //       try {
// // // // // // //         retryParsed = JSON.parse(retryContent);
// // // // // // //       } catch {
// // // // // // //         retryParsed = { optimizedText: retryContent, suggestions: [] };
// // // // // // //       }

// // // // // // //       console.log("✅ Self-correction successful.");
// // // // // // //       return res.json(retryParsed);
// // // // // // //     }

// // // // // // //     return res.json(parsed);
// // // // // // //   } catch (err) {
// // // // // // //     console.error("🔥 Optimize route failed:", err);
// // // // // // //     return res.status(500).json({ error: "Failed to contact OpenAI" });
// // // // // // //   }
// // // // // // // });


// // // // // // // // Health check
// // // // // // // app.get("/health", (_req, res) => res.json({ ok: true }));
// // // // // // // app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// // // // // // // // API routes
// // // // // // // app.use("/api/auth", authRoutes);
// // // // // // // app.use("/api/org/members", orgMembers);
// // // // // // // app.use("/api/quota", quotaRoutes);
// // // // // // // app.use("/api/smartgen", smartgenRoutes);
// // // // // // // app.use("/api/saved-collections", savedCollectionRoutes);
// // // // // // // app.use("/api/category", categoryRoutes);
// // // // // // // app.use("/api/prompt", promptRoutes);
// // // // // // // app.use("/api/purchase", purchaseRoutes);
// // // // // // // app.use("/api/llm-provider", llmProviderRoutes);
// // // // // // // app.use("/api/promptoptimizer", promptoptimizerRoutes);
// // // // // // // app.use("/api/promptreport", promptreportRoutes);
// // // // // // // app.use("/api/bankaccount", bankAccountRoutes);
// // // // // // // app.use("/api/routes/pricing", pricingRoutes);
// // // // // // // app.use("/api/plans/subscribe/order", billingOrders);
// // // // // // // app.use("/api/plans/subscribe/verify", billingVerify);
// // // // // // // app.use("/api/plans/subscribe/history", billingHistory);
// // // // // // // app.use("/api/feedback", feedbackRoutes);
// // // // // // // app.use("/api/cart", cartRoute);
// // // // // // // app.use("/api/prompt-collab", promptCollab);

// // // // // // // app.get("/", (req, res) => {
// // // // // // //   res.sendFile(path.join(__dirname, "sample.html"));
// // // // // // // });

// // // // // // // // ✅ Crons
// // // // // // // cron.schedule("5 * * * *", async () => {
// // // // // // //   try {
// // // // // // //     await resetDuePeriods();
// // // // // // //   } catch (e) {
// // // // // // //     console.error("resetDuePeriods failed", e);
// // // // // // //   }
// // // // // // // });

// // // // // // // cron.schedule("* * * * *", async () => {
// // // // // // //   try {
// // // // // // //     await updateSubscriptionStatuses();
// // // // // // //   } catch (e) {
// // // // // // //     console.error("status cron failed", e);
// // // // // // //   }
// // // // // // // });

// // // // // // // // ✅ DB + Server
// // // // // // // const PORT = process.env.PORT || 5000;
// // // // // // // const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;

// // // // // // // if (!MONGO_URI) {
// // // // // // //   console.error("❌ Missing MONGO_URI / MONGODB_URI in .env");
// // // // // // //   process.exit(1);
// // // // // // // }

// // // // // // // mongoose
// // // // // // //   .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true, ssl: true })
// // // // // // //   .then(() => {
// // // // // // //     console.log("✅ MongoDB connected");
// // // // // // //     app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
// // // // // // //   })
// // // // // // //   .catch((err) => {
// // // // // // //     console.error("❌ MongoDB connection failed:", err);
// // // // // // //     process.exit(1);
// // // // // // //   });

// // // // // // // console.log("daily quota reset");

// // // // // // // server/index.js
// // // // // // require("dotenv").config();
// // // // // // const express = require("express");
// // // // // // const cors = require("cors");
// // // // // // const mongoose = require("mongoose");
// // // // // // const path = require("path");
// // // // // // const cron = require("node-cron");
// // // // // // const fetch = (...args) => import("node-fetch").then(({ default: fetch }) => fetch(...args));

// // // // // // // Jobs
// // // // // // const { resetDuePeriods } = require("./utils/jobs/resetPeriods");
// // // // // // const { updateSubscriptionStatuses } = require("./utils/jobs/subscriptionStatusCron");

// // // // // // // Routes
// // // // // // const authRoutes = require("./routes/authRoutes");
// // // // // // const quotaRoutes = require("./routes/quotaRoute");
// // // // // // const smartgenRoutes = require("./routes/smartgenRoutes");
// // // // // // const savedCollectionRoutes = require("./routes/savedCollectionRoutes");
// // // // // // const categoryRoutes = require("./routes/categoryRoutes");
// // // // // // const promptRoutes = require("./routes/promptRoutes");
// // // // // // const orgMembers = require("./routes/orgMembers");
// // // // // // const purchaseRoutes = require("./routes/purchaseRoutes");
// // // // // // const llmProviderRoutes = require("./routes/llmproviderRoutes");
// // // // // // const promptoptimizerRoutes = require("./routes/promptoptimizerRoutes");
// // // // // // const promptreportRoutes = require("./routes/promptreportRoutes");
// // // // // // const bankAccountRoutes = require("./routes/bankAccounts");
// // // // // // const billingOrders = require("./routes/billingOrders");
// // // // // // const billingVerify = require("./routes/billingVerify");
// // // // // // const billingHistory = require("./routes/billingHistory");
// // // // // // const feedbackRoutes = require("./routes/feedback");
// // // // // // const cartRoute = require("./routes/cartRoute");
// // // // // // const promptCollab = require("./routes/promptCollab");
// // // // // // const pricingRoutes = require("./routes/pricing");

// // // // // // const app = express();
// // // // // // app.use(cors({
// // // // // //   origin: "http://localhost:5173",
// // // // // //   credentials: true,
// // // // // // }));
// // // // // // app.use(express.json());
// // // // // // app.use(express.urlencoded({ extended: true }));

// // // // // // // ✅ SmartGen LLM Optimization Route (with Self-Correction)
// // // // // // // ✅ SmartGen LLM Optimization Route (Final Stable)
// // // // // // app.post("/api/optimize", async (req, res) => {
// // // // // //   const { text, model = "gpt-4o-mini", temperature = 0.2, mode = "optimize" } = req.body;

// // // // // //   if (!text || !text.trim()) {
// // // // // //     return res.status(400).json({ error: "Missing 'text' field" });
// // // // // //   }
// // // // // //   if (!process.env.OPENAI_API_KEY) {
// // // // // //     return res.status(500).json({ error: "Server misconfigured: missing OPENAI_API_KEY" });
// // // // // //   }

// // // // // //   console.log(`📩 Optimize request (${mode}) for:`, text.slice(0, 60));

// // // // // //   // 🧠 Select proper system prompt
// // // // // //   const systemPrompt =
// // // // // //     mode === "detailed"
// // // // // //       ? `
// // // // // // You are SmartGen — an expert multi-domain prompt engineer.
// // // // // // Your job is to reframe the user's request into a professional **AI instruction prompt**, not execute it.

// // // // // // 🎯 GOAL:
// // // // // // - Begin with a role statement like "You are..." or "Act as..."
// // // // // // - Describe context, tone, and output format.
// // // // // // - Produce 300-500 words total.
// // // // // // - NEVER output the final answer.

// // // // // // Return STRICT JSON ONLY:
// // // // // // {
// // // // // //   "optimizedText": "the AI prompt (300-500 words)",
// // // // // //   "suggestions": ["alt1","alt2","alt3","alt4"]
// // // // // // }`
// // // // // //       : `
// // // // // // You are a PROMPT OPTIMIZATION EXPERT. Your ONLY job is to IMPROVE the given text while PRESERVING its core content and meaning.

// // // // // // 🎯 UNIVERSAL INPUT HANDLING RULES:
// // // // // // - PRESERVE the original content, facts, and meaning exactly
// // // // // // - IMPROVE clarity, grammar, and structure
// // // // // // - REDUCE word count by 20-50% (not too short, not too long)
// // // // // // - NEVER change the core information or facts
// // // // // // - NEVER answer questions - just make the text better
// // // // // // - NEVER add new information not in the original

// // // // // // 🎯 INPUT TYPE DETECTION & STRATEGIES:

// // // // // // 🔹 FOR ALREADY-STRUCTURED PROMPTS (starts with "You are..." or "Act as..."):
// // // // // //    Input: "You are an education advocate tasked with promoting..."
// // // // // //    Output: "Act as an education advocate promoting equitable access to quality education worldwide. Discuss education's transformative impact and the need for collaboration to ensure every child learns essential future skills."
// // // // // //    → Keep the "You are/Act as" structure, just make more concise

// // // // // // 🔹 FOR DESCRIPTIVE/NARRATIVE TEXT:
// // // // // //    Input: "Education is one of the most powerful tools for personal transformation..."
// // // // // //    Output: "Education transforms individuals and society by building knowledge, skills, and values. It drives progress through innovation and critical thinking while teaching essential life skills. However, unequal access due to poverty limits opportunities for millions. Education must evolve to teach creativity and digital literacy for global challenges."
// // // // // //    → Condense while keeping all key points

// // // // // // 🔹 FOR QUESTIONS:
// // // // // //    Input: "what is your name?"
// // // // // //    Output: "What's your name?"

// // // // // // 🔹 FOR STORIES:
// // // // // //    Input: "One sunny morning, Riya decided to go for a walk..."
// // // // // //    Output: "One sunny morning, Riya walked in her local park. She rescued a trapped puppy, gave it water, and it followed her home."

// // // // // // 🔹 FOR INSTRUCTIONS/REQUESTS:
// // // // // //    Input: "You are a marketing strategist tasked with developing..."
// // // // // //    Output: "Develop a comprehensive marketing plan for a tech gadget targeting young professionals."

// // // // // // 🔹 FOR DIRECT REQUESTS:
// // // // // //    Input: "tell me the weather of pune"
// // // // // //    Output: "Current weather in Pune"

// // // // // // 🔹 FOR PERSONAL INFO:
// // // // // //    Input: "my name is xyz i wlive in pune i live also in mumbai..."
// // // // // //    Output: "I'm XYZ from Pune and Mumbai. I enjoy cooking and cricket."

// // // // // // 🔹 FOR UNCATEGORIZED/UNKNOWN INPUTS (DEFAULT STRATEGY):
// // // // // //    Input: "Quantum computing uses qubits to process information..."
// // // // // //    Output: "Quantum computing processes information using qubits..."
// // // // // //    → Apply general optimization: preserve meaning, improve clarity, reduce length by 20-50%
   
// // // // // //    Input: "The recipe requires flour, sugar, eggs, and butter..."
// // // // // //    Output: "Recipe ingredients: flour, sugar, eggs, butter..."
// // // // // //    → Keep all essential elements, make concise
   
// // // // // //    Input: "To install the software, first download the package..."
// // // // // //    Output: "Install software by downloading the package..."
// // // // // //    → Maintain step-by-step logic but more direct

// // // // // // 🎯 DEFAULT OPTIMIZATION RULES FOR ANY INPUT:
// // // // // // 1. PRESERVE all key information and meaning
// // // // // // 2. IMPROVE sentence structure and flow
// // // // // // 3. REMOVE redundant words and phrases
// // // // // // 4. COMBINE related ideas into concise statements
// // // // // // 5. MAINTAIN the original intent and tone
// // // // // // 6. ENSURE natural readability

// // // // // // 🎯 TOKEN REDUCTION GOALS:
// // // // // // - Remove unnecessary words but keep essential meaning
// // // // // // - Use contractions where natural
// // // // // // - Combine short related sentences
// // // // // // - Remove filler words but keep core content
// // // // // // - Maintain natural, conversational tone

// // // // // // 🎯 SUGGESTIONS REQUIREMENTS:
// // // // // // - Provide 3 ALTERNATIVE optimized versions
// // // // // // - Each should preserve the same core content
// // // // // // - All should be 20-50% shorter than original
// // // // // // - Suggestions should be COMPREHENSIVE (not too short)
// // // // // // - Maintain readability and natural flow
// // // // // // - For prompts: keep the "You are/Act as" structure
// // // // // // - For narratives: maintain all key information points
// // // // // // - Ensure suggestions are similar in length and detail to main optimizedText

// // // // // // Return STRICT JSON ONLY:
// // // // // // {
// // // // // //   "optimizedText": "the optimized version with preserved content",
// // // // // //   "suggestions": [
// // // // // //     "comprehensive alternative optimized version 1 with similar length and detail",
// // // // // //     "comprehensive alternative optimized version 2 with similar length and detail", 
// // // // // //     "comprehensive alternative optimized version 3 with similar length and detail"
// // // // // //   ]
// // // // // // }`;

// // // // // //   try {
// // // // // //     const response = await fetch("https://api.openai.com/v1/chat/completions", {
// // // // // //       method: "POST",
// // // // // //       headers: {
// // // // // //         "Content-Type": "application/json",
// // // // // //         Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
// // // // // //       },
// // // // // //       body: JSON.stringify({
// // // // // //         model,
// // // // // //         temperature,
// // // // // //         max_tokens: 1200,
// // // // // //         messages: [
// // // // // //           { role: "system", content: systemPrompt },
// // // // // //           { role: "user", content: text },
// // // // // //         ],
// // // // // //         response_format: { type: "json_object" },
// // // // // //       }),
// // // // // //     });

// // // // // //     const data = await response.json();
// // // // // //     if (!response.ok) {
// // // // // //       console.error("❌ OpenAI API Error:", data);
// // // // // //       return res.status(response.status).json({ error: data?.error?.message || "OpenAI error" });
// // // // // //     }

// // // // // //     const content = data?.choices?.[0]?.message?.content?.trim?.() || "";

// // // // // //     if (!content) {
// // // // // //       console.error("⚠️ Empty response from model:", data);
// // // // // //       return res.status(502).json({
// // // // // //         error: "Empty content from model",
// // // // // //         fallback: { optimizedText: text, suggestions: [] },
// // // // // //       });
// // // // // //     }

// // // // // //     let parsed;
// // // // // //     try {
// // // // // //       parsed = JSON.parse(content);
// // // // // //     } catch {
// // // // // //       console.warn("⚠️ Invalid JSON returned. Wrapping raw content.");
// // // // // //       parsed = { optimizedText: content, suggestions: [] };
// // // // // //     }

// // // // // //     // 🔍 Post-process to ensure suggestions are proper length and format
// // // // // //     if (parsed.suggestions && Array.isArray(parsed.suggestions)) {
// // // // // //       parsed.suggestions = parsed.suggestions.map(suggestion => {
// // // // // //         // If suggestion is too short, enhance it
// // // // // //         const mainLength = parsed.optimizedText.length;
// // // // // //         if (suggestion.length < mainLength * 0.3) {
// // // // // //           // For already-structured prompts, ensure they maintain the prompt format
// // // // // //           if (text.toLowerCase().includes("you are") || text.toLowerCase().includes("act as")) {
// // // // // //             if (!suggestion.toLowerCase().includes("you are") && !suggestion.toLowerCase().includes("act as")) {
// // // // // //               return `Act as ${suggestion}`;
// // // // // //             }
// // // // // //           }
// // // // // //           // Add context to make it more comprehensive
// // // // // //           return suggestion + " - Comprehensive approach with detailed coverage";
// // // // // //         }
// // // // // //         return suggestion;
// // // // // //       });
      
// // // // // //       // Ensure we have exactly 3 suggestions
// // // // // //       while (parsed.suggestions.length < 3) {
// // // // // //         const baseSuggestion = parsed.optimizedText;
// // // // // //         const alternatives = [
// // // // // //           "Alternative approach focusing on key elements",
// // // // // //           "Streamlined version maintaining core content", 
// // // // // //           "Concise reformulation preserving original meaning"
// // // // // //         ];
// // // // // //         parsed.suggestions.push(`${baseSuggestion} - ${alternatives[parsed.suggestions.length]}`);
// // // // // //       }
      
// // // // // //       // Remove duplicates
// // // // // //       parsed.suggestions = [...new Set(parsed.suggestions)];
// // // // // //     }

// // // // // //     // 🔍 Detect if it mistakenly generated an answer (not a prompt) - only for detailed mode
// // // // // //     if (mode === "detailed") {
// // // // // //       const looksLikeExecution =
// // // // // //         /(?:^|\b)(develop|create|design|write|generate|explain|plan|analyze|summarize|conduct)\b/i.test(
// // // // // //           parsed?.optimizedText || ""
// // // // // //         ) &&
// // // // // //         !parsed?.optimizedText?.toLowerCase().includes("you are") &&
// // // // // //         !parsed?.optimizedText?.toLowerCase().includes("act as");

// // // // // //       // 🔁 Self-correction step for detailed mode only
// // // // // //       if (looksLikeExecution) {
// // // // // //         console.log("🔁 Model produced an answer instead of a prompt → retrying...");

// // // // // //         const retryPrompt = `
// // // // // // You mistakenly created a *final answer* instead of an *AI instruction prompt*.
// // // // // // Rewrite it into a single instruction starting with "You are..." or "Act as...".
// // // // // // Ensure suggestions are comprehensive and similar in length.

// // // // // // Return JSON ONLY:
// // // // // // {
// // // // // //   "optimizedText": "rewritten prompt",
// // // // // //   "suggestions": [
// // // // // //     "comprehensive alternative version 1 with similar length",
// // // // // //     "comprehensive alternative version 2 with similar length",
// // // // // //     "comprehensive alternative version 3 with similar length",
// // // // // //     "comprehensive alternative version 4 with similar length"
// // // // // //   ]
// // // // // // }`;

// // // // // //         const retryResponse = await fetch("https://api.openai.com/v1/chat/completions", {
// // // // // //           method: "POST",
// // // // // //           headers: {
// // // // // //             "Content-Type": "application/json",
// // // // // //             Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
// // // // // //           },
// // // // // //           body: JSON.stringify({
// // // // // //             model,
// // // // // //             temperature: 0.2,
// // // // // //             max_tokens: 500,
// // // // // //             messages: [
// // // // // //               { role: "system", content: retryPrompt },
// // // // // //               { role: "user", content: parsed?.optimizedText || content },
// // // // // //             ],
// // // // // //             response_format: { type: "json_object" },
// // // // // //           }),
// // // // // //         });

// // // // // //         const retryData = await retryResponse.json();
// // // // // //         const retryContent = retryData?.choices?.[0]?.message?.content?.trim?.() || "";

// // // // // //         if (!retryContent) {
// // // // // //           console.error("⚠️ Retry also returned empty content");
// // // // // //           return res.status(502).json({
// // // // // //             error: "Model retry failed",
// // // // // //             fallback: parsed,
// // // // // //           });
// // // // // //         }

// // // // // //         let retryParsed;
// // // // // //         try {
// // // // // //           retryParsed = JSON.parse(retryContent);
// // // // // //         } catch {
// // // // // //           retryParsed = { optimizedText: retryContent, suggestions: [] };
// // // // // //         }

// // // // // //         console.log("✅ Self-correction successful.");
// // // // // //         return res.json(retryParsed);
// // // // // //       }
// // // // // //     }

// // // // // //     console.log("✅ Optimization successful. Suggestions:", parsed.suggestions?.length || 0);
// // // // // //     return res.json(parsed);
// // // // // //   } catch (err) {
// // // // // //     console.error("🔥 Optimize route failed:", err);
// // // // // //     return res.status(500).json({ error: "Failed to contact OpenAI" });
// // // // // //   }
// // // // // // });

// // // // // // // Health check
// // // // // // app.get("/health", (_req, res) => res.json({ ok: true }));
// // // // // // app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// // // // // // // API routes
// // // // // // app.use("/api/auth", authRoutes);
// // // // // // app.use("/api/org/members", orgMembers);
// // // // // // app.use("/api/quota", quotaRoutes);
// // // // // // app.use("/api/smartgen", smartgenRoutes);
// // // // // // app.use("/api/saved-collections", savedCollectionRoutes);
// // // // // // app.use("/api/category", categoryRoutes);
// // // // // // app.use("/api/prompt", promptRoutes);
// // // // // // app.use("/api/purchase", purchaseRoutes);
// // // // // // app.use("/api/llm-provider", llmProviderRoutes);
// // // // // // app.use("/api/promptoptimizer", promptoptimizerRoutes);
// // // // // // app.use("/api/promptreport", promptreportRoutes);
// // // // // // app.use("/api/bankaccount", bankAccountRoutes);
// // // // // // app.use("/api/routes/pricing", pricingRoutes);
// // // // // // app.use("/api/plans/subscribe/order", billingOrders);
// // // // // // app.use("/api/plans/subscribe/verify", billingVerify);
// // // // // // app.use("/api/plans/subscribe/history", billingHistory);
// // // // // // app.use("/api/feedback", feedbackRoutes);
// // // // // // app.use("/api/cart", cartRoute);
// // // // // // app.use("/api/prompt-collab", promptCollab);

// // // // // // app.get("/", (req, res) => {
// // // // // //   res.sendFile(path.join(__dirname, "sample.html"));
// // // // // // });

// // // // // // // ✅ Crons
// // // // // // cron.schedule("5 * * * *", async () => {
// // // // // //   try {
// // // // // //     await resetDuePeriods();
// // // // // //   } catch (e) {
// // // // // //     console.error("resetDuePeriods failed", e);
// // // // // //   }
// // // // // // });

// // // // // // cron.schedule("* * * * *", async () => {
// // // // // //   try {
// // // // // //     await updateSubscriptionStatuses();
// // // // // //   } catch (e) {
// // // // // //     console.error("status cron failed", e);
// // // // // //   }
// // // // // // });

// // // // // // // ✅ DB + Server
// // // // // // const PORT = process.env.PORT || 5000;
// // // // // // const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;

// // // // // // if (!MONGO_URI) {
// // // // // //   console.error("❌ Missing MONGO_URI / MONGODB_URI in .env");
// // // // // //   process.exit(1);
// // // // // // }

// // // // // // mongoose
// // // // // //   .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true, ssl: true })
// // // // // //   .then(() => {
// // // // // //     console.log("✅ MongoDB connected");
// // // // // //     app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
// // // // // //   })
// // // // // //   .catch((err) => {
// // // // // //     console.error("❌ MongoDB connection failed:", err);
// // // // // //     process.exit(1);
// // // // // //   });

// // // // // // console.log("daily quota reset");


// // // // // // server/index.js
// // // // // require("dotenv").config();
// // // // // const express = require("express");
// // // // // const cors = require("cors");
// // // // // const mongoose = require("mongoose");
// // // // // const path = require("path");
// // // // // const cron = require("node-cron");
// // // // // const fetch = (...args) => import("node-fetch").then(({ default: fetch }) => fetch(...args));

// // // // // // Jobs
// // // // // const { resetDuePeriods } = require("./utils/jobs/resetPeriods");
// // // // // const { updateSubscriptionStatuses } = require("./utils/jobs/subscriptionStatusCron");

// // // // // // Routes
// // // // // const authRoutes = require("./routes/authRoutes");
// // // // // const quotaRoutes = require("./routes/quotaRoute");
// // // // // const smartgenRoutes = require("./routes/smartgenRoutes");
// // // // // const savedCollectionRoutes = require("./routes/savedCollectionRoutes");
// // // // // const categoryRoutes = require("./routes/categoryRoutes");
// // // // // const promptRoutes = require("./routes/promptRoutes");
// // // // // const orgMembers = require("./routes/orgMembers");
// // // // // const purchaseRoutes = require("./routes/purchaseRoutes");
// // // // // const llmProviderRoutes = require("./routes/llmproviderRoutes");
// // // // // const promptoptimizerRoutes = require("./routes/promptoptimizerRoutes");
// // // // // const promptreportRoutes = require("./routes/promptreportRoutes");
// // // // // const bankAccountRoutes = require("./routes/bankAccounts");
// // // // // const billingOrders = require("./routes/billingOrders");
// // // // // const billingVerify = require("./routes/billingVerify");
// // // // // const billingHistory = require("./routes/billingHistory");
// // // // // const feedbackRoutes = require("./routes/feedback");
// // // // // const cartRoute = require("./routes/cartRoute");
// // // // // const promptCollab = require("./routes/promptCollab");
// // // // // const pricingRoutes = require("./routes/pricing");

// // // // // const app = express();
// // // // // app.use(cors({
// // // // //   origin: "http://localhost:5173",
// // // // //   credentials: true,
// // // // // }));
// // // // // app.use(express.json());
// // // // // app.use(express.urlencoded({ extended: true }));

// // // // // // ✅ SmartGen LLM Optimization Route (with Self-Correction)
// // // // // // ✅ SmartGen LLM Optimization Route (Final Stable)
// // // // // app.post("/api/optimize", async (req, res) => {
// // // // //   const { text, model = "gpt-4o-mini", temperature = 0.2, mode = "optimize" } = req.body;

// // // // //   if (!text || !text.trim()) {
// // // // //     return res.status(400).json({ error: "Missing 'text' field" });
// // // // //   }
// // // // //   if (!process.env.OPENAI_API_KEY) {
// // // // //     return res.status(500).json({ error: "Server misconfigured: missing OPENAI_API_KEY" });
// // // // //   }

// // // // //   console.log(`📩 Optimize request (${mode}) for:`, text.slice(0, 60));

// // // // //   // 🧠 Select proper system prompt - SMARTGEN UNCHANGED, PROMPT OPTIMIZER IMPROVED
// // // // //   const systemPrompt =
// // // // //     mode === "detailed"
// // // // //       ? `
// // // // // You are SmartGen — an expert multi-domain prompt engineer.
// // // // // Your job is to reframe the user's request into a professional **AI instruction prompt**, not execute it.

// // // // // 🎯 GOAL:
// // // // // - Begin with a role statement like "You are..." or "Act as..."
// // // // // - Describe context, tone, and output format.
// // // // // - Produce 300-500 words total.
// // // // // - NEVER output the final answer.

// // // // // Return STRICT JSON ONLY:
// // // // // {
// // // // //   "optimizedText": "the AI prompt (300-500 words)",
// // // // //   "suggestions": ["alt1","alt2","alt3","alt4"]
// // // // // }`
// // // // //       : `
// // // // // You are an AGGRESSIVE TEXT OPTIMIZATION EXPERT. Your ONLY job is to MAXIMIZE token reduction while PERFECTLY PRESERVING core content and meaning.

// // // // // 🎯 AGGRESSIVE OPTIMIZATION RULES:
// // // // // - PRESERVE 100% of original meaning, facts, and context
// // // // // - REDUCE word count by 40-60% (much more aggressive)
// // // // // - REMOVE all redundant phrases and filler words
// // // // // - COMBINE multiple sentences into single, dense statements
// // // // // - USE maximum conciseness without losing meaning
// // // // // - REPLACE long phrases with shorter equivalents
// // // // // - MAINTAIN original tone and intent
// // // // // - NEVER add new information
// // // // // - NEVER change core facts or message

// // // // // 🎯 AGGRESSIVE TOKEN REDUCTION STRATEGIES:

// // // // // 🔹 ORIGINAL: "Technology has become an inseparable part of human life, transforming the way we live, work, and communicate."
// // // // // 🔹 OPTIMIZED: "Technology is integral to human life, transforming how we live, work, and communicate."
// // // // // → Removed "inseparable part of" → "integral to", "the way" → "how"

// // // // // 🔹 ORIGINAL: "From smartphones and computers to artificial intelligence and robotics, every aspect of modern society is influenced by technological innovation."
// // // // // 🔹 OPTIMIZED: "Smartphones to AI and robotics influence every aspect of modern society."
// // // // // → Removed "From... to" structure, combined concepts

// // // // // 🔹 ORIGINAL: "It has made communication faster, education more accessible, and healthcare more efficient."
// // // // // 🔹 OPTIMIZED: "It accelerates communication, improves education access, and enhances healthcare efficiency."
// // // // // → Active voice, removed "made", combined adjectives

// // // // // 🔹 ORIGINAL: "For instance, digital learning platforms allow students from remote areas to access quality education, while medical technologies help doctors diagnose and treat patients with greater accuracy."
// // // // // 🔹 OPTIMIZED: "Digital learning platforms provide remote students quality education; medical tech improves diagnostic accuracy."
// // // // // → Removed "For instance", combined with semicolon, removed "help doctors", simplified structure

// // // // // 🔹 ORIGINAL: "In the business world, automation and data analysis have improved productivity and decision-making."
// // // // // 🔹 OPTIMIZED: "Business automation and data analysis boost productivity and decisions."
// // // // // → Removed "In the... world", "have improved" → "boost", shortened "decision-making"

// // // // // 🔹 ORIGINAL: "However, the rapid growth of technology also brings challenges such as unemployment due to automation, loss of privacy, and overdependence on machines."
// // // // // 🔹 OPTIMIZED: "But rapid tech growth brings challenges: automation unemployment, privacy loss, and machine overreliance."
// // // // // → "However" → "But", removed "also", "such as" → ":", simplified phrases

// // // // // 🔹 ORIGINAL: "Moreover, excessive use of gadgets can lead to social isolation and health issues."
// // // // // 🔹 OPTIMIZED: "Excessive gadget use causes social isolation and health issues."
// // // // // → "Moreover" → implied, "can lead to" → "causes"

// // // // // 🔹 ORIGINAL: "Therefore, it is essential to use technology wisely and responsibly."
// // // // // 🔹 OPTIMIZED: "Use technology wisely and responsibly."
// // // // // → Removed "Therefore, it is essential to" as implied

// // // // // 🔹 ORIGINAL: "When balanced with human values and ethics, technology can serve as a powerful force for progress, helping society achieve comfort, convenience, and sustainable development without losing its sense of humanity."
// // // // // 🔹 OPTIMIZED: "Balanced with human values, technology drives progress toward comfort, convenience, and sustainable development while preserving humanity."
// // // // // → Removed "serve as a powerful force for", "helping society achieve" → "toward", simplified ending

// // // // // 🎯 AGGRESSIVE OPTIMIZATION TECHNIQUES:
// // // // // 1. ELIMINATE obvious statements and filler words
// // // // // 2. COMBINE related ideas into single powerful sentences
// // // // // 3. REPLACE passive voice with active voice
// // // // // 4. USE stronger, more concise verbs
// // // // // 5. REMOVE redundant adjectives and adverbs
// // // // // 6. SIMPLIFY complex sentence structures
// // // // // 7. MERGE multiple examples into unified statements
// // // // // 8. CUT introductory phrases that don't add value

// // // // // 🎯 TOKEN REDUCTION TARGETS:
// // // // // - Short paragraphs (50-100 words): 50-60% reduction
// // // // // - Medium paragraphs (100-200 words): 45-55% reduction  
// // // // // - Long paragraphs (200+ words): 40-50% reduction
// // // // // - Always preserve 100% of core meaning and facts

// // // // // 🎯 SUGGESTIONS REQUIREMENTS:
// // // // // - Provide 3 HIGHLY OPTIMIZED alternative versions
// // // // // - Each should be 40-60% shorter than original
// // // // // - All must preserve identical core content
// // // // // - Use different sentence structures and phrasing
// // // // // - Maintain readability despite high compression
// // // // // - Ensure similar reduction ratios across all versions

// // // // // Return STRICT JSON ONLY:
// // // // // {
// // // // //   "optimizedText": "the aggressively optimized version with maximum token reduction",
// // // // //   "suggestions": [
// // // // //     "highly compressed alternative version 1 with same meaning",
// // // // //     "highly compressed alternative version 2 with same meaning", 
// // // // //     "highly compressed alternative version 3 with same meaning"
// // // // //   ]
// // // // // }`;

// // // // //   try {
// // // // //     const response = await fetch("https://api.openai.com/v1/chat/completions", {
// // // // //       method: "POST",
// // // // //       headers: {
// // // // //         "Content-Type": "application/json",
// // // // //         Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
// // // // //       },
// // // // //       body: JSON.stringify({
// // // // //         model,
// // // // //         temperature,
// // // // //         max_tokens: 1200,
// // // // //         messages: [
// // // // //           { role: "system", content: systemPrompt },
// // // // //           { role: "user", content: text },
// // // // //         ],
// // // // //         response_format: { type: "json_object" },
// // // // //       }),
// // // // //     });

// // // // //     const data = await response.json();
// // // // //     if (!response.ok) {
// // // // //       console.error("❌ OpenAI API Error:", data);
// // // // //       return res.status(response.status).json({ error: data?.error?.message || "OpenAI error" });
// // // // //     }

// // // // //     const content = data?.choices?.[0]?.message?.content?.trim?.() || "";

// // // // //     if (!content) {
// // // // //       console.error("⚠️ Empty response from model:", data);
// // // // //       return res.status(502).json({
// // // // //         error: "Empty content from model",
// // // // //         fallback: { optimizedText: text, suggestions: [] },
// // // // //       });
// // // // //     }

// // // // //     let parsed;
// // // // //     try {
// // // // //       parsed = JSON.parse(content);
// // // // //     } catch {
// // // // //       console.warn("⚠️ Invalid JSON returned. Wrapping raw content.");
// // // // //       parsed = { optimizedText: content, suggestions: [] };
// // // // //     }

// // // // //     // 🔍 Calculate and log token reduction for OPTIMIZE mode only
// // // // //     if (mode === "optimize") {
// // // // //       const originalWords = text.split(/\s+/).length;
// // // // //       const optimizedWords = parsed.optimizedText.split(/\s+/).length;
// // // // //       const reduction = Math.round(((originalWords - optimizedWords) / originalWords) * 100);
      
// // // // //       console.log(`✅ Optimization successful. Word reduction: ${originalWords} → ${optimizedWords} (${reduction}%)`);

// // // // //       // Add reduction metrics to response for OPTIMIZE mode only
// // // // //       parsed.metrics = {
// // // // //         originalWordCount: originalWords,
// // // // //         optimizedWordCount: optimizedWords,
// // // // //         reductionPercentage: reduction
// // // // //       };

// // // // //       // 🔍 Post-process to ensure suggestions are properly optimized for OPTIMIZE mode
// // // // //       if (parsed.suggestions && Array.isArray(parsed.suggestions)) {
// // // // //         parsed.suggestions = parsed.suggestions.map(suggestion => {
// // // // //           const suggestionWords = suggestion.split(/\s+/).length;
// // // // //           const suggestionReduction = Math.round(((originalWords - suggestionWords) / originalWords) * 100);
          
// // // // //           // If suggestion isn't aggressive enough, enhance it
// // // // //           if (suggestionReduction < 30) {
// // // // //             return suggestion + " [Further optimized]";
// // // // //           }
// // // // //           return suggestion;
// // // // //         });
        
// // // // //         // Ensure we have exactly 3 suggestions
// // // // //         while (parsed.suggestions.length < 3) {
// // // // //           const alternatives = [
// // // // //             "Highly compressed version maintaining all key points",
// // // // //             "Maximum density optimization preserving original meaning",
// // // // //             "Ultra-concise reformulation with identical content"
// // // // //           ];
// // // // //           parsed.suggestions.push(`${parsed.optimizedText} - ${alternatives[parsed.suggestions.length]}`);
// // // // //         }
        
// // // // //         // Remove duplicates
// // // // //         parsed.suggestions = [...new Set(parsed.suggestions)];
// // // // //       }
// // // // //     }

// // // // //     // 🔍 Detect if it mistakenly generated an answer (not a prompt) - only for detailed mode
// // // // //     if (mode === "detailed") {
// // // // //       const looksLikeExecution =
// // // // //         /(?:^|\b)(develop|create|design|write|generate|explain|plan|analyze|summarize|conduct)\b/i.test(
// // // // //           parsed?.optimizedText || ""
// // // // //         ) &&
// // // // //         !parsed?.optimizedText?.toLowerCase().includes("you are") &&
// // // // //         !parsed?.optimizedText?.toLowerCase().includes("act as");

// // // // //       // 🔁 Self-correction step for detailed mode only
// // // // //       if (looksLikeExecution) {
// // // // //         console.log("🔁 Model produced an answer instead of a prompt → retrying...");

// // // // //         const retryPrompt = `
// // // // // You mistakenly created a *final answer* instead of an *AI instruction prompt*.
// // // // // Rewrite it into a single instruction starting with "You are..." or "Act as...".
// // // // // Return JSON ONLY:
// // // // // {"optimizedText":"rewritten prompt","suggestions":["alt1","alt2","alt3","alt4"]}
// // // // // `;

// // // // //         const retryResponse = await fetch("https://api.openai.com/v1/chat/completions", {
// // // // //           method: "POST",
// // // // //           headers: {
// // // // //             "Content-Type": "application/json",
// // // // //             Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
// // // // //           },
// // // // //           body: JSON.stringify({
// // // // //             model,
// // // // //             temperature: 0.2,
// // // // //             max_tokens: 500,
// // // // //             messages: [
// // // // //               { role: "system", content: retryPrompt },
// // // // //               { role: "user", content: parsed?.optimizedText || content },
// // // // //             ],
// // // // //             response_format: { type: "json_object" },
// // // // //           }),
// // // // //         });

// // // // //         const retryData = await retryResponse.json();
// // // // //         const retryContent = retryData?.choices?.[0]?.message?.content?.trim?.() || "";

// // // // //         if (!retryContent) {
// // // // //           console.error("⚠️ Retry also returned empty content");
// // // // //           return res.status(502).json({
// // // // //             error: "Model retry failed",
// // // // //             fallback: parsed,
// // // // //           });
// // // // //         }

// // // // //         let retryParsed;
// // // // //         try {
// // // // //           retryParsed = JSON.parse(retryContent);
// // // // //         } catch {
// // // // //           retryParsed = { optimizedText: retryContent, suggestions: [] };
// // // // //         }

// // // // //         console.log("✅ Self-correction successful.");
// // // // //         return res.json(retryParsed);
// // // // //       }
// // // // //     }

// // // // //     console.log("✅ Optimization successful. Mode:", mode, "Suggestions:", parsed.suggestions?.length || 0);
// // // // //     return res.json(parsed);
// // // // //   } catch (err) {
// // // // //     console.error("🔥 Optimize route failed:", err);
// // // // //     return res.status(500).json({ error: "Failed to contact OpenAI" });
// // // // //   }
// // // // // });

// // // // // // Health check
// // // // // app.get("/health", (_req, res) => res.json({ ok: true }));
// // // // // app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// // // // // // API routes
// // // // // app.use("/api/auth", authRoutes);
// // // // // app.use("/api/org/members", orgMembers);
// // // // // app.use("/api/quota", quotaRoutes);
// // // // // app.use("/api/smartgen", smartgenRoutes);
// // // // // app.use("/api/saved-collections", savedCollectionRoutes);
// // // // // app.use("/api/category", categoryRoutes);
// // // // // app.use("/api/prompt", promptRoutes);
// // // // // app.use("/api/purchase", purchaseRoutes);
// // // // // app.use("/api/llm-provider", llmProviderRoutes);
// // // // // app.use("/api/promptoptimizer", promptoptimizerRoutes);
// // // // // app.use("/api/promptreport", promptreportRoutes);
// // // // // app.use("/api/bankaccount", bankAccountRoutes);
// // // // // app.use("/api/routes/pricing", pricingRoutes);
// // // // // app.use("/api/plans/subscribe/order", billingOrders);
// // // // // app.use("/api/plans/subscribe/verify", billingVerify);
// // // // // app.use("/api/plans/subscribe/history", billingHistory);
// // // // // app.use("/api/feedback", feedbackRoutes);
// // // // // app.use("/api/cart", cartRoute);
// // // // // app.use("/api/prompt-collab", promptCollab);

// // // // // app.get("/", (req, res) => {
// // // // //   res.sendFile(path.join(__dirname, "sample.html"));
// // // // // });

// // // // // // ✅ Crons
// // // // // cron.schedule("5 * * * *", async () => {
// // // // //   try {
// // // // //     await resetDuePeriods();
// // // // //   } catch (e) {
// // // // //     console.error("resetDuePeriods failed", e);
// // // // //   }
// // // // // });

// // // // // cron.schedule("* * * * *", async () => {
// // // // //   try {
// // // // //     await updateSubscriptionStatuses();
// // // // //   } catch (e) {
// // // // //     console.error("status cron failed", e);
// // // // //   }
// // // // // });

// // // // // // ✅ DB + Server
// // // // // const PORT = process.env.PORT || 5000;
// // // // // const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;

// // // // // if (!MONGO_URI) {
// // // // //   console.error("❌ Missing MONGO_URI / MONGODB_URI in .env");
// // // // //   process.exit(1);
// // // // // }

// // // // // mongoose
// // // // //   .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true, ssl: true })
// // // // //   .then(() => {
// // // // //     console.log("✅ MongoDB connected");
// // // // //     app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
// // // // //   })
// // // // //   .catch((err) => {
// // // // //     console.error("❌ MongoDB connection failed:", err);
// // // // //     process.exit(1);
// // // // //   });

// // // // // console.log("daily quota reset");


// // // // // server/index.js
// // // // require("dotenv").config();
// // // // const express = require("express");
// // // // const cors = require("cors");
// // // // const mongoose = require("mongoose");
// // // // const path = require("path");
// // // // const cron = require("node-cron");
// // // // const fetch = (...args) => import("node-fetch").then(({ default: fetch }) => fetch(...args));

// // // // // Jobs
// // // // const { resetDuePeriods } = require("./utils/jobs/resetPeriods");
// // // // const { updateSubscriptionStatuses } = require("./utils/jobs/subscriptionStatusCron");

// // // // // Routes
// // // // const authRoutes = require("./routes/authRoutes");
// // // // const quotaRoutes = require("./routes/quotaRoute");
// // // // const smartgenRoutes = require("./routes/smartgenRoutes");
// // // // const savedCollectionRoutes = require("./routes/savedCollectionRoutes");
// // // // const categoryRoutes = require("./routes/categoryRoutes");
// // // // const promptRoutes = require("./routes/promptRoutes");
// // // // const orgMembers = require("./routes/orgMembers");
// // // // const purchaseRoutes = require("./routes/purchaseRoutes");
// // // // const llmProviderRoutes = require("./routes/llmproviderRoutes");
// // // // const promptoptimizerRoutes = require("./routes/promptoptimizerRoutes");
// // // // const promptreportRoutes = require("./routes/promptreportRoutes");
// // // // const bankAccountRoutes = require("./routes/bankAccounts");
// // // // const billingOrders = require("./routes/billingOrders");
// // // // const billingVerify = require("./routes/billingVerify");
// // // // const billingHistory = require("./routes/billingHistory");
// // // // const feedbackRoutes = require("./routes/feedback");
// // // // const cartRoute = require("./routes/cartRoute");
// // // // const promptCollab = require("./routes/promptCollab");
// // // // const pricingRoutes = require("./routes/pricing");

// // // // const app = express();
// // // // app.use(cors({
// // // //   origin: "http://localhost:5173",
// // // //   credentials: true,
// // // // }));
// // // // app.use(express.json());
// // // // app.use(express.urlencoded({ extended: true }));

// // // // // ✅ SmartGen LLM Optimization Route (with Self-Correction)
// // // // app.post("/api/optimize", async (req, res) => {
// // // //   const { text, model = "gpt-4o-mini", temperature = 0.2, mode = "optimize" } = req.body;

// // // //   if (!text || !text.trim()) {
// // // //     return res.status(400).json({ error: "Missing 'text' field" });
// // // //   }
// // // //   if (!process.env.OPENAI_API_KEY) {
// // // //     return res.status(500).json({ error: "Server misconfigured: missing OPENAI_API_KEY" });
// // // //   }

// // // //   console.log(`📩 Optimize request (${mode}) for:`, text.slice(0, 60));

// // // //   // 🧠 Select proper system prompt
// // // //   const systemPrompt =
// // // //     mode === "detailed"
// // // //       ? `
// // // // You are SmartGen — an expert multi-domain prompt engineer.
// // // // Your job is to reframe the user's request into a professional **AI instruction prompt**, not execute it.

// // // // 🎯 GOAL:
// // // // - Begin with a role statement like "You are..." or "Act as..."
// // // // - Describe context, tone, and output format.
// // // // - Produce 300-500 words total.
// // // // - NEVER output the final answer.

// // // // Return STRICT JSON ONLY:
// // // // {
// // // //   "optimizedText": "the AI prompt (300-500 words)",
// // // //   "suggestions": ["alt1","alt2","alt3","alt4"]
// // // // }`
// // // //       : `
// // // // You are an AGGRESSIVE TEXT OPTIMIZATION EXPERT. Your ONLY job is to MAXIMIZE token reduction while PERFECTLY PRESERVING core content and meaning.

// // // // 🎯 SPECIAL RULE FOR "YOU ARE..." / "ACT AS..." PROMPTS:
// // // // - If input starts with "You are..." or "Act as..." KEEP THIS EXACT STRUCTURE in output and suggestions
// // // // - PRESERVE the role statement exactly as written
// // // // - Only optimize the content after the role statement
// // // // - NEVER remove or change the opening phrase

// // // // 🎯 AGGRESSIVE OPTIMIZATION RULES:
// // // // - PRESERVE 100% of original meaning, facts, and context
// // // // - REDUCE word count by 40-60% (much more aggressive)
// // // // - REMOVE all redundant phrases and filler words
// // // // - COMBINE multiple sentences into single, dense statements
// // // // - USE maximum conciseness without losing meaning
// // // // - REPLACE long phrases with shorter equivalents
// // // // - MAINTAIN original tone and intent
// // // // - NEVER add new information
// // // // - NEVER change core facts or message

// // // // 🎯 AGGRESSIVE TOKEN REDUCTION STRATEGIES:

// // // // 🔹 FOR "YOU ARE..." PROMPTS:
// // // //    Input: "You are an experienced technical writer tasked with creating a comprehensive tutorial aimed at beginners..."
// // // //    Output: "You are an experienced technical writer creating comprehensive beginner tutorials..."
// // // //    → Keep "You are..." intact, optimize only the task description

// // // // 🔹 FOR DESCRIPTIVE/NARRATIVE TEXT:
// // // //    Input: "Education is one of the most powerful tools for personal and social transformation. It not only provides knowledge and skills but also shapes our character, values, and way of thinking."
// // // //    Output: "Education transforms individuals and society by building knowledge, skills, and values."
// // // //    → Condense while keeping all key points

// // // // 🔹 FOR QUESTIONS:
// // // //    Input: "what is your name?"
// // // //    Output: "Tell me your name?"

// // // // 🔹 FOR STORIES:
// // // //    Input: "One sunny morning, Riya decided to go for a walk in the park near her house where she often spent her weekends relaxing and enjoying nature."
// // // //    Output: "One sunny morning, Riya walked in her local park. She rescued a trapped puppy, gave it water, and it followed her home."
// // // //    → Same story, 30% fewer words

// // // // 🔹 FOR INSTRUCTIONS/REQUESTS:
// // // //    Input: "You are a marketing strategist tasked with developing a comprehensive marketing strategy for a new product launch in the competitive tech industry."
// // // //    Output: "Develop a comprehensive marketing plan for a tech gadget targeting young professionals."
// // // //    → More direct, 40% fewer words

// // // // 🔹 FOR DIRECT REQUESTS:
// // // //    Input: "tell me the weather of pune"
// // // //    Output: "Current weather in Pune"

// // // // 🔹 FOR PERSONAL INFO:
// // // //    Input: "my name is xyz i wlive in pune i live also in mumbai , i love cooking i like playing cricket , i hate negative people"
// // // //    Output: "I'm XYZ from Pune and Mumbai. I enjoy cooking and cricket. I prefer positive people."
// // // //    → Corrected, preserved all info, 40% fewer words

// // // // 🔹 FOR TECHNOLOGY CONTENT:
// // // //    Input: "Technology has become an inseparable part of human life, transforming the way we live, work, and communicate. From smartphones and computers to artificial intelligence and robotics, every aspect of modern society is influenced by technological innovation."
// // // //    Output: "Technology is integral to human life, transforming how we live, work, and communicate. Smartphones to AI influence every aspect of society."
// // // //    → Aggressive reduction while preserving meaning

// // // // 🎯 AGGRESSIVE OPTIMIZATION TECHNIQUES:
// // // // 1. ELIMINATE obvious statements and filler words
// // // // 2. COMBINE related ideas into single powerful sentences
// // // // 3. REPLACE passive voice with active voice
// // // // 4. USE stronger, more concise verbs
// // // // 5. REMOVE redundant adjectives and adverbs
// // // // 6. SIMPLIFY complex sentence structures
// // // // 7. MERGE multiple examples into unified statements
// // // // 8. CUT introductory phrases that don't add value

// // // // 🎯 TOKEN REDUCTION TARGETS:
// // // // - Short paragraphs (50-100 words): 50-60% reduction
// // // // - Medium paragraphs (100-200 words): 45-55% reduction  
// // // // - Long paragraphs (200+ words): 40-50% reduction
// // // // - Always preserve 100% of core meaning and facts

// // // // 🎯 SUGGESTIONS REQUIREMENTS:
// // // // - Provide 3 HIGHLY OPTIMIZED alternative versions
// // // // - Each should be 40-60% shorter than original
// // // // - All must preserve identical core content
// // // // - For "You are..." / "Act as..." prompts: KEEP the exact opening structure in all suggestions
// // // // - Use different sentence structures and phrasing
// // // // - Maintain readability despite high compression
// // // // - Ensure suggestions are comprehensive and similar in length to main optimizedText

// // // // Return STRICT JSON ONLY:
// // // // {
// // // //   "optimizedText": "the aggressively optimized version with maximum token reduction",
// // // //   "suggestions": [
// // // //     "comprehensive alternative optimized version 1 with similar length and detail",
// // // //     "comprehensive alternative optimized version 2 with similar length and detail", 
// // // //     "comprehensive alternative optimized version 3 with similar length and detail"
// // // //   ]
// // // // }`;

// // // //   try {
// // // //     const response = await fetch("https://api.openai.com/v1/chat/completions", {
// // // //       method: "POST",
// // // //       headers: {
// // // //         "Content-Type": "application/json",
// // // //         Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
// // // //       },
// // // //       body: JSON.stringify({
// // // //         model,
// // // //         temperature,
// // // //         max_tokens: 1200,
// // // //         messages: [
// // // //           { role: "system", content: systemPrompt },
// // // //           { role: "user", content: text },
// // // //         ],
// // // //         response_format: { type: "json_object" },
// // // //       }),
// // // //     });

// // // //     const data = await response.json();
// // // //     if (!response.ok) {
// // // //       console.error("❌ OpenAI API Error:", data);
// // // //       return res.status(response.status).json({ error: data?.error?.message || "OpenAI error" });
// // // //     }

// // // //     const content = data?.choices?.[0]?.message?.content?.trim?.() || "";

// // // //     if (!content) {
// // // //       console.error("⚠️ Empty response from model:", data);
// // // //       return res.status(502).json({
// // // //         error: "Empty content from model",
// // // //         fallback: { optimizedText: text, suggestions: [] },
// // // //       });
// // // //     }

// // // //     let parsed;
// // // //     try {
// // // //       parsed = JSON.parse(content);
// // // //     } catch {
// // // //       console.warn("⚠️ Invalid JSON returned. Wrapping raw content.");
// // // //       parsed = { optimizedText: content, suggestions: [] };
// // // //     }

// // // //     // 🔍 Calculate metrics for OPTIMIZE mode
// // // //     if (mode === "optimize") {
// // // //       const originalWords = text.split(/\s+/).length;
// // // //       const optimizedWords = parsed.optimizedText.split(/\s+/).length;
// // // //       const reduction = Math.round(((originalWords - optimizedWords) / originalWords) * 100);
      
// // // //       console.log(`✅ Optimization successful. Word reduction: ${originalWords} → ${optimizedWords} (${reduction}%)`);

// // // //       // Add reduction metrics
// // // //       parsed.metrics = {
// // // //         originalWordCount: originalWords,
// // // //         optimizedWordCount: optimizedWords,
// // // //         reductionPercentage: reduction
// // // //       };

// // // //       // SPECIAL PROCESSING FOR "YOU ARE..." / "ACT AS..." PROMPTS
// // // //       const isRolePrompt = text.toLowerCase().startsWith("you are") || text.toLowerCase().startsWith("act as");
      
// // // //       if (isRolePrompt) {
// // // //         console.log("🔍 Detected role prompt - ensuring structure preservation");
        
// // // //         // Extract the exact opening phrase from original text
// // // //         const openingMatch = text.match(/^(you are|act as)[^.!?]*/i);
// // // //         const exactOpening = openingMatch ? openingMatch[0] : null;

// // // //         if (exactOpening) {
// // // //           // Ensure main output keeps the exact opening structure
// // // //           const hasCorrectOpening = parsed.optimizedText.toLowerCase().startsWith("you are") || 
// // // //                                    parsed.optimizedText.toLowerCase().startsWith("act as");
          
// // // //           if (!hasCorrectOpening) {
// // // //             // Remove any existing incorrect opening and add the exact one
// // // //             const cleanedText = parsed.optimizedText.replace(/^(you are|act as)[^.!?]*/i, '').trim();
// // // //             parsed.optimizedText = `${exactOpening} ${cleanedText}`;
// // // //           }

// // // //           // Ensure suggestions keep the exact opening structure
// // // //           if (parsed.suggestions && Array.isArray(parsed.suggestions)) {
// // // //             parsed.suggestions = parsed.suggestions.map(suggestion => {
// // // //               const suggestionHasOpening = suggestion.toLowerCase().startsWith("you are") || 
// // // //                                          suggestion.toLowerCase().startsWith("act as");
              
// // // //               if (!suggestionHasOpening) {
// // // //                 const cleanedSuggestion = suggestion.replace(/^(you are|act as)[^.!?]*/i, '').trim();
// // // //                 return `${exactOpening} ${cleanedSuggestion}`;
// // // //               }
// // // //               return suggestion;
// // // //             });
// // // //           }
// // // //         }
// // // //       }

// // // //       // Post-process to ensure suggestions are proper length and format
// // // //       if (parsed.suggestions && Array.isArray(parsed.suggestions)) {
// // // //         parsed.suggestions = parsed.suggestions.map(suggestion => {
// // // //           // If suggestion is too short, enhance it
// // // //           const mainLength = parsed.optimizedText.length;
// // // //           if (suggestion.length < mainLength * 0.3) {
// // // //             return suggestion + " - Comprehensive approach";
// // // //           }
// // // //           return suggestion;
// // // //         });
        
// // // //         // 🔥 NEW: Remove duplicates and similar suggestions FIRST
// // // //         const uniqueSuggestions = [];
// // // //         parsed.suggestions.forEach(suggestion => {
// // // //           // Check if suggestion is too similar to optimizedText
// // // //           const isTooSimilar = suggestion.includes(parsed.optimizedText) && 
// // // //                                suggestion.length < parsed.optimizedText.length * 1.5;
          
// // // //           // Check if suggestion is duplicate
// // // //           const isDuplicate = uniqueSuggestions.some(existing => 
// // // //             existing.toLowerCase() === suggestion.toLowerCase() ||
// // // //             existing.replace(/\s+/g, ' ') === suggestion.replace(/\s+/g, ' ')
// // // //           );
          
// // // //           if (!isTooSimilar && !isDuplicate) {
// // // //             uniqueSuggestions.push(suggestion);
// // // //           }
// // // //         });
        
// // // //         parsed.suggestions = uniqueSuggestions;
        
// // // //         // 🔥 NEW: Ensure we have exactly 3 UNIQUE suggestions
// // // //         while (parsed.suggestions.length < 3) {
// // // //           const uniqueAlternatives = [
// // // //             "Alternative phrasing with same meaning",
// // // //             "Different structure preserving core content", 
// // // //             "Reworded version maintaining original intent"
// // // //           ];
          
// // // //           const uniqueSuggestion = parsed.optimizedText + " - " + uniqueAlternatives[parsed.suggestions.length];
          
// // // //           if (!parsed.suggestions.includes(uniqueSuggestion)) {
// // // //             parsed.suggestions.push(uniqueSuggestion);
// // // //           } else {
// // // //             parsed.suggestions.push(uniqueSuggestion + " (Variation)");
// // // //           }
// // // //         }
        
// // // //         // Final duplicate removal
// // // //         parsed.suggestions = [...new Set(parsed.suggestions)];
// // // //       }
// // // //     } // 
// // // //     // 🔍 Detect if it mistakenly generated an answer (not a prompt) - only for detailed mode
// // // //     if (mode === "detailed") {
// // // //       const looksLikeExecution =
// // // //         /(?:^|\b)(develop|create|design|write|generate|explain|plan|analyze|summarize|conduct)\b/i.test(
// // // //           parsed?.optimizedText || ""
// // // //         ) &&
// // // //         !parsed?.optimizedText?.toLowerCase().includes("you are") &&
// // // //         !parsed?.optimizedText?.toLowerCase().includes("act as");

// // // //       // 🔁 Self-correction step for detailed mode only
// // // //       if (looksLikeExecution) {
// // // //         console.log("🔁 Model produced an answer instead of a prompt → retrying...");

// // // //         const retryPrompt = `
// // // // You mistakenly created a *final answer* instead of an *AI instruction prompt*.
// // // // Rewrite it into a single instruction starting with "You are..." or "Act as...".
// // // // Return JSON ONLY:
// // // // {"optimizedText":"rewritten prompt","suggestions":["alt1","alt2","alt3","alt4"]}
// // // // `;

// // // //         const retryResponse = await fetch("https://api.openai.com/v1/chat/completions", {
// // // //           method: "POST",
// // // //           headers: {
// // // //             "Content-Type": "application/json",
// // // //             Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
// // // //           },
// // // //           body: JSON.stringify({
// // // //             model,
// // // //             temperature: 0.2,
// // // //             max_tokens: 500,
// // // //             messages: [
// // // //               { role: "system", content: retryPrompt },
// // // //               { role: "user", content: parsed?.optimizedText || content },
// // // //             ],
// // // //             response_format: { type: "json_object" },
// // // //           }),
// // // //         });

// // // //         const retryData = await retryResponse.json();
// // // //         const retryContent = retryData?.choices?.[0]?.message?.content?.trim?.() || "";

// // // //         if (!retryContent) {
// // // //           console.error("⚠️ Retry also returned empty content");
// // // //           return res.status(502).json({
// // // //             error: "Model retry failed",
// // // //             fallback: parsed,
// // // //           });
// // // //         }

// // // //         let retryParsed;
// // // //         try {
// // // //           retryParsed = JSON.parse(retryContent);
// // // //         } catch {
// // // //           retryParsed = { optimizedText: retryContent, suggestions: [] };
// // // //         }

// // // //         console.log("✅ Self-correction successful.");
// // // //         return res.json(retryParsed);
// // // //       }
// // // //     }

// // // //     console.log("✅ Optimization successful. Mode:", mode, "Suggestions:", parsed.suggestions?.length || 0);
// // // //     return res.json(parsed);
// // // //   } catch (err) {
// // // //     console.error("🔥 Optimize route failed:", err);
// // // //     return res.status(500).json({ error: "Failed to contact OpenAI" });
// // // //   }
// // // // });

// // // // // Health check
// // // // app.get("/health", (_req, res) => res.json({ ok: true }));
// // // // app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// // // // // API routes
// // // // app.use("/api/auth", authRoutes);
// // // // app.use("/api/org/members", orgMembers);
// // // // app.use("/api/quota", quotaRoutes);
// // // // app.use("/api/smartgen", smartgenRoutes);
// // // // app.use("/api/saved-collections", savedCollectionRoutes);
// // // // app.use("/api/category", categoryRoutes);
// // // // app.use("/api/prompt", promptRoutes);
// // // // app.use("/api/purchase", purchaseRoutes);
// // // // app.use("/api/llm-provider", llmProviderRoutes);
// // // // app.use("/api/promptoptimizer", promptoptimizerRoutes);
// // // // app.use("/api/promptreport", promptreportRoutes);
// // // // app.use("/api/bankaccount", bankAccountRoutes);
// // // // app.use("/api/routes/pricing", pricingRoutes);
// // // // app.use("/api/plans/subscribe/order", billingOrders);
// // // // app.use("/api/plans/subscribe/verify", billingVerify);
// // // // app.use("/api/plans/subscribe/history", billingHistory);
// // // // app.use("/api/feedback", feedbackRoutes);
// // // // app.use("/api/cart", cartRoute);
// // // // app.use("/api/prompt-collab", promptCollab);

// // // // app.get("/", (req, res) => {
// // // //   res.sendFile(path.join(__dirname, "sample.html"));
// // // // });

// // // // // ✅ Crons
// // // // cron.schedule("5 * * * *", async () => {
// // // //   try {
// // // //     await resetDuePeriods();
// // // //   } catch (e) {
// // // //     console.error("resetDuePeriods failed", e);
// // // //   }
// // // // });

// // // // cron.schedule("* * * * *", async () => {
// // // //   try {
// // // //     await updateSubscriptionStatuses();
// // // //   } catch (e) {
// // // //     console.error("status cron failed", e);
// // // //   }
// // // // });

// // // // // ✅ DB + Server
// // // // const PORT = process.env.PORT || 5000;
// // // // const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;

// // // // if (!MONGO_URI) {
// // // //   console.error("❌ Missing MONGO_URI / MONGODB_URI in .env");
// // // //   process.exit(1);
// // // // }

// // // // mongoose
// // // //   .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true, ssl: true })
// // // //   .then(() => {
// // // //     console.log("✅ MongoDB connected");
// // // //     app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
// // // //   })
// // // //   .catch((err) => {
// // // //     console.error("❌ MongoDB connection failed:", err);
// // // //     process.exit(1);
// // // //   });

// // // // console.log("daily quota reset");





// // // // server/index.js
// // // require("dotenv").config();
// // // require("./utils/passport")
// // // const express = require("express");
// // // const cors = require("cors");
// // // const mongoose = require("mongoose");
// // // const path = require("path");
// // // const cron = require("node-cron");
// // // const fetch = (...args) => import("node-fetch").then(({ default: fetch }) => fetch(...args));
// // // const http = require("http");
// // // const { Server } = require("socket.io");
// // // const CollabSession = require("./models/CollabSession");
// // // const passport = require("passport");
// // // // Jobs
// // // const { resetDuePeriods } = require("./utils/jobs/resetPeriods");
// // // const { updateSubscriptionStatuses } = require("./utils/jobs/subscriptionStatusCron");
// // // const Message = require("./models/Message");
// // // const Conversation = require("./models/Conversation");
// // // const { seedDefaultAdmin } = require("./utils/seedAdmin");
// // // const adminMessageRoutes = require("./routes/adminMessageRoutes");

// // // // Routes
// // // const authRoutes = require("./routes/authRoutes");
// // // const quotaRoutes = require("./routes/quotaRoute");
// // // const smartgenRoutes = require("./routes/smartgenRoutes");
// // // const savedCollectionRoutes = require("./routes/savedCollectionRoutes");
// // // const categoryRoutes = require("./routes/categoryRoutes");
// // // const promptRoutes = require("./routes/promptRoutes");
// // // const orgMembers = require("./routes/orgMembers");
// // // const purchaseRoutes = require("./routes/purchaseRoutes");
// // // const llmProviderRoutes = require("./routes/llmproviderRoutes");
// // // const promptoptimizerRoutes = require("./routes/promptoptimizerRoutes");
// // // const promptreportRoutes = require("./routes/promptreportRoutes");
// // // const bankAccountRoutes = require("./routes/bankAccounts");
// // // const billingOrders = require("./routes/billingOrders");
// // // const billingVerify = require("./routes/billingVerify");
// // // const billingHistory = require("./routes/billingHistory");
// // // const feedbackRoutes = require("./routes/feedback");
// // // const cartRoute = require("./routes/cartRoute");
// // // const promptCollab = require("./routes/promptCollab");
// // // const pricingRoutes = require("./routes/pricing");
// // // const chatRoutes = require("./routes/chatRoutes")
// // // const serviceRoutes = require("./routes/serviceRoutes");
// // // const googleMeetRoutes = require("./routes/googleMeetRoutes");
// // // const userRoutes =  require("./routes/userRoutes")
// // // const invoiceRoute = require("./routes/invoice.route");
// // // const adminRoutes = require("./routes/adminRoutes");
// // // const sellerRoutes = require("./routes/sellerRoutes");
// // // const kycRoutes = require("./routes/kycRoutes");
// // // const hireRoutes = require("./routes/hire.routes");
// // // const adminEscrowRouter = require("./routes/adminEscrow");
// // // require('./cron/autoReleaseEscrow');
// // // const activityRoutes = require("./routes/activityRoutes");
// // // const userAdminRoutes = require("./routes/userAdminRoutes");
// // // const walletRoutes = require("./routes/walletRoutes")
// // // const reportRoutes = require("./routes/report");
// // // const screenRecordingRoutes = require("./routes/screenRecording");
// // // const app = express();
// // // // app.use(cors({
// // // //   origin: "http://localhost:5173",
// // // //   credentials: true,
// // // // }));
// // // const allowedOrigins = [
// // //   "http://localhost:5173",
// // //   "https://gray-pebble-06934421e.6.azurestaticapps.net",
// // //   process.env.FRONTEND_URL,
// // // ].filter(Boolean);

// // // const corsOptions = {
// // //   origin: function (origin, callback) {
// // //     console.log("CORS Origin:", origin);

// // //     if (!origin || allowedOrigins.includes(origin)) {
// // //       return callback(null, true);
// // //     }

// // //     return callback(new Error("CORS not allowed: " + origin));
// // //   },
// // //   credentials: true,
// // //   methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
// // //   allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
// // //   optionsSuccessStatus: 204,
// // // };

// // // app.use(cors(corsOptions));
// // // app.options(/.*/, cors(corsOptions));

// // // // server/index.js — top pe, app banane ke baad TURANT

// // // // const allowedOrigins = [
// // // //   "http://localhost:5173",
// // // //   "https://localhost:5173",
// // // //   // apna production frontend URL bhi add karo
// // // // ];

// // // // app.use(cors({
// // // //   origin: function (origin, callback) {
// // // //     // allow requests with no origin (mobile apps, curl, postman)
// // // //     if (!origin) return callback(null, true);
// // // //     if (allowedOrigins.includes(origin)) {
// // // //       return callback(null, true);
// // // //     }
// // // //     return callback(new Error("CORS not allowed: " + origin));
// // // //   },
// // // //   credentials: true,
// // // //   methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
// // // //   allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
// // // // }));

// // // // // ✅ Preflight ke liye — SABSE ZAROORI
// // // // app.options("*", cors());
// // // app.use(express.json());
// // // app.use(express.urlencoded({ extended: true }));

// // // // ✅ SmartGen LLM Optimization Route (with Self-Correction)
// // // app.post("/api/optimize", async (req, res) => {
// // //   const { text, model = "gpt-4o-mini", temperature = 0.2, mode = "optimize" } = req.body;

// // //   if (!text || !text.trim()) {
// // //     return res.status(400).json({ error: "Missing 'text' field" });
// // //   }
// // //   if (!process.env.OPENAI_API_KEY) {
// // //     return res.status(500).json({ error: "Server misconfigured: missing OPENAI_API_KEY" });
// // //   }

// // //   console.log(`📩 Optimize request (${mode}) for:`, text.slice(0, 60));

// // //   // 🧠 Select proper system prompt
// // // //   const systemPrompt =
// // // //     mode === "detailed"
// // // //       ? `
// // // // You are SmartGen — an expert multi-domain prompt engineer.
// // // // Your job is to reframe the user's request into a professional **AI instruction prompt**, not execute it.

// // // // 🎯 GOAL:
// // // // - Begin with a role statement like "You are..." or "Act as..."
// // // // - Describe context, tone, and output format.
// // // // - Produce 300-500 words total.
// // // // - NEVER output the final answer.

// // // // Return STRICT JSON ONLY:
// // // // {
// // // //   "optimizedText": "the AI prompt (300-500 words)",
// // // //   "suggestions": ["alt1","alt2","alt3","alt4"]
// // // // }`
// // // //       : `
// // // // You are an AGGRESSIVE TEXT OPTIMIZATION EXPERT. Your ONLY job is to MAXIMIZE token reduction while PERFECTLY PRESERVING core content and meaning.

// // // // 🎯 SPECIAL RULE FOR "YOU ARE..." / "ACT AS..." PROMPTS:
// // // // - If input starts with "You are..." or "Act as..." KEEP THIS EXACT STRUCTURE in output and suggestions
// // // // - PRESERVE the role statement exactly as written
// // // // - Only optimize the content after the role statement
// // // // - NEVER remove or change the opening phrase

// // // // 🎯 AGGRESSIVE OPTIMIZATION RULES:
// // // // - PRESERVE 100% of original meaning, facts, and context
// // // // - REDUCE word count by 40-60% (much more aggressive)
// // // // - REMOVE all redundant phrases and filler words
// // // // - COMBINE multiple sentences into single, dense statements
// // // // - USE maximum conciseness without losing meaning
// // // // - REPLACE long phrases with shorter equivalents
// // // // - MAINTAIN original tone and intent
// // // // - NEVER add new information
// // // // - NEVER change core facts or message

// // // // 🎯 AGGRESSIVE TOKEN REDUCTION STRATEGIES:

// // // // 🔹 FOR "YOU ARE..." PROMPTS:
// // // //    Input: "You are an experienced technical writer tasked with creating a comprehensive tutorial aimed at beginners..."
// // // //    Output: "You are an experienced technical writer creating comprehensive beginner tutorials..."
// // // //    → Keep "You are..." intact, optimize only the task description

// // // // 🔹 FOR DESCRIPTIVE/NARRATIVE TEXT:
// // // //    Input: "Education is one of the most powerful tools for personal and social transformation. It not only provides knowledge and skills but also shapes our character, values, and way of thinking."
// // // //    Output: "Education transforms individuals and society by building knowledge, skills, and values."
// // // //    → Condense while keeping all key points

// // // // 🔹 FOR QUESTIONS:
// // // //    Input: "what is your name?"
// // // //    Output: "Tell me your name?"

// // // // 🔹 FOR STORIES:
// // // //    Input: "One sunny morning, Riya decided to go for a walk in the park near her house where she often spent her weekends relaxing and enjoying nature."
// // // //    Output: "One sunny morning, Riya walked in her local park. She rescued a trapped puppy, gave it water, and it followed her home."
// // // //    → Same story, 30% fewer words

// // // // 🔹 FOR INSTRUCTIONS/REQUESTS:
// // // //    Input: "You are a marketing strategist tasked with developing a comprehensive marketing strategy for a new product launch in the competitive tech industry."
// // // //    Output: "Develop a comprehensive marketing plan for a tech gadget targeting young professionals."
// // // //    → More direct, 40% fewer words

// // // // 🔹 FOR DIRECT REQUESTS:
// // // //    Input: "tell me the weather of pune"
// // // //    Output: "Current weather in Pune"

// // // // 🔹 FOR PERSONAL INFO:
// // // //    Input: "my name is xyz i wlive in pune i live also in mumbai , i love cooking i like playing cricket , i hate negative people"
// // // //    Output: "I'm XYZ from Pune and Mumbai. I enjoy cooking and cricket. I prefer positive people."
// // // //    → Corrected, preserved all info, 40% fewer words

// // // // 🔹 FOR TECHNOLOGY CONTENT:
// // // //    Input: "Technology has become an inseparable part of human life, transforming the way we live, work, and communicate. From smartphones and computers to artificial intelligence and robotics, every aspect of modern society is influenced by technological innovation."
// // // //    Output: "Technology is integral to human life, transforming how we live, work, and communicate. Smartphones to AI influence every aspect of society."
// // // //    → Aggressive reduction while preserving meaning

// // // // 🎯 AGGRESSIVE OPTIMIZATION TECHNIQUES:
// // // // 1. ELIMINATE obvious statements and filler words
// // // // 2. COMBINE related ideas into single powerful sentences
// // // // 3. REPLACE passive voice with active voice
// // // // 4. USE stronger, more concise verbs
// // // // 5. REMOVE redundant adjectives and adverbs
// // // // 6. SIMPLIFY complex sentence structures
// // // // 7. MERGE multiple examples into unified statements
// // // // 8. CUT introductory phrases that don't add value

// // // // 🎯 TOKEN REDUCTION TARGETS:
// // // // - Short paragraphs (50-100 words): 50-60% reduction
// // // // - Medium paragraphs (100-200 words): 45-55% reduction  
// // // // - Long paragraphs (200+ words): 40-50% reduction
// // // // - Always preserve 100% of core meaning and facts

// // // // 🎯 SUGGESTIONS REQUIREMENTS:
// // // // - Provide 3 HIGHLY OPTIMIZED alternative versions
// // // // - Each should be 40-60% shorter than original
// // // // - All must preserve identical core content
// // // // - For "You are..." / "Act as..." prompts: KEEP the exact opening structure in all suggestions
// // // // - Use different sentence structures and phrasing
// // // // - Maintain readability despite high compression
// // // // - Ensure suggestions are comprehensive and similar in length to main optimizedText

// // // // Return STRICT JSON ONLY:
// // // // {
// // // //   "optimizedText": "the aggressively optimized version with maximum token reduction",
// // // //   "suggestions": [
// // // //     "comprehensive alternative optimized version 1 with similar length and detail",
// // // //     "comprehensive alternative optimized version 2 with similar length and detail", 
// // // //     "comprehensive alternative optimized version 3 with similar length and detail"
// // // //   ]
// // // // }`;

// // // const systemPrompt =
// // //   mode === "detailed"
// // //     ? `
// // // You are SmartGen — an expert AI Prompt Engineer who creates highly detailed, structured, step-by-step AI instruction prompts.

// // // Your ONLY job: analyze the user's input and return a single, comprehensive, production-ready AI prompt. NO alternatives. NO variations. ONE perfect prompt.

// // // The output optimizedText MUST use this EXACT formatting with double newlines between sections:

// // // ## Role & Identity
// // // You are a [specific expert role]...

// // // ## Context & Goal
// // // [2-3 sentences specific to user topic]

// // // ## Core Responsibilities
// // // 1. [responsibility]
// // // 2. [responsibility]
// // // 3. [responsibility]
// // // 4. [responsibility]
// // // 5. [responsibility]

// // // ## Step-by-Step Process
// // // Step 1: [detailed action]
// // // Step 2: [detailed action]
// // // Step 3: [detailed action]
// // // Step 4: [detailed action]
// // // Step 5: [detailed action]
// // // Step 6: [detailed action]

// // // ## Technical Specifications
// // // - [spec 1]
// // // - [spec 2]
// // // - [spec 3]

// // // ## Output Requirements
// // // [exactly what to produce]

// // // ## Rules & Constraints
// // // - [rule 1]
// // // - [rule 2]
// // // - [rule 3]
// // // - [rule 4]
// // // - [rule 5]

// // // ## Quality Standards
// // // [measurable standards for this topic]

// // // CRITICAL RULES:
// // // - optimizedText MUST be 700-900 words
// // // - Use ## for every section heading — do NOT skip headings
// // // - Use "Step 1:", "Step 2:" etc — do NOT use bullet points for steps
// // // - Use numbered list for Core Responsibilities
// // // - Every section 100% specific to user topic — ZERO generic content
// // // - NEVER execute the task — only write the instruction prompt
// // // - Always start optimizedText with "You are..."
// // // - steps array must have exactly 4 items with real content from the prompt

// // // Return STRICT JSON ONLY — no text outside JSON:

// // // {
// // //   "optimizedText": "## Role & Identity\\nYou are a...\\n\\n## Context & Goal\\n...\\n\\n## Core Responsibilities\\n1. ...\\n2. ...\\n\\n## Step-by-Step Process\\nStep 1: ...\\nStep 2: ...\\n\\n## Technical Specifications\\n- ...\\n\\n## Output Requirements\\n...\\n\\n## Rules & Constraints\\n- ...\\n\\n## Quality Standards\\n...",
// // //   "steps": [
// // //     { "title": "Role & Identity", "content": "One specific line about who the AI is for THIS topic" },
// // //     { "title": "Step-by-Step Process", "content": "One specific line about what the 6 steps cover for THIS topic" },
// // //     { "title": "Technical Specifications", "content": "One specific line about technical details for THIS topic" },
// // //     { "title": "Output & Rules", "content": "One specific line about deliverables and constraints for THIS topic" }
// // //   ]
// // // }

// // // NO suggestions field. NO alternatives.
// // // `
// // //     : `
// // // You are an AGGRESSIVE TEXT OPTIMIZATION EXPERT. Your job is to maximize token reduction while perfectly preserving core content. Return your response as a JSON object.

// // // OPTIMIZATION RULES:
// // // - PRESERVE 100% of original meaning, facts, and context
// // // - REDUCE word count by 40-60%
// // // - REMOVE all redundant phrases and filler words
// // // - COMBINE multiple sentences into single, dense statements
// // // - USE maximum conciseness without losing meaning
// // // - REPLACE long phrases with shorter equivalents
// // // - MAINTAIN original tone and intent
// // // - NEVER add new information
// // // - NEVER change core facts or message

// // // SPECIAL RULE FOR "YOU ARE..." / "ACT AS..." PROMPTS:
// // // - If input starts with "You are..." or "Act as..." KEEP THIS EXACT STRUCTURE in output and suggestions
// // // - PRESERVE the role statement exactly as written
// // // - Only optimize the content after the role statement

// // // TOKEN REDUCTION TARGETS:
// // // - Short text (50-100 words): 50-60% reduction
// // // - Medium text (100-200 words): 45-55% reduction
// // // - Long text (200+ words): 40-50% reduction
// // // - Always preserve 100% of core meaning and facts

// // // Return STRICT JSON ONLY with this exact format:
// // // {
// // //   "optimizedText": "the aggressively optimized version with maximum token reduction",
// // //   "suggestions": [
// // //     "comprehensive alternative optimized version 1",
// // //     "comprehensive alternative optimized version 2",
// // //     "comprehensive alternative optimized version 3"
// // //   ]
// // // }
// // // `;

    
// // //   try {
// // //     const response = await fetch("https://api.openai.com/v1/chat/completions", {
// // //       method: "POST",
// // //       headers: {
// // //         "Content-Type": "application/json",
// // //         Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
// // //       },
// // //       body: JSON.stringify({
// // //         model,
// // //         temperature,
// // //         max_tokens: 1200,
// // //         messages: [
// // //           { role: "system", content: systemPrompt },
// // //           { role: "user", content: text },
// // //         ],
// // //         response_format: { type: "json_object" },
// // //       }),
// // //     });

// // //     const data = await response.json();
// // //     if (!response.ok) {
// // //       console.error("❌ OpenAI API Error:", data);
// // //       return res.status(response.status).json({ error: data?.error?.message || "OpenAI error" });
// // //     }

// // //     const content = data?.choices?.[0]?.message?.content?.trim?.() || "";

// // //     if (!content) {
// // //       console.error("⚠️ Empty response from model:", data);
// // //       return res.status(502).json({
// // //         error: "Empty content from model",
// // //         fallback: { optimizedText: text, suggestions: [] },
// // //       });
// // //     }

// // //     let parsed;
// // //     try {
// // //       parsed = JSON.parse(content);
// // //     } catch {
// // //       console.warn("⚠️ Invalid JSON returned. Wrapping raw content.");
// // //       parsed = { optimizedText: content, suggestions: [] };
// // //     }

// // //     // 🔍 Calculate metrics for OPTIMIZE mode
// // //     if (mode === "optimize") {
// // //       const originalWords = text.split(/\s+/).length;
// // //       const optimizedWords = parsed.optimizedText.split(/\s+/).length;
// // //       const reduction = Math.round(((originalWords - optimizedWords) / originalWords) * 100);
      
// // //       console.log(`✅ Optimization successful. Word reduction: ${originalWords} → ${optimizedWords} (${reduction}%)`);

// // //       // Add reduction metrics
// // //       parsed.metrics = {
// // //         originalWordCount: originalWords,
// // //         optimizedWordCount: optimizedWords,
// // //         reductionPercentage: reduction
// // //       };

// // //       // SPECIAL PROCESSING FOR "YOU ARE..." / "ACT AS..." PROMPTS
// // //       const isRolePrompt = text.toLowerCase().startsWith("you are") || text.toLowerCase().startsWith("act as");
      
// // //       if (isRolePrompt) {
// // //         console.log("🔍 Detected role prompt - ensuring structure preservation");
        
// // //         // Extract the exact opening phrase from original text
// // //         const openingMatch = text.match(/^(you are|act as)[^.!?]*/i);
// // //         const exactOpening = openingMatch ? openingMatch[0] : null;

// // //         if (exactOpening) {
// // //           // Ensure main output keeps the exact opening structure
// // //           const hasCorrectOpening = parsed.optimizedText.toLowerCase().startsWith("you are") || 
// // //                                    parsed.optimizedText.toLowerCase().startsWith("act as");
          
// // //           if (!hasCorrectOpening) {
// // //             // Remove any existing incorrect opening and add the exact one
// // //             const cleanedText = parsed.optimizedText.replace(/^(you are|act as)[^.!?]*/i, '').trim();
// // //             parsed.optimizedText = `${exactOpening} ${cleanedText}`;
// // //           }

// // //           // Ensure suggestions keep the exact opening structure
// // //           if (parsed.suggestions && Array.isArray(parsed.suggestions)) {
// // //             parsed.suggestions = parsed.suggestions.map(suggestion => {
// // //               const suggestionHasOpening = suggestion.toLowerCase().startsWith("you are") || 
// // //                                          suggestion.toLowerCase().startsWith("act as");
              
// // //               if (!suggestionHasOpening) {
// // //                 const cleanedSuggestion = suggestion.replace(/^(you are|act as)[^.!?]*/i, '').trim();
// // //                 return `${exactOpening} ${cleanedSuggestion}`;
// // //               }
// // //               return suggestion;
// // //             });
// // //           }
// // //         }
// // //       }

// // //       // Post-process to ensure suggestions are proper length and format
// // //       if (parsed.suggestions && Array.isArray(parsed.suggestions)) {
// // //         parsed.suggestions = parsed.suggestions.map(suggestion => {
// // //           // If suggestion is too short, enhance it
// // //           const mainLength = parsed.optimizedText.length;
// // //           if (suggestion.length < mainLength * 0.3) {
// // //             return suggestion + " - Comprehensive approach";
// // //           }
// // //           return suggestion;
// // //         });
        
// // //         // 🔥 NEW: Remove duplicates and similar suggestions FIRST
// // //         const uniqueSuggestions = [];
// // //         parsed.suggestions.forEach(suggestion => {
// // //           // Check if suggestion is too similar to optimizedText
// // //           const isTooSimilar = suggestion.includes(parsed.optimizedText) && 
// // //                                suggestion.length < parsed.optimizedText.length * 1.5;
          
// // //           // Check if suggestion is duplicate
// // //           const isDuplicate = uniqueSuggestions.some(existing => 
// // //             existing.toLowerCase() === suggestion.toLowerCase() ||
// // //             existing.replace(/\s+/g, ' ') === suggestion.replace(/\s+/g, ' ')
// // //           );
          
// // //           if (!isTooSimilar && !isDuplicate) {
// // //             uniqueSuggestions.push(suggestion);
// // //           }
// // //         });
        
// // //         parsed.suggestions = uniqueSuggestions;
        
// // //         // 🔥 NEW: Ensure we have exactly 3 UNIQUE suggestions
// // //         while (parsed.suggestions.length < 3) {
// // //           const uniqueAlternatives = [
// // //             "Alternative phrasing with same meaning",
// // //             "Different structure preserving core content", 
// // //             "Reworded version maintaining original intent"
// // //           ];
          
// // //           const uniqueSuggestion = parsed.optimizedText + " - " + uniqueAlternatives[parsed.suggestions.length];
          
// // //           if (!parsed.suggestions.includes(uniqueSuggestion)) {
// // //             parsed.suggestions.push(uniqueSuggestion);
// // //           } else {
// // //             parsed.suggestions.push(uniqueSuggestion + " (Variation)");
// // //           }
// // //         }
        
// // //         // Final duplicate removal
// // //         parsed.suggestions = [...new Set(parsed.suggestions)];
// // //       }
// // //     } // 
// // //     // 🔍 Detect if it mistakenly generated an answer (not a prompt) - only for detailed mode
// // //     if (mode === "detailed") {
// // //       const looksLikeExecution =
// // //         /(?:^|\b)(develop|create|design|write|generate|explain|plan|analyze|summarize|conduct)\b/i.test(
// // //           parsed?.optimizedText || ""
// // //         ) &&
// // //         !parsed?.optimizedText?.toLowerCase().includes("you are") &&
// // //         !parsed?.optimizedText?.toLowerCase().includes("act as");

// // //       // 🔁 Self-correction step for detailed mode only
// // //       if (looksLikeExecution) {
// // //         console.log("🔁 Model produced an answer instead of a prompt → retrying...");

// // //         const retryPrompt = `
// // // You mistakenly created a *final answer* instead of an *AI instruction prompt*.
// // // Rewrite it into a single instruction starting with "You are..." or "Act as...".
// // // Return JSON ONLY:
// // // {"optimizedText":"rewritten prompt","suggestions":["alt1","alt2","alt3","alt4"]}
// // // `;

// // //         const retryResponse = await fetch("https://api.openai.com/v1/chat/completions", {
// // //           method: "POST",
// // //           headers: {
// // //             "Content-Type": "application/json",
// // //             Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
// // //           },
// // //           body: JSON.stringify({
// // //             model,
// // //             temperature: 0.2,
// // //             max_tokens: 500,
// // //             messages: [
// // //               { role: "system", content: retryPrompt },
// // //               { role: "user", content: parsed?.optimizedText || content },
// // //             ],
// // //             response_format: { type: "json_object" },
// // //           }),
// // //         });

// // //         const retryData = await retryResponse.json();
// // //         const retryContent = retryData?.choices?.[0]?.message?.content?.trim?.() || "";

// // //         if (!retryContent) {
// // //           console.error("⚠️ Retry also returned empty content");
// // //           return res.status(502).json({
// // //             error: "Model retry failed",
// // //             fallback: parsed,
// // //           });
// // //         }

// // //         let retryParsed;
// // //         try {
// // //           retryParsed = JSON.parse(retryContent);
// // //         } catch {
// // //           retryParsed = { optimizedText: retryContent, suggestions: [] };
// // //         }

// // //         console.log("✅ Self-correction successful.");
// // //         return res.json(retryParsed);
// // //       }
// // //     }

// // //     console.log("✅ Optimization successful. Mode:", mode, "Suggestions:", parsed.suggestions?.length || 0);
// // //     return res.json(parsed);
// // //   } catch (err) {
// // //     console.error("🔥 Optimize route failed:", err);
// // //     return res.status(500).json({ error: "Failed to contact OpenAI" });
// // //   }
// // // });

// // // // Health check
// // // app.get("/health", (_req, res) => res.json({ ok: true }));
// // // app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// // // // API routes
// // // app.use(passport.initialize());
// // // app.use("/api/auth", authRoutes);
// // // app.use("/api/org/members", orgMembers);
// // // app.use("/api/quota", quotaRoutes);
// // // app.use("/api/smartgen", smartgenRoutes);
// // // app.use("/api/saved-collections", savedCollectionRoutes);
// // // app.use("/api/category", categoryRoutes);
// // // app.use("/api/prompt", promptRoutes);
// // // app.use("/api/purchase", purchaseRoutes);
// // // app.use("/api/llm-provider", llmProviderRoutes);
// // // app.use("/api/promptoptimizer", promptoptimizerRoutes);
// // // app.use("/api/promptreport", promptreportRoutes);
// // // app.use("/api/bankaccount", bankAccountRoutes);
// // // app.use("/api/routes/pricing", pricingRoutes);
// // // app.use("/api/plans/subscribe/order", billingOrders);
// // // app.use("/api/plans/subscribe/verify", billingVerify);
// // // app.use("/api/plans/subscribe/history", billingHistory);
// // // app.use("/api/feedback", feedbackRoutes);
// // // app.use("/api/cart", cartRoute);
// // // app.use("/api/prompt-collab", promptCollab);
// // // app.use("/api/chat", chatRoutes)
// // // app.use("/api/services", serviceRoutes);
// // // app.use("/api/google-meet", googleMeetRoutes);
// // // app.use("/uploads", express.static("uploads"));
// // // app.use("/uploads", express.static("uploads"));
// // // app.use("/uploads", express.static("uploads"));
// // // app.use("/api/user", userAdminRoutes);
// // // app.use("/api/user", userRoutes);
// // // app.use("/api", invoiceRoute);
// // // app.use("/api/admin", adminRoutes);
// // // app.use("/api/seller", sellerRoutes);
// // // app.use("/api/kyc", kycRoutes);
// // // app.use("/api/activity", activityRoutes);
// // // app.use("/api/wallet", walletRoutes);
// // // app.use("/api/hire", hireRoutes);
// // // app.use("/api/admin/escrow", adminEscrowRouter);
// // // app.use("/api/report", reportRoutes);
// // // app.use("/api/screen-recording", screenRecordingRoutes);
// // // app.use("/api/admin-message", adminMessageRoutes);




// // // app.get("/", (req, res) => {
// // //   res.sendFile(path.join(__dirname, "sample.html"));
// // // });

// // // // ✅ Crons
// // // cron.schedule("5 * * * *", async () => {
// // //   try {
// // //     await resetDuePeriods();
// // //   } catch (e) {
// // //     console.error("resetDuePeriods failed", e);
// // //   }
// // // });

// // // cron.schedule("* * * * *", async () => {
// // //   try {
// // //     await updateSubscriptionStatuses();
// // //   } catch (e) {
// // //     console.error("status cron failed", e);
// // //   }
// // // });





// // // //socket.io

// // // const server = http.createServer(app);

// // // const io = new Server(server, {
// // //   cors: {
// // //     origin: [
// // //       "http://localhost:5173",
// // //        "https://gray-pebble-06934421e.6.azurestaticapps.net",
// // //       process.env.FRONTEND_URL,
// // //     ].filter(Boolean),
// // //     methods: ["GET", "POST"],
// // //     credentials: true,
// // //   },
// // // });
// // // app.set("io", io);
// // // // --- REAL-TIME COLLAB LOGIC ---
// // // io.on("connection", (socket) => {
// // //   console.log(`⚡ Client connected: ${socket.id}`);
    
// // // const userId = socket.handshake.auth?.userId;

// // //   if (userId) {
// // //     socket.join(userId); // 🔥 THIS IS THE FIX
// // //     console.log(`👤 User ${userId} joined personal room`);
// // //   }

  
// // //   // Join a chat room (conversation)
// // //  socket.on("join-chat", ({ conversationId }) => {
// // //     socket.join(conversationId);
// // //     console.log("💬 Socket joined chat", conversationId);
// // //   });

// // //   socket.on("call-user", ({ toUserId, fromUser, conversationId, type }) => {
// // //     console.log("📞 Call request:", toUserId, type);

// // //     io.to(toUserId).emit("incoming-call", {
// // //       fromUser,
// // //       conversationId,
// // //       type,
// // //     });
// // //   });

// // //   socket.on("call-accepted", ({ toUserId, conversationId }) => {
// // //     io.to(toUserId).emit("call-accepted", { conversationId });
// // //   });

// // //   socket.on("end-call", ({ toUserId }) => {
// // //     io.to(toUserId).emit("call-ended");
// // //   });

// // //   socket.on("disconnect", () => {
// // //     console.log("❌ Client disconnected:", socket.id);
// // //   });



// // //   // Send message
// // //  socket.on("send-message", async ({ conversationId, senderId, text }) => {
// // //   const message = await Message.create({
// // //     conversationId,
// // //     sender: senderId,
// // //     text,
// // //     readBy: [senderId], // 👈 sender has read it
// // //   });

// // //   await Conversation.findByIdAndUpdate(conversationId, {
// // //     lastMessage: text,
// // //     lastSender: senderId,
// // //     updatedAt: new Date(),
// // //   });

// // //   io.to(conversationId).emit("new-message", {
// // //     _id: message._id,
// // //     conversationId,
// // //     sender: senderId,
// // //     text,
// // //     createdAt: message.createdAt,
// // //   });
// // // });

    
// // //   // JOIN SESSION
// // //   socket.on("join-session", async ({ sessionId, userId }) => {
// // //     socket.join(sessionId);
// // //     console.log(`👥 ${socket.id} joined session ${sessionId}`);

// // //     // Load or create the collab session
// // //     let session = await CollabSession.findOne({ sessionId });
// // //     if (!session) {
// // //       session = await CollabSession.create({
// // //         sessionId,
// // //         text: "",
// // //         participants: userId ? [{ userId }] : [],
// // //       });
// // //     }

// // //     // Send current text to this socket
// // //     socket.emit("prompt-initial", {
// // //       sessionId,
// // //       text: session.text,
// // //     });

// // //     // Send "joined" event to others
// // //     socket.to(sessionId).emit("user-joined", { userId });
// // //   });

// // //   // TEXT CHANGE
// // //   socket.on("prompt-change", async ({ sessionId, text, userId }) => {
// // //     if (!sessionId) return;

// // //     await CollabSession.findOneAndUpdate(
// // //       { sessionId },
// // //       { text, updatedAt: new Date() },
// // //       { upsert: true }
// // //     );

// // //     // Broadcast to others
// // //     socket.to(sessionId).emit("prompt-change", {
// // //       sessionId,
// // //       text,
// // //       userId,
// // //     });
// // //   });

// // //   // LEAVE SESSION
// // //   socket.on("leave-session", ({ sessionId, userId }) => {
// // //     socket.leave(sessionId);
// // //     socket.to(sessionId).emit("user-left", { userId });
// // //   });

// // //   socket.on("disconnect", () => {
// // //     console.log(`❌ Client disconnected: ${socket.id}`);
// // //   });




// // //   // END SESSION
// // // socket.on("end-session", async ({ sessionId, userId }) => {
// // //   if (!sessionId) return;

// // //   console.log(`🛑 Ending session ${sessionId}`);

// // //   // Remove session from DB
// // //   await CollabSession.deleteOne({ sessionId });

// // //   // Notify all users in room
// // //   io.to(sessionId).emit("session-ended", {
// // //     sessionId,
// // //     endedBy: userId,
// // //   });

// // //   // Force everyone to leave room
// // //   io.in(sessionId).socketsLeave(sessionId);
// // // });

// // // });















// // // // ✅ DB + Server
// // // const PORT = process.env.PORT || 5000;
// // // const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;

// // // if (!MONGO_URI) {
// // //   console.error("❌ Missing MONGO_URI / MONGODB_URI in .env");
// // //   process.exit(1);
// // // }




// // // mongoose
// // //   .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true, ssl: true })
// // //   .then(async() => {
// // //     console.log("✅ MongoDB connected");
// // //       // ✅ Seed admin once
// // //   await seedDefaultAdmin();
// // //     server.listen(PORT, () => {
// // //       console.log(`🚀 Server + Socket.io running on ${PORT}`);
// // //     });
// // //   })
// // //   .catch((err) => {
// // //     console.error("❌ MongoDB connection failed:", err);
// // //     process.exit(1);
// // //   });



// // // console.log("daily quota reset");




// // // server/index.js
// // require("dotenv").config();
// // require("./utils/passport");

// // const express = require("express");
// // const cors = require("cors");
// // const mongoose = require("mongoose");
// // const path = require("path");
// // const cron = require("node-cron");
// // const http = require("http");
// // const { Server } = require("socket.io");
// // const passport = require("passport");

// // const fetch = (...args) =>
// //   import("node-fetch").then(({ default: fetch }) => fetch(...args));

// // // Models
// // const CollabSession = require("./models/CollabSession");
// // const Message = require("./models/Message");
// // const Conversation = require("./models/Conversation");

// // // Jobs
// // const { resetDuePeriods } = require("./utils/jobs/resetPeriods");
// // const { updateSubscriptionStatuses } = require("./utils/jobs/subscriptionStatusCron");
// // const { seedDefaultAdmin } = require("./utils/seedAdmin");

// // // Routes
// // const authRoutes = require("./routes/authRoutes");
// // const quotaRoutes = require("./routes/quotaRoute");
// // const smartgenRoutes = require("./routes/smartgenRoutes");
// // const savedCollectionRoutes = require("./routes/savedCollectionRoutes");
// // const categoryRoutes = require("./routes/categoryRoutes");
// // const promptRoutes = require("./routes/promptRoutes");
// // const orgMembers = require("./routes/orgMembers");
// // const purchaseRoutes = require("./routes/purchaseRoutes");
// // const llmProviderRoutes = require("./routes/llmproviderRoutes");
// // const promptoptimizerRoutes = require("./routes/promptoptimizerRoutes");
// // const promptreportRoutes = require("./routes/promptreportRoutes");
// // const bankAccountRoutes = require("./routes/bankAccounts");
// // const billingOrders = require("./routes/billingOrders");
// // const billingVerify = require("./routes/billingVerify");
// // const billingHistory = require("./routes/billingHistory");
// // const feedbackRoutes = require("./routes/feedback");
// // const cartRoute = require("./routes/cartRoute");
// // const promptCollab = require("./routes/promptCollab");
// // const pricingRoutes = require("./routes/pricing");
// // const chatRoutes = require("./routes/chatRoutes");
// // const serviceRoutes = require("./routes/serviceRoutes");
// // const googleMeetRoutes = require("./routes/googleMeetRoutes");
// // const userRoutes = require("./routes/userRoutes");
// // const invoiceRoute = require("./routes/invoice.route");
// // const adminRoutes = require("./routes/adminRoutes");
// // const sellerRoutes = require("./routes/sellerRoutes");
// // const kycRoutes = require("./routes/kycRoutes");
// // const hireRoutes = require("./routes/hire.routes");
// // const adminEscrowRouter = require("./routes/adminEscrow");
// // const activityRoutes = require("./routes/activityRoutes");
// // const userAdminRoutes = require("./routes/userAdminRoutes");
// // const walletRoutes = require("./routes/walletRoutes");
// // const reportRoutes = require("./routes/report");
// // const screenRecordingRoutes = require("./routes/screenRecording");

// // // ✅ New separate admin message route
// // const adminMessageRoutes = require("./routes/adminMessageRoutes");

// // require("./cron/autoReleaseEscrow");

// // const app = express();

// // /* ===============================
// //    CORS
// // ================================ */
// // const allowedOrigins = [
// //   "http://localhost:5173",
// //   "https://gray-pebble-06934421e.6.azurestaticapps.net",
// //   process.env.FRONTEND_URL,
// // ].filter(Boolean);

// // const corsOptions = {
// //   origin: function (origin, callback) {
// //     console.log("CORS Origin:", origin);

// //     if (!origin || allowedOrigins.includes(origin)) {
// //       return callback(null, true);
// //     }

// //     return callback(new Error("CORS not allowed: " + origin));
// //   },
// //   credentials: true,
// //   methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
// //   allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
// //   optionsSuccessStatus: 204,
// // };

// // app.use(cors(corsOptions));
// // app.options(/.*/, cors(corsOptions));

// // app.use(express.json());
// // app.use(express.urlencoded({ extended: true }));

// // /* ===============================
// //    SMARTGEN OPTIMIZE API
// // ================================ */
// // app.post("/api/optimize", async (req, res) => {
// //   const {
// //     text,
// //     model = "gpt-4o-mini",
// //     temperature = 0.2,
// //     mode = "optimize",
// //   } = req.body;

// //   if (!text || !text.trim()) {
// //     return res.status(400).json({ error: "Missing 'text' field" });
// //   }

// //   if (!process.env.OPENAI_API_KEY) {
// //     return res.status(500).json({
// //       error: "Server misconfigured: missing OPENAI_API_KEY",
// //     });
// //   }

// //   console.log(`📩 Optimize request (${mode}) for:`, text.slice(0, 60));

// //   const systemPrompt =
// //     mode === "detailed"
// //       ? `
// // You are SmartGen — an expert AI Prompt Engineer who creates highly detailed, structured, step-by-step AI instruction prompts.

// // Your ONLY job: analyze the user's input and return a single, comprehensive, production-ready AI prompt. NO alternatives. NO variations. ONE perfect prompt.

// // The output optimizedText MUST use this EXACT formatting with double newlines between sections:

// // ## Role & Identity
// // You are a [specific expert role]...

// // ## Context & Goal
// // [2-3 sentences specific to user topic]

// // ## Core Responsibilities
// // 1. [responsibility]
// // 2. [responsibility]
// // 3. [responsibility]
// // 4. [responsibility]
// // 5. [responsibility]

// // ## Step-by-Step Process
// // Step 1: [detailed action]
// // Step 2: [detailed action]
// // Step 3: [detailed action]
// // Step 4: [detailed action]
// // Step 5: [detailed action]
// // Step 6: [detailed action]

// // ## Technical Specifications
// // - [spec 1]
// // - [spec 2]
// // - [spec 3]

// // ## Output Requirements
// // [exactly what to produce]

// // ## Rules & Constraints
// // - [rule 1]
// // - [rule 2]
// // - [rule 3]
// // - [rule 4]
// // - [rule 5]

// // ## Quality Standards
// // [measurable standards for this topic]

// // CRITICAL RULES:
// // - optimizedText MUST be 700-900 words
// // - Use ## for every section heading — do NOT skip headings
// // - Use "Step 1:", "Step 2:" etc — do NOT use bullet points for steps
// // - Use numbered list for Core Responsibilities
// // - Every section 100% specific to user topic — ZERO generic content
// // - NEVER execute the task — only write the instruction prompt
// // - Always start optimizedText with "You are..."
// // - steps array must have exactly 4 items with real content from the prompt

// // Return STRICT JSON ONLY — no text outside JSON:

// // {
// //   "optimizedText": "## Role & Identity\\nYou are a...\\n\\n## Context & Goal\\n...\\n\\n## Core Responsibilities\\n1. ...\\n2. ...\\n\\n## Step-by-Step Process\\nStep 1: ...\\nStep 2: ...\\n\\n## Technical Specifications\\n- ...\\n\\n## Output Requirements\\n...\\n\\n## Rules & Constraints\\n- ...\\n\\n## Quality Standards\\n...",
// //   "steps": [
// //     { "title": "Role & Identity", "content": "One specific line about who the AI is for THIS topic" },
// //     { "title": "Step-by-Step Process", "content": "One specific line about what the 6 steps cover for THIS topic" },
// //     { "title": "Technical Specifications", "content": "One specific line about technical details for THIS topic" },
// //     { "title": "Output & Rules", "content": "One specific line about deliverables and constraints for THIS topic" }
// //   ]
// // }

// // NO suggestions field. NO alternatives.
// // `
// //       : `
// // You are an AGGRESSIVE TEXT OPTIMIZATION EXPERT. Your job is to maximize token reduction while perfectly preserving core content. Return your response as a JSON object.

// // OPTIMIZATION RULES:
// // - PRESERVE 100% of original meaning, facts, and context
// // - REDUCE word count by 40-60%
// // - REMOVE all redundant phrases and filler words
// // - COMBINE multiple sentences into single, dense statements
// // - USE maximum conciseness without losing meaning
// // - REPLACE long phrases with shorter equivalents
// // - MAINTAIN original tone and intent
// // - NEVER add new information
// // - NEVER change core facts or message

// // SPECIAL RULE FOR "YOU ARE..." / "ACT AS..." PROMPTS:
// // - If input starts with "You are..." or "Act as..." KEEP THIS EXACT STRUCTURE in output and suggestions
// // - PRESERVE the role statement exactly as written
// // - Only optimize the content after the role statement

// // TOKEN REDUCTION TARGETS:
// // - Short text (50-100 words): 50-60% reduction
// // - Medium text (100-200 words): 45-55% reduction
// // - Long text (200+ words): 40-50% reduction
// // - Always preserve 100% of core meaning and facts

// // Return STRICT JSON ONLY with this exact format:
// // {
// //   "optimizedText": "the aggressively optimized version with maximum token reduction",
// //   "suggestions": [
// //     "comprehensive alternative optimized version 1",
// //     "comprehensive alternative optimized version 2",
// //     "comprehensive alternative optimized version 3"
// //   ]
// // }
// // `;

// //   try {
// //     const response = await fetch("https://api.openai.com/v1/chat/completions", {
// //       method: "POST",
// //       headers: {
// //         "Content-Type": "application/json",
// //         Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
// //       },
// //       body: JSON.stringify({
// //         model,
// //         temperature,
// //         max_tokens: 1200,
// //         messages: [
// //           { role: "system", content: systemPrompt },
// //           { role: "user", content: text },
// //         ],
// //         response_format: { type: "json_object" },
// //       }),
// //     });

// //     const data = await response.json();

// //     if (!response.ok) {
// //       console.error("❌ OpenAI API Error:", data);
// //       return res.status(response.status).json({
// //         error: data?.error?.message || "OpenAI error",
// //       });
// //     }

// //     const content = data?.choices?.[0]?.message?.content?.trim?.() || "";

// //     if (!content) {
// //       console.error("⚠️ Empty response from model:", data);
// //       return res.status(502).json({
// //         error: "Empty content from model",
// //         fallback: { optimizedText: text, suggestions: [] },
// //       });
// //     }

// //     let parsed;

// //     try {
// //       parsed = JSON.parse(content);
// //     } catch {
// //       console.warn("⚠️ Invalid JSON returned. Wrapping raw content.");
// //       parsed = { optimizedText: content, suggestions: [] };
// //     }

// //     if (mode === "optimize") {
// //       const originalWords = text.split(/\s+/).length;
// //       const optimizedWords = String(parsed.optimizedText || "").split(/\s+/).length;

// //       const reduction =
// //         originalWords > 0
// //           ? Math.round(((originalWords - optimizedWords) / originalWords) * 100)
// //           : 0;

// //       parsed.metrics = {
// //         originalWordCount: originalWords,
// //         optimizedWordCount: optimizedWords,
// //         reductionPercentage: reduction,
// //       };

// //       const isRolePrompt =
// //         text.toLowerCase().startsWith("you are") ||
// //         text.toLowerCase().startsWith("act as");

// //       if (isRolePrompt) {
// //         console.log("🔍 Detected role prompt - ensuring structure preservation");

// //         const openingMatch = text.match(/^(you are|act as)[^.!?]*/i);
// //         const exactOpening = openingMatch ? openingMatch[0] : null;

// //         if (exactOpening) {
// //           const optimizedText = String(parsed.optimizedText || "");

// //           const hasCorrectOpening =
// //             optimizedText.toLowerCase().startsWith("you are") ||
// //             optimizedText.toLowerCase().startsWith("act as");

// //           if (!hasCorrectOpening) {
// //             const cleanedText = optimizedText
// //               .replace(/^(you are|act as)[^.!?]*/i, "")
// //               .trim();

// //             parsed.optimizedText = `${exactOpening} ${cleanedText}`.trim();
// //           }

// //           if (parsed.suggestions && Array.isArray(parsed.suggestions)) {
// //             parsed.suggestions = parsed.suggestions.map((suggestion) => {
// //               const s = String(suggestion || "");

// //               const suggestionHasOpening =
// //                 s.toLowerCase().startsWith("you are") ||
// //                 s.toLowerCase().startsWith("act as");

// //               if (!suggestionHasOpening) {
// //                 const cleanedSuggestion = s
// //                   .replace(/^(you are|act as)[^.!?]*/i, "")
// //                   .trim();

// //                 return `${exactOpening} ${cleanedSuggestion}`.trim();
// //               }

// //               return s;
// //             });
// //           }
// //         }
// //       }

// //       if (parsed.suggestions && Array.isArray(parsed.suggestions)) {
// //         const uniqueSuggestions = [];

// //         parsed.suggestions.forEach((suggestion) => {
// //           const s = String(suggestion || "").trim();

// //           if (!s) return;

// //           const isDuplicate = uniqueSuggestions.some(
// //             (existing) =>
// //               existing.toLowerCase() === s.toLowerCase() ||
// //               existing.replace(/\s+/g, " ") === s.replace(/\s+/g, " ")
// //           );

// //           if (!isDuplicate) {
// //             uniqueSuggestions.push(s);
// //           }
// //         });

// //         parsed.suggestions = uniqueSuggestions;

// //         while (parsed.suggestions.length < 3) {
// //           const uniqueAlternatives = [
// //             "Alternative phrasing with same meaning",
// //             "Different structure preserving core content",
// //             "Reworded version maintaining original intent",
// //           ];

// //           parsed.suggestions.push(
// //             `${parsed.optimizedText} - ${
// //               uniqueAlternatives[parsed.suggestions.length]
// //             }`
// //           );
// //         }

// //         parsed.suggestions = [...new Set(parsed.suggestions)].slice(0, 3);
// //       }
// //     }

// //     if (mode === "detailed") {
// //       const optimizedText = String(parsed?.optimizedText || "");

// //       const looksLikeExecution =
// //         /(?:^|\b)(develop|create|design|write|generate|explain|plan|analyze|summarize|conduct)\b/i.test(
// //           optimizedText
// //         ) &&
// //         !optimizedText.toLowerCase().includes("you are") &&
// //         !optimizedText.toLowerCase().includes("act as");

// //       if (looksLikeExecution) {
// //         console.log("🔁 Model produced an answer instead of a prompt → retrying...");

// //         const retryPrompt = `
// // You mistakenly created a final answer instead of an AI instruction prompt.
// // Rewrite it into a single instruction starting with "You are..." or "Act as...".
// // Return JSON ONLY:
// // {"optimizedText":"rewritten prompt","suggestions":["alt1","alt2","alt3","alt4"]}
// // `;

// //         const retryResponse = await fetch(
// //           "https://api.openai.com/v1/chat/completions",
// //           {
// //             method: "POST",
// //             headers: {
// //               "Content-Type": "application/json",
// //               Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
// //             },
// //             body: JSON.stringify({
// //               model,
// //               temperature: 0.2,
// //               max_tokens: 500,
// //               messages: [
// //                 { role: "system", content: retryPrompt },
// //                 { role: "user", content: optimizedText || content },
// //               ],
// //               response_format: { type: "json_object" },
// //             }),
// //           }
// //         );

// //         const retryData = await retryResponse.json();
// //         const retryContent =
// //           retryData?.choices?.[0]?.message?.content?.trim?.() || "";

// //         if (!retryContent) {
// //           console.error("⚠️ Retry also returned empty content");
// //           return res.status(502).json({
// //             error: "Model retry failed",
// //             fallback: parsed,
// //           });
// //         }

// //         let retryParsed;

// //         try {
// //           retryParsed = JSON.parse(retryContent);
// //         } catch {
// //           retryParsed = { optimizedText: retryContent, suggestions: [] };
// //         }

// //         console.log("✅ Self-correction successful.");
// //         return res.json(retryParsed);
// //       }
// //     }

// //     console.log(
// //       "✅ Optimization successful. Mode:",
// //       mode,
// //       "Suggestions:",
// //       parsed.suggestions?.length || 0
// //     );

// //     return res.json(parsed);
// //   } catch (err) {
// //     console.error("🔥 Optimize route failed:", err);
// //     return res.status(500).json({ error: "Failed to contact OpenAI" });
// //   }
// // });

// // /* ===============================
// //    HEALTH + STATIC
// // ================================ */
// // app.get("/health", (_req, res) => res.json({ ok: true }));

// // app.use("/uploads", express.static(path.join(__dirname, "uploads")));
// // app.use("/uploads", express.static("uploads"));

// // /* ===============================
// //    API ROUTES
// // ================================ */
// // app.use(passport.initialize());

// // app.use("/api/auth", authRoutes);
// // app.use("/api/org/members", orgMembers);
// // app.use("/api/quota", quotaRoutes);
// // app.use("/api/smartgen", smartgenRoutes);
// // app.use("/api/saved-collections", savedCollectionRoutes);
// // app.use("/api/category", categoryRoutes);
// // app.use("/api/prompt", promptRoutes);
// // app.use("/api/purchase", purchaseRoutes);
// // app.use("/api/llm-provider", llmProviderRoutes);
// // app.use("/api/promptoptimizer", promptoptimizerRoutes);
// // app.use("/api/promptreport", promptreportRoutes);
// // app.use("/api/bankaccount", bankAccountRoutes);
// // app.use("/api/routes/pricing", pricingRoutes);
// // app.use("/api/plans/subscribe/order", billingOrders);
// // app.use("/api/plans/subscribe/verify", billingVerify);
// // app.use("/api/plans/subscribe/history", billingHistory);
// // app.use("/api/feedback", feedbackRoutes);
// // app.use("/api/cart", cartRoute);
// // app.use("/api/prompt-collab", promptCollab);
// // app.use("/api/chat", chatRoutes);
// // app.use("/api/services", serviceRoutes);
// // app.use("/api/google-meet", googleMeetRoutes);
// // app.use("/api/user", userAdminRoutes);
// // app.use("/api/user", userRoutes);
// // app.use("/api", invoiceRoute);
// // app.use("/api/admin", adminRoutes);
// // app.use("/api/seller", sellerRoutes);
// // app.use("/api/kyc", kycRoutes);
// // app.use("/api/activity", activityRoutes);
// // app.use("/api/wallet", walletRoutes);
// // app.use("/api/hire", hireRoutes);
// // app.use("/api/admin/escrow", adminEscrowRouter);
// // app.use("/api/report", reportRoutes);
// // app.use("/api/screen-recording", screenRecordingRoutes);

// // // ✅ Separate Admin Message APIs
// // app.use("/api/admin-message", adminMessageRoutes);

// // app.get("/", (req, res) => {
// //   res.sendFile(path.join(__dirname, "sample.html"));
// // });

// // /* ===============================
// //    CRON JOBS
// // ================================ */
// // cron.schedule("5 * * * *", async () => {
// //   try {
// //     await resetDuePeriods();
// //   } catch (e) {
// //     console.error("resetDuePeriods failed", e);
// //   }
// // });

// // cron.schedule("* * * * *", async () => {
// //   try {
// //     await updateSubscriptionStatuses();
// //   } catch (e) {
// //     console.error("status cron failed", e);
// //   }
// // });

// // /* ===============================
// //    SOCKET.IO
// // ================================ */
// // const server = http.createServer(app);

// // const io = new Server(server, {
// //   cors: {
// //     origin: [
// //       "http://localhost:5173",
// //       "https://gray-pebble-06934421e.6.azurestaticapps.net",
// //       process.env.FRONTEND_URL,
// //     ].filter(Boolean),
// //     methods: ["GET", "POST"],
// //     credentials: true,
// //   },
// // });

// // // ✅ IMPORTANT: adminMessageRoutes.js me req.app.get("io") ke liye
// // app.set("io", io);

// // // --- REAL-TIME SOCKET LOGIC ---
// // io.on("connection", (socket) => {
// //   console.log(`⚡ Client connected: ${socket.id}`);

// //   const userId = socket.handshake.auth?.userId;

// //   if (userId) {
// //     // Existing chat personal room
// //     socket.join(String(userId));

// //     // ✅ New admin-message personal room
// //     socket.join(`admin-message-user:${userId}`);

// //     console.log(`👤 User ${userId} joined personal room`);
// //     console.log(`📨 User ${userId} joined admin message user room`);
// //   }

// //   /* ===============================
// //      ADMIN MESSAGE SOCKETS
// //   ================================ */

// //   socket.on("admin-message:join", (payload = {}) => {
// //     const conversationId =
// //       typeof payload === "string" ? payload : payload.conversationId;

// //     if (!conversationId) return;

// //     socket.join(`admin-message:${conversationId}`);
// //     console.log("📨 Socket joined admin message room:", conversationId);
// //   });

// //   socket.on("admin-message:leave", (payload = {}) => {
// //     const conversationId =
// //       typeof payload === "string" ? payload : payload.conversationId;

// //     if (!conversationId) return;

// //     socket.leave(`admin-message:${conversationId}`);
// //     console.log("📨 Socket left admin message room:", conversationId);
// //   });

// //   /* ===============================
// //      EXISTING CHAT SOCKETS
// //   ================================ */

// //   socket.on("join-chat", (payload = {}) => {
// //     const conversationId =
// //       typeof payload === "string" ? payload : payload.conversationId;

// //     if (!conversationId) return;

// //     socket.join(String(conversationId));
// //     console.log("💬 Socket joined chat:", conversationId);
// //   });

// //   socket.on("send-message", async ({ conversationId, senderId, text }) => {
// //     try {
// //       if (!conversationId || !senderId || !String(text || "").trim()) return;

// //       const message = await Message.create({
// //         conversationId,
// //         sender: senderId,
// //         text,
// //         readBy: [senderId],
// //       });

// //       await Conversation.findByIdAndUpdate(conversationId, {
// //         lastMessage: text,
// //         lastSender: senderId,
// //         updatedAt: new Date(),
// //       });

// //       io.to(String(conversationId)).emit("new-message", {
// //         _id: message._id,
// //         conversationId,
// //         sender: senderId,
// //         text,
// //         createdAt: message.createdAt,
// //       });
// //     } catch (err) {
// //       console.error("Socket send-message error:", err);
// //       socket.emit("message-error", {
// //         success: false,
// //         error: "Message send failed",
// //       });
// //     }
// //   });

// //   /* ===============================
// //      CALL SOCKETS
// //   ================================ */

// //   socket.on("call-user", ({ toUserId, fromUser, conversationId, type }) => {
// //     console.log("📞 Call request:", toUserId, type);

// //     io.to(String(toUserId)).emit("incoming-call", {
// //       fromUser,
// //       conversationId,
// //       type,
// //     });
// //   });

// //   socket.on("call-accepted", ({ toUserId, conversationId }) => {
// //     io.to(String(toUserId)).emit("call-accepted", { conversationId });
// //   });

// //   socket.on("end-call", ({ toUserId }) => {
// //     io.to(String(toUserId)).emit("call-ended");
// //   });

// //   /* ===============================
// //      COLLAB SESSION SOCKETS
// //   ================================ */

// //   socket.on("join-session", async ({ sessionId, userId }) => {
// //     try {
// //       if (!sessionId) return;

// //       socket.join(String(sessionId));
// //       console.log(`👥 ${socket.id} joined session ${sessionId}`);

// //       let session = await CollabSession.findOne({ sessionId });

// //       if (!session) {
// //         session = await CollabSession.create({
// //           sessionId,
// //           text: "",
// //           participants: userId ? [{ userId }] : [],
// //         });
// //       }

// //       socket.emit("prompt-initial", {
// //         sessionId,
// //         text: session.text,
// //       });

// //       socket.to(String(sessionId)).emit("user-joined", { userId });
// //     } catch (err) {
// //       console.error("join-session error:", err);
// //     }
// //   });

// //   socket.on("prompt-change", async ({ sessionId, text, userId }) => {
// //     try {
// //       if (!sessionId) return;

// //       await CollabSession.findOneAndUpdate(
// //         { sessionId },
// //         { text, updatedAt: new Date() },
// //         { upsert: true }
// //       );

// //       socket.to(String(sessionId)).emit("prompt-change", {
// //         sessionId,
// //         text,
// //         userId,
// //       });
// //     } catch (err) {
// //       console.error("prompt-change error:", err);
// //     }
// //   });

// //   socket.on("leave-session", ({ sessionId, userId }) => {
// //     if (!sessionId) return;

// //     socket.leave(String(sessionId));
// //     socket.to(String(sessionId)).emit("user-left", { userId });
// //   });

// //   socket.on("end-session", async ({ sessionId, userId }) => {
// //     try {
// //       if (!sessionId) return;

// //       console.log(`🛑 Ending session ${sessionId}`);

// //       await CollabSession.deleteOne({ sessionId });

// //       io.to(String(sessionId)).emit("session-ended", {
// //         sessionId,
// //         endedBy: userId,
// //       });

// //       io.in(String(sessionId)).socketsLeave(String(sessionId));
// //     } catch (err) {
// //       console.error("end-session error:", err);
// //     }
// //   });

// //   socket.on("disconnect", () => {
// //     console.log(`❌ Client disconnected: ${socket.id}`);
// //   });
// // });

// // /* ===============================
// //    DB + SERVER START
// // ================================ */
// // const PORT = process.env.PORT || 5000;
// // const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;

// // if (!MONGO_URI) {
// //   console.error("❌ Missing MONGO_URI / MONGODB_URI in .env");
// //   process.exit(1);
// // }

// // mongoose
// //   .connect(MONGO_URI, {
// //     useNewUrlParser: true,
// //     useUnifiedTopology: true,
// //     ssl: true,
// //   })
// //   .then(async () => {
// //     console.log("✅ MongoDB connected");

// //     await seedDefaultAdmin();

// //     server.listen(PORT, () => {
// //       console.log(`🚀 Server + Socket.io running on ${PORT}`);
// //     });
// //   })
// //   .catch((err) => {
// //     console.error("❌ MongoDB connection failed:", err);
// //     process.exit(1);
// //   });

// // console.log("daily quota reset");



// // server/index.js
// require("dotenv").config();
// require("./utils/passport");

// const express = require("express");
// const cors = require("cors");
// const mongoose = require("mongoose");
// const path = require("path");
// const cron = require("node-cron");
// const http = require("http");
// const { Server } = require("socket.io");
// const passport = require("passport");

// const fetch = (...args) =>
//   import("node-fetch").then(({ default: fetch }) => fetch(...args));

// // Models
// const CollabSession = require("./models/CollabSession");
// const Message = require("./models/Message");
// const Conversation = require("./models/Conversation");

// // Jobs
// const { resetDuePeriods } = require("./utils/jobs/resetPeriods");
// const { updateSubscriptionStatuses } = require("./utils/jobs/subscriptionStatusCron");
// const { seedDefaultAdmin } = require("./utils/seedAdmin");

// // Routes
// const authRoutes = require("./routes/authRoutes");
// const quotaRoutes = require("./routes/quotaRoute");
// const smartgenRoutes = require("./routes/smartgenRoutes");
// const savedCollectionRoutes = require("./routes/savedCollectionRoutes");
// const categoryRoutes = require("./routes/categoryRoutes");
// const promptRoutes = require("./routes/promptRoutes");
// const orgMembers = require("./routes/orgMembers");
// const purchaseRoutes = require("./routes/purchaseRoutes");
// const llmProviderRoutes = require("./routes/llmproviderRoutes");
// const promptoptimizerRoutes = require("./routes/promptoptimizerRoutes");
// const promptreportRoutes = require("./routes/promptreportRoutes");
// const bankAccountRoutes = require("./routes/bankAccounts");
// const billingOrders = require("./routes/billingOrders");
// const billingVerify = require("./routes/billingVerify");
// const billingHistory = require("./routes/billingHistory");
// const feedbackRoutes = require("./routes/feedback");
// const cartRoute = require("./routes/cartRoute");
// const promptCollab = require("./routes/promptCollab");
// const pricingRoutes = require("./routes/pricing");
// const chatRoutes = require("./routes/chatRoutes");
// const serviceRoutes = require("./routes/serviceRoutes");
// const googleMeetRoutes = require("./routes/googleMeetRoutes");
// const userRoutes = require("./routes/userRoutes");
// const invoiceRoute = require("./routes/invoice.route");
// const adminRoutes = require("./routes/adminRoutes");
// const sellerRoutes = require("./routes/sellerRoutes");
// const kycRoutes = require("./routes/kycRoutes");
// const hireRoutes = require("./routes/hire.routes");
// const adminEscrowRouter = require("./routes/adminEscrow");
// const activityRoutes = require("./routes/activityRoutes");
// const userAdminRoutes = require("./routes/userAdminRoutes");
// const walletRoutes = require("./routes/walletRoutes");
// const reportRoutes = require("./routes/report");
// const screenRecordingRoutes = require("./routes/screenRecording");

// // ✅ New separate admin message route
// const adminMessageRoutes = require("./routes/adminMessageRoutes");

// require("./cron/autoReleaseEscrow");

// const app = express();

// /* ===============================
//    CORS
// ================================ */
// const allowedOrigins = [
//   "http://localhost:5173",
//   "https://gray-pebble-06934421e.6.azurestaticapps.net",
//   process.env.FRONTEND_URL,
// ].filter(Boolean);

// const corsOptions = {
//   origin: function (origin, callback) {
//     console.log("CORS Origin:", origin);

//     if (!origin || allowedOrigins.includes(origin)) {
//       return callback(null, true);
//     }

//     return callback(new Error("CORS not allowed: " + origin));
//   },
//   credentials: true,
//   methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
//   allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
//   optionsSuccessStatus: 204,
// };

// app.use(cors(corsOptions));
// app.options(/.*/, cors(corsOptions));

// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// /* ===============================
//    SMARTGEN OPTIMIZE API
// ================================ */
// app.post("/api/optimize", async (req, res) => {
//   const {
//     text,
//     model = "gpt-4o-mini",
//     temperature = 0.2,
//     mode = "optimize",
//   } = req.body;

//   if (!text || !text.trim()) {
//     return res.status(400).json({ error: "Missing 'text' field" });
//   }

//   if (!process.env.OPENAI_API_KEY) {
//     return res.status(500).json({
//       error: "Server misconfigured: missing OPENAI_API_KEY",
//     });
//   }

//   console.log(`📩 Optimize request (${mode}) for:`, text.slice(0, 60));

//   const systemPrompt =
//     mode === "detailed"
//       ? `
// You are SmartGen — an expert AI Prompt Engineer who creates highly detailed, structured, step-by-step AI instruction prompts.

// Your ONLY job: analyze the user's input and return a single, comprehensive, production-ready AI prompt. NO alternatives. NO variations. ONE perfect prompt.

// The output optimizedText MUST use this EXACT formatting with double newlines between sections:

// ## Role & Identity
// You are a [specific expert role]...

// ## Context & Goal
// [2-3 sentences specific to user topic]

// ## Core Responsibilities
// 1. [responsibility]
// 2. [responsibility]
// 3. [responsibility]
// 4. [responsibility]
// 5. [responsibility]

// ## Step-by-Step Process
// Step 1: [detailed action]
// Step 2: [detailed action]
// Step 3: [detailed action]
// Step 4: [detailed action]
// Step 5: [detailed action]
// Step 6: [detailed action]

// ## Technical Specifications
// - [spec 1]
// - [spec 2]
// - [spec 3]

// ## Output Requirements
// [exactly what to produce]

// ## Rules & Constraints
// - [rule 1]
// - [rule 2]
// - [rule 3]
// - [rule 4]
// - [rule 5]

// ## Quality Standards
// [measurable standards for this topic]

// CRITICAL RULES:
// - optimizedText MUST be 700-900 words
// - Use ## for every section heading — do NOT skip headings
// - Use "Step 1:", "Step 2:" etc — do NOT use bullet points for steps
// - Use numbered list for Core Responsibilities
// - Every section 100% specific to user topic — ZERO generic content
// - NEVER execute the task — only write the instruction prompt
// - Always start optimizedText with "You are..."
// - steps array must have exactly 4 items with real content from the prompt

// Return STRICT JSON ONLY — no text outside JSON:

// {
//   "optimizedText": "## Role & Identity\\nYou are a...\\n\\n## Context & Goal\\n...\\n\\n## Core Responsibilities\\n1. ...\\n2. ...\\n\\n## Step-by-Step Process\\nStep 1: ...\\nStep 2: ...\\n\\n## Technical Specifications\\n- ...\\n\\n## Output Requirements\\n...\\n\\n## Rules & Constraints\\n- ...\\n\\n## Quality Standards\\n...",
//   "steps": [
//     { "title": "Role & Identity", "content": "One specific line about who the AI is for THIS topic" },
//     { "title": "Step-by-Step Process", "content": "One specific line about what the 6 steps cover for THIS topic" },
//     { "title": "Technical Specifications", "content": "One specific line about technical details for THIS topic" },
//     { "title": "Output & Rules", "content": "One specific line about deliverables and constraints for THIS topic" }
//   ]
// }

// NO suggestions field. NO alternatives.
// `
//       : `
// You are an AGGRESSIVE TEXT OPTIMIZATION EXPERT. Your job is to maximize token reduction while perfectly preserving core content. Return your response as a JSON object.

// OPTIMIZATION RULES:
// - PRESERVE 100% of original meaning, facts, and context
// - REDUCE word count by 40-60%
// - REMOVE all redundant phrases and filler words
// - COMBINE multiple sentences into single, dense statements
// - USE maximum conciseness without losing meaning
// - REPLACE long phrases with shorter equivalents
// - MAINTAIN original tone and intent
// - NEVER add new information
// - NEVER change core facts or message

// SPECIAL RULE FOR "YOU ARE..." / "ACT AS..." PROMPTS:
// - If input starts with "You are..." or "Act as..." KEEP THIS EXACT STRUCTURE in output and suggestions
// - PRESERVE the role statement exactly as written
// - Only optimize the content after the role statement

// TOKEN REDUCTION TARGETS:
// - Short text (50-100 words): 50-60% reduction
// - Medium text (100-200 words): 45-55% reduction
// - Long text (200+ words): 40-50% reduction
// - Always preserve 100% of core meaning and facts

// Return STRICT JSON ONLY with this exact format:
// {
//   "optimizedText": "the aggressively optimized version with maximum token reduction",
//   "suggestions": [
//     "comprehensive alternative optimized version 1",
//     "comprehensive alternative optimized version 2",
//     "comprehensive alternative optimized version 3"
//   ]
// }
// `;

//   try {
//     const response = await fetch("https://api.openai.com/v1/chat/completions", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
//       },
//       body: JSON.stringify({
//         model,
//         temperature,
//         max_tokens: 1200,
//         messages: [
//           { role: "system", content: systemPrompt },
//           { role: "user", content: text },
//         ],
//         response_format: { type: "json_object" },
//       }),
//     });

//     const data = await response.json();

//     if (!response.ok) {
//       console.error("❌ OpenAI API Error:", data);
//       return res.status(response.status).json({
//         error: data?.error?.message || "OpenAI error",
//       });
//     }

//     const content = data?.choices?.[0]?.message?.content?.trim?.() || "";

//     if (!content) {
//       console.error("⚠️ Empty response from model:", data);
//       return res.status(502).json({
//         error: "Empty content from model",
//         fallback: { optimizedText: text, suggestions: [] },
//       });
//     }

//     let parsed;

//     try {
//       parsed = JSON.parse(content);
//     } catch {
//       console.warn("⚠️ Invalid JSON returned. Wrapping raw content.");
//       parsed = { optimizedText: content, suggestions: [] };
//     }

//     if (mode === "optimize") {
//       const originalWords = text.split(/\s+/).length;
//       const optimizedWords = String(parsed.optimizedText || "").split(/\s+/).length;

//       const reduction =
//         originalWords > 0
//           ? Math.round(((originalWords - optimizedWords) / originalWords) * 100)
//           : 0;

//       parsed.metrics = {
//         originalWordCount: originalWords,
//         optimizedWordCount: optimizedWords,
//         reductionPercentage: reduction,
//       };

//       const isRolePrompt =
//         text.toLowerCase().startsWith("you are") ||
//         text.toLowerCase().startsWith("act as");

//       if (isRolePrompt) {
//         console.log("🔍 Detected role prompt - ensuring structure preservation");

//         const openingMatch = text.match(/^(you are|act as)[^.!?]*/i);
//         const exactOpening = openingMatch ? openingMatch[0] : null;

//         if (exactOpening) {
//           const optimizedText = String(parsed.optimizedText || "");

//           const hasCorrectOpening =
//             optimizedText.toLowerCase().startsWith("you are") ||
//             optimizedText.toLowerCase().startsWith("act as");

//           if (!hasCorrectOpening) {
//             const cleanedText = optimizedText
//               .replace(/^(you are|act as)[^.!?]*/i, "")
//               .trim();

//             parsed.optimizedText = `${exactOpening} ${cleanedText}`.trim();
//           }

//           if (parsed.suggestions && Array.isArray(parsed.suggestions)) {
//             parsed.suggestions = parsed.suggestions.map((suggestion) => {
//               const s = String(suggestion || "");

//               const suggestionHasOpening =
//                 s.toLowerCase().startsWith("you are") ||
//                 s.toLowerCase().startsWith("act as");

//               if (!suggestionHasOpening) {
//                 const cleanedSuggestion = s
//                   .replace(/^(you are|act as)[^.!?]*/i, "")
//                   .trim();

//                 return `${exactOpening} ${cleanedSuggestion}`.trim();
//               }

//               return s;
//             });
//           }
//         }
//       }

//       if (parsed.suggestions && Array.isArray(parsed.suggestions)) {
//         const uniqueSuggestions = [];

//         parsed.suggestions.forEach((suggestion) => {
//           const s = String(suggestion || "").trim();

//           if (!s) return;

//           const isDuplicate = uniqueSuggestions.some(
//             (existing) =>
//               existing.toLowerCase() === s.toLowerCase() ||
//               existing.replace(/\s+/g, " ") === s.replace(/\s+/g, " ")
//           );

//           if (!isDuplicate) {
//             uniqueSuggestions.push(s);
//           }
//         });

//         parsed.suggestions = uniqueSuggestions;

//         while (parsed.suggestions.length < 3) {
//           const uniqueAlternatives = [
//             "Alternative phrasing with same meaning",
//             "Different structure preserving core content",
//             "Reworded version maintaining original intent",
//           ];

//           parsed.suggestions.push(
//             `${parsed.optimizedText} - ${
//               uniqueAlternatives[parsed.suggestions.length]
//             }`
//           );
//         }

//         parsed.suggestions = [...new Set(parsed.suggestions)].slice(0, 3);
//       }
//     }

//     if (mode === "detailed") {
//       const optimizedText = String(parsed?.optimizedText || "");

//       const looksLikeExecution =
//         /(?:^|\b)(develop|create|design|write|generate|explain|plan|analyze|summarize|conduct)\b/i.test(
//           optimizedText
//         ) &&
//         !optimizedText.toLowerCase().includes("you are") &&
//         !optimizedText.toLowerCase().includes("act as");

//       if (looksLikeExecution) {
//         console.log("🔁 Model produced an answer instead of a prompt → retrying...");

//         const retryPrompt = `
// You mistakenly created a final answer instead of an AI instruction prompt.
// Rewrite it into a single instruction starting with "You are..." or "Act as...".
// Return JSON ONLY:
// {"optimizedText":"rewritten prompt","suggestions":["alt1","alt2","alt3","alt4"]}
// `;

//         const retryResponse = await fetch(
//           "https://api.openai.com/v1/chat/completions",
//           {
//             method: "POST",
//             headers: {
//               "Content-Type": "application/json",
//               Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
//             },
//             body: JSON.stringify({
//               model,
//               temperature: 0.2,
//               max_tokens: 500,
//               messages: [
//                 { role: "system", content: retryPrompt },
//                 { role: "user", content: optimizedText || content },
//               ],
//               response_format: { type: "json_object" },
//             }),
//           }
//         );

//         const retryData = await retryResponse.json();
//         const retryContent =
//           retryData?.choices?.[0]?.message?.content?.trim?.() || "";

//         if (!retryContent) {
//           console.error("⚠️ Retry also returned empty content");
//           return res.status(502).json({
//             error: "Model retry failed",
//             fallback: parsed,
//           });
//         }

//         let retryParsed;

//         try {
//           retryParsed = JSON.parse(retryContent);
//         } catch {
//           retryParsed = { optimizedText: retryContent, suggestions: [] };
//         }

//         console.log("✅ Self-correction successful.");
//         return res.json(retryParsed);
//       }
//     }

//     console.log(
//       "✅ Optimization successful. Mode:",
//       mode,
//       "Suggestions:",
//       parsed.suggestions?.length || 0
//     );

//     return res.json(parsed);
//   } catch (err) {
//     console.error("🔥 Optimize route failed:", err);
//     return res.status(500).json({ error: "Failed to contact OpenAI" });
//   }
// });

// /* ===============================
//    HEALTH + STATIC
// ================================ */
// app.get("/health", (_req, res) => res.json({ ok: true }));

// app.use("/uploads", express.static(path.join(__dirname, "uploads")));
// app.use("/uploads", express.static("uploads"));

// /* ===============================
//    API ROUTES
// ================================ */
// app.use(passport.initialize());

// app.use("/api/auth", authRoutes);
// app.use("/api/org/members", orgMembers);
// app.use("/api/quota", quotaRoutes);
// app.use("/api/smartgen", smartgenRoutes);
// app.use("/api/saved-collections", savedCollectionRoutes);
// app.use("/api/category", categoryRoutes);
// app.use("/api/prompt", promptRoutes);
// app.use("/api/purchase", purchaseRoutes);
// app.use("/api/llm-provider", llmProviderRoutes);
// app.use("/api/promptoptimizer", promptoptimizerRoutes);
// app.use("/api/promptreport", promptreportRoutes);
// app.use("/api/bankaccount", bankAccountRoutes);
// app.use("/api/routes/pricing", pricingRoutes);
// app.use("/api/plans/subscribe/order", billingOrders);
// app.use("/api/plans/subscribe/verify", billingVerify);
// app.use("/api/plans/subscribe/history", billingHistory);
// app.use("/api/feedback", feedbackRoutes);
// app.use("/api/cart", cartRoute);
// app.use("/api/prompt-collab", promptCollab);
// app.use("/api/chat", chatRoutes);
// app.use("/api/services", serviceRoutes);
// app.use("/api/google-meet", googleMeetRoutes);
// app.use("/api/user", userAdminRoutes);
// app.use("/api/user", userRoutes);
// app.use("/api", invoiceRoute);
// app.use("/api/admin", adminRoutes);
// app.use("/api/seller", sellerRoutes);
// app.use("/api/kyc", kycRoutes);
// app.use("/api/activity", activityRoutes);
// app.use("/api/wallet", walletRoutes);
// app.use("/api/hire", hireRoutes);
// app.use("/api/admin/escrow", adminEscrowRouter);
// app.use("/api/report", reportRoutes);
// app.use("/api/screen-recording", screenRecordingRoutes);

// // ✅ Separate Admin Message APIs
// app.use("/api/admin-message", adminMessageRoutes);

// app.get("/", (req, res) => {
//   res.sendFile(path.join(__dirname, "sample.html"));
// });

// /* ===============================
//    CRON JOBS
// ================================ */
// cron.schedule("5 * * * *", async () => {
//   try {
//     await resetDuePeriods();
//   } catch (e) {
//     console.error("resetDuePeriods failed", e);
//   }
// });

// cron.schedule("* * * * *", async () => {
//   try {
//     await updateSubscriptionStatuses();
//   } catch (e) {
//     console.error("status cron failed", e);
//   }
// });

// /* ===============================
//    SOCKET.IO
// ================================ */
// const server = http.createServer(app);

// const io = new Server(server, {
//   cors: {
//     origin: [
//       "http://localhost:5173",
//       "https://gray-pebble-06934421e.6.azurestaticapps.net",
//       process.env.FRONTEND_URL,
//     ].filter(Boolean),
//     methods: ["GET", "POST"],
//     credentials: true,
//   },
// });

// // ✅ IMPORTANT: adminMessageRoutes.js me req.app.get("io") ke liye
// app.set("io", io);

// // --- REAL-TIME SOCKET LOGIC ---
// io.on("connection", (socket) => {
//   console.log(`⚡ Client connected: ${socket.id}`);

//   const userId = socket.handshake.auth?.userId;

//   if (userId) {
//     // Existing chat personal room
//     socket.join(String(userId));

//     // ✅ New admin-message personal room
//     socket.join(`admin-message-user:${userId}`);

//     console.log(`👤 User ${userId} joined personal room`);
//     console.log(`📨 User ${userId} joined admin message user room`);
//   }

//   /* ===============================
//      ADMIN MESSAGE SOCKETS
//   ================================ */

//   socket.on("admin-message:join", (payload = {}) => {
//     const conversationId =
//       typeof payload === "string" ? payload : payload.conversationId;

//     if (!conversationId) return;

//     socket.join(`admin-message:${conversationId}`);
//     console.log("📨 Socket joined admin message room:", conversationId);
//   });

//   socket.on("admin-message:leave", (payload = {}) => {
//     const conversationId =
//       typeof payload === "string" ? payload : payload.conversationId;

//     if (!conversationId) return;

//     socket.leave(`admin-message:${conversationId}`);
//     console.log("📨 Socket left admin message room:", conversationId);
//   });

//   /* ===============================
//      EXISTING CHAT SOCKETS
//   ================================ */

//   socket.on("join-chat", (payload = {}) => {
//     const conversationId =
//       typeof payload === "string" ? payload : payload.conversationId;

//     if (!conversationId) return;

//     socket.join(String(conversationId));
//     console.log("💬 Socket joined chat:", conversationId);
//   });

//   socket.on("send-message", async ({ conversationId, senderId, text }) => {
//     try {
//       if (!conversationId || !senderId || !String(text || "").trim()) return;

//       const message = await Message.create({
//         conversationId,
//         sender: senderId,
//         text,
//         readBy: [senderId],
//       });

//       await Conversation.findByIdAndUpdate(conversationId, {
//         lastMessage: text,
//         lastSender: senderId,
//         updatedAt: new Date(),
//       });

//       io.to(String(conversationId)).emit("new-message", {
//         _id: message._id,
//         conversationId,
//         sender: senderId,
//         text,
//         createdAt: message.createdAt,
//       });
//     } catch (err) {
//       console.error("Socket send-message error:", err);
//       socket.emit("message-error", {
//         success: false,
//         error: "Message send failed",
//       });
//     }
//   });

//   /* ===============================
//      CALL SOCKETS
//   ================================ */

//   socket.on("call-user", ({ toUserId, fromUser, conversationId, type }) => {
//     console.log("📞 Call request:", toUserId, type);

//     io.to(String(toUserId)).emit("incoming-call", {
//       fromUser,
//       conversationId,
//       type,
//     });
//   });

//   socket.on("call-accepted", ({ toUserId, conversationId }) => {
//     io.to(String(toUserId)).emit("call-accepted", { conversationId });
//   });

//   socket.on("end-call", ({ toUserId }) => {
//     io.to(String(toUserId)).emit("call-ended");
//   });

//   /* ===============================
//      COLLAB SESSION SOCKETS
//   ================================ */

//   socket.on("join-session", async ({ sessionId, userId }) => {
//     try {
//       if (!sessionId) return;

//       socket.join(String(sessionId));
//       console.log(`👥 ${socket.id} joined session ${sessionId}`);

//       let session = await CollabSession.findOne({ sessionId });

//       if (!session) {
//         session = await CollabSession.create({
//           sessionId,
//           text: "",
//           participants: userId ? [{ userId }] : [],
//         });
//       }

//       socket.emit("prompt-initial", {
//         sessionId,
//         text: session.text,
//       });

//       socket.to(String(sessionId)).emit("user-joined", { userId });
//     } catch (err) {
//       console.error("join-session error:", err);
//     }
//   });

//   socket.on("prompt-change", async ({ sessionId, text, userId }) => {
//     try {
//       if (!sessionId) return;

//       await CollabSession.findOneAndUpdate(
//         { sessionId },
//         { text, updatedAt: new Date() },
//         { upsert: true }
//       );

//       socket.to(String(sessionId)).emit("prompt-change", {
//         sessionId,
//         text,
//         userId,
//       });
//     } catch (err) {
//       console.error("prompt-change error:", err);
//     }
//   });

//   socket.on("leave-session", ({ sessionId, userId }) => {
//     if (!sessionId) return;

//     socket.leave(String(sessionId));
//     socket.to(String(sessionId)).emit("user-left", { userId });
//   });

//   socket.on("end-session", async ({ sessionId, userId }) => {
//     try {
//       if (!sessionId) return;

//       console.log(`🛑 Ending session ${sessionId}`);

//       await CollabSession.deleteOne({ sessionId });

//       io.to(String(sessionId)).emit("session-ended", {
//         sessionId,
//         endedBy: userId,
//       });

//       io.in(String(sessionId)).socketsLeave(String(sessionId));
//     } catch (err) {
//       console.error("end-session error:", err);
//     }
//   });

//   socket.on("disconnect", () => {
//     console.log(`❌ Client disconnected: ${socket.id}`);
//   });
// });

// /* ===============================
//    DB + SERVER START
// ================================ */
// const PORT = process.env.PORT || 5000;
// const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;

// if (!MONGO_URI) {
//   console.error("❌ Missing MONGO_URI / MONGODB_URI in .env");
//   process.exit(1);
// }

// mongoose
//   .connect(MONGO_URI, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//     ssl: true,
//   })
//   .then(async () => {
//     console.log("✅ MongoDB connected");

//     /* ===============================
//        ✅ AdminConversation index cleanup
//        Purana galat index (sellerUserId wala) + galat data
//        automatically drop/clean karo, phir sahi index sync.
//     ================================ */
//     try {
//       const AdminConversation = require("./models/AdminConversation");

//       const indexes = await AdminConversation.collection.indexes();
//       console.log(
//         "📑 AdminConversation indexes:",
//         indexes.map((i) => i.name)
//       );

//       // koi bhi index jismein sellerUserId field ho use drop karo
//       const badIndexes = indexes.filter(
//         (i) =>
//           i.key &&
//           Object.prototype.hasOwnProperty.call(i.key, "sellerUserId")
//       );

//       for (const idx of badIndexes) {
//         await AdminConversation.collection.dropIndex(idx.name);
//         console.log(`🗑️ Dropped stale index: ${idx.name}`);
//       }

//       // galat data (sellerUserId field wale, sellerId ke bina) saaf karo
//       const cleaned = await AdminConversation.collection.deleteMany({
//         sellerUserId: { $exists: true },
//         sellerId: { $exists: false },
//       });
//       if (cleaned.deletedCount) {
//         console.log(
//           `🧹 Removed bad AdminConversation docs: ${cleaned.deletedCount}`
//         );
//       }

//       // sahi index (adminId_1_sellerId_1) sync karo
//       await AdminConversation.syncIndexes();
//       console.log("✅ AdminConversation indexes synced");
//     } catch (e) {
//       console.error("Index cleanup warning:", e?.message);
//     }

//     await seedDefaultAdmin();

//     server.listen(PORT, () => {
//       console.log(`🚀 Server + Socket.io running on ${PORT}`);
//     });
//   })
//   .catch((err) => {
//     console.error("❌ MongoDB connection failed:", err);
//     process.exit(1);
//   });

// console.log("daily quota reset");


// server/index.js
require("dotenv").config();
require("./utils/passport");

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");
const multer = require("multer");
const pdfParse = require("pdf-parse");
const cron = require("node-cron");
const http = require("http");
const { Server } = require("socket.io");
const passport = require("passport");

const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

// Models
const CollabSession = require("./models/CollabSession");
const Message = require("./models/Message");
const Conversation = require("./models/Conversation");

// ✅ Admin message models (reverse-mirror ke liye: user reply -> admin dashboard)
const AdminConversation = require("./models/AdminConversation");
const AdminMessage = require("./models/AdminMessage");
const User = require("./models/User");

// Jobs
const { resetDuePeriods } = require("./utils/jobs/resetPeriods");
const { updateSubscriptionStatuses } = require("./utils/jobs/subscriptionStatusCron");
const { seedDefaultAdmin } = require("./utils/seedAdmin");

// Routes
const authRoutes = require("./routes/authRoutes");
const quotaRoutes = require("./routes/quotaRoute");
const smartgenRoutes = require("./routes/smartgenRoutes");
const savedCollectionRoutes = require("./routes/savedCollectionRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const promptRoutes = require("./routes/promptRoutes");
const orgMembers = require("./routes/orgMembers");
const purchaseRoutes = require("./routes/purchaseRoutes");
const llmProviderRoutes = require("./routes/llmproviderRoutes");
const promptoptimizerRoutes = require("./routes/promptoptimizerRoutes");
const promptreportRoutes = require("./routes/promptreportRoutes");
const bankAccountRoutes = require("./routes/bankAccounts");
const billingOrders = require("./routes/billingOrders");
const billingVerify = require("./routes/billingVerify");
const billingHistory = require("./routes/billingHistory");
const feedbackRoutes = require("./routes/feedback");
const cartRoute = require("./routes/cartRoute");
const promptCollab = require("./routes/promptCollab");
const pricingRoutes = require("./routes/pricing");
const chatRoutes = require("./routes/chatRoutes");
const serviceRoutes = require("./routes/serviceRoutes");
const googleMeetRoutes = require("./routes/googleMeetRoutes");
const userRoutes = require("./routes/userRoutes");
const invoiceRoute = require("./routes/invoice.route");
const adminRoutes = require("./routes/adminRoutes");
const sellerRoutes = require("./routes/sellerRoutes");
const kycRoutes = require("./routes/kycRoutes");
const hireRoutes = require("./routes/hire.routes");
const adminEscrowRouter = require("./routes/adminEscrow");
const adminPlatformRevenueRouter = require("./routes/adminPlatformRevenue");
const activityRoutes = require("./routes/activityRoutes");
const userAdminRoutes = require("./routes/userAdminRoutes");
const walletRoutes = require("./routes/walletRoutes");
const reportRoutes = require("./routes/report");
const screenRecordingRoutes = require("./routes/screenRecording");

// ✅ New separate admin message route
const adminMessageRoutes = require("./routes/adminMessageRoutes");

// ✅ SkillEngine + Memory
const { buildEnrichedSystemPrompt, validateDetailedOutput, buildRetryPrompt } = require("./skillEngine/skillEngine");
const memoryRoutes = require("./memory/memoryRoutes");
const { getRelevantMemoryContext } = require("./memory/memoryRetriever");
const { extractAndStoreMemories } = require("./memory/memoryExtractor");
const { requireAuth } = require("./utils/auth");
const smartgenDetectRoutes = require("./routes/smartgenDetectRoutes");

require("./cron/autoReleaseEscrow");
require("./cron/autoReleaseServiceEscrow");

const app = express();

/* ===============================
   CORS
================================ */
const allowedOrigins = [
  "http://localhost:5173",
  "https://gray-pebble-06934421e.6.azurestaticapps.net",
  process.env.FRONTEND_URL,
].filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {

    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error("CORS not allowed: " + origin));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));

// Razorpay webhook needs the RAW request body for HMAC signature verification —
// must be registered before the global express.json() below, since that
// middleware would otherwise consume/parse the stream first.
const { handleRazorpayWebhook } = require("./routes/razorpayWebhook");
app.post(
  "/api/hire/webhook/razorpay",
  express.raw({ type: "application/json" }),
  handleRazorpayWebhook
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ===============================
   SMARTGEN OPTIMIZE API
================================ */
app.post("/api/optimize", async (req, res) => {
  const {
    text,
    model = "gpt-4o-mini",
    temperature = 0.2,
    mode = "optimize",
  } = req.body;

  if (!text || !text.trim()) {
    return res.status(400).json({ error: "Missing 'text' field" });
  }

  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({
      error: "Server misconfigured: missing OPENAI_API_KEY",
    });
  }


  let systemPrompt;
  let sectionSchema = null;

  if (mode === "detailed") {
    try {
      const built = await buildEnrichedSystemPrompt(text, { skillMode: true });
      systemPrompt = built.prompt;
      sectionSchema = built.sectionSchema;
    } catch (skillErr) {
      console.error("⚠️ skillEngine failed, using fallback prompt:", skillErr.message);
      systemPrompt = `You are SmartGen — an expert AI Prompt Engineer. Analyze the user's input and return a single production-ready AI system prompt as strict JSON: {"optimizedText":"...","suggestions":["alt 1","alt 2","alt 3"]}`;
    }
  } else {
    systemPrompt = `
You are an AGGRESSIVE TEXT OPTIMIZATION EXPERT. Your job is to maximize token reduction while perfectly preserving core content. Return your response as a JSON object.

OPTIMIZATION RULES:
- PRESERVE 100% of original meaning, facts, and context
- REDUCE word count by 40-60%
- REMOVE all redundant phrases and filler words
- COMBINE multiple sentences into single, dense statements
- USE maximum conciseness without losing meaning
- REPLACE long phrases with shorter equivalents
- MAINTAIN original tone and intent
- NEVER add new information
- NEVER change core facts or message

SPECIAL RULE FOR "YOU ARE..." / "ACT AS..." PROMPTS:
- If input starts with "You are..." or "Act as..." KEEP THIS EXACT STRUCTURE in output and suggestions
- PRESERVE the role statement exactly as written
- Only optimize the content after the role statement

TOKEN REDUCTION TARGETS:
- Short text (50-100 words): 50-60% reduction
- Medium text (100-200 words): 45-55% reduction
- Long text (200+ words): 40-50% reduction
- Always preserve 100% of core meaning and facts

Return STRICT JSON ONLY with this exact format:
{
  "optimizedText": "the aggressively optimized version with maximum token reduction",
  "suggestions": [
    "comprehensive alternative optimized version 1",
    "comprehensive alternative optimized version 2",
    "comprehensive alternative optimized version 3"
  ]
}
`;
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model,
        temperature,
        max_tokens: 1200,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: text },
        ],
        response_format: { type: "json_object" },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("❌ OpenAI API Error:", data);
      return res.status(response.status).json({
        error: data?.error?.message || "OpenAI error",
      });
    }

    const content = data?.choices?.[0]?.message?.content?.trim?.() || "";

    if (!content) {
      console.error("⚠️ Empty response from model:", data);
      return res.status(502).json({
        error: "Empty content from model",
        fallback: { optimizedText: text, suggestions: [] },
      });
    }

    let parsed;

    try {
      parsed = JSON.parse(content);
    } catch {
      console.warn("⚠️ Invalid JSON returned. Wrapping raw content.");
      parsed = { optimizedText: content, suggestions: [] };
    }

    if (mode === "optimize") {
      const originalWords = text.split(/\s+/).length;
      const optimizedWords = String(parsed.optimizedText || "").split(/\s+/).length;

      const reduction =
        originalWords > 0
          ? Math.round(((originalWords - optimizedWords) / originalWords) * 100)
          : 0;

      parsed.metrics = {
        originalWordCount: originalWords,
        optimizedWordCount: optimizedWords,
        reductionPercentage: reduction,
      };

      const isRolePrompt =
        text.toLowerCase().startsWith("you are") ||
        text.toLowerCase().startsWith("act as");

      if (isRolePrompt) {

        const openingMatch = text.match(/^(you are|act as)[^.!?]*/i);
        const exactOpening = openingMatch ? openingMatch[0] : null;

        if (exactOpening) {
          const optimizedText = String(parsed.optimizedText || "");

          const hasCorrectOpening =
            optimizedText.toLowerCase().startsWith("you are") ||
            optimizedText.toLowerCase().startsWith("act as");

          if (!hasCorrectOpening) {
            const cleanedText = optimizedText
              .replace(/^(you are|act as)[^.!?]*/i, "")
              .trim();

            parsed.optimizedText = `${exactOpening} ${cleanedText}`.trim();
          }

          if (parsed.suggestions && Array.isArray(parsed.suggestions)) {
            parsed.suggestions = parsed.suggestions.map((suggestion) => {
              const s = String(suggestion || "");

              const suggestionHasOpening =
                s.toLowerCase().startsWith("you are") ||
                s.toLowerCase().startsWith("act as");

              if (!suggestionHasOpening) {
                const cleanedSuggestion = s
                  .replace(/^(you are|act as)[^.!?]*/i, "")
                  .trim();

                return `${exactOpening} ${cleanedSuggestion}`.trim();
              }

              return s;
            });
          }
        }
      }

      if (parsed.suggestions && Array.isArray(parsed.suggestions)) {
        const uniqueSuggestions = [];

        parsed.suggestions.forEach((suggestion) => {
          const s = String(suggestion || "").trim();

          if (!s) return;

          const isDuplicate = uniqueSuggestions.some(
            (existing) =>
              existing.toLowerCase() === s.toLowerCase() ||
              existing.replace(/\s+/g, " ") === s.replace(/\s+/g, " ")
          );

          if (!isDuplicate) {
            uniqueSuggestions.push(s);
          }
        });

        parsed.suggestions = uniqueSuggestions;

        while (parsed.suggestions.length < 3) {
          const uniqueAlternatives = [
            "Alternative phrasing with same meaning",
            "Different structure preserving core content",
            "Reworded version maintaining original intent",
          ];

          parsed.suggestions.push(
            `${parsed.optimizedText} - ${
              uniqueAlternatives[parsed.suggestions.length]
            }`
          );
        }

        parsed.suggestions = [...new Set(parsed.suggestions)].slice(0, 3);
      }
    }

    if (mode === "detailed") {
      const optimizedText = String(parsed?.optimizedText || "");

      const looksLikeExecution =
        /(?:^|\b)(develop|create|design|write|generate|explain|plan|analyze|summarize|conduct)\b/i.test(
          optimizedText
        ) &&
        !optimizedText.toLowerCase().includes("you are") &&
        !optimizedText.toLowerCase().includes("act as");

      if (looksLikeExecution) {

        const retryPrompt = `
You mistakenly created a final answer instead of an AI instruction prompt.
Rewrite it into a single instruction starting with "You are..." or "Act as...".
Return JSON ONLY:
{"optimizedText":"rewritten prompt","suggestions":["alt1","alt2","alt3","alt4"]}
`;

        const retryResponse = await fetch(
          "https://api.openai.com/v1/chat/completions",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
            },
            body: JSON.stringify({
              model,
              temperature: 0.2,
              max_tokens: 500,
              messages: [
                { role: "system", content: retryPrompt },
                { role: "user", content: optimizedText || content },
              ],
              response_format: { type: "json_object" },
            }),
          }
        );

        const retryData = await retryResponse.json();
        const retryContent =
          retryData?.choices?.[0]?.message?.content?.trim?.() || "";

        if (!retryContent) {
          console.error("⚠️ Retry also returned empty content");
          return res.status(502).json({
            error: "Model retry failed",
            fallback: parsed,
          });
        }

        let retryParsed;

        try {
          retryParsed = JSON.parse(retryContent);
        } catch {
          retryParsed = { optimizedText: retryContent, suggestions: [] };
        }

        return res.json(retryParsed);
      }
    }

    if (sectionSchema) parsed.sectionSchema = sectionSchema;
    return res.json(parsed);
  } catch (err) {
    console.error("🔥 Optimize route failed:", err);
    return res.status(500).json({ error: "Failed to contact OpenAI" });
  }
});

/* ===============================
   HEALTH + STATIC
================================ */
app.get("/health", (_req, res) => res.json({ ok: true }));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/uploads", express.static("uploads"));

/* ===============================
   API ROUTES
================================ */
app.use(passport.initialize());

app.use("/api/auth", authRoutes);
app.use("/api/org/members", orgMembers);
app.use("/api/quota", quotaRoutes);

/* ===============================
   SMARTGEN STREAM (SSE)
   Must be registered BEFORE app.use("/api/smartgen", ...) so the
   /stream path isn't matched by the GET /:id catch-all inside smartgenRoutes.
================================ */
app.post("/api/smartgen/stream", requireAuth, async (req, res) => {
  const { prompt, context = {}, skillMode = false } = req.body || {};

  if (!prompt || typeof prompt !== "string" || prompt.trim().length < 3) {
    return res.status(400).json({ success: false, error: "prompt_required" });
  }
  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({ success: false, error: "missing_openai_key" });
  }

  const userId = req.user?.id || req.user?._id?.toString?.() || null;
  const isDeepMode = !!(context.deepAnswers && Object.keys(context.deepAnswers || {}).length > 0);

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders();

  const sendEvent = (data) => {
    if (!res.writableEnded) {
      res.write(`data: ${JSON.stringify(data)}\n\n`);
      if (typeof res.flush === "function") res.flush();
    }
  };

  let systemPrompt;
  let sectionSchema = null;

  if (!skillMode) {
    systemPrompt = `You are SmartGen, an elite AI prompt engineer. Transform the user's rough idea into a powerful, ready-to-use AI prompt.

Your output must be plain prose — NO JSON wrappers, NO markdown fences, NO section headers, NO bullet lists. Write 150–350 words of flowing, detailed instructional text that would serve as an excellent system prompt for another AI.

Focus on:
- Clear role and expertise the AI should embody
- Specific context and constraints relevant to the user's need
- The exact output format and tone expected
- Key knowledge domains the AI should draw from
- Success criteria — what a perfect response looks like

Begin directly with the role/persona. No preamble, no meta-commentary.`;
  } else {
    try {
      const built = await buildEnrichedSystemPrompt(prompt.trim(), {
        domainId: context.domainId || undefined,
        subcategoryId: context.subcategoryId || undefined,
        subcategoryLabel: context.subcategoryLabel || undefined,
        deepAnswers: context.deepAnswers || undefined,
        skillMode: true,
        deepMode: isDeepMode,
      });
      systemPrompt = built.prompt;
      sectionSchema = built.sectionSchema || null;
    } catch (skillErr) {
      console.error("⚠️ [stream] buildEnrichedSystemPrompt failed:", skillErr?.message);
      sendEvent({ error: true, message: "prompt_build_failed" });
      return res.end();
    }
  }

  let fullContent = "";
  const decoder = new TextDecoder();

  try {
    // NOTE: uses the native global fetch (not the module's node-fetch shim above) —
    // this route reads openaiRes.body via the WHATWG getReader() API for SSE relay,
    // and node-fetch's Response.body is a Node PassThrough stream that has no getReader.
    const openaiRes = await globalThis.fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: process.env.OPENAI_STREAM_MODEL || "gpt-4o-mini",
        temperature: 0.7,
        max_tokens: isDeepMode ? 2800 : skillMode ? 2200 : 800,
        stream: true,
        stream_options: { include_usage: true },
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: isDeepMode
              ? `IMPORTANT: Your response must be 1,100–1,600 words minimum. Write full paragraphs for every section.\n\nGenerate the detailed prompt for: "${prompt.trim()}"`
              : `Generate the detailed prompt for: "${prompt.trim()}"`,
          },
        ],
      }),
    });

    if (!openaiRes.ok) {
      const errData = await openaiRes.json().catch(() => ({}));
      sendEvent({ error: true, message: errData?.error?.message || "openai_error" });
      return res.end();
    }

    const reader = openaiRes.body.getReader();
    let buffer = "";
    let usage = null;

    while (true) {
      if (req.socket?.destroyed) break;
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;
        const raw = line.slice(6).trim();
        if (raw === "[DONE]") break;
        try {
          const parsed = JSON.parse(raw);
          const delta = parsed?.choices?.[0]?.delta?.content ?? "";
          if (delta) {
            fullContent += delta;
            sendEvent({ delta });
          }
          if (parsed?.usage) usage = parsed.usage;
        } catch { /* skip malformed chunks */ }
      }
    }

    // Unwrap JSON if the model wrapped output in a JSON envelope
    let optimizedText = fullContent;
    const stripped = fullContent
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```\s*$/i, "")
      .trim();
    if (stripped.startsWith("{")) {
      try {
        const parsed = JSON.parse(stripped);
        if (parsed.optimizedText) optimizedText = parsed.optimizedText;
      } catch { /* keep raw */ }
    }

    // Skill Mode: validate sections and self-correct if any are missing
    if (skillMode && sectionSchema && optimizedText) {
      const { isValid, missingSections } = validateDetailedOutput({ optimizedText }, sectionSchema);
      if (!isValid && missingSections.length > 0) {
        sendEvent({ retrying: true });
        try {
          const retryRes = await globalThis.fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
            },
            body: JSON.stringify({
              model: process.env.OPENAI_STREAM_MODEL || "gpt-4o-mini",
              temperature: 0.5,
              max_tokens: 1800,
              stream: true,
              stream_options: { include_usage: true },
              messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: buildRetryPrompt(optimizedText, missingSections, prompt.trim()) },
              ],
            }),
          });
          if (retryRes.ok) {
            const retryReader = retryRes.body.getReader();
            let retryContent = "";
            let retryBuf = "";
            while (true) {
              const { done: rDone, value: rVal } = await retryReader.read();
              if (rDone) break;
              retryBuf += decoder.decode(rVal, { stream: true });
              const rLines = retryBuf.split("\n");
              retryBuf = rLines.pop() || "";
              for (const rLine of rLines) {
                if (!rLine.startsWith("data: ")) continue;
                const rRaw = rLine.slice(6).trim();
                if (rRaw === "[DONE]") break;
                try {
                  const rParsed = JSON.parse(rRaw);
                  const rDelta = rParsed?.choices?.[0]?.delta?.content ?? "";
                  if (rDelta) { retryContent += rDelta; sendEvent({ delta: rDelta }); }
                  if (rParsed?.usage) {
                    usage = {
                      prompt_tokens: (usage?.prompt_tokens || 0) + rParsed.usage.prompt_tokens,
                      completion_tokens: (usage?.completion_tokens || 0) + rParsed.usage.completion_tokens,
                      total_tokens: (usage?.total_tokens || 0) + rParsed.usage.total_tokens,
                    };
                  }
                } catch { /* skip */ }
              }
            }
            if (retryContent) optimizedText = retryContent;
          }
        } catch (retryErr) {
          console.error("⚠️ [stream] retry failed:", retryErr?.message);
        }
      }
    }

    sendEvent({
      done: true,
      optimizedText,
      usage: usage
        ? { promptTokens: usage.prompt_tokens, completionTokens: usage.completion_tokens, totalTokens: usage.total_tokens }
        : null,
    });

    // Fire-and-forget memory extraction (must not block or surface errors to user)
    if (userId && optimizedText) {
      extractAndStoreMemories({
        userId,
        userPrompt: prompt.trim(),
        optimizedText,
        intentCategory: context.domainId || undefined,
      }).catch((e) => console.error("[stream] memory extraction failed:", e?.message));
    }
  } catch (err) {
    if (!req.socket?.destroyed) {
      sendEvent({ error: true, message: err?.message || "stream_failed" });
    }
    console.error("[stream] SSE error:", err?.message || err);
  } finally {
    res.end();
  }
});

/* ===============================
   SMARTGEN — PDF → PROMPT
   Same "must be registered before app.use('/api/smartgen', ...)"
   reasoning as /stream above.
================================ */
const pdfToPromptUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 },
});

// pdf-parse's raw output is often noisy (hard line-wraps mid-sentence, hyphenated
// word breaks, stray page-number-only lines, repeated blank lines) — clean that up
// so the model sees coherent prose instead of fragmented text.
function cleanExtractedPdfText(raw) {
  return raw
    .replace(/\r\n?/g, "\n")
    // de-hyphenate words split across a line-wrap: "exam-\nple" -> "example"
    .replace(/([a-zA-Z])-\n([a-zA-Z])/g, "$1$2")
    // drop lines that are just a page number (with optional "Page" label)
    .split("\n")
    .filter((line) => !/^\s*(page\s*)?\d{1,4}\s*(\/\s*\d{1,4})?\s*$/i.test(line))
    .join("\n")
    // join single line-breaks that just wrap prose (not real paragraph breaks) into spaces
    .replace(/([^\n])\n(?!\n)([^\n])/g, "$1 $2")
    // collapse excess blank lines/spaces left behind
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

app.post(
  "/api/smartgen/pdf-to-prompt",
  requireAuth,
  pdfToPromptUpload.single("pdf"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, error: "pdf_required" });
      }
      if (req.file.mimetype !== "application/pdf") {
        return res.status(400).json({ success: false, error: "only_pdf_allowed" });
      }
      if (!process.env.OPENAI_API_KEY) {
        return res.status(500).json({ success: false, error: "missing_openai_key" });
      }

      let extractedText = "";
      let pageCount = 0;
      try {
        const parsed = await pdfParse(req.file.buffer);
        extractedText = cleanExtractedPdfText(parsed.text || "");
        pageCount = parsed.numpages || 0;
      } catch (parseErr) {
        console.error("[pdf-to-prompt] PDF parse failed:", parseErr?.message);
        return res.status(400).json({ success: false, error: "could_not_read_pdf" });
      }

      if (!extractedText || extractedText.length < 20) {
        // Likely a scanned/image-only PDF — pdf-parse has no OCR, so there's nothing to extract.
        return res.status(400).json({ success: false, error: "pdf_has_no_extractable_text" });
      }

      // gpt-4o-mini has a 128k-token context window, so we can afford to send a lot more
      // of the document than before — this was the main reason long PDFs lost content.
      const MAX_CHARS = 60000;
      const truncated = extractedText.length > MAX_CHARS;
      const textForModel = truncated ? extractedText.slice(0, MAX_CHARS) : extractedText;

      const instructions = typeof req.body?.instructions === "string" ? req.body.instructions.trim() : "";

      const systemPrompt = `You are an expert prompt engineer. The user has uploaded a PDF document; you're given its extracted text below (${pageCount ? `${pageCount} page(s), ` : ""}${extractedText.length.toLocaleString()} characters${truncated ? `, truncated to the first ${MAX_CHARS.toLocaleString()}` : ""}). Your job is to read it thoroughly and produce ONE polished, ready-to-use AI prompt built from its content, so the user can paste it directly into any LLM (ChatGPT, Claude, Gemini, etc.) and get a great, on-topic result.

How to read the document:
- Identify what the document actually is (a report, contract, resume, spec, article, dataset, syllabus, etc.) and let that shape the prompt's framing.
- Extract and preserve EVERY concrete detail that matters: specific names, numbers, dates, figures, definitions, requirements, constraints, and terminology — do not water them down into vague generalities or a loose summary.
- Ignore boilerplate noise (running headers/footers, page numbers, repeated letterhead) if present — focus on substantive content.

How to write the prompt:
- Output ONLY the final prompt text — no preamble, no explanation, no meta-commentary, no markdown fences.
- The prompt must be fully self-contained: assume the reader has NOT seen the original PDF, so restate all the key facts, data, and requirements an LLM needs to act on it well.
- Structure it clearly with short paragraphs and/or bullet points — e.g. background/context, then the specific task or question, then any constraints, format, or tone requirements.
- End with a precise instruction telling the LLM exactly what output is wanted.
- Be thorough rather than brief: aim for roughly 200–600 words, scaling with how much substantive content the document actually contains.`;

      const userMessage = instructions
        ? `Extracted PDF text:\n"""${textForModel}"""\n\nThe user also asked: "${instructions}"\n\nConvert this into a single, ready-to-use prompt as instructed above.`
        : `Extracted PDF text:\n"""${textForModel}"""\n\nConvert this into a single, ready-to-use prompt as instructed above.`;

      const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: process.env.OPENAI_STREAM_MODEL || "gpt-4o-mini",
          temperature: 0.5,
          max_tokens: 1700,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userMessage },
          ],
        }),
      });

      if (!openaiRes.ok) {
        const errData = await openaiRes.json().catch(() => ({}));
        return res.status(502).json({
          success: false,
          error: errData?.error?.message || "openai_error",
        });
      }

      const data = await openaiRes.json();
      const promptText = (data?.choices?.[0]?.message?.content || "").trim();
      if (!promptText) {
        return res.status(502).json({ success: false, error: "empty_response" });
      }

      const usage = data?.usage
        ? { promptTokens: data.usage.prompt_tokens, completionTokens: data.usage.completion_tokens, totalTokens: data.usage.total_tokens }
        : null;

      return res.json({ success: true, prompt: promptText, truncated, usage });
    } catch (err) {
      console.error("[pdf-to-prompt] error:", err?.message || err);
      return res.status(500).json({ success: false, error: "server_error" });
    }
  }
);

app.use("/api/smartgen-detect", smartgenDetectRoutes);
app.use("/api/smartgen", smartgenRoutes);
app.use("/api/saved-collections", savedCollectionRoutes);
app.use("/api/category", categoryRoutes);
app.use("/api/prompt", promptRoutes);
app.use("/api/purchase", purchaseRoutes);
app.use("/api/llm-provider", llmProviderRoutes);
app.use("/api/promptoptimizer", promptoptimizerRoutes);
app.use("/api/promptreport", promptreportRoutes);
app.use("/api/bankaccount", bankAccountRoutes);
app.use("/api/routes/pricing", pricingRoutes);
app.use("/api/plans/subscribe/order", billingOrders);
app.use("/api/plans/subscribe/verify", billingVerify);
app.use("/api/plans/subscribe/history", billingHistory);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/cart", cartRoute);
app.use("/api/prompt-collab", promptCollab);
app.use("/api/chat", chatRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/google-meet", googleMeetRoutes);
app.use("/api/user", userAdminRoutes);
app.use("/api/user", userRoutes);
app.use("/api", invoiceRoute);
app.use("/api/admin", adminRoutes);
app.use("/api/seller", sellerRoutes);
app.use("/api/kyc", kycRoutes);
app.use("/api/activity", activityRoutes);
app.use("/api/wallet", walletRoutes);
app.use("/api/hire", hireRoutes);
app.use("/api/admin/escrow", adminEscrowRouter);
app.use("/api/admin/platform-revenue", adminPlatformRevenueRouter);
app.use("/api/report", reportRoutes);
app.use("/api/screen-recording", screenRecordingRoutes);

// ✅ Separate Admin Message APIs
app.use("/api/admin-message", adminMessageRoutes);

// ✅ Memory routes (SmartGen memory system)
app.use("/api/memory", memoryRoutes);

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "sample.html"));
});

/* ===============================
   CRON JOBS
================================ */
cron.schedule("5 * * * *", async () => {
  try {
    await resetDuePeriods();
  } catch (e) {
    console.error("resetDuePeriods failed", e);
  }
});

cron.schedule("* * * * *", async () => {
  try {
    await updateSubscriptionStatuses();
  } catch (e) {
    console.error("status cron failed", e);
  }
});

/* ===============================
   SOCKET.IO
================================ */
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "https://gray-pebble-06934421e.6.azurestaticapps.net",
      process.env.FRONTEND_URL,
    ].filter(Boolean),
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// ✅ IMPORTANT: adminMessageRoutes.js me req.app.get("io") ke liye
app.set("io", io);

/* =====================================================
   ✅ REVERSE-MIRROR HELPER
   Jab user apne normal chat se "Tokun Admin" ko reply
   karta hai, to us reply ko AdminMessage/AdminConversation
   mein bhi daalo aur admin dashboard ke event pe emit karo.
   Normal user-to-user chats pe koi asar nahi.
===================================================== */
async function mirrorUserReplyToAdmin({ conversationId, senderId, text }) {
  // is normal conversation ke participants dekho
  const convo = await Conversation.findById(conversationId).lean();
  if (!convo || !Array.isArray(convo.participants)) return;

  // doosra participant (jo sender nahi hai)
  const otherId = convo.participants
    .map((p) => String(p))
    .find((p) => p !== String(senderId));
  if (!otherId) return;

  // kya doosra participant "Tokun Admin" chat-user hai?
  const otherUser = await User.findById(otherId).select("name role");
  const isAdminChatUser =
    otherUser && (otherUser.name === "Tokun Admin" || otherUser.role === "Admin");
  if (!isAdminChatUser) return; // normal chat — kuch mat karo

  // is seller (senderId) ka AdminConversation dhoondho
  const adminConvo = await AdminConversation.findOne({ sellerId: senderId });
  if (!adminConvo) return; // admin ne abhi tak isse message nahi kiya

  // AdminMessage banao — sender = seller, receiver = admin
  const adminMsg = await AdminMessage.create({
    conversationId: adminConvo._id,
    sender: senderId,
    receiver: adminConvo.adminId,
    senderType: "seller",
    text,
    readBy: [senderId],
  });

  adminConvo.lastMessage = text;
  adminConvo.lastSender = senderId;
  adminConvo.updatedAt = new Date();
  await adminConvo.save();

  const populated = await AdminMessage.findById(adminMsg._id)
    .populate("sender", "name email avatar avatarUrl role userType")
    .populate("receiver", "name email avatar avatarUrl role userType");

  // admin dashboard jis event pe sunta hai wahi emit karo
  const payload = {
    success: true,
    conversationId: String(adminConvo._id),
    conversation: {
      _id: String(adminConvo._id),
      id: String(adminConvo._id),
      adminId: adminConvo.adminId,
      sellerId: adminConvo.sellerId,
      lastMessage: adminConvo.lastMessage,
      lastSender: adminConvo.lastSender,
      updatedAt: adminConvo.updatedAt,
    },
    message: {
      _id: String(populated._id),
      id: String(populated._id),
      conversationId: String(populated.conversationId),
      sender: populated.sender,
      receiver: populated.receiver,
      senderId: String(senderId),
      receiverId: String(adminConvo.adminId),
      senderType: "seller",
      text: populated.text || "",
      attachment: populated.attachment || null,
      readBy: populated.readBy || [],
      createdAt: populated.createdAt,
      updatedAt: populated.updatedAt,
    },
  };

  io.to(`admin-message:${adminConvo._id}`).emit("admin-message:new", payload);
  io.to(`admin-message-user:${adminConvo.adminId}`).emit("admin-message:new", payload);
  io.to(String(adminConvo.adminId)).emit("admin-message:new", payload);
}

// --- REAL-TIME SOCKET LOGIC ---
io.on("connection", (socket) => {

  const userId = socket.handshake.auth?.userId;

  if (userId) {
    // Existing chat personal room
    socket.join(String(userId));

    // ✅ New admin-message personal room
    socket.join(`admin-message-user:${userId}`);

  }

  /* ===============================
     ADMIN MESSAGE SOCKETS
  ================================ */

  socket.on("admin-message:join", (payload = {}) => {
    const conversationId =
      typeof payload === "string" ? payload : payload.conversationId;

    if (!conversationId) return;

    socket.join(`admin-message:${conversationId}`);
  });

  socket.on("admin-message:leave", (payload = {}) => {
    const conversationId =
      typeof payload === "string" ? payload : payload.conversationId;

    if (!conversationId) return;

    socket.leave(`admin-message:${conversationId}`);
  });

  /* ===============================
     EXISTING CHAT SOCKETS
  ================================ */

  socket.on("join-chat", (payload = {}) => {
    const conversationId =
      typeof payload === "string" ? payload : payload.conversationId;

    if (!conversationId) return;

    socket.join(String(conversationId));
  });

  socket.on("send-message", async ({ conversationId, senderId, text }) => {
    try {
      if (!conversationId || !senderId || !String(text || "").trim()) return;

      const message = await Message.create({
        conversationId,
        sender: senderId,
        text,
        readBy: [senderId],
      });

      await Conversation.findByIdAndUpdate(conversationId, {
        lastMessage: text,
        lastSender: senderId,
        updatedAt: new Date(),
      });

      io.to(String(conversationId)).emit("new-message", {
        _id: message._id,
        conversationId,
        sender: senderId,
        text,
        createdAt: message.createdAt,
      });

      // ✅ REVERSE-MIRROR: agar ye "Tokun Admin" wala conversation hai,
      // to user ka reply admin dashboard mein bhi dikhe.
      try {
        await mirrorUserReplyToAdmin({ conversationId, senderId, text });
      } catch (e) {
        console.error("reverse-mirror error:", e?.message);
      }
    } catch (err) {
      console.error("Socket send-message error:", err);
      socket.emit("message-error", {
        success: false,
        error: "Message send failed",
      });
    }
  });

  /* ===============================
     CALL SOCKETS
  ================================ */

  socket.on("call-user", ({ toUserId, fromUser, conversationId, type }) => {

    io.to(String(toUserId)).emit("incoming-call", {
      fromUser,
      conversationId,
      type,
    });
  });

  socket.on("call-accepted", ({ toUserId, conversationId }) => {
    io.to(String(toUserId)).emit("call-accepted", { conversationId });
  });

  socket.on("end-call", ({ toUserId }) => {
    io.to(String(toUserId)).emit("call-ended");
  });

  /* ===============================
     COLLAB SESSION SOCKETS
  ================================ */

  socket.on("join-session", async ({ sessionId, userId }) => {
    try {
      if (!sessionId) return;

      socket.join(String(sessionId));

      let session = await CollabSession.findOne({ sessionId });

      if (!session) {
        session = await CollabSession.create({
          sessionId,
          text: "",
          participants: userId ? [{ userId }] : [],
        });
      }

      socket.emit("prompt-initial", {
        sessionId,
        text: session.text,
      });

      socket.to(String(sessionId)).emit("user-joined", { userId });
    } catch (err) {
      console.error("join-session error:", err);
    }
  });

  socket.on("prompt-change", async ({ sessionId, text, userId }) => {
    try {
      if (!sessionId) return;

      await CollabSession.findOneAndUpdate(
        { sessionId },
        { text, updatedAt: new Date() },
        { upsert: true }
      );

      socket.to(String(sessionId)).emit("prompt-change", {
        sessionId,
        text,
        userId,
      });
    } catch (err) {
      console.error("prompt-change error:", err);
    }
  });

  socket.on("leave-session", ({ sessionId, userId }) => {
    if (!sessionId) return;

    socket.leave(String(sessionId));
    socket.to(String(sessionId)).emit("user-left", { userId });
  });

  socket.on("end-session", async ({ sessionId, userId }) => {
    try {
      if (!sessionId) return;


      await CollabSession.deleteOne({ sessionId });

      io.to(String(sessionId)).emit("session-ended", {
        sessionId,
        endedBy: userId,
      });

      io.in(String(sessionId)).socketsLeave(String(sessionId));
    } catch (err) {
      console.error("end-session error:", err);
    }
  });

  socket.on("disconnect", () => {
  });
});

/* ===============================
   DB + SERVER START
================================ */
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;

if (!MONGO_URI) {
  console.error("❌ Missing MONGO_URI / MONGODB_URI in .env");
  process.exit(1);
}

mongoose
  .connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    ssl: true,
  })
  .then(async () => {

    /* ===============================
       ✅ AdminConversation index cleanup
       Purana galat index (sellerUserId wala) + galat data
       automatically drop/clean karo, phir sahi index sync.
    ================================ */
    try {
      const AdminConversationModel = require("./models/AdminConversation");

      const indexes = await AdminConversationModel.collection.indexes();

      // koi bhi index jismein sellerUserId field ho use drop karo
      const badIndexes = indexes.filter(
        (i) =>
          i.key &&
          Object.prototype.hasOwnProperty.call(i.key, "sellerUserId")
      );

      for (const idx of badIndexes) {
        await AdminConversationModel.collection.dropIndex(idx.name);
      }

      // galat data (sellerUserId field wale, sellerId ke bina) saaf karo
      await AdminConversationModel.collection.deleteMany({
        sellerUserId: { $exists: true },
        sellerId: { $exists: false },
      });
      // sahi index (adminId_1_sellerId_1) sync karo
      await AdminConversationModel.syncIndexes();
    } catch (e) {
      console.error("Index cleanup warning:", e?.message);
    }

    await seedDefaultAdmin();

    server.listen(PORT, () => {
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err);
    process.exit(1);
  });
