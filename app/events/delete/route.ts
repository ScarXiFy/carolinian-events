import { NextRequest, NextResponse } from "next/server"
import { deleteEvent } from "@/lib/actions/event.actions"

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const eventId = formData.get("eventId") as string

  await deleteEvent(eventId)
  return NextResponse.redirect(new URL("/dashboard", req.url))
}
