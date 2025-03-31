// apps/mobile/eslint.config.cjs
// Directly import the flat config array from the base package
const baseConfig = require("@repo/eslint-config/next.js");

/** @type {import('eslint').Linter.Config[]} */
module.exports = [
  ...baseConfig,
  // Add mobile/React Native specific overrides here using the flat config format
  // Example for React Native:
  // {
  //   files: ["src/**/*.tsx"], // Or specific mobile files
  //   languageOptions: {
  //     globals: {
  //       ...require("globals").native // If using react-native globals
  //     }
  //   },
  //   rules: {
  //     // "some-react-native-rule": "error"
  //   }
  // }
];
