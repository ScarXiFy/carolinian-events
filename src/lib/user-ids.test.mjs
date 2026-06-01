import test from "node:test";
import assert from "node:assert/strict";

import { createUserId } from "./user-ids.mjs";

test("createUserId returns a prefixed UUID user id", () => {
  const id = createUserId(() => "123e4567-e89b-12d3-a456-426614174000");

  assert.equal(id, "usr_123e4567-e89b-12d3-a456-426614174000");
});

test("createUserId rejects invalid UUID factory output", () => {
  assert.throws(
    () => createUserId(() => "not-a-uuid"),
    /User id factory must return a UUID/,
  );
});
