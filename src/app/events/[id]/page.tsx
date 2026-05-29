import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { CalendarDays, Clock, MapPin } from "lucide-react";

import {
  formatCreatedDate,
  formatEventTime,
  formatFullEventDate,
} from "@/lib/events.mjs";
import { getEventByRouteId, getEventStaticParams } from "@/lib/event-store.mjs";
import { getEventFlashMessage } from "@/lib/flash-message.mjs";
import { EventFlash } from "../event-flash";
import { auth } from "@/auth";
import { SiteNavbarServer } from "@/components/site-navbar-server";
import { JoinEventButton } from "./join-button";
import { canJoinEvents, canManageEvent } from "@/lib/permissions.mjs";

type EventStatus = "Upcoming" | "Ongoing" | "Completed" | "Cancelled";

const statusStyles = {
  Upcoming: "status-upcoming",
  Ongoing: "status-ongoing",
  Completed: "status-completed",
  Cancelled: "status-cancelled",
} satisfies Record<EventStatus, string>;

export function generateStaticParams() {
  return getEventStaticParams();
}

export default async function EventDetailPage(
  props: PageProps<"/events/[id]"> & {
    searchParams: Promise<{ created?: string; updated?: string }>;
  },
) {
  const { id } = await props.params;
  const params = await props.searchParams;
  const event = await getEventByRouteId(id);
  const flashMessage = getEventFlashMessage(params);

  if (!event) {
    notFound();
  }

  const eventWithParticipants = event as typeof event & {
    participantLimit: number | null;
    participantCount: number;
    eventImagePath: string | null;
  };

  const formattedEndTime = eventWithParticipants.eventEndTime
    ? new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" }).format(
        new Date(`${eventWithParticipants.eventDate}T${eventWithParticipants.eventEndTime}`),
      )
    : null;

  const session = await auth();
  const userId = session?.user?.id;
  const canManageThisEvent = canManageEvent(session?.user?.role, userId, eventWithParticipants);
  const canJoinThisEvent =
    Boolean(userId) &&
    canJoinEvents(session?.user?.role) &&
    !canManageThisEvent;

  const isJoined = userId ? await isEventParticipant(event.id, userId) : false;

  const isFull =
    eventWithParticipants.participantLimit !== null &&
    eventWithParticipants.participantCount >= eventWithParticipants.participantLimit;

  return (
    <main className="legacy-home min-h-screen bg-[#050505] text-white">
      <div className="particle-field" aria-hidden="true" />
      <div className="ambient-glow ambient-glow-green" aria-hidden="true" />
      <div className="ambient-glow ambient-glow-gold" aria-hidden="true" />

      <SiteNavbarServer showUserMenu />

      <section className="relative z-10 mx-auto w-full max-w-[1200px] px-[5%] pb-20 pt-[120px]">
        <Link href="/events" className="legacy-btn legacy-btn-secondary mb-8">
          ← Back to Dashboard
        </Link>

        <EventFlash message={flashMessage} />

        <article className="event-detail-card">
          <header className="event-detail-header">
            {/* Title row: event name + status badge */}
            <div className="event-detail-title-row">
              <h1>{eventWithParticipants.eventName}</h1>
              <span
                className={`status-badge detail-badge ${statusStyles[eventWithParticipants.status as EventStatus]}`}
              >
                {eventWithParticipants.status}
              </span>
            </div>

            {/* Meta pills */}
            <div className="event-meta">
              <div className="meta-pill">
                <CalendarDays size={13} aria-hidden="true" />
                <span className="meta-pill-label">Date</span>
                <span className="meta-pill-value">{formatFullEventDate(eventWithParticipants)}</span>
              </div>
              <div className="meta-pill">
                <Clock size={13} aria-hidden="true" />
                <span className="meta-pill-label">Time</span>
                <span className="meta-pill-value">
                  {formatEventTime(eventWithParticipants)}
                  {formattedEndTime ? ` – ${formattedEndTime}` : ""}
                </span>
              </div>
              <div className="meta-pill">
                <MapPin size={13} aria-hidden="true" />
                <span className="meta-pill-label">Place</span>
                <span className="meta-pill-value">{eventWithParticipants.location}</span>
              </div>
            </div>
          </header>

          {/* Event image — real image if available, styled placeholder otherwise */}
          <div className="event-detail-image-wrapper">
            {eventWithParticipants.eventImagePath ? (
              <Image
                src={eventWithParticipants.eventImagePath}
                alt={`${eventWithParticipants.eventName} event banner`}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 1200px) 100vw, 1200px"
              />
            ) : (
              <div
                className={`event-detail-image-placeholder ${getDetailMediaClass(
                  eventWithParticipants.category,
                  eventWithParticipants.status,
                )}`}
                aria-hidden="true"
              >
                <div className="event-media-orb" />
                <div className="event-media-lines" />
                <div className="event-media-label">{eventWithParticipants.category}</div>
              </div>
            )}
          </div>

          {/* Body: description + sidebar */}
          <div className="event-detail-body">
            <div className="event-detail-main">
              <section className="event-section">
                <h2>Description</h2>
                <p>{eventWithParticipants.description || "No description provided."}</p>
              </section>
            </div>

            <aside className="event-detail-sidebar">
              <section className="event-section">
                <h2>Organizer</h2>
                <p>{eventWithParticipants.organizer}</p>
              </section>
              <section className="event-section">
                <h2>Category</h2>
                <p>{eventWithParticipants.category}</p>
              </section>
              <section className="event-section">
                <h2>Participants</h2>
                <p>
                  {eventWithParticipants.participantCount}
                  {eventWithParticipants.participantLimit !== null
                    ? ` / ${eventWithParticipants.participantLimit}`
                    : ""}
                </p>
              </section>
            </aside>
          </div>

          {/* Footer: actions */}
          <footer className="event-detail-footer">
            <p>Added on {formatCreatedDate(eventWithParticipants)}</p>
            <div className="action-group">
              {/* Students/Organizers who don't manage this event */}
              {canJoinThisEvent && (
                <JoinEventButton eventId={eventWithParticipants.id} isJoined={isJoined} isFull={isFull} />
              )}
              {/* Managers (organizer/admin): Join Event left of Edit */}
              {canManageThisEvent && (
                <>
                  <JoinEventButton eventId={eventWithParticipants.id} isJoined={isJoined} isFull={isFull} />
                  <Link href={`/events/${eventWithParticipants.id}/edit`} className="legacy-btn legacy-btn-secondary btn-sm">
                    Edit
                  </Link>
                  <Link href={`/events/${eventWithParticipants.id}/delete`} className="legacy-btn btn-danger">
                    Delete
                  </Link>
                </>
              )}
            </div>
          </footer>
        </article>
      </section>
    </main>
  );
}

async function isEventParticipant(eventId: number, userId: string) {
  const { getEventParticipants } = await import("@/lib/db-users.mjs");
  const participants = await getEventParticipants(eventId);

  return participants.includes(userId);
}

function getDetailMediaClass(category: string, status: string) {
  const value = `${category} ${status}`.toLowerCase();

  if (value.includes("thesis") || value.includes("academic")) {
    return "event-media-academic";
  }

  if (value.includes("verification") || value.includes("tech")) {
    return "event-media-tech";
  }

  if (value.includes("social") || value.includes("cultural")) {
    return "event-media-social";
  }

  if (value.includes("sports")) {
    return "event-media-sports";
  }

  return "event-media-default";
}
