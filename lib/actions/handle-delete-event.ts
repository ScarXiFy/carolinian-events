// app/actions/handle-delete-event.ts
"use server"

import { deleteEvent } from "@/lib/actions/event.actions"

export async function handleDeleteEvent(formData: FormData) {
  const eventId = formData.get("eventId")?.toString()
  if (!eventId) return
  await deleteEvent(eventId)
}