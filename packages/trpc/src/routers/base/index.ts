import { Logger } from "@nestjs/common";
import { initTRPC, TRPCError } from "@trpc/server";
import { TRPCContext } from "../../context/index.js";
import { AnyMiddleware } from "../../types.js";
import superjson from "superjson";

const logger = new Logger("TRPCBaseRouter");

// Initialize tRPC
export const t = initTRPC.context<TRPCContext>().create({
  transformer: superjson,
});

// Create middleware to check authentication
export const isAuthed = t.middleware(({ ctx, next, path }): AnyMiddleware => {
  if (!ctx.auth?.isAuthenticated) {
    logger.warn(`Unauthorized access attempt to ${path}`);
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You must be logged in to access this resource",
    });
  }
  return next({
    ctx: {
      ...ctx,
      // Add user info to context
      user: ctx.auth.user,
    },
  });
});

// Define base procedure
export const procedure = t.procedure;

// Define protected procedure (requires authentication)
export const protectedProcedure = procedure.use(isAuthed);
