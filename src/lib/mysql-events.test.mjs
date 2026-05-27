import test from "node:test";
import assert from "node:assert/strict";

import {
  createMysqlEventReader,
  createMysqlEventWriter,
  getCreateEventStatement,
  getDeleteEventStatement,
  getEventsQuery,
  getUpdateEventStatement,
  normalizeMysqlEventRow,
} from "./mysql-events.mjs";

test("getEventsQuery selects legacy event fields in dashboard order", () => {
  assert.equal(
    getEventsQuery(),
    "SELECT id, event_name, organizer, description, event_date, event_time, location, category, status, created_at FROM events ORDER BY created_at DESC, id DESC",
  );
});

test("normalizeMysqlEventRow serializes Date values for app formatting", () => {
  const row = {
    id: 3,
    event_name: "Carolinian Week 2026",
    organizer: "USC Student Council",
    description: "Annual celebration.",
    event_date: new Date("2026-06-15T00:00:00.000Z"),
    event_time: "08:00:00",
    location: "USC Main Campus",
    category: "Cultural",
    status: "Upcoming",
    created_at: new Date("2026-05-03T08:00:00.000Z"),
  };

  assert.deepEqual(normalizeMysqlEventRow(row), {
    id: 3,
    event_name: "Carolinian Week 2026",
    organizer: "USC Student Council",
    description: "Annual celebration.",
    event_date: "2026-06-15",
    event_time: "08:00:00",
    location: "USC Main Campus",
    category: "Cultural",
    status: "Upcoming",
    created_at: "2026-05-03T08:00:00.000Z",
  });
});

test("createMysqlEventReader reads rows through an injected connection", async () => {
  const calls = [];
  const reader = createMysqlEventReader({
    createConnection: async (url) => {
      calls.push(["connect", url]);
      return {
        query: async (sql) => {
          calls.push(["query", sql]);
          return [[
            {
              id: 1,
              event_name: "Mock Presentation",
              organizer: "GROUP F",
              description: "Practice session.",
              event_date: "2026-05-05",
              event_time: "14:00:00",
              location: "NCR Lab",
              category: "Academic",
              status: "Completed",
              created_at: "2026-05-01T08:00:00.000Z",
            },
          ]];
        },
        end: async () => {
          calls.push(["end"]);
        },
      };
    },
  });

  const rows = await reader("mysql://root@localhost:3306/carolinian_events_db");

  assert.equal(rows.length, 1);
  assert.equal(rows[0].event_name, "Mock Presentation");
  assert.deepEqual(calls, [
    ["connect", "mysql://root@localhost:3306/carolinian_events_db"],
    ["query", getEventsQuery()],
    ["end"],
  ]);
});

test("event write statements use parameterized SQL", () => {
  const input = {
    eventName: "Research Colloquium",
    organizer: "CPE Department",
    description: "Project sharing.",
    eventDate: "2026-07-01",
    eventTime: "09:30",
    location: "Bunzel Building",
    category: "Academic",
    status: "Upcoming",
  };

  assert.deepEqual(getCreateEventStatement(input), {
    sql: "INSERT INTO events (event_name, organizer, description, event_date, event_time, location, category, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    values: [
      "Research Colloquium",
      "CPE Department",
      "Project sharing.",
      "2026-07-01",
      "09:30",
      "Bunzel Building",
      "Academic",
      "Upcoming",
    ],
  });

  assert.deepEqual(getUpdateEventStatement(9, input), {
    sql: "UPDATE events SET event_name = ?, organizer = ?, description = ?, event_date = ?, event_time = ?, location = ?, category = ?, status = ? WHERE id = ?",
    values: [
      "Research Colloquium",
      "CPE Department",
      "Project sharing.",
      "2026-07-01",
      "09:30",
      "Bunzel Building",
      "Academic",
      "Upcoming",
      9,
    ],
  });

  assert.deepEqual(getDeleteEventStatement(9), {
    sql: "DELETE FROM events WHERE id = ?",
    values: [9],
  });
});

test("createMysqlEventWriter executes write operations through an injected connection", async () => {
  const calls = [];
  const writer = createMysqlEventWriter({
    createConnection: async (url) => {
      calls.push(["connect", url]);
      return {
        execute: async (sql, values) => {
          calls.push(["execute", sql, values]);
          return [{ insertId: 12, affectedRows: 1 }];
        },
        end: async () => {
          calls.push(["end"]);
        },
      };
    },
  });

  const created = await writer.createEvent(
    "mysql://root@localhost:3306/carolinian_events_db",
    {
      eventName: "Research Colloquium",
      organizer: "CPE Department",
      description: "Project sharing.",
      eventDate: "2026-07-01",
      eventTime: "09:30",
      location: "Bunzel Building",
      category: "Academic",
      status: "Upcoming",
    },
  );
  const updated = await writer.updateEvent(
    "mysql://root@localhost:3306/carolinian_events_db",
    12,
    {
      eventName: "Research Colloquium",
      organizer: "CPE Department",
      description: "Updated.",
      eventDate: "2026-07-01",
      eventTime: "09:30",
      location: "Bunzel Building",
      category: "Academic",
      status: "Upcoming",
    },
  );
  const deleted = await writer.deleteEvent(
    "mysql://root@localhost:3306/carolinian_events_db",
    12,
  );

  assert.equal(created.id, 12);
  assert.deepEqual(updated, { affectedRows: 1 });
  assert.deepEqual(deleted, { affectedRows: 1 });
  assert.equal(calls.filter(([name]) => name === "end").length, 3);
});
