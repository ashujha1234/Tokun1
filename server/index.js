







 























































































































   
   










      
      



















































      


          
        
        


















































      


      
        

          

              

        
          
          
        
        
          
          
        








































































    





      


      
        

          

              

        
          
          
        
        
          
          
        























    


  











    





















































require("dotenv").config();

/* Error tracking. Immediately after dotenv and before express/mongoose/http are
   required below, because auto-instrumentation works by patching those modules
   as they load — initialise it after them and requests and Mongo queries are
   never recorded.

   No-op unless APPLICATIONINSIGHTS_CONNECTION_STRING is set, so local dev and CI
   are unaffected. See utils/telemetry.js for why this exists at all. */
const telemetry = require("./utils/telemetry");
telemetry.init();

/* Must come before ANY route module is required below, because those modules
   register their handlers at require time and this patches the Router so a
   handler that returns a rejected promise reaches the error middleware.

   Express 4 does not await route handlers. An `async` handler that throws with
   no try/catch does not produce a 500 — it produces an unhandled rejection,
   which Node 18+ turns into a process exit. One missing try/catch anywhere in
   58 route files took the whole server down, killing every socket.io connection
   and every in-flight payment with it. With this, that same throw becomes a 500
   on the one request that caused it and the server stays up.

   The process-level handlers at the bottom of this file are the layer below
   this one: they catch what escapes Express entirely (a cron job, a socket
   handler, a stray callback). */
require("express-async-errors");

require("./utils/passport");

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const mongoose = require("mongoose");
const path = require("path");
const multer = require("multer");
const pdfParse = require("pdf-parse");
const docToMarkdown = require("./services/docToMarkdown");
const tokenizer = require("./utils/tokenizer");
/* Metering for /api/smartgen/stream. It lives here rather than in
   routes/smartgenRoutes.js because this is the endpoint that actually calls the
   model — see the block above that route for why that distinction matters. */
const { assertCanSpend, spendTokensForUser, SPEND_ERRORS } = require("./service/spend");
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
// Both needed by the socket handshake check below, which resolves a token the
// same way utils/auth.js requireAuth does for HTTP.
const AdminUser = require("./models/AdminUser");
const jwt = require("jsonwebtoken");

// Jobs
const { resetDuePeriods } = require("./utils/jobs/resetPeriods");
const { updateSubscriptionStatuses } = require("./utils/jobs/subscriptionStatusCron");

// Routes
const authRoutes = require("./routes/authRoutes");
const quotaRoutes = require("./routes/quotaRoute");
const smartgenRoutes = require("./routes/smartgenRoutes");
const savedCollectionRoutes = require("./routes/savedCollectionRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const promptRoutes = require("./routes/promptRoutes");
const { PRIVATE_UPLOAD_PREFIXES } = require("./utils/privateUploadDirs");
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
const hireRoutes = require("./routes/hire.routes");
const adminEscrowRouter = require("./routes/adminEscrow");
const adminPromptValidationRouter = require("./routes/adminPromptValidation");
const adminNotificationsRouter = require("./routes/adminNotifications");
const adminRefundsRouter = require("./routes/adminRefunds");
/* Every signed engagement agreement, in one place. Read-only: the archive it
   reads (models/NdaRecord.js) is append-only, and an audit trail an admin can
   edit is not an audit trail. */
const adminNdaRouter = require("./routes/adminNda");
const escrowCancellationRoutes = require("./routes/escrowCancellation");
const myOrdersRoutes = require("./routes/myOrders");
const briefAttachmentRoutes = require("./routes/briefAttachments");
const progressReviewRoutes = require("./routes/progressReview");
/* "Here's what I need from you before I can start" as a tracked checklist
   rather than prose in chat — including refusing to store the credentials
   clients used to paste into that prose. See routes/accessRequests.js. */
const accessRequestRoutes = require("./routes/accessRequests");
const reviewRoutes = require("./routes/reviews");
/* Reviews OF A PRODUCT, as opposed to reviews of a person — different model,
   different uniqueness rule. See the header of models/ProductReview.js. */
const productReviewRoutes = require("./routes/productReviews");
/* Admin-applied deductions to a creator's star rating, used when a refund or a
   dispute is decided against them. Never automatic — see the file header. */
const adminRatingPenaltyRoutes = require("./routes/adminRatingPenalties");
const referralRoutes = require("./routes/referralRoutes");
const adminDisputesRouter = require("./routes/adminDisputes");
const adminPlatformRevenueRouter = require("./routes/adminPlatformRevenue");
/* Everything that moved through Razorpay, joined to Tokun's own commission
   ledger, so reconciling a month doesn't mean reading two systems. */
const adminPaymentsRouter = require("./routes/adminPayments");
const activityRoutes = require("./routes/activityRoutes");
const userAdminRoutes = require("./routes/userAdminRoutes");
const adminOrgsRouter = require("./routes/adminOrgs");
const walletRoutes = require("./routes/walletRoutes");
const reportRoutes = require("./routes/report");

// ✅ Become-a-Freelancer onboarding + its admin review queue
const freelancerRoutes = require("./routes/freelancerRoutes");
const adminFreelancersRouter = require("./routes/adminFreelancers");

// ✅ New separate admin message route
const adminMessageRoutes = require("./routes/adminMessageRoutes");

// ✅ SkillEngine + Memory
const { buildEnrichedSystemPrompt, validateDetailedOutput, buildRetryPrompt } = require("./skillEngine/skillEngine");
// The two non-skill-engine SmartGen prompts. Extracted so they can be
// exercised against the real model without booting the server — see the
// header of that file for why that mattered.
const { PLAIN_SYSTEM_PROMPT, buildDocumentSystemPrompt } = require("./prompts/smartgenPrompts");
const memoryRoutes = require("./memory/memoryRoutes");
const { getRelevantMemoryContext } = require("./memory/memoryRetriever");
const { extractAndStoreMemories } = require("./memory/memoryExtractor");
const { requireAuth } = require("./utils/auth");
const smartgenDetectRoutes = require("./routes/smartgenDetectRoutes");

require("./cron/autoReleaseEscrow");
require("./cron/autoReleaseServiceEscrow");
/* Chases a client whose outstanding checklist items are holding a creator up. */
require("./cron/accessChecklistReminder");
/* Razorpay stops holding a transfer at 90 days. This warns both parties (and
   logs for admin) a week before a still-open booking hits that wall. */
require("./cron/escrowDeadlineWatch");
/* A revision nobody answers is the one state the auto-release cron can't see —
   it only looks at WORK_SUBMITTED. This nudges at 7 days and refers it to an
   admin at 14, so the money can't sit held until the 90-day wall. */
require("./cron/stalledRevisionWatch");
/* A hire proposal the freelancer never answers, or a booking the client never
   pays for, would otherwise sit open forever. Closed after
   REQUEST_RESPONSE_DAYS (3). Pre-payment states only — no money is ever moved
   by this one. */
require("./cron/staleRequestWatch");
/* Plans don't auto-renew — nothing charges a card a second time — so an expiry
   is something the subscriber has to act on. Warns 3 days out and confirms once
   it has lapsed. Email only; it moves no money and changes no plan. */
require("./cron/subscriptionExpiryWatch");
/* Refer & Earn pays out only on sales that outlived the refund window — this is
   what notices they have. Nothing rewards at the moment of sale on purpose. */
require("./cron/referralSettlement");

const app = express();

/* ===============================
   CORS
================================ */
/* FRONTEND_URL accepts a COMMA-SEPARATED list, not a single origin.

   It used to be dropped into this array as one string, so it could only ever
   whitelist one host — and a site served on both the apex and the www subdomain
   needs two. Setting it to "a,b" did not work either, because the check below is
   an exact `includes`, which would have compared against the literal "a,b".

   Trailing slashes are stripped here because a browser's Origin header never
   has one: an env var set to "https://tokun.world/" would silently match
   nothing, which looks identical to CORS simply being broken. */
const envOrigins = String(process.env.FRONTEND_URL || "")
  .split(",")
  .map((o) => o.trim().replace(/\/+$/, ""))
  .filter(Boolean);

const allowedOrigins = [
  "http://localhost:5173",
  "https://gray-pebble-06934421e.6.azurestaticapps.net",
  // The live custom domain, both forms. Hardcoded alongside the Azure hostname
  // above so the site keeps working even if FRONTEND_URL is unset on a fresh
  // environment; anything further should go in FRONTEND_URL rather than here.
  "https://tokun.world",
  "https://www.tokun.world",
  ...envOrigins,
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
  /* RESPONSE headers the frontend is allowed to read.

     Without this a cross-origin fetch can only see the CORS-safelisted six, and
     the frontend IS cross-origin (tokun.world against the API host) — so
     `res.headers.get("X-Tokun-Watermarked")` came back null in production while
     working fine on localhost, where nothing is cross-origin at all.

     That header is not decoration. It is how the escrow preview knows the bytes
     it just received are a watermarked copy held against an unreleased payment:
     see resolveDeliverableUrl in frontend/src/lib/serviceDeliverables.ts, whose
     `watermarked` flag drives both the "payment is still held" notice and the
     hiding of the Download button in DeliverablePreviewModal. Invisible header →
     flag always false → the buyer got a Download button and no notice on work
     they hadn't paid out for, which is exactly what was reported after a
     revision resubmission.

     Content-Disposition comes along because the same responses carry the
     seller's original filename in it. */
  exposedHeaders: ["X-Tokun-Watermarked", "Content-Disposition"],
  optionsSuccessStatus: 204,
};

/* ===============================
   Security headers (helmet)
================================ */
/* Headers, not code: these tell the BROWSER how to treat a response, switching
   on protections that are off by default. Registered before everything else so
   they land on every response, errors and CORS preflights included.

   Two of helmet's defaults are wrong for this server, and both would break the
   site rather than fail quietly, so they are set explicitly:

   crossOriginResourcePolicy — helmet defaults this to "same-origin", which tells
   the browser to refuse this response to any other origin. The frontend IS
   another origin (www.tokun.world against the API's azurewebsites.net host), and
   it loads prompt thumbnails and previews straight from /uploads below. Left at
   the default, every one of those images would be blocked.

   contentSecurityPolicy — off here, and deliberately. CSP governs what a
   DOCUMENT may load, and this server returns JSON; the policy that matters for
   the app belongs to whatever serves the HTML, which is the Static Web App (see
   frontend/public/staticwebapp.config.json). The one place CSP earns its keep on
   this origin is /uploads, where a user-supplied file can be opened as a
   document — that gets its own, much stricter policy at the mount below.

   crossOriginOpenerPolicy — off, because Google sign-in would stop working.
   GET /api/auth/google/callback answers a POPUP with a page that calls
   `window.opener.postMessage(...)` to tell the app it succeeded (see
   routes/authRoutes.js). helmet defaults COOP to "same-origin", which severs
   `window.opener` when the popup and its opener are different origins — and they
   are, the popup being on this host and the app on www. The callback would throw
   on a null opener and the login would never complete. COOP protects documents
   from cross-window attacks and this origin serves one document worth speaking
   of, which is exactly the one that needs its opener. */
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginOpenerPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));

/* ===============================
   RESPONSE COMPRESSION
================================ */
/* The JSON this API returns compresses by roughly 70–80% — marketplace listings,
   order history and admin tables are long arrays of repeated field names, which
   is close to the best case for gzip. On a mobile connection that is the
   difference between a list arriving and a list appearing to hang.

   Registered after CORS so that preflight replies (which have no body worth
   compressing) are already answered, and before the routes so it wraps every
   response below.

   The filter is the part that matters, and it exists because of one endpoint:

   text/event-stream — /api/smartgen/stream sends the LLM's tokens as they
   arrive. Compression buffers output until it has enough bytes to make a block
   worth flushing, which for a stream of short SSE frames means the browser
   receives nothing for seconds and then everything at once. That turns a
   visibly-typing response into a frozen screen followed by a wall of text —
   the streaming feature, silently undone. Skipping the encoding entirely is the
   fix; SSE frames are small and go out immediately.

   Already-compressed bytes are skipped too: images, video, PDFs and zips under
   /uploads are compressed formats already, and running gzip over them burns CPU
   to make the payload marginally LARGER. compression's default filter does not
   know about these, so it is checked here.

   `x-no-compression` is compression's own documented escape hatch, kept so a
   future route can opt out without editing this filter. */
const compression = require("compression");

const INCOMPRESSIBLE = /^(image\/|video\/|audio\/|application\/(zip|gzip|pdf|x-7z|octet-stream))/;

app.use(
  compression({
    filter: (req, res) => {
      if (req.headers["x-no-compression"]) return false;

      const type = String(res.getHeader("Content-Type") || "");
      if (type.startsWith("text/event-stream")) return false;
      if (INCOMPRESSIBLE.test(type)) return false;

      return compression.filter(req, res);
    },
  })
);

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
   RATE LIMITING
================================ */
/* Two limiters, both set generously on purpose: they exist to stop a script,
   not to ration normal use. A limit a real person can reach is a bug — they
   will read it as the site being broken, and they will be right to.

   trust proxy FIRST, and it is not optional. App Service terminates TLS and
   forwards, so req.ip is the load balancer on every request. Without this line
   every user in the world shares one rate-limit bucket, and the first busy
   minute locks everyone out at once — a limiter that causes the outage it was
   added to prevent. `1` = trust exactly one proxy hop, which is what sits in
   front of us; `true` would trust a client-supplied X-Forwarded-For and let
   anyone mint a fresh bucket per request. */
app.set("trust proxy", 1);

/* Imported under their real names, not aliased. express-rate-limit validates a
   custom keyGenerator by reading its SOURCE TEXT for the literal string
   "ipKeyGenerator" — alias it and you get a loud ERR_ERL_KEY_GEN_IPV6 warning on
   every boot for code that is actually correct. */
const { rateLimit, ipKeyGenerator } = require("express-rate-limit");

/* Per user when we know who they are, per IP otherwise. Without the user key,
   an office or a college behind one NAT would share a bucket and throttle each
   other.

   `ipKeyGenerator(req.ip)`, never `ipKeyGenerator(req)`. It takes an IP STRING; given the
   request object it hands the object straight back, and an object used as a
   store key is a NEW key every single request — the limiter then counts to one
   forever and enforces nothing. Four limiters in this codebase had that bug and
   two of them (routes/adminRoutes.js otpLimiter, resendLimiter) were doing
   nothing at all. It fails silently and looks correct, so check the argument. */
const userOrIpKey = (req) =>
  req.user?._id ? `u:${req.user._id}` : ipKeyGenerator(req.ip);

/* Catch-all. 600 per 5 minutes is ~2 requests/second sustained — far above any
   real session (a heavy page load is a few dozen calls) and far below what a
   scripted loop does. */
const globalLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 600,
  keyGenerator: userOrIpKey,
  standardHeaders: true,
  legacyHeaders: false,
  // Azure's health probe polls constantly and must never be throttled — a
  // rate-limited probe reads as an unhealthy instance and gets recycled.
  skip: (req) => req.path === "/health" || req.path.startsWith("/health/"),
  message: {
    success: false,
    error: "rate_limited",
    message: "Too many requests. Wait a minute and try again.",
  },
});
app.use(globalLimiter);

/* The endpoints that call OpenAI. These cost money per request, which is why
   they get their own, tighter bucket on top of the global one.

   30 per 10 minutes: someone genuinely working writes a prompt, reads the
   result, edits, runs it again — call it one every 30–60 seconds at their
   fastest. 30 gives that person roughly three times the headroom they need,
   and still caps a runaway script at 180/hour instead of thousands.

   The message says how long to wait, because "try again later" tells a person
   nothing and they retry immediately — which is the one thing that keeps them
   limited. Start here and tighten only if the logs show it is worth it; the
   cost of being too tight lands on real users, the cost of being slightly loose
   is a few dollars. */
const llmLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 30,
  keyGenerator: userOrIpKey,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: "rate_limited",
    message:
      "You've run a lot of prompts in a short time. Please wait a few minutes and try again — nothing has been lost.",
  },
});

/* ===============================
   SMARTGEN OPTIMIZE API
================================ */
/* Note for whoever reads this next: this endpoint has no requireAuth, so the
   limiter keys it by IP. That is not an oversight in the limiter — the frontend
   genuinely calls it without a token (llmService.optimizeWithOpenAI), so adding
   auth here would break prompt optimisation for everyone. Whether it SHOULD be
   public is a separate question worth asking; until it is answered, the IP
   bucket is what stands between this and an unbounded OpenAI bill. */
app.post("/api/optimize", llmLimiter, async (req, res) => {
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

YOU REWRITE THE TEXT. YOU NEVER PERFORM IT.
- The input is a piece of TEXT to compress, never a task addressed to you
- If the text says "write a blog post about X", the answer is a SHORTER INSTRUCTION
  such as "Write a blog post on X" — NOT a blog post about X
- If the text asks a question, compress the QUESTION; never answer it
- The output must always be SHORTER than the input. If you cannot shorten it,
  return it unchanged
- Never add, explain, continue or complete the content

PRESERVE the text's own line breaks, numbered steps and section headings — a
list must come back as a list, not as one paragraph.

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

  /* Delimited for `optimize`, raw for `detailed`.
     Sent bare, an input like "write me a blog post about X" reads as an
     instruction to the model, and it obeys — the endpoint returned an actual
     blog post as the "optimised prompt". Fencing the text and naming it makes
     the role of the message unambiguous, so the instruction being compressed
     can no longer be mistaken for the instruction being followed. */
  const userContent =
    mode === "optimize"
      ? `Compress the text between the markers. Do not respond to it.\n\n<<<TEXT\n${text}\nTEXT>>>`
      : text;

  const callModel = (messages, maxTokens) =>
    fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model,
        temperature,
        max_tokens: maxTokens,
        messages,
        response_format: { type: "json_object" },
      }),
    });

  const countWords = (value) => String(value || "").trim().split(/\s+/).filter(Boolean).length;

  try {
    const response = await callModel(
      [
        { role: "system", content: systemPrompt },
        { role: "user", content: userContent },
      ],
      1200
    );

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
      const originalWords = countWords(text);

      /* An optimisation that came back LONGER than what went in did not
         optimise anything — in practice the model had answered the prompt
         instead of compressing it, and the endpoint served that answer as the
         "optimised prompt" (a 28-word request came back as 75 words of blog
         copy). The fence above prevents most of it; this catches the rest.
         One retry, told plainly what went wrong, and the shorter of the two
         attempts wins — never a result longer than the user's own text. */
      if (countWords(parsed.optimizedText) > originalWords) {
        console.warn("⚠️ Optimize expanded the input — retrying once.");

        try {
          const retry = await callModel(
            [
              {
                role: "system",
                content: `${systemPrompt}

YOUR PREVIOUS ATTEMPT FAILED: it was longer than the input, which means you
answered the text instead of compressing it. Return ONLY a shorter rewrite of
the same text, in the same form (an instruction stays an instruction, a
question stays a question).`,
              },
              { role: "user", content: userContent },
            ],
            900
          );
          const retryData = await retry.json();
          const retryContent = retryData?.choices?.[0]?.message?.content?.trim?.() || "";
          const retryParsed = retryContent ? JSON.parse(retryContent) : null;

          if (retryParsed?.optimizedText) {
            const first = countWords(parsed.optimizedText);
            const second = countWords(retryParsed.optimizedText);
            if (second < first) parsed = retryParsed;
          }
        } catch (retryErr) {
          // The first answer still stands; a failed retry must not fail the call.
          console.error("⚠️ Optimize retry failed:", retryErr?.message);
        }

        // Still longer than the input after the retry: the honest result is the
        // user's own text, unchanged, rather than a longer "optimisation".
        if (countWords(parsed.optimizedText) > originalWords) {
          console.warn("⚠️ Optimize still expanded after retry — returning input unchanged.");
          parsed.optimizedText = text;
        }
      }

      /* Counted with the model's own BPE table, not estimated.
         See utils/tokenizer.js for why: this endpoint's entire claim is a
         percentage, and the two approximations it used to be built on
         disagreed with each other and with reality — words × 1.3 reads a
         twenty-token JSON object as one token.

         The word counts stay alongside, because the retry guard above is
         written in words and a reader comparing the two should see the same
         numbers the server acted on.

         `model` is the one the request actually used, so a GPT-4 call is
         measured with cl100k and a GPT-4o call with o200k rather than both
         being counted as whichever was hardcoded. */
      const measured = tokenizer.compare(text, parsed.optimizedText, model);

      parsed.metrics = {
        ...measured,
        // Kept under its old name as well: the field shipped in this shape
        // before real counting existed, and anything already reading it should
        // keep working rather than silently start reading undefined.
        reductionPercentage: measured.reductionPercent,
      };

      const isRolePrompt =
        text.toLowerCase().startsWith("you are") ||
        text.toLowerCase().startsWith("act as");

      if (isRolePrompt) {

        const openingMatch = text.match(/^(you are|act as)[^.!?]*/i);
        const exactOpening = openingMatch ? openingMatch[0] : null;

        if (exactOpening) {
          const optimizedText = String(parsed.optimizedText || "");

          /* Against the opener the INPUT used, not either of the two.
             Accepting both meant "Act as a marketing strategist…" came back as
             "You are a marketing strategist…" and passed this check — the rule
             the system prompt states is to preserve the role statement exactly
             as written, and a role prompt rewritten into the other form is the
             one edit the caller explicitly asked us not to make. */
          const inputOpener = exactOpening.toLowerCase().startsWith("act as")
            ? "act as"
            : "you are";

          /* Puts the caller's own role statement back on the front. The old
             version joined with a bare space, and since the strip leaves the
             sentence's full stop behind ("…strategist" + ". Create…") that
             produced "Act as a marketing strategist . Create…" — so the repair
             was visible in the output it was meant to repair. */
          const restoreOpening = (value) => {
            const rest = String(value).replace(/^(you are|act as)[^.!?]*/i, "").trim();
            return rest.startsWith(".") || rest.startsWith("!") || rest.startsWith("?")
              ? `${exactOpening}${rest}`
              : `${exactOpening}. ${rest}`.trim();
          };

          if (!optimizedText.toLowerCase().startsWith(inputOpener)) {
            parsed.optimizedText = restoreOpening(optimizedText);
          }

          if (parsed.suggestions && Array.isArray(parsed.suggestions)) {
            parsed.suggestions = parsed.suggestions.map((suggestion) => {
              const s = String(suggestion || "");
              // Same opener test as above: matching the other form is not a match.
              return s.toLowerCase().startsWith(inputOpener) ? s : restoreOpening(s);
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

/* Liveness: "the process is up and the event loop is turning."
   Deliberately checks nothing else — a liveness probe that fails on a dependency
   outage makes the platform restart a healthy process, which turns a database
   blip into a restart loop. */
app.get("/health", (_req, res) => res.json({ ok: true }));

/* Cache visibility.
 *
 * An in-process cache is invisible from outside: if it silently stopped
 * working — a TTL set to zero, an invalidation firing on every request, a cap
 * so low that nothing survives to be read twice — nothing would break.
 * Responses would stay correct and the database would just carry the load
 * again, which looks exactly like the cache never having been added. That is
 * the failure mode this endpoint exists to make visible.
 *
 * hitRate is the number to read. The users cache should sit high, because
 * requireAuth asks for the same account repeatedly within a session; a low one
 * means entries are being dropped faster than they are reused, and the first
 * thing to check is whether something is writing to User on every request —
 * every write invalidates, by design (models/User.js).
 *
 * Public and unauthenticated, like /health beside it, and it stays that way
 * only because it exposes counters and no data — sizes and hit rates, never
 * keys or values. Keep it that way: the users cache is keyed by user id, so a
 * key listing here would be an account enumeration endpoint. */
app.get("/health/cache", (_req, res) => {
  const { caches } = require("./utils/cache");
  res.json({ ok: true, caches: caches.map((c) => c.stats()) });
});

/* Readiness: "this instance can actually serve a request."
 *
 * /health alone returned 200 with Mongo down, so every request 500'd while the
 * platform believed the instance was fine — the failure mode with no signal
 * attached. This one reports the truth.
 *
 * readyState is not enough on its own: it says what the driver believes about
 * the socket, which stays "connected" through a failover or a paused Atlas
 * cluster. The ping is what actually proves a round-trip, so it is the check —
 * with a short timeout, since a probe that hangs is a probe that fails.
 *
 * 503, not 500: "not ready, come back" rather than "this request broke". Load
 * balancers and container platforms act on 503; that distinction is the point.
 */
app.get("/health/ready", async (_req, res) => {
  const states = ["disconnected", "connected", "connecting", "disconnecting"];
  const state = states[mongoose.connection.readyState] || "unknown";

  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ ok: false, mongo: state });
  }

  const TIMEOUT_MS = 5000;

  try {
    const started = Date.now();
    await Promise.race([
      mongoose.connection.db.admin().ping(),
      /* Measured against this cluster: a warm ping is ~300ms, but latency right
         after boot decays 2382 -> 2215 -> 1418 -> 778 -> ~300ms over the first
         few calls, and the very first one can exceed 5s. Something at boot
         occupies the pool or the event loop for the first seconds — index
         building was the obvious suspect and was ruled out by measurement, so
         the cause is unconfirmed. The behaviour is consistent and self-resolving.

         That first 503 is CORRECT, not a bug to tune away: "not ready yet" is
         exactly what this endpoint exists to say, and probes retry. Raising the
         timeout until a cold instance reports ready would defeat the point. */
      new Promise((_, reject) =>
        setTimeout(
          () => reject(Object.assign(new Error(`ping timed out after ${TIMEOUT_MS}ms`), { isTimeout: true })),
          TIMEOUT_MS
        )
      ),
    ]);
    return res.json({ ok: true, mongo: "connected", pingMs: Date.now() - started });
  } catch (err) {
    /* Only genuine errors are reported. A cold-start timeout happens on the
       first probe after every deploy, and alerting on it would produce a steady
       drip of expected failures — which is how the real one gets ignored. The
       error handler further down this file makes the same distinction and says
       so; this follows it.

       The reason is returned either way, because "which kind of failure was it"
       is the first thing anyone reading a 503 needs. */
    if (!err?.isTimeout) {
      telemetry.trackError(err, { check: "readiness", mongo: state });
    }
    return res.status(503).json({
      ok: false,
      mongo: state,
      error: err?.isTimeout ? "ping_timeout" : "ping_failed",
      detail: err?.message,
    });
  }
});

/* Everything under here was uploaded by a user, and it is served from the same
   origin as the API — so a file that the browser decides to treat as a document
   runs as this origin. An .html or an .svg with a <script> in it is the whole
   attack; both are ordinary things to accept from an upload form.

   The global helmet above already sends `X-Content-Type-Options: nosniff`, which
   stops the browser guessing a type the server didn't declare. These two close
   what nosniff can't:
     default-src 'none'  nothing in one of these files may load or execute —
                         no scripts, no fetch, no frames, whatever the type says
     sandbox             the document gets an opaque origin, so even inline
                         script can't reach cookies, storage or the API
   Neither affects an <img src="/uploads/…"> on the frontend: a subresource is
   loaded under the PAGE's policy, and these apply only when the file itself is
   opened as a document. */
app.use("/uploads", (_req, res, next) => {
  res.setHeader("Content-Security-Policy", "default-src 'none'; sandbox");
  next();
});

/* PRIVATE subtrees, refused before the static handlers below ever see them.

   /uploads is served with no auth, and several routes used to write private
   material into it: escrow deliverables (uploads/service-work, uploads/hire-work),
   signed NDAs, and the scratch copies of brief and checkpoint media. The gated
   download routes for those files check auth, check that the caller is a party
   to the order, and watermark an image the buyer hasn't paid out for — none of
   which means anything while the same bytes also answer a plain GET.

   New uploads no longer land here at all (see utils/privateUploadDirs.js). This
   closes the door on what is already on disk, which cannot be un-uploaded: the
   pre-Azure deliverables are still read from these directories by the download
   routes, but as a filesystem read behind an auth check, never over HTTP.

   404 rather than 403: whether a given file exists is not something an
   unauthenticated caller should be able to learn either. */
app.use("/uploads", (req, res, next) => {
  const first = req.path.split("/").filter(Boolean)[0] || "";
  if (PRIVATE_UPLOAD_PREFIXES.includes(first)) {
    return res.status(404).json({ success: false, error: "not_found" });
  }
  return next();
});

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
/* llmLimiter AFTER requireAuth, so the bucket is keyed by user rather than by
   IP — two people on one office network must not throttle each other. */
app.post("/api/smartgen/stream", requireAuth, llmLimiter, async (req, res) => {
  const { prompt, context = {}, skillMode = false, deepMode } = req.body || {};

  if (!prompt || typeof prompt !== "string" || prompt.trim().length < 3) {
    return res.status(400).json({ success: false, error: "prompt_required" });
  }
  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({ success: false, error: "missing_openai_key" });
  }

  const userId = req.user?.id || req.user?._id?.toString?.() || null;

  /* ── Quota gate ───────────────────────────────────────────────────────────
     Generation is metered HERE, not on POST /api/smartgen, because this is the
     request that spends money. The old arrangement split the two: this route
     called the model and billed nothing, and a *separate* POST /api/smartgen
     recorded the run and billed whatever number the browser put in
     `tokensUsed`. Three things followed from that, and none of them needed
     anyone to be acting in bad faith:

       - A run that never reached the save call was free. Closing the tab,
         losing the network, or any failure between the two requests meant the
         model had been paid for and nothing was deducted.
       - The amount billed was the client's arithmetic, unverified.
       - That arithmetic was `completionTokens` only, so input tokens were never
         billed at all — on a long document that is most of the real cost.

     The check runs BEFORE flushHeaders() so a user who cannot pay gets an
     ordinary JSON error with a status, rather than an SSE stream carrying an
     error event. assertCanSpend writes nothing; the actual deduction happens
     after the model replies, when the true token count is known. */
  if (userId) {
    try {
      await assertCanSpend(userId);
    } catch (quotaErr) {
      const known = SPEND_ERRORS[quotaErr?.message];
      if (known) {
        return res.status(known.status).json({
          success: false,
          error: quotaErr.message,
          message: known.message,
        });
      }
      console.error("[stream] quota pre-check failed:", quotaErr?.message || quotaErr);
      return res.status(500).json({ success: false, error: "quota_check_failed" });
    }
  }

  /* Answers present is what makes a request "deep" — unless the caller says
     otherwise. The client currently sends deepMode:false with answers attached
     on purpose: it wants Skill Mode's sectioned format, with the answers used as
     context rather than the long deep variant. Inferring it from the answers
     alone left no way to ask for that. Callers that send nothing behave exactly
     as before. */
  const hasDeepAnswers = !!(context.deepAnswers && Object.keys(context.deepAnswers || {}).length > 0);
  const isDeepMode =
    typeof deepMode === "boolean" ? deepMode && hasDeepAnswers : hasDeepAnswers;

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
    /* Sectioned, not prose. This used to demand the opposite — "NO section
       headers, NO bullet lists", 150–350 words of flowing text — and that is
       why the normal mode looked so much poorer than Skill Mode for the same
       idea. It was not a model or a length problem: SmarterPrompt.tsx's
       renderer builds its gradient pills from section headers, its tables from
       pipe rows and its list styling from bullets (see isSectionHeader /
       parseBlocks there). A single flowing paragraph gives that renderer
       nothing to work with, so the output rendered as one grey wall of text
       with no badges — while Skill Mode, which emits `**Header**` lines, came
       out fully formatted.

       The section names are deliberately the same vocabulary Skill Mode uses
       (skillEngine/constants.js REQUIRED_SECTIONS), minus the heavy ones, so
       the two modes read as the same product at different depths rather than
       as two different tools. */
    systemPrompt = PLAIN_SYSTEM_PROMPT;
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
        /* Cooler for the plain mode, because that mode is now a fixed
           six-header template and 0.7 was warm enough that the model kept
           inventing its own headings instead ("Requirements:", "Example
           Structure:") — which renders as the wrong badges. Skill and Deep keep
           0.7: their format is enforced afterwards by validateDetailedOutput
           and a retry, so creativity there costs nothing. */
        temperature: skillMode || isDeepMode ? 0.7 : 0.35,
        /* The plain mode's 800 was sized for the 150–350 words its old system
           prompt asked for. It now asks for 450–800 words across six sections
           with tables, and 800 tokens truncates that mid-section — which the
           renderer shows as a pill with nothing under it. */
        max_tokens: isDeepMode ? 2800 : skillMode ? 2200 : 2000,
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

    /* ── Meter the run ────────────────────────────────────────────────────
       total_tokens, not completion_tokens: input is billable and on a long
       document it is most of the cost. The provider's own count is used when
       it arrives, which is the only number that matches what we are charged.

       When it does not arrive — a truncated stream, or a response that carried
       no usage block — the fallback counts the same text locally with
       utils/tokenizer.js rather than dividing characters by 3.5. The estimate
       it replaces is roughly right for English prose and badly wrong for code,
       JSON and Devanagari, all of which this endpoint handles.

       A failure here cannot be surfaced: the output has already been streamed
       to the client token by token, so there is nothing left to refuse. It is
       logged and reported instead. The pre-check above is what keeps this rare
       — by this point the account was solvent a few seconds ago, so the
       remaining cases are races between two concurrent generations. */
    let billedTokens = null;
    if (userId && optimizedText) {
      try {
        billedTokens = usage?.total_tokens;
        if (!Number.isFinite(billedTokens) || billedTokens <= 0) {
          const model = process.env.OPENAI_STREAM_MODEL || "gpt-4o-mini";
          billedTokens =
            tokenizer.countTokens(systemPrompt || "", model).tokens +
            tokenizer.countTokens(prompt.trim(), model).tokens +
            tokenizer.countTokens(optimizedText, model).tokens;
        }
        if (billedTokens > 0) {
          await spendTokensForUser(userId, billedTokens, "smartgen");
        }
      } catch (spendErr) {
        console.error(
          `[stream] metering failed for user ${userId} (${billedTokens} tokens):`,
          spendErr?.message || spendErr
        );
        telemetry.trackError(spendErr, {
          kind: "smartgenMeteringFailed",
          userId: String(userId),
          tokens: billedTokens,
        });
      }
    }

    sendEvent({
      done: true,
      optimizedText,
      /* billedTokens is what was actually deducted. `usage` stays as it was so
         nothing that already reads promptTokens/completionTokens breaks. */
      billedTokens,
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

/* Shared by /pdf-to-prompt and /doc-to-markdown: turn extracted document text
   into one ready-to-use prompt. Both routes reach the model the same way, so
   the system prompt lives here once — editing it in two places was how the two
   paths would quietly drift apart. */
async function buildPromptFromDocumentText(documentText, { instructions = "", sourceLabel = "" } = {}) {
  // gpt-4o-mini has a 128k-token context window, so we can afford to send a lot
  // of the document — this was the main reason long documents lost content.
  const MAX_CHARS = 60000;
  const truncated = documentText.length > MAX_CHARS;
  const textForModel = truncated ? documentText.slice(0, MAX_CHARS) : documentText;

  /* Sectioned for the same reason the plain /stream mode is: SmarterPrompt.tsx
     renders section headers as gradient pills, pipe rows as real tables and
     "- " lines as styled lists (see isSectionHeader / parseBlocks there). This
     route asked only for "short paragraphs and/or bullet points", so
     document-derived prompts came out as unbadged grey text — visibly poorer
     than Skill Mode for the same work — and the document's own figures ended
     up buried in prose instead of in a table where they can be checked against
     the source. */
  const systemPrompt = buildDocumentSystemPrompt({
    sourceLabel,
    totalChars: documentText.length,
    truncated,
    maxChars: MAX_CHARS,
  });

  const trimmedInstructions = String(instructions || "").trim();
  const userMessage = trimmedInstructions
    ? `Extracted document text:\n"""${textForModel}"""\n\nThe user also asked: "${trimmedInstructions}"\n\nConvert this into a single, ready-to-use prompt as instructed above.`
    : `Extracted document text:\n"""${textForModel}"""\n\nConvert this into a single, ready-to-use prompt as instructed above.`;

  const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: process.env.OPENAI_STREAM_MODEL || "gpt-4o-mini",
      temperature: 0.5,
      /* 900 words of prose is ~1,200 tokens, but the tables this now asks for
         are token-dense — pipes, padding and short cells cost far more per
         word than prose. 1700 clipped the last sections of a long document's
         prompt, and a truncated section renders as a pill with nothing under
         it. */
      max_tokens: 2600,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
    }),
  });

  if (!openaiRes.ok) {
    const errData = await openaiRes.json().catch(() => ({}));
    const err = new Error(errData?.error?.message || "openai_error");
    err.httpStatus = 502;
    throw err;
  }

  const data = await openaiRes.json();
  const promptText = (data?.choices?.[0]?.message?.content || "").trim();
  if (!promptText) {
    const err = new Error("empty_response");
    err.httpStatus = 502;
    throw err;
  }

  const usage = data?.usage
    ? { promptTokens: data.usage.prompt_tokens, completionTokens: data.usage.completion_tokens, totalTokens: data.usage.total_tokens }
    : null;

  return { prompt: promptText, truncated, usage };
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

      const { prompt, truncated, usage } = await buildPromptFromDocumentText(extractedText, {
        instructions: req.body?.instructions,
        sourceLabel: pageCount ? `${pageCount} page(s)` : "",
      });

      return res.json({ success: true, prompt, truncated, usage });
    } catch (err) {
      console.error("[pdf-to-prompt] error:", err?.message || err);
      return res.status(err?.httpStatus || 500).json({
        success: false,
        error: err?.httpStatus === 502 ? err.message : "server_error",
      });
    }
  }
);

/* ===============================
   SMARTGEN — ANY DOCUMENT → MARKDOWN (and optionally → PROMPT)
   Supersedes /pdf-to-prompt above, which stays for backward compatibility.
   Must be registered before app.use('/api/smartgen', ...) for the same reason.

   `mode` decides what the user gets back:
     markdown → clean .md only. No LLM call, so no tokens are spent and the
                caller is not quota-gated — conversion is pure local CPU.
     prompt   → the old behaviour: read the doc, return a ready-to-use prompt.
     both     → both payloads from a single upload and a single conversion.
================================ */
const docToMarkdownUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: docToMarkdown.MAX_FILE_BYTES },
});

app.post(
  "/api/smartgen/doc-to-markdown",
  requireAuth,
  docToMarkdownUpload.single("file"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, error: "file_required" });
      }

      const mode = ["markdown", "prompt", "both"].includes(req.body?.mode)
        ? req.body.mode
        : "prompt";
      const wantsPrompt = mode === "prompt" || mode === "both";

      if (wantsPrompt && !process.env.OPENAI_API_KEY) {
        return res.status(500).json({ success: false, error: "missing_openai_key" });
      }

      let converted;
      try {
        converted = await docToMarkdown.convertToMarkdown(
          req.file.buffer,
          req.file.originalname
        );
      } catch (err) {
        if (err instanceof docToMarkdown.DocConversionError) {
          return res.status(400).json({ success: false, error: err.code, message: err.message });
        }
        throw err;
      }

      const payload = {
        success: true,
        mode,
        filename: req.file.originalname,
        format: converted.format,
        charCount: converted.charCount,
      };

      // Markdown always rides along for `both` so the client doesn't have to
      // upload the same file twice to get the other half.
      if (mode === "markdown" || mode === "both") {
        payload.markdown = converted.markdown;
      }

      if (wantsPrompt) {
        const { prompt, truncated, usage } = await buildPromptFromDocumentText(converted.markdown, {
          instructions: req.body?.instructions,
          sourceLabel: `${converted.format.toUpperCase()} document`,
        });
        payload.prompt = prompt;
        payload.truncated = truncated;
        payload.usage = usage;
      }

      return res.json(payload);
    } catch (err) {
      console.error("[doc-to-markdown] error:", err?.message || err);
      return res.status(err?.httpStatus || 500).json({
        success: false,
        error: err?.httpStatus === 502 ? err.message : "server_error",
      });
    }
  }
);

/* ===============================
   TOKEN COUNT
================================ */
/* What the box beside the textarea reads while you type.
 *
 * Unauthenticated and unmetered on purpose: this spends no LLM tokens and calls
 * nothing external — it is a table lookup over the text it was handed. Putting
 * it behind requireAuth would mean a signed-out visitor on the optimiser page
 * sees a wrong number, which is the situation this whole change exists to end.
 *
 * The global limiter still applies, and that is the protection that matters
 * here: the work is proportional to the text, so the cost of abuse is CPU on a
 * long body rather than money. Hence the size cap below, which is generous
 * against any real prompt and firm against a paste of a novel.
 *
 * The client debounces; this endpoint does not care how often it is called.
 */
const TOKEN_COUNT_MAX_CHARS = 200_000;

app.post("/api/tokens/count", (req, res) => {
  const text = typeof req.body?.text === "string" ? req.body.text : "";

  if (text.length > TOKEN_COUNT_MAX_CHARS) {
    return res.status(413).json({
      success: false,
      error: "text_too_long",
      maxChars: TOKEN_COUNT_MAX_CHARS,
    });
  }

  const { tokens, encoding } = tokenizer.countTokens(text, req.body?.model);

  return res.json({
    success: true,
    tokens,
    words: tokenizer.countWords(text),
    encoding,
  });
});

/* Lets the frontend build its file-picker `accept` list from the server's
   actual capability instead of a hand-maintained copy that drifts. */
app.get("/api/smartgen/supported-formats", (_req, res) => {
  res.json({
    success: true,
    extensions: docToMarkdown.SUPPORTED_EXTENSIONS,
    accept: docToMarkdown.ACCEPT_ATTRIBUTE,
    maxBytes: docToMarkdown.MAX_FILE_BYTES,
  });
});

app.use("/api/smartgen-detect", smartgenDetectRoutes);
app.use("/api/smartgen", smartgenRoutes);
app.use("/api/saved-collections", savedCollectionRoutes);
app.use("/api/category", categoryRoutes);
app.use("/api/prompt", promptRoutes);
app.use("/api/purchase", purchaseRoutes);
app.use("/api/llm-provider", llmProviderRoutes);
app.use("/api/promptoptimizer", promptoptimizerRoutes);
app.use("/api/promptreport", promptreportRoutes);
app.use("/api/newsletter", require("./routes/newsletterRoutes"));
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
/* /api/kyc is gone. Tokun's own identity-document flow (Aadhaar/Passport
   upload + OCR name match) is deleted — nothing gated on it: the two
   requireKycVerified middlewares were mounted on no live route, so the
   403 KYC_REQUIRED the frontend modal waited for could never be sent.
   Seller onboarding goes through Razorpay Route payout accounts instead
   (routes/bankAccounts.js), which carries its own KYC — see
   constants/kycRequirements.js, which is a DIFFERENT thing and still live. */
app.use("/api/activity", activityRoutes);
app.use("/api/wallet", walletRoutes);
app.use("/api/hire", hireRoutes);
/* Renders agreement markup to PDF for the NdaCard download button. */
app.use("/api/agreement", require("./routes/agreement"));
app.use("/api/admin/escrow", adminEscrowRouter);
app.use("/api/admin/prompt-validation", adminPromptValidationRouter);
app.use("/api/admin/notifications", adminNotificationsRouter);
app.use("/api/admin/refunds", adminRefundsRouter);
app.use("/api/admin/nda", adminNdaRouter);
/* Cancelling a funded booking, and the split when the two sides can't agree.
   One router for both hire deals and service bookings — the order kind is a
   path param, because the money maths is identical for the two. */
app.use("/api/escrow", escrowCancellationRoutes);
/* One feed of everything the caller has bought and sold — prompts, service
   bookings and hire deals — so the header's Orders button has a single place
   to point at. */
app.use("/api/my-orders", myOrdersRoutes);
/* Reference material a client attaches to a brief — uploaded before the order
   exists, then read back through the same private-blob gate deliverables use. */
app.use("/api/brief", briefAttachmentRoutes);
/* Mid-project checkpoints — the client asks to see progress, the freelancer
   answers with a screenshot or recording. Doubles as dated evidence when a
   cancellation turns into an argument about how much was done. */
app.use("/api/progress-review", progressReviewRoutes);
app.use("/api/access-requests", accessRequestRoutes);
/* Reviews between the two sides of a finished booking — anchored to a real
   paid transaction, one per booking per direction. */
app.use("/api/reviews", reviewRoutes);
app.use("/api/product-reviews", productReviewRoutes);
app.use("/api/admin/rating-penalties", adminRatingPenaltyRoutes);
app.use("/api/referrals", referralRoutes);
app.use("/api/admin/disputes", adminDisputesRouter);
app.use("/api/admin/platform-revenue", adminPlatformRevenueRouter);
app.use("/api/admin/payments", adminPaymentsRouter);
app.use("/api/admin/orgs", adminOrgsRouter);
app.use("/api/report", reportRoutes);

/* /api/screen-recording used to mount here. The feature was retired from the
   UI — nothing ever called setScreenPermOpen(true), so the permission modal
   could not open — but the router stayed mounted, which is the part that
   mattered: a dead UI does not close an HTTP endpoint. GET /all took no working
   auth (it used a stub middleware that assigned every caller the same
   hardcoded user id) and answered with every recording, populated with each
   user's name and email plus guest name/email, unpaginated. Router, route file,
   and the stub middleware are all deleted. The ScreenRecording collection and
   server/uploads/screen-recordings/ are untouched — that is data, and dropping
   it is a separate decision. */

/* Become-a-Freelancer. The admin queue is mounted on its own path rather than
   under adminRoutes because it authenticates as an admin token (req.isAdmin),
   matching the other /api/admin/* routers above. */
app.use("/api/freelancer", freelancerRoutes);
app.use("/api/admin/freelancers", adminFreelancersRouter);

// ✅ Separate Admin Message APIs
app.use("/api/admin-message", adminMessageRoutes);

// ✅ Memory routes (SmartGen memory system)
app.use("/api/memory", memoryRoutes);

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "sample.html"));
});

/* ===============================
   404 + ERROR HANDLER
   Must stay LAST — after every app.use above. Express picks middleware in
   registration order, so a 404 registered earlier would swallow real routes.
================================ */

/* Unknown /api/* paths answered as JSON. Without this they fall through to
   Express's default, which returns an HTML error page — and the frontend does
   res.json() on it and reports a parse error instead of "not found". */
app.use("/api", (req, res) => {
  res.status(404).json({
    success: false,
    error: "not_found",
    message: `Cannot ${req.method} ${req.baseUrl}${req.path}`,
  });
});

/* The four-argument signature is what marks this as an error handler; drop the
   unused `next` and Express treats it as ordinary middleware and never calls it.

   Every branch below is a client mistake that arrives here looking like a server
   fault. They are separated out so real 500s stay rare enough to be worth
   reading — a log full of "someone posted malformed JSON" trains you to ignore
   it, which is how the actual crash goes unnoticed. */
app.use((err, req, res, _next) => {
  /* corsOptions.origin rejects with `new Error("CORS not allowed: …")`. That is
     a blocked browser, not a broken server, and it must not be logged at error
     level or a scanner hitting the host fills the log. */
  if (err && String(err.message || "").startsWith("CORS not allowed")) {
    return res.status(403).json({ success: false, error: "cors_denied" });
  }

  /* express.json() rejects malformed bodies with a SyntaxError carrying
     status 400, and oversized ones with entity.too.large / 413. Both already
     know their own status. */
  if (err && (err.type === "entity.parse.failed" || err.type === "entity.too.large")) {
    return res.status(err.status || 400).json({
      success: false,
      error: err.type === "entity.too.large" ? "payload_too_large" : "invalid_json",
    });
  }

  if (err instanceof multer.MulterError) {
    /* "Upload rejected" was the message for everything except a size overrun,
       which tells a seller nothing about what to change. A fileFilter that
       rejects a file for a reason worth explaining now sets err.message itself
       (see the attachment filter in routes/promptRoutes.js), and it is passed
       through when it looks like a sentence rather than one of multer's own
       internal strings ("Unexpected field", "Field name too long", …). */
    const ownMessage =
      typeof err.message === "string" && /[a-z]\s[a-z]/i.test(err.message) && err.message.endsWith(".")
        ? err.message
        : null;

    return res.status(400).json({
      success: false,
      error: "upload_failed",
      code: err.code,
      message:
        err.code === "LIMIT_FILE_SIZE"
          ? "File is too large"
          : ownMessage || "Upload rejected",
    });
  }

  if (err && err.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      error: "validation_failed",
      fields: Object.keys(err.errors || {}),
    });
  }

  /* A malformed ObjectId in the URL. Mongoose throws on the cast, which without
     this reads as a 500 for what is really a bad link. */
  if (err && err.name === "CastError") {
    return res.status(400).json({ success: false, error: "invalid_id" });
  }

  /* Anything past here is genuinely unexpected.

     The id is the point: the client is told an opaque reference and the full
     stack goes to the log under that same reference, so a user's screenshot can
     be matched to a stack trace without ever putting the stack in the response.
     Leaking one is not academic here — these stacks carry file paths, query
     shapes, and sometimes the values that were being written. */
  const errorId = require("crypto").randomUUID();
  const status = err && Number.isInteger(err.status) ? err.status : 500;

  console.error(
    `[error ${errorId}] ${req.method} ${req.originalUrl}` +
      (req.user?._id ? ` user=${req.user._id}` : ""),
    err
  );

  /* The other end of the errorId. console.error above goes to a stream that is
     not retained; this puts the same stack under the same id somewhere it can be
     found from the id alone, which is the whole point of handing one to the
     client. Query in App Insights:

       exceptions | where customDimensions.errorId == "<id from the user>"

     route rather than originalUrl as its own dimension so errors group by
     endpoint instead of splitting across every distinct id in the path. */
  telemetry.trackError(err, {
    errorId,
    method: req.method,
    url: req.originalUrl,
    route: req.route?.path || req.baseUrl || "unmatched",
    status,
    userId: req.user?._id,
    isAdmin: req.isAdmin === true,
  });

  res.status(status).json({
    success: false,
    error: "server_error",
    errorId,
    /* Outside production the message is worth having in the browser; the stack
       still is not, in either environment. */
    ...(process.env.NODE_ENV === "production"
      ? {}
      : { message: err?.message }),
  });
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
    /* The same list the HTTP API uses, not a second copy of it. These two were
       maintained separately, so adding a domain in one place fixed the REST
       calls and left chat and notifications silently failing on that host. */
    origin: allowedOrigins,
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

// Presence tracking. There was none before, which is why the chat UI simply
// hardcoded a green dot on every avatar.
const {
  isUserOnline,
  addPresence,
  removePresence,
  onlineFrom,
} = require("./utils/presence");

/**
 * Tell each recipient a chat message arrived, on their personal room.
 *
 * "new-message" goes to the conversation room, which a client only joins while
 * that thread is open — useless for a header badge on any other page. This lands
 * wherever the user has the app open.
 */
function notifyRecipients(recipientIds, payload) {
  (recipientIds || []).forEach((id) => {
    io.to(String(id)).emit("chat:notify", payload);
  });
}

// So HTTP routes (e.g. the chat attachment upload) can broadcast the same way
// the socket handlers do.
app.set("notifyChatRecipients", notifyRecipients);

/* Live membership of every collab room: sessionId -> Map(socket.id -> member).
   See the note where it's used, inside the connection handler below.

   Declared HERE, at module scope, and not inside that handler — one map shared
   by every socket is the entire point. A `new Map()` inside the handler would
   give each connection its own private copy, so nobody would ever see anybody
   else in the room. */
const collabRooms = new Map();

// --- REAL-TIME SOCKET LOGIC ---
/* ===============================
   SOCKET HANDSHAKE AUTH
================================ */
/* Identity is established HERE, once, and every handler below reads it from
   socket.data. Nothing downstream may take a user id from an event payload.

   What this replaces: the connection handler used to begin with

       const userId = socket.handshake.auth?.userId;

   — the id the CLIENT said it was, with nothing verifying it. There was no
   io.use() and no jwt.verify anywhere in the socket path, so a socket could
   claim to be anyone and then join that person's rooms. `send-message` was the
   sharp end: it wrote `sender: senderId` straight from the payload, so any
   connection could post a message as any user into any conversation. Chat logs
   are evidence in escrow disputes, which makes a forged message a money problem
   and not only a privacy one.

   Anonymous sockets are still allowed to CONNECT, deliberately: collab sessions
   are share-a-link and support people who are not signed in (see peersOf, which
   keys them by socket id). They get userId = null and every handler that needs
   an identity turns them away. What is NOT allowed is a token that fails to
   verify — that is a broken or forged client, and it gets told so rather than
   being quietly downgraded to anonymous.

   The display name is resolved here too. join-session used to look it up per
   join; now it is read once at handshake, and it is server-sourced, so the name
   shown next to what someone types cannot be chosen by them. */
io.use(async (socket, next) => {
  const token = socket.handshake.auth?.token;

  // No token at all → anonymous. Allowed to connect, allowed to do very little.
  if (!token) {
    socket.data.userId = null;
    socket.data.isAdmin = false;
    socket.data.name = "Someone";
    return next();
  }

  try {
    const payload = jwt.verify(String(token), process.env.JWT_SECRET);

    if (payload.type === "admin") {
      const admin = await AdminUser.findById(payload.sub).select("email isActive").lean();
      if (!admin || admin.isActive === false) return next(new Error("unauthorized"));
      socket.data.userId = String(admin._id);
      socket.data.isAdmin = true;
      socket.data.name = admin.email || "Admin";
      return next();
    }

    const user = await User.findById(payload.sub).select("name email").lean();
    if (!user) return next(new Error("unauthorized"));
    socket.data.userId = String(user._id);
    socket.data.isAdmin = false;
    socket.data.name = user.name || user.email || "Someone";
    return next();
  } catch {
    return next(new Error("unauthorized"));
  }
});

/** Is this socket's user a participant of this chat conversation? */
async function canJoinConversation(socket, conversationId) {
  const uid = socket.data.userId;
  if (!uid) return false;
  if (socket.data.isAdmin) return true;
  try {
    const convo = await Conversation.findById(conversationId)
      .select("participants")
      .lean();
    return !!convo && (convo.participants || []).some((p) => String(p) === uid);
  } catch {
    // A malformed id casts and throws — not a member, and not a 500 either.
    return false;
  }
}

/** Is this socket's user a party to this admin conversation? */
async function canJoinAdminConversation(socket, conversationId) {
  const uid = socket.data.userId;
  if (!uid) return false;
  try {
    const convo = await AdminConversation.findById(conversationId)
      .select("adminId sellerId")
      .lean();
    if (!convo) return false;
    return String(convo.adminId) === uid || String(convo.sellerId) === uid;
  } catch {
    return false;
  }
}

io.on("connection", (socket) => {

  /* Server-resolved, from the verified handshake above. Never from a payload. */
  const userId = socket.data.userId;

  if (userId) {
    // Existing chat personal room
    socket.join(String(userId));

    // ✅ New admin-message personal room
    socket.join(`admin-message-user:${userId}`);

    // Announce only on the actual offline -> online transition, so opening a
    // second tab doesn't spam every client with a redundant "came online".
    if (addPresence(userId, socket.id)) {
      io.emit("presence:update", { userId: String(userId), online: true });
    }
  }

  /* ===============================
     PRESENCE
  ================================ */

  // A client asks for the current state of the people in its conversation list,
  // because it can't infer who was already online before it connected.
  socket.on("presence:get", ({ userIds } = {}, ack) => {
    const online = onlineFrom(Array.isArray(userIds) ? userIds : []);
    if (typeof ack === "function") ack({ online });
    else socket.emit("presence:state", { online });
  });

  /* ===============================
     TYPING
  ================================ */

  // Relayed to the conversation room but NOT back to the sender — you should
  // never see your own "typing…". The client also stops it on send and on a
  // short idle timer, so a dropped stop event can't leave it stuck on.
  /* The payload used to carry `userId` and it was relayed as-is, so a socket
     could make anyone appear to be typing. It is ignored now — the id comes
     from the handshake. Relay is also limited to rooms this socket actually
     joined, and joining is membership-checked below. */
  socket.on("typing:start", ({ conversationId } = {}) => {
    if (!conversationId || !userId) return;
    if (!socket.rooms.has(String(conversationId))) return;
    socket.to(String(conversationId)).emit("typing:start", {
      conversationId: String(conversationId),
      userId: String(userId),
    });
  });

  socket.on("typing:stop", ({ conversationId } = {}) => {
    if (!conversationId || !userId) return;
    if (!socket.rooms.has(String(conversationId))) return;
    socket.to(String(conversationId)).emit("typing:stop", {
      conversationId: String(conversationId),
      userId: String(userId),
    });
  });

  /* ===============================
     ADMIN MESSAGE SOCKETS
  ================================ */

  /* Membership-checked. This used to join whatever id it was handed, so any
     socket could name an admin conversation and listen to it. */
  socket.on("admin-message:join", async (payload = {}) => {
    const conversationId =
      typeof payload === "string" ? payload : payload.conversationId;

    if (!conversationId) return;
    if (!(await canJoinAdminConversation(socket, conversationId))) return;

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

  /* Membership-checked, for the same reason as admin-message:join. A socket
     naming someone else's conversationId here was enough to receive every
     new-message emitted into that thread, live. */
  socket.on("join-chat", async (payload = {}) => {
    const conversationId =
      typeof payload === "string" ? payload : payload.conversationId;

    if (!conversationId) return;
    if (!(await canJoinConversation(socket, conversationId))) return;

    socket.join(String(conversationId));
  });

  /* `senderId` is no longer read from the payload.

     It used to be, and it went straight into `sender:` on the stored document —
     the single worst line in this file. Any socket could write a message
     attributed to any user, into any conversation, and it would render as
     genuine to everyone including an admin reviewing an escrow dispute.

     The sender is now the authenticated socket, and the socket must be a
     participant of the conversation it is writing to. */
  socket.on("send-message", async ({ conversationId, text, clientId }) => {
    try {
      if (!conversationId || !userId || !String(text || "").trim()) return;
      if (!(await canJoinConversation(socket, conversationId))) return;

      const senderId = userId;

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

      // Mark delivered for any participant (other than the sender) who is
      // connected right now. This is what turns one tick into two: "stored" vs
      // "actually reached the other person's client".
      let deliveredTo = [];
      let recipients = [];
      try {
        const convo = await Conversation.findById(conversationId).select("participants").lean();
        recipients = (convo?.participants || [])
          .map(String)
          .filter((p) => p !== String(senderId));
        deliveredTo = recipients.filter((p) => isUserOnline(p));

        if (deliveredTo.length) {
          await Message.updateOne(
            { _id: message._id },
            { $addToSet: { deliveredTo: { $each: deliveredTo } } }
          );
        }
      } catch (e) {
        // Non-fatal: the message is already saved and about to be emitted. A
        // failed receipt just leaves it showing as sent rather than delivered.
        console.error("delivery receipt failed:", e?.message);
      }

      io.to(String(conversationId)).emit("new-message", {
        _id: message._id,
        conversationId,
        // Echoed back untouched so the sender can swap its optimistic row for
        // the stored message instead of rendering both.
        clientId: clientId || null,
        sender: senderId,
        text,
        createdAt: message.createdAt,
        deliveredTo,
        readBy: [String(senderId)],
      });

      // The room above only contains people with this thread open, so it can't
      // drive an app-wide unread badge. Each recipient's personal room can.
      notifyRecipients(recipients, {
        conversationId: String(conversationId),
        messageId: String(message._id),
        senderId: String(senderId),
        preview: String(text).slice(0, 140),
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
     READ RECEIPTS / EDIT / DELETE
  ================================ */

  // Sent when the reader actually has the thread open. Marks every message in it
  // that isn't theirs as read, and tells the room so the sender's ticks turn
  // blue. Emitted to the whole room (not just the sender) so a third
  // participant's view stays consistent too.
  socket.on("message:read", async ({ conversationId } = {}) => {
    try {
      // The reader is the authenticated socket. Taking it from the payload let
      // one account mark another account's messages as read.
      const readerId = userId;
      if (!conversationId || !readerId) return;
      if (!(await canJoinConversation(socket, conversationId))) return;

      const result = await Message.updateMany(
        {
          conversationId,
          sender: { $ne: readerId },
          readBy: { $ne: readerId },
        },
        { $addToSet: { readBy: readerId, deliveredTo: readerId } }
      );

      // Nothing changed → nothing to tell anyone. Without this, simply having a
      // thread open re-broadcasts on every focus event.
      if (!result.modifiedCount) return;

      io.to(String(conversationId)).emit("message:read", {
        conversationId: String(conversationId),
        userId: String(readerId),
        at: new Date().toISOString(),
      });
    } catch (err) {
      console.error("Socket message:read error:", err);
    }
  });

  // Message edit / delete were removed from the product: the chat UI no longer
  // offers either action, so the `message:edit` / `message:delete` socket
  // handlers are gone too — leaving them live would let a hand-crafted socket
  // event mutate history the UI says is immutable. Inbound `message:edited` /
  // `message:deleted` rendering stays on the client so rows changed before this
  // still display correctly.

  /* ===============================
     CALL SOCKETS
  ================================ */

  /* All three relay into another user's personal room, so all three need to
     know who is calling. They previously took the caller's identity from the
     payload (`fromUser`) and required no auth at all, which made this an open
     ring-anyone-as-anyone relay. `fromUser` is now built from the handshake;
     whatever the client sends under that key is discarded.

     Note that no frontend code emits `call-user` today — only the listeners
     exist (CallContext). The handler is kept rather than deleted because the
     receiving half is still wired, but it is no longer a relay a stranger can
     drive. */
  socket.on("call-user", ({ toUserId, conversationId, type }) => {
    if (!userId || !toUserId) return;

    io.to(String(toUserId)).emit("incoming-call", {
      fromUser: { _id: userId, name: socket.data.name },
      conversationId,
      type,
    });
  });

  socket.on("call-accepted", ({ toUserId, conversationId }) => {
    if (!userId || !toUserId) return;
    io.to(String(toUserId)).emit("call-accepted", { conversationId });
  });

  socket.on("end-call", ({ toUserId }) => {
    if (!userId || !toUserId) return;
    io.to(String(toUserId)).emit("call-ended");
  });

  /* ===============================
     COLLAB SESSION SOCKETS
  ================================ */

  /* WHO is in each collab room, not just how many.
     `session-peers` used to carry a bare count, taken from the socket.io room
     size — enough to decide "is anyone else here", and useless for telling the
     person on screen WHO turned up. There was nowhere to look it up either: the
     room is a set of socket ids, and CollabSession.participants only ever gets
     the creator appended.

     So membership is tracked here: sessionId -> Map(socket.id -> {userId, name}).
     Keyed by socket rather than by user because the same person can have two
     tabs open, and closing one must not remove them from the room.

     In memory on purpose. It describes who is connected RIGHT NOW, which is a
     fact about live sockets — on a restart every socket reconnects and rebuilds
     it, and a database row would just be a stale copy to clean up.

     Declared at module scope, above this connection handler: one map shared by
     every socket is the whole point. */

  /** The participant list for a room, in join order, deduped per person. */
  const peersOf = (sessionId) => {
    const members = collabRooms.get(String(sessionId));
    if (!members) return [];

    const byUser = new Map();
    for (const info of members.values()) {
      // Two tabs from one person are one participant. An anonymous socket (no
      // userId) is keyed by its own socket id so it still shows up as someone.
      const key = info.userId || `socket:${info.socketId}`;
      if (!byUser.has(key)) byUser.set(key, { userId: info.userId, name: info.name });
    }
    return [...byUser.values()];
  };

  /** Tell everyone in the room who is in it. */
  const broadcastPeers = (sessionId) => {
    const participants = peersOf(sessionId);
    io.to(String(sessionId)).emit("session-peers", {
      sessionId,
      // `count` is the number of PEOPLE now, not of sockets — two tabs used to
      // read as two collaborators and flip the session to "active" on its own.
      count: participants.length,
      participants,
    });
  };

  /* `userId` is no longer a parameter — it shadowed the authenticated id from
     the handshake, so a socket could join a session as somebody else and their
     name would appear against every edit. Anonymous joins still work (userId
     stays null): collab is share-a-link and not everyone in a session is signed
     in, which peersOf already accounts for. */
  socket.on("join-session", async ({ sessionId }) => {
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

      /* Resolved at handshake from the verified token, not looked up here and
         never sent by the client — this name appears next to what the person
         types. Anonymous sockets carry the "Someone" default. */
      const name = socket.data.name;

      if (!collabRooms.has(String(sessionId))) collabRooms.set(String(sessionId), new Map());
      collabRooms.get(String(sessionId)).set(socket.id, {
        socketId: socket.id,
        userId: userId ? String(userId) : null,
        name,
      });

      // Recorded on the session too, so it survives a restart and a later join
      // can see who has been in it. addToSet-style guard: the same person
      // rejoining must not stack up duplicate rows.
      if (userId && !session.participants?.some((p) => String(p.userId) === String(userId))) {
        session.participants.push({ userId });
        await session.save();
      }

      socket.emit("prompt-initial", {
        sessionId,
        text: session.text,
        // So a client that joins mid-session starts from the right place in the
        // ordering rather than accepting the next stale broadcast it hears.
        rev: session.rev || 0,
      });

      socket.to(String(sessionId)).emit("user-joined", { userId, name });

      // Everyone gets the full list, including the socket that just joined —
      // it needs to see whoever was already here.
      broadcastPeers(sessionId);
    } catch (err) {
      console.error("join-session error:", err);
    }
  });

  /* An optimised result, shared with the room.
     Optimising was purely local: the person who pressed the button saw the
     result and the person they were collaborating with saw nothing at all, on a
     screen whose entire purpose is that both of them are looking at the same
     prompt. Relayed rather than recomputed, so the two sides can't come back
     with different text — and only relayed, since the tokens were already
     charged to whoever ran it. */
  /* userId/name dropped from the payload — attribution comes from the
     handshake, and only sockets actually in the room may relay into it. */
  socket.on("prompt-optimized", ({ sessionId, result }) => {
    if (!sessionId || !result) return;
    if (!socket.rooms.has(String(sessionId))) return;
    socket.to(String(sessionId)).emit("prompt-optimized", {
      sessionId,
      userId,
      name: socket.data.name,
      result,
    });
  });

  socket.on("prompt-change", async ({ sessionId, text }) => {
    try {
      if (!sessionId) return;
      /* Must already be in the room. Without this any socket could rewrite any
         session's text by naming its id — and $inc means it would also win the
         revision race against the people actually in it. */
      if (!socket.rooms.has(String(sessionId))) return;

      /* Every accepted edit gets a number, and the number only goes up.

         Without one the two sides could not converge. Each client applied
         whatever arrived last, and "last" is different on each machine — so two
         people typing at the same moment ended up holding different text
         permanently, each convinced the other's update was the stale one. The
         server is the only place that sees both edits in a single order, so the
         order is decided here and travels with the text; a client that receives
         a revision it has already passed simply drops it.

         $inc, not read-then-write: two edits landing in the same tick would
         otherwise read the same value and both claim it. */
      const updated = await CollabSession.findOneAndUpdate(
        { sessionId },
        { $set: { text, updatedAt: new Date() }, $inc: { rev: 1 } },
        { upsert: true, new: true }
      );

      /* io.to, not socket.to — the SENDER gets this back too.

         Not so it can re-apply its own text (its handler no-ops on that), but so
         it learns which revision the server gave its edit. Without that ack a
         client has no idea where its own text sits in the ordering, so it cannot
         tell a genuinely newer edit from an older one that arrived late — and
         two people typing at once ended up simply swapping sentences, each
         adopting the other's and neither converging. */
      io.to(String(sessionId)).emit("prompt-change", {
        sessionId,
        text,
        userId,
        rev: updated?.rev ?? 0,
      });
    } catch (err) {
      console.error("prompt-change error:", err);
    }
  });

  socket.on("leave-session", ({ sessionId }) => {
    if (!sessionId) return;

    socket.leave(String(sessionId));
    collabRooms.get(String(sessionId))?.delete(socket.id);
    socket.to(String(sessionId)).emit("user-left", { userId });

    // Who is left, by name — same payload shape as the join, so the client has
    // one handler for both.
    broadcastPeers(sessionId);
  });

  socket.on("end-session", async ({ sessionId }) => {
    try {
      if (!sessionId) return;
      /* End Session deletes the row for everyone, so it has to come from
         someone who is in the session — not from anyone who knows its id. */
      if (!socket.rooms.has(String(sessionId))) return;

      await CollabSession.deleteOne({ sessionId });

      /* io.to(...), not socket.to(...): the person who pressed End Session has
         to be told too. They are the one waiting to see the session close. */
      io.to(String(sessionId)).emit("session-ended", {
        sessionId,
        endedBy: userId,
      });

      io.in(String(sessionId)).socketsLeave(String(sessionId));
      // The room is gone — drop its membership rather than leaving a map entry
      // that nothing will ever read or clean up.
      collabRooms.delete(String(sessionId));
    } catch (err) {
      console.error("end-session error:", err);
    }
  });

  socket.on("disconnect", () => {
    /* Collab rooms first, and OUTSIDE the `if (!userId)` below.

       "leave-session" only fires from the React cleanup — i.e. when the
       component unmounts. Closing the tab, losing the network or a browser
       crash never sends it, so without this the person stayed in the
       participant list forever and the other side kept showing them as present
       in a session they had left. This is the only signal that always arrives.

       It runs before the early return because an anonymous socket (no userId)
       is still a member that has to be removed. */
    for (const [sessionId, members] of collabRooms) {
      if (!members.delete(socket.id)) continue;

      if (members.size === 0) {
        collabRooms.delete(sessionId);
        continue;
      }
      broadcastPeers(sessionId);
    }

    if (!userId) return;

    // Only announce when this was the user's LAST socket — otherwise a closed
    // tab would mark someone offline while they're still using another one.
    if (removePresence(userId, socket.id)) {
      io.emit("presence:update", {
        userId: String(userId),
        online: false,
        lastSeen: new Date().toISOString(),
      });
    }

    // A socket can drop mid-typing (tab closed, network gone) and the stop event
    // never arrives, which would leave "typing…" on screen forever for the other
    // side. Clear it for every conversation room this socket was in.
    for (const room of socket.rooms) {
      if (room === socket.id) continue;
      socket.to(room).emit("typing:stop", {
        conversationId: String(room),
        userId: String(userId),
      });
    }
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

/* The AdminConversation index cleanup that used to sit between connect() and
   listen() has moved to scripts/fix-admin-conversation-index.js. It dropped an
   index and ran a deleteMany on EVERY boot, which on App Service means on every
   deploy, scale event and wake from idle — and two instances starting together
   raced each other on the same dropIndex. Run the script once, by hand:

       node scripts/fix-admin-conversation-index.js           # dry run
       node scripts/fix-admin-conversation-index.js --apply

   seedDefaultAdmin() has also gone; see utils/seedAdmin.js for why, and for
   what to run instead. Boot now connects and listens, and nothing else. */
mongoose
  .connect(MONGO_URI, {
    ssl: true,
    /* Fail fast instead of hanging. The default selection timeout is 30s, so a
       Mongo hiccup used to hold every request open long enough to exhaust the
       pool — one slow dependency turning into a whole-app outage. 10s is longer
       than any healthy Atlas response and short enough that a request gives up
       while the caller is still there.

       useNewUrlParser / useUnifiedTopology were here too. They have been no-ops
       since Mongoose 6 and are removed rather than left to imply they do
       something. */
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000,
    maxPoolSize: 20,
  })
  .then(() => {
    server.listen(PORT, () => {
      console.log(`Server listening on ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err);
    process.exit(1);
  });

/* Mongo dropping and recovering mid-flight was previously invisible: the
   connect() promise resolves once and never reports again, so a flapping
   database looked like unexplained slow requests. */
mongoose.connection.on("disconnected", () => console.error("MongoDB disconnected"));
mongoose.connection.on("reconnected", () => console.log("MongoDB reconnected"));
mongoose.connection.on("error", (err) => console.error("MongoDB error:", err));

/* ===============================
   LAST-RESORT PROCESS HANDLERS
================================ */
/* These do not keep the process alive — they make it say why it died.

   Node 18 already exits on an unhandled rejection; it just prints a warning
   that Azure's log stream does not always surface, so restarts appeared in the
   portal with no cause attached. express-async-errors (required at the top of
   this file) now routes route-handler rejections to the error middleware, so
   anything still arriving here came from outside a request: a cron job, a
   socket.io handler, a callback with no owner.

   Both handlers exit deliberately. A process that has thrown past every catch
   is in a state nobody reasoned about, and for a server that moves money,
   continuing in that state is worse than restarting — App Service brings it
   back in seconds. `exitCode` rather than exit() gives the log write a tick to
   flush; without it the reason is what gets lost. */
/* Both handlers flush before exiting. These are the two reports most worth
   having and the two most likely to be lost — the buffer dies with the process,
   so without an explicit flush a crash arrives in the portal as a restart with
   no cause, which is exactly the situation these handlers were added to fix.

   The existing 1000ms grace already covers the 2s-capped flush racing it: flush
   resolves on its own timeout, and exit() is what ends the wait either way. */
process.on("unhandledRejection", (reason) => {
  console.error("FATAL unhandledRejection:", reason);
  telemetry.trackError(reason, { fatal: true, kind: "unhandledRejection" });
  process.exitCode = 1;
  telemetry.flush().finally(() => process.exit(1));
  setTimeout(() => process.exit(1), 1000).unref();
});

process.on("uncaughtException", (err) => {
  console.error("FATAL uncaughtException:", err);
  telemetry.trackError(err, { fatal: true, kind: "uncaughtException" });
  process.exitCode = 1;
  telemetry.flush().finally(() => process.exit(1));
  setTimeout(() => process.exit(1), 1000).unref();
});

/* ===============================
   GRACEFUL SHUTDOWN
================================ */
/* App Service sends SIGTERM on every deploy, scale event and restart, then
   force-kills a few seconds later. With no handler the process died on the spot
   and whatever was mid-flight died with it — and on this server "mid-flight"
   includes a Razorpay verification, an escrow release and a wallet debit. Half
   a money operation is the expensive kind of bug: the payment happened, the
   record did not, and nothing in the logs says so.

   The order below is the whole point:

     1. stop accepting NEW connections, but let open ones finish. server.close()
        does exactly this — it does not cut anything off.
     2. tell socket clients to go away, so browsers reconnect to a healthy
        instance instead of sitting on a dead one waiting for a timeout.
     3. close Mongo LAST. Closing it first would fail every request that was
        being drained in step 1, which is the outcome this exists to avoid.

   The 15s cap is a backstop, not the plan. If a request is still running then,
   it is stuck, and holding the deploy open for it helps nobody. Azure's own
   grace period is short, so this stays comfortably inside it.

   `once`, not `on`: two SIGTERMs (Azure sending a second one, or someone
   pressing Ctrl-C twice) would otherwise start two shutdowns and the second
   would call close() on an already-closing server. */
let shuttingDown = false;

async function shutdown(signal) {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log(`${signal} received — shutting down`);

  // Anything still running when this fires is stuck; stop waiting for it.
  const hardExit = setTimeout(() => {
    console.error("Shutdown timed out after 15s — forcing exit");
    process.exit(1);
  }, 15000);
  hardExit.unref();

  try {
    // 1. No new connections; in-flight requests keep going.
    await new Promise((resolve) => server.close(resolve));
    console.log("HTTP server closed");

    // 2. Socket clients told to reconnect elsewhere.
    await new Promise((resolve) => io.close(resolve));
    console.log("Socket.io closed");

    // 3. Database last, once nothing needs it.
    await mongoose.connection.close(false);
    console.log("MongoDB closed");

    /* After Mongo, before exit: buffered telemetry from the requests just
       drained would otherwise be discarded. Capped at 2s inside flush(), so it
       cannot push the shutdown past the 15s backstop above. */
    await telemetry.flush();

    clearTimeout(hardExit);
    process.exit(0);
  } catch (err) {
    console.error("Error during shutdown:", err);
    process.exit(1);
  }
}

process.once("SIGTERM", () => shutdown("SIGTERM"));
process.once("SIGINT", () => shutdown("SIGINT"));
