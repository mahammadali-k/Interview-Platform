import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        // vendor chunks cache independently from the app code
        manualChunks(id) {
          if (!id.includes("node_modules")) return;
          if (id.includes("@stream-io")) return "stream-video";
          if (id.includes("stream-chat")) return "stream-chat";
          if (id.includes("@clerk")) return "clerk";
          if (/react-router|react-dom|\/react\/|scheduler/.test(id)) return "react";
        },
      },
    },
  },
});
