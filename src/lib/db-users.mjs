import { getDatabaseConfig } from "./database-config.mjs";
import * as mysqlUsers from "./mysql-users.mjs";
import { postgresUserStore } from "./postgres-users.mjs";

function getUserStore(env = process.env) {
  const config = getDatabaseConfig(env);

  if (config.provider === "postgres") {
    return postgresUserStore;
  }

  return mysqlUsers;
}

export function getUserByEmail(email, options = {}) {
  return getUserStore(options.env).getUserByEmail(email, options);
}

export function getUserByGithubId(githubId, options = {}) {
  return getUserStore(options.env).getUserByGithubId(githubId, options);
}

export function getUserByGoogleId(googleId, options = {}) {
  return getUserStore(options.env).getUserByGoogleId(googleId, options);
}

export function getUserById(id, options = {}) {
  return getUserStore(options.env).getUserById(id, options);
}

export function createUser(user, options = {}) {
  return getUserStore(options.env).createUser(user, options);
}

export function getEventParticipants(eventId, options = {}) {
  return getUserStore(options.env).getEventParticipants(eventId, options);
}
