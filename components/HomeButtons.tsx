"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useUser } from "@clerk/nextjs"
import { motion } from "framer-motion"

export function HomeButtons() {
  const { isSignedIn } = useUser()

  return (
    <div className="flex flex-wrap justify-center gap-4 py-6">
      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
        <Button
          asChild
          className="rounded-2xl bg-[#fec425] text-black hover:bg-[#ffd859] shadow-md px-6 py-3 text-lg font-semibold transition duration-200"
        >
          <Link href={isSignedIn ? "/create-event" : "/sign-in"}>
            {isSignedIn ? "Create Your Event" : "Get Started"}
          </Link>
        </Button>
      </motion.div>

      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
        <Button
  variant="outline"
  asChild
  className="rounded-2xl border-[#fec425] text-black hover:border-black hover:text-black shadow-md px-6 py-3 text-lg font-semibold transition-colors duration-200"
>
  <Link href="/events">Browse Events</Link>
</Button>
      </motion.div>
    </div>
  )
}
