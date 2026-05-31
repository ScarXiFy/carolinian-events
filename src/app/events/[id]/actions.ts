"use server";

import { auth } from "@/auth";
import { writeMysqlEvents, readMysqlEvents } from "@/lib/mysql-events.mjs";
import { writePostgresEvents, readPostgresEvents } from "@/lib/postgres-events.mjs";
import { getDatabaseConfig } from "@/lib/database-config.mjs";
import { getAllEvents, getEventByRouteId, updateEvent } from "@/lib/event-store.mjs";
import { notifyEventLimitReached, notifyEventOwner } from "@/lib/notifications.mjs";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { EVENTS_PATH, LOGIN_PATH } from "@/lib/auth-navigation";
import { ROLES } from "@/lib/permissions.mjs";

type EventWithParticipants = {
  id: number;
  participant_limit?: number | null;
  participant_count?: number;
};

type EventForNotifications = {
  id: number;
  eventName: string;
  participantLimit: number | null;
  participantCount: number;
  createdByUserId?: string | null;
};

export async function joinEvent(eventId: number) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "You must be logged in to join." };
  }

  if (!session.user.isEmailVerified) {
    return { error: "Please verify your email before joining events." };
  }

  const config = getDatabaseConfig();
  if (!config.isConfigured) return { error: "Database not configured." };
  const readEvents = config.provider === "postgres" ? readPostgresEvents : readMysqlEvents;
  const writeEvents = config.provider === "postgres" ? writePostgresEvents : writeMysqlEvents;

  // Check limits
  const events = await readEvents(config.url) as EventWithParticipants[];
  const event = events.find((candidate) => candidate.id === eventId);

  if (!event) return { error: "Event not found" };

  const participantLimit = event.participant_limit ?? null;
  const participantCount = event.participant_count ?? 0;

  if (participantLimit !== null && participantCount >= participantLimit) {
    return { error: "Event is full" };
  }

  try {
    await writeEvents.joinEvent(config.url, eventId, session.user.id);
    const updatedEvent = ((await getAllEvents()) as EventForNotifications[]).find(
      (candidate: EventForNotifications) => candidate.id === eventId,
    );
    if (updatedEvent) {
      await notifyEventOwner(updatedEvent, {
        type: "event_attendee_registered",
        title: "New attendee registered",
        message: `${session.user.name || session.user.email || "Someone"} registered for ${updatedEvent.eventName}.`,
        actorUserId: session.user.id,
      });
      await notifyEventLimitReached(updatedEvent);
    }
    revalidatePath(`/events/${eventId}`);
    revalidatePath(`/events`);
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "Failed to join event" };
  }
}

export async function leaveEvent(eventId: number) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "You must be logged in to leave." };
  }

  const config = getDatabaseConfig();
  if (!config.isConfigured) return { error: "Database not configured." };
  const writeEvents = config.provider === "postgres" ? writePostgresEvents : writeMysqlEvents;

  try {
    await writeEvents.leaveEvent(config.url, eventId, session.user.id);
    revalidatePath(`/events/${eventId}`);
    revalidatePath(`/events`);
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "Failed to leave event" };
  }
}

export async function cancelEvent(eventId: number) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect(LOGIN_PATH);
  }

  if (session.user.role !== ROLES.ADMIN) {
    redirect(EVENTS_PATH);
  }

  const event = await getEventByRouteId(eventId);
  if (!event) {
    redirect(EVENTS_PATH);
  }

  const result = await updateEvent(eventId, {
    ...event,
    status: "Cancelled",
    eventImagePath: null,
  });

  await notifyEventOwner(event, {
    type: "event_cancelled_by_admin",
    title: "Event cancelled by Admin",
    message: `${event.eventName} was cancelled by an Admin.`,
    actorUserId: session.user.id,
  });

  revalidatePath("/");
  revalidatePath("/events");
  revalidatePath(`/events/${eventId}`);

  if (result.mode === "database" && result.affectedRows > 0) {
    redirect(`/events/${eventId}?updated=1`);
  }

  redirect(`/events/${eventId}?updated=preview`);
}
