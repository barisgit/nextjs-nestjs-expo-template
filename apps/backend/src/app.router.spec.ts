import { Test, TestingModule } from "@nestjs/testing";
import { HelloRouter } from "./app.router";
import { describe, it, expect, beforeEach, jest } from "@jest/globals";

// Mock nestjs-trpc
jest.mock("nestjs-trpc");

describe("HelloRouter", () => {
  let helloRouter: HelloRouter;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HelloRouter],
    }).compile();

    helloRouter = module.get<HelloRouter>(HelloRouter);
  });

  it("should be defined", () => {
    expect(helloRouter).toBeDefined();
  });

  describe("hello", () => {
    it('should return "Hello World"', () => {
      expect(helloRouter.hello()).toBe("Hello World");
    });
  });
});
