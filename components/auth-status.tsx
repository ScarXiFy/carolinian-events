"use client"

import { UserButton, useUser } from "@clerk/nextjs"
import { Button } from "./ui/button"
import Link from "next/link"
import { ModeToggle } from "./mode-toggle"

export function AuthStatus() {
  const { isLoaded, isSignedIn } = useUser()

  if (!isLoaded) {
    return <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
  }

  return (
    <div className="flex items-center gap-4">
      <ModeToggle />
      {isSignedIn ? (
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
  )
}