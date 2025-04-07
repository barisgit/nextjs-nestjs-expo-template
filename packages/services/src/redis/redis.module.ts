import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { RedisService } from "./redis.service.js";

/**
 * Module for providing Redis functionality
 */
@Module({
  imports: [ConfigModule],
  providers: [RedisService],
  exports: [RedisService],
})
export class RedisModule {}
