import React, { useState, ReactNode } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import {
  TRPCProvider as GeneratedTRPCProvider,
  createQueryClient,
  createTRPCClient,
  useTRPCClient,
} from "../utils/trpc";
import { useAuth } from "@clerk/clerk-expo";
import { type TRPCClient } from "@trpc/client";
import { type AppRouter } from "@repo/trpc";

interface TRPCProviderProps {
  children: ReactNode;
}

export function TRPCProvider({ children }: TRPCProviderProps) {
  const { getToken } = useAuth();
  // Create QueryClient and TRPCClient
  const [queryClient] = useState(() => createQueryClient());
  const [trpcClient] = useState(() => createTRPCClient(getToken));

  return (
    <QueryClientProvider client={queryClient}>
      <GeneratedTRPCProvider
        trpcClient={trpcClient as TRPCClient<AppRouter>}
        queryClient={queryClient}
      >
        {children}
      </GeneratedTRPCProvider>
    </QueryClientProvider>
  );
}
