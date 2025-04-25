import "reflect-metadata"; // Must be the first import
import { DataSource, DataSourceOptions } from "typeorm";
import { config } from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import { parseArgs } from "node:util";

import { User, Item, ItemDetail, UserItem } from "./entities/index.js";

// Calculate __dirname equivalent for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Parse command-line arguments to get --env flag
let envFromArgs: string | undefined;
try {
  const { values } = parseArgs({
    options: { env: { type: "string" } },
  });
  envFromArgs = values.env as string | undefined;
} catch (error) {
  void error;
  // Ignore parsing errors
  console.log(
    "Note: Unable to parse command line arguments, falling back to environment variables"
  );
}

// Try to find the .env file by checking multiple possible locations
const findEnvFile = () => {
  // First check if env path was passed via command-line arg or environment variable
  if (envFromArgs && fs.existsSync(envFromArgs)) {
    return envFromArgs;
  }

  if (process.env.DB_ENV_PATH && fs.existsSync(process.env.DB_ENV_PATH)) {
    return process.env.DB_ENV_PATH;
  }

  // Define possible locations for the .env file
  const possiblePaths = [
    path.join(process.cwd(), ".env.local"),
    path.join(process.cwd(), "apps", "backend", ".env.local"),
    path.join(process.cwd(), "..", "apps", "backend", ".env.local"),
    path.join(process.cwd(), "..", "..", "apps", "backend", ".env.local"),
    path.join(process.cwd(), "apps", "backend", ".env"),
    path.join(process.cwd(), "..", "apps", "backend", ".env"),
    path.join(process.cwd(), "..", "..", "apps", "backend", ".env"),
  ];

  for (const envPath of possiblePaths) {
    if (fs.existsSync(envPath)) {
      return envPath;
    }
  }

  // If no .env file found, return a default path
  return path.join(process.cwd(), "apps", "backend", ".env");
};

// Find and load environment variables
const envPath = findEnvFile();
console.log("Loading .env from:", envPath);
config({ path: envPath });

export const entities = [User, Item, ItemDetail, UserItem];

export const dataSourceOptions: DataSourceOptions = {
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432", 10),
  username: process.env.DB_USERNAME || "postgres",
  password: process.env.DB_PASSWORD || "postgres",
  database: process.env.DB_DATABASE || "turbo_template_db",
  entities: [
    ...entities,
    // Also keep the glob pattern as fallback
    path.join(__dirname, "entities", "**", "*.entity.{js,ts}"),
  ],
  migrations: [path.join(__dirname, "migrations", "*.{js,ts}")],
  synchronize: false,
  logging: process.env.NODE_ENV !== "production",
};

// Print database connection info for debugging
console.log("Database connection info:", {
  envPath: envPath,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  username: process.env.DB_USERNAME,
  database: process.env.DB_DATABASE,
});

const dataSource = new DataSource(dataSourceOptions);
export default dataSource;
