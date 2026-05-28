import { getEventById, sampleEvents } from "./events.mjs";
import { getDatabaseConfig, getEventStoreMode } from "./database-config.mjs";
import { readMysqlEvents, writeMysqlEvents } from "./mysql-events.mjs";

const legacyEventRows = sampleEvents.map((event) => ({
  id: event.id,
  event_name: event.eventName,
  organizer: event.organizer,
  description: event.description,
  event_date: event.eventDate,
  event_time: event.eventTime,
  event_end_time: event.eventEndTime ?? null,
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
    eventEndTime: row.event_end_time ?? "",
    location: row.location,
    category: row.category,
    status: row.status,
    createdAt: row.created_at,
    participantLimit: row.participant_limit ?? null,
    participantCount: row.participant_count ?? 0,
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

export async function createEvent(
  input,
  {
    env = process.env,
    writeDatabaseEvents = writeMysqlEvents,
  } = {},
) {
  const config = getDatabaseConfig(env);

  if (!config.isConfigured) {
    return {
      mode: "sample",
      id: null,
    };
  }

  const created = await writeDatabaseEvents.createEvent(config.url, input);

  return {
    mode: "database",
    id: created.id,
  };
}

export async function updateEvent(
  id,
  input,
  {
    env = process.env,
    writeDatabaseEvents = writeMysqlEvents,
  } = {},
) {
  const config = getDatabaseConfig(env);

  if (!config.isConfigured) {
    return {
      mode: "sample",
      affectedRows: 0,
    };
  }

  const updated = await writeDatabaseEvents.updateEvent(config.url, Number(id), input);

  return {
    mode: "database",
    affectedRows: updated.affectedRows,
  };
}

export async function deleteEvent(
  id,
  {
    env = process.env,
    writeDatabaseEvents = writeMysqlEvents,
  } = {},
) {
  const config = getDatabaseConfig(env);

  if (!config.isConfigured) {
    return {
      mode: "sample",
      affectedRows: 0,
    };
  }

  const deleted = await writeDatabaseEvents.deleteEvent(config.url, Number(id));

  return {
    mode: "database",
    affectedRows: deleted.affectedRows,
  };
}

export function getEventStoreStatus(env = process.env) {
  const mode = getEventStoreMode(env);

  return {
    mode,
    isReadOnly: mode !== "database-ready",
  };
}
