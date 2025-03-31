import { DataSource } from "typeorm";
import { User } from "./entities/user.entity";
import { Question } from "./entities/question.entity";
import { Game } from "./entities/game.entity";
import { GameQuestion } from "./entities/game-question.entity";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432"),
  username: process.env.DB_USERNAME || "postgres",
  password: process.env.DB_PASSWORD || "postgres",
  database: process.env.DB_DATABASE || "football_trivia",
  synchronize: process.env.NODE_ENV !== "production",
  logging: process.env.NODE_ENV !== "production",
  entities: [User, Question, Game, GameQuestion],
  migrations: ["dist/migrations/*.js"],
  subscribers: [],
});
