import fs from "fs";
import path from "path";

/** Defines the type of line in an .env file */
export type EnvLineType = "keyValue" | "comment" | "whitespace";

/** Base interface for all line types */
interface EnvLineBase {
  type: EnvLineType;
  /** The original raw line content, including whitespace and line endings */
  originalLine: string;
}

/** Represents a key-value pair line (e.g., DB_HOST=localhost # comment) */
export interface EnvKeyValueLine extends EnvLineBase {
  type: "keyValue";
  /** The variable key */
  key: string;
  /** The variable value */
  value: string;
  /** Any comment appearing after the value on the same line */
  inlineComment: string | null;
}

/** Represents a comment line (e.g., # Database Configuration) */
export interface EnvCommentLine extends EnvLineBase {
  type: "comment";
  /** The content of the comment, excluding the '#' */
  comment: string;
}

/** Represents an empty or whitespace-only line */
export interface EnvWhitespaceLine extends EnvLineBase {
  type: "whitespace";
}

/** Union type for any line in an .env file */
export type EnvLine = EnvKeyValueLine | EnvCommentLine | EnvWhitespaceLine;

// Regex patterns for parsing lines
// 1. Key-value: captures key, optional quotes, value within quotes, optional inline comment
//    Allows keys starting with letter or _, followed by letters, numbers, or _
//    Handles empty values and values with spaces correctly.
//    Allows single or double quotes around the value.
const keyValueRegex =
  /^\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*(['"]?)(.*?)\2\s*(?:#\s*(.*))?$/;
// 2. Comment: captures comment content after #
const commentRegex = /^\s*#(.*)$/;
// 3. Whitespace: matches lines containing only whitespace
const whitespaceRegex = /^\s*$/;

/**
 * Manages the reading, modification, and writing of .env files
 * while preserving comments and whitespace.
 */
export class EnvManager {
  private envLines: EnvLine[] = [];
  private readonly filePath: string;
  private readonly defaultEnvLines?: EnvLine[];

  /**
   * Creates an instance of EnvManager.
   * Parses the content of the specified .env file upon instantiation.
   *
   * @param filePath - The absolute or relative path to the .env file.
   * @param defaultEnvLines - Optional array of EnvLine objects to use if the file doesn't exist or is empty.
   * @throws Throws an error if the file exists but cannot be read (for reasons other than not existing).
   */
  constructor(filePath: string, defaultEnvLines?: EnvLine[]) {
    this.filePath = path.resolve(filePath); // Store absolute path
    this.defaultEnvLines = defaultEnvLines;
    this.parseFile();
  }

  /**
   * Parses the content of the .env file into the internal structured array.
   * Called by the constructor and can be called again to reload from disk.
   */
  public parseFile(): void {
    let content: string;
    try {
      content = fs.readFileSync(this.filePath, "utf-8");
    } catch (error: any) {
      if (error.code === "ENOENT") {
        if (this.defaultEnvLines) {
          // console.log(`File not found at ${this.filePath}. Using default env structure.`);
          this.envLines = [...this.defaultEnvLines]; // Use a copy
        } else {
          // console.log(`File not found at ${this.filePath}. Initializing empty.`);
          this.envLines = [];
        }
        return; // Exit parsing if file not found
      }
      console.error(`Error reading file ${this.filePath}:`, error);
      throw error; // Rethrow other errors
    }

    if (!content.trim() && this.defaultEnvLines) {
      // console.log(`File at ${this.filePath} is empty. Using default env structure.`);
      this.envLines = [...this.defaultEnvLines]; // Use a copy
      return;
    }

    const lines = content.split(/\r?\n/);
    const parsedLines: EnvLine[] = [];

    for (let i = 0; i < lines.length; i++) {
      // Handle the very last line possibly being empty due to a trailing newline in the file
      // We include it as whitespace if the file actually had content ending in a newline
      if (i === lines.length - 1 && lines[i] === "" && content.endsWith("\n")) {
        // Check if the *original* content ended with a newline. If so, add a whitespace line.
        // The split operation creates an extra empty string in this case.
        parsedLines.push({ type: "whitespace", originalLine: "" }); // Represent the trailing newline implicitly
        continue; // Skip further processing for this "ghost" line
      }
      // If it's the last line and empty, but the file didn't end with \n, it's just an empty last line.
      if (i === lines.length - 1 && lines[i] === "") {
        continue; // Don't add empty line if it wasn't from a trailing newline
      }

      const originalLine = lines[i]; // Keep the original line including potential \r

      // 1. Check for Key-Value pairs
      let match = originalLine.match(keyValueRegex);
      if (match) {
        // match[1] = key
        // match[3] = value (might be empty string)
        // match[4] = inline comment (might be undefined)
        parsedLines.push({
          type: "keyValue",
          originalLine,
          key: match[1],
          value: match[3] ?? "", // Handle case where value capture group is missing (e.g. KEY=)
          inlineComment: match[4]?.trim() ?? null, // Trim whitespace from captured comment
        });
        continue;
      }

      // 2. Check for Comments
      match = originalLine.match(commentRegex);
      if (match) {
        parsedLines.push({
          type: "comment",
          originalLine,
          comment: match[1].trim(), // Store trimmed comment content
        });
        continue;
      }

      // 3. Check for Whitespace / Empty Line
      if (whitespaceRegex.test(originalLine)) {
        parsedLines.push({
          type: "whitespace",
          originalLine,
        });
        continue;
      }

      // 4. If none of the above, treat as an unknown line. Preserve it as a comment.
      // This could be a malformed line or something unexpected.
      console.warn(
        `[EnvManager] Line ${i + 1} in ${this.filePath} not recognized: "${originalLine}". Preserving as comment.`
      );
      parsedLines.push({
        type: "comment", // Treat as a comment for preservation
        originalLine,
        comment: originalLine, // Store the whole line as the comment content
      });
    }
    this.envLines = parsedLines;
  }

  /**
   * Returns a copy of the internal array of parsed EnvLine objects.
   * Useful for getting the parsed structure, e.g., from an example file.
   *
   * @returns A copy of the internal EnvLine array.
   */
  public getLines(): EnvLine[] {
    return [...this.envLines]; // Return a copy
  }

  /**
   * Reconstructs the originalLine property for a KeyValue line based on its components.
   * Tries to preserve original spacing around the '='.
   * @param line - The EnvKeyValueLine to reconstruct.
   * @returns The reconstructed originalLine string.
   */
  private reconstructKeyValueLine(line: EnvKeyValueLine): string {
    const originalLine = line.originalLine;
    const equalsIndex = originalLine.indexOf("=");
    let reconstructedLine = originalLine; // Default to original if reconstruction fails

    if (equalsIndex !== -1) {
      const keyPart = originalLine.substring(0, equalsIndex); // Includes leading whitespace and key
      const valuePart = line.value; // Use the potentially updated value
      const commentMatch = originalLine
        .substring(equalsIndex + 1)
        .match(/(\s*)(?:#s*(.*))?$/); // Find comment part after '='
      // Use the *current* inlineComment state, reconstructing the suffix if needed
      const commentSuffix = line.inlineComment
        ? ` # ${line.inlineComment}`
        : "";

      // Try to find original spacing after '=', before any old comment
      const originalValueAndComment = originalLine.substring(equalsIndex + 1);
      const valueEndIndex = originalValueAndComment.search(/s+#|$/); // Find start of whitespace before # or end of string
      const spacingAfterEquals =
        originalValueAndComment
          .substring(0, valueEndIndex)
          .match(/^(\s*)/)?.[1] ?? ""; // Whitespace after = but before value starts
      const spacingBeforeComment = commentSuffix
        ? (commentMatch?.[1] ?? " ")
        : ""; // Whitespace before new/existing comment or default space

      // Construct: (original key part) + = + (spacing) + (new value) + (spacing) + (new comment)
      // This is complex; a simpler approach is often sufficient:
      reconstructedLine = `${keyPart}=${spacingAfterEquals}${valuePart}${spacingBeforeComment}${commentSuffix}`;
    } else {
      // Fallback: Simple reconstruction if '=' was somehow missing
      const commentSuffix = line.inlineComment
        ? ` # ${line.inlineComment}`
        : "";
      reconstructedLine = `${line.key}=${line.value}${commentSuffix}`;
      console.warn(
        `[EnvManager] Could not find '=' in original line for key "${line.key}" during reconstruction.`
      );
    }
    return reconstructedLine;
  }

  /**
   * Gets the value of a specific environment variable key.
   * If the key appears multiple times, the value from the *first* occurrence is returned.
   *
   * @param key - The environment variable key to search for.
   * @returns The value associated with the key, or undefined if the key is not found.
   */
  public getValue(key: string): string | undefined {
    for (const line of this.envLines) {
      if (line.type === "keyValue" && line.key === key) {
        return line.value;
      }
    }
    return undefined;
  }

  /**
   * Sets or updates the value of a specific environment variable key.
   * If the key exists, its value is updated. If not, a new line is added.
   * This method modifies the internal state of the EnvManager instance.
   * Call `save()` to persist changes to the file.
   *
   * @param key - The environment variable key to set or update.
   * @param value - The new value to assign to the key.
   * @returns The current EnvManager instance for chaining.
   */
  public setValue(key: string, value: string): this {
    let keyFound = false;
    let updateIndex = -1;

    for (let i = 0; i < this.envLines.length; i++) {
      const line = this.envLines[i];
      if (line.type === "keyValue" && line.key === key) {
        updateIndex = i;
        keyFound = true;
        break;
      }
    }

    if (keyFound) {
      const lineToUpdate = this.envLines[updateIndex] as EnvKeyValueLine;
      lineToUpdate.value = value;
      // Reconstruct the originalLine after updating the value
      lineToUpdate.originalLine = this.reconstructKeyValueLine(lineToUpdate);
      this.envLines[updateIndex] = lineToUpdate; // Ensure the update is reflected
    } else {
      const newLine: EnvKeyValueLine = {
        type: "keyValue",
        key: key,
        value: value,
        inlineComment: null,
        originalLine: `${key}=${value}`, // Simple representation for new lines
      };

      let insertIndex = -1;
      for (let i = this.envLines.length - 1; i >= 0; i--) {
        if (this.envLines[i].type !== "whitespace") {
          insertIndex = i;
          break;
        }
      }
      this.envLines.splice(insertIndex + 1, 0, newLine);
    }
    return this; // Allow chaining
  }

  /**
   * Removes a comment from a specific line number (1-based index).
   * If the line is a key-value pair with an inline comment, the inline comment is removed.
   * If the line is a full comment line, it is converted into a whitespace line.
   * Does nothing if the line number is invalid or the line has no comment to remove.
   * Call `save()` to persist changes to the file.
   *
   * @param lineNumber - The 1-based line number to modify.
   * @returns The current EnvManager instance for chaining.
   */
  public removeCommentAtLine(lineNumber: number): this {
    const index = lineNumber - 1; // Convert to 0-based index
    if (index < 0 || index >= this.envLines.length) {
      console.warn(
        `[EnvManager] Attempted to remove comment at invalid line number: ${lineNumber}`
      );
      return this;
    }

    const line = this.envLines[index];

    if (line.type === "keyValue" && line.inlineComment !== null) {
      line.inlineComment = null;
      // Reconstruct the originalLine after removing the comment
      line.originalLine = this.reconstructKeyValueLine(line);
      this.envLines[index] = line; // Ensure the update is reflected
      // console.log(`Removed inline comment from line ${lineNumber} for key "${line.key}".`);
    } else if (line.type === "comment") {
      // Convert the comment line to a whitespace line
      const whitespaceLine: EnvWhitespaceLine = {
        type: "whitespace",
        originalLine: "", // Represent as an empty line
      };
      this.envLines[index] = whitespaceLine;
      // console.log(`Converted comment line ${lineNumber} to whitespace.`);
    }
    // No action needed for whitespace lines or key-value lines without inline comments

    return this; // Allow chaining
  }

  /**
   * Removes the inline comment associated with the first occurrence of a specific key.
   * Does nothing if the key is not found or if the key-value line has no inline comment.
   * Call `save()` to persist changes to the file.
   *
   * @param key - The environment variable key whose inline comment should be removed.
   * @returns The current EnvManager instance for chaining.
   */
  public removeCommentForKey(key: string): this {
    let keyFound = false;
    let updateIndex = -1;

    for (let i = 0; i < this.envLines.length; i++) {
      const line = this.envLines[i];
      if (line.type === "keyValue" && line.key === key) {
        if (line.inlineComment !== null) {
          updateIndex = i;
          keyFound = true;
        }
        // Found the key, but break regardless of comment presence, only act on first key match
        break;
      }
    }

    if (keyFound) {
      const lineToUpdate = this.envLines[updateIndex] as EnvKeyValueLine;
      lineToUpdate.inlineComment = null;
      // Reconstruct the originalLine after removing the comment
      lineToUpdate.originalLine = this.reconstructKeyValueLine(lineToUpdate);
      this.envLines[updateIndex] = lineToUpdate; // Ensure the update is reflected
      // console.log(`Removed inline comment for key "${key}".`);
    }
    // else { console.log(`Key "${key}" not found or has no inline comment.`); } // Optional logging

    return this; // Allow chaining
  }

  /**
   * Converts the internal array of EnvLine objects back into a string representation
   * suitable for writing to an .env file. Preserves original line content where possible.
   * Uses Unix (LF) line endings for consistency.
   *
   * @returns The string representation of the current .env file content.
   */
  public getContent(): string {
    return this.envLines.map((line) => line.originalLine).join("\n");
  }

  /**
   * Saves the current state of the environment lines back to the original file path.
   * Overwrites the file if it exists.
   *
   * @throws Throws an error if the file cannot be written.
   */
  public save(): void {
    try {
      const content = this.getContent();
      fs.writeFileSync(this.filePath, content, "utf-8");
      // console.log(`Successfully saved environment configuration to ${this.filePath}`);
    } catch (error) {
      console.error(`Error writing file ${this.filePath}:`, error);
      throw error;
    }
  }
}

// --- Example Usage (demonstrates the class) ---

async function example() {
  // Use a temporary path for the example to avoid modifying actual dev files
  const exampleSourcePath = path.resolve(
    __dirname,
    "../../apps/backend/.env.local.example"
  );
  const exampleWorkPath = path.resolve(
    __dirname,
    "../../apps/backend/.env.manager-test"
  );

  // Ensure the source example file exists
  if (!fs.existsSync(exampleSourcePath)) {
    console.error(`Source example file not found: ${exampleSourcePath}`);
    // Create a dummy example file if it's missing for the demo
    const dummyContent = `# Dummy Example File\nKEY1=VALUE1\n# A comment\nKEY2=VALUE2 # Inline comment\n`;
    fs.writeFileSync(exampleSourcePath, dummyContent, "utf-8");
    console.log(`Created dummy example file at ${exampleSourcePath}`);
  }

  // Copy the example to a working path for the test
  try {
    fs.copyFileSync(exampleSourcePath, exampleWorkPath);
    console.log(
      `Copied ${exampleSourcePath} to ${exampleWorkPath} for testing.`
    );
  } catch (err) {
    console.error(`Failed to copy example file for test: ${err}`);
    return;
  }

  console.log(`\n🚀 Initializing EnvManager with: ${exampleWorkPath}`);
  const envManager = new EnvManager(exampleWorkPath);

  console.log("\n--- Initial Content ---");
  console.log(envManager.getContent());

  console.log("\n--- Getting Values ---");
  console.log(`DB_HOST: ${envManager.getValue("DB_HOST")}`); // Might be undefined depending on example
  console.log(`CLERK_SECRET_KEY: ${envManager.getValue("CLERK_SECRET_KEY")}`); // Might be undefined
  console.log(`NON_EXISTENT_KEY: ${envManager.getValue("NON_EXISTENT_KEY")}`);

  console.log("\n--- Setting Values ---");
  envManager
    .setValue("DB_HOST", "127.0.0.1") // Update or add
    .setValue("DB_PASSWORD", "newSecurePassword123!") // Update or add
    .setValue("NEW_API_KEY", "abcdef12345"); // Add new

  console.log("\n--- Getting Values After Set ---");
  console.log(`DB_HOST: ${envManager.getValue("DB_HOST")}`);
  console.log(`DB_PASSWORD: ${envManager.getValue("DB_PASSWORD")}`);
  console.log(`NEW_API_KEY: ${envManager.getValue("NEW_API_KEY")}`);

  console.log("\n--- Removing Comments ---");
  // Attempt to remove comment for DB_PASSWORD (might exist if added above or in original example)
  envManager.removeCommentForKey("DB_PASSWORD");
  console.log(`Removed comment for DB_PASSWORD (if it existed).`);

  // Find a line index that is a comment (if any) - Example: line 3 might be '# Database Configuration...'
  let commentLineIndex = -1;
  const lines = envManager.getContent().split("\n");
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim().startsWith("#") && !lines[i].includes("=")) {
      // Find a full comment line
      commentLineIndex = i;
      break;
    }
  }
  if (commentLineIndex !== -1) {
    console.log(
      `Attempting to remove comment at line ${commentLineIndex + 1}: "${lines[commentLineIndex]}"`
    );
    envManager.removeCommentAtLine(commentLineIndex + 1); // Remove comment line (converts to whitespace)
  } else {
    console.log("Could not find a full comment line to remove for demo.");
  }

  // Find a line index with an inline comment (if any) - Example: 'DB_PASSWORD=... # <-- CHANGE THIS'
  let inlineCommentLineIndex = -1;
  const linesAfterSet = envManager.getContent().split("\n");
  for (let i = 0; i < linesAfterSet.length; i++) {
    if (linesAfterSet[i].includes("=") && linesAfterSet[i].includes("#")) {
      inlineCommentLineIndex = i;
      break;
    }
  }
  if (inlineCommentLineIndex !== -1) {
    console.log(
      `Attempting to remove inline comment at line ${inlineCommentLineIndex + 1}: "${linesAfterSet[inlineCommentLineIndex]}"`
    );
    envManager.removeCommentAtLine(inlineCommentLineIndex + 1); // Remove inline comment
  } else {
    console.log("Could not find an inline comment to remove for demo.");
  }

  console.log("\n--- Content After Modifications ---");
  console.log(envManager.getContent());

  console.log("\n--- Saving Modified Data ---");
  envManager.save();
  console.log(`Modified data saved to ${exampleWorkPath}`);

  console.log("\n--- Verifying Saved File (by reloading) ---");
  const reloadedManager = new EnvManager(exampleWorkPath);
  console.log(`DB_HOST from reloaded: ${reloadedManager.getValue("DB_HOST")}`);
  console.log(
    `DB_PASSWORD from reloaded: ${reloadedManager.getValue("DB_PASSWORD")}`
  );
  console.log(
    `NEW_API_KEY from reloaded: ${reloadedManager.getValue("NEW_API_KEY")}`
  );
  console.log("\n--- Full Reloaded Content ---");
  console.log(reloadedManager.getContent());

  //   Clean up the test file
  try {
    fs.unlinkSync(exampleWorkPath);
    console.log(`\nCleaned up ${exampleWorkPath}`);
  } catch (err) {
    console.error(`Failed to clean up test file: ${err}`);
  }
}

// Run the example if the script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  example().catch(console.error);
}
