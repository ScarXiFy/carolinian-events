"use server";

import { signIn, signOut } from "@/auth";
import { AuthError } from "next-auth";
import {
  createEmailVerificationToken,
  createUser,
  getUserByEmail,
} from "@/lib/db-users.mjs";
import { getDefaultUserRole } from "@/lib/auth-roles.mjs";
import { getAuthRedirectPath } from "@/lib/auth-navigation.mjs";
import {
  createVerificationToken,
  createVerificationTokenHash,
  createVerificationUrl,
  getVerificationTokenExpiry,
  isEmailVerified,
  sendVerificationEmail,
} from "@/lib/email-verification.mjs";
import { createUserId } from "@/lib/user-ids.mjs";
import { isGithubAuthConfigured, isGoogleAuthConfigured } from "@/lib/oauth-config.mjs";
import {
  getRateLimitKey,
  RATE_LIMITS,
  RateLimitError,
  requireRateLimit,
} from "@/lib/rate-limit.mjs";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";

export async function login(formData: FormData) {
  const callbackUrl = getAuthRedirectPath(String(formData.get("callbackUrl") ?? ""));
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  try {
    await requireRateLimit({
      key: getRateLimitKey("login", email),
      ...RATE_LIMITS.login,
    });
  } catch (error) {
    if (error instanceof RateLimitError) {
      return { error: error.message };
    }
    throw error;
  }

  const existing = await getUserByEmail(email);
  if (existing?.password_hash) {
    const isPasswordValid = await bcrypt.compare(password, existing.password_hash);
    if (isPasswordValid && !isEmailVerified(existing.email_verified_at)) {
      return { error: "Please verify your email before logging in." };
    }
  }

  const credentials = {
    ...Object.fromEntries(formData),
    email,
    redirect: false,
  };

  try {
    await signIn("credentials", credentials);
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid credentials." };
        default:
          return { error: "Something went wrong." };
      }
    }
    throw error;
  }
  redirect(callbackUrl);
}

export async function githubLogin(callbackUrl?: string) {
  if (!isGithubAuthConfigured(process.env)) {
    return { error: "GitHub login is not configured yet." };
  }

  await requireRateLimit({
    key: getRateLimitKey("login:github", "oauth"),
    ...RATE_LIMITS.login,
  });

  await signIn("github", { redirectTo: getAuthRedirectPath(callbackUrl) });
}

export async function googleLogin() {
  if (!isGoogleAuthConfigured(process.env)) {
    return { error: "Google login is not configured yet." };
  }

  await requireRateLimit({
    key: getRateLimitKey("login:google", "oauth"),
    ...RATE_LIMITS.login,
  });

  await signIn("google", { redirectTo: "/events" });
}

export async function logout() {
  await signOut({ redirectTo: "/" });
}

export async function signup(formData: FormData) {
  const callbackUrl = getAuthRedirectPath(String(formData.get("callbackUrl") ?? ""));
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirm-password") ?? "");

  try {
    await requireRateLimit({
      key: getRateLimitKey("signup", email),
      ...RATE_LIMITS.signup,
    });
  } catch (error) {
    if (error instanceof RateLimitError) {
      return { error: error.message };
    }
    throw error;
  }

  if (!email || !password || !name) {
    return { error: "Missing fields" };
  }

  if (password !== confirmPassword) {
    return { error: "Passwords do not match" };
  }

  const existing = await getUserByEmail(email);
  if (existing) {
    return { error: "User already exists" };
  }

  const hash = await bcrypt.hash(password, 10);
  const userId = createUserId();
  await createUser({
    id: userId,
    name,
    email,
    passwordHash: hash,
    role: getDefaultUserRole(email, process.env),
  });

  await sendVerificationForUser({ id: userId, name, email });

  redirect(`/verify-email/sent?email=${encodeURIComponent(email)}&callbackUrl=${encodeURIComponent(callbackUrl)}`);
}

export async function resendVerification(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const callbackUrl = getAuthRedirectPath(String(formData.get("callbackUrl") ?? ""));

  await requireRateLimit({
    key: getRateLimitKey("resend-verification", email),
    ...RATE_LIMITS.resendVerification,
  });

  const user = await getUserByEmail(email);

  if (!user?.id || !user.email || isEmailVerified(user.email_verified_at)) {
    redirect(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  }

  await sendVerificationForUser({
    id: user.id,
    name: user.name,
    email: user.email,
  });

  redirect(`/verify-email/sent?email=${encodeURIComponent(user.email)}&callbackUrl=${encodeURIComponent(callbackUrl)}&resent=1`);
}

async function sendVerificationForUser(user: { id: string; name?: string | null; email: string }) {
  const token = createVerificationToken();
  const tokenHash = createVerificationTokenHash(token);
  await createEmailVerificationToken(user.id, tokenHash, getVerificationTokenExpiry());
  await sendVerificationEmail({
    to: user.email,
    name: user.name,
    verificationUrl: createVerificationUrl(token),
  });
}
