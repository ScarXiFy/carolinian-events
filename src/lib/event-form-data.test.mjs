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
  formData.set("contact_email", "research@usc.edu.ph");
  formData.set("contact_phone", "09171234567");
  formData.set("status", "Completed");
  formData.set("participant_limit", "80");
  formData.set(
    "event_image",
    new File(["fake image"], "poster.png", { type: "image/png" }),
  );

  const parsed = parseEventFormData(formData, new Date("2026-06-01T08:00:00"));

  assert.deepEqual(
    {
      ...parsed,
      imageFile: parsed.imageFile
        ? {
            name: parsed.imageFile.name,
            type: parsed.imageFile.type,
            size: parsed.imageFile.size,
          }
        : null,
    },
    {
    eventName: "Research Colloquium",
    organizer: "CPE Department",
    description: "Project sharing.",
    eventDate: "2026-07-01",
    eventTime: "09:30",
    eventEndTime: "11:00",
    location: "Bunzel Building",
    category: "Academic",
    status: "Upcoming",
    participantLimit: 80,
    contactEmail: "research@usc.edu.ph",
    contactPhone: "09171234567",
    eventImagePath: "",
    eventImagePaths: [],
    imageFile: {
      name: "poster.png",
      type: "image/png",
      size: 10,
    },
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
  formData.set("contact_email", "demo@usc.edu.ph");
  formData.set("contact_phone", "+639171234567");

  const parsed = parseEventFormData(formData, new Date("2026-05-27T12:00:00"));

  assert.equal(parsed.location, "NCR Lab");
  assert.equal(parsed.category, "Research");
  assert.equal(parsed.status, "Ongoing");
  assert.equal(parsed.participantLimit, null);
  assert.equal(parsed.imageFile, null);
});

test("parseEventFormData rejects invalid participant limits when required", () => {
  const formData = new FormData();
  formData.set("contact_email", "events@usc.edu.ph");
  formData.set("contact_phone", "09171234567");
  formData.set("participant_limit", "0");

  assert.throws(
    () => parseEventFormData(formData, new Date(), { requireParticipantLimit: true }),
    /Max participants must be a positive whole number/,
  );
});

test("parseEventFormData rejects missing image uploads when required", () => {
  const formData = new FormData();
  formData.set("contact_email", "events@usc.edu.ph");
  formData.set("contact_phone", "09171234567");

  assert.throws(
    () => parseEventFormData(formData, new Date(), { requireImage: true }),
    /Event image is required/,
  );
});

test("parseEventFormData accepts contact details and stored image lists", () => {
  const formData = new FormData();
  formData.set("contact_email", "events@usc.edu.ph");
  formData.set("contact_phone", "+639171234567");
  formData.set("event_image_paths", JSON.stringify(["https://cdn.example/a.png", "https://cdn.example/b.png"]));

  const parsed = parseEventFormData(formData, new Date());

  assert.equal(parsed.contactEmail, "events@usc.edu.ph");
  assert.equal(parsed.contactPhone, "+639171234567");
  assert.equal(parsed.eventImagePath, "https://cdn.example/a.png");
  assert.deepEqual(parsed.eventImagePaths, ["https://cdn.example/a.png", "https://cdn.example/b.png"]);
});

test("parseEventFormData rejects invalid contact details", () => {
  const formData = new FormData();
  formData.set("contact_email", "not-email");
  assert.throws(() => parseEventFormData(formData), /valid email/);

  const phoneData = new FormData();
  phoneData.set("contact_email", "events@usc.edu.ph");
  phoneData.set("contact_phone", "12345");
  assert.throws(() => parseEventFormData(phoneData), /Philippine mobile number/);
});

test("parseEventFormData requires contact details", () => {
  const missingEmail = new FormData();
  missingEmail.set("contact_phone", "09171234567");
  assert.throws(() => parseEventFormData(missingEmail), /Contact email is required/);

  const missingPhone = new FormData();
  missingPhone.set("contact_email", "events@usc.edu.ph");
  assert.throws(() => parseEventFormData(missingPhone), /Contact cellphone is required/);
});
