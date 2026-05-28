import Link from "next/link";

import { createEventAction } from "./actions";
import { CreateEventForm } from "./create-event-form";

export default function CreateEventPage() {
  return (
    <main className="legacy-home create-event-page min-h-screen bg-[#050505] text-white">
      <div className="particle-field" aria-hidden="true" />
      <div className="ambient-glow ambient-glow-green" aria-hidden="true" />
      <div className="ambient-glow ambient-glow-gold" aria-hidden="true" />

      <nav className="navbar" id="navbar">
        <div className="nav-container">
          <Link href="/" className="brand">
            Carolinian<span>Events</span>
          </Link>
          <div className="nav-links">
            <Link href="/">Home</Link>
            <Link href="/#features">Features</Link>
            <Link href="/events">Events Dashboard</Link>
          </div>
        </div>
      </nav>

      <section className="create-event-shell relative z-10 mx-auto w-full max-w-5xl px-4 pb-16 pt-28 sm:px-6 sm:pb-20 sm:pt-32 lg:px-8">
        <div className="create-event-card mx-auto w-full max-w-3xl rounded-3xl border border-[#222] bg-[#111]/95 p-6 shadow-[0_20px_40px_rgba(0,0,0,0.4)] sm:p-8 lg:p-10">
          <h1 className="mb-6 text-[2rem] font-extrabold tracking-normal sm:mb-8">
            Create New Event
          </h1>
          <CreateEventForm formAction={createEventAction} />
        </div>
      </section>
    </main>
  );
}
