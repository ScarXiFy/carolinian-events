import { notFound, redirect } from "next/navigation"
import { connectToDatabase } from "@/lib/database/connect"
import Event from "@/lib/database/models/event.model"
import { updateEvent } from "@/lib/actions/event.actions"
import { Button } from "@/components/ui/button"

interface EventType {
  _id: string
  title: string
  description: string
  location: string
  startDateTime: string | Date
  endDateTime: string | Date
  imageUrl: string
  category?: string
  price?: string
  isFree: boolean
}

// ✅ Server action at the module level
export async function handleUpdateEvent(formData: FormData) {
  "use server"

  const data = {
    eventId: formData.get("eventId") as string,
    title: formData.get("title") as string,
    description: formData.get("description") as string,
    location: formData.get("location") as string,
    startDateTime: formData.get("startDateTime") as string,
    endDateTime: formData.get("endDateTime") as string,
    imageUrl: formData.get("imageUrl") as string,
    category: formData.get("category") as string,
    price: formData.get("price") as string,
    isFree: formData.get("isFree") === "on",
  }

  await updateEvent(data)
  redirect("/dashboard")
}

// ✅ Page component
export default async function EditEventPage({ params }: { params: { id: string } }) {
  await connectToDatabase()
  const event = await Event.findById(params.id).lean() as EventType | null
  if (!event || Array.isArray(event)) return notFound()

  return (
    <main className="max-w-3xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-6">Edit Event</h1>

      <form action={handleUpdateEvent} className="space-y-4">
        <input type="hidden" name="eventId" value={event._id.toString()} />

        <div>
          <label className="block font-medium mb-1">Title</label>
          <input
            type="text"
            name="title"
            defaultValue={event.title}
            className="w-full border p-2 rounded"
            required
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Description</label>
          <textarea
            name="description"
            defaultValue={event.description}
            rows={5}
            className="w-full border p-2 rounded"
            required
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Location</label>
          <input
            type="text"
            name="location"
            defaultValue={event.location}
            className="w-full border p-2 rounded"
            required
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Start Date & Time</label>
          <input
            type="datetime-local"
            name="startDateTime"
            defaultValue={new Date(event.startDateTime).toISOString().slice(0, 16)}
            className="w-full border p-2 rounded"
            required
          />
        </div>

        <div>
          <label className="block font-medium mb-1">End Date & Time</label>
          <input
            type="datetime-local"
            name="endDateTime"
            defaultValue={new Date(event.endDateTime).toISOString().slice(0, 16)}
            className="w-full border p-2 rounded"
            required
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Image URL</label>
          <input
            type="text"
            name="imageUrl"
            defaultValue={event.imageUrl}
            className="w-full border p-2 rounded"
            required
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Category ID</label>
          <input
            type="text"
            name="category"
            defaultValue={event.category || ""}
            className="w-full border p-2 rounded"
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Price</label>
          <input
            type="text"
            name="price"
            defaultValue={event.price || ""}
            className="w-full border p-2 rounded"
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            name="isFree"
            defaultChecked={event.isFree}
            className="h-4 w-4"
          />
          <label>Free Event</label>
        </div>

        <Button type="submit" className="mt-4">
          Update Event
        </Button>
      </form>
    </main>
  )
}
