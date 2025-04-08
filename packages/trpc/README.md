# tRPC Package

This package provides a type-safe API layer using [tRPC](https://trpc.io/) for communication between the backend and frontend applications.

## Features

- End-to-end type safety from backend to frontend
- NestJS integration with tRPC
- Type-safe router definitions
- Context creation and middleware
- API panel for development
- Error handling with proper types

## Installation

The package is included in the monorepo. It can be imported into any other package or app within the repo:

```json
{
  "dependencies": {
    "@repo/trpc": "workspace:*"
  }
}
```

## Usage

### NestJS Server Integration

1. Import the `TRPCModule` in your NestJS application:

```typescript
import { Module } from '@nestjs/common';
import { TRPCModule } from '@repo/trpc';

@Module({
  imports: [TRPCModule],
})
export class AppModule {}
```

2. In your bootstrap function, apply the tRPC middleware:

```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { TRPCService } from '@repo/trpc';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Apply tRPC middleware
  const trpcService = app.get(TRPCService);
  trpcService.applyMiddleware(app);
  
  await app.listen(3000);
}
bootstrap();
```

### Creating Routers

Define new routers in the `src/routers` directory:

```typescript
// src/routers/user.router.ts
import { z } from 'zod';
import { Injectable } from '@nestjs/common';
import { publicProcedure, router } from '../trpc.service';

@Injectable()
export class UserRouter {
  public router = router({
    getUser: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        // Fetch user from database
        return { id: input.id, name: 'John Doe' };
      }),
    
    createUser: publicProcedure
      .input(z.object({ name: z.string() }))
      .mutation(async ({ input }) => {
        // Create a user
        return { id: 1, name: input.name };
      }),
  });
}
```

### Next.js Client Usage

In your Next.js application, create a tRPC client:

```typescript
// utils/trpc.ts
import { createTRPCNext } from '@trpc/next';
import { httpBatchLink } from '@trpc/client';
import type { AppRouter } from '@repo/trpc';

export const trpc = createTRPCNext<AppRouter>({
  config() {
    return {
      links: [
        httpBatchLink({
          url: `${process.env.NEXT_PUBLIC_API_URL}/trpc`,
        }),
      ],
    };
  },
});
```

Then use it in your components:

```tsx
import { trpc } from '../utils/trpc';

export default function UserProfile({ userId }: { userId: number }) {
  const { data, isLoading } = trpc.getUser.useQuery({ id: userId });
  
  if (isLoading) return <div>Loading...</div>;
  
  return (
    <div>
      <h1>User Profile</h1>
      <p>Name: {data?.name}</p>
    </div>
  );
}
```

### React Native Client Usage

In your Expo application, create a tRPC client:

```typescript
// utils/trpc.ts
import { createTRPCReact } from '@trpc/react-query';
import { httpBatchLink } from '@trpc/client';
import type { AppRouter } from '@repo/trpc';

export const trpc = createTRPCReact<AppRouter>();

// Setup provider in your app entry point
export function TRPCProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: 'http://localhost:3000/trpc',
        }),
      ],
    }),
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </trpc.Provider>
  );
}
```

## Development Tools

The package includes a tRPC Panel for development:

> Access the tRPC panel at `http://localhost:3001/panel`

## Security

To protect routes, use middleware:

```typescript
import { TRPCError } from '@trpc/server';

// Protected procedure - requires authentication
export const protectedProcedure = publicProcedure.use(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'You must be logged in to access this resource',
    });
  }
  
  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});
```

## Best Practices

1. Use Zod for input validation
2. Split routers by feature or resource
3. Handle errors with proper tRPC error codes
4. Use procedure middleware for authorization
5. Keep mutations and queries separate 