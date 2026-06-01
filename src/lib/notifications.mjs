import { getDatabaseConfig } from "./database-config.mjs";
import { formatEventTime, formatFullEventDate } from "./events.mjs";

const RECENT_LIMIT = 10;

export function getMysqlCreateNotificationStatement(input) {
  return {
    sql: "INSERT INTO notifications (recipient_user_id, type, title, message, event_id, actor_user_id) VALUES (?, ?, ?, ?, ?, ?)",
    values: getNotificationValues(input),
  };
}

export function getPostgresCreateNotificationStatement(input) {
  return {
    sql: "insert into notifications (recipient_user_id, type, title, message, event_id, actor_user_id) values ($1, $2, $3, $4, $5, $6) returning *",
    values: getNotificationValues(input),
  };
}

export async function createNotification(input, options = {}) {
  if (!input?.recipientUserId) return null;
  return getNotificationStore(options).createNotification(input, options);
}

export async function createNotifications(inputs, options = {}) {
  const created = [];

  for (const input of inputs) {
    const result = await createNotification(input, options);
    if (result) created.push(result);
  }

  return created;
}

export async function listNotifications(userId, options = {}) {
  if (!userId) return [];
  return getNotificationStore(options).listNotifications(userId, options);
}

export async function getUnreadNotificationCount(userId, options = {}) {
  if (!userId) return 0;
  return getNotificationStore(options).getUnreadNotificationCount(userId, options);
}

export async function markNotificationsRead(userId, options = {}) {
  if (!userId) return { affectedRows: 0 };
  return getNotificationStore(options).markNotificationsRead(userId, options);
}

export async function notifyAdminsOfOrganizerRequest(user, options = {}) {
  const admins = await getNotificationStore(options).listAdminUsers(options);
  return createNotifications(
    admins
      .filter((admin) => admin.id !== user.id)
      .map((admin) => ({
        recipientUserId: admin.id,
        type: "organizer_request_submitted",
        title: "New organizer request",
        message: `${user.name || user.email || "A student"} requested organizer access.`,
        actorUserId: user.id,
      })),
    options,
  );
}

export async function notifyOrganizerRequestReviewed(request, status, options = {}) {
  if (!request?.user_id) return null;
  const isApproved = status === "Approved";
  return createNotification(
    {
      recipientUserId: request.user_id,
      type: isApproved ? "organizer_request_approved" : "organizer_request_rejected",
      title: isApproved ? "Organizer request approved" : "Organizer request rejected",
      message: isApproved
        ? "Your organizer access request was approved."
        : "Your organizer access request was rejected.",
      actorUserId: request.reviewed_by_user_id || null,
    },
    options,
  );
}

export async function notifyEventOwner(event, input, options = {}) {
  if (!event?.createdByUserId || event.createdByUserId === input.actorUserId) {
    return null;
  }

  return createNotification(
    {
      recipientUserId: event.createdByUserId,
      eventId: event.id,
      ...input,
    },
    options,
  );
}

export async function notifyEventLimitReached(event, options = {}) {
  if (!event?.createdByUserId || event.participantLimit === null) return null;
  if (event.participantCount < event.participantLimit) return null;
  if (await getNotificationStore(options).hasNotification(event.createdByUserId, "event_limit_reached", event.id, options)) {
    return null;
  }

  return createNotification(
    {
      recipientUserId: event.createdByUserId,
      type: "event_limit_reached",
      title: "Event is full",
      message: `${event.eventName} has reached its registration limit.`,
      eventId: event.id,
    },
    options,
  );
}

export async function notifyEventCancelledToAttendees(event, attendeeUserIds = [], actorUserId, options = {}) {
  if (!event?.id || attendeeUserIds.length === 0) return [];

  const eventDate = formatFullEventDate(event);
  const startTime = formatEventTime(event);
  const endTime = event.eventEndTime
    ? new Intl.DateTimeFormat("en-US", {
        hour: "numeric",
        minute: "2-digit",
      }).format(new Date(`${event.eventDate}T${event.eventEndTime}`))
    : null;
  const timeLabel = endTime ? `${startTime} - ${endTime}` : startTime;

  return createNotifications(
    [...new Set(attendeeUserIds)].map((recipientUserId) => ({
      recipientUserId,
      type: "event_cancelled",
      title: `${event.eventName} cancelled`,
      message: `${event.eventName} is Cancelled. It was scheduled for ${eventDate}, ${timeLabel}. The organizer has cancelled this event.`,
      eventId: event.id,
      actorUserId: actorUserId || null,
    })),
    options,
  );
}

export async function notifyEventApprovalReviewed(event, status, actorUserId, options = {}) {
  if (!event?.createdByUserId) return null;
  const approved = status === "Approved";

  return createNotification(
    {
      recipientUserId: event.createdByUserId,
      type: approved ? "event_approved" : "event_rejected",
      title: approved ? "Event approved" : "Event rejected",
      message: approved
        ? `${event.eventName} was approved and is now visible to students.`
        : `${event.eventName} was rejected and will not be visible to students.`,
      eventId: event.id,
      actorUserId: actorUserId || null,
    },
    options,
  );
}

function getNotificationStore(options = {}) {
  if (options.store) return options.store;

  const config = getDatabaseConfig(options.env);
  if (!config.isConfigured) return emptyNotificationStore;
  return config.provider === "postgres" ? postgresNotificationStore : mysqlNotificationStore;
}

function getNotificationValues(input) {
  return [
    input.recipientUserId,
    input.type,
    input.title,
    input.message,
    input.eventId ?? null,
    input.actorUserId ?? null,
  ];
}

const emptyNotificationStore = {
  async createNotification() {
    return null;
  },
  async listNotifications() {
    return [];
  },
  async getUnreadNotificationCount() {
    return 0;
  },
  async markNotificationsRead() {
    return { affectedRows: 0 };
  },
  async listAdminUsers() {
    return [];
  },
  async hasNotification() {
    return false;
  },
};

const mysqlNotificationStore = {
  async createNotification(input, { env = process.env } = {}) {
    const config = getDatabaseConfig(env);
    const connection = await createMysqlConnection(config.url);
    try {
      const statement = getMysqlCreateNotificationStatement(input);
      const [result] = await connection.execute(statement.sql, statement.values);
      return { id: result.insertId, ...input };
    } finally {
      await connection.end();
    }
  },
  async listNotifications(userId, { env = process.env } = {}) {
    const config = getDatabaseConfig(env);
    const connection = await createMysqlConnection(config.url);
    try {
      const [rows] = await connection.execute(
        "SELECT * FROM notifications WHERE recipient_user_id = ? ORDER BY created_at DESC, id DESC LIMIT ?",
        [userId, RECENT_LIMIT],
      );
      return rows.map(normalizeNotificationRow);
    } finally {
      await connection.end();
    }
  },
  async getUnreadNotificationCount(userId, { env = process.env } = {}) {
    const config = getDatabaseConfig(env);
    const connection = await createMysqlConnection(config.url);
    try {
      const [rows] = await connection.execute(
        "SELECT COUNT(*) AS unread_count FROM notifications WHERE recipient_user_id = ? AND read_at IS NULL",
        [userId],
      );
      return Number(rows[0]?.unread_count ?? 0);
    } finally {
      await connection.end();
    }
  },
  async markNotificationsRead(userId, { env = process.env } = {}) {
    const config = getDatabaseConfig(env);
    const connection = await createMysqlConnection(config.url);
    try {
      const [result] = await connection.execute(
        "UPDATE notifications SET read_at = CURRENT_TIMESTAMP WHERE recipient_user_id = ? AND read_at IS NULL",
        [userId],
      );
      return { affectedRows: result.affectedRows ?? 0 };
    } finally {
      await connection.end();
    }
  },
  async listAdminUsers({ env = process.env } = {}) {
    const config = getDatabaseConfig(env);
    const connection = await createMysqlConnection(config.url);
    try {
      const [rows] = await connection.execute("SELECT id, name, email FROM users WHERE role = 'Admin'");
      return rows;
    } finally {
      await connection.end();
    }
  },
  async hasNotification(userId, type, eventId, { env = process.env } = {}) {
    const config = getDatabaseConfig(env);
    const connection = await createMysqlConnection(config.url);
    try {
      const [rows] = await connection.execute(
        "SELECT id FROM notifications WHERE recipient_user_id = ? AND type = ? AND event_id = ? LIMIT 1",
        [userId, type, eventId],
      );
      return rows.length > 0;
    } finally {
      await connection.end();
    }
  },
};

const postgresNotificationStore = {
  async createNotification(input, { env = process.env } = {}) {
    const config = getDatabaseConfig(env);
    const client = await createPostgresClient(config.url);
    await client.connect();
    try {
      const statement = getPostgresCreateNotificationStatement(input);
      const result = await client.query(statement.sql, statement.values);
      return normalizeNotificationRow(result.rows[0]);
    } finally {
      await client.end();
    }
  },
  async listNotifications(userId, { env = process.env } = {}) {
    const config = getDatabaseConfig(env);
    const client = await createPostgresClient(config.url);
    await client.connect();
    try {
      const result = await client.query(
        "select * from notifications where recipient_user_id = $1 order by created_at desc, id desc limit $2",
        [userId, RECENT_LIMIT],
      );
      return result.rows.map(normalizeNotificationRow);
    } finally {
      await client.end();
    }
  },
  async getUnreadNotificationCount(userId, { env = process.env } = {}) {
    const config = getDatabaseConfig(env);
    const client = await createPostgresClient(config.url);
    await client.connect();
    try {
      const result = await client.query(
        "select count(*)::int as unread_count from notifications where recipient_user_id = $1 and read_at is null",
        [userId],
      );
      return Number(result.rows[0]?.unread_count ?? 0);
    } finally {
      await client.end();
    }
  },
  async markNotificationsRead(userId, { env = process.env } = {}) {
    const config = getDatabaseConfig(env);
    const client = await createPostgresClient(config.url);
    await client.connect();
    try {
      const result = await client.query(
        "update notifications set read_at = now() where recipient_user_id = $1 and read_at is null",
        [userId],
      );
      return { affectedRows: result.rowCount ?? 0 };
    } finally {
      await client.end();
    }
  },
  async listAdminUsers({ env = process.env } = {}) {
    const config = getDatabaseConfig(env);
    const client = await createPostgresClient(config.url);
    await client.connect();
    try {
      const result = await client.query("select id, name, email from users where role = 'Admin'");
      return result.rows;
    } finally {
      await client.end();
    }
  },
  async hasNotification(userId, type, eventId, { env = process.env } = {}) {
    const config = getDatabaseConfig(env);
    const client = await createPostgresClient(config.url);
    await client.connect();
    try {
      const result = await client.query(
        "select id from notifications where recipient_user_id = $1 and type = $2 and event_id = $3 limit 1",
        [userId, type, Number(eventId)],
      );
      return result.rows.length > 0;
    } finally {
      await client.end();
    }
  },
};

function normalizeNotificationRow(row) {
  if (!row) return null;
  return {
    id: Number(row.id),
    recipientUserId: row.recipient_user_id,
    type: row.type,
    title: row.title,
    message: row.message,
    eventId: row.event_id === null || row.event_id === undefined ? null : Number(row.event_id),
    actorUserId: row.actor_user_id ?? null,
    readAt: row.read_at ? String(row.read_at) : null,
    createdAt: row.created_at ? String(row.created_at) : null,
  };
}

async function createMysqlConnection(url) {
  const mysql = await import("mysql2/promise");
  return mysql.createConnection(url);
}

async function createPostgresClient(url) {
  const { Client } = await import("pg");
  return new Client({ connectionString: url });
}
