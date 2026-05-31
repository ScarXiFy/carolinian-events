import test from "node:test";
import assert from "node:assert/strict";

import {
  EVENTS_PATH,
  getAuthRedirectPath,
  getLoginHref,
} from "./auth-navigation.mjs";

test("getAuthRedirectPath accepts internal callback paths", () => {
  assert.equal(getAuthRedirectPath("/events/7"), "/events/7");
  assert.equal(getAuthRedirectPath("/events/7?updated=1"), "/events/7?updated=1");
});

test("getAuthRedirectPath rejects external and malformed callback paths", () => {
  assert.equal(getAuthRedirectPath("https://example.com/events/7"), EVENTS_PATH);
  assert.equal(getAuthRedirectPath("//example.com/events/7"), EVENTS_PATH);
  assert.equal(getAuthRedirectPath("events/7"), EVENTS_PATH);
  assert.equal(getAuthRedirectPath(""), EVENTS_PATH);
  assert.equal(getAuthRedirectPath(null), EVENTS_PATH);
});

test("getLoginHref preserves a safe event return target", () => {
  assert.equal(
    getLoginHref("/events/7"),
    "/login?callbackUrl=%2Fevents%2F7",
  );
});
