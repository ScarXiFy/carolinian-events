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
    "SELECT e.id, e.event_name, e.organizer, e.description, e.event_date, e.event_time, e.event_end_time, e.location, e.category, e.status, e.created_at, e.participant_limit, e.event_image_path, e.created_by_user_id, (SELECT COUNT(*) FROM event_participants WHERE event_id = e.id) as participant_count FROM events e ORDER BY e.created_at DESC, e.id DESC",
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
    event_end_time: "10:00:00",
    location: "USC Main Campus",
    category: "Cultural",
    status: "Upcoming",
    created_at: new Date("2026-05-03T08:00:00.000Z"),
    participant_limit: 120,
    participant_count: 18,
    event_image_path: "/uploads/events/poster.png",
    created_by_user_id: "usr_1",
  };

  assert.deepEqual(normalizeMysqlEventRow(row), {
    id: 3,
    event_name: "Carolinian Week 2026",
    organizer: "USC Student Council",
    description: "Annual celebration.",
    event_date: "2026-06-15",
    event_time: "08:00:00",
    event_end_time: "10:00:00",
    location: "USC Main Campus",
    category: "Cultural",
    status: "Upcoming",
    created_at: "2026-05-03T08:00:00.000Z",
    participant_limit: 120,
    participant_count: 18,
    event_image_path: "/uploads/events/poster.png",
    created_by_user_id: "usr_1",
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
              event_end_time: "16:00:00",
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
    eventEndTime: "11:30",
    location: "Bunzel Building",
    category: "Academic",
    status: "Upcoming",
    participantLimit: 80,
    eventImagePath: "/uploads/events/poster.png",
    createdByUserId: "usr_1",
  };

  assert.deepEqual(getCreateEventStatement(input), {
    sql: "INSERT INTO events (event_name, organizer, description, event_date, event_time, event_end_time, location, category, status, participant_limit, event_image_path, created_by_user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
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

  assert.deepEqual(getUpdateEventStatement(9, input), {
    sql: "UPDATE events SET event_name = ?, organizer = ?, description = ?, event_date = ?, event_time = ?, event_end_time = ?, location = ?, category = ?, status = ?, participant_limit = ?, event_image_path = COALESCE(?, event_image_path) WHERE id = ?",
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
      eventEndTime: "11:30",
      location: "Bunzel Building",
      category: "Academic",
      status: "Upcoming",
      participantLimit: 80,
      eventImagePath: "/uploads/events/poster.png",
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
      eventEndTime: "11:30",
      location: "Bunzel Building",
      category: "Academic",
      status: "Upcoming",
      participantLimit: 80,
      eventImagePath: "/uploads/events/poster.png",
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
