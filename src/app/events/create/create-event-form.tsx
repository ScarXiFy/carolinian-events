"use client";

import { format } from "date-fns";
import { CalendarIcon, LockKeyhole } from "lucide-react";
import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Field,
  FieldDescription,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
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
  eventEndTime?: string;
  location?: string;
  category?: string;
  participantLimit?: number;
  eventImagePath?: string | null;
};

type CreateEventFormProps = {
  initialValues?: EventFormInitialValues;
  mode?: "create" | "edit";
  formAction?: (formData: FormData) => void | Promise<void>;
};

export function CreateEventForm({
  initialValues,
  mode = "create",
  formAction,
}: CreateEventFormProps) {
  const initialLocation = getSelectWithCustomValue(LOCATION_OPTIONS, initialValues?.location);
  const initialCategory = getSelectWithCustomValue(
    CATEGORY_OPTIONS,
    initialValues?.category ?? "Academic",
  );
  const [eventDate, setEventDate] = useState(initialValues?.eventDate ?? "");
  const [eventTime, setEventTime] = useState(initialValues?.eventTime ?? "");
  const [eventEndTime, setEventEndTime] = useState(initialValues?.eventEndTime ?? "");
  const [location, setLocation] = useState(initialLocation.selectValue);
  const [category, setCategory] = useState(initialCategory.selectValue);
  const [notice, setNotice] = useState("");
  const actionLabel = mode === "edit" ? "Save Changes" : "Create Event";
  const labelClass = "create-event-label";
  const controlClass =
    "create-event-control min-h-12 rounded-lg border-[#222] bg-white/[0.03] px-4 py-3 text-base text-white shadow-none outline-none transition placeholder:text-white/35 focus-visible:border-[#2a8c4f] focus-visible:ring-[#2a8c4f]/25";
  const rowClass = "grid gap-6 md:grid-cols-2";
  const selectTriggerClass =
    "create-event-control min-h-12 w-full justify-between rounded-lg border-[#222] bg-white/[0.03] px-4 py-3 text-base text-white shadow-none outline-none transition focus:border-[#2a8c4f] focus:ring-[#2a8c4f]/25 data-placeholder:text-white/45";
  const timeInputClass =
    "create-event-control min-h-12 rounded-lg border-[#222] bg-white/[0.03] px-4 py-3 text-base text-white shadow-none outline-none transition [color-scheme:dark] focus-visible:border-[#2a8c4f] focus-visible:ring-[#2a8c4f]/25";

  const status = useMemo(
    () => computeEventStatus(eventDate, eventTime, eventEndTime),
    [eventDate, eventTime, eventEndTime],
  );
  const selectedDate = useMemo(
    () => (eventDate ? new Date(`${eventDate}T00:00:00`) : undefined),
    [eventDate],
  );
  const statusClass = !eventDate || !eventTime
    ? "border-[#222] bg-transparent text-[#555]"
    : status === "Completed"
      ? "!border-red-500/50 !bg-red-500/10 !text-red-300"
      : status === "Ongoing"
        ? "!border-[#2a8c4f]/60 !bg-[#2a8c4f]/10 !text-[#7bd99d]"
        : "!border-blue-500/50 !bg-blue-500/10 !text-blue-300";

  function handlePreviewSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice(
      mode === "edit"
        ? "Preview only. Database updates will be added in the database phase."
        : "Preview only. Database saving will be added in the database phase.",
    );
  }

  return (
    <form
      action={formAction}
      className="create-event-form space-y-6"
      onSubmit={formAction ? undefined : handlePreviewSubmit}
    >
      {notice ? <div className="alert alert-info">{notice}</div> : null}

      <div className={rowClass}>
        <Field className="gap-2.5">
          <FieldLabel htmlFor="event_name" className={labelClass}>
            Event Name <span className="text-[#d4a843]">*</span>
          </FieldLabel>
          <Input
            id="event_name"
            name="event_name"
            className={controlClass}
            defaultValue={initialValues?.eventName ?? ""}
            required
          />
        </Field>

        <Field className="gap-2.5">
          <FieldLabel htmlFor="organizer" className={labelClass}>
            Organizer <span className="text-[#d4a843]">*</span>
          </FieldLabel>
          <Input
            id="organizer"
            name="organizer"
            className={controlClass}
            defaultValue={initialValues?.organizer ?? ""}
            required
          />
        </Field>
      </div>

      <Field className="gap-2.5">
        <FieldLabel htmlFor="description" className={labelClass}>Description</FieldLabel>
        <Textarea
          id="description"
          name="description"
          className={`${controlClass} min-h-28 resize-y`}
          rows={4}
          defaultValue={initialValues?.description ?? ""}
        />
      </Field>

      <div className="grid gap-6 md:grid-cols-3">
        <Field className="gap-2.5">
          <FieldLabel htmlFor="event_date" className={labelClass}>
            Event Date <span className="text-[#d4a843]">*</span>
          </FieldLabel>
          <input
            id="event_date"
            name="event_date"
            className="sr-only"
            tabIndex={-1}
            aria-label="Event Date"
            value={eventDate}
            onChange={(event) => setEventDate(event.target.value)}
            required
          />
          <Popover>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className={`${controlClass} h-auto w-full justify-between text-left font-semibold hover:bg-white/5 hover:text-white`}
              >
                <span className={selectedDate ? "text-white" : "text-white/45"}>
                  {selectedDate ? format(selectedDate, "dd/MM/yyyy") : "dd/mm/yyyy"}
                </span>
                <CalendarIcon className="size-4 text-white/45" aria-hidden="true" />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              align="start"
              className="w-auto border-[#222] bg-[#151515] p-2 text-white shadow-2xl"
            >
              <Calendar
                mode="single"
                selected={selectedDate}
                captionLayout="dropdown"
                onSelect={(date) => {
                  if (date) {
                    setEventDate(format(date, "yyyy-MM-dd"));
                  }
                }}
                className="text-white"
              />
            </PopoverContent>
          </Popover>
        </Field>

        <Field className="gap-2.5">
          <FieldLabel htmlFor="event_time" className={labelClass}>
            Start Time <span className="text-[#d4a843]">*</span>
          </FieldLabel>
          <Input
            id="event_time"
            name="event_time"
            type="time"
            className={timeInputClass}
            value={eventTime}
            onChange={(event) => setEventTime(event.target.value)}
            required
          />
        </Field>

        <Field className="gap-2.5">
          <FieldLabel htmlFor="event_end_time" className={labelClass}>
            End Time <span className="text-[#d4a843]">*</span>
          </FieldLabel>
          <Input
            id="event_end_time"
            name="event_end_time"
            type="time"
            className={timeInputClass}
            value={eventEndTime}
            onChange={(event) => setEventEndTime(event.target.value)}
            required
          />
        </Field>
      </div>

      <Field className="gap-2.5">
        <FieldLabel htmlFor="location_select" className={labelClass}>
          Location <span className="text-[#d4a843]">*</span>
        </FieldLabel>
        <Select
          name="location_select"
          value={location}
          onValueChange={setLocation}
          required
        >
          <SelectTrigger id="location_select" className={selectTriggerClass}>
            <SelectValue placeholder="Select a location" />
          </SelectTrigger>
          <SelectContent className="border-[#333] bg-[#151515] text-white">
            <SelectGroup>
              {LOCATION_OPTIONS.map((option) => (
                <SelectItem
                  key={option}
                  value={option}
                  className="focus:bg-[#2a8c4f]/20 focus:text-white"
                >
                  {option}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        {location === "Other" ? (
          <Input
            id="location_other"
            name="location_other"
            className={`${controlClass} other-input mt-3`}
            placeholder="Enter custom location"
            defaultValue={initialLocation.customValue}
            required
          />
        ) : null}
      </Field>

      <div className={rowClass}>
        <Field className="gap-2.5">
          <FieldLabel htmlFor="category_select" className={labelClass}>Category</FieldLabel>
          <Select
            name="category_select"
            value={category}
            onValueChange={setCategory}
          >
            <SelectTrigger id="category_select" className={selectTriggerClass}>
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent className="border-[#333] bg-[#151515] text-white">
              <SelectGroup>
                {CATEGORY_OPTIONS.map((option) => (
                  <SelectItem
                    key={option}
                    value={option}
                    className="focus:bg-[#2a8c4f]/20 focus:text-white"
                  >
                    {option}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          {category === "Other" ? (
            <Input
              id="category_other"
              name="category_other"
              className={`${controlClass} other-input mt-3`}
              placeholder="Enter custom category"
              defaultValue={initialCategory.customValue}
              required
            />
          ) : null}
          <input type="hidden" id="category_final" name="category" value={category} />
        </Field>

        <Field className="gap-2.5">
          <FieldLabel htmlFor="status_display" className={labelClass}>Status</FieldLabel>
          <div className="relative">
            <Input
              id="status_display"
              className={`min-h-12 w-full rounded-lg border px-4 py-3 pr-10 text-base font-semibold outline-none cursor-not-allowed select-none shadow-none ${statusClass}`}
              value={eventDate && eventTime ? status : "-"}
              readOnly
            />
            <LockKeyhole
              className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-[#444]"
              aria-hidden="true"
            />
          </div>
          <input type="hidden" id="status" name="status" value={status} />
          <FieldDescription className="status-hint text-sm text-[#a1a1aa]">
            Auto-set based on event date & time
          </FieldDescription>
        </Field>
      </div>

      <Field className="gap-2.5">
        <FieldLabel htmlFor="participant_limit" className={labelClass}>
          Max Participants <span className="text-[#d4a843]">*</span>
        </FieldLabel>
        <Input
          id="participant_limit"
          name="participant_limit"
          type="number"
          min="1"
          className={controlClass}
          defaultValue={initialValues?.participantLimit ?? ""}
          placeholder="Example: 80"
          required
        />
      </Field>

      <Field className="gap-2.5">
        <FieldLabel htmlFor="event_image" className={labelClass}>
          Event Image {mode === "create" ? <span className="text-[#d4a843]">*</span> : null}
        </FieldLabel>
        <Input
          id="event_image"
          name="event_image"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className={`${controlClass} file:mr-4 file:rounded-md file:border-0 file:bg-[#d4a843] file:px-3 file:py-2 file:text-sm file:font-bold file:text-black`}
          required={mode === "create"}
        />
        {initialValues?.eventImagePath ? (
          <FieldDescription className="status-hint text-sm text-[#a1a1aa]">
            Upload a new image only if you want to replace the current poster.
          </FieldDescription>
        ) : (
          <FieldDescription className="status-hint text-sm text-[#a1a1aa]">
            JPG, PNG, WebP, or GIF. Maximum size is 2 MB.
          </FieldDescription>
        )}
      </Field>

      <div className="create-event-actions form-actions mt-8 flex flex-col-reverse gap-3 sm:mt-6 sm:flex-row sm:justify-end sm:gap-4">
        <Button
          asChild
          variant="ghost"
          className="legacy-btn legacy-btn-secondary h-auto px-6 py-3 text-sm font-semibold"
        >
          <Link href="/events">Cancel</Link>
        </Button>
        <Button
          type="submit"
          className="legacy-btn legacy-btn-primary h-auto px-8 py-3 text-sm font-bold"
        >
          {actionLabel}
        </Button>
      </div>
    </form>
  );
}
