import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Create route matchers for protected routes
const publicRoutes = createRouteMatcher(["/", "/sign-in", "/sign-up"]);
const ignoredRoutes = createRouteMatcher(["/api/trpc"]);

export default clerkMiddleware(async (auth, req) => {
  // If the request is for a public route, don't enforce authentication
  if (publicRoutes(req)) {
    return;
  }

  // If the request is for an ignored route, don't enforce authentication
  if (ignoredRoutes(req)) {
    return;
  }

  // For all other routes, protect them
  await auth.protect();
});

export const config = {
  // Matches all paths except for
  // - Files in the public directory
  // - _next directory
  // - favicon.ico, etc.
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
