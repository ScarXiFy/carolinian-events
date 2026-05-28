import Link from "next/link";
import { notFound } from "next/navigation";

import { CreateEventForm } from "../../create/create-event-form";
import { updateEventAction } from "./actions";
import { getEventByRouteId, getEventStaticParams } from "@/lib/event-store.mjs";

export function generateStaticParams() {
  return getEventStaticParams();
}

export default async function EditEventPage(props: PageProps<"/events/[id]/edit">) {
  const { id } = await props.params;
  const event = await getEventByRouteId(id);

  if (!event) {
    notFound();
  }

  const eventWithParticipants = event as typeof event & {
    participantLimit: number | null;
  };

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

      <section className="form-container relative z-10 mx-auto w-full max-w-[800px] px-[5%] pb-20 pt-[120px]">
        <div className="form-card rounded-3xl border border-[#222] bg-[#111] p-6 shadow-[0_20px_40px_rgba(0,0,0,0.4)] md:p-12">
          <h1 className="mb-8 text-[2rem] font-extrabold tracking-normal">
            Edit Event
          </h1>
          <CreateEventForm
            mode="edit"
            formAction={updateEventAction.bind(null, eventWithParticipants.id)}
            initialValues={{
              eventName: eventWithParticipants.eventName,
              organizer: eventWithParticipants.organizer,
              description: eventWithParticipants.description,
              eventDate: eventWithParticipants.eventDate,
              eventTime: eventWithParticipants.eventTime.slice(0, 5),
              eventEndTime: eventWithParticipants.eventEndTime?.slice(0, 5) ?? "",
              location: eventWithParticipants.location,
              category: eventWithParticipants.category,
              participantLimit: eventWithParticipants.participantLimit ?? undefined,
            }}
          />
        </div>
      </section>
    </main>
  );
}
