import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, Clock, Mail, MapPin, Phone, Tag, Users } from "lucide-react";

import {
  formatCreatedDate,
  formatEventTime,
  formatFullEventDate,
  getEventImagePaths,
  getEventJoinState,
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
import { EventImageCarousel } from "@/components/event-image-carousel";
import { EventParticipantProgress } from "@/components/event-participant-progress";
import { EventStatusBadge } from "@/components/event-status-badge";
import { FormSubmitButton } from "@/components/form-submit-button";

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
    eventImagePaths: string[];
    contactEmail: string;
    contactPhone: string;
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
  const joinState = getEventJoinState(eventWithParticipants);
  const imagePaths = getEventImagePaths(eventWithParticipants);
  const managerRows = canManageThisEvent
    ? [
        ["Event ID", String(eventWithParticipants.id)],
        ["Created", formatCreatedDate(eventWithParticipants)],
        ...(eventWithParticipants.createdByUserId
          ? [["Created By", eventWithParticipants.createdByUserId]]
          : []),
      ]
    : [];

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

        <article className="event-detail-card event-platform-detail">
          <EventImageCarousel
            images={imagePaths}
            title={eventWithParticipants.eventName}
            category={eventWithParticipants.category}
            status={eventWithParticipants.status}
            className="event-detail-banner"
            priority
          />

          <div className="event-platform-grid">
            <div className="event-platform-main">
              <header className="event-platform-header">
                <div className="event-detail-title-row">
                  <h1>{eventWithParticipants.eventName}</h1>
                  <EventStatusBadge status={eventWithParticipants.status} className="detail-badge" />
                </div>

                <div className="event-meta event-platform-meta">
                  <div className="meta-pill">
                    <CalendarDays size={16} aria-hidden="true" />
                    <span className="meta-pill-value">{formatFullEventDate(eventWithParticipants)}</span>
                  </div>
                  <div className="meta-pill">
                    <Clock size={16} aria-hidden="true" />
                    <span className="meta-pill-value">
                      {formattedStartTime}
                      {formattedEndTime ? ` - ${formattedEndTime}` : ""}
                    </span>
                  </div>
                  <div className="meta-pill">
                    <MapPin size={16} aria-hidden="true" />
                    <span className="meta-pill-value">{eventWithParticipants.location}</span>
                  </div>
                  <div className="meta-pill">
                    <Users size={16} aria-hidden="true" />
                    <span className="meta-pill-value">{participantLabel} slots</span>
                  </div>
                </div>
              </header>

              <section className="event-section event-description-section">
                <h2>About This Event</h2>
                <p>{eventWithParticipants.description || "No description provided."}</p>
              </section>

              {managerRows.length > 0 ? (
                <section className="event-section event-manager-section">
                  <h2>Manager Details</h2>
                  <dl className="event-detail-facts">
                    {managerRows.map(([label, value]) => (
                      <div key={label} className="event-detail-fact">
                        <dt>{label}</dt>
                        <dd>{value}</dd>
                      </div>
                    ))}
                  </dl>
                </section>
              ) : null}
            </div>

            <aside className="event-platform-sidebar">
              <div className="event-cta-panel">
                {(canJoinThisEvent || loginHref) && (
                  <JoinEventButton
                    eventId={eventWithParticipants.id}
                    isJoined={isJoined}
                    isFull={isFull}
                    status={eventWithParticipants.status}
                    joinLabel={joinState.label}
                    loginHref={loginHref}
                  />
                )}
                <EventParticipantProgress
                  participantCount={eventWithParticipants.participantCount}
                  participantLimit={eventWithParticipants.participantLimit}
                />
              </div>

              <section className="event-side-card">
                <h2>Quick Information</h2>
                <ul className="event-side-list">
                  <li><CalendarDays size={16} aria-hidden="true" />{formatFullEventDate(eventWithParticipants)}</li>
                  <li><Clock size={16} aria-hidden="true" />{formattedStartTime}{formattedEndTime ? ` - ${formattedEndTime}` : ""}</li>
                  <li><MapPin size={16} aria-hidden="true" />{eventWithParticipants.location}</li>
                  <li><Tag size={16} aria-hidden="true" />{eventWithParticipants.category}</li>
                </ul>
              </section>

              <section className="event-side-card">
                <h2>Organizer</h2>
                <p className="event-organizer-name">{eventWithParticipants.organizer}</p>
                <ul className="event-side-list">
                  <li><Mail size={16} aria-hidden="true" />{eventWithParticipants.contactEmail || "No email provided"}</li>
                  <li><Phone size={16} aria-hidden="true" />{eventWithParticipants.contactPhone || "No cellphone provided"}</li>
                </ul>
              </section>
            </aside>
          </div>

          <footer className="event-detail-footer">
            <p>{eventWithParticipants.status === "Cancelled" ? "This event is cancelled." : "Manage this event or update your registration."}</p>
            <div className="action-group">
              {canManageThisEvent && (
                <>
                  {canCancelThisEvent ? (
                    <form action={cancelEvent.bind(null, eventWithParticipants.id)}>
                      <FormSubmitButton
                        label="Cancel Event"
                        pendingLabel="Cancelling..."
                        className="legacy-btn legacy-btn-secondary btn-sm"
                      />
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
