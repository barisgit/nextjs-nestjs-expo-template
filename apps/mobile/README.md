# Mobile App (Expo)

This React Native application built with Expo provides a mobile interface for the platform.

## Features

- Cross-platform support (iOS and Android)
- Integration with shared packages
- Type-safe API communication with tRPC
- Real-time functionality with WebSockets
- UI components from the shared UI library
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
import { createTypedSocketClient, ClientEvents } from '@repo/websockets';

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

### UI Component Usage

> Coming soon

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

## (Envisioned) Project Structure

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
└── app.config.ts        # Expo configuration (the actual config)
```

## Environment Setup

1. Copy `.env.example` to `.env`
2. Update the environment variables as needed:

```env
API_URL=http://localhost:3000
CLERK_PUBLISHABLE_KEY=your_clerk_key
```

## Known Issues

- Expo SDK 52 is not compatible with React 18. We will use React 19 when we upgrade to Expo SDK 53 (in May 2025).

## Adding New Features

1. Create screen components in `app/screens/`
2. Add navigation in `app/navigation/`
3. Connect to backend APIs using tRPC procedures
4. Use shared UI components from `@repo/ui/native` (coming soon)
5. Add analytics tracking for important user actions
