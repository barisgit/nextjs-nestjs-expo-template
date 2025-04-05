import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module.js";
import { Logger, ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestExpressApplication } from "@nestjs/platform-express";
import { TRPCService } from "@repo/trpc";

async function bootstrap() {
  // Create the application with verbose logging
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: ["error", "warn", "log", "debug", "verbose"],
  });

  const logger = new Logger("Bootstrap");
  logger.log("Starting application...");

  // Get ConfigService instance
  const configService = app.get(ConfigService);
  // Enable ValidationPipe globally (optional but recommended for request validation)
  app.useGlobalPipes(new ValidationPipe());

  // Configure CORS
  app.enableCors({
    origin: [
      "http://localhost:3000", // Next.js app
      "http://localhost:3001", // Backend
      // Add other origins if needed, potentially from config
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  });
  logger.log("CORS enabled");

  // Apply tRPC middleware
  const trpcService = app.get(TRPCService);
  trpcService.applyMiddleware(app);
  logger.log("tRPC middleware applied");

  // Use getOrThrow - it expects the value to be defined
  // due to the validation schema having defaults.
  // This should not throw an error unless something is very wrong.
  const port = configService.getOrThrow<number>("PORT");

  await app.listen(port);

  logger.log(`🚀 Application is running on: http://localhost:${port}/`);
  logger.log(`tRPC Panel available at: http://localhost:${port}/panel`);
}

bootstrap().catch((error) => {
  Logger.error("Failed to bootstrap application:", error);
  // Note: process.exit(1) is removed as it might not be available in all environments
  // Consider more robust error handling or logging if needed.
});
