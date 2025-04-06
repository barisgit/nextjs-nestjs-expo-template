import { createEnv } from "@t3-oss/env-core";
import Constants from "expo-constants";
import { z } from "zod";

export const env = createEnv({
  /**
   * Specify your server-side environment variables schema here.
   * This way you can ensure the app isn't built with invalid env vars.
   */
  server: {
    // Example: Define a server variable (not typically used in Expo)
    // API_KEY: z.string(),
  },

  /**
   * Specify your client-side environment variables schema here.
   * This way you can ensure the app isn't built with invalid env vars.
   * To expose them to the client, prefix them with `EXPO_PUBLIC_`.
   */
  client: {
    EXPO_PUBLIC_TRPC_URL: z.string().url(),
    // Add other client variables here
    // EXPO_PUBLIC_API_KEY: z.string(),
  },

  /**
   * Destructure all variables from `process.env` to make sure they aren't tree-shaken away.
   */
  runtimeEnv: {
    // Server variables are not typically used directly in Expo

    // Client variables are read from expoConfig.extra
    EXPO_PUBLIC_TRPC_URL: Constants.expoConfig?.extra?.EXPO_PUBLIC_TRPC_URL,
    // EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY: Constants.expoConfig?.extra?.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY,
  },

  /**
   * Run `build` or `dev` with `SKIP_ENV_VALIDATION=1` to skip env validation.
   * This is especially useful for Docker builds.
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,

  /**
   * Specify the prefix for client-side variables.
   */
  clientPrefix: "EXPO_PUBLIC_",

  /**
   * By default, this library will feed the environment variables directly to
   * the Zod validator.
   *
   * By defining this pass-through map, we can leave our runtime environment
   * untouched while still having the safety of Zod validation.
   */
  // experimental__runtimeEnvTransform: (runtimeEnv) => {
  //   const result: Record<string, string | undefined> = {};
  //   for (const key in runtimeEnv) {
  //     if (key.startsWith('EXPO_PUBLIC_')) {
  //       result[key] = runtimeEnv[key];
  //     }
  //   }
  //   return result;
  // },
});
