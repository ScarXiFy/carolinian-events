import { getEventById } from "@/lib/actions/event.actions"
import { getCurrentOrganizer } from "@/lib/auth"
import { CreateEventForm } from "@/components/create-event-form"
import { notFound, redirect } from "next/navigation"
import { updateEventWithId } from "@/lib/actions/update-event-id"
import { getCategories } from "@/lib/actions/category.actions";
import { z } from "zod"
import { eventFormSchema } from "@/components/create-event-form"

interface EditEventPageProps {
  params: {
    eventId: string
  }
}

export default async function EditEventPage({ params }: EditEventPageProps) {
  const event = await getEventById(params.eventId)
  const organizer = await getCurrentOrganizer()
  const categories = await getCategories()

  if (!event) return notFound()
  if (event.organizer._id.toString() !== organizer._id.toString()) {
    return redirect("/events")
  }

  const handleUpdate = async (
    formData: z.infer<typeof eventFormSchema>
  ): Promise<void> => {
    "use server"

    await updateEventWithId(params.eventId, {
      ...formData,
      category: formData.categoryId ?? "",
      startDateTime: formData.startDateTime,
      endDateTime: formData.endDateTime,
    })
  }

  return (
    <section className="py-10">
      <h1 className="text-2xl font-bold mb-6">Edit Event</h1>
      <CreateEventForm
        event={{
          ...event,
          categoryId: event.category?._id || "" // Safe access to category _id
        }}
        categories={categories}
        onSubmit={handleUpdate}
      />
    </section>
  )
}

