"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { deleteEvent } from "@/lib/event-store.mjs";

export async function deleteEventAction(id: number) {
  const result = await deleteEvent(id);

  revalidatePath("/");
  revalidatePath("/events");
  revalidatePath(`/events/${id}`);
  revalidatePath(`/events/${id}/delete`);

  if (result.mode === "database" && result.affectedRows > 0) {
    redirect("/events?deleted=1");
  }

  redirect("/events?deleted=preview");
}
