/**
 * Type definitions for tRPC components.
 * These are utility types used internally by the implementation.
 *
 * Note: For client usage, import types from generated-router-type-export.ts instead.
 */
import type { AnyRouter } from "@trpc/server";
import type { AppRouter } from "./@generated/generated-router-type.js";
import { inferRouterInputs, inferRouterOutputs } from "@trpc/server";

// Re-export the AnyRouter type for internal use
export type { AnyRouter };

// Generic router input type - for internal use
export type RouterInput<TRouter extends AnyRouter> = inferRouterInputs<TRouter>;

// Generic router output type - for internal use
export type RouterOutput<TRouter extends AnyRouter> =
  inferRouterOutputs<TRouter>;

// Specific input/output types for the generated router - for internal use
export type AppRouterInput = RouterInput<AppRouter>;
export type AppRouterOutput = RouterOutput<AppRouter>;
