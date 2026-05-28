"use server";

import { auth } from "@/auth";
import { writeMysqlEvents, readMysqlEvents } from "@/lib/mysql-events.mjs";
import { writePostgresEvents, readPostgresEvents } from "@/lib/postgres-events.mjs";
import { getDatabaseConfig } from "@/lib/database-config.mjs";
import { revalidatePath } from "next/cache";

type EventWithParticipants = {
  id: number;
  participant_limit?: number | null;
  participant_count?: number;
};

export async function joinEvent(eventId: number) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "You must be logged in to join." };
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
