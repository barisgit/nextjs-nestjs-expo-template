// Import the base config from the shared eslint-config package
const baseConfig = require("@repo/eslint-config/node.js");

/** @type {import('eslint').Linter.FlatConfig[]} */
module.exports = [
  ...baseConfig,
  {
    files: ["src/**/*.ts"],
    rules: {
      // Disable specific type-checking rules that are too strict for socket.io
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unsafe-argument": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-unnecessary-type-assertion": "off",
    },
  },
  // Ignore generated files if any
  {
    ignores: ["dist/**", ".turbo/**"],
  },
];
