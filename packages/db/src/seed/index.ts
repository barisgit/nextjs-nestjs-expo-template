import { DataSource } from "typeorm";
import { seedUsers } from "./user-seed.js";

/**
 * Runs all seed functions
 * @param dataSource The TypeORM data source
 */
export async function runSeeds(dataSource: DataSource): Promise<void> {
  console.log("🌱 Starting database seed...");

  // Run seeds in the appropriate order
  await seedUsers(dataSource);

  console.log("✅ Database seed completed successfully");
}

// Export individual seed functions for targeted seeding
export { seedUsers };
