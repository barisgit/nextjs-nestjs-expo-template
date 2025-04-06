import { z } from "zod"; // Import Zod
import { ExpoConfig, ConfigContext } from "expo/config"; // Import ExpoConfig and ConfigContext types

// Define environment schema
export const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  EXPO_PUBLIC_TRPC_URL: z.string().url(),
  EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY: z
    .string()
    .min(1, "Clerk publishable key cannot be empty")
    .refine(
      (val) => !val.includes("clerk-publishable-key"),
      "Clerk publishable key cannot be a placeholder value"
    ),
  EXPO_PUBLIC_POSTHOG_KEY: z.string().min(1).optional(),
  EXPO_PUBLIC_POSTHOG_HOST: z.string().url().default("https://app.posthog.com"),
});

// Validate environment variables immediately
function validateEnv() {
  try {
    const parsedEnv = envSchema.parse({
      EXPO_PUBLIC_TRPC_URL: process.env.EXPO_PUBLIC_TRPC_URL,
      EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY:
        process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY,
      EXPO_PUBLIC_POSTHOG_KEY: process.env.EXPO_PUBLIC_POSTHOG_KEY,
      EXPO_PUBLIC_POSTHOG_HOST: process.env.EXPO_PUBLIC_POSTHOG_HOST,
    });
    console.log("\x1b[32m%s\x1b[0m", "✅ Environment validation passed");
    return parsedEnv;
  } catch (error: unknown) {
    console.error("\x1b[31m%s\x1b[0m", "❌ Environment validation failed:");
    if (error instanceof z.ZodError) {
      error.errors.forEach((err) => {
        console.error(`  - ${err.path.join(".")}: ${err.message}`);
      });
    } else if (error instanceof Error) {
      console.error("\x1b[31m%s\x1b[0m", error.message);
    } else {
      console.error(
        "\x1b[31m%s\x1b[0m",
        "An unknown error occurred during validation."
      );
    }
    process.exit(1);
  }
}

validateEnv();

// Define base config properties that are not part of 'extra'
const baseConfig: Omit<ExpoConfig, "extra"> = {
  name: "App Name",
  slug: "nextjs-nestjs-expo-template",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/logo.png",
  userInterfaceStyle: "automatic",
  splash: {
    image: "./assets/logo.png",
    resizeMode: "contain",
    backgroundColor: "#ffffff",
  },
  assetBundlePatterns: ["**/*"],
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.yourcompany.appslug",
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false,
    },
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/logo.png",
      backgroundColor: "#ffffff",
    },
    package: "com.yourcompany.appslug",
  },
  // Note: ignoreVersionWarnings is deprecated/not standard, handle updates manually
  // newArchEnabled might not be needed unless specifically targeting New Architecture
  experiments: {
    // reactCanary: false, // Usually default or managed by Expo version
    tsconfigPaths: true,
  },
  scheme: "appslug",
  web: {
    bundler: "metro",
  },
  owner: "baris5",
  newArchEnabled: true,
  // Add other valid ExpoConfig fields here if needed
};

// Export a function that returns the final config object, compatible with Expo CLI
export default ({ config }: ConfigContext): ExpoConfig => {
  const extraConfig = {
    EXPO_PUBLIC_TRPC_URL: process.env.EXPO_PUBLIC_TRPC_URL,
    EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY:
      process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY,
    EXPO_PUBLIC_POSTHOG_KEY: process.env.EXPO_PUBLIC_POSTHOG_KEY,
    EXPO_PUBLIC_POSTHOG_HOST:
      process.env.EXPO_PUBLIC_POSTHOG_HOST || "https://app.posthog.com",
    eas: {
      projectId:
        process.env.EAS_PROJECT_ID || "e990666e-c30f-4c41-8abd-c5a562c79cdc",
    },
  };

  return {
    ...config, // Spread the base config provided by Expo CLI (includes platform specifics)
    ...baseConfig, // Spread our defined base config
    extra: {
      ...config.extra, // Preserve any extra config from app.json/plugins
      ...extraConfig, // Add our dynamic extra config
    },
    // Add other properties like plugins, hooks, etc. here if needed
  };
};
