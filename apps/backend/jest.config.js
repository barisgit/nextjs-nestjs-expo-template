/** @type {import('jest').Config} */
// eslint-disable-next-line
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/src"],
  moduleFileExtensions: ["js", "json", "ts"],
  transform: {
    "^.+\\.(t|j)s$": "ts-jest",
  },
  collectCoverageFrom: ["**/*.(t|j)s"],
  coverageDirectory: "../coverage",
  testRegex: ".*\\.spec\\.ts$",
  moduleNameMapper: {
    "^src/(.*)$": "<rootDir>/src/$1",
  },
};
