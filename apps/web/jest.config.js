module.exports = {
  testEnvironment: "jest-environment-jsdom",
  transform: {
    "^.+\\.(js|jsx|ts|tsx)$": "babel-jest",
  },
  moduleNameMapper: {
    "^@repo/ui/(.*)$": "<rootDir>/../../packages/ui/src/$1",
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",
  },
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  transformIgnorePatterns: ["/node_modules/(?!(@repo/ui)/)"],
  testPathIgnorePatterns: [
    "<rootDir>/tests/",
    "<rootDir>/tests-examples/",
    ".*\\.spec\\.ts$",
  ],
};
