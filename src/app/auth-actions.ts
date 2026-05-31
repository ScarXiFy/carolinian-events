"use server";

import { signIn, signOut } from "@/auth";
import { AuthError } from "next-auth";
import { createUser, getUserByEmail } from "@/lib/db-users.mjs";
import { getDefaultUserRole } from "@/lib/auth-roles.mjs";
import { getAuthRedirectPath } from "@/lib/auth-navigation.mjs";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";

export async function login(formData: FormData) {
  const callbackUrl = getAuthRedirectPath(String(formData.get("callbackUrl") ?? ""));
  const credentials = {
    ...Object.fromEntries(formData),
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
  await createUser({
    id: `usr_${Date.now()}`,
    name,
    email,
    passwordHash: hash,
    role: getDefaultUserRole(email, process.env),
  });

  try {
    await signIn("credentials", { email, password, redirect: false });
  } catch (error) {
    console.error(error);
  }

  redirect(callbackUrl);
}
