import Link from "next/link";
import { Button } from "./ui/button";
import { UserButton } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";
import { ModeToggle } from "./mode-toggle"

export async function Header() {
  const user = await currentUser()

  return (
    <header className="border-b">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="font-bold">
          Carolinian Events
        </Link>
        
        <nav className="flex items-center gap-4">
          <Link href="/events">Events</Link>
          {user && <Link href="/create-event">Create Event</Link>}
          
          <div className="flex items-center gap-4">
            <ModeToggle />
            {user ? (
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