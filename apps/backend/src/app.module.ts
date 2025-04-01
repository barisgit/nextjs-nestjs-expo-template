import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { DatabaseModule } from "./db/database.module";
// import { QuestionsModule } from "./questions/questions.module"; // KEEP commented out
import { AppConfigModule } from "./config/app-config.module";
import { TRPCModule } from "nestjs-trpc";
import { HelloRouter } from "./app.router";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TRPCModule.forRoot({
      basePath: "/trpc",
      autoSchemaFile: "src/@generated/trpc-schema",
    }),
    DatabaseModule,
    AppConfigModule,
  ],
  controllers: [],
  providers: [HelloRouter],
})
export class AppModule {}
