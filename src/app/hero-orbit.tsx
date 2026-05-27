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

const ORBIT_SPEED_MULTIPLIER = 3;

export function HeroOrbit({ events }: HeroOrbitProps) {
  const cardRefs = useRef<Array<HTMLElement | null>>([]);
  const isPausedRef = useRef(false);
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
    const mobile = window.innerWidth < 768;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const runtimeConfigs: OrbitConfig[] = configs.map((config, index) => {
      const radiusX = (mobile ? 120 : 180) + index * (mobile ? 40 : 65);

      return {
        ...config,
        radiusX,
        radiusY: radiusX * 0.55,
        speed: config.speed * (reducedMotion ? 0.75 : ORBIT_SPEED_MULTIPLIER),
      };
    });

    let frameId = 0;

    function animateOrbit() {
      runtimeConfigs.forEach((config, index) => {
        const card = cardRefs.current[index];

        if (!card) {
          return;
        }

        if (!isPausedRef.current) {
          config.angle += config.speed;
        }

        const x = Math.cos(config.angle) * config.radiusX;
        const y = Math.sin(config.angle) * config.radiusY;
        const depth = Math.sin(config.angle);
        const scale = 0.85 + depth * 0.15;
        const opacity = 0.5 + (depth + 1) * 0.25;
        const zIndex = x < -100 && !mobile ? 15 : Math.floor(depth * 10) + 20;
        const blur = depth < -0.5 ? Math.abs(depth) * 1.5 : 0;
        const frontness = (depth + 1) / 2;

        card.style.transform = `translate(${x}px, ${y}px) scale(${scale})`;
        card.style.zIndex = String(zIndex);
        card.style.opacity = String(opacity);
        card.style.setProperty("--orbit-blur", `${blur}px`);
        card.style.setProperty("--orbit-depth", String(frontness));
      });

      frameId = window.requestAnimationFrame(animateOrbit);
    }

    animateOrbit();

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [configs]);

  return (
    <div className="orbit-focal-point" aria-label="Featured event orbit">
      <div className="orbit-rings" id="orbit-rings" aria-hidden="true">
        {events.map((event, index) => (
          <div
            className={`orbit-ring ${event.glowClass}`}
            key={`${event.id}-ring`}
            style={getRingStyle(index)}
          />
        ))}
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
          tabIndex={0}
          onPointerEnter={() => {
            isPausedRef.current = true;
          }}
          onPointerLeave={() => {
            isPausedRef.current = false;
          }}
          onFocus={() => {
            isPausedRef.current = true;
          }}
          onBlur={() => {
            isPausedRef.current = false;
          }}
        >
          <div className="timeline-connector" aria-hidden="true" />
          <div className="card-datetime">{event.dateTime}</div>
          <div className="card-title">{event.eventName}</div>
          <div className="card-footer">
            <div className="avatar-group">
              <div className="avatar-circle" />
            </div>
            <div className="avatar-count">{event.status}</div>
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
    transform: `translate(${formatOrbitNumber(x)}px, ${formatOrbitNumber(
      y,
    )}px) scale(${formatOrbitNumber(scale, 6)})`,
    zIndex: String(Math.floor(depth * 10) + 20),
    opacity: formatOrbitNumber(0.5 + (depth + 1) * 0.25, 6),
  };
}

function formatOrbitNumber(value: number, digits = 3) {
  return value.toFixed(digits).replace(/\.?0+$/, "");
}

function getRingStyle(index: number) {
  const radiusX = 180 + index * 65;

  return {
    width: `${radiusX * 2}px`,
    height: `${radiusX * 2}px`,
  };
}
