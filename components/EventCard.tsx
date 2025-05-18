import Image from "next/image"
import Link from "next/link"
import { Button } from "./ui/button"
import { Calendar, MapPin, Tag } from "lucide-react"
import { format } from "date-fns"

interface EventCardProps {
  event: {
    tags?: string[];
    _id: string;
    title: string;
    description: string;
    location: string;
    imageUrl: string;
    startDateTime: Date;
    endDateTime: Date;
    price: string;
    isFree: boolean;
    category?: {
      _id: string;
      name: string;
    };
  };
  isOwner?: boolean;
}

export default function EventCard({ event }: EventCardProps) {
  return (
    <div className="rounded-lg border overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="relative aspect-video">
        <Image
          src={event.imageUrl}
          alt={event.title}
          fill
          className="object-cover"
        />
      </div>
      <div className="p-4">
        <h3 className="text-xl font-semibold mb-2">{event.title}</h3>
        <p className="text-muted-foreground mb-4 line-clamp-2">
          {event.description}
        </p>

        <div className="flex flex-col gap-2 mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>
              {format(event.startDateTime, "MMM d, yyyy h:mm a")}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span>{event.location}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {event.category && (
            <span className="px-2 py-1 text-xs rounded-full bg-primary/10 text-primary">
              {event.category.name}
            </span>
          )}
          {event.tags?.map((tag: string) => (
            <span
              key={tag}
              className="px-2 py-1 text-xs rounded-full bg-muted text-muted-foreground flex items-center"
            >
              <Tag className="h-3 w-3 mr-1" /> #{tag}
            </span>
          ))}
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <span className="font-medium">
              {event.isFree ? "FREE" : `$${event.price}`}
            </span>
            <Button asChild size="sm">
              <Link href={`/events/${event._id}`}>View Details</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
