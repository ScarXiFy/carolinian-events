type EventStatus = "Upcoming" | "Ongoing" | "Completed" | "Cancelled";
type EventApprovalStatus = "Pending" | "Approved" | "Rejected";

const statusStyles = {
  Upcoming: "status-upcoming",
  Ongoing: "status-ongoing",
  Completed: "status-completed",
  Cancelled: "status-cancelled",
} satisfies Record<EventStatus, string>;

export function EventStatusBadge({
  status,
  approvalStatus = "Approved",
  className = "",
}: {
  status: string;
  approvalStatus?: string;
  className?: string;
}) {
  const safeStatus = isEventStatus(status) ? status : "Upcoming";
  const safeApprovalStatus = isEventApprovalStatus(approvalStatus)
    ? approvalStatus
    : "Approved";

  if (safeApprovalStatus !== "Approved") {
    const approvalClass = safeApprovalStatus === "Rejected"
      ? "status-cancelled"
      : "status-upcoming";

    return (
      <span className={`status-badge ${approvalClass} ${className}`}>
        {safeApprovalStatus}
      </span>
    );
  }

  return (
    <span className={`status-badge ${statusStyles[safeStatus]} ${className}`}>
      {safeStatus}
    </span>
  );
}

function isEventStatus(value: string): value is EventStatus {
  return ["Upcoming", "Ongoing", "Completed", "Cancelled"].includes(value);
}

function isEventApprovalStatus(value: string): value is EventApprovalStatus {
  return ["Pending", "Approved", "Rejected"].includes(value);
}
