import { defineConfig, globalIgnores } from "eslint/config";
import typescriptEslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";

export default defineConfig([
  {
    plugins: {
      "@typescript-eslint": typescriptEslint,
    },
    languageOptions: {
      parser: tsParser,
      ecmaVersion: 6,
      sourceType: "module",
    },
    rules: {
      "@typescript-eslint/naming-convention": "off",
      "no-throw-literal": "warn",
      semi: "off",
    },
  },
  globalIgnores(["inject/**/*", "out/**/*"]),
]);
