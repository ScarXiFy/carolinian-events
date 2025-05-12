// app/(auth)/sign-in/[[...sign-in]]/page.tsx
import { SignIn } from '@clerk/nextjs'

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <SignIn 
        afterSignInUrl="/"
        afterSignUpUrl="/onboarding"
      />
    </div>
  )
}