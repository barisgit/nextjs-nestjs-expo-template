import { Injectable, Logger } from "@nestjs/common";
import { clerkClient } from "@clerk/express";
import { PostHogService } from "@repo/analytics";

// Define a type for Clerk API errors
interface ClerkAPIError {
  status?: number;
  message?: string;
  errors?: Array<{ message: string; longMessage?: string; code?: string }>;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(private readonly analyticsService?: PostHogService) {}

  async validateSession(sessionToken: string): Promise<boolean> {
    try {
      // Try to get JWT claims to extract the session ID
      const sessionId = this.extractSessionIdFromJwt(sessionToken);

      if (!sessionId) {
        this.logger.warn("Could not extract session ID from token");
        return false;
      }

      try {
        // Use the extracted session ID to validate
        const session = await clerkClient.sessions.getSession(sessionId);

        // Check if session exists and is active
        const isValid = session && session.status === "active";

        this.logger.log(
          `Session validation result: ${isValid ? "valid" : "invalid"}, status: ${session?.status || "null"}`
        );

        // If analytics service is available and session is valid, track the event
        if (isValid && this.analyticsService && session.userId) {
          try {
            await this.analyticsService.capture(
              session.userId,
              "session_validated",
              {
                source: "auth_service",
                valid: true,
                timestamp: new Date().toISOString(),
              }
            );
          } catch (err) {
            // Don't let analytics errors affect the main functionality
            this.logger.error(
              `Failed to track session validation: ${err instanceof Error ? err.message : String(err)}`
            );
          }
        }

        return isValid;
      } catch (error: unknown) {
        // Handle specific Clerk API errors
        const clerkError = error as ClerkAPIError;
        this.logger.warn(
          `Clerk API error validating session ${sessionId.substring(0, 8)}...: ${
            clerkError?.status || ""
          } ${clerkError?.message || "Unknown error"}`
        );

        // Log detailed error information for debugging
        if (clerkError?.errors?.length) {
          this.logger.debug(
            `Clerk errors: ${JSON.stringify(clerkError.errors)}`
          );
        }

        return false;
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(
        `Error validating session: ${errorMessage}`,
        errorStack
      );
      return false;
    }
  }

  async getUserById(userId: string) {
    try {
      const user = await clerkClient.users.getUser(userId);

      // Track the user lookup event if analytics service is available
      if (this.analyticsService && user) {
        try {
          await this.analyticsService.capture(userId, "user_lookup", {
            source: "auth_service",
            success: true,
            timestamp: new Date().toISOString(),
          });
        } catch (err) {
          // Don't let analytics errors affect the main functionality
          this.logger.error(
            `Failed to track user lookup: ${err instanceof Error ? err.message : String(err)}`
          );
        }
      }

      return user;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Error getting user: ${errorMessage}`, errorStack);
      return null;
    }
  }

  async getUserFromToken(sessionToken: string) {
    try {
      // Try to get JWT claims to extract the session ID
      const sessionId = this.extractSessionIdFromJwt(sessionToken);

      if (!sessionId) {
        this.logger.warn("Could not extract session ID from token");
        return null;
      }

      try {
        const session = await clerkClient.sessions.getSession(sessionId);
        if (session && session.userId) {
          const user = await this.getUserById(session.userId);

          // Track the token lookup event if analytics service is available
          if (this.analyticsService && user) {
            try {
              await this.analyticsService.capture(
                session.userId,
                "user_from_token_lookup",
                {
                  source: "auth_service",
                  success: true,
                  timestamp: new Date().toISOString(),
                }
              );
            } catch (err) {
              // Don't let analytics errors affect the main functionality
              this.logger.error(
                `Failed to track token lookup: ${err instanceof Error ? err.message : String(err)}`
              );
            }
          }

          return user;
        }

        this.logger.warn(`No user ID found in session`);
        return null;
      } catch (error: unknown) {
        const clerkError = error as ClerkAPIError;
        this.logger.warn(
          `Clerk API error getting session: ${clerkError?.status || ""} ${clerkError?.message || "Unknown error"}`
        );
        return null;
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(
        `Error getting user from token: ${errorMessage}`,
        errorStack
      );
      return null;
    }
  }

  /**
   * Helper method to extract session ID from JWT token
   */
  private extractSessionIdFromJwt(token: string): string | null {
    try {
      // JWT tokens have three parts separated by dots
      const parts = token.split(".");
      if (parts.length !== 3) {
        this.logger.warn(
          `Invalid JWT format, expecting 3 parts but got ${parts.length}`
        );
        return null;
      }

      // Decode the payload (middle part)
      if (!parts[1]) {
        this.logger.warn("JWT payload part is missing");
        return null;
      }

      const payload = JSON.parse(
        Buffer.from(parts[1], "base64").toString()
      ) as {
        sid?: string;
        [key: string]: unknown;
      };

      // Extract the session ID from the 'sid' claim
      const sid = payload.sid || null;

      if (!sid) {
        this.logger.warn(`No 'sid' claim found in JWT payload`);
      }

      return sid;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(
        `Error extracting session ID from JWT: ${errorMessage}`,
        errorStack
      );
      return null;
    }
  }
}
