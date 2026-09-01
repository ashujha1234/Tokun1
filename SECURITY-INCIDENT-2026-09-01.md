# Security incident — public exposure of KYC and contract documents

**Discovered:** 1 September 2026 · **Repository:** `github.com/ashujha1234/Tokun1` (public)

**I am not a lawyer.** The "Legal exposure" section describes which obligations
appear to apply so you can brief counsel efficiently. One deadline in it is
measured in hours, so read §3 before doing anything else.

---

## 1. What was exposed

256 files were committed to a public GitHub repository and were world-readable
for the life of the repository. **File count is not people count** — measuring
unique file contents rather than paths changes the picture substantially, so both
are given below.

| Path | Files | Unique documents | What it is |
|---|---|---|---|
| `server/private_uploads/kyc/` | 59 | **7** | Aadhaar/ID images. See §2 — these look like test fixtures |
| `server/uploads/nda/` | 44 | **43** | Executed NDAs, each carrying a drawn signature image |
| `server/uploads/service-nda/` | 17 | 15 | Executed service NDAs |
| `server/uploads/hire-work/` | 16 | 9 | Freelancer deliverables |
| `server/uploads/reports/` | 12 | 3 | Abuse-report screenshots |
| `server/uploads/feedback/` | 12 | 2 | Feedback screenshots |
| `server/uploads/profile/` | 9 | 5 | Profile photos |
| `server/uploads/services/` | 8 | — | Service listing media |
| `server/uploads/chat/` | 7 | 5 | Chat attachments |
| `server/uploads/` (root) | ~66 | — | Prompt/test uploads |
| `server/backup-prompts-2026-08-12T.../` | 5 | 5 | MongoDB dumps — `prompts` 50 rows, `promptreports` 7, `carts` 6, two empty |
| `.DS_Store` | 1 | — | — |

**The most substantive exposure is the 43 executed NDAs, not the KYC files.**
Each contains counterparty names and an embedded drawn signature image. Checked
structurally: no email addresses and no PAN numbers appear in them.

The MongoDB dumps are lower sensitivity than they sound — prompt content, cart
rows and report rows referenced by ObjectId. Verified: **no email addresses and no
bcrypt password hashes** in any of them.

Separately, and independent of the files: the history contained
`utils/seedAdmin.js` with a **plain-text admin email and password** for an account
with access to escrow balances and KYC documents. The credentials have since
moved to environment variables, but the old content is still readable in the
pre-rewrite history on GitHub, and **the account still exists in the database with
that password.**

### What was *not* exposed

- `.env` was never committed — verified across all 139 commits.
- `backup-payments-*`, `backup-cleanup-*`, `backup-prune-*` — Razorpay payment and
  refund ids, ledger entries, escrow disputes, NDA signature records. These exist
  only on local disk and were never tracked.
- `server/uploads/screen-recordings/` — the single entry in the old `.gitignore`.

## 2. The KYC files are almost certainly test fixtures

This materially narrows the notification question, so here is the evidence:

- **59 files contain only 7 distinct images** (7 unique blob hashes). The same
  image was re-uploaded between 3 and 13 times.
- All 7 originate from the same day: six are
  `WhatsApp_Image_2026-02-09_at_<time>.jpeg`, one is `aadhar.jpeg`.
- They are spread across **7 user ids, 6 of which no longer exist in the `users`
  collection.** The one that does is your own account
  (`ashutoshjha1701@gmail.com`).
- All 19 corresponding `KycSubmission` rows have `frontPath` values pointing at
  **`C:\Users\ashutosh kumar jha\OneDrive\Desktop\Token\server\private_uploads\kyc\`**
  — a Windows developer machine, not any server or Azure path. Those rows were
  already unresolvable in production before this incident.

That is the signature of someone exercising the KYC flow repeatedly during
development, from a local machine, under throwaway accounts.

**The one thing I cannot determine, and you can:** whose documents are on those 7
images? If they are all yours, there is likely no third-party data subject here at
all. If any belongs to another real person — a friend, a family member, an early
tester — that person's ID document was publicly readable for ~148 days and should
be told regardless of what the law strictly requires.

Answer that question before you brief counsel; it changes the scope of everything
in §3.

## 3. Exposure window and access evidence

| | |
|---|---|
| Repository created | 6 April 2026 |
| KYC and upload files added | the first commit |
| Purged from history | 1 September 2026 (local only — not yet pushed) |
| **Public window** | **~148 days** |

GitHub currently reports **0 forks, 0 stars, 0 watchers, 0 subscribers**. That is
weak evidence, not proof of no access — anonymous clone counts are not visible to
third parties, and scrapers that index public repositories for leaked credentials
and personal data leave no public trace.

**Do this first, it is expiring:** repository → **Insights → Traffic** shows clone
and unique-visitor counts, but **only for the last 14 days**. The rest of the
148-day window is already unrecoverable. Screenshot it now — it is the only access
telemetry that exists, and counsel will ask.

## 4. Legal exposure — brief your lawyer on these

### CERT-In 6-hour reporting — the urgent one

The CERT-In Directions of 28 April 2022 require specified cyber incidents to be
reported **within 6 hours of noticing them**, and the reportable list includes
data breaches and leaks and unauthorised access to data. The obligation is on the
body corporate and does not depend on proving anyone actually read the data.

The clock started when you learned of this. Reporting goes to
`incident@cert-in.org.in`. Confirm the current form with counsel, but do not let
the 6-hour question wait on a lawyer being reachable — a late report is a separate
problem from the breach.

### DPDP Act 2023

Section 8(6) obliges a Data Fiduciary to intimate a personal data breach to the
Data Protection Board of India and to **each affected Data Principal**, in the
form and manner set by the DPDP Rules. Enforcement has been phased, so **ask
counsel what is in force today** and what the current prescribed format and
deadline are — do not rely on this document for that.

Scope depends on §2 and on the NDAs: plan on the 43 NDA counterparties being
identifiable data subjects, and on the KYC subjects being few — possibly only
you.

### Aadhaar — the part that outlives this incident

Raise this with counsel first; it is more likely to matter than the leak.

The Aadhaar Act 2016 restricts collection, storage and display of Aadhaar
information, §29(4) restricts public display or publication, and UIDAI's position
has consistently been that private entities may not store Aadhaar copies absent
specific authorisation. So there are two separate questions:

1. Was publishing these images a violation? (the incident)
2. **May a freelance marketplace collect and retain full Aadhaar images for KYC at
   all?** (the design)

If the answer to (2) is no, re-securing the storage does not fix it. Ask about
**Offline Aadhaar XML, DigiLocker, or masked Aadhaar** — verifying identity
without ever holding the full document — and about whether the 39 existing
`KycSubmission` rows must be deleted rather than merely secured.

## 5. Do these now, in this order

1. **Capture Insights → Traffic.** 14-day window, expiring.
2. **Answer the §2 question** — whose documents are on those 7 images.
3. **CERT-In report** — 6-hour clock.
4. **Change the admin account's password**, or delete it once a second admin
   exists. The old password is in the history still on GitHub and the account
   holds escrow and KYC access. Rotate `JWT_SECRET` at the same time — it
   invalidates every issued token, which is the correct outcome here.
5. **Push the rewritten history** — see §7.
6. **Ask GitHub Support to garbage-collect the orphaned commits.** A force-push
   does not delete old objects; they stay fetchable by SHA until GitHub GCs them,
   and on a public repository anyone holding a SHA can still retrieve them.
   Support must do this — you cannot trigger it. **This is the step that actually
   ends the exposure**, and it matters more because you chose to keep the
   repository public.
7. **Reconsider going private** until step 6 completes. Your call, but between the
   force-push and GitHub's GC the old objects remain fetchable, and private is the
   only thing that closes that window.
8. **Audit the Azure Blob containers.** `utils/uploadToAzure.js:20` creates every
   container with `access: "container"` — in Azure that means public read *and*
   public list. Eleven containers come from that helper, including
   `kyc-documents`, where the 18 Azure-backed KYC submissions live. **If those
   containers are public, KYC exposure is live right now and the git purge fixed
   only half the problem.** `createIfNotExists` sets access only on first
   creation, so this cannot be determined from code — check Azure Portal →
   Storage account → Containers.
9. **Notify affected parties** on counsel's advice.

## 6. Resolving who was affected

KYC filenames follow `<userId>_<timestamp>_<originalName>`. The seven ids and
their document counts:

```
16 docs  69899eecd46aae844e031b40   (no users row)
16 docs  69896594e4ce72f8fa0ff1e0   (no users row)
16 docs  69895b2cfe060d07c5016af0   (no users row)
 5 docs  68b941d5aff9d66b160ba8f0   ashutoshjha1701@gmail.com — your account
 2 docs  69c2550661396c963d035b30   (no users row)
 2 docs  6989cabf78696c871d0e42b0   (no users row)
 2 docs  696dc4f61fcbc3931003f4e0   (no users row)
```

For the NDA counterparties, resolve through the `hiredeals` and `serviceorders`
collections — `ndaClientSignedAt` / `ndaSellerSignedAt` and the `clientId` /
`freelancerId` / `buyerId` fields — rather than through filenames, which are bare
timestamps.

To recover the original file list from the backup:

```bash
git bundle unbundle /Users/ashutoshjha/Tokun1-1-PRE-REWRITE-BACKUP.bundle
git ls-tree -r --name-only 5445ffa | grep -E 'private_uploads/kyc/|uploads/nda/'
```

## 7. Repository state and how to push

The history was rewritten **locally only. Nothing has been pushed.**

| | |
|---|---|
| Commits | 139 local vs 136 on `origin/main` — fully diverged, every SHA changed |
| PII paths remaining in history | 0, verified across all 139 commits and 885 distinct paths |
| Backup | `/Users/ashutoshjha/Tokun1-1-PRE-REWRITE-BACKUP.bundle` (197 MB, `git bundle verify` passes) |

The purge removed these files from the **working tree** as well as history.
`server/uploads/screen-recordings/` (202 MB) survives because it was never
tracked. If you need any deleted NDA or deliverable back on disk, it is
recoverable from the bundle without touching the new history.

```bash
cd /Users/ashutoshjha/Tokun1-1

git log --oneline -3
git rev-list --left-right --count origin/main...HEAD   # expect 136  139

git push --force-with-lease=main:$(git rev-parse origin/main) origin main
```

`--force-with-lease` rather than `--force`: it refuses if anything reached
`origin/main` after your last fetch, instead of silently overwriting it.

**Do not use `git push --all` or `--mirror`** on this repository — see §8.

To restore if the push turns out wrong:

```bash
git bundle verify /Users/ashutoshjha/Tokun1-1-PRE-REWRITE-BACKUP.bundle
git fetch /Users/ashutoshjha/Tokun1-1-PRE-REWRITE-BACKUP.bundle 'refs/*:refs/pre-rewrite/*'
git reset --hard refs/pre-rewrite/heads/main
```

Keep the bundle until CERT-In and DPDP notification is closed — it is evidence,
and it is now the only copy of the exposed files. Store it somewhere not public,
and note that it contains the very data this incident is about.

## 8. Fixed in the same session

Unauthenticated endpoints, closed and verified live against a running server
(anonymous 401, normal-user token 403, admin token 200, public routes unaffected):

`GET /api/admin/platform-revenue` · `GET /api/admin/platform-revenue/by-source` ·
`GET /api/report/admin/all` · `PATCH /api/report/:id/status` · `GET /api/feedback` ·
`DELETE /api/feedback/:id` · `PATCH /api/feedback/:id/status` ·
`PATCH /api/feedback/:id/testimonial` · `POST /api/category` ·
`POST /api/category/seed-defaults` · `POST /api/llm-provider` ·
`DELETE /api/llm-provider/:id`

`POST /api/report` also took `reportedBy` from the request body; it now comes from
the verified token and the reporter must be a participant in the deal.

Dependency advisories: server 31 → 2, frontend 27 → 6, nothing critical
remaining. Three declared-but-unused packages removed — `chromium`,
`puppeteer-core`, `jspdf`; `jspdf` carried the only critical.

`.gitignore` rewritten from its single line to cover secrets, uploads, DB dumps,
build output, logs and OS noise.

## 9. Known open items

- **Local `refs/pre-rewrite/*` refs were deleted** after the analysis above.
  They held the old history and would have been published by a `git push --all`.
  If you ever re-fetch the bundle for evidence, delete the refs again afterwards.
- **`GET /api/feedback/my?email=` is an IDOR** — any address returns that person's
  feedback. Left alone deliberately: locking it to `req.user.email` removes the
  logged-out lookup `MyFeedbackPage.tsx` offers by design. Product decision.
- **Azure container access levels** — §5 item 8. Potentially still-live exposure.
- **No refresh-token rotation** — a leaked JWT stays valid 7 days.
- **Remaining advisories need major bumps** — `nodemailer@9`, `sharp@0.35`
  (server); `vite@8`, `react-router-dom@7` (frontend; the esbuild issue affects
  the dev server only, not the production build).
- **No error tracking at all** — no Sentry, no App Insights, 839 bare `console.*`
  calls. If something like this is exploited again there is no way to know.
