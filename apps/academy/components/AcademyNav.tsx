import Link from "next/link";
import Image from "next/image";
import { AcademyMobileMenu } from "./AcademyMobileMenu";

const LINKS = [
  ["/", "Home"],
  ["/programmes", "Programmes"],
  ["/technician-standard", "Technician Standard"],
  ["/how-its-taught", "How It’s Taught"],
  ["/corporate-training", "Corporate Training"],
] as const;

export function AcademyNav() {
  return (
    <header className="academy-nav-wrap">
      <nav className="academy-nav" aria-label="Academy navigation">
        <a href="https://dmechservices.ng" className="academy-brand"><Image className="academy-brand-logo" src="/logo.png" alt="DMECH Services Limited" width={96} height={38} priority unoptimized /></a>
        <div className="academy-nav-links">
          {LINKS.map(([href, label]) => <Link key={href} href={href}>{label}</Link>)}
          <Link href="/register-interest" className="academy-nav-cta">Register Interest</Link>
        </div>
        <AcademyMobileMenu links={LINKS} />
      </nav>
    </header>
  );
}
