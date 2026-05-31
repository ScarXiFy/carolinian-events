import Link from "next/link";

import { resendVerification } from "@/app/auth-actions";
import { AuthShell } from "@/components/auth-shell";

export default async function VerificationSentPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string; callbackUrl?: string; resent?: string }>;
}) {
  const params = await searchParams;
  const email = params.email ?? "";
  const callbackUrl = params.callbackUrl ?? "/events";

  return (
    <AuthShell
      eyebrow={params.resent ? "Email resent" : "Check your email"}
      title="Verify your email to continue."
      description="We sent a verification link to your inbox. Open it before logging in."
    >
      <div className="flex flex-col gap-3">
        {email ? (
          <p className="rounded-2xl border border-white/10 bg-white/[0.035] p-4 text-sm leading-5 text-white/70">
            Sent to {email}
          </p>
        ) : null}
        <form action={resendVerification}>
          <input type="hidden" name="email" value={email} />
          <input type="hidden" name="callbackUrl" value={callbackUrl} />
          <button type="submit" className="legacy-btn legacy-btn-secondary w-full justify-center rounded-xl py-3">
            Resend verification email
          </button>
        </form>
        <Link
          href={`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`}
          className="legacy-btn legacy-btn-primary w-full justify-center rounded-xl py-3"
        >
          Back to login
        </Link>
      </div>
    </AuthShell>
  );
}
