"use client";

import { useEffect, useRef } from "react";

export const ParallaxHero: React.FC = () => {
  const bgRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!bgRef.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const offset = (rect.top + rect.height / 2 - window.innerHeight / 2) * 0.3;
      bgRef.current.style.transform = `translateY(${offset}px)`;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative h-52 rounded-geist overflow-hidden flex items-center justify-center"
    >
      <div
        ref={bgRef}
        className="absolute inset-0 scale-125"
        style={{
          background:
            "radial-gradient(ellipse at 25% 60%, #6366f1 0%, #0ea5e9 45%, #10b981 100%)",
        }}
      />
      <p className="relative z-10 text-white font-bold text-2xl drop-shadow-lg select-none">
        Role a página ↕ para ver o parallax
      </p>
    </div>
  );
};
