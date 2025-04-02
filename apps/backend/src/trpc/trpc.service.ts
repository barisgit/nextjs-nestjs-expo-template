import { Injectable, Logger } from "@nestjs/common";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { NestExpressApplication } from "@nestjs/platform-express";
import { AuthService } from "../auth/auth.service.js";
import { Request, Response } from "express";
import { AppRouter } from "./routers/index.js";
import { AuthData, TRPCContext } from "./context/index.js";
import { type AppRouter as AppRouterType } from "./@generated/generated-router-type.js";

@Injectable()
export class TRPCService {
  private readonly logger = new Logger(TRPCService.name);

  constructor(
    private readonly authService: AuthService,
    private readonly appRouterService: AppRouter
  ) {}

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
      this.logger.warn("Invalid authorization header format");
      return context;
    }

    try {
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
        } else {
          this.logger.warn(
            "Token validation succeeded but user retrieval failed"
          );
        }
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Error validating auth token: ${errorMessage}`,
        error instanceof Error ? error.stack : undefined
      );
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
        router: this.router as AppRouterType,
        createContext: ({ req, res }) => this.createContext({ req, res }),
      })
    );
    this.logger.log("tRPC middleware applied successfully");
  }
}
