import type { Metadata } from "next";
import { Hero } from "@/components/marketing/Hero";
import { UseCategoryTeaser } from "@/components/marketing/UseCategoryTeaser";
import { VehicleTeaser } from "@/components/marketing/VehicleTeaser";
import { CertifiedTeaser } from "@/components/marketing/CertifiedTeaser";
import { TrustTeaser } from "@/components/marketing/TrustTeaser";
import { EVSpotlight } from "@/components/marketing/EVSpotlight";
import { FinancingTeaser } from "@/components/marketing/FinancingTeaser";
import { CTASection } from "@/components/marketing/CTASection";
import { getPublicVehicles } from "@/lib/vehicles";
import { getConfigValue } from "@/lib/platform-config";

export const metadata: Metadata = {
  title: "Buy, Import & Finance a Vehicle in Lagos, Nigeria",
  description:
    "Browse imported vehicles, foreign-used cars, certified Nigerian-used vehicles, and flexible financing options from DMECH Services Limited in Lagos, Nigeria.",
  alternates: {
    canonical: "/sales",
  },
};

// Everything on this page was formerly Home — relocated wholesale when Home
// became identity-led (see CapabilityBand/IdentityHero on the new Home).
// This is the sales/import funnel: calculator, browse-by-use, vehicle
// listings, certified program, financing. Reached via the "Buy a Vehicle"
// nav link and the SalesGateway band on Home.
export default async function SalesPage() {
  const [vehicles, ngnRate, marketPriceBenchmarks] = await Promise.all([
    getPublicVehicles(),
    getConfigValue("ngn_usd_rate", 1580),
    getConfigValue<Record<string, number>>("market_price_benchmarks", {}),
  ]);

  return (
    <main className="page-fade">
      <Hero ngnRate={ngnRate} marketPriceBenchmarks={marketPriceBenchmarks} />
      <UseCategoryTeaser />
      <VehicleTeaser vehicles={vehicles} />
      <CertifiedTeaser vehicles={vehicles} />
      <TrustTeaser />
      <EVSpotlight />
      <FinancingTeaser />
      <CTASection />
    </main>
  );
}
