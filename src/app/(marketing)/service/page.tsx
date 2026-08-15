import type { Metadata } from "next";
import Link from "next/link";
import { PackageSearch, ClipboardCheck, Wrench, Search, FileText } from "lucide-react";
import { ServiceBookingForm } from "@/components/marketing/ServiceBookingForm";
import { Reveal } from "@/components/marketing/Reveal";
import { SERVICE_PAGES, WHAT_TO_EXPECT } from "@/lib/service-pages";

export const metadata: Metadata = {
  title: "Vehicle Services — DMECH Services Limited",
  description: "Book workshop service for your vehicle — diagnostics, repairs, and maintenance.",
};

const WORK_STEPS = [
  {
    icon: PackageSearch,
    title: "Receive",
    desc: "Vehicle logged against a job number. Registration, VIN, mileage, and reported symptoms recorded. You get the job number the same day.",
  },
  {
    icon: Search,
    title: "Diagnose",
    desc: "Computerised and physical diagnosis before anything is removed. We identify the fault and show you the reading it is based on.",
  },
  {
    icon: FileText,
    title: "Quote",
    desc: "Written scope and fixed price, itemised by labour and parts, with the part source named. Nothing proceeds without your sign-off.",
  },
  {
    icon: Wrench,
    title: "Execute",
    desc: "Work carried out to manufacturer specification. Any variation discovered mid-job is stopped, quoted, and re-approved — never absorbed into the invoice.",
  },
  {
    icon: ClipboardCheck,
    title: "Certify",
    desc: "Road test, job card completed with findings and status, warranty issued, and the full record filed against the vehicle for future reference.",
  },
];

const INSPECTION_STANDARD = [
  {
    status: "✓ PASS",
    className: "status-pass",
    meaning: "Within specification",
    action: "Recorded and dated. No action, no charge, no upsell.",
  },
  {
    status: "! ADVISORY",
    className: "status-advisory",
    meaning: "Serviceable, monitor",
    action: "Flagged with an estimated interval so you can plan and budget the work rather than be surprised by it.",
  },
  {
    status: "✕ FAIL",
    className: "status-fail",
    meaning: "Out of specification",
    action: "Quoted for immediate rectification. Where safety-critical, we state that plainly and in writing.",
  },
];

export default function ServicePage() {
  return (
    <div className="page-fade">
      <section className="section photo-banner pb-workshop center">
        <div className="section-inner">
          <div className="section-eyebrow">Workshop</div>
          <div className="section-title">Vehicle Services</div>
          <div className="section-subtitle" style={{ margin: "0 auto" }}>
            Diagnostics, repairs, and maintenance — see what we cover, then book in under a
            minute.
          </div>
        </div>
      </section>

      <section className="section" style={{ background: "#fff" }}>
        <div className="section-inner">
          <div className="section-eyebrow" style={{ textAlign: "center" }}>
            Browse By Service
          </div>
          <div className="section-title" style={{ textAlign: "center", fontSize: 26 }}>
            What Do You Need Done?
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
              gap: 12,
              marginTop: 24,
            }}
          >
            {SERVICE_PAGES.map((s, i) => (
              <Reveal key={s.slug} delayMs={i * 50}>
                <Link
                  href={`/service/${s.slug}`}
                  className="teaser-card"
                  style={{ textAlign: "center", textDecoration: "none", display: "block" }}
                >
                  <div style={{ color: "var(--blue)", marginBottom: 8 }}>
                    <s.icon size={24} strokeWidth={1.5} style={{ margin: "0 auto" }} />
                  </div>
                  <div style={{ fontWeight: 600, fontSize: 14, color: "var(--text)" }}>
                    {s.name}
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-inner">
          <div className="section-eyebrow" style={{ textAlign: "center" }}>
            How We Work
          </div>
          <div className="section-title" style={{ textAlign: "center", fontSize: 26 }}>
            The Same Five Steps On Every Job
          </div>
          <div className="section-subtitle" style={{ textAlign: "center", margin: "0 auto" }}>
            Whether it&apos;s one saloon car or a fleet vehicle — predictability is the point.
          </div>
          <div className="steps-grid cols-5" style={{ marginTop: 24 }}>
            {WORK_STEPS.map((step, i) => (
              <Reveal key={step.title} delayMs={i * 70}>
                <div className="step-card">
                  <div className="step-num">{i + 1}</div>
                  <div className="step-icon">
                    <step.icon size={32} strokeWidth={1.75} />
                  </div>
                  <div className="step-title">{step.title}</div>
                  <div className="step-desc">{step.desc}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section" style={{ background: "#fff" }}>
        <div className="section-inner">
          <Reveal>
            <div className="section-eyebrow">The Inspection Standard</div>
            <div className="section-title">No Guesswork</div>
            <div className="section-subtitle">
              Every system inspected is reported against a fixed three-state standard, with a
              glyph and a written label — never colour alone. The same standard applies to a
              routine service, a pre-purchase inspection, and a fleet audit.
            </div>
            <div className="dmech-table-wrap">
              <table className="dmech-table">
                <thead>
                  <tr>
                    <th>Status</th>
                    <th>Meaning</th>
                    <th>What We Do About It</th>
                  </tr>
                </thead>
                <tbody>
                  {INSPECTION_STANDARD.map((row) => (
                    <tr key={row.status}>
                      <td className={row.className}>{row.status}</td>
                      <td>{row.meaning}</td>
                      <td>{row.action}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="section">
        <div className="section-inner">
          <div className="section-eyebrow" style={{ textAlign: "center" }}>
            Book Your Service
          </div>
          <div className="section-title" style={{ textAlign: "center", fontSize: 26 }}>
            Ready When You Are
          </div>
          <div className="section-subtitle" style={{ textAlign: "center", margin: "0 auto 8px" }}>
            Tell us what your vehicle needs — a DMECH workshop manager will confirm your booking
            on WhatsApp within 30 minutes.
          </div>
          <ServiceBookingForm />

          <div className="section-eyebrow" style={{ textAlign: "center", marginTop: 56 }}>
            What To Expect
          </div>
          <div className="section-title" style={{ textAlign: "center", fontSize: 26 }}>
            After You Book
          </div>
          <div className="trust-grid contact-grid" style={{ marginTop: 24 }}>
            {WHAT_TO_EXPECT.map((item, i) => (
              <Reveal key={item.title} delayMs={i * 80}>
                <div className="trust-card">
                  <div className="trust-icon">
                    <item.icon size={24} strokeWidth={1.75} />
                  </div>
                  <div className="trust-title">{item.title}</div>
                  <div className="trust-desc">{item.desc}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
