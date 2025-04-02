// Type alias for router class constructors with a public 'router' property
// Change constraint from AnyRouter to unknown to allow more specific type inference
export type RouterClass = new (...args: never[]) => { router: unknown };

// Interface for the recursive router definition structure
export interface RouterDefinitionNode {
  // Routers to be merged directly at this level
  direct?: RouterClass[];
  // Nested routers, keyed by their path segment
  children?: {
    [path: string]: RouterClass | RouterDefinitionNode;
  };
}

// Helper function to extract all unique router classes recursively from the definition
export function getAllRouterClasses(
  node: RouterDefinitionNode | RouterClass
): RouterClass[] {
  const classes = new Set<RouterClass>();

  // Check if it's a class constructor (function) and not a plain object
  if (typeof node === "function" && node.prototype) {
    // Base case: structure is a single RouterClass constructor
    classes.add(node);
  } else if (
    typeof node === "object" &&
    node !== null &&
    !Array.isArray(node)
  ) {
    // Recursive case: structure is a definition node object
    // We already checked it's an object, so no assertion needed
    const definitionNode = node;
    if (definitionNode.direct) {
      definitionNode.direct.forEach((cls) => classes.add(cls));
    }
    if (definitionNode.children) {
      for (const key in definitionNode.children) {
        // Recursively get classes from children
        getAllRouterClasses(definitionNode.children[key]).forEach((cls) =>
          classes.add(cls)
        );
      }
    }
  }
  return Array.from(classes);
}
