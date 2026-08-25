import type { Metadata } from "next";
import { VehicleMarketplace } from "@/components/marketing/VehicleMarketplace";
import { getPublicVehicles } from "@/lib/vehicles";
import { getFinancingConfig } from "@/lib/financing-config";

export const metadata: Metadata = {
  title: "Vehicle Marketplace — DMECH Services Limited",
  description:
    "Browse verified vehicles available now, in transit, and at port — imports and DMECH Certified Nigerian-used.",
};

interface PageProps {
  searchParams: Promise<{ filter?: string }>;
}

export default async function VehiclesPage({ searchParams }: PageProps) {
  const { filter } = await searchParams;
  const [vehicles, financingConfig] = await Promise.all([
    getPublicVehicles(),
    getFinancingConfig(),
  ]);

  return (
    <div className="page-fade">
      <VehicleMarketplace
        vehicles={vehicles}
        financingConfig={financingConfig}
        initialFilterKey={filter}
      />
    </div>
  );
}
