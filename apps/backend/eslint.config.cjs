// Directly import the flat config array from the base package
const baseConfig = require("@repo/eslint-config/node.js");
const importPlugin = require("eslint-plugin-import"); // Import the plugin
const globals = require("globals"); // For defining global variables

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
  // Configuration for test files
  {
    files: ["src/**/*.spec.ts", "src/**/*.test.ts"],
    languageOptions: {
      globals: {
        ...globals.jest, // Add Jest globals
        ...globals.node, // Add Node.js globals
        jest: "readonly", // Explicitly add jest global
        expect: "readonly",
        describe: "readonly",
        it: "readonly",
        beforeEach: "readonly",
        afterEach: "readonly",
        beforeAll: "readonly",
        afterAll: "readonly",
      },
    },
    rules: {
      // Rules for test files - disable all strict typescript checks for tests
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-unsafe-return": "off",
      "@typescript-eslint/no-unsafe-call": "off",
      "@typescript-eslint/no-unsafe-argument": "off",
      "@typescript-eslint/unbound-method": "off",
      "@typescript-eslint/await-thenable": "off",
      "@typescript-eslint/no-floating-promises": "off",
      "@typescript-eslint/no-misused-promises": "off",
      "@typescript-eslint/no-empty-function": "off",
      "no-undef": "off",
    },
  },
  // Ignore generated files completely
  {
    ignores: ["src/@generated/**"],
  },
  // Add other backend-specific overrides below if needed
];
