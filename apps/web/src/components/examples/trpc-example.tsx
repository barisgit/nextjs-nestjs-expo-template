"use client";

import { type JSX } from "react";
import { trpc } from "@/lib/trpc";
/**
 * This is an example component showing how to use tRPC in your application.
 * IMPORTANT: Replace 'hello' and 'createSomething' with actual procedure names from your API.
 * The TypeScript errors are expected until you have actual procedures defined in your backend.
 */
export function TRPCExample(): JSX.Element {
  const { data, isLoading, error } = trpc.hello.hello.useQuery();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return <div>{data}</div>;
}
