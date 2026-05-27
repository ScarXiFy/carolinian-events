import Link from "next/link";
import { notFound } from "next/navigation";

import {
  formatCreatedDate,
  formatEventTime,
  formatFullEventDate,
  getEventById,
  sampleEvents,
} from "@/lib/events.mjs";

type EventStatus = "Upcoming" | "Ongoing" | "Completed" | "Cancelled";

const statusStyles = {
  Upcoming: "status-upcoming",
  Ongoing: "status-ongoing",
  Completed: "status-completed",
  Cancelled: "status-cancelled",
} satisfies Record<EventStatus, string>;

export function generateStaticParams() {
  return sampleEvents.map((event) => ({
    id: String(event.id),
  }));
}

export default async function EventDetailPage(props: PageProps<"/events/[id]">) {
  const { id } = await props.params;
  const event = getEventById(sampleEvents, id);

  if (!event) {
    notFound();
  }

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
          Back to Dashboard
        </Link>

        <article className="event-detail-card">
          <header className="event-detail-header">
            <h1>{event.eventName}</h1>
            <span
              className={`status-badge detail-badge ${statusStyles[event.status as EventStatus]}`}
            >
              {event.status}
            </span>

            <div className="event-meta">
              <div className="meta-item">
                <span aria-hidden="true">Date</span>
                {formatFullEventDate(event)}
              </div>
              <div className="meta-item">
                <span aria-hidden="true">Time</span>
                {formatEventTime(event)}
              </div>
              <div className="meta-item">
                <span aria-hidden="true">Place</span>
                {event.location}
              </div>
            </div>
          </header>

          <div className="event-detail-body">
            <section className="event-section">
              <h2>Description</h2>
              <p>{event.description || "No description provided."}</p>
            </section>

            <div className="event-detail-grid">
              <section className="event-section">
                <h2>Organizer</h2>
                <p>{event.organizer}</p>
              </section>
              <section className="event-section">
                <h2>Category</h2>
                <p>{event.category}</p>
              </section>
            </div>
          </div>

          <footer className="event-detail-footer">
            <p>Added on {formatCreatedDate(event)}</p>
            <div className="action-group">
              <Link href={`/events/${event.id}/edit`} className="legacy-btn legacy-btn-secondary btn-sm">
                Edit
              </Link>
              <Link href={`/events/${event.id}`} className="legacy-btn btn-danger">
                Delete
              </Link>
            </div>
          </footer>
        </article>
      </section>
    </main>
  );
}
