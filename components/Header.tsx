"use client"

import Link from "next/link"
import { Button } from "./ui/button"
import { UserButton, useUser } from "@clerk/nextjs"
import { ModeToggle } from "./mode-toggle"

export function Header() {
  const { isLoaded, isSignedIn } = useUser()

  return (
    <header className="border-b">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="font-bold">
          Carolinian Events
        </Link>
        
        <nav className="flex items-center gap-4">
          <Link href="/events">Events</Link>
          
          <div className="flex items-center gap-4">
            <ModeToggle />
            {!isLoaded ? (
              <div className="flex gap-2">
                <Button variant="outline" disabled>Loading...</Button>
              </div>
            ) : isSignedIn ? (
              <>
                <Button asChild variant="ghost">
                  <Link href="/dashboard">Dashboard</Link>
                </Button>
                <UserButton afterSignOutUrl="/" />
              </>
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