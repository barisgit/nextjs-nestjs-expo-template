import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { User } from "./entities/user.entity";
import { Question } from "./entities/question.entity";
import { Game } from "./entities/game.entity";
// import { GameParticipant } from "./entities/game-participant.entity";
import { GameQuestion } from "./entities/game-question.entity";
// import { UserAnswer } from "./entities/user-answer.entity";

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: "postgres",
        host: configService.get("DB_HOST", "localhost"),
        port: configService.get("DB_PORT", 5432),
        username: configService.get("DB_USERNAME", "postgres"),
        password: configService.get("DB_PASSWORD", "postgres"),
        database: configService.get("DB_DATABASE", "football_trivia"),
        entities: [
          User,
          Question,
          Game,
          // GameParticipant,
          GameQuestion,
          // UserAnswer,
        ],
        synchronize: false, // Set to false for migrations
        logging: configService.get("NODE_ENV") !== "production",
      }),
    }),
    // Remove forFeature if only using root config, or update as needed
    // TypeOrmModule.forFeature([
    //   User,
    //   Question,
    //   Game,
    //   // GameParticipant,
    //   GameQuestion,
    //   // UserAnswer,
    // ]),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
