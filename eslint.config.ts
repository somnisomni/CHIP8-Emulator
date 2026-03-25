import path from "node:path";
import { defineConfig, type Config } from "eslint/config";
import { includeIgnoreFile } from "@eslint/compat";
import js from "@eslint/js";
import ts from "typescript-eslint";
import stylistic from "@stylistic/eslint-plugin";

export default function createCommonConfig(dirname?: string): Config[] {
  return defineConfig(
    dirname ? includeIgnoreFile(path.resolve(dirname, ".gitignore")) : [],
    js.configs.recommended,
    ts.configs.recommended,
    {
      plugins: {
        "@stylistic": stylistic,
      },
      rules: {
        "no-useless-assignment": "off",
        "@stylistic/semi": [ "error", "always" ],
        "@stylistic/quotes": [ "warn", "double" ],
        "@stylistic/comma-dangle": [ "warn", "always-multiline" ],
        "@stylistic/array-bracket-spacing": [ "warn", "always" ],
        "@stylistic/block-spacing": [ "warn", "always" ],
        "@stylistic/indent": [ "warn", 2 ],
        "@stylistic/no-tabs": "error",
      },
    },
  );
}
