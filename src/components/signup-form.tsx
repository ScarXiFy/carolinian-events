"use client";

import { useActionState, useState } from "react";
import {
  AlertCircle,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Lock,
  Mail,
  ShieldCheck,
  User,
} from "lucide-react";
import Link from "next/link";

import { signup } from "@/app/auth-actions";
import { Card, CardContent } from "@/components/ui/card";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type AuthActionState = {
  error?: string;
} | null;

const fieldClass =
  "min-h-12 rounded-xl border-white/10 bg-white/[0.045] px-11 py-3 text-base text-white shadow-none outline-none transition placeholder:text-white/34 focus-visible:border-[#2a8c4f] focus-visible:ring-[#2a8c4f]/25 disabled:opacity-60";

type PasswordFieldProps = {
  id: string;
  name: string;
  label: string;
  autoComplete: string;
  disabled: boolean;
};

function PasswordField({
  id,
  name,
  label,
  autoComplete,
  disabled,
}: PasswordFieldProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <Field>
      <FieldLabel htmlFor={id} className="text-white/88">
        {label}
      </FieldLabel>
      <div className="relative">
        <Lock
          className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-white/42"
          aria-hidden="true"
        />
        <Input
          id={id}
          name={name}
          type={isVisible ? "text" : "password"}
          autoComplete={autoComplete}
          required
          disabled={disabled}
          className={cn(fieldClass, "pr-12")}
        />
        <button
          type="button"
          onClick={() => setIsVisible((current) => !current)}
          className="absolute right-2 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-lg text-white/52 transition hover:bg-white/8 hover:text-white focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[#2a8c4f]/25"
          aria-label={isVisible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
        >
          {isVisible ? (
            <EyeOff className="size-4" aria-hidden="true" />
          ) : (
            <Eye className="size-4" aria-hidden="true" />
          )}
        </button>
      </div>
    </Field>
  );
}

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [isOrganizer, setIsOrganizer] = useState(false);
  const [showSecretKey, setShowSecretKey] = useState(false);
  const [error, action, isPending] = useActionState<AuthActionState, FormData>(
    async (_prevState, formData) => signup(formData),
    null,
  );

  return (
    <div className={cn("flex w-full min-w-0 flex-col gap-5", className)} {...props}>
      <Card className="w-full min-w-0 rounded-3xl border-white/10 bg-[#0d1110]/82 py-0 text-white shadow-[0_24px_70px_rgba(0,0,0,0.38)] backdrop-blur-2xl">
        <CardContent className="p-5 sm:p-6">
          <form action={action}>
            <FieldGroup className="gap-5">
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
                <FieldLabel htmlFor="name" className="text-white/88">
                  Full name
                </FieldLabel>
                <div className="relative">
                  <User
                    className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-white/42"
                    aria-hidden="true"
                  />
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Juan Dela Cruz"
                    autoComplete="name"
                    required
                    disabled={isPending}
                    className={fieldClass}
                  />
                </div>
              </Field>

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

              <div className="grid gap-4">
                <PasswordField
                  id="password"
                  name="password"
                  label="Password"
                  autoComplete="new-password"
                  disabled={isPending}
                />
                <PasswordField
                  id="confirm-password"
                  name="confirm-password"
                  label="Confirm password"
                  autoComplete="new-password"
                  disabled={isPending}
                />
              </div>

              <Field>
                <label
                  htmlFor="isOrganizer"
                  className="flex cursor-pointer items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.035] p-4 transition hover:border-[#d4a843]/40 hover:bg-[#d4a843]/8"
                >
                  <input
                    type="checkbox"
                    id="isOrganizer"
                    name="isOrganizer"
                    className="mt-1 size-4 rounded border-white/20 bg-black/30 accent-[#d4a843]"
                    checked={isOrganizer}
                    onChange={(event) => setIsOrganizer(event.target.checked)}
                    disabled={isPending}
                  />
                  <span className="flex min-w-0 flex-1 gap-3">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#d4a843]/12 text-[#f1d37a]">
                      <ShieldCheck className="size-5" aria-hidden="true" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-bold text-white">
                        I am an organizer
                      </span>
                      <span className="mt-1 block text-sm leading-5 text-white/55">
                        Unlock event creation and management tools with your
                        organizer key.
                      </span>
                    </span>
                  </span>
                </label>
              </Field>

              {isOrganizer ? (
                <Field>
                  <FieldLabel htmlFor="secretKey" className="text-white/88">
                    Organizer secret key
                  </FieldLabel>
                  <div className="relative">
                    <KeyRound
                      className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-white/42"
                      aria-hidden="true"
                    />
                    <Input
                      id="secretKey"
                      name="secretKey"
                      type={showSecretKey ? "text" : "password"}
                      placeholder="Ask admin for the key"
                      autoComplete="off"
                      required={isOrganizer}
                      disabled={isPending}
                      className={cn(fieldClass, "pr-12")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowSecretKey((current) => !current)}
                      className="absolute right-2 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-lg text-white/52 transition hover:bg-white/8 hover:text-white focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[#2a8c4f]/25"
                      aria-label={showSecretKey ? "Hide organizer secret key" : "Show organizer secret key"}
                    >
                      {showSecretKey ? (
                        <EyeOff className="size-4" aria-hidden="true" />
                      ) : (
                        <Eye className="size-4" aria-hidden="true" />
                      )}
                    </button>
                  </div>
                  <FieldDescription className="text-white/52">
                    Required only for approved student organizations and event
                    staff.
                  </FieldDescription>
                </Field>
              ) : null}

              <Field className="pt-1">
                <button
                  type="submit"
                  disabled={isPending}
                  className="legacy-btn legacy-btn-primary h-auto min-h-12 w-full rounded-xl py-3 text-sm font-bold disabled:pointer-events-none disabled:opacity-60"
                >
                  {isPending ? (
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                      Creating account...
                    </span>
                  ) : (
                    "Create account"
                  )}
                </button>
                <FieldDescription className="text-center text-white/58">
                  Already have an account?{" "}
                  <Link
                    href="/login"
                    className="font-semibold text-[#d4a843] transition hover:text-[#f1d37a] hover:no-underline"
                  >
                    Sign in
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
