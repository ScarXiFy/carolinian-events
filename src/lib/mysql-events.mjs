const EVENTS_QUERY =
  "SELECT id, event_name, organizer, description, event_date, event_time, location, category, status, created_at FROM events ORDER BY created_at DESC, id DESC";

export function getEventsQuery() {
  return EVENTS_QUERY;
}

export function normalizeMysqlEventRow(row) {
  return {
    ...row,
    event_date: normalizeDateOnly(row.event_date),
    event_time: normalizeTimeOnly(row.event_time),
    created_at: normalizeDateTime(row.created_at),
  };
}

export function createMysqlEventReader({ createConnection = createMysqlConnection } = {}) {
  return async function readMysqlEvents(url) {
    const connection = await createConnection(url);

    try {
      const [rows] = await connection.query(getEventsQuery());
      return rows.map(normalizeMysqlEventRow);
    } finally {
      await connection.end();
    }
  };
}

export const readMysqlEvents = createMysqlEventReader();

async function createMysqlConnection(url) {
  const mysql = await import("mysql2/promise");
  return mysql.createConnection(url);
}

function normalizeDateOnly(value) {
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }

  return String(value);
}

function normalizeTimeOnly(value) {
  if (value instanceof Date) {
    return value.toISOString().slice(11, 19);
  }

  return String(value);
}

function normalizeDateTime(value) {
  if (value instanceof Date) {
    return value.toISOString();
  }

  return String(value);
}
