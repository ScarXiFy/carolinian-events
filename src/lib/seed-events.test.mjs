import test from "node:test";
import assert from "node:assert/strict";

import { seedMysqlEvents } from "./seed-events.mjs";

const sampleInput = [
  {
    eventName: "Mock Presentation",
    organizer: "GROUP F",
    description: "Practice session.",
    eventDate: "2026-05-05",
    eventTime: "14:00:00",
    location: "NCR Lab",
    category: "Academic",
    status: "Completed",
  },
  {
    eventName: "Proposal Hearing 2026",
    organizer: "CPE Department",
    description: "Panel presentation.",
    eventDate: "2026-05-08",
    eventTime: "15:30:00",
    location: "Bunzel Building",
    category: "Academic",
    status: "Completed",
  },
];

test("seedMysqlEvents inserts sample events when the table is empty", async () => {
  const calls = [];

  const result = await seedMysqlEvents("mysql://root@localhost:3306/carolinian_events_db", {
    events: sampleInput,
    readEvents: async (url) => {
      calls.push(["read", url]);
      return [];
    },
    writeEvents: {
      createEvent: async (url, input) => {
        calls.push(["create", url, input.eventName]);
        return { id: calls.length };
      },
    },
  });

  assert.deepEqual(result, { inserted: 2, skipped: false, existing: 0 });
  assert.deepEqual(calls, [
    ["read", "mysql://root@localhost:3306/carolinian_events_db"],
    ["create", "mysql://root@localhost:3306/carolinian_events_db", "Mock Presentation"],
    ["create", "mysql://root@localhost:3306/carolinian_events_db", "Proposal Hearing 2026"],
  ]);
});

test("seedMysqlEvents skips when the table already has events", async () => {
  const result = await seedMysqlEvents("mysql://root@localhost:3306/carolinian_events_db", {
    events: sampleInput,
    readEvents: async () => [{ id: 1, event_name: "Existing Event" }],
    writeEvents: {
      createEvent: async () => {
        throw new Error("Should not insert when existing rows are present.");
      },
    },
  });

  assert.deepEqual(result, { inserted: 0, skipped: true, existing: 1 });
});
