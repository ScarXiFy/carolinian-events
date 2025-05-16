import { currentUser } from "@clerk/nextjs/server";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getUserEvents } from "@/lib/actions/event.actions"; // You'll need to create this
import EventCard from "@/components/EventCard";

export default async function MyEventsPage() {
  const user = await currentUser();
  if (!user) return null; // Or redirect to sign-in

  const events = await getUserEvents(user.id); // Fetch events for this user

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Events</h1>
        <Button asChild>
          <Link href="/create-event">Create New Event</Link>
        </Button>
      </div>

      {/* Events Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.length > 0 ? (
                events.map((event) => (
                  <EventCard
                    key={event._id.toString()}
                    event={{
                      ...event,
                      _id: event._id.toString(),
                      startDateTime: new Date(event.startDateTime),
                      endDateTime: new Date(event.endDateTime),
                    }}
                  />
                ))
              ) : (
                <div className="col-span-full text-center text-muted-foreground py-12">
                  No events found.
                </div>
              )}
            </div>
    </div>
  );
}