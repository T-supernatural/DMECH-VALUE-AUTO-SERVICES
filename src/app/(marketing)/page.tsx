import type { Metadata } from "next";
import { Hero } from "@/components/marketing/Hero";
import { CapabilityBand } from "@/components/marketing/CapabilityBand";
import { UseCategoryTeaser } from "@/components/marketing/UseCategoryTeaser";
import { VehicleTeaser } from "@/components/marketing/VehicleTeaser";
import { CertifiedTeaser } from "@/components/marketing/CertifiedTeaser";
import { TrustTeaser } from "@/components/marketing/TrustTeaser";
import { EVSpotlight } from "@/components/marketing/EVSpotlight";
import { Reveal } from "@/components/marketing/Reveal";
import { FinancingTeaser } from "@/components/marketing/FinancingTeaser";
import { CTASection } from "@/components/marketing/CTASection";
import { getPublicVehicles } from "@/lib/vehicles";
import { getConfigValue } from "@/lib/platform-config";

export const metadata: Metadata = {
  title: "DMECH Services Limited — We Keep It Running.",
  description:
    "Nigeria's diagnostic and EV specialists since 2016 — mechanical and auto-electrical repair, high-voltage EV service, battery certification, plus vehicle import, sales, and financing.",
};

export default async function MarketingHome() {
  const [vehicles, ngnRate, marketPriceBenchmarks] = await Promise.all([
    getPublicVehicles(),
    getConfigValue("ngn_usd_rate", 1580),
    getConfigValue<Record<string, number>>("market_price_benchmarks", {}),
  ]);

  return (
    <main className="page-fade">
      <Hero ngnRate={ngnRate} marketPriceBenchmarks={marketPriceBenchmarks} />
      <CapabilityBand />
      <UseCategoryTeaser />
      <VehicleTeaser vehicles={vehicles} />
      <CertifiedTeaser vehicles={vehicles} />
      <TrustTeaser />
      <Reveal>
        <EVSpotlight />
      </Reveal>
      <FinancingTeaser />
      <CTASection />
    </main>
  );
}
