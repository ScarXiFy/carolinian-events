"use server";

import dbConnect from "@/lib/db";
import Registration from "@/lib/database/models/registration.model"; // You'll need to create this model
import { revalidatePath } from "next/cache";

export async function registerForEvent(eventId: string, userId: string) {
  try {
    await dbConnect();

    // Check if user is already registered
    const existingRegistration = await Registration.findOne({
      event: eventId,
      user: userId,
    });

    if (existingRegistration) {
      return { error: "You're already registered for this event" };
    }

    // Create new registration
    await Registration.create({
      event: eventId,
      user: userId,
      registeredAt: new Date(),
    });

    // Revalidate the event page to show updated registration status
    revalidatePath(`/events/${eventId}`);

    return { success: true };
  } catch (error) {
    console.error("Registration error:", error);
    return { error: "Failed to register for event" };
  }
}