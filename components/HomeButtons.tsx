// components/HomeButtons.tsx
"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useUser } from "@clerk/nextjs"

export function HomeButtons() {
  const { isSignedIn } = useUser()

  return (
    <div className="flex w-full items-center justify-center space-x-4 py-4 md:pb-10">
      {isSignedIn ? (
        <Button asChild>
          <Link href="/create-event">Create Your Event</Link>
        </Button>
      ) : (
        <Button asChild>
          <Link href="/sign-in">Get Started</Link>
        </Button>
      )}
      <Button variant="outline" asChild>
        <Link href="/events">Browse Events</Link>
      </Button>
    </div>
  )
}