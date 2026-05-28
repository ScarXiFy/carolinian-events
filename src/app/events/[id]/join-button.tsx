"use client";

import { useState } from "react";
import { toast } from "sonner";

import { joinEvent, leaveEvent } from "./actions";

type JoinEventButtonProps = {
  eventId: number;
  isJoined: boolean;
  isFull: boolean;
};

export function JoinEventButton({
  eventId,
  isJoined,
  isFull,
}: JoinEventButtonProps) {
  const [loading, setLoading] = useState(false);

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
      disabled={loading || (isFull && !isJoined)}
      className={`legacy-btn ${isJoined ? "btn-danger" : "legacy-btn-primary"}`}
    >
      {getButtonLabel({ loading, isJoined, isFull })}
    </button>
  );
}

function getButtonLabel({
  loading,
  isJoined,
  isFull,
}: {
  loading: boolean;
  isJoined: boolean;
  isFull: boolean;
}) {
  if (loading) {
    return "Processing...";
  }

  if (isJoined) {
    return "Cancel RSVP";
  }

  return isFull ? "Event Full" : "Join Event";
}
