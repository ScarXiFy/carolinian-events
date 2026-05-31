export function EventParticipantProgress({
  participantCount,
  participantLimit,
}: {
  participantCount: number;
  participantLimit: number | null;
}) {
  const hasLimit = participantLimit !== null;
  const percent = hasLimit
    ? Math.min(100, Math.round((participantCount / Math.max(participantLimit, 1)) * 100))
    : 0;
  const label = hasLimit
    ? `${participantCount} of ${participantLimit} slots taken`
    : `${participantCount} registered`;

  return (
    <div className="event-progress" aria-label={label}>
      <div className="event-progress-header">
        <span>Participant Progress</span>
        <strong>{hasLimit ? `${percent}%` : participantCount}</strong>
      </div>
      <div className="event-progress-track">
        <div
          className="event-progress-fill"
          style={{ width: hasLimit ? `${percent}%` : "100%" }}
        />
      </div>
      <p>{label}</p>
    </div>
  );
}
