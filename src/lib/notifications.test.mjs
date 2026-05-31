import test from "node:test";
import assert from "node:assert/strict";

import {
  createNotification,
  getMysqlCreateNotificationStatement,
  getPostgresCreateNotificationStatement,
  getUnreadNotificationCount,
  markNotificationsRead,
} from "./notifications.mjs";

test("notification create statements use parameterized SQL", () => {
  const input = {
    recipientUserId: "usr_1",
    type: "organizer_request_submitted",
    title: "New organizer request",
    message: "Juan requested organizer access.",
    eventId: 12,
    actorUserId: "usr_2",
  };

  assert.deepEqual(getMysqlCreateNotificationStatement(input), {
    sql: "INSERT INTO notifications (recipient_user_id, type, title, message, event_id, actor_user_id) VALUES (?, ?, ?, ?, ?, ?)",
    values: [
      "usr_1",
      "organizer_request_submitted",
      "New organizer request",
      "Juan requested organizer access.",
      12,
      "usr_2",
    ],
  });

  assert.deepEqual(getPostgresCreateNotificationStatement(input), {
    sql: "insert into notifications (recipient_user_id, type, title, message, event_id, actor_user_id) values ($1, $2, $3, $4, $5, $6) returning *",
    values: [
      "usr_1",
      "organizer_request_submitted",
      "New organizer request",
      "Juan requested organizer access.",
      12,
      "usr_2",
    ],
  });
});

test("notification helpers route through the configured database provider", async () => {
  const calls = [];
  const env = { DATABASE_URL: "postgresql://example" };
  const store = {
    createNotification: async (input) => {
      calls.push(["create", input.type]);
      return { id: 1, ...input };
    },
    getUnreadNotificationCount: async (userId) => {
      calls.push(["count", userId]);
      return 2;
    },
    markNotificationsRead: async (userId) => {
      calls.push(["read", userId]);
      return { affectedRows: 2 };
    },
  };

  assert.equal(
    (await createNotification(
      {
        recipientUserId: "usr_1",
        type: "event_updated_by_admin",
        title: "Event updated",
        message: "Your event was updated.",
      },
      { env, store },
    )).id,
    1,
  );
  assert.equal(await getUnreadNotificationCount("usr_1", { env, store }), 2);
  assert.deepEqual(await markNotificationsRead("usr_1", { env, store }), { affectedRows: 2 });
  assert.deepEqual(calls, [
    ["create", "event_updated_by_admin"],
    ["count", "usr_1"],
    ["read", "usr_1"],
  ]);
});
