import { getEventById } from "@/lib/actions/event.actions"
import { getCurrentOrganizer } from "@/lib/auth"
import { CreateEventForm } from "@/components/create-event-form"
import { notFound, redirect } from "next/navigation"
import { updateEventWithId, UpdateEventParams } from "@/lib/actions/update-event-id"

interface EditEventPageProps {
  params: {
    eventId: string
  }
}

export default async function EditEventPage({ params }: EditEventPageProps) {
  const event = await getEventById(params.eventId)
  const organizer = await getCurrentOrganizer()

  if (!event) return notFound()
  if (event.organizer._id.toString() !== organizer._id.toString()) {
    return redirect("/events")
  }

  const handleUpdate = async (
    formData: Omit<UpdateEventParams, "eventId" | "category"> & { categoryId: string }
  ): Promise<void> => {
    "use server"

    const fullForm: UpdateEventParams = {
      ...formData,
      startDateTime: formData.startDateTime,
      endDateTime: formData.endDateTime,
      category: formData.categoryId,
    }

    await updateEventWithId(params.eventId, fullForm)
  }

  return (
    <section className="py-10">
      <h1 className="text-2xl font-bold mb-6">Edit Event</h1>
      <CreateEventForm
        type="Edit"
        event={event}
        onSubmit={handleUpdate}
      />
    </section>
  )
}
