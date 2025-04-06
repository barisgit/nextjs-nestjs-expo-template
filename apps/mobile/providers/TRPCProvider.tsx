import React, { useState, ReactNode } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { trpc, createQueryClient, createTRPCClient } from "../utils/trpc";
import { useAuth } from "@clerk/clerk-expo";

interface TRPCProviderProps {
  children: ReactNode;
}

export function TRPCProvider({ children }: TRPCProviderProps) {
  const { getToken } = useAuth();
  // Create QueryClient and TRPCClient
  const [queryClient] = useState(() => createQueryClient());
  const [trpcClient] = useState(() =>
    createTRPCClient(async () => {
      const token = await getToken();
      return token;
    })
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
}
