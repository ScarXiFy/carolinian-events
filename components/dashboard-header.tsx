"use client"

import { UserButton } from "@clerk/nextjs"

export function DashboardHeader() {
  return (
    <header className="border-b">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="text-lg font-semibold">Dashboard</div>
        <UserButton afterSignOutUrl="/" />
      </div>
    </header>
  )
}