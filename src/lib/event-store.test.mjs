import test from "node:test";
import assert from "node:assert/strict";

import {
  getAllEvents,
  getEventByRouteId,
  getEventStaticParams,
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

test("event store exposes sample events through route-friendly helpers", () => {
  assert.ok(getAllEvents().length > 0);
  assert.equal(getEventByRouteId("2").eventName, "Proposal Hearing 2026");
  assert.deepEqual(getEventStaticParams()[0], { id: "1" });
});
