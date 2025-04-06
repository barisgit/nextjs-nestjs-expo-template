import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { trpc } from "../utils/trpc";

export function HelloExample() {
  const [name, setName] = useState("World");
  const [incrementCount, setIncrementCount] = useState(0);

  // Use tRPC queries
  const helloQuery = trpc.hello.useQuery({ name });
  const incrementQuery = trpc.increment.useQuery(incrementCount);
  const userQuery = trpc.me.useQuery();

  return (
    <View style={styles.container}>
      {/* Input to update name parameter */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Your Name:</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Enter your name"
        />
      </View>

      {/* Display hello query results */}
      <View style={styles.resultContainer}>
        <Text style={styles.sectionTitle}>Query Result:</Text>
        {helloQuery.isLoading ? (
          <Text>Loading...</Text>
        ) : helloQuery.error ? (
          <Text style={styles.errorText}>
            Error: {helloQuery.error.message}
          </Text>
        ) : (
          <Text>{helloQuery.data?.greeting}</Text>
        )}
      </View>

      {/* Display increment query results */}
      <View style={styles.resultContainer}>
        <Text style={styles.sectionTitle}>Increment:</Text>
        {incrementQuery.isLoading ? (
          <Text>Loading...</Text>
        ) : incrementQuery.error ? (
          <Text style={styles.errorText}>
            Error: {incrementQuery.error.message}
          </Text>
        ) : (
          <View>
            <Text>Current Value: {incrementQuery.data}</Text>
            <TouchableOpacity
              style={styles.button}
              onPress={() => {
                setIncrementCount(incrementCount + 1);
                incrementQuery.refetch();
              }}
            >
              <Text style={styles.buttonText}>Increment</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Display user query results */}
      <View style={styles.resultContainer}>
        <Text style={styles.sectionTitle}>User:</Text>
        {userQuery.isLoading ? (
          <Text>Loading user...</Text>
        ) : userQuery.error ? (
          <Text style={styles.errorText}>
            Not signed in or error: {userQuery.error.message}
          </Text>
        ) : userQuery.data?.user ? (
          <View>
            <Text style={styles.boldText}>Current User</Text>
            <Text style={styles.smallText}>Signed in successfully</Text>
          </View>
        ) : (
          <Text>Please sign in to see your information</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 4,
    padding: 8,
    width: "100%",
  },
  resultContainer: {
    padding: 12,
    backgroundColor: "#f5f5f5",
    borderRadius: 4,
    marginBottom: 12,
  },
  sectionTitle: {
    fontWeight: "500",
    marginBottom: 8,
  },
  errorText: {
    color: "red",
  },
  button: {
    backgroundColor: "#0066cc",
    padding: 8,
    borderRadius: 4,
    alignItems: "center",
    marginTop: 8,
  },
  buttonText: {
    color: "white",
    fontWeight: "500",
  },
  boldText: {
    fontWeight: "bold",
  },
  smallText: {
    fontSize: 12,
    color: "#666",
  },
});
