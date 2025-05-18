// app/events/[eventId]/page.tsx

import { getEventById } from "@/lib/actions/event.actions";
import { format } from "date-fns";
import { Calendar, MapPin, Tag } from "lucide-react";
import Image from "next/image";
import EventJoinForm from "@/components/EventJoinForm";
import Link from "next/link";
import { Button } from "@/components/ui/button";

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
    <div className="container py-8 space-y-12">
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
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <Calendar className="w-5 h-5" />
            <span>
              {format(new Date(event.startDateTime), "PPpp")} -{" "}
              {format(new Date(event.endDateTime), "PPpp")}
            </span>
          </div>
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <MapPin className="w-5 h-5" />
            <span>{event.location}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <Tag className="w-5 h-5" />
            <span>{event.category?.name || "Uncategorized"}</span>
          </div>
          <p className="text-gray-800 dark:text-gray-300">{event.description}</p>
        </div>
      </div>

      {/* CTA Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
        <Link href="/events">
          <Button className="px-6 py-3 text-base font-semibold rounded-xl bg-yellow-400 hover:bg-yellow-500 text-black dark:text-white dark:bg-yellow-500 dark:hover:bg-yellow-600 transition-colors duration-200 shadow-md">
            Browse Events
          </Button>
        </Link>

        <a href="#join-form">
          <Button className="px-6 py-3 text-base font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition-colors duration-200 shadow-md">
            Join this Event
          </Button>
        </a>
      </div>

      {/* Event Join Form */}
      <div id="join-form">
        <div className="mt-6 p-6 border rounded-xl bg-gradient-to-r from-blue-50 to-blue-100 dark:from-gray-800 dark:to-gray-700 shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <svg
              className="w-7 h-7 text-blue-500"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 11c1.657 0 3-1.343 3-3S13.657 5 12 5s-3 1.343-3 3 1.343 3 3 3zm0 2c-2.67 0-8 1.337-8 4v2a1 1 0 001 1h14a1 1 0 001-1v-2c0-2.663-5.33-4-8-4z"
              />
            </svg>
            <h2 className="text-2xl font-bold text-blue-800 dark:text-blue-300">Join this Event</h2>
          </div>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Secure your spot and connect with other attendees. Fill out the form below to join!
          </p>
          <EventJoinForm eventId={event._id} />
        </div>
      </div>
    </div>
  );
}
