import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    commonjsOptions: {
      include: [/node_modules/],
    },
  },
  server: {
    proxy: {
      // Proxy R2 game assets through same origin so iframe is same-origin
      // → keyboard event injection works for D-pad controls
      "/r2": {
        target: "https://pub-05996c159fb94c24a47d19984427a923.r2.dev",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/r2/, ""),
      },
    },
  },
});
