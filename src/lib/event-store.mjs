import { getEventById, getNormalizedEventStatus, sampleEvents } from "./events.mjs";
import { getDatabaseConfig, getEventStoreMode } from "./database-config.mjs";
import { readMysqlEvents, writeMysqlEvents } from "./mysql-events.mjs";
import { readPostgresEvents, writePostgresEvents } from "./postgres-events.mjs";

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
  const imagePaths = normalizeImagePaths(row.event_image_paths, row.event_image_path);
  const mapped = {
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
    eventImagePath: imagePaths[0] ?? null,
    eventImagePaths: imagePaths,
    contactEmail: row.contact_email ?? "",
    contactPhone: row.contact_phone ?? "",
    createdByUserId: row.created_by_user_id ?? null,
  };

  return {
    ...mapped,
    status: getNormalizedEventStatus(mapped),
  };
}

export async function getAllEvents({
  env = process.env,
  readDatabaseEvents,
  readMysqlEvents: mysqlReader = readMysqlEvents,
  readPostgresEvents: postgresReader = readPostgresEvents,
  writeMysqlEvents: mysqlWriter = writeMysqlEvents,
  writePostgresEvents: postgresWriter = writePostgresEvents,
} = {}) {
  const config = getDatabaseConfig(env);
  const activeReader =
    readDatabaseEvents ??
    (config.provider === "postgres" ? postgresReader : mysqlReader);
  if (
    config.isConfigured &&
    !readDatabaseEvents &&
    mysqlReader === readMysqlEvents &&
    postgresReader === readPostgresEvents
  ) {
    await completeExpiredEvents({ env, writeMysqlEvents: mysqlWriter, writePostgresEvents: postgresWriter });
  }
  const rows = config.isConfigured ? await activeReader(config.url) : legacyEventRows;

  return rows.map(mapLegacyEventRow);
}

export async function completeExpiredEvents({
  env = process.env,
  writeDatabaseEvents,
  writeMysqlEvents: mysqlWriter = writeMysqlEvents,
  writePostgresEvents: postgresWriter = writePostgresEvents,
  now = new Date(),
} = {}) {
  const config = getDatabaseConfig(env);

  if (!config.isConfigured) {
    return { mode: "sample", affectedRows: 0 };
  }

  const activeWriter =
    writeDatabaseEvents ??
    (config.provider === "postgres" ? postgresWriter : mysqlWriter);

  if (!activeWriter.completeExpiredEvents) {
    return { mode: "database", affectedRows: 0 };
  }

  const result = await activeWriter.completeExpiredEvents(config.url, now);

  return {
    mode: "database",
    affectedRows: result.affectedRows ?? 0,
  };
}

export async function getEventByRouteId(id, options) {
  return getEventById(await getAllEvents(options), id);
}

function normalizeImagePaths(value, fallback) {
  const rawValues = [];

  if (Array.isArray(value)) {
    rawValues.push(...value);
  } else if (typeof value === "string" && value.trim()) {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        rawValues.push(...parsed);
      } else {
        rawValues.push(...value.split(/\r?\n/));
      }
    } catch {
      rawValues.push(...value.split(/\r?\n/));
    }
  }

  if (fallback) {
    rawValues.unshift(fallback);
  }

  return [...new Set(rawValues.map((item) => String(item ?? "").trim()).filter(Boolean))];
}

export async function getEventStaticParams(options) {
  try {
    return (await getAllEvents(options)).map((event) => ({
      id: String(event.id),
    }));
  } catch {
    return [];
  }
}

export async function createEvent(
  input,
  {
    env = process.env,
    writeDatabaseEvents,
    writeMysqlEvents: mysqlWriter = writeMysqlEvents,
    writePostgresEvents: postgresWriter = writePostgresEvents,
  } = {},
) {
  const config = getDatabaseConfig(env);

  if (!config.isConfigured) {
    return {
      mode: "sample",
      id: null,
    };
  }

  const activeWriter =
    writeDatabaseEvents ??
    (config.provider === "postgres" ? postgresWriter : mysqlWriter);
  const created = await activeWriter.createEvent(config.url, input);

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
    writeDatabaseEvents,
    writeMysqlEvents: mysqlWriter = writeMysqlEvents,
    writePostgresEvents: postgresWriter = writePostgresEvents,
  } = {},
) {
  const config = getDatabaseConfig(env);

  if (!config.isConfigured) {
    return {
      mode: "sample",
      affectedRows: 0,
    };
  }

  const activeWriter =
    writeDatabaseEvents ??
    (config.provider === "postgres" ? postgresWriter : mysqlWriter);
  const updated = await activeWriter.updateEvent(config.url, Number(id), input);

  return {
    mode: "database",
    affectedRows: updated.affectedRows,
  };
}

export async function deleteEvent(
  id,
  {
    env = process.env,
    writeDatabaseEvents,
    writeMysqlEvents: mysqlWriter = writeMysqlEvents,
    writePostgresEvents: postgresWriter = writePostgresEvents,
  } = {},
) {
  const config = getDatabaseConfig(env);

  if (!config.isConfigured) {
    return {
      mode: "sample",
      affectedRows: 0,
    };
  }

  const activeWriter =
    writeDatabaseEvents ??
    (config.provider === "postgres" ? postgresWriter : mysqlWriter);
  const deleted = await activeWriter.deleteEvent(config.url, Number(id));

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
