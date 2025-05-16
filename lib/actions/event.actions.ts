"use server"

import { connectToDatabase } from "@/lib/database/connect"
import Event from "@/lib/database/models/event.model"
import User from "@/lib/database/models/user.model"
import { CreateEventParams, IEvent } from "@/lib/types"
import { revalidatePath } from "next/cache"
import { getCurrentOrganizer } from "@/lib/auth"

export async function createEvent(event: CreateEventParams): Promise<IEvent> {
  try {
    await connectToDatabase()

    // Improved organizer lookup with better error details
    const organizer = await getCurrentOrganizer();
    
    if (!organizer) {
      console.error(`Organizer not found for clerkId: ${event.organizer}`)
      throw new Error(
        `Organizer account not found. Please ensure you're signed in with the correct account.`
      )
    }

    // Validate dates
    const startDateTime = new Date(event.startDateTime)
    const endDateTime = new Date(event.endDateTime)
    
    if (isNaN(startDateTime.getTime())) {
      throw new Error("Invalid start date format")
    }
    if (isNaN(endDateTime.getTime())) {
      throw new Error("Invalid end date format")
    }

    // Create the event
    const newEvent = await Event.create({
      ...event,
      startDateTime,
      endDateTime,
      organizer: organizer._id,
      imageUrl: event.imageUrl,
    })

    revalidatePath("/events")
    return JSON.parse(JSON.stringify(newEvent))
  } catch (error) {
    console.error("Detailed error creating event:", {
      error,
      eventData: {
        ...event,
        organizer: event.organizer,
        startDateTime: event.startDateTime,
        endDateTime: event.endDateTime
      }
    })
    
    throw new Error(
      error instanceof Error ? 
      error.message : 
      "Failed to create event. Please check your input and try again."
    )
  }
}

export async function getAllEvents(): Promise<IEvent[]> {
  try {
    await connectToDatabase()
    const events = await Event.find().populate({
      path: 'organizer',
      model: User,
      select: '_id firstName lastName'
    }).lean()
    
    return JSON.parse(JSON.stringify(events))
  } catch (error) {
    console.error("Error fetching events:", error)
    throw new Error("Failed to fetch events")
  }
}

export async function deleteEvent(eventId: string) {
  try {
    await connectToDatabase()
    const organizer = await getCurrentOrganizer()

    if (!organizer) {
      throw new Error("Unauthorized: Organizer not found.")
    }

    const event = await Event.findById(eventId)

    if (!event) {
      throw new Error("Event not found.")
    }

    // Check ownership
    if (event.organizer.toString() !== organizer._id.toString()) {
      throw new Error("You can only delete events you created.")
    }

    await Event.findByIdAndDelete(eventId)
    revalidatePath("/events")

    return { success: true }
  } catch (err) {
    console.error("deleteEvent error:", err)
    return { success: false, message: err instanceof Error ? err.message : "Failed to delete event." }
  }
}
interface UpdateEventParams {
  eventId: string
  title: string
  description: string
  location: string
  startDateTime: string
  endDateTime: string
  imageUrl: string
  category: string
  price?: string
  isFree?: boolean
}

export async function updateEvent(data: UpdateEventParams) {
  try {
    await connectToDatabase()
    const organizer = await getCurrentOrganizer()
    if (!organizer) throw new Error("Unauthorized")

    const event = await Event.findById(data.eventId)
    if (!event) throw new Error("Event not found")

    if (event.organizer.toString() !== organizer._id.toString()) {
      throw new Error("You can only edit your own events")
    }

    const startDateTime = new Date(data.startDateTime)
    const endDateTime = new Date(data.endDateTime)

    if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
      throw new Error("Invalid date format")
    }

    Object.assign(event, {
      ...data,
      startDateTime,
      endDateTime,
    })

    await event.save()
    revalidatePath("/events")

    return { success: true, event: JSON.parse(JSON.stringify(event)) }
  } catch (error) {
    console.error("updateEvent error:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "Update failed",
    }
  }
}

