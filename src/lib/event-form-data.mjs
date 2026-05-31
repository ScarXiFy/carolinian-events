import { computeEventStatus } from "./events.mjs";

export function parseEventFormData(formData, now = new Date(), options = {}) {
  const eventDate = getFormValue(formData, "event_date");
  const eventTime = getFormValue(formData, "event_time");
  const eventEndTime = getFormValue(formData, "event_end_time");

  return {
    eventName: getFormValue(formData, "event_name"),
    organizer: getFormValue(formData, "organizer"),
    description: getFormValue(formData, "description"),
    eventDate,
    eventTime,
    eventEndTime,
    location: getSelectOrOtherValue(formData, "location_select", "location_other"),
    category: getSelectOrOtherValue(formData, "category_select", "category_other"),
    status: computeEventStatus(eventDate, eventTime, eventEndTime, now),
    participantLimit: getParticipantLimit(formData, options),
    imageFile: getImageFile(formData, options),
    eventImagePath: getFormValue(formData, "event_image_path"),
  };
}

function getFormValue(formData, key) {
  return String(formData.get(key) ?? "").trim();
}

function getSelectOrOtherValue(formData, selectKey, otherKey) {
  const selected = getFormValue(formData, selectKey);

  if (selected === "Other") {
    return getFormValue(formData, otherKey);
  }

  return selected;
}

function getParticipantLimit(formData, options = {}) {
  const rawValue = getFormValue(formData, "participant_limit");

  if (!rawValue) {
    if (options.requireParticipantLimit) {
      throw new Error("Max participants must be a positive whole number.");
    }

    return null;
  }

  const parsedValue = Number.parseInt(rawValue, 10);

  if (!Number.isInteger(parsedValue) || parsedValue <= 0 || String(parsedValue) !== rawValue) {
    throw new Error("Max participants must be a positive whole number.");
  }

  return parsedValue;
}

function getImageFile(formData, options = {}) {
  const file = formData.get("event_image");
  const hasFile =
    file &&
    typeof file === "object" &&
    "name" in file &&
    "size" in file &&
    file.name &&
    file.size > 0;

  if (!hasFile) {
    if (options.requireImage && !getFormValue(formData, "event_image_path")) {
      throw new Error("Event image is required.");
    }

    return null;
  }

  return file;
}
