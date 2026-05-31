import test from "node:test";
import assert from "node:assert/strict";

import {
  createVerificationTokenHash,
  createVerificationUrl,
  isEmailVerified,
} from "./email-verification.mjs";

test("createVerificationTokenHash hashes tokens consistently", () => {
  assert.equal(
    createVerificationTokenHash("token_1"),
    createVerificationTokenHash("token_1"),
  );
  assert.notEqual(
    createVerificationTokenHash("token_1"),
    createVerificationTokenHash("token_2"),
  );
});

test("createVerificationUrl builds an app-local verification link", () => {
  assert.equal(
    createVerificationUrl("abc123", {
      env: { NEXT_PUBLIC_APP_URL: "https://events.example.com/" },
    }),
    "https://events.example.com/verify-email?token=abc123",
  );
});

test("isEmailVerified accepts database dates and rejects blank values", () => {
  assert.equal(isEmailVerified("2026-05-31T10:00:00.000Z"), true);
  assert.equal(isEmailVerified(new Date("2026-05-31T10:00:00.000Z")), true);
  assert.equal(isEmailVerified(null), false);
  assert.equal(isEmailVerified(undefined), false);
});
