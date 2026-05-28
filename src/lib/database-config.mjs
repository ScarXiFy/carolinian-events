const MYSQL_PROTOCOLS = new Set(["mysql:", "mysql2:", "mariadb:"]);
const POSTGRES_PROTOCOLS = new Set(["postgres:", "postgresql:"]);

export function getDatabaseConfig(env = process.env) {
  const url = (env.DATABASE_URL ?? "").trim();

  if (!url) {
    return {
      isConfigured: false,
      provider: "sample",
      url: "",
    };
  }

  requireSupportedDatabaseUrl(url);

  return {
    isConfigured: true,
    provider: getDatabaseProvider(url),
    url,
  };
}

export function getDatabaseProvider(url) {
  const parsed = new URL(url);

  if (MYSQL_PROTOCOLS.has(parsed.protocol)) {
    return "mysql";
  }

  if (POSTGRES_PROTOCOLS.has(parsed.protocol)) {
    return "postgres";
  }

  return "unsupported";
}

export function requireSupportedDatabaseUrl(url) {
  let parsed;

  try {
    parsed = new URL(url);
  } catch {
    throw new Error("DATABASE_URL must be a valid database connection URL.");
  }

  if (!MYSQL_PROTOCOLS.has(parsed.protocol) && !POSTGRES_PROTOCOLS.has(parsed.protocol)) {
    throw new Error("Only MySQL and Postgres DATABASE_URL values are supported.");
  }
}

export function getEventStoreMode(env = process.env) {
  return getDatabaseConfig(env).isConfigured ? "database-ready" : "sample";
}
