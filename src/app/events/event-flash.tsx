"use client";

import { useEffect } from "react";
import { toast } from "sonner";

type EventFlashProps = {
  message: {
    tone: string;
    text: string;
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

  if (!message) {
    return null;
  }

  const toneClass =
    message.tone === "success"
      ? "border-[#2a8c4f]/40 bg-[#2a8c4f]/15 text-[#b8f3c8]"
      : "border-[#d4a843]/40 bg-[#d4a843]/15 text-[#f6e6b4]";

  return (
    <div
      className={`mb-6 rounded-2xl border px-5 py-4 text-sm font-semibold ${toneClass}`}
      role="status"
    >
      {message.text}
    </div>
  );
}
