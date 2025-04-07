import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { PostHogService } from "./posthog.service.js";

/**
 * Module for providing PostHog analytics functionality
 */
@Module({
  imports: [ConfigModule],
  providers: [PostHogService],
  exports: [PostHogService],
})
export class PostHogModule {}
