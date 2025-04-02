import { Injectable } from "@nestjs/common";
import { t } from "./base/index.js";
import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";
import { BasicRouter } from "./routers/basic.router.js";
import { AuthRouter } from "./routers/auth.router.js";

/**
 * Static tRPC router that combines all sub-routers
 */
@Injectable()
export class AppRouter {
  constructor(
    private readonly basicRouter: BasicRouter,
    private readonly authRouter: AuthRouter
  ) {}

  public createRouter() {
    // Combine the routers
    return t.router({
      // Merge the basic router at the root level
      ...this.basicRouter.router._def.record,
      // Nest the auth router under 'auth'
      auth: this.authRouter.router,
    });
  }

  public get router() {
    return this.createRouter();
  }
}

// Export type information for client usage
export type AppRouterType = ReturnType<AppRouter["createRouter"]>;
export type RouterInputs = inferRouterInputs<AppRouterType>;
export type RouterOutputs = inferRouterOutputs<AppRouterType>;
