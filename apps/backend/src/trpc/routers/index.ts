import { Injectable } from "@nestjs/common";
import { ModuleRef } from "@nestjs/core";
import { t } from "./base/index.js";
import { routerStructure } from "./_list.js";
import { RouterDefinitionNode, RouterClass } from "./utils.js";
import type { AppRouter as GeneratedAppRouter } from "../@generated/generated-router-type.js";
import type { AnyRouter } from "@trpc/server";

/**
 * Dynamically builds the tRPC router based on the structure
 * defined in `_list.ts`.
 */
@Injectable()
export class AppRouter {
  constructor(private readonly moduleRef: ModuleRef) {}

  // Recursive function to build the router structure
  private buildRouters(
    definition: RouterDefinitionNode | RouterClass
  ): AnyRouter {
    // Base case: If it's a RouterClass
    if (typeof definition === "function" && definition.prototype) {
      const routerInstance = this.moduleRef.get<{
        [key: string]: unknown;
        router: unknown;
      }>(definition, { strict: false });

      // Runtime check for valid tRPC router structure (_def)
      if (
        !routerInstance ||
        typeof routerInstance.router !== "object" ||
        routerInstance.router === null ||
        typeof (routerInstance.router as { _def?: unknown })._def ===
          "undefined"
      ) {
        throw new Error(
          `Router class ${definition.name} does not have a valid router property conforming to tRPC router structure (missing _def).`
        );
      }
      // Return the specific router
      return routerInstance.router as AnyRouter;
    }

    // Recursive case: If it's a RouterDefinitionNode
    if (
      typeof definition === "object" &&
      definition !== null &&
      !Array.isArray(definition)
    ) {
      // Explicitly type intermediate collections
      const routersToMerge: AnyRouter[] = [];

      // Process directly merged routers
      if (definition.direct) {
        definition.direct.forEach((routerClass) => {
          routersToMerge.push(this.buildRouters(routerClass));
        });
      }

      // Process nested routers
      const nestedRouters: Record<string, AnyRouter> = {};
      if (definition.children) {
        for (const path in definition.children) {
          nestedRouters[path] = this.buildRouters(definition.children[path]);
        }
      }

      if (Object.keys(nestedRouters).length > 0) {
        routersToMerge.push(t.router(nestedRouters));
      }

      // Merge routers
      if (routersToMerge.length === 0) {
        return t.router({});
      }
      if (routersToMerge.length === 1) {
        return routersToMerge[0];
      }
      return t.mergeRouters(...routersToMerge);
    }

    throw new Error("Invalid router definition node encountered.");
  }

  public createRouter(): AnyRouter {
    return this.buildRouters(routerStructure);
  }

  public get router(): AnyRouter {
    return this.createRouter();
  }
}

// Re-export the generated router type for client usage
export type AppRouterType = GeneratedAppRouter;
