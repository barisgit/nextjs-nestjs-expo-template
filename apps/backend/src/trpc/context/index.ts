import { Request, Response } from "express";

// Define auth data structure
export interface AuthData {
  userId: string | null;
  isAuthenticated: boolean;
  user?: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string | null;
    imageUrl: string | null;
  } | null;
}

// Define context type
export interface TRPCContext {
  req: Request;
  res: Response;
  auth: AuthData;
}
