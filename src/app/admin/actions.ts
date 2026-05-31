"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import {
  approveOrganizerRequest,
  rejectOrganizerRequest,
} from "@/lib/db-users.mjs";
import { notifyOrganizerRequestReviewed } from "@/lib/notifications.mjs";
import { canApproveOrganizers } from "@/lib/permissions.mjs";
import { EVENTS_PATH, LOGIN_PATH } from "@/lib/auth-navigation";

export async function approveOrganizerRequestAction(requestId: number) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect(LOGIN_PATH);
  }

  if (!canApproveOrganizers(session.user.role)) {
    redirect(EVENTS_PATH);
  }

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

  const request = await rejectOrganizerRequest(requestId, session.user.id);
  await notifyOrganizerRequestReviewed(
    { ...request, reviewed_by_user_id: session.user.id },
    "Rejected",
  );
  revalidatePath("/admin");
  revalidatePath("/events");
}
