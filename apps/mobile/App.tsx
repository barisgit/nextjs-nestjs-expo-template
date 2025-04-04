import { StatusBar } from "expo-status-bar";
import React, { useEffect, ReactNode, ErrorInfo } from "react";
import { StyleSheet, Text, View, ScrollView, Platform } from "react-native";
import { UserProfile } from "./components/UserProfile.js";
import { SafeAreaWrapper } from "./components/SafeAreaWrapper.js";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error("App Error:", error);
    console.error("Error Info:", errorInfo);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Something went wrong</Text>
          <Text style={styles.errorMessage}>
            {this.state.error?.toString()}
          </Text>
        </View>
      );
    }

    return this.props.children;
  }
}

export default function App() {
  const handleRefresh = () => {
    console.log("Profile refreshed");
  };

  useEffect(() => {
    console.log("[App] Mounted - React version:", React.version);
    console.log("[App] Platform:", Platform.OS, Platform.Version);
  }, []);

  return (
    <ErrorBoundary>
      <SafeAreaWrapper style={styles.safeArea} key="main-safe-area">
        <ScrollView contentContainerStyle={styles.scrollView}>
          <StatusBar style="auto" />
          <View style={styles.container}>
            <Text style={styles.title}>Mobile App</Text>
            <Text style={styles.subtitle}>Welcome to the demo app</Text>

            <View style={styles.profileContainer}>
              <Text style={styles.sectionTitle}>User Profile:</Text>
              <UserProfile userId={1} onRefresh={handleRefresh} />
            </View>
          </View>
        </ScrollView>
      </SafeAreaWrapper>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollView: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 30,
    color: "#666",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    alignSelf: "flex-start",
  },
  profileContainer: {
    width: "100%",
    marginBottom: 20,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "red",
    marginBottom: 10,
  },
  errorMessage: {
    fontSize: 16,
    color: "#333",
    textAlign: "center",
  },
});
