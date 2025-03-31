// packages/eslint-config/node.js
const { resolve } = require("node:path");
const js = require("@eslint/js");
const typescriptEslint = require("@typescript-eslint/eslint-plugin");
const typescriptParser = require("@typescript-eslint/parser");
const importPlugin = require("eslint-plugin-import");
const turboPlugin = require("eslint-plugin-turbo");

// Resolve tsconfig relative to the package consuming this config
const project = resolve(process.cwd(), "tsconfig.json");

module.exports = [
  js.configs.recommended, // Start with ESLint recommended
  {
    // TypeScript specific config object
    files: ["**/*.ts"],
    plugins: {
      "@typescript-eslint": typescriptEslint,
      import: importPlugin,
      turbo: turboPlugin,
    },
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        project: true, // Assumes tsconfig.json in consumer package root
      },
    },
    settings: {
      "import/resolver": {
        typescript: true,
        node: true,
      },
    },
    rules: {
      ...typescriptEslint.configs["recommended-type-checked"].rules, // Or other TS configs
      ...importPlugin.configs.typescript.rules,
      ...turboPlugin.configs.recommended.rules,
      // Add specific Vercel-inspired overrides here
      "import/no-default-export": "off",
      "@typescript-eslint/dot-notation": "off",
      "@typescript-eslint/no-empty-function": "off",
    },
  },
  {
    // Global ignores
    ignores: ["node_modules/", "dist/", ".eslintrc.js", "eslint.config.js"],
  },
];
