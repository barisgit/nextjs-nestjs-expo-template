import { Injectable, Logger } from "@nestjs/common";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { NestExpressApplication } from "@nestjs/platform-express";
import { AuthService } from "@repo/services";
import { Request, Response } from "express";
import { AppRouterClass } from "./routers/index.js";
import { AuthData, TRPCContext } from "./context/index.js";
import { Redis } from "ioredis";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class TRPCService {
  private readonly logger = new Logger(TRPCService.name);
  private readonly redis: Redis;
  private readonly TOKEN_EXPIRY = 5 * 60; // 5 minutes in seconds
  private readonly useRedisCaching: boolean;

  constructor(
    private readonly authService: AuthService,
    private readonly appRouterService: AppRouterClass,
    private readonly configService: ConfigService
  ) {
    // Check if Redis caching should be enabled (default: true)
    this.useRedisCaching = this.configService.get<boolean>(
      "USE_REDIS_CACHING",
      true
    );

    if (!this.useRedisCaching) {
      this.logger.warn(
        "⚠️ Redis caching is DISABLED - auth performance will be slower"
      );
      return;
    }

    // Initialize Redis client using ConfigService
    const redisConfig = {
      host: this.configService.get<string>("REDIS_HOST", "localhost"),
      port: this.configService.get<number>("REDIS_PORT", 6379),
      password: this.configService.get<string>("REDIS_PASSWORD", ""),
    };

    // Use REDIS_URL if available, otherwise build from individual config values
    const redisUrl = this.configService.get<string>("REDIS_URL");

    if (redisUrl) {
      this.redis = new Redis(redisUrl, {
        maxRetriesPerRequest: 3,
        connectTimeout: 500, // shorter timeout for faster startup
      });
    } else {
      this.redis = new Redis({
        ...redisConfig,
        maxRetriesPerRequest: 3,
        connectTimeout: 500,
        retryStrategy: (times) => {
          const delay = Math.min(times * 50, 2000);
          return delay;
        },
      });
    }

    this.redis.on("error", (err: Error) => {
      this.logger.error(`Redis connection error: ${err.message}`);
    });

    this.redis.on("connect", () => {
      this.logger.log("Successfully connected to Redis");
    });
  }

  // Create context for each request
  private async createContext({
    req,
    res,
  }: {
    req: Request;
    res: Response;
  }): Promise<TRPCContext> {
    // Default context with request and response
    const context: TRPCContext = {
      req,
      res,
      auth: {
        userId: null,
        isAuthenticated: false,
        user: null,
      },
    };

    // Extract token from authorization header
    const authHeader = req?.headers?.authorization;
    if (!authHeader) {
      return context;
    }

    const [type, token] = authHeader.split(" ");
    if (type !== "Bearer" || !token) {
      return context;
    }

    try {
      // Check Redis cache first if enabled
      if (this.useRedisCaching && this.redis) {
        const cacheKey = `auth:token:${token}`;
        const cachedAuth = await this.redis.get(cacheKey);

        if (cachedAuth) {
          // Use cached auth data if available
          context.auth = JSON.parse(cachedAuth);
          return context;
        }
      }

      // Validate the session token
      const isValid = await this.authService.validateSession(token);

      if (isValid) {
        // Get the user from the token
        const user = await this.authService.getUserFromToken(token);

        if (user) {
          const authData: AuthData = {
            userId: user.id,
            isAuthenticated: true,
            user: {
              id: user.id,
              firstName: user.firstName,
              lastName: user.lastName,
              email: user.emailAddresses[0]?.emailAddress || null,
              imageUrl: user.imageUrl,
            },
          };

          context.auth = authData;

          // Cache the auth data in Redis if enabled
          if (this.useRedisCaching && this.redis) {
            const cacheKey = `auth:token:${token}`;
            await this.redis.set(
              cacheKey,
              JSON.stringify(authData),
              "EX",
              this.TOKEN_EXPIRY
            );
          }
        }
      }
    } catch {
      // Handle error but don't log on every request
    }

    return context;
  }

  // Get the router instance
  public get router() {
    return this.appRouterService.router;
  }

  // Apply middleware to NestJS app
  applyMiddleware(app: NestExpressApplication) {
    this.logger.log("Applying tRPC middleware to NestJS application");
    app.use(
      "/trpc",
      createExpressMiddleware({
        router: this.router,
        createContext: ({ req, res }) => this.createContext({ req, res }),
      })
    );
    this.logger.log("tRPC middleware applied successfully");
  }
}
