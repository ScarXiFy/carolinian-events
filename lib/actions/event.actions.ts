"use server"

import { connectToDatabase } from "@/lib/database/connect"
import Event from "@/lib/database/models/event.model"
import User from "@/lib/database/models/user.model"
import { CreateEventParams } from "@/lib/types"

export async function createEvent(event: CreateEventParams) {
  try {
    await connectToDatabase()

    const organizer = await User.findOne({ clerkId: event.organizer })
    if (!organizer) throw new Error("Organizer not found")

    const newEvent = await Event.create({
      ...event,
      organizer: organizer._id,
    })

    return JSON.parse(JSON.stringify(newEvent))
  } catch (error) {
    console.error(error)
    throw error
  }
}