import { computeEventStatus } from "./events.mjs";

export function parseEventFormData(formData, now = new Date()) {
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
