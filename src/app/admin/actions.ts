"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import {
  approveOrganizerRequest,
  rejectOrganizerRequest,
} from "@/lib/db-users.mjs";
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

  await approveOrganizerRequest(requestId, session.user.id);
  revalidatePath("/admin");
}

export async function rejectOrganizerRequestAction(requestId: number) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect(LOGIN_PATH);
  }

  if (!canApproveOrganizers(session.user.role)) {
    redirect(EVENTS_PATH);
  }

  await rejectOrganizerRequest(requestId, session.user.id);
  revalidatePath("/admin");
}
