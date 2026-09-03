"use client";

import { useState } from "react";
import Link from "next/link";

const LINKS = [
  ["/programmes", "Programmes"],
  ["/technician-standard", "Technician Standard"],
  ["/how-its-taught", "How It’s Taught"],
  ["/corporate-training", "Corporate Training"],
] as const;

export function AcademyNav() {
  const [open, setOpen] = useState(false);
  return (
    <header className="academy-nav-wrap">
      <nav className="academy-nav" aria-label="Academy navigation">
        <Link href="/" className="academy-brand">DMECH <span>Academy</span></Link>
        <div className="academy-nav-links">
          {LINKS.map(([href, label]) => <Link key={href} href={href}>{label}</Link>)}
          <Link href="/register-interest" className="academy-nav-cta">Register Interest</Link>
        </div>
        <button className="academy-menu-button" type="button" aria-expanded={open} aria-controls="academy-mobile-menu" onClick={() => setOpen((value) => !value)}>
          <span /><span /><span /><b className="academy-sr-only">Menu</b>
        </button>
      </nav>
      <div id="academy-mobile-menu" className={`academy-mobile-menu ${open ? "is-open" : ""}`}>
        {LINKS.map(([href, label]) => <Link key={href} href={href} onClick={() => setOpen(false)}>{label}</Link>)}
        <Link href="/register-interest" className="academy-nav-cta" onClick={() => setOpen(false)}>Register Interest</Link>
      </div>
    </header>
  );
}
