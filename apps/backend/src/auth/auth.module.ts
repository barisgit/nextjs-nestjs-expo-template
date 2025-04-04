import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AuthService } from "@repo/services";
import { ClerkAuthGuard } from "./clerk-auth.guard.js";
import { ClerkWebhooksController } from "./clerk-webhooks.controller.js";

@Module({
  imports: [ConfigModule],
  controllers: [ClerkWebhooksController],
  providers: [AuthService, ClerkAuthGuard],
  exports: [AuthService, ClerkAuthGuard],
})
export class AuthModule {}
