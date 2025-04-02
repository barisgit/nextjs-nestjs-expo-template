import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { DatabaseModule } from "./db/database.module";
// import { QuestionsModule } from "./questions/questions.module"; // KEEP commented out
import { AppConfigModule } from "./config/app-config.module";
import { AuthModule } from "./auth/auth.module";
// Import our new tRPC module instead of nestjs-trpc
import { TRPCModule } from "./trpc/trpc.module";
import { TRPCPanelController } from "./trpc/trpc-panel.controller";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    // Replace nestjs-trpc with our own TRPCModule
    TRPCModule,
    DatabaseModule,
    AppConfigModule,
    AuthModule,
  ],
  controllers: [TRPCPanelController],
  // We don't need these providers anymore as they were for nestjs-trpc
  // The functionality is now inside TRPCService
  providers: [],
})
export class AppModule {}
