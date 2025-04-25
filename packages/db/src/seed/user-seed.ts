import { DataSource } from "typeorm";
import { User } from "../entities/user.entity.js";

/**
 * Seeds the database with basic languages
 * @param dataSource The TypeORM data source
 */
export async function seedUsers(dataSource: DataSource): Promise<void> {
  const userRepository = dataSource.getRepository(User);

  // Check if English language already exists
  const existingUser = await userRepository.findOne({
    where: { email: "test@test.com" },
  });

  if (!existingUser) {
    // Create a test user
    const user = userRepository.create({
      email: "test@test.com",
      username: "testuser",
    });

    await userRepository.save(user);
    console.log("✅ User created successfully");
  } else {
    console.log("ℹ️ User already exists");
  }
}
