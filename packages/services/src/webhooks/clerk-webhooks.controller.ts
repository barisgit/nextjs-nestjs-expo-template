import { Controller, Post, Body, Headers, Logger } from "@nestjs/common";
import { ClerkWebhooksService } from "./clerk-webhooks.service.js";

/**
 * Controller for handling Clerk webhook events
 * This can be imported into any NestJS application
 */
@Controller("webhooks/clerk")
export class ClerkWebhooksController {
  private readonly logger = new Logger(ClerkWebhooksController.name);

  constructor(private readonly webhooksService: ClerkWebhooksService) {}

  /**
   * Handle webhook POST requests from Clerk
   *
   * @param svixId - The Svix ID header
   * @param svixTimestamp - The Svix timestamp header
   * @param svixSignature - The Svix signature header
   * @param body - The webhook payload
   * @returns Object with received status
   */
  @Post()
  handleWebhook(
    @Headers("svix-id") svixId: string,
    @Headers("svix-timestamp") svixTimestamp: string,
    @Headers("svix-signature") svixSignature: string,
    @Body() body: Record<string, unknown>
  ) {
    this.logger.debug("Received Clerk webhook, forwarding to service");
    return this.webhooksService.processWebhook(
      svixId,
      svixTimestamp,
      svixSignature,
      body
    );
  }
}
