import React from "react";
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
  console.log("Button render:", { title, variant });

  const buttonStyle = [
    styles.button,
    variant === "primary" && styles.primaryButton,
    variant === "destructive" && styles.destructiveButton,
    style,
  ];

  return (
    <TouchableOpacity
      style={buttonStyle}
      {...props}
      testID={`button-${title.replace(/\s+/g, "-").toLowerCase()}`}
    >
      <Text style={[styles.text, variant === "default" && styles.defaultText]}>
        {title}
      </Text>
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
