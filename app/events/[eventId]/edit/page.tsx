import { getEventById } from "@/lib/actions/event.actions"
import { getCurrentOrganizer } from "@/lib/auth"
import { CreateEventForm } from "@/components/create-event-form"
import { notFound, redirect } from "next/navigation"
import { updateEventWithId } from "@/lib/actions/update-event-id"
import { z } from "zod"
import { eventFormSchema } from "@/components/create-event-form"

interface EditEventPageProps {
  params: {
    eventId: string
  }
}

export default async function EditEventPage({ params }: EditEventPageProps) {
  try {
    const resolvedParams = await Promise.resolve(params);
    console.log("Fetching event with ID:", resolvedParams.eventId);
    
    const event = await getEventById(resolvedParams.eventId);
    if (!event) {
      console.error("Event not found:", resolvedParams.eventId);
      return notFound();
    }

    const organizer = await getCurrentOrganizer();
    if (!organizer) {
      console.error("Organizer not found");
      return redirect("/events");
    }

    if (!event.organizer || event.organizer._id !== organizer._id.toString()) {
      console.error("Unauthorized access attempt");
      return redirect("/events");
    }

    const handleUpdate = async (
      formData: z.infer<typeof eventFormSchema>
    ): Promise<void> => {
      "use server"

      const result = await updateEventWithId(resolvedParams.eventId, {
        ...formData,
        tags: formData.tags,
        startDateTime: formData.startDateTime,
        endDateTime: formData.endDateTime,
        organizers: [],
        contactEmail: "",
      });

      if (!result.success) {
        throw new Error(result.message || "Failed to update event");
      }
    };

    return (
      <section className="py-10">
        <h1 className="text-2xl font-bold mb-6">Edit Event</h1>
        <CreateEventForm
          event={{
            ...event,
            tags: event.category ? [event.category.name] : []
          }}
          onSubmit={handleUpdate}
        />
      </section>
    );
  } catch (error) {
    console.error("Error in EditEventPage:", error);
    return notFound();
  }
}

