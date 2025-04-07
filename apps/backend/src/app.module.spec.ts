import { Test, TestingModule } from "@nestjs/testing";
import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  afterAll,
  jest,
} from "@jest/globals";
import { INestApplication } from "@nestjs/common";
import { AppModule } from "./app.module.js";

// Set a longer timeout for the tests
jest.setTimeout(10000);

describe("AppModule", () => {
  let app: INestApplication;
  let moduleFixture: TestingModule;

  beforeEach(async () => {
    moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    if (app) {
      await app.close();
    }
  });

  // Ensure all resources are properly released after all tests
  afterAll(async () => {
    if (moduleFixture) {
      await moduleFixture.close();
    }

    // Force garbage collection to clean up any lingering connections
    if (global.gc) {
      global.gc();
    }

    // Add a small delay to allow resources to be properly released
    await new Promise((resolve) => setTimeout(resolve, 500));
  });

  it("should be defined", () => {
    expect(app).toBeDefined();
  });
});
