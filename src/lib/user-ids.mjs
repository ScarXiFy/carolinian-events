import { randomUUID } from "node:crypto";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function createUserId(uuidFactory = randomUUID) {
  const uuid = uuidFactory();

  if (!UUID_PATTERN.test(uuid)) {
    throw new Error("User id factory must return a UUID.");
  }

  return `usr_${uuid}`;
}
