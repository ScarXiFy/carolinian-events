import test from "node:test";
import assert from "node:assert/strict";

import {
  getAllEvents,
  getEventByRouteId,
  getEventStaticParams,
  getEventStoreStatus,
  mapLegacyEventRow,
} from "./event-store.mjs";

test("mapLegacyEventRow converts legacy database fields to app event fields", () => {
  const row = {
    id: 7,
    event_name: "Research Colloquium",
    organizer: "CPE Department",
    description: "Project research sharing.",
    event_date: "2026-07-01",
    event_time: "09:30:00",
    location: "Bunzel Building",
    category: "Academic",
    status: "Upcoming",
    created_at: "2026-06-01T08:00:00.000Z",
  };

  assert.deepEqual(mapLegacyEventRow(row), {
    id: 7,
    eventName: "Research Colloquium",
    organizer: "CPE Department",
    description: "Project research sharing.",
    eventDate: "2026-07-01",
    eventTime: "09:30:00",
    location: "Bunzel Building",
    category: "Academic",
    status: "Upcoming",
    createdAt: "2026-06-01T08:00:00.000Z",
  });
});

test("event store exposes sample events through route-friendly helpers", async () => {
  const events = await getAllEvents();

  assert.ok(events.length > 0);
  assert.equal((await getEventByRouteId("2")).eventName, "Proposal Hearing 2026");
  assert.deepEqual((await getEventStaticParams())[0], { id: "1" });
});

test("event store reads MySQL rows when DATABASE_URL is configured", async () => {
  const events = await getAllEvents({
    env: { DATABASE_URL: "mysql://root@localhost:3306/carolinian_events_db" },
    readDatabaseEvents: async (url) => {
      assert.equal(url, "mysql://root@localhost:3306/carolinian_events_db");
      return [
        {
          id: 9,
          event_name: "Database Event",
          organizer: "CPE Society",
          description: "Loaded from MySQL.",
          event_date: "2026-07-10",
          event_time: "11:00:00",
          location: "Engineering Auditorium",
          category: "Academic",
          status: "Upcoming",
          created_at: "2026-07-01T08:00:00.000Z",
        },
      ];
    },
  });

  assert.equal(events.length, 1);
  assert.equal(events[0].eventName, "Database Event");
});

test("event store reports read-only sample mode without database config", () => {
  assert.deepEqual(getEventStoreStatus({}), {
    mode: "sample",
    isReadOnly: true,
  });
});
