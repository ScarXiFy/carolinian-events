import { Button } from "@/components/ui/button"
import EventCard from "@/components/EventCard"
import { getAllEvents } from "@/lib/actions/event.actions"
import Link from "next/link"
import { currentUser } from "@clerk/nextjs/server"

export default async function BrowseEvents() {
  const events = await getAllEvents()
  const user = await currentUser()

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Browse Events</h1>
        <Button asChild>
          <Link href={user ? "/create-event" : "/sign-in?redirect_url=/create-event"}>
            Create Event
          </Link>
        </Button>
      </div>

      {/* Filters will go here */}
      <div className="mb-6">
        <div className="flex gap-2">
          <Button variant="outline">All</Button>
          <Button variant="outline">Upcoming</Button>
          <Button variant="outline">Past</Button>
          <Button variant="outline">Free</Button>
        </div>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event) => (
          <EventCard 
            key={event._id.toString()}
            event={{
              ...event,
              _id: event._id.toString(),
              startDateTime: new Date(event.startDateTime).toISOString(),
              endDateTime: new Date(event.endDateTime).toISOString(),
            }} 
          />
        ))}
      </div>
    </div>
  )
}