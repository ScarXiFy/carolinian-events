"use client" // Add this at the top

import Link from "next/link";
import { Button } from "./ui/button";
import { UserButton, useUser } from "@clerk/nextjs"; // Changed from currentUser to useUser
import { ModeToggle } from "./mode-toggle";
import { Skeleton } from "./ui/skeleton"; // For loading state

export function Header() { // Removed async
  const { isLoaded, isSignedIn } = useUser(); // Client-side hook

  return (
    <header className="border-b">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="font-bold">
          Carolinian Events
        </Link>
        
        <nav className="flex items-center gap-4">
          <Link href="/events">Events</Link>
          {isSignedIn && <Link href="/create-event">Create Event</Link>}
          
          <div className="flex items-center gap-4">
            <ModeToggle />
            {!isLoaded ? (
              // Loading state
              <div className="flex gap-2">
                <Skeleton className="h-10 w-24 rounded-md" />
                <Skeleton className="h-10 w-24 rounded-md" />
              </div>
            ) : isSignedIn ? (
              <UserButton afterSignOutUrl="/" />
            ) : (
              <div className="flex gap-2">
                <Button asChild variant="outline">
                  <Link href="/sign-in">Sign In</Link>
                </Button>
                <Button asChild>
                  <Link href="/sign-up">Sign Up</Link>
                </Button>
              </div>
            )}
          </div>
        </nav>
      </div>
    </header>
  )
}