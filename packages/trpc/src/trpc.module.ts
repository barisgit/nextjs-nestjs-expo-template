import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TRPCService } from "./trpc.service.js";
import { AppRouterClass } from "./routers/index.js";
import { BasicRouter } from "./routers/routers/basic.router.js";
import { AuthRouter } from "./routers/routers/auth.router.js";
import { AuthService } from "@repo/services";

@Module({
  imports: [ConfigModule],
  providers: [
    TRPCService,
    AppRouterClass,
    BasicRouter,
    AuthRouter,
    AuthService,
  ],
  exports: [TRPCService],
})
export class TRPCModule {}
