import {
  Controller,
  Post,
  Body,
  Headers,
  BadRequestException,
  UnauthorizedException,
  Logger,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { WebhookEvent } from "@clerk/express";
import { Webhook } from "svix";
import { PostHogService } from "../services/posthog.service.js";

// TypeScript interfaces for the Clerk webhook data
interface ClerkUserData {
  id: string;
  email_addresses?: Array<{
    email_address: string;
    verification?: { status: string };
  }>;
}

interface ClerkSessionData {
  id: string;
  user_id: string;
  device?: {
    type?: string;
    browser?: string;
  };
}

@Controller("webhooks/clerk")
export class ClerkWebhooksController {
  private readonly logger = new Logger(ClerkWebhooksController.name);

  constructor(
    private configService: ConfigService,
    private posthogService: PostHogService
  ) {}

  @Post()
  handleWebhook(
    @Headers("svix-id") svixId: string,
    @Headers("svix-timestamp") svixTimestamp: string,
    @Headers("svix-signature") svixSignature: string,
    @Body() body: Record<string, unknown>
  ) {
    // Log the raw webhook headers
    this.logger.debug(`Webhook received with headers:
      svix-id: ${svixId}
      svix-timestamp: ${svixTimestamp}
      svix-signature: ${svixSignature}
    `);

    if (!svixId || !svixTimestamp || !svixSignature) {
      throw new BadRequestException("Missing Svix headers");
    }

    // Get the webhook secret
    const webhookSecret = this.configService.get<string>(
      "CLERK_WEBHOOK_SECRET"
    );
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

    // Track the webhook event in PostHog - use void to explicitly ignore any promises
    void this.posthogService.capture("system", "clerk_webhook_received", {
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

  private handleUserCreated(event: WebhookEvent): void {
    // Type assertion for user data
    const userData = event.data as ClerkUserData;
    const userId = userData.id;
    this.logger.log(`User created: ${userId}`);

    // Track user creation event in PostHog - use void to explicitly ignore any promises
    void this.posthogService.capture(userId, "user_created", {
      source: "clerk_webhook",
      user_id: userId,
      email_verified:
        userData.email_addresses?.[0]?.verification?.status === "verified",
    });

    // Here you can add logic to create or sync a user in your database
  }

  private handleUserUpdated(event: WebhookEvent): void {
    // Type assertion for user data
    const userData = event.data as ClerkUserData;
    const userId = userData.id;
    this.logger.log(`User updated: ${userId}`);

    // Track user update event in PostHog - use void to explicitly ignore any promises
    void this.posthogService.capture(userId, "user_updated", {
      source: "clerk_webhook",
      user_id: userId,
      update_type: "profile",
    });

    // Here you can add logic to update user data in your database
  }

  private handleUserDeleted(event: WebhookEvent): void {
    // Type assertion for user data
    const userData = event.data as ClerkUserData;
    const userId = userData.id;
    this.logger.log(`User deleted: ${userId}`);

    // Track user deletion event in PostHog - use void to explicitly ignore any promises
    void this.posthogService.capture("system", "user_deleted", {
      source: "clerk_webhook",
      user_id: userId,
    });

    // Here you can add logic to delete a user from your database
  }

  private handleSessionCreated(event: WebhookEvent): void {
    // Type assertion for session data
    const sessionData = event.data as ClerkSessionData;
    const sessionId = sessionData.id;
    const userId = sessionData.user_id;
    this.logger.log(`Session created: ${sessionId} for user ${userId}`);

    // Track session creation event in PostHog - use void to explicitly ignore any promises
    void this.posthogService.capture(userId, "user_login", {
      source: "clerk_webhook",
      session_id: sessionId,
      device_type: sessionData.device?.type,
      browser: sessionData.device?.browser,
    });

    // Here you can track user sessions
  }

  private handleSessionRemoved(event: WebhookEvent): void {
    // Type assertion for session data
    const sessionData = event.data as ClerkSessionData;
    const sessionId = sessionData.id;
    const userId = sessionData.user_id;
    this.logger.log(`Session removed: ${sessionId} for user ${userId}`);

    // Track session removal event in PostHog - use void to explicitly ignore any promises
    void this.posthogService.capture(userId, "user_logout", {
      source: "clerk_webhook",
      session_id: sessionId,
    });

    // Here you can clean up any session-related data
  }
}
