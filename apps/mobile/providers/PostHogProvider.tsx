import React, { ReactNode, useEffect } from "react";
import { PostHogProvider as PostHogRNProvider } from "posthog-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import { useAuth } from "@clerk/clerk-expo";

// Get the PostHog API key from environment variables
const POSTHOG_API_KEY = process.env.EXPO_PUBLIC_POSTHOG_KEY || "";
const POSTHOG_HOST =
  process.env.EXPO_PUBLIC_POSTHOG_HOST || "https://app.posthog.com";

// Custom interfaces for extending PostHog types
interface ExtendedPostHogOptions {
  host: string;
  disableGeoip?: boolean;
  captureApplicationLifecycleEvents?: boolean;
  captureScreenViews?: boolean;
  useDeviceId?: boolean;
  enableDebug?: boolean;
}

// Define the shape of the global posthog object
declare global {
  // eslint-disable-next-line no-var
  var posthog:
    | {
        identify?: (userId: string, properties?: Record<string, any>) => void;
        reset?: () => void;
      }
    | undefined;
}

interface PostHogProviderProps {
  children: ReactNode;
}

export function PostHogProvider({
  children,
}: PostHogProviderProps): JSX.Element {
  const { isSignedIn, userId } = useAuth();

  // Identify user when they sign in
  useEffect(() => {
    if (isSignedIn && userId && global.posthog?.identify) {
      // Identify the user in PostHog with their Clerk ID
      global.posthog.identify(userId);
    } else if (global.posthog?.reset) {
      // Reset user identification when signed out
      global.posthog.reset();
    }
  }, [isSignedIn, userId]);

  // Create the client configuration
  const clientConfig = {
    // Use AsyncStorage for persistence
    storage: {
      async getItem(key: string): Promise<string | null> {
        return AsyncStorage.getItem(key);
      },
      async setItem(key: string, value: string): Promise<void> {
        return AsyncStorage.setItem(key, value);
      },
      async removeItem(key: string): Promise<void> {
        return AsyncStorage.removeItem(key);
      },
    },
    // Add platform information
    platform: Platform.OS,
  };

  return (
    <PostHogRNProvider
      apiKey={POSTHOG_API_KEY}
      options={
        {
          host: POSTHOG_HOST,
          disableGeoip: true,
          // Extended options with proper typing
          captureApplicationLifecycleEvents: true,
          captureScreenViews: true,
          useDeviceId: true,
          enableDebug: __DEV__,
        } as ExtendedPostHogOptions
      }
      // Using type assertion for the entire props object
      {...({ client: clientConfig } as any)}
    >
      {children}
    </PostHogRNProvider>
  );
}
