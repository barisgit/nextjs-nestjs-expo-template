import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from "@nestjs/websockets";
import { Logger } from "@nestjs/common";
import {
  type TypedServer,
  type TypedServerSocket,
  ClientEvents,
  MessagePayloadSchema,
  SocketResponse,
  createValidatedHandler,
  typedEmit,
} from "@repo/websocket-types";
import { WebsocketService } from "./websocket.service.js";

@WebSocketGateway({
  cors: {
    origin: "*", // Allow any origin in development
    credentials: true,
  },
  transports: ["websocket", "polling"],
  path: "/socket.io",
})
export class WebsocketGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(WebsocketGateway.name);

  @WebSocketServer()
  server: TypedServer;

  constructor(private readonly websocketService: WebsocketService) {}

  afterInit(server: TypedServer) {
    this.logger.log("WebSocket Gateway initialized");
    this.websocketService.setServer(server);
  }

  handleConnection(client: TypedServerSocket) {
    this.logger.log(`Client connected: ${client.id}`);
    this.logger.debug(`Client connection type: ${typeof client.conn}`);

    // Socket.io is not typed, so we need to check the type of the conn property
    this.logger.debug(
      `Client transport: ${
        client.conn &&
        typeof client.conn === "object" &&
        "transport" in client.conn
          ? ((client.conn as { transport?: { name?: string } }).transport
              ?.name ?? "unknown")
          : "unknown"
      }`
    );
    this.logger.debug(
      `Client handshake: ${JSON.stringify(client.handshake?.query)}`
    );

    // Set up validated handlers
    this.setupValidatedHandlers(client);

    // Listen for all events in debug mode
    client.onAny((event, ...args) => {
      this.logger.log(
        `Event received from client ${client.id}: ${event}`,
        args
      );
    });

    // Set default socket data
    client.data = {
      userId: "",
      username: "",
      joinedRooms: [],
    };
  }

  handleDisconnect(client: TypedServerSocket) {
    this.logger.log(`Client disconnected: ${client.id}`);

    // Handle cleanup (e.g., leave all rooms)
    if (client.data.joinedRooms.length > 0) {
      client.data.joinedRooms.forEach((roomId) => {
        void this.websocketService.leaveRoom(client, roomId);
      });
    }
  }

  private setupValidatedHandlers(client: TypedServerSocket) {
    // Join room handler with validation
    const joinRoomHandler = createValidatedHandler(
      ClientEvents.JOIN_ROOM,
      MessagePayloadSchema.shape.roomId,
      async (roomId, socket, callback) => {
        this.logger.debug(
          `JOIN_ROOM request received for room: ${roomId} from client: ${socket.id}`
        );
        try {
          const response = await this.websocketService.joinRoom(socket, roomId);
          this.logger.debug(
            `JOIN_ROOM successful for room: ${roomId}, response: ${JSON.stringify(response)}`
          );
          if (callback) callback(response as SocketResponse);
        } catch (error) {
          this.logger.error(`JOIN_ROOM failed for room: ${roomId}`, error);
          if (callback) {
            callback({
              success: false,
              error: error instanceof Error ? error.message : "Unknown error",
            });
          }
        }
      }
    );

    // Leave room handler with validation
    const leaveRoomHandler = createValidatedHandler(
      ClientEvents.LEAVE_ROOM,
      MessagePayloadSchema.shape.roomId,
      async (roomId, socket, callback) => {
        try {
          const success = await this.websocketService.leaveRoom(socket, roomId);
          if (callback) callback({ success });
        } catch (error) {
          void error;
          if (callback) callback({ success: false });
        }
      }
    );

    // Send message handler with validation - keeping for compatibility but adding direct listener approach
    const sendMessageHandler = createValidatedHandler(
      ClientEvents.SEND_MESSAGE,
      MessagePayloadSchema,
      (payload, socket, callback) => {
        this.logger.log(
          `SEND_MESSAGE received from client ${socket.id}: ${JSON.stringify(payload)}`
        );
        try {
          const success = this.websocketService.broadcastMessage(
            socket,
            payload
          );
          this.logger.log(
            `Message broadcast success: ${success}, to room: ${payload.roomId}`
          );
          if (callback) callback({ success });
        } catch (error) {
          this.logger.error(`Error in SEND_MESSAGE handler:`, error);
          if (callback) callback({ success: false });
          typedEmit(socket, "error", {
            code: "MESSAGE_ERROR",
            message:
              error instanceof Error ? error.message : "Failed to send message",
          });
        }
      }
    );

    // Apply all handlers to the socket
    joinRoomHandler(client);
    leaveRoomHandler(client);
    sendMessageHandler(client);
  }
}
