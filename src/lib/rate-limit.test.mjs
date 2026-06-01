import test from "node:test";
import assert from "node:assert/strict";

import {
  RATE_LIMITS,
  RateLimitError,
  checkRateLimit,
  createMemoryRateLimitStore,
  getRateLimitKey,
  requireRateLimit,
} from "./rate-limit.mjs";

test("getRateLimitKey normalizes action identifiers", () => {
  assert.equal(getRateLimitKey("login", " Admin@USC.edu "), "login:admin@usc.edu");
  assert.equal(getRateLimitKey("upload", ""), "upload:anonymous");
});

test("memory rate limiter blocks requests over the limit until reset", async () => {
  const store = createMemoryRateLimitStore();
  const now = new Date("2026-06-01T00:00:00.000Z");
  const input = {
    key: "login:student@usc.edu",
    limit: 2,
    windowMs: 60_000,
    now,
    store,
  };

  assert.equal((await checkRateLimit(input)).allowed, true);
  assert.equal((await checkRateLimit(input)).allowed, true);
  const blocked = await checkRateLimit(input);

  assert.equal(blocked.allowed, false);
  assert.equal(blocked.retryAfterSeconds, 60);

  const afterReset = await checkRateLimit({
    ...input,
    now: new Date("2026-06-01T00:01:01.000Z"),
  });

  assert.equal(afterReset.allowed, true);
});

test("requireRateLimit throws a typed error when blocked", async () => {
  const store = createMemoryRateLimitStore();
  const options = {
    key: "signup:student@usc.edu",
    limit: 1,
    windowMs: 60_000,
    now: new Date("2026-06-01T00:00:00.000Z"),
    store,
  };

  await requireRateLimit(options);

  await assert.rejects(
    () => requireRateLimit(options),
    (error) => error instanceof RateLimitError && error.retryAfterSeconds === 60,
  );
});

test("RATE_LIMITS defines launch-sensitive action budgets", () => {
  assert.equal(RATE_LIMITS.login.limit, 5);
  assert.equal(RATE_LIMITS.signup.limit, 3);
  assert.equal(RATE_LIMITS.uploadUrl.limit, 20);
  assert.equal(RATE_LIMITS.writeAction.limit, 30);
  assert.equal(RATE_LIMITS.adminAction.limit, 60);
});
