import test from "node:test";
import assert from "node:assert/strict";

import {
  createPostgresEventReader,
  createPostgresEventWriter,
  getPostgresCreateEventStatement,
  getPostgresEventsQuery,
  getPostgresUpdateEventStatement,
  normalizePostgresEventRow,
} from "./postgres-events.mjs";

test("getPostgresEventsQuery selects dashboard fields with participant counts", () => {
  assert.match(getPostgresEventsQuery(), /select e\.id, e\.event_name/);
  assert.match(getPostgresEventsQuery(), /event_participants/);
  assert.match(getPostgresEventsQuery(), /order by e\.created_at desc, e\.id desc/);
});

test("Postgres event write statements use numbered parameters", () => {
  const input = {
    eventName: "Research Colloquium",
    organizer: "CPE Department",
    description: "Project sharing.",
    eventDate: "2026-07-01",
    eventTime: "09:30",
    eventEndTime: "11:30",
    location: "Bunzel Building",
    category: "Academic",
    status: "Upcoming",
    participantLimit: 80,
    eventImagePath: "/uploads/events/poster.png",
    createdByUserId: "usr_1",
  };

  assert.deepEqual(getPostgresCreateEventStatement(input), {
    sql: "insert into events (event_name, organizer, description, event_date, event_time, event_end_time, location, category, status, participant_limit, event_image_path, created_by_user_id) values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) returning id",
    values: [
      "Research Colloquium",
      "CPE Department",
      "Project sharing.",
      "2026-07-01",
      "09:30",
      "11:30",
      "Bunzel Building",
      "Academic",
      "Upcoming",
      80,
      "/uploads/events/poster.png",
      "usr_1",
    ],
  });

  assert.deepEqual(getPostgresUpdateEventStatement(9, input), {
    sql: "update events set event_name = $1, organizer = $2, description = $3, event_date = $4, event_time = $5, event_end_time = $6, location = $7, category = $8, status = $9, participant_limit = $10, event_image_path = coalesce($11, event_image_path) where id = $12",
    values: [
      "Research Colloquium",
      "CPE Department",
      "Project sharing.",
      "2026-07-01",
      "09:30",
      "11:30",
      "Bunzel Building",
      "Academic",
      "Upcoming",
      80,
      "/uploads/events/poster.png",
      9,
    ],
  });
});

test("createPostgresEventReader reads rows through an injected client", async () => {
  const calls = [];
  const reader = createPostgresEventReader({
    createClient: (url) => {
      calls.push(["connect", url]);
      return {
        connect: async () => calls.push(["connected"]),
        query: async (sql) => {
          calls.push(["query", sql]);
          return { rows: [{ id: 1, event_name: "Mock Presentation" }] };
        },
        end: async () => calls.push(["end"]),
      };
    },
  });

  const rows = await reader("postgresql://example");

  assert.equal(rows[0].event_name, "Mock Presentation");
  assert.deepEqual(calls.map(([name]) => name), ["connect", "connected", "query", "end"]);
});

test("normalizePostgresEventRow keeps SQL DATE values on the selected local date", () => {
  const row = {
    id: 6,
    event_name: "Date Regression",
    organizer: "CPE Society",
    description: "Checks local date handling.",
    event_date: new Date(2026, 5, 6),
    event_time: "08:00:00",
    event_end_time: "10:00:00",
    location: "Bunzel Building",
    category: "Academic",
    status: "Upcoming",
    created_at: "2026-05-31T08:00:00.000Z",
  };

  assert.equal(normalizePostgresEventRow(row).event_date, "2026-06-06");
});

test("createPostgresEventWriter executes create, update, delete, join, and leave", async () => {
  const calls = [];
  const writer = createPostgresEventWriter({
    createClient: (url) => {
      calls.push(["connect", url]);
      return {
        connect: async () => calls.push(["connected"]),
        query: async (sql, values) => {
          calls.push(["query", sql, values]);
          if (sql.includes("returning id")) return { rows: [{ id: 12 }], rowCount: 1 };
          return { rows: [], rowCount: 1 };
        },
        end: async () => calls.push(["end"]),
      };
    },
  });

  const input = {
    eventName: "Research Colloquium",
    organizer: "CPE Department",
    description: "Project sharing.",
    eventDate: "2026-07-01",
    eventTime: "09:30",
    eventEndTime: "11:30",
    location: "Bunzel Building",
    category: "Academic",
    status: "Upcoming",
    participantLimit: 80,
    eventImagePath: null,
  };

  assert.deepEqual(await writer.createEvent("postgresql://example", input), { id: 12 });
  assert.deepEqual(await writer.updateEvent("postgresql://example", 12, input), { affectedRows: 1 });
  assert.deepEqual(await writer.deleteEvent("postgresql://example", 12), { affectedRows: 1 });
  await writer.joinEvent("postgresql://example", 12, "usr_1");
  await writer.leaveEvent("postgresql://example", 12, "usr_1");

  assert.equal(calls.filter(([name]) => name === "end").length, 5);
});
