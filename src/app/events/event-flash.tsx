type EventFlashProps = {
  message: {
    tone: string;
    text: string;
  } | null;
};

export function EventFlash({ message }: EventFlashProps) {
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
