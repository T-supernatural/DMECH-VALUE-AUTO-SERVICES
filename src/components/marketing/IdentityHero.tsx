import Link from "next/link";
import { Wrench, BatteryCharging, ShieldCheck } from "lucide-react";

// Home's hero — identity-led, no calculator (that lives on /sales now).
// Reuses the .hero two-column treatment (headlight glow, badge, big
// headline) but with a workshop photo instead of the cars-on-road one, and
// a capability checklist card instead of the calculator on the right.
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
    <section className="hero hero-workshop">
      <div className="hero-headlights" aria-hidden="true">
        <span className="hero-headlight-glow hl-1" />
        <span className="hero-headlight-glow hl-2" />
      </div>
      <div className="hero-inner">
        <div>
          <div className="hero-badge">
            <span className="pulse" /> Since 2016
          </div>
          <h1>
            We Keep It <span>Running.</span>
          </h1>
          <p>
            A decade of mechanical and auto-electrical diagnostic discipline — now extending into
            high-voltage EV service and battery certification most Nigerian workshops simply
            don&apos;t have.
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Link
              href="/service"
              className="calc-btn"
              style={{ maxWidth: 220, display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none" }}
            >
              Book a Diagnostic
            </Link>
            <Link
              href="/sales"
              style={{
                display: "flex",
                alignItems: "center",
                color: "#7DD3FC",
                fontSize: 14,
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              Buy or Import a Vehicle →
            </Link>
          </div>
        </div>
        <div className="hero-capsule">
          <div className="hero-capsule-eyebrow">What We Actually Do</div>
          {CAPSULE_ITEMS.map((item) => (
            <div className="hero-capsule-item" key={item.title}>
              <span className="hero-capsule-item-icon">
                <item.icon size={18} strokeWidth={2} />
              </span>
              <div>
                <div className="hero-capsule-item-title">{item.title}</div>
                <div className="hero-capsule-item-desc">{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
