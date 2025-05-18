// app/events/[eventId]/page.tsx

import { getEventById } from "@/lib/actions/event.actions"; // Removed deleteEvent
import { format } from "date-fns";
import { Calendar, MapPin, Tag } from "lucide-react";
import Image from "next/image";
import EventJoinForm from "@/components/EventJoinForm";

export default async function EventDetails({
  params,
}: {
  params: { eventId: string };
}) {
  const event = await getEventById(params.eventId);

  if (!event) {
    return <div>Event not found</div>;
  }

  return (
    <div className="container py-8">
      <div className="grid md:grid-cols-2 gap-8">
        {/* Event Image */}
        <div className="rounded-lg overflow-hidden">
          <Image
            src={event.imageUrl}
            alt={event.title}
            width={800}
            height={450}
            className="w-full h-auto object-cover"
          />
        </div>

        {/* Event Details */}
        <div className="space-y-4">
          <h1 className="text-3xl font-bold">{event.title}</h1>
          <div className="flex items-center gap-2 text-gray-600">
            <Calendar className="w-5 h-5" />
            <span>
              {format(new Date(event.startDateTime), "PPpp")} - {format(new Date(event.endDateTime), "PPpp")}
            </span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <MapPin className="w-5 h-5" />
            <span>{event.location}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Tag className="w-5 h-5" />
            <span>{event.category?.name || "Uncategorized"}</span>
          </div>
          <p>{event.description}</p>

          {/* Event Join Form */}
          <div className="mt-6 p-6 border rounded-xl bg-gradient-to-r from-blue-50 to-blue-100 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <svg className="w-7 h-7 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 11c1.657 0 3-1.343 3-3S13.657 5 12 5s-3 1.343-3 3 1.343 3 3 3zm0 2c-2.67 0-8 1.337-8 4v2a1 1 0 001 1h14a1 1 0 001-1v-2c0-2.663-5.33-4-8-4z" />
              </svg>
              <h2 className="text-2xl font-bold text-blue-800">Join this Event</h2>
            </div>
            <p className="text-gray-700 mb-4">
              Secure your spot and connect with other attendees. Fill out the form below to join!
            </p>
            <EventJoinForm eventId={event._id} />
          </div>
        </div>
      </div>
    </div>
  );
}
