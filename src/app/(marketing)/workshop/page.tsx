import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Battery, CheckCircle2, ClipboardCheck, MessageCircle, Phone, Search, ShieldCheck, Wrench } from "lucide-react";
import { Reveal } from "@/components/marketing/Reveal";
import { WorkshopContactLinks } from "@/components/marketing/WorkshopContactLinks";
import { CONTACT, whatsappHref } from "@/lib/contact";

export const metadata: Metadata = {
  title: "DMECH Workshop in Ajah, Lagos | Diagnostics First",
  description: "Discover DMECH Workshop in Sangotedo, Ajah, Lagos: a diagnostic-first automotive workshop for petrol, diesel, hybrid, and full EV vehicles.",
  alternates: { canonical: "/workshop" },
  openGraph: {
    title: "DMECH Workshop in Ajah, Lagos",
    description: "Two powertrains. One procedure. See how DMECH receives, diagnoses, repairs, verifies, and hands over vehicles.",
    url: "/workshop",
    type: "website",
  },
};

const GATES = [
  ["READ", "Inspect the vehicle and use the appropriate mechanical, electrical, or powertrain checks."],
  ["REPORT", "Document the findings and explain what needs attention."],
  ["QUOTE", "Agree the repair scope before work begins."],
  ["WORK", "Carry out the approved work to the appropriate specification."],
  ["VERIFY", "Retest against the original fault and complete the handover."],
] as const;

const ZONES = [
  { icon: Search, title: "Diagnostic Bay", description: "The first stop for vehicle assessment, scan data, measurements, and fault investigation." },
  { icon: Wrench, title: "Mechanical Workshop", description: "The working space for repairs, maintenance, and the vehicle systems that keep you moving." },
  { icon: Battery, title: "Electrical / EV Area", description: "Electrical, hybrid, and EV-related work handled with the appropriate diagnostic and safety requirements." },
  { icon: ClipboardCheck, title: "Inspection & Handover", description: "Final checks, documentation, and a clear explanation before the vehicle is released." },
] as const;

const VISIT_STEPS = [
  ["01", "Check-in", "Vehicle condition and reported issue are recorded."],
  ["02", "Diagnosis", "The workshop investigates the reported issue."],
  ["03", "Approval", "The repair scope is explained and approved."],
  ["04", "Handover", "The completed work is checked and explained."],
] as const;

export default function WorkshopPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "AutoRepair",
    name: "DMECH Services Limited Workshop",
    url: "https://dmechservices.ng/workshop",
    telephone: `+${CONTACT.phoneHref}`,
    image: "https://dmechservices.ng/splash/04-workshop.jpg",
    address: { "@type": "PostalAddress", streetAddress: CONTACT.addressLine1, addressLocality: "Lagos", addressCountry: "NG" },
    areaServed: ["Sangotedo", "Ajah", "Lagos"],
    serviceType: "Automotive workshop",
  };

  return (
    <main className="page-fade">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />

      <section className="hero hero-workshop">
        <div className="hero-inner">
          <div>
            <div className="hero-badge"><span className="pulse" /> DMECH Workshop · Ajah, Lagos</div>
            <h1>Two Powertrains. <span>One Procedure.</span></h1>
            <p>Petrol, diesel, hybrid, or full EV: the vehicle is read before it is touched. DMECH inspects first, agrees the work, repairs to specification, and verifies before handover.</p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <Link href="/service" className="identity-hero-cta">Explore Services <ArrowRight size={16} /></Link>
              <a className="identity-hero-link" href={whatsappHref("Hi DMECH, I would like to talk to the workshop.")} target="_blank" rel="noopener noreferrer"><MessageCircle size={16} /> Talk to the Workshop</a>
            </div>
          </div>
          <div className="hero-capsule">
            <div className="hero-capsule-eyebrow">The workshop standard</div>
            {[
              [Search, "Diagnosis before parts", "A reading and inspection establish the repair direction."],
              [ShieldCheck, "Approval before work", "The repair scope is agreed before the job proceeds."],
              [CheckCircle2, "Verification before handover", "The original fault is checked before release."],
            ].map(([Icon, title, description]) => <div className="hero-capsule-item" key={title as string}><Icon className="hero-capsule-item-icon" size={20} /><div><div className="hero-capsule-item-title">{title as string}</div><div className="hero-capsule-item-desc">{description as string}</div></div></div>)}
          </div>
        </div>
      </section>

      <section className="section" style={{ background: "#fff", padding: "34px 20px" }}>
        <div className="section-inner">
          <div className="trust-grid contact-grid">
            <div style={{ padding: 8 }}><div className="section-eyebrow">Vehicles</div><strong>Petrol · Diesel · Hybrid · Full EV</strong></div>
            <div style={{ padding: 8 }}><div className="section-eyebrow">Entry</div><strong>Diagnostic lane before the work bay</strong></div>
            <div style={{ padding: 8 }}><div className="section-eyebrow">Record</div><strong>Documented findings and handover</strong></div>
            <div style={{ padding: 8 }}><div className="section-eyebrow">Location</div><strong>Sangotedo, Ajah Axis, Lagos</strong></div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-inner">
          <Reveal><div className="section-eyebrow">The DMECH procedure</div><div className="section-title">Five gates. One standard.</div><div className="section-subtitle">The sequence stays the same across combustion and electric vehicles. The checks change with the powertrain.</div></Reveal>
          <div className="steps-grid cols-5" style={{ marginTop: 28 }}>{GATES.map(([gate, description], index) => <Reveal key={gate} delayMs={index * 55}><div className="step-card" style={{ height: "100%", textAlign: "left" }}><div className="step-num">{String(index + 1).padStart(2, "0")}</div><div className="section-eyebrow">Gate {String(index + 1).padStart(2, "0")}</div><div className="step-title">{gate}</div><div className="step-desc">{description}</div></div></Reveal>)}</div>
        </div>
      </section>

      <section className="section photo-banner pb-workshop center">
        <div className="section-inner"><div className="section-eyebrow">A digital tour of the workshop</div><div className="section-title">Inside the workshop</div><div className="section-subtitle" style={{ margin: "0 auto" }}>A place for assessment, controlled repair, specialist powertrain work, and documented release.</div></div>
      </section>

      <section className="section" style={{ background: "#fff" }}>
        <div className="section-inner">
          <div className="trust-grid">{ZONES.map((zone, index) => <Reveal key={zone.title} delayMs={index * 60}><div className="trust-card"><div className="trust-icon"><zone.icon size={24} /></div><div className="trust-title">{zone.title}</div><div className="trust-desc">{zone.description}</div></div></Reveal>)}</div>
          <div style={{ display: "flex", justifyContent: "center", gap: 18, flexWrap: "wrap", marginTop: 28 }}><Link href="/service" className="teaser-link">Explore all workshop services <ArrowRight size={14} /></Link><Link href="/ev-workshop" className="teaser-link">Explore EV &amp; Battery <ArrowRight size={14} /></Link><Link href="/fleet" className="teaser-link">For Fleet Operators <ArrowRight size={14} /></Link></div>
        </div>
      </section>

      <section className="section">
        <div className="section-inner"><div className="section-eyebrow" style={{ textAlign: "center" }}>From the customer side</div><div className="section-title" style={{ textAlign: "center", fontSize: 26 }}>What to expect</div><div className="steps-grid" style={{ marginTop: 28 }}>{VISIT_STEPS.map(([number, title, description]) => <div className="step-card" key={number}><div className="step-num">{number}</div><div className="step-title">{title}</div><div className="step-desc">{description}</div></div>)}</div></div>
      </section>

      <section className="section" id="visit" style={{ background: "#fff" }}>
        <div className="section-inner center"><div className="section-eyebrow">Visit DMECH Workshop</div><div className="section-title">Bring the vehicle. Start with a reading.</div><div className="section-subtitle" style={{ margin: "0 auto 20px" }}>DMECH Services Limited Workshop<br />{CONTACT.addressLine1}<br />{CONTACT.addressLine2}<br />{CONTACT.hours}</div><div style={{ display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap" }}><a className="v-card-btn btn-primary" href={`tel:${CONTACT.phoneHref}`}><Phone size={16} /> Call the Workshop</a><a className="v-card-btn btn-outline" href={whatsappHref("Hi DMECH, I would like to talk to the workshop.")} target="_blank" rel="noopener noreferrer"><MessageCircle size={16} /> WhatsApp</a><a className="v-card-btn btn-outline" href="https://www.google.com/maps/search/?api=1&query=Sangotedo%2C%20Ajah%20Axis%2C%20Lagos%2C%20Nigeria" target="_blank" rel="noopener noreferrer"><ArrowRight size={16} /> Get Directions</a></div><WorkshopContactLinks /></div>
      </section>
    </main>
  );
}
