import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { clerkClient } from "@clerk/express";

// Define a type for Clerk API errors
interface ClerkAPIError {
  status?: number;
  message?: string;
  errors?: Array<{ message: string; longMessage?: string; code?: string }>;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(private configService: ConfigService) {}

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
          return this.getUserById(session.userId);
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
