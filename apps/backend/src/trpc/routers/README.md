# tRPC Routers

This folder contains the tRPC routers for the backend, managed dynamically.

## Adding/Modifying Routers

Router definition and structuring (including nesting) are handled centrally in the `routerStructure` object within the `_list.ts` file.

To add a new router or change the structure:

1.  **Create your router class** (e.g., `MyNewRouter`) in a file within the `./routers/` directory. Ensure it has a public `router` property containing the tRPC router instance (created with `t.router({...})`).
2.  **Import your new router class** into `_list.ts`.
3.  **Add your router class** to the `routerStructure` object in `_list.ts` at the desired location:
    *   To merge it at the root level, add it to the `direct` array.
    *   To nest it under a specific path (e.g., `/admin`), add it to the `children` object with the path as the key (e.g., `admin: MyNewRouter`). You can create nested `children` and `direct` properties for deeper structures.

```typescript
// Example _list.ts modification
import { BasicRouter } from "./routers/basic.router";
import { AuthRouter } from "./routers/auth.router";
import { MyNewRouter } from "./routers/my-new.router"; // 1. Import
import { AdminDashboardRouter } from "./routers/admin-dashboard.router";
import { UserManagementRouter } from "./routers/user-management.router";
import {
  getAllRouterClasses,
  type RouterDefinitionNode,
} from "@repo/backend/trpc/routers/utils";

export const routerStructure: RouterDefinitionNode = {
  direct: [BasicRouter],       // Merged at root
  children: {
    auth: AuthRouter,        // Nested under /auth
    myNew: MyNewRouter,     // 2. Add nested under /myNew
    admin: {
      direct: [AdminDashboardRouter], // Merged under /admin
      children: {
        users: UserManagementRouter,  // Nested under /admin/users
      }
    }
  },
};

export const flattenedTrpcRouters = getAllRouterClasses(routerStructure);
```

The `index.ts` file and the NestJS module providers (`flattenedTrpcRouters`) will automatically pick up the changes. No modifications are needed in `index.ts`.

## Router structure

The router is defined in a separate file and then added to the `allTrpcRouters` array.
