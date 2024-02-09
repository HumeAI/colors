import { defineConfig } from "tsup";

export default defineConfig([
  {
    entry: ["lib/index.ts"],
    format: ["cjs", "esm"],
    external: [],
    dts: true,
    sourcemap: true,
  },
]);
