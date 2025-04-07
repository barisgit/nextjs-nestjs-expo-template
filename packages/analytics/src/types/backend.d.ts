declare module "@repo/analytics" {
  import { Module } from "@nestjs/common";
  import { WebhookEvent } from "@clerk/express";

  export class PostHogService {
    capture(
      userId: string,
      event: string,
      properties?: Record<string, unknown>
    ): Promise<boolean>;
    identify(
      userId: string,
      properties?: Record<string, unknown>
    ): Promise<boolean>;
    groupIdentify(
      groupType: string,
      groupKey: string,
      properties?: Record<string, unknown>
    ): Promise<boolean>;
    flush(): Promise<boolean>;
    shutdown(): Promise<void>;
    isInitialized(): boolean;
    getInitError(): Error | null;
  }

  export class PostHogModule extends Module {}

  export class WebhooksService {
    handleClerkWebhook(event: WebhookEvent): Promise<boolean>;
  }

  export class WebhooksModule extends Module {}
}
