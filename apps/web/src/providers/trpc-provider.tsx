"use client";

import { type JSX, type ReactNode } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { createTRPCClient, trpc } from "../lib/trpc";

interface TRPCProviderProps {
  children: ReactNode;
}

/**
 * Provider component that wraps your app and makes the tRPC client available
 * throughout your app
 */
export function TRPCProvider({ children }: TRPCProviderProps): JSX.Element {
  const { queryClient, trpcClient } = createTRPCClient();

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
}
