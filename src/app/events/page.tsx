import Link from "next/link";

import {
  EVENT_SORTS,
  formatEventDate,
  formatEventTime,
  getVisibleEvents,
} from "@/lib/events.mjs";
import { getAllEvents } from "@/lib/event-store.mjs";

type EventSort = "date_desc" | "date_asc" | "name_asc" | "name_desc";
type EventStatus = "Upcoming" | "Ongoing" | "Completed" | "Cancelled";

const sortLabels = {
  date_desc: "Newest First",
  date_asc: "Oldest First",
  name_asc: "Name A-Z",
  name_desc: "Name Z-A",
} satisfies Record<EventSort, string>;

const statusStyles = {
  Upcoming: "status-upcoming",
  Ongoing: "status-ongoing",
  Completed: "status-completed",
  Cancelled: "status-cancelled",
} satisfies Record<EventStatus, string>;

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; sort?: EventSort }>;
}) {
  const params = await searchParams;
  const search = params.search ?? "";
  const sort = Object.values(EVENT_SORTS).includes(params.sort ?? EVENT_SORTS.DATE_DESC)
    ? params.sort
    : EVENT_SORTS.DATE_DESC;
  const events = getVisibleEvents(await getAllEvents(), { search, sort });

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

      <section className="relative z-10 mx-auto w-full max-w-[1600px] px-[5%] pb-20 pt-[120px]">
        <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <h1 className="dashboard-title text-[2.5rem] font-extrabold leading-tight tracking-normal">
            Events Dashboard
          </h1>
          <Link href="/events/create" className="legacy-btn legacy-btn-primary">
            + Add New Event
          </Link>
        </div>

        <form className="dashboard-controls mb-8 flex flex-col gap-4 md:flex-row md:items-center">
          <div className="flex-1">
            <input
              type="search"
              name="search"
              defaultValue={search}
              placeholder="Search events..."
              className="dashboard-input w-full"
            />
          </div>
          <div>
            <select name="sort" defaultValue={sort} className="dashboard-select">
              {Object.entries(sortLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <button type="submit" className="legacy-btn legacy-btn-secondary">
            Apply
          </button>
        </form>

        <div className="dashboard-table-shell">
          <table className="events-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Event Name</th>
                <th>Date &amp; Time</th>
                <th>Location</th>
                <th>Category</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {events.length === 0 ? (
                <tr>
                  <td colSpan={7} className="empty-row">
                    No events found.
                  </td>
                </tr>
              ) : (
                events.map((event, index) => (
                  <tr key={event.id}>
                    <td data-label="#">{index + 1}</td>
                    <td data-label="Event Name" className="event-name-cell">
                      {event.eventName}
                    </td>
                    <td data-label="Date & Time">
                      {formatEventDate(event)}
                      <br />
                      <small className="time-muted">{formatEventTime(event)}</small>
                    </td>
                    <td data-label="Location">{event.location}</td>
                    <td data-label="Category">{event.category}</td>
                    <td data-label="Status">
                      <span
                        className={`status-badge ${statusStyles[event.status as EventStatus]}`}
                      >
                        {event.status}
                      </span>
                    </td>
                    <td data-label="Actions" className="action-links">
                      <Link href={`/events/${event.id}`} className="action-view">
                        View
                      </Link>
                      <Link href={`/events/${event.id}/edit`} className="action-edit">
                        Edit
                      </Link>
                      <Link href={`/events/${event.id}/delete`} className="action-delete">
                        Delete
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
