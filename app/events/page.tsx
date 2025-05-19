import { Button } from "@/components/ui/button"
import EventCard from "@/components/EventCard"
import { getAllEvents } from "@/lib/actions/event.actions"
import Link from "next/link"
import { currentUser } from "@clerk/nextjs/server"
import { getAllCategories } from "@/lib/actions/category.actions"
import { IEvent } from "@/lib/types"
import { SearchEvents } from "@/components/SearchEvents"
import { EventsFilter } from "@/components/EventsFilter"
import { SelectItem } from "@radix-ui/react-select"

export default async function BrowseEvents({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const params = await Promise.resolve(searchParams);
  const searchQuery = params?.query as string || '';
  const category = params?.category as string || '';
  const filter = params?.filter as string || 'all';

  const [events, categories] = await Promise.all([
    getAllEvents({ query: searchQuery, category, filter }),
    getAllCategories()
  ]);
  
  const user = await currentUser();

  return (
    <div className="container py-10 max-w-7xl">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-10">
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100">
          Browse Events
        </h1>
        <Button
          asChild
          className="rounded-3xl border-yellow-400 bg-yellow-400 text-black hover:bg-yellow-500 hover:border-yellow-500 shadow-lg px-7 py-3 text-lg font-semibold transition-colors duration-300"
        >
          <Link href={user ? "/create-event" : "/sign-in?redirect_url=/create-event"}>
            Create Event
          </Link>
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="mb-10 grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-8 items-center">
        <SearchEvents defaultValue={searchQuery} />
        <EventsFilter>
          {categories.map((cat) => {
            const categoryValue = cat.name?.trim() || cat._id.toString()
            if (!categoryValue) return null
            return (
              <SelectItem key={cat._id.toString()} value={categoryValue}>
                {cat.name}
              </SelectItem>
            )
          })}
        </EventsFilter>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {events.length > 0 ? (
          events.map((event: IEvent) => (
            <EventCard
              key={event._id.toString()}
              event={{
                ...event,
                _id: event._id.toString(),
                startDateTime: new Date(event.startDateTime),
                endDateTime: new Date(event.endDateTime),
                category:
                  event.category && typeof event.category === "object" && "name" in event.category
                    ? {
                        _id: (event.category as { _id: string | { toString(): string } })._id.toString(),
                        name: (event.category as { name: string }).name
                      }
                    : undefined
              }}
            />
          ))
        ) : (
          <div className="col-span-full text-center text-muted-foreground py-20 text-xl font-semibold">
            No events found. Try adjusting your search or filters.
          </div>
        )}
      </div>
    </div>
  )
}
