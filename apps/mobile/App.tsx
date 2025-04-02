import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View, SafeAreaView, ScrollView } from "react-native";
import { UserProfile } from "./components/UserProfile";

export default function App() {
  const handleRefresh = () => {
    console.log("Profile refreshed");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
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
    </SafeAreaView>
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
});
