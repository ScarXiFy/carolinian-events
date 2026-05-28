"use client";

import { useActionState, useState } from "react";
import { AlertCircle, Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react";
import Link from "next/link";

import { githubLogin, googleLogin, login } from "@/app/auth-actions";
import { Card, CardContent } from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type AuthActionState = {
  error?: string;
} | null;

const fieldClass =
  "min-h-12 rounded-xl border-white/10 bg-white/[0.045] px-11 py-3 text-base text-white shadow-none outline-none transition placeholder:text-white/34 focus-visible:border-[#2a8c4f] focus-visible:ring-[#2a8c4f]/25 disabled:opacity-60";

export function LoginForm({
  isGoogleConfigured = false,
  className,
  ...props
}: React.ComponentProps<"div"> & { isGoogleConfigured?: boolean }) {
  const [showPassword, setShowPassword] = useState(false);
  const [error, action, isPending] = useActionState<AuthActionState, FormData>(
    async (_prevState, formData) => login(formData),
    null,
  );

  return (
    <div className={cn("flex w-full min-w-0 flex-col gap-5", className)} {...props}>
      <Card className="w-full min-w-0 rounded-3xl border-white/10 bg-[#0d1110]/82 py-0 text-white shadow-[0_24px_70px_rgba(0,0,0,0.38)] backdrop-blur-2xl">
        <CardContent className="p-5 sm:p-6">
          <form action={action}>
            <FieldGroup className="gap-5">
              <button
                type="button"
                onClick={() => githubLogin()}
                disabled={isPending}
                className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.045] px-4 py-3 text-sm font-bold text-white transition hover:border-[#2a8c4f]/70 hover:bg-[#2a8c4f]/18 hover:text-[#b9f5cc] focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[#2a8c4f]/25 disabled:pointer-events-none disabled:opacity-60"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="size-4"
                  aria-hidden="true"
                >
                  <path
                    fill="currentColor"
                    d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.44 9.8 8.21 11.39.6.11.79-.26.79-.58v-2.23c-3.34.72-4.03-1.42-4.03-1.42-.55-1.39-1.33-1.76-1.33-1.76-1.09-.74.08-.73.08-.73 1.2.08 1.84 1.24 1.84 1.24 1.07 1.83 2.81 1.3 3.49 1 .11-.78.42-1.31.76-1.61-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.52.12-3.18 0 0 1.01-.32 3.3 1.23.96-.27 1.98-.4 3-.4s2.05.13 3 .4c2.29-1.55 3.3-1.23 3.3-1.23.65 1.66.24 2.88.12 3.18.77.84 1.24 1.91 1.24 3.22 0 4.61-2.81 5.62-5.48 5.92.43.37.82 1.1.82 2.22v3.29c0 .32.19.69.8.58C20.57 21.8 24 17.3 24 12c0-6.63-5.37-12-12-12Z"
                  />
                </svg>
                Login with GitHub
              </button>

              <button
                type="button"
                onClick={() => googleLogin()}
                disabled={isPending || !isGoogleConfigured}
                title={
                  isGoogleConfigured
                    ? "Login with Google"
                    : "Google OAuth credentials are not configured yet."
                }
                className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.045] px-4 py-3 text-sm font-bold text-white transition hover:border-[#2a8c4f]/70 hover:bg-[#2a8c4f]/18 hover:text-[#b9f5cc] focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[#2a8c4f]/25 disabled:pointer-events-none disabled:opacity-45"
              >
                <span className="flex size-4 items-center justify-center rounded-full bg-white text-xs font-black text-[#111]">
                  G
                </span>
                {isGoogleConfigured ? "Login with Google" : "Google login unavailable"}
              </button>

              <FieldSeparator className="-my-1 text-white/42 *:data-[slot=field-separator-content]:bg-[#0d1110]">
                Or continue with email
              </FieldSeparator>

              {error?.error ? (
                <div
                  role="alert"
                  className="flex items-start gap-2 rounded-xl border border-red-400/20 bg-red-500/10 px-3 py-2 text-sm text-red-100"
                >
                  <AlertCircle className="mt-0.5 size-4 shrink-0 text-red-300" aria-hidden="true" />
                  <span>{error.error}</span>
                </div>
              ) : null}

              <Field>
                <FieldLabel htmlFor="email" className="text-white/88">
                  Email
                </FieldLabel>
                <div className="relative">
                  <Mail
                    className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-white/42"
                    aria-hidden="true"
                  />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@usc.edu.ph"
                    autoComplete="email"
                    required
                    disabled={isPending}
                    className={fieldClass}
                  />
                </div>
              </Field>

              <Field>
                <FieldLabel htmlFor="password" className="text-white/88">
                  Password
                </FieldLabel>
                <div className="relative">
                  <Lock
                    className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-white/42"
                    aria-hidden="true"
                  />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    disabled={isPending}
                    className={cn(fieldClass, "pr-12")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    className="absolute right-2 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-lg text-white/52 transition hover:bg-white/8 hover:text-white focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[#2a8c4f]/25"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="size-4" aria-hidden="true" />
                    ) : (
                      <Eye className="size-4" aria-hidden="true" />
                    )}
                  </button>
                </div>
              </Field>

              <Field className="pt-1">
                <button
                  type="submit"
                  disabled={isPending}
                  className="legacy-btn legacy-btn-primary h-auto min-h-12 w-full rounded-xl py-3 text-sm font-bold disabled:pointer-events-none disabled:opacity-60"
                >
                  {isPending ? (
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                      Logging in...
                    </span>
                  ) : (
                    "Login"
                  )}
                </button>
                <FieldDescription className="text-center text-white/58">
                  Don&apos;t have an account?{" "}
                  <Link
                    href="/signup"
                    className="font-semibold text-[#d4a843] transition hover:text-[#f1d37a] hover:no-underline"
                  >
                    Sign up
                  </Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
