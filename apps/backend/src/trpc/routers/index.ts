import { Injectable } from "@nestjs/common";
import { inferRouterOutputs } from "@trpc/server";
import { BasicRouter } from "./base/basic.router";
import { AuthRouter } from "./auth/auth.router";
import { t } from "./base";
import { AnyTRPCRouter } from "../types";

@Injectable()
export class AppRouter {
  constructor(
    private readonly basicRouter: BasicRouter,
    private readonly authRouter: AuthRouter
  ) {}

  // Combine all routers into a single app router
  public createRouter(): AnyTRPCRouter {
    return t.router({
      // Mount the basic endpoints directly
      // eslint-disable-next-line
      hello: this.basicRouter.router._def.procedures.hello,
      // eslint-disable-next-line
      me: this.basicRouter.router._def.procedures.me,

      // Mount the auth router
      auth: this.authRouter.router,
    });
  }

  // Get the router instance
  public get router(): AnyTRPCRouter {
    return this.createRouter();
  }

  // Type helper for client usage
  public getRouterType(): AnyTRPCRouter {
    return this.router;
  }
}

// Export type for client usage
export type AppRouterOutput = inferRouterOutputs<
  ReturnType<AppRouter["getRouterType"]>
>;
