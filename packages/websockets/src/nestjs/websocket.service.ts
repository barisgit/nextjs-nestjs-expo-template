import { Injectable, Logger } from "@nestjs/common";
import {
  TypedServer,
  TypedServerSocket,
  MessagePayload,
  JoinRoomResponse,
  RoomUpdatePayload,
  ServerEvents,
  typedBroadcast,
} from "../index.js";

@Injectable()
export class WebsocketService {
  private readonly logger = new Logger(WebsocketService.name);
  private server: TypedServer;
  private rooms: Map<string, Set<string>> = new Map();

  setServer(server: TypedServer) {
    this.server = server;
  }

  /**
   * Join a socket to a room
   */
  async joinRoom(
    socket: TypedServerSocket,
    roomId: string
  ): Promise<JoinRoomResponse> {
    this.logger.log(`Joining room: ${roomId} for socket: ${socket.id}`);

    // Create room if it doesn't exist
    if (!this.rooms.has(roomId)) {
      this.logger.log(`Creating new room: ${roomId}`);
      this.rooms.set(roomId, new Set());
    }

    // Add socket to room
    await socket.join(roomId);
    this.rooms.get(roomId)?.add(socket.id as string);
    this.logger.log(`Socket ${socket.id} joined room ${roomId}`);

    // Update socket data
    if (!socket.data.joinedRooms.includes(roomId)) {
      socket.data.joinedRooms.push(roomId);
      this.logger.debug(
        `Updated socket.data.joinedRooms: ${JSON.stringify(socket.data.joinedRooms)}`
      );
    }

    // Get room users
    const users = this.getUsersInRoom(roomId);
    this.logger.log(`Users in room ${roomId}: ${JSON.stringify(users)}`);

    // Notify room about new user
    this.notifyRoomUpdate(roomId);

    const response: JoinRoomResponse = {
      success: true,
      room: {
        id: roomId,
        name: `Room ${roomId}`,
        users,
      },
    };

    this.logger.log(`Join room response: ${JSON.stringify(response)}`);
    return response;
  }

  /**
   * Remove a socket from a room
   */
  async leaveRoom(socket: TypedServerSocket, roomId: string): Promise<boolean> {
    if (!this.rooms.has(roomId)) {
      return false;
    }

    // Remove socket from room
    await socket.leave(roomId);
    this.rooms.get(roomId)?.delete(socket.id as string);

    // Update socket data
    socket.data.joinedRooms = socket.data.joinedRooms.filter(
      (id) => id !== roomId
    );

    // Clean up empty rooms
    if (this.rooms.get(roomId)?.size === 0) {
      this.rooms.delete(roomId);
    } else {
      // Notify room about user leaving
      this.notifyRoomUpdate(roomId);
    }

    return true;
  }

  /**
   * Broadcast a message to a room
   */
  broadcastMessage(
    socket: TypedServerSocket,
    payload: MessagePayload
  ): boolean {
    const { roomId, content } = payload;
    this.logger.log(
      `Broadcasting message to room ${roomId} from socket ${socket.id}: ${content}`
    );

    if (!this.rooms.has(roomId)) {
      this.logger.error(`Room ${roomId} does not exist`);
      throw new Error(`Room ${roomId} does not exist`);
    }

    if (!socket.data.joinedRooms.includes(roomId)) {
      this.logger.error(`User ${socket.id} is not in room ${roomId}`);
      throw new Error("User is not in this room");
    }

    // Get the sender info
    const senderId = socket.data.userId || (socket.id as string);
    const senderName =
      socket.data.username || `User ${(socket.id as string).substring(0, 4)}`;

    // Log room members
    const roomMembers = this.getUsersInRoom(roomId);
    this.logger.log(
      `Room ${roomId} has ${roomMembers.length} members: ${JSON.stringify(roomMembers)}`
    );

    // Create message payload
    const messagePayload = {
      id: crypto.randomUUID(),
      roomId,
      content,
      senderId,
      senderName,
      timestamp: Date.now(),
    };

    this.logger.log(
      `Emitting MESSAGE event to room ${roomId} with payload: ${JSON.stringify(messagePayload)}`
    );

    // Broadcast message to room using dedicated 'message' event
    socket.to(roomId).emit(ServerEvents.MESSAGE, messagePayload);

    return true;
  }

  /**
   * Notify all users in a room about updates
   */
  private notifyRoomUpdate(roomId: string) {
    this.logger.log(`Notifying room update for room: ${roomId}`);

    if (!this.server || !this.rooms.has(roomId)) {
      this.logger.warn(
        `Cannot notify room update: server=${!!this.server}, room exists=${this.rooms.has(roomId)}`
      );
      return;
    }

    const users = this.getUsersInRoom(roomId);
    this.logger.debug(
      `Room ${roomId} users for update: ${JSON.stringify(users)}`
    );

    const payload: RoomUpdatePayload = {
      roomId,
      users,
      lastUpdate: Date.now(),
    };

    this.logger.debug(
      `Broadcasting ROOM_UPDATE with payload: ${JSON.stringify(payload)}`
    );
    typedBroadcast(this.server, ServerEvents.ROOM_UPDATE, payload);
  }

  /**
   * Get all users in a room
   */
  private getUsersInRoom(roomId: string) {
    const users: { id: string; username: string }[] = [];

    if (!this.rooms.has(roomId)) {
      return users;
    }

    const socketIds = Array.from(this.rooms.get(roomId) || []);

    for (const id of socketIds) {
      const socket = this.server.sockets.sockets.get(id) as
        | TypedServerSocket
        | undefined;
      if (socket) {
        users.push({
          id: socket.data.userId || (socket.id as string),
          username:
            socket.data.username ||
            `User ${(socket.id as string).substring(0, 4)}`,
        });
      }
    }

    return users;
  }
}
