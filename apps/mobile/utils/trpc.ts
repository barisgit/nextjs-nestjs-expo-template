import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "@repo/trpc";
import superjson from "superjson";
import { QueryClient } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import { env } from "./env";

// Create tRPC client with react-query integration
export const trpc = createTRPCReact<AppRouter>();

// Create query client for TanStack Query
export const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minute
        gcTime: 10 * 60 * 1000, // 10 minutes
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  });

// Configuration for API URL
const API_URL = env.EXPO_PUBLIC_TRPC_URL;

// Create tRPC client
export const createTRPCClient = (token?: string) => {
  return trpc.createClient({
    links: [
      httpBatchLink({
        url: API_URL,
        headers: async () => {
          return {
            authorization: token ? `Bearer ${token}` : "",
          };
        },
        transformer: superjson,
      }),
    ],
  });
};
