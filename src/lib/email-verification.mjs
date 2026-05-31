import { createHash, randomBytes } from "node:crypto";

const DEFAULT_VERIFY_BASE_URL = "http://localhost:3000";
const TOKEN_BYTES = 32;
const TOKEN_TTL_HOURS = 24;

export function createVerificationToken() {
  return randomBytes(TOKEN_BYTES).toString("hex");
}

export function createVerificationTokenHash(token) {
  return createHash("sha256").update(String(token)).digest("hex");
}

export function getVerificationTokenExpiry(now = new Date()) {
  return new Date(now.getTime() + TOKEN_TTL_HOURS * 60 * 60 * 1000);
}

export function createVerificationUrl(token, { env = process.env } = {}) {
  const baseUrl = (env.NEXT_PUBLIC_APP_URL || env.AUTH_URL || DEFAULT_VERIFY_BASE_URL).replace(/\/+$/, "");
  return `${baseUrl}/verify-email?token=${encodeURIComponent(token)}`;
}

export function isEmailVerified(value) {
  return Boolean(value);
}

export function isSmtpConfigured(env = process.env) {
  return Boolean(env.SMTP_HOST && env.SMTP_PORT && env.SMTP_USER && env.SMTP_PASSWORD);
}

export async function sendVerificationEmail(
  { to, name, verificationUrl },
  { env = process.env, createTransport } = {},
) {
  if (!isSmtpConfigured(env)) {
    console.info(`Email verification link for ${to}: ${verificationUrl}`);
    return { mode: "log" };
  }

  const transportFactory = createTransport ?? (await import("nodemailer")).createTransport;
  const transporter = transportFactory({
    host: env.SMTP_HOST,
    port: Number(env.SMTP_PORT),
    secure: env.SMTP_SECURE === "true" || env.SMTP_PORT === "465",
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASSWORD,
    },
  });

  await transporter.sendMail({
    from: env.SMTP_FROM || env.SMTP_USER,
    to,
    subject: "Verify your Carolinian Events account",
    text: `Hi ${name || "there"},\n\nVerify your Carolinian Events account by opening this link:\n${verificationUrl}\n\nThis link expires in 24 hours.`,
    html: `<p>Hi ${escapeHtml(name || "there")},</p><p>Verify your Carolinian Events account by opening this link:</p><p><a href="${verificationUrl}">Verify email</a></p><p>This link expires in 24 hours.</p>`,
  });

  return { mode: "smtp" };
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
