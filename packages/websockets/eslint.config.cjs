const { createConfig } = require("@repo/eslint-config/index.cjs");

const config = createConfig({
  typescript: {
    tsconfigPath: "./tsconfig.json",
  },
});

module.exports = config;
