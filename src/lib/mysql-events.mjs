const EVENTS_QUERY =
  "SELECT id, event_name, organizer, description, event_date, event_time, event_end_time, location, category, status, created_at FROM events ORDER BY created_at DESC, id DESC";
const LEGACY_EVENTS_QUERY =
  "SELECT id, event_name, organizer, description, event_date, event_time, location, category, status, created_at FROM events ORDER BY created_at DESC, id DESC";
const CREATE_EVENT_QUERY =
  "INSERT INTO events (event_name, organizer, description, event_date, event_time, event_end_time, location, category, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
const LEGACY_CREATE_EVENT_QUERY =
  "INSERT INTO events (event_name, organizer, description, event_date, event_time, location, category, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
const UPDATE_EVENT_QUERY =
  "UPDATE events SET event_name = ?, organizer = ?, description = ?, event_date = ?, event_time = ?, event_end_time = ?, location = ?, category = ?, status = ? WHERE id = ?";
const LEGACY_UPDATE_EVENT_QUERY =
  "UPDATE events SET event_name = ?, organizer = ?, description = ?, event_date = ?, event_time = ?, location = ?, category = ?, status = ? WHERE id = ?";
const DELETE_EVENT_QUERY = "DELETE FROM events WHERE id = ?";

export function getEventsQuery() {
  return EVENTS_QUERY;
}

export function normalizeMysqlEventRow(row) {
  return {
    ...row,
    event_date: normalizeDateOnly(row.event_date),
    event_time: normalizeTimeOnly(row.event_time),
    event_end_time: normalizeOptionalTimeOnly(row.event_end_time),
    created_at: normalizeDateTime(row.created_at),
  };
}

export function getCreateEventStatement(input) {
  return {
    sql: CREATE_EVENT_QUERY,
    values: getEventValues(input),
  };
}

export function getLegacyCreateEventStatement(input) {
  return {
    sql: LEGACY_CREATE_EVENT_QUERY,
    values: getLegacyEventValues(input),
  };
}

export function getUpdateEventStatement(id, input) {
  return {
    sql: UPDATE_EVENT_QUERY,
    values: [...getEventValues(input), Number(id)],
  };
}

export function getLegacyUpdateEventStatement(id, input) {
  return {
    sql: LEGACY_UPDATE_EVENT_QUERY,
    values: [...getLegacyEventValues(input), Number(id)],
  };
}

export function getDeleteEventStatement(id) {
  return {
    sql: DELETE_EVENT_QUERY,
    values: [Number(id)],
  };
}

export function createMysqlEventReader({ createConnection = createMysqlConnection } = {}) {
  return async function readMysqlEvents(url) {
    const connection = await createConnection(url);

    try {
      let rows;

      try {
        [rows] = await connection.query(getEventsQuery());
      } catch (error) {
        if (
          typeof error === "object" &&
          error !== null &&
          "code" in error &&
          error.code === "ER_BAD_FIELD_ERROR"
        ) {
          [rows] = await connection.query(LEGACY_EVENTS_QUERY);
          rows = rows.map((row) => ({ ...row, event_end_time: null }));
        } else {
          throw error;
        }
      }
      return rows.map(normalizeMysqlEventRow);
    } finally {
      await connection.end();
    }
  };
}

export const readMysqlEvents = createMysqlEventReader();

export function createMysqlEventWriter({ createConnection = createMysqlConnection } = {}) {
  function isMissingColumnError(error) {
    return (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "ER_BAD_FIELD_ERROR"
    );
  }

  async function executeStatement(url, statement, legacyStatement) {
    const connection = await createConnection(url);

    try {
      try {
        const [result] = await connection.execute(statement.sql, statement.values);
        return result;
      } catch (error) {
        if (legacyStatement && isMissingColumnError(error)) {
          const [result] = await connection.execute(legacyStatement.sql, legacyStatement.values);
          return result;
        }
        throw error;
      }
    } finally {
      await connection.end();
    }
  }

  return {
    async createEvent(url, input) {
      const result = await executeStatement(
        url,
        getCreateEventStatement(input),
        getLegacyCreateEventStatement(input)
      );
      return {
        id: result.insertId,
      };
    },
    async updateEvent(url, id, input) {
      const result = await executeStatement(
        url,
        getUpdateEventStatement(id, input),
        getLegacyUpdateEventStatement(id, input)
      );
      return {
        affectedRows: result.affectedRows,
      };
    },
    async deleteEvent(url, id) {
      const result = await executeStatement(url, getDeleteEventStatement(id));
      return {
        affectedRows: result.affectedRows,
      };
    },
  };
}

export const writeMysqlEvents = createMysqlEventWriter();

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

function getEventValues(input) {
  return [
    input.eventName,
    input.organizer,
    input.description,
    input.eventDate,
    input.eventTime,
    input.eventEndTime,
    input.location,
    input.category,
    input.status,
  ];
}

function getLegacyEventValues(input) {
  return [
    input.eventName,
    input.organizer,
    input.description,
    input.eventDate,
    input.eventTime,
    input.location,
    input.category,
    input.status,
  ];
}

function normalizeOptionalTimeOnly(value) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  return normalizeTimeOnly(value);
}
