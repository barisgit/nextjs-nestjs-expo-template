import { createTRPCReact } from "@trpc/react-query";
import { httpBatchLink, loggerLink } from "@trpc/client";
import { QueryClient } from "@tanstack/react-query";
// Adjust this import path if your monorepo structure resolves differently
// It assumes 'apps/web' can resolve '@repo/backend' via tsconfig paths
import type { AppRouter } from "@repo/backend/@generated/trpc-schema/server";

/**
 * A set of strongly-typed React hooks for your tRPC API.
 */
export const trpc = createTRPCReact<AppRouter>();

/**
 * Create a new tRPC client and query client
 */
export function createTRPCClient(): {
  queryClient: QueryClient;
  trpcClient: ReturnType<typeof trpc.createClient>;
} {
  return {
    queryClient: new QueryClient({
      defaultOptions: {
        queries: {
          refetchOnWindowFocus: false,
          staleTime: 60 * 1000, // 1 minute
        },
      },
    }),
    trpcClient: trpc.createClient({
      links: [
        loggerLink({
          enabled: (opts) =>
            process.env.NODE_ENV === "development" ||
            (opts.direction === "down" && opts.result instanceof Error),
        }),
        httpBatchLink({
          url: `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001"}/trpc`,
          // You can pass any HTTP headers you wish here
          headers() {
            return {
              // Authorization if needed: `Bearer ${getToken()}`
            };
          },
        }),
      ],
    }),
  };
}

/**
 * Export type helper for client inference
 */
export type TRPCClient = typeof trpc;
