import Link from "next/link";
import { notFound } from "next/navigation";

import { CreateEventForm } from "../../create/create-event-form";
import { getEventById, sampleEvents } from "@/lib/events.mjs";

export function generateStaticParams() {
  return sampleEvents.map((event) => ({
    id: String(event.id),
  }));
}

export default async function EditEventPage(props: PageProps<"/events/[id]/edit">) {
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

      <section className="form-container relative z-10">
        <div className="form-card">
          <h1>Edit Event</h1>
          <CreateEventForm
            mode="edit"
            initialValues={{
              eventName: event.eventName,
              organizer: event.organizer,
              description: event.description,
              eventDate: event.eventDate,
              eventTime: event.eventTime.slice(0, 5),
              location: event.location,
              category: event.category,
            }}
          />
        </div>
      </section>
    </main>
  );
}
