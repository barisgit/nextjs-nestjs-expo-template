// packages/ui/eslint.config.cjs
// Directly import the flat config array from the base package
const baseConfig = require("@repo/eslint-config/react.js");

/** @type {import('eslint').Linter.Config[]} */
module.exports = [
  ...baseConfig,
  // Add UI-package-specific overrides here using the flat config format
  // Example: Maybe relaxing a rule for storybook files
  // {
  //   files: ["stories/**/*.tsx"],
  //   rules: {
  //     "some-rule-to-relax": "warn"
  //   }
  // }
];
