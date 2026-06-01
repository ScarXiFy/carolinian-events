"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { EVENTS_PATH, LOGIN_PATH } from "@/lib/auth-navigation";
import { canManageEvent, ROLES } from "@/lib/permissions.mjs";
import { deleteEvent, getEventByRouteId } from "@/lib/event-store.mjs";
import { notifyEventOwner } from "@/lib/notifications.mjs";
import { getRateLimitKey, RATE_LIMITS, requireRateLimit } from "@/lib/rate-limit.mjs";

export async function deleteEventAction(id: number) {
  const session = await auth();

  if (!session) {
    redirect(LOGIN_PATH);
  }

  const event = await getEventByRouteId(id);

  if (!event) {
    redirect(EVENTS_PATH);
  }

  if (!canManageEvent(session.user?.role, session.user.id, event)) {
    redirect(EVENTS_PATH);
  }

  await requireRateLimit({
    key: getRateLimitKey("event:delete", session.user.id),
    ...RATE_LIMITS.writeAction,
  });

  const result = await deleteEvent(id, {
    actor: {
      role: session.user.role,
      userId: session.user.id,
    },
  });

  if (session.user.role === ROLES.ADMIN) {
    await notifyEventOwner(event, {
      type: "event_deleted_by_admin",
      title: "Event deleted by Admin",
      message: `${event.eventName} was deleted by an Admin.`,
      actorUserId: session.user.id,
    });
  }

  revalidatePath("/");
  revalidatePath("/events");
  revalidatePath(`/events/${id}`);
  revalidatePath(`/events/${id}/delete`);

  if (result.mode === "database" && result.affectedRows > 0) {
    redirect("/events?deleted=1");
  }

  redirect("/events?deleted=preview");
}
