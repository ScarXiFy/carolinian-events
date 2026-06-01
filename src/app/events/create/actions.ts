"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { parseEventFormData } from "@/lib/event-form-data.mjs";
import { validateStoredEventImageUrls } from "@/lib/event-image-upload.mjs";
import { createEvent } from "@/lib/event-store.mjs";
import { EVENTS_PATH, LOGIN_PATH } from "@/lib/auth-navigation";
import { canCreateEvents, ROLES } from "@/lib/permissions.mjs";
import { getRateLimitKey, RATE_LIMITS, requireRateLimit } from "@/lib/rate-limit.mjs";

export async function createEventAction(formData: FormData) {
  const session = await auth();

  if (!session) {
    redirect(LOGIN_PATH);
  }

  if (!canCreateEvents(session.user?.role)) {
    redirect(EVENTS_PATH);
  }

  await requireRateLimit({
    key: getRateLimitKey("event:create", session.user.id),
    ...RATE_LIMITS.writeAction,
  });

  const input = parseEventFormData(formData, new Date(), {
    requireImage: true,
    requireParticipantLimit: true,
  });
  const eventImagePaths = validateStoredEventImageUrls(input.eventImagePaths);
  const isAdmin = session.user.role === ROLES.ADMIN;
  const result = await createEvent({
    ...input,
    eventImagePath: eventImagePaths[0],
    eventImagePaths,
    createdByUserId: session.user.id,
    approvalStatus: isAdmin ? "Approved" : "Pending",
    approvedByUserId: isAdmin ? session.user.id : null,
    approvedAt: isAdmin ? new Date() : null,
  });

  revalidatePath("/");
  revalidatePath("/events");

  if (result.mode === "database" && result.id) {
    revalidatePath(`/events/${result.id}`);
    redirect(`/events/${result.id}?created=1`);
  }

  redirect("/events?created=preview");
}
