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

export const EVENT_STATUSES = {
  UPCOMING: "Upcoming",
  ONGOING: "Ongoing",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

export const EVENT_APPROVAL_STATUSES = {
  PENDING: "Pending",
  APPROVED: "Approved",
  REJECTED: "Rejected",
};

export const EVENT_JOIN_STATES = {
  OPEN: "open",
  FULL: "full",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
  PENDING_APPROVAL: "pending_approval",
  REJECTED: "rejected",
};

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
  const normalizedEvents = normalizeEventStatuses(events);

  return {
    total: normalizedEvents.length,
    upcoming: normalizedEvents.filter((event) => event.status === EVENT_STATUSES.UPCOMING).length,
    ongoing: normalizedEvents.filter((event) => event.status === EVENT_STATUSES.ONGOING).length,
    completed: normalizedEvents.filter((event) => event.status === EVENT_STATUSES.COMPLETED).length,
  };
}

export function getFeaturedEvents(events = sampleEvents, limit = 5) {
  return normalizeEventStatuses(events)
    .sort((a, b) => {
      const first = new Date(`${a.eventDate}T${a.eventTime}`).getTime();
      const second = new Date(`${b.eventDate}T${b.eventTime}`).getTime();
      return first - second;
    })
    .slice(0, limit);
}

export function getVisibleEvents(events = sampleEvents, options = {}) {
  const { search = "", sort = EVENT_SORTS.DATE_DESC, viewer = null } = options;
  const normalizedSearch = search.trim().toLowerCase();
  const normalizedEvents = normalizeEventStatuses(events).filter((event) =>
    canViewEventByApproval(event, viewer),
  );
  const visibleEvents = normalizedSearch
    ? normalizedEvents.filter((event) => {
        return [event.eventName, event.location].some((value) =>
          value.toLowerCase().includes(normalizedSearch),
        );
      })
    : [...normalizedEvents];

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

export function canViewEventByApproval(event, viewer = null) {
  const approvalStatus = event?.approvalStatus ?? EVENT_APPROVAL_STATUSES.APPROVED;

  if (approvalStatus === EVENT_APPROVAL_STATUSES.APPROVED) {
    return true;
  }

  if (viewer?.role === "Admin") {
    return true;
  }

  return Boolean(viewer?.userId && event?.createdByUserId && viewer.userId === event.createdByUserId);
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
    return EVENT_STATUSES.UPCOMING;
  }

  if (now > endDateTime) {
    return EVENT_STATUSES.COMPLETED;
  }

  return EVENT_STATUSES.ONGOING;
}

export function getNormalizedEventStatus(event, now = new Date()) {
  if (event?.status === EVENT_STATUSES.CANCELLED) {
    return EVENT_STATUSES.CANCELLED;
  }

  if (!event?.eventDate || !event?.eventTime || !event?.eventEndTime) {
    return event?.status || EVENT_STATUSES.UPCOMING;
  }

  return computeEventStatus(event?.eventDate, event?.eventTime, event?.eventEndTime, now);
}

export function normalizeEventStatus(event, now = new Date()) {
  return {
    ...event,
    status: getNormalizedEventStatus(event, now),
  };
}

export function normalizeEventStatuses(events = [], now = new Date()) {
  return events.map((event) => normalizeEventStatus(event, now));
}

export function getEventImagePaths(event) {
  const paths = Array.isArray(event?.eventImagePaths) ? event.eventImagePaths : [];
  const values = [...paths, event?.eventImagePath]
    .map((value) => String(value ?? "").trim())
    .filter(Boolean);

  return [...new Set(values)];
}

export function getEventJoinState(event) {
  if ((event.approvalStatus ?? EVENT_APPROVAL_STATUSES.APPROVED) === EVENT_APPROVAL_STATUSES.PENDING) {
    return {
      state: EVENT_JOIN_STATES.PENDING_APPROVAL,
      disabled: true,
      label: "Pending Approval",
      error: "Pending Approval",
    };
  }

  if (event.approvalStatus === EVENT_APPROVAL_STATUSES.REJECTED) {
    return {
      state: EVENT_JOIN_STATES.REJECTED,
      disabled: true,
      label: "Event Rejected",
      error: "Event Rejected",
    };
  }

  if (event.status === EVENT_STATUSES.CANCELLED) {
    return {
      state: EVENT_JOIN_STATES.CANCELLED,
      disabled: true,
      label: "Event Cancelled",
      error: "Event Cancelled",
    };
  }

  if (event.status === EVENT_STATUSES.COMPLETED) {
    return {
      state: EVENT_JOIN_STATES.COMPLETED,
      disabled: true,
      label: "Event Completed",
      error: "Event Completed",
    };
  }

  const participantLimit = event.participantLimit ?? null;
  const participantCount = event.participantCount ?? 0;

  if (participantLimit !== null && participantCount >= participantLimit) {
    return {
      state: EVENT_JOIN_STATES.FULL,
      disabled: true,
      label: "Event Full",
      error: "Event Full",
    };
  }

  return {
    state: EVENT_JOIN_STATES.OPEN,
    disabled: false,
    label: "Join Event",
    error: "",
  };
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

