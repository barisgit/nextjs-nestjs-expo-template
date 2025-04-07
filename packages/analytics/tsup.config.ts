import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts", "src/web.ts", "src/mobile.ts"],
  format: ["cjs", "esm"],
  dts: true,
  splitting: false,
  sourcemap: true,
});
