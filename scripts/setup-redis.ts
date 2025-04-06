import { execSync } from "child_process";
import { existsSync, readFileSync, writeFileSync } from "fs";
import path from "path";
import prompts from "prompts";

async function setupRedis() {
  try {
    console.log("Setting up Redis with Docker...");

    // Check if Docker is installed
    execSync("docker --version", { stdio: "inherit" });

    // Check if Redis container already exists
    const containerExists = execSync(
      "docker ps -a --filter name=turbo-template-redis --format '{{.Names}}'"
    )
      .toString()
      .trim();

    if (containerExists === "turbo-template-redis") {
      console.log("Redis container already exists. Starting container...");
      execSync("docker start turbo-template-redis", { stdio: "inherit" });
      return;
    }

    // Get Redis password from user
    const { redisPassword } = await prompts({
      type: "password",
      name: "redisPassword",
      message: "Enter Redis password (leave blank for no password):",
    });

    // Update .env file
    const envPath = path.join(__dirname, "../apps/backend/.env");
    let envContent = "";

    if (existsSync(envPath)) {
      envContent = readFileSync(envPath, "utf-8");

      // Check if Redis config already exists
      const hasRedisConfig =
        envContent.includes("REDIS_URL") &&
        envContent.includes("REDIS_PASSWORD") &&
        envContent.includes("REDIS_PORT") &&
        envContent.includes("REDIS_HOST");

      if (hasRedisConfig) {
        const { overwrite } = await prompts({
          type: "confirm",
          name: "overwrite",
          message: "Redis configuration already exists in .env. Overwrite it?",
          initial: false,
        });

        if (!overwrite) {
          console.log("Skipping .env update.");
        } else {
          // Remove existing Redis config
          envContent = envContent
            .split("\n")
            .filter(
              (line) =>
                !line.startsWith("REDIS_URL") &&
                !line.startsWith("REDIS_PASSWORD") &&
                !line.startsWith("REDIS_PORT") &&
                !line.startsWith("REDIS_HOST")
            )
            .join("\n");
        }
      }
    }

    // Add Redis config to .env
    const redisConfig = `
# Redis Configuration
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=${redisPassword || ""}
REDIS_PORT=6379
REDIS_HOST=localhost
`.trim();

    envContent = `${envContent}\n${redisConfig}`;
    writeFileSync(envPath, envContent);
    console.log("Updated Redis configuration in .env file");

    // Pull latest Redis image and run container
    console.log("Pulling latest Redis image...");
    execSync("docker pull redis:latest", { stdio: "inherit" });

    console.log("Creating Redis container...");
    const dockerCommand = redisPassword
      ? `docker run -d \
        --name turbo-template-redis \
        -p 6379:6379 \
        -e REDIS_PASSWORD=${redisPassword} \
        redis:latest`
      : `docker run -d \
        --name turbo-template-redis \
        -p 6379:6379 \
        redis:latest`;

    execSync(dockerCommand, { stdio: "inherit" });

    console.log("Redis container created successfully!");
  } catch (error) {
    console.error("Error setting up Redis:", error);
    process.exit(1);
  }
}

setupRedis();
