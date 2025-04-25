import { config } from "@repo/eslint-config/base.js";
import globals from "globals";

/** @type {import("eslint").Linter.Config[]} */
export default [
  ...config,
  // Add backend-specific rules and settings
  {
    files: ["src/**/*.ts"], // Apply only to TypeScript files in src
    // Settings for import/resolver were in the old config, but the import plugin
    // setup needs to be confirmed for the new flat config structure.
    // The `import/extensions` rule is also kept off for now.
    rules: {
      "import/extensions": "off",
    },
    // settings: {
    //   "import/resolver": {
    //     typescript: {},
    //     node: true,
    //   },
    // },
  },
  // Configuration for test files
  {
    files: ["src/**/*.spec.ts", "src/**/*.test.ts"],
    languageOptions: {
      globals: {
        ...globals.jest, // Add Jest globals
        ...globals.node, // Add Node.js globals
        // Explicitly add common Jest globals if needed (globals.jest should cover these)
        // jest: "readonly",
        // expect: "readonly",
        // describe: "readonly",
        // it: "readonly",
        // beforeEach: "readonly",
        // afterEach: "readonly",
        // beforeAll: "readonly",
        // afterAll: "readonly",
      },
    },
    rules: {
      // Rules for test files - disable some strict typescript checks for tests
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-unsafe-return": "off",
      "@typescript-eslint/no-unsafe-call": "off",
      "@typescript-eslint/no-unsafe-argument": "off",
      "@typescript-eslint/unbound-method": "off", // Avoid issues with testing class methods
      // Allow common test patterns
      "@typescript-eslint/no-empty-function": "off",
      // Disable rules that often conflict in tests
      "no-undef": "off", // Handled by globals usually, but can be noisy
    },
  },
  // Ignore generated files completely
  {
    ignores: ["src/@generated/**", "dist/**"], // Added dist/** from base config for clarity
  },
  // Add other backend-specific overrides below if needed
];
