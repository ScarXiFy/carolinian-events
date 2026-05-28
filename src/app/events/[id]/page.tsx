import Link from "next/link";
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
import { JoinEventButton } from "./join-button";

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
  };

  const formattedEndTime = eventWithParticipants.eventEndTime
    ? new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" }).format(
        new Date(`${eventWithParticipants.eventDate}T${eventWithParticipants.eventEndTime}`),
      )
    : null;

  const session = await auth();
  const isOrganizer = session?.user?.role === "Organizer";
  const userId = session?.user?.id;

  const isJoined = userId ? await isEventParticipant(event.id, userId) : false;

  const isFull =
    eventWithParticipants.participantLimit !== null &&
    eventWithParticipants.participantCount >= eventWithParticipants.participantLimit;

  return (
    <main className="legacy-home min-h-screen bg-[#050505] text-white">
      <div className="particle-field" aria-hidden="true" />
      <div className="ambient-glow ambient-glow-green" aria-hidden="true" />
      <div className="ambient-glow ambient-glow-gold" aria-hidden="true" />

      <nav className="fixed left-0 top-0 z-50 flex w-full justify-center px-[5%] py-4 backdrop-blur-xl">
        <div className="flex w-full max-w-[1200px] items-center justify-between">
          <Link href="/" className="text-[1.4rem] font-extrabold tracking-normal">
            Carolinian<span className="text-[#d4a843]">Events</span>
          </Link>
          <div className="flex items-center gap-8 text-sm font-bold">
            <Link href="/" className="transition hover:text-[#d4a843]">
              Home
            </Link>
            <Link href="/events" className="transition hover:text-[#d4a843]">
              Events Dashboard
            </Link>
          </div>
        </div>
      </nav>

      <section className="relative z-10 mx-auto w-full max-w-[1200px] px-[5%] pb-20 pt-[120px]">
        <Link href="/events" className="legacy-btn legacy-btn-secondary mb-8">
          ← Back to Dashboard
        </Link>

        <EventFlash message={flashMessage} />

        <article className="event-detail-card">
          <header className="event-detail-header">
            {/* #4 — inline flex row: title + badge (no more position:absolute) */}
            <div className="event-detail-title-row">
              <h1>{eventWithParticipants.eventName}</h1>
              <span
                className={`status-badge detail-badge ${statusStyles[eventWithParticipants.status as EventStatus]}`}
              >
                {eventWithParticipants.status}
              </span>
            </div>

            {/* #2 — icon meta pills */}
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

          {/* #3 — sidebar body layout: description (main) + organizer/category (sidebar) */}
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

          {/* #6 — footer elevation handled in CSS */}
          <footer className="event-detail-footer">
            <p>Added on {formatCreatedDate(eventWithParticipants)}</p>
            <div className="action-group">
              {userId && !isOrganizer && (
                <JoinEventButton eventId={eventWithParticipants.id} isJoined={isJoined} isFull={isFull} />
              )}
              {isOrganizer && (
                <>
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
  const { getEventParticipants } = await import("@/lib/mysql-users.mjs");
  const participants = await getEventParticipants(eventId);

  return participants.includes(userId);
}
