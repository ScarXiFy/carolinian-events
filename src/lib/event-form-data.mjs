import { computeEventStatus } from "./events.mjs";

export function parseEventFormData(formData, now = new Date(), options = {}) {
  const eventDate = getFormValue(formData, "event_date");
  const eventTime = getFormValue(formData, "event_time");
  const eventEndTime = getFormValue(formData, "event_end_time");
  const eventImagePaths = getEventImagePaths(formData, options);
  const contactEmail = getOptionalEmail(formData, "contact_email");
  const contactPhone = getOptionalPhilippinePhone(formData, "contact_phone");

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
    contactEmail,
    contactPhone,
    imageFile: getImageFile(formData, options),
    eventImagePath: eventImagePaths[0] ?? "",
    eventImagePaths,
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
    if (options.requireImage && getEventImagePaths(formData).length === 0) {
      throw new Error("Event image is required.");
    }

    return null;
  }

  return file;
}

function getEventImagePaths(formData, options = {}) {
  const values = [];
  const jsonValue = getFormValue(formData, "event_image_paths");
  const singleValue = getFormValue(formData, "event_image_path");

  if (jsonValue) {
    try {
      const parsed = JSON.parse(jsonValue);
      if (!Array.isArray(parsed)) {
        throw new Error("Event images must be a list.");
      }
      values.push(...parsed);
    } catch {
      throw new Error("Event image list is invalid.");
    }
  }

  if (singleValue) {
    values.push(singleValue);
  }

  const paths = [...new Set(values.map((value) => String(value ?? "").trim()).filter(Boolean))];

  if (options.requireImage && paths.length === 0) {
    throw new Error("Event image is required.");
  }

  return paths;
}

function getOptionalEmail(formData, key) {
  const value = getFormValue(formData, key);
  if (!value) {
    throw new Error("Contact email is required.");
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    throw new Error("Contact email must be a valid email address.");
  }

  return value;
}

function getOptionalPhilippinePhone(formData, key) {
  const value = getFormValue(formData, key);
  if (!value) {
    throw new Error("Contact cellphone is required.");
  }

  const compact = value.replace(/[\s-]/g, "");
  if (/^09\d{9}$/.test(compact)) return compact;
  if (/^\+639\d{9}$/.test(compact)) return compact;
  if (/^639\d{9}$/.test(compact)) return `+${compact}`;

  throw new Error("Contact cellphone must use a valid Philippine mobile number.");
}
