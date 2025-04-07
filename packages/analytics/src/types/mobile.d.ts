declare module "@repo/analytics/mobile" {
  import { FC, ReactNode } from "react";

  export interface PostHogMobile {
    capture: (event: string, properties?: Record<string, unknown>) => void;
    identify: (userId: string, properties?: Record<string, unknown>) => void;
    screen: (name: string, properties?: Record<string, unknown>) => void;
    reset: () => void;
    flush: () => void;
  }

  export interface PostHogMobileProviderProps {
    apiKey: string;
    hostUrl?: string;
    children: ReactNode;
    isEnabled?: boolean;
    disableTracking?: boolean;
  }

  export const PostHogMobileProvider: FC<PostHogMobileProviderProps>;

  export const PostHogMobileIdentify: FC<{
    userId?: string;
    userProperties?: Record<string, unknown>;
  }>;

  export const PostHogMobileScreenTracking: FC<{
    screenName: string;
    screenProperties?: Record<string, unknown>;
  }>;

  export function usePostHogMobile(): {
    posthog: PostHogMobile | null;
    isLoaded: boolean;
    isEnabled: boolean;
  };
}
