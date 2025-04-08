# Backend Documentation

## Overview

This document provides guidance on the backend architecture and its interaction with shared packages in the monorepo structure.

## Package Dependencies

The backend relies on several shared packages located in the `/packages` directory. These packages provide modular functionality that can be used across different applications in the project.

### Database (`@repo/db`)

**Location:** `/packages/db`

The database package provides TypeORM connectivity, entity definitions, and migration tools.

- **Key Files:**
  - `src/database.module.ts` - NestJS module for TypeORM integration
  - `src/data-source.ts` - TypeORM data source configuration
  - `src/entities/` - Database entity definitions
  - `src/migrations/` - TypeORM migration scripts

**Usage:** Import the `DatabaseModule` in your NestJS modules:

```typescript
import { DatabaseModule } from "@repo/db";

@Module({
  imports: [DatabaseModule],
})
export class YourModule {}
```

**TypeORM Entities:**

The database package defines several TypeORM entities with relationships:

```typescript
// Example entity with relationships
import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, JoinColumn } from "typeorm";

@Entity("users")
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: string;
  
  @Column({ length: 50, unique: true })
  username: string;
  
  @Column({ length: 255, unique: true })
  email: string;
  
  @Column({ default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;
  
  @Column({ default: () => "CURRENT_TIMESTAMP" })
  updatedAt: Date;
  
  @OneToMany(() => UserItem, userItem => userItem.user)
  userItems: UserItem[];
}
```

### tRPC (`@repo/trpc`)

**Location:** `/packages/trpc`

Provides type-safe API endpoints using tRPC, enabling seamless integration between backend and frontend.

- **Key Files:**
  - `src/trpc.module.ts` - NestJS module for tRPC integration
  - `src/trpc.service.ts` - Service for tRPC router setup
  - `src/routers/` - tRPC router definitions
  - `src/context/` - tRPC context creation

**Usage:** Import the `TRPCModule` in your app module and use the service to apply middleware:

```typescript
import { TRPCModule, TRPCService } from "@repo/trpc";

// In module:
@Module({
  imports: [TRPCModule],
})

// In bootstrap:
const trpcService = app.get(TRPCService);
trpcService.applyMiddleware(app);
```

### Services (`@repo/services`)

**Location:** `/packages/services`

Contains shared services that can be used across backend and frontend where applicable.

- **Key Components:**
  - `auth/` - Authentication services (Clerk integration)
  - `redis/` - Redis connection and cache services
  - `webhooks/` - Webhook handling services

**Usage:** Import specific modules as needed:

```typescript
import { AuthModule, RedisModule, WebhooksModule } from "@repo/services";

@Module({
  imports: [AuthModule, RedisModule, WebhooksModule],
})
export class YourModule {}
```

### WebSockets (`@repo/websockets`)

**Location:** `/packages/websockets`

Provides type-safe real-time communication between server and clients using Socket.IO.

- **Key Files:**
  - `src/server.ts` - Server-side Socket.IO setup
  - `src/socket-events.ts` - Event definitions
  - `src/type-safe-socket.ts` - Type-safe socket implementation
  - `src/nestjs/` - NestJS integration

**Usage:** Import the WebSockets module in your app:

```typescript
import { WebsocketsModule } from "@repo/websockets/server";

@Module({
  imports: [WebsocketsModule],
})
export class YourModule {}
```

**Type-Safe WebSockets:**

Our WebSockets implementation uses TypeScript for complete type safety:

```typescript
// In a gateway file
import { SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { TypedServer } from '@repo/websockets';
import { ServerEvents, ClientEvents } from '@repo/websockets';

@WebSocketGateway({ cors: true })
export class ChatGateway {
  @SubscribeMessage(ClientEvents.JOIN_ROOM)
  async handleJoinRoom(client: Socket, roomId: string) {
    await client.join(roomId);
    client.emit(ServerEvents.ROOM_JOINED, { roomId });
    client.to(roomId).emit(ServerEvents.USER_JOINED, { 
      userId: client.id, 
      roomId 
    });
  }
  
  @SubscribeMessage(ClientEvents.SEND_MESSAGE)
  handleMessage(client: Socket, payload: { roomId: string; content: string }) {
    client.to(payload.roomId).emit(ServerEvents.MESSAGE, {
      senderId: client.id,
      content: payload.content,
      roomId: payload.roomId,
      timestamp: new Date()
    });
  }
}
```

### Analytics (`@repo/analytics`)

**Location:** `/packages/analytics`

Analytics integration for tracking user behavior across platforms.

- **Key Components:**
  - `posthog/` - PostHog integration
  - `web/` - Web-specific analytics
  - `mobile/` - Mobile-specific analytics

**Usage:** Import the PostHog module:

```typescript
import { PostHogModule } from "@repo/analytics";

@Module({
  imports: [PostHogModule],
})
export class YourModule {}
```

## Configuration

The backend uses the NestJS ConfigModule with environment variables. See `.env.example` for required variables.

## Development Workflow

1. Run development server with hot reloading:
   ```bash
   pnpm dev
   ```

2. Build for production:
   ```bash
   pnpm build
   ```

3. Run tests:
   ```bash
   pnpm test
   ```

4. Run TypeORM migrations:
   ```bash
   pnpm --filter @repo/db migration:run
   ```

## Architecture Decisions

- **Modular Design**: Functionality is split into packages to maximize code reuse and maintainability
- **Type Safety**: All packages use TypeScript with strict typing
- **NestJS Integration**: Packages are designed to work seamlessly with NestJS modules
- **Cross-Platform**: Where appropriate, packages support both backend and frontend usage
- **TypeORM for Data Access**: We chose TypeORM for its excellent TypeScript integration and powerful ORM features
- **Type-safe WebSockets**: Socket.IO with TypeScript types for real-time communication

## Detailed Package Documentation

For more detailed information about each package, refer to their individual documentation:

- [Database Package Documentation](../../packages/db/README.md)
- [tRPC Package Documentation](../../packages/trpc/README.md)
- [Services Package Documentation](../../packages/services/README.md)
- [WebSockets Package Documentation](../../packages/websockets/README.md)
- [Analytics Package Documentation](../../packages/analytics/README.md)

## Configuration Documentation

For details about configuration options and environment variables, see:

- [Configuration Documentation](./src/config/README.md) 