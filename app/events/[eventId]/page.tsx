// app/events/[eventId]/page.tsx
import { currentUser } from "@clerk/nextjs/server";
import { getEventById, deleteEvent } from "@/lib/actions/event.actions";
import { format } from "date-fns";
import { Calendar, MapPin, Tag } from "lucide-react";
import Image from "next/image";
import RegisterButton from "@/components/RegisterButton";
import { Button } from "@/components/ui/button";
import Link from "next/link";


export default async function EventDetails({
  params,
}: {
  params: { eventId: string };
}) {
  const event = await getEventById(params.eventId);
  const user = await currentUser();

  if (!event) {
    return <div>Event not found</div>;
  }

  const isOwner = user?.id === event.organizer.clerkId;

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

          <RegisterButton eventId={event._id} />

          {isOwner && (
            <div className="flex gap-4 mt-4">
              <Link href={`/events/${event._id}/edit`}>
                <Button>Edit</Button>
              </Link>
              <form action={async () => {
                "use server";
                await deleteEvent(event._id);
              }}>
                <Button variant="destructive" type="submit">Delete</Button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
