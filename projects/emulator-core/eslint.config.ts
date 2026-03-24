import { defineConfig } from "eslint/config";
import createCommonConfig from "../../eslint.config";

export default defineConfig(
  createCommonConfig(import.meta.dirname),
);
