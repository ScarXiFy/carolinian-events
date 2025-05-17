// app/events/[eventId]/page.tsx
import { currentUser } from "@clerk/nextjs/server";
import { getEventById } from "@/lib/actions/event.actions";
import { format } from "date-fns";
import { Calendar, MapPin, Tag } from "lucide-react";
import Image from "next/image";
import RegisterButton from "@/components/RegisterButton";

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
        <div className="space-y-6">
          <h1 className="text-3xl font-bold">{event.title}</h1>
          
          <div className="flex items-center gap-4">
            {event.category && (
              <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm">
                {event.category.name}
              </span>
            )}
            <span className="font-medium">
              {event.isFree ? "FREE" : `$${event.price}`}
            </span>
          </div>

          <p className="text-lg">{event.description}</p>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">When</p>
                <p>
                  {format(event.startDateTime, "MMMM d, yyyy h:mm a")} -{" "}
                  {format(event.endDateTime, "MMMM d, yyyy h:mm a")}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Where</p>
                <p>{event.location}</p>
              </div>
            </div>
          </div>

          {/* Tags */}
          {event.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {event.tags.map((tag: string) => (
                <span
                  key={tag}
                  className="px-2 py-1 text-xs rounded-full bg-muted text-muted-foreground flex items-center"
                >
                  <Tag className="h-3 w-3 mr-1" /> #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Registration Button */}
          <RegisterButton 
            eventId={event._id.toString()} 
            userId={user?.id} 
          />
        </div>
      </div>
    </div>
  );
}