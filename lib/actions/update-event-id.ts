"use server"

import { updateEvent } from "@/lib/actions/event.actions"

export interface UpdateEventParams {
  title: string
  description: string
  location: string
  imageUrl: string
  startDateTime: string
  endDateTime: string
  price: string
  isFree: boolean
  organizers: Array<{ name: string; socialMedia?: string }>
  sponsors?: Array<{ name: string; website?: string }>
  contactEmail: string
  contactPhone?: string
  maxAttendees?: number
  tags: string[]
  requirements?: string
  category: string | null
}

export async function updateEventWithId(eventId: string, formData: UpdateEventParams) {
  try {
    if (!formData.title || !formData.description || !formData.location) {
      throw new Error("Required fields are missing")
    }

    const startDate = new Date(formData.startDateTime)
    const endDate = new Date(formData.endDateTime)

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new Error("Invalid date format")
    }

    if (startDate >= endDate) {
      throw new Error("End date must be after start date")
    }

    const updateData = {
      eventId,
      ...formData,
      startDateTime: startDate.toISOString(),
      endDateTime: endDate.toISOString(),
      sponsors: formData.sponsors || [],
      tags: formData.tags || [],
      category: formData.category || null,
    }

    const result = await updateEvent(updateData)

    if (!result) {
      throw new Error("Failed to update event - no result returned")
    }

    return {
      success: true,
      message: "Event updated successfully",
      event: result,
    }
  } catch (error) {
    console.error("Failed to update event:", error)

    let message = "Failed to update event"
    if (error instanceof Error) message = error.message
    else if (typeof error === "string") message = error

    return {
      success: false,
      message,
      error: error instanceof Error ? error : new Error(message),
    }
  }
}
