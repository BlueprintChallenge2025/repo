// services/repo-creator/eslint.config.js
import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default [
  // ignore non-TS build artifacts & legacy .cjs files
  { ignores: ["**/*.cjs", "**/node_modules/**", "**/dist/**"] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      "no-console": "warn"
    }
  }
];
