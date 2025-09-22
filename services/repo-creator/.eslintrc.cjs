/* eslint-env node */
const { configs } = require('typescript-eslint');
module.exports = [
  ...configs.recommended,
  { languageOptions: { parserOptions: { ecmaVersion: 'latest', sourceType: 'module' } }, rules: { 'no-console': 'warn' } }
];
