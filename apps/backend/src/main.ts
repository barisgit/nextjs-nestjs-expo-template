import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { Logger, ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

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

  // Use getOrThrow - it expects the value to be defined
  // due to the validation schema having defaults.
  // This should not throw an error unless something is very wrong.
  const port = configService.getOrThrow<number>("PORT");

  await app.listen(port);

  Logger.log(`🚀 Application is running on: http://localhost:${port}/`);
}

bootstrap().catch((error) => {
  Logger.error("Failed to bootstrap application:", error);
  // Note: process.exit(1) is removed as it might not be available in all environments
  // Consider more robust error handling or logging if needed.
});
