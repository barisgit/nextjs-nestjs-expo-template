import { spawnSync } from "child_process";
import path from "path";
import fs from "fs";
import chalk from "chalk";

// Calculate __dirname equivalent for ESM if needed, but paths relative to root are fine here
const rootDir = path.resolve(__dirname, "..");
const dbPackagePath = path.resolve(rootDir, "packages/db");
const backendDir = path.resolve(rootDir, "apps/backend");

// Function to find the target env file (copied from seed-db.ts/data-source.ts logic)
const findEnvFile = (): string | undefined => {
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

interface ScriptStep {
  name: string;
  command: string;
  args: string[];
  options?: { cwd?: string; shell?: boolean; env?: NodeJS.ProcessEnv };
  ignoreFailure?: boolean;
}

function runStep(step: ScriptStep): boolean {
  console.log(chalk.blue.bold(`\n--- Running Step: ${step.name} ---`));
  const cwdInfo = step.options?.cwd
    ? chalk.gray(` (in ${path.relative(rootDir, step.options.cwd)})`)
    : "";
  console.log(
    chalk.blue(`🚀 Executing: ${step.command} ${step.args.join(" ")}${cwdInfo}`)
  );

  // Merge process.env with step-specific env vars
  const mergedEnv = { ...process.env, ...(step.options?.env || {}) };

  const result = spawnSync(step.command, step.args, {
    stdio: "inherit",
    shell: step.options?.shell ?? true,
    cwd: step.options?.cwd,
    env: mergedEnv,
  });

  if (result.status !== 0) {
    console.error(
      chalk.red(
        `❌ Step "${step.name}" failed with exit code ${result.status}.`
      )
    );
    if (result.error) {
      console.error(chalk.red("   Error: "), result.error);
    }
    return false;
  }

  console.log(chalk.green(`✅ Step "${step.name}" completed successfully.`));
  return true;
}

async function setupDevelopmentEnvironment() {
  console.log(chalk.cyan.bold("🏁 Starting Development Environment Setup..."));

  // Find the environment file path *before* running steps that need it
  const envFilePath = findEnvFile();

  if (!envFilePath) {
    console.warn(
      chalk.yellow("⚠️ Could not find .env.local or .env in apps/backend.")
    );
    console.warn(
      chalk.yellow(
        "   Database migration and seeding might fail if environment variables are not set globally."
      )
    );
    // Allow continuing, but subsequent steps might fail
  } else {
    console.log(
      chalk.blue(
        `ℹ️ Using environment file: ${chalk.gray(path.relative(rootDir, envFilePath))}`
      )
    );
  }

  const steps: ScriptStep[] = [
    {
      name: "Setup Database (.env & Docker/Manual Credentials)",
      command: "tsx",
      args: [path.resolve(__dirname, "setup-db.ts")],
      options: { cwd: rootDir },
    },
    {
      name: "Setup Redis (.env & Docker)",
      command: "tsx",
      args: [path.resolve(__dirname, "setup-redis.ts")],
      options: { cwd: rootDir },
    },
    {
      name: "Run Database Migrations",
      command: "pnpm",
      args: ["migration:run"],
      options: {
        cwd: dbPackagePath,
        env: envFilePath ? { DB_ENV_PATH: envFilePath } : {},
      },
    },
    {
      name: "Seed Database",
      command: "tsx",
      args: [path.resolve(__dirname, "seed-db.ts")],
      options: { cwd: rootDir },
    },
  ];

  for (const step of steps) {
    const success = runStep(step);
    if (!success && !step.ignoreFailure) {
      console.error(
        chalk.red.bold(
          `\n💥 Setup process aborted due to failure in step: "${step.name}"`
        )
      );
      process.exit(1);
    }
  }

  console.log(
    chalk.green.bold(
      "\n🎉 Development Environment Setup Completed Successfully! 🎉"
    )
  );
  console.log(
    chalk.blue(
      "   You should now be able to run backend/web/mobile development servers."
    )
  );
}

// Execute the setup process
setupDevelopmentEnvironment().catch((err) => {
  console.error(
    chalk.red(
      "\n💥 An unexpected error occurred during the setup orchestration:"
    ),
    err
  );
  process.exit(1);
});
