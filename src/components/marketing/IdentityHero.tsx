import Link from "next/link";
import { ArrowRight, Wrench, BatteryCharging, ShieldCheck } from "lucide-react";

const CAPSULE_ITEMS = [
  {
    icon: Wrench,
    title: "Mechanical & Auto-Electrical Diagnostics",
    desc: "Full workshop services since 2016.",
  },
  {
    icon: BatteryCharging,
    title: "High-Voltage EV Workshop",
    desc: "Battery, thermal, and inverter/motor diagnostics.",
  },
  {
    icon: ShieldCheck,
    title: "Battery Certification",
    desc: "Independent state-of-health inspection.",
  },
];

export function IdentityHero() {
  return (
    <section className="identity-hero">
      <div className="identity-hero-inner">
        <div>
          <div className="identity-hero-badge">
            <span className="identity-hero-badge-dot" />
            Nigeria&apos;s Diagnostic &amp; EV Specialists Since 2016
          </div>
          <h1>
            We Keep It <em>Running.</em>
          </h1>
          <p>
            A decade of mechanical and auto-electrical diagnostic discipline — now extending into
            high-voltage EV service and battery certification most Nigerian workshops simply
            don&apos;t have.
          </p>
          <div className="identity-hero-actions">
            <Link href="/service" className="identity-hero-cta">
              Book a Diagnostic <ArrowRight size={16} strokeWidth={2.25} />
            </Link>
            <Link href="/sales" className="identity-hero-link">
              Buy or Import a Vehicle →
            </Link>
          </div>
        </div>

        <div className="identity-hero-capsule">
          <div className="identity-hero-capsule-inner">
            <div className="identity-hero-capsule-eyebrow">What We Actually Do</div>
            {CAPSULE_ITEMS.map((item) => (
              <div className="identity-hero-capsule-item" key={item.title}>
                <span className="identity-hero-capsule-icon">
                  <item.icon size={17} strokeWidth={2} />
                </span>
                <div>
                  <div className="identity-hero-capsule-title">{item.title}</div>
                  <div className="identity-hero-capsule-desc">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
