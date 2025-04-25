import fs from "fs";
import path from "path";
import chalk from "chalk";
import { EnvManager, EnvLine, EnvKeyValueLine } from "./env-manager"; // Assuming env-manager.ts is in the same directory

const targetDirs = ["apps", "packages"];
const envFilePattern = /^\.env(\..*)?$/; // Matches .env, .env.local, .env.example, etc.

/**
 * Recursively finds files matching a pattern within specified base directories.
 *
 * @param baseDirs - An array of base directories to start searching from.
 * @param pattern - A RegExp pattern to match filenames against.
 * @returns An array of absolute file paths matching the pattern.
 */
async function findFilesRecursive(
  baseDirs: string[],
  pattern: RegExp
): Promise<string[]> {
  const foundFiles: string[] = [];
  const workspaceRoot = path.resolve(__dirname, "../../"); // Adjust if script location changes

  async function scanDir(dirPath: string) {
    try {
      const entries = await fs.promises.readdir(dirPath, {
        withFileTypes: true,
      });
      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);
        if (entry.isDirectory()) {
          // Avoid specific directories
          if (
            ![
              // Using an array for cleaner exclusion list
              "node_modules",
              "dist",
              ".turbo",
              ".next",
              ".tamagui",
              "cache",
              ".vscode",
              ".github", // Add other common folders to exclude
              "__tests__",
              "coverage",
            ].includes(entry.name)
          ) {
            await scanDir(fullPath);
          }
        } else if (entry.isFile() && pattern.test(entry.name)) {
          foundFiles.push(fullPath);
        }
      }
    } catch (error: any) {
      // Ignore ENOENT (directory not found) errors, log others
      if (error.code !== "ENOENT") {
        console.error(chalk.red(`Error scanning directory ${dirPath}:`), error);
      }
    }
  }

  for (const baseDir of baseDirs) {
    await scanDir(path.join(workspaceRoot, baseDir));
  }

  return foundFiles;
}

/**
 * Groups file paths by their parent app/package directory.
 *
 * @param files - Array of absolute file paths.
 * @param workspaceRoot - Absolute path to the workspace root.
 * @returns A Map where keys are relative app/package paths (e.g., 'apps/backend') and values are arrays of absolute file paths within that group.
 */
function groupFilesByProject(
  files: string[],
  workspaceRoot: string
): Map<string, string[]> {
  const groupedFiles = new Map<string, string[]>();

  for (const filePath of files) {
    const relativePath = path.relative(workspaceRoot, filePath);
    const pathParts = relativePath.split(path.sep);

    // Expecting structure like 'apps/appName/...' or 'packages/packageName/...'
    if (
      pathParts.length >= 2 &&
      (pathParts[0] === "apps" || pathParts[0] === "packages")
    ) {
      const groupKey = path.join(pathParts[0], pathParts[1]); // e.g., apps/backend
      if (!groupedFiles.has(groupKey)) {
        groupedFiles.set(groupKey, []);
      }
      groupedFiles.get(groupKey)!.push(filePath);
    } else {
      // Handle files directly in apps/ or packages/ or unexpected structure
      const groupKey = pathParts[0] ?? "<unknown>"; // Fallback group
      if (!groupedFiles.has(groupKey)) {
        groupedFiles.set(groupKey, []);
      }
      groupedFiles.get(groupKey)!.push(filePath);
      console.warn(
        chalk.yellow(
          `Could not determine project group for: ${relativePath}. Placing in group '${groupKey}'.`
        )
      );
    }
  }

  return groupedFiles;
}

/**
 * Main function to inspect environment files.
 */
async function inspectEnvs() {
  console.log(
    chalk.cyan(
      `🔍 Scanning for environment files (${envFilePattern.toString()}) in ${targetDirs.join(
        ", "
      )}...\n`
    )
  );

  const envFiles = await findFilesRecursive(targetDirs, envFilePattern);
  const workspaceRoot = path.resolve(__dirname, "../../");

  if (envFiles.length === 0) {
    console.log(chalk.yellow("No .env files found."));
    return;
  }

  const groupedFiles = groupFilesByProject(envFiles, workspaceRoot);

  console.log(
    chalk.green(
      `Found ${envFiles.length} environment files across ${groupedFiles.size} projects:\n`
    )
  );

  // Sort groups alphabetically for consistent output
  const sortedGroups = Array.from(groupedFiles.keys()).sort();

  for (const groupKey of sortedGroups) {
    const filesInGroup = groupedFiles.get(groupKey)!;
    console.log(chalk.whiteBright.bold.underline(`Project: ${groupKey}`));
    console.log(""); // Add space before listing files

    for (const filePath of filesInGroup) {
      const relativePath = path.relative(workspaceRoot, filePath);
      const isExample = filePath.includes(".example");
      const fileHeader = isExample
        ? chalk.yellowBright(`  📄 [EXAMPLE] ${path.basename(filePath)}`)
        : chalk.greenBright(`  📄 ${path.basename(filePath)}`);

      console.log(
        fileHeader + chalk.gray(` (in ${path.dirname(relativePath)})`)
      );

      try {
        const envManager = new EnvManager(filePath);
        const lines = envManager.getLines();
        const keyValues = lines.filter(
          (line): line is EnvKeyValueLine => line.type === "keyValue"
        );

        if (keyValues.length > 0) {
          keyValues.forEach((kv) => {
            const comment = kv.inlineComment
              ? chalk.gray(` # ${kv.inlineComment}`)
              : "";
            console.log(
              `    ${chalk.blue(kv.key)}=${chalk.magenta(kv.value)}${comment}`
            );
          });
        } else {
          console.log(
            chalk.gray("    (No key-value pairs found or file is empty)")
          );
        }
      } catch (error: any) {
        console.log(
          chalk.red(
            `    Error reading or parsing file: ${error.message || error}`
          )
        );
      }
      console.log(""); // Add a blank line between file entries within a group
    }
    console.log("------------------------------------\n"); // Separator between groups
  }
}

// Execute the inspection
inspectEnvs().catch((error) => {
  console.error(chalk.red("\nAn unexpected error occurred:"), error);
  process.exit(1);
});
