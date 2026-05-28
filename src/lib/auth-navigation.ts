import type { Session } from "next-auth";
import { canCreateEvents } from "@/lib/permissions.mjs";

export const LOGIN_PATH = "/login";
export const SIGNUP_PATH = "/signup";
export const EVENTS_PATH = "/events";
export const CREATE_EVENT_PATH = "/events/create";

export function getCreateEventHref(session: Session | null) {
  if (!session) return LOGIN_PATH;

  return canCreateEvents(session.user?.role) ? CREATE_EVENT_PATH : EVENTS_PATH;
}
