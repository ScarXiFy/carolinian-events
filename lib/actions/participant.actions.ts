'use server'

import { connectToDatabase } from "@/lib/database/connect"
import Event from "@/lib/database/models/event.model"
import Participant from "@/lib/database/models/participant.model"
import { revalidatePath } from "next/cache"

export async function joinEvent({
  eventId,
  firstName,
  lastName,
  email,
  department,
}: {
  eventId: string
  firstName: string
  lastName: string
  email: string
  department: string
}) {
  try {
    await connectToDatabase()

    const event = await Event.findById(eventId)
    if (!event) throw new Error("Event not found")

    let participant = await Participant.findOne({ email })

    if (participant && participant.joinedEvents.includes(eventId)) {
      throw new Error("You have already joined this event.")
    }

    if (!participant) {
      participant = await Participant.create({
        firstName,
        lastName,
        email,
        department,
        joinedEvents: [eventId],
      })
    } else {
      participant.joinedEvents.push(eventId)
      await participant.save()
    }

    // Add user to event.joinedUsers if not already added
    if (!event.joinedUsers.includes(participant._id)) {
      event.joinedUsers.push(participant._id)
      await event.save()
    }

    revalidatePath("/events")
    return { success: true }
  } catch (error) {
    console.error("joinEvent error:", error)
    return { success: false, message: error instanceof Error ? error.message : "Something went wrong" }
  }
}
