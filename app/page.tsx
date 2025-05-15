import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function Home() {
  return (
    <div className="container relative">
      <section className="mx-auto flex max-w-[980px] flex-col items-center gap-2 py-8 md:py-12 md:pb-8 lg:py-24 lg:pb-20">
        <h1 className="text-center text-3xl font-bold leading-tight tracking-tighter md:text-6xl lg:leading-[1.1]">
          Discover & Create Amazing Events
        </h1>
        <p className="max-w-[750px] text-center text-lg text-muted-foreground sm:text-xl">
          Carolinian Events helps you find, manage, and create events in your community. Join us today!
        </p>
        <div className="flex w-full items-center justify-center space-x-4 py-4 md:pb-10">
          <Button asChild>
            <Link href="/sign-in">Get Started</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/events">Browse Events</Link>
          </Button>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Find Events</CardTitle>
            <CardDescription>Discover exciting events near you</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Browse through hundreds of events happening in your area.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Create Events</CardTitle>
            <CardDescription>Host your own events</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Easily create and manage your own events with our simple tools.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Connect</CardTitle>
            <CardDescription>Meet new people</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Connect with like-minded individuals in your community.</p>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}