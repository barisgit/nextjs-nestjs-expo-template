import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AuthService } from "./auth.service";
import { ClerkAuthGuard } from "./clerk-auth.guard";
import { ClerkWebhooksController } from "./clerk-webhooks.controller";
import { TrpcAuthContext } from "./trpc-auth.context";
import { AuthMiddleware } from "./trpc-auth.middleware";

@Module({
  imports: [ConfigModule],
  controllers: [ClerkWebhooksController],
  providers: [AuthService, ClerkAuthGuard, TrpcAuthContext, AuthMiddleware],
  exports: [AuthService, ClerkAuthGuard, TrpcAuthContext, AuthMiddleware],
})
export class AuthModule {}
