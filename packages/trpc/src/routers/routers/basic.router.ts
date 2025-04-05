import { Injectable, Logger } from "@nestjs/common";
import { z } from "zod";
import { procedure, protectedProcedure, t } from "../base/index.js";

@Injectable()
export class BasicRouter {
  private readonly logger = new Logger(BasicRouter.name);

  public readonly router = t.router({
    // Hello endpoint - public
    hello: procedure
      .input(
        z
          .object({
            name: z.string().optional().describe("Name to greet (optional)"),
          })
          .optional()
      )
      .query(({ input }) => {
        const name = input?.name || "World";
        return {
          greeting: `Hello ${name}`,
        };
      }),

    // Me endpoint - protected (requires auth)
    me: protectedProcedure.query(({ ctx }) => {
      return {
        user: ctx.auth.user,
      };
    }),
  });
}
