"use client";

import { useState, type FormEvent, useRef, useEffect, type JSX } from "react";
import { Button } from "@repo/ui/components/base/button";
import { type JoinRoomResponse } from "@repo/websockets";
import {
  useChatRoom,
  useSocketStatus,
  useSocketErrors,
  useChatMessages,
} from "@/hooks/use-socket";
import { logger } from "@/utils/logger";

interface ChatRoomProps {
  currentRoomId: string | null;
  roomInfo: JoinRoomResponse["room"] | null;
  onLeaveRoom?: () => void;
}

export function ChatRoom({
  currentRoomId: externalRoomId,
  roomInfo: externalRoomInfo,
  onLeaveRoom,
}: ChatRoomProps): JSX.Element {
  const [message, setMessage] = useState<string>("");
  const [localMessages, setLocalMessages] = useState<
    {
      id: string;
      content: string;
      timestamp: number;
      isMine: boolean;
    }[]
  >([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Socket hooks - we still need these for socket connection and sending messages
  const { isConnected } = useSocketStatus();
  const { leaveRoom, sendMessage } = useChatRoom();
  const { lastError } = useSocketErrors();

  // NEW: Use the chat messages hook to receive messages from the server
  const { messages: receivedMessages, clearMessages } = useChatMessages();

  // Handle room leaving with callback
  const handleLeaveRoom = (): void => {
    leaveRoom();
    clearMessages();
    if (onLeaveRoom) {
      onLeaveRoom();
    }
  };

  // Log current state for debugging
  useEffect(() => {
    logger.info("ChatRoom: externalRoomId changed:", externalRoomId);
    logger.info("ChatRoom: externalRoomInfo:", externalRoomInfo);
  }, [externalRoomId, externalRoomInfo]);

  // Handle sending messages
  const handleSendMessage = (e: FormEvent): void => {
    e.preventDefault();
    if (message.trim() && externalRoomId) {
      // Add message to local state immediately for better UX
      const newMessage = {
        id: crypto.randomUUID(),
        content: message,
        timestamp: Date.now(),
        isMine: true,
      };
      setLocalMessages((prev) => [...prev, newMessage]);

      // Send to server
      sendMessage(message);
      setMessage("");
    }
  };

  // Process received messages
  useEffect(() => {
    if (receivedMessages.length > 0) {
      const newMessages = receivedMessages
        .filter((msg) => !localMessages.some((local) => local.id === msg.id))
        .map((msg) => ({
          id: msg.id,
          content: msg.content,
          timestamp: msg.timestamp,
          isMine: false,
        }));

      if (newMessages.length > 0) {
        setLocalMessages((prev) => [...prev, ...newMessages]);
      }
    }
  }, [receivedMessages, localMessages]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [localMessages]);

  // Clear messages when leaving a room
  useEffect(() => {
    if (!externalRoomId) {
      setLocalMessages([]);
      clearMessages();
    }
  }, [externalRoomId, clearMessages]);

  return (
    <div className="flex flex-col h-full max-w-md mx-auto border rounded-lg overflow-hidden">
      <div className="p-4 bg-gray-100 border-b">
        <h2 className="text-lg font-semibold">
          {externalRoomId
            ? `Room: ${externalRoomInfo?.name ?? externalRoomId}`
            : "Chat Room"}
        </h2>
        <div className="text-sm">
          {isConnected ? (
            <span className="text-green-600">● Connected</span>
          ) : (
            <span className="text-red-600">● Disconnected</span>
          )}
        </div>
      </div>

      {/* Room Join Instructions */}
      {!externalRoomId && (
        <div className="p-6 flex items-center justify-center h-full">
          <div className="text-center text-gray-500">
            <p className="mb-3">Please select a room from the list to join</p>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 mx-auto animate-bounce"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16l-4-4m0 0l4-4m-4 4h18"
              />
            </svg>
          </div>
        </div>
      )}

      {/* Chat Messages */}
      <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
        {localMessages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-gray-500">
            {externalRoomId
              ? "No messages yet. Start the conversation!"
              : "Join a room to start chatting"}
          </div>
        ) : (
          <div className="space-y-3">
            {localMessages.map((msg) => (
              <div
                key={msg.id}
                className={`p-3 rounded-lg max-w-[80%] ${
                  msg.isMine ? "ml-auto bg-blue-100" : "mr-auto bg-gray-200"
                }`}
              >
                <div>{msg.content}</div>
                <div className="text-xs text-gray-500">
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Room Users */}
      {externalRoomId && externalRoomInfo ? (
        <div className="p-2 bg-gray-100 border-t">
          <div className="text-xs font-medium text-gray-500">USERS IN ROOM</div>
          <div className="flex flex-wrap gap-1 mt-1">
            {externalRoomInfo.users.map((user) => (
              <span
                key={user.id}
                className="px-2 py-1 text-xs bg-gray-200 rounded-full"
              >
                {user.username}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      {/* Message Input */}
      {externalRoomId ? (
        <div className="p-3 bg-white border-t">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <input
              type="text"
              placeholder="Type a message..."
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
              }}
              className="flex-1 px-3 py-2 border rounded"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              disabled={!message.trim()}
            >
              Send
            </button>
          </form>
          {lastError ? (
            <div className="mt-2 text-sm text-red-600">
              Error: {lastError.message}
            </div>
          ) : null}
          <div className="mt-2 flex justify-end">
            <Button variant="ghost" color="danger" onClick={handleLeaveRoom}>
              Leave Room
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
