/**
 * Server event constants
 */
export const ServerEvents = {
  NOTIFICATION: "notification",
  ROOM_UPDATE: "roomUpdate",
  ERROR: "error",
  MESSAGE: "message",
} as const;

/**
 * Client event constants
 */
export const ClientEvents = {
  JOIN_ROOM: "joinRoom",
  LEAVE_ROOM: "leaveRoom",
  SEND_MESSAGE: "sendMessage",
} as const;

/**
 * Socket namespace constants
 */
export const Namespaces = {
  MAIN: "/",
  CHAT: "/chat",
  GAME: "/game",
} as const;

export type ServerEventName = keyof typeof ServerEvents;
export type ClientEventName = keyof typeof ClientEvents;
export type NamespaceName = keyof typeof Namespaces;
