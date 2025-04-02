import React, { useEffect, useState } from "react";
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

  const loadUser = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("Loading user data...");
      const userData = await fetchUser(userId);
      console.log("User data loaded:", userData);
      setUser(userData);
    } catch (err) {
      console.error("Error loading user:", err);
      setError("Failed to load user data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log("UserProfile mounted, loading user...");
    loadUser();
  }, [userId]);

  const handleRefresh = () => {
    console.log("Refreshing user data...");
    loadUser();
    if (onRefresh) onRefresh();
  };

  console.log("UserProfile render state:", { loading, error, user });

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
