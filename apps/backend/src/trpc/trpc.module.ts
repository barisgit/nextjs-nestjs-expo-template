import { Module } from "@nestjs/common";
import { TrpcService } from "./trpc.service";
import { TrpcController } from "./trpc.controller";
import { QuestionsModule } from "../questions/questions.module";

@Module({
  imports: [QuestionsModule],
  providers: [TrpcService],
  controllers: [TrpcController],
})
export class TrpcModule {}
