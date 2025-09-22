/* eslint-env node */
module.exports = {
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint"],
  extends: ["eslint:recommended","plugin:@typescript-eslint/recommended"],
  parserOptions: { ecmaVersion: "latest", sourceType: "module" },
  rules: { "no-console": "warn" }
};
