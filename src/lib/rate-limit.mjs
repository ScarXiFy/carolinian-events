import { getDatabaseConfig } from "./database-config.mjs";

export const RATE_LIMITS = {
  login: { limit: 5, windowMs: 10 * 60 * 1000 },
  signup: { limit: 3, windowMs: 60 * 60 * 1000 },
  resendVerification: { limit: 3, windowMs: 15 * 60 * 1000 },
  uploadUrl: { limit: 20, windowMs: 60 * 60 * 1000 },
  writeAction: { limit: 30, windowMs: 10 * 60 * 1000 },
  adminAction: { limit: 60, windowMs: 10 * 60 * 1000 },
};

const memoryStore = createMemoryRateLimitStore();

export class RateLimitError extends Error {
  constructor(result) {
    super(`Too many requests. Try again in ${result.retryAfterSeconds} seconds.`);
    this.name = "RateLimitError";
    this.retryAfterSeconds = result.retryAfterSeconds;
    this.resetAt = result.resetAt;
  }
}

export function getRateLimitKey(action, identifier) {
  const normalizedIdentifier = String(identifier || "anonymous").trim().toLowerCase() || "anonymous";
  return `${action}:${normalizedIdentifier}`;
}

export async function requireRateLimit(options) {
  const result = await checkRateLimit(options);

  if (!result.allowed) {
    throw new RateLimitError(result);
  }

  return result;
}

export async function checkRateLimit({
  key,
  limit,
  windowMs,
  env = process.env,
  now = new Date(),
  store,
}) {
  const activeStore = store ?? getRateLimitStore(env);
  const result = await activeStore.increment({ key, limit, windowMs, now });
  const remaining = Math.max(0, limit - result.count);
  const retryAfterSeconds = Math.max(0, Math.ceil((result.resetAt.getTime() - now.getTime()) / 1000));

  return {
    allowed: result.count <= limit,
    count: result.count,
    limit,
    remaining,
    resetAt: result.resetAt,
    retryAfterSeconds,
  };
}

export function createMemoryRateLimitStore() {
  const buckets = new Map();

  return {
    async increment({ key, windowMs, now }) {
      const existing = buckets.get(key);

      if (!existing || existing.resetAt.getTime() <= now.getTime()) {
        const resetAt = new Date(now.getTime() + windowMs);
        const next = { count: 1, resetAt };
        buckets.set(key, next);
        return next;
      }

      existing.count += 1;
      return existing;
    },
    clear() {
      buckets.clear();
    },
  };
}

function getRateLimitStore(env) {
  const config = getDatabaseConfig(env);

  if (!config.isConfigured) {
    return memoryStore;
  }

  return config.provider === "postgres"
    ? createPostgresRateLimitStore(config.url)
    : createMysqlRateLimitStore(config.url);
}

function createPostgresRateLimitStore(url) {
  return {
    async increment({ key, windowMs, now }) {
      const { Client } = await import("pg");
      const client = new Client({ connectionString: url });
      await client.connect();

      try {
        const resetAt = new Date(now.getTime() + windowMs);
        const result = await client.query(
          `
          insert into rate_limits (rate_key, count, reset_at)
          values ($1, 1, $2)
          on conflict (rate_key)
          do update set
            count = case
              when rate_limits.reset_at <= $3 then 1
              else rate_limits.count + 1
            end,
            reset_at = case
              when rate_limits.reset_at <= $3 then $2
              else rate_limits.reset_at
            end
          returning count, reset_at
          `,
          [key, resetAt, now],
        );

        return normalizeRateLimitRow(result.rows[0]);
      } finally {
        await client.end();
      }
    },
  };
}

function createMysqlRateLimitStore(url) {
  return {
    async increment({ key, windowMs, now }) {
      const mysql = await import("mysql2/promise");
      const connection = await mysql.createConnection(url);

      try {
        const resetAt = new Date(now.getTime() + windowMs);
        await connection.execute(
          `
          INSERT INTO rate_limits (rate_key, count, reset_at)
          VALUES (?, 1, ?)
          ON DUPLICATE KEY UPDATE
            count = IF(reset_at <= ?, 1, count + 1),
            reset_at = IF(reset_at <= ?, VALUES(reset_at), reset_at)
          `,
          [key, resetAt, now, now],
        );
        const [rows] = await connection.execute(
          "SELECT count, reset_at FROM rate_limits WHERE rate_key = ?",
          [key],
        );

        return normalizeRateLimitRow(rows[0]);
      } finally {
        await connection.end();
      }
    },
  };
}

function normalizeRateLimitRow(row) {
  return {
    count: Number(row.count),
    resetAt: row.reset_at instanceof Date ? row.reset_at : new Date(row.reset_at),
  };
}
