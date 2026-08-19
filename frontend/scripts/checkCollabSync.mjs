/**
 * Drives the collab text-sync state machine the way two people actually use it,
 * and asserts nobody's characters go missing.
 *
 *   node scripts/checkCollabSync.mjs
 *
 * PromptInput's sync is spread across a debounce, a typing-grace window and
 * three socket handlers, all of which are timing-dependent — the kind of thing
 * that reads correct and still eats a space. So the same rules are restated here
 * as one small machine and run against a simulated clock, with a relay in the
 * middle standing in for the server (which echoes to everyone EXCEPT the sender,
 * exactly as socket.to(room) does).
 *
 * Keep it in step with the component. If the rules there change, change them
 * here too or this stops meaning anything.
 */

const DEBOUNCE_MS = 400;
const TYPING_GRACE_MS = 900;

let now = 0;
const timers = [];
const setLater = (delay, fn) => timers.push({ at: now + delay, fn });

/** Runs the clock forward, firing timers in order. */
function advance(ms) {
  const until = now + ms;
  for (;;) {
    const due = timers.filter((t) => !t.done && t.at <= until).sort((a, b) => a.at - b.at)[0];
    if (!due) break;
    now = due.at;
    due.done = true;
    due.fn();
  }
  now = until;
}

/** One participant: the component's sync rules, nothing else. */
function makeClient(name, relay) {
  const c = {
    name,
    text: "",
    lastSynced: "",
    lastLocalEdit: -Infinity,
    pendingRemote: null,
    pendingTimer: null,
    debounce: null,
    lastRev: -1,
  };

  const scheduleDebounce = () => {
    if (c.debounce) c.debounce.done = true; // clearTimeout
    const t = { at: now + DEBOUNCE_MS, fn: () => flush() };
    timers.push(t);
    c.debounce = t;
  };

  const flush = () => {
    if (c.text !== c.lastSynced) {
      c.lastSynced = c.text;
      relay.send(c, c.text);
      c.pendingRemote = null;
    } else if (c.pendingRemote !== null) {
      const held = c.pendingRemote;
      c.pendingRemote = null;
      if (held !== c.text) applyRemote(held);
    }
  };

  const applyRemote = (incoming) => {
    c.text = incoming;
    c.lastSynced = incoming;
  };

  c.type = (chunk) => {
    c.text += chunk;
    c.lastLocalEdit = now;
    scheduleDebounce();
  };

  // prompt-change from a peer
  c.receive = (incoming, rev) => {
    // The server's ordering wins: an edit older than one already applied is a
    // message that overtook a newer one and is dropped.
    if (rev <= c.lastRev) return;
    c.lastRev = rev;
    if (incoming === c.text) {
      // The newest edit is what we already show — usually our own ack. Anything
      // held is older than it and must not be allowed to land.
      if (c.pendingTimer) c.pendingTimer.done = true;
      c.pendingTimer = null;
      c.pendingRemote = null;
      return;
    }
    if (now - c.lastLocalEdit < TYPING_GRACE_MS) {
      c.pendingRemote = incoming;
      if (c.pendingTimer) c.pendingTimer.done = true;
      const t = {
        at: now + TYPING_GRACE_MS,
        fn: () => {
          const held = c.pendingRemote;
          c.pendingRemote = null;
          if (held !== null && held !== c.text) applyRemote(held);
        },
      };
      timers.push(t);
      c.pendingTimer = t;
      return;
    }
    applyRemote(incoming);
  };

  // prompt-initial on (re)join — seeds an empty editor only.
  c.rejoin = (serverText, rev = 0) => {
    c.lastRev = Math.max(c.lastRev, rev);
    if (c.text.trim()) {
      if (serverText === c.text) c.lastSynced = serverText;
      return;
    }
    c.text = serverText;
    c.lastSynced = serverText;
  };

  return c;
}

function makeRelay(latencyMs) {
  const relay = {
    clients: [],
    /** What the server has stored — what a rejoin would be answered with. */
    stored: "",
    rev: 0,
    send(from, text) {
      relay.stored = text;
      const rev = ++relay.rev; // $inc on the session — one order for everyone
      // io.to(room): everyone, INCLUDING the sender, so it learns its own rev.
      for (const to of relay.clients) {
        setLater(latencyMs, () => to.receive(text, rev));
      }
    },
  };
  return relay;
}

let failures = 0;
const check = (label, actual, expected) => {
  const ok = actual === expected;
  if (!ok) failures++;
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}`);
  if (!ok) console.log(`        got      ${JSON.stringify(actual)}\n        expected ${JSON.stringify(expected)}`);
};

function scenario(label, fn) {
  now = 0;
  timers.length = 0;
  console.log(`\n${label}`);
  fn();
}

/* ── 1. one person typing, a peer sitting idle ─────────────────────────────── */
scenario("one person types, the other just watches:", () => {
  const relay = makeRelay(50);
  const a = makeClient("A", relay);
  const b = makeClient("B", relay);
  relay.clients = [a, b];

  // "I am Ashutosh" then a space then "kumar", typed at a human pace.
  for (const ch of "I am Ashutosh") { a.type(ch); advance(90); }
  advance(600);              // a pause — the debounce fires and B catches up
  a.type(" ");               // THE SPACE
  advance(120);
  for (const ch of "kumar") { a.type(ch); advance(90); }
  advance(2000);

  check("the typist keeps the space", a.text, "I am Ashutosh kumar");
  check("the peer ends up with the same text", b.text, "I am Ashutosh kumar");
});

/* ── 2. the space typed right as the peer's copy lands ─────────────────────── */
scenario("a space typed in the same instant a peer update arrives:", () => {
  const relay = makeRelay(50);
  const a = makeClient("A", relay);
  const b = makeClient("B", relay);
  relay.clients = [a, b];

  for (const ch of "I am Ashutosh") { a.type(ch); advance(90); }
  advance(DEBOUNCE_MS + 10);   // A's copy is in flight to B
  a.type(" ");                 // typed before the echo settles
  advance(3000);

  check("the space survives", a.text, "I am Ashutosh ");
  check("both sides agree", b.text, a.text);
});

/* ── 3. a rejoin mid-sentence (auth resolving, a hot reload, a reconnect) ──── */
scenario("the session rejoins while you're mid-word:", () => {
  const relay = makeRelay(50);
  const a = makeClient("A", relay);
  relay.clients = [a];

  for (const ch of "I am Ashutosh") { a.type(ch); advance(90); }
  advance(DEBOUNCE_MS + 10);       // server now stores "I am Ashutosh"
  a.type(" ");                     // unsent — the server is one keystroke behind
  a.rejoin(relay.stored, relay.rev);          // prompt-initial arrives with the OLD text
  advance(2000);

  check("the unsent space is not rolled back", a.text, "I am Ashutosh ");
  check("and it reaches the server", relay.stored, "I am Ashutosh ");
});

/* ── 4. both typing at once — nobody's text may vanish outright ────────────── */
scenario("both people typing at the same time:", () => {
  const relay = makeRelay(50);
  const a = makeClient("A", relay);
  const b = makeClient("B", relay);
  relay.clients = [a, b];

  a.type("hello ");
  b.type("world ");
  advance(3000);

  check("they converge on one value", a.text, b.text);
  check("and it isn't empty", a.text.length > 0, true);
});

/* ── 5. an edit arriving just after you stop typing must still land ────────── */
scenario("a peer edits right after you stop typing, and you never type again:", () => {
  const relay = makeRelay(50);
  const a = makeClient("A", relay);
  const b = makeClient("B", relay);
  relay.clients = [a, b];

  a.type("mine");
  advance(DEBOUNCE_MS + 100);   // a's text reaches b; a has stopped
  b.type(" and theirs");        // b appends while a sits idle
  advance(5000);

  check("the idle side receives it rather than dropping it", a.text, b.text);
});

console.log(failures ? `\n${failures} check(s) FAILED` : "\nAll checks passed.");
process.exit(failures ? 1 : 0);
