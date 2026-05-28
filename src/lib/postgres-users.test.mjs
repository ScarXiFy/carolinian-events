import test from "node:test";
import assert from "node:assert/strict";

import {
  createPostgresUserStore,
  getPostgresCreateUserStatement,
} from "./postgres-users.mjs";

test("getPostgresCreateUserStatement uses numbered parameters", () => {
  assert.deepEqual(
    getPostgresCreateUserStatement({
      id: "usr_1",
      name: "Juan",
      email: "juan@example.com",
      passwordHash: "hash",
      role: "Organizer",
      githubId: "gh_1",
      googleId: "google_1",
    }),
    {
      sql: "insert into users (id, name, email, password_hash, role, github_id, google_id) values ($1, $2, $3, $4, $5, $6, $7)",
      values: ["usr_1", "Juan", "juan@example.com", "hash", "Organizer", "gh_1", "google_1"],
    },
  );
});

test("createPostgresUserStore reads and writes through an injected client", async () => {
  const calls = [];
  const store = createPostgresUserStore({
    createClient: (url) => {
      calls.push(["connect", url]);
      return {
        connect: async () => calls.push(["connected"]),
        query: async (sql, values) => {
          calls.push(["query", sql, values]);
          if (sql.startsWith("insert")) return { rows: [], rowCount: 1 };
          if (sql.includes("event_participants")) return { rows: [{ user_id: "usr_1" }] };
          return { rows: [{ id: "usr_1", email: "juan@example.com" }] };
        },
        end: async () => calls.push(["end"]),
      };
    },
  });

  const env = { DATABASE_URL: "postgresql://example" };

  assert.equal((await store.getUserByEmail("juan@example.com", { env })).id, "usr_1");
  assert.equal((await store.getUserByGithubId("gh_1", { env })).id, "usr_1");
  assert.equal((await store.getUserByGoogleId("google_1", { env })).id, "usr_1");
  assert.equal((await store.getUserById("usr_1", { env })).id, "usr_1");
  assert.equal((await store.createUser({ id: "usr_1", email: "juan@example.com" }, { env })).id, "usr_1");
  assert.deepEqual(await store.getEventParticipants(12, { env }), ["usr_1"]);
});
