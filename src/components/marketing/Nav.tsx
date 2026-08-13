"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/Logo";

// "Certified" is deliberately not a flat top-level link — DMECH Certified
// Nigerian-Used vehicles are still vehicles (lives at /vehicles/certified),
// not a separate destination competing with "Vehicles" in the nav; it's
// surfaced instead via the Home page and Footer. "Reserve From Abroad" gets
// its own top-level link though — it's a genuinely different offering
// (reserving a specific vehicle DMECH doesn't own yet) rather than a filter
// on existing inventory, so it needs to be findable on its own.
//
// Order matters here: Services and EV & Battery lead because that's DMECH's
// actual strategic weight (a decade-old diagnostic/workshop business now
// extending into high-voltage EV capability) — vehicle import is real but
// deliberately not the lead story. Previously Vehicles led; that inverted
// the company's own stated priority.
const LINKS = [
  { href: "/service", label: "Services" },
  { href: "/ev-workshop", label: "EV & Battery" },
  { href: "/vehicles", label: "Vehicles" },
  { href: "/vehicles/sourcing", label: "Reserve From Abroad" },
  { href: "/financing", label: "Financing" },
  { href: "/about", label: "About" },
  { href: "/faq", label: "FAQ" },
];

// Picks the single most specific matching link (longest href prefix) so
// "/vehicles/sourcing" doesn't also light up the plain "Vehicles" link now
// that both share the /vehicles/ path prefix.
function activeHref(pathname: string): string | null {
  const matches = LINKS.filter((l) => pathname === l.href || pathname.startsWith(`${l.href}/`));
  if (matches.length === 0) return null;
  return matches.reduce((longest, l) => (l.href.length > longest.length ? l.href : longest), matches[0].href);
}

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const active = activeHref(pathname);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <nav className={scrolled ? "scrolled" : ""}>
        <div className="nav-inner">
          {/* Plain <a>, not <Link> — a real navigation (not client-side
              routing) so MarketingSplash actually replays. The layout that
              renders the splash persists across Link clicks, so only a
              real page load remounts it. */}
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a href="/">
            <Logo variant="nav" />
          </a>
          <div className="nav-links">
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={active === link.href ? "active" : ""}
              >
                {link.label}
              </Link>
            ))}
            <Link href="/register" className="nav-cta">
              Get Started
            </Link>
          </div>
          <button
            className="nav-toggle"
            aria-label="Toggle menu"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </nav>
      <div className={`mobile-menu ${menuOpen ? "open" : ""}`}>
        {LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={pathname === link.href ? "active" : ""}
            onClick={() => setMenuOpen(false)}
          >
            {link.label}
          </Link>
        ))}
        <Link href="/register" onClick={() => setMenuOpen(false)}>
          Get Started
        </Link>
      </div>
    </>
  );
}
