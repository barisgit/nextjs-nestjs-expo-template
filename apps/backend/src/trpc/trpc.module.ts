import { Module } from "@nestjs/common";
import { TRPCService } from "./trpc.service.js";
import { AuthModule } from "../auth/auth.module.js";
import { AppRouter } from "./routers/index.js";
import { BasicRouter } from "./routers/routers/basic.router.js";
import { AuthRouter } from "./routers/routers/auth.router.js";

@Module({
  imports: [AuthModule],
  providers: [TRPCService, AppRouter, BasicRouter, AuthRouter],
  exports: [TRPCService],
})
export class TRPCModule {}
