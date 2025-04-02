/**
 * Type definitions for tRPC components.
 * Helps avoid the "cannot be named without reference" TypeScript errors.
 */
import { inferRouterInputs, inferRouterOutputs } from "@trpc/server";
import { Router } from "@trpc/server/unstable-core-do-not-import";

// Type for routers - eliminates the need for explicit types
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyTRPCRouter = Router<any, any>;

// Type for middleware functions
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyMiddleware = any;

// Type for procedures
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyProcedure = any;

// Generic router input type
export type RouterInput<TRouter extends AnyTRPCRouter> =
  inferRouterInputs<TRouter>;

// Generic router output type
export type RouterOutput<TRouter extends AnyTRPCRouter> =
  inferRouterOutputs<TRouter>;
