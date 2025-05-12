import Link from "next/link"
import { Button } from "./ui/button"
import { ModeToggle } from "./mode-toggle"

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <span className="font-bold inline-block">Carolinian Events</span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <Link href="/events" className="transition-colors hover:text-foreground/80 text-foreground/60">
              Browse Events
            </Link>
            <Link href="/create-event" className="transition-colors hover:text-foreground/80 text-foreground/60">
              Create Event
            </Link>
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-2">
            <Button variant="ghost" asChild>
              <Link href="/sign-in">Sign In</Link>
            </Button>
            <Button asChild>
              <Link href="/sign-up">Sign Up</Link>
            </Button>
            <ModeToggle />
          </nav>
        </div>
      </div>
    </header>
  )
}