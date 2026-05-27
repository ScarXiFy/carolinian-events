import { getEventById, sampleEvents } from "./events.mjs";

const legacyEventRows = sampleEvents.map((event) => ({
  id: event.id,
  event_name: event.eventName,
  organizer: event.organizer,
  description: event.description,
  event_date: event.eventDate,
  event_time: event.eventTime,
  location: event.location,
  category: event.category,
  status: event.status,
  created_at: event.createdAt,
}));

export function mapLegacyEventRow(row) {
  return {
    id: row.id,
    eventName: row.event_name,
    organizer: row.organizer,
    description: row.description,
    eventDate: row.event_date,
    eventTime: row.event_time,
    location: row.location,
    category: row.category,
    status: row.status,
    createdAt: row.created_at,
  };
}

export function getAllEvents() {
  return legacyEventRows.map(mapLegacyEventRow);
}

export function getEventByRouteId(id) {
  return getEventById(getAllEvents(), id);
}

export function getEventStaticParams() {
  return getAllEvents().map((event) => ({
    id: String(event.id),
  }));
}
