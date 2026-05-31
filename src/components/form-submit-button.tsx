"use client";

import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";

type FormSubmitButtonProps = {
  label: string;
  pendingLabel: string;
  className?: string;
  disabled?: boolean;
  loading?: boolean;
  loadingLabel?: string;
};

export function FormSubmitButton({
  label,
  pendingLabel,
  className,
  disabled = false,
  loading = false,
  loadingLabel = "Loading...",
}: FormSubmitButtonProps) {
  const { pending } = useFormStatus();
  const isBusy = pending || loading;

  return (
    <Button
      type="submit"
      disabled={disabled || isBusy}
      className={className}
      aria-busy={isBusy}
    >
      {loading ? loadingLabel : pending ? pendingLabel : label}
    </Button>
  );
}
