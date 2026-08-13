import Link from "next/link";
import { Zap, Leaf, PiggyBank, Wrench, Lightbulb } from "lucide-react";
import { Reveal } from "@/components/marketing/Reveal";

export function EVSpotlight() {
  return (
    <section className="section dark-gradient glow-green" id="ev">
      <div className="section-inner" style={{ position: "relative" }}>
        <Reveal>
          <div
            className="section-eyebrow"
            style={{ color: "#4ADE80", display: "flex", alignItems: "center", gap: 6 }}
          >
            <Zap size={13} strokeWidth={2.5} /> Electric Vehicles
          </div>
          <div className="section-title" style={{ color: "#fff" }}>
            Go Electric, Pay Less Tax
          </div>
          <div className="section-subtitle" style={{ color: "#8BADC0" }}>
            EVs are the smartest import play in Nigeria right now. Lower duties, Green Tax
            exemption, and no fuel queues. DMECH sources them from the USA and China — and
            services them too.
          </div>
        </Reveal>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3,1fr)",
            gap: 20,
            marginBottom: 32,
          }}
          className="ev-benefits"
        >
          {[
            {
              icon: Leaf,
              title: "Green Tax Exempt",
              body: "Every EV is 100% exempt from the Green Tax Surcharge, and attracts a reduced 10% import duty instead of 20%. The savings are real and immediate.",
            },
            {
              icon: PiggyBank,
              title: "No Fuel, Lower Running Cost",
              body: "Skip the fuel queues and the pump price. Charge at home or at work. For high-mileage drivers, the running-cost savings add up fast.",
            },
            {
              icon: Wrench,
              title: "Real High-Voltage Capability",
              body: "EV support in Nigeria is thin — DMECH built it from a decade of diagnostic discipline. Battery management, thermal control, and inverter/motor diagnostics, not just duty savings.",
            },
          ].map((card, i) => (
            <Reveal key={card.title} delayMs={i * 80}>
              <div
                style={{
                  background: "rgba(255,255,255,.04)",
                  border: "1px solid rgba(34,197,94,.2)",
                  borderRadius: 14,
                  padding: 24,
                }}
              >
                <div style={{ color: "#4ADE80", marginBottom: 10 }}>
                  <card.icon size={28} strokeWidth={1.75} />
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-heading)",
                    fontSize: 17,
                    fontWeight: 700,
                    color: "#fff",
                    marginBottom: 8,
                  }}
                >
                  {card.title}
                </div>
                <div style={{ fontSize: 14, color: "#8BADC0", lineHeight: 1.6 }}>{card.body}</div>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delayMs={240}>
          <div
            style={{
              background: "rgba(245,158,11,.08)",
              border: "1px solid rgba(245,158,11,.2)",
              borderRadius: 12,
              padding: "18px 22px",
              display: "flex",
              gap: 14,
              alignItems: "flex-start",
            }}
          >
            <span style={{ color: "#F5A623", flexShrink: 0, display: "flex" }}>
              <Lightbulb size={22} strokeWidth={1.75} />
            </span>
            <div style={{ fontSize: 13, color: "#C0D0E0", lineHeight: 1.6 }}>
              <strong style={{ color: "#F5A623" }}>Straight talk on charging:</strong> Public
              charging in Nigeria is still limited, so EVs work best if you can charge at home or
              at your office. We&apos;ll help you assess whether an EV fits your daily routine
              before you commit — and we advise on home charging setup. If an EV isn&apos;t right
              for you yet, we&apos;ll tell you honestly and recommend a hybrid or efficient petrol
              option instead.
            </div>
          </div>
        </Reveal>

        <div style={{ textAlign: "center", marginTop: 28, display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
          <Link
            href="/vehicles?filter=ev"
            className="calc-btn"
            style={{
              maxWidth: 280,
              margin: "0 auto",
              background: "#22C55E",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            Browse EV Inventory <Zap size={16} strokeWidth={2.5} />
          </Link>
          <Link href="/ev-workshop" style={{ color: "#7DD3FC", fontSize: 13, fontWeight: 600, textDecoration: "none" }}>
            See our high-voltage workshop &amp; battery certification →
          </Link>
        </div>
      </div>
    </section>
  );
}
