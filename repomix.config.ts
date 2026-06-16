import { defineConfig } from "repomix";

/**
 * Repomix config for the `codebase` reference skill (`pnpm generate:repomix:skills`).
 * Compression is passed as a CLI flag (`--compress`), not here.
 */
export default defineConfig({
  output: {
    compress: true,
    removeComments: true,
    truncateBase64: true,
    style: "xml",
    removeEmptyLines: true,
  },
  ignore: {
    useGitignore: true,
    useDefaultPatterns: true,
    customPatterns: [
      // committed codegen (not gitignored)
      "packages/supabase/src/types.ts",
      "**/generated/**",
      "pnpm-lock.yaml",
      ".context/**",
      // never pack the skill into itself (recursive bloat)
      "skills/codebase/**",
      // tests add tokens without helping code comprehension
      "**/*.test.ts",
      "**/*.test.tsx",
      "**/*.spec.ts",
      "**/*.test.sql",
      "apps/platform/tests/**",
      // certs / private keys
      "**/*.pem",
      "**/certificates/**",
    ],
  },
  security: { enableSecurityCheck: true },
  tokenCount: { encoding: "o200k_base" },
});
