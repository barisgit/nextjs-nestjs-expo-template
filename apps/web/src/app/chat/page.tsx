"use client";

import { type JSX } from "react";
import { type JoinRoomResponse } from "@repo/websocket-types";
import { ChatRoom } from "@/components/chat/chat-room";
import { RoomSelector } from "@/components/chat/room-selector";
import { useChatRoom } from "@/hooks/use-socket";

// export const metadata = {
//   title: "Chat Room",
//   description: "Real-time chat powered by Socket.IO",
// };

export default function ChatPage(): JSX.Element {
  // Use our Redux-based chat room hook
  const { currentRoomId, roomInfo, leaveRoom } = useChatRoom();

  // Handle room joining
  const handleRoomJoined = (
    _roomId: string,
    _room: JoinRoomResponse["room"]
  ): void => {
    // The actual room joining is handled by the joinRoom function in RoomSelector
    // This function is just for any additional logic needed at the page level
  };

  // Handle room leaving
  const handleLeaveRoom = (): void => {
    leaveRoom();
  };

  return (
    <div className="container mx-auto p-4 h-[calc(100vh-4rem)]">
      <h1 className="text-2xl font-bold mb-6 text-center">Real-time Chat</h1>

      {/* Debug Info */}
      <div className="mb-4 p-2 bg-gray-100 rounded text-sm text-gray-700">
        <p>Debug - Room ID: {currentRoomId ?? "Not joined"}</p>
        <p>Debug - Room Info: {roomInfo ? roomInfo.name : "No room info"}</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-6 h-[calc(100%-8rem)] pb-2">
        <div className="w-full md:w-1/3 py-2">
          <RoomSelector onRoomJoined={handleRoomJoined} />
        </div>
        <div className="w-full md:w-2/3">
          <ChatRoom
            currentRoomId={currentRoomId}
            roomInfo={roomInfo}
            onLeaveRoom={handleLeaveRoom}
          />
        </div>
      </div>
    </div>
  );
}
