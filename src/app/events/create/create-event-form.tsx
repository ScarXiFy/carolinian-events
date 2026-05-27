"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";

import {
  CATEGORY_OPTIONS,
  LOCATION_OPTIONS,
  computeEventStatus,
} from "@/lib/events.mjs";

export function CreateEventForm() {
  const [eventDate, setEventDate] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("Academic");
  const [notice, setNotice] = useState("");

  const status = useMemo(
    () => computeEventStatus(eventDate, eventTime),
    [eventDate, eventTime],
  );

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice("Preview only. Database saving will be added in the database phase.");
  }

  return (
    <form onSubmit={handleSubmit}>
      {notice ? <div className="alert alert-info">{notice}</div> : null}

      <div className="form-group">
        <label htmlFor="event_name">Event Name *</label>
        <input id="event_name" name="event_name" className="form-control" required />
      </div>

      <div className="form-group">
        <label htmlFor="organizer">Organizer *</label>
        <input id="organizer" name="organizer" className="form-control" required />
      </div>

      <div className="form-group">
        <label htmlFor="description">Description</label>
        <textarea id="description" name="description" className="form-control" rows={4} />
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
          Create Event
        </button>
      </div>
    </form>
  );
}
