/** @type {import('jest').Config} */
// eslint-disable-next-line
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/src"],
  moduleFileExtensions: ["js", "json", "ts"],
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        tsconfig: "tsconfig.json",
      },
    ],
  },
  collectCoverageFrom: ["src/**/*.(t|j)s"],
  coverageDirectory: "../coverage",
  testRegex: ".*\\.spec\\.ts$",
  moduleNameMapper: {
    "^@repo/db/(.*)$": "<rootDir>/../../packages/db/dist/$1",
    "^src/(.*)$": "<rootDir>/src/$1",
  },
};
