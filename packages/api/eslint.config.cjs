// packages/api/eslint.config.cjs
const { FlatCompat } = require("@eslint/eslintrc");
const path = require("path");
const js = require("@eslint/js");
const baseConfig = require("@repo/eslint-config/node.js"); // Use the node base config

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended, // Needed because baseConfig extends :recommended
});

/** @type {import('eslint').Linter.Config[]} */
module.exports = [
  ...compat.config(baseConfig),
  // Add API-specific overrides here using the flat config format if needed
];
