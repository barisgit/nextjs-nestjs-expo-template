import { registerRootComponent } from "expo";
import App from "./App.js";

// Log the startup for debugging
console.log("Initializing app with React version:", require("react").version);

// Add type declaration for ErrorUtils
declare global {
  interface ErrorUtils {
    reportFatalError: (error: unknown) => void;
  }
}

// Add a global error handler for React 19 specific issues
if (!(globalThis as any).ErrorUtils) {
  (globalThis as any).ErrorUtils = {
    reportFatalError: (error: unknown) => {
      console.error("FATAL ERROR:", error);
    },
  };
}

registerRootComponent(App);
