/** @type {import('jest').Config} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  rootDir: ".",
  testMatch: ["<rootDir>/tests/**/*.test.ts"],
  moduleNameMapper: {
    "^@bookshelf/shared$": "<rootDir>/../../packages/shared/src/index.ts"
  },
  collectCoverageFrom: [
    "src/**/*.ts",
    "!src/index.ts"
  ],
  coverageReporters: ["text", "lcov"],
  globals: {
    "ts-jest": {
      tsconfig: {
        esModuleInterop: true,
        resolveJsonModule: true,
        strict: true,
        paths: {
          "@bookshelf/shared": ["../../packages/shared/src"]
        }
      }
    }
  }
};