import { AuthShell } from "@/components/auth-shell"
import { LoginForm } from "@/components/login-form"
import { getAuthRedirectPath } from "@/lib/auth-navigation.mjs"

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>
}) {
  const callbackUrl = getAuthRedirectPath((await searchParams).callbackUrl)

  return (
    <AuthShell
      eyebrow="Welcome back"
      title="Get back to your campus events."
      description="Sign in to join upcoming activities, manage event details, and keep your Carolinian schedule in one place."
    >
      <LoginForm callbackUrl={callbackUrl} />
    </AuthShell>
  )
}
