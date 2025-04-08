import { io, Socket } from "socket.io-client";
import {
  ClientToServerEvents,
  ServerToClientEvents,
  ClientEvents,
  ServerEvents,
  MessagePayload,
  JoinRoomResponse,
  ErrorPayload,
  RoomUpdatePayload,
  NotificationPayload,
  ChatMessagePayload,
} from "@repo/websockets";
import { env } from "../utils/env";
import { Platform } from "react-native";

// Logger for mobile (could be enhanced with proper mobile logging solution)
const logger = {
  info: (...args: any[]) => console.log("[Socket]", ...args),
  error: (...args: any[]) => console.error("[Socket]", ...args),
};

// Singleton socket instance
let socketInstance: Socket<ServerToClientEvents, ClientToServerEvents> | null =
  null;

/**
 * Initialize the socket connection
 */
export const initializeSocket = (): Socket<
  ServerToClientEvents,
  ClientToServerEvents
> => {
  if (socketInstance) return socketInstance;

  // Extract API URL from env and parse it for socket connection
  const apiUrl = env.EXPO_PUBLIC_TRPC_URL.replace("/trpc", "");
  logger.info(`Connecting to Socket.IO server at: ${apiUrl}`);

  // Configure Socket.IO with options optimized for mobile
  socketInstance = io(apiUrl, {
    transports: ["websocket"], // Prefer websocket on mobile
    reconnectionAttempts: 10,
    reconnectionDelay: 2000,
    timeout: 10000, // Longer timeout for mobile connections
    path: "/socket.io", // Adjust this if your server uses a different path
    forceNew: true,
    // React Native specific options
    extraHeaders: Platform.OS === "ios" ? {} : undefined, // Avoid issues on Android
  });

  return socketInstance;
};

/**
 * Get the socket instance, creating it if it doesn't exist
 */
export const getSocket = (): Socket<
  ServerToClientEvents,
  ClientToServerEvents
> | null => {
  if (!socketInstance) {
    return initializeSocket();
  }
  return socketInstance;
};

/**
 * Disconnect and remove the socket instance
 */
export const closeSocket = (): void => {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
};

/**
 * Join a specific chat room
 */
export const joinRoom = async (
  roomId: string
): Promise<JoinRoomResponse["room"]> => {
  const socket = getSocket();
  if (!socket) {
    throw new Error("Socket not initialized");
  }

  logger.info("Joining room:", roomId);

  return new Promise<JoinRoomResponse["room"]>((resolve, reject) => {
    socket.emit(ClientEvents.JOIN_ROOM, roomId, (response) => {
      if (response.success && response.room) {
        logger.info("Room join successful:", response.room);
        resolve(response.room);
      } else {
        logger.error("Room join failed:", response.error);
        reject(new Error(response.error ?? "Failed to join room"));
      }
    });
  });
};

/**
 * Leave the current room
 */
export const leaveRoom = async (roomId: string): Promise<boolean> => {
  const socket = getSocket();
  if (!socket) {
    throw new Error("Socket not initialized");
  }

  return new Promise<boolean>((resolve, reject) => {
    socket.emit(ClientEvents.LEAVE_ROOM, roomId, (success) => {
      if (success) {
        resolve(true);
      } else {
        reject(new Error("Failed to leave room"));
      }
    });
  });
};

/**
 * Send a message to a room
 */
export const sendMessage = async (
  roomId: string,
  content: string
): Promise<boolean> => {
  const socket = getSocket();
  if (!socket) {
    throw new Error("Socket not initialized");
  }

  const payload: MessagePayload = {
    roomId,
    content,
  };

  logger.info(`Sending message to room ${roomId}:`, content);

  return new Promise<boolean>((resolve, reject) => {
    try {
      socket.emit(ClientEvents.SEND_MESSAGE, payload, (success) => {
        if (success) {
          resolve(true);
        } else {
          reject(new Error("Failed to send message"));
        }
      });
    } catch (err) {
      logger.error("Error sending message:", err);
      reject(new Error("Error sending message"));
    }
  });
};

// Event callback interfaces
interface SocketCallbacks {
  onConnect?: () => void;
  onDisconnect?: (reason: string) => void;
  onError?: (error: ErrorPayload) => void;
  onMessage?: (message: ChatMessagePayload) => void;
  onRoomUpdate?: (update: RoomUpdatePayload) => void;
  onNotification?: (notification: NotificationPayload) => void;
}

/**
 * Setup event listeners based on callback functions
 */
export const setupEventListeners = (
  callbacks: SocketCallbacks
): (() => void) => {
  const socket = getSocket();
  if (!socket) {
    throw new Error("Socket not initialized");
  }

  // Set up listeners with provided callbacks
  if (callbacks.onConnect) {
    socket.on("connect", callbacks.onConnect);
  }

  if (callbacks.onDisconnect) {
    socket.on("disconnect", callbacks.onDisconnect);
  }

  if (callbacks.onError) {
    socket.on(ServerEvents.ERROR, callbacks.onError);
  }

  if (callbacks.onMessage) {
    socket.on(ServerEvents.MESSAGE, callbacks.onMessage);
  }

  if (callbacks.onRoomUpdate) {
    socket.on(ServerEvents.ROOM_UPDATE, callbacks.onRoomUpdate);
  }

  if (callbacks.onNotification) {
    socket.on(ServerEvents.NOTIFICATION, callbacks.onNotification);
  }

  // Return cleanup function
  return () => {
    if (callbacks.onConnect) socket.off("connect", callbacks.onConnect);
    if (callbacks.onDisconnect)
      socket.off("disconnect", callbacks.onDisconnect);
    if (callbacks.onError) socket.off(ServerEvents.ERROR, callbacks.onError);
    if (callbacks.onMessage) {
      socket.off(ServerEvents.MESSAGE, callbacks.onMessage);
    }
    if (callbacks.onRoomUpdate)
      socket.off(ServerEvents.ROOM_UPDATE, callbacks.onRoomUpdate);
    if (callbacks.onNotification)
      socket.off(ServerEvents.NOTIFICATION, callbacks.onNotification);
  };
};
