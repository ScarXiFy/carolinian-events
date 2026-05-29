import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { SiteNavbar } from "@/components/site-navbar";
import { EVENTS_PATH, LOGIN_PATH } from "@/lib/auth-navigation";
import { listPendingOrganizerRequests } from "@/lib/db-users.mjs";
import { canApproveOrganizers } from "@/lib/permissions.mjs";

import {
  approveOrganizerRequestAction,
  rejectOrganizerRequestAction,
} from "./actions";

type OrganizerRequest = {
  id: number;
  name?: string | null;
  email?: string | null;
  status: string;
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

  return (
    <main className="legacy-home min-h-screen bg-[#050505] text-white">
      <div className="particle-field" aria-hidden="true" />
      <div className="ambient-glow ambient-glow-green" aria-hidden="true" />
      <div className="ambient-glow ambient-glow-gold" aria-hidden="true" />

      <SiteNavbar showUserMenu />

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
      </section>
    </main>
  );
}
