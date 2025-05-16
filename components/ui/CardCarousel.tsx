'use client'

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronLeft, ChevronRight } from "lucide-react"

const cards = [
  {
    title: "Find Events",
    description: "Discover exciting events near you",
    content: "Browse through events happening in the Carolinian Community.",
  },
  {
    title: "Create Events",
    description: "Host your own events",
    content: "Easily create and manage your own events with our simple tools.",
  },
  {
    title: "Connect",
    description: "Meet new people",
    content: "Connect with like-minded individuals in your community.",
  },
]

export default function CardCarousel() {
  const [index, setIndex] = useState(0)
  const [fade, setFade] = useState(true)

  const next = () => {
    setFade(false)
    setTimeout(() => {
      setIndex((prev) => (prev + 1) % cards.length)
      setFade(true)
    }, 150)
  }

  const prev = () => {
    setFade(false)
    setTimeout(() => {
      setIndex((prev) => (prev - 1 + cards.length) % cards.length)
      setFade(true)
    }, 150)
  }

  const goTo = (i: number) => {
    setFade(false)
    setTimeout(() => {
      setIndex(i)
      setFade(true)
    }, 150)
  }

  useEffect(() => {
    const interval = setInterval(next, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative mx-auto max-w-2xl px-4 pb-20">
      {/* Card with fade animation */}
      <div
        className={`rounded-3xl shadow-lg bg-white px-8 py-10 transition-all duration-500 ease-in-out ${
          fade ? "opacity-100 scale-100" : "opacity-0 scale-95"
        }`}
      >
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl font-semibold text-yellow-700">{cards[index].title}</CardTitle>
          <CardDescription className="text-md text-gray-500">{cards[index].description}</CardDescription>
        </CardHeader>
        <CardContent className="text-gray-700 text-base">{cards[index].content}</CardContent>
      </div>

      {/* Arrows */}
      <button
        onClick={prev}
        className="absolute left-0 top-1/2 -translate-y-1/2 rounded-full p-2 text-yellow-700 hover:bg-yellow-100"
        aria-label="Previous"
      >
        <ChevronLeft size={28} />
      </button>
      <button
        onClick={next}
        className="absolute right-0 top-1/2 -translate-y-1/2 rounded-full p-2 text-yellow-700 hover:bg-yellow-100"
        aria-label="Next"
      >
        <ChevronRight size={28} />
      </button>

      {/* Dot Indicators */}
      <div className="mt-6 flex justify-center gap-2">
        {cards.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={`h-2.5 w-2.5 rounded-full transition-all duration-300 ${
              i === index ? "bg-yellow-600 scale-110" : "bg-yellow-300 opacity-60"
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  )
}
