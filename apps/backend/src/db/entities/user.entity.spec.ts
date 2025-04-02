import { describe, it, expect } from "@jest/globals";
import { User } from "./user.entity";

describe("User Entity", () => {
  it("should create a user instance", () => {
    const user = new User();
    user.id = "123e4567-e89b-12d3-a456-426614174000";
    user.username = "testuser";
    user.email = "test@example.com";
    user.createdAt = new Date();
    user.updatedAt = new Date();

    expect(user).toBeDefined();
    expect(user.id).toBe("123e4567-e89b-12d3-a456-426614174000");
    expect(user.username).toBe("testuser");
    expect(user.email).toBe("test@example.com");
    expect(user.createdAt).toBeInstanceOf(Date);
    expect(user.updatedAt).toBeInstanceOf(Date);
  });
});
