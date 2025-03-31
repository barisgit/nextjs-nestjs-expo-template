/** @type {import('eslint').Linter.Config} */
module.exports = {
  root: true,
  extends: ["@repo/eslint-config/base.js"],
  // You might want to add React-specific overrides here later
  // or create a dedicated 'react-library.js' config in @repo/eslint-config
};
