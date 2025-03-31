import { Body, Controller, Post, Req, Res } from "@nestjs/common";
import { Request, Response } from "express";
import { TrpcService } from "./trpc.service";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { QuestionsService } from "../questions/questions.service";

@Controller("trpc")
export class TrpcController {
  constructor(
    private readonly trpcService: TrpcService,
    private readonly questionsService: QuestionsService
  ) {}

  @Post("*")
  async trpcHandler(
    @Req() req: Request,
    @Res() res: Response,
    @Body() body: any
  ) {
    const url = new URL(`http://localhost${req.url}`);
    const response = await fetchRequestHandler({
      endpoint: "/trpc",
      req: new Request(url, {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify(body),
      }),
      router: this.trpcService.router,
      createContext: () => ({
        questionsService: this.questionsService,
      }),
    });

    // Extract response data
    const data = await response.json();
    const status = response.status;
    const headers = Object.fromEntries(response.headers.entries());

    // Set response headers
    Object.entries(headers).forEach(([key, value]) => {
      res.setHeader(key, value);
    });

    // Send response
    res.status(status).json(data);
  }
}
