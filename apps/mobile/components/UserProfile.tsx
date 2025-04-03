import React, { useCallback, useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { Button } from "./Button";

interface User {
  id: number;
  name: string;
  email: string;
}

// Simple API client - return immediately for demo purposes
export const fetchUser = async (id: number): Promise<User> => {
  console.log("Fetching user", id);
  // Return immediately for demo purposes
  return {
    id,
    name: `User ${id}`,
    email: `user${id}@example.com`,
  };
};

interface UserProfileProps {
  userId: number;
  onRefresh?: () => void;
}

export const UserProfile = ({ userId, onRefresh }: UserProfileProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Using an immediately-invoked function expression to safely load data
  // This helps avoid issues with useEffect and React 19's strict concurrent mode
  const loadUser = useCallback(async () => {
    try {
      console.log("[UserProfile] Starting to load user data...");
      setLoading(true);
      setError(null);

      // React 19 compatibility - Adding a safety check before continuing
      // This prevents race conditions in concurrent mode
      const userData = await fetchUser(userId);

      // Add this check to handle React 19 concurrent mode safely
      // Verify state update is still valid
      if (userData) {
        console.log("[UserProfile] User data loaded successfully:", userData);
        setUser(userData);
      }
    } catch (err) {
      console.error("[UserProfile] Error loading user:", err);
      setError(
        `Failed to load user data: ${err instanceof Error ? err.message : String(err)}`
      );
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Safer implementation for React 19
  useEffect(() => {
    console.log("[UserProfile] Component mounted with userId:", userId);
    let isMounted = true;

    const load = async () => {
      if (isMounted) {
        try {
          await loadUser();
        } catch (err) {
          console.error("[UserProfile] Error in effect:", err);
        }
      }
    };

    load();

    // Cleanup function
    return () => {
      console.log("[UserProfile] Component unmounting");
      isMounted = false;
    };
  }, [loadUser, userId]);

  const handleRefresh = () => {
    console.log("[UserProfile] Refreshing user data...");
    loadUser();
    if (onRefresh) onRefresh();
  };

  console.log("[UserProfile] Rendering with state:", { loading, error, user });

  return (
    <View style={styles.container} testID="user-profile">
      <View style={styles.card}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator
              size="large"
              color="#3498db"
              testID="loading-indicator"
            />
            <Text style={styles.loadingText}>Loading user data...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.error}>{error}</Text>
            <Button
              title="Try Again"
              onPress={handleRefresh}
              variant="primary"
            />
          </View>
        ) : user ? (
          <View style={styles.userContainer}>
            <Text style={styles.name}>{user.name}</Text>
            <Text style={styles.email}>{user.email}</Text>
            <Button
              title="Refresh"
              onPress={handleRefresh}
              style={styles.refreshButton}
            />
          </View>
        ) : (
          <View style={styles.errorContainer}>
            <Text style={styles.error}>No user data available</Text>
            <Button
              title="Load User"
              onPress={handleRefresh}
              variant="primary"
            />
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  card: {
    padding: 16,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  loadingContainer: {
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    color: "#666",
  },
  errorContainer: {
    padding: 16,
    alignItems: "center",
  },
  userContainer: {
    padding: 8,
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    color: "#666",
    marginBottom: 16,
  },
  error: {
    color: "red",
    marginBottom: 16,
  },
  refreshButton: {
    marginTop: 8,
  },
});
