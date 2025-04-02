import { Test, TestingModule } from "@nestjs/testing";
import { describe, it, expect, beforeEach, afterEach } from "@jest/globals";
import { INestApplication } from "@nestjs/common";
import { AppModule } from "./app.module.js";

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
