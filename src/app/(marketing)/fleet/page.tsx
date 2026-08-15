import type { Metadata } from "next";
import { CalendarClock, Truck, Tags, ClipboardList, ClipboardCheck, FileText, ArrowRightCircle } from "lucide-react";
import { Reveal } from "@/components/marketing/Reveal";
import { CTASection } from "@/components/marketing/CTASection";

export const metadata: Metadata = {
  title: "DMECH Fleet — SLA-Backed Corporate Maintenance Contracts",
  description:
    "Contracted service levels, per-asset job history, and monthly uptime and cost-per-vehicle reporting for corporate, institutional, and logistics fleets — built for organisations measured on vehicle availability.",
};

const INCLUDES = [
  {
    icon: CalendarClock,
    title: "Scheduled Maintenance",
    desc: "Service intervals planned around your operating pattern, not ours. Vehicles scheduled in rotation so availability never drops below the agreed threshold.",
  },
  {
    icon: Truck,
    title: "Breakdown Response",
    desc: "Contracted response times by tier, with recovery coordination. Driver-reported faults triaged before a vehicle is taken off the road unnecessarily.",
  },
  {
    icon: Tags,
    title: "Parts Traceability",
    desc: "Every part fitted is recorded against the asset with its source. This is what closes the gap that unverifiable maintenance spend usually flows through.",
  },
  {
    icon: ClipboardList,
    title: "Reporting Pack",
    desc: "Monthly uptime percentage, cost per vehicle, exception list, and forward service schedule. Numbers first, narrative second.",
  },
];

const REPORTING_STANDARD = [
  { metric: "Fleet uptime %", reported: "Monthly", why: "The single number your operation is judged on" },
  { metric: "Cost per vehicle", reported: "Monthly", why: "Makes maintenance spend defensible line by line" },
  { metric: "Mean response time", reported: "Monthly", why: "Holds us to the SLA in writing, not in principle" },
  { metric: "Parts fitted & source", reported: "Per job", why: "Closes the leakage route in unverified maintenance" },
  { metric: "Forward schedule", reported: "Rolling", why: "Lets you plan availability, not react to it" },
];

const ONBOARDING = [
  {
    icon: ClipboardCheck,
    title: "Fleet Audit",
    desc: "We inspect a representative sample of your vehicles and report condition, risk, and deferred maintenance against our three-state inspection standard.",
  },
  {
    icon: FileText,
    title: "Proposal",
    desc: "SLA tiers, pricing, reporting format, and transition plan — written, with the warranty schedule attached.",
  },
  {
    icon: ArrowRightCircle,
    title: "Transition",
    desc: "Assets onboarded, histories opened, schedule set. First monthly report issued at the end of the first full cycle.",
  },
];

export default function FleetPage() {
  return (
    <div className="page-fade">
      <section className="section photo-banner pb-transport center">
        <div className="section-inner">
          <div className="section-eyebrow">DMECH Fleet</div>
          <div className="section-title">Uptime You Can Report On</div>
          <div className="section-subtitle" style={{ margin: "0 auto" }}>
            For an organisation that runs vehicles, downtime isn&apos;t an inconvenience — it&apos;s
            a number on someone&apos;s performance review. Instead of a repair relationship, you get
            a contracted service level, a documented history for every asset, and a monthly report
            you can hand upward without qualification.
          </div>
        </div>
      </section>

      <section className="section" style={{ background: "#fff" }}>
        <div className="section-inner">
          <Reveal>
            <div className="stat-strip">
              <div className="stat-strip-item">
                <div className="stat-strip-value">SLA</div>
                <div className="stat-strip-label">Contracted response times by tier</div>
              </div>
              <div className="stat-strip-item">
                <div className="stat-strip-value">100%</div>
                <div className="stat-strip-label">Job history documented per asset, auditable</div>
              </div>
              <div className="stat-strip-item">
                <div className="stat-strip-value">Monthly</div>
                <div className="stat-strip-label">Uptime &amp; cost-per-vehicle reporting</div>
              </div>
            </div>
          </Reveal>

          <div className="section-eyebrow" style={{ textAlign: "center", marginTop: 16 }}>
            What A Fleet Contract Includes
          </div>
          <div className="section-title" style={{ textAlign: "center", fontSize: 26 }}>
            Built For Organisations Measured On Availability
          </div>
          <div className="trust-grid contact-grid" style={{ marginTop: 24 }}>
            {INCLUDES.map((item, i) => (
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

      <section className="section">
        <div className="section-inner">
          <Reveal>
            <div className="section-eyebrow">The Reporting Standard</div>
            <div className="section-title">What You Actually Receive</div>
            <div className="dmech-table-wrap">
              <table className="dmech-table">
                <thead>
                  <tr>
                    <th>Metric</th>
                    <th>Reported</th>
                    <th>Why It Matters To You</th>
                  </tr>
                </thead>
                <tbody>
                  {REPORTING_STANDARD.map((row) => (
                    <tr key={row.metric}>
                      <td>{row.metric}</td>
                      <td>{row.reported}</td>
                      <td>{row.why}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p style={{ fontSize: 12.5, color: "var(--subtle)", marginTop: 12 }}>
              SLA response tiers and warranty terms are stated in the contract, not implied — ask
              us for the tier table and the warranty schedule alongside any quotation.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="section" style={{ background: "#fff" }}>
        <div className="section-inner">
          <div className="section-eyebrow" style={{ textAlign: "center" }}>
            The First Step For A Fleet
          </div>
          <div className="section-title" style={{ textAlign: "center", fontSize: 26 }}>
            From Audit To Onboarded Fleet
          </div>
          <div className="steps-grid cols-3" style={{ marginTop: 24 }}>
            {ONBOARDING.map((step, i) => (
              <Reveal key={step.title} delayMs={i * 100}>
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

      <CTASection
        heading="Ready To Move Your Fleet Onto A Service Contract?"
        body="Tell us the size and mix of your fleet — we'll start with an audit and come back with SLA tiers, pricing, and a transition plan in writing."
        whatsappMessage="Hi DMECH, I'd like to talk about a DMECH Fleet service contract."
      />
    </div>
  );
}
