type EventStatus = "Upcoming" | "Ongoing" | "Completed" | "Cancelled";

const statusStyles = {
  Upcoming: "status-upcoming",
  Ongoing: "status-ongoing",
  Completed: "status-completed",
  Cancelled: "status-cancelled",
} satisfies Record<EventStatus, string>;

export function EventStatusBadge({
  status,
  className = "",
}: {
  status: string;
  className?: string;
}) {
  const safeStatus = isEventStatus(status) ? status : "Upcoming";

  return (
    <span className={`status-badge ${statusStyles[safeStatus]} ${className}`}>
      {safeStatus}
    </span>
  );
}

function isEventStatus(value: string): value is EventStatus {
  return ["Upcoming", "Ongoing", "Completed", "Cancelled"].includes(value);
}
