import test from "node:test";
import assert from "node:assert/strict";

import {
  createEvent,
  deleteEvent,
  getAllEvents,
  getEventByRouteId,
  getEventStaticParams,
  getEventStoreStatus,
  mapLegacyEventRow,
  updateEvent,
} from "./event-store.mjs";

test("mapLegacyEventRow converts legacy database fields to app event fields", () => {
  const row = {
    id: 7,
    event_name: "Research Colloquium",
    organizer: "CPE Department",
    description: "Project research sharing.",
    event_date: "2026-07-01",
    event_time: "09:30:00",
    event_end_time: "11:30:00",
    location: "Bunzel Building",
    category: "Academic",
    status: "Upcoming",
    created_at: "2026-06-01T08:00:00.000Z",
    participant_limit: 80,
    participant_count: 12,
    event_image_path: "/uploads/events/poster.png",
  };

  assert.deepEqual(mapLegacyEventRow(row), {
    id: 7,
    eventName: "Research Colloquium",
    organizer: "CPE Department",
    description: "Project research sharing.",
    eventDate: "2026-07-01",
    eventTime: "09:30:00",
    eventEndTime: "11:30:00",
    location: "Bunzel Building",
    category: "Academic",
    status: "Upcoming",
    createdAt: "2026-06-01T08:00:00.000Z",
    participantLimit: 80,
    participantCount: 12,
    eventImagePath: "/uploads/events/poster.png",
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
          event_end_time: "13:00:00",
          location: "Engineering Auditorium",
          category: "Academic",
          status: "Upcoming",
          created_at: "2026-07-01T08:00:00.000Z",
          participant_limit: null,
          participant_count: 0,
          event_image_path: null,
        },
      ];
    },
  });

  assert.equal(events.length, 1);
  assert.equal(events[0].eventName, "Database Event");
  assert.equal(events[0].participantLimit, null);
  assert.equal(events[0].participantCount, 0);
});

test("createEvent writes to MySQL when DATABASE_URL is configured", async () => {
  const created = await createEvent(
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
    },
    {
      env: { DATABASE_URL: "mysql://root@localhost:3306/carolinian_events_db" },
      writeDatabaseEvents: {
        createEvent: async (url, input) => {
          assert.equal(url, "mysql://root@localhost:3306/carolinian_events_db");
          assert.equal(input.eventName, "Research Colloquium");
          return { id: 12 };
        },
      },
    },
  );

  assert.deepEqual(created, { mode: "database", id: 12 });
});

test("createEvent stays in preview mode when DATABASE_URL is missing", async () => {
  const created = await createEvent(
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
    },
    { env: {} },
  );

  assert.deepEqual(created, { mode: "sample", id: null });
});

test("updateEvent writes to MySQL when DATABASE_URL is configured", async () => {
  const updated = await updateEvent(
    12,
    {
      eventName: "Updated Colloquium",
      organizer: "CPE Department",
      description: "Updated details.",
      eventDate: "2026-07-01",
      eventTime: "09:30",
      eventEndTime: "11:30",
      location: "Bunzel Building",
      category: "Academic",
      status: "Upcoming",
    },
    {
      env: { DATABASE_URL: "mysql://root@localhost:3306/carolinian_events_db" },
      writeDatabaseEvents: {
        updateEvent: async (url, id, input) => {
          assert.equal(url, "mysql://root@localhost:3306/carolinian_events_db");
          assert.equal(id, 12);
          assert.equal(input.eventName, "Updated Colloquium");
          return { affectedRows: 1 };
        },
      },
    },
  );

  assert.deepEqual(updated, { mode: "database", affectedRows: 1 });
});

test("updateEvent stays in preview mode when DATABASE_URL is missing", async () => {
  const updated = await updateEvent(
    12,
    {
      eventName: "Updated Colloquium",
      organizer: "CPE Department",
      description: "Updated details.",
      eventDate: "2026-07-01",
      eventTime: "09:30",
      eventEndTime: "11:30",
      location: "Bunzel Building",
      category: "Academic",
      status: "Upcoming",
    },
    { env: {} },
  );

  assert.deepEqual(updated, { mode: "sample", affectedRows: 0 });
});

test("deleteEvent deletes from MySQL when DATABASE_URL is configured", async () => {
  const deleted = await deleteEvent(12, {
    env: { DATABASE_URL: "mysql://root@localhost:3306/carolinian_events_db" },
    writeDatabaseEvents: {
      deleteEvent: async (url, id) => {
        assert.equal(url, "mysql://root@localhost:3306/carolinian_events_db");
        assert.equal(id, 12);
        return { affectedRows: 1 };
      },
    },
  });

  assert.deepEqual(deleted, { mode: "database", affectedRows: 1 });
});

test("deleteEvent stays in preview mode when DATABASE_URL is missing", async () => {
  const deleted = await deleteEvent(12, { env: {} });

  assert.deepEqual(deleted, { mode: "sample", affectedRows: 0 });
});

test("event store reports read-only sample mode without database config", () => {
  assert.deepEqual(getEventStoreStatus({}), {
    mode: "sample",
    isReadOnly: true,
  });
});

test("event store reports writable database mode with database config", () => {
  assert.deepEqual(
    getEventStoreStatus({ DATABASE_URL: "mysql://root@localhost:3306/carolinian_events_db" }),
    {
      mode: "database-ready",
      isReadOnly: false,
    },
  );
});
