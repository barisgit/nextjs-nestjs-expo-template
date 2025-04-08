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
  TouchableOpacity,
} from "react-native";
import { SafeAreaWrapper } from "./components/SafeAreaWrapper";
import { TRPCProvider } from "./providers/TRPCProvider";
import { HelloExample } from "./components/HelloExample";
import { ChatDemo } from "./components/ChatDemo";
import { CustomClerkProvider } from "./providers/ClerkProvider";
import { PostHogProvider } from "./providers/PostHogProvider";
import { ReduxProvider } from "./providers/ReduxProvider";
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
  const [activeView, setActiveView] = useState<"main" | "chat">("main");

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

  const renderMainContent = () => (
    <ScrollView contentContainerStyle={styles.scrollView}>
      <View style={styles.container}>
        <Text style={styles.title}>Mobile App</Text>
        <Text style={styles.subtitle}>Welcome to the demo app</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Authentication:</Text>
          <ClerkAuth />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>tRPC Demo:</Text>
          <HelloExample />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Chat Demo:</Text>
          <View style={styles.chatPreview}>
            <Text>Open the chat interface to start messaging</Text>
            <Button
              onPress={() => setActiveView("chat")}
              style={styles.chatButton}
            >
              Open Chat
            </Button>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tamagui Demo:</Text>
          <TamaguiDemo />
        </View>
      </View>
    </ScrollView>
  );

  const renderChatContent = () => (
    <View style={styles.chatContainer}>
      <View style={styles.chatHeader}>
        <Button onPress={() => setActiveView("main")} style={styles.backButton}>
          Back to Main
        </Button>
        <Text style={styles.chatTitle}>Chat</Text>
      </View>
      <ChatDemo />
    </View>
  );

  return (
    <ErrorBoundary>
      <TamaguiProvider config={config} defaultTheme="light">
        <ReduxProvider>
          <CustomClerkProvider>
            <PostHogProvider>
              <TRPCProvider>
                <SafeAreaWrapper style={styles.safeArea} key="main-safe-area">
                  <StatusBar style="auto" />
                  {!appReady ? (
                    <View style={styles.container}>
                      <Text style={styles.loadingText}>Loading app...</Text>
                    </View>
                  ) : activeView === "main" ? (
                    renderMainContent()
                  ) : (
                    renderChatContent()
                  )}
                </SafeAreaWrapper>
              </TRPCProvider>
            </PostHogProvider>
          </CustomClerkProvider>
        </ReduxProvider>
      </TamaguiProvider>
    </ErrorBoundary>
  );
}

const Button = ({ onPress, children, style }: any) => (
  <TouchableOpacity
    onPress={onPress}
    style={[
      {
        backgroundColor: "#2196F3",
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 4,
        alignItems: "center",
        marginTop: 10,
      },
      style,
    ]}
  >
    <Text style={{ color: "white", fontWeight: "bold" }}>{children}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  scrollView: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
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
  chatContainer: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  chatHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  backButton: {
    marginRight: 10,
    backgroundColor: "#666",
  },
  chatTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  chatPreview: {
    width: "100%",
    padding: 15,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    alignItems: "center",
  },
  chatButton: {
    width: 200,
  },
});
