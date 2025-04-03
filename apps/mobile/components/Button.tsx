import React, { useMemo } from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  TouchableOpacityProps,
} from "react-native";

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: "default" | "primary" | "destructive";
}

export const Button = ({
  title,
  variant = "default",
  style,
  ...props
}: ButtonProps) => {
  console.log("[Button] Rendering button:", { title, variant });

  // Use useMemo for style objects to prevent unnecessary re-renders
  const buttonStyle = useMemo(
    () => [
      styles.button,
      variant === "primary" && styles.primaryButton,
      variant === "destructive" && styles.destructiveButton,
      style,
    ],
    [variant, style]
  );

  const textStyle = useMemo(
    () => [styles.text, variant === "default" && styles.defaultText],
    [variant]
  );

  // Use onPress handler wrapper to catch any errors
  const handlePress = (event: any) => {
    try {
      console.log("[Button] Button pressed:", title);
      if (props.onPress) {
        props.onPress(event);
      }
    } catch (error) {
      console.error("[Button] Error in button press handler:", error);
    }
  };

  return (
    <TouchableOpacity
      style={buttonStyle}
      {...props}
      onPress={handlePress}
      testID={`button-${title.replace(/\s+/g, "-").toLowerCase()}`}
    >
      <Text style={textStyle}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 6,
    backgroundColor: "#e0e0e0",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 8,
  },
  primaryButton: {
    backgroundColor: "#3498db",
  },
  destructiveButton: {
    backgroundColor: "#e74c3c",
  },
  text: {
    color: "#ffffff",
    fontWeight: "bold",
  },
  defaultText: {
    color: "#333333",
  },
});
