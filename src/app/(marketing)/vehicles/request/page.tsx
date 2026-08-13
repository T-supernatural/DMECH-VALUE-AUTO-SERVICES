import type { Metadata } from "next";
import { VehicleRequestForm } from "@/components/marketing/VehicleRequestForm";
import { Reveal } from "@/components/marketing/Reveal";
import type { VehicleRequestSource } from "@/types";

export const metadata: Metadata = {
  title: "Request a Specific Vehicle — DMECH Services Limited",
  description:
    "Tell DMECH exactly what vehicle you're looking for — make, model, budget, and timeline — and our team will source it for you.",
};

const VALID_SOURCES: VehicleRequestSource[] = ["dedicated_page", "vehicles_empty", "sourcing_empty"];

interface PageProps {
  searchParams: Promise<{ from?: string }>;
}

export default async function VehicleRequestPage({ searchParams }: PageProps) {
  const { from } = await searchParams;
  const source: VehicleRequestSource = VALID_SOURCES.includes(from as VehicleRequestSource)
    ? (from as VehicleRequestSource)
    : "dedicated_page";

  return (
    <div className="page-fade">
      <section className="section photo-banner pb-cargo center">
        <div className="section-inner">
          <div className="section-eyebrow">Can&apos;t Find It?</div>
          <div className="section-title">Tell Us What You&apos;re Looking For</div>
          <div className="section-subtitle" style={{ margin: "0 auto" }}>
            Not every vehicle we can source is already listed. Describe what you need — make,
            model, budget, timeline — and our team will look for it, whether that&apos;s in our
            existing network or a fresh search abroad.
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-inner">
          <Reveal>
            <VehicleRequestForm source={source} />
          </Reveal>
        </div>
      </section>
    </div>
  );
}
