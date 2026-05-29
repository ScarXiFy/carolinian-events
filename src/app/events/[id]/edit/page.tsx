import { notFound, redirect } from "next/navigation";

import { auth } from "@/auth";
import { SiteNavbarServer } from "@/components/site-navbar-server";
import { CreateEventForm } from "../../create/create-event-form";
import { updateEventAction } from "./actions";
import { getEventByRouteId, getEventStaticParams } from "@/lib/event-store.mjs";
import { EVENTS_PATH, LOGIN_PATH } from "@/lib/auth-navigation";
import { canManageEvent } from "@/lib/permissions.mjs";

export function generateStaticParams() {
  return getEventStaticParams();
}

export default async function EditEventPage(props: PageProps<"/events/[id]/edit">) {
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

  const eventWithParticipants = event as typeof event & {
    participantLimit: number | null;
    eventImagePath: string | null;
  };

  return (
    <main className="legacy-home min-h-screen bg-[#050505] text-white">
      <div className="particle-field" aria-hidden="true" />
      <div className="ambient-glow ambient-glow-green" aria-hidden="true" />
      <div className="ambient-glow ambient-glow-gold" aria-hidden="true" />

      <SiteNavbarServer showUserMenu />

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
              eventImagePath: eventWithParticipants.eventImagePath,
            }}
          />
        </div>
      </section>
    </main>
  );
}
