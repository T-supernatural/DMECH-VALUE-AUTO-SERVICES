import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, MapPin, MessageCircle, ShieldCheck, Wrench } from "lucide-react";
import { FaqAccordion } from "@/components/marketing/FaqAccordion";
import { CONTACT, whatsappHref } from "@/lib/contact";

export const metadata: Metadata = {
  title: "Car Diagnostics, EV Service & Vehicle Sales in Lagos, Nigeria",
  description:
    "Find DMECH for car diagnostics, EV service, vehicle import, used car sales, and auto repairs in Lagos, Nigeria. Call or WhatsApp us today.",
  alternates: {
    canonical: "/locations/lagos",
  },
};

const FAQS = [
  {
    q: "Where is DMECH located in Lagos?",
    a: "DMECH is based in Sangotedo, Ajah Axis, Lagos, Nigeria. We serve drivers and businesses across Lagos with diagnostics, repairs, EV service, and vehicle sales.",
  },
  {
    q: "Do you offer car diagnostics in Lagos?",
    a: "Yes. We diagnose warning lights, engine faults, electrical issues, and vehicle performance problems before recommending any repair work.",
  },
  {
    q: "Do you service EVs in Lagos?",
    a: "Yes. DMECH offers high-voltage EV diagnostics, battery inspection, charging system checks, and battery certification services in Lagos.",
  },
  {
    q: "Can I buy a used car in Lagos from DMECH?",
    a: "Yes. We offer certified Nigerian-used vehicles and imported options with inspection and financing support where available.",
  },
];

export default function LagosLocationPage() {
  return (
    <main className="page-fade">
      <section className="section photo-banner pb-workshop center">
        <div className="section-inner">
          <div className="section-eyebrow">Lagos Auto Services</div>
          <div className="section-title">Car Diagnostics, EV Service & Vehicle Support in Lagos</div>
          <div className="section-subtitle" style={{ margin: "0 auto", maxWidth: 760 }}>
            DMECH Services Limited helps drivers and businesses across Lagos with car diagnostics,
            auto electrical repairs, EV servicing, and vehicle sourcing — with real support from a
            local workshop in Ajah.
          </div>
        </div>
      </section>

      <section className="section" style={{ background: "#fff" }}>
        <div className="section-inner">
          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: 32, alignItems: "center" }}>
            <div>
              <div className="section-eyebrow">Quick answer</div>
              <div className="section-title" style={{ fontSize: 26 }}>
                If you're searching for car repair or EV service in Lagos, DMECH is built for that.
              </div>
              <p style={{ color: "var(--muted)", lineHeight: 1.7 }}>
                We help Lagos drivers with diagnosis before repair, import and sales support, EV
                and battery care, and local workshop service for everyday reliability. If you need a
                trusted partner for a car problem in Lagos, we make the next step simple.
              </p>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 20 }}>
                <a
                  href={whatsappHref("Hi DMECH, I need help with car diagnostics or vehicle service in Lagos.")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cta-main"
                  style={{ textDecoration: "none" }}
                >
                  WhatsApp DMECH
                </a>
                <Link href="/service" className="cta-secondary" style={{ textDecoration: "none" }}>
                  See All Services
                </Link>
              </div>
            </div>

            <div className="trust-card">
              <div className="trust-icon">
                <MapPin size={24} strokeWidth={1.75} />
              </div>
              <div className="trust-title">Our Lagos location</div>
              <div className="trust-desc">
                {CONTACT.addressLine1}
                <br />
                {CONTACT.addressLine2}
              </div>
              <div className="trust-desc" style={{ marginTop: 10 }}>
                Phone: {CONTACT.phoneDisplay}
                <br />
                WhatsApp: {CONTACT.whatsappDisplay}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-inner">
          <div className="section-eyebrow" style={{ textAlign: "center" }}>What we cover</div>
          <div className="section-title" style={{ textAlign: "center", fontSize: 26 }}>
            Service and vehicle support for Lagos drivers
          </div>
          <div className="trust-grid" style={{ marginTop: 24 }}>
            {[
              { icon: Wrench, title: "Car diagnostics", desc: "Fault codes, warning lights, performance checks, and accurate diagnosis before repair." },
              { icon: CheckCircle2, title: "Mechanical and electrical repairs", desc: "Engine, electrical, suspension, brakes, and AC solutions for daily driving." },
              { icon: ShieldCheck, title: "EV service", desc: "Battery health checks, EV diagnostics, and high-voltage support for Lagos-based EV drivers." },
              { icon: MessageCircle, title: "Vehicle buying support", desc: "Used cars, imports, financing guidance, and direct sales conversations with DMECH." },
            ].map((item, index) => (
              <div key={item.title} className="trust-card" style={{ animationDelay: `${index * 80}ms` }}>
                <div className="trust-icon">
                  <item.icon size={24} strokeWidth={1.75} />
                </div>
                <div className="trust-title">{item.title}</div>
                <div className="trust-desc">{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section" style={{ background: "#fff" }}>
        <div className="section-inner">
          <div className="section-eyebrow">Lagos FAQs</div>
          <div className="section-title">Common questions people ask before coming in</div>
          <FaqAccordion items={FAQS} />
        </div>
      </section>
    </main>
  );
}
