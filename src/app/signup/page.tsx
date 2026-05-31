import { AuthShell } from "@/components/auth-shell"
import { SignupForm } from "@/components/signup-form"
import { getAuthRedirectPath } from "@/lib/auth-navigation.mjs"

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>
}) {
  const callbackUrl = getAuthRedirectPath((await searchParams).callbackUrl)

  return (
    <AuthShell
      eyebrow="Create account"
      title="Start tracking what is happening at USC."
      description="Create your student account, or unlock organizer tools if your department gave you access."
    >
      <SignupForm callbackUrl={callbackUrl} />
    </AuthShell>
  )
}
