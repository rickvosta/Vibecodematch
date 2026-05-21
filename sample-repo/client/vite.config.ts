import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@game": path.resolve(__dirname, "src/game"),
      "@scenes": path.resolve(__dirname, "src/scenes"),
      "@constants": path.resolve(__dirname, "src/constants"),
    },
  },
  build: {
    target: "es2020",
    outDir: "dist",
  },
  server: {
    port: 3000,
  },
});
