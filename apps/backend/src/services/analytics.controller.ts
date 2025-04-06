import { Controller, Post, Body, Get, Logger } from "@nestjs/common";
import { PostHogService, PostHogProperties } from "./posthog.service.js";

/**
 * This controller provides endpoints for testing PostHog analytics.
 * It should only be used in development/testing environments.
 */
@Controller("analytics")
export class AnalyticsController {
  private readonly logger = new Logger(AnalyticsController.name);

  constructor(private readonly posthogService: PostHogService) {}

  /**
   * Health check endpoint to confirm the analytics service is running
   */
  @Get("health")
  healthCheck() {
    return {
      status: "ok",
      service: "analytics",
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Capture a custom event for testing purposes
   */
  @Post("capture")
  captureEvent(
    @Body()
    eventData: {
      userId: string;
      event: string;
      properties?: PostHogProperties;
    }
  ) {
    this.logger.log(
      `Capturing test event: ${eventData.event} for user: ${eventData.userId}`
    );

    try {
      this.posthogService.capture(eventData.userId, eventData.event, {
        ...eventData.properties,
        source: "test_endpoint",
        is_test: true,
      });

      return {
        success: true,
        message: `Event ${eventData.event} captured for user ${eventData.userId}`,
        timestamp: new Date().toISOString(),
      };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to capture event: ${errorMessage}`);

      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Test user identification
   */
  @Post("identify")
  identifyUser(
    @Body() userData: { userId: string; properties: PostHogProperties }
  ) {
    this.logger.log(`Identifying test user: ${userData.userId}`);

    try {
      this.posthogService.identify(userData.userId, {
        ...userData.properties,
        source: "test_endpoint",
        is_test: true,
      });

      return {
        success: true,
        message: `User ${userData.userId} identified`,
        timestamp: new Date().toISOString(),
      };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to identify user: ${errorMessage}`);

      return {
        success: false,
        error: errorMessage,
      };
    }
  }
}
