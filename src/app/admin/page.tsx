import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { SiteNavbarServer } from "@/components/site-navbar-server";
import { EVENTS_PATH, LOGIN_PATH } from "@/lib/auth-navigation";
import { listPendingOrganizerRequests } from "@/lib/db-users.mjs";
import { listPendingEvents } from "@/lib/event-store.mjs";
import { canApproveOrganizers } from "@/lib/permissions.mjs";

import {
  approveEventAction,
  approveOrganizerRequestAction,
  rejectEventAction,
  rejectOrganizerRequestAction,
} from "./actions";

type OrganizerRequest = {
  id: number;
  name?: string | null;
  email?: string | null;
  status: string;
};

type PendingEvent = {
  id: number;
  eventName: string;
  organizer: string;
  approvalStatus?: string;
};

export default async function AdminPage() {
  const session = await auth();

  if (!session) {
    redirect(LOGIN_PATH);
  }

  if (!canApproveOrganizers(session.user?.role)) {
    redirect(EVENTS_PATH);
  }

  const requests = (await listPendingOrganizerRequests()) as OrganizerRequest[];
  const pendingEvents = (await listPendingEvents()) as PendingEvent[];

  return (
    <main className="legacy-home min-h-screen bg-[#050505] text-white">
      <div className="particle-field" aria-hidden="true" />
      <div className="ambient-glow ambient-glow-green" aria-hidden="true" />
      <div className="ambient-glow ambient-glow-gold" aria-hidden="true" />

      <SiteNavbarServer showUserMenu />

      <section className="relative z-10 mx-auto w-full max-w-[960px] px-[5%] pb-20 pt-[120px]">
        <div className="events-dashboard-heading">
          <h1>Organizer Requests</h1>
        </div>

        <div className="grid gap-4">
          {requests.length === 0 ? (
            <div className="events-empty-card">
              <h2>No pending requests</h2>
              <p>Organizer requests will appear here when students submit them.</p>
            </div>
          ) : (
            requests.map((request) => (
              <article className="event-dashboard-card" key={request.id}>
                <div className="event-card-topline">
                  <h2>{request.name || "Unnamed student"}</h2>
                  <div className="event-card-date">
                    <span>{request.email}</span>
                    <time>{request.status}</time>
                  </div>
                </div>

                <div className="event-card-footer">
                  <span className="status-badge status-upcoming">Pending</span>
                  <div className="event-card-actions">
                    <form action={approveOrganizerRequestAction.bind(null, request.id)}>
                      <button type="submit" className="event-view-button">
                        Approve
                      </button>
                    </form>
                    <form action={rejectOrganizerRequestAction.bind(null, request.id)}>
                      <button type="submit" className="legacy-btn btn-danger">
                        Reject
                      </button>
                    </form>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>

        <div className="events-dashboard-heading mt-12">
          <h1>Event Approvals</h1>
        </div>

        <div className="grid gap-4">
          {pendingEvents.length === 0 ? (
            <div className="events-empty-card">
              <h2>No pending events</h2>
              <p>Event submissions will appear here when organizers create them.</p>
            </div>
          ) : (
            pendingEvents.map((event) => (
              <article className="event-dashboard-card" key={event.id}>
                <div className="event-card-topline">
                  <h2>{event.eventName}</h2>
                  <div className="event-card-date">
                    <span>{event.organizer}</span>
                    <time>{event.approvalStatus}</time>
                  </div>
                </div>

                <div className="event-card-footer">
                  <span className="status-badge status-upcoming">Pending</span>
                  <div className="event-card-actions">
                    <form action={approveEventAction.bind(null, event.id)}>
                      <button type="submit" className="event-view-button">
                        Approve
                      </button>
                    </form>
                    <form action={rejectEventAction.bind(null, event.id)}>
                      <button type="submit" className="legacy-btn btn-danger">
                        Reject
                      </button>
                    </form>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      </section>
    </main>
  );
}
