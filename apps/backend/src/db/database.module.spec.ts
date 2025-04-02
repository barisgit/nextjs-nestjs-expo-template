import { describe, it, expect } from "@jest/globals";
import { DatabaseModule } from "./database.module.js";

// This is a basic smoke test just to ensure the module is defined
describe("DatabaseModule", () => {
  it("should be defined", () => {
    expect(DatabaseModule).toBeDefined();
  });
});
