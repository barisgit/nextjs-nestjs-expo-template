import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { DatabaseModule } from "@repo/db";
import { AuthModule, RedisModule, WebhooksModule } from "@repo/services";
import { AppConfigModule } from "./config/app-config.module.js";

// Import the TRPCModule and TRPCPanelController from our package
import { TRPCModule, TRPCPanelController } from "@repo/trpc";
import { WebsocketsModule } from "./websockets/websockets.module.js";
import { PostHogModule } from "@repo/analytics";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TRPCModule,
    DatabaseModule,
    RedisModule,
    PostHogModule,
    AppConfigModule,
    AuthModule,
    WebsocketsModule,
    WebhooksModule,
  ],
  controllers: [TRPCPanelController],
  providers: [],
})
export class AppModule {}
