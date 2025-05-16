"use client"

import Link from "next/link";
import { Button } from "./ui/button";
import { UserButton, useUser } from "@clerk/nextjs";
import { Skeleton } from "./ui/skeleton";

export function Header() {
  const { isLoaded, isSignedIn } = useUser();

  return (
    <header className="border-b bg-white dark:bg-black w-full">
      <div className="w-full flex items-center justify-between px-4 py-3">

        {/* LEFT SIDE: Carolinian Events */}
        <Link href="/" className="font-bold text-xl hover:opacity-80 transition">
          Carolinian Events
        </Link>

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
      </div>
    </header>
  );
}
