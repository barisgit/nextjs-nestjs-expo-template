import { execSync } from "child_process";
import { existsSync } from "fs";
import path from "path";
import prompts from "prompts";
import chalk from "chalk";
import { EnvManager } from "./utilities/env-manager";

async function setupRedis() {
  try {
    console.log(chalk.cyan("⚙️ Setting up Redis..."));

    // Check if Docker is installed
    try {
      execSync("docker --version", { stdio: "ignore" });
    } catch (error) {
      console.error(
        chalk.red(
          "❌ Docker is not installed or not in PATH. Please install Docker to manage Redis automatically."
        )
      );
      process.exit(1);
    }

    // Check if Docker is running
    try {
      execSync("docker info", { stdio: "ignore" });
    } catch (e) {
      console.warn(
        chalk.yellow(
          "⚠️ Docker engine is not running. Please start Docker and try again."
        )
      );
      process.exit(1); // Exit if Docker isn't running
    }

    // Check if Redis container already exists and is running
    const containerName = "redis-turbo-template";
    console.log(
      chalk.blue(`🔍 Checking for Redis container '${containerName}'...`)
    );
    const existingContainer = execSync(
      `docker ps -a --filter name=^/${containerName}$ --format '{{.Names}}'`
    )
      .toString()
      .trim();

    if (existingContainer === containerName) {
      const isRunning =
        execSync(
          `docker ps --filter name=^/${containerName}$ --filter status=running --format '{{.Names}}'`
        )
          .toString()
          .trim() === containerName;

      if (isRunning) {
        console.log(
          chalk.green(
            `✔️ Redis container '${containerName}' already exists and is running.`
          )
        );
        // Optionally: check if password matches env file? For now, assume it's ok.
        return; // Nothing more to do
      } else {
        console.log(
          chalk.yellow(
            `▶️ Redis container '${containerName}' exists but is stopped. Starting...`
          )
        );
        try {
          execSync(`docker start ${containerName}`, { stdio: "inherit" });
          console.log(chalk.green(`✅ Container '${containerName}' started.`));
          return; // Started successfully
        } catch (startErr) {
          console.error(
            chalk.red(
              `❌ Failed to start existing container '${containerName}':`
            ),
            startErr
          );
          // Decide whether to try removing and recreating or just exit
          console.log(
            chalk.yellow(`   Attempting to remove the stopped container...`)
          );
          try {
            execSync(`docker rm ${containerName}`, { stdio: "inherit" });
            console.log(
              chalk.blue(
                `   Removed stopped container '${containerName}'. Will proceed to create a new one.`
              )
            );
          } catch (rmErr) {
            console.error(
              chalk.red(
                `❌ Failed to remove stopped container '${containerName}'. Please remove it manually (\`docker rm ${containerName}\`) and retry.`
              ),
              rmErr
            );
            process.exit(1);
          }
        }
      }
    }
    // Container does not exist, proceed with setup...

    // --- Get target env file path ---
    const backendDir = path.resolve(__dirname, "../apps/backend");
    const backendEnvLocalPath = path.resolve(backendDir, ".env.local");
    const backendEnvPath = path.resolve(backendDir, ".env");
    let targetEnvPath: string;

    if (existsSync(backendEnvLocalPath)) {
      targetEnvPath = backendEnvLocalPath;
      console.log(
        chalk.blue(`ℹ️ Using backend env file: ${chalk.gray(targetEnvPath)}`)
      );
    } else if (existsSync(backendEnvPath)) {
      targetEnvPath = backendEnvPath;
      console.log(
        chalk.blue(`ℹ️ Using backend env file: ${chalk.gray(targetEnvPath)}`)
      );
    } else {
      // If neither exists, the db setup should run first ideally.
      // We'll assume it exists or default values will be used by EnvManager.
      targetEnvPath = backendEnvPath; // Default to creating .env
      console.log(
        chalk.yellow(
          `🔧 Target env file ${chalk.gray(targetEnvPath)} not found. Will use defaults or create it if needed.`
        )
      );
    }

    // --- Initialize EnvManager ---
    const envManager = new EnvManager(targetEnvPath);

    // --- Check existing Redis config using EnvManager ---
    const existingRedisPassword = envManager.getValue("REDIS_PASSWORD");
    const existingRedisPort = envManager.getValue("REDIS_PORT");
    const existingRedisHost = envManager.getValue("REDIS_HOST");

    const hasRedisConfig = !!(
      existingRedisPort &&
      existingRedisHost &&
      existingRedisPassword !== undefined
    );

    let redisPassword = "";
    let useExistingConfig = false;

    if (hasRedisConfig) {
      const passDisplay =
        existingRedisPassword === ""
          ? chalk.gray("(no password)")
          : chalk.yellow("********");
      console.log(
        chalk.blue(
          `ℹ️ Found existing Redis configuration in ${chalk.gray(targetEnvPath)}.`
        )
      );
      const { useExisting } = await prompts({
        type: "confirm",
        name: "useExisting",
        message: `Use existing Redis configuration (Host: ${chalk.magenta(existingRedisHost)}, Port: ${chalk.magenta(existingRedisPort)}, Pass: ${passDisplay})?`,
        initial: true,
      });
      if (useExisting) {
        redisPassword = existingRedisPassword ?? ""; // Use existing password (or empty string)
        useExistingConfig = true;
        console.log(chalk.green("👍 Using existing Redis configuration."));
      } else {
        const { newPassword } = await prompts({
          type: "password",
          name: "newPassword",
          message:
            "Enter new Redis password for Docker container (leave blank for no password):",
        });
        redisPassword = newPassword ?? "";
      }
    } else {
      console.log(
        chalk.blue(
          `ℹ️ No complete Redis configuration found in ${chalk.gray(targetEnvPath)}.`
        )
      );
      // Check if only password exists from a partial setup
      if (existingRedisPassword !== undefined) {
        const passDisplay =
          existingRedisPassword === ""
            ? chalk.gray("(no password)")
            : chalk.yellow("********");
        const { useExistingPw } = await prompts({
          type: "confirm",
          name: "useExistingPw",
          message: `Found an existing REDIS_PASSWORD (${passDisplay}). Use this password?`,
          initial: true,
        });
        if (useExistingPw) {
          redisPassword = existingRedisPassword;
        } else {
          const { newPassword } = await prompts({
            type: "password",
            name: "newPassword",
            message:
              "Enter Redis password for Docker container (leave blank for no password):",
          });
          redisPassword = newPassword ?? "";
        }
      } else {
        // No password found either, ask for new one
        const { newPassword } = await prompts({
          type: "password",
          name: "newPassword",
          message:
            "Enter Redis password for Docker container (leave blank for no password):",
        });
        redisPassword = newPassword ?? "";
      }
    }

    // --- Update .env file if needed ---
    if (!useExistingConfig) {
      console.log(
        chalk.blue(
          `📝 Updating Redis configuration in ${chalk.gray(targetEnvPath)}...`
        )
      );
      envManager
        .setValue("REDIS_HOST", "localhost")
        .setValue("REDIS_PORT", "6379")
        .setValue("REDIS_PASSWORD", redisPassword);

      try {
        envManager.save();
        console.log(
          chalk.green(
            `✅ Updated Redis configuration in ${chalk.gray(targetEnvPath)}`
          )
        );
      } catch (error) {
        console.error(
          chalk.red(
            `❌ Failed to write Redis configuration to ${chalk.gray(targetEnvPath)}:`
          ),
          error
        );
        process.exit(1); // Exit if cannot save env changes
      }
    }

    // --- Pull latest Redis image and run container ---
    console.log(chalk.blue("🐳 Pulling latest Redis image..."));
    try {
      execSync("docker pull redis:latest", { stdio: "inherit" });
    } catch (pullErr) {
      console.error(chalk.red("❌ Failed to pull Redis image:"), pullErr);
      process.exit(1);
    }

    console.log(
      chalk.blue(`🐳 Creating Redis container '${containerName}'...`)
    );
    // Escape password for shell command
    const safePassword = String(redisPassword).replace(
      /([\\\'\"$`\\\\])/g,
      "\\$1"
    );
    const dockerCommand = redisPassword
      ? `docker run -d --name ${containerName} -p 6379:6379 -e REDIS_PASSWORD='${safePassword}' redis:latest --requirepass '${safePassword}'`
      : `docker run -d --name ${containerName} -p 6379:6379 redis:latest`;

    console.log(chalk.gray("   Running Docker command (details hidden)..."));
    try {
      execSync(dockerCommand, { stdio: "inherit" });
      console.log(
        chalk.green(
          `✅ Redis container '${containerName}' created successfully!`
        )
      );
    } catch (runErr) {
      console.error(
        chalk.red(`❌ Failed to create Redis container '${containerName}':`),
        runErr
      );
      console.error(
        chalk.yellow(
          "   Check if port 6379 is already in use or if there are Docker permission issues."
        )
      );
      process.exit(1);
    }
  } catch (error) {
    // Catch any unexpected errors during the process
    console.error(
      chalk.red("❌ An unexpected error occurred during Redis setup:"),
      error
    );
    process.exit(1);
  }
}

setupRedis().catch((err) => {
  console.error(
    chalk.red("\n💥 An unexpected error occurred during Redis setup:"),
    err
  );
  process.exit(1);
});
