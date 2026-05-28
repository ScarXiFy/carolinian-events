"use server";

import { signIn } from "@/auth";
import { AuthError } from "next-auth";
import { createUser, getUserByEmail } from "@/lib/mysql-users.mjs";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";

export async function login(formData: FormData) {
  try {
    await signIn("credentials", Object.fromEntries(formData));
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
  redirect("/events");
}

export async function githubLogin() {
  await signIn("github", { redirectTo: "/events" });
}

export async function signup(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirm-password") ?? "");
  const isOrganizer = formData.get("isOrganizer") === "on";
  const secretKey = String(formData.get("secretKey") ?? "");

  if (!email || !password || !name) {
    return { error: "Missing fields" };
  }

  if (password !== confirmPassword) {
    return { error: "Passwords do not match" };
  }

  if (isOrganizer && (!process.env.ORGANIZER_SECRET || secretKey !== process.env.ORGANIZER_SECRET)) {
    return { error: "Invalid organizer secret key" };
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
    role: isOrganizer ? "Organizer" : "Student",
  });

  try {
    await signIn("credentials", { email, password, redirect: false });
  } catch (error) {
    console.error(error);
  }

  redirect("/events");
}
