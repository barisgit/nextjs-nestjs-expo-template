import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { DatabaseModule } from "@repo/db";
import { AuthModule, RedisModule, WebhooksModule } from "@repo/services";
import { AppConfigModule } from "./config/app-config.module.js";

import { TRPCModule, TRPCPanelController } from "@repo/trpc";
import { PostHogModule } from "@repo/analytics";
import { WebsocketsModule } from "@repo/websockets/server";
import { HealthModule } from "./health/health.module.js";

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
    HealthModule,
  ],
  controllers: [TRPCPanelController],
  providers: [],
})
export class AppModule {}
