import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

/* Two older copies of this config used to sit above, commented out. They were
   removed: they were near-identical to this one, so reading the file it was not
   obvious which block was actually live — and one of them still contained the
   manualChunks rule that caused the blank-page bug documented below. Git has
   the history if it's ever wanted. */

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
        secure: false,
      },
    },
  },

  plugins: [react()],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  esbuild: {
    drop: ["console", "debugger"],
  },

  build: {
    outDir: "dist",
    emptyOutDir: true,
    sourcemap: mode === "development",
    chunkSizeWarningLimit: 900,

    modulePreload: {
      // Vite's entry <link rel="modulepreload"> list reaches past the entry's
      // own static imports, so the 3D / video / charting chunks were fetched at
      // high priority on every page load even though nothing on the first paint
      // touches them. They stay reachable — the runtime preload helper still
      // fetches them when their dynamic import runs — they just no longer
      // compete with the first render.
      resolveDependencies(_filename, deps, { hostType }) {
        if (hostType !== "html") return deps;
        return deps.filter((dep) => !/vendor-(three|agora|charts|pdf)-/.test(dep));
      },
    },

    rollupOptions: {
      input: {
        main: path.resolve(__dirname, "index.html"),
      },
      output: {
        /* Heavy third-party libs get their own long-lived chunks so a page that
           never touches 3D/charts/video never downloads them, and shipping app
           code doesn't invalidate them in the browser cache.

           ── The blank-page bug ──────────────────────────────────────────────

           This rule set previously began with:

               if (id.charCodeAt(0) === 0 || id.includes("commonjsHelpers") || …)
                 return "vendor-common";

           which produced, on load, a completely white page and:

               Uncaught TypeError: Cannot set properties of undefined
                                   (setting 'Children')

           React ships as CommonJS. Rollup's interop turns that into two pieces:
           a virtual `\0…?commonjs-module` proxy that CREATES the `exports`
           object, plus helper functions (getDefaultExportFromCjs and friends).
           React's real body then runs `exports.Children = …` against them.

           Sending all of that to vendor-common put React's body in one chunk and
           the machinery it writes into in another — so vendor-react imported
           vendor-common, while vendor-common (full of React-consuming libs)
           imported vendor-react. An ES module cycle. One side runs against
           bindings the other hasn't initialised, React's body reached
           `exports.Children` with `exports` still undefined, and the app died
           before rendering anything.

           The invariant that prevents it: VENDOR-REACT MUST BE A LEAF. Imported
           by everything, importing nothing. Two rules enforce that —

             1. virtual ids resolve back to the real file they belong to, so a
                package's interop proxy is never separated from the package;
             2. the CJS helpers and React core live together, and react-router
                does NOT (it pulls @remix-run/router out of vendor-common, which
                would hand vendor-react an outbound edge and rebuild the cycle).

           If you add anything to vendor-react, re-check that the built
           vendor-react-*.js has no `from"./vendor-…"` import at the top. */
        manualChunks(id) {
          const realId = id.replace(/^\0/, "").replace(/\?commonjs-\w+$/, "");

          // CJS interop helpers belong WITH React — see (2) above.
          if (realId.includes("commonjsHelpers") || realId.includes("vite/preload-helper"))
            return "vendor-react";
          if (!realId.includes("node_modules")) return;

          // React core only. Nothing that has its own dependencies.
          if (/node_modules\/(react-dom|react|scheduler)\//.test(realId)) return "vendor-react";

          // drei drags in a whole ecosystem (three-stdlib, troika, camera-controls…).
          // Matching only `three/` left those in vendor-common, which then
          // imported vendor-three — dragging 3D onto every page.
          if (
            /node_modules\/(three|three-stdlib|three-mesh-bvh|@react-three\/[^/]+|@react-spring\/three|@monogrid\/gainmap-js|@mediapipe\/tasks-vision|camera-controls|maath|meshline|glsl-noise|detect-gpu|troika-[^/]+|suspend-react|tunnel-rat|stats-gl|stats\.js|hls\.js|react-composer|@use-gesture\/[^/]+)\//.test(
              realId,
            )
          )
            return "vendor-three";

          if (/node_modules\/agora-rtc-sdk-ng\//.test(realId)) return "vendor-agora";

          if (
            /node_modules\/(recharts|d3-[^/]+|victory-vendor|internmap|delaunator|robust-predicates)\//.test(
              realId,
            )
          )
            return "vendor-charts";

          // Only jsPDF's own tree. Generic helpers it depends on (fflate, raf)
          // are shared with three.js — grouping them here chains unrelated chunks.
          if (/node_modules\/(jspdf|canvg|html2canvas|dompurify)\//.test(realId)) return "vendor-pdf";

          if (/node_modules\/framer-motion\//.test(realId)) return "vendor-motion";

          if (/node_modules\/(@radix-ui|cmdk|vaul|embla-carousel[^/]*)\//.test(realId))
            return "vendor-ui";

          /* Icon packs are one module per icon. Left to Rollup, an icon used only
             by the admin dashboard ends up inside the admin chunk; forced into
             vendor-common, every icon in the app downloads on the landing page.
             So these stay unassigned on purpose. */
          if (/node_modules\/(lucide-react|react-icons)\//.test(realId)) return;

          /* Everything else, deliberately. Leaving ids unassigned is not
             neutral: Rollup folds the leftovers into whichever chunk it likes,
             and if that chunk is vendor-three the entry statically imports
             ~900 kB of 3D for the sake of one helper function. */
          return "vendor-common";
        },
      },
    },
  },
}));
