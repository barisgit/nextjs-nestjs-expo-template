import { inferAsyncReturnType } from "@trpc/server";
import { CreateExpressContextOptions } from "@trpc/server/adapters/express";

// Define a type for our NestJS services
interface NestJSServices {
  questionsService?: {
    findAll: () => Promise<any[]>;
    findOne: (id: string) => Promise<any>;
    create: (data: any) => Promise<any>;
    update: (id: string, data: any) => Promise<any>;
    remove: (id: string) => Promise<void>;
    getRandomQuestions: (count: number) => Promise<any[]>;
  };
}

// This is where you'd inject your NestJS services
export const createContext = ({ req, res }: CreateExpressContextOptions) => {
  // For now, we'll create a mock context
  // In a real implementation, you'd inject your NestJS services here
  const nestjs: NestJSServices = {
    // This would be populated with actual NestJS service instances
  };

  return { req, res, nestjs };
};

export type Context = inferAsyncReturnType<typeof createContext>;
