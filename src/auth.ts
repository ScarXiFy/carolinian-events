import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { getUserByEmail, getUserByGithubId, createUser } from "@/lib/mysql-users.mjs";

type DatabaseUser = {
  id: string;
  name: string | null;
  email: string | null;
  password_hash?: string | null;
  role?: string | null;
};

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
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

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role ?? "Student",
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "github") {
        const githubId = profile?.id?.toString();
        if (!githubId) return false;

        const existingUser = await getUserByGithubId(githubId) as DatabaseUser | null;
        if (!existingUser) {
          // Check if email exists to link, or just create new
          const emailUser = user.email ? await getUserByEmail(user.email) as DatabaseUser | null : null;
          if (emailUser) {
            // we could link it, but for simplicity let's just create or reject if email collision
            return false;
          }

          await createUser({
            id: `usr_${Date.now()}`,
            name: user.name || profile?.login,
            email: user.email,
            githubId,
            role: "Student",
          });
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
            token.role = dbUser.role ?? "Student";
          }
        } else {
          token.id = user.id;
          token.role = user.role ?? "Student";
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
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
