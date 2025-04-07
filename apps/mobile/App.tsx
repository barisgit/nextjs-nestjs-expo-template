import "./tamagui-web.css";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, ReactNode, ErrorInfo, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Platform,
  useColorScheme,
} from "react-native";
import { SafeAreaWrapper } from "./components/SafeAreaWrapper";
import { TRPCProvider } from "./providers/TRPCProvider";
import { HelloExample } from "./components/HelloExample";
import { CustomClerkProvider } from "./providers/ClerkProvider";
import { PostHogProvider } from "./providers/PostHogProvider";
import { ClerkAuth } from "./components/ClerkAuth";
import { TamaguiProvider } from "tamagui";
import config from "./tamagui.config";
import { TamaguiDemo } from "./components/TamaguiDemo";
import { useFonts } from "expo-font";

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
  const colorScheme = useColorScheme();

  const [appReady, setAppReady] = useState(false);

  const [fontsLoaded, fontError] = useFonts({
    Inter: require("@tamagui/font-inter/otf/Inter-Medium.otf"),
    InterBold: require("@tamagui/font-inter/otf/Inter-Bold.otf"),
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      setAppReady(true);
    }

    console.log("[App] Mounted - React version:", React.version);
    console.log("[App] Platform:", Platform.OS, Platform.Version);
    console.log("[App] Fonts loaded:", fontsLoaded);
    if (fontError) {
      console.warn("[App] Font loading error:", fontError);
    }
  }, [fontsLoaded, fontError]);

  return (
    <ErrorBoundary>
      <TamaguiProvider config={config} defaultTheme={colorScheme || "light"}>
        <CustomClerkProvider>
          <PostHogProvider>
            <TRPCProvider>
              <SafeAreaWrapper style={styles.safeArea} key="main-safe-area">
                <StatusBar style="auto" />
                {!appReady ? (
                  <View style={styles.container}>
                    <Text style={styles.loadingText}>Loading app...</Text>
                  </View>
                ) : (
                  <ScrollView contentContainerStyle={styles.scrollView}>
                    <View style={styles.container}>
                      <Text style={styles.title}>Mobile App</Text>
                      <Text style={styles.subtitle}>
                        Welcome to the demo app
                      </Text>

                      <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Authentication:</Text>
                        <ClerkAuth />
                      </View>

                      <View style={styles.section}>
                        <Text style={styles.sectionTitle}>tRPC Demo:</Text>
                        <HelloExample />
                      </View>

                      <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Tamagui Demo:</Text>
                        <TamaguiDemo />
                      </View>
                    </View>
                  </ScrollView>
                )}
              </SafeAreaWrapper>
            </TRPCProvider>
          </PostHogProvider>
        </CustomClerkProvider>
      </TamaguiProvider>
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
  section: {
    width: "100%",
    marginBottom: 20,
    marginTop: 20,
  },
  loadingText: {
    fontSize: 18,
    color: "#666",
    marginBottom: 10,
  },
});
