import test from "node:test";
import assert from "node:assert/strict";

import {
  createMysqlEventReader,
  getEventsQuery,
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
