import { Module } from "@nestjs/common";
import { TRPCService } from "./trpc.service.js";
import { AuthModule } from "../auth/auth.module.js";
import { AppRouter } from "./routers/index.js";
import { flattenedTrpcRouters } from "./routers/_list.js";

@Module({
  imports: [AuthModule],
  providers: [TRPCService, AppRouter, ...flattenedTrpcRouters],
  exports: [TRPCService],
})
export class TRPCModule {}
