"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";

import {
  CATEGORY_OPTIONS,
  LOCATION_OPTIONS,
  computeEventStatus,
  getSelectWithCustomValue,
} from "@/lib/events.mjs";

type EventFormInitialValues = {
  eventName?: string;
  organizer?: string;
  description?: string;
  eventDate?: string;
  eventTime?: string;
  location?: string;
  category?: string;
};

type CreateEventFormProps = {
  initialValues?: EventFormInitialValues;
  mode?: "create" | "edit";
};

export function CreateEventForm({
  initialValues,
  mode = "create",
}: CreateEventFormProps) {
  const initialLocation = getSelectWithCustomValue(LOCATION_OPTIONS, initialValues?.location);
  const initialCategory = getSelectWithCustomValue(
    CATEGORY_OPTIONS,
    initialValues?.category ?? "Academic",
  );
  const [eventDate, setEventDate] = useState(initialValues?.eventDate ?? "");
  const [eventTime, setEventTime] = useState(initialValues?.eventTime ?? "");
  const [location, setLocation] = useState(initialLocation.selectValue);
  const [category, setCategory] = useState(initialCategory.selectValue);
  const [notice, setNotice] = useState("");
  const actionLabel = mode === "edit" ? "Save Changes" : "Create Event";
  const groupClass = "mb-6";
  const labelClass = "mb-2 block font-semibold text-[#a1a1aa]";
  const controlClass =
    "form-control w-full rounded-lg border border-[#222] bg-white/[0.03] px-4 py-3 text-base text-white outline-none transition focus:border-[#2a8c4f] focus:bg-white/[0.05] focus:ring-[3px] focus:ring-[#2a8c4f]/15";
  const rowClass = "grid gap-6 md:grid-cols-2";

  const status = useMemo(
    () => computeEventStatus(eventDate, eventTime),
    [eventDate, eventTime],
  );

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice(
      mode === "edit"
        ? "Preview only. Database updates will be added in the database phase."
        : "Preview only. Database saving will be added in the database phase.",
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      {notice ? <div className="alert alert-info">{notice}</div> : null}

      <div className={groupClass}>
        <label htmlFor="event_name" className={labelClass}>Event Name *</label>
        <input
          id="event_name"
          name="event_name"
          className={controlClass}
          defaultValue={initialValues?.eventName ?? ""}
          required
        />
      </div>

      <div className={groupClass}>
        <label htmlFor="organizer" className={labelClass}>Organizer *</label>
        <input
          id="organizer"
          name="organizer"
          className={controlClass}
          defaultValue={initialValues?.organizer ?? ""}
          required
        />
      </div>

      <div className={groupClass}>
        <label htmlFor="description" className={labelClass}>Description</label>
        <textarea
          id="description"
          name="description"
          className={`${controlClass} min-h-28 resize-y`}
          rows={4}
          defaultValue={initialValues?.description ?? ""}
        />
      </div>

      <div className={rowClass}>
        <div className={groupClass}>
          <label htmlFor="event_date" className={labelClass}>Event Date *</label>
          <input
            id="event_date"
            name="event_date"
            type="date"
            className={controlClass}
            value={eventDate}
            onChange={(event) => setEventDate(event.target.value)}
            required
          />
        </div>
        <div className={groupClass}>
          <label htmlFor="event_time" className={labelClass}>Event Time *</label>
          <input
            id="event_time"
            name="event_time"
            type="time"
            className={controlClass}
            value={eventTime}
            onChange={(event) => setEventTime(event.target.value)}
            required
          />
        </div>
      </div>

      <div className={groupClass}>
        <label htmlFor="location_select" className={labelClass}>Location *</label>
        <select
          id="location_select"
          name="location_select"
          className={controlClass}
          value={location}
          onChange={(event) => setLocation(event.target.value)}
          required
        >
          <option value="" disabled>
            Select a location
          </option>
          {LOCATION_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        {location === "Other" ? (
          <input
            id="location_other"
            name="location_other"
            className={`${controlClass} other-input mt-3`}
            placeholder="Enter custom location"
            defaultValue={initialLocation.customValue}
            required
          />
        ) : null}
      </div>

      <div className={rowClass}>
        <div className={groupClass}>
          <label htmlFor="category_select" className={labelClass}>Category</label>
          <select
            id="category_select"
            name="category_select"
            className={controlClass}
            value={category}
            onChange={(event) => setCategory(event.target.value)}
          >
            {CATEGORY_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          {category === "Other" ? (
            <input
              id="category_other"
              name="category_other"
              className={`${controlClass} other-input mt-3`}
              placeholder="Enter custom category"
              defaultValue={initialCategory.customValue}
              required
            />
          ) : null}
          <input type="hidden" id="category_final" name="category" value={category} />
        </div>
        <div className={groupClass}>
          <label htmlFor="status_display" className={labelClass}>Status</label>
          <input
            id="status_display"
            className={`${controlClass} cursor-not-allowed text-[#a1a1aa]`}
            value={eventDate && eventTime ? status : "-"}
            readOnly
          />
          <input type="hidden" id="status" name="status" value={status} />
          <small className="status-hint mt-2 block text-sm text-[#a1a1aa]">
            Auto-set based on event date & time
          </small>
        </div>
      </div>

      <div className="form-actions mt-8 flex flex-col gap-4 sm:flex-row sm:justify-end">
        <Link href="/events" className="legacy-btn legacy-btn-secondary">
          Cancel
        </Link>
        <button type="submit" className="legacy-btn legacy-btn-primary">
          {actionLabel}
        </button>
      </div>
    </form>
  );
}
