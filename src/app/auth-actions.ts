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
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";

export async function login(formData: FormData) {
  const callbackUrl = getAuthRedirectPath(String(formData.get("callbackUrl") ?? ""));
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

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
  await signIn("github", { redirectTo: getAuthRedirectPath(callbackUrl) });
}

export async function googleLogin() {
  if (!process.env.AUTH_GOOGLE_ID || !process.env.AUTH_GOOGLE_SECRET) {
    return { error: "Google login is not configured yet." };
  }

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
  const userId = `usr_${Date.now()}`;
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
