import { DataSource, DataSourceOptions } from "typeorm";
import { config } from "dotenv";
import { User } from "./db/entities/user.entity";
import { Item } from "./db/entities/item.entity";
import { ItemDetail } from "./db/entities/item-detail.entity";
import { UserItem } from "./db/entities/user-item.entity";

// Load environment variables from .env file
config({ path: ".env" }); // Assuming .env is in apps/backend root relative to execution

export const dataSourceOptions: DataSourceOptions = {
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432", 10),
  username: process.env.DB_USERNAME || "postgres",
  password: process.env.DB_PASSWORD || "postgres",
  database: process.env.DB_DATABASE || "app_db",
  entities: [User, Item, ItemDetail, UserItem],
  migrations: [__dirname + "/db/migrations/*.{js,ts}"], // Adjusted path for migrations
  synchronize: false, // Should be false when using migrations
  logging: process.env.NODE_ENV !== "production",
};

const dataSource = new DataSource(dataSourceOptions);
export default dataSource;
