import { connectToDatabase } from "@/lib/database/connect"
import Event from "@/lib/database/models/event.model"
import { deleteEvent } from "@/lib/actions/event.actions"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"

export default async function DeleteEventPage({ params }: { params: { id: string } }) {
  await connectToDatabase()
  const event = await Event.findById(params.id).lean<{ _id: string; title: string }>()
  if (!event) return notFound()

  return (
    <main className="max-w-xl mx-auto py-12 px-4">
      <h1 className="text-2xl font-bold mb-4 text-red-600">Delete Event</h1>

      <p className="mb-6">
        Are you sure you want to delete the event <strong>{event.title}</strong>?
        This action cannot be undone.
      </p>

      <form action={async (formData: FormData) => {
        const eventId = formData.get("eventId") as string;
        await deleteEvent(eventId);
      }} method="POST" className="space-y-4">
        <input type="hidden" name="eventId" value={event._id.toString()} />

        <div className="flex gap-4">
          <Button variant="destructive" type="submit">
            Yes, Delete
          </Button>
          <Button variant="outline" asChild>
            <a href="/dashboard">Cancel</a>
          </Button>
        </div>
      </form>
    </main>
  )
}
