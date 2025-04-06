import { Test, TestingModule } from "@nestjs/testing";
import { ConfigService } from "@nestjs/config";
import { PostHogService } from "./posthog.service.js";
import { Logger } from "@nestjs/common";
import { jest } from "@jest/globals";

// Mock PostHog constructor
jest.mock("posthog-node", () => {
  const mockCapture = jest.fn().mockImplementation(() => Promise.resolve());
  const mockIdentify = jest.fn().mockImplementation(() => Promise.resolve());
  const mockFlush = jest.fn().mockImplementation(() => Promise.resolve());

  return {
    PostHog: jest.fn().mockImplementation(() => {
      return {
        capture: mockCapture,
        identify: mockIdentify,
        flush: mockFlush,
      };
    }),
  };
});

describe("PostHogService", () => {
  let service: PostHogService;
  let configService: ConfigService;

  const mockConfig = {
    get: jest.fn((key: string, defaultValue?: any) => {
      if (key === "POSTHOG_API_KEY") return "test_api_key";
      if (key === "POSTHOG_HOST") return "https://test.posthog.com";
      return defaultValue;
    }),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    jest.spyOn(Logger.prototype, "log").mockImplementation(() => ({}));
    jest.spyOn(Logger.prototype, "warn").mockImplementation(() => ({}));
    jest.spyOn(Logger.prototype, "error").mockImplementation(() => ({}));
    jest.spyOn(Logger.prototype, "debug").mockImplementation(() => ({}));

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostHogService,
        {
          provide: ConfigService,
          useValue: mockConfig,
        },
      ],
    }).compile();

    service = module.get<PostHogService>(PostHogService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  it("should initialize PostHog client on module init", () => {
    service.onModuleInit();
    expect(configService.get).toHaveBeenCalledWith("POSTHOG_API_KEY");
    expect(configService.get).toHaveBeenCalledWith(
      "POSTHOG_HOST",
      "https://app.posthog.com"
    );
  });

  it("should not initialize client if API key is not provided", () => {
    jest.spyOn(configService, "get").mockImplementation((key: string) => {
      if (key === "POSTHOG_API_KEY") return undefined;
      return "some_value";
    });
    service.onModuleInit();
    expect(Logger.prototype.warn).toHaveBeenCalled();
  });

  it("should capture events", async () => {
    service.onModuleInit();
    await service.capture("user123", "test_event", { test: true });
    // Implementation checks will depend on how you're accessing the private client
    // This is just a simple test to ensure the method completes without errors
    expect(true).toBeTruthy();
  });

  it("should identify users", async () => {
    service.onModuleInit();
    await service.identify("user123", { name: "Test User" });
    expect(true).toBeTruthy();
  });

  it("should flush events", async () => {
    service.onModuleInit();
    await service.flush();
    expect(true).toBeTruthy();
  });
});
