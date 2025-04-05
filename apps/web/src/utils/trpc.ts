import type { AppRouter } from "@repo/trpc";
import { createTRPCContext } from "@trpc/tanstack-react-query";

// We're using the auto-generated type definition
export const { TRPCProvider, useTRPC, useTRPCClient } =
  createTRPCContext<AppRouter>();

// Re-export the AppRouter type from the api-client package
export type { AppRouter };
