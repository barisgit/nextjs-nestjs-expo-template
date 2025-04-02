import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AuthService } from "./auth.service";
import { ClerkAuthGuard } from "./clerk-auth.guard";
import { ClerkWebhooksController } from "./clerk-webhooks.controller";

@Module({
  imports: [ConfigModule],
  controllers: [ClerkWebhooksController],
  providers: [AuthService, ClerkAuthGuard],
  exports: [AuthService, ClerkAuthGuard],
})
export class AuthModule {}
