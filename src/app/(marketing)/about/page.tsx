import type { Metadata } from "next";
import Link from "next/link";
import { HowItWorks } from "@/components/marketing/HowItWorks";
import { Trust } from "@/components/marketing/Trust";
import { Testimonials } from "@/components/marketing/Testimonials";
import { Reveal } from "@/components/marketing/Reveal";

export const metadata: Metadata = {
  title: "About Us — DMECH Services Limited",
  description:
    "Ten years of mechanical and auto-electrical diagnostic expertise since 2016, now extending into high-voltage EV service, battery certification, and vehicle import.",
};

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
