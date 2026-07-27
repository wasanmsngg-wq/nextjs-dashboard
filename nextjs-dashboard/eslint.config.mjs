import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTypescript,
  globalIgnores([
    ".next/**",
    "node_modules/**",
    "playwright-report/**",
    "test-results/**",
  ]),
  {
    files: ["app/domain/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            "react",
            "react/*",
            "next",
            "next/*",
            "@supabase/*",
            "postgres",
            "@/app/lib/*",
            "@/app/ui/*",
          ],
        },
      ],
    },
  },
  {
    files: ["tests/**/*.{js,mjs,ts,tsx}"],
    rules: { "@next/next/no-assign-module-variable": "off" },
  },
]);
