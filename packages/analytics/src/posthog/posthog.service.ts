import { Injectable, OnModuleInit, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PostHog } from "posthog-node";

/**
 * Type for properties object to avoid using any
 */
export type PostHogProperties = Record<
  string,
  string | number | boolean | null | undefined | Record<string, unknown>
>;

/**
 * PostHog analytics service for server-side event tracking
 *
 * @class PostHogService
 * @implements {OnModuleInit}
 */
@Injectable()
export class PostHogService implements OnModuleInit {
  private client: PostHog | null = null;
  private readonly logger = new Logger(PostHogService.name);
  private initialized = false;
  private initError: Error | null = null;

  constructor(private readonly configService: ConfigService) {}

  /**
   * Initialize the PostHog client when the module is initialized
   */
  onModuleInit() {
    try {
      this.initializeClient();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Failed to initialize PostHog during module init: ${errorMessage}`
      );
      this.initError =
        error instanceof Error ? error : new Error(String(error));
    }
  }

  /**
   * Initialize the PostHog client with configuration from environment variables
   * @returns {boolean} Whether initialization was successful
   */
  private initializeClient(): boolean {
    if (this.initialized) {
      return true;
    }

    const apiKey = this.configService.get<string>("POSTHOG_API_KEY");
    const host = this.configService.get<string>(
      "POSTHOG_HOST",
      "https://app.posthog.com"
    );
    const environment = this.configService.get<string>(
      "NODE_ENV",
      "development"
    );

    // Log the configuration
    this.logger.log(`Initializing PostHog with host: ${host}`);
    this.logger.log(`API key present: ${!!apiKey}`);
    this.logger.log(`Environment: ${environment}`);

    if (!apiKey) {
      this.logger.warn(
        "PostHog API key not provided. Analytics will be disabled."
      );
      return false;
    }

    // Format the API host correctly based on the UI host
    const apiHost = host;

    try {
      this.client = new PostHog(apiKey, {
        host: apiHost,
        flushInterval: 0, // Flush immediately in a Node.js environment
        flushAt: 1, // Flush after each event (for testing)
        requestTimeout: 10000, // 10 second timeout
      });

      // Test the connection by capturing a system event
      void this.captureNonBlocking("system", "posthog_service_initialized", {
        timestamp: new Date().toISOString(),
        node_env: environment,
        version: process.env.npm_package_version || "unknown",
      });

      this.initialized = true;
      this.logger.log(
        "PostHog analytics service initialized and test event sent"
      );
      return true;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to initialize PostHog client: ${errorMessage}`);
      this.client = null;
      this.initError =
        error instanceof Error ? error : new Error(String(error));
      return false;
    }
  }

  /**
   * Get the initialization status
   * @returns {boolean} Whether the service is initialized
   */
  isInitialized(): boolean {
    return this.initialized && this.client !== null;
  }

  /**
   * Get the initialization error if any
   * @returns {Error | null} The initialization error or null
   */
  getInitError(): Error | null {
    return this.initError;
  }

  /**
   * Capture an event with the associated user
   * This is a blocking version that awaits the event capture
   *
   * @param userId - The user ID to associate with the event
   * @param event - The name of the event
   * @param properties - Additional properties to include with the event
   * @returns {Promise<boolean>} Whether the event was captured successfully
   */
  async capture(
    userId: string,
    event: string,
    properties: PostHogProperties = {}
  ): Promise<boolean> {
    if (!this.client) {
      // Try to initialize if not already initialized
      if (!this.initialized && !this.initializeClient()) {
        this.logger.debug(
          "PostHog client not initialized. Skipping event capture."
        );
        return false;
      }

      if (!this.client) {
        return false;
      }
    }

    try {
      this.logger.debug(`Capturing event: ${event} for user: ${userId}`);

      // Add standard properties
      const enrichedProperties = {
        ...properties,
        timestamp: properties["timestamp"] || new Date().toISOString(),
        captured_at: new Date().toISOString(),
        environment: this.configService.get<string>("NODE_ENV", "development"),
      };

      this.client.capture({
        distinctId: userId,
        event,
        properties: enrichedProperties,
      });

      this.logger.debug(`Event ${event} captured successfully`);

      // Force flush to ensure the event is sent immediately
      await this.client.flush();
      return true;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to capture event '${event}': ${errorMessage}`);
      return false;
    }
  }

  /**
   * Capture an event with the associated user in a non-blocking way
   * This version doesn't await the operation, making it suitable for non-critical analytics
   *
   * @param userId - The user ID to associate with the event
   * @param event - The name of the event
   * @param properties - Additional properties to include with the event
   * @returns {void}
   */
  captureNonBlocking(
    userId: string,
    event: string,
    properties: PostHogProperties = {}
  ): void {
    // Run the capture operation in the background
    void this.captureInternal(userId, event, properties);
  }

  /**
   * Internal implementation of event capture
   * @private
   */
  private async captureInternal(
    userId: string,
    event: string,
    properties: PostHogProperties = {}
  ): Promise<boolean> {
    if (!this.client) {
      // Try to initialize if not already initialized
      if (!this.initialized && !this.initializeClient()) {
        this.logger.debug(
          "PostHog client not initialized. Skipping event capture."
        );
        return false;
      }

      if (!this.client) {
        return false;
      }
    }

    try {
      this.logger.debug(`Capturing event: ${event} for user: ${userId}`);

      // Add standard properties
      const enrichedProperties = {
        ...properties,
        timestamp: properties["timestamp"] || new Date().toISOString(),
        captured_at: new Date().toISOString(),
        environment: this.configService.get<string>("NODE_ENV", "development"),
      };

      this.client.capture({
        distinctId: userId,
        event,
        properties: enrichedProperties,
      });

      this.logger.debug(`Event ${event} captured successfully`);

      // Force flush to ensure the event is sent immediately
      try {
        await this.client.flush();
      } catch (flushError) {
        const errorMessage =
          flushError instanceof Error ? flushError.message : String(flushError);
        this.logger.warn(`Non-blocking flush warning: ${errorMessage}`);
      }
      return true;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to capture event '${event}': ${errorMessage}`);
      return false;
    }
  }

  /**
   * Identify a user with specific properties
   * @param userId - The user ID to identify
   * @param properties - Properties about the user
   * @returns {Promise<boolean>} Whether the user was identified successfully
   */
  async identify(
    userId: string,
    properties: PostHogProperties = {}
  ): Promise<boolean> {
    if (!this.client) {
      // Try to initialize if not already initialized
      if (!this.initialized && !this.initializeClient()) {
        this.logger.debug(
          "PostHog client not initialized. Skipping identify call."
        );
        return false;
      }

      if (!this.client) {
        return false;
      }
    }

    try {
      this.logger.debug(`Identifying user: ${userId}`);

      // Add standard properties
      const enrichedProperties = {
        ...properties,
        timestamp: properties["timestamp"] || new Date().toISOString(),
        identified_at: new Date().toISOString(),
        environment: this.configService.get<string>("NODE_ENV", "development"),
      };

      this.client.identify({
        distinctId: userId,
        properties: enrichedProperties,
      });

      this.logger.debug(`User ${userId} identified successfully`);

      // Force flush to ensure the event is sent immediately
      await this.client.flush();
      return true;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to identify user '${userId}': ${errorMessage}`);
      return false;
    }
  }

  /**
   * Identify a user with specific properties in a non-blocking way
   * @param userId - The user ID to identify
   * @param properties - Properties about the user
   */
  identifyNonBlocking(
    userId: string,
    properties: PostHogProperties = {}
  ): void {
    void this.identifyInternal(userId, properties);
  }

  /**
   * Internal implementation of user identification
   * @private
   */
  private async identifyInternal(
    userId: string,
    properties: PostHogProperties = {}
  ): Promise<boolean> {
    if (!this.client) {
      // Try to initialize if not already initialized
      if (!this.initialized && !this.initializeClient()) {
        this.logger.debug(
          "PostHog client not initialized. Skipping identify call."
        );
        return false;
      }

      if (!this.client) {
        return false;
      }
    }

    try {
      this.logger.debug(`Identifying user: ${userId}`);

      // Add standard properties
      const enrichedProperties = {
        ...properties,
        timestamp: properties["timestamp"] || new Date().toISOString(),
        identified_at: new Date().toISOString(),
        environment: this.configService.get<string>("NODE_ENV", "development"),
      };

      this.client.identify({
        distinctId: userId,
        properties: enrichedProperties,
      });

      this.logger.debug(`User ${userId} identified successfully`);

      // Force flush to ensure the event is sent immediately
      try {
        await this.client.flush();
      } catch (flushError) {
        const errorMessage =
          flushError instanceof Error ? flushError.message : String(flushError);
        this.logger.warn(`Non-blocking flush warning: ${errorMessage}`);
      }
      return true;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to identify user '${userId}': ${errorMessage}`);
      return false;
    }
  }

  /**
   * Track a group of users
   * @param groupType - The type of group (e.g., 'company', 'team')
   * @param groupKey - The key that identifies the group
   * @param properties - Properties about the group
   * @returns {Promise<boolean>} Whether the group was tracked successfully
   */
  async groupIdentify(
    groupType: string,
    groupKey: string,
    properties: PostHogProperties = {}
  ): Promise<boolean> {
    if (!this.client) {
      // Try to initialize if not already initialized
      if (!this.initialized && !this.initializeClient()) {
        this.logger.debug(
          "PostHog client not initialized. Skipping group identify call."
        );
        return false;
      }

      if (!this.client) {
        return false;
      }
    }

    try {
      this.logger.debug(`Identifying group: ${groupType}:${groupKey}`);

      // Add standard properties
      const enrichedProperties = {
        ...properties,
        timestamp: properties["timestamp"] || new Date().toISOString(),
        identified_at: new Date().toISOString(),
        environment: this.configService.get<string>("NODE_ENV", "development"),
      };

      this.client.groupIdentify({
        groupType,
        groupKey,
        properties: enrichedProperties,
      });

      this.logger.debug(
        `Group ${groupType}:${groupKey} identified successfully`
      );

      // Force flush to ensure the event is sent immediately
      await this.client.flush();
      return true;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Failed to identify group '${groupType}:${groupKey}': ${errorMessage}`
      );
      return false;
    }
  }

  /**
   * Track a group of users in a non-blocking way
   * @param groupType - The type of group (e.g., 'company', 'team')
   * @param groupKey - The key that identifies the group
   * @param properties - Properties about the group
   */
  groupIdentifyNonBlocking(
    groupType: string,
    groupKey: string,
    properties: PostHogProperties = {}
  ): void {
    void this.groupIdentifyInternal(groupType, groupKey, properties);
  }

  /**
   * Internal implementation of group identification
   * @private
   */
  private async groupIdentifyInternal(
    groupType: string,
    groupKey: string,
    properties: PostHogProperties = {}
  ): Promise<boolean> {
    if (!this.client) {
      // Try to initialize if not already initialized
      if (!this.initialized && !this.initializeClient()) {
        this.logger.debug(
          "PostHog client not initialized. Skipping group identify call."
        );
        return false;
      }

      if (!this.client) {
        return false;
      }
    }

    try {
      this.logger.debug(`Identifying group: ${groupType}:${groupKey}`);

      // Add standard properties
      const enrichedProperties = {
        ...properties,
        timestamp: properties["timestamp"] || new Date().toISOString(),
        identified_at: new Date().toISOString(),
        environment: this.configService.get<string>("NODE_ENV", "development"),
      };

      this.client.groupIdentify({
        groupType,
        groupKey,
        properties: enrichedProperties,
      });

      this.logger.debug(
        `Group ${groupType}:${groupKey} identified successfully`
      );

      // Force flush to ensure the event is sent immediately
      try {
        await this.client.flush();
      } catch (flushError) {
        const errorMessage =
          flushError instanceof Error ? flushError.message : String(flushError);
        this.logger.warn(`Non-blocking flush warning: ${errorMessage}`);
      }
      return true;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Failed to identify group '${groupType}:${groupKey}': ${errorMessage}`
      );
      return false;
    }
  }

  /**
   * Flush all pending events to PostHog
   * Useful before application shutdown
   * @returns {Promise<boolean>} Whether the flush was successful
   */
  async flush(): Promise<boolean> {
    if (!this.client) {
      return false;
    }

    try {
      await this.client.flush();
      this.logger.log("PostHog events flushed successfully");
      return true;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to flush PostHog events: ${errorMessage}`);
      return false;
    }
  }

  /**
   * Shutdown the PostHog client
   * Should be called when the application is shutting down
   */
  async shutdown(): Promise<void> {
    if (this.client) {
      try {
        await this.flush();
        this.client.shutdown();
        this.initialized = false;
        this.client = null;
        this.logger.log("PostHog client shut down successfully");
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        this.logger.error(
          `Error shutting down PostHog client: ${errorMessage}`
        );
      }
    }
  }
}
