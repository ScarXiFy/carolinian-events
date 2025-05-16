'use server'

import { connectToDatabase } from "@/lib/database/connect"
import Participant from "@/lib/database/models/participant.model"
import Event from "@/lib/database/models/event.model"
import { revalidatePath } from "next/cache"

export async function leaveEvent({
  email,
  eventId,
}: {
  email: string
  eventId: string
}) {
  try {
    await connectToDatabase()

    const participant = await Participant.findOne({ email })

    if (!participant) {
      throw new Error("No participant found with this email.")
    }

    // Check if they joined the event
    if (!participant.joinedEvents.includes(eventId)) {
      throw new Error("You have not joined this event.")
    }

    // Remove event from user's list
    participant.joinedEvents = participant.joinedEvents.filter(
      (id: string) => id.toString() !== eventId
    )
    await participant.save()

    // Remove user from event's participants list
    await Event.findByIdAndUpdate(eventId, {
      $pull: { participants: participant._id },
    })

    revalidatePath("/events")

    return { success: true }
  } catch (error) {
    console.error("leaveEvent error:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "Could not remove application",
    }
  }
}
