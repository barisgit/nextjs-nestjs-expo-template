import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { Request } from "express";
import { AuthService } from "./auth.service.js";

@Injectable()
export class ClerkAuthGuard implements CanActivate {
  constructor(private authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const sessionToken = this.extractSessionFromHeader(request);

    console.log("sessionToken", sessionToken);

    if (!sessionToken) {
      throw new UnauthorizedException("Missing session token");
    }

    const isValid = await this.authService.validateSession(sessionToken);

    if (!isValid) {
      throw new UnauthorizedException("Invalid session token");
    }

    return true;
  }

  private extractSessionFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(" ") ?? [];
    return type === "Bearer" ? token : undefined;
  }
}
