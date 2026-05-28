import type { Session } from "next-auth";

export const LOGIN_PATH = "/login";
export const SIGNUP_PATH = "/signup";
export const EVENTS_PATH = "/events";
export const CREATE_EVENT_PATH = "/events/create";

export function getCreateEventHref(session: Session | null) {
  return session ? CREATE_EVENT_PATH : LOGIN_PATH;
}
