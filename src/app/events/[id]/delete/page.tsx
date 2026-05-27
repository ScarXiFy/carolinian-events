import Link from "next/link";
import { notFound } from "next/navigation";

import {
  formatEventDate,
  formatEventTime,
  getDeleteConfirmationMessage,
} from "@/lib/events.mjs";
import { getEventByRouteId, getEventStaticParams } from "@/lib/event-store.mjs";

export function generateStaticParams() {
  return getEventStaticParams();
}

export default async function DeleteEventPage(props: PageProps<"/events/[id]/delete">) {
  const { id } = await props.params;
  const event = await getEventByRouteId(id);

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

      <section className="relative z-10 flex min-h-screen items-center justify-center px-[5%] py-[120px]">
        <article className="w-full max-w-[440px] scale-100 rounded-3xl border border-[#222] bg-[#111] p-8 text-center shadow-[0_25px_60px_rgba(0,0,0,0.6)] md:p-12">
          <div
            className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full border border-[#fc8181]/30 bg-[#fc8181]/10 text-3xl font-extrabold text-[#fc8181]"
            aria-hidden="true"
          >
            !
          </div>
          <h1 className="mb-3 text-2xl font-extrabold tracking-normal">Delete Event?</h1>
          <p className="mb-6 text-base leading-7 text-[#a1a1aa]">
            {getDeleteConfirmationMessage(event)}
          </p>

          <div className="mb-8 rounded-2xl border border-[#222] bg-white/[0.03] p-4 text-left">
            <p className="font-bold text-white">{event.eventName}</p>
            <p className="mt-2 text-sm text-[#a1a1aa]">
              {formatEventDate(event)} at {formatEventTime(event)}
            </p>
            <p className="mt-1 text-sm text-[#a1a1aa]">{event.location}</p>
          </div>

          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link href={`/events/${event.id}`} className="legacy-btn legacy-btn-secondary">
              Cancel
            </Link>
            <Link href="/events?deleted=preview" className="legacy-btn btn-danger">
              Delete
            </Link>
          </div>
          <p className="mt-5 text-sm leading-6 text-[#a1a1aa]">
            Preview only. Database deletion will be added in the database phase.
          </p>
        </article>
      </section>
    </main>
  );
}
