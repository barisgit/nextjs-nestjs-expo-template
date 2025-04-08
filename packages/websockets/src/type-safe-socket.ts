import { Server, Socket } from "socket.io";
import { z } from "zod";
import {
  ClientToServerEvents,
  InterServerEvents,
  ServerToClientEvents,
  SocketData,
} from "./types.js";

/**
 * Type-safe Socket.IO server
 */
export type TypedServer = Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;

/**
 * Type-safe Socket.IO client socket
 */
export type TypedClientSocket = Socket<
  ServerToClientEvents,
  ClientToServerEvents
>;

/**
 * Type-safe Socket.IO server socket
 */
export type TypedServerSocket = Socket<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;

/**
 * Generic response type for socket callbacks
 */
export interface SocketResponse {
  success: boolean;
  error?: string;
  [key: string]: unknown;
}

/**
 * Helper function to create a type-safe event handler with validation
 */
export function createValidatedHandler<
  Event extends keyof ClientToServerEvents,
  Schema extends z.ZodType,
  Callback extends (...args: unknown[]) => void,
>(
  event: Event,
  schema: Schema,
  handler: (
    data: z.infer<Schema>,
    socket: TypedServerSocket,
    callback?: Callback
  ) => void | Promise<void>
) {
  return (socket: TypedServerSocket) => {
    // @ts-expect-error - Socket.io's typing system is complex
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    socket.on(event, (data: any, callback?: Callback) => {
      try {
        schema
          .parseAsync(data)
          .then((validatedData) => {
            const result = handler(validatedData, socket, callback);
            // Handle if the handler returns a Promise
            if (result instanceof Promise) {
              result.catch((error) => {
                console.error(
                  `Error in async handler for ${String(event)}:`,
                  error
                );
                if (typeof callback === "function") {
                  callback({
                    success: false,
                    error:
                      error instanceof Error ? error.message : "Unknown error",
                  } as SocketResponse);
                }
              });
            }
          })
          .catch((error) => {
            console.error(
              `Validation error for event ${String(event)}:`,
              error
            );
            if (typeof callback === "function") {
              callback(error as SocketResponse);
            } else {
              socket.emit("error", {
                code: "VALIDATION_ERROR",
                message: `Invalid data for event ${String(event)}`,
              });
            }
          });
      } catch (error) {
        console.error(`Validation error for event ${String(event)}:`, error);
        if (typeof callback === "function") {
          callback(error as SocketResponse);
        } else {
          socket.emit("error", {
            code: "VALIDATION_ERROR",
            message: `Invalid data for event ${String(event)}`,
          });
        }
      }
    });
  };
}

/**
 * Helper function to emit events with type checking
 */
export function typedEmit<Event extends keyof ServerToClientEvents>(
  socket: TypedServerSocket,
  event: Event,
  ...args: Parameters<ServerToClientEvents[Event]>
) {
  socket.emit(event, ...args);
}

/**
 * Helper function to broadcast events with type checking
 */
export function typedBroadcast<Event extends keyof ServerToClientEvents>(
  io: TypedServer,
  event: Event,
  ...args: Parameters<ServerToClientEvents[Event]>
) {
  io.emit(event, ...args);
}
