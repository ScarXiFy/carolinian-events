"use server"

import { connectToDatabase } from "@/lib/database/connect"
import Event from "@/lib/database/models/event.model"
import User from "@/lib/database/models/user.model"
import Category from "@/lib/database/models/category.model"
import { getCurrentOrganizer } from "@/lib/auth"
import { CreateEventParams, IEvent } from "@/lib/types"
import { revalidatePath } from "next/cache"
import { FilterQuery } from "mongoose"

// Create Event
export async function createEvent(eventData: CreateEventParams) {
  try {
    await connectToDatabase()

    const user = await getCurrentOrganizer()
    if (!user) throw new Error("User not found")

    const newEvent = await Event.create({
      ...eventData,
      organizer: user._id,
      startDateTime: new Date(eventData.startDateTime),
      endDateTime: new Date(eventData.endDateTime),
    })

    const populatedEvent = await Event.findById(newEvent._id)
      .populate("organizer", "firstName lastName organization")
      .lean()

    revalidatePath("/events")
    revalidatePath("/my-events")
    return JSON.parse(JSON.stringify(populatedEvent))
  } catch (error) {
    console.error("Error creating event:", error)
    throw error
  }
}

// Get All Events with Filters
export async function getAllEvents({
  query = '',
  category = '',
  tag = '',
  filter = 'all'
}: {
  query?: string
  category?: string
  tag?: string
  filter?: string
} = {}): Promise<IEvent[]> {
  try {
    await connectToDatabase()
    const conditions: FilterQuery<IEvent> = {}

    if (query) conditions.$text = { $search: query }

    if (category) {
      const categoryDoc = await Category.findOne({ name: category })
      if (categoryDoc) conditions.category = categoryDoc._id
    }

    if (tag) conditions.tags = tag

    const now = new Date()
    if (filter === 'upcoming') conditions.startDateTime = { $gte: now }
    else if (filter === 'past') conditions.endDateTime = { $lt: now }
    else if (filter === 'free') conditions.isFree = true

    const events = await Event.find(conditions)
      .populate("organizer", "firstName lastName")
      .populate("category", "name")
      .sort({ startDateTime: 'asc' })
      .lean()

    return JSON.parse(JSON.stringify(events))
  } catch (error) {
    console.error("Error fetching events:", error)
    throw new Error("Failed to fetch events")
  }
}

// Get Events Created by the Logged-In User
export async function getUserEvents(
  clerkUserId: string,
  {
    query = '',
    filter = 'all'
  }: {
    query?: string
    filter?: string
  } = {}
): Promise<IEvent[]> {
  try {
    await connectToDatabase()

    const user = await User.findOne({ clerkId: clerkUserId })
    if (!user) return []

    const conditions: FilterQuery<IEvent> = { organizer: user._id }
    if (query) conditions.$text = { $search: query }

    const now = new Date()
    if (filter === 'upcoming') conditions.startDateTime = { $gte: now }
    else if (filter === 'past') conditions.endDateTime = { $lt: now }
    else if (filter === 'draft') conditions.isPublished = false

    const events = await Event.find(conditions)
      .populate("organizer", "firstName lastName organization")
      .populate("category", "name")
      .sort({ startDateTime: 'asc' })
      .lean()

    return JSON.parse(JSON.stringify(events))
  } catch (error) {
    console.error("Error fetching user events:", error)
    throw error
  }
}

// Update Event
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
    if (!organizer) throw new Error("Organizer not found")

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
    revalidatePath("/my-events")

    return { success: true, event: JSON.parse(JSON.stringify(event)) }
  } catch (error) {
    console.error("updateEvent error:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "Update failed",
    }
  }
}

// Delete Event
export async function deleteEvent(eventId: string) {
  try {
    await connectToDatabase()
    const organizer = await getCurrentOrganizer()
    if (!organizer) throw new Error("Unauthorized: Organizer not found.")

    const event = await Event.findById(eventId)
    if (!event) throw new Error("Event not found.")

    if (event.organizer.toString() !== organizer._id.toString()) {
      throw new Error("You can only delete events you created.")
    }

    await Event.findByIdAndDelete(eventId)
    revalidatePath("/events")
    revalidatePath("/my-events")

    return { success: true }
  } catch (err) {
    console.error("deleteEvent error:", err)
    return { success: false, message: err instanceof Error ? err.message : "Failed to delete event." }
  }
}

export async function getEventById(eventId: string) {
  try {
    await connectToDatabase()
    
    const event = await Event.findById(eventId).populate('category')

    if (!event) return null

    return {
      ...event.toObject(),
      _id: event._id.toString(),
      startDateTime: new Date(event.startDateTime),
      endDateTime: new Date(event.endDateTime),
    }
  } catch (error) {
    console.error('Error getting event:', error)
    return null
  }
}