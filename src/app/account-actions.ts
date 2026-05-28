"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { createOrganizerRequest } from "@/lib/db-users.mjs";
import { EVENTS_PATH, LOGIN_PATH } from "@/lib/auth-navigation";
import { ROLES } from "@/lib/permissions.mjs";

export async function requestOrganizerAccess() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect(LOGIN_PATH);
  }

  if (session.user.role !== ROLES.STUDENT) {
    redirect(EVENTS_PATH);
  }

  await createOrganizerRequest(session.user.id);
  revalidatePath("/events");
  redirect("/events?organizerRequest=pending");
}
