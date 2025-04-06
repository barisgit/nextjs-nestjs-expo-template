import { Module, Global } from "@nestjs/common";
import { PostHogService } from "./posthog.service.js";
import { AnalyticsController } from "./analytics.controller.js";

@Global() // Make this module global so its providers are available everywhere
@Module({
  controllers: [AnalyticsController],
  providers: [PostHogService],
  exports: [PostHogService], // Export PostHogService so it can be used by other modules
})
export class AnalyticsModule {}
