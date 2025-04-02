import { All, Controller, Inject, Logger, OnModuleInit } from "@nestjs/common";
import { renderTrpcPanel } from "trpc-ui";
import { AppRouterHost } from "nestjs-trpc";

@Controller()
export class TrpcPanelController implements OnModuleInit {
  private readonly logger = new Logger(TrpcPanelController.name);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private appRouter: any;

  constructor(
    @Inject(AppRouterHost) private readonly appRouterHost: AppRouterHost
  ) {}

  onModuleInit() {
    this.logger.log("Initializing tRPC Panel...");
    this.appRouter = this.appRouterHost.appRouter;
    this.logger.debug("tRPC Panel router initialized successfully");
  }

  @All("/panel")
  panel(): string {
    this.logger.debug("tRPC Panel requested");
    try {
      // For protected routes, you need to add an Authorization header
      // with a valid JWT token in the panel UI.
      // Format: Authorization: Bearer your_jwt_token
      // eslint-disable-next-line -- I can't figure out how to type this
      return renderTrpcPanel(this.appRouter as any, {
        url: "http://localhost:3001/trpc", // This should match your TRPCModule basePath
        meta: {
          title: "Backend API Documentation",
          description: "API documentation for tRPC endpoints",
        },
      });
    } catch (error) {
      this.logger.error(
        `Error rendering tRPC Panel: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined
      );
      return `<html><body><h1>Error rendering tRPC Panel</h1><pre>${
        error instanceof Error ? error.message : String(error)
      }</pre></body></html>`;
    }
  }
}
