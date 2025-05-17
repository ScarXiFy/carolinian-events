'use client'

import { SignIn } from "@clerk/nextjs"
import { useTheme } from "next-themes"

export default function SignInPage() {
  useTheme()

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/usc-background.png')" }}
      />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-white via-[#b7e4c7] to-[#40916c] opacity-90" />

      {/* Content Wrapper to center the SignIn form */}
      <div className="relative z-10 flex min-h-screen items-center justify-center px-4">
        <SignIn
          appearance={{
            elements: {
              clerkBadge: "hidden",
              card: "bg-white border border-yellow-500 rounded-2xl shadow-xl w-full max-w-md",
              headerTitle: "text-2xl font-bold text-yellow-600",
              headerSubtitle: "text-sm text-gray-700",
              socialButtonsBlockButton: "bg-white border border-gray-300 text-black hover:bg-gray-100 rounded-full",
              socialButtonsBlockButtonText: "text-black font-medium",
              dividerText: "text-gray-600",
              formFieldLabel: "text-yellow-700 font-semibold",
              formFieldInput: "bg-white text-black placeholder:text-gray-500 border-2 border-yellow-500 focus:border-yellow-600 rounded-full px-4 py-2",
              formButtonPrimary: "bg-yellow-600 hover:bg-yellow-700 text-white rounded-full px-4 py-2 transition",
              footerActionText: "text-gray-700",
              footerActionLink: "text-yellow-700 hover:underline",
              formFieldError: "text-red-600 text-sm",
              formFieldHint: "text-gray-600 text-sm",
            },
            variables: {
              colorPrimary: "#fec425",
              fontFamily: "inherit",
            },
          }}
        />
      </div>
    </div>
  )
}
