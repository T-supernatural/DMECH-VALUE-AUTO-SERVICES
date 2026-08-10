import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Car } from "lucide-react";
import { createServiceClient } from "@/lib/supabase/server";
import { formatUsd, usdCentsToDollars } from "@/lib/money";
import { ReserveVehicleButton } from "@/components/marketing/ReserveVehicleButton";
import { SOURCING_PLATFORM_LABELS, TITLE_STATUS_LABELS } from "@/types";
import type { SourcingListing } from "@/types";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const listing = await getListing(id);
  if (!listing) return { title: "Vehicle Not Found — DMECH Services Limited" };
  return {
    title: `${listing.make} ${listing.model} ${listing.year} — Reserve from ${SOURCING_PLATFORM_LABELS[listing.source_platform]} — DMECH Services Limited`,
  };
}

async function getListing(id: string): Promise<SourcingListing | null> {
  try {
    const supabase = createServiceClient();
    const { data } = await supabase.from("sourcing_listings").select("*").eq("id", id).eq("status", "available").maybeSingle();
    return data as SourcingListing | null;
  } catch {
    return null;
  }
}

export default async function SourcingListingDetailPage({ params }: PageProps) {
  const { id } = await params;
  const listing = await getListing(id);
  if (!listing) notFound();

  return (
    <div className="page-fade">
      <section className="section" style={{ paddingTop: 48 }}>
        <div className="section-inner" style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 40 }}>
          <div>
            <div className="v-card-img" style={{ height: 320, borderRadius: 14, marginBottom: 16 }}>
              {listing.photos[0]?.url ? (
                // eslint-disable-next-line @next/next/no-img-element -- pasted external auction-photo URL
                <img src={listing.photos[0].url} alt={`${listing.make} ${listing.model}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <Car size={64} strokeWidth={1.25} />
              )}
            </div>
            {listing.photos.length > 1 && (
              <div style={{ display: "flex", gap: 8, marginBottom: 24, overflowX: "auto" }}>
                {listing.photos.slice(1).map((photo, i) => (
                  // eslint-disable-next-line @next/next/no-img-element -- pasted external auction-photo URL
                  <img key={i} src={photo.url} alt="" style={{ width: 90, height: 68, objectFit: "cover", borderRadius: 8, flexShrink: 0 }} />
                ))}
              </div>
            )}

            <h1 style={{ fontFamily: "'Space Grotesk'", fontSize: 30, marginBottom: 6 }}>
              {listing.make} {listing.model} {listing.year}{listing.trim ? ` ${listing.trim}` : ""}
            </h1>
            <p style={{ color: "var(--muted)", marginBottom: 24 }}>
              Spotted on {SOURCING_PLATFORM_LABELS[listing.source_platform]} —{" "}
              {listing.location_city ? `${listing.location_city}, ` : ""}{listing.location_country}
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
              <div className="spec-row"><span className="spec-label">Fuel Type</span><span className="spec-value" style={{ textTransform: "capitalize" }}>{listing.fuel_type ?? "—"}</span></div>
              <div className="spec-row"><span className="spec-label">Odometer</span><span className="spec-value">{listing.odometer_km ? `${listing.odometer_km.toLocaleString()} km` : "—"}</span></div>
              <div className="spec-row"><span className="spec-label">Title Status</span><span className="spec-value">{listing.title_status ? TITLE_STATUS_LABELS[listing.title_status] : "—"}</span></div>
              <div className="spec-row"><span className="spec-label">Run &amp; Drive</span><span className="spec-value">{listing.run_and_drive === null ? "—" : listing.run_and_drive ? "Yes" : "No"}</span></div>
              <div className="spec-row"><span className="spec-label">Primary Damage</span><span className="spec-value">{listing.primary_damage ?? "None reported"}</span></div>
              {listing.secondary_damage && (
                <div className="spec-row"><span className="spec-label">Secondary Damage</span><span className="spec-value">{listing.secondary_damage}</span></div>
              )}
            </div>

            {listing.condition_notes && (
              <p style={{ fontSize: 14, color: "var(--text)", marginBottom: 24 }}>{listing.condition_notes}</p>
            )}
          </div>

          <div>
            <div style={{ position: "sticky", top: 100, border: "1px solid var(--border)", borderRadius: 14, padding: 24, background: "var(--surface)" }}>
              <div className="v-card-price" style={{ fontSize: 26 }}>{formatUsd(usdCentsToDollars(listing.estimated_price_usd_cents))}</div>
              <div className="v-card-source" style={{ marginBottom: 4 }}>Estimated purchase price</div>
              {listing.estimated_shipping_usd_cents && (
                <div className="v-card-meta" style={{ marginBottom: 16 }}>
                  + {formatUsd(usdCentsToDollars(listing.estimated_shipping_usd_cents))} estimated shipping
                </div>
              )}
              <ReserveVehicleButton listingId={listing.id} />
              <p style={{ fontSize: 11, color: "var(--subtle)", marginTop: 12 }}>
                This is an estimate. The final price is confirmed once DMECH actually wins this
                vehicle at auction — your reservation deposit is not a downpayment against a fixed
                total.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
