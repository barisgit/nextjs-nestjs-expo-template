import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  FlatList as FlatListType,
} from "react-native";
import { Button, XStack, YStack, H4, Card } from "tamagui";
import {
  useSocketStatus,
  useChatRoom,
  useSocketErrors,
  useChatMessages,
} from "../hooks/use-socket";
import { useTRPC } from "../utils/trpc";
import { useMutation, useQuery } from "@tanstack/react-query";
import * as socketService from "../services/socket-service";
import { ChatMessagePayload } from "@repo/websockets";

export function ChatDemo() {
  const trpc = useTRPC();
  const [message, setMessage] = useState("");
  const [roomName, setRoomName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const messageListRef = useRef<FlatListType<ChatMessagePayload>>(null);

  // Socket hooks
  const { isConnected, loading: socketLoading } = useSocketStatus();
  const { currentRoomId, roomInfo, joinRoom, leaveRoom, sendMessage } =
    useChatRoom();
  const { lastError } = useSocketErrors();
  const { messages, clearMessages } = useChatMessages();

  const {
    data: rooms,
    isLoading: isLoadingRooms,
    refetch: refetchRooms,
  } = useQuery(trpc.chatroom.getRooms.queryOptions());

  const { mutate: createRoom } = useMutation(
    trpc.chatroom.createRoom.mutationOptions({
      onSuccess: () => {
        setRoomName("");
        setIsCreating(false);
        refetchRooms();
      },
    })
  );

  // Handle room joining
  const handleJoinRoom = (roomId: string) => {
    joinRoom(roomId);
  };

  // Handle room leaving
  const handleLeaveRoom = () => {
    leaveRoom();
    clearMessages();
  };

  // Handle sending messages
  const handleSendMessage = () => {
    if (message.trim() && currentRoomId) {
      sendMessage(message);
      setMessage("");
    }
  };

  // Auto-scroll to bottom whenever new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        messageListRef.current?.scrollToEnd({ animated: true });
      }, 100); // Small delay to ensure render is complete
    }
  }, [messages]);

  // Render room list - as a standalone component to avoid nesting VirtualizedLists
  if (!currentRoomId) {
    return (
      <YStack space="$4" padding="$2">
        <XStack justifyContent="space-between" alignItems="center">
          <H4>Chat Rooms</H4>
          <Text style={styles.connectionStatus}>
            {isConnected ? (
              <Text style={{ color: "#4caf50" }}>● Connected</Text>
            ) : (
              <Text style={{ color: "#f44336" }}>● Disconnected</Text>
            )}
          </Text>
        </XStack>

        {isLoadingRooms ? (
          <ActivityIndicator size="small" />
        ) : (
          <View style={{ height: 200 }}>
            {rooms?.length && rooms.length > 0 ? (
              <FlatList
                data={rooms}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <Card
                    bordered
                    animation="bouncy"
                    scale={0.95}
                    marginBottom="$2"
                    pressStyle={{ scale: 0.975 }}
                    onPress={() => handleJoinRoom(item.id)}
                    theme="active"
                  >
                    <Card.Header>
                      <Text style={styles.roomName}>{item.name}</Text>
                    </Card.Header>
                    <Card.Footer>
                      <Text style={styles.roomInfo}>
                        {item.userCount}{" "}
                        {item.userCount === 1 ? "user" : "users"}
                      </Text>
                    </Card.Footer>
                  </Card>
                )}
              />
            ) : (
              <Text style={styles.noRooms}>No rooms available</Text>
            )}
          </View>
        )}

        {isCreating ? (
          <YStack space="$2" marginTop="$2">
            <TextInput
              style={styles.input}
              value={roomName}
              onChangeText={setRoomName}
              placeholder="Room name"
            />
            <XStack space="$2">
              <Button
                flex={1}
                onPress={() => createRoom({ name: roomName })}
                theme="active"
              >
                Create
              </Button>
              <Button
                flex={1}
                onPress={() => setIsCreating(false)}
                theme="gray"
              >
                Cancel
              </Button>
            </XStack>
          </YStack>
        ) : (
          <Button onPress={() => setIsCreating(true)} icon={<Text>+</Text>}>
            Create New Room
          </Button>
        )}
      </YStack>
    );
  }

  // Determine if a message is from the current user (fix for issue #2)
  const isMyMessage = (senderId: string) => {
    // Get the current socket ID
    const socketId = socketService.getSocket()?.id;

    console.log("Message senderId:", senderId);
    console.log("Current socket ID:", socketId);
    console.log("Is my message?", senderId === socketId);

    // In the WebSocket service, if userId is not set, it uses socket.id as the senderId
    return senderId === socketId;
  };

  // Render chat room
  return (
    <YStack space="$4" padding="$2" flex={1}>
      <Card bordered marginBottom="$2" theme="active">
        <Card.Header padding="$2">
          <XStack
            justifyContent="space-between"
            alignItems="center"
            width="100%"
          >
            <H4>{roomInfo?.name || currentRoomId}</H4>
            <Text>
              {isConnected ? (
                <Text style={{ color: "#4caf50" }}>● Connected</Text>
              ) : (
                <Text style={{ color: "#f44336" }}>● Disconnected</Text>
              )}
            </Text>
          </XStack>
        </Card.Header>
      </Card>

      <View style={styles.messageContainer}>
        {messages.length === 0 ? (
          <Text style={styles.noMessages}>
            No messages yet. Start chatting!
          </Text>
        ) : (
          <FlatList
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => {
              const isMine = isMyMessage(item.senderId);
              return (
                <View
                  style={[
                    styles.messageItem,
                    isMine ? styles.myMessage : styles.otherMessage,
                  ]}
                >
                  <Text style={styles.messageSender}>{item.senderName}</Text>
                  <Text style={styles.messageContent}>{item.content}</Text>
                  <Text style={styles.messageTime}>
                    {formatMessageTime(item.timestamp)}
                  </Text>
                </View>
              );
            }}
            inverted={false}
            contentContainerStyle={styles.messagesContentContainer}
            onContentSizeChange={() => {
              messageListRef.current?.scrollToEnd({ animated: true });
            }}
            ref={messageListRef}
          />
        )}
      </View>

      {lastError && (
        <Text style={styles.errorText}>Error: {lastError.message}</Text>
      )}

      <Card bordered theme="active">
        <Card.Header padding="$2">
          <XStack space="$2" width="100%">
            <TextInput
              style={[styles.messageInput, { flex: 1 }]}
              value={message}
              onChangeText={setMessage}
              placeholder="Type a message..."
            />
            <Button onPress={handleSendMessage} disabled={!message.trim()}>
              Send
            </Button>
          </XStack>
        </Card.Header>
        <Card.Footer>
          <Button onPress={handleLeaveRoom} theme="red" width="100%">
            Leave Room
          </Button>
        </Card.Footer>
      </Card>
    </YStack>
  );
}

const styles = StyleSheet.create({
  connectionStatus: {
    fontSize: 14,
  },
  roomName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  roomInfo: {
    fontSize: 14,
    color: "#666",
  },
  noRooms: {
    textAlign: "center",
    color: "#666",
    padding: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 10,
    backgroundColor: "#ffffff",
    color: "#000000",
  },
  messageContainer: {
    flex: 1,
    borderRadius: 8,
    padding: 10,
    backgroundColor: "#ffffff",
  },
  messageItem: {
    padding: 10,
    borderRadius: 12,
    marginBottom: 10,
    maxWidth: "80%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  myMessage: {
    backgroundColor: "#DCF8C6",
    alignSelf: "flex-end",
    borderBottomRightRadius: 2,
  },
  otherMessage: {
    backgroundColor: "#FFFFFF",
    alignSelf: "flex-start",
    borderBottomLeftRadius: 2,
  },
  messageSender: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 2,
    color: "#000000",
  },
  messageContent: {
    fontSize: 15,
    color: "#000000",
  },
  messageTime: {
    fontSize: 10,
    color: "#666",
    alignSelf: "flex-end",
    marginTop: 4,
  },
  noMessages: {
    textAlign: "center",
    color: "#666",
    padding: 16,
  },
  messageInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 10,
    backgroundColor: "#ffffff",
    color: "#000000",
  },
  errorText: {
    color: "red",
    fontSize: 12,
  },
  messagesContentContainer: {
    paddingBottom: 20,
  },
});

// Helper to format message timestamp
const formatMessageTime = (timestamp: number): string => {
  const date = new Date(timestamp);
  const now = new Date();

  // Same day - show time only
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  // Within a week - show day and time
  const daysAgo = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
  );
  if (daysAgo < 7) {
    return `${date.toLocaleDateString([], { weekday: "short" })} ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  }

  // Older - show date and time
  return `${date.toLocaleDateString([], { month: "short", day: "numeric" })} ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
};
