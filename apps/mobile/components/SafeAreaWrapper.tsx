import React, { ReactNode } from "react";
import { View, StyleSheet, Platform } from "react-native";
import {
  SafeAreaView,
  SafeAreaProvider,
  initialWindowMetrics,
} from "react-native-safe-area-context";

interface SafeAreaWrapperProps {
  children: ReactNode;
  style?: any;
}

/**
 * A safe wrapper around SafeAreaView that handles potential issues with React 19
 */
export const SafeAreaWrapper = ({ children, style }: SafeAreaWrapperProps) => {
  // For web or when having issues with SafeAreaView, fallback to regular View
  if (Platform.OS === "web") {
    return <View style={[styles.container, style]}>{children}</View>;
  }

  try {
    return (
      <SafeAreaProvider initialMetrics={initialWindowMetrics}>
        <SafeAreaView style={[styles.container, style]}>
          {children}
        </SafeAreaView>
      </SafeAreaProvider>
    );
  } catch (error) {
    console.error("[SafeAreaWrapper] Error rendering SafeAreaView:", error);
    // Fallback to a regular View in case of errors
    return (
      <View style={[styles.container, style, styles.fallbackPadding]}>
        {children}
      </View>
    );
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  fallbackPadding: {
    // Provide some default padding in case SafeAreaView fails
    paddingTop: Platform.OS === "ios" ? 50 : 20,
    paddingBottom: 20,
  },
});
