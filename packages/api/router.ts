import { z } from "zod";
import { router, publicProcedure } from "./trpc";

// Define a Question schema for tRPC
const QuestionSchema = z.object({
  id: z.string().uuid().optional(),
  text: z.string(),
  difficulty: z.enum(["easy", "medium", "hard"]),
  category: z.string(),
  options: z.array(z.string()),
  correctAnswer: z.string(),
  explanation: z.string().optional(),
});

export const appRouter = router({
  hello: publicProcedure
    .input(z.object({ name: z.string().optional() }))
    .query(({ input }) => {
      return `Hello ${input.name || "world"}!`;
    }),

  // Question related procedures
  questions: router({
    getAll: publicProcedure.query(({ ctx }) => {
      // In a real implementation, this would use ctx to access your NestJS service
      return ctx.nestjs?.questionsService.findAll();
    }),

    getById: publicProcedure
      .input(z.object({ id: z.string() }))
      .query(({ input, ctx }) => {
        return ctx.nestjs?.questionsService.findOne(input.id);
      }),

    create: publicProcedure.input(QuestionSchema).mutation(({ input, ctx }) => {
      return ctx.nestjs?.questionsService.create(input);
    }),

    getRandom: publicProcedure
      .input(z.object({ count: z.number().default(10) }))
      .query(({ input, ctx }) => {
        return ctx.nestjs?.questionsService.getRandomQuestions(input.count);
      }),
  }),
});

export type AppRouter = typeof appRouter;
