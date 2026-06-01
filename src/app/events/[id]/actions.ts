"use server";

import { auth } from "@/auth";
import { writeMysqlEvents, readMysqlEvents } from "@/lib/mysql-events.mjs";
import { writePostgresEvents, readPostgresEvents } from "@/lib/postgres-events.mjs";
import { getDatabaseConfig } from "@/lib/database-config.mjs";
import { getAllEvents, getEventByRouteId, updateEvent } from "@/lib/event-store.mjs";
import {
  notifyEventCancelledToAttendees,
  notifyEventLimitReached,
  notifyEventOwner,
} from "@/lib/notifications.mjs";
import { getEventJoinState } from "@/lib/events.mjs";
import { getEventParticipants } from "@/lib/db-users.mjs";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { EVENTS_PATH, LOGIN_PATH } from "@/lib/auth-navigation";
import { canManageEvent } from "@/lib/permissions.mjs";
import { getRateLimitKey, RATE_LIMITS, RateLimitError, requireRateLimit } from "@/lib/rate-limit.mjs";

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

  try {
    await requireRateLimit({
      key: getRateLimitKey("event:join", session.user.id),
      ...RATE_LIMITS.writeAction,
    });
  } catch (error) {
    if (error instanceof RateLimitError) {
      return { error: error.message };
    }
    throw error;
  }

  const config = getDatabaseConfig();
  if (!config.isConfigured) return { error: "Database not configured." };
  const readEvents = config.provider === "postgres" ? readPostgresEvents : readMysqlEvents;
  const writeEvents = config.provider === "postgres" ? writePostgresEvents : writeMysqlEvents;

  await readEvents(config.url);
  const event = await getEventByRouteId(eventId);

  if (!event) return { error: "Event not found" };

  const joinState = getEventJoinState(event);
  if (joinState.disabled) {
    return { error: joinState.error };
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
    if (error instanceof Error && error.message === "Event Full") {
      return { error: "Event Full" };
    }
    return { error: "Failed to join event" };
  }
}

export async function leaveEvent(eventId: number) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "You must be logged in to leave." };
  }

  try {
    await requireRateLimit({
      key: getRateLimitKey("event:leave", session.user.id),
      ...RATE_LIMITS.writeAction,
    });
  } catch (error) {
    if (error instanceof RateLimitError) {
      return { error: error.message };
    }
    throw error;
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

  const event = await getEventByRouteId(eventId);
  if (!event) {
    redirect(EVENTS_PATH);
  }

  if (!canManageEvent(session.user?.role, session.user.id, event)) {
    redirect(EVENTS_PATH);
  }

  await requireRateLimit({
    key: getRateLimitKey("event:cancel", session.user.id),
    ...RATE_LIMITS.writeAction,
  });

  const eventForUpdate = event as typeof event & {
    eventImagePath?: string | null;
    eventImagePaths?: string[];
  };
  const attendees = await getEventParticipants(eventId);
  const result = await updateEvent(
    eventId,
    {
      ...eventForUpdate,
      status: "Cancelled",
      eventImagePath: eventForUpdate.eventImagePath ?? null,
      eventImagePaths: eventForUpdate.eventImagePaths ?? [],
    },
    {
      actor: {
        role: session.user.role,
        userId: session.user.id,
      },
    },
  );

  await notifyEventOwner(event, {
    type: "event_cancelled_by_manager",
    title: "Event cancelled",
    message: `${event.eventName} was cancelled.`,
    actorUserId: session.user.id,
  });
  await notifyEventCancelledToAttendees(event, attendees, session.user.id);

  revalidatePath("/");
  revalidatePath("/events");
  revalidatePath(`/events/${eventId}`);

  if (result.mode === "database" && result.affectedRows > 0) {
    redirect(`/events/${eventId}?updated=1`);
  }

  redirect(`/events/${eventId}?updated=preview`);
}
