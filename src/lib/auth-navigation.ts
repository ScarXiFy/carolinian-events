import type { Session } from "next-auth";
import { canCreateEvents } from "@/lib/permissions.mjs";
export {
  CREATE_EVENT_PATH,
  EVENTS_PATH,
  LOGIN_PATH,
  SIGNUP_PATH,
  getAuthRedirectPath,
  getLoginHref,
} from "@/lib/auth-navigation.mjs";

import { CREATE_EVENT_PATH, EVENTS_PATH, LOGIN_PATH } from "@/lib/auth-navigation.mjs";

export function getCreateEventHref(session: Session | null) {
  if (!session) return LOGIN_PATH;

  return canCreateEvents(session.user?.role) ? CREATE_EVENT_PATH : EVENTS_PATH;
}
