"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { parseEventFormData } from "@/lib/event-form-data.mjs";
import { createEvent } from "@/lib/event-store.mjs";

export async function createEventAction(formData: FormData) {
  const result = await createEvent(parseEventFormData(formData));

  revalidatePath("/");
  revalidatePath("/events");

  if (result.mode === "database" && result.id) {
    revalidatePath(`/events/${result.id}`);
    redirect(`/events/${result.id}?created=1`);
  }

  redirect("/events?created=preview");
}
