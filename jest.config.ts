import type { Config } from "jest";
// Load the tsconfig paths for module resolution
// import { compilerOptions } from "./tsconfig.json"; // Adjust path if your tsconfig is located elsewhere

const config: Config = {
  // Make this a monorepo-aware Jest configuration
  projects: [
    // Individual package configurations
    "<rootDir>/apps/web/jest.config.js",
    // Add more package-specific Jest configs as needed
    "<rootDir>/apps/mobile/jest.config.js",
    // "<rootDir>/packages/ui/jest.config.js",
  ],
  // Global settings (used as fallbacks if not specified in project configs)
  preset: "ts-jest",
  testEnvironment: "jsdom",
  verbose: true,
  // Automatically clear mock calls, instances, contexts and results before every test
  clearMocks: true,
  // Indicates whether the coverage information should be collected while executing the test
  collectCoverage: true,
  // The directory where Jest should output its coverage files
  coverageDirectory: "coverage",
  // An array of regexp pattern strings used to skip coverage collection
  coveragePathIgnorePatterns: ["/node_modules/"],
  // Indicates which provider should be used to instrument code for coverage
  coverageProvider: "v8",
  // A list of paths to modules that run some code to configure or set up the testing framework before each test
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  moduleNameMapper: {
    // Handle CSS imports (if you use them)
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",
    // Handle image imports
    // https://jestjs.io/docs/webpack#handling-static-assets
    "\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$":
      "<rootDir>/__mocks__/fileMock.js", // You might need to create this mock file
    // Force module uuid to resolve with the CJS entry point, because Jest does not support package.json.exports. See https://github.com/uuidjs/uuid/issues/451
    uuid: require.resolve("uuid"),
    // Map specific monorepo package aliases (adjust paths based on your structure)
    "^@repo/backend/(.*)$": "<rootDir>/apps/backend/src/$1",
    "^@repo/ui/(.*)$": "<rootDir>/packages/ui/src/$1",
    "^@/(.*)$": "<rootDir>/apps/web/src/$1", // Map the web app's internal alias
  },
  // The root directory that Jest should scan for tests and modules within
  // <rootDir> is the root of the monorepo
  // roots: ['<rootDir>/apps/web'], // Focus tests on the web app initially if desired

  // Test spec file resolution pattern
  // Matches parent folder `__tests__` and filename
  // should contain `test` or `spec`.
  testRegex: "(/__tests__/.*|(\\.|/)(test|spec))\\.(jsx?|tsx?)$",

  // Transform files with ts-jest
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        // Let each project use its own tsconfig
      },
    ],
  },
  // An array of regexp pattern strings that are matched against all source file paths, matched files will skip transformation
  transformIgnorePatterns: ["/node_modules/", "\\.pnp\\.[^/]+$"],
};

export default config;
