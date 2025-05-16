import { getAllEvents } from '@/lib/actions/event.actions'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const events = await getAllEvents()
    return NextResponse.json(events)
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
}