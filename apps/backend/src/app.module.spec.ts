import { Test, TestingModule } from "@nestjs/testing";
import { AppModule } from "./app.module";
import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  jest,
} from "@jest/globals";
import { INestApplication } from "@nestjs/common";

// Mock nestjs-trpc
jest.mock("nestjs-trpc");

describe("AppModule", () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it("should be defined", () => {
    expect(app).toBeDefined();
  });
});
