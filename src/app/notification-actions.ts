"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import { markNotificationsRead } from "@/lib/notifications.mjs";

export async function markMyNotificationsRead() {
  const session = await auth();
  if (!session?.user?.id) return;

  await markNotificationsRead(session.user.id);
  //revalidatePath("/");
  //revalidatePath("/events");
  //revalidatePath("/admin");
}
