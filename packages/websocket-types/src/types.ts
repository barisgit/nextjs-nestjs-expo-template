// import { z } from "zod"; Use zod when needed

/**
 * Represents a server-to-client event
 */
export interface ServerToClientEvents {
  // Example events - customize as needed
  notification: (payload: NotificationPayload) => void;
  roomUpdate: (payload: RoomUpdatePayload) => void;
  error: (error: ErrorPayload) => void;
  message: (payload: ChatMessagePayload) => void;
}

/**
 * Represents a client-to-server event
 */
export interface ClientToServerEvents {
  // Example events - customize as needed
  joinRoom: (
    roomId: string,
    callback: (response: JoinRoomResponse) => void
  ) => void;
  leaveRoom: (roomId: string, callback: (success: boolean) => void) => void;
  sendMessage: (
    payload: MessagePayload,
    callback: (success: boolean) => void
  ) => void;
}

/**
 * Represents events that occur between servers
 */
export interface InterServerEvents {
  ping: () => void;
}

/**
 * Represents custom socket data
 */
export interface SocketData {
  userId: string;
  username: string;
  joinedRooms: string[];
}

// Payload type definitions
export interface NotificationPayload {
  id: string;
  message: string;
  type: "info" | "warning" | "error" | "success";
  timestamp: number;
}

export interface RoomUpdatePayload {
  roomId: string;
  users: {
    id: string;
    username: string;
  }[];
  lastUpdate: number;
}

export interface ErrorPayload {
  code: string;
  message: string;
}

/**
 * Payload for chat messages
 */
export interface ChatMessagePayload {
  id: string;
  roomId: string;
  content: string;
  senderId: string;
  senderName: string;
  timestamp: number;
  attachments?: string[];
}

export interface MessagePayload {
  roomId: string;
  content: string;
  attachments?: string[];
}

export interface JoinRoomResponse {
  success: boolean;
  room?: {
    id: string;
    name: string;
    users: {
      id: string;
      username: string;
    }[];
  };
  error?: string;
}
