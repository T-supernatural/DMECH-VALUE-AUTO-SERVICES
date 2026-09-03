"use client";

import { Fragment, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/Logo";

const NAV_GROUPS = [
  { label: "Services", links: [{ href: "/service", label: "All Services" }, { href: "/ev-workshop", label: "EV & Battery" }, { href: "/fleet", label: "Fleet" }] },
  { label: "Vehicles", links: [{ href: "/sales", label: "Buy a Vehicle" }, { href: "/vehicles/sourcing", label: "Reserve From Abroad" }] },
  { label: "Workshop", links: [{ href: "/workshop", label: "The Workshop" }] },
  { label: "About", links: [{ href: "/about", label: "Why DMECH" }, { href: "/faq", label: "FAQ" }] },
] as const;

const LINKS = NAV_GROUPS.flatMap((group) => group.links);
const ACADEMY_URL = "https://training.dmechservices.ng";

function activeHref(pathname: string): string | null {
  const matches = LINKS.filter((link) => pathname === link.href || pathname.startsWith(`${link.href}/`));
  return matches.length ? matches.reduce((longest, link) => link.href.length > longest.length ? link.href : longest, matches[0].href) : null;
}

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
  const pathname = usePathname();
  const active = activeHref(pathname);
  useEffect(() => { const onScroll = () => setScrolled(window.scrollY > 20); window.addEventListener("scroll", onScroll); return () => window.removeEventListener("scroll", onScroll); }, []);
  const navigateToTop = () => { setDropdownOpen(null); setMenuOpen(false); window.scrollTo({ top: 0, left: 0, behavior: "auto" }); };
  return <><nav className={scrolled ? "scrolled" : ""}><div className="nav-inner"><a href="/"><Logo variant="nav" /></a><div className="nav-links">{NAV_GROUPS.map((group) => <Fragment key={group.label}><div className="nav-group"><button type="button" className={group.links.some((link) => active === link.href) ? "active" : ""} aria-expanded={dropdownOpen === group.label} onClick={() => setDropdownOpen((open) => open === group.label ? null : group.label)}>{group.label}<span aria-hidden="true">⌄</span></button><div className={`nav-dropdown ${dropdownOpen === group.label ? "open" : ""}`}>{group.links.map((link) => <Link key={link.href} href={link.href} className={active === link.href ? "active" : ""} onClick={navigateToTop}>{link.label}</Link>)}</div></div>{group.label === "Workshop" && <a className="nav-academy-link" href={ACADEMY_URL}>Academy</a>}</Fragment>)}<Link href="/account" className="nav-cta" onClick={navigateToTop}>Get Started</Link></div><button className="nav-toggle" aria-label="Toggle menu" onClick={() => setMenuOpen((open) => !open)}><span /><span /><span /></button></div></nav><div className={`mobile-menu ${menuOpen ? "open" : ""}`}>{NAV_GROUPS.map((group) => <Fragment key={group.label}><div className="mobile-nav-group"><div className="mobile-nav-group-label">{group.label}</div>{group.links.map((link) => <Link key={link.href} href={link.href} className={active === link.href ? "active" : ""} onClick={navigateToTop}>{link.label}</Link>)}</div>{group.label === "Workshop" && <a className="mobile-nav-academy" href={ACADEMY_URL} onClick={() => setMenuOpen(false)}>Academy</a>}</Fragment>)}<Link href="/account" onClick={navigateToTop}>Get Started</Link></div></>;
}
