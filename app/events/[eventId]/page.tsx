// app/events/[eventId]/page.tsx

import { getEventById } from "@/lib/actions/event.actions";
import { format } from "date-fns";
import { Calendar, MapPin, Tag, User, Clock, Users, Mail, Phone, Building2, FileText } from "lucide-react";
import Image from "next/image";
import EventJoinForm from "@/components/EventJoinForm";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface Sponsor {
  name: string;
  website?: string;
}

export default async function EventDetails({
  params,
}: {
  params: { eventId: string };
}) {
  const resolvedParams = await Promise.resolve(params);
  const event = await getEventById(resolvedParams.eventId);

  if (!event) {
    return <div>Event not found</div>;
  }

  const organizerName = event.organizer?.firstName && event.organizer?.lastName 
    ? `${event.organizer.firstName} ${event.organizer.lastName}`
    : "Unknown Organizer";

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
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">{event.title}</h1>
            <div className="flex items-center gap-2 text-muted-foreground">
              <User className="w-5 h-5" />
              <span>Organized by {organizerName}</span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="w-5 h-5" />
              <span>Starts: {format(new Date(event.startDateTime), "PPpp")}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="w-5 h-5" />
              <span>Ends: {format(new Date(event.endDateTime), "PPpp")}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="w-5 h-5" />
              <span>{event.location}</span>
            </div>            <div className="flex items-center gap-2 text-muted-foreground">
              <Tag className="w-5 h-5" />
              <div className="flex flex-wrap gap-2">
                {event.categories?.map((category: string) => (
                  <span key={category} className="px-2 py-1 bg-primary/10 rounded-full text-sm">
                    {category}
                  </span>
                ))}
              </div>
            </div>
            {event.maxRegistrations && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Users className="w-5 h-5" />
                <span>Maximum Registrations: {event.maxRegistrations}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <span className={`font-medium ${event.isFree || event.price === "0" ? 'text-green-600' : 'text-red-600'}`}>
                {event.isFree || event.price === "0" ? "FREE" : `₱${event.price}`}
              </span>
            </div>
          </div>

          <div className="pt-4">
            <h2 className="text-xl font-semibold mb-2">Description</h2>
            <p className="text-muted-foreground whitespace-pre-wrap">{event.description}</p>
          </div>

          {/* Contact Information */}
          <div className="pt-4 border-t">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Contact Information
            </h2>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="w-5 h-5" />
                <a href={`mailto:${event.contactEmail}`} className="hover:text-primary transition-colors">
                  {event.contactEmail}
                </a>
              </div>
              {event.contactPhone && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="w-5 h-5" />
                  <a href={`tel:${event.contactPhone}`} className="hover:text-primary transition-colors">
                    {event.contactPhone}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Requirements */}
          {event.requirements && (
            <div className="pt-4 border-t">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Requirements
              </h2>
              <p className="text-muted-foreground whitespace-pre-wrap">{event.requirements}</p>
            </div>
          )}

          {/* Sponsors */}
          {event.sponsors && event.sponsors.length > 0 && (
            <div className="pt-4 border-t">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Event Sponsors
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {event.sponsors.map((sponsor: Sponsor, index: number) => (
                  <div key={index} className="p-4 bg-card rounded-lg border border-border/50">
                    <h3 className="font-semibold mb-1">{sponsor.name}</h3>
                    {sponsor.website && (
                      <a
                        href={sponsor.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-muted-foreground hover:text-primary transition-colors"
                      >
                        Visit Website
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
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
