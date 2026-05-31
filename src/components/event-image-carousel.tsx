"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";

type EventImageCarouselProps = {
  images: string[];
  title: string;
  category: string;
  status: string;
  className?: string;
  priority?: boolean;
};

export function EventImageCarousel({
  images,
  title,
  category,
  status,
  className = "",
  priority = false,
}: EventImageCarouselProps) {
  const cleanImages = useMemo(
    () => [...new Set(images.map((image) => image.trim()).filter(Boolean))],
    [images],
  );
  const [activeIndex, setActiveIndex] = useState(0);
  const hasMultiple = cleanImages.length > 1;
  const activeImage = cleanImages[activeIndex];

  function goPrevious() {
    setActiveIndex((index) => (index === 0 ? cleanImages.length - 1 : index - 1));
  }

  function goNext() {
    setActiveIndex((index) => (index + 1) % cleanImages.length);
  }

  return (
    <div className={`event-image-carousel ${className}`}>
      {activeImage ? (
        <Image
          src={activeImage}
          alt={`${title} event image ${activeIndex + 1}`}
          fill
          className="object-cover"
          priority={priority}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 760px"
        />
      ) : (
        <div
          className={`event-detail-image-placeholder ${getEventMediaClass(category, status)}`}
          aria-hidden="true"
        >
          <div className="event-media-orb" />
          <div className="event-media-lines" />
          <div className="event-media-label">{category}</div>
        </div>
      )}

      {hasMultiple ? (
        <div className="event-carousel-controls">
          <button type="button" aria-label="Previous event image" onClick={goPrevious}>
            <ChevronLeft size={18} aria-hidden="true" />
          </button>
          <span>{activeIndex + 1} / {cleanImages.length}</span>
          <button type="button" aria-label="Next event image" onClick={goNext}>
            <ChevronRight size={18} aria-hidden="true" />
          </button>
        </div>
      ) : null}
    </div>
  );
}

function getEventMediaClass(category: string, status: string) {
  const value = `${category} ${status}`.toLowerCase();

  if (value.includes("thesis") || value.includes("academic")) return "event-media-academic";
  if (value.includes("verification") || value.includes("tech")) return "event-media-tech";
  if (value.includes("social") || value.includes("cultural")) return "event-media-social";
  if (value.includes("sports")) return "event-media-sports";

  return "event-media-default";
}
