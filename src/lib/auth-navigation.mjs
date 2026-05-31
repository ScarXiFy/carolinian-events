export const LOGIN_PATH = "/login";
export const SIGNUP_PATH = "/signup";
export const EVENTS_PATH = "/events";
export const CREATE_EVENT_PATH = "/events/create";

export function getAuthRedirectPath(callbackUrl) {
  if (typeof callbackUrl !== "string" || callbackUrl.length === 0) {
    return EVENTS_PATH;
  }

  if (!callbackUrl.startsWith("/") || callbackUrl.startsWith("//")) {
    return EVENTS_PATH;
  }

  return callbackUrl;
}

export function getLoginHref(callbackUrl) {
  const redirectPath = getAuthRedirectPath(callbackUrl);

  return `${LOGIN_PATH}?callbackUrl=${encodeURIComponent(redirectPath)}`;
}
