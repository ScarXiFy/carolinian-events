import { getDatabaseConfig } from "./database-config.mjs";

export function getPostgresCreateUserStatement(user) {
  return {
    sql: "insert into users (id, name, email, password_hash, role, github_id, google_id) values ($1, $2, $3, $4, $5, $6, $7)",
    values: [
      user.id,
      user.name || null,
      user.email || null,
      user.passwordHash || null,
      user.role || "Student",
      user.githubId || null,
      user.googleId || null,
    ],
  };
}

export function createPostgresUserStore({ createClient = createPostgresClient } = {}) {
  async function queryOne(url, sql, values) {
    const client = await createClient(url);
    await client.connect();

    try {
      const result = await client.query(sql, values);
      return result.rows[0] || null;
    } finally {
      await client.end();
    }
  }

  async function queryRows(url, sql, values) {
    const client = await createClient(url);
    await client.connect();

    try {
      const result = await client.query(sql, values);
      return result.rows;
    } finally {
      await client.end();
    }
  }

  function getUrl(env) {
    const config = getDatabaseConfig(env);
    return config.isConfigured ? config.url : "";
  }

  return {
    async getUserByEmail(email, { env = process.env } = {}) {
      const url = getUrl(env);
      if (!url) return null;

      return queryOne(url, "select * from users where email = $1", [email]);
    },
    async getUserByGithubId(githubId, { env = process.env } = {}) {
      const url = getUrl(env);
      if (!url) return null;

      return queryOne(url, "select * from users where github_id = $1", [githubId]);
    },
    async getUserByGoogleId(googleId, { env = process.env } = {}) {
      const url = getUrl(env);
      if (!url) return null;

      return queryOne(url, "select * from users where google_id = $1", [googleId]);
    },
    async getUserById(id, { env = process.env } = {}) {
      const url = getUrl(env);
      if (!url) return null;

      return queryOne(url, "select * from users where id = $1", [id]);
    },
    async createUser(user, { env = process.env } = {}) {
      const url = getUrl(env);
      if (!url) return null;

      const statement = getPostgresCreateUserStatement(user);
      await queryOne(url, statement.sql, statement.values);

      return queryOne(url, "select * from users where id = $1", [user.id]);
    },
    async getEventParticipants(eventId, { env = process.env } = {}) {
      const url = getUrl(env);
      if (!url) return [];

      const rows = await queryRows(url, "select user_id from event_participants where event_id = $1", [Number(eventId)]);
      return rows.map((row) => row.user_id);
    },
  };
}

export const postgresUserStore = createPostgresUserStore();

async function createPostgresClient(url) {
  const { Client } = await import("pg");
  return new Client({ connectionString: url });
}
