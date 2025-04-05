"use client";

import { type JSX } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createTRPCClient, httpBatchLink, type TRPCClient } from "@trpc/client";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import superjson from "superjson";
import { useAuth } from "@clerk/nextjs";
import { TRPCProvider, type AppRouter } from "@/utils/trpc";
import { env } from "@/env";

function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 50 * 1000, // 5 seconds
        gcTime: 10 * 60 * 1000, // 10 minutes
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined;

function getQueryClient(): QueryClient {
  if (typeof window === "undefined") {
    return makeQueryClient();
  }

  if (!browserQueryClient) browserQueryClient = makeQueryClient();
  return browserQueryClient;
}

interface TRPCProviderProps {
  children: React.ReactNode;
}

export function AppTRPCProvider({ children }: TRPCProviderProps): JSX.Element {
  const { getToken } = useAuth();
  const queryClient = getQueryClient();

  const trpcClient = createTRPCClient({
    links: [
      httpBatchLink({
        url: env.NEXT_PUBLIC_TRPC_URL,
        transformer: superjson,
        async headers() {
          const token = await getToken();
          return {
            authorization: token ? `Bearer ${token}` : "",
          };
        },
      }),
    ],
  });

  return (
    <QueryClientProvider client={queryClient}>
      <TRPCProvider
        trpcClient={trpcClient as TRPCClient<AppRouter>}
        queryClient={queryClient}
      >
        {children}
        {!env.NEXT_PUBLIC_IS_PRODUCTION && <ReactQueryDevtools />}
      </TRPCProvider>
    </QueryClientProvider>
  );
}
