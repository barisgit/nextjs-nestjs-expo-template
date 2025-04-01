// Directly import the flat config array from the base package
const baseConfig = require("@repo/eslint-config/node.js");

/** @type {import('eslint').Linter.Config[]} */
module.exports = [
  ...baseConfig,
  // Ignore generated files completely
  {
    ignores: ["src/@generated/**"],
  },
  // Add other backend-specific overrides below if needed
];
