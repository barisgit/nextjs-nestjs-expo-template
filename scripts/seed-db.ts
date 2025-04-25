#!/usr/bin/env tsx

/**
 * Script to run database seeds
 */

import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import chalk from "chalk";

// Calculate __dirname equivalent for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to the db package
const rootDir = path.resolve(__dirname, "..");
const dbPackagePath = path.resolve(rootDir, "packages/db");

// Find the correct .env file using the same logic as data-source.ts
const findEnvFileForSeed = (): string | undefined => {
  const backendDir = path.resolve(rootDir, "apps/backend");
  const localEnvPath = path.resolve(backendDir, ".env.local");
  const defaultEnvPath = path.resolve(backendDir, ".env");

  if (fs.existsSync(localEnvPath)) {
    return localEnvPath;
  }
  if (fs.existsSync(defaultEnvPath)) {
    return defaultEnvPath;
  }
  return undefined;
};

const envFilePath = findEnvFileForSeed();

if (!envFilePath) {
  console.error(
    chalk.red(
      "❌ Could not find .env.local or .env in apps/backend. Cannot determine environment for seeding."
    )
  );
  process.exit(1);
}

console.log(
  chalk.blue(
    `🌱 Running database seeds using environment file: ${chalk.gray(path.relative(rootDir, envFilePath))}`
  )
);

// Construct the command arguments
// Pass the found env file path via both --env and DB_ENV_PATH for robustness
const args = ["seed", `--env=${envFilePath}`];

const seedProcess = spawn("pnpm", args, {
  cwd: dbPackagePath,
  stdio: "inherit",
  shell: true,
  env: {
    ...process.env,
    DB_ENV_PATH: envFilePath, // Set environment variable for data-source.ts
  },
});

seedProcess.on("close", (code) => {
  if (code === 0) {
    console.log(chalk.green("✅ Seed completed successfully"));
    process.exit(0);
  } else {
    console.error(chalk.red(`❌ Seed failed with code ${code}`));
    process.exit(1);
  }
});

seedProcess.on("error", (err) => {
  console.error(chalk.red("💥 Failed to start seed process:"), err);
  process.exit(1);
});
