import test from "node:test";
import assert from "node:assert/strict";

import { runMysqlCrudSmoke } from "./crud-smoke.mjs";

test("runMysqlCrudSmoke creates, updates, verifies, deletes, and cleans up", async () => {
  const rows = [];
  const calls = [];

  const result = await runMysqlCrudSmoke("mysql://root@localhost:3306/carolinian_events_db", {
    readEvents: async () => rows,
    writeEvents: {
      createEvent: async (url, input) => {
        calls.push(["create", url, input.eventName]);
        rows.push({
          id: 12,
          event_name: input.eventName,
          organizer: input.organizer,
          description: input.description,
          event_date: input.eventDate,
          event_time: input.eventTime,
          location: input.location,
          category: input.category,
          status: input.status,
          created_at: "2026-07-01T08:00:00.000Z",
        });
        return { id: 12 };
      },
      updateEvent: async (url, id, input) => {
        calls.push(["update", url, id, input.eventName]);
        const row = rows.find((event) => event.id === id);
        row.event_name = input.eventName;
        row.description = input.description;
        return { affectedRows: 1 };
      },
      deleteEvent: async (url, id) => {
        calls.push(["delete", url, id]);
        rows.splice(rows.findIndex((event) => event.id === id), 1);
        return { affectedRows: 1 };
      },
    },
  });

  assert.deepEqual(result, {
    createdId: 12,
    createdFound: true,
    updatedFound: true,
    deleted: true,
    stillExists: false,
  });
  assert.deepEqual(calls, [
    ["create", "mysql://root@localhost:3306/carolinian_events_db", "Codex CRUD Smoke Test"],
    ["update", "mysql://root@localhost:3306/carolinian_events_db", 12, "Codex CRUD Smoke Test Updated"],
    ["delete", "mysql://root@localhost:3306/carolinian_events_db", 12],
  ]);
});
