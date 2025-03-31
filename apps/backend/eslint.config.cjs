// Directly import the flat config array from the base package
const baseConfig = require("@repo/eslint-config/node.js");

/** @type {import('eslint').Linter.Config[]} */
module.exports = [
  ...baseConfig,
  // Add backend-specific overrides here using the flat config format
  // Example:
  // {
  //   files: ["src/specific-backend-folder/**/*.ts"],
  //   rules: {
  //     "no-console": "warn"
  //   }
  // }
];
