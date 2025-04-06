import {
  createSlice,
  type PayloadAction,
  createAsyncThunk,
} from "@reduxjs/toolkit";
import {
  type JoinRoomResponse,
  type RoomUpdatePayload,
  type NotificationPayload,
  type ErrorPayload,
  type ChatMessagePayload,
} from "@repo/websocket-types";
import * as socketService from "@/services/socket-service";

// State interfaces
export interface SocketState {
  isConnected: boolean;
  currentRoomId: string | null;
  roomInfo: JoinRoomResponse["room"] | null;
  messages: ChatMessagePayload[];
  notifications: NotificationPayload[];
  lastError: ErrorPayload | null;
  loading: boolean;
  error: string | null;
}

const initialState: SocketState = {
  isConnected: false,
  currentRoomId: null,
  roomInfo: null,
  messages: [],
  notifications: [],
  lastError: null,
  loading: false,
  error: null,
};

// Async thunks
export const initializeSocketConnection = createAsyncThunk(
  "socket/initialize",
  async (_, { dispatch }) => {
    try {
      socketService.initializeSocket();

      // Setup listeners
      socketService.setupEventListeners({
        onConnect: () => dispatch(setConnected(true)),
        onDisconnect: () => dispatch(setConnected(false)),
        onError: (error) => dispatch(setSocketError(error)),
        onMessage: (message: ChatMessagePayload) =>
          dispatch(addMessage(message)),
        onRoomUpdate: (update: RoomUpdatePayload) =>
          dispatch(handleRoomUpdate(update)),
        onNotification: (notification: NotificationPayload) =>
          dispatch(addNotification(notification)),
      });

      return true;
    } catch (error) {
      if (error instanceof Error) {
        return Promise.reject(new Error(error.message));
      }
      return Promise.reject(new Error("Failed to initialize socket"));
    }
  }
);

export const joinChatRoom = createAsyncThunk(
  "socket/joinRoom",
  async (roomId: string, { rejectWithValue }) => {
    try {
      const roomInfo = await socketService.joinRoom(roomId);
      return { roomId, roomInfo };
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("Failed to join room");
    }
  }
);

export const leaveChatRoom = createAsyncThunk(
  "socket/leaveRoom",
  async (_, { getState, rejectWithValue }) => {
    const state = getState() as { socket: SocketState };
    const { currentRoomId } = state.socket;

    if (!currentRoomId) {
      return rejectWithValue("Not connected to any room");
    }

    try {
      await socketService.leaveRoom(currentRoomId);
      return true;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("Failed to leave room");
    }
  }
);

export const sendChatMessage = createAsyncThunk(
  "socket/sendMessage",
  async (content: string, { getState, rejectWithValue }) => {
    const state = getState() as { socket: SocketState };
    const { currentRoomId } = state.socket;

    if (!currentRoomId) {
      return rejectWithValue("Not connected to any room");
    }

    try {
      await socketService.sendMessage(currentRoomId, content);
      return true;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("Failed to send message");
    }
  }
);

export const disconnectSocket = createAsyncThunk("socket/disconnect", () => {
  socketService.closeSocket();
  return true;
});

// Socket slice
const socketSlice = createSlice({
  name: "socket",
  initialState,
  reducers: {
    setConnected: (state, action: PayloadAction<boolean>) => {
      state.isConnected = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    addMessage: (state, action: PayloadAction<ChatMessagePayload>) => {
      // Only add messages for the current room if roomId is specified
      if (
        !state.currentRoomId ||
        action.payload.roomId === state.currentRoomId
      ) {
        // Check if message with this ID already exists to prevent duplicates
        const messageExists = state.messages.some(
          (msg) => msg.id === action.payload.id
        );

        if (!messageExists) {
          state.messages.unshift(action.payload);
        }
      }
    },
    clearMessages: (state) => {
      state.messages = [];
    },
    addNotification: (state, action: PayloadAction<NotificationPayload>) => {
      state.notifications.unshift(action.payload);
      // Keep last 50 notifications
      if (state.notifications.length > 50) {
        state.notifications = state.notifications.slice(0, 50);
      }
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },
    setSocketError: (state, action: PayloadAction<ErrorPayload>) => {
      state.lastError = action.payload;
    },
    clearSocketError: (state) => {
      state.lastError = null;
    },
    handleRoomUpdate: (state, action: PayloadAction<RoomUpdatePayload>) => {
      if (action.payload.roomId === state.currentRoomId && state.roomInfo) {
        state.roomInfo = {
          ...state.roomInfo,
          users: action.payload.users,
        };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // initializeSocketConnection
      .addCase(initializeSocketConnection.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(initializeSocketConnection.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(initializeSocketConnection.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Failed to initialize socket";
      })
      // joinChatRoom
      .addCase(joinChatRoom.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(joinChatRoom.fulfilled, (state, action) => {
        state.loading = false;
        state.currentRoomId = action.payload.roomId;
        state.roomInfo = action.payload.roomInfo;
      })
      .addCase(joinChatRoom.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // leaveChatRoom
      .addCase(leaveChatRoom.pending, (state) => {
        state.loading = true;
      })
      .addCase(leaveChatRoom.fulfilled, (state) => {
        state.loading = false;
        state.currentRoomId = null;
        state.roomInfo = null;
      })
      .addCase(leaveChatRoom.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // sendChatMessage
      .addCase(sendChatMessage.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      // disconnectSocket
      .addCase(disconnectSocket.fulfilled, (state) => {
        state.isConnected = false;
      });
  },
});

export const {
  setConnected,
  setError,
  addMessage,
  clearMessages,
  addNotification,
  clearNotifications,
  setSocketError,
  clearSocketError,
  handleRoomUpdate,
} = socketSlice.actions;

export default socketSlice.reducer;
