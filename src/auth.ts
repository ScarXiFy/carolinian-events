import NextAuth from "next-auth";
import type { Provider } from "next-auth/providers";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import {
  createUser,
  getUserByEmail,
  getUserByGithubId,
  getUserByGoogleId,
  getUserById,
  linkGithubIdToUser,
  linkGoogleIdToUser,
  markUserEmailVerified,
} from "@/lib/db-users.mjs";
import { getDefaultUserRole } from "@/lib/auth-roles.mjs";
import { isEmailVerified } from "@/lib/email-verification.mjs";

/*
Google OAuth setup required before enabling live Google login:
1. Create a Google Cloud OAuth 2.0 Client ID for a Web application.
2. Add AUTH_GOOGLE_ID and AUTH_GOOGLE_SECRET to the local and deployment environment.
3. Add the callback URL: http://localhost:3000/api/auth/callback/google for local dev.
4. Add the production callback URL: https://YOUR_DOMAIN/api/auth/callback/google.
5. Configure the OAuth consent screen with app name, support email, authorized domain, and the email/profile scopes.

Role bootstrap setup:
1. Add ADMIN_EMAILS to local and deployment environment as a comma-separated list.
2. Matching email/password, GitHub, or Google accounts are created as Admin.
3. All other new accounts are created as Student and must request organizer access.
*/

type DatabaseUser = {
  id: string;
  name: string | null;
  email: string | null;
  password_hash?: string | null;
  role?: string | null;
  email_verified_at?: string | Date | null;
};

const providers: Provider[] = [
  GitHub({
    clientId: process.env.AUTH_GITHUB_ID || "placeholder",
    clientSecret: process.env.AUTH_GITHUB_SECRET || "placeholder",
  }),
  Credentials({
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
      if (!credentials?.email || !credentials?.password) return null;

      const user = await getUserByEmail(credentials.email as string) as DatabaseUser | null;
      if (!user || !user.password_hash) return null;

      const isPasswordValid = await bcrypt.compare(
        credentials.password as string,
        user.password_hash
      );

      if (!isPasswordValid) return null;
      if (!isEmailVerified(user.email_verified_at)) return null;

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role ?? "Student",
        isEmailVerified: true,
      };
    },
  }),
];

if (process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET) {
  providers.push(
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
  );
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers,
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "github") {
        const githubId = profile?.id?.toString();
        if (!githubId) return false;

        const existingUser = await getUserByGithubId(githubId) as DatabaseUser | null;
        if (!existingUser) {
          const emailUser = user.email ? await getUserByEmail(user.email) as DatabaseUser | null : null;
          if (emailUser) {
            const linkedUser = await linkGithubIdToUser(emailUser.id, githubId) as DatabaseUser | null;
            if (linkedUser && !isEmailVerified(linkedUser.email_verified_at)) {
              await markUserEmailVerified(linkedUser.id);
            }
            return Boolean(linkedUser);
          }

          await createUser({
            id: `usr_${Date.now()}`,
            name: user.name || profile?.login,
            email: user.email,
            githubId,
            role: getDefaultUserRole(user.email, process.env),
            emailVerifiedAt: new Date(),
          });
        } else if (existingUser && !isEmailVerified(existingUser.email_verified_at)) {
          await markUserEmailVerified(existingUser.id);
        }
      }

      if (account?.provider === "google") {
        const googleId = account.providerAccountId;
        if (!googleId) return false;

        const existingUser = await getUserByGoogleId(googleId) as DatabaseUser | null;
        if (!existingUser) {
          const emailUser = user.email ? await getUserByEmail(user.email) as DatabaseUser | null : null;
          if (emailUser) {
            const linkedUser = await linkGoogleIdToUser(emailUser.id, googleId) as DatabaseUser | null;
            if (linkedUser && !isEmailVerified(linkedUser.email_verified_at)) {
              await markUserEmailVerified(linkedUser.id);
            }
            return Boolean(linkedUser);
          }

          await createUser({
            id: `usr_${Date.now()}`,
            name: user.name,
            email: user.email,
            googleId,
            role: getDefaultUserRole(user.email, process.env),
            emailVerifiedAt: new Date(),
          });
        } else if (existingUser && !isEmailVerified(existingUser.email_verified_at)) {
          await markUserEmailVerified(existingUser.id);
        }
      }
      return true;
    },
    async jwt({ token, user, account, profile }) {
      if (user) {
        // Initial sign in
        if (account?.provider === "github") {
          const dbUser = await getUserByGithubId(profile?.id?.toString()) as DatabaseUser | null;
          if (dbUser) {
            token.id = dbUser.id;
          }
        } else if (account?.provider === "google") {
          const dbUser = await getUserByGoogleId(account.providerAccountId) as DatabaseUser | null;
          if (dbUser) {
            token.id = dbUser.id;
          }
        } else {
          token.id = user.id;
        }
      }

      // Always fetch the latest user role and profile from the database
      if (token.id) {
        const dbUser = await getUserById(token.id as string) as DatabaseUser | null;
        if (dbUser) {
          token.role = dbUser.role ?? "Student";
          token.name = dbUser.name;
          token.email = dbUser.email;
          token.isEmailVerified = isEmailVerified(dbUser.email_verified_at);
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.isEmailVerified = Boolean(token.isEmailVerified);
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
});
