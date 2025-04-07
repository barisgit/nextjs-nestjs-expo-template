declare module "@repo/analytics/web" {
  import { FC, ReactNode } from "react";

  export interface PostHogWeb {
    capture: (event: string, properties?: Record<string, unknown>) => void;
    identify: (userId: string, properties?: Record<string, unknown>) => void;
    reset: () => void;
    shutdown: () => void;
  }

  export interface PostHogProviderProps {
    apiKey: string;
    hostUrl?: string;
    children: ReactNode;
    options?: Record<string, unknown>;
    isEnabled?: boolean;
  }

  export const PostHogProvider: FC<PostHogProviderProps>;

  export const PostHogPageView: FC;

  export const PostHogIdentify: FC<{
    userId?: string;
    userProperties?: Record<string, unknown>;
  }>;

  export function usePostHog(): {
    posthog: PostHogWeb | null;
    isLoaded: boolean;
    isEnabled: boolean;
  };
}
