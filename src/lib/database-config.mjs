const MYSQL_PROTOCOLS = new Set(["mysql:", "mysql2:", "mariadb:"]);

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
    provider: "mysql",
    url,
  };
}

export function requireSupportedDatabaseUrl(url) {
  let parsed;

  try {
    parsed = new URL(url);
  } catch {
    throw new Error("DATABASE_URL must be a valid database connection URL.");
  }

  if (!MYSQL_PROTOCOLS.has(parsed.protocol)) {
    throw new Error("Only MySQL-compatible DATABASE_URL values are supported right now.");
  }
}

export function getEventStoreMode(env = process.env) {
  return getDatabaseConfig(env).isConfigured ? "database-ready" : "sample";
}
