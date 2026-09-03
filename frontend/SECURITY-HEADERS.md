# Security headers — why each line is what it is

`public/staticwebapp.config.json` is strict JSON and cannot hold comments, so
the reasoning lives here. Everything below is about the headers in
`globalHeaders`.

Two of these were already documented in `PRODUCTION-CHECKLIST.md` when they were
added — `Permissions-Policy` and `X-Frame-Options`. They are repeated here so
there is one place to look.

---

## Content-Security-Policy

### Why it is worth the trouble in this app specifically

Session tokens are in `localStorage`, read from 67 places. That is a deliberate
design choice (Bearer tokens, no cookies, therefore no CSRF surface) and it has
one consequence: **any script that runs on this origin can read the token.**
There is no `HttpOnly` protecting it, because there is no cookie.

So the question "can an attacker get script to run here?" is the whole security
model, and this app has answered it wrong once already — prompt content reached
`innerHTML` unescaped, which is stored XSS on a page where every visitor's token
is one `localStorage.getItem` away. That bug is fixed (`escapeHtml`), but nine
`innerHTML` / `dangerouslySetInnerHTML` sites remain in `src/`.

CSP is the layer that assumes one of them is wrong.

### `script-src 'self' https://checkout.razorpay.com`

No `'unsafe-inline'`, and that is the single most important thing in this file.
With it, injected `<script>` in page content executes normally and the rest of
the policy is close to decoration.

Getting there cost one refactor: `index.html` had an inline `<script>` and an
`onload="this.media='all'"` attribute on the fonts `<link>`, and both are
"inline script" as far as CSP is concerned. They now live in
`public/head-boot.js` — see that file's header for why an external file was
chosen over a CSP hash.

**If you add an inline script or an `onXxx=` attribute, it will not run.** Put
it in a file. That is the trade this policy makes.

Razorpay's checkout is the one third-party script, loaded from `index.html`.

### `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`

`'unsafe-inline'` here is unavoidable and is a much smaller concession than the
script equivalent. React's `style={{…}}` produces inline style attributes, and
Radix, framer-motion, embla and vaul all set element styles directly — the app
would be visually broken without it. Inline CSS cannot execute code; the realistic
abuse is data exfiltration through crafted selectors, which `connect-src` and
`img-src` already bound.

`fonts.googleapis.com` serves the JetBrains Mono stylesheet.

### `font-src 'self' https://fonts.gstatic.com data:`

`gstatic` is where `fonts.googleapis.com` points for the actual font files —
allowlisting only the stylesheet host would load the CSS and then block every
`@font-face` in it. `data:` covers inlined fonts in built CSS.

### `img-src` / `media-src`

- `tokunstorage.blob.core.windows.net` — prompt thumbnails, previews, service
  media, freelancer intro videos. Everything user-uploaded now lives here.
- The `azurewebsites.net` API host — legacy `/uploads` URLs on older records,
  and the gated deliverable-preview routes.
- `*.razorpay.com` — checkout's own assets.
- `i.pravatar.cc` — placeholder avatars.
- `blob:` — required by the video preview flow and by anything that renders a
  `URL.createObjectURL` source.

### `connect-src`

Everything the app is allowed to *talk to*. This is the directive that limits
where a successful XSS could send a stolen token, so it is the one to keep
tight.

- The API host over both `https:` and `wss:` — the second is socket.io, and a
  missing `wss:` entry breaks chat while leaving everything else working, which
  is a confusing failure to debug.
- Blob storage — direct uploads/reads.
- `*.razorpay.com` — checkout posts back to its own API.
- The three Azure Monitor hosts — Application Insights ingestion. Note the
  frontend `VITE_APPLICATIONINSIGHTS_CONNECTION_STRING` is currently unset, so
  the SDK no-ops; these are allowlisted so that turning it on is a config
  change and not a CSP debugging session.
- `*.agora.io` / `*.sd-rtn.com`, both schemes — Agora RTC's signalling and media
  edge. `sd-rtn.com` is Agora's own delivery network and is not optional; audio
  and video calls fail without it.

### `worker-src 'self' blob:`

`blob:` because bundlers emit workers as blob URLs.

### `frame-src https://api.razorpay.com https://checkout.razorpay.com`

Razorpay's checkout runs in an iframe on `api.razorpay.com`. Same reason
`Permissions-Policy` names that origin explicitly — see below.

### `frame-ancestors 'self'`

Who may frame *us*. This is the modern replacement for `X-Frame-Options`, which
is still sent alongside for older browsers. Both say the same thing, and both
say `SAMEORIGIN` rather than `DENY` for the reason recorded below.

### `base-uri 'self'` · `form-action 'self'` · `object-src 'none'`

Cheap and absolute. `base-uri` stops an injected `<base>` tag silently
re-pointing every relative URL on the page; `form-action` stops a form being
retargeted at an attacker's host; `object-src 'none'` removes the plugin surface
entirely.

### `upgrade-insecure-requests`

Belt and braces next to HSTS — anything that slipped through as `http:` is
fetched over `https:` instead of failing as mixed content.

---

## The two pre-existing decisions, restated

### `Permissions-Policy` names Razorpay's origins explicitly

`payment=(self)` alone produced `Permissions policy violation: payment is not
allowed in this document` in production. Razorpay's checkout runs in an iframe on
`api.razorpay.com` — a different origin, which `self` does not cover. Payment
still completed (Razorpay falls back to its own UI when the browser's native
payment sheet is unavailable) but conveniences like Google Pay autofill were
gone. Dropping the feature from the header does not help either: the browser
default is also `self`, so the origins have to be written out.

### `X-Frame-Options: SAMEORIGIN`, not `DENY`

`DENY` does not break anything today, because *we* frame Razorpay rather than the
other way round. But bank 3-D Secure flows sometimes frame the merchant page, and
on that day `DENY` would stop a payment mid-flow. `SAMEORIGIN` gives the same
clickjacking protection that is actually needed here.

---

## Changing this policy

The failure mode of a wrong CSP is a blocked resource, not an error page — a
video that never plays, a call that never connects, a font that never swaps in.
Check the browser console for `Refused to …` before assuming a feature broke for
another reason.

When the API moves to a custom domain (`api.tokun.world`), three entries change
together: `connect-src` (both schemes), `img-src` and `media-src`. Missing the
`wss:` one breaks only chat.
