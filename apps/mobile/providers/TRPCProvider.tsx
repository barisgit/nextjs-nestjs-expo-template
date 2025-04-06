import React, { useState, ReactNode } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { trpc, createQueryClient, createTRPCClient } from "../utils/trpc";

interface TRPCProviderProps {
  children: ReactNode;
  authToken?: string;
}

export function TRPCProvider({ children, authToken }: TRPCProviderProps) {
  // Create QueryClient and TRPCClient
  const [queryClient] = useState(() => createQueryClient());
  const [trpcClient] = useState(() => createTRPCClient(authToken));

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
}
