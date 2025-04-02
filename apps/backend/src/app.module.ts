import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { DatabaseModule } from "./db/database.module";
// import { QuestionsModule } from "./questions/questions.module"; // KEEP commented out
import { AppConfigModule } from "./config/app-config.module";
import { TRPCModule } from "nestjs-trpc";
import { HelloRouter } from "./app.router";
import { AuthModule } from "./auth/auth.module";
import { AuthRouter } from "./auth/auth.router";
import { TrpcAuthContext } from "./auth/trpc-auth.context";
import { AuthMiddleware } from "./auth/trpc-auth.middleware";
import { TrpcPanelController } from "./trpc-panel.controller";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TRPCModule.forRoot({
      basePath: "/trpc",
      autoSchemaFile: "src/@generated/trpc-schema",
      context: TrpcAuthContext,
    }),
    DatabaseModule,
    AppConfigModule,
    AuthModule,
  ],
  controllers: [TrpcPanelController],
  providers: [HelloRouter, AuthRouter, TrpcAuthContext, AuthMiddleware],
})
export class AppModule {}
