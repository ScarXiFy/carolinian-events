const EVENTS_QUERY =
  "SELECT e.id, e.event_name, e.organizer, e.description, e.event_date, e.event_time, e.event_end_time, e.location, e.category, e.status, e.created_at, e.participant_limit, e.event_image_path, e.contact_email, e.contact_phone, e.created_by_user_id, e.approval_status, e.approved_by_user_id, e.approved_at, e.rejected_by_user_id, e.rejected_at, (SELECT GROUP_CONCAT(image_url ORDER BY sort_order ASC, id ASC SEPARATOR '\\n') FROM event_images WHERE event_id = e.id) as event_image_paths, (SELECT COUNT(*) FROM event_participants WHERE event_id = e.id) as participant_count FROM events e ORDER BY e.created_at DESC, e.id DESC";
const COMPAT_EVENTS_QUERY =
  "SELECT e.id, e.event_name, e.organizer, e.description, e.event_date, e.event_time, e.event_end_time, e.location, e.category, e.status, e.created_at, e.participant_limit, e.event_image_path, e.created_by_user_id, (SELECT COUNT(*) FROM event_participants WHERE event_id = e.id) as participant_count FROM events e ORDER BY e.created_at DESC, e.id DESC";
const LEGACY_EVENTS_QUERY =
  "SELECT id, event_name, organizer, description, event_date, event_time, location, category, status, created_at FROM events ORDER BY created_at DESC, id DESC";
const CREATE_EVENT_QUERY =
  "INSERT INTO events (event_name, organizer, description, event_date, event_time, event_end_time, location, category, status, participant_limit, event_image_path, contact_email, contact_phone, created_by_user_id, approval_status, approved_by_user_id, approved_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
const LEGACY_CREATE_EVENT_QUERY =
  "INSERT INTO events (event_name, organizer, description, event_date, event_time, location, category, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
const UPDATE_EVENT_QUERY =
  "UPDATE events SET event_name = ?, organizer = ?, description = ?, event_date = ?, event_time = ?, event_end_time = ?, location = ?, category = ?, status = ?, participant_limit = ?, event_image_path = COALESCE(?, event_image_path), contact_email = ?, contact_phone = ? WHERE id = ?";
const LEGACY_UPDATE_EVENT_QUERY =
  "UPDATE events SET event_name = ?, organizer = ?, description = ?, event_date = ?, event_time = ?, location = ?, category = ?, status = ? WHERE id = ?";
const DELETE_EVENT_QUERY = "DELETE FROM events WHERE id = ?";
const COMPLETE_EXPIRED_EVENTS_QUERY =
  "UPDATE events SET status = 'Completed' WHERE status IN ('Upcoming', 'Ongoing') AND event_end_time IS NOT NULL AND ? > TIMESTAMP(event_date, event_end_time)";

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
    participant_limit: row.participant_limit ?? null,
    participant_count: row.participant_count ?? 0,
    event_image_path: row.event_image_path ?? null,
    event_image_paths: row.event_image_paths ?? "",
    contact_email: row.contact_email ?? "",
    contact_phone: row.contact_phone ?? "",
    approval_status: row.approval_status ?? "Approved",
    approved_by_user_id: row.approved_by_user_id ?? null,
    approved_at: row.approved_at ? normalizeDateTime(row.approved_at) : null,
    rejected_by_user_id: row.rejected_by_user_id ?? null,
    rejected_at: row.rejected_at ? normalizeDateTime(row.rejected_at) : null,
  };
}

export function getCreateEventStatement(input) {
  return {
    sql: CREATE_EVENT_QUERY,
    values: getCreateEventValues(input),
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
          if (!isMissingSchemaError(error)) throw error;
          try {
            [rows] = await connection.query(COMPAT_EVENTS_QUERY);
          } catch (fallbackError) {
            if (!isMissingSchemaError(fallbackError)) throw fallbackError;
            [rows] = await connection.query(LEGACY_EVENTS_QUERY);
            rows = rows.map((row) => ({
              ...row,
              event_end_time: null,
              participant_limit: null,
              participant_count: 0,
              event_image_path: null,
              event_image_paths: null,
              contact_email: "",
              contact_phone: "",
              created_by_user_id: null,
            }));
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
    return isMissingSchemaError(error);
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
      await replaceEventImages(url, result.insertId, getInputImagePaths(input));
      return {
        id: result.insertId,
      };
    },
    async completeExpiredEvents(url, now) {
      const result = await executeStatement(url, {
        sql: COMPLETE_EXPIRED_EVENTS_QUERY,
        values: [formatDateTimeForSql(now)],
      });

      return {
        affectedRows: result.affectedRows,
      };
    },
    async updateEvent(url, id, input) {
      const result = await executeStatement(
        url,
        getUpdateEventStatement(id, input),
        getLegacyUpdateEventStatement(id, input)
      );
      await replaceEventImages(url, Number(id), getInputImagePaths(input));
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
    async joinEvent(url, eventId, userId) {
      const connection = await createConnection(url);
      try {
        await connection.execute("INSERT INTO event_participants (event_id, user_id) VALUES (?, ?)", [eventId, userId]);
      } catch(e) {
        if (e.code === 'ER_DUP_ENTRY') return; // already joined
        if (String(e.message || "").includes("Event Full")) throw new Error("Event Full");
        throw e;
      } finally {
        await connection.end();
      }
    },
    async leaveEvent(url, eventId, userId) {
      const connection = await createConnection(url);
      try {
        await connection.execute("DELETE FROM event_participants WHERE event_id = ? AND user_id = ?", [eventId, userId]);
      } finally {
        await connection.end();
      }
    },
    async approveEvent(url, eventId, adminUserId) {
      const result = await executeStatement(url, {
        sql: "UPDATE events SET approval_status = 'Approved', approved_by_user_id = ?, approved_at = CURRENT_TIMESTAMP, rejected_by_user_id = NULL, rejected_at = NULL WHERE id = ? AND approval_status = 'Pending'",
        values: [adminUserId, Number(eventId)],
      });
      return { affectedRows: result.affectedRows };
    },
    async rejectEvent(url, eventId, adminUserId) {
      const result = await executeStatement(url, {
        sql: "UPDATE events SET approval_status = 'Rejected', rejected_by_user_id = ?, rejected_at = CURRENT_TIMESTAMP WHERE id = ? AND approval_status = 'Pending'",
        values: [adminUserId, Number(eventId)],
      });
      return { affectedRows: result.affectedRows };
    },
  };

  async function replaceEventImages(url, eventId, imagePaths) {
    const connection = await createConnection(url);
    try {
      await connection.execute("DELETE FROM event_images WHERE event_id = ?", [eventId]);

      for (const [index, imageUrl] of imagePaths.entries()) {
        await connection.execute(
          "INSERT INTO event_images (event_id, image_url, sort_order) VALUES (?, ?, ?)",
          [eventId, imageUrl, index],
        );
      }
    } catch (error) {
      if (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        (error.code === "ER_NO_SUCH_TABLE" || error.code === "ER_BAD_FIELD_ERROR")
      ) {
        return;
      }
      throw error;
    } finally {
      await connection.end();
    }
  }
}

function isMissingSchemaError(error) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error.code === "ER_BAD_FIELD_ERROR" || error.code === "ER_NO_SUCH_TABLE")
  );
}

export const writeMysqlEvents = createMysqlEventWriter();

async function createMysqlConnection(url) {
  const mysql = await import("mysql2/promise");
  return mysql.createConnection(url);
}

function normalizeDateOnly(value) {
  if (value instanceof Date) {
    return formatLocalDateOnly(value);
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
    input.participantLimit || null,
    input.eventImagePath || null,
    input.contactEmail || null,
    input.contactPhone || null,
  ];
}

function getCreateEventValues(input) {
  const approvalStatus = input.approvalStatus || "Pending";
  return [
    ...getEventValues(input),
    input.createdByUserId || null,
    approvalStatus,
    input.approvedByUserId || null,
    input.approvedAt || null,
  ];
}

function getInputImagePaths(input) {
  const values = Array.isArray(input.eventImagePaths)
    ? input.eventImagePaths
    : [input.eventImagePath];

  return [...new Set(values.map((value) => String(value ?? "").trim()).filter(Boolean))];
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

function formatLocalDateOnly(value) {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDateTimeForSql(value) {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  const hours = String(value.getHours()).padStart(2, "0");
  const minutes = String(value.getMinutes()).padStart(2, "0");
  const seconds = String(value.getSeconds()).padStart(2, "0");

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}
