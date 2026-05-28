import test from "node:test";
import assert from "node:assert/strict";

import { getDefaultUserRole, parseAdminEmails } from "./auth-roles.mjs";

test("parseAdminEmails trims and lowercases comma-separated emails", () => {
  assert.deepEqual(parseAdminEmails("Admin@USC.edu, second@example.com "), [
    "admin@usc.edu",
    "second@example.com",
  ]);
});

test("getDefaultUserRole promotes only ADMIN_EMAILS matches", () => {
  assert.equal(
    getDefaultUserRole("Admin@USC.edu", { ADMIN_EMAILS: "admin@usc.edu" }),
    "Admin",
  );
  assert.equal(
    getDefaultUserRole("student@usc.edu", { ADMIN_EMAILS: "admin@usc.edu" }),
    "Student",
  );
});
