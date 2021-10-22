/** @type {import('@ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: "ts-jest",
  roots: ["<rootDir>/src"],
  modulePaths: ["src"],
  testEnvironment: "jsdom",
  transform: { "^.+\\.(ts|tsx)$": "ts-jest" },
  testMatch: [
    "**/__tests__/**/?(*.)+(spec|test).+(ts|tsx|js)",
    "**/?(*.)+(spec|test).+(ts|tsx|js)",
  ],
  setupFilesAfterEnv : ["./jest-setup.ts"],
};
