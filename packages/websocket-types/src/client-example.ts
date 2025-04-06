import { io, Socket } from "socket.io-client";
import {
  ClientToServerEvents,
  ErrorPayload,
  JoinRoomResponse,
  NotificationPayload,
  RoomUpdatePayload,
  ServerToClientEvents,
} from "./types.js";
import { ClientEvents, ServerEvents } from "./socket-events.js";

/**
 * Example of creating a type-safe socket.io client
 */
export function createSocket(
  url: string
): Socket<ServerToClientEvents, ClientToServerEvents> {
  const socket = io(url);

  // Setting up event listeners with type safety
  socket.on(ServerEvents.NOTIFICATION, (payload: NotificationPayload) => {
    console.log(`Notification: ${payload.message}`);
    // payload is fully typed, you get autocomplete for payload.id, payload.type, etc.
  });

  socket.on(ServerEvents.ROOM_UPDATE, (payload: RoomUpdatePayload) => {
    console.log(
      `Room ${payload.roomId} updated with ${payload.users.length} users`
    );
    // payload.users is typed as an array of {id: string, username: string}
  });

  socket.on(ServerEvents.ERROR, (error: ErrorPayload) => {
    console.error(`Error: ${error.message}`);
  });

  // Example of emitting events with type safety
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- This is an example function that may not be used
  const joinRoom = (roomId: string) => {
    socket.emit(
      ClientEvents.JOIN_ROOM,
      roomId,
      (response: JoinRoomResponse) => {
        if (response.success) {
          console.log(`Joined room: ${response.room?.name}`);
        } else {
          console.error(`Failed to join room: ${response.error}`);
        }
      }
    );
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- This is an example function that may not be used
  const leaveRoom = (roomId: string) => {
    socket.emit(ClientEvents.LEAVE_ROOM, roomId, (success: boolean) => {
      if (success) {
        console.log(`Left room: ${roomId}`);
      } else {
        console.error(`Failed to leave room: ${roomId}`);
      }
    });
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- This is an example function that may not be used
  const sendMessage = (roomId: string, content: string) => {
    socket.emit(
      ClientEvents.SEND_MESSAGE,
      { roomId, content },
      (success: boolean) => {
        if (success) {
          console.log(`Message sent to room: ${roomId}`);
        } else {
          console.error(`Failed to send message to room: ${roomId}`);
        }
      }
    );
  };

  return socket;
}

/**
 * Example usage:
 *
 * ```typescript
 * // In your React/Vue/etc component
 * import { createSocket } from '@repo/websocket-types';
 *
 * // Create a typed socket connection
 * const socket = createSocket('http://localhost:3000');
 *
 * // Join a room
 * socket.emit('joinRoom', 'room-123', (response) => {
 *   if (response.success) {
 *     console.log(`Joined room: ${response.room?.name}`);
 *   }
 * });
 *
 * // Send a message
 * socket.emit('sendMessage', {
 *   roomId: 'room-123',
 *   content: 'Hello, world!'
 * }, (success) => {
 *   console.log(`Message sent: ${success}`);
 * });
 * ```
 */
