// app/actions/handle-delete-event.ts
"use server"

import { deleteEvent } from "@/lib/actions/event.actions"
import { getCurrentOrganizer } from "@/lib/auth"

export async function handleDeleteEvent(formData: FormData) {
  try {
    const organizer = await getCurrentOrganizer()
    if (!organizer) {
      return { 
        success: false, 
        message: "Unauthorized: Please sign in to delete events",
        redirect: "/sign-in"
      }
    }

    const eventId = formData.get("eventId")?.toString()
    if (!eventId) {
      throw new Error("Event ID is required")
    }

    const result = await deleteEvent(eventId)
    if (!result.success) {
      throw new Error(result.message || "Failed to delete event")
    }

    return { success: true }
  } catch (error) {
    console.error("Error deleting event:", error)
    return { 
      success: false, 
      message: error instanceof Error ? error.message : "Failed to delete event" 
    }
  }
}