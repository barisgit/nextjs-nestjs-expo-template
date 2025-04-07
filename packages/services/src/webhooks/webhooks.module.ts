import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ClerkWebhooksService } from "./clerk-webhooks.service.js";
import { ClerkWebhooksController } from "./clerk-webhooks.controller.js";
import { PostHogModule } from "@repo/analytics";

/**
 * Module for providing webhook processing functionality
 */
@Module({
  imports: [ConfigModule, PostHogModule],
  providers: [ClerkWebhooksService],
  controllers: [ClerkWebhooksController],
  exports: [ClerkWebhooksService],
})
export class WebhooksModule {}
