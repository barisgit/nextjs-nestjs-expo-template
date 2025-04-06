import Constants from "expo-constants";
import { z } from "zod";

// Define schema with Zod
const envSchema = z.object({
  EXPO_PUBLIC_TRPC_URL: z.string().url(),
  EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY: z
    .string()
    .min(1, "Clerk publishable key cannot be empty")
    .refine(
      (val) => !val.includes("clerk-publishable-key"),
      "Clerk publishable key cannot be a placeholder value"
    ),
});

// Infer the type from the schema
type Env = z.infer<typeof envSchema>;

// Get values from Expo's manifest extra
const getRuntimeEnv = (): Env => {
  const extra = Constants.expoConfig?.extra || {};

  // Create env object
  const env = {
    EXPO_PUBLIC_TRPC_URL: extra.EXPO_PUBLIC_TRPC_URL as string,
    EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY:
      extra.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY as string,
  };

  // Validate with Zod
  return envSchema.parse(env);
};

// Export validated env object
export const env = getRuntimeEnv();
