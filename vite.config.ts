import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3002,
  },
  resolve: {
    alias: {
      "@": "/src",
      "@assets": "/src/assets",
      "@components": "/src/components",
      "@apis": "/src/apis",
      "@pages": "/src/pages",
      "@utils": "/src/utils",
      "@styles": "/src/styles",
    },
  },
});
