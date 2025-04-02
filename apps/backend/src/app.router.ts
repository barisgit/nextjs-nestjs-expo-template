import { Router, Query, Input } from "nestjs-trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

@Router({ alias: "hello" })
export class HelloRouter {
  constructor() {}

  @Query({
    input: z
      .object({
        name: z.string().optional().describe("Name to greet (optional)"),
      })
      .optional(),
    output: z.object({
      greeting: z.string(),
    }),
  })
  hello(@Input() input?: { name?: string }) {
    try {
      const name = input?.name || "World";
      return {
        greeting: `Hello ${name}`,
      };
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "An unexpected error occurred",
        cause: error,
      });
    }
  }
}
