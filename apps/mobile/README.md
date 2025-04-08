# Mobile App (Expo)

This React Native application built with Expo provides a mobile interface for the platform.

## Features

- Cross-platform support (iOS and Android)
- Integration with shared packages
- Type-safe API communication with tRPC
- Real-time functionality with WebSockets
- UI components with Tamagui
- Analytics tracking

## Development

```bash
# From the mobile directory
pnpm run dev

# Or from the root directory
pnpm run dev:mobile
```

## Package Integrations

### tRPC Integration

The mobile app uses tRPC for type-safe API communication:

```tsx
// app/screens/HomeScreen.tsx
import { trpc } from '../utils/trpc';

export default function HomeScreen() {
  const { data, isLoading } = trpc.users.getProfile.useQuery();
  
  if (isLoading) {
    return <LoadingIndicator />;
  }
  
  return (
    <View>
      <Text>Welcome, {data.name}!</Text>
    </View>
  );
}
```

### WebSockets Integration

Real-time communication using the WebSockets package:

```tsx
// app/utils/socket.ts
import { createTypedSocketClient, ClientEvents, ServerEvents } from '@repo/websockets';

export const socket = createTypedSocketClient('http://your-api-url');

// In your component
import { socket } from '../utils/socket';
import { useEffect, useState } from 'react';

export function ChatScreen({ roomId }) {
  const [messages, setMessages] = useState([]);
  
  useEffect(() => {
    // Join room
    socket.emit(ClientEvents.JOIN_ROOM, roomId);
    
    // Listen for messages
    socket.on(ServerEvents.MESSAGE, (message) => {
      setMessages((prev) => [...prev, message]);
    });
    
    return () => {
      // Leave room on unmount
      socket.emit(ClientEvents.LEAVE_ROOM, roomId);
      socket.off(ServerEvents.MESSAGE);
    };
  }, [roomId]);
  
  // Send message function
  const sendMessage = (content) => {
    socket.emit(ClientEvents.SEND_MESSAGE, {
      roomId,
      content
    });
  };
  
  return (/* Chat UI */);
}
```

### Tamagui UI Component Usage

Tamagui is integrated for a consistent and performant UI experience:

```tsx
import React, { useState } from 'react';
import { Button, Card, H2, Paragraph, View, Input } from 'tamagui';

export function ProfileCard({ user }) {
  const [bio, setBio] = useState(user?.bio || '');
  
  return (
    <Card
      bordered
      elevate
      size="$4"
      animation="bouncy"
      width="100%"
      scale={0.9}
      hoverStyle={{ scale: 0.925 }}
      pressStyle={{ scale: 0.875 }}
      theme="active"
    >
      <Card.Header padded>
        <H2>{user?.name || 'User Profile'}</H2>
        <Paragraph>{user?.email}</Paragraph>
      </Card.Header>
      
      <Card.Footer padded>
        <View style={{ gap: 12 }}>
          <Input
            placeholder="Enter your bio"
            value={bio}
            onChangeText={setBio}
            width="100%"
          />
          <Button theme="blue" onPress={() => console.log('Bio updated:', bio)}>
            Update Profile
          </Button>
        </View>
      </Card.Footer>
    </Card>
  );
}
```

### Analytics Integration

Track user events:

```tsx
import { Analytics } from '@repo/analytics/mobile';

// In your component
function FeatureScreen() {
  const handleAction = () => {
    // Track the action
    Analytics.track('feature_used', {
      featureId: 'some-feature-id',
      value: 123
    });
    
    // Perform the action
    // ...
  };
  
  return (
    <Button onPress={handleAction}>
      Use Feature
    </Button>
  );
}
```

## Project Structure

```text
mobile/
├── app/                 # Application code
│   ├── components/      # Reusable components
│   ├── screens/         # Screen components
│   ├── navigation/      # Navigation configuration
│   ├── hooks/           # Custom hooks
│   ├── utils/           # Utility functions
│   └── services/        # API services
├── assets/              # Static assets
├── .env.example         # Example environment variables
├── app.config.js        # Expo configuration (entry point)
├── app.config.ts        # Expo configuration (the actual config)
└── tamagui.config.ts    # Tamagui configuration
```

## Environment Setup

1. Copy `.env.example` to `.env`
2. Update the environment variables as needed:

```env
API_URL=http://localhost:3000
CLERK_PUBLISHABLE_KEY=your_clerk_key
```

## Tamagui Theming

The app uses Tamagui for a consistent UI experience. The theme is configured in `tamagui.config.ts`:

```tsx
// Customize theme colors, fonts, and other properties
const tamaguiConfig = createTamagui({
  ...defaultConfig,
  fonts: {
    ...defaultConfig.fonts,
    heading: interFont,
    body: interFont,
  },
  // Add custom themes and tokens here
});
```

## Known Issues

- Expo SDK 52 is not compatible with React 18. We will use React 19 when we upgrade to Expo SDK 53 (in May 2025).

## Adding New Features

1. Create screen components in `app/screens/`
2. Add navigation in `app/navigation/`
3. Connect to backend APIs using tRPC procedures
4. Use Tamagui components for consistent UI
5. Add analytics tracking for important user actions
