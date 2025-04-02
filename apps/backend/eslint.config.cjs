// Directly import the flat config array from the base package
const baseConfig = require("@repo/eslint-config/node.js");
const importPlugin = require("eslint-plugin-import"); // Import the plugin

/** @type {import('eslint').Linter.Config[]} */
module.exports = [
  ...baseConfig,
  // Add backend-specific rules and settings
  {
    files: ["src/**/*.ts"], // Apply only to TypeScript files in src
    plugins: {
      import: importPlugin, // Register the plugin
    },
    rules: {
      // Disable the faulty import/extensions rule as it conflicts with ESM .js requirement
      "import/extensions": "off",
      /* Original attempt:
      "import/extensions": [
        "error",
        "always", // Require extensions for all relative imports.
        { ignorePackages: true }, // Ignore imports from node_modules.
      ],
      */
    },
    settings: {
      // Try explicitly defining both resolvers
      "import/resolver": {
        typescript: {}, // Add TS resolver back (empty options object is often sufficient)
        node: true,
      },
    },
  },
  // Ignore generated files completely
  {
    ignores: ["src/@generated/**"],
  },
  // Add other backend-specific overrides below if needed
];
