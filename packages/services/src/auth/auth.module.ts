import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AuthService } from "./auth.service.js";
import { ClerkAuthGuard } from "./clerk-auth.guard.js";
import { PostHogModule } from "@repo/analytics";

/**
 * Module for providing authentication services
 */
@Module({
  imports: [ConfigModule, PostHogModule],
  providers: [AuthService, ClerkAuthGuard],
  exports: [AuthService, ClerkAuthGuard],
})
export class AuthModule {}
