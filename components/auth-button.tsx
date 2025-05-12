'use client'

import { UserButton, useUser } from '@clerk/nextjs'
import { Button } from './ui/button'
import Link from 'next/link'
import { Skeleton } from './ui/skeleton'

export function AuthButton() {
  const { isLoaded, isSignedIn } = useUser()

  if (!isLoaded) {
    return <Skeleton className="h-10 w-24 rounded-md" />
  }

  return isSignedIn ? (
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
  )
}