import { Inject, Injectable, Logger } from "@nestjs/common";
import { Router, Query, UseMiddlewares, Ctx } from "nestjs-trpc";
import { AuthService } from "./auth.service";
import { z } from "zod";
import { AuthMiddleware } from "./trpc-auth.middleware";
import { AuthData, TrpcAuthContext } from "./trpc-auth.context";
import { TRPCError } from "@trpc/server";

@Router({ alias: "auth" })
@Injectable()
export class AuthRouter {
  private readonly logger = new Logger(AuthRouter.name);

  constructor(
    @Inject(TrpcAuthContext) private readonly authService: AuthService
  ) {}

  // Get the current user - protected route requiring authentication
  @UseMiddlewares(AuthMiddleware)
  @Query({
    output: z.object({
      id: z.string(),
      firstName: z.string().nullable(),
      lastName: z.string().nullable(),
      email: z.string().nullable(),
      imageUrl: z.string().nullable(),
    }),
  })
  me(@Ctx() ctx: Record<string, unknown>) {
    this.logger.debug("me procedure called");

    try {
      // Get auth data from context - need to access it from ctx parameter
      // Instead of casting directly, first check that ctx.auth exists
      if (!ctx || !("auth" in ctx)) {
        this.logger.error("Context or auth property missing");
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Context or auth property is missing",
        });
      }

      const auth = ctx.auth as AuthData;

      if (!auth || !auth.user) {
        this.logger.error("Auth or user data missing after middleware check");
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Authentication data is missing",
        });
      }

      // Return the user data
      return {
        id: auth.user.id,
        firstName: auth.user.firstName,
        lastName: auth.user.lastName,
        email: auth.user.email,
        imageUrl: auth.user.imageUrl,
      };
    } catch (error) {
      this.logger.error(
        `Error in me procedure: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined
      );
      throw error;
    }
  }

  // Public endpoint to check authentication status
  @Query({
    output: z.object({
      isAuthenticated: z.boolean(),
      user: z
        .object({
          id: z.string(),
          firstName: z.string().nullable(),
          lastName: z.string().nullable(),
          email: z.string().nullable(),
          imageUrl: z.string().nullable(),
        })
        .nullable(),
    }),
  })
  authStatus(@Ctx() ctx: Record<string, unknown>) {
    this.logger.debug("authStatus query called");

    try {
      // Get auth data from context
      const auth = ctx.auth as AuthData | undefined;

      if (!auth) {
        this.logger.warn("Auth data is missing in context");
        return {
          isAuthenticated: false,
          user: null,
        };
      }

      return {
        isAuthenticated: auth.isAuthenticated,
        user: auth.user || null,
      };
    } catch (error) {
      this.logger.error(
        `Error in authStatus procedure: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined
      );

      return {
        isAuthenticated: false,
        user: null,
      };
    }
  }
}
