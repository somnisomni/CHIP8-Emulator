import type { Config } from "jest";
import { createDefaultEsmPreset } from "ts-jest";

const config: Config = {
  testEnvironment: "node",
  transform: {
    ...createDefaultEsmPreset().transform,
  },
  clearMocks: true,
  collectCoverage: true,
  coverageDirectory: "coverage",
  coverageProvider: "v8",
};

export default config;
