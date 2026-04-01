
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
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, "index.html"),
      },
    },
  },
}));