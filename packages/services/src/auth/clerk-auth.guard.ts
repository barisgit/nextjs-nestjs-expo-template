import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  Logger,
} from "@nestjs/common";
import { AuthService } from "./auth.service.js";
import { Request } from "express";

/**
 * Interface for Express Request with auth headers
 */
export interface RequestWithAuth extends Request {
  headers: {
    authorization?: string;
    [key: string]: string | string[] | undefined;
  };
}

/**
 * Guard to protect routes by validating Clerk session tokens
 */
@Injectable()
export class ClerkAuthGuard implements CanActivate {
  private readonly logger = new Logger(ClerkAuthGuard.name);

  constructor(private readonly authService: AuthService) {}

  /**
   * Check if the request is from an authenticated user
   *
   * @param context - The execution context
   * @returns Promise<boolean> - Whether the request is authorized
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithAuth>();
    const sessionToken = this.extractSessionFromHeader(request);

    this.logger.debug(
      `Validating auth token: ${sessionToken ? "provided" : "missing"}`
    );

    if (!sessionToken) {
      throw new UnauthorizedException("Missing session token");
    }

    const isValid = await this.authService.validateSession(sessionToken);

    if (!isValid) {
      throw new UnauthorizedException("Invalid session token");
    }

    return true;
  }

  /**
   * Extract the session token from the Authorization header
   *
   * @param request - The HTTP request
   * @returns The token or undefined if not found
   */
  private extractSessionFromHeader(
    request: RequestWithAuth
  ): string | undefined {
    const [type, token] = request.headers.authorization?.split(" ") ?? [];
    return type === "Bearer" ? token : undefined;
  }
}
