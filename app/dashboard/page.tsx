import { getCurrentOrganizer } from "@/lib/auth"
import { connectToDatabase } from "@/lib/database/connect"
import Event from "@/lib/database/models/event.model"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function DashboardPage() {
  const user = await getCurrentOrganizer()
  if (!user) return <p className="text-center py-12">Unauthorized</p>

  await connectToDatabase()
  const events = await Event.find({ user: user._id }).lean()

  return (
    <main className="max-w-4xl mx-auto py-10 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Events</h1>
        <Button asChild>
          <Link href="/create-event">Create New</Link>
        </Button>
      </div>

      {events.length > 0 ? (
  <ul className="grid gap-6">
    {events.map((event) => (
      <li
        key={event._id?.toString()}
        className="border rounded-md p-4 flex justify-between items-center"
      >
        {/* LEFT: Event Info */}
        <div>
          <h2 className="font-semibold">{event.title}</h2>
          <p className="text-sm text-muted-foreground">
            {new Date(event.startDateTime).toLocaleString()}
          </p>
        </div>

        {/* RIGHT: Buttons */}
        <div className="flex gap-2">
          <Button asChild size="sm" variant="outline">
            <Link href={`/dashboard/edit/${event._id}`}>Edit</Link>
          </Button>

          {/* ✅ DELETE BUTTON HERE */}
          <form action={`/api/events/delete`} method="POST">
            <input
              type="hidden"
              name="eventId"
              value={(event._id as string | number | { toString(): string }).toString()}
            />
            <Button type="submit" size="sm" variant="destructive">
              Delete
            </Button>
          </form>
        </div>
      </li>
    ))}
  </ul>
) : (
  <p className="text-muted-foreground text-center py-10">
    No events created yet.
  </p>
)}

    </main>
  )
}
