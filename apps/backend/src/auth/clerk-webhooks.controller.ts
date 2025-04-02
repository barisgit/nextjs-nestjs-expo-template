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

@Controller("webhooks/clerk")
export class ClerkWebhooksController {
  private readonly logger = new Logger(ClerkWebhooksController.name);

  constructor(private configService: ConfigService) {}

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
    this.logger.log(`User created: ${event.data.id}`);
    // Here you can add logic to create or sync a user in your database
  }

  private handleUserUpdated(event: WebhookEvent): void {
    this.logger.log(`User updated: ${event.data.id}`);
    // Here you can add logic to update user data in your database
  }

  private handleUserDeleted(event: WebhookEvent): void {
    this.logger.log(`User deleted: ${event.data.id}`);
    // Here you can add logic to delete a user from your database
  }

  private handleSessionCreated(event: WebhookEvent): void {
    this.logger.log(`Session created: ${event.data.id}`);
    // Here you can track user sessions
  }

  private handleSessionRemoved(event: WebhookEvent): void {
    this.logger.log(`Session removed: ${event.data.id}`);
    // Here you can clean up any session-related data
  }
}
