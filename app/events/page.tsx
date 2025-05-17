// app/events/page.tsx
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
  const searchQuery = searchParams?.query as string || ''
  const category = searchParams?.category as string || ''
  const filter = searchParams?.filter as string || 'all'

  const [events, categories] = await Promise.all([
    getAllEvents({ query: searchQuery, category, filter }),
    getAllCategories()
  ])
  
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

      {/* Search and Filters */}
      <div className="mb-8 space-y-4">
        <SearchEvents defaultValue={searchQuery} />
        
        <EventsFilter>
  {categories.map((cat) => {
    // Ensure the category has a valid name
    const categoryValue = cat.name?.trim() || cat._id.toString();
    if (!categoryValue) {
      console.error('Invalid category:', cat);
      return null; // Skip invalid categories
    }

    return (
      <SelectItem 
        key={cat._id.toString()} 
        value={categoryValue}
      >
        {cat.name}
      </SelectItem>
    );
  })}
</EventsFilter>

      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
          <div className="col-span-full text-center text-muted-foreground py-12">
            No events found. Try adjusting your search or filters.
          </div>
        )}
      </div>
    </div>
  )
}