import Constants from "expo-constants";
import { z } from "zod";
import { envSchema } from "../app.config";

/**
 * This file is used to validate the environment variables at runtime.
 * It is used to ensure that the environment variables are valid before the app starts.
 * It is also used to provide type safety for the environment variables.
 *
 * NOTE: Validation schema is defined in app.config.ts
 */

// Infer the type from the schema
type Env = z.infer<typeof envSchema>;

// Get values from Expo's manifest extra
const getRuntimeEnv = (): Env => {
  const extra = Constants.expoConfig?.extra || {};

  // Create env object by inferring type from schema and mapping values
  const env = Object.keys(envSchema.shape).reduce((acc, key) => {
    if (key in extra) {
      acc[key as keyof Env] = extra[key];
    }
    return acc;
  }, {} as Env);

  // Validate runtime env against schema (optional but good practice)
  try {
    envSchema.parse(env);
  } catch (error) {
    console.warn("Runtime environment validation failed:", error);
    // Decide how to handle runtime validation failure - maybe throw?
  }

  return env;
};

// Export validated env object
export const env = getRuntimeEnv();
