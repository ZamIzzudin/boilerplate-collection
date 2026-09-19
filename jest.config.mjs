/**
 * @format
 * @type {import('jest').Config}
 */

const config = {
  testEnvironment: "jsdom",
  testEnvironmentOptions: {
    customExportConditions: [""],
  },
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  testMatch: [
    "**/__test__/**/*.[jt]s?(x)",
    "**/*.test.{ts,tsx}",
    "**/*.spec.{ts,tsx}",
  ],
  extensionsToTreatAsEsm: [".ts", ".tsx"],
  modulePathIgnorePatterns: [
    "<rootDir>/dist/",
    "<rootDir>/node_modules/",
  ],
  testPathIgnorePatterns: ["/node_modules/", "/dist/"],
  coverageDirectory: "coverage",
  coverageProvider: "v8",
  collectCoverageFrom: [
    "src/**/*.{js,ts,tsx,jsx}",
    "!**/*.d.ts",
    "!**/node_modules/**",
    "!**/coverage/**",
    "!**/dist/**",
    "!**/__test__/**",
    "!**/*.config.{js,ts,mjs}",
    "!**/index.{js,ts}",
    "!src/main.tsx",
    "!src/vite-env.d.ts",
  ],
  moduleNameMapper: {
    "^@/lib/config$": "<rootDir>/__mocks__/lib-config.ts",
    "\\.svg$": "<rootDir>/__mocks__/fileMock.js",
    "\\.(jpg|jpeg|png|gif|webp)$": "<rootDir>/__mocks__/fileMock.js",
    "^@/(.*)$": "<rootDir>/src/$1",
    "\\.(css|less|scss|sass)$": "<rootDir>/__mocks__/styleMock.js",
    "yet-another-react-lightbox$": "<rootDir>/__mocks__/yetAnotherReactLightbox.js",
    "yet-another-react-lightbox/styles.css": "<rootDir>/__mocks__/styleMock.js",
  },
  preset: "ts-jest",
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        useESM: true,
        tsconfig: {
          jsx: "react-jsx",
          esModuleInterop: true,
          allowSyntheticDefaultImports: true,
          module: "ES2020",
        },
      },
    ],
  },
  transformIgnorePatterns: ["/node_modules/(?!(yet-another-react-lightbox)/)"],
  moduleFileExtensions: ["ts", "tsx", "js", "jsx"],
  verbose: true,
  bail: false,
  maxWorkers: 2,
  globals: {
    "ts-jest": {
      isolatedModules: true,
    },
  },
};

export default config;
