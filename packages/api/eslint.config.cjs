// packages/api/eslint.config.cjs
const baseConfig = require("@repo/eslint-config/node.js"); // Use the node base config

/** @type {import('eslint').Linter.Config[]} */
module.exports = [
  ...baseConfig,
  // Add API-specific overrides here using the flat config format if needed
];
