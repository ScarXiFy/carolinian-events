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
  const initialLocation = getSelectWithCustomValue(
    LOCATION_OPTIONS,
    initialValues?.location ?? "",
  );
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

      <div className="form-group">
        <label htmlFor="event_name">Event Name *</label>
        <input
          id="event_name"
          name="event_name"
          className="form-control"
          defaultValue={initialValues?.eventName ?? ""}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="organizer">Organizer *</label>
        <input
          id="organizer"
          name="organizer"
          className="form-control"
          defaultValue={initialValues?.organizer ?? ""}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          name="description"
          className="form-control"
          rows={4}
          defaultValue={initialValues?.description ?? ""}
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="event_date">Event Date *</label>
          <input
            id="event_date"
            name="event_date"
            type="date"
            className="form-control"
            value={eventDate}
            onChange={(event) => setEventDate(event.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="event_time">Event Time *</label>
          <input
            id="event_time"
            name="event_time"
            type="time"
            className="form-control"
            value={eventTime}
            onChange={(event) => setEventTime(event.target.value)}
            required
          />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="location_select">Location *</label>
        <select
          id="location_select"
          name="location_select"
          className="form-control"
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
            className="form-control other-input"
            placeholder="Enter custom location"
            defaultValue={initialLocation.customValue}
            required
          />
        ) : null}
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="category_select">Category</label>
          <select
            id="category_select"
            name="category_select"
            className="form-control"
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
              className="form-control other-input"
              placeholder="Enter custom category"
              defaultValue={initialCategory.customValue}
              required
            />
          ) : null}
          <input type="hidden" id="category_final" name="category" value={category} />
        </div>
        <div className="form-group">
          <label htmlFor="status_display">Status</label>
          <input
            id="status_display"
            className="form-control"
            value={eventDate && eventTime ? status : "-"}
            readOnly
          />
          <input type="hidden" id="status" name="status" value={status} />
          <small className="status-hint">Auto-set based on event date & time</small>
        </div>
      </div>

      <div className="form-actions">
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
