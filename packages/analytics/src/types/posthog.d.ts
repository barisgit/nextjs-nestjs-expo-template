declare module "posthog-js" {
  export interface PostHogConfig {
    api_host?: string;
    capture_pageview?: boolean;
    disable_session_recording?: boolean;
    loaded?: (posthog: PostHog) => void;
    [key: string]: unknown;
  }

  export interface PostHog {
    init: (apiKey: string, options?: PostHogConfig) => void;
    capture: (event: string, properties?: Record<string, unknown>) => void;
    identify: (userId: string, properties?: Record<string, unknown>) => void;
    reset: () => void;
    shutdown: () => void;
    group: (
      groupType: string,
      groupKey: string,
      groupProperties?: Record<string, unknown>
    ) => void;
    alias: (alias: string, originalId?: string) => void;
    opt_in_capturing: () => void;
    opt_out_capturing: () => void;
    has_opted_out_capturing: () => boolean;
    has_opted_in_capturing: () => boolean;
    register: (properties: Record<string, unknown>) => void;
    unregister: (key: string) => void;
    register_once: (
      properties: Record<string, unknown>,
      defaultValue?: unknown
    ) => void;
    people: {
      set: (properties: Record<string, unknown>) => void;
      set_once: (properties: Record<string, unknown>) => void;
      increment: (property: string, increment?: number) => void;
      append: (property: string, value: unknown) => void;
      remove: (property: string, value: unknown) => void;
      union: (property: string, values: unknown[]) => void;
      delete_user: () => void;
    };
    feature_flags: {
      getFlags: () => Record<string, string | boolean>;
      isFeatureEnabled: (key: string) => boolean;
      getAllFlags: () => Record<string, string | boolean>;
      reloadFeatureFlags: () => Promise<void>;
    };
    getDistinctId: () => string;
    toString: () => string;
    __loaded?: boolean;
  }

  const posthog: PostHog & {
    default: PostHog;
  };

  export default posthog;
}
