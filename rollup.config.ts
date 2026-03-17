import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
import json from "@rollup/plugin-json";
import { defineConfig } from "rollup";

export default defineConfig({
  input: "src/main.ts",
  output: {
    file: "dist/index.js",
    format: "cjs",
    inlineDynamicImports: true,
  },
  plugins: [
    typescript({ tsconfig: "./tsconfig.json", outputToFilesystem: true }),
    resolve({ preferBuiltins: true }),
    commonjs(),
    json(),
  ],
});
