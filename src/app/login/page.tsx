import { AuthShell } from "@/components/auth-shell"
import { LoginForm } from "@/components/login-form"

export default function LoginPage() {
  const isGoogleConfigured = Boolean(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET);

  return (
    <AuthShell
      eyebrow="Welcome back"
      title="Get back to your campus events."
      description="Sign in to join upcoming activities, manage event details, and keep your Carolinian schedule in one place."
    >
      <LoginForm isGoogleConfigured={isGoogleConfigured} />
    </AuthShell>
  )
}
