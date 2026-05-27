"use client";

import { useEffect, useMemo, useRef } from "react";

type OrbitEvent = {
  id: number;
  dateTime: string;
  eventName: string;
  status: string;
  glowClass: string;
};

type HeroOrbitProps = {
  events: OrbitEvent[];
};

type OrbitConfig = {
  angle: number;
  radiusX: number;
  radiusY: number;
  speed: number;
};

export function HeroOrbit({ events }: HeroOrbitProps) {
  const cardRefs = useRef<Array<HTMLElement | null>>([]);
  const configs = useMemo(
    () =>
      events.map((_, index) => ({
        angle: index * ((Math.PI * 2) / Math.max(events.length, 1)),
        radiusX: 180 + index * 65,
        radiusY: (180 + index * 65) * 0.55,
        speed: 0.0015 - index * 0.00015,
      })),
    [events],
  );

  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const runtimeConfigs: OrbitConfig[] = configs.map((config, index) => {
      const radiusX = (isMobile ? 120 : 180) + index * (isMobile ? 40 : 65);

      return {
        ...config,
        radiusX,
        radiusY: radiusX * 0.55,
<<<<<<< HEAD
        speed: reducedMotion ? config.speed * 0.2 : config.speed,
=======
        speed: reducedMotion ? 0 : config.speed,
>>>>>>> a8b3d01 ([enricode-PC][Updated] animate legacy home UI)
      };
    });

    let frameId = 0;

    function animateOrbit() {
      runtimeConfigs.forEach((config, index) => {
        const card = cardRefs.current[index];

        if (!card) {
          return;
        }

        config.angle += config.speed;

        const x = Math.cos(config.angle) * config.radiusX;
        const y = Math.sin(config.angle) * config.radiusY;
        const depth = Math.sin(config.angle);
        const scale = 0.85 + depth * 0.15;
        const opacity = 0.5 + (depth + 1) * 0.25;
        const zIndex = x < -100 && !isMobile ? 15 : Math.floor(depth * 10) + 20;
        const blur = depth < -0.5 ? Math.abs(depth) * 1.5 : 0;

        card.style.transform = `translate(${x}px, ${y}px) scale(${scale})`;
        card.style.zIndex = String(zIndex);
        card.style.opacity = String(opacity);
        card.style.filter = blur ? `blur(${blur}px)` : "none";
      });

      frameId = window.requestAnimationFrame(animateOrbit);
    }

    animateOrbit();

    return () => window.cancelAnimationFrame(frameId);
  }, [configs]);

  return (
    <div className="orbit-focal-point" aria-label="Featured event orbit">
      <div className="orbit-rings" aria-hidden="true">
        <div className="orbit-ring orbit-ring-green" />
        <div className="orbit-ring orbit-ring-red" />
        <div className="orbit-ring orbit-ring-blue" />
      </div>
      <div className="orbit-core" aria-hidden="true" />
      {events.map((event, index) => (
        <article
          key={event.id}
          ref={(node) => {
            cardRefs.current[index] = node;
          }}
          className={`orbit-card ${event.glowClass}`}
          style={getInitialOrbitStyle(index, events.length)}
        >
          <div className="timeline-connector" aria-hidden="true" />
          <p className="orbit-card-datetime">{event.dateTime}</p>
          <h2 className="orbit-card-title">{event.eventName}</h2>
          <div className="flex items-center gap-3">
            <span className="status-dot" aria-hidden="true" />
            <span className="text-xs font-semibold text-[#a1a1aa]">
              {event.status}
            </span>
          </div>
        </article>
      ))}
    </div>
  );
}

function getInitialOrbitStyle(index: number, total: number) {
  const radiusX = 180 + index * 65;
  const radiusY = radiusX * 0.55;
  const angle = index * ((Math.PI * 2) / Math.max(total, 1));
  const x = Math.cos(angle) * radiusX;
  const y = Math.sin(angle) * radiusY;
  const depth = Math.sin(angle);
  const scale = 0.85 + depth * 0.15;

  return {
    transform: `translate(${x}px, ${y}px) scale(${scale})`,
    zIndex: Math.floor(depth * 10) + 20,
    opacity: 0.5 + (depth + 1) * 0.25,
  };
}
