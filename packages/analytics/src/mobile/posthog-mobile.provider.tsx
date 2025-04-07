import React, { createContext, useContext, useEffect, useState } from "react";

// Dynamic import for AsyncStorage with fallback
const AsyncStorage = async () => {
  try {
    // Use dynamic import instead of require
    const asyncStorage = await import(
      "@react-native-async-storage/async-storage"
    );
    return asyncStorage.default;
  } catch (error) {
    void error;
    // Provide a mock implementation for non-RN environments
    return {
      getItem: async () => null,
      setItem: async () => null,
      removeItem: async () => null,
      clear: async () => null,
    };
  }
};

// Dynamic import for PostHog with fallback
const PostHogClient = async () => {
  try {
    // Use dynamic import instead of require
    const posthog = await import("posthog-react-native");
    return posthog.default;
  } catch (error) {
    void error;
    // Return a mock implementation
    return {
      initAsync: async () => ({
        capture: () => {},
        identify: () => {},
        screen: () => {},
        reset: () => {},
        flush: () => {},
      }),
    };
  }
};

// Create a type for PostHog React Native client
interface PostHogMobile {
  initAsync: (config: PostHogMobileConfig) => Promise<PostHogMobile>;
  capture: (event: string, properties?: Record<string, unknown>) => void;
  identify: (userId: string, properties?: Record<string, unknown>) => void;
  screen: (name: string, properties?: Record<string, unknown>) => void;
  reset: () => void;
  flush: () => void;
  // Add other methods as needed
}

// Config for PostHog React Native
interface PostHogMobileConfig {
  apiKey: string;
  host?: string;
  captureApplicationLifecycleEvents?: boolean;
  captureDeepLinks?: boolean;
  recordScreenViews?: boolean;
  flushInterval?: number;
  flushAt?: number;
  disableTracking?: boolean;
  storage?: unknown;
  sendFeatureFlagEvent?: boolean;
  context?: Record<string, unknown>;
}

interface PostHogMobileProviderProps {
  apiKey: string;
  hostUrl?: string;
  children: React.ReactNode;
  isEnabled?: boolean;
  disableTracking?: boolean;
}

interface PostHogMobileContextType {
  posthog: PostHogMobile | null;
  isLoaded: boolean;
  isEnabled: boolean;
}

// Create a context for PostHog to be used in React Native components
const PostHogMobileContext = createContext<PostHogMobileContextType>({
  posthog: null,
  isLoaded: false,
  isEnabled: false,
});

/**
 * Custom hook to use PostHog analytics in React Native components
 * @returns PostHog instance and loading state
 */
export const usePostHogMobile = () => {
  return useContext(PostHogMobileContext);
};

/**
 * PostHog provider component for React Native/Expo mobile applications
 */
export const PostHogMobileProvider: React.FC<PostHogMobileProviderProps> = ({
  apiKey,
  hostUrl = "https://app.posthog.com",
  children,
  isEnabled = true,
  disableTracking = false,
}) => {
  const [state, setState] = useState<PostHogMobileContextType>({
    posthog: null,
    isLoaded: false,
    isEnabled,
  });

  useEffect(() => {
    // Skip initialization in server environments or if analytics is disabled
    const isServer = typeof window === "undefined";
    if (isServer || !isEnabled) {
      setState({
        posthog: null,
        isLoaded: true,
        isEnabled: false,
      });
      return;
    }

    let client: PostHogMobile | null = null;

    const setupPosthog = async () => {
      // Define Platform type here
      let Platform: { OS: string; Version: string | number };
      try {
        // Use dynamic import instead of require
        const reactNative = await import("react-native");
        Platform = {
          OS: reactNative.Platform.OS,
          Version: reactNative.Platform.Version.toString(), // Convert number to string
        };
      } catch (error) {
        void error;
        // Fallback for non-React Native environments (like Node.js)
        Platform = {
          OS: "web",
          Version: "unknown",
        };
      }

      try {
        // Initialize PostHog with AsyncStorage for persistence
        client = await (PostHogClient as unknown as PostHogMobile).initAsync({
          apiKey,
          host: hostUrl,
          // Use platform-specific options
          captureApplicationLifecycleEvents: true,
          captureDeepLinks: true,
          recordScreenViews: false, // We'll handle this manually
          flushInterval: 30, // Seconds between flushes
          flushAt: 20, // Number of events to queue before flushing
          disableTracking: disableTracking,
          storage: AsyncStorage,
          sendFeatureFlagEvent: true,
          context: {
            // Add platform-specific data
            app: {
              version: Platform.Version,
              build: "0",
              namespace: "com.footy.mastermind",
            },
            os: {
              name: Platform.OS,
              version: String(Platform.Version),
            },
            device: {
              manufacturer: "Unknown",
              model: "Unknown",
              type: Platform.OS === "ios" ? "Mobile" : "Mobile Android",
            },
            timezone: new Date().getTimezoneOffset() / -60,
          },
        });

        // Update state with the client
        setState({
          posthog: client,
          isLoaded: true,
          isEnabled: true,
        });

        // Capture initialization event
        client?.capture("app_started", {
          timestamp: new Date().toISOString(),
          platform: Platform.OS,
        });
      } catch (error) {
        console.error("Error initializing PostHog:", error);
        setState({
          posthog: null,
          isLoaded: true,
          isEnabled: false,
        });
      }
    };

    setupPosthog();

    // Cleanup on unmount
    return () => {
      if (client) {
        // Flush events before unmounting
        client.capture("app_closed", {
          timestamp: new Date().toISOString(),
        });
        client.flush();
      }
    };
  }, [apiKey, hostUrl, isEnabled, disableTracking]);

  return (
    <PostHogMobileContext.Provider value={state}>
      {children}
    </PostHogMobileContext.Provider>
  );
};

/**
 * Component to identify users with Clerk authentication in mobile apps
 */
export const PostHogMobileIdentify: React.FC<{
  userId?: string;
  userProperties?: Record<string, unknown>;
}> = ({ userId, userProperties = {} }) => {
  const { posthog, isLoaded, isEnabled } = usePostHogMobile();

  useEffect(() => {
    // Skip if not loaded, disabled, or no userId
    if (!isLoaded || !isEnabled || !posthog || !userId) {
      return;
    }

    // Identify user
    posthog.identify(userId, {
      ...userProperties,
      timestamp: new Date().toISOString(),
    });
  }, [posthog, isLoaded, isEnabled, userId, userProperties]);

  return null;
};

/**
 * Component to track screen views in mobile apps
 */
export const PostHogMobileScreenTracking: React.FC<{
  screenName: string;
  screenProperties?: Record<string, unknown>;
}> = ({ screenName, screenProperties = {} }) => {
  const { posthog, isLoaded, isEnabled } = usePostHogMobile();

  useEffect(() => {
    // Skip if not loaded or disabled
    if (!isLoaded || !isEnabled || !posthog) {
      return;
    }

    // Track screen view
    posthog.screen(screenName, {
      ...screenProperties,
      timestamp: new Date().toISOString(),
    });
  }, [posthog, isLoaded, isEnabled, screenName, screenProperties]);

  return null;
};
