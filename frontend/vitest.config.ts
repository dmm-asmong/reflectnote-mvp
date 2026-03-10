import path from "node:path";
import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

const dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  esbuild: {
    jsx: "automatic",
  },
  resolve: {
    alias: {
      "@": path.resolve(dirname, "./src"),
      "@backend": path.resolve(dirname, "../backend/src"),
      "@ai": path.resolve(dirname, "../ai"),
      "server-only": path.resolve(dirname, "./test-shims/server-only.ts"),
    },
  },
  test: {
    environment: "node",
    environmentMatchGlobs: [["src/**/*.spec.tsx", "jsdom"]],
    include: ["../tests/**/*.spec.ts", "src/**/*.spec.tsx"],
    passWithNoTests: false,
  },
});
