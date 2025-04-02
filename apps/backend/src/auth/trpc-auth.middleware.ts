import { Injectable, Logger } from "@nestjs/common";
import {
  TRPCMiddleware,
  MiddlewareOptions,
  MiddlewareResponse,
} from "nestjs-trpc";
import { TRPCError } from "@trpc/server";
import { AuthData } from "./trpc-auth.context";

@Injectable()
export class AuthMiddleware implements TRPCMiddleware {
  private readonly logger = new Logger(AuthMiddleware.name);

  use(
    opts: MiddlewareOptions<object>
  ): MiddlewareResponse | Promise<MiddlewareResponse> {
    const { next, ctx, path } = opts;

    // Get auth data from context by casting to Record<string, unknown>
    const contextRecord = ctx as Record<string, unknown>;
    const auth = contextRecord.auth as AuthData | undefined;

    // Only log unauthorized attempts or errors
    if (!auth?.isAuthenticated) {
      this.logger.warn(`Unauthorized access attempt to ${path}`);
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "You must be logged in to access this resource",
      });
    }

    // User is authenticated, proceed to the next middleware or procedure
    return next();
  }
}
