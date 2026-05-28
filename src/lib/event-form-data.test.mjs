import test from "node:test";
import assert from "node:assert/strict";

import { parseEventFormData } from "./event-form-data.mjs";

test("parseEventFormData maps create form fields to an event input", () => {
  const formData = new FormData();
  formData.set("event_name", "Research Colloquium");
  formData.set("organizer", "CPE Department");
  formData.set("description", "Project sharing.");
  formData.set("event_date", "2026-07-01");
  formData.set("event_time", "09:30");
  formData.set("event_end_time", "11:00");
  formData.set("location_select", "Bunzel Building");
  formData.set("category_select", "Academic");
  formData.set("status", "Completed");

  assert.deepEqual(parseEventFormData(formData, new Date("2026-06-01T08:00:00")), {
    eventName: "Research Colloquium",
    organizer: "CPE Department",
    description: "Project sharing.",
    eventDate: "2026-07-01",
    eventTime: "09:30",
    eventEndTime: "11:00",
    location: "Bunzel Building",
    category: "Academic",
    status: "Upcoming",
  });
});

test("parseEventFormData uses custom Other fields", () => {
  const formData = new FormData();
  formData.set("event_name", "Community Demo");
  formData.set("organizer", "CPE Society");
  formData.set("event_date", "2026-05-27");
  formData.set("event_time", "11:30");
  formData.set("event_end_time", "12:30");
  formData.set("location_select", "Other");
  formData.set("location_other", "NCR Lab");
  formData.set("category_select", "Other");
  formData.set("category_other", "Research");

  const parsed = parseEventFormData(formData, new Date("2026-05-27T12:00:00"));

  assert.equal(parsed.location, "NCR Lab");
  assert.equal(parsed.category, "Research");
  assert.equal(parsed.status, "Ongoing");
});
