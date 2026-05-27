import Link from "next/link";

import {
  formatEventDate,
  formatEventTime,
  getEventStats,
  getFeaturedEvents,
  sampleEvents,
} from "@/lib/events.mjs";
import { getAllEvents } from "@/lib/event-store.mjs";
import { HeroOrbit } from "./hero-orbit";

const featureCards = [
  {
    icon: "01",
    title: "Create & Customize",
    body: "Launch events with beautiful landing pages, rich descriptions, and custom ticketing options effortlessly.",
  },
  {
    icon: "02",
    title: "Manage Attendees",
    body: "Track RSVPs in real-time, scan digital tickets at the door, and communicate with guests easily.",
  },
  {
    icon: "03",
    title: "Live Analytics",
    body: "Get powerful insights into attendance, engagement, and post-event feedback automatically.",
  },
];

export default async function Home() {
  const events = await getAllEvents();
  const stats = getEventStats(events);
  const featuredEvents = getFeaturedEvents(events.length ? events : sampleEvents, 5);
  const orbitCards = featuredEvents.map((event, index) => ({
    id: event.id,
    dateTime: `${formatEventDate(event)} at ${formatEventTime(event)}`,
    eventName: event.eventName,
    status: event.status,
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

        <HeroOrbit events={orbitCards} />

        <div className="scroll-indicator" aria-hidden="true">
          <div className="mouse" />
        </div>
      </section>

      <section id="features" className="legacy-features relative z-10 bg-[#0a0a0a] py-32">
        <div className="section-header mx-auto max-w-[1200px] px-[5%] text-center">
          <h2 className="text-4xl font-extrabold tracking-normal">
            Seamless Management
          </h2>
          <p className="mt-3 text-[#a1a1aa]">
            Everything you need to run successful campus events
          </p>
        </div>

        <div className="marquee-container mt-12">
          <div className="marquee-track">
            {[0, 1].map((group) => (
              <div className="marquee-content" key={group}>
                {[...featureCards, ...featureCards].map((feature, index) => (
                  <article
                    key={`${group}-${feature.title}-${index}`}
                    className="legacy-feature-card"
                  >
                    <div className="feature-icon">{feature.icon}</div>
                    <h3>{feature.title}</h3>
                    <p>{feature.body}</p>
                  </article>
                ))}
              </div>
            ))}
          </div>
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

function getGlowClass(status: string, index: number) {
  if (status === "Completed") {
    return "orbit-glow-red";
  }

  if (status === "Ongoing") {
    return "orbit-glow-green";
  }

  return index % 2 === 0 ? "orbit-glow-blue" : "orbit-glow-green";
}
