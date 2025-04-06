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

// Type for token provider - either string or function that returns a Promise with string
type TokenProvider = string | (() => Promise<string | null>);

// Create tRPC client
export const createTRPCClient = (tokenProvider?: TokenProvider) => {
  return trpc.createClient({
    links: [
      httpBatchLink({
        url: API_URL,
        headers: async () => {
          let token = "";

          if (typeof tokenProvider === "function") {
            const result = await tokenProvider();
            token = result || "";
          } else if (typeof tokenProvider === "string") {
            token = tokenProvider;
          }

          return {
            authorization: token ? `Bearer ${token}` : "",
          };
        },
        transformer: superjson,
      }),
    ],
  });
};
