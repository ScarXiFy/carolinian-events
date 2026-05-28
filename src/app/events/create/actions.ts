"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { parseEventFormData } from "@/lib/event-form-data.mjs";
import { saveEventImageFile } from "@/lib/event-image-upload.mjs";
import { createEvent } from "@/lib/event-store.mjs";
import { EVENTS_PATH, LOGIN_PATH } from "@/lib/auth-navigation";

export async function createEventAction(formData: FormData) {
  const session = await auth();

  if (!session) {
    redirect(LOGIN_PATH);
  }

  if (session.user?.role !== "Organizer") {
    redirect(EVENTS_PATH);
  }

  const input = parseEventFormData(formData, new Date(), {
    requireImage: true,
    requireParticipantLimit: true,
  });
  const eventImagePath = await saveEventImageFile(input.imageFile);
  const result = await createEvent({
    ...input,
    eventImagePath,
  });

  revalidatePath("/");
  revalidatePath("/events");

  if (result.mode === "database" && result.id) {
    revalidatePath(`/events/${result.id}`);
    redirect(`/events/${result.id}?created=1`);
  }

  redirect("/events?created=preview");
}
