const POSTGRES_EVENTS_QUERY =
  "select e.id, e.event_name, e.organizer, e.description, e.event_date, e.event_time, e.event_end_time, e.location, e.category, e.status, e.created_at, e.participant_limit, e.event_image_path, e.created_by_user_id, (select count(*)::int from event_participants where event_id = e.id) as participant_count from events e order by e.created_at desc, e.id desc";
const POSTGRES_CREATE_EVENT_QUERY =
  "insert into events (event_name, organizer, description, event_date, event_time, event_end_time, location, category, status, participant_limit, event_image_path, created_by_user_id) values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) returning id";
const POSTGRES_UPDATE_EVENT_QUERY =
  "update events set event_name = $1, organizer = $2, description = $3, event_date = $4, event_time = $5, event_end_time = $6, location = $7, category = $8, status = $9, participant_limit = $10, event_image_path = coalesce($11, event_image_path) where id = $12";
const POSTGRES_DELETE_EVENT_QUERY = "delete from events where id = $1";
const POSTGRES_JOIN_EVENT_QUERY =
  "insert into event_participants (event_id, user_id) values ($1, $2) on conflict (event_id, user_id) do nothing";
const POSTGRES_LEAVE_EVENT_QUERY =
  "delete from event_participants where event_id = $1 and user_id = $2";

export function getPostgresEventsQuery() {
  return POSTGRES_EVENTS_QUERY;
}

export function getPostgresCreateEventStatement(input) {
  return {
    sql: POSTGRES_CREATE_EVENT_QUERY,
    values: getCreateEventValues(input),
  };
}

export function getPostgresUpdateEventStatement(id, input) {
  return {
    sql: POSTGRES_UPDATE_EVENT_QUERY,
    values: [...getEventValues(input), Number(id)],
  };
}

export function createPostgresEventReader({ createClient = createPostgresClient } = {}) {
  return async function readPostgresEvents(url) {
    const client = await createClient(url);
    await client.connect();

    try {
      const result = await client.query(getPostgresEventsQuery());
      return result.rows.map(normalizePostgresEventRow);
    } finally {
      await client.end();
    }
  };
}

export const readPostgresEvents = createPostgresEventReader();

export function createPostgresEventWriter({ createClient = createPostgresClient } = {}) {
  async function executeStatement(url, sql, values = []) {
    const client = await createClient(url);
    await client.connect();

    try {
      return await client.query(sql, values);
    } finally {
      await client.end();
    }
  }

  return {
    async createEvent(url, input) {
      const statement = getPostgresCreateEventStatement(input);
      const result = await executeStatement(url, statement.sql, statement.values);

      return {
        id: Number(result.rows[0].id),
      };
    },
    async updateEvent(url, id, input) {
      const statement = getPostgresUpdateEventStatement(id, input);
      const result = await executeStatement(url, statement.sql, statement.values);

      return {
        affectedRows: result.rowCount,
      };
    },
    async deleteEvent(url, id) {
      const result = await executeStatement(url, POSTGRES_DELETE_EVENT_QUERY, [Number(id)]);

      return {
        affectedRows: result.rowCount,
      };
    },
    async joinEvent(url, eventId, userId) {
      await executeStatement(url, POSTGRES_JOIN_EVENT_QUERY, [Number(eventId), userId]);
    },
    async leaveEvent(url, eventId, userId) {
      await executeStatement(url, POSTGRES_LEAVE_EVENT_QUERY, [Number(eventId), userId]);
    },
  };
}

export const writePostgresEvents = createPostgresEventWriter();

async function createPostgresClient(url) {
  const { Client } = await import("pg");
  return new Client({ connectionString: url });
}

function getEventValues(input) {
  return [
    input.eventName,
    input.organizer,
    input.description,
    input.eventDate,
    input.eventTime,
    input.eventEndTime || null,
    input.location,
    input.category,
    input.status,
    input.participantLimit || null,
    input.eventImagePath || null,
  ];
}

function getCreateEventValues(input) {
  return [...getEventValues(input), input.createdByUserId || null];
}

function normalizePostgresEventRow(row) {
  return {
    ...row,
    id: Number(row.id),
    event_date: normalizeDateOnly(row.event_date),
    event_time: normalizeTimeOnly(row.event_time),
    event_end_time: normalizeOptionalTimeOnly(row.event_end_time),
    created_at: normalizeDateTime(row.created_at),
    participant_limit: row.participant_limit ?? null,
    participant_count: row.participant_count ?? 0,
    event_image_path: row.event_image_path ?? null,
  };
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

function normalizeOptionalTimeOnly(value) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  return normalizeTimeOnly(value);
}

function normalizeDateTime(value) {
  if (value instanceof Date) {
    return value.toISOString();
  }

  return String(value);
}
