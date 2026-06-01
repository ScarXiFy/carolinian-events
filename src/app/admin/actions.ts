"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import {
  approveOrganizerRequest,
  rejectOrganizerRequest,
} from "@/lib/db-users.mjs";
import { approveEvent, getEventByRouteId, rejectEvent } from "@/lib/event-store.mjs";
import { notifyOrganizerRequestReviewed } from "@/lib/notifications.mjs";
import { notifyEventApprovalReviewed } from "@/lib/notifications.mjs";
import { canApproveOrganizers } from "@/lib/permissions.mjs";
import { EVENTS_PATH, LOGIN_PATH } from "@/lib/auth-navigation";
import { getRateLimitKey, RATE_LIMITS, requireRateLimit } from "@/lib/rate-limit.mjs";

export async function approveOrganizerRequestAction(requestId: number) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect(LOGIN_PATH);
  }

  if (!canApproveOrganizers(session.user.role)) {
    redirect(EVENTS_PATH);
  }

  await requireRateLimit({
    key: getRateLimitKey("admin:approve-organizer", session.user.id),
    ...RATE_LIMITS.adminAction,
  });

  const request = await approveOrganizerRequest(requestId, session.user.id);
  await notifyOrganizerRequestReviewed(
    { ...request, reviewed_by_user_id: session.user.id },
    "Approved",
  );
  revalidatePath("/admin");
  revalidatePath("/events");
}

export async function rejectOrganizerRequestAction(requestId: number) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect(LOGIN_PATH);
  }

  if (!canApproveOrganizers(session.user.role)) {
    redirect(EVENTS_PATH);
  }

  await requireRateLimit({
    key: getRateLimitKey("admin:reject-organizer", session.user.id),
    ...RATE_LIMITS.adminAction,
  });

  const request = await rejectOrganizerRequest(requestId, session.user.id);
  await notifyOrganizerRequestReviewed(
    { ...request, reviewed_by_user_id: session.user.id },
    "Rejected",
  );
  revalidatePath("/admin");
  revalidatePath("/events");
}

export async function approveEventAction(eventId: number) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect(LOGIN_PATH);
  }

  if (!canApproveOrganizers(session.user.role)) {
    redirect(EVENTS_PATH);
  }

  await requireRateLimit({
    key: getRateLimitKey("admin:approve-event", session.user.id),
    ...RATE_LIMITS.adminAction,
  });

  const event = await getEventByRouteId(eventId);
  await approveEvent(eventId, session.user.id);
  await notifyEventApprovalReviewed(event, "Approved", session.user.id);
  revalidatePath("/admin");
  revalidatePath("/events");
  revalidatePath(`/events/${eventId}`);
}

export async function rejectEventAction(eventId: number) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect(LOGIN_PATH);
  }

  if (!canApproveOrganizers(session.user.role)) {
    redirect(EVENTS_PATH);
  }

  await requireRateLimit({
    key: getRateLimitKey("admin:reject-event", session.user.id),
    ...RATE_LIMITS.adminAction,
  });

  const event = await getEventByRouteId(eventId);
  await rejectEvent(eventId, session.user.id);
  await notifyEventApprovalReviewed(event, "Rejected", session.user.id);
  revalidatePath("/admin");
  revalidatePath("/events");
  revalidatePath(`/events/${eventId}`);
}
