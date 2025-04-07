import React, { createContext, useContext, useEffect, useState } from "react";
import posthog from "posthog-js";
import type { PostHog, PostHogConfig } from "posthog-js";

interface PostHogProviderProps {
  apiKey: string;
  hostUrl?: string;
  children: React.ReactNode;
  options?: PostHogConfig;
  isEnabled?: boolean;
}

interface PostHogContextType {
  posthog: PostHog | null;
  isLoaded: boolean;
  isEnabled: boolean;
}

// Create a context for PostHog to be used in React components
const PostHogContext = createContext<PostHogContextType>({
  posthog: null,
  isLoaded: false,
  isEnabled: false,
});

/**
 * Custom hook to use PostHog analytics in React components
 * @returns PostHog instance and loading state
 */
export const usePostHog = () => {
  return useContext(PostHogContext);
};

/**
 * PostHog provider component for Next.js and other React web applications
 */
export const PostHogProvider: React.FC<PostHogProviderProps> = ({
  apiKey,
  hostUrl = "https://app.posthog.com",
  children,
  options = {},
  isEnabled = true,
}) => {
  const [state, setState] = useState<PostHogContextType>({
    posthog: null,
    isLoaded: false,
    isEnabled,
  });

  useEffect(() => {
    // Skip initialization if analytics is disabled
    if (!isEnabled) {
      setState({
        posthog: null,
        isLoaded: true,
        isEnabled: false,
      });
      return;
    }

    // Initialize PostHog
    try {
      // Check if already loaded
      if (!(posthog as unknown as { __loaded: boolean }).__loaded) {
        posthog.init(apiKey, {
          api_host: hostUrl,
          capture_pageview: false, // We'll handle this manually
          disable_session_recording: true, // Disable by default
          loaded: (ph) => {
            console.log("PostHog loaded successfully");
            setState({
              posthog: ph,
              isLoaded: true,
              isEnabled: true,
            });
          },
          ...options,
        });
      } else {
        // Already loaded, update state
        setState({
          posthog,
          isLoaded: true,
          isEnabled: true,
        });
      }
    } catch (error) {
      console.error("Error initializing PostHog:", error);
      setState({
        posthog: null,
        isLoaded: true,
        isEnabled: false,
      });
    }

    // Clean up on unmount
    return () => {
      // Check if loaded
      if ((posthog as unknown as { __loaded: boolean }).__loaded && isEnabled) {
        // Flush events before unmounting
        posthog.capture("$pageview_unmount", {
          $current_url: window.location.href,
          timestamp: new Date().toISOString(),
        });

        try {
          // Shutdown might not be available in all versions
          if (typeof posthog.shutdown === "function") {
            posthog.shutdown();
          }
        } catch (e) {
          console.warn("PostHog shutdown not available", e);
        }
      }
    };
  }, [apiKey, hostUrl, isEnabled, options]);

  return (
    <PostHogContext.Provider value={state}>{children}</PostHogContext.Provider>
  );
};

/**
 * Component to track page views automatically
 */
export const PostHogPageView: React.FC = () => {
  const { posthog, isLoaded, isEnabled } = usePostHog();

  useEffect(() => {
    // Skip if not loaded or disabled
    if (!isLoaded || !isEnabled || !posthog) {
      return;
    }

    // Capture page view
    posthog.capture("$pageview", {
      $current_url: window.location.href,
      $referrer: document.referrer,
      timestamp: new Date().toISOString(),
    });
  }, [posthog, isLoaded, isEnabled]);

  return null;
};

/**
 * Component to identify users with Clerk authentication
 */
export const PostHogIdentify: React.FC<{
  userId?: string;
  userProperties?: Record<string, unknown>;
}> = ({ userId, userProperties = {} }) => {
  const { posthog, isLoaded, isEnabled } = usePostHog();

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
