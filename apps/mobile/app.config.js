import "dotenv/config"; // Load .env file at the very beginning

// Define ALL your static config here, replicating the structure of your app.json
// Make sure to include everything you need!
const staticConfig = {
  name: "App Name",
  slug: "nextjs-nestjs-expo-template",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/logo.png",
  userInterfaceStyle: "light",
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
  ignoreVersionWarnings: true,
  newArchEnabled: true,
  experiments: {
    reactCanary: false,
    tsconfigPaths: true,
  },
  scheme: "appslug",
  web: {
    bundler: "metro",
  },
  owner: "baris5",
  // Note: 'extra' is handled dynamically below, don't put it here.
};

// Export a function that returns the final config object
export default () => {
  // Dynamically load environment variables for the 'extra' section
  const extraConfig = {
    EXPO_PUBLIC_TRPC_URL: process.env.EXPO_PUBLIC_TRPC_URL,
    // Add other env vars loaded from .env here if needed
    EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY:
      process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY,
    eas: {
      // Load EAS Project ID - you can keep it static or load from env too
      projectId:
        process.env.EAS_PROJECT_ID || "e990666e-c30f-4c41-8abd-c5a562c79cdc", // Example uses static fallback
    },
  };

  // Combine the static config with the dynamic 'extra' section,
  // all wrapped under the top-level 'expo' key as required.
  return {
    expo: {
      ...staticConfig, // Spread all the static properties
      extra: extraConfig, // Add the dynamically generated extra section
    },
  };
};
