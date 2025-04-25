import { defineConfig } from "tsup";

export default defineConfig({
  entry: [
    "src/index.ts",
    "src/data-source.ts",
    "src/entities/index.ts",
    "src/seed-runner.ts",
    "src/seed/index.ts",
    "src/seed/user-seed.ts",
  ],
  format: ["esm", "cjs"],
  dts: true,
  clean: true,
  sourcemap: true,
  splitting: false,
  treeshake: true,
});
