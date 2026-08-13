import Link from "next/link";
import { Reveal } from "@/components/marketing/Reveal";

// Numbering here is real, not decorative — it's DMECH's actual strategic
// priority order (per the company profile), not an arbitrary sequence.
const CAPABILITIES = [
  {
    index: "01",
    photo: "/splash/04-workshop.jpg",
    title: "Mechanical & Auto-Electrical Diagnostics",
    desc: "Engine, electrical, AC, suspension, brakes, and body — diagnosed properly before any repair starts. The business DMECH has run since 2016.",
    href: "/service",
    linkLabel: "Explore Services",
  },
  {
    index: "02",
    photo: "/splash/07-ev-assembly.jpg",
    title: "High-Voltage EV Workshop",
    desc: "Battery management, thermal control, and inverter/motor diagnostics — capability most Nigerian workshops simply don't have yet.",
    href: "/ev-workshop",
    linkLabel: "See Our EV Capability",
  },
  {
    index: "03",
    photo: "/splash/08-ev-battery.jpg",
    title: "Battery Certification",
    desc: "Independent state-of-health inspection for buyers, importers, lenders, and insurers — a gap no one else in Nigeria has filled.",
    href: "/ev-workshop",
    linkLabel: "Learn About Certification",
  },
];

export function CapabilityBand() {
  return (
    <section className="capability-section" style={{ background: "#fff" }}>
      <div className="section-inner">
        <Reveal>
          <div className="section-eyebrow">Since 2016</div>
          <div className="section-title" style={{ fontSize: 32 }}>
            Nigeria&apos;s Diagnostic &amp; EV Specialists
          </div>
          <div className="section-subtitle">
            A decade of mechanical and auto-electrical diagnostic discipline, now extending into
            high-voltage EV service and battery certification.
          </div>
        </Reveal>
        <div className="capability-grid">
          {CAPABILITIES.map((c, i) => (
            <Reveal key={c.title} delayMs={i * 100}>
              <Link href={c.href} className="capability-card">
                <div className="capability-card-photo" style={{ backgroundImage: `url(${c.photo})` }}>
                  <span className="capability-card-index">{c.index}</span>
                </div>
                <div className="capability-card-body">
                  <div className="capability-card-title">{c.title}</div>
                  <div className="capability-card-desc">{c.desc}</div>
                  <div className="capability-card-link">{c.linkLabel} →</div>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
