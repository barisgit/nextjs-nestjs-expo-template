// Re-export the router type for external use
import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";
import { appRouter } from "./router";

export type AppRouter = typeof appRouter;

export type RouterInputs = inferRouterInputs<AppRouter>;
export type RouterOutputs = inferRouterOutputs<AppRouter>;

// Re-export utilities
export * from "./trpc";
export { appRouter } from "./router";
