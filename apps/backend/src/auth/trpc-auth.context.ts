import { Injectable, Logger } from "@nestjs/common";
import { ContextOptions, TRPCContext } from "nestjs-trpc";
import { AuthService } from "./auth.service";
import { Request, Response } from "express";

// Define auth data structure separately
export interface AuthData {
  userId: string | null;
  isAuthenticated: boolean;
  user?: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string | null;
    imageUrl: string | null;
  } | null;
}

@Injectable()
export class TrpcAuthContext implements TRPCContext {
  private readonly logger = new Logger(TrpcAuthContext.name);

  constructor(private readonly authService: AuthService) {}

  async create(opts: ContextOptions): Promise<Record<string, unknown>> {
    const req = opts.req as Request;
    const res = opts.res as Response;

    // Default context with request and response
    const context: Record<string, unknown> = {
      req,
      res,
      auth: {
        userId: null,
        isAuthenticated: false,
        user: null,
      } as AuthData,
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

    return {
      ...context,
      req,
      res,
    };
  }
}
