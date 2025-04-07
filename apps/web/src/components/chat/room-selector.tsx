"use client";

import { useState, type JSX } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@repo/ui/components/base/button";
import { type JoinRoomResponse, ClientEvents } from "@repo/websockets";
import { useTRPC } from "@/utils/trpc";
import { useChatRoom } from "@/hooks/use-socket";
import { getSocket } from "@/services/socket-service";
import { logger } from "@/utils/logger";

interface RoomSelectorProps {
  onRoomJoined?: (roomId: string, roomInfo: JoinRoomResponse["room"]) => void;
}

export function RoomSelector({ onRoomJoined }: RoomSelectorProps): JSX.Element {
  const trpc = useTRPC();

  const [newRoomName, setNewRoomName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const {
    data: rooms = [],
    isLoading,
    refetch,
  } = useQuery(trpc.chatroom.getRooms.queryOptions());

  const createRoom = useMutation({
    ...trpc.chatroom.createRoom.mutationOptions(),
    onSuccess: () => {
      setNewRoomName("");
      setIsCreating(false);
      void refetch();
    },
  });

  const { currentRoomId, joinRoom } = useChatRoom();

  // Handle room creation
  const handleCreateRoom = (e: React.FormEvent): void => {
    e.preventDefault();
    if (newRoomName.trim()) {
      createRoom.mutate({ name: newRoomName });
    }
  };

  // Handle room join
  const handleJoinRoom = (roomId: string): void => {
    logger.info("Joining room:", roomId);

    // Use the hook to join the room
    joinRoom(roomId);

    // Listen for successful join and pass the data to parent
    const socket = getSocket();
    if (socket) {
      socket.emit(
        ClientEvents.JOIN_ROOM,
        roomId,
        (response: JoinRoomResponse) => {
          if (response.success && response.room && onRoomJoined) {
            logger.info("Calling onRoomJoined with:", roomId, response.room);
            onRoomJoined(roomId, response.room);
          }
        }
      );
    }
  };

  if (isLoading) {
    return <div className="p-4">Loading rooms...</div>;
  }

  return (
    <div className="w-full max-w-md mx-auto flex flex-col gap-2">
      <div className="mb-4">
        <h2 className="text-lg font-medium mb-2">Available Rooms</h2>
        {rooms.length > 0 ? (
          <div className="grid gap-1">
            {rooms.map((room) => (
              <button
                type="button"
                key={room.id}
                onClick={() => {
                  handleJoinRoom(room.id);
                }}
                className={`p-3 text-left rounded-lg border transition-colors ${
                  currentRoomId === room.id
                    ? "bg-blue-100 border-blue-300"
                    : "hover:bg-gray-100 border-gray-200"
                }`}
              >
                <div className="font-medium">{room.name}</div>
                <div className="text-sm text-gray-500">
                  {room.userCount} {room.userCount === 1 ? "user" : "users"} •
                  Created {new Date(room.createdAt).toLocaleDateString()}
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="text-gray-500 p-4 text-center border rounded-lg">
            No rooms available
          </div>
        )}
      </div>

      {isCreating ? (
        <form onSubmit={handleCreateRoom} className="mt-4 p-2">
          <h3 className="text-md font-medium mb-2">Create New Room</h3>
          <div className="flex gap-2">
            <input
              type="text"
              value={newRoomName}
              onChange={(e) => {
                setNewRoomName(e.target.value);
              }}
              placeholder="Room name"
              className="flex-1 px-3 py-2 border rounded"
            />
            <button
              type="submit"
              disabled={!newRoomName.trim() || createRoom.isPending}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300"
            >
              {createRoom.isPending ? "Creating..." : "Create"}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsCreating(false);
              }}
              className="px-4 py-2 border rounded hover:bg-gray-100"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <Button
          onClick={() => {
            setIsCreating(true);
          }}
          className="w-full py-2 px-4 border border-dashed rounded-lg text-text-secondary"
        >
          + Create New Room
        </Button>
      )}
    </div>
  );
}
