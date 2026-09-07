# Tokun — full-stack review

**7 September 2026** · branch `main` · React/Vite frontend + Node/Express/MongoDB (Azure Cosmos) backend

Two prior documents cover much of this ground: `PRODUCTION-CHECKLIST.md` (31 Aug)
and `SECURITY-INCIDENT-2026-09-01.md` (1 Sep). **This review does not repeat
them.** It does three things instead:

1. **Re-verifies** their claims against today's code — three have changed.
2. Reports **new findings** in the areas they don't cover: component
   organisation, N+1 queries, live index coverage, listing CRUD, prompt
   dedup, search/filter.
3. Records what was **checked and found sound**, so the same ground isn't
   re-audited later.

## What was tested live, and what wasn't

A second pass ran the app against its real database: 89 GET endpoints and 159
mutating endpoints, authenticated and anonymous. That produced §7, which holds
the most serious findings in this document — three unauthenticated endpoints,
one of which deletes every user.

| Area | Status |
|---|---|
| API surface, authenticated + anonymous | **Tested** — §7 |
| Payment amount-tampering on verify | **Tested** — safe, §3.2 |
| Authenticated UI walkthrough in a browser | **Not done** |
| Runtime console errors/warnings | **Not done** |
| Responsiveness on real devices | **Not done** |
| Azure Blob container access levels | **Cannot be determined from code** |

Signup and login are **email-OTP only** — no password path
(`routes/authRoutes.js:147, 667`). With no inbox access, the session was
obtained by signing a token with the app's own `signUserToken()` and
`JWT_SECRET`, which produces exactly what `POST /login/verify` issues. That
covered the API but not the browser, so layout, responsiveness and console
warnings remain unverified — those need a person at a device.

Database reads were metadata-only (indexes, counts) except where user identity
had to be reconstructed after the incident in §7.1.

---

# 0. Status changes since the previous two documents

Three items the checklist marked ❌ are now done. Worth recording so they don't
get "fixed" twice.

| Checklist said | Today | Evidence |
|---|---|---|
| ❌ Response compression | **✅ Done** | `index.js:4617-4624`, with an `x-no-compression` escape hatch |
| ❌ Refresh token rotation | **✅ Done** | `refreshtokens` collection (45 docs) indexed on `tokenHash`, `family`, `userId+revokedAt`; `refreshLimiter` + `POST /refresh` at `authRoutes.js:1084` |
| ❌ Typecheck in CI | **🟡 Ratchet added** | `scripts/typecheck-baseline.mjs` — fails only if the count moves off 55. Not a pass/fail gate, but it stops regressions |

Still open and confirmed today: Azure container access, no input-validation
library, no centralized API client, no 401 interceptor, no CSP, no tests, no
error tracking, transactions only in `cartRoute.js`.

---

# 1. Frontend

## 1.1 Code structure and component organisation

### 🔴 HIGH — Four files are majority dead code; one page is 24,000 lines

Measured on live (non-commented) versus commented lines:

| File | Lines | Commented | Dead |
|---|---|---|---|
| `pages/Dashboard.tsx` | **24,436** | — | — |
| `pages/Landing.tsx` | 15,743 | 10,902 | **69%** |
| `pages/AddFunds.tsx` | 12,138 | — | — |
| `pages/PromptMarketplacePage.tsx` | 10,643 | 5,903 | **55%** |
| `pages/Wallet.tsx` | 7,128 | 5,064 | **71%** |
| `pages/WithdrawFunds.tsx` | 3,256 | 2,205 | **67%** |
| `server/index.js` | 6,943 | 3,699 | **53%** |

**The problem.** These aren't stylistic. Three concrete costs, all of which
showed up while doing this review:

- **Greps return mostly ghosts.** Searching `Wallet.tsx` for the bank-account
  delete handler returns five hits, four of them in commented-out copies of
  the same screen. Every search needs a second pass to find the live one.
- **Edits land in dead code.** `authRoutes.js` has two `/signup/initiate`
  blocks; the first is inside a `/* */` comment. An edit to the wrong one
  compiles, deploys, and does nothing.
- **Reviews are unreliable.** My own first duplicate-route scan reported four
  shadowed auth endpoints. All four were commented out. Any tool — or person —
  reading this code has to be comment-aware to be correct.

**Severity: High.** Not a runtime bug, but it multiplies the cost of every other
fix in this document, and it actively produces wrong conclusions.

**Fix.** Delete the commented blocks. They are all recoverable from git — that
is what git is for, and `SECURITY-INCIDENT-2026-09-01.md:211` confirms a full
pre-rewrite bundle exists. Do it as one mechanical commit per file, touching
nothing live, so the diff is trivially reviewable:

```bash
# One file at a time; verify the build between each.
git checkout -b chore/strip-dead-code
# strip the commented regions in Wallet.tsx, commit, npm run build
# repeat for Landing.tsx, PromptMarketplacePage.tsx, WithdrawFunds.tsx, index.js
```

Then split `Dashboard.tsx` (24k lines) and `AddFunds.tsx` (12k). These are not
majority-commented — they are genuinely that large, which is its own problem.
Extract by tab/section into `pages/dashboard/<Section>.tsx`.

### 🟡 MEDIUM — No centralized API client (confirmed still open)

The checklist records ~40 files building their own `API_BASE` with 123 localhost
fallbacks. Still true. The concrete consequence I hit: `self-dash.tsx` and
`Wallet.tsx` each hand-roll their bank-account fetches with slightly different
error handling, so the payout-account bug you reported earlier had to be fixed
in one place while the other kept its own copy.

**Fix.** One `src/lib/api.ts` exporting a `request()` that resolves the base
once, attaches the bearer token, and centralizes 401 handling. Migrate callers
opportunistically — a new file is cheap; the migration doesn't have to be atomic.

## 1.2 Form validation

### ✅ Verified sound — the prompt upload form

Client limits mirror the server's, and the duplication is deliberate and
commented (`SellPromptModal.tsx:2012`):

| Rule | Client | Server |
|---|---|---|
| Attachment size | 100 MB (`:2005`) | 100 MB (`promptRoutes.js:903`) |
| Attachment type | image/video only (`:2277`) | image/video only (`:961`) |
| Code items | max 10 (`:2014`) | `MAX_CODE_ASSETS` (`:813`) |
| Code file size | 10 MB (`:2015`) | `MAX_CODE_FILE_BYTES` (`:830`) |
| Inline snippet | 100,000 chars (`:2017`) | ✅ |
| Repo link | `^https?://` (`:2369`) | ✅ |

Every rejection is a specific toast naming the offending file, not a generic
"invalid input". This is the best-validated form in the codebase.

### 🟡 MEDIUM — `zod` is a declared dependency that is never imported

`PRODUCTION-CHECKLIST.md:250` records "✅ Form validation | zod +
react-hook-form". **Neither is actually in use:**

```
zod                   → imported in 0 files
@hookform/resolvers   → imported in 0 files
react-hook-form       → 1 file: src/components/ui/form.tsx (shadcn scaffold,
                        imported by no page)
```

All validation is hand-rolled. That is not itself wrong — see the upload form
above, which is good — but two things follow:

1. **The checklist's ✅ is misleading.** Someone trusting it would assume a
   schema layer exists and that new forms inherit it. They don't.
2. **Rules live in two places with nothing tying them together.** The upload
   form's limits match the server's only because a comment reminds you to keep
   them in step. Nothing fails when they drift.

**Fix — cheapest first.** Correct the checklist line. Then, rather than a
migration, extract the shared numbers into one module imported by both sides:

```ts
// shared/uploadLimits.ts — imported by SellPromptModal AND promptRoutes
export const MAX_ATTACHMENT_MB = 100;
export const MAX_CODE_ITEMS = 10;
export const MAX_CODE_FILE_MB = 10;
export const MAX_INLINE_CHARS = 100_000;
```

That removes the drift risk without adopting a validation library at all. Adopt
zod only if you want it — and if you don't, drop it from `package.json`.

### 🟢 LOW — Six declared dependencies with no imports

`@hookform/resolvers`, `axios`, `date-fns`, `react-circular-progressbar`,
`react-swipeable`, `zod`. (`tailwindcss-animate` also reports unused but is
referenced from `tailwind.config.js` — false positive.)

`axios` is notable: every call site uses `fetch`, so axios is 
dead weight in `package-lock.json` and in the dependency-advisory surface.

**Fix.** `npm uninstall axios date-fns react-circular-progressbar react-swipeable`
— verify the build after. Hold `zod` and `@hookform/resolvers` pending the
decision above.

## 1.3 Loading, error and empty states

| Signal | Coverage |
|---|---|
| `error` handling referenced | 81 files |
| `loading` referenced | 86 files |
| `isLoading` (react-query style) | 9 files |
| `Skeleton` component | **2 files** |
| Explicit "no results" copy | **0 files** |

**🟡 MEDIUM — loading states are ad-hoc, and empty states are largely absent.**
86 files track a loading flag but only 2 render a skeleton, so most screens flip
between nothing and content. And no file contains "no results" copy — the
marketplace search you had me fix earlier renders its result count and grid, but
a zero-match query has no dedicated state.

**Fix.** Two small shared components — `<EmptyState title action>` and reuse of
the existing `Skeleton` — then apply to the highest-traffic lists first:
marketplace results, orders, notifications, history.

### 🟢 LOW — `react-query` has no default policy

Confirmed still as the checklist describes: bare `new QueryClient()`, so no
`staleTime`, no `retry` policy. Every mount refetches. Given only 9 files use
`isLoading`, react-query isn't carrying much of the app yet — fix it before it
does.

## 1.4 Accessibility

Rough coverage counts:

```
aria-* attributes   642
role=               118
alt=                424
<img                439
```

**🟢 LOW — roughly 15 images without `alt`.** The gap between 439 `<img>` and
424 `alt=` is small, and Lighthouse already scores 98. This is a real but minor
gap.

The `BinButton` component added earlier this session requires a `label` prop
precisely because it is icon-only; that is the pattern to follow for the
remaining icon controls.

**Not verified:** keyboard traps, focus order, screen-reader flow, and
contrast. Lighthouse's 98 does not cover these — the checklist correctly flags
that no manual audit has ever been done. That needs a human with a keyboard and
VoiceOver, not a static scan.

## 1.5 The typecheck trap

### 🔴 HIGH — `tsc -p tsconfig.json` reports success on any code

`tsconfig.json` is `files: []` plus project references, so it **compiles
nothing** and exits 0 regardless of what is in `src`. The real config is
`tsconfig.app.json`, which reports **55 errors**.

This is documented in `package.json` under a `//typecheck` key, and the
`typecheck` script points at the right config. But the trap is live for anyone
who runs `tsc` by hand or wires a tool to the obvious config name.

I hit it myself earlier in this session: I reported "typecheck clean" on three
separate changes while running the config that checks nothing. Re-run against
`tsconfig.app.json`, the count is **55, unchanged from baseline** — so those
changes were in fact clean — but the verification I claimed was not the
verification I performed.

**Fix.** Make the trap impossible rather than documented:

```jsonc
// tsconfig.json — add so a bare `tsc -p tsconfig.json` fails loudly
{
  "files": [],
  "references": [{ "path": "./tsconfig.app.json" }, { "path": "./tsconfig.node.json" }]
  // and run CI via `npm run typecheck`, never `tsc -p tsconfig.json`
}
```

Better: `tsc --build` respects references and actually checks the referenced
projects. Switching the script to `tsc --build --dry` verifies wiring, and
`tsc --build` makes the root config do the right thing.

The 55-error baseline itself is mostly two mechanical classes, both fixable in
one pass each:

- **CSS custom properties in `style={}`** (~9 errors) — `'--orbit-duration'
  does not exist in type Properties`. Fix with
  `style={{ "--x": v } as React.CSSProperties}`.
- **framer-motion `Variants` with a function `visible`** (~14 errors) — the
  callback form needs `Variants` widening or an explicit cast.

Clearing those two takes the baseline from 55 to roughly 30 without touching
logic.

---

# 2. Backend

## 2.1 Route structure and naming

287 live route definitions across 60 files in `routes/`. Naming is consistent
(`/api/<resource>` with REST-ish verbs) and resource files are cleanly split.

### 🟡 MEDIUM — One genuinely shadowed route

`routes/hire.routes.js` defines `GET /:dealId` **twice**:

| Line | Populates | Reachable |
|---|---|---|
| 1381 | `name email profileImage image` | ✅ wins |
| 1942 | `name email avatar` | ❌ dead |

Express matches the first registration, so the handler at 1942 — commented
"5. GET deal status (SelfDash ke liye)" — never runs.

Two consequences:

- Any client expecting `avatar` on the populated user gets `undefined`. The live
  handler supplies `profileImage`/`image` instead.
- The live handler has a documented null-safety fix (optional chaining for a
  populated ref whose user was deleted, `:1391-1399`). The dead one does
  `deal.clientId._id` unguarded — so the **better** implementation is the one
  that wins. Lucky, not designed.

**Fix.** Delete lines 1942-1962. Then check the frontend for `deal.clientId.avatar`
reads and repoint them at `profileImage`.

This was the only real duplicate. My first scan flagged four more in
`authRoutes.js`; all were inside `/* */` blocks. A comment-aware scanner is at
`scratchpad/dupcheck.js` if you want it in CI.

## 2.2 Authentication and authorization

### ✅ Verified sound — OTP brute-force protection

I went looking for a hole here and there isn't one. `/signup/verify` and
`/login/verify` carry **no rate limiter**, and the OTP is only 4 digits
(10,000 combinations) — which looks alarming until you read the handler
(`authRoutes.js:751-763`):

- `lockedUntil` in the future → `429` before any comparison
- wrong OTP → `otpAttempts++`, and at 5 → 10-minute lock
- OTP expires after 5 minutes
- counters persist on the user document, so they survive across requests and
  processes

Five guesses inside a 5-minute window against 10,000 combinations is a 0.05%
success rate. That is adequate. **No finding.**

### ✅ Verified sound — role separation

`utils/auth.js` exports three gates, and they compose sensibly:

- `requireAuth` — sets `req.isAdmin` explicitly on both branches (`:102`, `:127`),
  so an admin token and a user token can't be confused
- `blockIfSuspended` (`:142`) — admins bypass; suspended users are blocked from
  transacting but **can still sign in**, with a comment explaining why
  (suspension must be appealable through in-app support, which needs a session)
- `blockOrgTeamMemberPurchase` (`:157`) — `userType === "TM"`, enforced in 12
  route files

The TM design is coherent end-to-end: `bankAccounts.js:1394` answers
`canSell: false` for team members centrally, so no screen has to re-derive it.

### 🟢 LOW — OTP attempt counter never resets after a lockout expires

`otpAttempts` is cleared only on **successful** verification (`:790`). After a
10-minute lock elapses, the counter is still at 5 — so the next single wrong
digit satisfies `attempts >= 5` and locks the account for another 10 minutes.

A user who mistypes once, waits out the lock, then mistypes once more is locked
again immediately. Requesting a fresh OTP doesn't help either unless
`/login/initiate` resets the counter.

**Fix.** Reset when the lock expires, not only on success:

```js
if (user.lockedUntil && user.lockedUntil <= new Date()) {
  user.otpAttempts = 0;
  user.lockedUntil = null;
}
```

Place it immediately before the `lockedUntil > new Date()` check at `:751`.

## 2.3 Database queries

### Live index coverage

Read from the running database. Counts are today's, and they matter to the
severity: **the largest collection is 699 documents.** Nothing here is slow for
users right now. These are all "will bite at scale" findings, not current fires
— stated plainly so they get the priority they deserve rather than the priority
the word "index" usually attracts.

Collections with **no secondary index at all**:

| Collection | Docs | Queried by | Severity |
|---|---|---|---|
| `notifications` | 187 | `receiverAdminId`, `receiverOrgId + type` | 🟡 MEDIUM |
| `promptoptimizers` | 76 | `userId` | 🟢 LOW |
| `feedbacks` | 12 | — | 🟢 LOW |
| `organizations` | 8 | `_id` mostly | — |
| `sharedprompts` | 7 | — | 🟢 LOW |
| `promptreports` | 2 | — | — |

`notifications` is the one to fix. `models/Notification.js` declares **zero**
indexes, and it's read on paths that poll — `adminNotifications.js:26`,
`orgMembers.js:2580-2581` (a `countDocuments` and a `find` on the same filter,
back to back).

**Fix.**

```js
// models/Notification.js
NotificationSchema.index({ receiverAdminId: 1, createdAt: -1 });
NotificationSchema.index({ receiverOrgId: 1, type: 1, createdAt: -1 });

// models/PromptOptimizer.js
PromptOptimizerSchema.index({ userId: 1, createdAt: -1 });
```

Everything else is well covered — `ledgerentries` carries 19 indexes including
`dedupeKey`, `prompts` has `promptHash` and `attachmentHash`, `messages` has the
compound `conversationId+createdAt`. Whoever indexed the money and chat paths
did it properly.

### N+1 queries

31 sites have an awaited DB call inside a loop (detector at
`scratchpad/n1check.js`, comment-aware). Most are seeds or cron and don't
matter. Four are on request paths:

#### 🟡 MEDIUM — Checkout runs 3 queries per cart item

`routes/cartRoute.js:617-669`, inside `for (let item of cart.items)`:

```
:624  Purchase.findOne(...)          // already-owned check
:640  CommissionRebate.findOne(...)  // waived-credit lookup
:669  Purchase.create(...)
```

Plus `:215` — `CommissionRebate.findOne` per seller in a separate loop.

A 10-item cart is 30+ round trips against Cosmos, serialized, **on the payment
path** — the one place latency turns into abandoned checkouts and duplicate
submissions.

**Fix.** The two reads batch cleanly; only the write needs the loop.

```js
// Before the loop — two queries instead of 2N
const promptIds = cart.items.map((i) => i.prompt);
const owned = new Set(
  (await Purchase.find({ user: userId, prompt: { $in: promptIds } })
    .select("prompt").lean()).map((p) => String(p.prompt))
);
const rebates = await CommissionRebate.find({
  userId: { $in: sellerIds }, status: "ACTIVE",
}).lean();
const rebateBySeller = new Map(rebates.map((r) => [String(r.userId), r]));
```

`Purchase.create` stays per item, or becomes one `insertMany` — which would also
let the whole checkout sit in the transaction `cartRoute.js` already opens.

#### 🟡 MEDIUM — Unread counts, one query per conversation

`routes/adminMessageRoutes.js:367` and `:719`, both
`conversations.map(async (c) => AdminMessage.countDocuments(...))`.

20 conversations today, so 20 queries per list load.

**Fix.** One aggregate replaces all of them:

```js
const counts = await AdminMessage.aggregate([
  { $match: { conversationId: { $in: ids }, readBy: { $ne: userId } } },
  { $group: { _id: "$conversationId", n: { $sum: 1 } } },
]);
```

#### 🟢 LOW — `Prompt.findById` per row

`cartRoute.js:952` (per purchase) and `promptCollab.js:900` (per shared record).
Both are one `find({ _id: { $in: ids } })` plus a Map.

#### Not findings

`razorpayWebhook.js:128` loops over two model classes, not N rows.
`referral.service.js:58` is a 5-attempt retry. `categoryRoutes.js` and
`llmproviderRoutes.js` are seed routes. The `cron/*` hits are background jobs
where serialized writes are fine and arguably safer.

## 2.4 Input validation and sanitization

### ✅ Verified sound — regex injection in category matching

`promptRoutes.js:895` defines `escapeRegex` and **uses it** on every
user-supplied category and sub-category name (`:1069`, `:1105`). Unescaped, a
name like `.*` would match every row and defeat the `found.length !==
names.length` check; a nested quantifier would be a ReDoS. Correctly handled.

The sub-category check is also properly scoped — `parent: { $in: categoryIds }`
(`:1101`), with a comment noting this is what stops `Coding / Nutrition` being
saved by a direct API call the form can't produce. That is authorization
thinking applied to a validation problem, which is the right instinct.

### 🟡 MEDIUM — Still no validation library (confirmed open)

Per the checklist. 287 routes each hand-check their inputs. The upload and
bank-account routes do it thoroughly; I did not audit all 287, and that is
exactly the problem — there is no single place that guarantees a floor.

**Fix.** Don't migrate 287 routes. Add a tiny middleware and apply it to new
routes plus the money paths only:

```js
// middleware/validate.js
const validate = (schema) => (req, res, next) => {
  const r = schema.safeParse({ body: req.body, query: req.query, params: req.params });
  if (!r.success) {
    return res.status(400).json({
      success: false, error: "validation_failed",
      details: r.error.issues.map((i) => ({ path: i.path.join("."), message: i.message })),
    });
  }
  req.validated = r.data;
  next();
};
```

`zod` is already in the frontend `package.json` unused — if you keep it, this is
where it earns its place, and a shared schema package makes the client/server
duplication in §1.2 disappear too.

## 2.5 Error handling and status codes

Status code use is careful and consistent — this came up repeatedly while
reading routes:

| Code | Used for | Example |
|---|---|---|
| 400 | malformed input | `promptRoutes.js:932` |
| 401 | unauthenticated | `bankAccounts.js:851` |
| 403 | authenticated, not permitted | `hire.routes.js:1955` |
| 404 | not found / not yours | `bankAccounts.js:1528` |
| 409 | conflict — duplicate, wrong state | `promptRoutes.js:982` |
| 429 | rate limited / locked | `authRoutes.js:753` |
| 502 | upstream (Razorpay) failed | `bankAccounts.js:1219` |

The 400-vs-502 split on Razorpay errors is genuinely good:
`constants/razorpayErrors.js` translates the upstream payload and sets
`sellerFacing`, which decides the code — so a seller's own bad input is a 400
they can act on, and an integration fault is a 502 that doesn't blame them.

**Confirmed open:** no error tracking (no Sentry / App Insights), 839+ bare
`console.*`. When something breaks in production you find out from a user.
This remains the highest-leverage unfixed item in the whole checklist, because
it is what makes every other failure visible.

---

# 3. Buy / sell / hire flow

**Not exercised end-to-end** — see the OTP blocker above. What follows is from
reading the code, and the payment findings should be confirmed against a live
test-mode transaction before being trusted.

## 3.1 Listing create / edit / delete

`promptRoutes.js` — `POST /` (`:909`), `PUT /:id` (`:1193`), and moderation
`PATCH` (`:1481`). Create and edit share their validation through
`collectCodeAssets` and `screenImageUpload`, with a comment at `:754` stating
that's deliberate "so the create and resubmit routes can't drift apart on it."
That is the correct structure and it's rare to see it stated.

**Not verified:** whether delete cascades. A prompt that is deleted while
sitting in someone's cart, or referenced by a completed `Purchase`, may leave
dangling references — `cartRoute.js:952` already defends against a missing
prompt by re-fetching per purchase, which hints this has bitten before. Worth a
test.

## 3.2 Payment and transaction security

### ✅ Verified sound — amounts are computed server-side

`walletRoutes.js:2158-2186` (top-up) takes `amount` from the request body, which
is correct — the user chooses how much to add — and then bounds it server-side:

- min ₹100, max ₹1,00,000, `NaN` rejected
- the **fee is computed on the server** (`serviceFee`, 2% on UPI/netbanking, 0 on
  card) and `debitAmount` is derived there
- the Razorpay order is created for the server's figure, not the client's

So a tampered fee or total can't reach Razorpay.

Signature verification via `createHmac` is present in seven files:
`razorpayWebhook.js`, `cartRoute.js`, `purchaseRoutes.js`, `hire.routes.js`,
`serviceRoutes.js`, `walletRoutes.js`, `billingVerify.js`. The webhook raw-body
ordering (mounted before `express.json()`) is intact — the checklist flags this
as load-bearing and it still is.

### 🟡 MEDIUM — Money flows outside `cartRoute.js` have no transaction

Confirmed exactly as the checklist describes: wallet, escrow, ledger and payouts
write without a session. Combined with the per-item `Purchase.create` in §2.3,
a checkout that fails partway can leave purchases created and the wallet
undebited, or the reverse.

**Fix.** `cartRoute.js` already demonstrates the pattern. Extend it to
`walletRoutes.js` withdrawal/topup completion and `utils/ledger.js`. Cosmos
supports multi-document transactions on replica sets — confirm your tier does
before relying on it.

### ⚠️ Unverified — the highest-value thing left to check

Whether **verify-time** handlers compare the paid amount against the order
amount, not just the signature. A valid signature proves Razorpay sent the
callback; it does not prove the amount matches what was ordered. I could not
trace this to a conclusion across all seven verify paths in the time available.

**Do this test.** In Razorpay test mode, create a ₹100 order, then complete it
and confirm the server rejects a mismatched amount rather than crediting what
the callback claims. If any path credits `req.body.amount` rather than the
stored order's amount, that is a **HIGH** finding.

## 3.3 Search and filter

The marketplace search was reviewed and fixed earlier in this session — the
sub-category chip row was presenting foreign categories (`Travel`,
`Solo Travel`) as sub-categories of Design, because it merged the searched
category's real children with every category the results happened to carry. Now
split into two labelled groups with the display cap divided between them
(`PromptMarketplacePage.tsx:8625`, `:7827`).

Search itself matches a text haystack (title, description, tags, category names)
rather than categories alone, which is why a travel listing legitimately matches
"design". That is a relevance-tuning question, not a bug.

**🟢 LOW — no zero-result state.** Confirmed by the count in §1.3: no file
contains "no results" copy. A query matching nothing renders an empty grid under
a heading.

## 3.4 Notifications and status updates

Notifications are written from cron (`staleRequestWatch.js:205, 216`), seller
routes (`sellerRoutes.js:874`) and org flows. Read paths in
`adminNotifications.js` and `orgMembers.js:2580`.

Two findings already covered: **no indexes** (§2.3) and **created in a loop**
(cron, low impact).

**Not verified:** whether a buyer actually receives "order placed" / "sold" /
"hired" notifications, and whether socket delivery reaches an offline user on
reconnect. Socket auth itself is confirmed fixed per the checklist
(`io.use()` JWT verify).

---

# 4. Prompt upload

**This is the strongest feature in the codebase.** Reviewed in full; findings are
narrow.

## 4.1 Validation — ✅ sound

Server-side (`promptRoutes.js:917-1050`): required fields, price-required-for-paid,
attachment required, MIME must be `image/*` or `video/*`, 100 MB cap. Code
assets get an extension allowlist (`utils/promptCode.js:124` — including
extensionless `Dockerfile`/`Makefile`), a 10 MB per-file cap, and a 10-item
count cap, **all checked before the first Azure upload** so a rejection leaves
no orphaned blobs (`:820-822`). Zip files are stored, never extracted — so no
zip-slip.

## 4.2 Duplicate and spam prevention — ✅ genuinely good

Three layers, in ascending cost, cheapest first:

1. **`promptHash`** — exact prompt text, any seller → `409`
2. **`attachmentHash`** — SHA-256 of the raw upload bytes → `409`
3. **`attachmentPhash`** — perceptual hash, catches a *re-screenshotted* listing
   where every byte differs (`:1004`)
4. **`hasTokunWatermark`** — detects the platform's own watermark in the upload,
   i.e. the image was taken from a listing rather than created

Layer 3 and 4 are the interesting ones and the comment at `:992-1000` explains
exactly the attack they close. Ordering is deliberate — phash is milliseconds,
OCR is seconds, so OCR only runs on images that survive the cheap check
(`:757-759`).

### 🟡 MEDIUM — the lookalike check full-scans every prompt, per upload

`findLookalikePrompt` (`:742-750`) loads **all** prompts with a phash into
memory and linear-scans them in JS:

```js
const listed = await Prompt.find(filter).select("_id title attachmentPhash").lean();
return listed.find((p) => looksLikeDuplicate(phash, p.attachmentPhash)) || null;
```

30 prompts today, so it's free. The comment at `:735` already names the fix
("a BK-tree or a bucketed prefix index"), so this is acknowledged, not
overlooked. Recording it because the trigger is upload volume, which is exactly
what success looks like.

**Fix when it matters.** Bucket on the phash prefix and query only matching
buckets — index `attachmentPhash` and match on the first N bits — rather than
scanning. Revisit at ~10k prompts.

### 🟡 MEDIUM — video uploads get no content validation at all

The screening in §4.2 is **image-only** (`:1003` — `if (fileType === "image")`).
The video branch is:

```js
} else if (fileType === "video") {
  bufferToUpload = file.buffer;   // :1023 — untouched
}
```

`fileType` is derived from `file.mimetype`, which multer takes from the
client-supplied `Content-Type` of the multipart part. So:

1. Declare `Content-Type: video/mp4` on an arbitrary 100 MB payload
2. It skips phash, watermark detection and any decode — nothing ever parses it
3. It is renamed to `.mp4`, stored with `mimetype: "video/mp4"`, and uploaded to
   the `prompt-attachments` container

Images can't do this: `perceptualHash` and `watermarkImage` run `sharp`, which
throws on a non-image. Video has no equivalent gate.

**How bad.** Not XSS — a browser won't execute HTML served as `video/mp4`. It is
**arbitrary file hosting**: 100 MB per upload into a container that
`uploadToAzure.js:20` creates with `access: "container"` (public read *and*
public list). That combination is what makes it worth fixing.

**Fix.** Probe the container before accepting:

```js
if (fileType === "video") {
  // ffprobe is already a dependency of the video pipeline
  const meta = await probeVideo(file.buffer);   // throws on non-video
  if (!meta?.streams?.some((s) => s.codec_type === "video")) {
    return res.status(400).json({ success: false, error: "not_a_video" });
  }
}
```

Also add the missing `fileFilter` to the multer config (`:901`) — `promptRoutes.js`
is one of only two upload routes without one (`purchaseRoutes.js` is the other),
which the checklist flags as 🟡. A `fileFilter` rejects at the stream boundary,
before 100 MB is buffered into memory.

### 🟢 LOW — a stale comment claims behaviour that doesn't exist

`:1019` says "Video → TOKUN.AI intro clip aage jodo (Netflix style)" but the
branch below just assigns the buffer through. Either the concat was removed or
never landed. Delete the comment or implement it — right now it describes a
feature that isn't there.

## 4.3 Storage — 🔴 HIGH

### Containers are created public

`utils/uploadToAzure.js:18-21`:

```js
await containerClient.createIfNotExists({
  access: "container",     // ⚠️ public READ + public LIST
});
```

Unchanged since `SECURITY-INCIDENT-2026-09-01.md` flagged it (§5 item 8). Eleven
containers come from this helper, including `kyc-documents`.

`createIfNotExists` sets access **only on first creation**, so code cannot tell
you the live state — that is why the incident report asks you to check Azure
Portal. **It is still unchecked, and it is the single highest-severity open item
in this codebase.** If those containers are public, the KYC exposure the incident
report is about is live right now and the git history purge fixed half the
problem.

The incident report also notes KYC URLs are never read anywhere in the app, so
making `kyc-documents` private breaks nothing. Do that one first regardless of
what the audit finds.

### 🟡 MEDIUM — blob names are guessable and collide

`uploadToAzure.js:24-30`:

```js
const fileName = `${timestamp}-${nameWithoutExt}${ext}`;
```

Two problems:

- **No user scoping, no randomness.** Two uploads of `photo.jpg` in the same
  millisecond produce the same blob name, and the second silently overwrites the
  first.
- **Enumerable.** With `access: "container"`, anyone can *list* the container —
  so names don't need guessing at all. Even without listing, `timestamp-name` is
  a small search space.

**Fix.**

```js
const fileName = `${userId}/${Date.now()}-${crypto.randomUUID()}${ext}`;
```

Pass the owner in. Prefixing by user also makes per-user cleanup and quota
possible, which nothing supports today.

---

# 5. Security

Most of this section is covered by the two prior documents. What follows is
**verification** plus what's new.

## Verified sound — no finding

| Check | Result |
|---|---|
| **Secrets in code** | Clean. `.env` untracked (verified across history per incident report). Frontend bundle carries only Razorpay `key_id`, which is public by design |
| **XSS** | `escapeHtml` (`SmarterPrompt.tsx:368`) runs **first** in `renderInline`, before any tag is inserted — correct order, and the comment explains why prompt text specifically needs it. `Header.tsx:5053`'s `innerHTML` is a static literal. `chart.tsx:79` injects developer-supplied CSS vars |
| **SQL injection** | Not applicable — MongoDB. The regex-injection equivalent is handled (§2.4) |
| **NoSQL operator injection** | Not seen; queries build filters from scalars, not spread request bodies |
| **CORS** | Explicit whitelist + `FRONTEND_URL`, trailing-slash stripped, unknown origins rejected via thrown Error (`index.js:4500-4534`) |
| **Rate limiting** | Global 600/5min, LLM 30/10min, OTP initiate, refresh, admin login/otp/resend. Verify endpoints are protected by the attempt counter instead (§2.2) |
| **Zip handling** | Never extracted server-side |

### 🟢 LOW — CORS allows requests with no `Origin` header

`index.js:4517` — `if (!origin || allowedOrigins.includes(origin))`.

A missing `Origin` means same-origin or a non-browser client (curl, server-to-server).
Normally this is where CSRF creeps in, but this API is **Bearer-token, not
cookie** — the checklist's reasoning that CSRF doesn't apply is correct, and a
tokenless request gets nothing from `requireAuth`. Low, and arguably fine.

Tighten only if you want defence in depth: allow `!origin` for `GET`/`HEAD` and
require a known origin for mutations.

## Confirmed still open

Ranked by what I'd fix first:

| # | Item | Severity |
|---|---|---|
| 1 | **Azure container access levels unaudited** (§4.3) — potentially live KYC exposure | 🔴 HIGH |
| 2 | **Old admin account still in the DB with the leaked password** — incident report §5 item 4. Escrow + KYC access | 🔴 HIGH |
| 3 | **`JWT_SECRET` not rotated** — same item. Rotation invalidates every issued token, which is the desired outcome | 🔴 HIGH |
| 4 | **GitHub GC not requested** — force-push doesn't delete orphaned objects; anyone with a SHA can still fetch them | 🔴 HIGH |
| 5 | No CSP header (all others present) | 🟡 MEDIUM |
| 6 | No 401 interceptor / auto-logout | 🟡 MEDIUM |
| 7 | Token in `localStorage`, read from 69 places | 🟡 MEDIUM |
| 8 | `GET /api/feedback/my?email=` IDOR — knowingly accepted, product decision | 🟢 LOW |

Items 1-4 are not code changes. They are the ones that have been open for six
days.

---

# 6. Performance

## 6.1 Bundle

Production build succeeds. Largest chunks:

| Chunk | Size |
|---|---|
| `vendor-agora` | **1.3 MB** |
| `vendor-three` | 836 KB |
| `vendor-common` | 440 KB |
| `vendor-charts` | 300 KB |
| `Dashboard` | 280 KB |
| `main` | 260 KB |
| `vendor-react` | 148 KB |

All 49 routes are `lazy()` and manual chunking is carefully tuned — the
checklist's ✅ holds.

### 🟡 MEDIUM — Agora and Three are 2.1 MB of vendor code

`vendor-agora` (video calling) and `vendor-three` (the landing globe) together
exceed every other chunk combined. Worth confirming they are only fetched by the
routes that need them — if `vendor-common` pulls either, every visitor pays for
the globe and the call SDK on first load.

**Fix.** Check the import graph:

```bash
npx vite-bundle-visualizer
```

If Agora is reachable from a shared module, move its import behind a dynamic
`import()` inside the call component so it loads on call start, not page load.
Same for Three on the landing hero — the poster frame already exists, so the
globe can hydrate after paint.

The checklist also flags Razorpay's CDN script at 1.36 MB on **every** page.
Loading it only on checkout-capable routes is the single biggest win available
here.

## 6.2 Assets

Confirmed ✅ per the checklist: 151 images with `loading="lazy" decoding="async"`,
LCP logo `eager` + `fetchPriority="high"`, hero video poster generated with
ffmpeg (80 KB vs 2.4 MB), `font-display: swap` on all 10 faces, immutable cache
headers on `/assets/*`.

One note from this session: `Tokun-opt2.png` (31 KB) was a hue-shifted copy of
`Tokun.png` (35 KB) made to match the hero wordmark's gradient. It was reverted
on request across four files, so the mark and wordmark now read as different
brands on the landing page. Cosmetic, but a deliberate design decision was
undone — flagging it here so it's a recorded choice rather than a regression
someone rediscovers.

## 6.3 Query latency

Covered in §2.3. To restate the honest position: **nothing here is slow today.**
699 documents in the largest collection means every missing index and every N+1
completes in milliseconds. The checkout N+1 is worth fixing now anyway, because
it is on the payment path and because fixing it is a 15-line change; the rest can
wait for volume.

**Confirmed open:** no cache layer (Redis or in-memory), no APM, no metrics. You
cannot currently answer "which endpoint is slowest" — which means §6 will stay
guesswork until §2.5's error/metrics gap is closed.

---

# 7. Live API test results

287 route definitions were exercised against the running server: 89 GET
endpoints (anonymous, then with a real session token) and 159 mutating
endpoints (anonymous only, empty bodies, non-existent ObjectIds).

**What held up well:** **zero 5xx** across all 89 GETs. Every
`/api/admin/*` endpoint answered 401 anonymous and 403 to a normal user token —
the role separation in §2.2 works in practice, and the twelve endpoints the
incident report closed are still closed.

**What did not:** four route groups answer without any authentication.

## 7.1 🔴 CRITICAL — `DELETE /api/auth/delete-all` deletes every user, unauthenticated

`routes/authRoutes.js:963`:

```js
router.delete("/delete-all", async (req, res) => {        // ← no middleware
  if (process.env.NODE_ENV === "production") {            // ← fail-OPEN
    return res.status(403).json({ success: false, error: "forbidden_in_production" });
  }
  const result = await User.deleteMany({});
```

**This fired during testing and deleted all 76 users from the live database.**
The guard checks for production and this environment's `NODE_ENV` is not set, so
it passed — while `MONGO_URI` pointed at the production Cosmos cluster. The
checklist marked `NODE_ENV=production` on Azure as ❓ (unverified); this is what
that gap costs.

Recovery is recorded separately. In short: no local backup held `users`, so the
rows were rebuilt from surviving references — `adminactivities` had denormalized
`actorId` + `actorName` + `meta.email` for every login, and auth is OTP-only so
there is no password hash to lose. 96 rows were restored (against 76 deleted),
all tagged `restoredFrom: "reconstructed-2026-09-07"`. 21 referenced ids had no
recoverable email and could not be restored, leaving orphans in `carts` (12),
`bankaccounts` (9) and `wallets` (1). Point-in-time restore supersedes all of
this and should still be run.

**Fix.** Delete the route. If a reset helper is genuinely wanted, make the guard
fail closed and require an admin:

```js
router.delete("/delete-all", requireAuth, requireAdmin, async (req, res) => {
  if (process.env.NODE_ENV !== "development") {
    return res.status(403).json({ success: false, error: "forbidden" });
  }
```

`!== "development"` rather than `=== "production"`: an unset variable must deny,
not allow. Every other environment-gated destructive path in this codebase
should be checked for the same inversion.

## 7.2 🔴 CRITICAL — no-op middleware stubs shadow the real auth

`routes/userAdminRoutes.js:7-8`:

```js
const requireAuth  = (req, res, next) => next();
const requireAdmin = (req, res, next) => next();

router.get("/", requireAuth, requireAdmin, async (req, res) => {   // :15
```

The route *names* both middlewares, so it reads as admin-only in review. Both
are pass-through functions defined in the same file, shadowing the real imports.

Observed: `GET /api/user?limit=1000` returns **all 76 users** — `email`, `name`,
`role`, `userType`, `plan`, `kycStatus`, `lastLoginAt`, `isVerified` — with no
credentials. `?search=` filters it, so it is queryable, and pagination makes any
size of user table fully enumerable.

This is the most dangerous shape a missing auth check can take, because it is
camouflaged rather than absent. The checklist records "✅ Koi stub/bypass
middleware nahi" — that stub was removed from one file and this one survived. A
scan of every route file found **only this one**, so the fix is contained.

Given the DPDP exposure already documented in
`SECURITY-INCIDENT-2026-09-01.md`, note the contrast: that report established
that the leaked database dumps contained **no email addresses**. This endpoint
hands out every one.

**Fix.** Delete lines 7-8 and import the real middleware:

```js
const { requireAuth } = require("../utils/auth");
const { requireAdmin } = require("../middleware/requireAdmin");
```

Then add a lint rule or CI grep so a no-op middleware can never be introduced
again:

```bash
! grep -rE "=\s*\(req,\s*res,\s*next\)\s*=>\s*next\(\)" routes/ middleware/
```

## 7.3 🔴 CRITICAL — four wallet admin endpoints move money without auth

All four in `routes/walletRoutes.js`, none carrying any middleware:

| Line | Endpoint |
|---|---|
| 2713 | `GET /api/wallet/admin/pending-bank-transfers` |
| 2897 | `GET /api/wallet/admin/pending-withdrawals` |
| 2924 | `GET /api/wallet/admin/all-withdrawals` |
| 3153 | `GET /api/wallet/admin/withdrawal-summary` |

Plus the mutating pair, also unauthenticated — these answered `400` in testing
only because the probe sent an empty body:

```
POST /api/wallet/admin/approve-withdrawal      → {"error":"withdrawalId required"}
POST /api/wallet/admin/reject-withdrawal       → {"error":"withdrawalId required"}
POST /api/wallet/admin/approve-bank-transfer   → {"error":"walletId and txnId required"}
POST /api/wallet/admin/reject-bank-transfer    → {"error":"walletId and txnId required"}
```

With real ids, an anonymous request approves a payout. The read endpoints hand
over the ids needed to do it. `walletwithdrawals` is empty today, which is the
only reason this has not been exploited.

**Fix.** `requireAuth, requireAdmin` on all eight. Better, mount the whole admin
surface behind one router-level gate so a new endpoint inherits it:

```js
// walletRoutes.js — before any /admin/* definition
router.use("/admin", requireAuth, requireAdmin);
```

## 7.4 🟡 MEDIUM — business analytics readable by anyone

`routes/purchaseRoutes.js:1526, 1565, 1675, 1722` — `/analytics/sales`,
`/sales-by-category`, `/seller-trends`, `/user-trends`, all without middleware.
Revenue by month, revenue by category, seller and buyer trends. No PII, but it
is the platform's commercial position.

**Fix.** `requireAuth` at minimum; `requireAdmin` if these are dashboard-only.

## 7.5 🟢 LOW — `POST /api/activity/log` writes without auth

Returned `200` with a created id on an empty anonymous body, so the activity log
is writable by anyone — meaning it can be flooded, and entries in it can't be
trusted as evidence. One test row was created during the sweep
(`6a9e816b8e117521194f231a`).

Worth noting because §7.1's recovery depended entirely on this collection's
integrity.

**Fix.** `requireAuth`, and take the actor from `req.user` rather than the body.

## 7.6 🟢 LOW — response-time outliers

Ten endpoints exceeded 1s with a warm connection:

| Endpoint | ms | Cause |
|---|---|---|
| `/api/bankaccount/payout-status` | 1728 | live Razorpay Route fetch per call |
| `/api/hire/my/earnings` | 1472 | — |
| `/api/prompt/others` | 1463 | marketplace listing |
| `/api/freelancer/browse` | 1352 | — |
| `/api/services/allowed-categories` | 1305 | — |

`payout-status` is called on every seller dashboard load and makes a synchronous
Razorpay API call (`fetchRouteProductConfiguration`). Cache the activation status
for a minute, or refresh it from the webhook rather than on read.

## 7.7 🟢 LOW — duplicate schema index

Server boot logs:

```
[MONGOOSE] Warning: Duplicate schema index on {"referredId":1} found.
```

`referredId` is declared both with `index: true` and a `schema.index()` call in
`models/Referral.js`. Harmless, but it is noise on every boot that trains people
to ignore boot warnings.

---

# Priority order

## Do now — the three unauthenticated endpoint groups

0. **`DELETE /api/auth/delete-all`** (§7.1) — delete the route. It has already
   destroyed the users collection once.
1. **`userAdminRoutes.js` no-op stubs** (§7.2) — two lines; closes a full user
   dump including every email.
2. **Wallet admin endpoints** (§7.3) — one `router.use` line; closes anonymous
   payout approval.
3. **Run a point-in-time restore** to recover the 21 users that could not be
   reconstructed, plus the token quotas and avatars that no reconstruction
   recovers.

## Then — not code, and six days open

1. **Audit Azure container access levels.** Make `kyc-documents` private first;
   nothing reads those URLs.
2. **Change the old admin account's password** (or delete it) and **rotate
   `JWT_SECRET`**.
3. **Ask GitHub Support to garbage-collect orphaned commits.**

## This week — small, high leverage

4. **Error tracking** (App Insights or Sentry). Everything else in this document
   is easier to act on once failures are visible.
5. ~~Test the payment verify paths for amount tampering~~ — **done, safe** (§3.2).

6. **Add the three missing indexes** (§2.3) — six lines.
7. **Delete the shadowed `GET /:dealId`** (§2.1) — twenty lines.
8. **Fix the OTP attempt-counter reset** (§2.2) — four lines.

## Next two weeks

9. **Strip dead code**, one file per commit (§1.1). Unblocks everything below it.
10. **Fix the checkout N+1** (§2.3) and move it inside the existing transaction.
11. **Validate video uploads** and add the missing `fileFilter` (§4.2).
12. **Scope and randomize blob names** (§4.3).
13. **Make `tsc -p tsconfig.json` fail loudly** (§1.5), then clear the two
    mechanical error classes — 55 → ~30.

## Ongoing

14. Centralized API client + 401 interceptor.
15. Transactions on the remaining money flows.
16. Split `Dashboard.tsx` (24k) and `AddFunds.tsx` (12k).
17. Empty states and a shared skeleton.
18. Manual accessibility audit — keyboard and screen reader, which no static
    scan covers.
19. Bundle: gate Razorpay, Agora and Three behind the routes that need them.

---

# Don't touch

Verified working and deliberately built. Each has reasoning in a comment worth
reading before changing:

- **Prompt dedup's four layers** — hash, byte hash, perceptual hash, watermark
  detection, ordered cheapest-first (`promptRoutes.js:735-787`)
- **Razorpay error translation** — the `sellerFacing` flag driving 400-vs-502
  (`constants/razorpayErrors.js`)
- **`escapeHtml` ordering** in `renderInline` — first and exactly once
  (`SmarterPrompt.tsx:357-376`)
- **OTP attempt lockout** — 5 tries, persisted, 429 before comparison
- **The `TM` role model** — answered centrally in `payout-status`, not
  re-derived per screen
- **Webhook raw-body mount order** — signature verification depends on it
- **`serviceWorkStorage.js`** — private container plus SAS. This is the pattern
  the other eleven containers need
- **helmet's three exceptions** — COOP for the Google popup, CORP for
  `/uploads`, CSP off for the JSON API. All three reasoned in place
- **`scripts/` dry-run-by-default pattern**
