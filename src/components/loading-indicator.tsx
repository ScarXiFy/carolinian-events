export function LoadingIndicator({
  label = "Loading",
  compact = false,
}: {
  label?: string;
  compact?: boolean;
}) {
  return (
    <div className={`ce-loading ${compact ? "ce-loading-compact" : ""}`} role="status">
      <span className="ce-loading-ring" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}
