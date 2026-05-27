import Image from "next/image";
import Link from "next/link";

import {
  formatEventDate,
  formatEventTime,
  getEventStats,
  getFeaturedEvents,
  sampleEvents,
} from "@/lib/events.mjs";

export default function Home() {
  const stats = getEventStats(sampleEvents);
  const featuredEvents = getFeaturedEvents(sampleEvents, 3);

  return (
    <main className="min-h-screen bg-[#f8fbf7] text-[#172113]">
      <section className="relative isolate overflow-hidden bg-[#102414] text-white">
        <Image
          src="/hero-image.png"
          alt="USC campus event crowd"
          fill
          priority
          className="object-cover opacity-24"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#0d1f12] via-[#15381d]/92 to-[#705100]/72" />
        <nav className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
          <Link href="/" className="text-lg font-extrabold tracking-tight">
            Carolinian<span className="text-[#f4c542]">Events</span>
          </Link>
          <div className="flex items-center gap-4 text-sm font-semibold">
            <Link href="/events" className="text-white/82 transition hover:text-white">
              Events
            </Link>
            <Link
              href="/events"
              className="rounded-md bg-[#f4c542] px-4 py-2 text-[#172113] transition hover:bg-[#ffd866]"
            >
              Explore
            </Link>
          </div>
        </nav>
        <div className="relative z-10 mx-auto grid min-h-[calc(100vh-88px)] w-full max-w-6xl items-center gap-12 px-6 pb-16 pt-10 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="max-w-3xl">
            <p className="mb-4 text-sm font-bold uppercase tracking-[0.22em] text-[#f4c542]">
              University of San Carlos
            </p>
            <h1 className="text-5xl font-black leading-[1.02] tracking-normal sm:text-6xl lg:text-7xl">
              Everything happening at USC, in one place.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/82">
              Find campus activities, track event status, and manage Carolinian
              events from one clean dashboard.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/events"
                className="inline-flex min-h-12 items-center justify-center rounded-md bg-[#f4c542] px-6 text-sm font-extrabold text-[#172113] transition hover:bg-[#ffd866]"
              >
                Explore Events
              </Link>
              <Link
                href="/events"
                className="inline-flex min-h-12 items-center justify-center rounded-md border border-white/28 px-6 text-sm font-extrabold text-white transition hover:bg-white/10"
              >
                View Dashboard
              </Link>
            </div>
          </div>
          <div className="grid gap-4">
            {featuredEvents.map((event) => (
              <article
                key={event.id}
                className="rounded-lg border border-white/14 bg-white/12 p-5 shadow-2xl backdrop-blur"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-bold text-[#f4c542]">{event.category}</p>
                    <h2 className="mt-2 text-xl font-extrabold">{event.eventName}</h2>
                  </div>
                  <span className="rounded-full bg-white/14 px-3 py-1 text-xs font-bold">
                    {event.status}
                  </span>
                </div>
                <p className="mt-4 text-sm leading-6 text-white/76">
                  {formatEventDate(event)} at {formatEventTime(event)} · {event.location}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-6xl gap-4 px-6 py-12 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["Total Events", stats.total],
          ["Upcoming", stats.upcoming],
          ["Ongoing", stats.ongoing],
          ["Completed", stats.completed],
        ].map(([label, value]) => (
          <div key={label} className="rounded-lg border border-[#dfe7dc] bg-white p-6">
            <p className="text-sm font-bold text-[#52624d]">{label}</p>
            <p className="mt-3 text-4xl font-black text-[#204b22]">{value}</p>
          </div>
        ))}
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 pb-16">
        <div className="grid gap-6 lg:grid-cols-3">
          {[
            ["Create and Customize", "Launch campus events with clear dates, locations, categories, and organizers."],
            ["Search and Sort", "Find events by name or location and sort the dashboard like the legacy app."],
            ["Track Status", "See upcoming, ongoing, completed, and cancelled events at a glance."],
          ].map(([title, body]) => (
            <article key={title} className="rounded-lg border border-[#dfe7dc] bg-white p-6">
              <h2 className="text-xl font-extrabold text-[#172113]">{title}</h2>
              <p className="mt-3 leading-7 text-[#52624d]">{body}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
