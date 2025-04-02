/**
 * This file contains type definitions for client applications
 * that consume the tRPC API. It should be imported by frontend
 * applications to get proper type inference for tRPC calls.
 */
import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";
import type { TRPCService } from "./trpc.service";

/**
 * Typings for tRPC router inputs
 */
export type RouterInputs = inferRouterInputs<
  ReturnType<TRPCService["getRouterType"]>
>;

/**
 * Typings for tRPC router outputs
 */
export type RouterOutputs = inferRouterOutputs<
  ReturnType<TRPCService["getRouterType"]>
>;
