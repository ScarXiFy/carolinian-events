import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { SiteNavbarServer } from "@/components/site-navbar-server";
import { EVENTS_PATH, LOGIN_PATH } from "@/lib/auth-navigation";
import { canCreateEvents } from "@/lib/permissions.mjs";
import { createEventAction } from "./actions";
import { CreateEventForm } from "./create-event-form";

export default async function CreateEventPage() {
  const session = await auth();

  if (!session) {
    redirect(LOGIN_PATH);
  }

  if (!canCreateEvents(session.user?.role)) {
    redirect(EVENTS_PATH);
  }

  return (
    <main className="legacy-home create-event-page min-h-screen bg-[#050505] text-white">
      <div className="particle-field" aria-hidden="true" />
      <div className="ambient-glow ambient-glow-green" aria-hidden="true" />
      <div className="ambient-glow ambient-glow-gold" aria-hidden="true" />

      <SiteNavbarServer showUserMenu />

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
