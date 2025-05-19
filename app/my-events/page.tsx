import { currentUser } from "@clerk/nextjs/server"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { getUserEvents } from "@/lib/actions/event.actions"
import { handleDeleteEvent } from "@/lib/actions/handle-delete-event"
import EventCard from "@/components/EventCard"
import { SearchEvents } from "@/components/SearchEvents"
import { MyEventsFilter } from "@/components/MyEventsFilter"
import { IEvent } from "@/lib/types"

export default async function MyEventsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const params = await Promise.resolve(searchParams);
  const searchQuery = params?.query as string || '';
  const filter = params?.filter as string || 'all';

  const user = await currentUser();
  if (!user) return null;

  const events = await getUserEvents(user.id, { query: searchQuery, filter });

  return (
    <div className="container py-8">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-10 gap-4">
  <h1 className="text-4xl font-extrabold text-gray-900">My Events</h1>
  <div className="flex gap-3">
    <Button asChild size="lg" variant="outline">
      <Link href="/events">Browse Events</Link>
    </Button>
    <Button asChild size="lg" className="whitespace-nowrap">
      <Link href="/create-event">+ Create New Event</Link>
    </Button>
  </div>
</div>

      {/* Search and Filters */}
      <div className="mb-8 space-y-4">
        <SearchEvents defaultValue={searchQuery} />
        <MyEventsFilter />
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.length > 0 ? (
          events.map((event: IEvent) => (
            <div key={event._id.toString()} className="space-y-2">
              <EventCard
                event={{
                  ...event,
                  _id: event._id.toString(),
                  startDateTime: new Date(event.startDateTime),
                  endDateTime: new Date(event.endDateTime),
                  category: event.category && typeof event.category === "object" && "name" in event.category
                    ? {
                        _id: event.category._id.toString(),
                        name: (event.category as { name: string }).name
                      }
                    : undefined
                }}
              />
              <div className="flex gap-2 justify-end">
                <Button asChild size="sm" variant="outline">
                  <Link href={`/events/${event._id}/edit`}>Edit</Link>
                </Button>
                <form action={handleDeleteEvent}>
  <input type="hidden" name="eventId" value={event._id.toString()} />
  <Button size="sm" variant="destructive" type="submit">
    Delete
  </Button>
</form>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center text-muted-foreground py-12">
            No events found. Try adjusting your search or filters.
          </div>
        )}
      </div>
    </div>
  )
}
