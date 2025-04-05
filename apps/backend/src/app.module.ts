import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { DatabaseModule } from "@repo/db";
import { AppConfigModule } from "./config/app-config.module.js";
import { AuthModule } from "./auth/auth.module.js";
// Import the TRPCModule and TRPCPanelController from our package
import { TRPCModule, TRPCPanelController } from "@repo/trpc";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    // Use our exported TRPCModule
    TRPCModule,
    DatabaseModule,
    AppConfigModule,
    AuthModule,
  ],
  controllers: [TRPCPanelController],
  providers: [],
})
export class AppModule {}
