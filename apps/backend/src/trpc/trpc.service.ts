import { Injectable } from "@nestjs/common";
import { z } from "zod";
import { initTRPC } from "@trpc/server";
import { QuestionsService } from "../questions/questions.service";

const t = initTRPC.create();

@Injectable()
export class TrpcService {
  constructor(private readonly questionsService: QuestionsService) {}

  // Create tRPC router
  router = t.router({
    hello: t.procedure
      .input(z.object({ name: z.string().optional() }))
      .query(({ input }) => {
        return `Hello ${input.name || "world"}!`;
      }),

    questions: t.router({
      getAll: t.procedure.query(async () => {
        return this.questionsService.findAll();
      }),

      getById: t.procedure
        .input(z.object({ id: z.string() }))
        .query(async ({ input }) => {
          return this.questionsService.findOne(input.id);
        }),

      create: t.procedure
        .input(
          z.object({
            text: z.string(),
            difficulty: z.enum(["easy", "medium", "hard"]),
            category: z.string(),
            options: z.array(z.string()),
            correctAnswer: z.string(),
            explanation: z.string().optional(),
          })
        )
        .mutation(async ({ input }) => {
          return this.questionsService.create(input);
        }),

      getRandom: t.procedure
        .input(z.object({ count: z.number().default(10) }))
        .query(async ({ input }) => {
          return this.questionsService.getRandomQuestions(input.count);
        }),
    }),
  });
}
