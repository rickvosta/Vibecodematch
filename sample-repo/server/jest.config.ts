import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/src"],
  moduleNameMapper: {
    "^@vibecode/shared$": "<rootDir>/../shared/src/index.ts",
  },
  globals: {
    "ts-jest": {
      tsconfig: {
        experimentalDecorators: true,
        emitDecoratorMetadata: true,
      },
    },
  },
};

export default config;
