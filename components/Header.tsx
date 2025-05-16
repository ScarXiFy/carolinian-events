"use client"

<<<<<<< HEAD
import Link from "next/link"
import { Button } from "./ui/button"
import { UserButton, useUser } from "@clerk/nextjs"
import { Moon, Sun, Monitor, ChevronDown } from "lucide-react"
import { useTheme } from "next-themes"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function Header() {
  const { isLoaded, isSignedIn } = useUser()
  const { theme, setTheme } = useTheme()

  const getThemeIcon = () => {
    switch (theme) {
      case "dark":
        return <Moon className="h-4 w-4" />
      case "system":
        return <Monitor className="h-4 w-4" />
      default:
        return <Sun className="h-4 w-4" />
    }
  }
=======
import Link from "next/link";
import { Button } from "./ui/button";
import { UserButton, useUser } from "@clerk/nextjs";
import { Skeleton } from "./ui/skeleton";

export function Header() {
  const { isLoaded, isSignedIn } = useUser();
>>>>>>> origin/jewels

  return (
    <header className="border-b bg-white dark:bg-black w-full">
      <div className="w-full flex items-center justify-between px-4 py-3">

        {/* LEFT SIDE: Carolinian Events */}
        <Link href="/" className="font-bold text-xl hover:opacity-80 transition">
          Carolinian Events
        </Link>
<<<<<<< HEAD
        
        <nav className="flex items-center gap-4">
          <div className="flex items-center gap-4">
            {!isLoaded ? (
              <div className="flex gap-2">
                <Button variant="outline" disabled>Loading...</Button>
              </div>
            ) : isSignedIn ? (
              <>
                <Button asChild variant="ghost">
                  <Link href="/my-events">My Events</Link>
                </Button>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="flex items-center gap-1"
                    >
                      {getThemeIcon()}
                      <ChevronDown className="h-3 w-3 opacity-50" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setTheme("light")}>
                      <Sun className="mr-2 h-4 w-4" />
                      Light
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setTheme("dark")}>
                      <Moon className="mr-2 h-4 w-4" />
                      Dark
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setTheme("system")}>
                      <Monitor className="mr-2 h-4 w-4" />
                      System
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                
                <UserButton afterSignOutUrl="/" />
              </>
            ) : (
              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="flex items-center gap-1"
                    >
                      {getThemeIcon()}
                      <ChevronDown className="h-3 w-3 opacity-50" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setTheme("light")}>
                      <Sun className="mr-2 h-4 w-4" />
                      Light
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setTheme("dark")}>
                      <Moon className="mr-2 h-4 w-4" />
                      Dark
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setTheme("system")}>
                      <Monitor className="mr-2 h-4 w-4" />
                      System
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                
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
=======

        {/* RIGHT SIDE: Sign In/User */}
        {!isLoaded ? (
          <Skeleton className="h-10 w-24 rounded-md" />
        ) : isSignedIn ? (
          <UserButton afterSignOutUrl="/" />
        ) : (
          <Button asChild variant="outline">
            <Link href="/sign-in">Sign In</Link>
          </Button>
        )}
>>>>>>> origin/jewels
      </div>
    </header>
  );
}
