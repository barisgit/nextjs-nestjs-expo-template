# WebSocket Types

A package providing type-safe Socket.IO implementation for use in the monorepo.

## Features

- End-to-end type safety for Socket.IO events
- Zod validation for runtime type checking
- Helper utilities for creating type-safe event handlers
- Works seamlessly with NestJS on the server

## Installation

This package is part of the monorepo and is available through workspace dependencies:

```bash
pnpm add @repo/websocket-types
```

## Usage

### Server-side (NestJS)

1. Import the types in your NestJS gateway:

```typescript
import { 
  TypedServer, 
  TypedServerSocket,
  ClientEvents,
  createValidatedHandler,
  MessagePayloadSchema
} from '@repo/websocket-types';

@WebSocketGateway()
export class MyGateway implements OnGatewayInit {
  @WebSocketServer()
  server: TypedServer;
  
  handleConnection(client: TypedServerSocket) {
    // Use typed socket
    
    // Set up validated handlers
    const joinRoomHandler = createValidatedHandler(
      ClientEvents.JOIN_ROOM,
      MessagePayloadSchema.shape.roomId,
      (roomId, socket, callback) => {
        // Handler implementation
        if (callback) callback({ success: true });
      }
    );
    
    joinRoomHandler(client);
  }
}
```

### Client-side

```typescript
import { io } from 'socket.io-client';
import { ClientToServerEvents, ServerToClientEvents, ClientEvents } from '@repo/websocket-types';

// Create a typed socket
const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io('http://localhost:3000');

// Type-safe event listeners
socket.on('notification', (payload) => {
  // payload is fully typed
  console.log(payload.message);
});

// Type-safe event emitters
socket.emit('joinRoom', 'room-123', (response) => {
  // response is fully typed
  if (response.success) {
    console.log(`Joined room: ${response.room?.name}`);
  }
});
```

## Type Definitions

The package exports these key interfaces:

- `ServerToClientEvents`: Events sent from server to client
- `ClientToServerEvents`: Events sent from client to server
- `InterServerEvents`: Events between different server instances
- `SocketData`: Custom data attached to each socket

## Validation

Use the provided Zod schemas for runtime validation:

```typescript
import { MessagePayloadSchema } from '@repo/websocket-types';

// Validate a message payload
try {
  const validated = MessagePayloadSchema.parse(payload);
  // Use validated data
} catch (error) {
  // Handle validation error
}
```

## Extending

To add new events, extend the type definitions in `src/types.ts` and add corresponding validators in `src/validators.ts`. 