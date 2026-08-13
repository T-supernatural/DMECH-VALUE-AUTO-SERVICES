import Link from "next/link";
import { Wrench, BatteryCharging, ShieldCheck } from "lucide-react";
import { Reveal } from "@/components/marketing/Reveal";

// Sits right after the calculator-led Hero to establish who DMECH actually
// is before the vehicle-shopping content starts: a decade-old diagnostic
// and workshop business, not primarily an import company. Vehicle import is
// real (and gets its own strong sections further down) but isn't the lead.
const CAPABILITIES = [
  {
    icon: Wrench,
    title: "Mechanical & Auto-Electrical Diagnostics",
    desc: "Engine, electrical, AC, suspension, brakes, and body — diagnosed properly before any repair starts. The business DMECH has run since 2016.",
    href: "/service",
  },
  {
    icon: BatteryCharging,
    title: "High-Voltage EV Workshop",
    desc: "Battery management, thermal control, and inverter/motor diagnostics — capability most Nigerian workshops simply don't have yet.",
    href: "/ev-workshop",
  },
  {
    icon: ShieldCheck,
    title: "Battery Certification",
    desc: "Independent state-of-health inspection for buyers, importers, lenders, and insurers — a gap no one else in Nigeria has filled.",
    href: "/ev-workshop",
  },
];

export function CapabilityBand() {
  return (
    <section className="section" style={{ background: "#fff", paddingTop: 40, paddingBottom: 40 }}>
      <div className="section-inner">
        <Reveal>
          <div className="section-eyebrow">Since 2016</div>
          <div className="section-title" style={{ fontSize: 26 }}>
            Nigeria&apos;s Diagnostic &amp; EV Specialists
          </div>
          <div className="section-subtitle">
            A decade of mechanical and auto-electrical diagnostic discipline, now extending into
            high-voltage EV service and battery certification.
          </div>
        </Reveal>
        <div className="trust-grid">
          {CAPABILITIES.map((c, i) => (
            <Reveal key={c.title} delayMs={i * 80}>
              <Link href={c.href} className="teaser-card" style={{ display: "block", textDecoration: "none", color: "inherit" }}>
                <div className="trust-icon">
                  <c.icon size={24} strokeWidth={1.75} />
                </div>
                <div className="trust-title">{c.title}</div>
                <div className="trust-desc">{c.desc}</div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
