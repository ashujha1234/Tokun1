/* Two things that must run before the app bundle, extracted from index.html so
 * the page can have a strict Content-Security-Policy.
 *
 * ── Why this file exists at all ─────────────────────────────────────────────
 *
 * Both of these used to be inline in index.html: a <script> block and an
 * `onload="this.media='all'"` attribute on the fonts <link>. A CSP that allows
 * either has to carry `script-src 'unsafe-inline'`, and that single keyword is
 * most of what a CSP is for — with it, an injected <script> in page content
 * executes exactly as before, which is the class of bug this app has already
 * had once (prompt content reaching innerHTML unescaped).
 *
 * Hashing the inline block was the other option and was rejected: a hash has to
 * be recomputed whenever the script changes, and when someone forgets, the
 * script silently stops running. Nothing errors — fonts and the preload just
 * quietly stop working. An external file cannot drift out of sync with itself.
 *
 * ── Why it is not deferred ──────────────────────────────────────────────────
 *
 * Both jobs are only worth doing if they happen before the bundle starts
 * fetching, so this is a plain blocking script in <head>. It is a few hundred
 * bytes on the connection that already just delivered index.html — no DNS, no
 * TLS, no new socket — which is why it does not reintroduce the render-blocking
 * cost this whole arrangement was built to avoid.
 */
(function () {
  var head = document.head;

  /* ── 1. The auth pages' left-hand panel ────────────────────────────────────
   *
   * Its request could not start until the app bundle had downloaded and parsed,
   * React had resolved /pages/Login's lazy chunk, and that chunk had rendered
   * as far as the <img> — four steps deep, which is why the panel arrived
   * visibly after the form beside it. This starts the download alongside the
   * bundle instead of after it.
   *
   * Injected by path rather than written as a plain <link>: this one HTML file
   * is served for every route, and no other page wants an image it will never
   * show.
   */
  if (
    /^\/(login|signup|verify-login|verify-signup|admin-login|admin-forgot-password)\/?$/.test(
      location.pathname
    )
  ) {
    var authArt = document.createElement("link");
    authArt.rel = "preload";
    authArt.as = "image";
    authArt.href = "/icons/signup.jpg";
    authArt.setAttribute("fetchpriority", "high");
    head.appendChild(authArt);
  }

  /* ── 2. JetBrains Mono, loaded without blocking render ─────────────────────
   *
   * The one family this app does not self-host (Inter lives in /Fonts/inter).
   * As a plain stylesheet it was the single most expensive thing on the page:
   * Lighthouse measured 568 ms of render-blocking, because the browser will not
   * paint until every stylesheet in <head> has been fetched and parsed — and
   * this one is on someone else's origin, so it costs a DNS lookup, a TLS
   * handshake and two round-trips before the first pixel.
   *
   * `media="print"` makes it non-render-blocking (it does not apply to the
   * screen, so nothing waits for it); onload flips it to `all` the moment it
   * arrives. The cost is a brief moment in the fallback font, which is already
   * how this family is declared — `--font-mono: 'JetBrains Mono', ui-monospace,
   * …` in landing-page.css and PromptMarketplace.css, its only two uses.
   *
   * Hanken Grotesk and Anybody ride along in the SAME request rather than in
   * their own links: they are the display and body faces the two reference
   * designs specify (Smart Prompt Generator, Ecosystem Hierarchy), and Google
   * serves any number of families from one css2 URL. Separate <link>s would
   * each cost another round trip to the same host for no reason.
   *
   * The <noscript> copy in index.html keeps it working with JavaScript off —
   * and must be kept in step with this URL.
   */
  var fonts = document.createElement("link");
  fonts.rel = "stylesheet";
  fonts.href =
    "https://fonts.googleapis.com/css2?family=Anybody:wght@400&family=Hanken+Grotesk:wght@600;700&family=JetBrains+Mono:wght@500;600&display=swap";
  fonts.media = "print";
  fonts.onload = function () {
    this.media = "all";
  };
  head.appendChild(fonts);
})();
