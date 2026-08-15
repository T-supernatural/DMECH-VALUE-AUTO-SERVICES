import type { Metadata } from "next";
import Link from "next/link";
import { Search, Gauge, BadgeCheck, Handshake, Rocket, Wrench, PackageSearch, Truck, Car, Lightbulb } from "lucide-react";
import { HowItWorks } from "@/components/marketing/HowItWorks";
import { Trust } from "@/components/marketing/Trust";
import { Testimonials } from "@/components/marketing/Testimonials";
import { Reveal } from "@/components/marketing/Reveal";

export const metadata: Metadata = {
  title: "About Us — DMECH Services Limited",
  description:
    "Ten years of mechanical and auto-electrical diagnostic expertise since 2016, now extending into high-voltage EV service, battery certification, and vehicle import.",
};

const COMMITMENTS = [
  {
    icon: Search,
    title: "Diagnose, Don't Guess",
    desc: "Evidence before intervention. We do not replace a part to find out whether it was the part. If we cannot show you the reading, we have not finished the diagnosis.",
  },
  {
    icon: Gauge,
    title: "Torque To Spec",
    desc: "Manufacturer specification is the floor, not the ceiling. Shortcuts are not efficiency — they are deferred failures with our name on them.",
  },
  {
    icon: BadgeCheck,
    title: "Genuine Or Nothing",
    desc: "Verified parts, traceable to source. Where a genuine part is unavailable we say so, name the alternative, and let you decide.",
  },
  {
    icon: Handshake,
    title: "Own The Outcome",
    desc: "We warrant our workmanship. If it comes back, it comes back to us, and we carry it. Accountability is the product.",
  },
  {
    icon: Rocket,
    title: "Forward Drive",
    desc: "The vehicle parc is changing — hybrids, EVs, telematics, connected diagnostics. We invest ahead of the curve so our clients never have to catch up alone.",
  },
];

const DIVISIONS = [
  {
    icon: Wrench,
    title: "DMECH Service",
    tag: "Repair & maintenance",
    desc: "Computerised diagnostics, mechanical and electrical repair, and scheduled maintenance. Written diagnosis and fixed quotation before any work begins.",
    href: "/service",
  },
  {
    icon: PackageSearch,
    title: "DMECH Parts",
    tag: "Supply & import",
    desc: "Genuine parts and accessories with traceable sourcing, direct international import, and trade supply to workshops.",
  },
  {
    icon: Truck,
    title: "DMECH Fleet",
    tag: "Corporate contracts",
    desc: "SLA-backed maintenance contracts for corporate, institutional, and logistics fleets, with monthly uptime and cost reporting.",
    href: "/fleet",
  },
  {
    icon: Car,
    title: "DMECH Motors",
    tag: "Sourcing & sales",
    desc: "Vehicle sourcing, sales, and import — new, foreign-used, and locally-used — with independent pre-purchase inspection.",
    href: "/sales",
  },
  {
    icon: Lightbulb,
    title: "DMECH Advisory",
    tag: "Consultancy",
    desc: "Fleet policy and lifecycle strategy, maintenance-cost audits, and readiness assessment for EV, hybrid, and telematics adoption.",
    href: "/contact",
  },
];

export default function AboutPage() {
  return (
    <div className="page-fade">
      <section className="section photo-banner pb-workshop center">
        <div className="section-inner">
          <div className="section-eyebrow">About DMECH</div>
          <div className="section-title">Ten Years Of Diagnostic Discipline</div>
          <div className="section-subtitle" style={{ margin: "0 auto" }}>
            Founded in 2016 as a mechanical diagnosis and repair workshop — that discipline is
            still where everything else we do is rooted.
          </div>
        </div>
      </section>

      <section className="section" style={{ background: "#fff" }}>
        <div className="section-inner">
          <Reveal>
            <div className="section-eyebrow">Where It Started</div>
            <div className="section-title">Built On The Workshop Floor</div>
            <p style={{ color: "var(--muted)", lineHeight: 1.7, maxWidth: 720, marginBottom: 16 }}>
              DMECH was founded in 2016 as a mechanical diagnosis, repair, and consultation
              business. A decade later, that foundation — hands-on automotive troubleshooting,
              workshop discipline, and the ability to identify what is actually wrong with a
              vehicle before any tool is picked up — is still where our identity is rooted.
              Diagnosis and consultation remain central to what we do: full-spectrum mechanical
              and auto-electrical services, engine repair, suspension, brakes, AC systems, body
              and paint, and routine maintenance, alongside the diagnostic capability that
              underpins everything else.
            </p>
            <p style={{ color: "var(--muted)", lineHeight: 1.7, maxWidth: 720 }}>
              That diagnostic rigour is what made the next step possible. When petrol repriced
              permanently above ₦1,200 per litre and electric vehicles began arriving in Nigeria
              with no one able to service them, DMECH already had the workshop culture, the
              technical discipline, and the automotive instinct to move into high-voltage EV
              systems — a transition most Nigerian workshops aren&apos;t equipped to make.{" "}
              <Link href="/ev-workshop" style={{ color: "var(--blue)", fontWeight: 600 }}>
                See our EV &amp; battery capability →
              </Link>
            </p>
          </Reveal>
        </div>
      </section>

      <section className="section" style={{ background: "#fff" }}>
        <div className="section-inner">
          <div className="section-eyebrow" style={{ textAlign: "center" }}>
            What Makes Us Different
          </div>
          <div className="section-title" style={{ textAlign: "center", fontSize: 26 }}>
            The Five Commitments Behind Every Job
          </div>
          <div className="section-subtitle" style={{ textAlign: "center", margin: "0 auto" }}>
            Every repair should begin with evidence, not assumption. Everything below follows from
            that.
          </div>
          <div className="trust-grid cols-5" style={{ marginTop: 24 }}>
            {COMMITMENTS.map((c, i) => (
              <Reveal key={c.title} delayMs={i * 70}>
                <div className="trust-card">
                  <div className="trust-icon">
                    <c.icon size={24} strokeWidth={1.75} />
                  </div>
                  <div className="trust-title">{c.title}</div>
                  <div className="trust-desc">{c.desc}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-inner">
          <div className="section-eyebrow" style={{ textAlign: "center" }}>
            Five Divisions, One Accountable Partner
          </div>
          <div className="section-title" style={{ textAlign: "center", fontSize: 26 }}>
            What We Do
          </div>
          <div className="section-subtitle" style={{ textAlign: "center", margin: "0 auto" }}>
            One accountable partner across the full life of a vehicle — from the inspection before
            you buy it to the strategy that decides when you replace it.
          </div>
          <div className="trust-grid cols-5" style={{ marginTop: 24 }}>
            {DIVISIONS.map((d, i) => {
              const card = (
                <div className="trust-card">
                  <div className="trust-icon">
                    <d.icon size={24} strokeWidth={1.75} />
                  </div>
                  <div className="trust-title">{d.title}</div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "var(--blue)", marginBottom: 8 }}>
                    {d.tag}
                  </div>
                  <div className="trust-desc">{d.desc}</div>
                </div>
              );
              return (
                <Reveal key={d.title} delayMs={i * 70}>
                  {d.href ? (
                    <Link href={d.href} style={{ textDecoration: "none", color: "inherit", display: "block" }}>
                      {card}
                    </Link>
                  ) : (
                    card
                  )}
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <HowItWorks />
      <Trust />

      <section className="section" style={{ background: "#fff" }}>
        <div className="section-inner">
          <Reveal>
            <div className="section-eyebrow">The Bigger Picture</div>
            <div className="section-title">Building Nigeria&apos;s EV Future</div>
            <p style={{ color: "var(--muted)", lineHeight: 1.7, maxWidth: 720 }}>
              DMECH&apos;s founder is also co-founder of{" "}
              <a href="https://www.mobigrid.com.ng" target="_blank" rel="noopener noreferrer" style={{ color: "var(--blue)", fontWeight: 600 }}>
                MOBIGRID
              </a>
              , a joint venture building Nigeria&apos;s first vertically integrated electric
              mobility ecosystem, launching in Abuja. DMECH provides the high-voltage
              diagnostic capability, technical training, and battery certification that
              MOBIGRID&apos;s fleet depends on to run.
            </p>
          </Reveal>
        </div>
      </section>

      <Reveal>
        <Testimonials />
      </Reveal>
    </div>
  );
}
