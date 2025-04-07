# WebSockets Package

This package provides a type-safe WebSocket implementation for both client and server using Socket.IO.

## Features

- Type-safe socket events and payloads using TypeScript and Zod validation
- NestJS integration for backend implementation
- Client utilities for frontend applications
- Robust error handling and logging

## Installation

```bash
pnpm add @repo/websockets
```

## Server Usage (NestJS)

Import the WebsocketsModule in your NestJS application:

```typescript
import { Module } from '@nestjs/common';
import { WebsocketsModule } from '@repo/websockets';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [WebsocketsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

The module provides:
- `WebsocketGateway`: Handles socket connections and events
- `WebsocketService`: Provides methods for room management and messaging

## Client Usage

```typescript
import { createTypedSocketClient, ClientEvents, ServerEvents } from '@repo/websockets';

// Create a type-safe socket client
const socket = createTypedSocketClient('http://localhost:3000');

// Join a room
socket.emit(ClientEvents.JOIN_ROOM, 'room-id', (response) => {
  if (response.success) {
    console.log('Joined room:', response.room);
  } else {
    console.error('Failed to join room:', response.error);
  }
});

// Listen for messages
socket.on(ServerEvents.MESSAGE, (message) => {
  console.log('Received message:', message);
});

// Send a message
socket.emit(ClientEvents.SEND_MESSAGE, {
  roomId: 'room-id',
  content: 'Hello, world!',
});

// Leave a room
socket.emit(ClientEvents.LEAVE_ROOM, 'room-id', (response) => {
  if (response.success) {
    console.log('Left room successfully');
  }
});

// Disconnect
socket.disconnect();
```

## Type Definitions

The package provides type definitions for:

- Socket events (ClientEvents, ServerEvents)
- Message payloads (MessagePayload, ChatMessagePayload, etc.)
- Room management (JoinRoomResponse, RoomUpdatePayload)
- Error handling (ErrorPayload)

All payloads are validated using Zod schemas to ensure type safety.

## Advanced Usage

See the client-example.ts file for more advanced usage examples. 