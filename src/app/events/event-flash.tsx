"use client";

import { useEffect } from "react";
import { toast } from "sonner";

type EventFlashProps = {
  message: {
    tone: string;
    text: string;
    showInline?: boolean;
  } | null;
};

export function EventFlash({ message }: EventFlashProps) {
  useEffect(() => {
    if (!message) {
      return;
    }

    const toastId = `event-flash-${message.tone}-${message.text}`;

    const timeoutId = window.setTimeout(() => {
      if (message.tone === "success") {
        toast.success(message.text, { id: toastId });
        return;
      }

      toast.info(message.text, { id: toastId });
    }, 100);

    return () => window.clearTimeout(timeoutId);
  }, [message]);

  return null;
}
