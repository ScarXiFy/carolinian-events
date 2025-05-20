'use client'

import { Button } from "@/components/ui/button"
import { handleDeleteEvent } from "@/lib/actions/handle-delete-event"
import { useRouter } from "next/navigation"

export function DeleteEventForm({ eventId }: { eventId: string }) {
  const router = useRouter()

  async function handleSubmit(formData: FormData) {
    const result = await handleDeleteEvent(formData)
    if (result.redirect) {
      router.push(result.redirect)
    } else if (result.success) {
      router.refresh()
    }
  }

  return (
    <form action={handleSubmit}>
      <input type="hidden" name="eventId" value={eventId} />
      <Button size="sm" variant="destructive" type="submit">
        Delete
      </Button>
    </form>
  )
} 