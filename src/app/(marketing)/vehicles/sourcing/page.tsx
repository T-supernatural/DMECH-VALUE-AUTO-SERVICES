import type { Metadata } from "next";
import Link from "next/link";
import { Car } from "lucide-react";
import { createServiceClient } from "@/lib/supabase/server";
import { formatUsd, usdCentsToDollars } from "@/lib/money";
import { SOURCING_PLATFORM_LABELS } from "@/types";
import type { SourcingListing } from "@/types";

export const metadata: Metadata = {
  title: "Reserve a Vehicle Abroad — DMECH Services Limited",
  description:
    "Real vehicles DMECH has spotted on Copart, IAAI, and other sources abroad — reserve one and we'll go win it at auction and import it for you.",
};

// Same fail-soft convention as getPublicVehicles() -- a missing table/RLS
// policy degrades to an empty catalog, never a crashed page.
async function getAvailableSourcingListings(): Promise<SourcingListing[]> {
  try {
    const supabase = createServiceClient();
    const { data } = await supabase
      .from("sourcing_listings")
      .select("*")
      .eq("status", "available")
      .order("created_at", { ascending: false });
    return (data as SourcingListing[] | null) ?? [];
  } catch {
    return [];
  }
}

export default async function SourcingCatalogPage() {
  const listings = await getAvailableSourcingListings();

  return (
    <div className="page-fade">
      <section className="section" style={{ paddingTop: 48 }}>
        <div className="section-inner">
          <div className="section-eyebrow">Import From Abroad</div>
          <h1 style={{ fontFamily: "'Space Grotesk'", fontSize: 34, marginBottom: 10 }}>
            Reserve a Vehicle We&apos;ve Found Abroad
          </h1>
          <p style={{ color: "var(--muted)", maxWidth: 640, marginBottom: 32 }}>
            These are real, specific vehicles our team has spotted on Copart and IAAI auctions in
            the USA, sources in Europe, and EV sources in China — cars DMECH doesn&apos;t own yet.
            Reserve one with a deposit, and we go win it at auction and bring it home for you. The
            final price is confirmed once we actually purchase it, not locked in today.
          </p>

          {listings.length === 0 ? (
            <div style={{ padding: 40, textAlign: "center", color: "var(--muted)", border: "1px solid var(--border)", borderRadius: 14 }}>
              <div style={{ marginBottom: 16 }}>No vehicles available to reserve right now — check back soon.</div>
              <Link href="/vehicles/request?from=sourcing_empty" className="v-card-btn btn-primary" style={{ textDecoration: "none", display: "inline-block" }}>
                Tell Us What You&apos;re Looking For →
              </Link>
            </div>
          ) : (
            <div className="vehicle-grid">
              {listings.map((listing) => {
                const photo = listing.photos[0]?.url;
                return (
                  <Link
                    key={listing.id}
                    href={`/vehicles/sourcing/${listing.id}`}
                    className="v-card"
                    style={{ textDecoration: "none", color: "inherit", display: "block" }}
                  >
                    <div className="v-card-img">
                      {photo ? (
                        // eslint-disable-next-line @next/next/no-img-element -- pasted external auction-photo URL
                        <img src={photo} alt={`${listing.make} ${listing.model}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        <Car size={40} strokeWidth={1.25} />
                      )}
                      <span className="v-card-status" style={{ background: "rgba(24,153,231,.15)", color: "var(--blue)" }}>
                        {SOURCING_PLATFORM_LABELS[listing.source_platform]}
                      </span>
                    </div>
                    <div className="v-card-body">
                      <div className="v-card-name">{listing.make} {listing.model} {listing.year}</div>
                      <div className="v-card-meta">
                        {listing.location_city ? `${listing.location_city}, ` : ""}{listing.location_country}
                        {listing.odometer_km ? ` · ${listing.odometer_km.toLocaleString()} km` : ""}
                      </div>
                      <div className="v-card-price-row">
                        <div>
                          <div className="v-card-price">{formatUsd(usdCentsToDollars(listing.estimated_price_usd_cents))}</div>
                          <div className="v-card-source">Estimated, before shipping &amp; duty</div>
                        </div>
                      </div>
                      <div className="v-card-actions">
                        <span className="v-card-btn btn-primary">View &amp; Reserve →</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
