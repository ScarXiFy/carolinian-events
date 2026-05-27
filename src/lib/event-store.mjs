import { getEventById, sampleEvents } from "./events.mjs";
import { getDatabaseConfig, getEventStoreMode } from "./database-config.mjs";
import { readMysqlEvents } from "./mysql-events.mjs";

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

export async function getAllEvents({
  env = process.env,
  readDatabaseEvents = readMysqlEvents,
} = {}) {
  const config = getDatabaseConfig(env);
  const rows = config.isConfigured
    ? await readDatabaseEvents(config.url)
    : legacyEventRows;

  return rows.map(mapLegacyEventRow);
}

export async function getEventByRouteId(id, options) {
  return getEventById(await getAllEvents(options), id);
}

export async function getEventStaticParams(options) {
  return (await getAllEvents(options)).map((event) => ({
    id: String(event.id),
  }));
}

export function getEventStoreStatus(env = process.env) {
  return {
    mode: getEventStoreMode(env),
    isReadOnly: true,
  };
}
