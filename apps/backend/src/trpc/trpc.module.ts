import { Module } from "@nestjs/common";
import { TRPCService } from "./trpc.service";
import { AuthModule } from "../auth/auth.module";
import { BasicRouter } from "./routers/base/basic.router";
import { AuthRouter } from "./routers/auth/auth.router";
import { AppRouter } from "./routers";

@Module({
  imports: [AuthModule],
  providers: [TRPCService, BasicRouter, AuthRouter, AppRouter],
  exports: [TRPCService],
})
export class TRPCModule {}
