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
