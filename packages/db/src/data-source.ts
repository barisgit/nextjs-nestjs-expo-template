import "reflect-metadata"; // Must be the first import
import { DataSource, DataSourceOptions } from "typeorm";
import { config } from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { User, Item, ItemDetail, UserItem } from "./entities/index.js";

// Calculate __dirname equivalent for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper to get project root for different environments (dev vs production)
const getProjectRoot = () => {
  // When running in dist/ folder
  if (__dirname.includes("dist")) {
    return path.join(__dirname, "..", "..");
  }
  // When running in src/ folder
  return path.join(__dirname, "..");
};

// Load environment variables from .env file
const envPath = path.join(getProjectRoot(), ".env");
config({ path: envPath });

export const dataSourceOptions: DataSourceOptions = {
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432", 10),
  username: process.env.DB_USERNAME || "postgres",
  password: process.env.DB_PASSWORD || "postgres",
  database: process.env.DB_DATABASE || "app_db",
  entities: [User, Item, ItemDetail, UserItem],
  migrations: [path.join(__dirname, "migrations", "*.{js,ts}")], // Use path.join for cross-platform compatibility
  synchronize: false, // Should be false when using migrations
  logging: process.env.NODE_ENV !== "production",
};

const dataSource = new DataSource(dataSourceOptions);
export default dataSource;
