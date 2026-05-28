export const EVENT_SORTS = {
  DATE_DESC: "date_desc",
  DATE_ASC: "date_asc",
  NAME_ASC: "name_asc",
  NAME_DESC: "name_desc",
};

export const LOCATION_OPTIONS = [
  "Bunzel Building",
  "Rigney Hall",
  "LRC Building",
  "SMED Building",
  "PE Building",
  "SAFAD Theatre",
  "MR Hall",
  "Basketball Court",
  "Soccer Field",
  "Other",
];

export const CATEGORY_OPTIONS = [
  "Academic",
  "Cultural",
  "Sports",
  "Social",
  "Other",
];

export const sampleEvents = [
  {
    id: 1,
    eventName: "Mock Presentation",
    organizer: "GROUP F",
    description:
      "A practice presentation session for CPE students to rehearse and refine their project demonstrations before the final defense.",
    eventDate: "2026-05-05",
    eventTime: "14:00:00",
    eventEndTime: "16:00:00",
    location: "NCR Lab",
    category: "Academic",
    status: "Completed",
    createdAt: "2026-05-01T08:00:00.000Z",
  },
  {
    id: 2,
    eventName: "Proposal Hearing 2026",
    organizer: "CPE Department",
    description:
      "Annual thesis and capstone proposal hearing for 3rd year Computer Engineering students. Present your project proposals to the panel.",
    eventDate: "2026-05-08",
    eventTime: "15:30:00",
    eventEndTime: "17:00:00",
    location: "Bunzel Building",
    category: "Academic",
    status: "Completed",
    createdAt: "2026-05-02T08:00:00.000Z",
  },
  {
    id: 3,
    eventName: "Carolinian Week 2026",
    organizer: "USC Student Council",
    description:
      "The annual week-long celebration of Carolinian culture featuring sports tournaments, talent shows, food fairs, and community outreach programs.",
    eventDate: "2026-06-15",
    eventTime: "08:00:00",
    eventEndTime: "10:00:00",
    location: "USC Main Campus",
    category: "Cultural",
    status: "Upcoming",
    createdAt: "2026-05-03T08:00:00.000Z",
  },
  {
    id: 4,
    eventName: "Intramurals 2026",
    organizer: "USC Athletics",
    description:
      "University-wide intramural sports competition. Events include basketball, volleyball, badminton, table tennis, and track and field.",
    eventDate: "2026-04-20",
    eventTime: "07:30:00",
    eventEndTime: "11:30:00",
    location: "USC Gymnasium",
    category: "Sports",
    status: "Completed",
    createdAt: "2026-05-04T08:00:00.000Z",
  },
  {
    id: 5,
    eventName: "Tech Talk: AI in Engineering",
    organizer: "CPE Society",
    description:
      "A guest lecture exploring the latest advancements in Artificial Intelligence and how they are reshaping Computer Engineering.",
    eventDate: "2026-06-22",
    eventTime: "13:00:00",
    eventEndTime: "15:00:00",
    location: "Engineering Auditorium",
    category: "Academic",
    status: "Upcoming",
    createdAt: "2026-05-05T08:00:00.000Z",
  },
];

export function getEventStats(events = sampleEvents) {
  return {
    total: events.length,
    upcoming: events.filter((event) => event.status === "Upcoming").length,
    ongoing: events.filter((event) => event.status === "Ongoing").length,
    completed: events.filter((event) => event.status === "Completed").length,
  };
}

export function getFeaturedEvents(events = sampleEvents, limit = 5) {
  return [...events]
    .sort((a, b) => {
      const first = new Date(`${a.eventDate}T${a.eventTime}`).getTime();
      const second = new Date(`${b.eventDate}T${b.eventTime}`).getTime();
      return first - second;
    })
    .slice(0, limit);
}

export function getVisibleEvents(
  events = sampleEvents,
  { search = "", sort = EVENT_SORTS.DATE_DESC } = {},
) {
  const normalizedSearch = search.trim().toLowerCase();
  const visibleEvents = normalizedSearch
    ? events.filter((event) => {
        return [event.eventName, event.location].some((value) =>
          value.toLowerCase().includes(normalizedSearch),
        );
      })
    : [...events];

  return visibleEvents.sort((a, b) => {
    if (sort === EVENT_SORTS.DATE_ASC) {
      return compareCreatedAt(a, b);
    }

    if (sort === EVENT_SORTS.NAME_ASC) {
      return a.eventName.localeCompare(b.eventName);
    }

    if (sort === EVENT_SORTS.NAME_DESC) {
      return b.eventName.localeCompare(a.eventName);
    }

    return compareCreatedAt(b, a);
  });
}

export function getEventById(events = sampleEvents, id) {
  const numericId = Number(id);

  if (!Number.isInteger(numericId)) {
    return undefined;
  }

  return events.find((event) => event.id === numericId);
}

export function formatEventDate(event) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${event.eventDate}T00:00:00`));
}

export function formatEventTime(event) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(`${event.eventDate}T${event.eventTime}`));
}

export function formatFullEventDate(event) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${event.eventDate}T00:00:00`));
}

export function formatCreatedDate(event) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(event.createdAt));
}

export function computeEventStatus(eventDate, eventTime, eventEndTime, now = new Date()) {
  if (!eventDate || !eventTime || !eventEndTime) {
    return "Upcoming";
  }

  const startDateTime = new Date(`${eventDate}T${eventTime}`);
  const endDateTime = new Date(`${eventDate}T${eventEndTime}`);

  if (now < startDateTime) {
    return "Upcoming";
  }

  if (now > endDateTime) {
    return "Completed";
  }

  return "Ongoing";
}

export function getSelectWithCustomValue(options, value) {
  if (!value) {
    return {
      selectValue: "",
      customValue: "",
    };
  }

  if (options.includes(value)) {
    return {
      selectValue: value,
      customValue: "",
    };
  }

  return {
    selectValue: "Other",
    customValue: value ?? "",
  };
}

export function getDeleteConfirmationMessage(event) {
  return `Are you sure you want to delete "${event.eventName}"? This action cannot be undone.`;
}

function compareCreatedAt(a, b) {
  const byCreatedAt = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  return byCreatedAt === 0 ? a.id - b.id : byCreatedAt;
}

