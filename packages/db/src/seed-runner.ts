import dataSource from "./data-source.js";
import { runSeeds } from "./seed/index.js";

/**
 * Main function to initialize database and run seeds
 */
async function main() {
  try {
    // Initialize the database connection
    if (!dataSource.isInitialized) {
      console.log("🔌 Initializing database connection...");
      await dataSource.initialize();
      console.log("✅ Database connection initialized");
    }

    // Run the seeds
    await runSeeds(dataSource);

    // Close the connection when done
    await dataSource.destroy();
    console.log("👋 Database connection closed");
  } catch (error) {
    console.error("❌ Error running seeds:", error);
    process.exit(1);
  }
}

// Run the main function
main().catch((error) => {
  console.error("❌ Unhandled error:", error);
  process.exit(1);
});
