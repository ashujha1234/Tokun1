
// import { defineConfig } from "vite";
// import react from "@vitejs/plugin-react-swc";
// import path from "path";

// // https://vitejs.dev/config/
// export default defineConfig(({ mode }) => ({
//   server: {
//     host: "::",
//      port: 5173,
//      proxy: {
//       "/api": { target: "https://tokunbackendcode-cjfvg7a6ekhddzcf.eastus-01.azurewebsites.net/", changeOrigin: true }
//     }
    
//   },
//   plugins: [react()],
//   resolve: {
//     alias: {
//       "@": path.resolve(__dirname, "./src"),
//     },
//   },
//   esbuild: {
//     drop: ['console', 'debugger'],
//   },
//   build: {
//     outDir: "dist",
//     emptyOutDir: true,
//     sourcemap: mode === "development",
//     rollupOptions: {
//       input: {
//         main: path.resolve(__dirname, "index.html")
//       }
//     }
//   }
// }));





import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

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
    // Route chunks are small once split; the vendor groups below are the only
    // genuinely large ones, and they're the ones we want cached across deploys.
    chunkSizeWarningLimit: 900,

    modulePreload: {
      // Vite's entry <link rel="modulepreload"> list reaches past the entry's
      // own static imports, so the 3D / video / charting chunks were being
      // fetched at high priority on every single page load even though nothing
      // on the first paint touches them. They stay reachable — the runtime
      // preload helper still fetches them when their dynamic import actually
      // runs — they just no longer compete with the first render.
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
        // Heavy third-party libs get their own long-lived chunks so that (a) a
        // page that never touches 3D/charts/video never downloads them, and
        // (b) shipping app code doesn't invalidate them in the browser cache.
        //
        // Every node_modules id is assigned deliberately, including the
        // catch-all at the bottom. Leaving some unassigned is not neutral:
        // Rollup then folds those leftovers (clsx, tailwind-merge, Vite's own
        // preload helper…) into whichever chunk it likes, and if that chunk is
        // vendor-three the entry ends up statically importing 961 kB of
        // three.js for the sake of one helper function.
        manualChunks(id) {
          // Virtual modules (Vite's preload helper, Rollup's CommonJS interop
          // shims) have no node_modules in their path, so without this they
          // land in whichever chunk Rollup picks first — which was
          // vendor-agora, giving vendor-react a static edge into 1.3 MB of
          // video SDK for the sake of `getDefaultExportFromCjs`.
          if (id.charCodeAt(0) === 0 || id.includes("commonjsHelpers") || id.includes("vite/preload-helper"))
            return "vendor-common";
          if (!id.includes("node_modules")) return;

          // drei drags in a whole ecosystem (three-stdlib, troika, camera-controls…).
          // Matching only `three/` left those in vendor-common, which then
          // imported vendor-three — dragging 728 kB of 3D onto every page.
          if (
            /node_modules\/(three|three-stdlib|three-mesh-bvh|@react-three\/[^/]+|@react-spring\/three|@monogrid\/gainmap-js|@mediapipe\/tasks-vision|camera-controls|maath|meshline|glsl-noise|detect-gpu|troika-[^/]+|suspend-react|tunnel-rat|stats-gl|stats\.js|hls\.js|react-composer|@use-gesture\/[^/]+)\//.test(
              id,
            )
          )
            return "vendor-three";
          if (/node_modules\/agora-rtc-sdk-ng\//.test(id)) return "vendor-agora";
          if (/node_modules\/(recharts|d3-[^/]+|victory-vendor|internmap|delaunator|robust-predicates)\//.test(id))
            return "vendor-charts";
          // Only jsPDF's own tree. Generic helpers it happens to depend on
          // (fflate, raf) are shared with three.js and others — grouping them
          // here would chain unrelated chunks together.
          if (/node_modules\/(jspdf|canvg|html2canvas|dompurify)\//.test(id)) return "vendor-pdf";
          if (/node_modules\/framer-motion\//.test(id)) return "vendor-motion";
          if (/node_modules\/(@radix-ui|cmdk|vaul|embla-carousel[^/]*)\//.test(id)) return "vendor-ui";
          if (/node_modules\/(react|react-dom|react-router|react-router-dom|scheduler)\//.test(id))
            return "vendor-react";

          // Icon packs are one module per icon. Left to Rollup, an icon used
          // only by the admin dashboard ends up inside the admin chunk; forced
          // into vendor-common, every icon in the app would download on the
          // landing page. So these stay unassigned on purpose.
          if (/node_modules\/(lucide-react|react-icons)\//.test(id)) return;

          return "vendor-common";
        },
      },
    },
  },
}));










