import { Router, Query } from "nestjs-trpc";
import { z } from "zod";

@Router({ alias: "hello" })
export class HelloRouter {
  constructor() {}

  @Query({ output: z.string() })
  hello(): string {
    return "Hello World";
  }
}
