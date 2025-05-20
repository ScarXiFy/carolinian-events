import { updateEventTagsToCategories } from "@/lib/actions/event.actions";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: { eventId: string } }
) {
  try {
    const event = await updateEventTagsToCategories(params.eventId);
    return NextResponse.json({ success: true, event });
  } catch (error) {
    console.error("Error in update-categories route:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update event" },
      { status: 500 }
    );
  }
} 