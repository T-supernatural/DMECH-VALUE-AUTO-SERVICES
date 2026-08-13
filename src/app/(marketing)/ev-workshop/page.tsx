import type { Metadata } from "next";
import Link from "next/link";
import { Battery, Thermometer, Cpu, Wrench, ShieldCheck, FileCheck, MessageCircle } from "lucide-react";
import { Reveal } from "@/components/marketing/Reveal";
import { FaqAccordion } from "@/components/marketing/FaqAccordion";
import { whatsappHref } from "@/lib/contact";

export const metadata: Metadata = {
  title: "High-Voltage EV Workshop & Battery Certification — DMECH Services Limited",
  description:
    "DMECH's high-voltage workshop handles battery management, thermal control, and inverter/motor diagnostics for electric vehicles — plus independent battery state-of-health certification, a gap the Nigerian market doesn't have filled anywhere else.",
};

const CAPABILITIES = [
  {
    icon: Battery,
    title: "Battery Management Systems",
    desc: "Diagnosis and service of the battery management system itself — the layer that decides how a pack charges, discharges, and protects itself.",
  },
  {
    icon: Thermometer,
    title: "Thermal Management",
    desc: "EV battery packs live or die by temperature control. We service and diagnose the cooling systems that keep a pack safe and performing.",
  },
  {
    icon: Cpu,
    title: "Inverter & Motor Diagnostics",
    desc: "The electronics that turn stored energy into motion — diagnosed with the same rigour we've applied to combustion drivetrains since 2016.",
  },
  {
    icon: Wrench,
    title: "Pack-Level Intervention",
    desc: "Where most Nigerian workshops stop at 'replace the whole pack,' we go in at the module and cell level first.",
  },
];

const EV_FAQS = [
  {
    q: "Why can't a normal mechanic service an EV?",
    a: "An EV is an electrical and thermal problem, not a mechanical one. High-voltage battery systems, thermal management, and inverter/motor diagnostics require tooling, training, and safety protocols that don't exist in a general workshop — there's currently no established parts channel or technician training pipeline for this in Nigeria.",
  },
  {
    q: "What does a battery state-of-health inspection actually check?",
    a: "We assess the battery pack's real remaining capacity and condition against its original specification, not just whether it powers on — the same kind of independent check a combustion vehicle gets for accident history and mileage, applied to the part of an EV that actually determines its value.",
  },
  {
    q: "Who is battery certification for?",
    a: "Anyone buying, financing, or insuring a used EV in Nigeria today has no independent way to verify battery condition before committing. That includes individual buyers, importers, lenders, and insurers.",
  },
  {
    q: "Do you only service vehicles DMECH imported?",
    a: "No — our high-voltage workshop and battery certification are open to any EV, whether or not you bought it from us.",
  },
];

export default function EvWorkshopPage() {
  return (
    <div className="page-fade">
      <section className="section photo-banner pb-ev center">
        <div className="section-inner">
          <div className="section-eyebrow">High-Voltage Capability</div>
          <div className="section-title">EV Service Built On A Decade Of Diagnostics</div>
          <div className="section-subtitle" style={{ margin: "0 auto" }}>
            High-voltage battery systems, thermal management, and inverter/motor diagnostics —
            the capability most Nigerian workshops simply don&apos;t have. We built it by
            extending ten years of mechanical and auto-electrical diagnostic discipline into
            electric vehicles.
          </div>
        </div>
      </section>

      <section className="section" style={{ background: "#fff" }}>
        <div className="section-inner">
          <Reveal>
            <div className="section-eyebrow">Why EVs Are Different</div>
            <div className="section-title">An Electrical Problem, Not A Mechanical One</div>
            <div className="section-subtitle" style={{ maxWidth: 680 }}>
              A combustion fault is mechanical — worn parts, leaks, timing. An EV fault usually
              isn&apos;t. High-voltage battery packs, thermal control, and motor/inverter
              electronics need diagnostic tooling and safety training that a general workshop was
              never built for. That gap is exactly where DMECH has invested.
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section">
        <div className="section-inner">
          <div className="section-eyebrow" style={{ textAlign: "center" }}>Our High-Voltage Capability</div>
          <div className="section-title" style={{ textAlign: "center", fontSize: 26 }}>
            What We Actually Do
          </div>
          <div className="trust-grid" style={{ marginTop: 24 }}>
            {CAPABILITIES.map((c, i) => (
              <Reveal key={c.title} delayMs={i * 80}>
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

      <section className="section photo-banner pb-battery center" style={{ padding: "48px 20px" }}>
        <div className="section-inner">
          <div className="section-eyebrow">Battery Certification &amp; Inspection</div>
          <div className="section-title" style={{ fontSize: 26 }}>A Market Gap With No One Else In It</div>
        </div>
      </section>

      <section className="section" style={{ background: "#fff" }}>
        <div className="section-inner">
          <Reveal>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40, alignItems: "center" }}>
            <div>
              <p style={{ color: "var(--muted)", lineHeight: 1.7, marginBottom: 20 }}>
                There is currently no recognised independent EV battery certifier in Nigeria — no
                published protocol, no standard an importer, insurer, or lender can rely on. A
                DMECH battery state-of-health inspection assesses a pack&apos;s real remaining
                capacity and condition, not just whether it powers on — giving buyers, lenders,
                and insurers something to actually price risk against.
              </p>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <a
                  className="v-card-btn btn-primary"
                  style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}
                  href={whatsappHref("Hi DMECH, I'd like to ask about EV battery certification.")}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle size={16} strokeWidth={2} /> Ask on WhatsApp
                </a>
                <Link href="/service/ev-service" className="v-card-btn btn-outline" style={{ textDecoration: "none" }}>
                  Book an EV Diagnostic
                </Link>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div className="trust-card">
                <div className="trust-icon">
                  <FileCheck size={24} strokeWidth={1.75} />
                </div>
                <div className="trust-title">Who It&apos;s For</div>
                <div className="trust-desc">
                  Individual buyers, importers sourcing EVs from abroad, lenders financing them,
                  and insurers pricing coverage on them.
                </div>
              </div>
              <div className="trust-card">
                <div className="trust-icon">
                  <ShieldCheck size={24} strokeWidth={1.75} />
                </div>
                <div className="trust-title">Independent By Design</div>
                <div className="trust-desc">
                  A certification is only worth something if it isn&apos;t just the seller
                  grading their own vehicle.
                </div>
              </div>
            </div>
          </div>
          </Reveal>
        </div>
      </section>

      <section className="section">
        <div className="section-inner">
          <Reveal>
            <div className="section-eyebrow">EV Workshop FAQ</div>
            <div className="section-title">Common Questions</div>
            <FaqAccordion items={EV_FAQS} />
          </Reveal>
        </div>
      </section>
    </div>
  );
}
