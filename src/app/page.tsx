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
import { LandingEffects } from "./landing-effects";

const featureCards = [
  {
    iconCodePoint: 10024,
    title: "Create & Customize",
    body: "Launch events with beautiful landing pages, rich descriptions, and custom ticketing options effortlessly.",
  },
  {
    iconCodePoint: 128101,
    title: "Manage Attendees",
    body: "Track RSVPs in real-time, scan digital tickets at the door, and communicate with guests easily.",
  },
  {
    iconCodePoint: 128202,
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
    <main className="legacy-home">
      <LandingEffects />
      <div className="ambient-glow glow-green" aria-hidden="true" />
      <div className="ambient-glow glow-gold" aria-hidden="true" />

      <nav className="navbar" id="navbar">
        <div className="nav-container">
          <Link href="/" className="brand">
            Carolinian<span>Events</span>
          </Link>
          <div className="nav-links">
            <Link href="/">Home</Link>
            <Link href="#features">Features</Link>
            <Link href="/events">Events Dashboard</Link>
          </div>
        </div>
      </nav>

      <header className="hero" id="parallax-container">
        <div className="hero-content parallax-wrapper" data-speed="0.02">
          <h1 className="title">
            <span className="title-line title-line-1">
              Everything happening at USC,
            </span>
            <span className="title-line title-line-2">in one place.</span>
          </h1>

          <p className="subtitle">
            As a Carolinian, quickly find, create, and manage events across campus.
          </p>

          <div className="cta-group">
            <Link href="/events/create" className="btn btn-glass-primary">
              Create Event
            </Link>
            <Link href="/events" className="btn btn-glass-secondary">
              Explore Events
            </Link>
          </div>
        </div>

        <div className="scroll-indicator" aria-hidden="true">
          <div className="mouse" />
        </div>

        <HeroOrbit events={orbitCards} />
      </header>

      <section className="features" id="features">
        <div className="section-header reveal">
          <h2>Seamless Management</h2>
          <p>Everything you need to run successful campus events</p>
        </div>

        <div className="marquee-container reveal">
          <div className="marquee-track">
            {[0, 1].map((group) => (
              <div className="marquee-content" key={group}>
                {[...featureCards, ...featureCards].map((feature, index) => (
                  <article
                    key={`${group}-${feature.title}-${index}`}
                    className="card"
                  >
                    <div className="icon" aria-hidden="true">
                      {String.fromCodePoint(feature.iconCodePoint)}
                    </div>
                    <h3>{feature.title}</h3>
                    <p>{feature.body}</p>
                  </article>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="stats">
        <div className="grid stats-grid">
          {[
            ["Total Events", stats.total],
            ["Upcoming", stats.upcoming],
            ["Ongoing", stats.ongoing],
            ["Completed", stats.completed],
          ].map(([label, value], index) => (
            <div key={label} className={`stat-item reveal stagger-${index + 1}`}>
              <h3 data-count-to={value}>{value}</h3>
              <p>{label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="cta">
        <div className="cta-box reveal">
          <h2>Ready to host your next big event?</h2>
          <p>Join hundreds of Carolinians managing their events seamlessly.</p>
          <Link href="/events/create" className="btn btn-primary">
            Get Started Now
          </Link>
        </div>
      </section>

      <footer>
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
