import Link from "next/link";

export function AcademyFooter() {
  return (
    <footer className="academy-footer">
      <div className="academy-footer-inner">
        <div><div className="academy-brand">DMECH <span>Academy</span></div><p>A working workshop is the classroom.</p></div>
        <div className="academy-footer-links"><Link href="/programmes">Programmes</Link><Link href="/register-interest">Register Interest</Link><a href="https://dmechservices.ng">Main DMECH website</a></div>
      </div>
      <div className="academy-footer-bottom">DMECH Academy · Professional automotive technician training</div>
    </footer>
  );
}
