import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { CalendarDays, Clock, MapPin, Users } from "lucide-react";

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
import { getLoginHref } from "@/lib/auth-navigation.mjs";
import { canJoinEvents, canManageEvent, ROLES } from "@/lib/permissions.mjs";
import { cancelEvent } from "./actions";

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
    createdByUserId: string | null;
  };

  const formattedEndTime = eventWithParticipants.eventEndTime
    ? new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" }).format(
        new Date(`${eventWithParticipants.eventDate}T${eventWithParticipants.eventEndTime}`),
      )
    : null;
  const formattedStartTime = formatEventTime(eventWithParticipants);
  const participantLabel =
    eventWithParticipants.participantLimit !== null
      ? `${eventWithParticipants.participantCount} / ${eventWithParticipants.participantLimit}`
      : String(eventWithParticipants.participantCount);
  const detailRows = [
    ["Organizer", eventWithParticipants.organizer],
    ["Date", formatFullEventDate(eventWithParticipants)],
    ["Start Time", formattedStartTime],
    ["End Time", formattedEndTime ?? "Not set"],
    ["Location", eventWithParticipants.location],
    ["Category", eventWithParticipants.category],
    ["Status", eventWithParticipants.status],
    [
      "Max Participants",
      eventWithParticipants.participantLimit !== null
        ? String(eventWithParticipants.participantLimit)
        : "No limit set",
    ],
    ["Current Participants", participantLabel],
    ["Event ID", String(eventWithParticipants.id)],
    ["Created", formatCreatedDate(eventWithParticipants)],
  ];

  if (eventWithParticipants.createdByUserId) {
    detailRows.push(["Created By", eventWithParticipants.createdByUserId]);
  }

  const session = await auth();
  const userId = session?.user?.id;
  const canManageThisEvent = canManageEvent(session?.user?.role, userId, eventWithParticipants);
  const canCancelThisEvent = session?.user?.role === ROLES.ADMIN && eventWithParticipants.status !== "Cancelled";
  const canJoinThisEvent = Boolean(userId) && canJoinEvents(session?.user?.role);
  const loginHref = userId ? undefined : getLoginHref(`/events/${eventWithParticipants.id}`);

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
          Back to Dashboard
        </Link>

        <EventFlash message={flashMessage} />

        <article className="event-detail-card">
          <div className="event-detail-hero">
            <div className="event-detail-image-wrapper">
              {eventWithParticipants.eventImagePath ? (
                <Image
                  src={eventWithParticipants.eventImagePath}
                  alt={`${eventWithParticipants.eventName} event banner`}
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 45vw, 520px"
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

            <header className="event-detail-header">
              <div className="event-detail-title-row">
                <h1>{eventWithParticipants.eventName}</h1>
                <span
                  className={`status-badge detail-badge ${statusStyles[eventWithParticipants.status as EventStatus]}`}
                >
                  {eventWithParticipants.status}
                </span>
              </div>

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
                    {formattedStartTime}
                    {formattedEndTime ? ` - ${formattedEndTime}` : ""}
                  </span>
                </div>
                <div className="meta-pill">
                  <MapPin size={13} aria-hidden="true" />
                  <span className="meta-pill-label">Place</span>
                  <span className="meta-pill-value">{eventWithParticipants.location}</span>
                </div>
                <div className="meta-pill">
                  <Users size={13} aria-hidden="true" />
                  <span className="meta-pill-label">Slots</span>
                  <span className="meta-pill-value">{participantLabel}</span>
                </div>
              </div>

              <dl className="event-detail-facts">
                {detailRows.map(([label, value]) => (
                  <div key={label} className="event-detail-fact">
                    <dt>{label}</dt>
                    <dd>{value}</dd>
                  </div>
                ))}
              </dl>
            </header>
          </div>

          <div className="event-detail-body">
            <section className="event-section event-description-section">
              <h2>Description</h2>
              <p>{eventWithParticipants.description || "No description provided."}</p>
            </section>
          </div>

          <footer className="event-detail-footer">
            <p>Added on {formatCreatedDate(eventWithParticipants)}</p>
            <div className="action-group">
              {(canJoinThisEvent || loginHref) && (
                <JoinEventButton
                  eventId={eventWithParticipants.id}
                  isJoined={isJoined}
                  isFull={isFull}
                  loginHref={loginHref}
                />
              )}
              {canManageThisEvent && (
                <>
                  {canCancelThisEvent ? (
                    <form action={cancelEvent.bind(null, eventWithParticipants.id)}>
                      <button type="submit" className="legacy-btn legacy-btn-secondary btn-sm">
                        Cancel
                      </button>
                    </form>
                  ) : null}
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
