import { execSync } from "child_process";

// Get the migration name from command line arguments
const migrationName = process.argv[2];

if (!migrationName) {
  console.error("Error: Migration name must be provided.");
  console.log(
    "Usage: pnpm --filter @repo/db migration:generate <MigrationName>"
  );
  process.exit(1);
}

try {
  execSync(
    `pnpm typeorm migration:generate ./src/migrations/${migrationName}`,
    {
      stdio: "inherit",
    }
  );
  console.log("\nMigration generated successfully.");
  process.exit(0);
} catch (error) {
  console.error("\nMigration generation failed.");
  const exitCode = (error as any)?.status ?? 1;
  process.exit(exitCode);
}
