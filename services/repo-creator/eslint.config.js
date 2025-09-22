// services/repo-creator/eslint.config.js
import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      // why: keep console noise low in Lambda code
      "no-console": "warn"
    }
  }
];
