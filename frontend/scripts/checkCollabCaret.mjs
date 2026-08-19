/**
 * The two rules that decide whether a collaborator's edit disturbs your typing.
 *
 *   node scripts/checkCollabCaret.mjs
 *
 * Both live in PromptInput.tsx and both are pure, so they're restated here and
 * exercised directly — the alternative is two browsers and a stopwatch. Keep
 * them in step with the component: if the rules there change, change them here
 * too or this stops meaning anything.
 */

/* ── rule 1: prompt-initial seeds an EMPTY editor, never overwrites one ────── */
function seedFromInitial({ local, incoming }) {
  if (local.trim()) return { text: local, reason: "kept local" };
  return { text: incoming, reason: "seeded" };
}

/* ── rule 2: where the caret lands after a remote edit is applied ──────────── */
function caretAfterRemote({ before, incoming, start }) {
  let firstDiff = 0;
  const shortest = Math.min(before.length, incoming.length);
  while (firstDiff < shortest && before[firstDiff] === incoming[firstDiff]) firstDiff++;

  const delta = incoming.length - before.length;
  const shift = firstDiff < start ? delta : 0;
  return Math.max(0, Math.min(incoming.length, start + shift));
}

let failures = 0;
const check = (label, actual, expected) => {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  if (!ok) failures++;
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}`);
  if (!ok) console.log(`        got ${JSON.stringify(actual)}, expected ${JSON.stringify(expected)}`);
};

console.log("prompt-initial (the one that was eating your typing):");
check(
  "mid-sentence, server has an older copy → your text survives",
  seedFromInitial({ local: "i am ashutosh ", incoming: "i am ashutosh" }).text,
  "i am ashutosh ",
);
check(
  "a rejoin can't replace what you typed",
  seedFromInitial({ local: "i am ashutosh and i write prompts", incoming: "" }).text,
  "i am ashutosh and i write prompts",
);
check(
  "opening an invite link with an empty box → seeded from the session",
  seedFromInitial({ local: "", incoming: "the prompt they already wrote" }).text,
  "the prompt they already wrote",
);
check(
  "whitespace-only local counts as empty",
  seedFromInitial({ local: "   ", incoming: "their prompt" }).text,
  "their prompt",
);

console.log("\ncaret, when a collaborator's edit does land:");
// "i am |ashutosh"  — caret at 5, they append at the end.
check(
  "edit below the caret → caret does not move",
  caretAfterRemote({ before: "i am ashutosh", incoming: "i am ashutosh here", start: 5 }),
  5,
);
// "hello world|" — caret at 11, they insert 4 chars at the very start.
check(
  "edit above the caret → caret moves with the text",
  caretAfterRemote({ before: "hello world", incoming: "SAM hello world", start: 11 }),
  15,
);
check(
  "deletion above the caret → caret moves back by the same amount",
  caretAfterRemote({ before: "SAM hello world", incoming: "hello world", start: 15 }),
  11,
);
check(
  "identical text → caret untouched",
  caretAfterRemote({ before: "same text", incoming: "same text", start: 4 }),
  4,
);
check(
  "caret clamped inside the new text",
  caretAfterRemote({ before: "a long sentence here", incoming: "short", start: 20 }),
  5,
);

console.log(failures ? `\n${failures} check(s) FAILED` : "\nAll checks passed.");
process.exit(failures ? 1 : 0);
