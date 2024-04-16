import { defineConfig } from "tsup";
import fs from "fs";
import path from "path";

const rootDir = path.resolve(process.cwd());

export default defineConfig([
  {
    entry: ["lib/index.ts"],
    format: ["cjs", "esm"],
    external: [],
    dts: true,
    sourcemap: true,
    onSuccess: async () => {
      const jsonFile = path.resolve(rootDir, "lib", "generated", "colors.json");
      
      fs.copyFileSync(jsonFile, path.resolve(rootDir, "dist", "colors.json"));
    }
  },
]);
