/**
 * Exercises the collab room membership rules with real socket.io clients.
 *
 *   node scripts/checkCollabRoom.js
 *
 * The handlers in index.js are closures inside io.on("connection"), so they
 * can't be imported. This mounts the SAME logic on a throwaway server on a spare
 * port and drives it with real clients — so what's checked is the behaviour
 * (dedup per person, leave, hard disconnect, end-session teardown), not the
 * literal source. Keep the two in step: if the rules in index.js change, change
 * them here too or this stops meaning anything.
 *
 * Touches no database and no real port.
 */

const http = require("http");
const path = require("path");
const { Server } = require("socket.io");

/* socket.io-client is a FRONTEND dependency — the browser is the only thing that
   normally connects to these sockets, so the server has no reason to ship it.
   Resolved from there rather than added to the server's package.json for the
   sake of one script. */
const { io: connect } = (() => {
  try {
    return require("socket.io-client");
  } catch {
    return require(path.join(__dirname, "../../frontend/node_modules/socket.io-client"));
  }
})();

const PORT = 45917;

/* ── the logic under test, mirroring server/index.js ───────────────────────── */
const collabRooms = new Map();

const peersOf = (sessionId) => {
  const members = collabRooms.get(String(sessionId));
  if (!members) return [];
  const byUser = new Map();
  for (const info of members.values()) {
    const key = info.userId || `socket:${info.socketId}`;
    if (!byUser.has(key)) byUser.set(key, { userId: info.userId, name: info.name });
  }
  return [...byUser.values()];
};

function mount(io) {
  const broadcastPeers = (sessionId) => {
    const participants = peersOf(sessionId);
    io.to(String(sessionId)).emit("session-peers", {
      sessionId,
      count: participants.length,
      participants,
    });
  };

  io.on("connection", (socket) => {
    socket.on("join-session", ({ sessionId, userId, name }) => {
      socket.join(String(sessionId));
      if (!collabRooms.has(String(sessionId))) collabRooms.set(String(sessionId), new Map());
      collabRooms.get(String(sessionId)).set(socket.id, {
        socketId: socket.id,
        userId: userId ? String(userId) : null,
        name: name || "Someone",
      });
      socket.to(String(sessionId)).emit("user-joined", { userId, name });
      broadcastPeers(sessionId);
    });

    socket.on("leave-session", ({ sessionId }) => {
      socket.leave(String(sessionId));
      collabRooms.get(String(sessionId))?.delete(socket.id);
      broadcastPeers(sessionId);
    });

    socket.on("end-session", ({ sessionId, userId }) => {
      io.to(String(sessionId)).emit("session-ended", { sessionId, endedBy: userId });
      io.in(String(sessionId)).socketsLeave(String(sessionId));
      collabRooms.delete(String(sessionId));
    });

    socket.on("prompt-optimized", ({ sessionId, name, result }) => {
      socket.to(String(sessionId)).emit("prompt-optimized", { sessionId, name, result });
    });

    socket.on("disconnect", () => {
      for (const [sessionId, members] of collabRooms) {
        if (!members.delete(socket.id)) continue;
        if (members.size === 0) {
          collabRooms.delete(sessionId);
          continue;
        }
        broadcastPeers(sessionId);
      }
    });
  });
}

/* ── harness ──────────────────────────────────────────────────────────────── */
let failures = 0;
const check = (label, actual, expected) => {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  const ok = a === e;
  if (!ok) failures++;
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}`);
  if (!ok) console.log(`        got      ${a}\n        expected ${e}`);
};

/** Resolves with the next payload of `event`, or rejects if none arrives. */
const next = (sock, event, ms = 2000) =>
  new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`timed out waiting for "${event}"`)), ms);
    sock.once(event, (payload) => {
      clearTimeout(timer);
      resolve(payload);
    });
  });

/** Resolves true if `event` does NOT arrive within the window. */
const silent = (sock, event, ms = 400) =>
  new Promise((resolve) => {
    let fired = false;
    const onEvent = () => { fired = true; };
    sock.once(event, onEvent);
    setTimeout(() => {
      sock.off(event, onEvent);
      resolve(!fired);
    }, ms);
  });

const client = () => connect(`http://localhost:${PORT}`, { transports: ["websocket"] });
const names = (payload) => (payload.participants || []).map((p) => p.name);

(async () => {
  const server = http.createServer();
  const io = new Server(server, { cors: { origin: "*" } });
  mount(io);
  await new Promise((r) => server.listen(PORT, r));

  const S = "session-under-test";
  const ashutosh = client();
  const jayalakshmi = client();
  const secondTab = client();

  try {
    console.log("one person joins:");
    let peers = next(ashutosh, "session-peers");
    ashutosh.emit("join-session", { sessionId: S, userId: "u1", name: "Ashutosh" });
    let p = await peers;
    check("sees only themselves", names(p), ["Ashutosh"]);
    check("count is 1, so the session is not yet active", p.count, 1);

    console.log("\nsecond person joins:");
    const joined = next(ashutosh, "user-joined");
    peers = next(ashutosh, "session-peers");
    jayalakshmi.emit("join-session", { sessionId: S, userId: "u2", name: "Jayalakshmi" });
    check("the first person is told who arrived", (await joined).name, "Jayalakshmi");
    p = await peers;
    check("both names are listed", names(p), ["Ashutosh", "Jayalakshmi"]);
    check("count is 2, so the session goes active", p.count, 2);

    console.log("\nthe same person opens a second tab:");
    peers = next(ashutosh, "session-peers");
    secondTab.emit("join-session", { sessionId: S, userId: "u1", name: "Ashutosh" });
    p = await peers;
    check("they are still one participant, not two", names(p), ["Ashutosh", "Jayalakshmi"]);
    check("count stays 2", p.count, 2);

    console.log("\nan optimised result is shared:");
    const optimized = next(jayalakshmi, "prompt-optimized");
    ashutosh.emit("prompt-optimized", {
      sessionId: S,
      name: "Ashutosh",
      result: { text: "shorter prompt", tokens: 12, words: 2 },
    });
    const got = await optimized;
    check("the other side receives the result", got.result.text, "shorter prompt");
    check("and who ran it", got.name, "Ashutosh");

    console.log("\nsomeone's tab is closed without leaving (hard disconnect):");
    peers = next(ashutosh, "session-peers");
    jayalakshmi.close();
    p = await peers;
    check("they drop out of the list", names(p), ["Ashutosh"]);
    check("count is back to 1", p.count, 1);

    console.log("\nend session:");
    const endedForOwner = next(ashutosh, "session-ended");
    const endedForOther = next(secondTab, "session-ended");
    ashutosh.emit("end-session", { sessionId: S, userId: "u1" });
    check("the person who ended it is told", (await endedForOwner).sessionId, S);
    check("so is everyone else", (await endedForOther).sessionId, S);
    check("the room is forgotten", collabRooms.has(S), false);

    // Nothing should still be broadcasting into a session that no longer exists.
    check("no stray peers event afterwards", await silent(ashutosh, "session-peers"), true);
  } catch (err) {
    failures++;
    console.error("\nERROR:", err.message);
  } finally {
    [ashutosh, jayalakshmi, secondTab].forEach((c) => c.close());
    io.close();
    server.close();
    console.log(failures ? `\n${failures} check(s) FAILED` : "\nAll checks passed.");
    process.exit(failures ? 1 : 0);
  }
})();
