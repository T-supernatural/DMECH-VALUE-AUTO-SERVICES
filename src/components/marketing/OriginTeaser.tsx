import Link from "next/link";
import { Reveal } from "@/components/marketing/Reveal";

// Condensed version of the origin story told in full on /about — same
// "condensed section + link to the full page" pattern as TrustTeaser and
// CertifiedTeaser.
export function OriginTeaser() {
  return (
    <section className="section" style={{ background: "#fff" }}>
      <div className="section-inner">
        <Reveal>
          <div className="section-eyebrow">Where It Started</div>
          <div className="section-title">A Decade On The Workshop Floor</div>
          <p style={{ color: "var(--muted)", lineHeight: 1.7, maxWidth: 680, marginBottom: 16 }}>
            DMECH was founded in 2016 as a mechanical diagnosis, repair, and consultation
            business. That workshop discipline — identifying what&apos;s actually wrong before
            any tool is picked up — is still where our identity is rooted, and it&apos;s what
            made the move into high-voltage EV systems possible when most Nigerian workshops
            weren&apos;t equipped to make it.
          </p>
          <Link href="/about" className="teaser-link" style={{ fontSize: 15 }}>
            Read Our Full Story →
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
