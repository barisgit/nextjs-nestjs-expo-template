import { DataSource } from "typeorm";
import { config } from "dotenv";
import { dataSourceOptions } from "@repo/db/data-source";
import path from "path";
import { fileURLToPath } from "url";

// Calculate __dirname equivalent for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env file
config({ path: path.join(__dirname, "..", ".env") }); // Ensure .env is loaded relative to dist/src

const dataSource = new DataSource(dataSourceOptions);
export default dataSource;
