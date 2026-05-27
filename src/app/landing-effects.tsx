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
    const hero = document.getElementById("parallax-container");
    const navbar = document.getElementById("navbar");
    const parallaxWrappers = document.querySelectorAll<HTMLElement>(".parallax-wrapper");
    const revealTargets = document.querySelectorAll<HTMLElement>(".reveal");
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    const mouse: { x?: number; y?: number; radius: number } = { radius: 150 };
    let particles: Particle[] = [];
    let frameId = 0;

    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("active");
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

    const handleParallaxMove = (event: MouseEvent) => {
      if (window.innerWidth < 968 || reducedMotion.matches) {
        return;
      }

      const x = event.clientX - window.innerWidth / 2;
      const y = event.clientY - window.innerHeight / 2;

      parallaxWrappers.forEach((wrapper) => {
        const speed = Number(wrapper.dataset.speed ?? "0");
        wrapper.style.animation = "none";
        wrapper.style.transform = `translate(${x * speed}px, ${y * speed}px)`;
      });
    };

    const resetParallax = () => {
      parallaxWrappers.forEach((wrapper) => {
        wrapper.style.transform = "translate(0px, 0px)";
      });
    };

    function initParticles() {
      if (!canvas) {
        return;
      }

      particles = [];
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      const particleCount = Math.floor((canvas.width * canvas.height) / 8000);

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
      const dx = (mouse.x ?? particle.x) - particle.x;
      const dy = (mouse.y ?? particle.y) - particle.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < mouse.radius && mouse.x !== undefined && distance > 0) {
        const force = (mouse.radius - distance) / mouse.radius;
        particle.x += (dx / distance) * force * particle.density;
        particle.y += (dy / distance) * force * particle.density;
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
        if (reducedMotion.matches) {
          drawParticle(particle);
        } else {
          updateParticle(particle);
        }
      });

      if (reducedMotion.matches) {
        return;
      }

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
    hero?.addEventListener("mousemove", handleParallaxMove);
    hero?.addEventListener("mouseleave", resetParallax);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("scroll", updateNavbar);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", clearMouse);
      window.removeEventListener("resize", handleResize);
      hero?.removeEventListener("mousemove", handleParallaxMove);
      hero?.removeEventListener("mouseleave", resetParallax);
      revealObserver.disconnect();
    };
  }, []);

  return <canvas id="particleCanvas" ref={canvasRef} aria-hidden="true" />;
}
