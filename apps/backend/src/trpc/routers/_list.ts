import { BasicRouter } from "./routers/basic.router.js";
import { AuthRouter } from "./routers/auth.router.js";
import {
  getAllRouterClasses,
  type RouterDefinitionNode,
} from "../routers/utils.js";

// Define the actual router structure
export const routerStructure: RouterDefinitionNode = {
  direct: [BasicRouter], // BasicRouter merged at the root
  children: {
    auth: AuthRouter, // AuthRouter nested under /auth
    // Example for future nesting:
    // admin: {
    //   direct: [AdminDashboardRouter], // Merged under /admin
    //   children: {
    //     users: UserManagementRouter,      // Nested under /admin/users
    //     settings: SettingsRouter          // Nested under /admin/settings
    //   }
    // }
  },
};

// Export the flattened list of all unique router classes for NestJS providers
export const flattenedTrpcRouters = getAllRouterClasses(routerStructure);
