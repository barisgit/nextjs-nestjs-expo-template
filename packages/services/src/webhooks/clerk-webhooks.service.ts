import {
  Injectable,
  Logger,
  BadRequestException,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Webhook } from "svix";
import { PostHogService } from "@repo/analytics";

/**
 * TypeScript interfaces for the Clerk webhook data
 */
export interface WebhookEvent {
  type: string;
  data: unknown;
}

export interface ClerkUserData {
  id: string;
  email_addresses?: Array<{
    email_address: string;
    verification?: { status: string };
  }>;
}

export interface ClerkSessionData {
  id: string;
  user_id: string;
  device?: {
    type?: string;
    browser?: string;
  };
}

/**
 * Service for processing Clerk webhook events
 */
@Injectable()
export class ClerkWebhooksService {
  private readonly logger = new Logger(ClerkWebhooksService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly posthogService: PostHogService
  ) {}

  /**
   * Process a Clerk webhook event
   *
   * @param svixId - The Svix ID header
   * @param svixTimestamp - The Svix timestamp header
   * @param svixSignature - The Svix signature header
   * @param body - The webhook payload
   * @returns Object with received status
   */
  processWebhook(
    svixId: string,
    svixTimestamp: string,
    svixSignature: string,
    body: Record<string, unknown>
  ): { received: boolean } {
    // Log the raw webhook headers
    this.logger.debug(`Webhook received with headers:
      svix-id: ${svixId}
      svix-timestamp: ${svixTimestamp}
      svix-signature: ${svixSignature}
    `);

    this.logger.debug(
      `Received Clerk webhook with body of type ${typeof body}`
    );

    if (!svixId || !svixTimestamp || !svixSignature) {
      throw new BadRequestException("Missing Svix headers");
    }

    // Get the webhook secret
    const webhookSecret = this.configService.get<string>(
      "CLERK_WEBHOOK_SECRET"
    );

    // ---- TEMPORARY DEBUG LOG ----
    this.logger.debug(`Retrieved CLERK_WEBHOOK_SECRET: '${webhookSecret}'`);
    // -----------------------------

    if (!webhookSecret) {
      this.logger.error("CLERK_WEBHOOK_SECRET is not set");
      throw new BadRequestException("Webhook secret not configured");
    }

    const isDevelopment =
      this.configService.get<string>("NODE_ENV") === "development";
    const bypassSignatureCheck =
      isDevelopment &&
      this.configService.get<string>("BYPASS_WEBHOOK_SIGNATURE") === "true";

    if (bypassSignatureCheck) {
      this.logger.warn(
        "⚠️ Bypassing webhook signature verification - FOR DEVELOPMENT ONLY"
      );
    } else {
      try {
        // Use the svix library for verification
        const wh = new Webhook(webhookSecret);

        // Convert body to JSON string for verification
        const payload = JSON.stringify(body);

        // Verify with svix library
        wh.verify(payload, {
          "svix-id": svixId,
          "svix-timestamp": svixTimestamp,
          "svix-signature": svixSignature,
        });

        this.logger.debug("Webhook signature verified successfully");
      } catch (error) {
        this.logger.error(
          `Error verifying webhook: ${error instanceof Error ? error.message : String(error)}`
        );
        throw new UnauthorizedException("Invalid signature");
      }
    }

    // Signature is valid, process the webhook
    const eventType = body.type as string;
    this.logger.log(`Received Clerk webhook: ${eventType}`);
    const event = body as unknown as WebhookEvent;

    // Track the webhook event in PostHog - using non-blocking method
    this.posthogService.captureNonBlocking("system", "clerk_webhook_received", {
      event_type: eventType,
      webhook_id: svixId,
    });

    // Process different webhook events
    switch (event.type) {
      case "user.created":
        this.handleUserCreated(event);
        break;
      case "user.updated":
        this.handleUserUpdated(event);
        break;
      case "user.deleted":
        this.handleUserDeleted(event);
        break;
      case "session.created":
        this.handleSessionCreated(event);
        break;
      case "session.removed":
        this.handleSessionRemoved(event);
        break;
      default:
        this.logger.log(`Unhandled webhook type: ${event.type}`);
    }

    return { received: true };
  }

  /**
   * Handle user created events
   * @param event - The webhook event
   */
  private handleUserCreated(event: WebhookEvent): void {
    // Type assertion for user data
    const userData = event.data as ClerkUserData;
    const userId = userData.id;
    this.logger.log(`User created: ${userId}`);

    // Track user creation event in PostHog - using non-blocking method
    this.posthogService.captureNonBlocking(userId, "user_created", {
      source: "clerk_webhook",
      user_id: userId,
      email_verified:
        userData.email_addresses?.[0]?.verification?.status === "verified",
    });

    // Here you can add logic to create or sync a user in your database
  }

  /**
   * Handle user updated events
   * @param event - The webhook event
   */
  private handleUserUpdated(event: WebhookEvent): void {
    // Type assertion for user data
    const userData = event.data as ClerkUserData;
    const userId = userData.id;
    this.logger.log(`User updated: ${userId}`);

    // Track user update event in PostHog - using non-blocking method
    this.posthogService.captureNonBlocking(userId, "user_updated", {
      source: "clerk_webhook",
      user_id: userId,
      update_type: "profile",
    });

    // Here you can add logic to update user data in your database
  }

  /**
   * Handle user deleted events
   * @param event - The webhook event
   */
  private handleUserDeleted(event: WebhookEvent): void {
    // Type assertion for user data
    const userData = event.data as ClerkUserData;
    const userId = userData.id;
    this.logger.log(`User deleted: ${userId}`);

    // Track user deletion event in PostHog - using non-blocking method
    this.posthogService.captureNonBlocking("system", "user_deleted", {
      source: "clerk_webhook",
      user_id: userId,
    });

    // Here you can add logic to delete a user from your database
  }

  /**
   * Handle session created events
   * @param event - The webhook event
   */
  private handleSessionCreated(event: WebhookEvent): void {
    // Type assertion for session data
    const sessionData = event.data as ClerkSessionData;
    const sessionId = sessionData.id;
    const userId = sessionData.user_id;
    this.logger.log(`Session created: ${sessionId} for user ${userId}`);

    // Track session creation event in PostHog - using non-blocking method
    this.posthogService.captureNonBlocking(userId, "user_login", {
      source: "clerk_webhook",
      session_id: sessionId,
      device_type: sessionData.device?.type,
      browser: sessionData.device?.browser,
    });

    // Here you can track user sessions
  }

  /**
   * Handle session removed events
   * @param event - The webhook event
   */
  private handleSessionRemoved(event: WebhookEvent): void {
    // Type assertion for session data
    const sessionData = event.data as ClerkSessionData;
    const sessionId = sessionData.id;
    const userId = sessionData.user_id;
    this.logger.log(`Session removed: ${sessionId} for user ${userId}`);

    // Track session removal event in PostHog - using non-blocking method
    this.posthogService.captureNonBlocking(userId, "user_logout", {
      source: "clerk_webhook",
      session_id: sessionId,
    });

    // Here you can clean up any session-related data
  }
}
