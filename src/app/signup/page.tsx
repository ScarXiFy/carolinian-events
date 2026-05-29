import { AuthShell } from "@/components/auth-shell"
import { SignupForm } from "@/components/signup-form"

export default function SignupPage() {
  return (
    <AuthShell
      eyebrow="Create account"
      title="Start tracking what is happening at USC."
      description="Create your student account, or unlock organizer tools if your department gave you access."
    >
      <SignupForm />
    </AuthShell>
  )
}
