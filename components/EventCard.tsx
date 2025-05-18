import Image from "next/image"
import Link from "next/link"
import { Button } from "./ui/button"
import { Calendar, MapPin, Tag } from "lucide-react"
import { format } from "date-fns"

interface EventCardProps {
  event: {
    tags?: string[]
    _id: string
    title: string
    description: string
    location: string
    imageUrl: string
    startDateTime: Date
    endDateTime: Date
    price: string
    isFree: boolean
    category?: {
      _id: string
      name: string
    }
  }
  isOwner?: boolean
}

export default function EventCard({ event }: EventCardProps) {
  return (
    <div className="rounded-lg border border-gray-300 dark:border-gray-700 overflow-hidden shadow-sm hover:shadow-lg transition-shadow bg-white dark:bg-gray-900 flex flex-col">
      <div className="relative aspect-video overflow-hidden group">
        <Image
          src={event.imageUrl}
          alt={event.title}
          fill
          className="object-cover transition-transform duration-300 ease-in-out group-hover:scale-105"
        />
      </div>
      <div className="p-5 flex flex-col flex-grow">
        <h3 className="text-2xl font-semibold mb-3 text-gray-900 dark:text-gray-100 leading-snug">
          {event.title}
        </h3>
        <p className="text-muted-foreground dark:text-gray-400 mb-5 line-clamp-3">
          {event.description}
        </p>

        <div className="flex flex-col gap-3 mb-5 text-gray-700 dark:text-gray-300">
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-muted-foreground dark:text-gray-400" />
            <span className="text-sm font-medium">
              {format(event.startDateTime, "MMM d, yyyy h:mm a")}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <MapPin className="h-5 w-5 text-muted-foreground dark:text-gray-400" />
            <span className="text-sm font-medium">{event.location}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mb-6">
          {event.category && (
            <span className="px-3 py-1.5 text-xs font-semibold rounded-full bg-primary/20 text-primary dark:bg-primary/30 dark:text-primary-light select-none">
              {event.category.name}
            </span>
          )}
          {event.tags?.map((tag: string) => (
            <span
              key={tag}
              className="px-3 py-1.5 text-xs rounded-full bg-muted text-muted-foreground flex items-center gap-1 select-none dark:bg-gray-700 dark:text-gray-300"
            >
              <Tag className="h-4 w-4" /> #{tag}
            </span>
          ))}
        </div>

        <div className="flex justify-between items-center">
  <span className={`font-medium ${event.isFree ? 'text-green-600' : 'text-red-600'}`}>
    {event.isFree ? "FREE" : `$${event.price}`}
  </span>
  <Button asChild size="sm">
    <Link href={`/events/${event._id}`}>View Details</Link>
  </Button>
</div>
      </div>
    </div>
  )
}
