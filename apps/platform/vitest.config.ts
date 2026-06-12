import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const ROOT = fileURLToPath(new URL("./", import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      "~": ROOT,
      "server-only": path.join(ROOT, "test/server-only.ts"),
    },
  },
  test: {
    environment: "node",
    include: ["hooks/**/*.test.ts", "lib/**/*.test.ts"],
  },
});
