# Tokun — Production Checklist

**31 Aug 2026** · branch `main` · Node/Express/MongoDB backend + React/Vite frontend on Azure

103 standard production requirements, backend aur frontend dono, actual code ke against verify karke ticked — andaaze se nahi.

| Legend | Matlab |
|---|---|
| ✅ | Hai — verified |
| 🟡 | Aadha — kuch jagah hai, sab jagah nahi |
| ❌ | Nahi hai |
| ❓ | Aapko check karna hai (Azure/Atlas me hai, code me nahi) |

**Score: 61 ✅ · 12 🟡 · 27 ❌ · 3 ❓ = 103**  
*(S-05, S-06, S-20, S-21, F-01, F-06, F-07 + performance fixes ke baad)*

---

## ✅ Teen naye critical findings — teenon FIX ho chuke hain

Ye pehle wale audit me nahi the. Sabka pattern S-01 jaisa hi tha — kaam karta dikhta hai, verify kuch nahi karta. Neeche original problem, aur uske neeche kya kiya gaya.

### S-20 — Socket.io pe koi authentication hai hi nahi ✅ FIXED

`io.on("connection")` client se aaya hua `socket.handshake.auth.userId` seedha maan leta hai. Na `io.use()` middleware hai, na poore socket path me kahin `jwt.verify`. Koi bhi client kisi bhi user ka ID bhej kar connect kar sakta hai.

Uske baad wo:

- `join-chat` se **kisi bhi conversation** me ghus kar real-time messages padh sakta hai
- `send-message` me `senderId` kuch bhi bhej sakta hai — handler bina check kiye `Message.create({ sender: senderId })` likh deta hai. **Kisi bhi user ke naam se message post ho sakta hai.**
- `admin-message:join` se admin conversations sun sakta hai
- `call-user` se kisi ko bhi call kar sakta hai

Escrow disputes me chat logs evidence hote hain. Forged message wahan sirf privacy problem nahi, financial problem hai.

**Kya kiya:**

- `io.use()` middleware — handshake ka JWT verify hota hai (wahi logic jo `utils/auth.js` HTTP pe use karta hai, user aur admin dono). Identity ek hi jagah tay hoti hai, `socket.data` me.
- **Koi bhi handler ab payload se identity nahi leta.** `send-message` ka `senderId`, `message:read` ka `userId`, `typing:*` ka `userId`, `call-user` ka `fromUser`, `join-session` ka `userId` — sab hata diye. Sender ab authenticated socket hai.
- **Room joins pe membership check** — `join-chat` Conversation ke `participants` me hona check karta hai, `admin-message:join` `adminId`/`sellerId` check karta hai. Pehle sirf id bolne se andar ghus jaate the.
- **Collab rooms** — `prompt-change`, `prompt-optimized`, `end-session` ab tabhi chalte hain jab socket us room me pehle se ho. Pehle sirf `sessionId` jaan-ne se koi bhi kisi ka prompt overwrite kar sakta tha.
- Anonymous connect **jaan-boojh kar** allowed hai (collab share-a-link ke liye) — par `userId` null rehta hai aur har identity-wala handler mana kar deta hai. Galat/expired token **reject** hota hai, chupchaap anonymous nahi banta.
- Frontend: `AuthContext` ab `{ token }` bhejta hai `{ userId }` ki jagah. Dependency `token` pe hai, `user._id` pe nahi — taki token refresh pe socket bhi reconnect ho. Baaki do connect sites (`SellerAdminInbox`, `AdminSellerMessageModal`) pehle se hi token bhej rahe the.

**Verified — 8/8 harness test:**

```
PASS  valid token connects, id from token       userId=aaaa…
PASS  forged senderId ignored                   stored=aaaa… claimed=bbbb…   ← ye tha attack
PASS  bare userId claim => anonymous            userId=null
PASS  anonymous send-message rejected
PASS  malformed token rejected
PASS  wrong-secret token rejected
PASS  expired token rejected
PASS  token for nonexistent user rejected
```

### F-07 — Prompt content bina escape kiye HTML ban jaata hai ✅ FIXED

`frontend/src/components/SmarterPrompt.tsx` me chaar jagah `dangerouslySetInnerHTML` hai, aur uske andar chalne wala `renderInline()` (line 357) markdown-jaisi formatting to karta hai (`**bold**`, backtick code) — lekin HTML ko **pehle escape nahi karta**. Content me aaya `<img src=x onerror=…>` seedha DOM me chala jaata hai aur chal jaata hai.

Ye marketplace hai — prompts doosre sellers se aate hain. Agar ye text kisi bhi roop me user-supplied hai to ye stored XSS hai, aur token localStorage me pada hai (F-03), jise JavaScript padh sakta hai.

**Kya kiya:** `escapeHtml()` add kiya jo `renderInline` me **sabse pehle** chalta hai — tag banne se pehle, taki escaping khud apne hi tags ko na kha jaaye. Chaaron `dangerouslySetInnerHTML` paths isi ek function se jaate hain, to ek hi choke point hai.

**Verified — 6/6:** `<script>`, `<img onerror>`, `<svg onload>`, attribute-break (`" onmouseover=`), `<iframe>` — sab escape ho gaye. Aur `**bold**` / backtick-code formatting waise ka waisa kaam kar raha hai.

### Performance — Lighthouse 48 (dev server) → 97 / 92 (production build) ✅ FIXED

Sabse pehle: **jo 48 aapne dekha wo Vite dev server pe tha** (`localhost:5173`). Dev server pe minification nahi hoti, HMR client inject hota hai, modules unbundled serve hote hain. Wo number production ke baare me kuch nahi batata. Production build pe wahi page **74** tha.

Uske baad ye fix kiye — har ek measure karke:

| Fix | Kya tha |
|---|---|
| Razorpay script `defer` | `<script src="checkout.razorpay.com">` bina defer ke `<body>` me tha — parser rok kar 100 kB third-party CDN se laata tha, `main.tsx` se **pehle** |
| Google Fonts non-blocking | JetBrains Mono ka stylesheet akela **568 ms** render block kar raha tha. `media="print" onload` pattern se non-blocking |
| Inter pe `font-display: swap` | 10 me se 4 @font-face me missing tha — aur wahi body font hai, to cold load pe text invisible rehta tha |
| Header logo `eager` + `fetchPriority` | **Meri hi galti** — blanket lazy lagaya to logo (jo LCP element hai) me 1.16 s "load delay" jud gaya. Lighthouse ne pakda, wapas eager kiya |
| 148 images pe `loading="lazy"` | Cards, avatars, chat, grids — sab. Header logo iska exception hai |
| Hero video pe poster | Marketplace ka LCP `china.mp4` tha, 96% render delay. ffmpeg se uska **apna pehla frame** poster banaya (80 kB vs 2.4 MB video) — isliye swap dikhta bhi nahi. `preload` auto → metadata |
| Cache + security headers | `staticwebapp.config.json` me pehle sirf navigationFallback tha |

**Result (production build, desktop preset):**

```
/subscription        74 → 97    LCP 2.8s → 1.1s    FCP 1.7s → 1.0s
/prompt-marketplace  75 → 92    LCP 3.4s → 1.5s    FCP 1.3s → 1.1s
                                TBT 0ms, CLS 0.009 — dono pehle se theek the
```

Marketplace pe Accessibility 98, Best Practices 93, SEO 100 bhi aaya.

**Baaki:** Razorpay ka script har page pe **1.36 MB** laata hai jabki checkout kuch hi pages pe hai. `ensureRazorpay()` on-demand loader already Subscription aur self-dash me hai — baaki 5 call sites usme migrate karne se ye poora bandwidth bach jaayega. App ka apna CSS bundle abhi bhi 209 ms block karta hai (~36 KiB unused CSS), wo bada refactor hai.

### S-21 — Aapke pehle se maujood rate limiters kaam hi nahi kar rahe the ✅ FIXED

Ye S-05 pe kaam karte waqt mila, aur ye is poore audit ka sabse chupa hua bug tha.

`express-rate-limit` ka `ipKeyGenerator()` ek **IP string** leta hai. Code me chaar jagah use **request object** diya jaa raha tha:

```js
keyGenerator: (req) => ipKeyGenerator(req)   // galat — object wapas milta hai
```

Do alag-alag tareeke se toota:

| Jagah | Kya hota tha | Asar |
|---|---|---|
| `adminRoutes.js` otpLimiter, resendLimiter | Object seedha store ke Map me key bana. Har naya object = nayi key | **Limiter bilkul kaam nahi karta tha** — har attempt apne bucket me, counter hamesha 1. 6-digit OTP pe 8-attempt cap ka matlab hi khatam |
| `adminRoutes.js` keyByIpAndEmail, `authRoutes.js` otpLimiter | Template string me object `"[object Object]"` ban gaya | IP wala hissa constant ho gaya, key sirf email reh gayi. File ka apna comment kehta hai "one office NAT can't lock out a colleague" — bug ne exactly wahi tod diya. Koi bhi kisi ka OTP allowance kahin se bhi burn kar sakta tha |

Ye bug chupchaap fail hota hai — code bilkul sahi dikhta hai, koi error nahi aata, aur limiter maujood lagta hai. Pata sirf tab chala jab maine apne naye limiter ka test likha aur 31st request bhi 200 de gayi.

**Kya kiya:** chaaron jagah `ipKeyGenerator(req.ip)` kiya. Saath me `trust proxy` set kiya — uske bina Azure ke peeche `req.ip` load balancer ka hota hai, matlab duniya ke saare users ek hi bucket share karte, aur pehle busy minute me sab ek saath lock ho jaate. Aur import ko alias nahi kiya, kyunki express-rate-limit keyGenerator ke **source text** me `ipKeyGenerator` dhoondh kar validate karta hai — alias karo to har boot pe jhoothi warning aati hai.

---

# Backend

Node · Express · MongoDB · Azure App Service — **66 items**

## Authentication & access

| | Item | Note |
|---|---|---|
| ✅ | Password hashing | bcrypt, salt rounds 10 |
| ✅ | JWT verify on HTTP routes | `utils/auth.js` requireAuth — user aur admin dono |
| ✅ | Token TTL centralised | `utils/authTokens.js` — pehle teen jagah inline literals the |
| ✅ | Admin role separation | 20 route files me `req.isAdmin` / role check |
| ✅ | Google OAuth | passport-google-oauth20 |
| ✅ | KYC gate middleware | `middleware/requireKycVerified.js` |
| ❌ | Refresh token rotation | 7-din JWT, koi rotation nahi. Token leak hua to 7 din valid |
| ✅ | **Socket.io authentication** | **S-20** fix hua — `io.use()` JWT verify, identity `socket.data` se, room joins membership-checked |

## Hardening

| | Item | Note |
|---|---|---|
| ✅ | HTTPS / TLS | Azure App Service managed |
| ✅ | Security headers (helmet) | Teen exceptions, teenon ka reason file me documented |
| ✅ | CORS whitelist | Multi-origin, trailing slash strip, exposedHeaders set |
| ✅ | Webhook signature verification | Razorpay raw body `express.json()` se pehle mount — order sahi |
| ✅ | Secrets env se, code me nahi | `.env` git me nahi hai |
| ✅ | Koi hardcoded credentials nahi | **S-19** fix hua — DB me purana account abhi bhi hai, password badlo |
| ✅ | CSRF | Zaroorat nahi — Bearer token design hai, cookie-based nahi. Sahi choice |
| ✅ | Upload size limits | 11 route files me `limits.fileSize` |
| ✅ | Rate limiting — auth/OTP | **S-21 fix** — chaar limiters `ipKeyGenerator(req)` use kar rahe the (galat), do bilkul kaam hi nahi kar rahe the |
| 🟡 | Upload MIME/type filter | 9 route files me `fileFilter` — 2 me koi bhi file type ja sakta hai |
| 🟡 | Request body size limit | `express.json()` bina options — Express default 100 kb, explicit set nahi |
| ✅ | Rate limiting — global | **S-05** fix — 600/5min per user-or-IP, `/health` skip. `trust proxy` bhi set |
| ✅ | Rate limiting — LLM routes | **S-05** fix — 30/10min. Frontend 429 pe saaf message dikhata hai, fallback retry nahi karta |
| ❌ | Input validation library | Koi zod/joi/express-validator nahi. Har route manual checking karta hai |

## Error handling & resilience

| | Item | Note |
|---|---|---|
| ✅ | Global error handler | CORS/JSON/multer/validation/cast alag-alag handle |
| ✅ | JSON 404 handler | Pehle HTML error page aata tha aur frontend parse error dikhata tha |
| ✅ | Async errors routed to handler | `express-async-errors` — verified 6/6 harness test |
| ✅ | unhandledRejection / uncaughtException | Log likh ke controlled exit |
| ✅ | Prod response me stack trace nahi | Client ko `errorId`, poora stack sirf log me |
| ✅ | DB connect timeout + pool | 10s selection, pool 20. Pehle 30s default tha |
| ✅ | DB reconnect logging | disconnected / reconnected / error — pehle invisible tha |
| ✅ | Graceful shutdown (SIGTERM) | **S-06** fix — drain → socket.io → mongo, 15s cap. Verified: in-flight request poora hota hai |
| ❌ | Retry / circuit breaker | OpenAI, Razorpay, Blob, SMTP — kisi pe retry policy nahi |

## Data integrity

| | Item | Note |
|---|---|---|
| ✅ | Schema validation | 46 mongoose models |
| ✅ | Indexes declared | 35 model files me `schema.index()` / `index: true` |
| ✅ | Migration script pattern | `scripts/` — dry-run by default, `--apply` se likhta hai |
| ✅ | Boot pe koi destructive operation nahi | **S-03** fix hua — script ek baar chalani hai |
| ✅ | Webhook idempotency | `WebhookEvent` model |
| 🟡 | Transactions on money flows | **S-10** — sirf `cartRoute.js`. Wallet, escrow, ledger, payouts bina transaction |
| 🟡 | Idempotency on money operations | 3 files me hai, baaki me nahi |
| ❌ | Restore tested | Jo backup restore karke dekha nahi gaya wo backup nahi hai |
| ❓ | Automated DB backups | Atlas pe on hain ya nahi, retention kitna — aapko dekhna hai |

## File storage

| | Item | Note |
|---|---|---|
| ✅ | Durable object storage available | `utils/uploadToAzure.js`, `utils/serviceWorkStorage.js` |
| ✅ | Paid-content gating | `escrowPreviewGate.js`, `deliverableWatermark.js` |
| 🟡 | Saare uploads Blob pe | **S-07** — 8 route files abhi bhi local disk pe. Azure pe wo har deploy me mit jaati hain |
| ❌ | Uploads git se bahar | 191 upload files tracked, 256 MB disk pe |

## Observability

| | Item | Note |
|---|---|---|
| ✅ | Liveness health check | `/health` — process zinda hai batata hai |
| ✅ | Error IDs on 500s | User ka screenshot log ke stack se match ho sakta hai |
| 🟡 | Request correlation ID | Sirf 500 pe. Normal request ke logs jodne ka tareeka nahi |
| ❌ | Readiness check (DB verify kare) | **S-08** — Mongo down ho tab bhi `/health` 200 deta hai |
| ❌ | Structured logger + levels | **S-15** — 865 plain console calls |
| ❌ | Error tracking (Sentry / App Insights) | **S-16** — kuch toota to user ke batane pe hi pata chalega |
| ❌ | Metrics / APM | Response time, throughput, error rate — kuch track nahi |
| ❌ | Uptime alerting | Server down ho to koi notification nahi |

## Performance

| | Item | Note |
|---|---|---|
| ✅ | Streaming LLM responses | `/api/smartgen/stream` |
| 🟡 | Pagination | 11 route files me. Baaki list endpoints poora collection return karte hain |
| ❌ | Response compression | Koi `compression` middleware nahi — JSON bina gzip ke jaata hai |
| ❌ | Cache layer | Redis/in-memory kuch nahi. Har request DB tak jaati hai |

## Build & deploy

| | Item | Note |
|---|---|---|
| ✅ | CI pipeline | GitHub Actions, dono side |
| ✅ | Auto deploy on main | Push karte hi dono deploy hote hain |
| 🟡 | Env validation at boot | Sirf `MONGO_URI`. Baaki 54 missing hon to server chalta rahega, cheezein chupchaap fail |
| ❌ | `.env.example` | **S-12** — 55 env vars, kahin documented nahi |
| ❌ | Lockfile-respecting install | `npm install` use ho raha hai, `npm ci` hona chahiye |
| ❌ | Slim deploy artifact | **S-14** — 256 MB uploads bhi artifact me ja rahe hain |
| ❌ | Automated tests | **S-13** — zero test files, `npm test` exit 1 |
| ❌ | Lint gate in CI | Deploy se pehle koi check nahi chalta |
| ❓ | `NODE_ENV=production` on Azure | **S-17** — naya error handler ispe depend karta hai. 5 min ka check |
| ❓ | Rollback plan | Bura deploy hua to wapas kaise jaana — kahin likha nahi |

---

# Frontend

React 18 · Vite · TypeScript · Azure Static Web Apps — **37 items**

## Error handling

| | Item | Note |
|---|---|---|
| ✅ | 404 page | `pages/NotFound.tsx`, catch-all route wired |
| ✅ | 3D / Canvas error boundary | `CanvasErrorBoundary.tsx` |
| ✅ | Toast / notification system | sonner + radix toast |
| 🟡 | Loading states | 12 files me. Baaki jagah slow network pe kuch nahi dikhta |
| ✅ | Root ErrorBoundary | **F-01** fix — `main.tsx` me providers ke bahar, taki AuthProvider ka throw bhi pakda jaaye |
| ✅ | Route-level ErrorBoundary | **F-01** fix — pathname se keyed, header/nav zinda rehte hain |

## Security

| | Item | Note |
|---|---|---|
| ✅ | Bundle me koi secret nahi | Sirf Razorpay `key_id`, jo public hai. Build verify kiya |
| ✅ | Protected routes | `RequireAuth` wrapper, App.tsx me use ho raha hai |
| 🟡 | Token storage | **F-03** — localStorage, 69 jagah se padha jaata hai |
| ✅ | **HTML escaping before innerHTML** | **F-07** fix hua — `escapeHtml()` sabse pehle, chaaron innerHTML paths ek hi choke point se |
| ❌ | Centralized API client | **F-02** — ~40 files apna `API_BASE` banati hain |
| ❌ | 401 interceptor / auto-logout | Token expire hone pe random errors, logout nahi hota |
| ❌ | CSP header | **F-06** — F-07 ke saath milkar XSS ko aur khatarnaak banata hai |
| ✅ | HSTS / frame-options / referrer-policy | **F-06** — HSTS, X-Frame-Options, nosniff, Referrer-Policy, Permissions-Policy. CSP abhi bhi nahi (report-only se shuru karna) |

## Build & performance

| | Item | Note |
|---|---|---|
| ✅ | Code splitting / manual chunks | Achhe se tuned. `vendor-react` leaf invariant verify kiya — intact |
| ✅ | Minification | esbuild |
| ✅ | Console stripped in prod | Achha — par error tracking ke bina blind bhi karta hai (**F-04**) |
| ✅ | gzip / brotli | Azure Static Web Apps automatically karta hai |
| ✅ | modulePreload tuning | 3D/video/chart chunks first paint pe compete nahi karte |
| ✅ | Route-level lazy loading | Mera pehla count galat tha — App.tsx me **49 routes** `lazy()` hain, 0 static. Ye pehle se sahi tha |
| 🟡 | Bundle size budget | Sirf warning. Aur Razorpay CDN har page pe 1.36 MB laata hai — on-demand loading se bach sakta hai |
| ❌ | Production source maps | `sourcemap` sirf development mode me. Prod stack trace bekaar |
| ✅ | Asset cache rules | `/assets/*` immutable 1yr, Fonts/icons 30d, index.html no-cache |

## Config & quality gates

| | Item | Note |
|---|---|---|
| ✅ | Typecheck script sahi hai | `tsc -p tsconfig.app.json` — root config pe point karta to kuch check hi na hota |
| ✅ | ESLint configured | eslint 9 + react-hooks + react-refresh |
| 🟡 | Env-driven API URL | **F-02** — env se aata hai, par 123 jagah localhost fallback |
| ❌ | Typecheck passing | 55 errors maujood hain. CI me kabhi chala hi nahi |
| ❌ | TypeScript strict mode | **F-05** — strict, noImplicitAny, noUnusedLocals sab false |
| ❌ | Build fails on missing env | Env missing ho to build chupchaap localhost bake kar dega |
| ❌ | Lint / typecheck in CI | Deploy se pehle koi gate nahi |

## UX · SEO · quality

| | Item | Note |
|---|---|---|
| ✅ | Meta description | index.html me set hai |
| ✅ | OpenGraph / Twitter cards | og:title, og:image, twitter:card sab hain |
| ✅ | Favicon set | 6 files, apple-touch-icon sameth |
| ✅ | robots.txt | `public/robots.txt` |
| ✅ | SPA routing fallback | navigationFallback — deep links kaam karte hain |
| ✅ | Form validation | zod + react-hook-form + @hookform/resolvers |
| 🟡 | react-query defaults | Bare `new QueryClient()` — koi retry/staleTime/refetch policy nahi |
| ❌ | sitemap.xml | robots.txt hai par sitemap nahi |
| ❌ | Analytics | Koi GA / Posthog / Plausible nahi |
| ❌ | Accessibility audit | Radix a11y-friendly hai, par kabhi audit nahi hua |

---

# Ab kya theek karein

| Kab | Kya | Kyun ye pehle | Time |
|---|---|---|---|
| ~~Abhi~~ ✅ | ~~**S-20** Socket.io auth~~<br>~~**F-07** HTML escaping~~ | **Ho gaya.** Dono verified — 8/8 aur 6/6 harness tests | done |
| **Abhi** | Admin password rotate<br>Migration script chalao<br>Azure Razorpay mode check | Pichhle session ke code fixes tab tak adhoore hain jab tak ye teen manual steps nahi hote | 1 ghanta |
| ~~Is hafte~~ ✅ | ~~**S-05** Rate limiting~~<br>~~**S-06** Graceful shutdown~~<br>~~**F-01** Root ErrorBoundary~~ | **Ho gaya.** Plus **S-21** — ipKeyGenerator misuse ne chaar existing limiters tode the | done |
| Is hafte | **S-16** Error tracking<br>**S-17** NODE_ENV<br>**S-08** Readiness check | Teenon chhote hain aur baaki sab kaam ko dikhne layak banate hain. Abhi aap blind ho | 1 din |
| Agle 2 hafte | **F-02 + F-03** API client + auth interceptor<br>**S-12** `.env.example`<br>CI gates | Ye "changes aasani se karna" wale hisse hain. Inke baad har aage ka kaam tez hoga | 4–5 din |
| Agla mahina | **S-07** Uploads Blob pe<br>**S-10** Money transactions | Sabse bada kaam, par sabse zaroori data safety. Ek-ek route/flow karke | 2–3 hafte |
| Ongoing | **S-11** index.js cleanup<br>**S-13** Tests<br>**F-05** TS strict | S-11 sabse zyada leverage — 3,687 lines dead code hatne ke baad har fix aadhe time me | ongoing |

---

# Pending manual steps (pichhle session ke fixes se)

```bash
# 1. Migration — boot se hataya gaya, ab manually chalana hai
cd server
node scripts/fix-admin-conversation-index.js           # dry run
node scripts/fix-admin-conversation-index.js --apply
```

**2. Admin password badlo.** `utils/seedAdmin.js` me email `sagar@gmail.com` aur password plain text me tha, aur wo account har boot pe dobara ban jaata tha. Code se hat gaya — lekin **DB me account abhi bhi hai, usi password ke saath.** Jo repo padh sakta hai wo admin panel me ghus sakta hai.

**3. Azure pe Razorpay mode confirm karo.** Portal → BackendTokun1 → Environment variables → `RAZORPAY_KEY_ID`. `rzp_test_` hai to production me asli paise nahi kat rahe. `RAZORPAY_KEY_SECRET` aur `RAZORPAY_WEBHOOK_SECRET` bhi usi account ke hone chahiye.

---

# Kul milaakar

103 me se 49 cheezein already hain, aur jo hain wo achhe se hain — helmet ke exceptions documented hain, webhook ka raw-body order sahi hai, Vite ka chunking soch-samajh kar tuned hai, scripts folder ka dry-run pattern proper hai. Ye ek soche-samjhe codebase ke nishaan hain.

Jo 37 missing hain, unka pattern saaf hai: **application logic likhi gayi hai, uske aas-paas ki operational safety nahi.** Auth HTTP pe hai lekin socket pe nahi. Error handling har route me hai lekin global nahi tha. Storage helper bana hai lekin sab jagah use nahi hua. Yehi cheez tab dikhti hai jab feature pressure me build hote hain — aur yehi production me sabse pehle tootti hai.

Sabse upar wali do lines pe shuru karo: **S-20** aur **F-07**. Baaki sab wait kar sakta hai, ye do nahi.
