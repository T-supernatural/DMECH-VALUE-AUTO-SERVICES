"use client";

import { useEffect, useRef, useState } from "react";
import { Zap } from "lucide-react";

type Item = { text: string; orange?: boolean };

const FALLBACK: Item[] = [
  { text: "New: Certified Nigerian-used vehicles now available", orange: false },
  { text: "3 Vehicles Cleared Customs This Week", orange: true },
  { text: "🇨🇳 Now Importing from China — New Cars & EVs", orange: false },
  { text: "Import Duties Reduced — Save More in 2026", orange: true },
  { text: "EVs: 10% Duty, Zero Green Tax — Ask Us How", orange: false },
  { text: "Chery Tiggo 7 Pro 2024 — Brand New In Stock", orange: true },
  { text: "Financing Available — Pay While Shipping", orange: false },
  { text: "DMECH Certified — Verified History, Real Warranty", orange: true },
];

export function Ticker() {
  const [items, setItems] = useState<Item[]>(FALLBACK);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const offsetRef = useRef(0);
  const pausedRef = useRef(false);

  useEffect(() => {
    let mounted = true;
    fetch("/api/marketing/ticker")
      .then((r) => r.json())
      .then((data: Item[]) => {
        if (!mounted) return;
        if (Array.isArray(data) && data.length > 0) setItems(data);
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return; // leave CSS fallback for reduced motion

    const track = trackRef.current;
    const container = containerRef.current;
    if (!track || !container) return;

    // JS marquee: duplicate content for seamless loop
    const speed = 0.03; // px per ms

    function step() {
      if (pausedRef.current) {
        rafRef.current = requestAnimationFrame(step);
        return;
      }
      // `track` is narrowed non-null above, but that narrowing doesn't
      // persist into this nested function declaration for TypeScript's
      // control-flow analysis -- it's a stable `const` DOM ref, so a
      // non-null assertion here is safe, not a real possible-null case.
      const width = track!.scrollWidth / 2; // because we'll duplicate
      offsetRef.current += speed * 16; // assume ~60fps step
      if (offsetRef.current >= width) offsetRef.current -= width;
      track!.style.transform = `translateX(${-offsetRef.current}px)`;
      rafRef.current = requestAnimationFrame(step);
    }

    // ensure track is displayed as flex and duplicated
    const children = Array.from(track.children);
    // duplicate if not already duplicated
    if (children.length > 0) {
      // ensure two copies
      const existingLen = children.length;
      if (existingLen < items.length * 2) {
        const clone = track.innerHTML;
        track.innerHTML = clone + clone;
      }
    }

    rafRef.current = requestAnimationFrame(step);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [items]);

  return (
    <div
      className="ticker"
      ref={containerRef}
      onMouseEnter={() => (pausedRef.current = true)}
      onMouseLeave={() => (pausedRef.current = false)}
    >
      <div className="ticker-track" ref={trackRef} style={{ display: "flex", animation: "none" }}>
        {[...items, ...items].map((item, i) => (
          <span className="ticker-item" key={i}>
            <span className={`ticker-dot ${item.orange ? "orange" : ""}`} />
            {item.text}
          </span>
        ))}
      </div>
    </div>
  );
}
