import test from "node:test";
import assert from "node:assert/strict";

import {
  getDatabaseConfig,
  getEventStoreMode,
  requireSupportedDatabaseUrl,
} from "./database-config.mjs";

test("getDatabaseConfig falls back to sample data when DATABASE_URL is blank", () => {
  assert.deepEqual(getDatabaseConfig({}), {
    isConfigured: false,
    provider: "sample",
    url: "",
  });

  assert.deepEqual(getDatabaseConfig({ DATABASE_URL: "   " }), {
    isConfigured: false,
    provider: "sample",
    url: "",
  });
});

test("getDatabaseConfig rejects missing production DATABASE_URL", () => {
  assert.throws(
    () => getDatabaseConfig({ NODE_ENV: "production" }),
    /DATABASE_URL is required in production/,
  );
});

test("getDatabaseConfig accepts MySQL style database URLs", () => {
  assert.deepEqual(getDatabaseConfig({ DATABASE_URL: "mysql://root@localhost:3306/carolinian_events_db" }), {
    isConfigured: true,
    provider: "mysql",
    url: "mysql://root@localhost:3306/carolinian_events_db",
  });
});

test("getDatabaseConfig accepts Postgres style database URLs", () => {
  assert.deepEqual(getDatabaseConfig({ DATABASE_URL: "postgresql://postgres.example:secret@localhost:5432/postgres" }), {
    isConfigured: true,
    provider: "postgres",
    url: "postgresql://postgres.example:secret@localhost:5432/postgres",
  });
});

test("requireSupportedDatabaseUrl rejects unsupported database providers", () => {
  assert.throws(
    () => requireSupportedDatabaseUrl("sqlite://events.db"),
    /Only MySQL and Postgres DATABASE_URL values are supported/,
  );
});

test("getEventStoreMode describes the active read source", () => {
  assert.equal(getEventStoreMode({}), "sample");
  assert.equal(
    getEventStoreMode({ DATABASE_URL: "mysql://root@localhost:3306/carolinian_events_db" }),
    "database-ready",
  );
  assert.equal(
    getEventStoreMode({ DATABASE_URL: "postgresql://postgres.example:secret@localhost:5432/postgres" }),
    "database-ready",
  );
});

test("getDatabaseConfig ignores NEXT_PUBLIC_SUPABASE_URL as a database URL", () => {
  assert.deepEqual(
    getDatabaseConfig({ NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co" }),
    {
      isConfigured: false,
      provider: "sample",
      url: "",
    },
  );
});

test("getDatabaseConfig strips square brackets from password segment", () => {
  assert.deepEqual(
    getDatabaseConfig({
      DATABASE_URL: "postgresql://postgres:[MileahDaGoat123!]@db.example.co:5432/postgres",
    }),
    {
      isConfigured: true,
      provider: "postgres",
      url: "postgresql://postgres:MileahDaGoat123!@db.example.co:5432/postgres",
    }
  );
});
