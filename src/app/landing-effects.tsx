"use client";

import { useEffect, useRef } from "react";

type Particle = {
  x: number;
  y: number;
  size: number;
  baseX: number;
  baseY: number;
  density: number;
  color: string;
};

export function LandingEffects() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const navbar = document.getElementById("navbar");
    const parallaxWrappers = document.querySelectorAll<HTMLElement>(".parallax-wrapper");
    const revealTargets = document.querySelectorAll<HTMLElement>(".reveal");
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    const mouse: { x?: number; y?: number; radius: number } = { radius: 190 };
    let particles: Particle[] = [];
    let frameId = 0;

    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("active");
            animateStatsIn(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { root: null, rootMargin: "0px", threshold: 0.15 },
    );

    revealTargets.forEach((target) => revealObserver.observe(target));

    const updateNavbar = () => {
      navbar?.classList.toggle("scrolled", window.scrollY > 50);
    };

    function animateStatValue(element: HTMLElement) {
      const target = Number(element.dataset.countTo ?? element.textContent ?? "0");

      if (!Number.isFinite(target)) {
        return;
      }

      if (reducedMotion.matches) {
        element.textContent = String(target);
        return;
      }

      const duration = 900;
      const start = performance.now();
      element.textContent = "0";

      const tick = (timestamp: number) => {
        const progress = Math.min((timestamp - start) / duration, 1);
        const eased = 1 - (1 - progress) ** 3;
        element.textContent = String(Math.round(target * eased));

        if (progress < 1) {
          window.requestAnimationFrame(tick);
        }
      };

      window.requestAnimationFrame(tick);
    }

    function animateStatsIn(target: Element) {
      const statItem = target.closest(".stat-item") ?? target;

      if (!(statItem instanceof HTMLElement)) {
        return;
      }

      statItem.querySelectorAll<HTMLElement>("[data-count-to]").forEach((element) => {
        if (element.dataset.counted === "true") {
          return;
        }

        element.dataset.counted = "true";
        animateStatValue(element);
      });
    }

    const handleParallaxMove = (event: MouseEvent) => {
      if (window.innerWidth < 968) {
        return;
      }

      const x = event.clientX - window.innerWidth / 2;
      const y = event.clientY - window.innerHeight / 2;

      parallaxWrappers.forEach((wrapper) => {
        const speed = Number(wrapper.dataset.speed ?? "0");
        const translateScale = reducedMotion.matches ? 0.35 : 1;
        wrapper.style.transform = `translate3d(${x * speed * translateScale}px, ${y * speed * translateScale}px, 0)`;
      });
    };

    const resetParallax = () => {
      parallaxWrappers.forEach((wrapper) => {
        wrapper.style.transform = "translate3d(0px, 0px, 0)";
      });
    };

    function initParticles() {
      if (!canvas) {
        return;
      }

      particles = [];
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      const particleCount = Math.floor((canvas.width * canvas.height) / 6500);

      for (let index = 0; index < particleCount; index += 1) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;

        particles.push({
          x,
          y,
          size: Math.random() * 2 + 0.5,
          baseX: x,
          baseY: y,
          density: Math.random() * 20 + 1,
          color:
            Math.random() > 0.5
              ? "rgba(212, 168, 67, 0.4)"
              : "rgba(45, 106, 79, 0.4)",
        });
      }
    }

    function drawParticle(particle: Particle) {
      if (!context) {
        return;
      }

      context.beginPath();
      context.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      context.fillStyle = particle.color;
      context.fill();
    }

    function updateParticle(particle: Particle) {
      const dx = particle.x - (mouse.x ?? particle.x);
      const dy = particle.y - (mouse.y ?? particle.y);
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < mouse.radius && mouse.x !== undefined && distance > 0) {
        const force = (mouse.radius - distance) / mouse.radius;
        const push = force * force * particle.density * (reducedMotion.matches ? 0.32 : 0.62);
        particle.x += (dx / distance) * push;
        particle.y += (dy / distance) * push;
      } else {
        particle.x -= (particle.x - particle.baseX) / 25;
        particle.y -= (particle.y - particle.baseY) / 25;
      }

      drawParticle(particle);
    }

    function animateParticles() {
      if (!canvas || !context) {
        return;
      }

      context.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((particle) => {
        updateParticle(particle);
      });

      frameId = window.requestAnimationFrame(animateParticles);
    }

    const handleMouseMove = (event: MouseEvent) => {
      mouse.x = event.clientX;
      mouse.y = event.clientY;
      handleParallaxMove(event);
    };

    const clearMouse = () => {
      mouse.x = undefined;
      mouse.y = undefined;
      resetParallax();
    };

    const handleResize = () => {
      initParticles();
      resetParallax();
    };

    updateNavbar();
    initParticles();
    animateParticles();

    window.addEventListener("scroll", updateNavbar);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", clearMouse);
    window.addEventListener("resize", handleResize);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("scroll", updateNavbar);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", clearMouse);
      window.removeEventListener("resize", handleResize);
      revealObserver.disconnect();
    };
  }, []);

  return <canvas id="particleCanvas" ref={canvasRef} aria-hidden="true" />;
}
