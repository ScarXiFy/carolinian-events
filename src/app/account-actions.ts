"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { createOrganizerRequest } from "@/lib/db-users.mjs";
import { EVENTS_PATH, LOGIN_PATH } from "@/lib/auth-navigation";
import { ROLES } from "@/lib/permissions.mjs";
import { notifyAdminsOfOrganizerRequest } from "@/lib/notifications.mjs";

export async function requestOrganizerAccess() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect(LOGIN_PATH);
  }

  if (session.user.role !== ROLES.STUDENT) {
    redirect(EVENTS_PATH);
  }

  await createOrganizerRequest(session.user.id);
  await notifyAdminsOfOrganizerRequest({
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
  });
  revalidatePath("/events");
  revalidatePath("/admin");
  redirect("/events?organizerRequest=pending");
}
