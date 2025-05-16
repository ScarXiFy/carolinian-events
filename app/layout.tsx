import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from "@/components/theme-provider"
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { ClerkProvider } from '@clerk/nextjs'
import '@uploadthing/react/styles.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Carolinian Events',
  description: 'Manage and discover events in your area',
}

// ✅ Paste this just above your RootLayout
const clerkLocalization = {
  signIn: {
    subtitle: "Welcome back! Please sign in to continue.",
    start: {
      title: "Sign in to Carolinian Events", },
    actionLink: "Use a different method",
    actionLink__use_email: "Use email",
    actionLink__use_phone: "Use phone",
    actionLink__use_username: "Use username",
    actionLink__use_passkey: "Use passkey",
    actionLink__use_email_code: "Use verification code",
    actionLink__use_phone_code: "Use SMS code",
    actionLink__use_password: "Use password",
    actionLink__sign_in_with_passkey: "Sign in with passkey",
    actionLink__continue_with_provider: "Continue with {{provider|titleize}}",
    actionLink__join_waitlist: "Join the waitlist",
  },
  signUp: {
    subtitle: "Join and never miss an event again!",
    actionLink: "Use a different method",
    actionLink__use_email: "Use email",
    actionLink__use_phone: "Use phone",
    actionLink__use_username: "Use username",
    actionLink__use_passkey: "Use passkey",
    actionLink__sign_up_with_passkey: "Sign up with a passkey",
    actionLink__continue_with_provider: "Continue with {{provider|titleize}}",
    start: {
      title: "Become an Organizer!", },
  },
  socialButtonsBlockButton: "Continue with {{provider|titleize}}",
  formFieldLabel__emailAddress: "Email address",
  formFieldLabel__username: "Username",
  formFieldLabel__phoneNumber: "Phone number",
  formFieldLabel__code: "Verification code",
  formFieldLabel__password: "Password",
  formFieldLabel__newPassword: "New password",
  formFieldLabel__confirmPassword: "Confirm password",
  formFieldInputPlaceholder__emailAddress: "idnumber@example.com",
  formFieldInputPlaceholder__username: "your_username",
  formFieldInputPlaceholder__phoneNumber: "+63 912 345 6789",
  formFieldInputPlaceholder__code: "123456",
  formFieldInputPlaceholder__password: "••••••••",
  formFieldInputPlaceholder__newPassword: "••••••••",
  formFieldInputPlaceholder__confirmPassword: "••••••••",
  formButtonPrimary: "Continue",
  footerActionLink__signIn: "Sign in",
  footerActionLink__signUp: "Sign up",
  footerActionText__signIn: "Already have an account?",
  footerActionText__signUp: "Don't have an account?",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider localization={clerkLocalization}>
      <html lang="en" suppressHydrationWarning>
        <body className={inter.className}>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <div className="relative flex min-h-screen flex-col">
              <Header />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}
