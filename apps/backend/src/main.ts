import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module.js";
import { Logger, ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestExpressApplication } from "@nestjs/platform-express";
import { TRPCService } from "@repo/trpc";
import * as os from "os";

async function bootstrap() {
  // Create the application with minimal logging in production
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger:
      process.env.NODE_ENV === "production"
        ? ["error", "warn"]
        : ["error", "warn", "log", "debug", "verbose"],
    // Improve startup performance
    abortOnError: false,
    bufferLogs: true,
  });

  const logger = new Logger("Bootstrap");

  // Get ConfigService instance
  const configService = app.get(ConfigService);

  // Enable ValidationPipe globally with performance optimizations
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: false,
    })
  );

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

  // Apply tRPC middleware
  const trpcService = app.get(TRPCService);
  trpcService.applyMiddleware(app);

  // Use getOrThrow - it expects the value to be defined
  // due to the validation schema having defaults.
  const port = configService.getOrThrow<number>("PORT");

  // Get local IP address
  let localIp = "localhost";
  const networkInterfaces = os.networkInterfaces();

  // Find the first non-internal IPv4 address
  Object.keys(networkInterfaces).forEach((interfaceName) => {
    const interfaces = networkInterfaces[interfaceName];
    if (interfaces) {
      for (const iface of interfaces) {
        if (iface.family === "IPv4" && !iface.internal) {
          localIp = iface.address;
          return; // Exit the inner loop once found
        }
      }
    }
  });

  await app.listen(port, "0.0.0.0");

  logger.log(
    `🚀 Application is running on: http://localhost:${port}/ and http://${localIp}:${port}/`
  );
  logger.log(`tRPC Panel available at: http://localhost:${port}/panel`);
}

bootstrap().catch((error) => {
  Logger.error("Failed to bootstrap application:", error);
  // Note: process.exit(1) is removed as it might not be available in all environments
  // Consider more robust error handling or logging if needed.
});
