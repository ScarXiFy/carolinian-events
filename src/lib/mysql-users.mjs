import { getDatabaseConfig } from "./database-config.mjs";

async function createMysqlConnection(url) {
  const mysql = await import("mysql2/promise");
  return mysql.createConnection(url);
}

export async function getUserByEmail(email, { env = process.env } = {}) {
  const config = getDatabaseConfig(env);
  if (!config.isConfigured) return null;
  const connection = await createMysqlConnection(config.url);
  try {
    const [rows] = await connection.execute("SELECT * FROM users WHERE email = ?", [email]);
    return rows[0] || null;
  } finally {
    await connection.end();
  }
}

export async function getUserByGithubId(githubId, { env = process.env } = {}) {
  const config = getDatabaseConfig(env);
  if (!config.isConfigured) return null;
  const connection = await createMysqlConnection(config.url);
  try {
    const [rows] = await connection.execute("SELECT * FROM users WHERE github_id = ?", [githubId]);
    return rows[0] || null;
  } finally {
    await connection.end();
  }
}

export async function getUserByGoogleId(googleId, { env = process.env } = {}) {
  const config = getDatabaseConfig(env);
  if (!config.isConfigured) return null;
  const connection = await createMysqlConnection(config.url);
  try {
    const [rows] = await connection.execute("SELECT * FROM users WHERE google_id = ?", [googleId]);
    return rows[0] || null;
  } finally {
    await connection.end();
  }
}

export async function getUserById(id, { env = process.env } = {}) {
  const config = getDatabaseConfig(env);
  if (!config.isConfigured) return null;
  const connection = await createMysqlConnection(config.url);
  try {
    const [rows] = await connection.execute("SELECT * FROM users WHERE id = ?", [id]);
    return rows[0] || null;
  } finally {
    await connection.end();
  }
}

export async function createUser(user, { env = process.env } = {}) {
  const config = getDatabaseConfig(env);
  if (!config.isConfigured) return null;
  const connection = await createMysqlConnection(config.url);
  try {
    await connection.execute(
      "INSERT INTO users (id, name, email, password_hash, role, github_id, google_id) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [
        user.id,
        user.name || null,
        user.email || null,
        user.passwordHash || null,
        user.role || 'Student',
        user.githubId || null,
        user.googleId || null,
      ]
    );
    const [rows] = await connection.execute("SELECT * FROM users WHERE id = ?", [user.id]);
    return rows[0];
  } finally {
    await connection.end();
  }
}

export async function linkGithubIdToUser(userId, githubId, { env = process.env } = {}) {
  const config = getDatabaseConfig(env);
  if (!config.isConfigured) return null;
  const connection = await createMysqlConnection(config.url);
  try {
    await connection.execute(
      "UPDATE users SET github_id = ? WHERE id = ? AND (github_id IS NULL OR github_id = ?)",
      [githubId, userId, githubId],
    );
    const [rows] = await connection.execute("SELECT * FROM users WHERE id = ?", [userId]);
    return rows[0] || null;
  } finally {
    await connection.end();
  }
}

export async function linkGoogleIdToUser(userId, googleId, { env = process.env } = {}) {
  const config = getDatabaseConfig(env);
  if (!config.isConfigured) return null;
  const connection = await createMysqlConnection(config.url);
  try {
    await connection.execute(
      "UPDATE users SET google_id = ? WHERE id = ? AND (google_id IS NULL OR google_id = ?)",
      [googleId, userId, googleId],
    );
    const [rows] = await connection.execute("SELECT * FROM users WHERE id = ?", [userId]);
    return rows[0] || null;
  } finally {
    await connection.end();
  }
}

export async function updateUserRole(userId, role, { env = process.env } = {}) {
  const config = getDatabaseConfig(env);
  if (!config.isConfigured) return null;
  const connection = await createMysqlConnection(config.url);
  try {
    await connection.execute("UPDATE users SET role = ? WHERE id = ?", [role, userId]);
    const [rows] = await connection.execute("SELECT * FROM users WHERE id = ?", [userId]);
    return rows[0] || null;
  } finally {
    await connection.end();
  }
}

export async function createOrganizerRequest(userId, { env = process.env } = {}) {
  const config = getDatabaseConfig(env);
  if (!config.isConfigured) return null;
  const connection = await createMysqlConnection(config.url);
  try {
    await connection.execute(
      "INSERT INTO organizer_requests (user_id, status) VALUES (?, 'Pending') ON DUPLICATE KEY UPDATE requested_at = requested_at",
      [userId],
    );
    const [rows] = await connection.execute(
      "SELECT * FROM organizer_requests WHERE user_id = ? ORDER BY requested_at DESC LIMIT 1",
      [userId],
    );
    return rows[0] || null;
  } finally {
    await connection.end();
  }
}

export async function getOrganizerRequestByUserId(userId, { env = process.env } = {}) {
  const config = getDatabaseConfig(env);
  if (!config.isConfigured) return null;
  const connection = await createMysqlConnection(config.url);
  try {
    const [rows] = await connection.execute(
      "SELECT * FROM organizer_requests WHERE user_id = ? ORDER BY requested_at DESC LIMIT 1",
      [userId],
    );
    return rows[0] || null;
  } finally {
    await connection.end();
  }
}

export async function listPendingOrganizerRequests({ env = process.env } = {}) {
  const config = getDatabaseConfig(env);
  if (!config.isConfigured) return [];
  const connection = await createMysqlConnection(config.url);
  try {
    const [rows] = await connection.execute(
      "SELECT r.*, u.name, u.email FROM organizer_requests r JOIN users u ON u.id = r.user_id WHERE r.status = 'Pending' ORDER BY r.requested_at ASC",
    );
    return rows;
  } finally {
    await connection.end();
  }
}

export async function approveOrganizerRequest(requestId, adminUserId, { env = process.env } = {}) {
  const config = getDatabaseConfig(env);
  if (!config.isConfigured) return null;
  const connection = await createMysqlConnection(config.url);
  try {
    const [rows] = await connection.execute(
      "SELECT * FROM organizer_requests WHERE id = ? AND status = 'Pending'",
      [requestId],
    );
    const request = rows[0] || null;
    if (!request) return null;

    await connection.execute(
      "UPDATE organizer_requests SET status = 'Approved', reviewed_by_user_id = ?, reviewed_at = CURRENT_TIMESTAMP WHERE id = ?",
      [adminUserId, requestId],
    );
    await connection.execute("UPDATE users SET role = 'Organizer' WHERE id = ?", [request.user_id]);

    return { ...request, status: "Approved", reviewed_by_user_id: adminUserId };
  } finally {
    await connection.end();
  }
}

export async function rejectOrganizerRequest(requestId, adminUserId, { env = process.env } = {}) {
  const config = getDatabaseConfig(env);
  if (!config.isConfigured) return null;
  const connection = await createMysqlConnection(config.url);
  try {
    const [rows] = await connection.execute(
      "SELECT * FROM organizer_requests WHERE id = ? AND status = 'Pending'",
      [requestId],
    );
    const request = rows[0] || null;
    if (!request) return null;

    await connection.execute(
      "UPDATE organizer_requests SET status = 'Rejected', reviewed_by_user_id = ?, reviewed_at = CURRENT_TIMESTAMP WHERE id = ?",
      [adminUserId, requestId],
    );

    return { ...request, status: "Rejected", reviewed_by_user_id: adminUserId };
  } finally {
    await connection.end();
  }
}

export async function getEventParticipants(eventId, { env = process.env } = {}) {
    const config = getDatabaseConfig(env);
    if (!config.isConfigured) return [];
    const connection = await createMysqlConnection(config.url);
    try {
      const [rows] = await connection.execute("SELECT user_id FROM event_participants WHERE event_id = ?", [eventId]);
      return rows.map(r => r.user_id);
    } finally {
      await connection.end();
    }
  }
