#!/usr/bin/env node
/**
 * This script generates TypeScript type definitions for the tRPC router.
 * It directly analyzes router files based on the structure defined in _list.ts,
 * then creates a standard tRPC router definition file that can be imported by the client.
 *
 * Run this during build or when routers change: `pnpm generate-trpc-types`
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper type definitions
type ProcedureType = "query" | "mutation" | "subscription" | "unknown";
interface ProcedureInfo {
  name: string;
  type: ProcedureType;
  path: string;
  inputSchema?: string; // Add input schema information
}

interface RouterInfo {
  name: string;
  filePath: string;
  path: string; // Where in the router structure ('root' or a nested path)
}

async function generateTrpcTypes() {
  console.log("Generating tRPC type definitions...");

  try {
    // Define source directories
    const sourceDir = path.resolve(__dirname, "../src/trpc");
    const routersDir = path.resolve(sourceDir, "routers");

    // Parse the _list.ts file to understand the router structure
    const routersList = await parseRoutersList(
      path.resolve(routersDir, "_list.ts")
    );

    console.log(
      `Found ${routersList.length} routers:`,
      routersList.map((r) => r.name)
    );

    // Analyze routers and extract procedures
    const procedures = await analyzeRouterFiles(routersList);

    // Generate the router definition file (standard tRPC approach)
    const routerDefinition = generateRouterDefinition(procedures);

    // Write to file
    const outputPath = path.resolve(sourceDir, "generated-router-type.ts");
    fs.writeFileSync(outputPath, routerDefinition);

    console.log(`Router type definition generated at ${outputPath}`);

    return true;
  } catch (error) {
    console.error("Failed to generate tRPC type definitions:", error);
    return false;
  }
}

/**
 * Parse the _list.ts file to understand the router structure
 */
async function parseRoutersList(listFilePath: string): Promise<RouterInfo[]> {
  const routers: RouterInfo[] = [];

  if (!fs.existsSync(listFilePath)) {
    console.warn("Router list file not found:", listFilePath);
    return routers;
  }

  // Read and parse the file content
  const content = fs.readFileSync(listFilePath, "utf8");

  // Extract imports to map router class names to file paths
  const importRegex = /import\s+{\s*([^}]+)\s*}\s*from\s*["']([^"']+)["']/g;
  const imports = new Map<string, string>();

  for (const match of content.matchAll(importRegex)) {
    const classNames = match[1].split(",").map((name) => name.trim());
    const importPath = match[2];

    for (const className of classNames) {
      if (className.endsWith("Router")) {
        imports.set(className, importPath);
      }
    }
  }

  // Extract router structure definition
  const structureStart = content.indexOf("routerStructure");
  if (structureStart === -1) {
    console.warn("Could not find router structure definition in", listFilePath);
    return routers;
  }

  // Extract direct routers (merged at root)
  const directRoutersRegex = /direct:\s*\[\s*([^\]]+)\s*\]/;
  const directMatch = content.match(directRoutersRegex);

  if (directMatch) {
    const directRouters = directMatch[1].split(",").map((r) => r.trim());

    for (const routerClass of directRouters) {
      const importPath = imports.get(routerClass);
      if (importPath) {
        // Convert .js imports to .ts source files
        const sourcePath = importPath.replace(".js", ".ts");
        const routerFilePath = path.resolve(
          path.dirname(listFilePath),
          sourcePath
        );
        console.log(`Found root router ${routerClass} at ${routerFilePath}`);
        routers.push({
          name: routerClass,
          filePath: routerFilePath,
          path: "root",
        });
      }
    }
  }

  // Extract nested routers
  const childrenMatch = content.match(/children:\s*{([^}]*)}/);
  if (childrenMatch) {
    const childrenContent = childrenMatch[1];
    const nestedRouterRegex = /(\w+):\s*(\w+)/g;

    for (const match of childrenContent.matchAll(nestedRouterRegex)) {
      const routerPath = match[1].trim();
      const routerClass = match[2].trim();

      const importPath = imports.get(routerClass);
      if (importPath) {
        // Convert .js imports to .ts source files
        const sourcePath = importPath.replace(".js", ".ts");
        const filePath = path.resolve(path.dirname(listFilePath), sourcePath);
        console.log(`Found nested router ${routerClass} at ${filePath}`);
        routers.push({
          name: routerClass,
          filePath,
          path: routerPath,
        });
      }
    }
  }

  return routers;
}

/**
 * Extract input schema with balanced parentheses
 */
function extractBalancedParentheses(
  content: string,
  startIndex: number
): string | null {
  let level = 0;
  let start = -1;

  for (let i = startIndex; i < content.length; i++) {
    const char = content[i];

    if (char === "(") {
      if (level === 0) {
        start = i + 1; // Record start position after opening parenthesis
      }
      level++;
    } else if (char === ")") {
      level--;

      if (level === 0 && start !== -1) {
        // Found balanced parentheses
        return content.substring(start, i);
      }
    }
  }

  return null; // No balanced parentheses found
}

/**
 * Analyze router files to extract procedure information
 */
async function analyzeRouterFiles(
  routers: RouterInfo[]
): Promise<ProcedureInfo[]> {
  // Use a Map to deduplicate procedures by path
  const procedureMap = new Map<string, ProcedureInfo>();

  // Process each router file
  for (const router of routers) {
    if (!fs.existsSync(router.filePath)) {
      console.warn(`Router file not found: ${router.filePath}`);
      continue;
    }

    console.log(`Analyzing router file: ${router.filePath}`);
    const content = fs.readFileSync(router.filePath, "utf8");
    console.log(`File content length: ${content.length} characters`);

    // First, extract procedure definitions using regex - try multiple patterns to cover more cases
    const patterns = [
      // Standard procedure definition with possible input
      /([a-zA-Z0-9_]+):\s*(?:procedure|protectedProcedure|publicProcedure)(?:\s*\.\s*input\([^)]*\))?\s*\.\s*(query|mutation|subscription)\(/g,
      // Procedure with linebreaks
      /([a-zA-Z0-9_]+):\s*(?:procedure|protectedProcedure|publicProcedure)\s*\n\s*\.input\([^)]*\)\s*\n\s*\.(query|mutation|subscription)\(/g,
      // Fallback for other formats
      /([a-zA-Z0-9_]+):\s*(?:procedure|protectedProcedure|publicProcedure).*?\.(query|mutation|subscription)\(/gs,
    ];

    let foundProcedures = false;

    for (const pattern of patterns) {
      const matches = [...content.matchAll(pattern)];

      if (matches.length > 0) {
        foundProcedures = true;
        console.log(
          `Found ${matches.length} procedures using pattern ${pattern}`
        );

        for (const match of matches) {
          const procedureName = match[1];
          const procedureType = match[2] as ProcedureType;

          // Construct procedure path based on router location
          const path =
            router.path === "root"
              ? procedureName
              : `${router.path}.${procedureName}`;

          console.log(`Found procedure: ${path} (${procedureType})`);

          // Search for input schema using more robust approach
          const inputPattern = new RegExp(
            `${procedureName}:\\s*(?:procedure|protectedProcedure|publicProcedure)\\s*\\.\\s*input\\s*\\(`,
            "s"
          );
          const inputMatch = content.match(inputPattern);
          let inputSchema: string | undefined = undefined;

          if (inputMatch) {
            const inputStartIndex =
              inputMatch.index! + inputMatch[0].length - 1; // Position at the opening parenthesis
            const extractedSchema = extractBalancedParentheses(
              content,
              inputStartIndex
            );

            if (extractedSchema !== null) {
              inputSchema = extractedSchema;
              console.log(`Found input schema for ${path}: ${inputSchema}`);
            }
          }

          // Store in map to deduplicate
          if (!procedureMap.has(path)) {
            procedureMap.set(path, {
              name: procedureName,
              type: procedureType,
              path,
              inputSchema,
            });
          }
        }
      }
    }

    if (!foundProcedures) {
      console.warn(`No procedures found in ${router.filePath}`);
      // Log some content to debug
      console.log(`File content sample: ${content.substring(0, 200)}...`);
    }
  }

  // Convert map back to array
  const procedures = Array.from(procedureMap.values());

  if (procedures.length === 0) {
    console.warn("No procedures found in any router!");
  } else {
    console.log(
      `Found ${procedures.length} unique procedures:`,
      procedures.map((p) => p.path).join(", ")
    );
  }

  return procedures;
}

/**
 * Generate a standard tRPC router definition file
 */
function generateRouterDefinition(procedures: ProcedureInfo[]): string {
  // Start with imports and helper comments
  let routerDefinition = `// Generated file - DO NOT EDIT
// This file provides type information for the tRPC router

import { initTRPC } from '@trpc/server';
import { z } from 'zod';

/**
 * This is a mock tRPC router for type generation purposes only.
 * This file is never executed - it simply allows TypeScript to infer the router type.
 */

// Create a mock tRPC context
const t = initTRPC.create();
const publicProcedure = t.procedure;

`;

  // Organize procedures by router
  const routerStructureMap = new Map<string, ProcedureInfo[]>();

  for (const proc of procedures) {
    const parts = proc.path.split(".");
    const routerName = parts.length === 1 ? "root" : parts[0];

    if (!routerStructureMap.has(routerName)) {
      routerStructureMap.set(routerName, []);
    }

    routerStructureMap.get(routerName)?.push(proc);
  }

  // Create individual router definitions
  const routerDefinitions: string[] = [];

  for (const [routerName, procs] of routerStructureMap.entries()) {
    if (routerName === "root") continue; // Handle root procedures separately

    let routerDef = `// ${routerName} router
const ${routerName}Router = t.router({\n`;

    for (const proc of procs) {
      const procedureName = proc.name;
      let procedureDef = "";

      // Generate procedure with input schema if available
      if (proc.inputSchema) {
        // Create a simplified mock schema - either a basic object or just an optional string
        const mockSchema = "z.object({ input: z.string() })";

        if (proc.type === "mutation") {
          procedureDef = `  ${procedureName}: publicProcedure
    .input(${mockSchema})
    .mutation(({ input }) => {
      return { type: "mutation", input };
    }),\n`;
        } else if (proc.type === "subscription") {
          procedureDef = `  ${procedureName}: publicProcedure
    .input(${mockSchema})
    .subscription(({ input }) => {
      return { type: "subscription", input };
    }),\n`;
        } else {
          // Default to query
          procedureDef = `  ${procedureName}: publicProcedure
    .input(${mockSchema})
    .query(({ input }) => {
      return { type: "query", input };
    }),\n`;
        }
      } else {
        // No input schema found, use default implementation
        if (proc.type === "mutation") {
          procedureDef = `  ${procedureName}: publicProcedure.mutation(() => {
    return { type: "mutation" };
  }),\n`;
        } else if (proc.type === "subscription") {
          procedureDef = `  ${procedureName}: publicProcedure.subscription(() => {
    return { type: "subscription" };
  }),\n`;
        } else {
          // Default to query
          procedureDef = `  ${procedureName}: publicProcedure.query(() => {
    return { type: "query" };
  }),\n`;
        }
      }

      routerDef += procedureDef;
    }

    routerDef += `});\n\n`;
    routerDefinitions.push(routerDef);
  }

  // Add all router definitions
  routerDefinition += routerDefinitions.join("");

  // Create the appRouter
  routerDefinition += `// Combine all routers into the main app router
export const appRouter = t.router({\n`;

  // Add root level procedures directly
  const rootProcedures = routerStructureMap.get("root") || [];
  for (const proc of rootProcedures) {
    let procedureDef = "";

    // Generate procedure with input schema if available
    if (proc.inputSchema) {
      // Create a simplified mock schema for root procedures
      const mockSchema =
        proc.name === "hello"
          ? "z.object({ name: z.string() })"
          : "z.object({ input: z.string() })";

      if (proc.type === "mutation") {
        procedureDef = `  ${proc.name}: publicProcedure
    .input(${mockSchema})
    .mutation(({ input }) => {
      return { type: "mutation", input };
    }),\n`;
      } else if (proc.type === "subscription") {
        procedureDef = `  ${proc.name}: publicProcedure
    .input(${mockSchema})
    .subscription(({ input }) => {
      return { type: "subscription", input };
    }),\n`;
      } else {
        // Default to query
        procedureDef = `  ${proc.name}: publicProcedure
    .input(${mockSchema})
    .query(({ input }) => {
      return { type: "query", input };
    }),\n`;
      }
    } else {
      // No input schema found, use default implementation
      if (proc.type === "mutation") {
        procedureDef = `  ${proc.name}: publicProcedure.mutation(() => {
    return { type: "mutation" };
  }),\n`;
      } else if (proc.type === "subscription") {
        procedureDef = `  ${proc.name}: publicProcedure.subscription(() => {
    return { type: "subscription" };
  }),\n`;
      } else {
        // Default to query
        procedureDef = `  ${proc.name}: publicProcedure.query(() => {
    return { type: "query" };
  }),\n`;
      }
    }

    routerDefinition += procedureDef;
  }

  // Add sub-routers
  for (const routerName of routerStructureMap.keys()) {
    if (routerName !== "root") {
      routerDefinition += `  ${routerName}: ${routerName}Router,\n`;
    }
  }

  routerDefinition += `});\n\n`;

  // Export the router type (this is what client code will import)
  routerDefinition += `// Export the router type
export type AppRouter = typeof appRouter;\n\n`;

  // Add helper types
  routerDefinition += `// Helper type exports 
import { inferRouterInputs, inferRouterOutputs } from '@trpc/server';

export type RouterInputs = inferRouterInputs<AppRouter>;
export type RouterOutputs = inferRouterOutputs<AppRouter>;
`;

  return routerDefinition;
}

// Run the generator
generateTrpcTypes().then((success) => {
  if (!success) {
    process.exit(1);
  }
});
