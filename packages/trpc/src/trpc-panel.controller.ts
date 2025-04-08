import { All, Controller, Logger } from "@nestjs/common";
import { renderTrpcPanel } from "trpc-ui";
import { TRPCService } from "./trpc.service.js";
@Controller()
export class TRPCPanelController {
  private readonly logger = new Logger(TRPCPanelController.name);

  constructor(private readonly trpcService: TRPCService) {}

  @All("panel")
  panel(): string {
    this.logger.debug("tRPC Panel requested");

    try {
      // Type assertion for compatibility with trpc-ui
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return renderTrpcPanel(this.trpcService.router as any, {
        url: "http://localhost:3001/trpc", // This should match your tRPC endpoint
        transformer: "superjson",
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
