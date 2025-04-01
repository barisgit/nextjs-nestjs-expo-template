// packages/ui/eslint.config.cjs
// Directly import the flat config array from the base package
const baseConfig = require("@repo/eslint-config/react.js");

/** @type {import('eslint').Linter.Config[]} */
module.exports = [
  ...baseConfig,
  // Add UI-package-specific overrides here using the flat config format
  {
    // Disable Next.js specific rule about linking to pages since this is a library
    files: ["src/**/*.ts?(x)"], // Apply only to ts/tsx files in src
    rules: {
      "@next/next/no-html-link-for-pages": "off",
    },
  },
];
