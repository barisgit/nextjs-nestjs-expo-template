import prompts from "prompts";
import fs from "fs";
import path from "path";
import { execSync, exec } from "child_process";

// Path to the backend's .env file relative to the script location
const backendEnvPath = path.resolve(__dirname, "../apps/backend/.env");
const backendEnvExamplePath = path.resolve(
  __dirname,
  "../apps/backend/.env.example"
);
const dockerContainerName = "postgres-footy-mastermind";
const dbDefaults = {
  host: "localhost",
  port: 5432,
  username: "postgres",
  database: "app_db",
};

function isDockerRunning(): boolean {
  try {
    execSync("docker info", { stdio: "ignore" });
    return true;
  } catch (e) {
    console.warn(
      "⚠️ Docker does not seem to be running. Please start Docker and try again if you want to use it."
    );
    return false;
  }
}

function checkAndManageDockerContainer(password: string): Promise<boolean> {
  return new Promise((resolve) => {
    console.log(`🔍 Checking for Docker container '${dockerContainerName}'...`);
    exec(
      `docker ps -a --filter name=^/${dockerContainerName}$ --format '{{.Names}}'`,
      (error, stdout, stderr) => {
        const containerExists = stdout.trim() === dockerContainerName;

        if (containerExists) {
          console.log(`✔️ Container '${dockerContainerName}' exists.`);
          exec(
            `docker ps --filter name=^/${dockerContainerName}$ --filter status=running --format '{{.Names}}'`,
            (err, runningStdout) => {
              if (runningStdout.trim() === dockerContainerName) {
                console.log(
                  `✔️ Container '${dockerContainerName}' is running.`
                );
                resolve(true);
              } else {
                console.log(
                  `▶️ Container '${dockerContainerName}' is stopped. Attempting to start...`
                );
                exec(
                  `docker start ${dockerContainerName}`,
                  (startErr, startStdout) => {
                    if (startErr) {
                      console.error(
                        `❌ Failed to start container '${dockerContainerName}':`,
                        startErr
                      );
                      resolve(false);
                    } else {
                      console.log(
                        `✅ Container '${dockerContainerName}' started successfully.`
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
            `🚀 Container '${dockerContainerName}' not found. Attempting to create and start...`
          );
          const dockerRunCommand = `docker run -d --name ${dockerContainerName} -p ${dbDefaults.port}:5432 -e POSTGRES_PASSWORD=${password} -e POSTGRES_USER=${dbDefaults.username} -e POSTGRES_DB=${dbDefaults.database} postgres:17`;

          console.log(
            `   Running: ${dockerRunCommand.replace(password, "********")}`
          );

          exec(dockerRunCommand, (runErr, runStdout) => {
            if (runErr) {
              console.error(
                `❌ Failed to create container '${dockerContainerName}':`,
                runErr
              );
              console.error(
                "   Please ensure Docker is running and you have the postgres:17 image pulled."
              );
              resolve(false);
            } else {
              console.log(
                `✅ Container '${dockerContainerName}' created and started successfully.`
              );
              console.log(
                "   Allow a few seconds for the database to initialize."
              );
              resolve(true);
            }
          });
        }
      }
    );
  });
}

async function setupBackendEnv() {
  console.log("🚀 Setting up backend environment variables...");

  if (fs.existsSync(backendEnvPath)) {
    const { overwrite } = await prompts({
      type: "confirm",
      name: "overwrite",
      message: `Found existing .env file at ${backendEnvPath}. Overwrite?`,
      initial: false,
    });

    if (!overwrite) {
      console.log("Skipping .env setup.");
      return;
    }
  }

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

  if (useDocker) {
    const { dockerPassword } = await prompts({
      type: "password",
      name: "dockerPassword",
      message: `Enter the desired password for the '${dbDefaults.username}' user in the Docker container:`,
    });

    if (!dockerPassword) {
      console.error("❌ Password is required for the Docker container.");
      process.exit(1);
    }

    const dockerReady = await checkAndManageDockerContainer(dockerPassword);

    if (dockerReady) {
      dbCreds.password = dockerPassword;
      console.log("✅ Using Docker container credentials for .env file.");
    } else {
      console.warn(
        "⚠️ Docker setup failed. Falling back to manual credential input."
      );
      useDocker = false;
    }
  }

  if (!useDocker) {
    console.log("⚙️ Please provide manual database credentials:");
    const {
      manualHost,
      manualPort,
      manualUsername,
      manualPassword,
      manualDatabase,
    } = await prompts([
      {
        type: "text",
        name: "manualHost",
        message: "Enter PostgreSQL Host:",
        initial: dbDefaults.host,
      },
      {
        type: "number",
        name: "manualPort",
        message: "Enter PostgreSQL Port:",
        initial: dbDefaults.port,
      },
      {
        type: "text",
        name: "manualUsername",
        message: "Enter PostgreSQL Username:",
        initial: dbDefaults.username,
      },
      {
        type: "password",
        name: "manualPassword",
        message: "Enter PostgreSQL Password:",
      },
      {
        type: "text",
        name: "manualDatabase",
        message: "Enter PostgreSQL Database Name:",
        initial: dbDefaults.database,
      },
    ]);

    if (!manualPassword) {
      console.error("❌ Database password is required.");
      process.exit(1);
    }
    dbCreds = {
      host: manualHost,
      port: manualPort,
      username: manualUsername,
      password: manualPassword,
      database: manualDatabase,
    };
  }

  console.log(`📝 Writing configuration to ${backendEnvPath}...`);
  let envContent = "";
  try {
    envContent = fs.readFileSync(backendEnvExamplePath, "utf-8");
  } catch (err) {
    console.warn(
      `⚠️ Could not read ${backendEnvExamplePath}. Creating .env from defaults.`
    );
    envContent = `DB_HOST=${dbDefaults.host}
DB_PORT=${dbDefaults.port}
DB_USERNAME=${dbDefaults.username}
DB_PASSWORD=
DB_DATABASE=${dbDefaults.database}
NODE_ENV=development
PORT=3001
`;
  }

  envContent = envContent
    .replace(/^DB_HOST=.*$/m, `DB_HOST=${dbCreds.host}`)
    .replace(/^DB_PORT=.*$/m, `DB_PORT=${dbCreds.port}`)
    .replace(/^DB_USERNAME=.*$/m, `DB_USERNAME=${dbCreds.username}`)
    .replace(/^DB_PASSWORD=.*$/m, `DB_PASSWORD=${dbCreds.password}`)
    .replace(/^DB_DATABASE=.*$/m, `DB_DATABASE=${dbCreds.database}`);

  try {
    fs.writeFileSync(backendEnvPath, envContent);
    console.log(`✅ Successfully created/updated ${backendEnvPath}`);
    if (!useDocker) {
      console.log(
        "🔑 Please ensure your PostgreSQL server is running and the database exists."
      );
      console.log(
        `   You might need to run: CREATE DATABASE ${dbCreds.database};`
      );
    }
  } catch (error) {
    console.error(`❌ Failed to write ${backendEnvPath}:`, error);
    process.exit(1);
  }
}

setupBackendEnv();
