# Tokun — Production Readiness Checklist

**31 Aug 2026** · branch `main` · Node/Express/MongoDB backend + React/Vite frontend on Azure

Production me kya-kya hona chahiye, aur aapke code me abhi kya hai. Har item actual code ke against verify karke tick kiya gaya hai — andaaze se nahi. Security sabse upar hai.

| | Matlab |
|---|---|
| ✅ | Hai — verify kiya |
| 🟡 | Aadha — kuch jagah hai, sab jagah nahi |
| ❌ | Nahi hai |
| ❓ | Code se pata nahi chalta — aapko Azure/Atlas me dekhna hai |

**Score: 69 ✅ · 15 🟡 · 29 ❌ · 4 ❓ — kul 117 items**

---

# 🔴 Sabse pehle: teen cheezein jo abhi karni hain

Ye code se nahi hotin, aapko khud karni padengi.

### 1. Admin ka password badlo

`utils/seedAdmin.js` me email `sagar@gmail.com` aur password plain text me likha tha, aur wo account **har server boot pe dobara ban jaata tha**. Code se hata diya gaya hai — lekin **database me wo account abhi bhi hai, usi password ke saath**. Jo bhi repo padh sakta hai wo admin panel me ghus sakta hai, jahan escrow balances aur KYC documents hain.

### 2. Blob containers ka access level dekho

`utils/uploadToAzure.js` har container `access: "container"` se banata hai — Azure me iska matlab **public read + public list** hai. Us helper se ye bante hain:

```
kyc-documents   chat-attachments   admin-message-attachments   refund-attachments
report-screenshots   feedback-screenshots   avatars
prompt-attachments   prompt-code   services   file
```

Sirf `service-work` private hai (`utils/serviceWorkStorage.js`, SAS tokens ke saath).

**Caveat:** `createIfNotExists` access sirf *pehli baar* set karta hai. Agar container manually private banaya gaya tha to wo private hi hoga. Code se main confirm nahi kar sakta — Azure Portal → Storage account → Containers me dekho.

Achhi baat: **KYC ke URLs kahin padhe hi nahi jaate** (maine check kiya — ekmatra read path commented hai). To `kyc-documents` ko private karne se **kuch nahi tootega**. Baaki containers (avatars, prompt-attachments waghairah) ki images site pe dikhti hain — unhe private karne se pehle SAS-read path banana padega, warna sab images toot jaayengi.

### 3. Azure pe Razorpay live keys daalo

Abhi `rzp_test_` chal raha hai. Maine verify kiya — key valid hai aur aaj bhi payments capture ho rahe hain, **lekin wo test-mode payments hain, asli paisa nahi**. Azure App Service → Environment variables me `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET` — teenon live account ke chahiye.

Aur ek pending migration:

```bash
cd server
node scripts/fix-admin-conversation-index.js           # dry run
node scripts/fix-admin-conversation-index.js --apply
```

---

# Backend — Node · Express · MongoDB · Azure App Service

## 🔐 Authentication & access

| | Cheez | Status |
|---|---|---|
| ✅ | Password hashing | bcrypt, salt rounds 10 |
| ✅ | JWT verify on HTTP routes | `utils/auth.js` requireAuth — user aur admin dono |
| ✅ | Token TTL ek jagah | `utils/authTokens.js` |
| ✅ | Admin role separation | 20 route files me `req.isAdmin` / role check |
| ✅ | Google OAuth | passport-google-oauth20 |
| ✅ | KYC gate middleware | `middleware/requireKycVerified.js` |
| ✅ | **Socket.io authentication** | `io.use()` JWT verify. Pehle client jo `userId` bhejta wahi maan liya jaata tha |
| ✅ | **Socket room authorization** | `join-chat` participants check, `admin-message:join` adminId/sellerId check |
| ✅ | Koi stub/bypass middleware nahi | 3-line stub jo har request ko hardcoded user banata tha — hata diya |
| ❌ | Refresh token rotation | 7-din JWT, koi rotation nahi. Token leak hua to 7 din valid |

## 🛡️ Hardening

| | Cheez | Status |
|---|---|---|
| ✅ | HTTPS / TLS | Azure App Service managed |
| ✅ | Security headers (helmet) | Teen exceptions, teenon ka reason file me likha hai |
| ✅ | CORS whitelist | Multi-origin, trailing slash strip, exposedHeaders |
| ✅ | Webhook signature verification | Razorpay raw body `express.json()` se pehle mount |
| ✅ | Secrets env se, code me nahi | `.env` git me nahi hai |
| ✅ | Koi hardcoded credentials nahi | Code saaf hai — **par DB me purana admin account abhi bhi hai** |
| ✅ | CSRF | Zaroorat nahi — Bearer token design, cookie-based nahi. Sahi choice hai |
| ✅ | Rate limiting — global | 600/5min per user-or-IP, `/health` skip |
| ✅ | Rate limiting — LLM routes | 30/10min. Frontend 429 pe saaf message dikhata hai |
| ✅ | Rate limiting — auth/OTP | Chaar limiters `ipKeyGenerator(req)` use kar rahe the (galat) — do bilkul kaam hi nahi kar rahe the. Fix hua |
| ✅ | `trust proxy` set | Iske bina Azure ke peeche saare users ek hi bucket share karte |
| ✅ | Upload size limits | 11 route files me `limits.fileSize` |
| 🟡 | Upload MIME/type filter | 9 route files me. 2 me koi bhi file type ja sakta hai |
| 🟡 | Request body size limit | `express.json()` bina options — Express default 100 kb, explicit set nahi |
| ❌ | Input validation library | Koi zod/joi/express-validator nahi. Har route manual check karta hai |

## ⚡ Error handling & resilience

| | Cheez | Status |
|---|---|---|
| ✅ | Global error handler | CORS/JSON/multer/validation/cast alag-alag handle |
| ✅ | 404 JSON handler | Pehle HTML page aata tha, frontend parse error dikhata tha |
| ✅ | Async errors handler tak jaate hain | `express-async-errors` — ek missing try/catch ab server nahi giraata |
| ✅ | unhandledRejection / uncaughtException | Log likh ke controlled exit |
| ✅ | Prod response me stack trace nahi | Client ko `errorId`, poora stack sirf log me |
| ✅ | Graceful shutdown (SIGTERM) | Drain → socket.io → mongo, 15s cap. In-flight request poora hota hai |
| ✅ | DB connect timeout + pool | 10s selection, pool 20. Pehle 30s default tha |
| ✅ | DB reconnect logging | disconnected / reconnected / error |
| ❌ | Retry / circuit breaker | OpenAI, Razorpay, Blob, SMTP — kisi pe retry policy nahi |

## 💾 Data integrity

| | Cheez | Status |
|---|---|---|
| ✅ | Schema validation | 46 mongoose models |
| ✅ | Indexes declared | 35 model files |
| ✅ | Migration script pattern | `scripts/` — dry-run by default, `--apply` se likhta hai |
| ✅ | Boot pe koi destructive operation nahi | `dropIndex` + `deleteMany` har boot pe chalte the — hata diye |
| ✅ | Webhook idempotency | `WebhookEvent` model |
| 🟡 | Transactions on money flows | Sirf `cartRoute.js`. Wallet, escrow, ledger, payouts bina transaction |
| 🟡 | Idempotency on money operations | 3 files me hai, baaki me nahi |
| ❌ | Restore tested | Jo backup restore karke dekha nahi gaya wo backup nahi hai |
| ❓ | Automated DB backups | Atlas pe on hain ya nahi, retention kitna |

## 📁 File storage

| | Cheez | Status |
|---|---|---|
| ✅ | Durable object storage available | `uploadToAzure.js`, `serviceWorkStorage.js` |
| ✅ | Paid-content gating | `escrowPreviewGate.js`, `deliverableWatermark.js` |
| ❌ | **Sensitive containers private** | 11 containers `access: "container"` (public) se bante hain. Sirf `service-work` private hai |
| 🟡 | Saare uploads Blob pe | 8 route files abhi bhi local disk pe likhti hain — Azure pe wo har deploy me mit jaati hain |
| ❌ | Uploads git se bahar | 191 upload files tracked, 256 MB disk pe |

## 👁️ Observability

| | Cheez | Status |
|---|---|---|
| ✅ | Liveness health check | `/health` |
| ✅ | Error IDs on 500s | User ka screenshot log ke stack se match ho sakta hai |
| 🟡 | Request correlation ID | Sirf 500 pe |
| ❌ | Readiness check (DB verify kare) | Mongo down ho tab bhi `/health` 200 deta hai |
| ❌ | Structured logger + levels | 865 plain console calls |
| ❌ | Error tracking | Na Sentry, na App Insights |
| ❌ | Metrics / APM | Response time, throughput, error rate — kuch nahi |
| ❌ | Uptime alerting | Server down ho to koi notification nahi |

## 🚀 Performance

| | Cheez | Status |
|---|---|---|
| ✅ | Streaming LLM responses | `/api/smartgen/stream` |
| 🟡 | Pagination | 11 route files me. Baaki list endpoints poora collection return karte hain |
| ❌ | Response compression | Koi `compression` middleware nahi |
| ❌ | Cache layer | Redis / in-memory kuch nahi |

## 🔧 Build & deploy

| | Cheez | Status |
|---|---|---|
| ✅ | CI pipeline | GitHub Actions, dono side |
| ✅ | Auto deploy on main | |
| 🟡 | Env validation at boot | Sirf `MONGO_URI`. Baaki 54 missing hon to server chalta rahega |
| ❌ | `.env.example` | 55 env vars, kahin documented nahi |
| ❌ | `npm ci` (lockfile respect) | `npm install` use ho raha hai — deploys reproducible nahi |
| ❌ | Slim deploy artifact | 256 MB uploads bhi artifact me ja rahe hain |
| ❌ | Automated tests | Zero test files, `npm test` → exit 1 |
| ❌ | Lint gate in CI | Deploy se pehle koi check nahi |
| ❓ | `NODE_ENV=production` on Azure | Error handler ispe depend karta hai |
| ❓ | Rollback plan | Kahin likha nahi |

---

# Frontend — React 18 · Vite · TypeScript · Azure Static Web Apps

## 🔐 Security

| | Cheez | Status |
|---|---|---|
| ✅ | Bundle me koi secret nahi | Sirf Razorpay `key_id`, jo public hai |
| ✅ | Protected routes | `RequireAuth` wrapper, App.tsx me use ho raha hai |
| ✅ | **HTML escaping before innerHTML** | `escapeHtml()` — pehle prompt content seedha DOM me jaata tha (stored XSS) |
| ✅ | Socket handshake pe token | Pehle `{ userId }` bhejta tha, ab `{ token }` |
| ✅ | HSTS / X-Frame-Options / nosniff / Referrer-Policy / Permissions-Policy | `staticwebapp.config.json` — do non-obvious choices, neeche dekho |
| 🟡 | Token storage | localStorage, 69 jagah se padha jaata hai |
| ❌ | Centralized API client | ~40 files apna `API_BASE` banati hain, 123 localhost fallback |
| ❌ | 401 interceptor / auto-logout | Token expire hone pe random errors, logout nahi hota |
| ❌ | CSP header | Baaki headers lag gaye, CSP nahi — report-only mode se shuru karna |

> **`staticwebapp.config.json` ke do decisions** — wo file strict JSON hai, usme comment nahi likh sakte, isliye yahan:
>
> **`payment=(self "https://api.razorpay.com" "https://checkout.razorpay.com")`** — sirf `payment=(self)` likhne se live pe `Permissions policy violation: payment is not allowed in this document` aata tha. Razorpay ka checkout ek iframe me chalta hai jo `api.razorpay.com` pe hai — alag origin, isliye `self` usse cover nahi karta. Payment fir bhi ho jaata tha (Razorpay browser ke native payment sheet ke bina apne UI pe fall back kar deta hai), par Google Pay jaisi autofill wali suvidha chali jaati thi. Feature ko header se hataana kaam nahi karega — browser ka default bhi `self` hi hai, origin explicitly likhna hi padega.
>
> **`X-Frame-Options: SAMEORIGIN`, `DENY` nahi** — `DENY` abhi tootta nahi kyunki Razorpay ko *hum* frame karte hain, ulta nahi. Par bank ke 3DS flows kabhi-kabhi merchant page ko frame karte hain, aur us din `DENY` payment beech me rok deta. `SAMEORIGIN` clickjacking se utni hi suraksha deta hai jitni yahan chahiye.

## 🛡️ Error handling

| | Cheez | Status |
|---|---|---|
| ✅ | **Root ErrorBoundary** | `main.tsx` me providers ke **bahar** — taki AuthProvider ka throw bhi pakda jaaye |
| ✅ | **Route-level ErrorBoundary** | pathname se keyed, header/nav zinda rehte hain |
| ✅ | 3D / Canvas ErrorBoundary | `CanvasErrorBoundary.tsx` |
| ✅ | 404 page | `pages/NotFound.tsx`, catch-all route |
| ✅ | Toast / notification system | sonner + radix toast |
| 🟡 | Loading states | 12 files me |

## 🚀 Build & performance

| | Cheez | Status |
|---|---|---|
| ✅ | Route-level lazy loading | App.tsx me **49 routes** `lazy()`, 0 static |
| ✅ | Code splitting / manual chunks | Achhe se tuned. `vendor-react` leaf invariant verified |
| ✅ | Image lazy loading | **151** `<img>` pe `loading="lazy" decoding="async"` |
| ✅ | LCP image eager | Header logo `eager` + `fetchPriority="high"` — lazy karne se LCP me 1.16s jud gaya tha |
| ✅ | Hero video poster | Video ka apna pehla frame (ffmpeg, 80 kB vs 2.4 MB) |
| ✅ | `font-display: swap` | 10 me se 10 @font-face pe |
| ✅ | Third-party scripts non-blocking | Razorpay `defer`, Google Fonts `media="print" onload` |
| ✅ | Asset cache rules | `/assets/*` immutable 1yr, Fonts/icons 30d, index.html no-cache |
| ✅ | Minification + console strip | esbuild |
| ✅ | gzip / brotli | Azure SWA automatically |
| 🟡 | Bundle size budget | Razorpay CDN har page pe **1.36 MB** laata hai, CI me koi limit nahi |
| ❌ | Production source maps | `sourcemap` sirf development mode me |

**Lighthouse (production build, desktop):**

```
/subscription        97     LCP 1.1s   FCP 1.0s   TBT 0ms   CLS 0
/prompt-marketplace  92     LCP 1.5s   FCP 1.1s   TBT 0ms   CLS 0.009
                     Accessibility 98 · Best Practices 93 · SEO 100
```

> Jo **48** aapne dekha wo Vite **dev server** (`localhost:5173`) pe tha. Wahan minification nahi hoti aur modules unbundled serve hote hain — wo number production ke baare me kuch nahi batata. Production build pe wahi page pehle 74 tha, ab 97.

## ⚙️ Config & quality gates

| | Cheez | Status |
|---|---|---|
| ✅ | Typecheck script sahi hai | `tsc -p tsconfig.app.json` |
| ✅ | ESLint configured | eslint 9 + react-hooks |
| 🟡 | Env-driven API URL | Env se aata hai, par 123 jagah localhost fallback |
| ❌ | Typecheck passing | **55 errors** maujood hain, CI me kabhi chala hi nahi |
| ❌ | TypeScript strict mode | `strict`, `noImplicitAny`, `noUnusedLocals` sab false |
| ❌ | Build fails on missing env | Env missing ho to build chupchaap localhost bake kar dega |
| ❌ | Lint / typecheck in CI | Deploy se pehle koi gate nahi |

## 🎨 UX · SEO

| | Cheez | Status |
|---|---|---|
| ✅ | Meta description, OpenGraph, Twitter cards | |
| ✅ | Favicon set | 6 files |
| ✅ | robots.txt | |
| ✅ | SPA routing fallback | Deep links kaam karte hain |
| ✅ | Form validation | zod + react-hook-form |
| 🟡 | Accessibility | Lighthouse 98, par kabhi manual audit nahi hua |
| 🟡 | react-query defaults | Bare `new QueryClient()` — koi retry/staleTime policy nahi |
| ❌ | sitemap.xml | |
| ❌ | Analytics | Koi GA / Posthog / Plausible nahi |

---

# Aage ka order

| Kab | Kya | Kyun |
|---|---|---|
| **Abhi** | Admin password · Blob access level · Razorpay live keys · migration script | Teenon code se nahi hote, aapko karne hain |
| Is hafte | Error tracking (App Insights) · `NODE_ENV` confirm · readiness check | Chhote hain aur baaki sab ko dikhne layak banate hain |
| Is hafte | `.env.example` · `npm ci` · CI me typecheck+lint gate | 55 typecheck errors abhi kabhi check nahi hote |
| 2 hafte | Centralized API client + 401 interceptor | "Changes aasani se karna" ka seedha hissa |
| 1 mahina | Uploads → Blob (8 routes + 16 processing files) · money flows me transactions | Sabse bada kaam, sabse zaroori data safety |
| Ongoing | `index.js` cleanup (3,687 lines dead code) · tests · TS strict | Kuch todega nahi, par har fix dogunna time leta hai |

---

# Is session me kya theek hua

| ID | Kya tha |
|---|---|
| S-01 | Screen-recording routes bina auth ke khule the — `/all` har user ka naam+email dump karta tha. Feature unused tha, poora hata diya |
| S-02 | Koi global error handler nahi — ek missing try/catch poora server giraata tha |
| S-03 | Har boot pe `dropIndex` + `deleteMany` chalta tha |
| S-04 | Razorpay test key CI workflow aur do frontend files me hardcoded |
| S-05 | Rate limiting sirf 2 routes pe, OpenAI endpoints bilkul khule |
| S-06 | Graceful shutdown nahi — har deploy pe in-flight payments kat jaate the |
| S-09 | Mongoose me dead options, koi timeout ya pool limit nahi |
| S-19 | `seedAdmin.js` me plain-text admin credentials, har boot pe recreate |
| S-20 | Socket.io pe koi auth nahi — kisi bhi user ke naam se message post ho sakta tha |
| S-21 | Chaar existing rate limiters `ipKeyGenerator(req)` ki wajah se kaam hi nahi kar rahe the |
| F-01 | Root ErrorBoundary nahi — ek component error se poori site white screen |
| F-06 | Frontend origin pe koi security header nahi |
| F-07 | Prompt content bina escape kiye `innerHTML` me jaata tha (stored XSS) |
| — | Performance: 74 → 97 aur 75 → 92 |

Verification: socket auth 8/8, error handler 6/6, rate limiter 7/7, graceful shutdown 5/5, XSS escaping 6/6 harness tests. Server boot clean, frontend build pass, typecheck 55 errors (baseline se unchanged — koi naya nahi).

---

# Jo already achha hai — mat chhedna

- **helmet** ke teen exceptions (Google popup ke liye COOP off, `/uploads` ke liye CORP cross-origin, JSON API ke liye CSP off) — teenon ka reason file me likha hai
- **Razorpay webhook** raw body `express.json()` se pehle mount hai — signature verification isi order pe depend karti hai
- **Vite manualChunks** carefully tuned hai, aur blank-page bug (React CJS interop cycle) ka root cause poora documented hai
- **Checkout key handling** — har flow backend se key leta hai, AddFunds `rzp_` prefix validate bhi karta hai
- **`scripts/` folder ka pattern** — dry-run by default, `--apply` se likhna
- **Cron jobs ke comments** — kya karta hai, kyun, aur kya *nahi* karta, sab likha hai
- **`serviceWorkStorage.js`** — private container + SAS, ye wahi pattern hai jo baaki 11 containers pe chahiye
