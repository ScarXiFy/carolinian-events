import Link from "next/link";

import {
  formatEventDate,
  formatEventTime,
  getEventStats,
  getFeaturedEvents,
} from "@/lib/events.mjs";
import { getAllEvents } from "@/lib/event-store.mjs";

export default async function Home() {
  const events = await getAllEvents();
  const stats = getEventStats(events);
  const featuredEvents = getFeaturedEvents(events, 5);
  const orbitCards = featuredEvents.map((event, index) => ({
    event,
    style: getOrbitStyle(index, featuredEvents.length),
    glowClass: getGlowClass(event.status, index),
  }));

  return (
    <main className="legacy-home min-h-screen overflow-x-hidden bg-[#050505] text-white">
      <div className="particle-field" aria-hidden="true" />
      <div className="ambient-glow ambient-glow-green" aria-hidden="true" />
      <div className="ambient-glow ambient-glow-gold" aria-hidden="true" />

      <nav className="fixed left-0 top-0 z-50 flex w-full justify-center px-[5%] py-6 transition">
        <div className="flex w-full max-w-[1200px] items-center justify-between">
          <Link href="/" className="text-[1.4rem] font-extrabold tracking-normal">
            Carolinian<span className="text-[#d4a843]">Events</span>
          </Link>
          <div className="hidden items-center gap-9 text-sm font-bold text-white md:flex">
            <Link href="/" className="transition hover:text-[#d4a843]">
              Home
            </Link>
            <Link href="#features" className="transition hover:text-[#d4a843]">
              Features
            </Link>
            <Link href="/events" className="transition hover:text-[#d4a843]">
              Events Dashboard
            </Link>
          </div>
        </div>
      </nav>

      <section className="relative z-10 flex min-h-screen items-center px-[5%] [perspective:1000px]">
        <div className="legacy-hero-content relative z-20 mt-[-5vh] w-full max-w-[800px]">
          <h1 className="legacy-title relative mb-8 text-[3.5rem] leading-[1.05] tracking-normal sm:text-[5rem] lg:text-[7rem]">
            <span className="block font-light text-white">
              Everything happening at USC,
            </span>
            <span className="legacy-title-accent block pl-[10%] font-extrabold">
              in one place.
            </span>
          </h1>

          <p className="max-w-[520px] pl-[10%] text-[1.15rem] leading-[1.6] text-[#a1a1aa]">
            As a Carolinian, quickly find, create, and manage events across campus.
          </p>

          <div className="mt-12 flex flex-col items-start gap-6 pl-[10%] sm:flex-row">
            <Link href="/events/create" className="legacy-btn legacy-btn-primary">
              Create Event
            </Link>
            <Link href="/events" className="legacy-btn legacy-btn-secondary">
              Explore Events
            </Link>
          </div>
        </div>

        <div className="orbit-focal-point" aria-label="Featured event orbit">
          <div className="orbit-rings" aria-hidden="true">
            <div className="orbit-ring orbit-ring-green" />
            <div className="orbit-ring orbit-ring-red" />
            <div className="orbit-ring orbit-ring-blue" />
          </div>
          <div className="orbit-core" aria-hidden="true" />
          {orbitCards.map(({ event, style, glowClass }) => (
            <article
              key={event.id}
              className={`orbit-card ${glowClass}`}
              style={style}
            >
              <div className="timeline-connector" aria-hidden="true" />
              <p className="orbit-card-datetime">
                {formatEventDate(event)} at {formatEventTime(event)}
              </p>
              <h2 className="orbit-card-title">{event.eventName}</h2>
              <div className="flex items-center gap-3">
                <span className="status-dot" aria-hidden="true" />
                <span className="text-xs font-semibold text-[#a1a1aa]">
                  {event.status}
                </span>
              </div>
            </article>
          ))}
        </div>

        <div className="scroll-indicator" aria-hidden="true">
          <div className="mouse" />
        </div>
      </section>

      <section id="features" className="relative z-10 bg-[#0a0a0a] px-[5%] py-24">
        <div className="mx-auto max-w-[1200px] text-center">
          <h2 className="text-4xl font-extrabold tracking-normal">
            Seamless Management
          </h2>
          <p className="mt-3 text-[#a1a1aa]">
            Everything you need to run successful campus events
          </p>
        </div>

        <div className="mx-auto mt-12 grid max-w-[1200px] gap-6 md:grid-cols-3">
          {[
            [
              "Create and Customize",
              "Launch campus events with clear descriptions, dates, organizers, and category details.",
            ],
            [
              "Manage Attendees",
              "Track status and prepare the system for future student registration flows.",
            ],
            [
              "Live Analytics",
              "Keep the total, upcoming, ongoing, and completed event counts visible.",
            ],
          ].map(([title, body]) => (
            <article
              key={title}
              className="rounded-2xl border border-white/10 bg-[#111] p-8 shadow-[0_20px_40px_rgba(0,0,0,0.25)]"
            >
              <h3 className="text-xl font-bold">{title}</h3>
              <p className="mt-4 leading-7 text-[#a1a1aa]">{body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="relative z-10 bg-[#050505] px-[5%] py-20">
        <div className="mx-auto grid max-w-[1200px] gap-8 md:grid-cols-4">
          {[
            ["Total Events", stats.total],
            ["Upcoming", stats.upcoming],
            ["Ongoing", stats.ongoing],
            ["Completed", stats.completed],
          ].map(([label, value]) => (
            <div key={label} className="text-center">
              <p className="text-5xl font-extrabold text-[#d4a843]">{value}</p>
              <p className="mt-3 text-sm font-semibold uppercase tracking-normal text-[#a1a1aa]">
                {label}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="relative z-10 bg-[#0a0a0a] px-[5%] py-24">
        <div className="mx-auto max-w-[900px] rounded-3xl border border-white/10 bg-[#111] p-10 text-center shadow-[0_30px_80px_rgba(0,0,0,0.35)]">
          <h2 className="text-4xl font-extrabold tracking-normal">
            Ready to host your next big event?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-[#a1a1aa]">
            Join hundreds of Carolinians managing their events seamlessly.
          </p>
          <Link href="/events/create" className="legacy-btn legacy-btn-primary mt-8">
            Get Started Now
          </Link>
        </div>
      </section>

      <footer className="relative z-10 border-t border-white/5 bg-[#050505] px-[5%] py-8 text-center text-sm text-[#a1a1aa]">
        <p>&copy; 2026 Carolinian Events Management System. All rights reserved.</p>
      </footer>
    </main>
  );
}

function getOrbitStyle(index: number, total: number) {
  const ringX = [260, 320, 220, 280, 350][index % 5];
  const ringY = [86, 112, 74, 96, 126][index % 5];
  const angle = -55 + index * (360 / Math.max(total, 1));
  const x = Math.cos((angle * Math.PI) / 180) * ringX;
  const y = Math.sin((angle * Math.PI) / 180) * ringY;
  const depth = Math.sin((angle * Math.PI) / 180);
  const scale = 0.88 + (depth + 1) * 0.12;

  return {
    transform: `translate(${x}px, ${y}px) scale(${scale})`,
    zIndex: Math.round((depth + 1) * 10),
    opacity: 0.7 + (depth + 1) * 0.15,
  };
}

function getGlowClass(status: string, index: number) {
  if (status === "Completed") {
    return "orbit-glow-red";
  }

  if (status === "Ongoing") {
    return "orbit-glow-green";
  }

  return index % 2 === 0 ? "orbit-glow-blue" : "orbit-glow-green";
}
