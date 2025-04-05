/** @type {import('jest').Config} */
module.exports = {
  preset: "ts-jest/presets/default-esm",
  testEnvironment: "node",
  roots: ["<rootDir>/src"],
  moduleFileExtensions: ["js", "json", "ts", "mjs"],
  extensionsToTreatAsEsm: [".ts"],
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        tsconfig: "tsconfig.json",
        useESM: true,
      },
    ],
  },
  moduleNameMapper: {
    "^@repo/db/(.*)$": "<rootDir>/../../packages/db/dist/$1",
    "^src/(.*)$": "<rootDir>/src/$1",
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
  collectCoverageFrom: ["src/**/*.(t|j)s"],
  coverageDirectory: "../coverage",
  testRegex: ".*\\.spec\\.ts$",
  transformIgnorePatterns: ["/node_modules/(?!(@repo))"],
};
