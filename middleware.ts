import { clerkMiddleware } from '@clerk/nextjs/server';

export default clerkMiddleware();

export const config = {
  matcher: [
    // Apply Clerk to everything except static files
    '/((?!_next|.*\\..*).*)',
    '/(api|trpc)(.*)',
  ],
};
