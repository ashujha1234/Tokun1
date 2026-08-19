/**
 * The seeding rule in PromptInput, and the feedback loop it used to sit inside.
 *
 *   node scripts/checkPromptSeeding.mjs
 *
 * This is the bug that ate trailing spaces with no collaboration session open at
 * all, so it is worth a test that fails loudly if either half comes back:
 *
 *   1. the optimiser page passed its LIVE context value as `initialText`, and
 *      PromptInput writes to that same context on a 400ms debounce — so the
 *      component's own output returned as its input on every keystroke;
 *   2. the seeding effect then ran `setText(initialText.trim())`, deleting the
 *      space you had just typed.
 *
 * Both rules are restated here. Keep them in step with the component and the
 * page — if they change there, change them here or this stops meaning anything.
 */

const DEBOUNCE_MS = 400;

/** PromptInput's seeding effect, as it now behaves. */
function makeEditor() {
  const e = { text: "", seeded: false, hasCleared: false };

  /* Runs whenever initialText / navInitialText / hasCleared change. */
  e.seedEffect = (initialText, navInitialText = "") => {
    if (e.hasCleared) return;
    if (e.seeded) return;
    // Blank-check with trim, seed the ORIGINAL.
    const candidate = initialText?.trim() ? initialText : navInitialText;
    if (!candidate) return;
    e.seeded = true;
    if (candidate !== e.text) e.text = candidate;
  };

  e.type = (chunk) => { e.text += chunk; };
  return e;
}

/** The old version, kept so the test can show what it did. */
function oldSeedEffect(editor, initialText, navInitialText = "") {
  if (editor.hasCleared) return;
  const candidate = (initialText && initialText.trim()) || navInitialText;
  if (!candidate) return;
  if (candidate !== editor.text) editor.text = candidate;
}

let failures = 0;
const check = (label, actual, expected) => {
  const ok = actual === expected;
  if (!ok) failures++;
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}`);
  if (!ok) console.log(`        got      ${JSON.stringify(actual)}\n        expected ${JSON.stringify(expected)}`);
};

console.log("the loop, reproduced (page feeds its live context value back in):");
{
  // What the old code did, so the regression is on the record.
  const old = makeEditor();
  old.text = "I am Ashutosh";
  let context = "I am Ashutosh";           // written by the debounce
  old.type(" ");                            // you press space
  context = old.text;                       // 400ms later: setOptimizerInput(text)
  oldSeedEffect(old, context);              // page re-renders → effect runs again
  check("OLD behaviour lost the trailing space", old.text, "I am Ashutosh");

  const now = makeEditor();
  now.seedEffect("I am Ashutosh");          // seeded once, on arrival
  now.type(" ");
  const ctx = now.text;                     // debounce writes it to context
  now.seedEffect(ctx);                      // even if the live value comes back…
  check("now the space survives", now.text, "I am Ashutosh ");
}

console.log("\nseeding still does its actual job:");
{
  const e = makeEditor();
  e.seedEffect("a prompt carried over from Smartgen");
  check("an empty box is filled from navigation state", e.text, "a prompt carried over from Smartgen");
}
{
  const e = makeEditor();
  e.seedEffect("", "from nav state");
  check("a blank initialText falls through to nav state", e.text, "from nav state");
}
{
  const e = makeEditor();
  e.seedEffect("   \n  ");
  check("whitespace-only seeds nothing", e.text, "");
}
{
  const e = makeEditor();
  e.seedEffect("  keep my leading and trailing spaces  ");
  check("what is seeded is not mangled", e.text, "  keep my leading and trailing spaces  ");
}
{
  const e = makeEditor();
  e.seedEffect("first");
  e.type(" and my own words");
  e.seedEffect("something else entirely");
  check("a later initialText cannot overwrite your typing", e.text, "first and my own words");
}
{
  const e = makeEditor();
  e.hasCleared = true;
  e.seedEffect("should not come back");
  check("Clear stays cleared", e.text, "");
}

console.log(failures ? `\n${failures} check(s) FAILED` : "\nAll checks passed.");
process.exit(failures ? 1 : 0);
