"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";

import { joinEvent, leaveEvent } from "./actions";

type JoinEventButtonProps = {
  eventId: number;
  isJoined: boolean;
  isFull: boolean;
  status: string;
  joinLabel: string;
  loginHref?: string;
};

export function JoinEventButton({
  eventId,
  isJoined,
  isFull,
  status,
  joinLabel,
  loginHref,
}: JoinEventButtonProps) {
  const [loading, setLoading] = useState(false);
  const isClosed = status === "Completed" || status === "Cancelled";
  const isUnavailable = isClosed || isFull;

  if (loginHref) {
    if (isUnavailable) {
      return (
        <button className="legacy-btn legacy-btn-primary" disabled>
          {getButtonLabel({ loading: false, isJoined, isFull, status, joinLabel })}
        </button>
      );
    }

    return (
      <Link href={loginHref} className="legacy-btn legacy-btn-primary">
        {joinLabel}
      </Link>
    );
  }

  async function handleAction() {
    setLoading(true);

    try {
      if (isJoined) {
        const result = await leaveEvent(eventId);
        if (result.error) toast.error(result.error);
        else toast.success("You have left the event.");
      } else {
        const result = await joinEvent(eventId);
        if (result.error) toast.error(result.error);
        else toast.success("You have successfully joined the event!");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleAction}
      disabled={loading || isClosed || (isFull && !isJoined)}
      className={`legacy-btn ${isJoined ? "btn-danger" : "legacy-btn-primary"}`}
    >
      {getButtonLabel({ loading, isJoined, isFull, status, joinLabel })}
    </button>
  );
}

function getButtonLabel({
  loading,
  isJoined,
  isFull,
  status,
  joinLabel,
}: {
  loading: boolean;
  isJoined: boolean;
  isFull: boolean;
  status: string;
  joinLabel: string;
}) {
  if (loading) {
    return isJoined ? "Cancelling RSVP..." : "Joining...";
  }

  if (status === "Completed") return "Event Completed";
  if (status === "Cancelled") return "Event Cancelled";

  if (isJoined) {
    return "Cancel RSVP";
  }

  return isFull ? "Event Full" : joinLabel;
}
