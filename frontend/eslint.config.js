import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

/* Lint config, tuned so that ERROR means "this is a bug" and WARN means "this is
 * debt".
 *
 * That distinction is the entire point, because CI now fails the build on
 * errors (see .github/workflows). A gate is only worth having if a red build
 * means something is actually broken; a gate that fires on 757 `any`s teaches
 * everyone to ignore it, and then it catches nothing.
 *
 * Two things had to happen before this file could exist at all:
 *
 *   1. ESLint did not run. eslint 9.39 against typescript-eslint 8.11 crashed
 *      on the first file with "Cannot read properties of undefined (reading
 *      'allowShortCircuit')" — the shared no-unused-expressions base rule
 *      changed shape between them. Upgrading typescript-eslint fixed it. This
 *      is why "lint gate in CI" was never ticked off: linting was broken, and
 *      nothing said so.
 *
 *   2. A real bug came out of the first clean run — nine
 *      react-hooks/rules-of-hooks violations in PurchaseDialog.tsx, all from a
 *      single early return placed above the hooks. See the comment there.
 *
 * The current state is 0 errors and ~830 warnings. The warnings are real work
 * and are not hidden; they are just not a reason to block a deploy.
 */
export default tseslint.config(
  {
    /* public/ holds files served verbatim rather than compiled — head-boot.js
       is deliberately old-style browser script, and linting it as if it were
       app source produces noise about the exact things that make it correct. */
    ignores: ["dist", "public", "node_modules"],
  },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,

      /* ── Errors: things that are wrong ────────────────────────────────── */

      /* Left at error deliberately, and the reason is PurchaseDialog.tsx. A
         conditional hook is not a style preference — React matches hook state
         positionally across renders, so a component that runs nine hooks on one
         render and zero on the next throws and takes its subtree down. This
         rule is the only automated thing that catches it. */
      "react-hooks/rules-of-hooks": "error",

      /* ── Warnings: things that are debt ───────────────────────────────── */

      /* 757 of these. `strict`, `noImplicitAny` and `strictNullChecks` are all
         false in tsconfig, so `any` is the water this codebase swims in.
         Turning them into build failures would mean typing the entire app
         before the next deploy. Left visible so the count can come down. */
      "@typescript-eslint/no-explicit-any": "warn",

      /* Mostly `catch {}` where the file explains, in a comment right above it,
         why the failure is deliberately swallowed — telemetry that must never
         throw, best-effort cleanup, offline tolerance. allowEmptyCatch turns
         those from errors into nothing at all, which is correct; the remaining
         empty blocks stay visible as warnings. */
      "no-empty": ["warn", { allowEmptyCatch: true }],

      /* `next.has(id) ? next.delete(id) : next.add(id)` and
         `cond && doThing()` are the idiom used throughout this codebase, and
         both branches have real effects. Permitted rather than rewritten across
         eight files; the rule still catches an expression that does nothing at
         all. */
      "@typescript-eslint/no-unused-expressions": [
        "warn",
        { allowShortCircuit: true, allowTernary: true },
      ],

      /* `{false && (<div>…</div>)}` in PromptMarketplacePage is an intentional,
         commented dead-code guard keeping an old design available rather than
         deleting it. Warn so genuinely constant conditions are still surfaced. */
      "no-constant-binary-expression": "warn",

      /* Style-level, and none of the current instances is a defect. */
      "no-var": "warn",
      "no-useless-escape": "warn",
      "no-misleading-character-class": "warn",
      "@typescript-eslint/no-require-imports": "warn",
      "@typescript-eslint/no-empty-object-type": "warn",

      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],

      /* Off, not warn: with noUnusedLocals false in tsconfig this fires on
         hundreds of intentionally-destructured values. */
      "@typescript-eslint/no-unused-vars": "off",
    },
  }
);
