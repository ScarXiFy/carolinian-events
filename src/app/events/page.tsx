import Link from "next/link";

import {
  EVENT_SORTS,
  formatEventDate,
  formatEventTime,
  getVisibleEvents,
  sampleEvents,
} from "@/lib/events.mjs";

type EventSort = "date_desc" | "date_asc" | "name_asc" | "name_desc";
type EventStatus = "Upcoming" | "Ongoing" | "Completed" | "Cancelled";

const sortLabels = {
  date_desc: "Newest First",
  date_asc: "Oldest First",
  name_asc: "Name A-Z",
  name_desc: "Name Z-A",
} satisfies Record<EventSort, string>;

const statusStyles = {
  Upcoming: "bg-emerald-100 text-emerald-800",
  Ongoing: "bg-amber-100 text-amber-800",
  Completed: "bg-zinc-200 text-zinc-700",
  Cancelled: "bg-rose-100 text-rose-800",
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
  const events = getVisibleEvents(sampleEvents, { search, sort });

  return (
    <main className="min-h-screen bg-[#f8fbf7] text-[#172113]">
      <header className="border-b border-[#dfe7dc] bg-white">
        <nav className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5">
          <Link href="/" className="text-lg font-extrabold tracking-tight">
            Carolinian<span className="text-[#b88a00]">Events</span>
          </Link>
          <Link
            href="/"
            className="rounded-md border border-[#dfe7dc] px-4 py-2 text-sm font-bold transition hover:bg-[#f4f7f1]"
          >
            Home
          </Link>
        </nav>
      </header>

      <section className="mx-auto w-full max-w-6xl px-6 py-10">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#b88a00]">
              Public dashboard
            </p>
            <h1 className="mt-3 text-4xl font-black tracking-normal sm:text-5xl">
              Events Dashboard
            </h1>
            <p className="mt-3 max-w-2xl leading-7 text-[#52624d]">
              Browse the migrated event list with the same search and sorting
              behavior as the PHP dashboard.
            </p>
          </div>
          <button
            type="button"
            disabled
            className="min-h-11 rounded-md bg-[#204b22] px-5 text-sm font-extrabold text-white opacity-55"
            title="Organizer creation comes in a later migration phase"
          >
            Add New Event
          </button>
        </div>

        <form className="mt-8 grid gap-3 rounded-lg border border-[#dfe7dc] bg-white p-4 md:grid-cols-[1fr_220px_auto]">
          <input
            type="search"
            name="search"
            defaultValue={search}
            placeholder="Search events..."
            className="min-h-11 rounded-md border border-[#cfd9cb] px-4 text-sm outline-none transition focus:border-[#204b22] focus:ring-2 focus:ring-[#204b22]/12"
          />
          <select
            name="sort"
            defaultValue={sort}
            className="min-h-11 rounded-md border border-[#cfd9cb] px-4 text-sm font-semibold outline-none transition focus:border-[#204b22] focus:ring-2 focus:ring-[#204b22]/12"
          >
            {Object.entries(sortLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="min-h-11 rounded-md bg-[#f4c542] px-5 text-sm font-extrabold text-[#172113] transition hover:bg-[#ffd866]"
          >
            Apply
          </button>
        </form>

        <div className="mt-6 overflow-hidden rounded-lg border border-[#dfe7dc] bg-white">
          <div className="hidden grid-cols-[56px_1.2fr_1fr_1fr_0.75fr_0.75fr] gap-4 border-b border-[#dfe7dc] bg-[#edf3e9] px-5 py-4 text-sm font-extrabold text-[#52624d] lg:grid">
            <span>#</span>
            <span>Event Name</span>
            <span>Date and Time</span>
            <span>Location</span>
            <span>Category</span>
            <span>Status</span>
          </div>
          {events.length === 0 ? (
            <p className="px-5 py-12 text-center font-semibold text-[#52624d]">
              No events found.
            </p>
          ) : (
            <div className="divide-y divide-[#dfe7dc]">
              {events.map((event, index) => (
                <article
                  key={event.id}
                  className="grid gap-3 px-5 py-5 lg:grid-cols-[56px_1.2fr_1fr_1fr_0.75fr_0.75fr] lg:items-center"
                >
                  <span className="hidden font-mono text-sm text-[#52624d] lg:block">
                    {index + 1}
                  </span>
                  <div>
                    <h2 className="font-extrabold text-[#172113]">{event.eventName}</h2>
                    <p className="mt-1 text-sm text-[#52624d]">{event.organizer}</p>
                  </div>
                  <p className="text-sm leading-6 text-[#52624d]">
                    <span className="font-bold text-[#172113]">{formatEventDate(event)}</span>
                    <br />
                    {formatEventTime(event)}
                  </p>
                  <p className="text-sm font-semibold text-[#52624d]">{event.location}</p>
                  <p className="text-sm font-semibold text-[#52624d]">{event.category}</p>
                  <span
                    className={`w-fit rounded-full px-3 py-1 text-xs font-extrabold ${statusStyles[event.status as EventStatus]}`}
                  >
                    {event.status}
                  </span>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
