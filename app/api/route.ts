// app/api/events/route.ts
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/database/connect";
import Event from "@/lib/database/models/event.model"; // Your Mongoose model
// GET all events
export async function GET() {
  try {
    await connectToDatabase(); // Use Mongoose connection
    const events = await Event.find({}); // Mongoose query
    return NextResponse.json(events);
  } catch (error) {
    console.error("GET Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 }
    );
  }
}

// CREATE a new event
export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const data = await request.json();
    const newEvent = await Event.create(data); // Mongoose create
    return NextResponse.json(newEvent, { status: 201 });
  } catch (error) {
    console.error("POST Error:", error);
    return NextResponse.json(
      { error: "Failed to create event" },
      { status: 500 }
    );
  }
}