import { Injectable, OnModuleInit, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PostHog } from "posthog-node";

/**
 * Type for properties object to avoid using any
 */
export type PostHogProperties = Record<
  string,
  string | number | boolean | null | undefined
>;

@Injectable()
export class PostHogService implements OnModuleInit {
  private client: PostHog | null = null;
  private readonly logger = new Logger(PostHogService.name);

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    const apiKey = this.configService.get<string>("POSTHOG_API_KEY");
    const host = this.configService.get<string>(
      "POSTHOG_HOST",
      "https://app.posthog.com"
    );

    // Log the configuration
    this.logger.log(`Initializing PostHog with host: ${host}`);
    this.logger.log(`API key present: ${!!apiKey}`);

    if (!apiKey) {
      this.logger.warn(
        "PostHog API key not provided. Analytics will be disabled."
      );
      return;
    }

    // Make sure we're using the correct host format for the Node.js SDK
    let apiHost = host;
    // if (host.includes("eu.i.posthog.com")) {
    //   // The Node.js client needs the API host, not the UI host
    //   apiHost = "https://eu.api.posthog.com";
    //   this.logger.log(`Using EU API endpoint: ${apiHost}`);
    // } else if (host.includes("app.posthog.com")) {
    //   apiHost = "https://api.posthog.com";
    //   this.logger.log(`Using US API endpoint: ${apiHost}`);
    // }

    try {
      this.client = new PostHog(apiKey, {
        host: apiHost,
        flushInterval: 0, // Flush immediately in a Node.js environment
        flushAt: 1, // Flush after each event (for testing)
        requestTimeout: 10000, // 10 second timeout
      });

      // Test the connection by capturing a system event
      this.client.capture({
        distinctId: "system",
        event: "posthog_service_initialized",
        properties: {
          timestamp: new Date().toISOString(),
          node_env: this.configService.get<string>("NODE_ENV"),
        },
      });

      this.logger.log(
        "PostHog analytics service initialized and test event sent"
      );
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to initialize PostHog client: ${errorMessage}`);
      this.client = null;
    }
  }

  /**
   * Capture an event with the associated user
   * @param userId - The user ID to associate with the event
   * @param event - The name of the event
   * @param properties - Additional properties to include with the event
   */
  capture(userId: string, event: string, properties: PostHogProperties = {}) {
    if (!this.client) {
      this.logger.debug(
        "PostHog client not initialized. Skipping event capture."
      );
      return;
    }

    try {
      this.logger.debug(`Capturing event: ${event} for user: ${userId}`);
      this.client.capture({
        distinctId: userId,
        event,
        properties: {
          ...properties,
          timestamp: properties["timestamp"] || new Date().toISOString(),
          captured_at: new Date().toISOString(),
        },
      });

      this.logger.debug(`Event ${event} captured successfully`);
      // Force flush to ensure the event is sent immediately (good for testing)
      void this.client.flush();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to capture event '${event}': ${errorMessage}`);
    }
  }

  /**
   * Identify a user with specific properties
   * @param userId - The user ID to identify
   * @param properties - Properties about the user
   */
  identify(userId: string, properties: PostHogProperties = {}) {
    if (!this.client) {
      this.logger.debug(
        "PostHog client not initialized. Skipping identify call."
      );
      return;
    }

    try {
      this.logger.debug(`Identifying user: ${userId}`);
      this.client.identify({
        distinctId: userId,
        properties: {
          ...properties,
          timestamp: properties["timestamp"] || new Date().toISOString(),
          identified_at: new Date().toISOString(),
        },
      });

      this.logger.debug(`User ${userId} identified successfully`);
      // Force flush to ensure the event is sent immediately (good for testing)
      void this.client.flush();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to identify user '${userId}': ${errorMessage}`);
    }
  }

  /**
   * Flush all pending events to PostHog
   * Useful before application shutdown
   */
  flush() {
    if (this.client) {
      try {
        // We use void to indicate we're intentionally ignoring the result
        void this.client.flush();
        this.logger.log("PostHog events flushed successfully");
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        this.logger.error(`Failed to flush PostHog events: ${errorMessage}`);
      }
    }
  }
}
