import Link from "next/link";
import Image from "next/image";
import { AcademyMobileMenu } from "./AcademyMobileMenu";

const LINKS = [
  ["/programmes", "Programmes"],
  ["/technician-standard", "Technician Standard"],
  ["/how-its-taught", "How It’s Taught"],
  ["/corporate-training", "Corporate Training"],
] as const;

export function AcademyNav() {
  return (
    <header className="academy-nav-wrap">
      <nav className="academy-nav" aria-label="Academy navigation">
        <Link href="/" className="academy-brand"><Image className="academy-brand-mark" src="/favicon.ico" alt="DMECH Academy" width={48} height={48} priority unoptimized /><span>Academy</span></Link>
        <div className="academy-nav-links">
          {LINKS.map(([href, label]) => <Link key={href} href={href}>{label}</Link>)}
          <Link href="/register-interest" className="academy-nav-cta">Register Interest</Link>
        </div>
        <AcademyMobileMenu links={LINKS} />
      </nav>
    </header>
  );
}
