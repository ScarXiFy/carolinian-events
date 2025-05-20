// app/actions/event.actions.ts
'use server'

import { connectToDatabase } from "@/lib/database/connect"
import Event from "@/lib/database/models/event.model"
import Participant from "@/lib/database/models/participant.model"
import { revalidatePath } from "next/cache"
import { sendEventRegistrationEmail } from "@/lib/utils/send-email"

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

    // Validate required fields
    if (!eventId || !firstName || !lastName || !email || !department) {
      throw new Error("All fields are required")
    }

    // Basic email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error("Please enter a valid email address")
    }

    // Find event and ensure it exists
    const event = await Event.findById(eventId)
    if (!event) {
      throw new Error("Event not found")
    }

    // Check if this email is already registered for this event
    const existingParticipant = await Participant.findOne({
      email,
      joinedEvents: eventId
    })

    if (existingParticipant) {
      throw new Error("This email is already registered for this event")
    }

    // Create or update participant
    const participant = await Participant.findOneAndUpdate(
      { email },
      {
        $set: {
          firstName,
          lastName,
          department,
        },
        $addToSet: { joinedEvents: eventId } // Only add if not already present
      },
      { upsert: true, new: true }
    )

    // Update event with new participant
    await Event.findByIdAndUpdate(
      eventId,
      {
        $addToSet: { participants: participant._id }
      },
      { new: true }
    )

    // Send confirmation email
    const emailResult = await sendEventRegistrationEmail({
      email,
      firstName,
      lastName,
      eventName: event.title,
      eventLocation: event.location || 'TBA',
      startDateTime: event.startDateTime,
      endDateTime: event.endDateTime,
      price: event.price || "0",
      isFree: event.isFree || false,
      description: event.description || "",
      tags: event.tags || [],
      maxRegistrations: event.maxRegistrations || undefined,
    })

    if (!emailResult.success) {
      console.error('Failed to send confirmation email:', emailResult.error)
      // Don't throw error here, as registration was successful
    }

    revalidatePath(`/events/${eventId}`)
    return { success: true }
  } catch (error) {
    console.error("joinEvent error:", error)
    return { 
      success: false, 
      message: error instanceof Error ? error.message : "Something went wrong" 
    }
  }
}