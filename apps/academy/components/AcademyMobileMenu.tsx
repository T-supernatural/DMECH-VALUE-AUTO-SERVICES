"use client";

import { useState } from "react";
import Link from "next/link";

type AcademyLink = readonly [string, string];

export function AcademyMobileMenu({ links }: { links: readonly AcademyLink[] }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button className="academy-menu-button" type="button" aria-expanded={open} aria-controls="academy-mobile-menu" onClick={() => setOpen((value) => !value)}>
        <span /><span /><span /><b className="academy-sr-only">Menu</b>
      </button>
      <div id="academy-mobile-menu" className={`academy-mobile-menu ${open ? "is-open" : ""}`}>
        {links.map(([href, label]) => <Link key={href} href={href} onClick={() => setOpen(false)}>{label}</Link>)}
        <Link href="/register-interest" className="academy-nav-cta" onClick={() => setOpen(false)}>Register Interest</Link>
      </div>
    </>
  );
}