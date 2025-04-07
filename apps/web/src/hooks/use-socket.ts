"use client";

import { useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  type ChatMessagePayload,
  type ErrorPayload,
  type NotificationPayload,
  type JoinRoomResponse,
} from "@repo/websockets";
import { type AppDispatch, type RootState } from "@/store";
import {
  initializeSocketConnection,
  joinChatRoom,
  leaveChatRoom,
  sendChatMessage,
  disconnectSocket,
  clearMessages,
  clearNotifications,
  clearSocketError,
} from "@/store/socket-slice";

/**
 * Hook for socket connection status
 */
export const useSocketStatus = (): {
  isConnected: boolean;
  loading: boolean;
  error: string | null;
} => {
  const dispatch = useDispatch<AppDispatch>();
  const { isConnected, loading, error } = useSelector(
    (state: RootState) => state.socket
  );

  // Initialize socket connection
  useEffect(() => {
    void dispatch(initializeSocketConnection());

    // Clean up socket on unmount
    return () => {
      void dispatch(disconnectSocket());
    };
  }, [dispatch]);

  return { isConnected, loading, error };
};

/**
 * Hook for joining and leaving chat rooms
 */
export const useChatRoom = (): {
  currentRoomId: string | null;
  roomInfo: JoinRoomResponse["room"] | null;
  loading: boolean;
  error: string | null;
  joinRoom: (roomId: string) => void;
  leaveRoom: () => void;
  sendMessage: (content: string) => boolean;
} => {
  const dispatch = useDispatch<AppDispatch>();
  const { currentRoomId, roomInfo, loading, error } = useSelector(
    (state: RootState) => state.socket
  );

  // Join a room
  const joinRoom = useCallback(
    (roomId: string) => {
      void dispatch(joinChatRoom(roomId));
    },
    [dispatch]
  );

  // Leave the current room
  const leaveRoom = useCallback(() => {
    if (currentRoomId) {
      void dispatch(leaveChatRoom());
    }
  }, [dispatch, currentRoomId]);

  // Send a message to the current room
  const sendMessage = useCallback(
    (content: string) => {
      if (!currentRoomId) {
        return false;
      }
      void dispatch(sendChatMessage(content));
      return true;
    },
    [dispatch, currentRoomId]
  );

  return {
    currentRoomId,
    roomInfo,
    loading,
    error,
    joinRoom,
    leaveRoom,
    sendMessage,
  };
};

/**
 * Hook for receiving chat messages
 */
export const useChatMessages = (): {
  messages: ChatMessagePayload[];
  clearMessages: () => void;
} => {
  const dispatch = useDispatch<AppDispatch>();
  const { messages, currentRoomId } = useSelector(
    (state: RootState) => state.socket
  );

  // Filter messages for the current room if needed
  const roomMessages = currentRoomId
    ? messages.filter((msg) => msg.roomId === currentRoomId)
    : messages;

  // Clear messages
  const clearAllMessages = useCallback(() => {
    dispatch(clearMessages());
  }, [dispatch]);

  return { messages: roomMessages, clearMessages: clearAllMessages };
};

/**
 * Hook for receiving notifications
 */
export const useNotifications = (): {
  notifications: NotificationPayload[];
  clearNotifications: () => void;
} => {
  const dispatch = useDispatch<AppDispatch>();
  const { notifications } = useSelector((state: RootState) => state.socket);

  // Clear notifications
  const clearAllNotifications = useCallback(() => {
    dispatch(clearNotifications());
  }, [dispatch]);

  return { notifications, clearNotifications: clearAllNotifications };
};

/**
 * Hook for handling socket errors
 */
export const useSocketErrors = (): {
  lastError: ErrorPayload | null;
  clearError: () => void;
} => {
  const dispatch = useDispatch<AppDispatch>();
  const { lastError } = useSelector((state: RootState) => state.socket);

  // Clear error
  const clearError = useCallback(() => {
    dispatch(clearSocketError());
  }, [dispatch]);

  return { lastError, clearError };
};
