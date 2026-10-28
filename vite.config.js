import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    // Forward /api calls to FastAPI so the browser never hits a CORS wall in dev
    proxy: { "/api": { target: "http://localhost:8000", rewrite: (p) => p.replace(/^\/api/, "") } },
  },
  test: { environment: "jsdom", globals: true, setupFiles: "./src/setupTests.js" },
});
