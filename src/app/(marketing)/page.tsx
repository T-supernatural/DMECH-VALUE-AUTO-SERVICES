import type { Metadata } from "next";
import { IdentityHero } from "@/components/marketing/IdentityHero";
import { CapabilityBand } from "@/components/marketing/CapabilityBand";
import { OriginTeaser } from "@/components/marketing/OriginTeaser";
import { SalesGateway } from "@/components/marketing/SalesGateway";
import { CTASection } from "@/components/marketing/CTASection";

export const metadata: Metadata = {
  title: "DMECH Services Limited — We Keep It Running.",
  description:
    "Nigeria's diagnostic and EV specialists since 2016 — mechanical and auto-electrical repair, high-voltage EV service, and battery certification. Vehicle import, sales, and financing too.",
};

// Identity-led Home: who DMECH actually is (a decade-old diagnostic/
// workshop business extending into EV capability), not a vehicle-import
// pitch. The import/sales funnel (calculator, listings, financing) moved
// wholesale to /sales -- see SalesGateway below for the explicit bridge.
export default function MarketingHome() {
  return (
    <main className="page-fade">
      <IdentityHero />
      <CapabilityBand />
      <OriginTeaser />
      <SalesGateway />
      <CTASection
        heading="Talk To Nigeria's Diagnostic & EV Specialists"
        body="Whether it's a diagnostic, EV service, battery certification, or sourcing a vehicle from abroad, we'll walk you through it."
        whatsappMessage="Hi DMECH, I'd like to talk about your services"
      />
    </main>
  );
}
