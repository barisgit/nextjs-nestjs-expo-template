import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Button,
  Text,
  TextInput,
  TouchableOpacity,
  Platform,
} from "react-native";
import { useAuth, useSignIn, useSignUp } from "@clerk/clerk-expo";
import { useOAuth } from "@clerk/clerk-expo";
import { useQueryClient } from "@tanstack/react-query";

export function ClerkAuth() {
  const { isSignedIn, signOut, userId } = useAuth();
  const {
    signIn,
    setActive: setSignInActive,
    isLoaded: isSignInLoaded,
  } = useSignIn();
  const {
    signUp,
    setActive: setSignUpActive,
    isLoaded: isSignUpLoaded,
  } = useSignUp();

  const queryClient = useQueryClient();

  // OAuth hooks
  const { startOAuthFlow: googleAuth } = useOAuth({ strategy: "oauth_google" });
  const { startOAuthFlow: facebookAuth } = useOAuth({
    strategy: "oauth_facebook",
  });
  const { startOAuthFlow: appleAuth } = useOAuth({ strategy: "oauth_apple" });

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showSignUp, setShowSignUp] = useState(false);
  const [pendingVerification, setPendingVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [isOAuthLoading, setIsOAuthLoading] = useState(false);

  const handleOAuthSignIn = async (
    provider: "google" | "facebook" | "apple"
  ) => {
    try {
      setIsOAuthLoading(true);

      // Choose the appropriate OAuth provider
      const startOAuth =
        provider === "google"
          ? googleAuth
          : provider === "facebook"
            ? facebookAuth
            : appleAuth;

      // Start the OAuth flow
      const { createdSessionId, setActive } = await startOAuth();

      if (createdSessionId) {
        // Set the new session as active
        await setActive!({ session: createdSessionId });
        queryClient.invalidateQueries();
      }
    } catch (err) {
      console.error(`Error signing in with ${provider}:`, err);
    } finally {
      setIsOAuthLoading(false);
    }
  };

  const handleSignIn = async () => {
    try {
      if (!isSignInLoaded || !signIn) {
        console.error("signIn is not available");
        return;
      }

      const result = await signIn.create({
        identifier: email,
        password,
      });

      // Set the session as active
      if (result.status === "complete" && setSignInActive) {
        await setSignInActive({ session: result.createdSessionId });
        queryClient.invalidateQueries();
      } else {
        console.log("Sign in is not complete", result);
      }
    } catch (err: any) {
      console.error("Error signing in:", err.message);
    }
  };

  const handleSignUp = async () => {
    try {
      if (!isSignUpLoaded || !signUp) {
        console.error("signUp is not available");
        return;
      }

      await signUp.create({
        emailAddress: email,
        password,
      });

      // Send verification email
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });

      // Switch to verification view
      setPendingVerification(true);
    } catch (err: any) {
      console.error("Error signing up:", err.message);
    }
  };

  const handleVerification = async () => {
    try {
      if (!isSignUpLoaded || !signUp) {
        console.error("signUp is not available");
        return;
      }

      const result = await signUp.attemptEmailAddressVerification({
        code: verificationCode,
      });

      if (result.status === "complete" && setSignUpActive) {
        await setSignUpActive({ session: result.createdSessionId });
        setPendingVerification(false);
        queryClient.invalidateQueries();
      } else {
        console.log("Verification is not complete", result);
      }
    } catch (err: any) {
      console.error("Error verifying:", err.message);
    }
  };

  const handleSignOut = async () => {
    try {
      if (signOut) {
        await signOut();
        queryClient.invalidateQueries();
      } else {
        console.error("signOut is not available");
      }
    } catch (err: any) {
      console.error("Error signing out:", err.message);
    }
  };

  const OAuthButtons = () => (
    <View style={styles.oauthContainer}>
      <TouchableOpacity
        style={[styles.oauthButton, styles.googleButton]}
        onPress={() => handleOAuthSignIn("google")}
        disabled={isOAuthLoading}
      >
        <Text style={styles.oauthButtonText}>Continue with Google</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.oauthButton, styles.facebookButton]}
        onPress={() => handleOAuthSignIn("facebook")}
        disabled={isOAuthLoading}
      >
        <Text style={styles.oauthButtonText}>Continue with Facebook</Text>
      </TouchableOpacity>

      {Platform.OS === "ios" && (
        <TouchableOpacity
          style={[styles.oauthButton, styles.appleButton]}
          onPress={() => handleOAuthSignIn("apple")}
          disabled={isOAuthLoading}
        >
          <Text style={styles.oauthButtonText}>Continue with Apple</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  if (isSignedIn) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Signed in as: {userId}</Text>
        <Button title="Sign Out" onPress={handleSignOut} />
      </View>
    );
  }

  if (pendingVerification) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Verify your email</Text>
        <TextInput
          style={styles.input}
          value={verificationCode}
          placeholder="Enter verification code"
          onChangeText={setVerificationCode}
        />
        <View style={styles.buttonContainer}>
          <Button title="Verify Email" onPress={handleVerification} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{showSignUp ? "Sign Up" : "Sign In"}</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <View style={styles.buttonContainer}>
        {showSignUp ? (
          <Button title="Sign Up" onPress={handleSignUp} />
        ) : (
          <Button title="Sign In" onPress={handleSignIn} />
        )}
      </View>
      <TouchableOpacity onPress={() => setShowSignUp(!showSignUp)}>
        <Text style={styles.linkText}>
          {showSignUp
            ? "Already have an account? Sign In"
            : "Don't have an account? Sign Up"}
        </Text>
      </TouchableOpacity>

      <View style={styles.divider}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>OR</Text>
        <View style={styles.dividerLine} />
      </View>

      <OAuthButtons />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    marginVertical: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
  },
  text: {
    marginBottom: 16,
    fontSize: 16,
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 4,
    marginBottom: 12,
    paddingHorizontal: 8,
    backgroundColor: "#fff",
  },
  buttonContainer: {
    marginBottom: 12,
  },
  linkText: {
    color: "blue",
    textAlign: "center",
    marginBottom: 16,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#ccc",
  },
  dividerText: {
    marginHorizontal: 8,
    color: "#666",
  },
  oauthContainer: {
    gap: 12,
  },
  oauthButton: {
    paddingVertical: 12,
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  googleButton: {
    backgroundColor: "#4285F4",
  },
  facebookButton: {
    backgroundColor: "#3b5998",
  },
  appleButton: {
    backgroundColor: "#000",
  },
  oauthButtonText: {
    color: "#fff",
    fontWeight: "500",
  },
});
