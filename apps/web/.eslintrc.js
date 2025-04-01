module.exports = {
  root: true,
  extends: ["@repo/eslint-config/next.js"],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: ["./tsconfig.json"],
    tsconfigRootDir: __dirname,
  },
  settings: {
    "import/resolver": {
      typescript: {
        project: "tsconfig.json",
        alwaysTryTypes: true,
      },
    },
  },
  overrides: [
    {
      files: ["*.js", "*.jsx", "*.mjs", "*.cjs"],
      extends: ["plugin:@typescript-eslint/disable-type-checked"],
    },
  ],
};
