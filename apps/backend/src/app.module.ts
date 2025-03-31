import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { DatabaseModule } from "./db/database.module";
import { QuestionsModule } from "./questions/questions.module";
import { TrpcModule } from "./trpc/trpc.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    QuestionsModule,
    TrpcModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
