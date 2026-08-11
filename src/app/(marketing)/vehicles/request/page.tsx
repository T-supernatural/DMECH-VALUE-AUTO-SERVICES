import type { Metadata } from "next";
import { VehicleRequestForm } from "@/components/marketing/VehicleRequestForm";
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
      <section className="section" style={{ paddingTop: 48 }}>
        <div className="section-inner">
          <div className="section-eyebrow">Can&apos;t Find It?</div>
          <h1 style={{ fontFamily: "'Space Grotesk'", fontSize: 34, marginBottom: 10 }}>
            Tell Us What You&apos;re Looking For
          </h1>
          <p style={{ color: "var(--muted)", maxWidth: 600, marginBottom: 32 }}>
            Not every vehicle we can source is already listed. Describe what you need — make,
            model, budget, timeline — and our team will look for it, whether that&apos;s in our
            existing network or a fresh search abroad.
          </p>

          <VehicleRequestForm source={source} />
        </div>
      </section>
    </div>
  );
}
