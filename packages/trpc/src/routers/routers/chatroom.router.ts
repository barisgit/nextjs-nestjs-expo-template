import { Injectable } from "@nestjs/common";
import { t } from "../base/index.js";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";
import { TRPCError } from "@trpc/server";

// Define room type
export const RoomSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  createdAt: z.date(),
  userCount: z.number().int().nonnegative(),
});

export type Room = z.infer<typeof RoomSchema>;

@Injectable()
export class ChatRoomRouter {
  // In-memory room storage for now
  // In a real app, this would be in a database
  private rooms: Map<string, Room> = new Map();

  constructor() {
    // Create a couple of default rooms
    this.createRoom("General Chat");
    this.createRoom("Tech Discussion");
  }

  public get router() {
    return t.router({
      // Get all rooms
      getRooms: t.procedure.query(() => {
        return Array.from(this.rooms.values());
      }),

      // Get a specific room by ID
      getRoom: t.procedure
        .input(z.object({ id: z.string().uuid() }))
        .query(({ input }) => {
          const room = this.rooms.get(input.id);
          if (!room) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: `Room with ID ${input.id} not found`,
            });
          }
          return room;
        }),

      // Create a new room
      createRoom: t.procedure
        .input(z.object({ name: z.string().min(1).max(50) }))
        .mutation(({ input }) => {
          return this.createRoom(input.name);
        }),

      // Delete a room
      deleteRoom: t.procedure
        .input(z.object({ id: z.string().uuid() }))
        .mutation(({ input }) => {
          const exists = this.rooms.has(input.id);
          if (!exists) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: `Room with ID ${input.id} not found`,
            });
          }
          this.rooms.delete(input.id);
          return { success: true };
        }),

      // Update user count in a room
      updateRoomCount: t.procedure
        .input(
          z.object({
            id: z.string().uuid(),
            userCount: z.number().int().nonnegative(),
          })
        )
        .mutation(({ input }) => {
          const room = this.rooms.get(input.id);
          if (!room) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: `Room with ID ${input.id} not found`,
            });
          }
          room.userCount = input.userCount;
          this.rooms.set(input.id, room);
          return room;
        }),
    });
  }

  // Helper method to create a room
  private createRoom(name: string): Room {
    const id = uuidv4();
    const room: Room = {
      id,
      name,
      createdAt: new Date(),
      userCount: 0,
    };
    this.rooms.set(id, room);
    return room;
  }
}
