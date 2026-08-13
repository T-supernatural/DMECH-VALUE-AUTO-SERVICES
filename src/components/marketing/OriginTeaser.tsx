import Link from "next/link";
import { Reveal } from "@/components/marketing/Reveal";

// Condensed version of the origin story told in full on /about — same
// "condensed section + link to the full page" pattern as TrustTeaser and
// CertifiedTeaser, rebuilt as an editorial photo/text split for Home's
// elevated treatment rather than a centered paragraph block.
export function OriginTeaser() {
  return (
    <section className="origin-section">
      <div className="origin-inner">
        <Reveal>
          <div className="origin-photo" style={{ backgroundImage: "url(/splash/01_cars_road.jpg)" }}>
            <div className="origin-photo-badge">
              <div className="origin-photo-badge-year">2016</div>
              <div className="origin-photo-badge-label">Where it started</div>
            </div>
          </div>
        </Reveal>
        <Reveal delayMs={100}>
          <div>
            <div className="origin-eyebrow">Where It Started</div>
            <div className="origin-title">A Decade On The Workshop Floor</div>
            <div className="origin-body">
              <p>
                DMECH was founded in 2016 as a mechanical diagnosis, repair, and consultation
                business. That workshop discipline — identifying what&apos;s actually wrong
                before any tool is picked up — is still where our identity is rooted.
              </p>
              <p>
                It&apos;s what made the move into high-voltage EV systems possible when most
                Nigerian workshops weren&apos;t equipped to make it.
              </p>
            </div>
            <Link href="/about" className="teaser-link" style={{ fontSize: 15 }}>
              Read Our Full Story →
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
