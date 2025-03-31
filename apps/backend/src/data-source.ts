import { DataSource, DataSourceOptions } from "typeorm";
import { config } from "dotenv";
import { User } from "./db/entities/user.entity";
import { Question } from "./db/entities/question.entity";
import { Game } from "./db/entities/game.entity";
import { GameQuestion } from "./db/entities/game-question.entity";

// Load environment variables from .env file
config({ path: ".env" }); // Assuming .env is in apps/backend root relative to execution

export const dataSourceOptions: DataSourceOptions = {
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432", 10),
  username: process.env.DB_USERNAME || "postgres",
  password: process.env.DB_PASSWORD || "postgres",
  database: process.env.DB_DATABASE || "football_trivia",
  entities: [User, Question, Game, GameQuestion],
  migrations: [__dirname + "/db/migrations/*.{js,ts}"], // Adjusted path for migrations
  synchronize: false, // Should be false when using migrations
  logging: process.env.NODE_ENV !== "production",
};

const dataSource = new DataSource(dataSourceOptions);
export default dataSource;
