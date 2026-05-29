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
    async linkGithubIdToUser(userId, githubId, { env = process.env } = {}) {
      const url = getUrl(env);
      if (!url) return null;

      return queryOne(
        url,
        "update users set github_id = $2 where id = $1 and (github_id is null or github_id = $2) returning *",
        [userId, githubId],
      );
    },
    async linkGoogleIdToUser(userId, googleId, { env = process.env } = {}) {
      const url = getUrl(env);
      if (!url) return null;

      return queryOne(
        url,
        "update users set google_id = $2 where id = $1 and (google_id is null or google_id = $2) returning *",
        [userId, googleId],
      );
    },
    async updateUserRole(userId, role, { env = process.env } = {}) {
      const url = getUrl(env);
      if (!url) return null;

      return queryOne(url, "update users set role = $2 where id = $1 returning *", [userId, role]);
    },
    async createOrganizerRequest(userId, { env = process.env } = {}) {
      const url = getUrl(env);
      if (!url) return null;

      return queryOne(
        url,
        "insert into organizer_requests (user_id, status) values ($1, 'Pending') on conflict (user_id) where status = 'Pending' do update set requested_at = organizer_requests.requested_at returning *",
        [userId],
      );
    },
    async getOrganizerRequestByUserId(userId, { env = process.env } = {}) {
      const url = getUrl(env);
      if (!url) return null;

      return queryOne(
        url,
        "select * from organizer_requests where user_id = $1 order by requested_at desc limit 1",
        [userId],
      );
    },
    async listPendingOrganizerRequests({ env = process.env } = {}) {
      const url = getUrl(env);
      if (!url) return [];

      return queryRows(
        url,
        "select r.*, u.name, u.email from organizer_requests r join users u on u.id = r.user_id where r.status = 'Pending' order by r.requested_at asc",
        [],
      );
    },
    async approveOrganizerRequest(requestId, adminUserId, { env = process.env } = {}) {
      const url = getUrl(env);
      if (!url) return null;

      const request = await queryOne(
        url,
        "update organizer_requests set status = 'Approved', reviewed_by_user_id = $2, reviewed_at = now() where id = $1 and status = 'Pending' returning *",
        [Number(requestId), adminUserId],
      );

      if (request?.user_id) {
        await queryOne(url, "update users set role = 'Organizer' where id = $1 returning *", [
          request.user_id,
        ]);
      }

      return request;
    },
    async rejectOrganizerRequest(requestId, adminUserId, { env = process.env } = {}) {
      const url = getUrl(env);
      if (!url) return null;

      return queryOne(
        url,
        "update organizer_requests set status = 'Rejected', reviewed_by_user_id = $2, reviewed_at = now() where id = $1 and status = 'Pending' returning *",
        [Number(requestId), adminUserId],
      );
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
