import { DataSource, DataSourceOptions } from "typeorm";
import { config } from "dotenv";
import { User } from "./db/entities/user.entity.js";
import { Item } from "./db/entities/item.entity.js";
import { ItemDetail } from "./db/entities/item-detail.entity.js";
import { UserItem } from "./db/entities/user-item.entity.js";
import path from "path";
import { fileURLToPath } from "url";

// Calculate __dirname equivalent for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env file
config({ path: path.join(__dirname, "..", ".env") }); // Ensure .env is loaded relative to dist/src

export const dataSourceOptions: DataSourceOptions = {
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432", 10),
  username: process.env.DB_USERNAME || "postgres",
  password: process.env.DB_PASSWORD || "postgres",
  database: process.env.DB_DATABASE || "app_db",
  entities: [User, Item, ItemDetail, UserItem],
  migrations: [path.join(__dirname, "db", "migrations", "*.{js,ts}")], // Use path.join for cross-platform compatibility
  synchronize: false, // Should be false when using migrations
  logging: process.env.NODE_ENV !== "production",
};

const dataSource = new DataSource(dataSourceOptions);
export default dataSource;
