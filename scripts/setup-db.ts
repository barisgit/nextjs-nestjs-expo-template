import prompts from "prompts";
import fs from "fs";
import path from "path";
import { execSync, exec } from "child_process";
import chalk from "chalk";
import { EnvManager, EnvLine } from "./utilities/env-manager";

// Path to the backend's environment files
const backendDir = path.resolve(__dirname, "../apps/backend");
const backendEnvLocalPath = path.resolve(backendDir, ".env.local");
const backendEnvPath = path.resolve(backendDir, ".env");
const backendEnvExamplePath = path.resolve(backendDir, ".env.local.example");
// Root env file (optional)
const rootEnvPath = path.resolve(__dirname, "../.env");

const dockerContainerName = "postgres-turbo-template";
const dbDefaults = {
  host: "localhost",
  port: 5432,
  username: "postgres",
  database: "template_db",
};

function isDockerRunning(): boolean {
  try {
    execSync("docker info", { stdio: "ignore" });
    return true;
  } catch (e) {
    console.warn(
      chalk.yellow(
        "⚠️ Docker does not seem to be running. Please start Docker and try again if you want to use it."
      )
    );
    return false;
  }
}

function checkAndManageDockerContainer(
  password: string,
  username: string,
  database: string,
  port: number
): Promise<boolean> {
  return new Promise((resolve) => {
    console.log(
      chalk.blue(`🔍 Checking for Docker container '${dockerContainerName}'...`)
    );
    exec(
      `docker ps -a --filter name=^/${dockerContainerName}$ --format '{{.Names}}'`,
      (error, stdout, stderr) => {
        const containerExists = stdout.trim() === dockerContainerName;

        if (containerExists) {
          console.log(
            chalk.green(`✔️ Container '${dockerContainerName}' exists.`)
          );
          exec(
            `docker ps --filter name=^/${dockerContainerName}$ --filter status=running --format '{{.Names}}'`,
            (err, runningStdout) => {
              if (runningStdout.trim() === dockerContainerName) {
                console.log(
                  chalk.green(
                    `✔️ Container '${dockerContainerName}' is running.`
                  )
                );
                resolve(true);
              } else {
                console.log(
                  chalk.yellow(
                    `▶️ Container '${dockerContainerName}' is stopped. Attempting to start...`
                  )
                );
                exec(
                  `docker start ${dockerContainerName}`,
                  (startErr, startStdout) => {
                    if (startErr) {
                      console.error(
                        chalk.red(
                          `❌ Failed to start container '${dockerContainerName}':`
                        ),
                        startErr
                      );
                      resolve(false);
                    } else {
                      console.log(
                        chalk.green(
                          `✅ Container '${dockerContainerName}' started successfully.`
                        )
                      );
                      resolve(true);
                    }
                  }
                );
              }
            }
          );
        } else {
          console.log(
            chalk.blue(
              `🚀 Container '${dockerContainerName}' not found. Attempting to create and start...`
            )
          );
          // Ensure password doesn't contain characters problematic for shell execution without quoting
          // Basic check for common issues - complex passwords might still need better handling
          const safePassword = String(password).replace(/([\'"$`\\])/g, "\\$1");
          const dockerRunCommand = `docker run -d --name ${dockerContainerName} -p ${port}:5432 -e POSTGRES_PASSWORD='${safePassword}' -e POSTGRES_USER=${username} -e POSTGRES_DB=${database} postgres:17`;

          console.log(
            chalk.gray(`   Running Docker command (details hidden)...`) // Hide command details
          );

          exec(dockerRunCommand, (runErr, runStdout) => {
            if (runErr) {
              console.error(
                chalk.red(
                  `❌ Failed to create container '${dockerContainerName}':`
                ),
                runErr
              );
              console.error(
                chalk.yellow(
                  "   Please ensure Docker is running and you have the postgres:17 image pulled."
                )
              );
              resolve(false);
            } else {
              console.log(
                chalk.green(
                  `✅ Container '${dockerContainerName}' created and started successfully.`
                )
              );
              console.log(
                chalk.blue(
                  "   Allow a few seconds for the database to initialize."
                )
              );
              // Short delay to allow container initialization
              setTimeout(() => resolve(true), 5000);
            }
          });
        }
      }
    );
  });
}

async function setupDatabaseEnv() {
  console.log(chalk.cyan("🚀 Setting up Database environment variables..."));

  // --- Determine target env file path ---
  // Prioritize .env.local, then .env. Create .env if neither exists.
  let targetEnvPath: string;
  if (fs.existsSync(backendEnvLocalPath)) {
    targetEnvPath = backendEnvLocalPath;
    console.log(
      chalk.green(
        `✅ Using existing backend env file: ${chalk.gray(targetEnvPath)}`
      )
    );
  } else if (fs.existsSync(backendEnvPath)) {
    targetEnvPath = backendEnvPath;
    console.log(
      chalk.green(
        `✅ Using existing backend env file: ${chalk.gray(targetEnvPath)}`
      )
    );
  } else {
    targetEnvPath = backendEnvPath; // Create .env if it doesn't exist
    console.log(
      chalk.blue(
        `🔧 No backend .env or .env.local found. Will create ${chalk.gray(targetEnvPath)}.`
      )
    );
    // Touch the file to ensure EnvManager can read it later if needed, even if empty initially
    try {
      fs.writeFileSync(targetEnvPath, "", "utf-8");
    } catch (err) {
      console.error(
        chalk.red(
          `❌ Failed to create initial empty env file at ${chalk.gray(targetEnvPath)}:`
        ),
        err
      );
      process.exit(1);
    }
  }

  // --- Load Example Env for Defaults/Structure ---
  let defaultLines: EnvLine[] = [];
  try {
    // Use a temporary EnvManager instance to parse the example file
    const exampleManager = new EnvManager(backendEnvExamplePath);
    defaultLines = exampleManager.getLines(); // Use the new getter method
    if (defaultLines.length === 0) {
      console.warn(
        chalk.yellow(
          `⚠️ Example env file ${chalk.gray(backendEnvExamplePath)} is empty or not found. Defaults might be missing.`
        )
      );
    } else {
      console.log(
        chalk.blue(
          `ℹ️ Loaded structure from ${chalk.gray(backendEnvExamplePath)}.`
        )
      );
    }
  } catch (err: any) {
    // Catch specific errors if possible, e.g., check err.code === 'ENOENT'
    if (err.code !== "ENOENT") {
      // Only warn if it's not a simple file-not-found case
      console.warn(
        chalk.yellow(
          `⚠️ Could not read or parse ${chalk.gray(backendEnvExamplePath)}. Defaults might be missing. Error: ${err.message}`
        )
      );
    } else {
      console.log(
        chalk.blue(
          `ℹ️ Example env file ${chalk.gray(backendEnvExamplePath)} not found. Proceeding without default structure.`
        )
      );
    }
    // Proceed without defaults if example is missing or unreadable
  }

  // --- Initialize EnvManager for the target file ---
  // Pass defaultLines to ensure structure/comments from example are added if keys are missing
  const envManager = new EnvManager(targetEnvPath, defaultLines);

  // Note: EnvManager constructor already loads the file content or uses defaults.

  // --- Docker Check ---
  let useDocker = false;
  if (isDockerRunning()) {
    const { manageDocker } = await prompts({
      type: "confirm",
      name: "manageDocker",
      message:
        "Docker seems to be running. Do you want to use Docker to manage the PostgreSQL database (Postgres 17)?",
      initial: true,
    });
    useDocker = manageDocker;
  }

  let dbCreds = { ...dbDefaults, password: "" };

  // --- Get Database Credentials ---
  if (useDocker) {
    // Check for existing DB credentials using EnvManager
    const existingPassword = envManager.getValue("DB_PASSWORD");
    const existingUsername = envManager.getValue("DB_USERNAME");
    const existingDatabase = envManager.getValue("DB_DATABASE");
    const existingPortStr = envManager.getValue("DB_PORT");
    const existingPort = existingPortStr
      ? parseInt(existingPortStr)
      : dbDefaults.port;

    const hasExistingDbCreds =
      existingPassword !== undefined && // Check for existence, even if empty string
      existingUsername &&
      existingDatabase;

    if (hasExistingDbCreds) {
      const passDisplay =
        existingPassword === ""
          ? chalk.gray("(no password)")
          : chalk.yellow("********");
      console.log(
        chalk.blue(
          `ℹ️ Found existing database credentials in ${chalk.gray(targetEnvPath)}.`
        )
      );
      const { useExistingCreds } = await prompts({
        type: "confirm",
        name: "useExistingCreds",
        message: `Use existing credentials (User: ${chalk.magenta(existingUsername)}, DB: ${chalk.magenta(existingDatabase)}, Port: ${chalk.magenta(existingPort)}, Pass: ${passDisplay}) for Docker container?`,
        initial: true,
      });

      if (useExistingCreds) {
        console.log(
          chalk.green(
            "👍 Using existing database credentials for Docker container."
          )
        );
        dbCreds = {
          host: dbDefaults.host, // Always localhost for Docker
          port: existingPort,
          username: existingUsername,
          password: existingPassword, // Use the actual value (can be empty)
          database: existingDatabase,
        };
      } else {
        // Ask for Docker password if not using existing
        const { dockerPassword } = await prompts({
          type: "password",
          name: "dockerPassword",
          message: `Enter the desired password for the '${chalk.magenta(dbDefaults.username)}' user in the Docker container (leave blank for no password):`,
        });
        // Allow empty password
        dbCreds.password = dockerPassword ?? "";
        // Keep default user/db/port unless specifically asked
        dbCreds.username = dbDefaults.username;
        dbCreds.database = dbDefaults.database;
        dbCreds.port = dbDefaults.port;
        dbCreds.host = dbDefaults.host;
      }
    } else {
      // No existing credentials, ask for Docker password
      console.log(
        chalk.blue(
          `ℹ️ No existing DB credentials found in ${chalk.gray(targetEnvPath)}.`
        )
      );
      const { dockerPassword } = await prompts({
        type: "password",
        name: "dockerPassword",
        message: `Enter the desired password for the default user ('${chalk.magenta(dbDefaults.username)}') in the Docker container (leave blank for no password):`,
      });
      // Allow empty password
      dbCreds.password = dockerPassword ?? "";
      // Use default user/db/port/host
      dbCreds.username = dbDefaults.username;
      dbCreds.database = dbDefaults.database;
      dbCreds.port = dbDefaults.port;
      dbCreds.host = dbDefaults.host;
    }

    // --- Manage Docker Container ---
    const dockerReady = await checkAndManageDockerContainer(
      dbCreds.password,
      dbCreds.username,
      dbCreds.database,
      dbCreds.port
    );

    if (dockerReady) {
      console.log(
        chalk.green("✅ Using Docker container credentials for .env file.")
      );
      // Ensure host is localhost when using Docker
      dbCreds.host = "localhost";
    } else {
      console.warn(
        chalk.yellow(
          "⚠️ Docker setup failed. Falling back to manual credential input."
        )
      );
      useDocker = false; // Set flag to proceed with manual input
    }
  }

  // --- Manual Credential Input (if not using Docker or Docker failed) ---
  if (!useDocker) {
    console.log(chalk.blue("⚙️ Please provide manual database credentials:"));
    const { host, port, username, password, database } = await prompts([
      {
        type: "text",
        name: "host",
        message: "Enter PostgreSQL Host:",
        initial: envManager.getValue("DB_HOST") || dbDefaults.host,
      },
      {
        type: "number",
        name: "port",
        message: "Enter PostgreSQL Port:",
        initial: parseInt(
          envManager.getValue("DB_PORT") || String(dbDefaults.port)
        ),
      },
      {
        type: "text",
        name: "username",
        message: "Enter PostgreSQL Username:",
        initial: envManager.getValue("DB_USERNAME") || dbDefaults.username,
      },
      {
        type: "password",
        name: "password",
        message: "Enter PostgreSQL Password:",
        // Cannot safely show existing password, prompt for it
      },
      {
        type: "text",
        name: "database",
        message: "Enter PostgreSQL Database Name:",
        initial: envManager.getValue("DB_DATABASE") || dbDefaults.database,
      },
    ]);

    // Password IS required for manual setup unless user explicitly enters nothing.
    // prompts returns empty string if left blank, which is acceptable.
    if (password === undefined || password === null) {
      // Check if prompt was cancelled etc.
      console.error(chalk.red("❌ Database password prompt error."));
      process.exit(1);
    }

    dbCreds = { host, port, username, password, database };
  }

  // --- Update Env File using EnvManager ---
  console.log(
    chalk.blue(
      `📝 Updating database configuration in ${chalk.gray(targetEnvPath)}...`
    )
  );

  envManager
    .setValue("DB_HOST", dbCreds.host)
    .setValue("DB_PORT", String(dbCreds.port))
    .setValue("DB_USERNAME", dbCreds.username)
    .setValue("DB_PASSWORD", dbCreds.password)
    .setValue("DB_DATABASE", dbCreds.database);

  // Ensure other essential vars from example exist (optional, EnvManager handles adding)
  // Example: envManager.setValue('NODE_ENV', envManager.getValue('NODE_ENV') || 'development');

  try {
    envManager.save(); // Save changes to the target file
    console.log(
      chalk.green(
        `✅ Successfully updated database configuration in ${chalk.gray(targetEnvPath)}`
      )
    );
    if (!useDocker) {
      console.log(
        chalk.yellow(
          "🔑 Please ensure your PostgreSQL server is running, the user exists, and the database exists."
        )
      );
      console.log(
        chalk.yellow(
          `   You might need to run SQL commands like: CREATE DATABASE ${chalk.magenta(dbCreds.database)}; CREATE USER ${chalk.magenta(dbCreds.username)} WITH PASSWORD 'your_password'; GRANT ALL PRIVILEGES ON DATABASE ${chalk.magenta(dbCreds.database)} TO ${chalk.magenta(dbCreds.username)};`
        )
      );
    }
  } catch (error) {
    console.error(
      chalk.red(`❌ Failed to write ${chalk.gray(targetEnvPath)}:`),
      error
    );
    process.exit(1);
  }
}

// Run the setup function
setupDatabaseEnv().catch((err) => {
  console.error(
    chalk.red("\n💥 An unexpected error occurred during DB setup:"),
    err
  );
  process.exit(1);
});
