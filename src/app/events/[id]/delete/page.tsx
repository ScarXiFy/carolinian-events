import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { auth } from "@/auth";
import { SiteNavbarServer } from "@/components/site-navbar-server";
import {
  formatEventDate,
  formatEventTime,
  getDeleteConfirmationMessage,
} from "@/lib/events.mjs";
import { getEventByRouteId, getEventStaticParams } from "@/lib/event-store.mjs";
import { EVENTS_PATH, LOGIN_PATH } from "@/lib/auth-navigation";
import { canManageEvent } from "@/lib/permissions.mjs";
import { deleteEventAction } from "./actions";
import { FormSubmitButton } from "@/components/form-submit-button";

export function generateStaticParams() {
  return getEventStaticParams();
}

export default async function DeleteEventPage(props: PageProps<"/events/[id]/delete">) {
  const { id } = await props.params;
  const event = await getEventByRouteId(id);

  if (!event) {
    notFound();
  }

  const session = await auth();

  if (!session) {
    redirect(LOGIN_PATH);
  }

  if (!canManageEvent(session.user?.role, session.user.id, event)) {
    redirect(EVENTS_PATH);
  }

  return (
    <main className="legacy-home min-h-screen bg-[#050505] text-white">
      <div className="particle-field" aria-hidden="true" />
      <div className="ambient-glow ambient-glow-green" aria-hidden="true" />
      <div className="ambient-glow ambient-glow-gold" aria-hidden="true" />

      <SiteNavbarServer showUserMenu />

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
            <form action={deleteEventAction.bind(null, event.id)}>
              <FormSubmitButton
                label="Delete Event"
                pendingLabel="Deleting..."
                className="legacy-btn btn-danger"
              />
            </form>
          </div>
          <p className="mt-5 text-sm leading-6 text-[#a1a1aa]">
            Deletes from the database when a MySQL connection is configured.
          </p>
        </article>
      </section>
    </main>
  );
}
