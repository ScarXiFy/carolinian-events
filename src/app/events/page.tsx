import Link from "next/link";
import {
  ExternalLink,
  MapPin,
  Plus,
  Search,
} from "lucide-react";

import {
  EVENT_SORTS,
  formatEventDate,
  formatEventTime,
  getEventImagePaths,
  getVisibleEvents,
} from "@/lib/events.mjs";
import { getAllEvents } from "@/lib/event-store.mjs";
import { getEventFlashMessage } from "@/lib/flash-message.mjs";
import { auth } from "@/auth";
import { SiteNavbarServer } from "@/components/site-navbar-server";
import { getCreateEventHref } from "@/lib/auth-navigation";
import { canCreateEvents } from "@/lib/permissions.mjs";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { EventFlash } from "./event-flash";
import { SortSelect } from "@/components/sort-select";
import { EventImageCarousel } from "@/components/event-image-carousel";
import { EventStatusBadge } from "@/components/event-status-badge";

type EventSort = "date_desc" | "date_asc" | "name_asc" | "name_desc";
type DashboardEvent = {
  id: number;
  eventName: string;
  organizer: string;
  description: string;
  eventDate: string;
  eventTime: string;
  eventEndTime?: string;
  location: string;
  category: string;
  status: string;
  createdAt: string;
  eventImagePath?: string | null;
  eventImagePaths?: string[];
  approvalStatus?: string;
};

const EVENTS_PER_PAGE = 6;

const sortLabels = {
  date_desc: "Newest First",
  date_asc: "Oldest First",
  name_asc: "Name A-Z",
  name_desc: "Name Z-A",
} satisfies Record<EventSort, string>;

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<{
    search?: string;
    sort?: EventSort;
    page?: string;
    created?: string;
    deleted?: string;
  }>;
}) {
  const params = await searchParams;
  const search = params.search ?? "";
  const requestedSort = params.sort ?? EVENT_SORTS.DATE_DESC;
  const sort = isEventSort(requestedSort)
    ? requestedSort
    : (EVENT_SORTS.DATE_DESC as EventSort);
  const session = await auth();
  const events = getVisibleEvents(await getAllEvents(), {
    search,
    sort,
    viewer: session?.user
      ? { role: session.user.role, userId: session.user.id }
      : null,
  }) as DashboardEvent[];
  const pageCount = Math.max(1, Math.ceil(events.length / EVENTS_PER_PAGE));
  const currentPage = clampPage(params.page, pageCount);
  const pageStart = (currentPage - 1) * EVENTS_PER_PAGE;
  const pageEvents = events.slice(pageStart, pageStart + EVENTS_PER_PAGE);
  const flashMessage = getEventFlashMessage(params);
  const createEventHref = getCreateEventHref(session);
  const showCreateEventLink = !session || canCreateEvents(session.user?.role);

  return (
    <main className="legacy-home events-dashboard-page min-h-screen bg-[#050505] text-white">
      <div className="particle-field" aria-hidden="true" />
      <div className="ambient-glow ambient-glow-green" aria-hidden="true" />
      <div className="ambient-glow ambient-glow-gold" aria-hidden="true" />

      <SiteNavbarServer showUserMenu />

      <section className="events-dashboard-shell">
        <div className="events-dashboard-heading">
          <h1>Events Dashboard</h1>
          {showCreateEventLink ? (
            <Link href={createEventHref} className="events-add-button">
              <Plus size={16} aria-hidden="true" />
              Add New Event
            </Link>
          ) : null}
        </div>

        <EventFlash message={flashMessage} />

        <form className="events-toolbar">
          <label className="events-search-field">
            <Search size={24} aria-hidden="true" />
            <span className="sr-only">Search events</span>
            <input
              type="search"
              name="search"
              defaultValue={search}
              placeholder="Search events..."
            />
          </label>

          <SortSelect
            currentSort={sort}
            sortLabels={sortLabels}
            currentSearch={search}
          />
        </form>

        {pageEvents.length === 0 ? (
          <div className="events-empty-card">
            <h2>No events yet. Create one to get started.</h2>
            <p>Your events will appear here once you create your first one.</p>
          </div>
        ) : (
          <div className="events-card-grid">
            {pageEvents.map((event) => (
              <article className="event-dashboard-card" key={event.id}>
                <div className="event-card-topline">
                  <div>
                    <h2>{event.eventName}</h2>
                    <div className="event-card-meta">
                      <span>
                        <MapPin size={15} aria-hidden="true" />
                        {event.location}
                      </span>
                      <span>{event.category}</span>
                    </div>
                  </div>
                  <div className="event-card-date">
                    <span>{formatEventDate(event)}</span>
                    <time>{formatEventRange(event)}</time>
                  </div>
                </div>

                <EventImageCarousel
                  images={getEventImagePaths(event)}
                  title={event.eventName}
                  category={event.category}
                  status={event.status}
                  className="event-card-media"
                />

                <div className="event-card-footer">
                  <EventStatusBadge status={event.status} approvalStatus={event.approvalStatus} />

                  <div className="event-card-actions">
                    <Link href={`/events/${event.id}`} className="event-view-button">
                      View
                      <ExternalLink size={15} aria-hidden="true" />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {pageCount > 1 ? (
          <DashboardPagination
            currentPage={currentPage}
            pageCount={pageCount}
            search={search}
            sort={sort}
          />
        ) : null}
      </section>
    </main>
  );
}

function DashboardPagination({
  currentPage,
  pageCount,
  search,
  sort,
}: {
  currentPage: number;
  pageCount: number;
  search: string;
  sort: EventSort;
}) {
  const pages = getPaginationPages(currentPage, pageCount);
  const previousPage = Math.max(1, currentPage - 1);
  const nextPage = Math.min(pageCount, currentPage + 1);

  return (
    <Pagination className="events-pagination">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href={getPageHref(previousPage, search, sort)}
            aria-disabled={currentPage === 1}
            className={currentPage === 1 ? "pointer-events-none opacity-45" : ""}
          />
        </PaginationItem>

        {pages.map((page, index) =>
          page === "ellipsis" ? (
            <PaginationItem key={`ellipsis-${index}`}>
              <PaginationEllipsis />
            </PaginationItem>
          ) : (
            <PaginationItem key={page}>
              <PaginationLink
                href={getPageHref(page, search, sort)}
                isActive={page === currentPage}
              >
                {page}
              </PaginationLink>
            </PaginationItem>
          ),
        )}

        <PaginationItem>
          <PaginationNext
            href={getPageHref(nextPage, search, sort)}
            aria-disabled={currentPage === pageCount}
            className={currentPage === pageCount ? "pointer-events-none opacity-45" : ""}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}

function getPageHref(page: number, search: string, sort: EventSort) {
  const query = new URLSearchParams();

  if (search.trim()) {
    query.set("search", search);
  }

  if (sort !== EVENT_SORTS.DATE_DESC) {
    query.set("sort", sort);
  }

  if (page > 1) {
    query.set("page", String(page));
  }

  const queryString = query.toString();
  return queryString ? `/events?${queryString}` : "/events";
}

function getPaginationPages(currentPage: number, pageCount: number) {
  if (pageCount <= 5) {
    return Array.from({ length: pageCount }, (_, index) => index + 1);
  }

  const pages: Array<number | "ellipsis"> = [1];
  const start = Math.max(2, currentPage - 1);
  const end = Math.min(pageCount - 1, currentPage + 1);

  if (start > 2) {
    pages.push("ellipsis");
  }

  for (let page = start; page <= end; page += 1) {
    pages.push(page);
  }

  if (end < pageCount - 1) {
    pages.push("ellipsis");
  }

  pages.push(pageCount);
  return pages;
}

function clampPage(pageParam: string | undefined, pageCount: number) {
  const page = Number(pageParam ?? "1");

  if (!Number.isInteger(page) || page < 1) {
    return 1;
  }

  return Math.min(page, pageCount);
}

function isEventSort(value: string): value is EventSort {
  return Object.values(EVENT_SORTS).includes(value);
}

function formatEventRange(event: { eventDate: string; eventTime: string; eventEndTime?: string }) {
  if (!event.eventEndTime) {
    return formatEventTime(event);
  }

  const endTime = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(`${event.eventDate}T${event.eventEndTime}`));

  return `${formatEventTime(event)} - ${endTime}`;
}

