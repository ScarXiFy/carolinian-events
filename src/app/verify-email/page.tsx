import Link from "next/link";

import { consumeEmailVerificationToken } from "@/lib/db-users.mjs";
import { createVerificationTokenHash } from "@/lib/email-verification.mjs";
import { AuthShell } from "@/components/auth-shell";

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const result = token
    ? await consumeEmailVerificationToken(createVerificationTokenHash(token))
    : null;
  const verified = Boolean(result);

  return (
    <AuthShell
      eyebrow={verified ? "Email verified" : "Verification failed"}
      title={verified ? "Your account is ready." : "That verification link is invalid or expired."}
      description={
        verified
          ? "You can now sign in and use authenticated Carolinian Events features."
          : "Request a fresh verification email from the message page, then try again."
      }
    >
      <Link href="/login" className="legacy-btn legacy-btn-primary w-full justify-center rounded-xl py-3">
        Go to login
      </Link>
    </AuthShell>
  );
}
