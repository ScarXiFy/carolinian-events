import test from "node:test";
import assert from "node:assert/strict";

import {
  EVENT_SORTS,
  CATEGORY_OPTIONS,
  LOCATION_OPTIONS,
  computeEventStatus,
  getDeleteConfirmationMessage,
  getEventById,
  getSelectWithCustomValue,
  getEventStats,
  getFeaturedEvents,
  getVisibleEvents,
} from "./events.mjs";

test("getEventStats counts the legacy dashboard status groups", () => {
  const events = [
    { status: "Upcoming" },
    { status: "Ongoing" },
    { status: "Completed" },
    { status: "Cancelled" },
    { status: "Upcoming" },
  ];

  assert.deepEqual(getEventStats(events), {
    total: 5,
    upcoming: 2,
    ongoing: 1,
    completed: 1,
  });
});

test("getVisibleEvents searches event names and locations", () => {
  const events = [
    { eventName: "Proposal Hearing", location: "Bunzel Building", createdAt: "2026-05-01T00:00:00.000Z", id: 1 },
    { eventName: "Tech Talk", location: "Engineering Auditorium", createdAt: "2026-05-02T00:00:00.000Z", id: 2 },
  ];

  const visible = getVisibleEvents(events, { search: "bunzel", sort: "date_desc" });

  assert.equal(visible.length, 1);
  assert.equal(visible[0].eventName, "Proposal Hearing");
});

test("getVisibleEvents sorts by legacy dashboard options", () => {
  const events = [
    { id: 1, eventName: "B Event", location: "Main", createdAt: "2026-05-01T00:00:00.000Z" },
    { id: 2, eventName: "A Event", location: "Main", createdAt: "2026-05-02T00:00:00.000Z" },
  ];

  assert.equal(getVisibleEvents(events, { sort: EVENT_SORTS.NAME_ASC })[0].eventName, "A Event");
  assert.equal(getVisibleEvents(events, { sort: EVENT_SORTS.DATE_DESC })[0].id, 2);
});

test("getFeaturedEvents returns the soonest events first", () => {
  const events = [
    { eventName: "Later", eventDate: "2026-06-01", eventTime: "10:00:00" },
    { eventName: "Sooner", eventDate: "2026-05-01", eventTime: "10:00:00" },
  ];

  assert.equal(getFeaturedEvents(events, 1)[0].eventName, "Sooner");
});

test("getEventById finds an event by numeric route id", () => {
  const events = [
    { id: 1, eventName: "Mock Presentation" },
    { id: 2, eventName: "Proposal Hearing" },
  ];

  assert.equal(getEventById(events, "2").eventName, "Proposal Hearing");
});

test("getEventById returns undefined for invalid or missing ids", () => {
  const events = [{ id: 1, eventName: "Mock Presentation" }];

  assert.equal(getEventById(events, "missing"), undefined);
  assert.equal(getEventById(events, "99"), undefined);
});

test("legacy create form option lists include Other choices", () => {
  assert.ok(LOCATION_OPTIONS.includes("Bunzel Building"));
  assert.ok(LOCATION_OPTIONS.includes("Other"));
  assert.ok(CATEGORY_OPTIONS.includes("Academic"));
  assert.ok(CATEGORY_OPTIONS.includes("Other"));
});

test("computeEventStatus uses start and end times for event windows", () => {
  const now = new Date("2026-05-27T12:00:00");

  assert.equal(computeEventStatus("2026-05-26", "13:00", "14:00", now), "Completed");
  assert.equal(computeEventStatus("2026-05-27", "11:00", "11:59", now), "Completed");
  assert.equal(computeEventStatus("2026-05-27", "11:30", "12:30", now), "Ongoing");
  assert.equal(computeEventStatus("2026-05-28", "08:00", "09:00", now), "Upcoming");
  assert.equal(computeEventStatus("2026-05-28", "08:00", "", now), "Upcoming");
});

test("getSelectWithCustomValue resolves preset values for edit forms", () => {
  assert.deepEqual(getSelectWithCustomValue(LOCATION_OPTIONS, "Bunzel Building"), {
    selectValue: "Bunzel Building",
    customValue: "",
  });
});

test("getSelectWithCustomValue resolves custom values as Other for edit forms", () => {
  assert.deepEqual(getSelectWithCustomValue(LOCATION_OPTIONS, "NCR Lab"), {
    selectValue: "Other",
    customValue: "NCR Lab",
  });
});

test("getSelectWithCustomValue keeps blank create form values empty", () => {
  assert.deepEqual(getSelectWithCustomValue(LOCATION_OPTIONS, ""), {
    selectValue: "",
    customValue: "",
  });
  assert.deepEqual(getSelectWithCustomValue(LOCATION_OPTIONS, undefined), {
    selectValue: "",
    customValue: "",
  });
});

test("getDeleteConfirmationMessage mirrors the legacy delete warning", () => {
  assert.equal(
    getDeleteConfirmationMessage({ eventName: "Proposal Hearing 2026" }),
    'Are you sure you want to delete "Proposal Hearing 2026"? This action cannot be undone.',
  );
});
