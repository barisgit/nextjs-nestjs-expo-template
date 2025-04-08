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
        this.logger.debug(
          `hello endpoint called with input: ${JSON.stringify(input)}`
        );

        const name = input?.name || "World";
        return {
          greeting: `Hello ${name}`,
        };
      }),

    increment: protectedProcedure.input(z.number()).query(({ input }) => {
      return input + 1;
    }),

    // Me endpoint - protected (requires auth)
    me: protectedProcedure.query(({ ctx }) => {
      return {
        user: ctx.auth.user,
      };
    }),
  });
}
