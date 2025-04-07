import { createTRPCContext } from "@trpc/tanstack-react-query";
import type { AppRouter } from "@repo/trpc";
import superjson from "superjson";
import { QueryClient } from "@tanstack/react-query";
import {
  createTRPCClient as baseCreateTRPCClient,
  httpBatchLink,
} from "@trpc/client";
import { env } from "./env";

// Use createTRPCContext for TanStack Query integration
export const { TRPCProvider, useTRPC, useTRPCClient } =
  createTRPCContext<AppRouter>();

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

// Create tRPC client helper (using base client creator)
export const createTRPCClient = (getToken: () => Promise<string | null>) => {
  return baseCreateTRPCClient<AppRouter>({
    links: [
      httpBatchLink({
        url: API_URL,
        headers: async () => {
          const token = await getToken();
          return {
            authorization: token ? `Bearer ${token}` : "",
          };
        },
        transformer: superjson,
      }),
    ],
  });
};
