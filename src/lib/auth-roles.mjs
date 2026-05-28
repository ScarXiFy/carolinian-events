import { ROLES } from "./permissions.mjs";

export function parseAdminEmails(value = "") {
  return String(value)
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function getDefaultUserRole(email, env = process.env) {
  const normalizedEmail = String(email ?? "").trim().toLowerCase();
  const adminEmails = parseAdminEmails(env.ADMIN_EMAILS);

  return normalizedEmail && adminEmails.includes(normalizedEmail)
    ? ROLES.ADMIN
    : ROLES.STUDENT;
}
