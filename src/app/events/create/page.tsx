import Link from "next/link";

import { createEventAction } from "./actions";
import { CreateEventForm } from "./create-event-form";

export default function CreateEventPage() {
  return (
    <main className="legacy-home min-h-screen bg-[#050505] text-white">
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

      <section className="form-container relative z-10 mx-auto w-full !max-w-[900px] px-[5%] pb-20 pt-[120px]">
        <div className="form-card rounded-3xl border border-[#222] bg-[#111] !p-8 shadow-[0_20px_40px_rgba(0,0,0,0.4)] md:!p-14">
          <h1 className="mb-8 text-[2rem] font-extrabold tracking-normal">
            Create New Event
          </h1>
          <CreateEventForm formAction={createEventAction} />
        </div>
      </section>
    </main>
  );
}
