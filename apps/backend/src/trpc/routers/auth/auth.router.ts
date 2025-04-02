import { Injectable, Logger } from "@nestjs/common";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { AuthService } from "../../../auth/auth.service";
import { procedure, protectedProcedure, t } from "../base";
import { AnyTRPCRouter } from "../../types";

@Injectable()
export class AuthRouter {
  private readonly logger = new Logger(AuthRouter.name);

  constructor(private readonly authService: AuthService) {}

  public readonly router: AnyTRPCRouter = t.router({
    // Get current user (public endpoint but returns auth state)
    getUser: procedure.query(({ ctx }) => {
      return {
        user: ctx.auth.user,
        isAuthenticated: ctx.auth.isAuthenticated,
      };
    }),

    // Verify if a session token is valid
    verifySession: procedure
      .input(z.object({ token: z.string() }))
      .mutation(async ({ input }) => {
        const isValid = await this.authService.validateSession(input.token);
        return { valid: isValid };
      }),

    // Get user details (protected endpoint)
    getUserDetails: protectedProcedure.query(async ({ ctx }) => {
      if (!ctx.auth.userId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "User ID is missing",
        });
      }

      const user = await this.authService.getUserById(ctx.auth.userId);
      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      return {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.emailAddresses[0]?.emailAddress || null,
        imageUrl: user.imageUrl,
        createdAt: user.createdAt,
        username: user.username,
      };
    }),
  });
}
