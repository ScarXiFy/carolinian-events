"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { parseEventFormData } from "@/lib/event-form-data.mjs";
import { saveEventImageFile } from "@/lib/event-image-upload.mjs";
import { getEventByRouteId, updateEvent } from "@/lib/event-store.mjs";
import { EVENTS_PATH, LOGIN_PATH } from "@/lib/auth-navigation";
import { canManageEvent } from "@/lib/permissions.mjs";

export async function updateEventAction(id: number, formData: FormData) {
  const session = await auth();

  if (!session) {
    redirect(LOGIN_PATH);
  }

  const event = await getEventByRouteId(id);

  if (!canManageEvent(session.user?.role, session.user.id, event)) {
    redirect(EVENTS_PATH);
  }

  const input = parseEventFormData(formData, new Date(), {
    requireParticipantLimit: true,
  });
  const eventImagePath = input.imageFile
    ? await saveEventImageFile(input.imageFile)
    : null;
  const result = await updateEvent(id, {
    ...input,
    eventImagePath,
  });

  revalidatePath("/");
  revalidatePath("/events");
  revalidatePath(`/events/${id}`);
  revalidatePath(`/events/${id}/edit`);

  if (result.mode === "database" && result.affectedRows > 0) {
    redirect(`/events/${id}?updated=1`);
  }

  redirect(`/events/${id}?updated=preview`);
}
