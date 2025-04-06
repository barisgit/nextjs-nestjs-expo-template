import React, { ReactNode } from "react";
import { ClerkProvider } from "@clerk/clerk-expo";
import { env } from "../utils/env";
import * as SecureStore from "expo-secure-store";

// Token Cache to store authentication tokens securely
const tokenCache = {
  async getToken(key: string) {
    try {
      return SecureStore.getItemAsync(key);
    } catch (err) {
      console.error("Error getting token from secure store:", err);
      return null;
    }
  },
  async saveToken(key: string, value: string) {
    try {
      return SecureStore.setItemAsync(key, value);
    } catch (err) {
      console.error("Error saving token to secure store:", err);
    }
  },
};

interface CustomClerkProviderProps {
  children: ReactNode;
}

export function CustomClerkProvider({ children }: CustomClerkProviderProps) {
  // Get publishable key from env
  const publishableKey = env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

  if (!publishableKey) {
    throw new Error("Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY");
  }

  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      {children}
    </ClerkProvider>
  );
}
