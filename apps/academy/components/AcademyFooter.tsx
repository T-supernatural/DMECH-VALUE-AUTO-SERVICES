import Image from "next/image";
import Link from "next/link";

export function AcademyFooter() {
  return (
    <footer className="academy-footer" aria-label="Academy footer">
      <div className="academy-footer-inner">
        <div className="academy-footer-intro">
          <div className="academy-footer-brand">
            <a href="https://dmechservices.ng"><Image className="academy-footer-logo" src="/logo.png" alt="DMECH Services Limited" width={160} height={62} /></a>
            <strong>Academy</strong>
          </div>
          <p>A working workshop is the classroom.</p>
        </div>
        <nav className="academy-footer-links" aria-label="Academy footer navigation">
          <Link href="/programmes">Programmes</Link>
          <Link href="/technician-standard">Technician Standard</Link>
          <Link href="/how-its-taught">How It&apos;s Taught</Link>
          <Link href="/corporate-training">Corporate Training</Link>
          <Link href="/register-interest">Register Interest</Link>
          <a href="https://dmechservices.ng">Main DMECH website</a>
        </nav>
      </div>
      <div className="academy-footer-bottom">DMECH Academy · Professional automotive technician training</div>
    </footer>
  );
}
