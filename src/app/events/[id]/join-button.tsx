"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";

import { joinEvent, leaveEvent } from "./actions";

type JoinEventButtonProps = {
  eventId: number;
  isJoined: boolean;
  isFull: boolean;
  loginHref?: string;
};

export function JoinEventButton({
  eventId,
  isJoined,
  isFull,
  loginHref,
}: JoinEventButtonProps) {
  const [loading, setLoading] = useState(false);

  if (loginHref) {
    return (
      <Link href={loginHref} className="legacy-btn legacy-btn-primary">
        Join Event
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
