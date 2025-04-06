import { z } from "zod";

// Notification payload validation
export const NotificationPayloadSchema = z.object({
  id: z.string().uuid(),
  message: z.string(),
  type: z.enum(["info", "warning", "error", "success"]),
  timestamp: z.number().int().positive(),
});

// Room update payload validation
export const RoomUpdatePayloadSchema = z.object({
  roomId: z.string().uuid(),
  users: z.array(
    z.object({
      id: z.string().uuid(),
      username: z.string().min(3).max(30),
    })
  ),
  lastUpdate: z.number().int().positive(),
});

// Error payload validation
export const ErrorPayloadSchema = z.object({
  code: z.string(),
  message: z.string(),
});

// Chat message payload validation
export const ChatMessagePayloadSchema = z.object({
  id: z.string().uuid(),
  roomId: z.string().uuid(),
  content: z.string().min(1).max(5000),
  senderId: z.string(),
  senderName: z.string(),
  timestamp: z.number().int().positive(),
  attachments: z.array(z.string().url()).optional(),
});

// Message payload validation
export const MessagePayloadSchema = z.object({
  roomId: z.string().uuid(),
  content: z.string().min(1).max(5000),
  attachments: z.array(z.string().url()).optional(),
});

// Join room response validation
export const JoinRoomResponseSchema = z.object({
  success: z.boolean(),
  room: z
    .object({
      id: z.string().uuid(),
      name: z.string(),
      users: z.array(
        z.object({
          id: z.string().uuid(),
          username: z.string().min(3).max(30),
        })
      ),
    })
    .optional(),
  error: z.string().optional(),
});
