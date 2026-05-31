import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const schemaPath = resolve("database/schema.sql");

test("database schema is clean and free of merge conflict markers", () => {
  const schema = readFileSync(schemaPath, "utf8");

  assert.equal(schema.includes("<<<<<<<"), false);
  assert.equal(schema.includes("======="), false);
  assert.equal(schema.includes(">>>>>>>"), false);
});

test("database schema keeps the app-supported event statuses", () => {
  const schema = readFileSync(schemaPath, "utf8");

  assert.match(schema, /CREATE TABLE IF NOT EXISTS events/);
  assert.match(schema, /'Upcoming', 'Ongoing', 'Completed', 'Cancelled'/);
});

test("database schema includes organizer contact fields and event images", () => {
  const schema = readFileSync(schemaPath, "utf8");

  assert.match(schema, /contact_email/);
  assert.match(schema, /contact_phone/);
  assert.match(schema, /CREATE TABLE IF NOT EXISTS event_images/);
  assert.match(schema, /event_images_event_sort/);
});
