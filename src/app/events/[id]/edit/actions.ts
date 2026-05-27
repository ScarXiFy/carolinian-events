"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { parseEventFormData } from "@/lib/event-form-data.mjs";
import { updateEvent } from "@/lib/event-store.mjs";

export async function updateEventAction(id: number, formData: FormData) {
  const result = await updateEvent(id, parseEventFormData(formData));

  revalidatePath("/");
  revalidatePath("/events");
  revalidatePath(`/events/${id}`);
  revalidatePath(`/events/${id}/edit`);

  if (result.mode === "database" && result.affectedRows > 0) {
    redirect(`/events/${id}?updated=1`);
  }

  redirect(`/events/${id}?updated=preview`);
}
