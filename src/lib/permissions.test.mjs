import test from "node:test";
import assert from "node:assert/strict";

import {
  canApproveOrganizers,
  canCreateEvents,
  canJoinEvents,
  canManageAllEvents,
  canManageOwnEvents,
  isAdmin,
  isOrganizer,
} from "./permissions.mjs";

test("permission helpers follow the project role table", () => {
  assert.equal(canJoinEvents("Student"), true);
  assert.equal(canCreateEvents("Student"), false);
  assert.equal(canManageOwnEvents("Student"), false);
  assert.equal(canManageAllEvents("Student"), false);
  assert.equal(canApproveOrganizers("Student"), false);

  assert.equal(canJoinEvents("Organizer"), true);
  assert.equal(canCreateEvents("Organizer"), true);
  assert.equal(canManageOwnEvents("Organizer"), true);
  assert.equal(canManageAllEvents("Organizer"), false);
  assert.equal(canApproveOrganizers("Organizer"), false);

  assert.equal(canJoinEvents("Admin"), true);
  assert.equal(canCreateEvents("Admin"), true);
  assert.equal(canManageOwnEvents("Admin"), true);
  assert.equal(canManageAllEvents("Admin"), true);
  assert.equal(canApproveOrganizers("Admin"), true);

  assert.equal(isOrganizer("Organizer"), true);
  assert.equal(isOrganizer("Admin"), false);
  assert.equal(isAdmin("Admin"), true);
});
